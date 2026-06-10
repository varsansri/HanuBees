#!/usr/bin/env node
require("./_env");
// Instant-indexing via IndexNow (Bing, Yandex, Seznam, etc.) — no site verification needed.
// Requires public/<KEY>.txt to be LIVE at https://www.hanubees.com/<KEY>.txt first.
// Usage: node hanubees-marketing-team/scripts/indexnow.js <KEY> [extra-url ...]
const HOST = "www.hanubees.com";
const KEY = process.argv[2];
if (!KEY) { console.error("usage: node indexnow.js <KEY> [urls...]"); process.exit(1); }

const cities = ["los-angeles", "melbourne", "coimbatore", "chennai"];
const cats = ["restaurants", "hospitals", "salons", "dental-clinics", "pharmacies", "eye-hospitals"];
const base = [`https://${HOST}`, `https://${HOST}/discover`, `https://${HOST}/map`, `https://${HOST}/claim`];
const cityUrls = cities.map((c) => `https://${HOST}/${c}`);
const catUrls = cities.flatMap((c) => cats.map((k) => `https://${HOST}/${c}/${k}`));
const urlList = [...new Set([...base, ...cityUrls, ...catUrls, ...process.argv.slice(3)])];

(async () => {
  // 1) confirm the key file is reachable (IndexNow rejects otherwise)
  const probe = await fetch(`https://${HOST}/${KEY}.txt`).then((r) => r.text()).catch(() => "");
  if (probe.trim() !== KEY) { console.error(`key file not live yet at https://${HOST}/${KEY}.txt (got "${probe.slice(0,40)}") — deploy first.`); process.exit(2); }
  console.log("key file verified live ✓");

  // 2) submit the batch
  const body = { host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList };
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(body),
  });
  console.log(`IndexNow submit: HTTP ${res.status} ${res.statusText} — ${urlList.length} URLs`);
  console.log(res.status === 200 || res.status === 202 ? "ACCEPTED ✓ (Bing/Yandex will crawl these soon)" : await res.text());
})();
