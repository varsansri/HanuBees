#!/usr/bin/env node
require("./_env");
// Build the ASSET LIBRARY: for every subject, pre-fetch + validate a founder photo
// (Wikipedia) and a company logo (Simple Icons). Write files to assets/library/<id>/
// and a manifest.json recording what's usable, so daily batches never gamble on live
// sourcing. Re-runnable (skips assets already downloaded). node build-library.js [--force]
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const SUBJECTS = require("./subjects.js");

const UA = { headers: { "User-Agent": "HanubeesBot/1.0 (marketing library)" } };
const LIB = path.join(__dirname, "../assets/library");
const FORCE = process.argv.includes("--force");
const MIN_W = 400; // founder photo must be at least this wide to use as a hero

async function saveIfBigEnough(buf, dest) {
  const img = sharp(buf), meta = await img.metadata();
  if ((meta.width || 0) < MIN_W) return { ok: false, reason: `too small (${meta.width}px)`, w: meta.width };
  await img.jpeg({ quality: 90 }).toFile(dest);
  return { ok: true, w: meta.width };
}
// Source 1: Wikipedia article lead photo (pageimages)
async function tryPageImages(wiki, dest) {
  const api = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wiki)}&prop=pageimages&piprop=thumbnail&pithumbsize=900&format=json`;
  const j = await (await fetch(api, { ...UA, signal: AbortSignal.timeout(20000) })).json();
  const url = ((Object.values(j.query.pages)[0] || {}).thumbnail || {}).source;
  if (!url) return { ok: false, reason: "no thumbnail" };
  return saveIfBigEnough(Buffer.from(await (await fetch(url, { ...UA, signal: AbortSignal.timeout(20000) })).arrayBuffer()), dest);
}
// Source 2: Wikidata (P18 image) → Commons FilePath. More complete, less rate-limited.
async function tryWikidata(wiki, dest) {
  const pp = await (await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wiki)}&prop=pageprops&ppprop=wikibase_item&format=json`, { ...UA, signal: AbortSignal.timeout(20000) })).json();
  const qid = ((Object.values(pp.query.pages)[0] || {}).pageprops || {}).wikibase_item;
  if (!qid) return { ok: false, reason: "no wikidata id" };
  const ent = await (await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`, { ...UA, signal: AbortSignal.timeout(20000) })).json();
  const fname = (((ent.entities[qid].claims.P18 || [])[0] || {}).mainsnak || {}).datavalue?.value;
  if (!fname) return { ok: false, reason: "no P18 image" };
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fname)}?width=900`;
  return saveIfBigEnough(Buffer.from(await (await fetch(url, { ...UA, signal: AbortSignal.timeout(20000) })).arrayBuffer()), dest);
}
async function getPhoto(wiki, dest) {
  let r = await tryPageImages(wiki, dest).catch((e) => ({ ok: false, reason: "pi:" + e.message.slice(0, 20) }));
  if (r.ok) return r;
  const r2 = await tryWikidata(wiki, dest).catch((e) => ({ ok: false, reason: "wd:" + e.message.slice(0, 20) }));
  return r2.ok ? { ...r2, via: "wikidata" } : r; // keep first reason if both fail
}
async function getLogo(slug, color, dest) {
  if (!slug) return { ok: false, reason: "no slug (wordmark)" };
  const svg = await (await fetch(`https://cdn.simpleicons.org/${slug}/${color || "ffffff"}`, { signal: AbortSignal.timeout(15000) })).text();
  if (!svg || svg.length < 120 || !svg.includes("<svg")) return { ok: false, reason: "not on Simple Icons" };
  await sharp(Buffer.from(svg)).resize(280, 280, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(dest);
  return { ok: true };
}

(async () => {
  fs.mkdirSync(LIB, { recursive: true });
  const manifest = [];
  let full = 0, wordmark = 0, unusable = 0;
  for (const s of SUBJECTS) {
    const dir = path.join(LIB, s.id);
    fs.mkdirSync(dir, { recursive: true });
    const photoPath = path.join(dir, "photo.jpg"), logoPath = path.join(dir, "logo.png");
    let hasPhoto, photoW, hasLogo;

    if (!FORCE && fs.existsSync(photoPath)) { hasPhoto = true; photoW = (await sharp(photoPath).metadata()).width; }
    else { const r = await getPhoto(s.wiki, photoPath).catch((e) => ({ ok: false, reason: e.message.slice(0, 30) })); hasPhoto = r.ok; photoW = r.w; if (!r.ok) console.log(`  photo ${s.id}: ✗ ${r.reason}`); }

    if (!FORCE && fs.existsSync(logoPath)) hasLogo = true;
    else { const r = await getLogo(s.logo, s.color, logoPath).catch((e) => ({ ok: false, reason: e.message.slice(0, 30) })); hasLogo = r.ok; }

    const mode = !hasPhoto ? "unusable" : hasLogo ? "founder+logo" : "founder+wordmark";
    if (mode === "founder+logo") full++; else if (mode === "founder+wordmark") wordmark++; else unusable++;
    manifest.push({ id: s.id, company: s.company, founder: s.founder, mode, photoW: photoW || null, hasLogo: !!hasLogo, wordmark: s.company.toUpperCase() });
    console.log(`${s.id.padEnd(14)} ${mode}${hasPhoto ? ` (${photoW}px)` : ""}`);
    await new Promise((r) => setTimeout(r, 1600)); // throttle: Wikipedia rate-limits bursts
  }
  fs.writeFileSync(path.join(LIB, "manifest.json"), JSON.stringify(manifest, null, 2));
  const usable = manifest.filter((m) => m.mode !== "unusable");
  console.log(`\n=== LIBRARY: ${usable.length}/${SUBJECTS.length} usable — ${full} founder+logo, ${wordmark} founder+wordmark, ${unusable} unusable ===`);
})();
