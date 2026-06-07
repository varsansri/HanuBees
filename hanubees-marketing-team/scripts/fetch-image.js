#!/usr/bin/env node
// Fetch publishable, commercial-safe images for ads.
//  - PEXELS_API_KEY set  -> Pexels (modern, relevant, NO attribution, NO watermark)  [preferred]
//  - else                -> Openverse CC0/PDM (no key, but rawpixel results are watermarked)
// Usage: node hanubees-marketing-team/scripts/fetch-image.js "<query>" [count] [outDir]
const fs = require("fs");
function loadEnv() { try { for (const l of fs.readFileSync(".env.local", "utf8").split("\n")) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, ""); } } catch {} }
loadEnv();
const q = process.argv[2] || "small business owner shop";
const count = +(process.argv[3] || 6);
const outDir = process.argv[4] || "/tmp/imgs";
const PEXELS = process.env.PEXELS_API_KEY;

async function viaPexels() {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&orientation=portrait&size=large&per_page=${count}`;
  const j = await (await fetch(url, { headers: { Authorization: PEXELS } })).json();
  let i = 0;
  for (const p of j.photos || []) {
    try {
      const buf = Buffer.from(await (await fetch(p.src.large2x || p.src.large)).arrayBuffer());
      const f = `${outDir}/cand${++i}.jpg`; fs.writeFileSync(f, buf);
      console.log(`  ${f}  ${p.width}x${p.height}  Pexels (no attribution req)  | ${(p.alt || "").slice(0, 50)}`);
    } catch (e) { console.log("  skip", (e.message || "").slice(0, 50)); }
  }
  console.log(`Pexels "${q}" -> ${(j.photos || []).length} downloaded`);
}

async function viaOpenverse() {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license=cc0,pdm&size=large&page_size=${count}`;
  const j = await (await fetch(url, { headers: { Accept: "application/json" } })).json();
  let i = 0;
  for (const r of j.results || []) {
    try {
      const buf = Buffer.from(await (await fetch(r.url)).arrayBuffer());
      if (buf.length < 8000) continue;
      const f = `${outDir}/cand${++i}.jpg`; fs.writeFileSync(f, buf);
      console.log(`  ${f}  ${r.width}x${r.height}  ${r.license}  | ${(r.title || "").slice(0, 50)}`);
    } catch (e) { console.log("  skip", (e.message || "").slice(0, 50)); }
  }
  console.log(`Openverse "${q}" -> ${j.result_count} total (note: rawpixel results carry watermarks)`);
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  if (PEXELS) await viaPexels(); else { console.log("(no PEXELS_API_KEY — falling back to Openverse)"); await viaOpenverse(); }
})();
