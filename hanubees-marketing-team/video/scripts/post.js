#!/usr/bin/env node
// Publish the rendered video (out/video.mp4) to our own Instagram + TikTok via Zernio.
// Per-platform caption from out/props.json (caption_tt capped for TikTok). Our own
// brand accounts only. Needs ZERNIO_API_KEY (and reuses SUPABASE keys for logging).
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

const K = process.env.ZERNIO_API_KEY;
const ZB = "https://api.zernio.com/v1";
const OUT = path.join(__dirname, "../out");

async function uploadVideo(buf) {
  const pre = await (await fetch(`${ZB}/media/presign`, {
    method: "POST",
    headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" },
    body: JSON.stringify({ filename: "hanubees.mp4", contentType: "video/mp4" }),
  })).json();
  const put = await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": "video/mp4" }, body: buf });
  if (!put.ok) throw new Error("upload PUT failed: " + put.status);
  return pre.publicUrl;
}

(async () => {
  if (!K) { console.error("Missing ZERNIO_API_KEY"); process.exit(1); }
  const videoPath = path.join(OUT, "video.mp4");
  const propsPath = path.join(OUT, "props.json");
  if (!fs.existsSync(videoPath)) { console.error("No out/video.mp4 — render first"); process.exit(1); }
  const props = JSON.parse(fs.readFileSync(propsPath, "utf8"));

  console.log("Uploading video for", props.city || props.business || props.id || "post", "…");
  const url = await uploadVideo(fs.readFileSync(videoPath));
  const media = [{ url, type: "video" }];

  const accs = await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${K}`, Accept: "application/json" } })).json();
  const list = accs.accounts || [];
  if (!list.length) { console.log("No connected Zernio accounts."); process.exit(1); }

  const ok = [];
  for (const a of list) {
    const cap = a.platform === "tiktok" ? props.caption_tt : props.caption_ig;
    const res = await fetch(`${ZB}/posts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: cap, mediaItems: media, platforms: [{ platform: a.platform, accountId: a._id }], publishNow: true }),
    });
    if (res.ok) { ok.push(a.platform); console.log(a.platform, "PUBLISHED ✓"); }
    else console.log(a.platform, "FAILED:", (await res.text()).slice(0, 200));
  }
  console.log("Done →", ok.join(", ") || "(none)");
})();
