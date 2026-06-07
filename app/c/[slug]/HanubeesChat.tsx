"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { upsertChat, getMsgs, setMsgs, type Msg } from "@/lib/consumer/store";

const YELLOW = "var(--yellow)", GREEN = "var(--green)", FG = "var(--fg)", MUTED = "var(--fg2)", BG2 = "var(--bg2)", BG3 = "var(--bg3)";

type Agent = { name: string; slug: string; category: string | null; city: string | null };
type Contribution = { id: string; kind: string; title: string; content: string; place_name: string | null; area: string | null; price: number | null; valid_until: string | null; created_at: string };
type RMsg = Msg & { agents?: Agent[] };

const GREETING = "Hi 👋 I'm Hanubees — your local guide. I help you find local businesses and get instant answers, free. Tell me what you're looking for (e.g. “dentist in Melbourne” or “dog grooming”).";

export default function HanubeesChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<RMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = getMsgs("hanubees") as RMsg[];
    const init = stored.length ? stored : [{ role: "assistant" as const, content: GREETING }];
    setMessages(init);
    if (!stored.length) setMsgs("hanubees", init);
    upsertChat({ slug: "hanubees", name: "Hanubees", category: "Your local guide", last: stored[stored.length - 1]?.content || GREETING });
    // eslint-disable-next-line
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const persist = (msgs: RMsg[]) => {
    setMsgs("hanubees", msgs.map(({ role, content }) => ({ role, content })));
    upsertChat({ slug: "hanubees", name: "Hanubees", category: "Your local guide", last: msgs[msgs.length - 1]?.content });
  };

  const send = async (text: string) => {
    const content = text.trim(); if (!content || loading) return;
    const next: RMsg[] = [...messages, { role: "user", content }];
    setMessages(next); persist(next); setInput(""); setLoading(true);
    try {
      const [aRes, cRes] = await Promise.all([
        fetch(`/api/agents/search?q=${encodeURIComponent(content)}&limit=6`),
        fetch(`/api/contributions/search?q=${encodeURIComponent(content)}&limit=6`),
      ]);
      const agents: Agent[] = (await aRes.json()).agents || [];
      const contribs: Contribution[] = (await cRes.json()).contributions || [];

      const fmtAge = (iso: string) => {
        const h = Math.max(0, (Date.now() - new Date(iso).getTime()) / 3.6e6);
        return h < 1 ? "just now" : h < 24 ? `${Math.round(h)}h ago` : `${Math.round(h / 24)}d ago`;
      };

      let reply: string;
      if (contribs.length) {
        const lines = contribs.map((c) => {
          const where = [c.place_name, c.area].filter(Boolean).join(", ");
          const extras = [c.price ? `₹${c.price}` : null, c.valid_until ? "live" : null].filter(Boolean).join(" · ");
          return `• ${where ? where + " — " : ""}${c.content}${extras ? `  (${extras}, ${fmtAge(c.created_at)})` : `  (${fmtAge(c.created_at)})`}`;
        }).join("\n");
        reply = `Here's what people shared about that:\n\n${lines}${agents.length ? `\n\nAnd businesses you can ask directly:` : ""}`;
      } else {
        reply = agents.length
          ? `Here's what I found for “${content}” — tap any to chat with their AI:`
          : `No info on that yet. Be the first — tap + to share what you know, and others will find it here.`;
      }
      const after: RMsg[] = [...next, { role: "assistant", content: reply, agents }];
      setMessages(after); persist(after);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Connection issue — please try again." }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 640, margin: "0 auto" }}>
      {/* header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => router.push("/hub")} aria-label="Back" style={{ background: "none", border: "none", color: FG, cursor: "pointer", display: "flex", flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <img src="/bee.png" alt="" style={{ width: 38, height: 38, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: FG }}>Hanubees</div>
          <div style={{ fontSize: 12, color: GREEN }}>Your local guide · always here</div>
        </div>
      </div>

      {/* chat */}
      <div style={{ flex: 1, padding: "16px 16px 150px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "84%", padding: "11px 15px", borderRadius: 16, fontSize: 15, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word", color: FG, background: m.role === "user" ? BG3 : BG2, border: m.role === "user" ? "none" : "1px solid rgba(152,170,157,0.18)" }}>{m.content}</div>
            </div>
            {m.agents && m.agents.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                {m.agents.map((a) => (
                  <Link key={a.slug} href={`/c/${a.slug}`} style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", background: BG2, border: "1px solid var(--border)", borderRadius: 12, padding: "10px 13px" }}>
                    <div className="avatar" style={{ width: 38, height: 38, fontSize: 16, flexShrink: 0 }}>{a.name[0].toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: FG, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: MUTED }}>{[a.category, a.city].filter(Boolean).join(" · ")}</div>
                    </div>
                    <span style={{ color: GREEN, fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>Chat →</span>
                  </Link>
                ))}
              </div>
            )}
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

      {/* input */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "10px 14px 18px", background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "flex-end", gap: 8, background: BG3, borderRadius: 18, padding: "6px 6px 6px 14px", border: "1px solid var(--border)" }}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder="Ask Hanubees…" rows={1} style={{ flex: 1, background: "none", border: "none", outline: "none", resize: "none", color: FG, fontSize: 15, fontFamily: "inherit", maxHeight: 120, padding: "7px 0" }} />
          <button onClick={() => send(input)} disabled={!input.trim() || loading} aria-label="Send" style={{ width: 38, height: 38, borderRadius: 12, border: "none", flexShrink: 0, background: input.trim() && !loading ? YELLOW : "var(--fg3)", cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
          </button>
        </div>
      </div>
      <style>{`@keyframes dot { 0%,60%,100%{opacity:0.3;transform:translateY(0)} 30%{opacity:1;transform:translateY(-3px)} }`}</style>
    </div>
  );
}
