"use strict";
// P6 RENDER — pure, config-driven. Inputs: a post object {slides[], }. The design
// comes ENTIRELY from ../config.js (frozen). Only content + media paths vary.
const fs = require("fs");
const path = require("path");
const sharp = require("/root/hanubees/node_modules/sharp");
const C = require("../config.js");

(function setupFonts() {
  const dir = C.FONT.dir || path.dirname(C.FONT.file);
  const primary = C.FONT.family.split(",")[0].trim();
  fs.mkdirSync("/tmp/mdfonts", { recursive: true });
  fs.writeFileSync("/tmp/mdfonts/fonts.conf",
    `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>` +
    `<dir>${dir}</dir><cachedir>/tmp/mdfontcache</cachedir>` +
    `<match target="pattern"><test name="family"><string>sans-serif</string></test><edit name="family" mode="assign" binding="same"><string>${primary}</string></edit></match>` +
    `</fontconfig>`);
  process.env.FONTCONFIG_FILE = "/tmp/mdfonts/fonts.conf";
})();

const { W, H, safe } = C.CANVAS;
const FF = C.FONT.family;
const col = (k) => C.COLORS[k] || k;
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const wrap = (t, max) => { const w = String(t).split(/\s+/), o = []; let c = ""; for (const x of w) { if ((c + " " + x).trim().length > max) { if (c) o.push(c.trim()); c = x; } else c += " " + x; } if (c.trim()) o.push(c.trim()); return o; };

// LOCKED text auto-fit: shrink font until the headline fits maxLines, never below minSize.
function fitHeadline(text) {
  const t = C.TEXT.headline, maxW = W - t.x - safe, cw = t.charW || 0.56;
  for (let size = t.maxSize; size >= t.minSize; size -= t.step) {
    const cpl = Math.floor(maxW / (size * cw));
    const lines = wrap(text, cpl);
    if (lines.length <= t.maxLines) return { size, lines, lh: Math.round(size * 1.16) };
  }
  const cpl = Math.floor(maxW / (t.minSize * cw));
  return { size: t.minSize, lines: wrap(text, cpl).slice(0, t.maxLines), lh: Math.round(t.minSize * 1.16) };
}
const topicSize = (s) => C.TEXT.topicFit[String(String(s).length)] || C.TEXT.topicFit.default;

function backLayer({ kicker, code, topic, transparent }) {
  const g = C.GRID;
  // VIDEO mode: omit the solid gradient bg (rays show through) + add a soft scrim
  // behind the top metadata so text stays legible over bright rays.
  const bgRect = transparent
    ? `<rect width="${W}" height="300" fill="#000" opacity="0.28"/>`
    : `<rect width="${W}" height="${H}" fill="url(#bg)"/>`;
  let ruler = "";
  for (let i = 0; i <= g.ruler.count; i++) { const yy = g.ruler.yStart + i * g.ruler.step; const lng = i % 2 === 0; ruler += `<rect x="${g.ruler.x}" y="${yy}" width="${lng ? g.ruler.longW : g.ruler.shortW}" height="${g.ruler.h}" fill="${col(g.ruler.fill)}" opacity="${g.ruler.opacity}"/>`; }
  const geo = `<g opacity="0.85"><rect x="${g.geo.x}" y="${g.geo.y}" width="${g.geo.size}" height="${g.geo.size}" fill="none" stroke="${col("yellow")}" stroke-width="3"/><rect x="${g.geo.x + g.geo.gap}" y="${g.geo.y}" width="${g.geo.size}" height="${g.geo.size}" fill="none" stroke="${col("fg")}" stroke-width="3"/><rect x="${g.geo.x + g.geo.gap * 2}" y="${g.geo.y}" width="${g.geo.size}" height="${g.geo.size}" fill="${col("yellow")}"/></g>`;
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#33373f"/><stop offset="0.5" stop-color="#1b1d24"/><stop offset="1" stop-color="${col("bg")}"/></linearGradient></defs>
    ${bgRect}
    ${geo}
    <text x="${g.kicker.x}" y="${g.kicker.y}" font-family="${FF}" font-size="${g.kicker.size}" font-weight="${g.kicker.weight}" letter-spacing="${g.kicker.ls}" fill="${col(g.kicker.fill)}">${xml(kicker)}</text>
    <text x="${g.code.x}" y="${g.code.y}" font-family="${FF}" font-size="${g.code.size}" font-weight="${g.code.weight}" letter-spacing="${g.code.ls}" fill="${col(g.code.fill)}">${xml(code)}</text>
    <text x="${W - g.brandRight.yX}" y="${g.brandRight.y}" text-anchor="end" font-family="${FF}" font-size="${g.brandRight.size}" font-weight="${g.brandRight.weight}" letter-spacing="${g.brandRight.ls}" fill="${col(g.brandRight.fill)}">${g.brandRight.text}</text>
    <text x="${W - g.urlRight.yX}" y="${g.urlRight.y}" text-anchor="end" font-family="${FF}" font-size="${g.urlRight.size}" font-weight="${g.urlRight.weight}" letter-spacing="${g.urlRight.ls}" fill="${col(g.urlRight.fill)}">${g.urlRight.text}</text>
    <text x="${g.topic.x}" y="${g.topic.y}" font-family="${FF}" font-size="${topicSize(topic)}" font-weight="${g.topic.weight}" letter-spacing="${g.topic.ls}" fill="${col(g.topic.fill)}">${xml(topic)}</text>
    ${ruler}
  </svg>`);
}

function headlineLayout(headline) {
  const t = C.TEXT.headline, fit = fitHeadline(headline);
  const firstY = H - t.bottomMargin - (fit.lines.length - 1) * fit.lh;
  return { size: fit.size, lines: fit.lines, lh: fit.lh, firstY, x: t.x, weight: t.weight, fill: t.fill };
}

function frontLayer({ headline, tag, noHeadline }) {
  const b = C.BAND, t = C.TEXT.headline, tg = C.TEXT.tag;
  const bandTop = Math.round(H * b.topRatio);
  const lay = headlineLayout(headline);
  let tl = ""; lay.lines.forEach((l, i) => { tl += `<tspan x="${t.x}" y="${lay.firstY + i * lay.lh}">${xml(l)}</tspan>`; });
  const tagY = lay.firstY - tg.gapAboveHead, ruleY = tagY - tg.ruleGap;
  const stops = b.fade.map((s) => `<stop offset="${s.off}" stop-color="#000" stop-opacity="${s.op}"/>`).join("");
  const headEl = noHeadline ? "" : `<text font-family="${FF}" font-size="${lay.size}" font-weight="${t.weight}" fill="${col(t.fill)}">${tl}</text>`;
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient></defs>
    <rect x="0" y="${bandTop}" width="${W}" height="${H - bandTop}" fill="url(#fade)"/>
    <rect x="${t.x}" y="${ruleY}" width="${tg.ruleW}" height="${tg.ruleH}" fill="${col("yellow")}"/>
    <text x="${t.x}" y="${tagY}" font-family="${FF}" font-size="${tg.size}" font-weight="${tg.weight}" letter-spacing="${tg.ls}" fill="${col(tg.fill)}">${xml(tag)}</text>
    ${headEl}
  </svg>`);
}

