import Link from "next/link";

const YELLOW = "var(--yellow)";
const GREEN  = "var(--green)";
const FG     = "var(--fg)";
const MUTED  = "var(--fg2)";
const BG2    = "var(--bg2)";

const FEATURES = [
  { t: "Answers customers 24/7", d: "Your agent replies instantly with your prices, hours, and services — even while you sleep." },
  { t: "Teach it in seconds", d: "Paste your website or just talk to it. It learns your business and keeps itself up to date." },
  { t: "Never miss a lead", d: "Every question and order lands in one inbox. Important ones get pinned so nothing slips." },
  { t: "Get found & ranked", d: "Real, verified reviews push the best businesses to the top. Build trust that compounds." },
];

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <img src="/bee.png" alt="Hanubees" style={{ width: 30, height: 30 }} />
          <span style={{ fontWeight: 700, fontSize: 19, color: FG }}>Hanubees</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/discover" className="btn-ghost" style={{ textDecoration: "none", fontSize: 14 }}>Browse</Link>
          <Link href="/map" className="btn-ghost" style={{ textDecoration: "none", fontSize: 14 }}>Map</Link>
          <Link href="/claim" className="btn-primary" style={{ width: "auto", padding: "9px 18px", textDecoration: "none" }}>List your business</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "60px 20px 40px", maxWidth: 720, margin: "0 auto" }}>
        <img src="/bee.png" alt="" style={{ width: 84, height: 84, filter: "drop-shadow(0 0 30px rgba(255,190,0,0.35))" }} />
        <h1 style={{ fontSize: 40, fontWeight: 700, color: FG, lineHeight: 1.1, margin: "24px 0 0", letterSpacing: "-0.02em" }}>
          Find local businesses —<br /><span style={{ color: YELLOW }}>just ask.</span>
        </h1>
        <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.55, margin: "18px auto 0", maxWidth: 520 }}>
          Ask for anything in your city and get instant answers from each business&apos;s own AI. No signup to browse.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 30, flexWrap: "wrap" }}>
          <Link href="/discover" className="btn-primary" style={{ width: "auto", padding: "14px 28px", textDecoration: "none", fontSize: 16 }}>Start browsing →</Link>
          <Link href="/map" className="btn-ghost" style={{ width: "auto", padding: "14px 28px", textDecoration: "none", fontSize: 16 }}>Open map</Link>
        </div>
        <p style={{ fontSize: 12.5, color: MUTED, marginTop: 14 }}>
          Own a business? <Link href="/claim" style={{ color: GREEN, textDecoration: "none", fontWeight: 600 }}>List it free →</Link>
        </p>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 880, margin: "0 auto", padding: "30px 20px 60px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {FEATURES.map((f) => (
          <div key={f.t} style={{ background: BG2, border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: GREEN, marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: FG, margin: 0 }}>{f.t}</h3>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, margin: "8px 0 0" }}>{f.d}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ textAlign: "center", padding: "20px 20px 80px" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: FG }}>Stop answering the same questions.</h2>
        <p style={{ fontSize: 15, color: MUTED, marginTop: 8 }}>Let your agent do it. Free, forever to start.</p>
        <Link href="/signup" className="btn-primary" style={{ width: "auto", padding: "14px 28px", textDecoration: "none", fontSize: 16, display: "inline-block", marginTop: 22 }}>Get started</Link>
      </section>

      <footer style={{ textAlign: "center", padding: "24px", borderTop: "1px solid var(--border)", color: MUTED, fontSize: 13 }}>
        © Hanubees
      </footer>
    </div>
  );
}
