#!/usr/bin/env node
require("./_env");
// "Growth Tips for <Profession>" — 4-slide carousel:
//   slide 1 = hub-and-spoke infographic (the saveable one)
//   slides 2-3 = explain the tips (why they work)
//   slide 4 = how Hanubees helps (the connect)
// Plus a daily QUEUE + auto-poster that drips one profession across the day to IG + TikTok.
// Modes: render <prof> [theme] | post <prof> [theme] | seed-queue | auto
const fs = require("fs");
const sharp = require("sharp");
function loadEnv() { try { for (const l of fs.readFileSync(".env.local", "utf8").split("\n")) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, ""); } } catch {} }
loadEnv();
function setupFonts() {
  try {
    const dir = process.cwd() + "/hanubees-marketing-team/assets/brand/fonts";
    fs.mkdirSync("/tmp/fonts", { recursive: true }); fs.mkdirSync("/tmp/fontcache", { recursive: true });
    fs.writeFileSync("/tmp/fonts/fonts.conf", `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${dir}</dir>${fs.existsSync("/system/fonts") ? "<dir>/system/fonts</dir>" : ""}<cachedir>/tmp/fontcache</cachedir><match target="pattern"><test qual="any" name="family"><string>sans-serif</string></test><edit name="family" mode="assign" binding="same"><string>Space Grotesk</string></edit></match><match target="pattern"><test qual="any" name="family"><string>Arial</string></test><edit name="family" mode="assign" binding="same"><string>Space Grotesk</string></edit></match></fontconfig>`);
    process.env.FONTCONFIG_FILE = "/tmp/fonts/fonts.conf";
  } catch {}
}
setupFonts();

const K = process.env.ZERNIO_API_KEY; const ZB = "https://api.zernio.com/v1";
const { postImages } = require("./zernio.js");
const Y = "#ffbe00", DARK = "#121212";
const FF = "Space Grotesk, Roboto, sans-serif";
const W = 1080, H = 1350;
const BEE = "hanubees-marketing-team/assets/brand/bee.png";
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function wrap(t, max) { const w = String(t).split(/\s+/), o = []; let c = ""; for (const x of w) { if ((c + " " + x).trim().length > max) { if (c) o.push(c.trim()); c = x; } else c += " " + x; } if (c.trim()) o.push(c.trim()); return o; }

const THEMES = {
  dark: { bgIsLight: false, headline: "#eaeaea", body: "#cfd0d6", pill: Y, pillText: DARK, note: "#9a9aa6", line: Y, lineOp: 0.45,
    nodeFill: "#1d1f27", nodeRing: Y, nodeIcon: Y, labelPill: Y, labelText: DARK, tip: "#eaeaea", footer: "#98aa9d", hubFill: "#1d1f27", hubRing: Y,
    bgRect: `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d0f1a"/><stop offset="0.6" stop-color="#15182a"/><stop offset="1" stop-color="#0a0c14"/></linearGradient><radialGradient id="gl" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#ffbe00" stop-opacity="0.15"/><stop offset="1" stop-color="#ffbe00" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#gl)"/>` },
  light: { bgIsLight: true, headline: "#1a1712", body: "#3a362e", pill: Y, pillText: "#1a1712", note: "#7a756b", line: "#caa106", lineOp: 0.85,
    nodeFill: "#ffffff", nodeRing: "#e0b400", nodeIcon: "#1a1712", labelPill: "#1a1712", labelText: "#ffffff", tip: "#2b2a26", footer: "#9a9384", hubFill: "#ffffff", hubRing: "#e0b400",
    bgRect: `<defs><radialGradient id="gl" cx="0.5" cy="0.45" r="0.75"><stop offset="0" stop-color="#fbf7ee"/><stop offset="1" stop-color="#efe8da"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#gl)"/>` },
};

