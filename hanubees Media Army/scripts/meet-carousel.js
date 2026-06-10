#!/usr/bin/env node
require("./_env");
// "MEET THE 540" — 7-slide story carousel in the viral uncover.ai "MEET X" format.
// Hook (giant number) -> scale -> OLD WAY flowchart -> data bars -> hidden cost -> THE FIX flowchart -> CTA.
// All numbers pulled LIVE from the DB (never fabricated). Brand assets + Space Grotesk + bee on every slide.
// Modes: render [city]  |  post [city]    (default city = Los Angeles)
const fs = require("fs");
const sharp = require("sharp");
function loadEnv() { try { for (const l of fs.readFileSync(".env.local", "utf8").split("\n")) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, ""); } } catch {} }
loadEnv();
function setupFonts() {
  try {
    const dir = process.cwd() + "/hanubees-marketing-team/assets/brand/fonts";
    fs.mkdirSync("/tmp/fonts", { recursive: true }); fs.mkdirSync("/tmp/fontcache", { recursive: true });
    fs.writeFileSync("/tmp/fonts/fonts.conf",
      `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>` +
      `<dir>${dir}</dir>` + (fs.existsSync("/system/fonts") ? `<dir>/system/fonts</dir>` : ``) +
      `<cachedir>/tmp/fontcache</cachedir>` +
      `<match target="pattern"><test qual="any" name="family"><string>sans-serif</string></test><edit name="family" mode="assign" binding="same"><string>Space Grotesk</string></edit></match>` +
      `<match target="pattern"><test qual="any" name="family"><string>Arial</string></test><edit name="family" mode="assign" binding="same"><string>Space Grotesk</string></edit></match></fontconfig>`);
    process.env.FONTCONFIG_FILE = "/tmp/fonts/fonts.conf";
  } catch {}
}
setupFonts();

const K = process.env.ZERNIO_API_KEY; const ZB = "https://api.zernio.com/v1";
const { postImages } = require("./zernio.js");
const Y = "#ffbe00", G = "#98aa9d", FG = "#eaeaea", MUT = "#8a8a99", RED = "#e0574d";
const FF = "Space Grotesk, Roboto, sans-serif";
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const DEFS = `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d0f1a"/><stop offset="0.55" stop-color="#161a2e"/><stop offset="1" stop-color="#0a0c14"/></linearGradient>
  <radialGradient id="glow" cx="0.82" cy="0.1" r="0.75"><stop offset="0" stop-color="#ffbe00" stop-opacity="0.26"/><stop offset="1" stop-color="#ffbe00" stop-opacity="0"/></radialGradient>
  <radialGradient id="glow2" cx="0.1" cy="0.95" r="0.7"><stop offset="0" stop-color="#98aa9d" stop-opacity="0.18"/><stop offset="1" stop-color="#98aa9d" stop-opacity="0"/></radialGradient>
</defs>`;

// inline rich text: segs = [{t, c?}] rendered as one <text> with colored tspans
function rich(segs, x, y, size, weight, anchor = "start") {
  //   (nbsp) at segment edges so the SVG renderer doesn't collapse boundary spaces
  const inner = segs.map((s) => `<tspan fill="${s.c || FG}">${xml(s.t).replace(/ /g, "&#160;")}</tspan>`).join("");
  return `<text x="${x}" y="${y}" font-family="${FF}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" xml:space="preserve">${inner}</text>`;
}
function t(x, y, s, w, fill, extra = "") { return `<text x="${x}" y="${y}" font-family="${FF}" font-size="${s}" font-weight="${w}" fill="${fill}" ${extra}>`; }

function frame(inner, idx, total) {
  return `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">${DEFS}
    <rect width="1080" height="1080" fill="url(#bg)"/>
    <rect width="1080" height="1080" fill="url(#glow)"/>
    <rect width="1080" height="1080" fill="url(#glow2)"/>
    ${t(205, 108, 30, 700, FG)}@hanubees</text>
    ${t(990, 108, 30, 700, MUT, 'text-anchor="end"')}${idx + 1}/${total}</text>
    ${inner}
    ${t(90, 1018, 26, 600, G)}hanubees.com · free to ask</text>
  </svg>`;
}

