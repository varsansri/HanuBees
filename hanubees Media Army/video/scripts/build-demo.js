#!/usr/bin/env node
require("./_env");
// Build out/props.json for a DemoVideo (phone-mockup demo). Fetches a Giphy meme
// for the opener. One demo spec for now (the consumer "ask & get answer" flow).
const fs = require("fs");
const path = require("path");

(function loadEnv() {
  try {
    for (const l of fs.readFileSync(path.join(__dirname, "../../../.env.local"), "utf8").split("\n")) {
      const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {}
})();

const GIPHY = process.env.GIPHY_API_KEY;
const TRACKS = { drive: "Hitman", tense: "The Complex", uplift: "Inspired" };

const DEMOS = {
  d01: {
    emotion: "shock", music: "drive",
    hook: "Getting a local answer should be THIS fast.",
    business: "Hanubees",
    query: "PG with beds free near Gandhipuram under ₹5000?",
    reply: "Yes — Sri Sai PG, Gandhipuram has 2 beds free, ₹4,500/mo, food included.",
    chip: { title: "Sri Sai PG · Gandhipuram", sub: "2 beds free · ₹4,500/mo · food" },
    label1: "Type what you need", label2: "Answer in 2 seconds",
    cta: "Ask anything, free.",
    gifTerm: "formula 1 racing car speed",
  },
};

async function fetchGif(term) {
  if (!GIPHY) return null;
  try {
    const r = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY}&q=${encodeURIComponent(term)}&limit=20&rating=pg-13`, { signal: AbortSignal.timeout(15000) });
    const d = await r.json();
    const list = (d.data || []).filter((g) => g?.images?.downsized_medium?.url);
    if (!list.length) return null;
    const url = list[Math.floor(Math.random() * list.length)].images.downsized_medium.url;
    // download locally so the renderer serves it via staticFile (no per-frame remote fetch)
    const buf = Buffer.from(await (await fetch(url, { signal: AbortSignal.timeout(20000) })).arrayBuffer());
    fs.mkdirSync(path.join(__dirname, "../public"), { recursive: true });
    fs.writeFileSync(path.join(__dirname, "../public/opener.gif"), buf);
    return "opener.gif";
  } catch { return null; }
}

(async () => {
  const id = process.env.DEMO_ID || "d01";
  const s = DEMOS[id];
  if (!s) { console.error("no demo", id); process.exit(1); }
  const gifSrc = await fetchGif(s.gifTerm);
  const credit = `\n\n🎵 "${TRACKS[s.music]}" — Kevin MacLeod (incompetech.com), CC BY 4.0`;
  const props = {
    id, emotion: s.emotion, music: s.music, hook: s.hook, gifSrc: gifSrc || undefined,
    business: s.business, query: s.query, reply: s.reply, chip: s.chip,
    label1: s.label1, label2: s.label2, cta: s.cta,
    caption_ig: `${s.hook}\n\nThis is how easy local answers should be. ${s.cta} → hanubees.com\n\n#hanubees #localbusiness #howto #demo #AI #reels${credit}`,
    caption_tt: `${s.hook} Ask anything, free.`.slice(0, 90),
  };
  fs.mkdirSync(path.join(__dirname, "../out"), { recursive: true });
  fs.writeFileSync(path.join(__dirname, "../out/props.json"), JSON.stringify(props, null, 2));
  fs.writeFileSync(path.join(__dirname, "../out/id.txt"), id);
  console.log("Built demo", id, `gif:${gifSrc ? "yes" : "fallback"}`);
})();
