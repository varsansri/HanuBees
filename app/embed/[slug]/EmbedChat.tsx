"use client";

import { useEffect, useRef, useState } from "react";

const YELLOW = "#ffbe00", GREEN = "#98aa9d", FG = "#eaeaea", MUTED = "#a9a9a7", BG = "#121212", BG2 = "#1a1a1a", BG3 = "#242424";

type Account = { id: string; name: string; slug: string; bee_name: string; category: string | null; city: string | null };
type Msg = { role: "user" | "assistant"; content: string };

export default function EmbedChat({ account }: { account: Account }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | undefined>();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "visitor", slug: account.slug, conversationId: convId, messages: next }),
      });
      const data = await res.json();
      if (data.conversationId) setConvId(data.conversationId);
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "Thanks — I'll pass this on." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Connection issue — try again." }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BG, fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: "1px solid rgba(255,190,0,0.16)", background: BG2 }}>
        <img src="/bee.png" alt="" style={{ width: 30, height: 30 }} />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 14.5, fontWeight: 700, color: FG, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{account.name}</p>
          <p style={{ fontSize: 11, color: GREEN, margin: 0 }}>AI assistant · answers instantly</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        {messages.length === 0 && (
          <p style={{ color: MUTED, fontSize: 13.5, textAlign: "center", marginTop: 24 }}>
            Ask {account.name} anything — prices, hours, services.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            <div style={{
              maxWidth: "85%", padding: "9px 13px", borderRadius: 14, fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-wrap",
              background: m.role === "user" ? BG3 : BG2, color: FG,
              border: m.role === "user" ? "none" : "1px solid rgba(152,170,157,0.18)",
            }}>{m.content}</div>
          </div>
        ))}
        {loading && <p style={{ color: MUTED, fontSize: 13 }}>…</p>}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: 10, borderTop: "1px solid rgba(234,234,234,0.07)", background: BG2 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: BG3, borderRadius: 14, padding: "5px 5px 5px 12px" }}>
          <textarea
            value={input} onChange={(e) => setInput(e.target.value)} rows={1}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder={`Message ${account.name}…`}
            style={{ flex: 1, background: "none", border: "none", outline: "none", resize: "none", color: FG, fontSize: 14, fontFamily: "inherit", maxHeight: 100, padding: "7px 0" }}
          />
          <button onClick={() => send(input)} disabled={!input.trim() || loading} aria-label="Send" style={{
            width: 34, height: 34, borderRadius: 10, border: "none", flexShrink: 0,
            background: input.trim() && !loading ? YELLOW : "#3a3a38", cursor: input.trim() && !loading ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 10.5, color: MUTED, margin: "7px 0 0" }}>
          Powered by <a href="https://www.hanubees.com" target="_blank" rel="noopener" style={{ color: GREEN, textDecoration: "none" }}>Hanubees</a>
        </p>
      </div>
    </div>
  );
}