// flowchart helpers (vertical chain of numbered steps)
function stepBox(x, y, w, h, n, label, accent) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${accent}" fill-opacity="0.12" stroke="${accent}" stroke-opacity="0.55" stroke-width="1.5"/>
    <circle cx="${x + 42}" cy="${y + h / 2}" r="24" fill="${accent}"/>
    <text x="${x + 42}" y="${y + h / 2 + 11}" font-family="${FF}" font-size="32" font-weight="800" fill="#121212" text-anchor="middle">${n}</text>
    <text x="${x + 86}" y="${y + h / 2 + 11}" font-family="${FF}" font-size="34" font-weight="700" fill="${FG}">${xml(label)}</text>`;
}
function vArrow(x, y) { return `<text x="${x}" y="${y}" font-family="${FF}" font-size="38" fill="${MUT}" text-anchor="middle">↓</text>`; }

// ---- 7 slides ----
function s1_hook(d, i, total) {
  return frame(`
    ${t(540, 320, 46, 700, G, 'text-anchor="middle" letter-spacing="10"')}MEET</text>
    <rect x="270" y="360" width="540" height="300" rx="36" fill="#ffffff" fill-opacity="0.05" stroke="${Y}" stroke-opacity="0.4" stroke-width="2"/>
    ${t(540, 615, 250, 800, Y, 'text-anchor="middle" letter-spacing="-6"')}${d.noPhone}</text>
    ${rich([{ t: "the " }, { t: d.city }, { t: " businesses your" }], 540, 760, 50, 700, "middle")}
    ${rich([{ t: "customers " }, { t: "can’t reach", c: RED }, { t: "." }], 540, 822, 50, 700, "middle")}
    ${t(540, 905, 30, 600, MUT, 'text-anchor="middle"')}We mapped ${d.total}. ${d.pct}% have no findable phone.</text>
    ${t(90, 980, 30, 700, Y)}swipe →</text>`, i, total);
}
function s2_scale(d, i, total) {
  return frame(`
    ${t(90, 250, 34, 800, G, 'letter-spacing="4"')}THE SCALE</text>
    ${t(90, 430, 190, 800, Y, 'letter-spacing="-4"')}${d.total}</text>
    ${rich([{ t: "businesses mapped in" }], 90, 510, 52, 700)}
    ${rich([{ t: "one city — ", }, { t: d.city, c: Y }, { t: "." }], 90, 575, 52, 700)}
    ${t(90, 760, 190, 800, RED, 'letter-spacing="-4"')}${d.pct}%</text>
    ${rich([{ t: "have " }, { t: "no phone number", c: RED }], 90, 840, 50, 700)}
    ${rich([{ t: "a customer can find." }], 90, 902, 50, 700)}`, i, total);
}
function s3_oldway(d, i, total) {
  const steps = ["Google the business", "Open the map", "Hunt for a website", "Call — and wait"];
  let y0 = 320, h = 96, gap = 34, parts = "";
  steps.forEach((s, k) => { const yy = y0 + k * (h + gap); parts += stepBox(120, yy, 840, h, k + 1, s, RED); if (k < steps.length - 1) parts += vArrow(162, yy + h + 27); });
  const lastY = y0 + (steps.length - 1) * (h + gap) + h;
  return frame(`
    ${t(90, 230, 44, 800, FG)}How customers reach a</text>
    ${rich([{ t: "business " }, { t: "today", c: RED }], 90, 285, 44, 800)}
    ${parts}
    ${t(540, lastY + 70, 32, 700, MUT, 'text-anchor="middle"')}4 steps. Often, no answer.</text>`, i, total);
}
function s4_data(d, i, total) {
  const bars = [{ l: "No phone online", v: d.noPhone, c: Y }, { l: "No website at all", v: d.noSite, c: RED }, { l: "Listed & reachable", v: d.reachable, c: G }];
  const max = Math.max(...bars.map((b) => b.v));
  let y0 = 400, out = "";
  bars.forEach((b, k) => { const w = Math.round((b.v / max) * 740), yy = y0 + k * 150;
    out += `<text x="90" y="${yy - 16}" font-family="${FF}" font-size="34" font-weight="600" fill="${FG}">${xml(b.l)}</text>
      <rect x="90" y="${yy}" width="740" height="58" rx="14" fill="#ffffff" fill-opacity="0.06"/>
      <rect x="90" y="${yy}" width="${w}" height="58" rx="14" fill="${b.c}"/>
      <text x="${Math.min(90 + w + 20, 880)}" y="${yy + 44}" font-family="${FF}" font-size="46" font-weight="800" fill="${b.c}">${b.v}</text>`; });
  return frame(`${t(90, 250, 46, 800, FG)}The data behind it</text>
    ${t(90, 312, 30, 600, MUT)}Across ${d.total} ${d.city} businesses</text>${out}`, i, total);
}
function s5_cost(d, i, total) {
  return frame(`
    ${t(90, 250, 34, 800, G, 'letter-spacing="4"')}THE HIDDEN COST</text>
    ${rich([{ t: "When " }, { t: d.pct + "%", c: RED }, { t: " can’t be" }], 90, 470, 60, 700)}
    ${rich([{ t: "reached, customers" }], 90, 545, 60, 700)}
    ${rich([{ t: "don’t wait — they" }], 90, 620, 60, 700)}
    ${rich([{ t: "call the ", }, { t: "next name", c: Y }, { t: " on" }], 90, 695, 60, 700)}
    ${rich([{ t: "the list." }], 90, 770, 60, 700)}
    ${t(90, 880, 30, 600, MUT)}Every missed question = a lost customer.</text>`, i, total);
}
function s6_fix(d, i, total) {
  return frame(`
    ${t(90, 230, 44, 800, FG)}The fix:</text>
    ${rich([{ t: "from ", }, { t: "4 steps", c: RED }, { t: " to ", }, { t: "1 question", c: Y }], 90, 290, 44, 800)}
    ${stepBox(120, 430, 840, 110, 1, "Ask Hanubees anything", G)}
    ${vArrow(162, 580)}
    ${stepBox(120, 610, 840, 110, 2, "Instant answer — 24/7", Y)}
    ${t(540, 820, 34, 700, FG, 'text-anchor="middle"')}No calling. No waiting. No 5 tabs.</text>`, i, total);
}
function s7_cta(d, i, total) {
  return frame(`
    ${t(90, 380, 40, 800, G, 'letter-spacing="3"')}THE OFFER</text>
    ${rich([{ t: "Every business gets a" }], 90, 470, 52, 700)}
    ${rich([{ t: "free AI", c: Y }, { t: " that answers" }], 90, 535, 52, 700)}
    ${rich([{ t: "customers " }, { t: "24/7", c: Y }, { t: " — and" }], 90, 600, 52, 700)}
    ${rich([{ t: "gets it found." }], 90, 665, 52, 700)}
    <rect x="90" y="800" width="620" height="96" rx="48" fill="${Y}"/>
    ${t(400, 862, 42, 800, "#121212", 'text-anchor="middle"')}Free → hanubees.com</text>`, i, total);
}

async function toPng(svg) {
  const bee = await sharp("hanubees-marketing-team/assets/brand/bee.png").resize(110, 110, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp(Buffer.from(svg)).composite([{ input: bee, top: 56, left: 84 }]).png().toBuffer();
}

// photo-hero version of slide 1 (viral "MEET X" look: relevant image up top, text band below)
async function heroPng(d, i, total, photoPath) {
  const W = 1080, PH = 620;
  const photo = await sharp(photoPath).resize(W, PH, { fit: "cover", position: process.env.CROP || "attention" }).modulate({ brightness: 0.6, saturation: 0.62 }).toBuffer();
  const base = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">${DEFS}<rect width="1080" height="1080" fill="url(#bg)"/></svg>`;
  const scrim = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg"><defs>
    <linearGradient id="tf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0c14" stop-opacity="0.62"/><stop offset="0.22" stop-color="#0a0c14" stop-opacity="0"/></linearGradient>
    <linearGradient id="bf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0c14" stop-opacity="0"/><stop offset="0.75" stop-color="#0a0c14" stop-opacity="0.92"/><stop offset="1" stop-color="#0a0c14" stop-opacity="1"/></linearGradient></defs>
    <rect x="0" y="0" width="1080" height="${PH}" fill="url(#tf)"/>
    <rect x="0" y="${PH - 300}" width="1080" height="${1080 - (PH - 300)}" fill="url(#bf)"/></svg>`;
  const txt = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    ${t(205, 108, 30, 700, FG)}@hanubees</text>
    ${t(990, 108, 30, 700, "#d4d5db", 'text-anchor="end"')}${i + 1}/${total}</text>
    ${t(540, 712, 42, 700, G, 'text-anchor="middle" letter-spacing="8"')}MEET THE</text>
    ${t(540, 882, 180, 800, Y, 'text-anchor="middle" letter-spacing="-6"')}${d.noPhone}</text>
    ${rich([{ t: "the " }, { t: d.city }, { t: " businesses your" }], 540, 955, 46, 700, "middle")}
    ${rich([{ t: "customers " }, { t: "can’t reach", c: RED }, { t: "." }], 540, 1008, 46, 700, "middle")}
    ${t(90, 1055, 28, 700, Y)}swipe →</text>
  </svg>`;
  const bee = await sharp("hanubees-marketing-team/assets/brand/bee.png").resize(110, 110, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp(Buffer.from(base)).composite([
    { input: photo, top: 0, left: 0 },
    { input: Buffer.from(scrim), top: 0, left: 0 },
    { input: Buffer.from(txt), top: 0, left: 0 },
    { input: bee, top: 56, left: 84 },
  ]).png().toBuffer();
}

