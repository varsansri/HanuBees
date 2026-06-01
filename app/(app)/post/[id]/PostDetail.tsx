"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: { username: string; display_name: string };
}

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
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function PostDetail({ post, comments: initial }: { post: Post; comments: Comment[] }) {
  const [valueUp, setValueUp] = useState(post.value_up);
  const [valueDown, setValueDown] = useState(post.value_down);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(initial);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [voted, setVoted] = useState<"up"|"down"|null>(null);
  const supabase = createClient();
  const router = useRouter();

  const vote = async (type: "up"|"down") => {
    if (voted === type) return;
    const nu = type === "up" ? valueUp+1 : valueUp;
    const nd = type === "down" ? valueDown+1 : valueDown;
    setValueUp(nu); setValueDown(nd); setVoted(type);
    await supabase.from("posts").update({ value_up: nu, value_down: nd }).eq("id", post.id);
  };

  const like = () => {
    setLiked(l => !l);
    setLikes(l => liked ? l-1 : l+1);
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data } = await supabase
      .from("comments")
      .insert({ post_id: post.id, user_id: user.id, content: newComment.trim() })
      .select("*, profiles(username, display_name)")
      .single();
    if (data) setComments(c => [...c, data]);
    setNewComment("");
    setPosting(false);
  };

  const score = valueUp - valueDown;
  const initial_char = post.profiles?.display_name?.[0]?.toUpperCase() || "?";

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>

      {/* Header — yellow top accent */}
      <div className="page-header" style={{
        display: "flex", alignItems: "center", gap: 16, padding: "14px 16px",
      }}>
        <button onClick={() => router.back()} style={{
          background: "none", border: "none", cursor: "pointer", color: MUTED,
          display: "flex", alignItems: "center", padding: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span style={{ fontWeight: 700, fontSize: 17, color: "var(--fg)" }}>Post</span>
        <span style={{ marginLeft: "auto", fontSize: 13, color: MUTED }}>
          {comments.length} {comments.length === 1 ? "reply" : "replies"}
        </span>
      </div>

      {/* Original post */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", gap: 12 }}>

          {/* Avatar col */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 42, flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%", background: "var(--bg3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17, fontWeight: 700, color: "var(--fg)",
              }}>
                {initial_char}
              </div>
              <div style={{
                position: "absolute", bottom: -2, right: -2,
                width: 18, height: 18, borderRadius: "50%",
                background: YELLOW, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 12, fontWeight: 700,
                color: "#121212", border: "2px solid var(--bg)", lineHeight: 1, cursor: "pointer",
              }}>+</div>
            </div>
            {comments.length > 0 && <div className="thread-line" />}
          </div>

          <div style={{ flex: 1, paddingBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--fg)" }}>
                {post.profiles?.display_name}
              </span>
              {post.post_type && (
                <span style={{ fontSize: 11, fontWeight: 600, color: YELLOW,
                  textTransform: "uppercase", marginLeft: 8, letterSpacing: "0.06em" }}>
                  {post.post_type}
                </span>
              )}
            </div>
            <p style={{ color: MUTED, fontSize: 13, marginBottom: 14 }}>
              @{post.profiles?.username} · {timeAgo(post.created_at)}
            </p>

            <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--fg)", marginBottom: 14, wordBreak: "break-word" }}>
              {post.content}
            </p>

            {post.image_url && (
              <img src={post.image_url} alt="" style={{
                width: "100%", borderRadius: 12, marginBottom: 14,
                border: "1px solid var(--border)", display: "block",
              }} />
            )}

            {post.tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {post.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 14, color: YELLOW, fontWeight: 500 }}>#{tag}</span>
                ))}
              </div>
            )}

            {/* Actions — green bottom palette */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 4 }}>
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

              <button onClick={() => vote("up")} style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
                color: voted === "up" ? YELLOW : MUTED, padding: 0,
              }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
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
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              <span style={{ color: MUTED, fontSize: 13, marginLeft: "auto" }}>
                {post.views > 0 ? `${post.views} views` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {comments.map((comment, i) => (
        <div key={comment.id} style={{ padding: "12px 16px 0" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 42, flexShrink: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", background: "var(--bg3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "var(--fg)",
              }}>
                {comment.profiles?.display_name?.[0]?.toUpperCase() || "?"}
              </div>
              {i < comments.length - 1 && <div className="thread-line" />}
            </div>
            <div style={{ flex: 1, paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: "var(--fg)" }}>
                  {comment.profiles?.display_name}
                </span>
                <span style={{ color: MUTED, fontSize: 13 }}>· {timeAgo(comment.created_at)}</span>
              </div>
              <p style={{ fontSize: 15, color: "var(--fg)", lineHeight: 1.55 }}>{comment.content}</p>
            </div>
          </div>
          <div style={{ height: 1, background: "var(--border)", marginLeft: 54 }} />
        </div>
      ))}

      {/* Reply input — green bottom accent */}
      <div style={{
        position: "sticky", bottom: 80,
        background: "rgba(18,18,18,0.98)", backdropFilter: "blur(20px)",
        borderTop: `1px solid rgba(152,170,157,0.18)`,
        padding: "12px 16px",
        display: "flex", gap: 12, alignItems: "center",
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", background: "var(--bg3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "var(--fg)", flexShrink: 0,
        }}>H</div>
        <div style={{
          flex: 1, background: "var(--bg3)", borderRadius: 20,
          padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
          border: newComment ? `1px solid rgba(152,170,157,0.3)` : "1px solid transparent",
          transition: "border-color 0.2s",
        }}>
          <input
            placeholder="Reply…"
            value={newComment} onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && submitComment()}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "var(--fg)", fontSize: 15, fontFamily: "'Space Grotesk', sans-serif",
            }}
          />
          {newComment.trim() && (
            <button onClick={submitComment} disabled={posting} style={{
              background: "none", border: "none", cursor: "pointer",
              color: GREEN, fontWeight: 700, fontSize: 14,
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              {posting ? "…" : "Reply"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
