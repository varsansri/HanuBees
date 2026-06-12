#!/usr/bin/env node
// template-tipo — editorial-poster sample renderer (Hanubees Media Domination).
// Look: giant YELLOW condensed topic type behind, subject cut-out in FRONT,
// corner technical metadata + vertical ruler, bottom-30% black text band,
// bee + hanubees.com watermark. Brand font/colors ONLY. SVG + sharp.
const fs = require("fs");
const path = require("path");
const sharp = require("/root/hanubees/node_modules/sharp");

const ROOT = path.join(__dirname, "..");
// ---- fonts: force Space Grotesk for sharp/SVG text rendering ----
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

const W = 1080, H = 1080;
const Y = "#ffbe00", FG = "#eaeaea", MUT = "#a9a9a7", GRN = "#98aa9d", BG = "#121212";
const FONT = "Space Grotesk, sans-serif";
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const wrap = (t, max) => { const w = String(t).split(/\s+/), o = []; let c = ""; for (const x of w) { if ((c + " " + x).trim().length > max) { if (c) o.push(c.trim()); c = x; } else c += " " + x; } if (c.trim()) o.push(c.trim()); return o; };

// ---- back layer: gradient bg + giant yellow type + logo + corner metadata + ruler ----
function backLayer({ bigType, kicker, code, accent }) {
  let ruler = "";
  for (let i = 0; i <= 10; i++) { const yy = 430 + i * 52; const lng = i % 2 === 0; ruler += `<rect x="58" y="${yy}" width="${lng ? 26 : 14}" height="3" fill="${MUT}" opacity="0.7"/>${lng ? `<text x="92" y="${yy + 9}" font-family="${FONT}" font-size="20" fill="${MUT}" opacity="0.7">${i * 5}</text>` : ""}`; }
  // tiny geo marks top-left
  const geo = `<g opacity="0.85"><rect x="58" y="60" width="34" height="34" fill="none" stroke="${Y}" stroke-width="3"/><rect x="100" y="60" width="34" height="34" fill="none" stroke="${FG}" stroke-width="3"/><rect x="142" y="60" width="34" height="34" fill="${Y}"/></g>`;
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#33373f"/><stop offset="0.5" stop-color="#1b1d24"/><stop offset="1" stop-color="${BG}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    ${geo}
    <text x="58" y="150" font-family="${FONT}" font-size="24" font-weight="700" letter-spacing="4" fill="${FG}">${xml(kicker)}</text>
    <text x="58" y="182" font-family="${FONT}" font-size="20" font-weight="400" letter-spacing="2" fill="${MUT}">${xml(code)}</text>
    <text x="${W - 58}" y="150" text-anchor="end" font-family="${FONT}" font-size="24" font-weight="700" letter-spacing="4" fill="${Y}">HANUBEES</text>
    <text x="${W - 58}" y="182" text-anchor="end" font-family="${FONT}" font-size="20" font-weight="400" letter-spacing="2" fill="${MUT}">hanubees.com</text>
    ${ruler}
    <!-- script-style accent word (Space Grotesk light, brand rule = only this font) -->
    <text x="64" y="250" font-family="${FONT}" font-size="70" font-weight="300" fill="${FG}" opacity="0.9" font-style="italic">${xml(accent)}</text>
    <!-- GIANT condensed yellow topic type, cropped by edge, sits BEHIND the subject -->
    <text x="40" y="500" font-family="${FONT}" font-size="${bigType.length <= 3 ? 320 : bigType.length === 4 ? 250 : bigType.length === 5 ? 210 : 168}" font-weight="700" letter-spacing="-12" fill="${Y}">${xml(bigType)}</text>
  </svg>`);
}

// ---- front text band: bottom-30% black gradient + headline + watermark ----
function frontLayer({ lines, tag }) {
  const bandTop = Math.round(H * 0.62); // gradient starts ~62%, text sits in bottom 30%
  const LH = 58;
  const firstY = H - 76 - (lines.length - 1) * LH; // grow upward so nothing clips the bottom
  let tl = "";
  lines.forEach((l, i) => { tl += `<tspan x="70" y="${firstY + i * LH}">${xml(l)}</tspan>`; });
  const tagY = firstY - 78, ruleY = tagY - 34;
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000000" stop-opacity="0"/><stop offset="0.55" stop-color="#000000" stop-opacity="0.82"/><stop offset="1" stop-color="#000000" stop-opacity="0.97"/>
      </linearGradient>
    </defs>
    <rect x="0" y="${bandTop}" width="${W}" height="${H - bandTop}" fill="url(#fade)"/>
    <rect x="70" y="${ruleY}" width="60" height="6" fill="${Y}"/>
    <text x="70" y="${tagY}" font-family="${FONT}" font-size="22" font-weight="700" letter-spacing="3" fill="${Y}">${xml(tag)}</text>
    <text font-family="${FONT}" font-size="44" font-weight="700" fill="${FG}">${tl}</text>
  </svg>`);
}

