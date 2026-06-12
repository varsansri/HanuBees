#!/usr/bin/env node
// template-tipo v2 — 3:4 (1080x1440). Circle-masked logo badge BEHIND a
// circle-masked, face-centered person bubble (DIFFERENT photo per slide).
// No giant word behind the person. Brand font/colors only. Bottom text band.
const fs = require("fs");
const path = require("path");
const sharp = require("/root/hanubees/node_modules/sharp");

const ROOT = path.join(__dirname, "..");
(function setupFonts() {
  const dir = path.join(ROOT, "assets/brand/fonts");
  fs.mkdirSync("/tmp/mdfonts", { recursive: true });
  fs.writeFileSync("/tmp/mdfonts/fonts.conf",
    `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>` +
    `<dir>${dir}</dir><cachedir>/tmp/mdfontcache</cachedir>` +
    `<match target="pattern"><test name="family"><string>sans-serif</string></test><edit name="family" mode="assign" binding="same"><string>Space Grotesk</string></edit></match>` +
    `</fontconfig>`);
  process.env.FONTCONFIG_FILE = "/tmp/mdfonts/fonts.conf";
})();

const W = 1080, H = 1440;                 // 3:4
const Y = "#ffbe00", FG = "#eaeaea", MUT = "#a9a9a7", BG = "#121212";
const FONT = "Space Grotesk, sans-serif";
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const wrap = (t, max) => { const w = String(t).split(/\s+/), o = []; let c = ""; for (const x of w) { if ((c + " " + x).trim().length > max) { if (c) o.push(c.trim()); c = x; } else c += " " + x; } if (c.trim()) o.push(c.trim()); return o; };

function backLayer({ kicker, code, topic }) {
  let ruler = "";
  for (let i = 0; i <= 12; i++) { const yy = 300 + i * 52; const lng = i % 2 === 0; ruler += `<rect x="56" y="${yy}" width="${lng ? 24 : 12}" height="3" fill="${MUT}" opacity="0.6"/>`; }
  const geo = `<g opacity="0.85"><rect x="56" y="70" width="30" height="30" fill="none" stroke="${Y}" stroke-width="3"/><rect x="94" y="70" width="30" height="30" fill="none" stroke="${FG}" stroke-width="3"/><rect x="132" y="70" width="30" height="30" fill="${Y}"/></g>`;
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#33373f"/><stop offset="0.5" stop-color="#1b1d24"/><stop offset="1" stop-color="${BG}"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    ${geo}
    <text x="56" y="156" font-family="${FONT}" font-size="24" font-weight="700" letter-spacing="3" fill="${FG}">${xml(kicker)}</text>
    <text x="56" y="188" font-family="${FONT}" font-size="19" font-weight="400" letter-spacing="2" fill="${MUT}">${xml(code)}</text>
    <text x="${W - 56}" y="156" text-anchor="end" font-family="${FONT}" font-size="24" font-weight="700" letter-spacing="3" fill="${Y}">HANUBEES</text>
    <text x="${W - 56}" y="188" text-anchor="end" font-family="${FONT}" font-size="19" font-weight="400" letter-spacing="2" fill="${MUT}">hanubees.com</text>
    <text x="56" y="262" font-family="${FONT}" font-size="64" font-weight="700" letter-spacing="-1" fill="${Y}">${xml(topic)}</text>
    ${ruler}
  </svg>`);
}

function frontLayer({ lines, tag }) {
  const bandTop = Math.round(H * 0.58);
  const LH = 70;
  const firstY = H - 92 - (lines.length - 1) * LH;
  let tl = "";
  lines.forEach((l, i) => { tl += `<tspan x="64" y="${firstY + i * LH}">${xml(l)}</tspan>`; });
  const tagY = firstY - 86, ruleY = tagY - 36;
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="0.42" stop-color="#000" stop-opacity="0.9"/><stop offset="1" stop-color="#000" stop-opacity="1"/></linearGradient></defs>
    <rect x="0" y="${bandTop}" width="${W}" height="${H - bandTop}" fill="url(#fade)"/>
    <rect x="64" y="${ruleY}" width="64" height="7" fill="${Y}"/>
    <text x="64" y="${tagY}" font-family="${FONT}" font-size="25" font-weight="700" letter-spacing="3" fill="${Y}">${xml(tag)}</text>
    <text font-family="${FONT}" font-size="60" font-weight="700" fill="${FG}">${tl}</text>
  </svg>`);
}

