#!/usr/bin/env node
// Multi-slide visual STORY carousels: cover -> stat -> bar chart -> flowchart -> fix.
// Heavy on real numbers + graphic elements. Premium gradient/glass, bee on every slide.
// Modes: `render` (save PNGs to /tmp/story to verify) | `post` (publish to IG + TikTok).
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
const Y = "#ffbe00", G = "#98aa9d", FG = "#eaeaea", MUT = "#8a8a99", RED = "#e0574d";
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function wrap(t, max) { const w = String(t).split(/\s+/), o = []; let c = ""; for (const x of w) { if ((c + " " + x).trim().length > max) { if (c) o.push(c.trim()); c = x; } else c += " " + x; } if (c.trim()) o.push(c.trim()); return o; }

const DEFS = `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d0f1a"/><stop offset="0.55" stop-color="#161a2e"/><stop offset="1" stop-color="#0a0c14"/></linearGradient>
  <radialGradient id="glow" cx="0.82" cy="0.12" r="0.7"><stop offset="0" stop-color="#ffbe00" stop-opacity="0.28"/><stop offset="1" stop-color="#ffbe00" stop-opacity="0"/></radialGradient>
</defs>`;

function frame(inner, idx, total) {
  // common chrome: bg, glow, page dots, footer (bee composited later)
  let dots = "";
  for (let i = 0; i < total; i++) dots += `<rect x="${90 + i * 30}" y="92" width="${i === idx ? 40 : 18}" height="8" rx="4" fill="${i === idx ? Y : "#ffffff"}" fill-opacity="${i === idx ? 1 : 0.25}"/>`;
  return `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">${DEFS}
    <rect width="1080" height="1080" fill="url(#bg)"/><rect width="1080" height="1080" fill="url(#glow)"/>
    ${dots}
    ${inner}
    <text x="90" y="1010" font-family="Space Grotesk, Roboto, sans-serif" font-size="28" font-weight="600" fill="${G}">@hanubees · hanubees.com</text>
  </svg>`;
}

function tx(x, y, s, w, fill, extra = "") { return `<text x="${x}" y="${y}" font-family="Space Grotesk, Roboto, sans-serif" font-size="${s}" font-weight="${w}" fill="${fill}" ${extra}>`; }
function lines(arr, x, y, lh, s, w, fill) { return tx(x, y, s, w, fill) + arr.map((l, i) => `<tspan x="${x}" y="${y + i * lh}">${xml(l)}</tspan>`).join("") + "</text>"; }

// ---- slide builders ----
function coverSlide(s) {
  const hl = wrap(s.headline, 20);
  return frame(`
    ${tx(90, 470, 110, 800, Y, 'letter-spacing="-2"')}${xml(s.emotion)}</text>
    ${lines(hl, 90, 600, 72, 54, 700, FG)}
    ${tx(90, 880, 30, 600, MUT)}swipe →</text>`, 0, s.total);
}
function statSlide(s, idx) {
  // huge number + donut ring for percentage
  const r = 130, cx = 800, cy = 560, circ = 2 * Math.PI * r, dash = (s.pct / 100) * circ;
  return frame(`
    ${lines(wrap(s.statTitle, 16), 90, 250, 56, 44, 700, FG)}
    ${tx(90, 640, 210, 800, Y, 'letter-spacing="-6"')}${xml(s.bigNumber)}</text>
    ${lines(wrap(s.bigLabel, 22), 90, 720, 48, 36, 600, G)}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="34"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${Y}" stroke-width="34" stroke-linecap="round" stroke-dasharray="${dash} ${circ}" transform="rotate(-90 ${cx} ${cy})"/>
    ${tx(cx, cy + 18, 72, 800, FG, 'text-anchor="middle"')}${s.pct}%</text>`, idx, s.total);
}
function barsSlide(s, idx) {
  const max = Math.max(...s.bars.map((b) => b.value));
  let bars = "", y0 = 470;
  s.bars.forEach((b, i) => {
    const w = Math.round((b.value / max) * 760), yy = y0 + i * 150;
    bars += `<text x="90" y="${yy - 16}" font-family="Space Grotesk, Roboto, sans-serif" font-size="34" font-weight="600" fill="${FG}">${xml(b.label)}</text>
      <rect x="90" y="${yy}" width="760" height="58" rx="14" fill="#ffffff" fill-opacity="0.06"/>
      <rect x="90" y="${yy}" width="${w}" height="58" rx="14" fill="${b.color}"/>
      <text x="${Math.min(90 + w + 20, 900)}" y="${yy + 42}" font-family="Space Grotesk, Roboto, sans-serif" font-size="44" font-weight="800" fill="${b.color}">${b.value}</text>`;
  });
  return frame(`${lines(wrap(s.barsTitle, 18), 90, 250, 56, 46, 700, FG)}${bars}`, idx, s.total);
}
function flowSlide(s, idx) {
  // "old way" chain with X vs "new way"
  const box = (x, y, w, label, color, txt) => `<rect x="${x}" y="${y}" width="${w}" height="74" rx="14" fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-opacity="0.5"/><text x="${x + w / 2}" y="${y + 48}" font-family="Space Grotesk, Roboto, sans-serif" font-size="30" font-weight="700" fill="${txt}" text-anchor="middle">${xml(label)}</text>`;
  const arrow = (x, y) => `<text x="${x}" y="${y}" font-family="Space Grotesk, Roboto, sans-serif" font-size="40" fill="${MUT}">↓</text>`;
  let old = "";
  s.flowOld.forEach((l, i) => { old += box(120, 430 + i * 110, 380, l, RED, FG); if (i < s.flowOld.length - 1) old += arrow(300, 430 + i * 110 + 100); });
  let nu = box(640, 560, 360, s.flowNew[0], G, FG) + arrow(810, 660) + box(640, 690, 360, s.flowNew[1], Y, FG);
  return frame(`${lines(wrap(s.flowTitle, 22), 90, 250, 56, 44, 700, FG)}
    <text x="130" y="400" font-family="Space Grotesk, Roboto, sans-serif" font-size="28" font-weight="800" fill="${RED}">THE OLD WAY</text>
    <text x="640" y="530" font-family="Space Grotesk, Roboto, sans-serif" font-size="28" font-weight="800" fill="${Y}">WITH HANUBEES</text>
    ${old}${nu}`, idx, s.total);
}
function ctaSlide(s, idx) {
  return frame(`${tx(90, 420, 40, 800, G, 'letter-spacing="3"')}THE FIX</text>
    ${lines(wrap(s.fix, 22), 90, 510, 64, 50, 700, FG)}
    <rect x="90" y="840" width="600" height="92" rx="46" fill="${Y}"/>
    <text x="390" y="900" text-anchor="middle" font-family="Space Grotesk, Roboto, sans-serif" font-size="40" font-weight="800" fill="#121212">Free → hanubees.com</text>`, idx, s.total);
}

