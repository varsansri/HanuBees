#!/usr/bin/env node
require("./_env");
// CC-FOOTAGE FINDER + harvest. Searches YouTube for videos uploaded under a
// Creative Commons license (videoLicense=creativeCommon) — i.e. legally reusable,
// remixable footage — for our business topics, ranked by view count. Proves supply
// + gives us real clips to mix. NO copyrighted ripping; CC = licensed for reuse.
//
// Usage: node harvest-cc-footage.js                  (proof: scan default topics)
//        node harvest-cc-footage.js "small business marketing"
const fs = require("fs");
const path = require("path");

(function loadEnv() {
  try {
    for (const l of fs.readFileSync(path.join(__dirname, "../../.env.local"), "utf8").split("\n")) {
      const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {}
})();

const KEY = process.env.GOOGLE_API_KEY || process.env.YOUTUBE_API_KEY;
const YT = "https://www.googleapis.com/youtube/v3";
const fmt = (n) => (+n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : +n >= 1e3 ? (n / 1e3).toFixed(0) + "K" : "" + n);

const TOPICS = process.argv[2]
  ? [process.argv[2]]
  : ["small business marketing", "how to get more customers", "small business tips",
     "local business owner", "entrepreneur motivation", "customer service business"];

async function searchCC(q) {
  // CC-licensed videos only, ranked by views
  const u = `${YT}/search?part=snippet&type=video&videoLicense=creativeCommon&order=viewCount&maxResults=10&q=${encodeURIComponent(q)}&key=${KEY}`;
  const r = await fetch(u);
  if (!r.ok) throw new Error(`search ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return (await r.json()).items || [];
}
async function stats(ids) {
  if (!ids.length) return {};
  const u = `${YT}/videos?part=statistics,contentDetails&id=${ids.join(",")}&key=${KEY}`;
  const d = await (await fetch(u)).json();
  const m = {};
  for (const v of d.items || []) m[v.id] = { views: +(v.statistics?.viewCount || 0), dur: v.contentDetails?.duration };
  return m;
}

(async () => {
  if (!KEY) { console.error("No GOOGLE_API_KEY / YOUTUBE_API_KEY"); process.exit(1); }
  let grand = 0;
  for (const q of TOPICS) {
    let items;
    try { items = await searchCC(q); } catch (e) { console.log(`\n### "${q}" — ERROR ${e.message}`); continue; }
    const ids = items.map((i) => i.id.videoId).filter(Boolean);
    const st = await stats(ids);
    const rows = items
      .map((i) => ({ id: i.id.videoId, title: i.snippet.title, ch: i.snippet.channelTitle, views: st[i.id.videoId]?.views || 0 }))
      .sort((a, b) => b.views - a.views);
    grand += rows.length;
    console.log(`\n### "${q}" — ${rows.length} CC-licensed videos`);
    for (const r of rows.slice(0, 6))
      console.log(`  ${fmt(r.views).padStart(6)} views · ${r.ch.slice(0, 22).padEnd(22)} · ${r.title.slice(0, 60)}`);
  }
  console.log(`\n=== TOTAL CC clips found across ${TOPICS.length} topics: ${grand} ===`);
})();