async function circle(srcPng, dia) {
  return sharp(srcPng).resize(dia, dia).png().toBuffer();
}

async function renderSlide(out, opts) {
  const layers = [{ input: backLayer(opts) }];
  // logo badge BEHIND
  const logoDia = opts.logoDia || 380;
  layers.push({ input: await circle(opts.logo, logoDia), top: opts.logoTop, left: opts.logoLeft });
  // person bubble IN FRONT (soft ring for separation)
  const pDia = opts.personDia || 680;
  const ring = Buffer.from(`<svg width="${pDia}" height="${pDia}"><circle cx="${pDia / 2}" cy="${pDia / 2}" r="${pDia / 2 - 3}" fill="none" stroke="#ffffff" stroke-opacity="0.15" stroke-width="6"/></svg>`);
  layers.push({ input: await circle(opts.person, pDia), top: opts.personTop, left: opts.personLeft });
  layers.push({ input: ring, top: opts.personTop, left: opts.personLeft });
  // text band
  layers.push({ input: frontLayer(opts) });
  // bee watermark
  const bee = await sharp(path.join(ROOT, "assets/brand/bee.png")).resize({ width: 86 }).png().toBuffer();
  const bm = await sharp(bee).metadata();
  layers.push({ input: bee, top: H - bm.height - 44, left: W - bm.width - 50 });
  await sharp({ create: { width: W, height: H, channels: 4, background: BG } }).composite(layers).png().toFile(out);
  console.log("rendered", path.basename(out));
}

(async () => {
  const P = path.join(ROOT, "assets/prepared");
  const logo = path.join(P, "logo_badge.png");
  const outDir = path.join(ROOT, "out/template-tipo");
  fs.mkdirSync(outDir, { recursive: true });

  // circle cluster geometry (person front-right, logo peeks top-left behind)
  const cluster = { personDia: 700, personTop: 340, personLeft: 320, logoDia: 380, logoTop: 300, logoLeft: 96 };

  await renderSlide(path.join(outDir, "s1.png"), { ...cluster,
    kicker: "TOP 10 · BIGGEST COMPANIES", code: "2026 / DIFFERENCE / 01", topic: "NVIDIA",
    person: path.join(P, "person_s1.png"), logo,
    tag: "TOP 10 TECH · 2026", lines: wrap("Here's the difference between NVIDIA, AMD & Intel.", 28) });

  await renderSlide(path.join(outDir, "s2.png"), { ...cluster,
    kicker: "MARKET VALUE", code: "2026 / DIFFERENCE / 02", topic: "$3.4T",
    person: path.join(P, "person_s2.png"), logo,
    tag: "THE GAP", lines: wrap("NVIDIA passed $3T — worth more than AMD + Intel combined.", 28) });

  await renderSlide(path.join(outDir, "s3.png"), { ...cluster,
    kicker: "WHY IT WINS", code: "2026 / DIFFERENCE / 03", topic: "CUDA",
    person: path.join(P, "person_s3.png"), logo,
    tag: "THE REAL DIFFERENCE", lines: wrap("It's not the chip — it's CUDA. NVIDIA owns the AI software stack.", 28) });

  // Slide 4 — agency card (bigger bee, no person)
  const bigBee = await sharp(path.join(ROOT, "assets/brand/bee.png")).resize({ width: 520 }).png().toBuffer();
  const bm = await sharp(bigBee).metadata();
  await sharp({ create: { width: W, height: H, channels: 4, background: BG } }).composite([
    { input: backLayer({ kicker: "HANUBEES", code: "MARKETING · AGENCY", topic: "MEDIA ARMY" }) },
    { input: bigBee, top: 430, left: Math.round((W - bm.width) / 2) },
    { input: frontLayer({ tag: "HANUBEES MEDIA", lines: wrap("We're a marketing agency producing a high volume of posts & videos to dominate social media.", 30) }) },
  ]).png().toFile(path.join(outDir, "s4.png"));
  console.log("rendered s4.png");
  console.log("DONE ->", outDir);
})().catch((e) => { console.error("ERR", e); process.exit(1); });
