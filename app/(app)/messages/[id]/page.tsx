"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GREEN = "var(--green)";
const FG    = "var(--fg)";
const MUTED = "var(--fg2)";
const BG2   = "var(--bg2)";
const BG3   = "var(--bg3)";

type Msg = { id: string; role: string; content: string; created_at: string; is_order: boolean };

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [name, setName] = useState("Customer");
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: conv } = await supabase.from("conversations").select("visitor_name").eq("id", id).maybeSingle();
      if (conv?.visitor_name) setName(conv.visitor_name);
      const { data: ms } = await supabase
        .from("messages").select("id, role, content, created_at, is_order")
        .eq("conversation_id", id).order("created_at", { ascending: true });
      setMsgs((ms ?? []) as Msg[]);
      setLoading(false);
      // mark visitor messages read
      await supabase.from("messages").update({ read: true }).eq("conversation_id", id).eq("role", "visitor").eq("read", false);
    })();
    /* eslint-disable-next-line */
  }, [id]);

  useEffect(() => { endRef.current?.scrollIntoView(); }, [msgs]);

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="page-header" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
        <Link href="/messages" aria-label="Back" style={{ display: "flex", color: FG }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <div className="avatar" style={{ width: 34, height: 34, fontSize: 14, background: BG3 }}>{name[0].toUpperCase()}</div>
        <span style={{ fontWeight: 700, fontSize: 16, color: FG }}>{name}</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 14px 120px" }}>
        {loading ? (
          <p style={{ color: MUTED, textAlign: "center", marginTop: 40 }}>Loading…</p>
        ) : (
          msgs.map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: m.role === "agent" ? "flex-end" : "flex-start", marginBottom: 10 }}>
              <div style={{
                maxWidth: "82%", padding: "10px 14px", borderRadius: 16, fontSize: 14.5, lineHeight: 1.5,
                whiteSpace: "pre-wrap", wordBreak: "break-word", color: FG,
                background: m.role === "agent" ? BG3 : BG2,
                border: m.role === "agent" ? "none" : "1px solid rgba(152,170,157,0.18)",
              }}>
                {m.is_order && <span style={{ color: GREEN, fontWeight: 700, fontSize: 11, display: "block", marginBottom: 3 }}>ORDER / BOOKING</span>}
                {m.content}
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <div style={{ position: "fixed", bottom: 78, left: 0, right: 0, padding: "10px 16px", textAlign: "center", background: "rgba(18,18,18,0.9)", backdropFilter: "blur(16px)" }}>
        <p style={{ color: MUTED, fontSize: 12.5, margin: 0 }}>Your agent handles replies automatically. Add info to it in <Link href="/chat" style={{ color: GREEN }}>Chat</Link>.</p>
      </div>
    </div>
  );
}
