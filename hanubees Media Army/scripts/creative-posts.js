#!/usr/bin/env node
require("./_env");
// Creative, varied single-image posts — multiple distinct aesthetics (not one template),
// with AI-authored (by the agent) sector-specific growth copy. Rotates styles so the feed
// never looks the same. Modes: render <id> | list
const fs = require("fs");
const sharp = require("sharp");
function setupFonts() {
  try {
    const dir = process.cwd() + "/hanubees-marketing-team/assets/brand/fonts";
    fs.mkdirSync("/tmp/fonts", { recursive: true }); fs.mkdirSync("/tmp/fontcache", { recursive: true });
    fs.writeFileSync("/tmp/fonts/fonts.conf", `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${dir}</dir>${fs.existsSync("/system/fonts") ? "<dir>/system/fonts</dir>" : ""}<cachedir>/tmp/fontcache</cachedir><match target="pattern"><test qual="any" name="family"><string>sans-serif</string></test><edit name="family" mode="assign" binding="same"><string>Space Grotesk</string></edit></match><match target="pattern"><test qual="any" name="family"><string>Arial</string></test><edit name="family" mode="assign" binding="same"><string>Space Grotesk</string></edit></match></fontconfig>`);
    process.env.FONTCONFIG_FILE = "/tmp/fonts/fonts.conf";
  } catch {}
}
setupFonts();

const Y = "#ffbe00", DARK = "#121212", CREAM = "#f7f2e7", FG_D = "#eaeaea", RED = "#e0574d", GREEN = "#7fa08f";
const FF = "Space Grotesk, Roboto, sans-serif";
const W = 1080, H = 1350;
const BEE = "hanubees-marketing-team/assets/brand/bee.png";
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function wrap(t, max) { const w = String(t).split(/\s+/), o = []; let c = ""; for (const x of w) { if ((c + " " + x).trim().length > max) { if (c) o.push(c.trim()); c = x; } else c += " " + x; } if (c.trim()) o.push(c.trim()); return o; }
const tx = (x, y, s, w, fill, extra = "") => `<text x="${x}" y="${y}" font-family="${FF}" font-size="${s}" font-weight="${w}" fill="${fill}" ${extra}>`;

