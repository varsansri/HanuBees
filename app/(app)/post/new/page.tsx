"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";
const BG3    = "#242424";

const POST_TYPES = [
  { value: "story",             label: "Story" },
  { value: "tip",               label: "Tip" },
  { value: "question",          label: "Question" },
  { value: "journal_highlight", label: "Highlight" },
];

export default function NewPostPage() {
  const [type, setType]           = useState("story");
  const [content, setContent]     = useState("");
  const [tags, setTags]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router  = useRouter();
  const supabase = createClient();

  const pickImage = () => fileRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10 MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const uploadImage = async (userId: string): Promise<string | null> => {
    if (!imageFile) return null;
    setUploading(true);
    const ext  = imageFile.name.split(".").pop() || "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("post-images")
      .upload(path, imageFile, { upsert: false });
    setUploading(false);
    if (upErr) { setError("Image upload failed: " + upErr.message); return null; }
    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const imageUrl = await uploadImage(user.id);
    if (imageFile && !imageUrl) { setLoading(false); return; }

    const tagArray = tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
    const { error: postError } = await supabase.from("posts").insert({
      user_id: user.id, content: content.trim(), post_type: type,
      tags: tagArray, image_url: imageUrl,
      value_up: 0, value_down: 0, likes: 0, views: 0,
    });
    if (postError) { setError(postError.message); setLoading(false); return; }
    router.push("/feed");
  };

  const ready = content.trim().length > 0;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", minHeight: "100vh" }}>

      {/* Header */}
      <div className="page-header" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px",
      }}>
        <button onClick={() => router.back()} style={{
          background: "none", border: "none", color: MUTED, fontSize: 15,
          cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500,
        }}>Cancel</button>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#eaeaea" }}>New post</span>
        <button onClick={submit} disabled={!ready || loading} style={{
          background: "none", color: ready ? GREEN : MUTED,
          border: "none", padding: "8px 22px",
          fontWeight: 700, fontSize: 15, cursor: ready ? "pointer" : "default",
          fontFamily: "'Space Grotesk', sans-serif", transition: "color 0.15s",
        }}>
          {loading ? (uploading ? "Uploading…" : "Posting…") : "Post"}
        </button>
      </div>

      <div style={{ padding: "20px 16px" }}>

        {/* Type chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {POST_TYPES.map(t => {
            const active = type === t.value;
            return (
              <button key={t.value} onClick={() => setType(t.value)} style={{
                padding: "7px 18px", borderRadius: 20,
                border: active ? "none" : "1px solid rgba(234,234,234,0.08)",
                cursor: "pointer",
                background: active ? YELLOW : "transparent",
                color: active ? "#121212" : MUTED,
                fontWeight: 600, fontSize: 13,
                fontFamily: "'Space Grotesk', sans-serif",
                transition: "all 0.15s", letterSpacing: "0.01em",
              }}>{t.label}</button>
            );
          })}
        </div>

        {/* Composer */}
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: BG3,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: "#eaeaea", flexShrink: 0,
            border: "1.5px solid rgba(255,190,0,0.2)",
          }}>H</div>

          <div style={{ flex: 1 }}>
            <textarea
              placeholder="Share your health experience, tip, or question…"
              value={content} onChange={e => setContent(e.target.value)}
              autoFocus
              style={{
                width: "100%", background: "none", border: "none", outline: "none",
                color: "#eaeaea", fontSize: 16, lineHeight: 1.65, resize: "none",
                fontFamily: "'Space Grotesk', sans-serif", minHeight: 140,
              }}
            />

            {/* Image preview */}
            {imagePreview && (
              <div style={{ position: "relative", marginBottom: 12, borderRadius: 14, overflow: "hidden" }}>
                <img
                  src={imagePreview} alt="Preview"
                  style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block", borderRadius: 14 }}
                />
                {/* Remove button */}
                <button onClick={removeImage} style={{
                  position: "absolute", top: 10, right: 10,
                  width: 30, height: 30, borderRadius: "50%",
                  background: "rgba(18,18,18,0.85)", border: "none",
                  color: "#eaeaea", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, lineHeight: 1,
                }}>×</button>
              </div>
            )}

            <div style={{ height: 1, background: "rgba(234,234,234,0.08)", margin: "14px 0" }} />

            {/* Toolbar row: photo icon left, tags right */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

              {/* Photo button */}
              <button onClick={pickImage} style={{
                background: "none", border: "none", cursor: "pointer",
                color: imagePreview ? GREEN : MUTED,
                display: "flex", alignItems: "center", padding: 0,
                transition: "color 0.15s",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>

              {/* Tags */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                <span style={{ color: GREEN, fontSize: 15, fontWeight: 600 }}>#</span>
                <input
                  placeholder="add tags: diabetes, sleep…"
                  value={tags} onChange={e => setTags(e.target.value)}
                  style={{
                    flex: 1, background: "none", border: "none", outline: "none",
                    color: MUTED, fontSize: 14,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                />
              </div>

              {/* Char count */}
              {content.length > 0 && (
                <span style={{ fontSize: 13, color: content.length > 900 ? YELLOW : MUTED, flexShrink: 0 }}>
                  {content.length}/1000
                </span>
              )}
            </div>
          </div>
        </div>

        {error && <p style={{ color: GREEN, fontSize: 13, marginTop: 16 }}>{error}</p>}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
