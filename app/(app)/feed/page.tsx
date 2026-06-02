import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/feed/PostCard";
import Link from "next/link";
import AppHeader from "@/components/ui/AppHeader";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const isFollowing = tab === "following";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("username, display_name").eq("id", user.id).single()
    : { data: null };

  const initial = profile?.display_name?.[0]?.toUpperCase() || "?";

  // Fetch posts based on active tab
  let posts: any[] = [];

  if (isFollowing && !user) {
    posts = []; // handled below with login prompt
  } else if (isFollowing && user) {
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const ids = follows?.map((f: any) => f.following_id) ?? [];

    if (ids.length > 0) {
      const { data } = await supabase
        .from("posts")
        .select("*, profiles(username, display_name, avatar_url)")
        .in("user_id", ids)
        .order("created_at", { ascending: false })
        .limit(30);
      posts = data ?? [];
    }
  } else {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(username, display_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(30);
    posts = data ?? [];
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>

      <AppHeader />

      {/* Create post row */}
      <Link href={user ? "/post/new" : "/signup"} style={{ textDecoration: "none", display: "block" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "var(--bg3)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 16, fontWeight: 700,
            color: "var(--fg)", flexShrink: 0, border: `1.5px solid rgba(255,190,0,0.2)`,
          }}>{initial}</div>
          <span style={{ color: "var(--fg2)", fontSize: 15 }}>
            {user ? "What's your health journey today?" : "Join to share your health journey"}
          </span>
          <button style={{
            marginLeft: "auto", flexShrink: 0, background: YELLOW, border: "none",
            borderRadius: 10, color: "#121212", fontSize: 13, fontWeight: 700,
            padding: "7px 16px", cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.01em",
          }}>{user ? "Post" : "Join"}</button>
        </div>
      </Link>

      {/* Tabs */}
      <div style={{
        display: "flex", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 67, zIndex: 39,
        background: "rgba(18,18,18,0.97)", backdropFilter: "blur(24px)",
      }}>
        <Link href="/feed" style={{ flex: 1, textDecoration: "none" }}>
          <div style={{
            padding: "13px 0", textAlign: "center",
            borderBottom: !isFollowing ? `2px solid ${GREEN}` : "2px solid transparent",
            color: !isFollowing ? GREEN : MUTED,
            fontSize: 15, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
            transition: "all 0.15s",
          }}>For You</div>
        </Link>
        <Link href="/feed?tab=following" style={{ flex: 1, textDecoration: "none" }}>
          <div style={{
            padding: "13px 0", textAlign: "center",
            borderBottom: isFollowing ? `2px solid ${GREEN}` : "2px solid transparent",
            color: isFollowing ? GREEN : MUTED,
            fontSize: 15, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif",
            transition: "all 0.15s",
          }}>Following</div>
        </Link>
      </div>

      {/* Posts */}
      <div>
        {/* Following tab — not logged in */}
        {isFollowing && !user && (
          <div style={{ padding: "60px 16px", textAlign: "center" }}>
            <p style={{ color: GREEN, fontSize: 16, marginBottom: 8, fontWeight: 600 }}>See posts from people you follow</p>
            <p style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>Create an account to follow people and build your feed</p>
            <Link href="/signup" style={{
              display: "inline-block", background: YELLOW, color: "#121212",
              padding: "12px 32px", borderRadius: 12, fontWeight: 700,
              fontSize: 15, textDecoration: "none",
            }}>Join Hanubees</Link>
          </div>
        )}

        {/* Following tab — logged in but not following anyone */}
        {isFollowing && user && posts.length === 0 && (
          <div style={{ padding: "60px 16px", textAlign: "center" }}>
            <img src="/bee.png" alt="" style={{ width: 80, height: "auto", margin: "0 auto 20px", display: "block", opacity: 0.5 }} />
            <p style={{ color: GREEN, fontSize: 16, marginBottom: 8, fontWeight: 600 }}>Your following feed is empty</p>
            <p style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>Follow people to see their posts here</p>
            <Link href="/search" style={{
              display: "inline-block", background: YELLOW, color: "#121212",
              padding: "12px 32px", borderRadius: 12, fontWeight: 700,
              fontSize: 15, textDecoration: "none",
            }}>Find people to follow</Link>
          </div>
        )}

        {/* For you — no posts yet */}
        {!isFollowing && posts.length === 0 && (
          <div style={{ padding: "60px 16px", textAlign: "center" }}>
            <img src="/bee.png" alt="" style={{ width: 80, height: "auto", margin: "0 auto 20px", display: "block", opacity: 0.5 }} />
            <p style={{ color: GREEN, fontSize: 16, marginBottom: 8, fontWeight: 600 }}>No posts yet</p>
            <p style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>Be the first to share your health journey</p>
            <Link href="/post/new" style={{
              display: "inline-block", background: YELLOW, color: "#121212",
              padding: "12px 32px", borderRadius: 12, fontWeight: 700,
              fontSize: 15, textDecoration: "none",
            }}>Share your story</Link>
          </div>
        )}

        {/* Posts list */}
        {posts.length > 0 && posts.map(post => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
}
