"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const FG     = "#eaeaea";
const MUTED  = "#a9a9a7";
const BG2    = "#1a1a1a";
const BG3    = "#242424";

const CATEGORIES = [
  "Wedding Photography", "Videography", "Catering", "Event Planning",
  "Venue", "DJ & Music", "Decor & Florals", "Makeup & Styling", "Other",
];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep]     = useState<"type" | "basics" | "bee" | "seed">("type");
  const [type, setType]     = useState<"business" | "person" | null>(null);
  const [name, setName]     = useState("");
  const [beeName, setBeeName] = useState("");
  const [category, setCat]  = useState(CATEGORIES[0]);
  const [city, setCity]     = useState("");
  const [seed, setSeed]     = useState("");
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState("");
  const [ready, setReady]   = useState(false);

  // If an account already exists, skip straight to chat
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("accounts").select("id").eq("user_id", user.id).maybeSingle();
      if (data) { router.push("/chat"); return; }
      setReady(true);
    })();
  }, [router, supabase]);

  const uniqueSlug = async (base: string) => {
    let slug = base || "agent";
    for (let i = 0; i < 6; i++) {
      const { data } = await supabase.from("accounts").select("id").eq("slug", slug).maybeSingle();
      if (!data) return slug;
      slug = `${base}-${Math.random().toString(36).slice(2, 5)}`;
    }
    return `${base}-${Date.now().toString(36)}`;
  };

  const createAccount = async () => {
    if (!name.trim()) { setError(type === "business" ? "Add your business name" : "Add your name"); return; }
    setBusy(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const slug = await uniqueSlug(slugify(name));
    const { error: insErr } = await supabase.from("accounts").insert({
      user_id: user.id, type: type || "business", name: name.trim(),
      slug, category: type === "person" ? null : category, city: type === "person" ? null : (city.trim() || null),
      bee_name: "bee",
    });
    setBusy(false);
    if (insErr) { setError(insErr.message); return; }
    setStep("bee");
  };

  const updateBeeName = async () => {
    if (!beeName.trim()) { setError("Name your AI bee"); return; }
    setBusy(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: acc } = await supabase.from("accounts").select("id").eq("user_id", user.id).maybeSingle();
    if (acc) {
      const cleanName = beeName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      await supabase.from("accounts").update({ bee_name: cleanName }).eq("id", acc.id);
    }
    setBusy(false);
    if (type === "person") router.push("/chat");
    else setStep("seed");
  };

  const buildAgent = async () => {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: seed }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setBusy(false); return; }
      router.push("/chat");
    } catch {
      setError("Network error — try again.");
      setBusy(false);
    }
  };

  if (!ready) return <div style={{ minHeight: "100vh" }} />;

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "32px 20px 120px" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: step === "type" ? YELLOW : "#3a3a38" }} />
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: step === "basics" || step === "bee" || step === "seed" ? YELLOW : "#3a3a38" }} />
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: step === "bee" || step === "seed" ? YELLOW : "#3a3a38" }} />
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: step === "seed" ? YELLOW : "#3a3a38" }} />
      </div>

      {step === "type" ? (
        <>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: FG }}>What are you?</h1>
          <p style={{ color: MUTED, fontSize: 14, marginTop: 6, marginBottom: 28 }}>
            Choose what you're using Hanubees for.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={() => { setType("business"); setStep("basics"); }} style={{
              padding: 20, borderRadius: 14, border: "1px solid rgba(234,234,234,0.1)",
              background: BG2, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: FG, margin: "0 0 6px" }}>Business</p>
              <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Get your own AI receptionist to answer customers</p>
            </button>
            <button onClick={() => { setType("person"); setStep("basics"); }} style={{
              padding: 20, borderRadius: 14, border: "1px solid rgba(234,234,234,0.1)",
              background: BG2, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: FG, margin: "0 0 6px" }}>Person / Individual</p>
              <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Find businesses, compare services, chat with agents</p>
            </button>
          </div>
        </>
      ) : step === "basics" ? (
        <>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: FG }}>
            {type === "business" ? "Set up your agent" : "Create your profile"}
          </h1>
          <p style={{ color: MUTED, fontSize: 14, marginTop: 6, marginBottom: 24 }}>
            {type === "business"
              ? "A free AI receptionist that answers your customers, anytime."
              : "Your profile helps you find and follow businesses."}
          </p>

          <label style={labelStyle}>{type === "business" ? "Business name" : "Your name"}</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={type === "business" ? "e.g. Elegant Events Co." : "e.g. John"} />

          {type === "business" && (
            <>
              <label style={{ ...labelStyle, marginTop: 16 }}>Category</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => setCat(c)} style={{
                    padding: "8px 13px", borderRadius: 10, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                    background: category === c ? GREEN : BG3,
                    color: category === c ? "#121212" : FG,
                    border: "1px solid rgba(234,234,234,0.08)", fontWeight: category === c ? 700 : 400,
                  }}>{c}</button>
                ))}
              </div>

              <label style={{ ...labelStyle, marginTop: 16 }}>City</label>
              <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Melbourne" />
            </>
          )}

          {error && <p style={errStyle}>{error}</p>}
          <button className="btn-primary" style={{ marginTop: 24 }} onClick={createAccount} disabled={busy}>
            {busy ? "Creating…" : "Continue"}
          </button>
        </>
      ) : step === "bee" ? (
        <>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: FG }}>Name your AI bee</h1>
          <p style={{ color: MUTED, fontSize: 14, marginTop: 6, marginBottom: 24 }}>
            What should your AI be called? It'll be {beeName.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "your-bee"}.bee everywhere.
          </p>

          <label style={labelStyle}>AI bee name</label>
          <input className="input" value={beeName} onChange={(e) => setBeeName(e.target.value)} placeholder="e.g. Rosa, Max, Luna" autoFocus />

          {error && <p style={errStyle}>{error}</p>}
          <button className="btn-primary" style={{ marginTop: 24 }} onClick={updateBeeName} disabled={busy}>
            {busy ? "Naming…" : type === "person" ? "Let's go" : "Next"}
          </button>
        </>
      ) : step === "seed" ? (
        <>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: FG }}>Teach your agent</h1>
          <p style={{ color: MUTED, fontSize: 14, marginTop: 6, marginBottom: 20 }}>
            Paste your website link, or describe your business — services, prices, hours, anything customers ask. Your agent learns it instantly. You can add more anytime by chatting.
          </p>

          <textarea
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder={"https://yourbusiness.com.au\n\nWe shoot weddings across Melbourne. Full-day coverage $2400, includes 600+ edited photos. Available weekends, book 3 months ahead."}
            style={{
              width: "100%", minHeight: 200, background: BG3, color: FG, fontFamily: "inherit",
              border: "1px solid rgba(234,234,234,0.08)", borderRadius: 14, padding: 14, fontSize: 14.5,
              outline: "none", resize: "vertical", lineHeight: 1.5,
            }}
          />

          {error && <p style={errStyle}>{error}</p>}
          <button className="btn-primary" style={{ marginTop: 20 }} onClick={buildAgent} disabled={busy}>
            {busy ? "Building your agent…" : "Build my agent"}
          </button>
          <button onClick={() => router.push("/chat")} disabled={busy} style={{
            width: "100%", marginTop: 10, background: "none", border: "none", color: MUTED,
            fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 8,
          }}>Skip — I&apos;ll teach it in chat</button>
        </>
      ) : null}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, color: MUTED, marginBottom: 8, fontWeight: 600 };
const errStyle: React.CSSProperties = { color: GREEN, fontSize: 13, marginTop: 14 };
