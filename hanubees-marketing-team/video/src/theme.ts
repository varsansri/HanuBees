// ── Hanubees video design system ─────────────────────────────────────────────
// One source of truth for font, colors, type scale, motion, and emotion mapping.
import { staticFile, delayRender, continueRender } from "remotion";
import { loadFont } from "@remotion/fonts";

export const FONT = "Space Grotesk";
const h = delayRender("font", { timeoutInMilliseconds: 90000 });
loadFont({ family: FONT, url: staticFile("SpaceGrotesk.ttf") }).then(() => continueRender(h)).catch(() => continueRender(h));

export const FPS = 30;

// Core brand
export const COLORS = {
  bg: "#121212",
  bg2: "#1a1a1a",
  yellow: "#FFBE00",
  green: "#98AA9D",
  fg: "#EAEAEA",
  muted: "#A9A9A7",
};

// Type scale (1080×1920 canvas) — built to be read on a phone in <1s.
export const TYPE = {
  mega: 380,   // the giant number / one-word slam
  huge: 150,   // big stat
  hook: 78,    // opener hook line
  h1: 66,
  body: 48,
  cap: 38,
  small: 30,
};

// Emotion → accent + music + opener reaction. The first 3s must FEEL like this.
export type Emotion = "shock" | "frustration" | "relief" | "curiosity";
export const EMOTION: Record<Emotion, { accent: string; music: "drive" | "tense" | "uplift"; emoji: string; shake: number }> = {
  shock:       { accent: "#FFBE00", music: "drive",  emoji: "🤯", shake: 14 },
  frustration: { accent: "#FF6B4A", music: "tense",  emoji: "😤", shake: 18 },
  relief:      { accent: "#98AA9D", music: "uplift", emoji: "😮‍💨", shake: 8  },
  curiosity:   { accent: "#FFBE00", music: "drive",  emoji: "👀", shake: 10 },
};

// Motion constants
export const SPRING = { snappy: { damping: 12, mass: 0.7 }, soft: { damping: 18, mass: 0.9 } };
