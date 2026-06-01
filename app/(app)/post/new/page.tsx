"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const POST_TYPES = [
  { value: "story", label: "Story", desc: "Share your health journey" },
  { value: "tip", label: "Tip", desc: "Something that helped you" },
  { value: "question", label: "Question", desc: "Ask the community" },
  { value: "journal_highlight", label: "Highlight", desc: "A milestone from your journal" },
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
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const tagArray = tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);

    const { error: postError } = await supabase.from("posts").insert({
      user_id: user.id,
      content: content.trim(),
      post_type: type,
      tags: tagArray,
      value_up: 0, value_down: 0, likes: 0, views: 0,
    });

    if (postError) { setError(postError.message); setLoading(false); return; }
    router.push("/feed");
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>
      <div style={{ paddingTop: 8, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} className="btn-ghost"
          style={{ padding: "8px 12px", fontSize: 18 }}>←</button>
        <h2 className="font-brand" style={{ fontSize: 22, color: "var(--amber)" }}>New Post</h2>
      </div>

      {/* Post type */}
      <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {POST_TYPES.map((t) => (
          <button key={t.value} onClick={() => setType(t.value)}
            style={{
              background: type === t.value ? "rgba(245,166,35,0.12)" : "var(--bg2)",
              border: `1px solid ${type === t.value ? "var(--amber)" : "var(--border)"}`,
              borderRadius: 12, padding: "10px 14px", cursor: "pointer",
              textAlign: "left", transition: "all 0.2s",
            }}>
            <div style={{ fontSize: 13, fontWeight: 600,
              color: type === t.value ? "var(--amber)" : "var(--fg)" }}>
              {t.label}
            </div>
            <div style={{ fontSize: 11, color: "var(--fg3)", marginTop: 2 }}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <textarea className="input" placeholder="Share your experience, question, or insight..."
        value={content} onChange={e => setContent(e.target.value)}
        rows={6} style={{ resize: "none", marginBottom: 12, lineHeight: 1.6 }} />

      {/* Tags */}
      <input className="input" placeholder="Tags (comma separated): diabetes, insulin, supplements..."
        value={tags} onChange={e => setTags(e.target.value)} style={{ marginBottom: 16 }} />

      {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      <button className="btn-primary" onClick={submit}
        disabled={!content.trim() || loading}>
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
}
