#!/usr/bin/env node
require("./_env");
const fs = require("fs");
const path = require("path");
const ZB = "https://api.zernio.com/v1";

(function loadEnv() {
  try {
    for (const l of fs.readFileSync(path.join(__dirname, "../../.env.local"), "utf8").split("\n")) {
      const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {}
})();

(async () => {
  const key = process.env.ZERNIO_API_KEY;
  const videoPath = path.join(__dirname, "../out/daily/mcdonalds/reel.mp4");
  const buf = fs.readFileSync(videoPath);

  // Presign upload
  const pre = await (await fetch(`${ZB}/media/presign`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ filename: "reel.mp4", contentType: "video/mp4" }),
  })).json();
  if (!pre.uploadUrl) { console.log("presign failed:", JSON.stringify(pre).slice(0,200)); process.exit(1); }
  await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": "video/mp4" }, body: buf });

  // Get accounts to find hanubees instagram id
  const accs = (await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } })).json()).accounts || [];
  const igAccount = accs.find(a => a.platform === "instagram");
  if (!igAccount) { console.log("no instagram account found"); process.exit(1); }

  console.log("Posting to instagram account:", igAccount.username || igAccount._id);

  const caption = "Ray Kroc wasn't the McDonald's founder. He was a milkshake machine salesman who saw a system.\n\nHe bought the land, not the burgers. Real estate is where McDonald's makes its real money.\n\nMusic: \"We Are\" — Jo Cohen & Sex Whales [NCS]\n\n@hanubees";

  const res = await fetch(`${ZB}/posts`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      content: caption,
      mediaItems: [{ url: pre.publicUrl, type: "video" }],
      platforms: [{ platform: "instagram", accountId: igAccount._id }],
      publishNow: true,
    }),
  });
  if (res.ok) console.log("✓ POSTED to hanubees Instagram!");
  else console.log("FAILED:", (await res.text()).slice(0, 300));
})();
