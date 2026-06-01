import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/feed/PostCard";
import Link from "next/link";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";

export default async function FeedPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(username, display_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("username, display_name").eq("id", user.id).single()
    : { data: null };

  const initial = profile?.display_name?.[0]?.toUpperCase() || "?";

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>

      {/* Header — amber top accent */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(18,18,18,0.97)", backdropFilter: "blur(24px)",
        borderBottom: `1px solid rgba(255,190,0,0.18)`,
        boxShadow: `0 1px 0 rgba(255,190,0,0.08), 0 4px 24px rgba(255,190,0,0.04)`,
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", padding: "8px 16px",
      }}>
        {/* Left — placeholder */}
        <div />

        {/* Center — bee logo */}
        <img src="/bee.png" alt="Hanubees" style={{ height: 50, width: "auto", filter: "drop-shadow(0 0 10px rgba(255,190,0,0.25))" }} />

        {/* Right — search */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link href="/search" style={{ color: MUTED, display: "flex", padding: 4 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Create post row */}
      <Link href="/post/new" style={{ textDecoration: "none", display: "block" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "13px 16px", borderBottom: "1px solid var(--border)",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "var(--bg3)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 16, fontWeight: 700,
            color: "var(--fg)", flexShrink: 0,
            border: `1.5px solid rgba(255,190,0,0.2)`,
          }}>
            {initial}
          </div>
          <span style={{ color: "var(--fg2)", fontSize: 15 }}>
            What&apos;s your health journey today?
          </span>
          <button style={{
            marginLeft: "auto", flexShrink: 0,
            background: YELLOW, border: "none",
            borderRadius: 10, color: "#121212",
            fontSize: 13, fontWeight: 700,
            padding: "7px 16px", cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "0.01em",
          }}>Post</button>
        </div>
      </Link>

      {/* Feed tabs — yellow active */}
      <div style={{
        display: "flex", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 67, zIndex: 39,
        background: "rgba(18,18,18,0.97)", backdropFilter: "blur(24px)",
      }}>
        {["For You", "Following"].map((t, i) => (
          <button key={t} style={{
            flex: 1, padding: "13px 0", background: "none", border: "none",
            borderBottom: i === 0 ? `2px solid ${YELLOW}` : "2px solid transparent",
            color: i === 0 ? YELLOW : MUTED,
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
            transition: "all 0.15s",
          }}>{t}</button>
        ))}
      </div>

      {/* Posts */}
      <div>
        {posts && posts.length > 0 ? (
          posts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <div style={{ padding: "60px 16px", textAlign: "center" }}>
            <img src="/bee.png" alt="" style={{ width: 80, height: "auto", margin: "0 auto 20px", display: "block", opacity: 0.5 }} />
            <p style={{ color: "var(--fg2)", fontSize: 16, marginBottom: 8, fontWeight: 600 }}>No posts yet</p>
            <p style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>Be the first to share your health journey</p>
            <Link href="/post/new" style={{
              display: "inline-block", background: YELLOW, color: "#121212",
              padding: "12px 32px", borderRadius: 12, fontWeight: 700,
              fontSize: 15, textDecoration: "none",
            }}>Share your story</Link>
          </div>
        )}
      </div>
    </div>
  );
}
