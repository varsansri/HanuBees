import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card">
      <div style={{ fontSize: 13, color: "var(--fg2)", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 800, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: "var(--fg2)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: account } = await supabase
    .from("accounts").select("id, name, bee_name, slug, category, city, verified")
    .eq("user_id", user!.id).maybeSingle();

  if (!account) {
    return (
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Welcome 🐝</h1>
        <p style={{ color: "var(--fg2)" }}>No agent on this account yet. Create one to get started.</p>
        <a className="btn" style={{ display: "inline-block", marginTop: 14 }} href="https://www.hanubees.com/onboarding">Create my agent →</a>
      </div>
    );
  }

  const [{ count: facts }, { count: listings }] = await Promise.all([
    supabase.from("data_entries").select("id", { count: "exact", head: true }).eq("account_id", account.id),
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("account_id", account.id),
  ]);

  // simple completeness score
  const filled = [account.category, account.city, account.bee_name && account.bee_name !== "bee", (facts || 0) > 0, account.verified].filter(Boolean).length;
  const score = Math.round((filled / 5) * 100);
  const link = `https://www.hanubees.com/${account.bee_name}.bee`;

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px" }}>{account.name}</h1>
      <p style={{ color: "var(--fg2)", margin: "0 0 22px" }}>
        @{account.bee_name}.bee · {[account.category, account.city].filter(Boolean).join(" · ") || "set your category"}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <Stat label="Agent readiness" value={`${score}%`} sub={score < 100 ? "add more to reach 100%" : "fully set up"} />
        <Stat label="Knowledge facts" value={facts || 0} sub="things your AI can answer" />
        <Stat label="Listings" value={listings || 0} sub="products / services" />
        <Stat label="Status" value={account.verified ? "Verified" : "Unverified"} />
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div style={{ fontSize: 13, color: "var(--fg2)", fontWeight: 600, marginBottom: 8 }}>Your public agent</div>
        <a href={link} target="_blank" style={{ color: "var(--green)", fontWeight: 700 }}>{link} →</a>
        {score < 100 && (
          <p style={{ fontSize: 14, color: "var(--fg2)", marginTop: 14, marginBottom: 0 }}>
            Next: open <a href="/train" style={{ color: "var(--yellow)", fontWeight: 700 }}>Train</a> and tell your AI what it should know.
          </p>
        )}
      </div>
    </div>
  );
}
