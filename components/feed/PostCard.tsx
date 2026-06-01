"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Post {
  id: string;
  content: string;
  image_url?: string;
  post_type: string;
  tags: string[];
  value_up: number;
  value_down: number;
  likes: number;
  views: number;
  created_at: string;
  profiles: { username: string; display_name: string; avatar_url?: string };
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TYPE_COLORS: Record<string, string> = {
  story: "#22c55e", question: "#3b82f6", tip: "#f5a623", journal_highlight: "#a855f7",
};

export default function PostCard({ post, showThread = false }: { post: Post; showThread?: boolean }) {
  const [valueUp, setValueUp] = useState(post.value_up);
  const [valueDown, setValueDown] = useState(post.value_down);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const supabase = createClient();

  const vote = async (type: "up" | "down") => {
    if (voted === type) return;
    const newUp = type === "up" ? valueUp + 1 : valueUp;
    const newDown = type === "down" ? valueDown + 1 : valueDown;
    setValueUp(newUp); setValueDown(newDown); setVoted(type);
    await supabase.from("posts").update({ value_up: newUp, value_down: newDown }).eq("id", post.id);
  };

  const like = async () => {
    const newLiked = !liked;
    const newLikes = newLiked ? likes + 1 : likes - 1;
    setLiked(newLiked); setLikes(newLikes);
    await supabase.from("posts").update({ likes: newLikes }).eq("id", post.id);
  };

  const score = valueUp - valueDown;
  const initial = post.profiles?.display_name?.[0]?.toUpperCase() || "?";

  return (
    <div style={{ padding: "14px 16px 0" }}>
      <div style={{ display: "flex", gap: 12 }}>
        {/* Left: avatar + thread line */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 38, flexShrink: 0 }}>
          <div className="avatar" style={{ width: 38, height: 38, fontSize: 15 }}>
            {initial}
          </div>
          {showThread && <div className="thread-line" />}
        </div>

        {/* Right: content */}
        <div style={{ flex: 1, minWidth: 0, paddingBottom: 14 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              {post.profiles?.display_name || "Anonymous"}
            </span>
            {post.post_type && post.post_type !== "story" && (
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                color: TYPE_COLORS[post.post_type] || "var(--fg3)",
                textTransform: "uppercase",
              }}>· {post.post_type}</span>
            )}
            <span style={{ color: "var(--fg3)", fontSize: 14, marginLeft: "auto", flexShrink: 0 }}>
              {timeAgo(post.created_at)}
            </span>
          </div>

          {/* Username */}
          <p style={{ color: "var(--fg2)", fontSize: 13, marginBottom: 8 }}>
            @{post.profiles?.username}
          </p>

          {/* Content */}
          <Link href={`/post/${post.id}`} style={{ textDecoration: "none" }}>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--fg)", marginBottom: 10, wordBreak: "break-word" }}>
              {post.content?.length > 300 ? post.content.slice(0, 300) + "…" : post.content}
            </p>

            {post.image_url && (
              <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 10,
                border: "1px solid var(--border)" }}>
                <img src={post.image_url} alt="" style={{ width: "100%", maxHeight: 280, objectFit: "cover" }} />
              </div>
            )}
          </Link>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {post.tags.map(tag => (
                <span key={tag} style={{ fontSize: 14, color: "var(--amber)" }}>#{tag}</span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
            {/* Like */}
            <button className="action-btn" onClick={like} style={{ color: liked ? "#ef4444" : "var(--fg2)", marginRight: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24"
                fill={liked ? "#ef4444" : "none"}
                stroke={liked ? "#ef4444" : "currentColor"}
                strokeWidth="2" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {likes > 0 && <span>{likes}</span>}
            </button>

            {/* Comment */}
            <Link href={`/post/${post.id}`} className="action-btn" style={{ marginRight: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </Link>

            {/* Value up */}
            <button className="action-btn" onClick={() => vote("up")}
              style={{ color: voted === "up" ? "var(--green)" : "var(--fg2)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
              {score !== 0 && <span style={{ color: score > 0 ? "var(--green)" : "var(--red)" }}>{score}</span>}
            </button>

            {/* Value down */}
            <button className="action-btn" onClick={() => vote("down")}
              style={{ color: voted === "down" ? "var(--red)" : "var(--fg2)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Views */}
            <span style={{ color: "var(--fg3)", fontSize: 13, marginLeft: "auto" }}>
              {post.views > 0 ? `${post.views} views` : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="post-divider" />
    </div>
  );
}
