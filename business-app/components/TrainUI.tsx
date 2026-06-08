"use client";

import { useEffect, useRef, useState } from "react";

type Entry = { id: string; content: string; created_at: string };

export default function TrainUI({ beeName, recent }: { beeName: string; recent: Entry[] }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [entries, setEntries] = useState<Entry[]>(recent);
  const [listening, setListening] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const recRef = useRef<any>(null);
  const baseRef = useRef("");

  useEffect(() => () => { try { recRef.current?.stop(); } catch {} }, []);

  const toggleVoice = () => {
    const SR = (typeof window !== "undefined") && ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition);
    if (!SR) { setMsg("Voice not supported here — type instead."); return; }
    if (listening) { try { recRef.current?.stop(); } catch {} return; }
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = true; rec.continuous = true;
    baseRef.current = text ? text + " " : "";
    rec.onresult = (e: any) => { let c = ""; for (let i = e.resultIndex; i < e.results.length; i++) c += e.results[i][0].transcript; setText(baseRef.current + c); };
    rec.onend = () => setListening(false);
    recRef.current = rec; setListening(true); setMsg("");
    try { rec.start(); } catch { setListening(false); }
  };

  const add = async () => {
    if (!text.trim()) return;
    try { recRef.current?.stop(); } catch {}
    setBusy(true); setMsg("");
    try {
      const res = await fetch("/api/train", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      const data = await res.json();
      if (!res.ok || data.error) { setMsg(data.error || "Couldn't save."); setBusy(false); return; }
      setEntries((e) => [data.entry, ...e].slice(0, 12));
      setText(""); setMsg("Added ✓ — your agent knows this now.");
      setTimeout(() => setIframeKey((k) => k + 1), 600); // refresh preview
    } catch { setMsg("Network error."); }
    setBusy(false);
  };

  const previewUrl = `https://www.hanubees.com/${beeName}.bee`;

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px" }}>Train your AI</h1>
      <p style={{ color: "var(--fg2)", margin: "0 0 20px" }}>Tell it anything — prices, hours, what you offer, FAQs. Speak or type. The preview shows exactly what customers see.</p>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 20, alignItems: "start" }}>
        {/* LEFT — teach */}
        <div>
          <div style={{ position: "relative" }}>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6}
              placeholder="e.g. We're open 9am–9pm daily. Filter coffee ₹30. We do custom cakes with 1 day notice."
              style={{ width: "100%", background: "var(--bg3)", color: "var(--fg)", border: "1px solid var(--border)", borderRadius: 14, padding: 14, fontSize: 15, lineHeight: 1.5, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            <button onClick={toggleVoice} aria-label="voice"
              style={{ position: "absolute", right: 12, bottom: 14, width: 42, height: 42, borderRadius: 999, border: "none", cursor: "pointer", fontSize: 19, background: listening ? "var(--green)" : "var(--yellow)", color: "#121212" }}>
              {listening ? "■" : "🎤"}
            </button>
          </div>
          <button className="btn" style={{ width: "100%", marginTop: 12 }} disabled={busy} onClick={add}>
            {busy ? "Saving…" : "Add to my agent"}
          </button>
          {msg && <p style={{ fontSize: 13, color: "var(--green)", marginTop: 10 }}>{msg}</p>}

          <div style={{ marginTop: 22, fontSize: 13, color: "var(--fg2)", fontWeight: 600 }}>Recently taught</div>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {entries.length === 0 && <p style={{ color: "var(--fg2)", fontSize: 14 }}>Nothing yet — add your first fact above.</p>}
            {entries.map((e) => (
              <div key={e.id} className="card" style={{ padding: "12px 14px", fontSize: 14, lineHeight: 1.4 }}>{e.content}</div>
            ))}
          </div>
        </div>

        {/* RIGHT — live preview */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--fg2)", fontWeight: 600 }}>Live customer preview</span>
            <button onClick={() => setIframeKey((k) => k + 1)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, color: "var(--fg2)", fontSize: 12.5, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit" }}>Refresh</button>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", height: 620, background: "var(--bg2)" }}>
            <iframe key={iframeKey} src={previewUrl} style={{ width: "100%", height: "100%", border: "none" }} />
          </div>
          <p style={{ fontSize: 12.5, color: "var(--fg2)", marginTop: 8 }}>This is your real public agent. Ask it a question to test what you just taught.</p>
        </div>
      </div>
    </div>
  );
}
