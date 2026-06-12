"use strict";
// EDITORIAL-HALFTONE variation — single 3:4 worked-problem page, text+shapes only.
// Concept #1 "The Funnel". Renders TWO accent versions (yellow / magenta) so the
// founder can pick the accent. SVG -> sharp raster -> composite bee. No photos.
const fs = require("fs");
const path = require("path");
const sharp = require("/root/hanubees/node_modules/sharp");

// ---- font (reuse the proven render.js fontconfig trick: sans-serif -> Okine) ----
const FONT_DIR = path.join(__dirname, "assets/brand/okine");
const FAMILY = "MADE Okine Sans PERSONAL USE";
fs.mkdirSync("/tmp/mdfonts2", { recursive: true });
fs.writeFileSync("/tmp/mdfonts2/fonts.conf",
  `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>` +
  `<dir>${FONT_DIR}</dir><cachedir>/tmp/mdfontcache2</cachedir>` +
  `<match target="pattern"><test name="family"><string>sans-serif</string></test>` +
  `<edit name="family" mode="assign" binding="same"><string>${FAMILY}</string></edit></match>` +
  `</fontconfig>`);
process.env.FONTCONFIG_FILE = "/tmp/mdfonts2/fonts.conf";

const W = 1080, H = 1440, M = 60;
const PAPER = "#f1ede4", INK = "#14163a", MUTED = "#14163a";
const FF = `${FAMILY}, sans-serif`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// a small horizontal "barcode" of varying-width bars
function barcode(x, y, h) {
  const ws = [3, 1, 2, 4, 1, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 2, 4, 1, 1, 3, 2, 1, 2, 3, 1];
  let cx = x, out = "";
  for (const w of ws) { out += `<rect x="${cx}" y="${y}" width="${w}" height="${h}" fill="${INK}"/>`; cx += w + 2; }
  return out;
}

function svg(accent) {
  const T = (x, y, s, txt, opt = {}) =>
    `<text x="${x}" y="${y}" font-family="${FF}" font-size="${s}" fill="${opt.fill || INK}" ` +
    `${opt.anchor ? `text-anchor="${opt.anchor}" ` : ""}${opt.ls ? `letter-spacing="${opt.ls}" ` : ""}` +
    `${opt.weight ? `font-weight="${opt.weight}" ` : ""}>${esc(txt)}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="ht" width="13" height="13" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="2.3" fill="${INK}" opacity="0.22"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="${PAPER}"/>

  <!-- top metadata bar -->
  ${T(M, 78, 17, "INSTAGRAM", { ls: 3 })}
  ${T(M, 102, 21, "@hanubees", { weight: 700 })}
  ${T(W - M, 78, 17, "MATH x DESIRE", { anchor: "end", ls: 3 })}
  ${T(W - M, 102, 17, "(C) 2026 / NO.01", { anchor: "end", ls: 2 })}
  <rect x="${M}" y="124" width="${W - 2 * M}" height="2.5" fill="${INK}"/>

  <!-- giant hook -->
  ${T(M, 268, 104, "50 APPROACHES.", { weight: 700 })}
  ${T(M, 372, 104, "0 GIRLFRIENDS.", { weight: 700, fill: accent === "#ffbe00" ? INK : accent })}

  <!-- label strip -->
  <rect x="${M}" y="424" width="${W - 2 * M}" height="2" fill="${INK}"/>
  ${T(M, 470, 18, "PROBLEM", { ls: 2 })}
  ${T(285, 470, 18, "GIVEN", { ls: 2 })}
  ${T(470, 470, 18, "FORMULA", { ls: 2 })}
  ${T(700, 470, 18, "SOLVE", { ls: 2 })}
  ${T(W - M, 470, 18, "marketing = math", { anchor: "end" })}
  <rect x="${M}" y="492" width="${W - 2 * M}" height="2" fill="${INK}"/>

  <!-- focal block: the FORMULA as the art -->
  <rect x="${M}" y="528" width="${W - 2 * M}" height="566" fill="${accent}"/>
  <rect x="${M}" y="528" width="${W - 2 * M}" height="566" fill="url(#ht)"/>
  ${T(M + 28, 588, 19, "THE FUNNEL / CONVERSION RATE", { ls: 2 })}
  ${T(W / 2, 740, 78, "G = R x (c1 c2 c3 c4)", { anchor: "middle", weight: 700 })}
  <rect x="${M + 28}" y="800" width="${W - 2 * M - 56}" height="2" fill="${INK}" opacity="0.45"/>
  ${T(M + 28, 880, 36, "c = 0.40 x 0.25 x 0.30 x 0.20 = 0.006", {})}
  ${T(M + 28, 940, 36, "G = 50 x 0.006 = 0.3 GF / MONTH", {})}
  ${T(W - M - 28, 1058, 130, "0.3", { anchor: "end", weight: 700 })}
  ${T(M + 28, 1058, 19, "REACH ISN'T THE PROBLEM", { ls: 2 })}

  <!-- answer -->
  ${T(M, 1168, 20, "ANSWER", { ls: 3, fill: accent === "#ffbe00" ? INK : accent })}
  ${T(M, 1212, 38, "DON'T CHASE MORE REACH. FIND YOUR", { weight: 700 })}
  ${T(M, 1258, 38, "LOWEST STAGE — AND FIX THAT ONE.", { weight: 700 })}

  <!-- footer -->
  <rect x="${M}" y="1320" width="${W - 2 * M}" height="2" fill="${INK}"/>
  ${barcode(M, 1356, 46)}
  ${T(M, 1428, 16, "12 / 06 / 26  ·  MADE WITH MATH", { ls: 1 })}
  ${T(W - M, 1372, 18, "HANUBEES.COM", { anchor: "end", weight: 700, ls: 1 })}
  ${T(W - M, 1428, 15, "PERSUASION, SOLVED AS A PROBLEM", { anchor: "end", ls: 1 })}
</svg>`;
}

async function render(accent, name, outdirs) {
  const buf = Buffer.from(svg(accent));
  let img = sharp(buf, { density: 144 }).resize(W, H);
  // composite bee bottom-right (small)
  const bee = await sharp(path.join(__dirname, "assets/brand/bee.png"))
    .resize(96, 96, { fit: "inside" }).png().toBuffer();
  img = sharp(await img.png().toBuffer()).composite([{ input: bee, left: W - M - 96, top: 1340 }]);
  const png = await img.png().toBuffer();
  for (const d of outdirs) {
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, name), png);
    console.log("wrote", path.join(d, name));
  }
}

(async () => {
  const phone = "/sdcard/Pictures/HanubeesMD";
  const proj = path.join(__dirname, "out/editorial-halftone");
  await render("#ffbe00", "funnel-A-yellow.png", [phone, proj]);
  await render("#ff1f5a", "funnel-B-magenta.png", [phone, proj]);
  console.log("DONE");
})().catch((e) => { console.error(e); process.exit(1); });
