"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const MUTED  = "#a9a9a7";
const BG2    = "#1a1a1a";
const BG3    = "#242424";
const FG     = "#eaeaea";

type State = "idle" | "reading" | "extracting" | "saving" | "success" | "error" | "no-url" | "not-logged-in";

export default function BeeCollectButton() {
  const [state, setState]   = useState<State>("idle");
  const [message, setMsg]   = useState("");
  const [preview, setPreview] = useState<{ title: string; channel: string; points: string[] } | null>(null);
  const supabase = createClient();
  const router   = useRouter();

  const collect = async () => {
    if (state === "extracting" || state === "saving") return;

    // Auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setState("not-logged-in");
      setMsg("Login to collect content");
      setTimeout(() => setState("idle"), 2500);
      return;
    }

    // Read clipboard
    setState("reading");
    let text = "";
    try {
      text = await navigator.clipboard.readText();
    } catch {
      setState("error");
      setMsg("Allow clipboard access to collect links");
      setTimeout(() => setState("idle"), 3000);
      return;
    }

    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    const isSupported = urlMatch && (
      urlMatch[0].includes("youtube.com") ||
      urlMatch[0].includes("youtu.be") ||
      urlMatch[0].includes("instagram.com") ||
      urlMatch[0].includes("instagr.am")
    );
    if (!urlMatch || !isSupported) {
      setState("no-url");
      setMsg("No YouTube or Instagram link found — copy one first");
      setTimeout(() => setState("idle"), 3000);
      return;
    }

    const url = urlMatch[0];

    // Extract
    setState("extracting");
    setMsg("Extracting content…");
    let extracted: any = null;
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      extracted = await res.json();
      if (!res.ok || extracted.error) {
        setState("error");
        setMsg(extracted.error ?? "Could not extract");
        setTimeout(() => setState("idle"), 3000);
        return;
      }
    } catch {
      setState("error");
      setMsg("Network error — try again");
      setTimeout(() => setState("idle"), 3000);
      return;
    }

    // Save to Supabase
    setState("saving");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error } = await supabase.from("knowledge_entries").insert({
      user_id:      user.id,
      url:          extracted.url,
      title:        extracted.title,
      channel_name: extracted.channelName,
      platform:     extracted.platform,
      key_points:   extracted.keyPoints,
      transcript:   extracted.transcript ?? "",
      summary:      extracted.summary ?? "",
    });

    if (error) {
      setState("error");
      setMsg("Save failed — " + error.message);
      setTimeout(() => setState("idle"), 3000);
      return;
    }

    setPreview({
      title:   extracted.title,
      channel: extracted.channelName,
      points:  extracted.keyPoints.slice(0, 3),
    });
    setState("success");
    setMsg("Saved to your knowledge base");
    setTimeout(() => { setState("idle"); setPreview(null); }, 4000);
  };

  const isLoading = state === "reading" || state === "extracting" || state === "saving";

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Bee button */}
      <button
        onClick={collect}
        disabled={isLoading}
        title="Click to collect the link you copied"
        style={{
          background: "none", border: "none", cursor: isLoading ? "default" : "pointer",
          padding: 0, display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}
      >
        <img
          src="/bee.png"
          alt="Collect"
          style={{
            height: 50, width: "auto",
            filter: isLoading
              ? "drop-shadow(0 0 12px rgba(255,190,0,0.8))"
              : state === "success"
                ? "drop-shadow(0 0 14px rgba(152,170,157,0.9))"
                : "drop-shadow(0 0 10px rgba(255,190,0,0.25))",
            animation: isLoading ? "beePulse 0.8s ease-in-out infinite" : "none",
            transition: "filter 0.3s",
          }}
        />
        {/* Loading ring */}
        {isLoading && (
          <span style={{
            position: "absolute", inset: -6, borderRadius: "50%",
            border: `2px solid ${YELLOW}`,
            borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
          }} />
        )}
      </button>

      {/* Toast */}
      {state !== "idle" && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", left: "50%",
          transform: "translateX(-50%)",
          zIndex: 200, minWidth: 240, maxWidth: 300,
          background: BG2, border: `1px solid ${state === "success" ? "rgba(152,170,157,0.3)" : "rgba(234,234,234,0.1)"}`,
          borderRadius: 14, padding: "12px 14px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          animation: "fadeIn 0.18s ease",
        }}>
          {/* Status row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: preview ? 10 : 0 }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
              background: state === "success" ? GREEN : state === "error" || state === "no-url" ? YELLOW : YELLOW,
              animation: isLoading ? "micPulse 1s ease-in-out infinite" : "none",
            }} />
            <p style={{ fontSize: 13, color: FG, fontWeight: 600, margin: 0 }}>{message}</p>
          </div>

          {/* Preview */}
          {preview && (
            <div style={{ borderTop: "1px solid rgba(234,234,234,0.07)", paddingTop: 10 }}>
              <p style={{ fontSize: 12, color: GREEN, fontWeight: 700, marginBottom: 4 }}>{preview.channel}</p>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 8, lineHeight: 1.4 }}>
                {preview.title.slice(0, 60)}{preview.title.length > 60 ? "…" : ""}
              </p>
              {preview.points.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 7, marginBottom: 4 }}>
                  <span style={{ color: YELLOW, fontSize: 10, marginTop: 2, flexShrink: 0 }}>▸</span>
                  <p style={{ fontSize: 11, color: FG, margin: 0, lineHeight: 1.5 }}>{p}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes beePulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes fadeIn { from{opacity:0;transform:translateX(-50%) translateY(-4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes micPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}
