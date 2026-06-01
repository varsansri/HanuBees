"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";
const BG2    = "#1a1a1a";
const BG3    = "#242424";
const FG     = "#eaeaea";

interface Profile {
  id: string; username: string; display_name: string;
  bio: string; avatar_url: string; created_at: string;
}
interface Post {
  id: string; content: string; post_type: string;
  value_up: number; value_down: number; likes: number; created_at: string;
}

export default function ProfileClient({ username }: { username: string }) {
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [posts, setPosts]             = useState<Post[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [notFound, setNotFound]       = useState(false);
  const supabase = createClient();
  const router   = useRouter();

  useEffect(() => { load(); }, [username]);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (!p) { setNotFound(true); setLoading(false); return; }

    if (user && p.id === user.id) { router.replace("/profile"); return; }

    const [{ data: userPosts }, { count: followers }, { count: following }, { data: followRow }] = await Promise.all([
      supabase.from("posts").select("*").eq("user_id", p.id).order("created_at", { ascending: false }),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", p.id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", p.id),
      user
        ? supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", p.id).single()
        : Promise.resolve({ data: null }),
    ]);

    setProfile(p);
    setPosts(userPosts || []);
    setFollowerCount(followers || 0);
    setFollowingCount(following || 0);
    setIsFollowing(!!followRow);
    setLoading(false);
  };

  const toggleFollow = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    if (!profile) return;
    setFollowLoading(true);

    if (isFollowing) {
      await supabase.from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", profile.id);
      setIsFollowing(false);
      setFollowerCount(c => c - 1);
      posthog.capture("user_unfollowed", { target_username: username });
      (window as any).umami?.track("unfollow");
    } else {
      await supabase.from("follows")
        .insert({ follower_id: user.id, following_id: profile.id });
      setIsFollowing(true);
      setFollowerCount(c => c + 1);
      posthog.capture("user_followed", { target_username: username });
      (window as any).umami?.track("follow");
    }
    setFollowLoading(false);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <p style={{ color: MUTED }}>Loading…</p>
    </div>
  );

  if (notFound) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh", gap: 16 }}>
      <p style={{ color: FG, fontSize: 18, fontWeight: 700 }}>User not found</p>
      <Link href="/feed" style={{ color: GREEN, fontSize: 14, textDecoration: "none" }}>← Back to feed</Link>
    </div>
  );

  const initial = profile?.display_name?.[0]?.toUpperCase() || "?";

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>

      <div className="page-header" style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, display: "flex", alignItems: "center", padding: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span style={{ fontWeight: 700, fontSize: 17, color: FG }}>@{profile?.username}</span>
      </div>

      <div style={{ padding: "16px" }}>

        <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 20, padding: "24px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{
              width: 68, height: 68, borderRadius: "50%", background: BG3,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, color: YELLOW, fontWeight: 700,
              border: "2px solid rgba(255,190,0,0.2)",
            }}>
              {initial}
            </div>

            <button onClick={toggleFollow} disabled={followLoading} style={{
              background: isFollowing ? "transparent" : GREEN,
              border: isFollowing ? `1px solid rgba(234,234,234,0.15)` : "none",
              borderRadius: 12, padding: "9px 22px",
              color: isFollowing ? MUTED : "#121212",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "all 0.2s", letterSpacing: "0.01em",
            }}>
              {followLoading ? "…" : isFollowing ? "Following" : "Follow"}
            </button>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 700, color: FG, marginBottom: 2 }}>
            {profile?.display_name}
          </h3>
          <p style={{ color: MUTED, fontSize: 13, marginBottom: profile?.bio ? 10 : 0 }}>
            @{profile?.username}
          </p>
          {profile?.bio && (
            <p style={{ fontSize: 14, color: FG, lineHeight: 1.55, marginBottom: 10 }}>{profile.bio}</p>
          )}

          <div style={{ display: "flex", gap: 24, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(234,234,234,0.07)" }}>
            {[
              ["Posts", posts.length],
              ["Followers", followerCount],
              ["Following", followingCount],
            ].map(([label, val]) => (
              <div key={label as string}>
                <p style={{ fontSize: 18, fontWeight: 800, color: YELLOW, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>{val}</p>
                <p style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Posts</p>

        {posts.length === 0 ? (
          <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 16, padding: 40, textAlign: "center" }}>
            <p style={{ color: MUTED, fontSize: 14 }}>No posts yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {posts.map(post => (
              <Link key={post.id} href={`/post/${post.id}`} style={{ textDecoration: "none" }}>
                <div style={{ background: BG2, border: "1px solid rgba(234,234,234,0.08)", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                      color: YELLOW, background: "rgba(255,190,0,0.1)", padding: "3px 8px", borderRadius: 100,
                    }}>{post.post_type}</span>
                    <span style={{ fontSize: 11, color: MUTED, marginLeft: "auto" }}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: FG, lineHeight: 1.55, marginBottom: 10 }}>
                    {post.content.length > 140 ? post.content.slice(0, 140) + "…" : post.content}
                  </p>
                  <div style={{ display: "flex", gap: 14 }}>
                    <span style={{ fontSize: 12, color: GREEN }}>▲ {post.value_up - post.value_down}</span>
                    <span style={{ fontSize: 12, color: MUTED }}>♥ {post.likes}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
