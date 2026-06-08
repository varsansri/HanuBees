import React from "react";
import { AbsoluteFill, Sequence, Img, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { COLORS, TYPE, FONT, EMOTION, type Emotion } from "./theme";
import { MemeOpener } from "./MemeOpener";
import { PhoneChat, type PhoneChatProps } from "./PhoneChat";

export const D_OPENER = 80, D_DEMO = 285, D_CTA = 70;

export type DemoVideoProps = {
  id: string;
  emotion: Emotion;
  hook: string;
  gifSrc?: string;
  music: "drive" | "tense" | "uplift";
  cta: string;
} & PhoneChatProps;

export const demoFrames = () => D_OPENER + D_DEMO + D_CTA;

// Moving diagonal speed streaks — the F1 energy, GPU-cheap + buttery.
const SpeedLines: React.FC<{ accent: string; intensity?: number }> = ({ accent, intensity = 1 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      backgroundImage: `repeating-linear-gradient(118deg, transparent 0px, transparent 70px, ${accent}14 70px, ${accent}14 74px)`,
      backgroundPositionX: -(f * 26) + "px",
      opacity: 0.7 * intensity,
    }} />
  );
};

// Digital lap-timer that races to ~2.0s — "answer in 2 seconds" the F1 way.
const LapTimer: React.FC<{ accent: string }> = ({ accent }) => {
  const f = useCurrentFrame();
  const secs = Math.min(2.0, f / 95);
  return (
    <div style={{ position: "absolute", top: 64, left: 60, display: "flex", alignItems: "center", gap: 12, background: "#0d0d0d", border: `2px solid ${accent}`, borderRadius: 16, padding: "10px 18px" }}>
      <span style={{ color: COLORS.muted, fontSize: 24, fontWeight: 800, letterSpacing: 2 }}>LAP</span>
      <span style={{ color: accent, fontSize: 40, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{secs.toFixed(1)}s</span>
    </div>
  );
};

const StepHud: React.FC<{ label1: string; label2: string }> = ({ label1, label2 }) => {
  const f = useCurrentFrame();
  const two = f >= 94;
  const t = spring({ frame: f - (two ? 94 : 0), fps: 30, config: { damping: 18 } });
  return (
    <div style={{ position: "absolute", top: 64, width: "100%", textAlign: "center", fontFamily: FONT }}>
      <span style={{ display: "inline-block", background: two ? COLORS.green : COLORS.yellow, color: "#121212", fontSize: 32, fontWeight: 800, padding: "10px 24px", borderRadius: 999, opacity: t, transform: `translateY(${interpolate(t, [0, 1], [-14, 0])}px)` }}>
        {two ? "2 · " + label2 : "1 · " + label1}
      </span>
    </div>
  );
};

const Cta: React.FC<{ cta: string; accent: string }> = ({ cta, accent }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 12 } });
  const btn = spring({ frame: f - 10, fps, config: { damping: 12 } });
  const flag = interpolate(f, [0, 14], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80, textAlign: "center", fontFamily: FONT }}>
      <div style={{ fontSize: 46, fontWeight: 800, color: accent, opacity: flag, marginBottom: 18 }}>ANSWERS AT RACING SPEED</div>
      <Img src={staticFile("bee.png")} style={{ width: 220, marginBottom: 24, transform: `scale(${pop})` }} />
      <div style={{ fontSize: TYPE.h1, fontWeight: 800, color: COLORS.fg, opacity: pop }}>{cta}</div>
      <div style={{ marginTop: 32, background: COLORS.yellow, color: "#121212", fontSize: 58, fontWeight: 800, padding: "26px 54px", borderRadius: 22, transform: `scale(${btn})` }}>hanubees.com</div>
    </AbsoluteFill>
  );
};

export const DemoVideo: React.FC<DemoVideoProps> = (p) => {
  const accent = EMOTION[p.emotion].accent;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: FONT }}>
      <Audio src={staticFile(`music/${p.music}.mp3`)} volume={0.3} />
      <Img src={staticFile("bee.png")} style={{ position: "absolute", top: 56, right: 56, width: 96, zIndex: 30 }} />
      <div style={{ position: "absolute", bottom: 54, width: "100%", textAlign: "center", fontSize: TYPE.small, fontWeight: 600, color: COLORS.green, zIndex: 30 }}>
        @hanubees · hanubees.com
      </div>

      <Sequence from={0} durationInFrames={D_OPENER}>
        <SpeedLines accent={accent} intensity={1.1} />
        <MemeOpener hook={p.hook} emotion={p.emotion} gifSrc={p.gifSrc} />
      </Sequence>

      <Sequence from={D_OPENER} durationInFrames={D_DEMO}>
        <AbsoluteFill style={{ background: `radial-gradient(130% 70% at 50% 12%, ${accent}1f 0%, ${COLORS.bg} 60%)` }} />
        <SpeedLines accent={accent} />
        <PhoneChat business={p.business} query={p.query} reply={p.reply} chip={p.chip} label1={p.label1} label2={p.label2} />
        <StepHud label1={p.label1} label2={p.label2} />
        <LapTimer accent={accent} />
      </Sequence>

      <Sequence from={D_OPENER + D_DEMO} durationInFrames={D_CTA}>
        <SpeedLines accent={accent} intensity={1.2} />
        <Cta cta={p.cta} accent={accent} />
      </Sequence>
    </AbsoluteFill>
  );
};
