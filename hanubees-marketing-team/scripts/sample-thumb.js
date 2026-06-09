#!/usr/bin/env node
// Sample in the WINNING style (studied from 100M-view business Shorts): real
// footage/face + ONE bold outlined caption + tiny logo. Lever: funny/relatable POV.
// 9:16. Renders out/sample/thumb.png. node sample-thumb.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const W = 1080, H = 1920;
const FONT = "Arial, Roboto, sans-serif"; // heavy sans; prod can swap to a display face
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// bold outlined caption lines (white or red), centered. paint-order=stroke → outline behind.
function caption(lines, cx, yTop, size, fill, lh) {
  return lines.map((l, i) =>
    `<text x="${cx}" y="${yTop + i * lh}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="900"
       paint-order="stroke" stroke="#000" stroke-width="${Math.round(size * 0.14)}" stroke-linejoin="round"
       fill="${fill}" letter-spacing="1">${xml(l)}</text>`).join("");
}

(async () => {
  const SRC = "/tmp/cand/c1.jpg"; // CC facepalm (Vesa Linja-aho, Wikimedia, commercial)
  const bg = await sharp(SRC).resize(W, H, { fit: "cover", position: "top" }).toBuffer();

  const overlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0.78"/><stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="bot" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#000" stop-opacity="0.85"/><stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${W}" height="620" fill="url(#top)"/>
    <rect x="0" y="${H - 360}" width="${W}" height="360" fill="url(#bot)"/>
    ${caption(["POV: YOU JUST SAW", "THE CUSTOMER'S DM"], W / 2, 215, 76, "#ffffff", 90)}
    ${caption(["FROM 4 DAYS AGO"], W / 2, 430, 86, "#ff3b30", 96)}
    <text x="${W / 2}" y="${H - 70}" text-anchor="middle" font-family="${FONT}" font-size="40" font-weight="800"
      paint-order="stroke" stroke="#000" stroke-width="6" fill="#ffbe00" letter-spacing="2">@hanubees</text>
  </svg>`;

  const bee = await sharp(path.join(__dirname, "../assets/brand/bee.png"))
    .resize(96, 96, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

  fs.mkdirSync(path.join(__dirname, "../out/sample"), { recursive: true });
  const out = path.join(__dirname, "../out/sample/thumb.png");
  await sharp(bg)
    .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }, { input: bee, top: H - 230, left: W / 2 - 48 }])
    .png().toFile(out);
  console.log("rendered", out);
})();
