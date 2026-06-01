"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Profile {
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

interface Post {
  id: string;
  content: string;
  post_type: string;
  value_up: number;
  value_down: number;
  likes: number;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [journalCount, setJournalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const [{ data: profile }, { data: posts }, { count }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("posts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("journal_entries").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

    setProfile(profile);
    setPosts(posts || []);
    setJournalCount(count || 0);
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const typeColors: Record<string, string> = {
    story: "#22c55e", question: "#3b82f6", tip: "var(--amber)", journal_highlight: "#a855f7",
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <p style={{ color: "var(--fg3)" }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>
      {/* Header */}
      <div style={{ paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="font-brand" style={{ fontSize: 22, color: "var(--amber)" }}>Profile</h2>
        <button onClick={signOut} className="btn-ghost" style={{ fontSize: 13, padding: "8px 16px" }}>
          Sign Out
        </button>
      </div>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: 16, textAlign: "center", padding: 28 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "var(--bg3)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 28, color: "var(--amber)",
          fontWeight: 700, margin: "0 auto 12px",
        }}>
          {profile?.display_name?.[0]?.toUpperCase() || "?"}
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>{profile?.display_name}</h3>
        <p style={{ color: "var(--fg3)", fontSize: 13, marginTop: 2 }}>@{profile?.username}</p>
        {profile?.bio && (
          <p style={{ color: "var(--fg2)", fontSize: 14, marginTop: 10, lineHeight: 1.5 }}>{profile.bio}</p>
        )}

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 20 }}>
          {[
            ["Posts", posts.length],
            ["Journal Logs", journalCount],
            ["Member since", new Date(profile?.created_at || "").toLocaleDateString("en-US", { month: "short", year: "numeric" })],
          ].map(([label, value]) => (
            <div key={label as string} style={{ textAlign: "center" }}>
              <div className="font-brand" style={{ fontSize: 18, color: "var(--amber)" }}>{value}</div>
              <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <h3 style={{ fontSize: 13, color: "var(--fg3)", fontWeight: 600,
        letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
        Your Posts
      </h3>

      {posts.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <p style={{ color: "var(--fg3)", fontSize: 14 }}>No posts yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map((post) => (
            <div key={post.id} className="card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: typeColors[post.post_type] || "var(--fg3)",
                  background: "var(--bg3)", padding: "2px 8px", borderRadius: 100,
                }}>{post.post_type}</span>
                <span style={{ fontSize: 11, color: "var(--fg3)", marginLeft: "auto" }}>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontSize: 14, color: "var(--fg)", lineHeight: 1.5 }}>
                {post.content.length > 120 ? post.content.slice(0, 120) + "..." : post.content}
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <span style={{ fontSize: 12, color: "var(--fg3)" }}>▲ {post.value_up - post.value_down}</span>
                <span style={{ fontSize: 12, color: "var(--fg3)" }}>♥ {post.likes}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
