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

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(16,16,16,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        padding: "14px 16px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <img src="/logo.png" alt="Hanubees" style={{ height: 36, width: "auto", borderRadius: 8 }} />
        </div>
        {/* Feed tabs */}
        <div style={{ display: "flex" }}>
          {["For You", "Following", "Health News"].map((t, i) => (
            <button key={t} className={`tab ${i === 0 ? "tab-active" : ""}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div>
        {posts && posts.length > 0 ? (
          posts.map((post, i) => (
            <PostCard key={post.id} post={post} showThread={i < posts.length - 1} />
          ))
        ) : (
          <div style={{ padding: "48px 16px", textAlign: "center" }}>
            <p style={{ color: "var(--fg2)", fontSize: 16, marginBottom: 6 }}>
              No posts yet
            </p>
            <p style={{ color: "var(--fg3)", fontSize: 14, marginBottom: 24 }}>
              Be the first to share your health journey
            </p>
            <Link href="/post/new" style={{
              display: "inline-block", background: "var(--fg)", color: "var(--bg)",
              padding: "12px 28px", borderRadius: 12, fontWeight: 700, fontSize: 15,
              textDecoration: "none",
            }}>
              Share your story
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
