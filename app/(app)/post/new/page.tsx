"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";

const POST_TYPES = [
  { value: "story",            label: "Story" },
  { value: "tip",              label: "Tip" },
  { value: "question",         label: "Question" },
  { value: "journal_highlight",label: "Highlight" },
];

export default function NewPostPage() {
  const [type, setType] = useState("story");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const tagArray = tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
    const { error: postError } = await supabase.from("posts").insert({
      user_id: user.id, content: content.trim(), post_type: type,
      tags: tagArray, value_up: 0, value_down: 0, likes: 0, views: 0,
    });
    if (postError) { setError(postError.message); setLoading(false); return; }
    router.push("/feed");
  };

  const ready = content.trim().length > 0;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", minHeight: "100vh" }}>

      {/* Header — yellow top */}
      <div className="page-header" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px",
      }}>
        <button onClick={() => router.back()} style={{
          background: "none", border: "none", color: MUTED, fontSize: 15,
          cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500,
        }}>
          Cancel
        </button>
        <span style={{ fontWeight: 700, fontSize: 16, color: "var(--fg)" }}>New post</span>
        <button onClick={submit} disabled={!ready || loading} style={{
          background: ready ? YELLOW : "var(--bg3)",
          color: ready ? "#121212" : MUTED,
          border: "none", borderRadius: 20, padding: "8px 22px",
          fontWeight: 700, fontSize: 14, cursor: ready ? "pointer" : "default",
          fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.15s",
          letterSpacing: "0.01em",
        }}>
          {loading ? "Posting…" : "Post"}
        </button>
      </div>

      <div style={{ padding: "20px 16px" }}>

        {/* Post type chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {POST_TYPES.map(t => {
            const active = type === t.value;
            return (
              <button key={t.value} onClick={() => setType(t.value)} style={{
                padding: "7px 18px", borderRadius: 20,
                border: active ? "none" : "1px solid var(--border)",
                cursor: "pointer",
                background: active ? YELLOW : "transparent",
                color: active ? "#121212" : MUTED,
                fontWeight: 600, fontSize: 13,
                fontFamily: "'Space Grotesk', sans-serif",
                transition: "all 0.15s",
                letterSpacing: "0.01em",
              }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Composer */}
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: "var(--bg3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: "var(--fg)", flexShrink: 0,
            border: `1.5px solid rgba(255,190,0,0.2)`,
          }}>H</div>
          <div style={{ flex: 1 }}>
            <textarea
              placeholder="Share your health experience, tip, or question…"
              value={content} onChange={e => setContent(e.target.value)}
              autoFocus
              style={{
                width: "100%", background: "none", border: "none", outline: "none",
                color: "var(--fg)", fontSize: 16, lineHeight: 1.65, resize: "none",
                fontFamily: "'Space Grotesk', sans-serif", minHeight: 160,
              }}
            />
            <div style={{ height: 1, background: "var(--border)", margin: "14px 0" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: GREEN, fontSize: 15, fontWeight: 500 }}>#</span>
              <input
                placeholder="add tags: diabetes, sleep, supplements…"
                value={tags} onChange={e => setTags(e.target.value)}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: MUTED, fontSize: 14,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              />
            </div>
          </div>
        </div>

        {error && (
          <p style={{ color: GREEN, fontSize: 13, marginTop: 16 }}>{error}</p>
        )}

        {/* Char count */}
        {content.length > 0 && (
          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <span style={{
              fontSize: 13, color: content.length > 900 ? YELLOW : MUTED,
            }}>{content.length}/1000</span>
          </div>
        )}
      </div>
    </div>
  );
}
