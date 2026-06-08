import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Catalog() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: account } = await supabase.from("accounts").select("id").eq("user_id", user!.id).maybeSingle();
  const { data: listings } = account
    ? await supabase.from("listings").select("id, title, vertical, price, area, status").eq("account_id", account.id).order("created_at", { ascending: false })
    : { data: [] as any[] };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Catalog</h1>
      <p style={{ color: "var(--fg2)" }}>Your products, services, properties.</p>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {(!listings || listings.length === 0) && <div className="card" style={{ color: "var(--fg2)" }}>No listings yet. Adding/editing here is coming next.</div>}
        {(listings || []).map((l: any) => (
          <div key={l.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{l.title}</div>
              <div style={{ fontSize: 13, color: "var(--fg2)" }}>{[l.vertical, l.area].filter(Boolean).join(" · ")}</div>
            </div>
            {l.price != null && <div style={{ fontWeight: 800, color: "var(--green)" }}>₹{l.price}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
