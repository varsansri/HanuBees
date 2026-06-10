#!/usr/bin/env node
require("./_env");
// SAMPLE master concept (lever: copy-proven-hook). Renders 5 brand slides → out/sample/.
// Iteration scratchpad for proving the quality bar. node sample-carousel.js [slideIndex]
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const W = 1080, H = 1080;
const C = { y: "#ffbe00", g: "#98aa9d", fg: "#eaeaea", mut: "#a9a9a7", bg: "#121212", card: "#1a1a1a" };
const FONT = "Space Grotesk, Roboto, sans-serif";
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// word-wrap → tspans (SVG has no auto-wrap). Auto-computes chars/line from font size
// (bold glyph ≈ 0.60·size wide) against usable width, and reports rendered height so
// the caller can flow blocks without overlap. y = baseline of the FIRST line.
const USABLE = 900; // x:90 → 990
function wrap(text, x, y, size, weight, fill, extra = "") {
  const maxChars = Math.max(6, Math.floor(USABLE / (size * 0.60)));
  const lh = Math.round(size * 1.06);
  const words = text.split(" "); const lines = []; let cur = "";
  for (const w of words) { if ((cur + " " + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w; } else cur += " " + w; }
  if (cur.trim()) lines.push(cur.trim());
  const tspans = lines.map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lh}">${xml(l)}</tspan>`).join("");
  return { svg: `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${tspans}</text>`,
           lines: lines.length, height: lines.length * lh, lh };
}

const DEFS = `<defs>
  <radialGradient id="glow" cx="50%" cy="32%" r="75%">
    <stop offset="0%" stop-color="#ffbe00" stop-opacity="0.10"/><stop offset="55%" stop-color="#121212" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="ystripe" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#ffbe00"/><stop offset="100%" stop-color="#98aa9d"/>
  </linearGradient></defs>`;

function chrome(idx, total, inner) {
  let dots = "";
  for (let i = 0; i < total; i++) dots += `<circle cx="${470 + i * 30}" cy="1012" r="6" fill="${i === idx ? C.y : "#3a3a3a"}"/>`;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${DEFS}
    <rect width="${W}" height="${H}" fill="${C.bg}"/><rect width="${W}" height="${H}" fill="url(#glow)"/>
    <rect x="90" y="120" width="120" height="8" rx="4" fill="url(#ystripe)"/>
    ${inner}
    ${dots}
    <text x="90" y="1018" font-family="${FONT}" font-size="26" font-weight="600" fill="${C.g}">@hanubees</text>
  </svg>`;
}

// ── the 5 slides (master concept) ─────────────────────────────────────────────
// Each slide flows blocks top→down from a start y, advancing by measured height + gap,
// so nothing overlaps and nothing overflows.
function slideSVG(i) {
  if (i === 0) { // HOOK — one tight idea, two lines, big
    let s = "", y = 300;
    const h1 = wrap("Your customers aren't ghosting you.", 90, y, 76, 700, C.fg); s += h1.svg; y += h1.height + 40;
    const h2 = wrap("They found someone who replied first.", 90, y, 76, 700, C.y); s += h2.svg; y += h2.height + 64;
    const sub = wrap("The #1 reason small shops lose sales.", 90, y, 38, 500, C.mut); s += sub.svg; y += sub.height + 14;
    s += wrap("The fix is simpler than you think.", 90, y, 38, 500, C.g).svg;
    return chrome(0, 5, s);
  }
  if (i === 1) { // PROOF stat
    let s = wrap("THE PROOF", 90, 250, 32, 700, C.g).svg;
    s += `<text x="86" y="600" font-family="${FONT}" font-size="280" font-weight="800" fill="${C.y}">78%</text>`;
    const t = wrap("of customers buy from the business that replies first.", 90, 720, 54, 600, C.fg); s += t.svg;
    s += wrap("— Lead Response Management study", 90, 720 + t.height + 70, 28, 400, C.mut).svg;
    return chrome(1, 5, s);
  }
  if (i === 2) { // hidden leak — OUR real data
    let s = wrap("THE HIDDEN LEAK", 90, 250, 32, 700, C.g).svg, y = 360;
    const t = wrap("We mapped 2,088 local businesses.", 90, y, 50, 600, C.fg); s += t.svg; y += t.height + 50;
    s += `<text x="86" y="${y + 130}" font-family="${FONT}" font-size="170" font-weight="800" fill="${C.y}">1,160</text>`; y += 200;
    const t2 = wrap("had no phone you could even reach.", 90, y, 50, 600, C.fg); s += t2.svg; y += t2.height + 60;
    const t3 = wrap("If they can't reach you, they don't wait — they move on.", 90, y, 36, 500, C.mut); s += t3.svg;
    return chrome(2, 5, s);
  }
  if (i === 3) { // 3 fixes — value
    let s = wrap("FIX IT IN 3 MOVES", 90, 230, 34, 700, C.g).svg, y = 330;
    const items = [
      ["1", "Reply in minutes, not days.", "Speed beats price. The fast one wins."],
      ["2", "Never leave a question unanswered.", "Even at 2AM. Silence is a lost sale."],
      ["3", "Make it stupid-easy to reach you.", "One tap — no phone tag, no forms."],
    ];
    for (const [n, head, body] of items) {
      s += `<text x="90" y="${y + 54}" font-family="${FONT}" font-size="60" font-weight="800" fill="${C.y}">${n}</text>`;
      const hh = wrap(head, 190, y + 30, 40, 700, C.fg); s += hh.svg;
      s += wrap(body, 190, y + 30 + hh.height + 14, 30, 400, C.mut).svg;
      y += 210;
    }
    return chrome(3, 5, s);
  }
  // CTA + quiet footer
  let s = "", y = 420;
  const t = wrap("Save this. Then answer faster than your competition.", 90, y, 62, 700, C.fg); s += t.svg; y += t.height + 60;
  s += `<rect x="90" y="${y}" width="900" height="2" fill="#2a2a2a"/>`; y += 70;
  const ft = wrap("Powered by Hanubees — the AI that answers your customers 24/7.", 90, y, 38, 500, C.g); s += ft.svg; y += ft.height + 56;
  s += `<text x="90" y="${y}" font-family="${FONT}" font-size="46" font-weight="700" fill="${C.y}">hanubees.com</text>`;
  return chrome(4, 5, s);
}

(async () => {
  const only = process.argv[2] != null ? [+process.argv[2]] : [0, 1, 2, 3, 4];
  fs.mkdirSync(path.join(__dirname, "../out/sample"), { recursive: true });
  const bee = await sharp(path.join(__dirname, "../assets/brand/bee.png"))
    .resize(110, 110, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  for (const i of only) {
    const svg = slideSVG(i);
    const out = path.join(__dirname, `../out/sample/slide${i}.png`);
    await sharp(Buffer.from(svg)).composite([{ input: bee, top: 70, left: 880 }]).png().toFile(out);
    console.log("rendered", out);
  }
})();
