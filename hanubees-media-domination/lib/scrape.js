"use strict";
// P4 SCRAPER — pull recent photos + a clean logo for a subject from Wikimedia.
// Gates: photos within MAX age, min width, title matches the person (avoid wrong
// person). Logo: prefer transparent SVG (rasterized crisp) else PNG.
const fs = require("fs");
const path = require("path");
const sharp = require("/root/hanubees/node_modules/sharp");
const C = require("../config.js");

const UA = "HanubeesMediaBot/1.0 (varsansri88@gmail.com)";
const COMMONS = "https://commons.wikimedia.org/w/api.php";
const cutoffYear = new Date().getFullYear() - C.MEDIA.maxPhotoAgeYears;

async function api(params) {
  const url = COMMONS + "?" + new URLSearchParams({ format: "json", ...params });
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  return r.json();
}
async function download(url, dest) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error("dl " + r.status);
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
}

// search Commons file namespace; return [{title,url,mime,date,width}]
async function searchImages(query, limit = 20) {
  const j = await api({ action: "query", generator: "search", gsrsearch: query, gsrnamespace: 6,
    gsrlimit: String(limit), prop: "imageinfo", iiprop: "url|mime|size|extmetadata", iiextmetadatafilter: "DateTimeOriginal" });
  const pages = j.query ? j.query.pages : {};
  const out = [];
  for (const k in pages) {
    const i = pages[k].imageinfo && pages[k].imageinfo[0];
    if (!i) continue;
    const date = (i.extmetadata && i.extmetadata.DateTimeOriginal && i.extmetadata.DateTimeOriginal.value || "").slice(0, 10);
    out.push({ title: pages[k].title, url: i.url, mime: i.mime, date, width: i.width || 0 });
  }
  return out;
}

// pull files from a Commons CATEGORY (curated photos of the person)
async function categoryImages(person, limit = 60) {
  const j = await api({ action: "query", generator: "categorymembers", gcmtitle: `Category:${person}`,
    gcmtype: "file", gcmlimit: String(limit), prop: "imageinfo", iiprop: "url|mime|size|extmetadata", iiextmetadatafilter: "DateTimeOriginal" });
  const pages = j.query ? j.query.pages : {};
  const out = [];
  for (const k in pages) {
    const i = pages[k].imageinfo && pages[k].imageinfo[0];
    if (!i) continue;
    const date = (i.extmetadata && i.extmetadata.DateTimeOriginal && i.extmetadata.DateTimeOriginal.value || "").slice(0, 10);
    out.push({ title: pages[k].title, url: i.url, mime: i.mime, date, width: i.width || 0 });
  }
  return out;
}

async function scrapePhotos(person, dir, want = 12) {
  fs.mkdirSync(dir, { recursive: true });
  const full = person.toLowerCase();   // require FULL name (excludes same-surname spouses)
  const yr = (d) => (d && /^\d{4}/.test(d)) ? parseInt(d.slice(0, 4)) : 0;
  // primary: the person's Commons category (curated, high volume); fallback: search
  let cands = await categoryImages(person);
  const s = await searchImages(person, 40);                 // always merge search pool
  cands = cands.concat(s);
  // gate: file title must name the person (kills spouses/others in the category),
  // real photo, big enough, recent-or-undated
  cands = cands.filter((c) => c.title.toLowerCase().includes(full));
  cands = cands.filter((c) => /jpe?g|png/i.test(c.mime) && c.width >= C.MEDIA.minPhotoWidth);
  cands = cands.filter((c) => yr(c.date) === 0 || yr(c.date) >= cutoffYear);
  // de-dup by url, prefer dated+recent first
  const seen = new Set();
  cands = cands.filter((c) => (seen.has(c.url) ? false : (seen.add(c.url), true)));
  cands.sort((a, b) => yr(b.date) - yr(a.date));
  const got = [];
  for (const c of cands) {
    if (got.length >= want) break;
    const f = path.join(dir, `photo_${got.length}.jpg`);
    try { await download(c.url, f); got.push({ file: f, date: c.date, title: c.title }); } catch {}
  }
  return got;
}

async function scrapeLogo(logoQuery, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const res = await searchImages(logoQuery, 20);
  // prefer SVG (vector, transparent), else transparent-ish PNG, avoid 'white'/'ascii' oddities
  const svg = res.find((r) => /\.svg$/i.test(r.title) && !/white|black|wordmark \(old\)|icon only/i.test(r.title));
  const png = res.find((r) => /\.png$/i.test(r.title) && !/ascii|physx|shield|inception/i.test(r.title));
  const pick = svg || png || res[0];
  if (!pick) throw new Error("no logo found for " + logoQuery);
  const isSvg = /\.svg$/i.test(pick.title);
  const raw = path.join(dir, isSvg ? "logo_src.svg" : "logo_src.png");
  await download(pick.url, raw);
  const out = path.join(dir, "logo.png");
  await sharp(raw, isSvg ? { density: 300 } : {}).resize({ width: 900, withoutEnlargement: false }).png().toFile(out);
  return { logo: out, source: pick.title };
}

async function scrapeSubject({ slug, person, logoQuery }) {
  const dir = path.join(C.ROOT, "assets/scraped", slug);
  const photos = await scrapePhotos(person, path.join(dir, "photos"));
  const logo = await scrapeLogo(logoQuery, dir);
  return { dir, photos, logo: logo.logo, logoSource: logo.source };
}

module.exports = { scrapeSubject, scrapePhotos, scrapeLogo };

if (require.main === module) {
  const [, , slug, person, logoQuery] = process.argv;
  scrapeSubject({ slug, person, logoQuery }).then((r) =>
    console.log(JSON.stringify({ photos: r.photos.map((p) => ({ f: path.basename(p.file), date: p.date })), logo: r.logoSource }, null, 2))
  ).catch((e) => { console.error("ERR", e.message); process.exit(1); });
}