async function circle(src, dia) { return sharp(src).resize(dia, dia).png().toBuffer(); }

async function renderSlide(out, slide, angleName, transparent, noHeadline) {
  const a = C.ANGLES[angleName], cl = C.CLUSTER;
  const layers = [{ input: backLayer({ ...slide, transparent }) }];
  if (slide.logo) layers.push({ input: await circle(slide.logo, cl.logoDia), top: a.logoTop, left: a.logoLeft });
  if (slide.person) {
    layers.push({ input: await circle(slide.person, cl.personDia), top: a.personTop, left: a.personLeft });
    const ring = Buffer.from(`<svg width="${cl.personDia}" height="${cl.personDia}"><circle cx="${cl.personDia / 2}" cy="${cl.personDia / 2}" r="${cl.personDia / 2 - 3}" fill="none" stroke="${cl.ringColor}" stroke-opacity="${cl.ringOpacity}" stroke-width="${cl.ringStroke}"/></svg>`);
    layers.push({ input: ring, top: a.personTop, left: a.personLeft });
  }
  layers.push({ input: frontLayer({ ...slide, noHeadline }) });
  const bee = await sharp(C.ASSETS.bee).resize({ width: C.GRID.bee.width }).png().toBuffer();
  const bm = await sharp(bee).metadata();
  layers.push({ input: bee, top: H - bm.height - C.GRID.bee.marginBottom, left: W - bm.width - C.GRID.bee.marginRight });
  const bg = transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : col("bg");
  await sharp({ create: { width: W, height: H, channels: 4, background: bg } }).composite(layers).png().toFile(out);
}

async function renderAgency(out, transparent, noHeadline) {
  const ag = C.SLIDES.agency;
  const bee = await sharp(C.ASSETS.bee).resize({ width: ag.beeWidth }).png().toBuffer();
  const bm = await sharp(bee).metadata();
  const bg = transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : col("bg");
  await sharp({ create: { width: W, height: H, channels: 4, background: bg } }).composite([
    { input: backLayer({ kicker: ag.kicker, code: ag.code, topic: ag.topic, transparent }) },
    { input: bee, top: ag.beeTop, left: Math.round((W - bm.width) / 2) },
    { input: frontLayer({ tag: ag.tag, headline: ag.text, noHeadline }) },
  ]).png().toFile(out);
}

// post = { id, outDir, slides:[...], transparent? }  (transparent = video mode)
async function renderPost(post) {
  fs.mkdirSync(post.outDir, { recursive: true });
  const order = C.ANGLE_ORDER;
  let ai = 0;
  for (let i = 0; i < post.slides.length; i++) {
    const slide = post.slides[i];
    const out = path.join(post.outDir, `s${i + 1}.png`);
    if (slide.role === "agency") { await renderAgency(out, post.transparent, post.noHeadline); }
    else { await renderSlide(out, slide, order[ai % order.length], post.transparent, post.noHeadline); ai++; }
  }
  return post.outDir;
}

module.exports = { renderPost, fitHeadline, topicSize, headlineLayout };
