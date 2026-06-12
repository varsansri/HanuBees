"use strict";
// ============================================================================
// HANUBEES MEDIA DOMINATION — LOCKED DESIGN CONFIG (single source of truth)
// Every design constant is here and DEEP-FROZEN. No phase may change the design;
// only `content` and `media` vary per post. Touch this file = change the brand.
// ============================================================================
const path = require("path");
const ROOT = __dirname;

function deepFreeze(o) {
  for (const k of Object.keys(o)) { const v = o[k]; if (v && typeof v === "object") deepFreeze(v); }
  return Object.freeze(o);
}

const CONFIG = {
  ROOT,
  // ---- canvas (3:4, locked) ----
  CANVAS: { W: 1080, H: 1440, ratio: "3:4", safe: 56 },

  // ---- brand palette (ONLY these; logo's own colors are exempt) ----
  COLORS: {
    yellow: "#ffbe00", green: "#98aa9d", fg: "#eaeaea", muted: "#a9a9a7",
    bg: "#121212", card: "#1a1a1a", input: "#242424", purple: "#b794f6",
    black: "#000000", white: "#f5f5f5",
  },

  // ---- typography (Space Grotesk ONLY) ----
  FONT: {
    family: "MADE Okine Sans PERSONAL USE, sans-serif",     // logo wordmark font
    file: path.join(ROOT, "assets/brand/okine/MADEOkineSansPERSONALUSE-Black.otf"),
    dir: path.join(ROOT, "assets/brand"),                   // fontconfig scans okine/ + fonts/
    weights: [100, 300, 400, 500, 700, 900],
  },

  ASSETS: { bee: path.join(ROOT, "assets/brand/bee.png") },

  // ---- fixed grid (exact coordinates; nothing here moves) ----
  GRID: {
    geo:        { x: 56, y: 70, size: 30, gap: 38 },
    kicker:     { x: 56, y: 156, size: 24, weight: 700, ls: 3, fill: "fg" },
    code:       { x: 56, y: 188, size: 19, weight: 400, ls: 2, fill: "muted" },
    brandRight: { yX: 56, y: 156, size: 24, weight: 700, ls: 3, fill: "yellow", text: "HANUBEES" },
    urlRight:   { yX: 56, y: 188, size: 19, weight: 400, ls: 2, fill: "muted", text: "hanubees.com" },
    topic:      { x: 56, y: 262, size: 64, weight: 900, ls: -1, fill: "yellow" },
    ruler:      { x: 56, yStart: 300, step: 52, count: 12, longW: 24, shortW: 12, h: 3, fill: "muted", opacity: 0.6 },
    bee:        { width: 86, marginRight: 50, marginBottom: 44 },
  },

  // ---- circle cluster (sizes locked) ----
  CLUSTER: { personDia: 700, logoDia: 380, ringStroke: 6, ringColor: "#ffffff", ringOpacity: 0.15 },

  // ---- 3 LOCKED layout angles (only the cluster mirrors; rest is fixed) ----
  // person spans personDia from `personLeft`; logo peeks behind from `logoLeft`.
  ANGLES: {
    right:  { personLeft: 320, personTop: 340, logoLeft: 96,  logoTop: 300 },
    left:   { personLeft: 60,  personTop: 340, logoLeft: 604, logoTop: 300 },
    center: { personLeft: 190, personTop: 360, logoLeft: 350, logoTop: 250 },
  },
  ANGLE_ORDER: ["right", "left", "center"],

  // ---- text band + auto-fit rules (so text is ALWAYS legible, never clipped) ----
  BAND: { topRatio: 0.58, padX: 64,
    fade: [ { off: 0, op: 0 }, { off: 0.42, op: 0.9 }, { off: 1, op: 1 } ] },
  TEXT: {
    // headline auto-fit: wrap to maxChars; if still wide, step size DOWN to minSize.
    headline: { maxSize: 58, minSize: 38, step: 4, lineHeight: 70, maxLines: 3,
                weight: 900, fill: "fg", maxCharsPerLine: 26, x: 64, bottomMargin: 92, charW: 0.62 },
    tag:      { size: 25, weight: 900, ls: 3, fill: "yellow", gapAboveHead: 86, ruleGap: 36, ruleW: 64, ruleH: 7 },
    // big topic word / number auto-fit by string length (chars -> font size)
    topicFit: { "1": 64, "2": 64, "3": 64, "4": 60, "5": 56, "6": 50, default: 44 },
  },

  // ---- media rules (P4/P5 gates) ----
  MEDIA: {
    minDistinctPhotos: 3, maxPhotoAgeYears: 4, minFaceSize: 60,
    faceCenterTolerancePx: 60, dupHashMaxSimilarity: 0.92, minPhotoWidth: 500,
    sources: ["wikimedia", "wikipedia", "openverse", "flickr-cc", "pexels"],
    logoFillRatio: 0.6, logoCoinLightThreshold: 110, // logo luma<thr -> light coin, else dark coin
    coinLight: "#f5f5f5", coinDark: "#1a1a1a",
  },

  // ---- content structure (LOCKED: 4 slides, last is fixed agency card) ----
  SLIDES: {
    count: 4,
    roles: ["hook", "number", "answer", "agency"],
    agency: {
      topic: "MEDIA ARMY", kicker: "HANUBEES", code: "MARKETING · AGENCY",
      tag: "HANUBEES MEDIA", beeWidth: 520, beeTop: 430,
      text: "We're a marketing agency producing a high volume of posts & videos to dominate social media.",
    },
  },

  // ---- VIDEO (reel) — same 4 slides over the SideRays animated background ----
  VIDEO: {
    W: 1080, H: 1920, fps: 30, secPerSlide: 3.2, slideYOffset: 240, // 1080x1440 slide centred in 1080x1920
    introSec: 0,                                                      // intro removed
    intro: { folderColor: "#ffbe00", fw: 280, fh: 220, beeSize: 64, wordmark: "" },
    bee: { enabled: false, size: 84, bigBeeCenter: [540, 900], wobbleAmp: 11, tiltAmp: 9 }, // bee narrative removed
    music: "founder_track.mp3", audioVolume: 0.85, audioFadeOut: 1.5,
    codec: "libx264", pixfmt: "yuv420p", abitrate: "192k",
    rays: { renderW: 540, renderH: 960, speed: 2.5, color1: "#ffbe00", color2: "#96c8ff",
            intensity: 2, spread: 2, origin: "top-right", tilt: 0, saturation: 1.5,
            blend: 0.75, falloff: 1.6, opacity: 1 },
  },

  // ---- accounts (8 slots; Threads=image carousel, others=video reel) ----
  ACCOUNTS: [
    { keyEnv: "ZERNIO_API_KEY",   platform: "instagram", username: "hanubees",        media: "video" },
    { keyEnv: "ZERNIO_API_KEY",   platform: "tiktok",    username: "riaze_charlie",    media: "video" },
    { keyEnv: "ZERNIO_API_KEY_2", platform: "threads",   username: "hanubees",         media: "image" },
    { keyEnv: "ZERNIO_API_KEY_2", platform: "youtube",   username: "hugo_mapa",        media: "video" },
    { keyEnv: "ZERNIO_API_KEY_3", platform: "instagram", username: "fxabsolute.com_",  media: "video" },
    { keyEnv: "ZERNIO_API_KEY_3", platform: "threads",   username: "fxabsolute.com_",  media: "image" },
    { keyEnv: "ZERNIO_API_KEY_4", platform: "instagram", username: "hanubees.biz",     media: "video" },
    { keyEnv: "ZERNIO_API_KEY_4", platform: "threads",   username: "hanubees.biz",      media: "image" },
  ],

  // ---- people-led niches at launch (objects reserved, not built) ----
  NICHES: [
    "wealthiest people", "tech founders", "footballers", "music artists",
    "female influencers", "influencers", "business creators",
  ],
  SUBJECT_TYPES: { person: "face-crop", product: "object-crop(reserved)", company: "logo-led(reserved)" },
};

module.exports = deepFreeze(CONFIG);
