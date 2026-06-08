import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function Row({ k, v }: { k: string; v?: string | null }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ color: "var(--fg2)", fontSize: 14 }}>{k}</span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{v || "—"}</span>
    </div>
  );
}

export default async function Profile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: a } = await supabase
    .from("accounts").select("name, bee_name, slug, category, city, phone, email, website, instagram, verified")
    .eq("user_id", user!.id).maybeSingle();

  if (!a) return <p style={{ color: "var(--fg2)" }}>No agent yet — see Dashboard.</p>;

  const link = `https://www.hanubees.com/${a.bee_name}.bee`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&bgcolor=1a1a1a&color=eaeaea&data=${encodeURIComponent(link)}`;

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 20px" }}>Profile</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 20, alignItems: "start" }}>
        <div className="card">
          <Row k="Business" v={a.name} />
          <Row k="Handle" v={`@${a.bee_name}.bee`} />
          <Row k="Category" v={a.category} />
          <Row k="City" v={a.city} />
          <Row k="Phone" v={a.phone} />
          <Row k="Email" v={a.email} />
          <Row k="Website" v={a.website} />
          <Row k="Instagram" v={a.instagram} />
          <Row k="Verified" v={a.verified ? "Yes" : "No"} />
          <p style={{ fontSize: 13, color: "var(--fg2)", marginTop: 14, marginBottom: 0 }}>Editing fields here is coming next. For now, teach facts in <a href="/train" style={{ color: "var(--yellow)", fontWeight: 700 }}>Train</a>.</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--fg2)", fontWeight: 600, marginBottom: 10 }}>Share your agent</div>
          <img src={qr} alt="QR" width={180} height={180} style={{ borderRadius: 12 }} />
          <a href={link} target="_blank" style={{ display: "block", color: "var(--green)", fontWeight: 700, fontSize: 13, marginTop: 10, wordBreak: "break-all" }}>{a.bee_name}.bee</a>
        </div>
      </div>
    </div>
  );
}
