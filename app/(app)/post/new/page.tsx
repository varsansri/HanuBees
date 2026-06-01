"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const POST_TYPES = [
  { value: "story", label: "Story" },
  { value: "tip", label: "Tip" },
  { value: "question", label: "Question" },
  { value: "journal_highlight", label: "Highlight" },
];

const TYPE_COLORS: Record<string, string> = {
  story: "#22c55e", tip: "#f5a623", question: "#3b82f6", journal_highlight: "#a855f7",
};

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
    setLoading(true);
    setError("");
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

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, background: "var(--bg)", zIndex: 40,
      }}>
        <button onClick={() => router.back()} style={{
          background: "none", border: "none", color: "var(--fg)", fontSize: 16,
          cursor: "pointer", fontFamily: "Inter, sans-serif", padding: "4px 0",
        }}>
          Cancel
        </button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>New post</span>
        <button onClick={submit} disabled={!content.trim() || loading}
          style={{
            background: content.trim() ? "var(--fg)" : "var(--bg3)",
            color: content.trim() ? "var(--bg)" : "var(--fg3)",
            border: "none", borderRadius: 20, padding: "8px 20px",
            fontWeight: 700, fontSize: 14, cursor: content.trim() ? "pointer" : "default",
            fontFamily: "Inter, sans-serif", transition: "all 0.15s",
          }}>
          {loading ? "Posting..." : "Post"}
        </button>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Post type chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {POST_TYPES.map(t => (
            <button key={t.value} onClick={() => setType(t.value)}
              style={{
                padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer",
                background: type === t.value ? TYPE_COLORS[t.value] : "var(--bg3)",
                color: type === t.value ? "#000" : "var(--fg2)",
                fontWeight: 600, fontSize: 13, fontFamily: "Inter, sans-serif",
                transition: "all 0.15s",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Composer */}
        <div style={{ display: "flex", gap: 12 }}>
          <div className="avatar" style={{ width: 38, height: 38, fontSize: 15, flexShrink: 0 }}>
            H
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              placeholder="Share your health experience, tip, or question..."
              value={content} onChange={e => setContent(e.target.value)}
              autoFocus
              style={{
                width: "100%", background: "none", border: "none", outline: "none",
                color: "var(--fg)", fontSize: 16, lineHeight: 1.6, resize: "none",
                fontFamily: "Inter, sans-serif", minHeight: 140,
              }}
            />

            <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />

            <input
              placeholder="Add tags: diabetes, insulin, supplements..."
              value={tags} onChange={e => setTags(e.target.value)}
              style={{
                width: "100%", background: "none", border: "none", outline: "none",
                color: "var(--fg2)", fontSize: 14, fontFamily: "Inter, sans-serif",
              }}
            />
          </div>
        </div>

        {error && <p style={{ color: "var(--red)", fontSize: 13, marginTop: 16 }}>{error}</p>}
      </div>
    </div>
  );
}
