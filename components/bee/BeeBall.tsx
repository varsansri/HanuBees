"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useBee } from "./BeeProvider";
import { analytics } from "@/lib/analytics";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const FG      = "#eaeaea";
const MUTED  = "#a9a9a7";

const MOVE_THRESHOLD = 6;   // px before a press becomes a drag
const HOLD_MS        = 380;  // press duration before voice starts

export default function BeeBall() {
  const { mode, emit } = useBee();
  const router   = useRouter();
  const pathname = usePathname();

  const size = mode === "hero" ? 116 : 58;

  const [pos, setPos]           = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim]   = useState("");

  const startRef     = useRef<{ x: number; y: number; t: number } | null>(null);
  const movedRef     = useRef(false);
  const holdTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recRef       = useRef<any>(null);
  const deliveredRef = useRef(false);

  // Re-snap to the mode's default spot whenever mode changes (empty -> center,
  // chat starts -> parks mid-right). User drags override until next mode change.
  useEffect(() => { setPos(null); }, [mode]);

  const defaultPos = () => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    if (mode === "hero") {
      return { x: window.innerWidth / 2 - size / 2, y: window.innerHeight * 0.30 };
    }
    return { x: window.innerWidth - size - 14, y: window.innerHeight * 0.40 };
  };

  const p = pos ?? defaultPos();

  // ── Voice (push-to-talk) ────────────────────────────────────────────────
  const deliver = (text: string) => {
    const t = text.trim();
    if (!t || deliveredRef.current) return;
    deliveredRef.current = true;
    if (pathname !== "/chat") {
      sessionStorage.setItem("bee_pending", t);
      router.push("/chat");
    } else {
      emit(t);
    }
  };

  const startListening = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      const text = window.prompt("Voice isn't supported on this browser — type it:");
      if (text) deliver(text);
      return;
    }
    analytics.voiceInputStarted();
    deliveredRef.current = false;
    setInterim("");
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      let txt = "";
      for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
      setInterim(txt);
      if (e.results[e.results.length - 1].isFinal) {
        analytics.voiceInputCompleted(txt);
        deliver(txt);
      }
    };
    rec.onend   = () => { if (interimRef.current) deliver(interimRef.current); setListening(false); setInterim(""); };
    rec.onerror = () => {
      analytics.voiceInputFailed("speech_recognition_error");
      setListening(false);
      setInterim("");
    };
    recRef.current = rec;
    setListening(true);
    try { rec.start(); } catch {
      analytics.voiceInputFailed("speech_recognition_exception");
      setListening(false);
    }
  };

  // keep latest interim available to onend without stale closure
  const interimRef = useRef("");
  useEffect(() => { interimRef.current = interim; }, [interim]);

  const stopListening = () => { try { recRef.current?.stop(); } catch {} };

  // ── Tap ─────────────────────────────────────────────────────────────────
  const onTap = () => {
    analytics.beeBallTapped();
    if (pathname !== "/chat") router.push("/chat");
    else window.dispatchEvent(new CustomEvent("bee:focus"));
  };

  // ── Pointer (drag + hold-to-talk) ────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    startRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    movedRef.current = false;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    holdTimer.current = setTimeout(() => { if (!movedRef.current) startListening(); }, HOLD_MS);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (!movedRef.current && (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD)) {
      movedRef.current = true;
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (!listening) setDragging(true);
    }
    if (movedRef.current && !listening) {
      const x = Math.max(4, Math.min(window.innerWidth - size - 4, e.clientX - size / 2));
      const y = Math.max(4, Math.min(window.innerHeight - size - 4, e.clientY - size / 2));
      setPos({ x, y });
      if (distance > 40) analytics.beeBallDragged(Math.round(distance));
    }
  };

  const onPointerUp = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    const dt = Date.now() - (startRef.current?.t ?? 0);
    if (listening) {
      stopListening();
    } else if (!movedRef.current && dt < HOLD_MS) {
      onTap();
    }
    startRef.current = null;
    setDragging(false);
  };

  return (
    <>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "fixed",
          left: p.x, top: p.y,
          width: size, height: size,
          zIndex: 120,
          touchAction: "none",
          cursor: dragging ? "grabbing" : "grab",
          transition: dragging ? "none" : "left 0.35s cubic-bezier(.22,1,.36,1), top 0.35s cubic-bezier(.22,1,.36,1), width 0.3s, height 0.3s",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <img
          src="/bee.png"
          alt="Hanubees"
          draggable={false}
          style={{
            width: "100%", height: "100%", objectFit: "contain",
            pointerEvents: "none",
            filter: listening
              ? "drop-shadow(0 0 18px rgba(152,170,157,0.9))"
              : mode === "hero"
                ? "drop-shadow(0 0 24px rgba(255,190,0,0.35))"
                : "drop-shadow(0 0 10px rgba(255,190,0,0.28))",
            animation: listening
              ? "beePulse 0.7s ease-in-out infinite"
              : mode === "hero"
                ? "beeFloat 3.5s ease-in-out infinite"
                : "none",
            transition: "filter 0.3s",
          }}
        />
        {listening && (
          <span style={{
            position: "absolute", inset: -7, borderRadius: "50%",
            border: `2px solid ${GREEN}`, borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite", pointerEvents: "none",
          }} />
        )}
      </div>


      {listening && (
        <div style={{
          position: "fixed", left: 16, right: 16, bottom: 96,
          zIndex: 121, pointerEvents: "none", textAlign: "center",
        }}>
          <div style={{
            display: "inline-block", maxWidth: "90%",
            background: "#1a1a1a", border: `1px solid rgba(152,170,157,0.3)`,
            borderRadius: 14, padding: "10px 16px",
          }}>
            <p style={{ color: interim ? FG : MUTED, fontSize: 14, margin: 0 }}>
              {interim || "Listening… release to send"}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes beePulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        @keyframes beeFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </>
  );
}
