import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Gif } from "@remotion/gif";
import { COLORS, TYPE, FONT, SPRING, EMOTION, type Emotion } from "./theme";

// The first ~2.7s. Job: pattern-interrupt + the right EMOTION + the hook (open loop).
// meme reaction (GIF if given, else a giant slammed emoji) → hook text zoom-punches in
// → whole frame shakes → a flash frame on entry. Numbers/keywords get the accent color.
export const MemeOpener: React.FC<{ hook: string; emotion: Emotion; gifSrc?: string }> = ({ hook, emotion, gifSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = EMOTION[emotion];

  // entry flash (frames 0-3)
  const flash = interpolate(frame, [0, 4], [1, 0], { extrapolateRight: "clamp" });
  // decaying camera shake over first ~14 frames
  const decay = interpolate(frame, [0, 16], [1, 0], { extrapolateRight: "clamp" });
  const shx = Math.sin(frame * 2.1) * e.shake * decay;
  const shy = Math.cos(frame * 1.7) * e.shake * decay;
  // meme slam
  const slam = spring({ frame, fps, config: SPRING.snappy });
  // hook punches in a touch later
  const hookS = spring({ frame: frame - 8, fps, config: SPRING.snappy });
  const hookScale = interpolate(hookS, [0, 1], [0.6, 1]);

  // accent the digits + ALL-CAPS words in the hook
  const parts = hook.split(/(\s+)/).map((w, i) => {
    const hot = /\d/.test(w) || (/^[A-Z₹][A-Z₹']{2,}[.!?]?$/.test(w));
    return <span key={i} style={{ color: hot ? e.accent : COLORS.fg }}>{w}</span>;
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: FONT, transform: `translate(${shx}px, ${shy}px)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 18%, ${e.accent}22 0%, ${COLORS.bg} 55%)` }} />

      {/* meme reaction — real footage is the star */}
      <div style={{ position: "absolute", top: 190, width: "100%", display: "flex", justifyContent: "center", transform: `scale(${slam})` }}>
        {gifSrc
          ? <Gif src={gifSrc.startsWith("http") ? gifSrc : staticFile(gifSrc)} width={760} height={620} fit="cover" style={{ borderRadius: 32, border: `6px solid ${e.accent}`, boxShadow: "0 16px 50px rgba(0,0,0,0.5)" }} />
          : <div style={{ fontSize: 360, lineHeight: 1 }}>{e.emoji}</div>}
      </div>

      {/* hook (open loop) */}
      <div style={{ position: "absolute", top: 880, left: 70, right: 70, textAlign: "center", transform: `scale(${hookScale})`, opacity: hookS }}>
        <div style={{ fontSize: TYPE.hook, fontWeight: 800, lineHeight: 1.12 }}>{parts}</div>
      </div>

      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
