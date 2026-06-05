// Watcher engine: runs an account's standing rules against the public network
// and writes notifications for that same account. No LLM — pure DB + parsing.
// Runs in the recipient's own (authed) context, so RLS lets it insert its own rows.

type Watcher = {
  id: string;
  account_id: string;
  label: string;
  kind: string;
  params: { query?: string; category?: string; discountAtLeast?: number; priceUnder?: number };
  color: string;
  last_checked: string | null;
};

function maxPercent(text: string): number | null {
  const m = text.match(/(\d{1,3})\s*%/g);
  if (!m) return null;
  return Math.max(...m.map((s) => parseInt(s)));
}

function minRupees(text: string): number | null {
  const m = text.match(/₹\s*([\d,]+)/g);
  if (!m) return null;
  const nums = m.map((s) => parseInt(s.replace(/[^\d]/g, ""))).filter((n) => !isNaN(n));
  return nums.length ? Math.min(...nums) : null;
}

function matches(content: string, category: string, p: Watcher["params"]): boolean {
  const c = content.toLowerCase();
  if (p.query && !c.includes(p.query.toLowerCase())) return false;
  if (p.category && !(category || "").toLowerCase().includes(p.category.toLowerCase())) return false;
  if (typeof p.discountAtLeast === "number") {
    const pct = maxPercent(content);
    if (pct === null || pct < p.discountAtLeast) return false;
  }
  if (typeof p.priceUnder === "number") {
    const rs = minRupees(content);
    if (rs === null || rs > p.priceUnder) return false;
  }
  return true;
}

// Returns number of new notifications created.
export async function runWatchers(supabase: any, accountId: string): Promise<number> {
  const { data: watchers } = await supabase
    .from("watchers")
    .select("id, account_id, label, kind, params, color, last_checked")
    .eq("account_id", accountId)
    .eq("active", true);

  if (!watchers?.length) return 0;

  let created = 0;
  const now = new Date().toISOString();

  for (const w of watchers as Watcher[]) {
    // First run (no last_checked) scans existing data so the user sees results
    // immediately; later runs only look at entries added since.
    let q = supabase
      .from("data_entries")
      .select("id, content, created_at, accounts!inner(name, bee_name, slug, category, type)")
      .eq("visibility", "public")
      .eq("accounts.type", "business")
      .order("created_at", { ascending: false })
      .limit(100);
    if (w.last_checked) q = q.gt("created_at", w.last_checked);

    const { data: rows } = await q;

    const newRows: any[] = [];
    for (const r of (rows || []) as any[]) {
      const acc = r.accounts;
      if (!acc) continue;
      if (!matches(r.content || "", acc.category || "", w.params)) continue;
      newRows.push({
        account_id: accountId,
        watcher_id: w.id,
        source: `@${acc.bee_name}.B`,
        source_slug: acc.slug,
        body: r.content,
        color: w.color,
        folder: "primary",
        dedupe_key: `${w.id}:${r.id}`,
        read: false,
      });
    }

    if (newRows.length) {
      const { data: ins } = await supabase
        .from("notifications")
        .upsert(newRows, { onConflict: "account_id,dedupe_key", ignoreDuplicates: true })
        .select("id");
      created += ins?.length || 0;
    }

    await supabase.from("watchers").update({ last_checked: now }).eq("id", w.id);
  }

  return created;
}
