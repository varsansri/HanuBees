"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import AppHeader from "@/components/ui/AppHeader";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";
const BG2    = "#1a1a1a";
const BG3    = "#242424";
const FG     = "#eaeaea";

interface KnowledgeEntry {
  id: string;
  url: string;
  title: string;
  channel_name: string;
  platform: string;
  avatar_url: string;
  key_points: string[];
  transcript: string;
  summary: string;
  created_at: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === "instagram") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        stroke="url(#ig)" style={{ display: "block" }}>
        <defs>
          <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433"/>
            <stop offset="25%" stopColor="#e6683c"/>
            <stop offset="50%" stopColor="#dc2743"/>
            <stop offset="75%" stopColor="#cc2366"/>
            <stop offset="100%" stopColor="#bc1888"/>
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="#cc2366" stroke="none"/>
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#ff4444">
      <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.2 3 12 3 12 3s-4.2 0-6.8.3c-.6.1-1.9.1-3 1.3C1.3 5.4 1 7.4 1 7.4S.7 9.6.7 11.8v2.1c0 2.2.3 4.4.3 4.4s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.2 22.5 12 22.5 12 22.5s4.2 0 6.8-.3c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.4v-2.1C23.3 9.6 23 7 23 7zM9.7 15.5V8.4l6.5 3.6-6.5 3.5z"/>
    </svg>
  );
}

export default function KnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState("");
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("knowledge_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setEntries(data || []);
    setLoading(false);
  };

  const remove = async (id: string) => {
    await supabase.from("knowledge_entries").delete().eq("id", id);
    setEntries(e => e.filter(x => x.id !== id));
  };

  const filtered = entries.filter(e => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return e.title?.toLowerCase().includes(q)
      || e.channel_name?.toLowerCase().includes(q)
      || e.summary?.toLowerCase().includes(q)
      || e.key_points?.some(p => p.toLowerCase().includes(q));
  });

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <AppHeader
        left={<span style={{ fontSize: 14, fontWeight: 700, color: YELLOW }}>Knowledge Base</span>}
        right={<span style={{ fontSize: 12, color: MUTED }}>{entries.length} saved</span>}
      />

      {entries.length > 2 && (
        <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(234,234,234,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: BG3, borderRadius: 12, padding: "10px 14px" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Search saved content…"
              value={query} onChange={e => setQuery(e.target.value)}
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: FG, fontSize: 14, fontFamily: "'Space Grotesk', sans-serif" }}
            />
          </div>
        </div>
      )}

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <p style={{ color: MUTED, textAlign: "center", padding: "40px 0" }}>Loading…</p>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <img src="/bee.png" alt="" style={{ width: 60, opacity: 0.35, margin: "0 auto 18px", display: "block" }} />
            <p style={{ color: FG, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Nothing saved yet</p>
            <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.6 }}>
              Copy a YouTube or Instagram link, then tap the bee button to save it here.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ color: MUTED, textAlign: "center", padding: "40px 0" }}>No results for "{query}"</p>
        ) : (
          filtered.map(entry => (
            <div key={entry.id} style={{
              background: BG2,
              border: "1px solid rgba(234,234,234,0.08)",
              borderRadius: 16,
              padding: "14px 16px",
            }}>
              {/* Source line — like a tweet header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                {/* Avatar */}
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: BG3,
                  border: "1px solid rgba(234,234,234,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, overflow: "hidden",
                }}>
                  {entry.platform === "youtube" && entry.avatar_url ? (
                    <img src={entry.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <PlatformIcon platform={entry.platform} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: FG, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {entry.channel_name}
                  </p>
                  <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>
                    {entry.platform === "instagram" ? "Instagram" : "YouTube"} · {timeAgo(entry.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => remove(entry.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: MUTED, flexShrink: 0 }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* AI summary — the main content of the card */}
              {entry.summary ? (
                <p style={{ fontSize: 14, color: FG, lineHeight: 1.65, margin: "0 0 12px" }}>
                  {entry.summary}
                </p>
              ) : (
                <p style={{ fontSize: 14, color: FG, lineHeight: 1.65, margin: "0 0 12px" }}>
                  {entry.title}
                </p>
              )}

              {/* Key points */}
              {entry.key_points?.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
                  {entry.key_points.map((point, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: YELLOW, fontSize: 9, marginTop: 5, flexShrink: 0 }}>▸</span>
                      <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.55, margin: 0 }}>{point}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer link */}
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 12, color: GREEN, fontWeight: 600,
                  textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {entry.platform === "instagram" ? "View on Instagram" : "Watch on YouTube"}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
