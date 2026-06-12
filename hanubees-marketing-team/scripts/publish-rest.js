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

const BATCH5 = ["sony", "ibm", "hp", "ebay", "paypal", "target"];

const caps = {
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
  for (let i = 0; i < BATCH5.length; i++) {
    const id = BATCH5[i];
    // figure out which key it goes to: sony(4th post, i=0, ki=0)→K1, ibm(5th, i=1, ki=1)→K2, etc
    // Actually re-using the same rotation: 0→K1(0), 1→K2(1), 2→K3(2), 3→K4(3), 4→K1(0), 5→K2(1)
    const ki = [0, 1, 2, 3, 0, 1][i];
    const keyInfo = KEYS[ki];
    const key = process.env[keyInfo.env];
    if (!key) { console.log(`SKIP ${id}: ${keyInfo.env} not set`); continue; }

    const slidesDir = path.join(__dirname, `../out/daily/${id}`);
    if (!fs.existsSync(slidesDir)) { console.log(`SKIP ${id}: no slides`); continue; }

    let accs = [];
    try { accs = (await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } })).json()).accounts || []; }
    catch { console.log(`SKIP ${id}: can't fetch accounts`); continue; }

    const targets = accs.filter(a => a.platform !== "youtube");
    if (!targets.length) { console.log(`SKIP ${id}: no valid accounts`); continue; }

    const urls = await uploadImages(key, slidesDir);
    const media = urls.map(u => ({ url: u, type: "image" }));
    const cap = caps[id] || { ig: `@hanubees`, tt: `@hanubees` };

    for (const a of targets) {
      const content = a.platform === "tiktok" ? cap.tt : cap.ig;
      const res = await fetch(`${ZB}/posts`, {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content, mediaItems: media, platforms: [{ platform: a.platform, accountId: a._id }], publishNow: true }),
      });
      if (res.ok) console.log(`✓ ${id} posted to ${a.platform}@${keyInfo.label}`);
      else console.log(`✗ ${id} → ${a.platform}:`, (await res.text()).slice(0, 120));
    }
  }
  console.log("\nDone.");
})();
