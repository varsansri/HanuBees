import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/feed/PostCard";
import Link from "next/link";

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

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>

      {/* Header — Threads style: search left, logo center, search right */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(18,18,18,0.95)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", padding: "10px 16px",
      }}>
        {/* Left */}
        <div />

        {/* Center logo */}
        <img src="/logo.png" alt="Hanubees" style={{ height: 40, width: "auto", borderRadius: 10 }} />

        {/* Right — search */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link href="/search" style={{ color: "var(--fg)", display: "flex" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Create post prompt — Threads style */}
      <Link href="/post/new" style={{ textDecoration: "none" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 16px", borderBottom: "1px solid var(--border)",
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%", background: "var(--bg3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 700, color: "var(--fg)", flexShrink: 0,
          }}>
            {profile?.display_name?.[0]?.toUpperCase() || "?"}
          </div>
          <span style={{ color: "var(--fg3)", fontSize: 16 }}>
            What&apos;s your health journey today?
          </span>
          <button style={{
            marginLeft: "auto", background: "none",
            border: "1px solid var(--border)", borderRadius: 10,
            color: "var(--fg2)", fontSize: 14, fontWeight: 500,
            padding: "7px 18px", cursor: "pointer", flexShrink: 0,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>Post</button>
        </div>
      </Link>

      {/* Feed tabs */}
      <div style={{
        display: "flex", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 61, zIndex: 39,
        background: "rgba(18,18,18,0.95)", backdropFilter: "blur(20px)",
      }}>
        {["For You", "Following"].map((t, i) => (
          <button key={t} style={{
            flex: 1, padding: "13px 0", background: "none", border: "none",
            borderBottom: i === 0 ? "2px solid var(--fg)" : "2px solid transparent",
            color: i === 0 ? "var(--fg)" : "var(--fg2)",
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
          }}>{t}</button>
        ))}
      </div>

      {/* Posts */}
      <div>
        {posts && posts.length > 0 ? (
          posts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <div style={{ padding: "48px 16px", textAlign: "center" }}>
            <p style={{ color: "var(--fg2)", fontSize: 16, marginBottom: 8 }}>No posts yet</p>
            <p style={{ color: "var(--fg3)", fontSize: 14, marginBottom: 24 }}>Be the first to share your health journey</p>
            <Link href="/post/new" style={{
              display: "inline-block", background: "var(--fg)", color: "var(--bg)",
              padding: "12px 28px", borderRadius: 12, fontWeight: 700,
              fontSize: 15, textDecoration: "none",
            }}>Share your story</Link>
          </div>
        )}
      </div>
    </div>
  );
}
