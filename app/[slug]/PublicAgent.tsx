"use client";

import { useEffect, useRef, useState } from "react";
import { analytics } from "@/lib/analytics";

const YELLOW = "var(--yellow)";
const GREEN  = "var(--green)";
const FG     = "var(--fg)";
const MUTED  = "var(--fg2)";
const BG2    = "var(--bg2)";
const BG3    = "var(--bg3)";

type Account = {
  id: string; name: string; slug: string; category: string | null; city: string | null;
  location: string | null; bio: string | null; logo_url: string | null;
  rating: number; review_count: number; follower_count: number;
};
type Msg = { role: "user" | "assistant"; content: string };

export default function PublicAgent({ account, highlights }: { account: Account; highlights: { content: string; tag: string | null }[] }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | undefined>(undefined);
  const endRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    if (!started) setStarted(true);
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    analytics.customerQuestionAsked(account.slug, content.split(/\s+/).length);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "visitor", slug: account.slug, conversationId: convId, messages: next }),
      });
      const data = await res.json();
      if (data.conversationId) setConvId(data.conversationId);
      const reply = data.reply || "Thanks — I'll pass this to the team.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      analytics.agentAnswerProvided(account.slug, reply.length, data.confidence);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Connection issue — please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = highlights.slice(0, 3).map((h) =>
    h.tag === "pricing" ? "What are your prices?" :
    h.tag === "hours" ? "What are your hours?" :
    h.tag === "services" ? "What do you offer?" : null
  ).filter(Boolean) as string[];
  const defaultSuggestions = ["What do you offer?", "What are your prices?", "Are you available?"];
  const chips = (suggestions.length ? suggestions : defaultSuggestions).slice(0, 3);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 640, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ padding: "20px 18px 14px", borderBottom: "1px solid rgba(255,190,0,0.14)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div className="avatar" style={{ width: 58, height: 58, fontSize: 24 }}>
            {account.logo_url ? <img src={account.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : account.name[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: FG, margin: 0 }}>{account.name}</h1>
            <p style={{ fontSize: 13, color: MUTED, margin: "3px 0 0" }}>{[account.category, account.city].filter(Boolean).join(" · ")}</p>
            <div style={{ display: "flex", gap: 12, marginTop: 5, fontSize: 12.5, color: MUTED }}>
              {account.review_count > 0 && <span style={{ color: YELLOW }}>★ {account.rating.toFixed(1)} ({account.review_count})</span>}
              {account.follower_count > 0 && <span>{account.follower_count} followers</span>}
            </div>
          </div>
        </div>
        {account.bio && <p style={{ fontSize: 13.5, color: FG, lineHeight: 1.5, margin: "14px 0 0" }}>{account.bio}</p>}
        <a href={`/claim?id=${account.id}`} style={{ display: "inline-block", marginTop: 12, fontSize: 12.5, color: GREEN, textDecoration: "none", fontWeight: 600 }}>
          Own this business? Claim it free →
        </a>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, padding: "16px 16px 150px" }}>
        {!started ? (
          <div style={{ textAlign: "center", paddingTop: 30 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: BG2, border: `1px solid rgba(152,170,157,0.2)`, borderRadius: 20, padding: "6px 14px" }}>
              <img src="/bee.png" alt="" style={{ width: 22, height: 22 }} />
              <span style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>AI receptionist · answers instantly</span>
            </div>
            <p style={{ color: FG, fontSize: 16, fontWeight: 600, marginTop: 22 }}>Ask {account.name} anything</p>
            <p style={{ color: MUTED, fontSize: 13.5, marginTop: 4 }}>No waiting, no calls. Get answers now.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 22, alignItems: "center" }}>
              {chips.map((s) => (
                <button key={s} onClick={() => send(s)} style={{ background: BG2, border: "1px solid var(--border)", color: FG, borderRadius: 12, padding: "11px 18px", fontSize: 14, cursor: "pointer", fontFamily: "inherit", maxWidth: 360, width: "100%" }}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
              <div style={{
                maxWidth: "84%", padding: "11px 15px", borderRadius: 16, fontSize: 15, lineHeight: 1.5,
                whiteSpace: "pre-wrap", wordBreak: "break-word", color: FG,
                background: m.role === "user" ? BG3 : BG2,
                border: m.role === "user" ? "none" : "1px solid rgba(152,170,157,0.18)",
              }}>{m.content}</div>
            </div>
          ))
        )}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "11px 15px", borderRadius: 16, background: BG2, border: "1px solid rgba(152,170,157,0.18)" }}>
              <span style={{ display: "inline-flex", gap: 4 }}>
                {[0, 1, 2].map((d) => <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, animation: `dot 1s ${d * 0.15}s infinite` }} />)}
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "10px 14px 18px", background: "rgba(18,18,18,0.94)", backdropFilter: "blur(16px)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "flex-end", gap: 8, background: BG3, borderRadius: 18, padding: "6px 6px 6px 14px", border: "1px solid var(--border)" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder={`Message ${account.name}…`}
            rows={1}
            style={{ flex: 1, background: "none", border: "none", outline: "none", resize: "none", color: FG, fontSize: 15, fontFamily: "inherit", maxHeight: 120, padding: "7px 0" }}
          />
          <button onClick={() => send(input)} disabled={!input.trim() || loading} aria-label="Send" style={{ width: 38, height: 38, borderRadius: 12, border: "none", flexShrink: 0, background: input.trim() && !loading ? YELLOW : "var(--fg3)", cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: MUTED, margin: "8px 0 0" }}>Powered by <a href="/" style={{ color: GREEN, textDecoration: "none" }}>Hanubees</a></p>
      </div>

      <style>{`@keyframes dot { 0%,60%,100%{opacity:0.3;transform:translateY(0)} 30%{opacity:1;transform:translateY(-3px)} }`}</style>
    </div>
  );
}
