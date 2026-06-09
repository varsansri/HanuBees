#!/usr/bin/env node
// FOUNDER-FACE Q&A format. Slide 0 = hook poster (founder photo + company logo +
// bottom gradient + the QUESTION). Slides 1-2 = the numbered answer. node sample-founder.js [i]
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const W = 1080, H = 1350;
const C = { y: "#ffbe00", g: "#98aa9d", fg: "#ffffff", mut: "#c7c7c5", bg: "#121212", card: "#1c1c1c" };
const FONT = "Arial, Roboto, sans-serif";
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const FACE = "/tmp/founders/f1.jpg";      // Brian Chesky 2025, CC-BY-SA (Celeste Sloman)
const LOGO = "/tmp/airbnb.png";           // Airbnb mark, Simple Icons

function wrap(text, x, y, size, weight, fill, anchor = "start", stroke = 0) {
  const max = Math.max(6, Math.floor((anchor === "middle" ? 980 : 900) / (size * 0.58)));
  const lh = Math.round(size * 1.08);
  const words = text.split(" "); const lines = []; let cur = "";
  for (const w of words) { if ((cur + " " + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += " " + w; }
  if (cur.trim()) lines.push(cur.trim());
  const sp = stroke ? `paint-order="stroke" stroke="#000" stroke-width="${stroke}" stroke-linejoin="round"` : "";
  const t = lines.map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lh}">${xml(l)}</tspan>`).join("");
  return { svg: `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${sp}>${t}</text>`, height: lines.length * lh };
}

async function slide0() { // HOOK POSTER
  const bg = await sharp(FACE).resize(W, H, { fit: "cover", position: "top" }).toBuffer();
  const logo = await sharp(LOGO).resize(210, 210, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  let t = "", y = 838;
  t += wrap("THE $100B QUESTION", 70, y, 34, 800, C.y).svg; y += 70;
  const head = wrap("Airbnb owns ZERO hotels.", 70, y, 74, 800, C.fg); t += head.svg; y += head.height + 24;
  t += wrap("So how is it worth $100 billion?", 70, y, 50, 600, C.y).svg;
  const grad = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs>
      <linearGradient id="b" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#000" stop-opacity="0.95"/><stop offset="55%" stop-color="#000" stop-opacity="0.82"/><stop offset="100%" stop-color="#000" stop-opacity="0"/></linearGradient></defs>
    <rect x="0" y="${H - 580}" width="${W}" height="580" fill="url(#b)"/>
    ${t}
    <text x="146" y="1285" font-family="${FONT}" font-size="34" font-weight="800" fill="${C.g}">@hanubees</text>
  </svg>`;
  const bee = await sharp(path.join(__dirname, "../assets/brand/bee.png")).resize(78, 78, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp(bg).composite([{ input: Buffer.from(grad), top: 0, left: 0 }, { input: logo, top: 60, left: 60 }, { input: bee, top: 1232, left: 60 }]).png().toBuffer();
}

function explainer(idx, kicker, items, footer, wm) {
  // vertically center the numbered block so the slide never looks half-empty
  const blockH = items.length * 250;
  let y = Math.max(380, Math.round((H - blockH) / 2) + 40);
  let s = wrap(kicker, 70, 200, 36, 800, C.y).svg;
  s += `<rect x="70" y="240" width="120" height="7" rx="3" fill="${C.y}"/>`;
  for (const [n, head, body] of items) {
    s += `<text x="70" y="${y + 58}" font-family="${FONT}" font-size="78" font-weight="800" fill="${C.y}">${n}</text>`;
    const hh = wrap(head, 200, y + 30, 46, 800, C.fg); s += hh.svg;
    s += wrap(body, 200, y + 36 + hh.height, 32, 400, C.mut).svg;
    y += 250;
  }
  if (footer) { s += `<rect x="70" y="${H - 210}" width="940" height="2" fill="#2a2a2a"/>`; s += wrap(footer, 70, H - 140, 32, 500, C.g).svg; }
  // transparent overlay (dark bg + faint logo watermark composited in the render loop)
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

(async () => {
  fs.mkdirSync(path.join(__dirname, "../out/founder"), { recursive: true });
  const bee = await sharp(path.join(__dirname, "../assets/brand/bee.png")).resize(70, 70, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  // faint watermark = subject's logo, low opacity, bottom-right
  const wm = await sharp(LOGO).resize(640, 640, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .composite([{ input: Buffer.from([255, 255, 255, Math.round(255 * 0.92)]), raw: { width: 1, height: 1, channels: 4 }, tile: true, blend: "dest-out" }]).png().toBuffer();
  const canvas = () => sharp({ create: { width: W, height: H, channels: 4, background: C.bg } });
  const only = process.argv[2] != null ? [+process.argv[2]] : [0, 1, 2];
  for (const i of only) {
    let buf;
    if (i === 0) buf = await slide0();
    else if (i === 1) buf = await canvas().composite([
      { input: wm, top: 760, left: 500 },
      { input: Buffer.from(explainer(1, "HOW? IT'S SOFTWARE, NOT HOTELS.", [
        ["1", "It owns 0 properties.", "Marriott owns buildings. Airbnb owns code — pure asset-light marketplace."],
        ["2", "5M+ hosts ARE the inventory.", "It scaled to 7M+ listings without building a single room. Users supply it."],
      ])), top: 0, left: 0 },
      { input: bee, top: 60, left: 940 }]).png().toBuffer();
    else buf = await canvas().composite([
      { input: wm, top: 760, left: 500 },
      { input: Buffer.from(explainer(2, "AND THE REAL PRODUCT?", [
        ["3", "They sell TRUST, not rooms.", "Reviews + payments + cover made a stranger's home feel safe. That's the moat."],
      ], "Startup lesson: own the network, not the assets. — Hanubees")), top: 0, left: 0 },
      { input: bee, top: 60, left: 940 }]).png().toBuffer();
    const out = path.join(__dirname, `../out/founder/s${i}.png`);
    await sharp(buf).png().toFile(out); console.log("rendered", out);
  }
})();
