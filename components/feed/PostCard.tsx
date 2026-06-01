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
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function PostCard({ post }: { post: Post }) {
  const [valueUp, setValueUp] = useState(post.value_up);
  const [valueDown, setValueDown] = useState(post.value_down);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const supabase = createClient();

  const vote = async (type: "up" | "down") => {
    if (type === "up") {
      setValueUp(v => v + 1);
      await supabase.from("posts").update({ value_up: valueUp + 1 }).eq("id", post.id);
    } else {
      setValueDown(v => v + 1);
      await supabase.from("posts").update({ value_down: valueDown + 1 }).eq("id", post.id);
    }
  };

  const like = async () => {
    setLiked(l => !l);
    setLikes(l => liked ? l - 1 : l + 1);
  };

  const typeColors: Record<string, string> = {
    story: "#22c55e", question: "#3b82f6", tip: "var(--amber)", journal_highlight: "#a855f7",
  };

  return (
    <div className="card" style={{ padding: "16px" }}>
      {/* Author */}
      <div className="flex items-center gap-3 mb-3">
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "var(--bg3)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 14, color: "var(--amber)", fontWeight: 700,
          flexShrink: 0,
        }}>
          {post.profiles?.display_name?.[0]?.toUpperCase() || "?"}
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            {post.profiles?.display_name || "Anonymous"}
          </span>
          <span style={{ color: "var(--fg3)", fontSize: 12, marginLeft: 6 }}>
            @{post.profiles?.username} · {timeAgo(post.created_at)}
          </span>
        </div>
        {post.post_type && (
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
            color: typeColors[post.post_type] || "var(--fg3)",
            textTransform: "uppercase", background: "var(--bg3)",
            padding: "3px 8px", borderRadius: 100,
          }}>
            {post.post_type}
          </span>
        )}
      </div>

      {/* Content */}
      <Link href={`/post/${post.id}`} style={{ textDecoration: "none" }}>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--fg)", marginBottom: 12 }}>
          {post.content?.length > 280 ? post.content.slice(0, 280) + "..." : post.content}
        </p>
        {post.image_url && (
          <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 12,
            maxHeight: 200, background: "var(--bg3)" }}>
            <img src={post.image_url} alt="" style={{ width: "100%", objectFit: "cover", maxHeight: 200 }} />
          </div>
        )}
      </Link>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag) => (
            <span key={tag} style={{
              fontSize: 11, color: "var(--amber)", background: "rgba(245,166,35,0.1)",
              padding: "2px 8px", borderRadius: 100,
            }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4" style={{ marginTop: 4 }}>
        <div className="flex items-center gap-1">
          <button onClick={() => vote("up")} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--green)", fontSize: 18, padding: "2px 4px",
          }}>▲</button>
          <span style={{ fontSize: 13, color: "var(--fg2)", minWidth: 20, textAlign: "center" }}>
            {valueUp - valueDown}
          </span>
          <button onClick={() => vote("down")} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--red)", fontSize: 18, padding: "2px 4px",
          }}>▼</button>
        </div>

        <button onClick={like} style={{
          background: "none", border: "none", cursor: "pointer",
          color: liked ? "#ef4444" : "var(--fg3)", fontSize: 14, display: "flex",
          alignItems: "center", gap: 5,
        }}>
          {liked ? "♥" : "♡"} <span style={{ fontSize: 12 }}>{likes}</span>
        </button>

        <Link href={`/post/${post.id}`} style={{
          color: "var(--fg3)", fontSize: 14, textDecoration: "none",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          💬 <span style={{ fontSize: 12 }}>Reply</span>
        </Link>

        <span style={{ color: "var(--fg3)", fontSize: 12, marginLeft: "auto" }}>
          {post.views || 0} views
        </span>
      </div>
    </div>
  );
}
