#!/usr/bin/env node
// Post out/video.mp4 to ONE specific account (for fan-out, unique-per-account).
// Env: KEY_ENV (which Zernio key env var), ACCOUNT_ID, PLATFORM.
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
const KEY = process.env[process.env.KEY_ENV || "ZERNIO_API_KEY"];
const ACCOUNT_ID = process.env.ACCOUNT_ID;
const PLATFORM = process.env.PLATFORM;

(async () => {
  if (!KEY || !ACCOUNT_ID || !PLATFORM) { console.error("Missing KEY_ENV/ACCOUNT_ID/PLATFORM"); process.exit(1); }
  const props = JSON.parse(fs.readFileSync(path.join(OUT, "props.json"), "utf8"));

  // Threads silently drops video via Zernio → post the hook as TEXT instead (lands reliably).
  let mediaItems = [];
  if (PLATFORM !== "threads") {
    const buf = fs.readFileSync(path.join(OUT, "video.mp4"));
    const pre = await (await fetch(`${ZB}/media/presign`, {
      method: "POST", headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ filename: "hanubees.mp4", contentType: "video/mp4" }),
    })).json();
    const put = await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": "video/mp4" }, body: buf });
    if (!put.ok) { console.error("upload failed", put.status); process.exit(1); }
    mediaItems = [{ url: pre.publicUrl, type: "video" }];
  }

  const cap = PLATFORM === "tiktok" ? props.caption_tt
    : PLATFORM === "youtube" ? (props.caption_yt || props.caption_ig)
    : props.caption_ig;
  const res = await fetch(`${ZB}/posts`, {
    method: "POST", headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content: cap, mediaItems, platforms: [{ platform: PLATFORM, accountId: ACCOUNT_ID }], publishNow: true }),
  });
  console.log(`${PLATFORM}/${ACCOUNT_ID} [${props.id}]:`, res.ok ? "PUBLISHED ✓" : "FAILED " + (await res.text()).slice(0, 160));
  if (!res.ok) process.exit(1);
})();
