#!/usr/bin/env node
// "Growth Tips for <Profession>" — hub-and-spoke infographic (Ruben Hassid / How-to-AI style),
// applied to Hanubees brand: bee = central hub, dotted spokes -> growth-tip nodes (icon + tip).
// One tip is always Hanubees (the connect). Real, useful tips; speed-to-lead stat is sourced.
// Modes: render <prof>  |  post <prof>
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
const Y = "#ffbe00", G = "#98aa9d", FG = "#eaeaea", MUT = "#9a9aa6", DARK = "#121212";
const FF = "Space Grotesk, Roboto, sans-serif";
const W = 1080, H = 1350;
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function wrap(t, max) { const w = String(t).split(/\s+/), o = []; let c = ""; for (const x of w) { if ((c + " " + x).trim().length > max) { if (c) o.push(c.trim()); c = x; } else c += " " + x; } if (c.trim()) o.push(c.trim()); return o; }

// ---- simple line icons (24x24), stroke = currentColor via fill none ----
const IC = {
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  star: `<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 22.3 6.8 19.6l1-5.8-4.3-4.1 5.9-.9z"/>`,
  camera: `<rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l1.5-2.5h5L16 7"/>`,
  tag: `<path d="M3 12l8-8 9 1 1 9-8 8z"/><circle cx="15" cy="9" r="1.6"/>`,
  pin: `<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/>`,
  chat: `<path d="M4 5h16v11H9l-5 4z"/>`,
  bolt: `<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>`,
  phone: `<path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>`,
  cal: `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>`,
  bee: `<ellipse cx="12" cy="13" rx="5.5" ry="6.5"/><path d="M6.6 10h10.8M6.6 13h10.8M7 16h10"/><path d="M9 5.5l2 3M15 5.5l-2 3"/>`,
};
function icon(name, x, y, size, color) {
  const s = size / 24;
  return `<g transform="translate(${x - size / 2} ${y - size / 2}) scale(${s})" fill="none" stroke="${color}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${IC[name] || IC.star}</g>`;
}

function node(cx, cy, ic, label, tip, side) {
  const r = 56;
  const ring = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#1d1f27" stroke="${Y}" stroke-width="2.5"/>${icon(ic, cx, cy, 50, Y)}`;
  // label pill under circle
  const lw = label.length * 17 + 36, lx = cx - lw / 2, ly = cy + r + 8;
  const pill = `<rect x="${lx}" y="${ly}" width="${lw}" height="40" rx="20" fill="${Y}"/><text x="${cx}" y="${ly + 27}" font-family="${FF}" font-size="22" font-weight="800" fill="${DARK}" text-anchor="middle">${xml(label)}</text>`;
  // tip text beside the node (left side -> right-aligned to the left; right side -> left-aligned)
  const tl = wrap(tip, 15);
  const anchor = side === "L" ? "end" : "start";
  const tx = side === "L" ? cx - r - 22 : cx + r + 22;
  const ty = cy - (tl.length - 1) * 15;
  const tspans = tl.map((l, i) => `<tspan x="${tx}" dy="${i === 0 ? 0 : 28}">${xml(l)}</tspan>`).join("");
  const text = `<text x="${tx}" y="${ty}" font-family="${FF}" font-size="23" font-weight="600" fill="${FG}" text-anchor="${anchor}">${tspans}</text>`;
  return ring + pill + text;
}

function dottedLine(x1, y1, x2, y2) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${Y}" stroke-opacity="0.45" stroke-width="3" stroke-dasharray="2 12" stroke-linecap="round"/>`;
}

