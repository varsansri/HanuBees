"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useBee } from "./BeeProvider";
import { analytics } from "@/lib/analytics";

const YELLOW = "#ffbe00";
const GREEN  = "#98aa9d";
const FG      = "#eaeaea";
const MUTED  = "#a9a9a7";

const MOVE_THRESHOLD = 6;    // px before a press becomes a drag
const HOLD_MS        = 380;  // press duration before voice starts
const MIN_SCALE      = 0.6;
const MAX_SCALE      = 2.5;
const NUB_SIZE       = 44;   // size when minimized
const EDGE           = 8;    // px from screen edge that counts as "minimize here"

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

export default function BeeBall() {
  const { mode, emit } = useBee();
  const router   = useRouter();
  const pathname = usePathname();

  const [userScale, setUserScale] = useState(1);   // pinch-to-zoom
  const [minimized, setMinimized] = useState(false);

  const baseSize = mode === "hero" ? 116 : 58;
  const effSize  = minimized ? NUB_SIZE : Math.round(baseSize * userScale);

  const [pos, setPos]           = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pinching, setPinching] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim]   = useState("");

  const startRef     = useRef<{ x: number; y: number; t: number } | null>(null);
  const movedRef     = useRef(false);
  const holdTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recRef       = useRef<any>(null);
  const deliveredRef = useRef(false);
  const pointers     = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef     = useRef<{ startDist: number; startScale: number } | null>(null);

  // Persisted preferences (zoom + minimized) survive reloads.
  useEffect(() => {
    try {
      const s = localStorage.getItem("bee_scale");
      if (s) setUserScale(clamp(parseFloat(s) || 1, MIN_SCALE, MAX_SCALE));
      if (localStorage.getItem("bee_min") === "1") setMinimized(true);
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem("bee_scale", String(userScale)); } catch {} }, [userScale]);
  useEffect(() => { try { localStorage.setItem("bee_min", minimized ? "1" : "0"); } catch {} }, [minimized]);

  // Re-snap to the mode's default spot whenever mode changes (only when not minimized).
  useEffect(() => { if (!minimized) setPos(null); }, [mode]); // eslint-disable-line

  const defaultPos = () => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    if (mode === "hero") return { x: window.innerWidth / 2 - effSize / 2, y: window.innerHeight * 0.30 };
    return { x: window.innerWidth - effSize - 14, y: window.innerHeight * 0.40 };
  };

  const base = pos ?? defaultPos();
  // When minimized, tuck to the right edge as a peeking nub.
  const p = (minimized && typeof window !== "undefined")
    ? { x: window.innerWidth - Math.round(NUB_SIZE * 0.55), y: clamp(base.y, 8, window.innerHeight - NUB_SIZE - 8) }
    : base;

  // ── Voice (push-to-talk) ────────────────────────────────────────────────
  const deliver = (text: string) => {
    const t = text.trim();
    if (!t || deliveredRef.current) return;
    deliveredRef.current = true;
    if (pathname !== "/chat") { sessionStorage.setItem("bee_pending", t); router.push("/chat"); }
    else emit(t);
  };

  const startListening = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { const text = window.prompt("Voice isn't supported on this browser — type it:"); if (text) deliver(text); return; }
    analytics.voiceInputStarted();
    deliveredRef.current = false;
    setInterim("");
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = true; rec.continuous = false;
    rec.onresult = (e: any) => {
      let txt = ""; for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
      setInterim(txt);
      if (e.results[e.results.length - 1].isFinal) { analytics.voiceInputCompleted(txt); deliver(txt); }
    };
    rec.onend   = () => { if (interimRef.current) deliver(interimRef.current); setListening(false); setInterim(""); };
    rec.onerror = () => { analytics.voiceInputFailed("speech_recognition_error"); setListening(false); setInterim(""); };
    recRef.current = rec;
    setListening(true);
    try { rec.start(); } catch { analytics.voiceInputFailed("speech_recognition_exception"); setListening(false); }
  };

  const interimRef = useRef("");
  useEffect(() => { interimRef.current = interim; }, [interim]);
  const stopListening = () => { try { recRef.current?.stop(); } catch {} };

  // ── Tap ─────────────────────────────────────────────────────────────────
  const onTap = () => {
    analytics.beeBallTapped();
    if (pathname !== "/chat") router.push("/chat");
    else window.dispatchEvent(new CustomEvent("bee:focus"));
  };

  // ── Pointer (drag + hold-to-talk + pinch-zoom) ───────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.target as Element).setPointerCapture?.(e.pointerId);

    if (pointers.current.size === 2) {
      // second finger down → start pinch-zoom
      if (holdTimer.current) clearTimeout(holdTimer.current);
      movedRef.current = true;
      setDragging(false);
      setPinching(true);
      const [a, b] = [...pointers.current.values()];
      pinchRef.current = { startDist: dist(a, b), startScale: userScale };
      return;
    }

    startRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    movedRef.current = false;
    holdTimer.current = setTimeout(() => { if (!movedRef.current && !minimized) startListening(); }, HOLD_MS);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // pinch-zoom takes priority
    if (pinchRef.current && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const ratio = dist(a, b) / (pinchRef.current.startDist || 1);
      setUserScale(clamp(pinchRef.current.startScale * ratio, MIN_SCALE, MAX_SCALE));
      if (minimized) setMinimized(false);
      return;
    }

    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const distance = Math.hypot(dx, dy);
    if (!movedRef.current && (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD)) {
      movedRef.current = true;
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (minimized) setMinimized(false); // dragging a nub brings it back out
      if (!listening) setDragging(true);
    }
    if (movedRef.current && !listening) {
      const s = minimized ? NUB_SIZE : effSize;
      const x = clamp(e.clientX - s / 2, 4, window.innerWidth - s - 4);
      const y = clamp(e.clientY - s / 2, 4, window.innerHeight - s - 4);
      setPos({ x, y });
      if (distance > 40) analytics.beeBallDragged(Math.round(distance));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);

    // ending a pinch
    if (pinchRef.current && pointers.current.size < 2) {
      pinchRef.current = null;
      setPinching(false);
      startRef.current = null;
      return;
    }
    if (!startRef.current) return;

    if (holdTimer.current) clearTimeout(holdTimer.current);
    const dt = Date.now() - startRef.current.t;

    if (listening) {
      stopListening();
    } else if (!movedRef.current && dt < HOLD_MS) {
      // tap: restore if minimized, otherwise navigate/focus
      if (minimized) setMinimized(false);
      else onTap();
    } else if (movedRef.current && !minimized) {
      // dragged to a screen edge → minimize (tuck away)
      if (p.x <= EDGE || p.x >= window.innerWidth - effSize - EDGE) setMinimized(true);
    }
    startRef.current = null;
    setDragging(false);
  };

  const noTransition = dragging || pinching;

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
          width: effSize, height: effSize,
          zIndex: 120,
          touchAction: "none",
          cursor: dragging ? "grabbing" : "grab",
          transition: noTransition ? "none" : "left 0.35s cubic-bezier(.22,1,.36,1), top 0.35s cubic-bezier(.22,1,.36,1), width 0.25s, height 0.25s",
          userSelect: "none",
          WebkitUserSelect: "none",
          opacity: minimized ? 0.9 : 1,
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
              : mode === "hero" && !minimized
                ? "drop-shadow(0 0 24px rgba(255,190,0,0.35))"
                : "drop-shadow(0 0 10px rgba(255,190,0,0.28))",
            animation: listening
              ? "beePulse 0.7s ease-in-out infinite"
              : mode === "hero" && !minimized
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
        <div style={{ position: "fixed", left: 16, right: 16, bottom: 96, zIndex: 121, pointerEvents: "none", textAlign: "center" }}>
          <div style={{ display: "inline-block", maxWidth: "90%", background: "#1a1a1a", border: `1px solid rgba(152,170,157,0.3)`, borderRadius: 14, padding: "10px 16px" }}>
            <p style={{ color: interim ? FG : MUTED, fontSize: 14, margin: 0 }}>{interim || "Listening… release to send"}</p>
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
