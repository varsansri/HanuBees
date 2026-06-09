#!/usr/bin/env node
// TODAY'S BATCH — top-10-wealthiest-company + founder, Q&A carousel (founder-face format).
// Config-driven: each concept = poster (face + logo + hook) + 2 numbered-answer slides.
// All numbers REAL (June 2026 market caps + verified origins). node daily-batch.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const W = 1080, H = 1350;
const C = { y: "#ffbe00", g: "#98aa9d", fg: "#ffffff", mut: "#c7c7c5", bg: "#121212" };
const FONT = "Arial, Roboto, sans-serif";
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text, x, y, size, weight, fill, anchor = "start") {
  const max = Math.max(6, Math.floor(900 / (size * 0.58)));
  const lh = Math.round(size * 1.08);
  const words = text.split(" "); const lines = []; let cur = "";
  for (const w of words) { if ((cur + " " + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += " " + w; }
  if (cur.trim()) lines.push(cur.trim());
  const t = lines.map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lh}">${xml(l)}</tspan>`).join("");
  return { svg: `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}">${t}</text>`, height: lines.length * lh };
}

async function poster(cfg) {
  const bg = await sharp(cfg.face).resize(W, H, { fit: "cover", position: "top" }).toBuffer();
  const logo = await sharp(cfg.logo).resize(190, 190, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  let t = "", y = 832;
  t += wrap(cfg.kicker, 70, y, 33, 800, C.y).svg; y += 66;
  const head = wrap(cfg.headline, 70, y, 72, 800, C.fg); t += head.svg; y += head.height + 22;
  t += wrap(cfg.question, 70, y, 48, 600, C.y).svg;
  const grad = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs>
      <linearGradient id="b" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#000" stop-opacity="0.96"/><stop offset="58%" stop-color="#000" stop-opacity="0.82"/><stop offset="100%" stop-color="#000" stop-opacity="0"/></linearGradient></defs>
    <rect x="0" y="${H - 600}" width="${W}" height="600" fill="url(#b)"/>${t}
    <text x="146" y="1285" font-family="${FONT}" font-size="33" font-weight="800" fill="${C.g}">@hanubees</text></svg>`;
  const bee = await sharp(path.join(__dirname, "../assets/brand/bee.png")).resize(76, 76, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp(bg).composite([{ input: Buffer.from(grad), top: 0, left: 0 }, { input: logo, top: 58, left: 60 }, { input: bee, top: 1232, left: 60 }]).png().toBuffer();
}

function explainSVG(kicker, items, footer) {
  const blockH = items.length * 250;
  let y = Math.max(380, Math.round((H - blockH) / 2) + 30);
  let s = wrap(kicker, 70, 200, 36, 800, C.y).svg + `<rect x="70" y="240" width="120" height="7" rx="3" fill="${C.y}"/>`;
  for (const [n, head, body] of items) {
    s += `<text x="70" y="${y + 58}" font-family="${FONT}" font-size="76" font-weight="800" fill="${C.y}">${n}</text>`;
    const hh = wrap(head, 200, y + 30, 46, 800, C.fg); s += hh.svg;
    s += wrap(body, 200, y + 36 + hh.height, 32, 400, C.mut).svg;
    y += 250;
  }
  if (footer) { s += `<rect x="70" y="${H - 210}" width="940" height="2" fill="#2a2a2a"/>`; s += wrap(footer, 70, H - 140, 32, 500, C.g).svg; }
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

// ── TODAY'S CONCEPTS (verified numbers) ──────────────────────────────────────
const CONCEPTS = [
  { id: "nvidia", face: "/tmp/founders/huang0.jpg", logo: "/tmp/logo_nvidia.png",
    kicker: "MOST VALUABLE COMPANY ON EARTH", headline: "Nvidia is worth $5.2 TRILLION.",
    question: "How did a chip company beat Apple AND Google?",
    slides: [
      ["HE BET 30 YEARS EARLY", [
        ["1", "He bet on GPUs in 1993.", "Everyone saw 'gaming chips.' Jensen bet they'd one day run everything. Conviction."],
        ["2", "Then AI needed his exact chips.", "~80% of the world's AI runs on Nvidia GPUs. The wave arrived — he was the only one ready."],
      ]],
      ["THE REAL MOVE", [
        ["3", "He sells the shovels.", "OpenAI, Google, Meta — every AI company pays the 'Nvidia tax.' In a gold rush, sell shovels."],
      ], "Pick a hard problem early. Be the only one ready when the wave hits. — Hanubees"],
    ] },
  { id: "apple", face: "/tmp/founders/jobs0.jpg", logo: "/tmp/logo_apple.png",
    kicker: "FROM A GARAGE TO $4.5 TRILLION", headline: "Apple is worth $4.5 TRILLION.",
    question: "It started in a garage in 1976. How?",
    slides: [
      ["TWO GUYS, ONE GARAGE", [
        ["1", "Started with ~$1,300.", "Jobs sold his VW van, Wozniak his calculator. That funded the first Apple computers."],
        ["2", "They sold simplicity, not specs.", "While rivals bragged about hardware, Apple sold how it FELT to use. Experience won."],
      ]],
      ["THE MOAT", [
        ["3", "They built a religion.", "People don't buy Apple — they belong to it. Brand loyalty is the deepest moat there is."],
      ], "Sell how it FEELS, not what it does. — Hanubees"],
    ] },
];

(async () => {
  const bee = await sharp(path.join(__dirname, "../assets/brand/bee.png")).resize(70, 70, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  for (const cfg of CONCEPTS) {
    const dir = path.join(__dirname, `../out/daily/${cfg.id}`); fs.mkdirSync(dir, { recursive: true });
    const wm = await sharp(cfg.logo).resize(640, 640, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .composite([{ input: Buffer.from([255, 255, 255, 235]), raw: { width: 1, height: 1, channels: 4 }, tile: true, blend: "dest-out" }]).png().toBuffer();
    await sharp(await poster(cfg)).png().toFile(path.join(dir, "s0.png"));
    for (let j = 0; j < cfg.slides.length; j++) {
      const [k, items, footer] = cfg.slides[j];
      await sharp({ create: { width: W, height: H, channels: 4, background: C.bg } })
        .composite([{ input: wm, top: 760, left: 500 }, { input: Buffer.from(explainSVG(k, items, footer)), top: 0, left: 0 }, { input: bee, top: 60, left: 940 }])
        .png().toFile(path.join(dir, `s${j + 1}.png`));
    }
    console.log("built", cfg.id, "→", cfg.slides.length + 1, "slides");
  }
})();
