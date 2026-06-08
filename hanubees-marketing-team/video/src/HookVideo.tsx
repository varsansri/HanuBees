import React from "react";
import {
  AbsoluteFill, Sequence, Img, Audio, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring,
} from "remotion";
import { COLORS, TYPE, FONT, FPS, SPRING, EMOTION, type Emotion } from "./theme";
import { MemeOpener } from "./MemeOpener";

export const OPENER = 80, SCENE = 70, CTA = 66;

export type Scene = { text: string; big?: string; sub?: string; emoji?: string };
export type HookVideoProps = {
  id: string;
  emotion: Emotion;
  hook: string;
  scenes: Scene[];
  cta: string;
  music: "drive" | "tense" | "uplift";
  gifSrc?: string;
};

export const totalFrames = (p: HookVideoProps) => OPENER + p.scenes.length * SCENE + CTA;

const accentize = (s: string, accent: string) =>
  s.split(/(\s+)/).map((w, i) => {
    const hot = /\d/.test(w) || /^[₹]/.test(w) || /^[A-Z][A-Z']{2,}[.!?,]?$/.test(w);
    return <span key={i} style={{ color: hot ? accent : COLORS.fg }}>{w}</span>;
  });

const SceneCard: React.FC<{ s: Scene; accent: string }> = ({ s, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: SPRING.snappy });
  const rise = spring({ frame: frame - 6, fps, config: SPRING.soft });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 80px", textAlign: "center" }}>
      {s.big && (
        <div style={{ fontSize: TYPE.huge, fontWeight: 800, color: accent, transform: `scale(${interpolate(pop, [0, 1], [0.4, 1])})`, lineHeight: 1 }}>
          {s.big}
        </div>
      )}
      <div style={{ fontSize: TYPE.h1, fontWeight: 800, lineHeight: 1.18, marginTop: s.big ? 24 : 0, opacity: rise, transform: `translateY(${interpolate(rise, [0, 1], [40, 0])}px)` }}>
        {accentize(s.text, accent)}
      </div>
      {s.sub && <div style={{ fontSize: TYPE.cap, color: COLORS.muted, marginTop: 18, opacity: rise }}>{s.sub}</div>}
    </AbsoluteFill>
  );
};

const CtaCard: React.FC<{ cta: string; accent: string }> = ({ cta, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: SPRING.snappy });
  const btn = spring({ frame: frame - 10, fps, config: SPRING.snappy });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80, textAlign: "center" }}>
      <Img src={staticFile("bee.png")} style={{ width: 220, height: "auto", marginBottom: 28, transform: `scale(${pop})` }} />
      <div style={{ fontSize: TYPE.h1, fontWeight: 800, color: COLORS.fg, opacity: pop }}>{cta}</div>
      <div style={{ marginTop: 34, background: COLORS.yellow, color: "#121212", fontSize: 58, fontWeight: 800, padding: "26px 54px", borderRadius: 22, transform: `scale(${btn})` }}>
        hanubees.com
      </div>
    </AbsoluteFill>
  );
};

export const HookVideo: React.FC<HookVideoProps> = (p) => {
  const accent = EMOTION[p.emotion].accent;
  let at = OPENER;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: FONT }}>
      <Audio src={staticFile(`music/${p.music}.mp3`)} volume={0.32} />
      {/* persistent brand */}
      <Img src={staticFile("bee.png")} style={{ position: "absolute", top: 64, right: 64, width: 120, zIndex: 9 }} />
      <div style={{ position: "absolute", bottom: 64, width: "100%", textAlign: "center", fontFamily: FONT, fontSize: TYPE.small, fontWeight: 600, color: COLORS.green, zIndex: 9 }}>
        @hanubees · hanubees.com
      </div>

      <Sequence from={0} durationInFrames={OPENER}><MemeOpener hook={p.hook} emotion={p.emotion} gifSrc={p.gifSrc} /></Sequence>
      {p.scenes.map((s, i) => {
        const seq = <Sequence key={i} from={at} durationInFrames={SCENE}><SceneCard s={s} accent={accent} /></Sequence>;
        at += SCENE;
        return seq;
      })}
      <Sequence from={at} durationInFrames={CTA}><CtaCard cta={p.cta} accent={accent} /></Sequence>
    </AbsoluteFill>
  );
};