const IC = {
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  star: `<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 22.3 6.8 19.6l1-5.8-4.3-4.1 5.9-.9z"/>`,
  camera: `<rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l1.5-2.5h5L16 7"/>`,
  tag: `<path d="M3 12l8-8 9 1 1 9-8 8z"/><circle cx="15" cy="9" r="1.6"/>`,
  pin: `<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/>`,
  cal: `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>`,
  bolt: `<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>`,
  up: `<path d="M4 17l6-6 4 4 6-7"/><path d="M20 8v4h-4"/>`,
  bee: `<ellipse cx="12" cy="13" rx="5.5" ry="6.5"/><path d="M6.6 10h10.8M6.6 13h10.8M7 16h10"/><path d="M9 5.5l2 3M15 5.5l-2 3"/>`,
};
function icon(name, x, y, size, color) { const s = size / 24; return `<g transform="translate(${x - size / 2} ${y - size / 2}) scale(${s})" fill="none" stroke="${color}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${IC[name] || IC.star}</g>`; }
const txt = (x, y, s, w, fill, extra = "") => `<text x="${x}" y="${y}" font-family="${FF}" font-size="${s}" font-weight="${w}" fill="${fill}" ${extra}>`;
function footer(T) { return `${txt(540, 1308, 25, 700, T.footer, 'text-anchor="middle"')}@hanubees · free AI for local businesses · hanubees.com</text>`; }

