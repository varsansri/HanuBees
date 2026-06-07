"use client";

import { useEffect, useRef, useState } from "react";

const YELLOW = "var(--yellow)";
const GREEN  = "var(--green)";
const FG     = "var(--fg)";
const MUTED  = "var(--fg2)";
const BG2    = "var(--bg2)";
const BG3    = "var(--bg3)";

type Result = {
  ok: true;
  account: { id: string; name: string; bee_name: string; slug: string; city: string | null };
  counts: { entries: number; listings: number };
  note: string | null;
  links: { bee: string; consumer: string };
};

export default function OnboardCallPage() {
  const [text, setText]   = useState("");
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [listening, setListening] = useState(false);
  const [copied, setCopied] = useState("");
  const recRef = useRef<any>(null);
  const baseRef = useRef("");

  useEffect(() => () => { try { recRef.current?.stop(); } catch {} }, []);

  const toggleVoice = () => {
    const SR = (typeof window !== "undefined") &&
      ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition);
    if (!SR) { setError("Voice isn't supported in this browser — type instead."); return; }
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

  const create = async () => {
    if (!text.trim()) { setError("Describe the business first (type or speak)."); return; }
    try { recRef.current?.stop(); } catch {}
    setBusy(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/onboard-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || "Something went wrong."); setBusy(false); return; }
      if (!data.ok) { setError(data.note || "Could not create the agent."); setBusy(false); return; }
      setResult(data as Result);
    } catch {
      setError("Network error — try again.");
    }
    setBusy(false);
  };

  const copy = async (label: string, value: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(label); setTimeout(() => setCopied(""), 1500); } catch {}
  };

  const reset = () => { setText(""); setResult(null); setError(""); setCopied(""); };

  const waMessage = result
    ? `Hi! Your Hanubees AI agent is live 🐝\n\nIt answers your customers 24/7. Chat with it here:\n${result.links.bee}`
    : "";
  const waHref = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  return (
    <div style={{ minHeight: "100vh", maxWidth: 560, margin: "0 auto", padding: "28px 20px 120px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: FG, margin: "0 0 4px" }}>Call Onboarding</h1>
      <p style={{ fontSize: 14, color: MUTED, margin: "0 0 22px" }}>
        On a call with a business? Speak or type everything about them — name, what they do,
        prices, hours, contact. One tap creates their agent and gives you the link to send.
      </p>

      {!result && (
        <>
          <div style={{ position: "relative" }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Rosa's Cafe in Coimbatore on Race Course Road. Open 8am to 10pm daily. Filter coffee 30 rupees, sandwiches 80 to 150. Family run, very friendly. Phone 98765 43210, instagram rosascafe..."
              rows={9}
              style={{
                width: "100%", boxSizing: "border-box", padding: "14px 14px 14px",
                background: BG2, color: FG, border: `1px solid ${BG3}`, borderRadius: 14,
                fontSize: 15, lineHeight: 1.5, resize: "vertical", outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={toggleVoice}
              aria-label={listening ? "Stop dictation" : "Dictate"}
              style={{
                position: "absolute", right: 12, bottom: 14, width: 44, height: 44, borderRadius: 999,
                border: "none", cursor: "pointer", fontSize: 20,
                background: listening ? GREEN : YELLOW, color: "#1a1a1a",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
              }}
            >
              {listening ? "■" : "🎤"}
            </button>
          </div>
          {listening && (
            <p style={{ fontSize: 12, color: GREEN, margin: "8px 2px 0" }}>Listening… tap ■ to stop.</p>
          )}

          {error && <p style={{ fontSize: 13, color: GREEN, margin: "12px 2px 0" }}>{error}</p>}

          <button
            onClick={create}
            disabled={busy}
            style={{
              width: "100%", marginTop: 18, padding: "15px", borderRadius: 14, border: "none",
              background: YELLOW, color: "#1a1a1a", fontSize: 16, fontWeight: 800,
              cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? "Creating agent…" : "Create agent 🐝"}
          </button>
        </>
      )}

      {result && (
        <div style={{ background: BG2, border: `1px solid ${BG3}`, borderRadius: 16, padding: 20 }}>
          <p style={{ fontSize: 13, color: GREEN, fontWeight: 700, margin: "0 0 6px" }}>✓ Agent created</p>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: FG, margin: "0 0 2px" }}>{result.account.name}</h2>
          <p style={{ fontSize: 13, color: MUTED, margin: "0 0 16px" }}>
            @{result.account.bee_name}.bee{result.account.city ? ` · ${result.account.city}` : ""}
            {" · "}{result.counts.entries} facts{result.counts.listings ? ` · ${result.counts.listings} listings` : ""}
          </p>
          {result.note && (
            <p style={{ fontSize: 13, color: MUTED, margin: "0 0 16px", fontStyle: "italic" }}>{result.note}</p>
          )}

          {([
            ["Agent link (send this)", result.links.bee],
            ["Consumer chat", result.links.consumer],
          ] as const).map(([label, url]) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: MUTED, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <code style={{ flex: 1, fontSize: 13, color: FG, background: BG3, padding: "9px 11px", borderRadius: 9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</code>
                <button onClick={() => copy(label, url)} style={{ padding: "9px 12px", borderRadius: 9, border: "none", background: BG3, color: FG, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                  {copied === label ? "✓" : "Copy"}
                </button>
              </div>
            </div>
          ))}

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block", textAlign: "center", marginTop: 16, padding: "14px", borderRadius: 14,
              background: "#25D366", color: "#fff", fontSize: 15, fontWeight: 800, textDecoration: "none",
            }}
          >
            Send on WhatsApp
          </a>

          <button onClick={reset} style={{ width: "100%", marginTop: 12, padding: "13px", borderRadius: 14, border: `1px solid ${BG3}`, background: "transparent", color: FG, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Onboard another →
          </button>
        </div>
      )}
    </div>
  );
}
