#!/usr/bin/env node
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

const KEYS = [
  { env: "ZERNIO_API_KEY", label: "K1 (IG hanubees + TT riaze_charlie)" },
  { env: "ZERNIO_API_KEY_2", label: "K2 (Threads hanubees + YT hugo_mapa)" },
  { env: "ZERNIO_API_KEY_3", label: "K3 (IG fxabsolute + Threads fxabsolute)" },
  { env: "ZERNIO_API_KEY_4", label: "K4 (IG hanubees.biz + Threads hanubees.biz)" },
];

const POSTS = ["virgin", "harley", "nintendo", "sony", "ibm", "hp", "ebay", "paypal", "target"];
const TRACKS = ["We Are — Jo Cohen & Sex Whales [NCS]", "Coming Back — The Uncommon, Kaphy [NCS]", "Fireflies — KREZUS, Surreal_dvd [NCS]"];

const caps = {
  virgin: { ig: "Richard Branson built 400+ companies from a student magazine. Records, airlines, space — the brand is the business.\n\n@hanubees", tt: "Richard Branson built 400+ companies from a student magazine. The brand is the business." },
  harley: { ig: "Harley-Davidson nearly died 3 times. It survived by selling belonging, not bikes.\n\n@hanubees", tt: "Harley-Davidson nearly died 3 times. It survived by selling belonging." },
  nintendo: { ig: "Nintendo made playing cards for 80 years before Mario. One young artist changed everything.\n\n@hanubees", tt: "Nintendo made playing cards for 80 years. One young artist saved the company." },
  sony: { ig: "Sony started in a bombed-out Tokyo shop. The Walkman was rejected by engineers — the chairman forced it through.\n\n@hanubees", tt: "Sony started in bombed-out Tokyo. The Walkman was almost killed by engineers." },
  ibm: { ig: "IBM survived 114 years by killing its own cash cows. Mainframes → PCs → cloud → AI.\n\n@hanubees", tt: "IBM survived 114 years by killing its own cash cows before the market did." },
  hp: { ig: "HP started with $538 in a garage. That garage birthed Silicon Valley.\n\n@hanubees", tt: "HP started with $538 in a garage. That garage created Silicon Valley." },
  ebay: { ig: "eBay started as a weekend coding project for Pez collectors. It grew 100x in a year with zero ads.\n\n@hanubees", tt: "eBay started as a weekend coding project. Grew 100x in a year with zero ads." },
  paypal: { ig: "PayPal alumni founded Tesla, YouTube, Yelp and LinkedIn. Extreme talent density changed the world.\n\n@hanubees", tt: "PayPal alumni founded Tesla, YouTube, Yelp and LinkedIn. One startup changed tech forever." },
  target: { ig: "Target hired high-end designers to sell discount stuff. 'Cheap Chic' made people feel smart for saving.\n\n@hanubees", tt: "Target hired high-end designers for discount products. Cheap Chic was born." },
};

async function uploadVideo(key, filePath) {
  const buf = fs.readFileSync(filePath);
  const pre = await (await fetch(`${ZB}/media/presign`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ filename: "reel.mp4", contentType: "video/mp4" }),
  })).json();
  if (!pre.uploadUrl) throw new Error("presign failed: " + JSON.stringify(pre).slice(0, 100));
  await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": "video/mp4" }, body: buf });
  return pre.publicUrl;
}

async function uploadImages(key, slidesDir) {
  const urls = [];
  const files = fs.readdirSync(slidesDir).filter(f => f.startsWith("s") && f.endsWith(".png")).sort();
  for (const f of files) {
    const buf = fs.readFileSync(path.join(slidesDir, f));
    const pre = await (await fetch(`${ZB}/media/presign`, {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ filename: f, contentType: "image/png" }),
    })).json();
    await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": "image/png" }, body: buf });
    urls.push(pre.publicUrl);
  }
  return urls;
}

(async () => {
  const now = Date.now();
  for (let i = 0; i < POSTS.length; i++) {
    const id = POSTS[i];
    const ki = i % KEYS.length;
    const keyInfo = KEYS[ki];
    const key = process.env[keyInfo.env];
    if (!key) { console.log(`SKIP ${id}: ${keyInfo.env} not set`); continue; }

    const slidesDir = path.join(__dirname, `../out/daily/${id}`);
    const videoPath = path.join(slidesDir, "reel.mp4");
    const trackLabel = TRACKS[i % 3];
    if (!fs.existsSync(videoPath)) { console.log(`SKIP ${id}: no reel.mp4`); continue; }

    // Stagger times: 30min from now + 45min per post + random jitter
    const baseMin = 30 + i * 45;
    const jitter = Math.floor(Math.random() * 20);
    const offsetMs = (baseMin + jitter) * 60000;
    const scheduledFor = new Date(now + offsetMs).toISOString();

    let accs = [];
    try { accs = (await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } })).json()).accounts || []; }
    catch { console.log(`SKIP ${id}: can't fetch accounts`); continue; }
    if (!accs.length) { console.log(`SKIP ${id}: no accounts`); continue; }

    const cap = caps[id] || { ig: "@hanubees", tt: "@hanubees" };

    // VIDEO platforms: instagram, tiktok, youtube
    const videoAccs = accs.filter(a => ["instagram", "tiktok", "youtube"].includes(a.platform));
    if (videoAccs.length) {
      const videoUrl = await uploadVideo(key, videoPath);
      for (const a of videoAccs) {
        const content = a.platform === "tiktok" ? cap.tt : cap.ig;
        const musicCredit = a.platform !== "tiktok" ? `\n\nMusic: ${trackLabel}` : "";
        const res = await fetch(`${ZB}/posts`, {
          method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content + musicCredit,
            mediaItems: [{ url: videoUrl, type: "video" }],
            platforms: [{ platform: a.platform, accountId: a._id }],
            scheduledFor, timezone: "Etc/UTC",
          }),
        });
        if (res.ok) console.log(`✓ ${id} VIDEO → ${a.platform}@${keyInfo.label} at ${scheduledFor.slice(11,16)}`);
        else console.log(`✗ ${id} VIDEO → ${a.platform}:`, (await res.text()).slice(0, 120));
      }
    }

    // THREADS image carousel only
    const threadAccs = accs.filter(a => a.platform === "threads");
    if (threadAccs.length && fs.existsSync(slidesDir)) {
      const imgUrls = await uploadImages(key, slidesDir);
      for (const a of threadAccs) {
        const res = await fetch(`${ZB}/posts`, {
          method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            content: cap.ig,
            mediaItems: imgUrls.map(u => ({ url: u, type: "image" })),
            platforms: [{ platform: "threads", accountId: a._id }],
            scheduledFor, timezone: "Etc/UTC",
          }),
        });
        if (res.ok) console.log(`✓ ${id} IMAGES → threads@${keyInfo.label} at ${scheduledFor.slice(11,16)}`);
        else console.log(`✗ ${id} IMAGES → threads:`, (await res.text()).slice(0, 120));
      }
    }
  }
  console.log("\nDone.");
})();
