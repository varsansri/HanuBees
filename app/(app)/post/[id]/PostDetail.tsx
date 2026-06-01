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
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const typeColors: Record<string, string> = {
  story: "#22c55e", question: "#3b82f6", tip: "var(--amber)", journal_highlight: "#a855f7",
};

export default function PostDetail({ post, comments: initialComments }: { post: Post; comments: Comment[] }) {
  const [valueUp, setValueUp] = useState(post.value_up);
  const [valueDown, setValueDown] = useState(post.value_down);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const vote = async (type: "up" | "down") => {
    if (type === "up") {
      setValueUp(v => v + 1);
      await supabase.from("posts").update({ value_up: valueUp + 1 }).eq("id", post.id);
    } else {
      setValueDown(v => v + 1);
      await supabase.from("posts").update({ value_down: valueDown + 1 }).eq("id", post.id);
    }
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

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>
      {/* Back */}
      <button onClick={() => router.back()} className="btn-ghost"
        style={{ marginBottom: 16, marginTop: 8, padding: "8px 14px", fontSize: 14 }}>
        ← Back
      </button>

      {/* Post */}
      <div className="card" style={{ marginBottom: 16 }}>
        {/* Author */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", background: "var(--bg3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "var(--amber)", fontWeight: 700, flexShrink: 0,
          }}>
            {post.profiles?.display_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{post.profiles?.display_name}</div>
            <div style={{ color: "var(--fg3)", fontSize: 12 }}>
              @{post.profiles?.username} · {timeAgo(post.created_at)}
            </div>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
            color: typeColors[post.post_type] || "var(--fg3)",
            background: "var(--bg3)", padding: "3px 10px", borderRadius: 100,
          }}>
            {post.post_type}
          </span>
        </div>

        {/* Content */}
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--fg)", marginBottom: 16 }}>
          {post.content}
        </p>

        {post.image_url && (
          <img src={post.image_url} alt="" style={{
            width: "100%", borderRadius: 10, marginBottom: 16, objectFit: "cover",
          }} />
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {post.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 12, color: "var(--amber)", background: "rgba(245,166,35,0.1)",
                padding: "3px 10px", borderRadius: 100,
              }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 12,
          borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={() => vote("up")} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--green)", fontSize: 20, padding: "2px 6px",
            }}>▲</button>
            <span style={{ fontSize: 14, color: "var(--fg2)", minWidth: 24, textAlign: "center" }}>
              {valueUp - valueDown}
            </span>
            <button onClick={() => vote("down")} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--red)", fontSize: 20, padding: "2px 6px",
            }}>▼</button>
          </div>

          <button onClick={like} style={{
            background: "none", border: "none", cursor: "pointer",
            color: liked ? "#ef4444" : "var(--fg3)", fontSize: 15,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {liked ? "♥" : "♡"} {likes}
          </button>

          <span style={{ color: "var(--fg3)", fontSize: 13, marginLeft: "auto" }}>
            {post.views} views · {comments.length} replies
          </span>
        </div>
      </div>

      {/* Comments */}
      <h3 style={{ fontSize: 13, color: "var(--fg3)", fontWeight: 600,
        letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
        Replies ({comments.length})
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {comments.map(comment => (
          <div key={comment.id} className="card" style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", background: "var(--bg3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: "var(--amber)", fontWeight: 700, flexShrink: 0,
              }}>
                {comment.profiles?.display_name?.[0]?.toUpperCase() || "?"}
              </div>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{comment.profiles?.display_name}</span>
              <span style={{ color: "var(--fg3)", fontSize: 11 }}>{timeAgo(comment.created_at)}</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--fg)", lineHeight: 1.5, paddingLeft: 36 }}>
              {comment.content}
            </p>
          </div>
        ))}
        {comments.length === 0 && (
          <p style={{ color: "var(--fg3)", fontSize: 14, textAlign: "center", padding: 20 }}>
            No replies yet. Be the first.
          </p>
        )}
      </div>

      {/* Add comment */}
      <div className="card" style={{ padding: 16 }}>
        <textarea className="input" placeholder="Share your experience or reply..."
          value={newComment} onChange={e => setNewComment(e.target.value)}
          rows={3} style={{ resize: "none", marginBottom: 10 }} />
        <button className="btn-primary" onClick={submitComment}
          disabled={!newComment.trim() || posting}>
          {posting ? "Posting..." : "Reply"}
        </button>
      </div>
    </div>
  );
}
