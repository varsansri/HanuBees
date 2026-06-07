"use client";

import { useEffect, useRef, useState } from "react";
import { anonId } from "@/lib/consumer/store";

const YELLOW = "var(--yellow)", GREEN = "var(--green)", FG = "var(--fg)", MUTED = "var(--fg2)", BG2 = "var(--bg2)", BG3 = "var(--bg3)";

type Saved = {
  ok: true;
  contribution: { id: string; kind: string; title: string; place_name: string | null; city: string | null; valid_until: string | null };
  matched_place: string | null;
  needs_location: boolean;
  place_label: string | null;
  followup: string | null;
};

const KIND_LABEL: Record<string, string> = {
  availability: "Live availability",
  experience: "Experience",
  tip: "Tip",
  question: "Question",
};

export default function ContributeBox({ onDone }: { onDone?: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Saved | null>(null);
  const [listening, setListening] = useState(false);
  // Location is only requested AFTER save, and only when the place couldn't be found.
  const [locState, setLocState] = useState<"idle" | "asking" | "pinned" | "denied">("idle");
  const recRef = useRef<any>(null);
  const baseRef = useRef("");

  useEffect(() => () => { try { recRef.current?.stop(); } catch {} }, []);

  const sharePresentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) { setLocState("denied"); return; }
    setLocState("asking");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await fetch("/api/contribute/locate", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: saved?.contribution.id, lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
          setLocState("pinned");
        } catch { setLocState("denied"); }
      },
      () => setLocState("denied"),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  const toggleVoice = () => {
    const SR = (typeof window !== "undefined") &&
      ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition);
    if (!SR) { setError("Voice isn't supported here — type instead."); return; }
    if (listening) { try { recRef.current?.stop(); } catch {} return; }
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = true; rec.continuous = true;
    baseRef.current = text ? text + " " : "";
    rec.onresult = (e: any) => {
      let chunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) chunk += e.results[i][0].transcript;
      setText(baseRef.current + chunk);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setError(""); setListening(true);
    try { rec.start(); } catch { setListening(false); }
  };

  const submit = async () => {
    if (!text.trim()) { setError("Tap the bee and talk, or type what you know."); return; }
    try { recRef.current?.stop(); } catch {}
    setBusy(true); setError(""); setSaved(null);
    try {
      const res = await fetch("/api/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, anonId: anonId() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || "Something went wrong."); setBusy(false); return; }
      if (!data.ok) { setError("Couldn't capture that — try again."); setBusy(false); return; }
      setSaved(data as Saved);
      setText("");
    } catch { setError("Network error — try again."); }
    setBusy(false);
  };

  const again = () => { setSaved(null); setError(""); setLocState("idle"); };

  return (
    <div style={{ padding: "10px 16px 4px" }}>
      <p style={{ fontSize: 14, color: MUTED, margin: "0 0 16px", lineHeight: 1.5 }}>
        Know something the internet doesn't? Free PG slots, a great cheap find, a useful tip,
        or a question no one answers. Tap the bee and just talk — it sorts it out. Anonymous.
      </p>

      {!saved && (
        <>
          {/* Bee acts as the mic */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
            <button
              onClick={toggleVoice}
              aria-label={listening ? "Stop listening" : "Tap to talk"}
              className={listening ? "bee-listening" : "bee-float"}
              style={{
                width: 92, height: 92, borderRadius: "50%", cursor: "pointer",
                border: listening ? `2px solid ${GREEN}` : "2px solid var(--border)",
                background: BG2, display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
              }}
            >
              <img src="/bee.png" alt="" style={{ width: 58, height: 58, pointerEvents: "none" }} />
            </button>
            <p style={{ fontSize: 12.5, color: listening ? GREEN : MUTED, margin: "10px 0 0", fontWeight: 600 }}>
              {listening ? "Listening… tap the bee to stop" : "Tap the bee to talk"}
            </p>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="…or type it here. e.g. Sri Sai PG in Coimbatore near Gandhipuram has 2 beds free, ₹4500/month, decent food"
            rows={5}
            style={{ width: "100%", boxSizing: "border-box", padding: 14, background: BG2, color: FG, border: "1px solid var(--border)", borderRadius: 14, fontSize: 15, lineHeight: 1.5, resize: "vertical", outline: "none", fontFamily: "inherit" }}
          />
          {error && <p style={{ fontSize: 13, color: GREEN, margin: "12px 2px 0" }}>{error}</p>}
          <button
            onClick={submit}
            disabled={busy}
            style={{ width: "100%", marginTop: 16, padding: 15, borderRadius: 14, border: "none", background: YELLOW, color: "#121212", fontSize: 16, fontWeight: 800, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "inherit" }}
          >
            {busy ? "Saving…" : "Share it"}
          </button>
        </>
      )}

      {saved && (
        <div style={{ background: BG2, border: "1px solid var(--border)", borderRadius: 16, padding: 18 }}>
          <p style={{ fontSize: 13, color: GREEN, fontWeight: 700, margin: "0 0 8px" }}>✓ Added to Hanubees</p>
          <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "#121212", background: YELLOW, borderRadius: 6, padding: "2px 8px", marginBottom: 8 }}>
            {KIND_LABEL[saved.contribution.kind] || saved.contribution.kind}
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: FG, margin: "0 0 4px" }}>{saved.contribution.title}</h3>
          <p style={{ fontSize: 13, color: MUTED, margin: "0 0 10px" }}>
            {[saved.matched_place || saved.contribution.place_name, saved.contribution.city].filter(Boolean).join(" · ") || "Local knowledge"}
            {saved.contribution.valid_until && <> · fresh for now</>}
          </p>
          {/* Location prompt — only when it's about a place we couldn't pin */}
          {saved.needs_location && locState !== "pinned" && (
            <div style={{ background: BG3, borderRadius: 12, padding: "12px 14px", marginTop: 4 }}>
              <p style={{ fontSize: 13, color: FG, margin: "0 0 10px" }}>
                {locState === "denied"
                  ? "Couldn't get your location. You can add the area in the text instead."
                  : `We couldn't pin ${saved.place_label || "this place"} on the map. Add your present location so others can find it?`}
              </p>
              {locState !== "denied" && (
                <button
                  onClick={sharePresentLocation}
                  disabled={locState === "asking"}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, background: GREEN, color: "#121212", border: "none", borderRadius: 999, padding: "9px 16px", fontSize: 13.5, fontWeight: 700, cursor: locState === "asking" ? "default" : "pointer", fontFamily: "inherit" }}
                >
                  <span>📍</span>{locState === "asking" ? "Getting location…" : "Use my present location"}
                </button>
              )}
            </div>
          )}
          {locState === "pinned" && (
            <p style={{ fontSize: 13, color: GREEN, fontWeight: 600, margin: "4px 0 0" }}>📍 Pinned on the map ✓</p>
          )}

          {saved.followup && (
            <div style={{ background: BG3, borderRadius: 12, padding: "12px 14px", marginTop: 10 }}>
              <p style={{ fontSize: 13, color: FG, margin: 0 }}>{saved.followup}</p>
              <button onClick={again} style={{ marginTop: 10, background: "none", border: "none", color: GREEN, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>Add more →</button>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={again} style={{ flex: 1, padding: 13, borderRadius: 14, border: "1px solid var(--border)", background: "transparent", color: FG, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Share another</button>
            {onDone && <button onClick={onDone} style={{ flex: 1, padding: 13, borderRadius: 14, border: "none", background: YELLOW, color: "#121212", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Done</button>}
          </div>
        </div>
      )}
    </div>
  );
}