async function buildSlides(d, heroPath) {
  const T = 7;
  const rest = [s2_scale, s3_oldway, s4_data, s5_cost, s6_fix, s7_cta].map((fn, k) => toPng(fn(d, k + 1, T)));
  const first = heroPath ? heroPng(d, 0, T, heroPath) : toPng(s1_hook(d, 0, T));
  return Promise.all([first, ...rest]);
}

async function sql(q) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_REF}/database/query`,
    { method: "POST", headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
  if (!r.ok) throw new Error("sql: " + (await r.text()).slice(0, 200)); return r.json();
}
const escq = (s) => String(s).replace(/'/g, "''");

async function cityData(city) {
  const rows = await sql(`select '${escq(city)}' city, count(*) total, count(*) filter (where phone is null) no_phone, count(*) filter (where website is null) no_site, count(*) filter (where phone is not null) reachable from accounts where city='${escq(city)}';`);
  const r = rows[0]; const total = +r.total;
  return { city, total, noPhone: +r.no_phone, noSite: +r.no_site, reachable: +r.reachable, pct: Math.round((+r.no_phone / total) * 100) };
}

async function upload(buf) {
  const pre = await (await fetch(`${ZB}/media/presign`, { method: "POST", headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" }, body: JSON.stringify({ filename: "m.png", contentType: "image/png" }) })).json();
  await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": "image/png" }, body: buf });
  return pre.publicUrl;
}

(async () => {
  const mode = process.argv[2] || "render";
  const city = process.argv[3] || "Los Angeles";
  const heroPath = process.argv[4] || process.env.HERO_IMG || null; // optional relevant photo for slide 1
  const d = await cityData(city);
  if (!d.total) { console.log("no data for", city); return; }
  const slides = await buildSlides(d, heroPath);

  if (mode === "render") {
    fs.mkdirSync("/tmp/meet", { recursive: true });
    slides.forEach((b, i) => fs.writeFileSync(`/tmp/meet/slide${i + 1}.png`, b));
    console.log(`rendered 7 MEET slides for ${city} -> /tmp/meet/slide1..7.png`);
    return;
  }

  const cap_ig = `MEET THE ${d.noPhone}.\n\nWe mapped ${d.total} businesses in ${city}. ${d.noPhone} have no phone a customer can find (${d.pct}%), ${d.noSite} have no website at all. When people can't reach you, they call the next name on the list.\n\nHanubees gives every business a free AI that answers customers instantly, 24/7 — and gets it found.\n\nFree → hanubees.com\n#${city.replace(/\s+/g, "")} #smallbusiness #AI #marketing #Hanubees`;
  const cap_tt = `MEET THE ${d.noPhone}: ${city} shops customers can't reach. Hanubees fixes it free.`.slice(0, 90);

  const ok = await postImages(slides, cap_ig, cap_tt); // IG + TikTok + Threads
  if (ok.length) { await sql(`insert into story_log (city, slides, platforms) values ('${escq(city + " (MEET)")}', 7, '${ok.join("+")}');`); console.log("logged:", city, "MEET ->", ok.join("+")); }
})();
