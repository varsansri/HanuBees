"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
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
  key_points: string[];
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

export default function KnowledgePage() {
  const [entries, setEntries]   = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery]       = useState("");
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
      || e.key_points?.some(p => p.toLowerCase().includes(q));
  });

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <AppHeader
        left={<span style={{ fontSize: 14, fontWeight: 700, color: YELLOW }}>Knowledge Base</span>}
        right={<span style={{ fontSize: 12, color: MUTED }}>{entries.length} saved</span>}
      />

      {/* Search within knowledge base */}
      {entries.length > 3 && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(234,234,234,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: BG3, borderRadius: 12, padding: "10px 14px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Search your knowledge base…"
              value={query} onChange={e => setQuery(e.target.value)}
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: FG, fontSize: 14, fontFamily: "'Space Grotesk', sans-serif" }}
            />
          </div>
        </div>
      )}

      <div style={{ padding: "16px" }}>
        {loading ? (
          <p style={{ color: MUTED, textAlign: "center", padding: "40px 0" }}>Loading…</p>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <img src="/bee.png" alt="" style={{ width: 70, opacity: 0.4, margin: "0 auto 20px", display: "block" }} />
            <p style={{ color: FG, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Your knowledge base is empty</p>
            <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7 }}>
              Copy a YouTube link, then tap the bee on any page to save it here.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ color: MUTED, textAlign: "center", padding: "40px 0" }}>No results for "{query}"</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(entry => {
              const isOpen = expanded === entry.id;
              return (
                <div key={entry.id} style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 18, overflow: "hidden" }}>
                  {/* Card header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : entry.id)}
                    style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px 16px", textAlign: "left", display: "flex", alignItems: "flex-start", gap: 12 }}
                  >
                    {/* Platform icon */}
                    {entry.platform === "instagram" ? (
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(225,48,108,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e1306c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                          <circle cx="12" cy="12" r="4"/>
                          <circle cx="17.5" cy="6.5" r="0.5" fill="#e1306c"/>
                        </svg>
                      </div>
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff4444">
                          <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.2 3 12 3 12 3s-4.2 0-6.8.3c-.6.1-1.9.1-3 1.3C1.3 5.4 1 7.4 1 7.4S.7 9.6.7 11.8v2.1c0 2.2.3 4.4.3 4.4s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.2 22.5 12 22.5 12 22.5s4.2 0 6.8-.3c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.4v-2.1C23.3 9.6 23 7 23 7zM9.7 15.5V8.4l6.5 3.6-6.5 3.5z"/>
                        </svg>
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, color: GREEN, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 3 }}>{entry.channel_name}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: FG, lineHeight: 1.4, wordBreak: "break-word" }}>
                        {entry.title?.slice(0, 80)}{(entry.title?.length ?? 0) > 80 ? "…" : ""}
                      </p>
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{timeAgo(entry.created_at)}</p>
                    </div>

                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 4, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {/* Expanded key points */}
                  {isOpen && (
                    <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(234,234,234,0.06)" }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", margin: "12px 0 10px" }}>
                        Key Points
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                        {(entry.key_points || []).map((point, i) => (
                          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <span style={{ color: YELLOW, fontSize: 10, marginTop: 4, flexShrink: 0 }}>▸</span>
                            <p style={{ fontSize: 13, color: FG, lineHeight: 1.6, margin: 0 }}>{point}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <a href={entry.url} target="_blank" rel="noopener noreferrer" style={{
                          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          background: entry.platform === "instagram" ? "rgba(225,48,108,0.1)" : "rgba(255,0,0,0.1)",
                          border: "none", borderRadius: 10, padding: "10px",
                          color: entry.platform === "instagram" ? "#e1306c" : "#ff4444",
                          fontSize: 13, fontWeight: 700, textDecoration: "none",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}>
                          {entry.platform === "instagram" ? "View on Instagram" : "Watch on YouTube"}
                        </a>
                        <button onClick={() => remove(entry.id)} style={{
                          background: "none", border: "1px solid rgba(234,234,234,0.1)", borderRadius: 10,
                          padding: "10px 14px", color: MUTED, cursor: "pointer",
                          fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
                        }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
