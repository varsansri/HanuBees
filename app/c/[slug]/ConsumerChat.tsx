"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { analytics } from "@/lib/analytics";
import { upsertChat, getMsgs, setMsgs, isFollowing, toggleFollow, type Msg } from "@/lib/consumer/store";

const YELLOW = "var(--yellow)", GREEN = "var(--green)", FG = "var(--fg)", MUTED = "var(--fg2)", BG2 = "var(--bg2)", BG3 = "var(--bg3)";

type Account = {
  id: string; name: string; slug: string; bee_name: string; category: string | null; city: string | null;
  location: string | null; bio: string | null; logo_url: string | null; rating: number; review_count: number; follower_count: number;
};

export default function ConsumerChat({ account, highlights }: { account: Account; highlights: { content: string; tag: string | null }[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | undefined>(undefined);
  const [following, setFollowing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const greeting = `Welcome to ${account.name}! 👋 I can answer about our ${account.category ? account.category.toLowerCase() : "services"}, prices, hours and offers — instantly. What are you looking for today?`;

  // load history (or seed greeting) + record this agent into the on-device chat list
  useEffect(() => {
    const stored = getMsgs(account.slug);
    const init = stored.length ? stored : [{ role: "assistant" as const, content: greeting }];
    setMessages(init);
    if (!stored.length) setMsgs(account.slug, init);
    setFollowing(isFollowing(account.slug));
    upsertChat({
      slug: account.slug, name: account.name, category: account.category, city: account.city,
      logo_url: account.logo_url, last: (stored[stored.length - 1]?.content) || greeting,
    });
    // eslint-disable-next-line
  }, [account.slug]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const persist = (msgs: Msg[]) => {
    setMsgs(account.slug, msgs);
    upsertChat({ slug: account.slug, name: account.name, category: account.category, city: account.city, logo_url: account.logo_url, last: msgs[msgs.length - 1]?.content });
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next); persist(next); setInput(""); setLoading(true);
    analytics.customerQuestionAsked(account.slug, content.split(/\s+/).length);
    try {
      const res = await fetch("/api/agent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "visitor", slug: account.slug, conversationId: convId, messages: next }),
      });
      const data = await res.json();
      if (data.conversationId) setConvId(data.conversationId);
      const reply = data.reply || "Thanks — I'll pass this to the team.";
      const after = [...next, { role: "assistant" as const, content: reply }];
      setMessages(after); persist(after);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Connection issue — please try again." }]);
    } finally { setLoading(false); }
  };

  const onFollow = () => setFollowing(toggleFollow(account.slug));

  const tagChips = highlights.map((h) =>
    h.tag === "pricing" ? "What are your prices?" : h.tag === "hours" ? "What are your hours?" :
    h.tag === "services" ? "What do you offer?" : null).filter(Boolean) as string[];
  const chips = Array.from(new Set([...tagChips, "What do you offer?", "Any current offers?", "Where are you located?"])).slice(0, 4);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 640, margin: "0 auto" }}>
      {/* Header — business name on top, like a WhatsApp/IG chat */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => router.push("/hub")} aria-label="Back" style={{ background: "none", border: "none", color: FG, cursor: "pointer", display: "flex", flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="avatar" style={{ width: 40, height: 40, fontSize: 17, flexShrink: 0 }}>
          {account.logo_url ? <img src={account.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : account.name[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: FG, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{account.name}</div>
          <div style={{ fontSize: 12, color: GREEN }}>AI agent · replies instantly</div>
        </div>
        <button onClick={onFollow} style={{ flexShrink: 0, background: following ? "transparent" : YELLOW, color: following ? MUTED : "#121212", border: following ? "1px solid var(--border)" : "none", borderRadius: 20, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          {following ? "Following" : "Follow"}
        </button>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, padding: "16px 16px 160px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
            <div style={{ maxWidth: "84%", padding: "11px 15px", borderRadius: 16, fontSize: 15, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word", color: FG, background: m.role === "user" ? BG3 : BG2, border: m.role === "user" ? "none" : "1px solid rgba(152,170,157,0.18)" }}>{m.content}</div>
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

      {/* Input + quick replies */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "10px 14px 18px", background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {messages.length <= 2 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
              {chips.map((s) => (
                <button key={s} onClick={() => send(s)} style={{ flexShrink: 0, background: BG2, border: "1px solid var(--border)", color: FG, borderRadius: 16, padding: "8px 13px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>{s}</button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, background: BG3, borderRadius: 18, padding: "6px 6px 6px 14px", border: "1px solid var(--border)" }}>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder={`Message ${account.name}…`} rows={1} style={{ flex: 1, background: "none", border: "none", outline: "none", resize: "none", color: FG, fontSize: 15, fontFamily: "inherit", maxHeight: 120, padding: "7px 0" }} />
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
