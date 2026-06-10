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

const KEYS = [
  { env: "ZERNIO_API_KEY", label: "K1 (IG hanubees + TT riaze_charlie)" },
  { env: "ZERNIO_API_KEY_2", label: "K2 (Threads hanubees + YT hugo_mapa)" },
  { env: "ZERNIO_API_KEY_3", label: "K3 (IG fxabsolute + Threads fxabsolute)" },
  { env: "ZERNIO_API_KEY_4", label: "K4 (IG hanubees.biz + Threads hanubees.biz)" },
];

// 12 Batch 5 concepts rendered in out/daily/
const BATCH5 = ["mcdonalds", "virgin", "harley", "nintendo", "sony", "ibm", "hp", "ebay", "paypal", "target"];

const caps = {
  mcdonalds: { ig: "Ray Kroc wasn't the McDonald's founder. He was a milkshake machine salesman who saw a system.\n\nHe bought the land, not the burgers. Real estate is where McDonald's makes its real money.\n\n@hanubees", tt: "Ray Kroc wasn't McDonald's founder. He made billions on real estate, not burgers." },
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
  // Stagger across ~16 hours: first post in 30 min, last ~15 hours later
  for (let i = 0; i < BATCH5.length; i++) {
    const id = BATCH5[i];
    const ki = i % KEYS.length;
    const keyInfo = KEYS[ki];
    const key = process.env[keyInfo.env];
    if (!key) { console.log(`SKIP ${id}: ${keyInfo.env} not set`); continue; }

    const slidesDir = path.join(__dirname, `../out/daily/${id}`);
    if (!fs.existsSync(slidesDir)) { console.log(`SKIP ${id}: no slides at ${slidesDir}`); continue; }

    // Random offset: 30 + (i * 90) + random(0,45) minutes
    const baseMin = 30 + i * 90;
    const jitter = Math.floor(Math.random() * 45);
    const offsetMs = (baseMin + jitter) * 60000;
    const scheduledFor = new Date(now + offsetMs).toISOString();

    // Get accounts for this key
    let accs = [];
    try { accs = (await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } })).json()).accounts || []; }
    catch { console.log(`SKIP ${id}: can't fetch accounts for ${keyInfo.label}`); continue; }

    const targets = accs.filter(a => a.platform !== "youtube"); // images skip YouTube
    if (!targets.length) { console.log(`SKIP ${id}: no valid accounts for ${keyInfo.label}`); continue; }

    const urls = await uploadImages(key, slidesDir);
    const media = urls.map(u => ({ url: u, type: "image" }));
    const cap = caps[id] || { ig: `@hanubees`, tt: `@hanubees` };

    for (const a of targets) {
      const content = a.platform === "tiktok" ? cap.tt : cap.ig;
      const res = await fetch(`${ZB}/posts`, {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mediaItems: media,
          platforms: [{ platform: a.platform, accountId: a._id }],
          scheduledFor: scheduledFor,
          timezone: "Etc/UTC",
        }),
      });
      if (res.ok) console.log(`${id} → ${a.platform}@${keyInfo.label} SCHEDULED at ${scheduledFor.slice(11,16)} UTC`);
      else console.log(`${id} → ${a.platform}@${keyInfo.label} FAILED:`, (await res.text()).slice(0, 120));
    }
  }
  console.log("\nDone.");
})();
