"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Post {
  id: string;
  content: string;
  post_type: string;
  tags: string[];
  value_up: number;
  value_down: number;
  likes: number;
  created_at: string;
  profiles: { username: string; display_name: string };
}

const POPULAR_TAGS = [
  "diabetes", "insulin", "supplements", "skincare",
  "migraine", "anxiety", "sleep", "vitamin-d",
  "gut-health", "chronic-pain", "thyroid", "blood-pressure",
];

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const supabase = createClient();

  const search = async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(username, display_name)")
      .or(`content.ilike.%${q}%,tags.cs.{${q.toLowerCase()}}`)
      .order("value_up", { ascending: false })
      .limit(30);
    setResults(data || []);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Sticky search bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(16,16,16,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)", padding: "12px 16px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "var(--bg3)", borderRadius: 14, padding: "10px 14px",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="var(--fg3)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Search conditions, symptoms, supplements..."
            value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search(query)}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "var(--fg)", fontSize: 15, fontFamily: "Inter, sans-serif",
            }}
            autoFocus
          />
          {query && (
            <button onClick={() => { setQuery(""); setSearched(false); setResults([]); }}
              style={{ background: "none", border: "none", color: "var(--fg3)", cursor: "pointer", fontSize: 18 }}>
              ×
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Popular tags */}
        {!searched && (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--fg2)", marginBottom: 14, letterSpacing: "0.04em" }}>
              Popular topics
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {POPULAR_TAGS.map((tag, i) => (
                <button key={tag} onClick={() => search(tag)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: "14px 0",
                    borderBottom: i < POPULAR_TAGS.length - 1 ? "1px solid var(--border)" : "none",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    textAlign: "left",
                  }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", fontFamily: "Inter, sans-serif" }}>
                      #{tag}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--fg3)", marginTop: 2, fontFamily: "Inter, sans-serif" }}>
                      Health topic
                    </p>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="var(--fg3)" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: 48 }}>
            <p style={{ color: "var(--fg3)" }}>Searching...</p>
          </div>
        )}

        {/* No results */}
        {searched && !loading && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No results for "{query}"</p>
            <p style={{ color: "var(--fg3)", fontSize: 14, marginBottom: 24 }}>
              Be the first to share about this topic
            </p>
            <Link href="/post/new" style={{
              display: "inline-block", background: "var(--fg)", color: "var(--bg)",
              padding: "12px 28px", borderRadius: 12, fontWeight: 700,
              fontSize: 15, textDecoration: "none",
            }}>
              Share your experience
            </Link>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <>
            <p style={{ fontSize: 13, color: "var(--fg3)", marginBottom: 16 }}>
              {results.length} results for "{query}"
            </p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {results.map(post => (
                <Link key={post.id} href={`/post/${post.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                        {post.profiles?.display_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{post.profiles?.display_name}</span>
                      <span style={{ color: "var(--fg3)", fontSize: 13 }}>· {timeAgo(post.created_at)}</span>
                    </div>
                    <p style={{ fontSize: 15, color: "var(--fg2)", lineHeight: 1.5, marginBottom: 8, paddingLeft: 40 }}>
                      {post.content.length > 160 ? post.content.slice(0, 160) + "…" : post.content}
                    </p>
                    {post.tags?.length > 0 && (
                      <div style={{ display: "flex", gap: 8, paddingLeft: 40 }}>
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} style={{ fontSize: 14, color: "var(--amber)" }}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
