import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { COLORS, FONT } from "./theme";

const ease = (f: number, a: number, b: number, lo: number, hi: number) =>
  interpolate(f, [a, b], [lo, hi], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });

// An animated phone mockup of the Hanubees chat: a question is TYPED into the input,
// sent (user bubble), the bee "types", then the ANSWER appears — plus a result card.
// Shows people exactly what to type, what comes back, and where. Brand-matched UI.

export type PhoneChatProps = {
  business: string;     // header name (e.g. "Hanubees")
  query: string;        // what the user types
  reply: string;        // the bee's answer
  chip?: { title: string; sub: string };
  label1: string;       // callout while typing
  label2: string;       // callout when answered
};

const PHONE = { w: 820, h: 1480, top: 170, left: (1080 - 820) / 2 };
const SCREEN_PAD = 16;

const Bubble: React.FC<{ side: "l" | "r"; bg: string; children: React.ReactNode; t: number }> = ({ side, bg, children, t }) => (
  <div style={{ display: "flex", justifyContent: side === "r" ? "flex-end" : "flex-start", margin: "0 22px 16px", opacity: t, transform: `translateY(${interpolate(t, [0, 1], [22, 0])}px)` }}>
    <div style={{ maxWidth: "76%", background: bg, color: COLORS.fg, fontSize: 34, lineHeight: 1.32, padding: "20px 24px", borderRadius: 26, borderBottomRightRadius: side === "r" ? 8 : 26, borderBottomLeftRadius: side === "l" ? 8 : 26 }}>
      {children}
    </div>
  </div>
);

export const PhoneChat: React.FC<PhoneChatProps> = ({ business, query, reply, chip, label1, label2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typed = query.slice(0, Math.round(interpolate(frame, [6, 42], [0, query.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const caret = Math.floor(frame / 8) % 2 === 0 ? "|" : "";
  const userT = spring({ frame: frame - 48, fps, config: { damping: 16 } });
  const dotsOn = frame >= 56 && frame < 92;
  const replyT = spring({ frame: frame - 94, fps, config: { damping: 18 } });
  const replyTyped = reply.slice(0, Math.round(interpolate(frame, [98, 188], [0, reply.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const chipT = spring({ frame: frame - 196, fps, config: { damping: 18 } });

  // smooth 3D fly-in (0-22f) then a gentle continuous float — premium ad feel
  const entY = ease(frame, 0, 22, 180, 0);
  const entScale = ease(frame, 0, 22, 0.74, 1);
  const entRotY = ease(frame, 0, 26, 26, 0);
  const floatY = Math.sin(frame / 42) * 9;
  const floatRot = Math.sin(frame / 55) * 1.6;

  return (
    <AbsoluteFill style={{ perspective: 1700 }}>
      {/* phone */}
      <div style={{ position: "absolute", top: PHONE.top, left: PHONE.left, width: PHONE.w, height: PHONE.h, background: "#000", borderRadius: 64, border: "12px solid #2b2b2b", overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,0.7)", fontFamily: FONT, transform: `translateY(${entY + floatY}px) scale(${entScale}) rotateY(${entRotY + floatRot}deg)`, transformStyle: "preserve-3d" }}>
        <div style={{ position: "absolute", inset: SCREEN_PAD, background: COLORS.bg, borderRadius: 50, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* status bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 34px 6px", color: COLORS.fg, fontSize: 26, fontWeight: 600 }}>
            <span>9:41</span><span style={{ letterSpacing: 3 }}>● ● ●</span>
          </div>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 28px 16px", borderBottom: "1px solid #242424" }}>
            <div style={{ color: COLORS.fg, fontSize: 36 }}>‹</div>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: COLORS.bg2, border: `2px solid ${COLORS.yellow}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Img src={staticFile("bee.png")} style={{ width: 40 }} />
            </div>
            <div>
              <div style={{ color: COLORS.fg, fontSize: 34, fontWeight: 800 }}>{business}</div>
              <div style={{ color: COLORS.green, fontSize: 24, fontWeight: 600 }}>online · replies instantly</div>
            </div>
          </div>
          {/* messages */}
          <div style={{ flex: 1, paddingTop: 28, overflow: "hidden" }}>
            {userT > 0.01 && <Bubble side="r" bg="#2f2f2f" t={userT}>{query}</Bubble>}
            {dotsOn && (
              <div style={{ display: "flex", margin: "0 22px 16px" }}>
                <div style={{ background: COLORS.bg2, borderRadius: 26, padding: "22px 26px", display: "flex", gap: 8 }}>
                  {[0, 1, 2].map((i) => <span key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: COLORS.green, opacity: Math.floor(frame / 6) % 3 === i ? 1 : 0.35 }} />)}
                </div>
              </div>
            )}
            {replyT > 0.01 && (
              <Bubble side="l" bg="#1d241f" t={replyT}>
                {replyTyped}
                {chip && chipT > 0.01 && (
                  <div style={{ marginTop: 16, background: COLORS.bg, border: `1px solid ${COLORS.green}55`, borderRadius: 18, padding: "16px 18px", opacity: chipT, transform: `scale(${interpolate(chipT, [0, 1], [0.9, 1])})` }}>
                    <div style={{ fontSize: 30, fontWeight: 800, color: COLORS.fg }}>{chip.title}</div>
                    <div style={{ fontSize: 26, color: COLORS.muted, marginTop: 4 }}>{chip.sub}</div>
                    <div style={{ fontSize: 26, color: COLORS.green, fontWeight: 700, marginTop: 8 }}>Chat →</div>
                  </div>
                )}
              </Bubble>
            )}
          </div>
          {/* input bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 22px 26px" }}>
            <div style={{ flex: 1, background: "#242424", borderRadius: 999, padding: "20px 26px", color: typed ? COLORS.fg : COLORS.muted, fontSize: 32 }}>
              {frame < 48 ? (typed ? typed + caret : "Ask anything…") : "Message…"}
            </div>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: COLORS.yellow, display: "flex", alignItems: "center", justifyContent: "center", color: "#121212", fontSize: 34, fontWeight: 800 }}>↑</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
