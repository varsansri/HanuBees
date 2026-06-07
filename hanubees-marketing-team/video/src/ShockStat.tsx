import React from "react";
import {
  AbsoluteFill, Sequence, Img, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring, delayRender, continueRender,
} from "remotion";
import { loadFont } from "@remotion/fonts";

export const FPS = 30;
export const DURATION = 450; // 15s

export type ShockStatProps = {
  city: string;
  total: number;
  noPhone: number;
  noSite: number;
  reachable: number;
  pct: number;
};

// Brand
const BG = "#121212", YELLOW = "#FFBE00", GREEN = "#98AA9D", FG = "#EAEAEA", MUTED = "#A9A9A7";
const FONT = "Space Grotesk";

const fontHandle = delayRender("load-font");
loadFont({ family: FONT, url: staticFile("SpaceGrotesk.ttf") })
  .then(() => continueRender(fontHandle))
  .catch(() => continueRender(fontHandle));

// rises + fades in with a spring
const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16, mass: 0.7 } });
  return (
    <div style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`, ...style }}>
      {children}
    </div>
  );
};

const Hook: React.FC<ShockStatProps> = ({ noPhone, city }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12, mass: 0.9 } });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80, textAlign: "center" }}>
      <div style={{ fontSize: 360, fontWeight: 800, color: YELLOW, lineHeight: 1, transform: `scale(${interpolate(pop, [0, 1], [0.3, 1])})` }}>
        {noPhone}
      </div>
      <Rise delay={14} style={{ marginTop: 24 }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: FG, lineHeight: 1.15 }}>
          businesses in {city}
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, color: GREEN, marginTop: 6 }}>
          you can’t reach.
        </div>
      </Rise>
    </AbsoluteFill>
  );
};

const Donut: React.FC<{ pct: number }> = ({ pct }) => {
  const frame = useCurrentFrame();
  const R = 230, C = 2 * Math.PI * R;
  const grow = interpolate(frame, [8, 55], [0, pct / 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 70, textAlign: "center" }}>
      <div style={{ position: "relative", width: 540, height: 540 }}>
        <svg width="540" height="540" viewBox="0 0 540 540">
          <circle cx="270" cy="270" r={R} fill="none" stroke="#2a2a2a" strokeWidth="46" />
          <circle cx="270" cy="270" r={R} fill="none" stroke={YELLOW} strokeWidth="46" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - grow)} transform="rotate(-90 270 270)" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 150, fontWeight: 800, color: FG }}>
          {Math.round(grow * 100)}%
        </div>
      </div>
      <Rise delay={20} style={{ marginTop: 30 }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: FG, lineHeight: 1.2 }}>have no phone you<br />can find online</div>
      </Rise>
    </AbsoluteFill>
  );
};

const Bars: React.FC<ShockStatProps> = ({ noPhone, noSite, reachable }) => {
  const frame = useCurrentFrame();
  const rows = [
    { label: "No phone online", value: noPhone, color: YELLOW },
    { label: "No website at all", value: noSite, color: MUTED },
    { label: "Listed & reachable", value: reachable, color: GREEN },
  ];
  const max = Math.max(...rows.map((r) => r.value)) || 1;
  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 80px" }}>
      <Rise style={{ fontSize: 50, fontWeight: 800, color: FG, marginBottom: 50 }}>The reality 👇</Rise>
      {rows.map((r, i) => {
        const w = interpolate(frame, [10 + i * 12, 45 + i * 12], [0, r.value / max], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={r.label} style={{ marginBottom: 38 }}>
            <div style={{ fontSize: 38, fontWeight: 600, color: FG, marginBottom: 12 }}>{r.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ height: 60, width: `${w * 78}%`, background: r.color, borderRadius: 14 }} />
              <div style={{ fontSize: 48, fontWeight: 800, color: r.color }}>{Math.round(w * r.value)}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Contrast: React.FC = () => {
  const steps = ["Google it", "Open the map", "Hunt the website", "Call & wait"];
  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 90px" }}>
      <Rise style={{ fontSize: 40, fontWeight: 800, color: GREEN, marginBottom: 24, letterSpacing: 1 }}>THE OLD WAY</Rise>
      {steps.map((s, i) => (
        <Rise key={s} delay={6 + i * 8} style={{ fontSize: 46, fontWeight: 600, color: FG, marginBottom: 14 }}>
          {s} {i < steps.length - 1 ? "↓" : ""}
        </Rise>
      ))}
      <Rise delay={44} style={{ marginTop: 40 }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: YELLOW, letterSpacing: 1 }}>WITH HANUBEES</div>
        <div style={{ fontSize: 62, fontWeight: 800, color: FG, marginTop: 10 }}>Just ask. Instant.</div>
      </Rise>
    </AbsoluteFill>
  );
};

const CTA: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80, textAlign: "center" }}>
    <Rise>
      <Img src={staticFile("bee.png")} style={{ width: 200, height: "auto", margin: "0 auto 30px" }} />
      <div style={{ fontSize: 64, fontWeight: 700, color: FG }}>Free AI for every business</div>
    </Rise>
    <Rise delay={12} style={{ marginTop: 36 }}>
      <div style={{ background: YELLOW, color: "#121212", fontSize: 58, fontWeight: 800, padding: "26px 54px", borderRadius: 22 }}>
        hanubees.com
      </div>
    </Rise>
  </AbsoluteFill>
);

export const ShockStat: React.FC<ShockStatProps> = (props) => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT }}>
      <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 0%, #1c1c1c 0%, #121212 60%)" }} />
      {/* persistent bee + handle */}
      <Img src={staticFile("bee.png")} style={{ position: "absolute", top: 70, right: 70, width: 130, height: "auto", zIndex: 5 }} />
      <div style={{ position: "absolute", bottom: 70, width: "100%", textAlign: "center", fontFamily: FONT, fontSize: 30, fontWeight: 600, color: GREEN, zIndex: 5 }}>
        @hanubees · hanubees.com
      </div>

      <Sequence from={0} durationInFrames={75}><Hook {...props} /></Sequence>
      <Sequence from={75} durationInFrames={90}><Donut pct={props.pct} /></Sequence>
      <Sequence from={165} durationInFrames={120}><Bars {...props} /></Sequence>
      <Sequence from={285} durationInFrames={105}><Contrast /></Sequence>
      <Sequence from={390} durationInFrames={60}><CTA /></Sequence>
    </AbsoluteFill>
  );
};