function buildSvg(p) {
  const hub = { x: 540, y: 720 };
  const L = [450, 710, 970], Rs = [450, 710, 970];
  const lx = 340, rx = 740;
  const slots = [
    { x: lx, y: L[0], side: "L" }, { x: lx, y: L[1], side: "L" }, { x: lx, y: L[2], side: "L" },
    { x: rx, y: Rs[0], side: "R" }, { x: rx, y: Rs[1], side: "R" }, { x: rx, y: Rs[2], side: "R" },
  ];
  let lines = "", nodes = "";
  p.tips.forEach((t, i) => {
    const s = slots[i];
    lines += dottedLine(hub.x, hub.y, s.x, s.y);
    nodes += node(s.x, s.y, t.icon, t.label, t.tip, s.side);
  });
  const head = wrap(p.title, 16);
  const headSvg = head.map((l, i) => `<tspan x="540" dy="${i === 0 ? 0 : 78}">${xml(l)}</tspan>`).join("");
  const subW = p.sub.length * 16 + 64;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d0f1a"/><stop offset="0.6" stop-color="#15182a"/><stop offset="1" stop-color="#0a0c14"/></linearGradient>
    <radialGradient id="gl" cx="0.5" cy="0.56" r="0.5"><stop offset="0" stop-color="#ffbe00" stop-opacity="0.16"/><stop offset="1" stop-color="#ffbe00" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#gl)"/>
    <text x="540" y="120" font-family="${FF}" font-size="68" font-weight="800" fill="${FG}" text-anchor="middle" letter-spacing="-2">${headSvg}</text>
    <rect x="${540 - subW / 2}" y="${head.length > 1 ? 285 : 205}" width="${subW}" height="58" rx="29" fill="${Y}"/>
    <text x="540" y="${(head.length > 1 ? 285 : 205) + 39}" font-family="${FF}" font-size="27" font-weight="800" fill="${DARK}" text-anchor="middle">${xml(p.sub)}</text>
    <text x="540" y="${(head.length > 1 ? 285 : 205) + 88}" font-family="${FF}" font-size="21" font-weight="600" fill="${MUT}" text-anchor="middle">${xml(p.note || "")}</text>
    ${lines}
    ${nodes}
    <text x="540" y="1305" font-family="${FF}" font-size="26" font-weight="700" fill="${G}" text-anchor="middle">@hanubees · free AI for local businesses · hanubees.com</text>
  </svg>`;
}

async function toPng(svg, hub = { x: 540, y: 720 }) {
  const bee = await sharp("hanubees-marketing-team/assets/brand/bee.png").resize(190, 190, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp(Buffer.from(svg)).composite([{ input: bee, top: hub.y - 95, left: hub.x - 95 }]).png().toBuffer();
}

// ---- profession data: 6 growth tips each; last is the Hanubees connect ----
const SPEED = "Reply within 5 minutes";
const REVIEWS = "Ask for Google reviews";
const HANU = "Free 24/7 AI receptionist";
const NOTE = "78% of customers hire whoever replies first — MIT study";
const SUB = "Steal these before your competitor does";
const PROFS = {
  plumber: { title: "Growth Tips for Plumbers", sub: SUB, note: NOTE, tips: [
    { icon: "clock", label: "Speed", tip: SPEED }, { icon: "star", label: "Reviews", tip: REVIEWS },
    { icon: "camera", label: "Proof", tip: "Post before/after pics" }, { icon: "tag", label: "Pricing", tip: "Show upfront pricing" },
    { icon: "pin", label: "Local", tip: "List your service areas" }, { icon: "bee", label: "Hanubees", tip: HANU } ] },
  "dog-groomer": { title: "Growth Tips for Dog Groomers", sub: SUB, note: NOTE, tips: [
    { icon: "clock", label: "Speed", tip: SPEED }, { icon: "star", label: "Reviews", tip: REVIEWS },
    { icon: "camera", label: "Glow-ups", tip: "Post groom glow-ups" }, { icon: "cal", label: "Rebook", tip: "Rebook before they go" },
    { icon: "pin", label: "Local", tip: "List areas + pickup" }, { icon: "bee", label: "Hanubees", tip: HANU } ] },
  "hair-salon": { title: "Growth Tips for Hair Salons", sub: SUB, note: NOTE, tips: [
    { icon: "clock", label: "Speed", tip: SPEED }, { icon: "star", label: "Reviews", tip: REVIEWS },
    { icon: "camera", label: "Portfolio", tip: "Post transformation reels" }, { icon: "cal", label: "Rebook", tip: "Pre-book next visit" },
    { icon: "tag", label: "Upsell", tip: "Upsell add-ons" }, { icon: "bee", label: "Hanubees", tip: HANU } ] },
  electrician: { title: "Growth Tips for Electricians", sub: SUB, note: NOTE, tips: [
    { icon: "clock", label: "Speed", tip: SPEED }, { icon: "star", label: "Reviews", tip: REVIEWS },
    { icon: "bolt", label: "Safety", tip: "Offer free safety checks" }, { icon: "tag", label: "Pricing", tip: "Give fixed quotes" },
    { icon: "pin", label: "Local", tip: "List areas covered" }, { icon: "bee", label: "Hanubees", tip: HANU } ] },
};

async function build(prof) {
  const p = PROFS[prof];
  if (!p) { console.log("unknown profession. options:", Object.keys(PROFS).join(", ")); process.exit(1); }
  return toPng(buildSvg(p));
}

async function upload(buf) {
  const pre = await (await fetch(`${ZB}/media/presign`, { method: "POST", headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" }, body: JSON.stringify({ filename: "g.png", contentType: "image/png" }) })).json();
  await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": "image/png" }, body: buf });
  return pre.publicUrl;
}

(async () => {
  const mode = process.argv[2] || "render";
  const prof = process.argv[3] || "plumber";
  const png = await build(prof);
  if (mode === "render") { fs.mkdirSync("/tmp/tips", { recursive: true }); fs.writeFileSync(`/tmp/tips/${prof}.png`, png); console.log(`rendered -> /tmp/tips/${prof}.png`); return; }
  const url = await upload(png);
  const p = PROFS[prof];
  const cap_ig = `${p.title} 🐝\n\nThe ones that grow fastest do these:\n• ${p.tips.map((t) => t.tip).join("\n• ")}\n\nHanubees gives every local business a free AI that answers customers instantly, 24/7.\nFree → hanubees.com\n#${prof.replace(/-/g, "")} #smallbusiness #growthtips #Hanubees`;
  const cap_tt = `${p.title}: ${p.tips.length} ways to win more customers. Free AI at hanubees.com`.slice(0, 90);
  const accs = await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${K}`, Accept: "application/json" } })).json();
  for (const a of accs.accounts || []) {
    const res = await fetch(`${ZB}/posts`, { method: "POST", headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" }, body: JSON.stringify({ content: a.platform === "tiktok" ? cap_tt : cap_ig, mediaItems: [{ url, type: "image" }], platforms: [{ platform: a.platform, accountId: a._id }], publishNow: true }) });
    console.log(a.platform, res.ok ? "PUBLISHED ✓" : "FAILED: " + (await res.text()).slice(0, 140));
  }
})();