// ---------- Style A: BOLD STATEMENT (light editorial) ----------
function styleStatement(p) {
  const lines = wrap(p.statement, 16);
  const lh = 92, startY = 470 - (lines.length - 1) * lh / 2;
  const body = lines.map((l, i) => `<tspan x="80" y="${startY + i * lh}">${xml(l)}</tspan>`).join("");
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${CREAM}"/>
    <rect x="0" y="0" width="14" height="${H}" fill="${Y}"/>
    ${tx(80, 150, 30, 800, "#9a8f73", 'letter-spacing="4"')}${xml(p.sector.toUpperCase())} · GROWTH</text>
    ${tx(80, 0, 84, 800, "#171410", 'letter-spacing="-2"')}${body}</text>
    <rect x="80" y="${startY + lines.length * lh - 30}" width="${Math.min(p.statement.length * 6, 520)}" height="20" fill="${Y}" fill-opacity="0.55"/>
    ${(() => { const sl = wrap(p.support, 40); const sy = 1230 - (sl.length - 1) * 44; return `${tx(80, sy, 33, 600, "#3a352b")}${sl.map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 44}">${xml(l)}</tspan>`).join("")}</text>`; })()}
    ${tx(80, 1300, 26, 700, "#9a8f73")}@hanubees · free AI for local businesses</text>
  </svg>`;
}

// ---------- Style B: NUMBERED PLAYBOOK (dark list) ----------
function stylePlaybook(p) {
  const titleL = wrap(p.title, 18);
  const head = titleL.map((l, i) => `<tspan x="80" y="${130 + i * 64}">${xml(l)}</tspan>`).join("");
  let rows = "", y0 = 130 + titleL.length * 64 + 60;
  p.tips.forEach((t, i) => {
    const yy = y0 + i * 190;
    const tl = wrap(t.t, 30);
    rows += `<circle cx="116" cy="${yy + 6}" r="32" fill="${Y}"/><text x="116" y="${yy + 18}" font-family="${FF}" font-size="34" font-weight="800" fill="${DARK}" text-anchor="middle">${i + 1}</text>`;
    rows += `<text x="172" y="${yy - 6}" font-family="${FF}" font-size="34" font-weight="800" fill="${FG_D}">${tl.map((l, k) => `<tspan x="172" dy="${k === 0 ? 0 : 40}">${xml(l)}</tspan>`).join("")}</text>`;
    const sl = wrap(t.s, 40);
    rows += `<text x="172" y="${yy + 28 + (tl.length - 1) * 40}" font-family="${FF}" font-size="25" font-weight="500" fill="#a9a9a7">${sl.map((l, k) => `<tspan x="172" dy="${k === 0 ? 0 : 32}">${xml(l)}</tspan>`).join("")}</text>`;
  });
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d0f1a"/><stop offset="1" stop-color="#15182a"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    ${tx(80, 70, 28, 800, Y, 'letter-spacing="3"')}${xml(p.sector.toUpperCase())} PLAYBOOK</text>
    ${tx(80, 0, 52, 800, FG_D, 'letter-spacing="-1"')}${head}</text>
    ${rows}
    ${tx(80, 1305, 25, 700, GREEN)}@hanubees · free AI for local businesses · hanubees.com</text>
  </svg>`;
}

// ---------- Style C: MYTH vs MOVE (split contrast) ----------
function styleContrast(p) {
  const mythL = wrap(p.myth, 24), moveL = wrap(p.move, 24);
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${DARK}"/>
    <rect x="0" y="0" width="${W}" height="600" fill="#1b1411"/>
    <rect x="0" y="600" width="${W}" height="750" fill="${Y}"/>
    ${tx(80, 110, 28, 800, RED, 'letter-spacing="3"')}MOST ${xml(p.sector.toUpperCase())}S</text>
    ${tx(80, 200, 56, 800, "#f3e9e6")}${mythL.map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 64}">${xml(l)}</tspan>`).join("")}</text>
    <circle cx="540" cy="600" r="46" fill="${DARK}"/><text x="540" y="615" font-family="${FF}" font-size="40" font-weight="800" fill="${Y}" text-anchor="middle">vs</text>
    ${tx(80, 720, 28, 800, "#5a4a00", 'letter-spacing="3"')}THE TOP 1% DO THIS</text>
    ${tx(80, 810, 56, 800, DARK)}${moveL.map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 64}">${xml(l)}</tspan>`).join("")}</text>
    ${tx(80, 1290, 26, 800, "#5a4a00")}@hanubees · free AI receptionist · hanubees.com</text>
  </svg>`;
}

const STYLES = { statement: styleStatement, playbook: stylePlaybook, contrast: styleContrast };

// ---------- content authored by the agent (creative, sector-specific) ----------
const POSTS = {
  cafe: { style: "statement", sector: "Café",
    statement: "Your busiest hour has your worst answers.",
    support: "At the 8am rush nobody picks up the phone. Your AI does — takes the order, answers “oat milk?”, never misses a regular. Free with Hanubees." },
  plumber: { style: "playbook", sector: "Plumber", title: "5 ways plumbers win the job before the quote",
    tips: [
      { t: "Answer in 5 minutes", s: "78% hire whoever replies first (MIT). Your AI replies in seconds, 24/7." },
      { t: "Show the mess you fixed", s: "Post before/after photos — proof beats promises." },
      { t: "Price the call-out upfront", s: "Hidden prices send people to the next name." },
      { t: "Ask every job for a review", s: "Reviews are your #1 trust signal — just ask." },
      { t: "Name every suburb you serve", s: "So you show up when a nearby tap is leaking." },
    ] },
  salon: { style: "contrast", sector: "Salon",
    myth: "Wait for DMs and miss them after hours.",
    move: "Let an AI answer, price, and pre-book while you're with a client." },
};

async function render(id) {
  const p = POSTS[id]; if (!p) { console.log("ids:", Object.keys(POSTS).join(", ")); process.exit(1); }
  const svg = STYLES[p.style](p);
  const beeOnLight = p.style === "playbook"; // dark bg -> normal bee; light/yellow -> normal bee ok
  const bee = await sharp(BEE).resize(96, 96, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const buf = await sharp(Buffer.from(svg)).composite([{ input: bee, top: 40, left: W - 130 }]).png().toBuffer();
  fs.mkdirSync("/tmp/creative", { recursive: true });
  fs.writeFileSync(`/tmp/creative/${id}.png`, buf);
  console.log(`rendered ${id} (${p.style}) -> /tmp/creative/${id}.png`);
}

const mode = process.argv[2] || "list";
if (mode === "list") console.log("posts:", Object.keys(POSTS).join(", "));
else render(mode);
