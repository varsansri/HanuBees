"use client";

import { useEffect, useRef, useState } from "react";
import { anonId } from "@/lib/consumer/store";

const YELLOW = "var(--yellow)", GREEN = "var(--green)", FG = "var(--fg)", MUTED = "var(--fg2)", BG2 = "var(--bg2)", BG3 = "var(--bg3)";

type Saved = {
  ok: true;
  contribution: { id: string; kind: string; title: string; place_name: string | null; city: string | null; valid_until: string | null };
  matched_place: string | null;
  followup: string | null;
};

const KIND_LABEL: Record<string, string> = {
  availability: "Live availability",
  experience: "Experience",
  tip: "Tip",
  question: "Question",
};

export default function ContributeBox() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Saved | null>(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  const baseRef = useRef("");

  useEffect(() => () => { try { recRef.current?.stop(); } catch {} }, []);

  const toggleVoice = () => {
    const SR = (typeof window !== "undefined") &&
      ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition);
    if (!SR) { setError("Voice isn't supported here — type instead."); return; }
    if (listening) { try { recRef.current?.stop(); } catch {} return; }
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = true; rec.continuous = true;
    baseRef.current = text ? text + " " : "";
    rec.onresult = (e: any) => {
      let chunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) chunk += e.results[i][0].transcript;
      setText(baseRef.current + chunk);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setError(""); setListening(true);
    try { rec.start(); } catch { setListening(false); }
  };

  const submit = async () => {
    if (!text.trim()) { setError("Share what you know — a place, a price, a tip, or a question."); return; }
    try { recRef.current?.stop(); } catch {}
    setBusy(true); setError(""); setSaved(null);
    try {
      const res = await fetch("/api/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, anonId: anonId() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || "Something went wrong."); setBusy(false); return; }
      if (!data.ok) { setError("Couldn't capture that — try again."); setBusy(false); return; }
      setSaved(data as Saved);
      setText("");
    } catch { setError("Network error — try again."); }
    setBusy(false);
  };

  const again = () => { setSaved(null); setError(""); };

  return (
    <div style={{ padding: "16px" }}>
      <p style={{ fontSize: 14, color: MUTED, margin: "0 0 14px", lineHeight: 1.5 }}>
        Know something the internet doesn't? Free PG slots, a great cheap find, a useful tip,
        or a question no one answers — drop it here. Just talk; the bee sorts it out. Anonymous.
      </p>

      {!saved && (
        <>
          <div style={{ position: "relative" }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Sri Sai PG in Coimbatore near Gandhipuram has 2 beds free, ₹4500/month, decent food…"
              rows={6}
              style={{ width: "100%", boxSizing: "border-box", padding: 14, background: BG2, color: FG, border: "1px solid var(--border)", borderRadius: 14, fontSize: 15, lineHeight: 1.5, resize: "vertical", outline: "none", fontFamily: "inherit" }}
            />
            <button
              onClick={toggleVoice}
              aria-label={listening ? "Stop" : "Speak"}
              style={{ position: "absolute", right: 12, bottom: 14, width: 44, height: 44, borderRadius: 999, border: "none", cursor: "pointer", fontSize: 20, background: listening ? GREEN : YELLOW, color: "#121212", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
            >
              {listening ? "■" : "🎤"}
            </button>
          </div>
          {listening && <p style={{ fontSize: 12, color: GREEN, margin: "8px 2px 0" }}>Listening… tap ■ to stop.</p>}
          {error && <p style={{ fontSize: 13, color: GREEN, margin: "12px 2px 0" }}>{error}</p>}
          <button
            onClick={submit}
            disabled={busy}
            style={{ width: "100%", marginTop: 16, padding: 15, borderRadius: 14, border: "none", background: YELLOW, color: "#121212", fontSize: 16, fontWeight: 800, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "inherit" }}
          >
            {busy ? "Saving…" : "Share it"}
          </button>
        </>
      )}

      {saved && (
        <div style={{ background: BG2, border: "1px solid var(--border)", borderRadius: 16, padding: 18 }}>
          <p style={{ fontSize: 13, color: GREEN, fontWeight: 700, margin: "0 0 8px" }}>✓ Added to Hanubees</p>
          <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "#121212", background: YELLOW, borderRadius: 6, padding: "2px 8px", marginBottom: 8 }}>
            {KIND_LABEL[saved.contribution.kind] || saved.contribution.kind}
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: FG, margin: "0 0 4px" }}>{saved.contribution.title}</h3>
          <p style={{ fontSize: 13, color: MUTED, margin: "0 0 10px" }}>
            {[saved.matched_place || saved.contribution.place_name, saved.contribution.city].filter(Boolean).join(" · ") || "Local knowledge"}
            {saved.contribution.valid_until && <> · fresh for now</>}
          </p>
          {saved.followup && (
            <div style={{ background: BG3, borderRadius: 12, padding: "12px 14px", marginTop: 4 }}>
              <p style={{ fontSize: 13, color: FG, margin: 0 }}>{saved.followup}</p>
              <button onClick={again} style={{ marginTop: 10, background: "none", border: "none", color: GREEN, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>Add more →</button>
            </div>
          )}
          {!saved.followup && (
            <button onClick={again} style={{ width: "100%", marginTop: 10, padding: 13, borderRadius: 14, border: "1px solid var(--border)", background: "transparent", color: FG, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Share something else →</button>
          )}
        </div>
      )}
    </div>
  );
}
