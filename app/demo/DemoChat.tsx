"use client";

import { useEffect, useRef, useState } from "react";

const YELLOW = "var(--yellow)", GREEN = "var(--green)", FG = "var(--fg)", MUTED = "var(--fg2)", BG2 = "var(--bg2)", BG3 = "var(--bg3)";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING =
  "Hey 👋 I'm the Hanubees agent — and this chat *is* the product.\n\nI'm the kind of AI that Hanubees builds to represent a business online: ask me anything and I answer instantly, 24/7, from that business's own info — no website to dig through, no waiting.\n\nWant to see why a business would want their own? Tap one below, or just ask me anything.";

const QUICK = [
  "Why make my own AI agent?",
  "How much does it cost?",
  "Show me what you've built",
  "How does it stay updated?",
];

export default function DemoChat() {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply || "Try me again?" }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Connection issue — please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const userTurns = messages.filter((m) => m.role === "user").length;
  const showQuick = userTurns < 2 && !loading;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 640, margin: "0 auto" }}>
      {/* header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
        <img src="/bee.png" alt="" style={{ width: 40, height: 40, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: FG }}>Hanubees</div>
          <div style={{ fontSize: 12, color: GREEN }}>AI agent for your business · always on</div>
        </div>
        <a href="https://hanubees.com" style={{ fontSize: 12.5, fontWeight: 700, color: YELLOW, textDecoration: "none", flexShrink: 0 }}>hanubees.com</a>
      </div>

      {/* chat */}
      <div style={{ flex: 1, padding: "16px 16px 170px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 12, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "84%", padding: "11px 15px", borderRadius: 16, fontSize: 15, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word", color: FG, background: m.role === "user" ? BG3 : BG2, border: m.role === "user" ? "none" : "1px solid rgba(152,170,157,0.18)" }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "11px 15px", borderRadius: 16, background: BG2, border: "1px solid rgba(152,170,157,0.18)" }}>
              <span style={{ display: "inline-flex", gap: 4 }}>{[0, 1, 2].map((d) => <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, animation: `dot 1s ${d * 0.15}s infinite` }} />)}</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* input + quick replies */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "10px 14px 18px", background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {showQuick && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {QUICK.map((q) => (
                <button key={q} onClick={() => send(q)} style={{ background: BG2, border: "1px solid var(--border)", color: FG, fontSize: 13, fontWeight: 600, padding: "8px 13px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit" }}>{q}</button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, background: BG3, borderRadius: 18, padding: "6px 6px 6px 14px", border: "1px solid var(--border)" }}>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder="Ask the Hanubees agent…" rows={1} style={{ flex: 1, background: "none", border: "none", outline: "none", resize: "none", color: FG, fontSize: 15, fontFamily: "inherit", maxHeight: 120, padding: "7px 0" }} />
            <button onClick={() => send(input)} disabled={!input.trim() || loading} aria-label="Send" style={{ width: 38, height: 38, borderRadius: 12, border: "none", flexShrink: 0, background: input.trim() && !loading ? YELLOW : "var(--fg3)", cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes dot { 0%,60%,100%{opacity:0.3;transform:translateY(0)} 30%{opacity:1;transform:translateY(-3px)} }`}</style>
    </div>
  );
}