async function personCut(srcPng, boxW, boxH) {
  // trim transparent edges -> fit INSIDE a box (never larger than canvas)
  return sharp(srcPng).trim({ threshold: 10 })
    .resize({ width: boxW, height: boxH, fit: "inside", withoutEnlargement: false })
    .png().toBuffer();
}

async function renderSlide(out, opts) {
  const layers = [];
  layers.push({ input: backLayer(opts) });
  if (opts.person) {
    const pbuf = await personCut(opts.person, opts.personW || 760, opts.personH || 980);
    const meta = await sharp(pbuf).metadata();
    const top = Math.max(0, H - meta.height);
    let left = opts.personLeft != null ? opts.personLeft : (W - meta.width - 30);
    left = Math.max(0, Math.min(left, W - meta.width));
    layers.push({ input: pbuf, top, left });
  }
  layers.push({ input: frontLayer(opts) });
  // bee watermark bottom-right
  const bee = await sharp(path.join(ROOT, "assets/brand/bee.png")).resize({ width: 92 }).png().toBuffer();
  const bmeta = await sharp(bee).metadata();
  layers.push({ input: bee, top: H - bmeta.height - 40, left: W - bmeta.width - 50 });
  await sharp({ create: { width: W, height: H, channels: 4, background: BG } }).composite(layers).png().toFile(out);
  console.log("rendered", path.basename(out));
}

// ---------------- THE SAMPLE POST: Top 10 wealthiest companies — NVIDIA difference ----------------
(async () => {
  const N = path.join(ROOT, "assets/scraped/nvidia");
  const outDir = path.join(ROOT, "out/template-tipo");
  fs.mkdirSync(outDir, { recursive: true });
  const cut = path.join(N, "jensen_2024_cut.png");

  // Slide 1 — HOOK / QUESTION (adapted from PDF: "Here's the difference between X, Y, and Z")
  await renderSlide(path.join(outDir, "s1.png"), {
    kicker: "TOP 10 · BIGGEST COMPANIES", code: "2026 / DIFFERENCE / 01",
    accent: "the difference", bigType: "NVIDIA", person: cut, personW: 720, personH: 1040,
    tag: "TOP 10 TECH · 2026",
    lines: wrap("Here's the difference between NVIDIA, AMD & Intel.", 30),
  });
  // Slide 2 — THE NUMBER
  await renderSlide(path.join(outDir, "s2.png"), {
    kicker: "MARKET VALUE", code: "2026 / DIFFERENCE / 02",
    accent: "worth", bigType: "$3.4T", person: cut, personW: 660, personH: 980,
    tag: "THE GAP",
    lines: wrap("NVIDIA passed $3T — worth more than AMD + Intel combined.", 30),
  });
  // Slide 3 — THE ANSWER / WHY
  await renderSlide(path.join(outDir, "s3.png"), {
    kicker: "WHY IT WINS", code: "2026 / DIFFERENCE / 03",
    accent: "the moat", bigType: "CUDA", person: cut, personW: 600, personH: 900,
    tag: "THE REAL DIFFERENCE",
    lines: wrap("It's not the chip — it's CUDA. NVIDIA owns the AI software stack.", 30),
  });
  // Slide 4 — AGENCY CARD (mandatory, bigger bee, no person)
  const bigBee = await sharp(path.join(ROOT, "assets/brand/bee.png")).resize({ width: 460 }).png().toBuffer();
  const bm = await sharp(bigBee).metadata();
  await sharp({ create: { width: W, height: H, channels: 4, background: BG } })
    .composite([
      { input: backLayer({ kicker: "HANUBEES", code: "MARKETING · AGENCY", accent: "we run", bigType: "MEDIA" }) },
      { input: bigBee, top: 300, left: Math.round((W - bm.width) / 2) },
      { input: frontLayer({ tag: "HANUBEES MEDIA", lines: wrap("We're a marketing agency producing a high volume of posts & videos to dominate social media.", 32) }) },
    ]).png().toFile(path.join(outDir, "s4.png"));
  console.log("rendered s4.png");
  console.log("DONE ->", outDir);
})().catch((e) => { console.error("ERR", e); process.exit(1); });
