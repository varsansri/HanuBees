"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";

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
  return `${Math.floor(h / 24)}d`;
}

export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [valueUp, setValueUp] = useState(post.value_up);
  const [valueDown, setValueDown] = useState(post.value_down);
  const [voted, setVoted] = useState<"up"|"down"|null>(null);
  const supabase = createClient();

  const like = async () => {
    const n = !liked; setLiked(n); setLikes(l => n ? l+1 : l-1);
    await supabase.from("posts").update({ likes: n ? likes+1 : likes-1 }).eq("id", post.id);
  };

  const vote = async (type: "up"|"down") => {
    if (voted === type) return;
    const nu = type==="up" ? valueUp+1 : valueUp;
    const nd = type==="down" ? valueDown+1 : valueDown;
    setValueUp(nu); setValueDown(nd); setVoted(type);
    await supabase.from("posts").update({ value_up: nu, value_down: nd }).eq("id", post.id);
  };

  const score = valueUp - valueDown;
  const initial = post.profiles?.display_name?.[0]?.toUpperCase() || "?";

  return (
    <div style={{ padding: "14px 16px 0" }}>
      <div style={{ display: "flex", gap: 12 }}>

        {/* Avatar col */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 42, flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "var(--bg3)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 17, fontWeight: 700, color: "var(--fg)",
            }}>
              {initial}
            </div>
            <div style={{
              position: "absolute", bottom: -2, right: -2,
              width: 18, height: 18, borderRadius: "50%",
              background: YELLOW, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 12, fontWeight: 700,
              color: "#121212", border: "2px solid var(--bg)", lineHeight: 1,
              cursor: "pointer",
            }}>+</div>
          </div>
          <div style={{ width: 2, flex: 1, minHeight: 24, background: "var(--bg3)", borderRadius: 2, marginTop: 6 }} />
        </div>

        {/* Content col */}
        <div style={{ flex: 1, minWidth: 0, paddingBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--fg)" }}>
              {post.profiles?.display_name || "Anonymous"}
            </span>
            <span style={{ color: MUTED, fontSize: 13, marginLeft: 8 }}>
              {timeAgo(post.created_at)}
            </span>
            <button style={{
              marginLeft: "auto", background: "none", border: "none",
              color: MUTED, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 2px",
            }}>···</button>
          </div>

          <Link href={`/post/${post.id}`} style={{ textDecoration: "none" }}>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--fg)", marginBottom: post.image_url || post.tags?.length ? 10 : 0, wordBreak: "break-word" }}>
              {post.content?.length > 320 ? post.content.slice(0, 320) + "…" : post.content}
            </p>
            {post.image_url && (
              <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 10, border: "1px solid var(--border)" }}>
                <img src={post.image_url} alt="" style={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block" }} />
              </div>
            )}
          </Link>

          {post.tags?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {post.tags.map(t => (
                <span key={t} style={{ fontSize: 14, color: GREEN, fontWeight: 500 }}>#{t}</span>
              ))}
            </div>
          )}

          {/* Action row — green palette (bottom half of card) */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 10 }}>

            {/* Like */}
            <button onClick={like} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              color: liked ? GREEN : MUTED, padding: 0,
            }}>
              <svg width="21" height="21" viewBox="0 0 24 24"
                fill={liked ? GREEN : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {likes > 0 && <span style={{ fontSize: 13, fontWeight: 500 }}>{likes}</span>}
            </button>

            {/* Comment */}
            <Link href={`/post/${post.id}`} style={{
              display: "flex", alignItems: "center", gap: 6,
              color: MUTED, textDecoration: "none",
            }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </Link>

            {/* Value score */}
            <button onClick={() => vote("up")} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
              color: voted === "up" ? YELLOW : MUTED, padding: 0,
            }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
              {score !== 0 && (
                <span style={{ fontSize: 13, fontWeight: 600, color: score > 0 ? YELLOW : MUTED }}>
                  {Math.abs(score)}
                </span>
              )}
            </button>

            <button onClick={() => vote("down")} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center",
              color: voted === "down" ? GREEN : MUTED, padding: 0,
            }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Share */}
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              color: MUTED, display: "flex", alignItems: "center", marginLeft: "auto", padding: 0,
            }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", marginLeft: 54 }} />
    </div>
  );
}
