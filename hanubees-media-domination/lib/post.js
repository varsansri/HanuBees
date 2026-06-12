"use strict";
// P8/P9 — post a 4-slide carousel to a SPECIFIC Threads account via its key.
// publishNow=true posts immediately; scheduledAt=ISO schedules it.
const fs = require("fs");
const path = require("path");
const ZB = "https://api.zernio.com/v1";

(function loadEnv() {
  for (const l of fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8").split("\n")) {
    const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
})();

async function uploadMedia(key, buf, filename, contentType) {
  const pre = await (await fetch(`${ZB}/media/presign`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ filename, contentType }),
  })).json();
  await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body: buf });
  return pre.publicUrl;
}
const uploadImg = (key, buf) => uploadMedia(key, buf, "s.png", "image/png");

async function accountByPlatform(key, platform) {
  const j = await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } })).json();
  return (j.accounts || []).find((a) => a.platform === platform);
}

// post a single reel mp4 to a specific account on `platform` (e.g. instagram)
async function postVideo({ keyEnv, file, caption, platform = "instagram", scheduledAt }) {
  const key = process.env[keyEnv];
  if (!key) throw new Error("missing " + keyEnv);
  const acc = await accountByPlatform(key, platform);
  if (!acc) throw new Error(`no ${platform} account on ${keyEnv}`);
  const url = await uploadMedia(key, fs.readFileSync(file), "reel.mp4", "video/mp4");
  const body = { content: caption, mediaItems: [{ url, type: "video" }], platforms: [{ platform, accountId: acc._id }] };
  if (scheduledAt) body.scheduledAt = scheduledAt; else body.publishNow = true;
  const res = await fetch(`${ZB}/posts`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const txt = await res.text();
  return { ok: res.ok, account: acc.username, status: res.status, body: txt.slice(0, 200) };
}

async function threadsAccount(key) {
  const j = await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } })).json();
  return (j.accounts || []).find((a) => a.platform === "threads");
}

// files = array of 4 PNG paths
async function postCarousel({ keyEnv, files, caption, scheduledAt }) {
  const key = process.env[keyEnv];
  if (!key) throw new Error("missing " + keyEnv);
  const acc = await threadsAccount(key);
  if (!acc) throw new Error("no threads account on " + keyEnv);
  const media = [];
  for (const f of files) media.push({ url: await uploadImg(key, fs.readFileSync(f)), type: "image" });
  const body = { content: caption, mediaItems: media, platforms: [{ platform: "threads", accountId: acc._id }] };
  if (scheduledAt) body.scheduledAt = scheduledAt; else body.publishNow = true;
  const res = await fetch(`${ZB}/posts`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const txt = await res.text();
  return { ok: res.ok, account: acc.username, status: res.status, body: txt.slice(0, 200) };
}

module.exports = { postCarousel, postVideo };