async function toPng(svg) {
  const bee = await sharp("hanubees-marketing-team/assets/brand/bee.png").resize(120, 120, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp(Buffer.from(svg)).composite([{ input: bee, top: 70, left: 880 }]).png().toBuffer();
}

async function buildSlides(s) {
  s.total = 5;
  return Promise.all([
    toPng(coverSlide(s)),
    toPng(statSlide(s, 1)),
    toPng(barsSlide(s, 2)),
    toPng(flowSlide(s, 3)),
    toPng(ctaSlide(s, 4)),
  ]);
}

async function upload(buf) {
  const pre = await (await fetch(`${ZB}/media/presign`, { method: "POST", headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" }, body: JSON.stringify({ filename: "s.png", contentType: "image/png" }) })).json();
  await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": "image/png" }, body: buf });
  return pre.publicUrl;
}

async function sql(q) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_REF}/database/query`,
    { method: "POST", headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
  if (!r.ok) throw new Error("sql: " + (await r.text()).slice(0, 200));
  return r.json();
}
const esc = (s) => String(s).replace(/'/g, "''");

// Build an all-TRUE story straight from a city's live numbers (no fabrication).
function buildStory(row) {
  const total = +row.total, noPhone = +row.no_phone, noSite = +row.no_site, reachable = +row.reachable;
  const pct = Math.round((noPhone / total) * 100);
  return {
    emotion: "INVISIBLE",
    headline: `We mapped ${total} businesses in ${row.city}. Most can't be reached online.`,
    statTitle: "Businesses with NO phone you can find:",
    bigNumber: String(noPhone), bigLabel: `out of ${total} ${row.city} businesses`, pct,
    barsTitle: `Across ${total} ${row.city} businesses`,
    bars: [
      { label: "No phone online", value: noPhone, color: Y },
      { label: "No website at all", value: noSite, color: RED },
      { label: "Listed & reachable", value: reachable, color: G },
    ],
    flowTitle: "How customers reach a business today",
    flowOld: ["Google it", "Open the map", "Hunt the website", "Call & wait"],
    flowNew: ["Ask Hanubees", "Instant answer"],
    fix: "Every business gets a free AI that answers customers 24/7 — and gets it found.",
    caption_ig: `We mapped ${total} ${row.city} businesses. ${noPhone} have no phone you can find, ${noSite} have no website at all. That's customers lost every single day.\n\nHanubees gives every business a free AI that answers instantly — and gets it found.\n\nFree → hanubees.com\n#${row.city.replace(/\s+/g, "")} #smallbusiness #AI #marketing #Hanubees`,
    caption_tt: `${total} ${row.city} businesses, ${noPhone} unreachable online. Hanubees fixes it free.`.slice(0, 90),
  };
}

// Marketing focus = Australia + USA (Indian audience hard to monetize).
const TARGETS = ["Los Angeles", "Melbourne", "Sydney", "Brisbane", "Perth", "Adelaide",
  "San Francisco", "New York", "Chicago", "Austin", "Seattle", "Miami", "San Diego"];

// Pick the next city to post: a target city with enough real data, not posted before (then oldest).
async function nextCity() {
  const list = TARGETS.map((c) => `'${esc(c)}'`).join(",");
  const rows = await sql(`
    select coalesce(a.city,'?') city, count(*) total,
      count(*) filter (where a.phone is null) no_phone,
      count(*) filter (where a.website is null) no_site,
      count(*) filter (where a.phone is not null) reachable,
      max(l.posted_at) last_posted
    from accounts a left join story_log l on l.city = a.city
    where a.city in (${list})
    group by 1 having count(*) >= 40
    order by (max(l.posted_at) is null) desc, max(l.posted_at) asc, count(*) desc
    limit 1;`);
  return rows[0] || null;
}

async function publish(story) {
  const slides = await buildSlides(story);
  const urls = [];
  for (const b of slides) urls.push(await upload(b));
  const media = urls.map((u) => ({ url: u, type: "image" }));
  const accs = await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${K}`, Accept: "application/json" } })).json();
  const ok = [];
  for (const a of accs.accounts || []) {
    const cap = a.platform === "tiktok" ? story.caption_tt : story.caption_ig;
    const res = await fetch(`${ZB}/posts`, { method: "POST", headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" }, body: JSON.stringify({ content: cap, mediaItems: media, platforms: [{ platform: a.platform, accountId: a._id }], publishNow: true }) });
    if (res.ok) { ok.push(a.platform); console.log(a.platform, "PUBLISHED ✓"); }
    else console.log(a.platform, "FAILED:", (await res.text()).slice(0, 160));
  }
  return ok;
}

// Fallback hardcoded LA story (used only if no city resolved)
const STORY_FALLBACK = {
  emotion: "INVISIBLE",
  headline: "We mapped 979 businesses in Los Angeles. Most can't be reached online.",
  statTitle: "Businesses with NO phone you can find:",
  bigNumber: "540", bigLabel: "out of 979 LA businesses", pct: 55,
  barsTitle: "Across 979 LA businesses",
  bars: [{ label: "No phone online", value: 540, color: Y }, { label: "No website at all", value: 472, color: RED }, { label: "Listed & reachable", value: 439, color: G }],
  flowTitle: "How customers reach a business today",
  flowOld: ["Google it", "Open the map", "Hunt the website", "Call & wait"],
  flowNew: ["Ask Hanubees", "Instant answer"],
  fix: "Every business gets a free AI that answers customers 24/7 — and gets it found.",
  caption_ig: "We mapped 979 Los Angeles businesses. 540 have no phone you can find, 472 have no website at all.\n\nFree → hanubees.com\n#LosAngeles #smallbusiness #AI #Hanubees",
  caption_tt: "979 LA businesses, 540 unreachable online. Hanubees fixes it free.",
};

(async () => {
  const mode = process.argv[2] || "render";
  const cityArg = process.argv[3];

  // resolve which city's story to build
  const useNext = mode === "auto" || cityArg === "auto";
  const explicitCity = cityArg && cityArg !== "auto" ? cityArg : null;
  let story = STORY_FALLBACK;
  if (useNext || explicitCity) {
    let row;
    if (explicitCity) {
      const rows = await sql(`select '${esc(explicitCity)}' city, count(*) total, count(*) filter (where phone is null) no_phone, count(*) filter (where website is null) no_site, count(*) filter (where phone is not null) reachable from accounts where city='${esc(explicitCity)}';`);
      row = rows[0];
    } else { row = await nextCity(); }
    if (!row || +row.total < 1) { console.log("no eligible city with real data."); return; }
    story = buildStory(row);
    story._city = row.city;
  }

  if (mode === "render") {
    const slides = await buildSlides(story);
    fs.mkdirSync("/tmp/story", { recursive: true });
    slides.forEach((b, i) => fs.writeFileSync(`/tmp/story/slide${i + 1}.png`, b));
    console.log(`rendered 5 slides for "${story._city || "LA"}" -> /tmp/story/slide1..5.png  (caption_tt len:`, story.caption_tt.length, ")");
    return;
  }

  // post / auto: publish + log
  const ok = await publish(story);
  if (ok.length && story._city) {
    await sql(`insert into story_log (city, slides, platforms) values ('${esc(story._city)}', 5, '${ok.join("+")}');`);
    console.log("logged story_log for", story._city, "->", ok.join("+"));
  }
})();
