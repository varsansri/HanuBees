// Community knowledge: people's anonymous contributions (availability/experience/
// tip/question) matched to a query, formatted for the LLM prompt. Fresh items only
// (perishable availability past valid_until is dropped). Returns "" if nothing matches.

const STOP = new Set(["the", "in", "at", "for", "and", "any", "near", "is", "are", "a", "an", "of", "to", "me", "do", "you", "there", "have", "about", "what", "with", "looking", "find"]);

export async function loadContributionsBlock(supabase: any, query: string, limit = 6): Promise<string> {
  const q = (query || "").trim();
  if (!q) return "";
  const tokens = q.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !STOP.has(t)).slice(0, 6);
  const terms = tokens.length ? tokens : [q.toLowerCase()];

  const fields = ["place_name", "title", "content", "area", "category", "city"];
  const orExpr = terms.flatMap((t) => fields.map((f) => `${f}.ilike.%${t}%`)).join(",");

  const { data } = await supabase
    .from("contributions")
    .select("kind, title, content, place_name, city, area, price, valid_until, created_at")
    .eq("status", "active")
    .or(orExpr)
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  const now = Date.now();
  const fresh = (data || [])
    .filter((c: any) => !c.valid_until || new Date(c.valid_until).getTime() > now)
    .slice(0, limit);
  if (!fresh.length) return "";

  const lines = fresh.map((c: any) => {
    const where = [c.place_name, c.area, c.city].filter(Boolean).join(", ");
    const hrs = Math.max(0, (now - new Date(c.created_at).getTime()) / 3.6e6);
    const age = hrs < 1 ? "just now" : hrs < 24 ? `${Math.round(hrs)}h ago` : `${Math.round(hrs / 24)}d ago`;
    const price = c.price ? ` ₹${c.price}` : "";
    return `• [${c.kind}] ${where ? where + " — " : ""}${c.content}${price} (shared ${age})`;
  }).join("\n");

  return lines;
}
