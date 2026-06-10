require("./_env");
// ─────────────────────────────────────────────────────────────────────────────
// HANUBEES MEDIA ARMY — SINGLE SOURCE OF TRUTH (hardcoded, do not drift)
// Every script + every AI operator (opencode, Claude, etc.) must obey this file.
// Changing strategy = change it HERE, in one place, not scattered across scripts.
// ─────────────────────────────────────────────────────────────────────────────

// Which system is this? Used to tag posts/claims in the SHARED database so this
// army and the original "hanubees-marketing-team" never double-post the same thing.
const SYSTEM_ID = "media-army";

// ── ACCOUNT MAP (4 Zernio keys → 8 brand accounts) ──────────────────────────
// SAME accounts as the original FOR NOW (founder decision). To split into a truly
// independent army later: swap these key env names + usernames, nothing else.
// FORMAT RULE (locked by founder): Instagram + YouTube + TikTok = VIDEO reel WITH MUSIC.
// Threads = IMAGE carousel only. (TikTok is video here, NOT a photo post.)
const ACCOUNTS = [
  { keyEnv: "ZERNIO_API_KEY",   platform: "instagram", username: "hanubees",          media: "video" },
  { keyEnv: "ZERNIO_API_KEY",   platform: "tiktok",    username: "riaze_charlie",      media: "video" },
  { keyEnv: "ZERNIO_API_KEY_2", platform: "threads",   username: "hanubees",           media: "image" },
  { keyEnv: "ZERNIO_API_KEY_2", platform: "youtube",   username: "hugo_mapa",          media: "video" },
  { keyEnv: "ZERNIO_API_KEY_3", platform: "instagram", username: "fxabsolute.com_",    media: "video" },
  { keyEnv: "ZERNIO_API_KEY_3", platform: "threads",   username: "fxabsolute.com_",    media: "image" },
  { keyEnv: "ZERNIO_API_KEY_4", platform: "instagram", username: "hanubees.biz",       media: "video" },
  { keyEnv: "ZERNIO_API_KEY_4", platform: "threads",   username: "hanubees.biz",        media: "image" },
];
// → 5 VIDEO slots (3x IG, 1x TikTok, 1x YouTube) + 3 IMAGE slots (Threads). 8 total.

// ── BRAND + NICHE (locked) ──────────────────────────────────────────────────
const NICHE = {
  audience: "small/local business owners, freelancers, solopreneurs",
  theme: "faceless, influential business-niche brand — value first, product last",
  subjects: "top wealthy US/global companies AND their founders (NO India/Coimbatore)",
  format: "FOUNDER-FACE Q&A CAROUSEL — slide 1 = question + founder/brand poster; "
        + "slides 2-3 = the answer in 3 hard, REAL numbers. IG/YouTube = video reel; "
        + "TikTok/Threads = image carousel.",
  hanubeesFooter: "ONE quiet sentence at the end — never the point of the post.",
};

// ── HARD RULES (a violation = redo the post) ────────────────────────────────
const RULES = [
  "TRUTH ONLY — no fake stats, reviews, news, clients, or numbers. Real figures only.",
  "UNIQUE EVERYWHERE — never the same info to two accounts or platforms. Claim subjects in the shared DB before posting (see claim.js).",
  "USE A VIRALITY LEVER — funny / trend / reaction / proven-hook. Value-only = dead.",
  "VISUALS = punchy YouTube-thumbnail energy, NOT plain text-on-dark cards.",
  "Quiet Hanubees footer only. Goal = reach + audience, not signups yet.",
  "Iterate every post >=4 times against the quality bar before it ships.",
];

// ── VOLUME / SAFETY MODEL ───────────────────────────────────────────────────
const VOLUME = {
  batchSize: 10,             // one "next batch" = 10 posts.
  dailyTarget: 130,          // 8 accounts x >=13 = 104..130+. This is the floor, not a cap.
  minPerAccountPerDay: 13,   // HARD floor: every account posts AT LEAST 13/day.
  perAccountPerDay: 16,      // plan ~16/account => ~130/day. Waves of 2-4 with RANDOM gaps.
  instagramCapPerDay: 20,    // HARD ceiling: IG Graph API ~25 posts/24h/account — stay under.
  // Anti-burst: spread each account's posts across the whole day with a RANDOM gap
  // between consecutive posts on the SAME account. Never bunch posts within minutes.
  minGapMinutesSameAccount: 45,   // never post to one account more often than this
  jitterMinutes: [12, 30],        // randomize each offset by +/- this so timing isn't robotic
  dayWindowHours: 22,             // spread the schedule across ~22h (leave a quiet gap)
};

// ── MUSIC POOL (NCS, free WITH attribution — append credit to video captions) ─
const TRACKS = [
  { file: "/tmp/ncs_weare.mp3",      credit: 'Music: "We Are" — Jo Cohen & Sex Whales [NCS]' },
  { file: "/tmp/ncs_comingback.mp3", credit: 'Music: "Coming Back" — The Uncommon & Kaphy [NCS]' },
  { file: "/tmp/ncs_fireflies.mp3",  credit: 'Music: "Fireflies" — KREZUS [NCS]' },
];

module.exports = { SYSTEM_ID, ACCOUNTS, NICHE, RULES, VOLUME, TRACKS };
