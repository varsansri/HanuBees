"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";
const BG     = "#121212";
const BG2    = "#1a1a1a";
const BG3    = "#242424";

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

/* ─── Smart image container: natural ratio, capped at 1:1 ─── */
function PostImage({ src }: { src: string }) {
  const [ratio, setRatio] = useState<number | null>(null);

  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      // clamp: landscape shows naturally, portrait capped at 1:1 (square)
      setRatio(Math.max(img.naturalWidth / img.naturalHeight, 1));
    }
  };

  // Before load: reserve space as square, then snap to real ratio
  const aspectRatio = ratio ?? 1;
  const paddingBottom = `${(1 / aspectRatio) * 100}%`;

  return (
    <div style={{
      position: "relative", width: "100%", paddingBottom,
      borderRadius: 14, overflow: "hidden",
      border: "1px solid rgba(234,234,234,0.08)",
      background: BG3,
      transition: "padding-bottom 0.15s ease",
    }}>
      <img
        src={src}
        alt=""
        onLoad={onLoad}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", display: "block",
        }}
      />
    </div>
  );
}

/* ─── Share sheet ─── */
function ShareSheet({ post, onClose }: { post: Post; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/post/${post.id}` : "";
  const initial = post.profiles?.display_name?.[0]?.toUpperCase() || "?";

  const copyLink = async () => {
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    await navigator.share({
      title: `${post.profiles?.display_name} on Hanubees`,
      text: post.content.slice(0, 120),
      url,
    }).catch(() => {});
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: BG2, borderRadius: "24px 24px 0 0",
        border: "1px solid rgba(234,234,234,0.08)", borderBottom: "none",
        padding: "12px 16px 40px",
        animation: "slideUp 0.22s ease",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: BG3, margin: "0 auto 20px" }} />

        {/* Share preview card */}
        <div style={{
          background: BG, border: "1px solid rgba(234,234,234,0.1)",
          borderRadius: 18, overflow: "hidden", marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px" }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%", background: BG3,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 700, color: "#eaeaea",
              border: "1.5px solid rgba(255,190,0,0.2)",
            }}>{initial}</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: "#eaeaea", fontFamily: "'Space Grotesk', sans-serif" }}>
                {post.profiles?.display_name || "Anonymous"}
              </p>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 1, fontFamily: "'Space Grotesk', sans-serif" }}>
                @{post.profiles?.username} · {timeAgo(post.created_at)}
              </p>
            </div>
            <img src="/bee.png" alt="Hanubees" style={{ height: 28, width: "auto", marginLeft: "auto", opacity: 0.85 }} />
          </div>

          <p style={{
            fontSize: 14, lineHeight: 1.6, color: "#eaeaea",
            padding: "0 16px 14px", wordBreak: "break-word",
            fontFamily: "'Space Grotesk', sans-serif",
            display: "-webkit-box", WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {post.content}
          </p>

          {post.tags?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 16px 14px" }}>
              {post.tags.slice(0, 4).map(t => (
                <span key={t} style={{ fontSize: 13, color: GREEN, fontWeight: 500, fontFamily: "'Space Grotesk', sans-serif" }}>#{t}</span>
              ))}
            </div>
          )}

          <div style={{
            borderTop: "1px solid rgba(234,234,234,0.06)", padding: "10px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 12, color: MUTED, fontFamily: "'Space Grotesk', sans-serif" }}>hanubees.com</span>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: YELLOW }} />
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN }} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={copyLink} style={{
            flex: 1, padding: "13px", borderRadius: 14,
            background: BG3, border: "1px solid rgba(234,234,234,0.08)",
            color: copied ? GREEN : "#eaeaea",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "color 0.2s",
          }}>
            {copied ? (
              <><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Copied</>
            ) : (
              <><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy link</>
            )}
          </button>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button onClick={nativeShare} style={{
              flex: 1, padding: "13px", borderRadius: 14,
              background: YELLOW, border: "none", color: BG,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Share
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }`}</style>
    </div>
  );
}

/* ─── Main PostCard ─── */
export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked]     = useState(false);
  const [likes, setLikes]     = useState(post.likes);
  const [valueUp, setValueUp] = useState(post.value_up);
  const [valueDown, setValueDown] = useState(post.value_down);
  const [voted, setVoted]     = useState<"up"|"down"|null>(null);
  const [shareOpen, setShareOpen] = useState(false);
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

  const score    = valueUp - valueDown;
  const initial  = post.profiles?.display_name?.[0]?.toUpperCase() || "?";
  const hasImage = !!post.image_url;

  // Text lines: 3 when image present (keeps card compact), 6 when no image
  const textLines = hasImage ? 3 : 6;

  return (
    <>
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", gap: 12 }}>

          {/* Avatar column */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 42, flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: BG3, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 17, fontWeight: 700, color: "#eaeaea",
              }}>
                {initial}
              </div>
              <Link href={`/profile/${post.profiles?.username}`} style={{
                position: "absolute", bottom: -2, right: -2,
                width: 18, height: 18, borderRadius: "50%",
                background: YELLOW, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 12, fontWeight: 700,
                color: BG, border: `2px solid ${BG}`, lineHeight: 1, textDecoration: "none",
              }}>+</Link>
            </div>
            <div style={{ width: 2, flex: 1, minHeight: 24, background: BG3, borderRadius: 2, marginTop: 6 }} />
          </div>

          {/* Content column */}
          <div style={{ flex: 1, minWidth: 0, paddingBottom: 12 }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <Link href={`/profile/${post.profiles?.username}`} style={{ textDecoration: "none" }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#eaeaea" }}>
                  {post.profiles?.display_name || "Anonymous"}
                </span>
              </Link>
              <span style={{ color: MUTED, fontSize: 13, marginLeft: 8 }}>
                {timeAgo(post.created_at)}
              </span>
              <button style={{
                marginLeft: "auto", background: "none", border: "none",
                color: MUTED, cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 4px",
              }}>···</button>
            </div>

            {/* Text — line-clamped, clearly readable */}
            <Link href={`/post/${post.id}`} style={{ textDecoration: "none" }}>
              <p style={{
                fontSize: 15, lineHeight: 1.65, color: "#eaeaea",
                wordBreak: "break-word", marginBottom: 10,
                display: "-webkit-box",
                WebkitLineClamp: textLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {post.content}
              </p>
            </Link>

            {/* Image — natural ratio, max 1:1 */}
            {hasImage && (
              <Link href={`/post/${post.id}`} style={{ textDecoration: "none", display: "block", marginBottom: 10 }}>
                <PostImage src={post.image_url!} />
              </Link>
            )}

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                {post.tags.map(t => (
                  <span key={t} style={{ fontSize: 13, color: GREEN, fontWeight: 500 }}>#{t}</span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 8 }}>

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

              <Link href={`/post/${post.id}`} style={{
                display: "flex", alignItems: "center", gap: 6,
                color: MUTED, textDecoration: "none",
              }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </Link>

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

              <button onClick={() => setShareOpen(true)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: MUTED, display: "flex", alignItems: "center",
                marginLeft: "auto", padding: 0,
              }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(234,234,234,0.07)", marginLeft: 54 }} />
      </div>

      {shareOpen && <ShareSheet post={post} onClose={() => setShareOpen(false)} />}
    </>
  );
}
