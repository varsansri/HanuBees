"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const YELLOW = "var(--yellow)";
const GREEN  = "var(--green)";
const FG     = "var(--fg)";
const MUTED  = "var(--fg2)";
const BG2    = "var(--bg2)";

type Account = { id: string; name: string; rating: number; review_count: number; follower_count: number; category: string | null; city: string | null; bio: string | null; logo_url: string | null };

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [acc, setAcc] = useState<Account | null>(null);
  const [entries, setEntries] = useState(0);
  const [convs, setConvs] = useState(0);
  const [visitorMsgs, setVisitorMsgs] = useState(0);
  const [gaps, setGaps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: account } = await supabase.from("accounts").select("*").eq("user_id", user.id).maybeSingle();
      if (!account) { router.push("/onboarding"); return; }
      setAcc(account as Account);

      const [{ count: ec }, { data: cs }] = await Promise.all([
        supabase.from("data_entries").select("id", { count: "exact", head: true }).eq("account_id", account.id),
        supabase.from("conversations").select("id").eq("account_id", account.id),
      ]);
      setEntries(ec ?? 0);
      const convIds = (cs ?? []).map((c) => c.id);
      setConvs(convIds.length);

      if (convIds.length) {
        const { data: ms } = await supabase
          .from("messages").select("content, role, is_important, is_order")
          .in("conversation_id", convIds).limit(1000);
        const visitor = (ms ?? []).filter((m) => m.role === "visitor");
        setVisitorMsgs(visitor.length);
        setGaps(visitor.filter((m) => m.is_important && !m.is_order).map((m) => m.content).slice(0, 8));
      }
      setLoading(false);
    })();
    /* eslint-disable-next-line */
  }, []);

  if (loading || !acc) return <div style={{ minHeight: "100vh" }} />;

  const answered = visitorMsgs - gaps.length;
  const answerRate = visitorMsgs ? Math.round((answered / visitorMsgs) * 100) : 0;

  // Simple agent score (out of 100) — gives owners something to climb
  const profileComplete = [acc.bio, acc.category, acc.city, acc.logo_url].filter(Boolean).length / 4;
  const score = Math.round(
    Math.min(entries, 15) / 15 * 35 +          // knowledge depth
    (visitorMsgs ? answerRate / 100 : 0.5) * 30 + // answer quality
    Math.min(acc.review_count, 10) / 10 * 20 + // reviews
    profileComplete * 15,                       // profile completeness
  );

  const tips: string[] = [];
  if (entries < 15) tips.push("Add more info to your agent — prices, FAQs, policies. Richer agents answer more and rank higher.");
  if (gaps.length) tips.push("Answer the knowledge gaps below — these are real questions your agent couldn't answer.");
  if (acc.review_count === 0) tips.push("Reviews are the #1 ranking signal. Verified customer reviews unlock higher placement.");
  if (profileComplete < 1) tips.push("Complete your profile — logo, bio, category and city help customers find and trust you.");
  if (!tips.length) tips.push("You're in great shape. Keep your info fresh and collect reviews to stay on top.");

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="page-header" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
        <Link href="/messages" aria-label="Back" style={{ display: "flex", color: FG }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <span style={{ fontWeight: 700, fontSize: 17, color: FG }}>Insights</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 14px 110px" }}>
        {/* Agent score */}
        <div style={{ background: BG2, border: `1px solid rgba(255,190,0,0.2)`, borderRadius: 18, padding: 20, marginBottom: 16, textAlign: "center" }}>
          <p style={{ color: MUTED, fontSize: 12.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", margin: 0 }}>Agent score</p>
          <p style={{ fontSize: 52, fontWeight: 700, color: YELLOW, margin: "4px 0 0", lineHeight: 1 }}>{score}</p>
          <div style={{ height: 6, background: "var(--bg3)", borderRadius: 4, marginTop: 14, overflow: "hidden" }}>
            <div style={{ width: `${score}%`, height: "100%", background: YELLOW, transition: "width 0.6s" }} />
          </div>
          <p style={{ color: MUTED, fontSize: 12.5, marginTop: 10 }}>Higher score = higher ranking when customers search.</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <Stat label="Conversations" value={convs} />
          <Stat label="Customer questions" value={visitorMsgs} />
          <Stat label="Answer rate" value={visitorMsgs ? `${answerRate}%` : "—"} accent={GREEN} />
          <Stat label="Knowledge facts" value={entries} />
          <Stat label="Reviews" value={acc.review_count} />
          <Stat label="Followers" value={acc.follower_count} />
        </div>

        {/* Knowledge gaps */}
        {gaps.length > 0 && (
          <div style={{ background: BG2, border: "1px solid var(--border)", borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: FG, marginTop: 0, marginBottom: 4 }}>Knowledge gaps</p>
            <p style={{ color: MUTED, fontSize: 12.5, marginTop: 0, marginBottom: 12 }}>Questions your agent couldn&apos;t answer. Add these in Chat to fix them.</p>
            {gaps.map((g, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderTop: "1px solid var(--border)" }}>
                <span style={{ color: YELLOW, fontSize: 11, marginTop: 3 }}>▸</span>
                <p style={{ fontSize: 13.5, color: FG, margin: 0, lineHeight: 1.4 }}>{g}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        <div style={{ background: BG2, border: "1px solid rgba(152,170,157,0.18)", borderRadius: 16, padding: 16 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: FG, marginTop: 0, marginBottom: 12 }}>How to rank up</p>
          {tips.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 9, marginBottom: i === tips.length - 1 ? 0 : 11 }}>
              <span style={{ color: GREEN, fontSize: 13, marginTop: 1 }}>●</span>
              <p style={{ fontSize: 13.5, color: MUTED, margin: 0, lineHeight: 1.5 }}>{t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{ background: BG2, border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px" }}>
      <p style={{ fontSize: 26, fontWeight: 700, color: accent ?? FG, margin: 0, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 12, color: MUTED, margin: "6px 0 0" }}>{label}</p>
    </div>
  );
}