// ---------- slide 1: hub-and-spoke infographic ----------
function node(cx, cy, ic, label, tip, side, T) {
  const r = 56;
  const ring = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${T.nodeFill}" stroke="${T.nodeRing}" stroke-width="2.5"/>${icon(ic, cx, cy, 50, T.nodeIcon)}`;
  const lw = label.length * 17 + 36, lx = cx - lw / 2, ly = cy + r + 8;
  const pill = `<rect x="${lx}" y="${ly}" width="${lw}" height="40" rx="20" fill="${T.labelPill}"/>${txt(cx, ly + 27, 22, 800, T.labelText, 'text-anchor="middle"')}${xml(label)}</text>`;
  const tl = wrap(tip, 15), anchor = side === "L" ? "end" : "start", tx = side === "L" ? cx - r - 22 : cx + r + 22, ty = cy - (tl.length - 1) * 15;
  const tspans = tl.map((l, i) => `<tspan x="${tx}" dy="${i === 0 ? 0 : 28}">${xml(l)}</tspan>`).join("");
  return ring + pill + `${txt(tx, ty, 23, 600, T.tip, `text-anchor="${anchor}"`)}${tspans}</text>`;
}
function dottedLine(x1, y1, x2, y2, T) { return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${T.line}" stroke-opacity="${T.lineOp}" stroke-width="3" stroke-dasharray="2 12" stroke-linecap="round"/>`; }
function infographicSvg(p, T) {
  const hub = { x: 540, y: 720 }, L = [450, 710, 970], lx = 340, rx = 740;
  const slots = [{ x: lx, y: L[0], side: "L" }, { x: lx, y: L[1], side: "L" }, { x: lx, y: L[2], side: "L" }, { x: rx, y: L[0], side: "R" }, { x: rx, y: L[1], side: "R" }, { x: rx, y: L[2], side: "R" }];
  let lines = "", nodes = "";
  p.tips.forEach((t, i) => { const s = slots[i]; lines += dottedLine(hub.x, hub.y, s.x, s.y, T); nodes += node(s.x, s.y, t.icon, t.label, t.tip, s.side, T); });
  const head = wrap(p.title, 16), headSvg = head.map((l, i) => `<tspan x="540" dy="${i === 0 ? 0 : 78}">${xml(l)}</tspan>`).join("");
  const subW = p.sub.length * 16 + 64, subY = head.length > 1 ? 285 : 205;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${T.bgRect}
    ${txt(540, 120, 68, 800, T.headline, 'text-anchor="middle" letter-spacing="-2"')}${headSvg}</text>
    <rect x="${540 - subW / 2}" y="${subY}" width="${subW}" height="58" rx="29" fill="${T.pill}"/>${txt(540, subY + 39, 27, 800, T.pillText, 'text-anchor="middle"')}${xml(p.sub)}</text>
    ${txt(540, subY + 88, 21, 600, T.note, 'text-anchor="middle"')}${xml(p.note || "")}</text>
    ${lines}<circle cx="${hub.x}" cy="${hub.y}" r="108" fill="${T.hubFill}" stroke="${T.hubRing}" stroke-width="2.5"/>${nodes}${footer(T)}</svg>`;
}

// ---------- slides 2-3: explainer ----------
const WHY = {
  speed: "Customers rarely wait. Reply within minutes and you win the jobs slower rivals lose.",
  reviews: "Reviews are the #1 trust signal. Most happy clients say yes — you just have to ask.",
  proof: "Photos of your work sell harder than words. Post them consistently.",
  pricing: "Clear pricing removes hesitation. Hidden prices send people to the next name.",
  local: "Show up when nearby customers search by listing every area you serve.",
  rebook: "Locking in the next visit turns one-off jobs into steady, repeat revenue.",
  upsell: "A simple add-on at checkout lifts the value of every booking.",
  safety: "Free checks build trust fast — and open the door to bigger jobs.",
};
function explainerSvg(p, T, items, kicker) {
  let blocks = "";
  const y0 = 320, step = items.length >= 3 ? 300 : 340;
  items.forEach((it, i) => {
    const top = y0 + i * step, cx = 175, cy = top + 60;
    blocks += `<circle cx="${cx}" cy="${cy}" r="50" fill="${T.nodeFill}" stroke="${T.nodeRing}" stroke-width="2.5"/>${icon(it.icon, cx, cy, 46, T.nodeIcon)}`;
    const tipL = wrap(it.tip, 24);
    blocks += `${txt(258, top + 40, 38, 800, T.headline)}${tipL.map((l, k) => `<tspan x="258" dy="${k === 0 ? 0 : 42}">${xml(l)}</tspan>`).join("")}</text>`;
    const whyL = wrap(WHY[it.type] || "", 36), wy = top + 40 + tipL.length * 42 + 6;
    blocks += `${txt(258, wy, 27, 500, T.body)}${whyL.map((l, k) => `<tspan x="258" dy="${k === 0 ? 0 : 34}">${xml(l)}</tspan>`).join("")}</text>`;
  });
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${T.bgRect}
    ${txt(540, 150, 60, 800, T.headline, 'text-anchor="middle" letter-spacing="-1"')}${xml(kicker)}</text>
    ${txt(540, 210, 27, 600, T.note, 'text-anchor="middle"')}${xml(p.title)}</text>
    ${blocks}${footer(T)}</svg>`;
}

// ---------- slide 4: how Hanubees helps ----------
function helpSvg(p, T) {
  const role = p.title.replace(/^Growth Tips for /, "").replace(/s$/, "").toLowerCase();
  const v = wrap(`Hanubees gives your ${role} business a free AI that answers every customer instantly, 24/7 — so you never lose a lead to a missed call or DM.`, 30);
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${T.bgRect}
    ${txt(540, 150, 60, 800, T.headline, 'text-anchor="middle" letter-spacing="-1"')}How Hanubees helps</text>
    ${txt(540, 300, 36, 700, T.body, 'text-anchor="middle"')}Most of these come down to</text>
    ${txt(540, 350, 36, 700, T.body, 'text-anchor="middle"')}one thing: <tspan fill="${T.pillText === DARK ? '#caa106' : '#caa106'}" font-weight="800">answering fast.</tspan></text>
    <circle cx="540" cy="640" r="150" fill="${T.hubFill}" stroke="${T.hubRing}" stroke-width="3"/>
    ${v.map((l, i) => `${txt(540, 830 + i * 44, 32, 600, T.headline, 'text-anchor="middle"')}${xml(l)}</text>`).join("")}
    <rect x="290" y="${830 + v.length * 44 + 26}" width="500" height="90" rx="45" fill="${Y}"/>${txt(540, 830 + v.length * 44 + 84, 37, 800, DARK, 'text-anchor="middle"')}Free → hanubees.com</text>
    ${footer(T)}</svg>`;
}

async function raster(svg, bee) {
  const comps = [];
  if (bee) { const b = await sharp(BEE).resize(bee.size, bee.size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(); comps.push({ input: b, top: bee.top, left: bee.left }); }
  return sharp(Buffer.from(svg)).composite(comps).png().toBuffer();
}

async function buildSlides(prof, theme) {
  const p = PROFS[prof]; if (!p) { console.log("unknown profession:", prof, "\noptions:", Object.keys(PROFS).join(", ")); process.exit(1); }
  const T = THEMES[theme] || THEMES.light;
  const tips5 = p.tips.filter((t) => t.type !== "hanubees");
  return Promise.all([
    raster(infographicSvg(p, T), { size: 190, top: 720 - 95, left: 540 - 95 }),
    raster(explainerSvg(p, T, tips5.slice(0, 3), "Why these work"), { size: 60, top: 48, left: 56 }),
    raster(explainerSvg(p, T, tips5.slice(3), "More ways to grow"), { size: 60, top: 48, left: 56 }),
    raster(helpSvg(p, T), { size: 230, top: 640 - 115, left: 540 - 115 }),
  ]);
}

async function upload(buf) {
  const pre = await (await fetch(`${ZB}/media/presign`, { method: "POST", headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" }, body: JSON.stringify({ filename: "g.png", contentType: "image/png" }) })).json();
  await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": "image/png" }, body: buf });
  return pre.publicUrl;
}
async function sql(q) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_REF}/database/query`, { method: "POST", headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
  if (!r.ok) throw new Error("sql: " + (await r.text()).slice(0, 200)); return r.json();
}
function captions(prof) {
  const p = PROFS[prof], tips = p.tips.filter((t) => t.type !== "hanubees").map((t) => "• " + t.tip).join("\n");
  const ig = `${p.title} 🐝\n\nThe ones that grow fastest do these:\n${tips}\n\nThe biggest? Speed — 78% of customers hire whoever replies first (MIT). Hanubees gives you a free AI that answers instantly, 24/7.\nFree → hanubees.com\n#${prof.replace(/-/g, "")} #smallbusiness #growthtips #localbusiness #Hanubees`;
  const tt = `${p.title}: ${p.tips.length - 1} ways to win more customers + a free 24/7 AI.`.slice(0, 90);
  return { ig, tt };
}
async function publish(prof, theme) {
  const slides = await buildSlides(prof, theme);
  const cap = captions(prof);
  return await postImages(slides, cap.ig, cap.tt); // IG + TikTok + Threads (both keys)
}

// ---------- profession data ----------
const T_ = (icon, label, tip, type) => ({ icon, label, tip, type });
const tSpeed = T_("clock", "Speed", "Reply within 5 minutes", "speed");
const tRev = T_("star", "Reviews", "Ask for Google reviews", "reviews");
const tHanu = T_("bee", "Hanubees", "Free 24/7 AI receptionist", "hanubees");
const SUB = "Steal these before your competitor does";
const NOTE = "78% of customers hire whoever replies first — MIT study";
function P(title, mid) { return { title, sub: SUB, note: NOTE, tips: [tSpeed, tRev, ...mid, tHanu] }; }
const PROFS = {
  // Trades
  plumber: P("Growth Tips for Plumbers", [T_("camera", "Proof", "Post before/after pics", "proof"), T_("tag", "Pricing", "Show upfront pricing", "pricing"), T_("pin", "Local", "List your service areas", "local")]),
  electrician: P("Growth Tips for Electricians", [T_("bolt", "Safety", "Offer free safety checks", "safety"), T_("tag", "Pricing", "Give fixed quotes", "pricing"), T_("pin", "Local", "List areas covered", "local")]),
  hvac: P("Growth Tips for HVAC Pros", [T_("cal", "Tune-ups", "Sell seasonal maintenance", "rebook"), T_("tag", "Pricing", "Quote fixed prices", "pricing"), T_("pin", "Local", "List service areas", "local")]),
  handyman: P("Growth Tips for Handymen", [T_("camera", "Proof", "Post finished jobs", "proof"), T_("tag", "Pricing", "Show flat rates", "pricing"), T_("pin", "Local", "List your suburbs", "local")]),
  // Pet
  "dog-groomer": P("Growth Tips for Dog Groomers", [T_("camera", "Glow-ups", "Post groom glow-ups", "proof"), T_("cal", "Rebook", "Rebook before they go", "rebook"), T_("pin", "Local", "List areas + pickup", "local")]),
  vet: P("Growth Tips for Vet Clinics", [T_("camera", "Photos", "Share happy patient pics", "proof"), T_("tag", "Pricing", "Show consult fees", "pricing"), T_("cal", "Reminders", "Send checkup reminders", "rebook")]),
  "pet-boarding": P("Growth Tips for Pet Boarding", [T_("camera", "Updates", "Send daily pet pics", "proof"), T_("tag", "Pricing", "Show nightly rates", "pricing"), T_("pin", "Local", "List pickup areas", "local")]),
  "dog-trainer": P("Growth Tips for Dog Trainers", [T_("camera", "Results", "Post training clips", "proof"), T_("tag", "Packages", "Offer class packages", "pricing"), T_("pin", "Local", "List class locations", "local")]),
  // Education
  tutor: P("Growth Tips for Tutors", [T_("up", "Results", "Share student results", "proof"), T_("tag", "Pricing", "Show per-hour pricing", "pricing"), T_("pin", "Online", "Offer online + local", "local")]),
  "music-teacher": P("Growth Tips for Music Teachers", [T_("camera", "Clips", "Post student performances", "proof"), T_("cal", "Rebook", "Set recurring slots", "rebook"), T_("tag", "Pricing", "Show lesson pricing", "pricing")]),
  "driving-instructor": P("Growth Tips for Driving Instructors", [T_("up", "Pass rate", "Show your pass rate", "proof"), T_("tag", "Packages", "Offer lesson bundles", "pricing"), T_("pin", "Areas", "List pickup suburbs", "local")]),
  "yoga-instructor": P("Growth Tips for Yoga Instructors", [T_("camera", "Clips", "Post class clips", "proof"), T_("cal", "Passes", "Sell class passes", "rebook"), T_("pin", "Schedule", "Share class times", "local")]),
  // Mobile
  "food-truck": P("Growth Tips for Food Trucks", [T_("pin", "Location", "Post today's spot daily", "local"), T_("camera", "Food", "Post mouth-watering pics", "proof"), T_("cal", "Regulars", "Reward repeat fans", "rebook")]),
  "mobile-mechanic": P("Growth Tips for Mobile Mechanics", [T_("tag", "Pricing", "Quote upfront", "pricing"), T_("camera", "Proof", "Show fixed-job photos", "proof"), T_("pin", "Areas", "List service areas", "local")]),
  courier: P("Growth Tips for Couriers", [T_("tag", "Pricing", "Show clear rates", "pricing"), T_("pin", "Coverage", "List delivery zones", "local"), T_("up", "Tracking", "Offer live tracking", "proof")]),
  taxi: P("Growth Tips for Taxi & Chauffeurs", [T_("tag", "Fares", "Show flat fares", "pricing"), T_("pin", "Coverage", "List areas + airport", "local"), T_("cal", "Accounts", "Offer account booking", "rebook")]),
  // Beauty
  "hair-salon": P("Growth Tips for Hair Salons", [T_("camera", "Portfolio", "Post transformation reels", "proof"), T_("cal", "Rebook", "Pre-book next visit", "rebook"), T_("up", "Upsell", "Upsell add-ons", "upsell")]),
  "nail-tech": P("Growth Tips for Nail Techs", [T_("camera", "Designs", "Post nail art daily", "proof"), T_("cal", "Rebook", "Book the next set", "rebook"), T_("pin", "Local", "List your studio area", "local")]),
  "makeup-artist": P("Growth Tips for Makeup Artists", [T_("camera", "Looks", "Post before/after looks", "proof"), T_("tag", "Packages", "Offer bridal packages", "pricing"), T_("pin", "Travel", "Offer on-location", "local")]),
  spa: P("Growth Tips for Spas", [T_("up", "Results", "Show skincare results", "proof"), T_("up", "Upsell", "Offer treatment add-ons", "upsell"), T_("cal", "Courses", "Sell treatment courses", "rebook")]),
  // Photography
  "wedding-photographer": P("Growth Tips for Wedding Photographers", [T_("camera", "Portfolio", "Post real weddings", "proof"), T_("tag", "Packages", "Show clear packages", "pricing"), T_("pin", "Venues", "Tag local venues", "local")]),
  "portrait-photographer": P("Growth Tips for Portrait Photographers", [T_("camera", "Gallery", "Post recent shoots", "proof"), T_("tag", "Pricing", "Show session pricing", "pricing"), T_("cal", "Rebook", "Offer yearly minis", "rebook")]),
  "realestate-photographer": P("Growth Tips for Real-Estate Photographers", [T_("camera", "Quality", "Show twilight shots", "proof"), T_("cal", "Speed", "Promise 24h delivery", "rebook"), T_("pin", "Agents", "Partner with agents", "local")]),
  "product-photographer": P("Growth Tips for Product Photographers", [T_("camera", "Samples", "Post product galleries", "proof"), T_("tag", "Pricing", "Offer per-photo pricing", "pricing"), T_("cal", "Retainers", "Offer monthly retainers", "rebook")]),
};

// drip order: interleave sectors so the feed varies day to day
const ORDER = ["plumber", "dog-groomer", "hair-salon", "wedding-photographer", "tutor", "food-truck",
  "electrician", "vet", "nail-tech", "portrait-photographer", "music-teacher", "mobile-mechanic",
  "hvac", "pet-boarding", "makeup-artist", "realestate-photographer", "driving-instructor", "courier",
  "handyman", "dog-trainer", "spa", "product-photographer", "yoga-instructor", "taxi"];

async function seedQueue() {
  await sql(`create table if not exists tips_queue (id serial primary key, profession text unique, theme text default 'light', position int, status text default 'queued', posted_at timestamptz, created_at timestamptz default now());`);
  const vals = ORDER.map((p, i) => `('${p}', ${i}, 'light')`).join(",");
  await sql(`insert into tips_queue (profession, position, theme) values ${vals} on conflict (profession) do nothing;`);
  const c = await sql(`select count(*) filter (where status='queued') q, count(*) total from tips_queue;`);
  console.log("queue seeded:", JSON.stringify(c[0]));
}
async function auto() {
  const rows = await sql(`select profession, coalesce(theme,'light') theme from tips_queue where status='queued' order by position limit 1;`);
  if (!rows.length) { console.log("tips_queue empty — all professions posted. Re-seed or add more."); return; }
  const { profession, theme } = rows[0];
  console.log("posting next:", profession, `(${theme})`);
  const ok = await publish(profession, theme);
  if (ok.length) { await sql(`update tips_queue set status='posted', posted_at=now() where profession='${profession}';`); console.log("queued->posted:", profession, "->", ok.join("+")); }
  else console.log("post failed, leaving in queue:", profession);
}

(async () => {
  const mode = process.argv[2] || "render";
  if (mode === "seed-queue") return seedQueue();
  if (mode === "auto") return auto();
  const prof = process.argv[3] || "plumber", theme = process.argv[4] || process.env.THEME || "light";
  const slides = await buildSlides(prof, theme);
  if (mode === "render") { fs.mkdirSync("/tmp/tips", { recursive: true }); slides.forEach((b, i) => fs.writeFileSync(`/tmp/tips/${prof}-${i + 1}.png`, b)); console.log(`rendered 4 slides -> /tmp/tips/${prof}-1..4.png`); return; }
  if (mode === "post") { const ok = await publish(prof, theme); console.log("posted", prof, "->", ok.join("+")); return; }
  console.log("modes: render <prof> [theme] | post <prof> [theme] | seed-queue | auto");
})();
