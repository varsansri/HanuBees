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

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const typeColors: Record<string, string> = {
  story: "#22c55e", question: "#3b82f6", tip: "var(--amber)", journal_highlight: "#a855f7",
};

const POPULAR_TAGS = ["diabetes", "insulin", "supplements", "skincare", "migraine", "anxiety", "sleep", "vitamin-d", "gut-health", "chronic-pain"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const supabase = createClient();

  const search = async (q: string) => {
    if (!q.trim()) return;
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

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") search(query);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>
      <div style={{ paddingTop: 8, marginBottom: 16 }}>
        <h2 className="font-brand" style={{ fontSize: 22, color: "var(--amber)", marginBottom: 12 }}>Search</h2>

        {/* Search bar */}
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" placeholder="Search conditions, symptoms, supplements..."
            value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKey}
            style={{ flex: 1 }} autoFocus />
          <button className="btn-primary" onClick={() => search(query)}
            disabled={!query.trim() || loading}
            style={{ width: "auto", padding: "0 20px", whiteSpace: "nowrap" }}>
            {loading ? "..." : "Search"}
          </button>
        </div>
      </div>

      {/* Popular tags */}
      {!searched && (
        <>
          <p style={{ fontSize: 12, color: "var(--fg3)", marginBottom: 10,
            textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
            Popular topics
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {POPULAR_TAGS.map(tag => (
              <button key={tag} onClick={() => { setQuery(tag); search(tag); }}
                style={{
                  background: "var(--bg2)", border: "1px solid var(--border)",
                  borderRadius: 100, padding: "6px 14px", cursor: "pointer",
                  color: "var(--fg2)", fontSize: 13, transition: "all 0.2s",
                }}>
                #{tag}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Results */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--fg3)" }}>Searching...</p>
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--fg2)", marginBottom: 8 }}>No results for "{query}"</p>
          <p style={{ color: "var(--fg3)", fontSize: 13 }}>
            Be the first to share about this topic.
          </p>
          <Link href="/post/new" className="btn-primary"
            style={{ display: "inline-block", width: "auto", padding: "10px 24px", marginTop: 16 }}>
            Share your experience
          </Link>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <p style={{ fontSize: 12, color: "var(--fg3)", marginBottom: 10,
            textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
            {results.length} results for "{query}"
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {results.map(post => (
              <Link key={post.id} href={`/post/${post.id}`} style={{ textDecoration: "none" }}>
                <div className="card" style={{ padding: "14px 16px", cursor: "pointer",
                  transition: "border-color 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--fg)" }}>
                      {post.profiles?.display_name}
                    </span>
                    <span style={{ color: "var(--fg3)", fontSize: 11 }}>
                      @{post.profiles?.username} · {timeAgo(post.created_at)}
                    </span>
                    <span style={{
                      marginLeft: "auto", fontSize: 10, fontWeight: 600,
                      color: typeColors[post.post_type] || "var(--fg3)",
                      background: "var(--bg3)", padding: "2px 8px", borderRadius: 100,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>{post.post_type}</span>
                  </div>

                  <p style={{ fontSize: 14, color: "var(--fg2)", lineHeight: 1.5, marginBottom: 10 }}>
                    {post.content.length > 160 ? post.content.slice(0, 160) + "..." : post.content}
                  </p>

                  {post.tags?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                      {post.tags.map(tag => (
                        <span key={tag} style={{
                          fontSize: 11, color: "var(--amber)",
                          background: "rgba(245,166,35,0.08)", padding: "2px 8px", borderRadius: 100,
                        }}>#{tag}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "var(--fg3)" }}>▲ {post.value_up - post.value_down}</span>
                    <span style={{ fontSize: 12, color: "var(--fg3)" }}>♥ {post.likes}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
