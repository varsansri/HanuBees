#!/usr/bin/env node
// Publish the rendered video (out/video.mp4) to our own accounts via Zernio.
// Posts across BOTH keys → ZERNIO_API_KEY (Instagram + TikTok) and
// ZERNIO_API_KEY_2 (Threads + YouTube), so one render hits all 4 platforms.
// Per-platform caption (TikTok capped). Our own brand accounts only.
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

const ZB = "https://api.zernio.com/v1";
const OUT = path.join(__dirname, "../out");
const KEYS = [process.env.ZERNIO_API_KEY, process.env.ZERNIO_API_KEY_2].filter(Boolean);

async function uploadVideo(key, buf) {
  const pre = await (await fetch(`${ZB}/media/presign`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ filename: "hanubees.mp4", contentType: "video/mp4" }),
  })).json();
  const put = await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": "video/mp4" }, body: buf });
  if (!put.ok) throw new Error("upload PUT failed: " + put.status);
  return pre.publicUrl;
}

(async () => {
  if (!KEYS.length) { console.error("No ZERNIO key(s)"); process.exit(1); }
  const videoPath = path.join(OUT, "video.mp4");
  if (!fs.existsSync(videoPath)) { console.error("No out/video.mp4 — render first"); process.exit(1); }
  const props = JSON.parse(fs.readFileSync(path.join(OUT, "props.json"), "utf8"));
  const buf = fs.readFileSync(videoPath);
  console.log("Posting:", props.id || props.business || "video");

  const ok = [];
  for (const key of KEYS) {
    let accs;
    try { accs = (await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } })).json()).accounts || []; }
    catch { accs = []; }
    if (!accs.length) continue;
    let url;
    try { url = await uploadVideo(key, buf); } catch (e) { console.log("upload failed for a key:", e.message); continue; }
    const media = [{ url, type: "video" }];
    for (const a of accs) {
      const cap = a.platform === "tiktok" ? props.caption_tt : props.caption_ig;
      const res = await fetch(`${ZB}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: cap, mediaItems: media, platforms: [{ platform: a.platform, accountId: a._id }], publishNow: true }),
      });
      if (res.ok) { ok.push(a.platform); console.log(a.platform, "PUBLISHED ✓"); }
      else console.log(a.platform, "FAILED:", (await res.text()).slice(0, 200));
    }
  }
  console.log("Done →", ok.join(", ") || "(none)");
})();
