"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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

const TYPE_COLORS: Record<string, string> = {
  story: "#22c55e", question: "#3b82f6", tip: "#f5a623", journal_highlight: "#a855f7",
};

export default function PostDetail({ post, comments: initial }: { post: Post; comments: Comment[] }) {
  const [valueUp, setValueUp] = useState(post.value_up);
  const [valueDown, setValueDown] = useState(post.value_down);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(initial);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const vote = async (type: "up" | "down") => {
    if (voted === type) return;
    const newUp = type === "up" ? valueUp + 1 : valueUp;
    const newDown = type === "down" ? valueDown + 1 : valueDown;
    setValueUp(newUp); setValueDown(newDown); setVoted(type);
    await supabase.from("posts").update({ value_up: newUp, value_down: newDown }).eq("id", post.id);
  };

  const like = () => {
    setLiked(l => !l);
    setLikes(l => liked ? l - 1 : l + 1);
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

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(16,16,16,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 16, padding: "14px 16px",
      }}>
        <button onClick={() => router.back()} style={{
          background: "none", border: "none", cursor: "pointer", color: "var(--fg)",
          display: "flex", alignItems: "center",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span style={{ fontWeight: 700, fontSize: 17 }}>Post</span>
      </div>

      {/* Original post */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 38, flexShrink: 0 }}>
            <div className="avatar" style={{ width: 38, height: 38, fontSize: 15 }}>
              {post.profiles?.display_name?.[0]?.toUpperCase() || "?"}
            </div>
            {comments.length > 0 && <div className="thread-line" />}
          </div>

          <div style={{ flex: 1, paddingBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{post.profiles?.display_name}</span>
              {post.post_type && (
                <span style={{ fontSize: 11, fontWeight: 600, color: TYPE_COLORS[post.post_type] || "var(--fg3)", textTransform: "uppercase" }}>
                  · {post.post_type}
                </span>
              )}
            </div>
            <p style={{ color: "var(--fg2)", fontSize: 13, marginBottom: 12 }}>
              @{post.profiles?.username} · {timeAgo(post.created_at)}
            </p>

            <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--fg)", marginBottom: 14, wordBreak: "break-word" }}>
              {post.content}
            </p>

            {post.image_url && (
              <img src={post.image_url} alt="" style={{
                width: "100%", borderRadius: 12, marginBottom: 14,
                border: "1px solid var(--border)",
              }} />
            )}

            {post.tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {post.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 15, color: "var(--amber)" }}>#{tag}</span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button className="action-btn" onClick={like}
                style={{ color: liked ? "#ef4444" : "var(--fg2)", marginRight: 4 }}>
                <svg width="22" height="22" viewBox="0 0 24 24"
                  fill={liked ? "#ef4444" : "none"} stroke={liked ? "#ef4444" : "currentColor"}
                  strokeWidth="2" strokeLinecap="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {likes > 0 && <span>{likes}</span>}
              </button>

              <button className="action-btn" onClick={() => vote("up")}
                style={{ color: voted === "up" ? "var(--green)" : "var(--fg2)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
                {score !== 0 && <span style={{ color: score > 0 ? "var(--green)" : "var(--red)" }}>{score}</span>}
              </button>

              <button className="action-btn" onClick={() => vote("down")}
                style={{ color: voted === "down" ? "var(--red)" : "var(--fg2)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              <span style={{ color: "var(--fg3)", fontSize: 13, marginLeft: "auto" }}>
                {post.views} views · {comments.length} replies
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      {comments.map((comment, i) => (
        <div key={comment.id} style={{ padding: "12px 16px 0" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 38, flexShrink: 0 }}>
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                {comment.profiles?.display_name?.[0]?.toUpperCase() || "?"}
              </div>
              {i < comments.length - 1 && <div className="thread-line" />}
            </div>
            <div style={{ flex: 1, paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{comment.profiles?.display_name}</span>
                <span style={{ color: "var(--fg3)", fontSize: 13 }}>· {timeAgo(comment.created_at)}</span>
              </div>
              <p style={{ fontSize: 15, color: "var(--fg)", lineHeight: 1.5 }}>{comment.content}</p>
            </div>
          </div>
          <div className="post-divider" style={{ marginLeft: 50 }} />
        </div>
      ))}

      {/* Reply input */}
      <div style={{
        position: "sticky", bottom: 80, background: "var(--bg)",
        borderTop: "1px solid var(--border)", padding: "12px 16px",
        display: "flex", gap: 12, alignItems: "flex-end",
      }}>
        <div className="avatar" style={{ width: 32, height: 32, fontSize: 13, flexShrink: 0 }}>
          H
        </div>
        <div style={{ flex: 1, background: "var(--bg3)", borderRadius: 20, padding: "10px 16px",
          display: "flex", alignItems: "center", gap: 8 }}>
          <input
            placeholder="Reply..."
            value={newComment} onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && submitComment()}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "var(--fg)", fontSize: 15, fontFamily: "Inter, sans-serif",
            }}
          />
          {newComment.trim() && (
            <button onClick={submitComment} disabled={posting}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--amber)", fontWeight: 700, fontSize: 14,
                fontFamily: "Inter, sans-serif",
              }}>
              {posting ? "..." : "Post"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
