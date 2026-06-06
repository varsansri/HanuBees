"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cache } from "@/lib/cache/usePageCache";
import { analytics } from "@/lib/analytics";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const FG     = "#eaeaea";
const MUTED  = "#a9a9a7";
const BG2    = "#1a1a1a";

type Msg = {
  id: string; conversation_id: string; role: string; content: string;
  is_important: boolean; is_order: boolean; fulfilled: boolean; read: boolean; created_at: string;
};
type Conv = { id: string; visitor_name: string | null; last_message_at: string };

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function MessagesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [msgs, setMsgs]   = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [anon, setAnon] = useState(false);
  const [accountName, setAccountName] = useState("");

  const load = async (fromCache = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAnon(true); setLoading(false); return; }
    const { data: account } = await supabase.from("accounts").select("id, name").eq("user_id", user.id).maybeSingle();
    if (!account) { setAnon(true); setLoading(false); return; }
    setAccountName(account.name);

    // Try cached data first (for instant back button)
    const cacheKey = `messages_${account.id}`;
    if (fromCache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        setConvs(cached.convs);
        setMsgs(cached.msgs);
        setLoading(false);
        analytics.cacheHit("messages");
        // Refresh in background
        loadFresh(account.id, cacheKey);
        return;
      }
      analytics.cacheMiss("messages");
    }

    // Fresh fetch
    await loadFresh(account.id, cacheKey);
  };

  const loadFresh = async (accountId: string, cacheKey: string) => {
    const { data: cs } = await supabase
      .from("conversations").select("id, visitor_name, last_message_at")
      .eq("account_id", accountId).order("last_message_at", { ascending: false }).limit(100);
    const convList = (cs ?? []) as Conv[];
    setConvs(convList);

    let msgList: Msg[] = [];
    if (convList.length) {
      const { data: ms } = await supabase
        .from("messages").select("*")
        .in("conversation_id", convList.map((c) => c.id))
        .order("created_at", { ascending: false }).limit(500);
      msgList = (ms ?? []) as Msg[];
      setMsgs(msgList);
    }
    cache.set(cacheKey, { convs: convList, msgs: msgList });
    setLoading(false);
  };

  useEffect(() => {
    load(true); // Try cache first on mount (for instant back button)
    /* eslint-disable-next-line */
  }, []);

  const toggleFulfilled = async (m: Msg) => {
    setMsgs((prev) => prev.map((x) => x.id === m.id ? { ...x, fulfilled: !x.fulfilled } : x));
    await supabase.from("messages").update({ fulfilled: !m.fulfilled }).eq("id", m.id);
    analytics.messageFulfilled(m.conversation_id);
  };

  const important = msgs.filter((m) => m.is_important).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  const lastByConv = (id: string) => msgs.filter((m) => m.conversation_id === id).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))[0];
  const unreadByConv = (id: string) => msgs.filter((m) => m.conversation_id === id && m.role === "visitor" && !m.read).length;

  if (anon) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: FG }}>Your messages</p>
        <p style={{ fontSize: 14, color: MUTED, margin: "8px 0 18px", maxWidth: 320 }}>
          Sign in to see conversations with businesses and manage your own.
        </p>
        <Link href="/claim" style={{ background: YELLOW, color: "#121212", borderRadius: 10, padding: "11px 20px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>List / claim your business</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header: insight (left) · title · menu (right) */}
      <div className="page-header" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "12px 16px" }}>
        <Link href="/dashboard" aria-label="Insights" style={{ justifySelf: "start", display: "flex", color: YELLOW }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </Link>
        <span style={{ fontWeight: 700, fontSize: 17, color: FG }}>Messages</span>
        <Link href="/profile" aria-label="Menu" style={{ justifySelf: "end", display: "flex", color: FG }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </Link>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "12px 12px 100px" }}>
        {loading ? (
          <p style={{ color: MUTED, textAlign: "center", marginTop: 40 }}>Loading…</p>
        ) : (
          <>
            {/* Pinned Important / Orders */}
            {important.length > 0 && (
              <div style={{ background: BG2, border: `1px solid rgba(255,190,0,0.25)`, borderRadius: 16, padding: 14, marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={YELLOW} stroke="none"><path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4.5L6 22l2-7-5.5-4h7z" /></svg>
                  <span style={{ fontWeight: 700, fontSize: 14, color: FG }}>Important & Orders</span>
                </div>
                {important.map((m) => (
                  <div key={m.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderTop: "1px solid rgba(234,234,234,0.06)" }}>
                    <button onClick={() => toggleFulfilled(m)} aria-label="Toggle fulfilled" style={{
                      marginTop: 2, width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: "pointer",
                      border: `1.6px solid ${m.fulfilled ? GREEN : "#3a3a38"}`, background: m.fulfilled ? GREEN : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {m.fulfilled && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </button>
                    <Link href={`/messages/${m.conversation_id}`} style={{ flex: 1, textDecoration: "none" }}>
                      <p style={{ fontSize: 13.5, color: m.fulfilled ? MUTED : FG, margin: 0, textDecoration: m.fulfilled ? "line-through" : "none", lineHeight: 1.4 }}>
                        {m.is_order && <span style={{ color: YELLOW, fontWeight: 700, fontSize: 11, marginRight: 6 }}>ORDER</span>}
                        {m.content}
                      </p>
                      <span style={{ fontSize: 11, color: MUTED }}>{timeAgo(m.created_at)} ago</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Conversation threads */}
            {convs.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: 60, color: MUTED }}>
                <p style={{ fontSize: 15, color: FG, fontWeight: 600 }}>No conversations yet</p>
                <p style={{ fontSize: 13.5, marginTop: 6 }}>When customers chat with your agent, they show up here.</p>
              </div>
            ) : (
              convs.map((c) => {
                const last = lastByConv(c.id);
                const unread = unreadByConv(c.id);
                return (
                  <Link key={c.id} href={`/messages/${c.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 6px", borderBottom: "1px solid rgba(234,234,234,0.05)" }}>
                      <div className="avatar" style={{ width: 46, height: 46, fontSize: 17, background: "#242424" }}>
                        {(c.visitor_name ?? "C")[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 600, fontSize: 15, color: FG }}>{c.visitor_name ?? "Customer"}</span>
                          <span style={{ fontSize: 12, color: MUTED }}>{timeAgo(c.last_message_at)}</span>
                        </div>
                        <p style={{ fontSize: 13.5, color: unread ? FG : MUTED, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: unread ? 600 : 400 }}>
                          {last ? `${last.role === "agent" ? "Agent: " : ""}${last.content}` : "…"}
                        </p>
                      </div>
                      {unread > 0 && <span style={{ width: 9, height: 9, borderRadius: "50%", background: GREEN, flexShrink: 0 }} />}
                    </div>
                  </Link>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
