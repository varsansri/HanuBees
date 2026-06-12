"use strict";
// P7 QUALITY CHECKER — the gate before export/post. Runs structural checks on the
// rendered slides + metadata gates from earlier phases. Returns {pass, checks[]}.
const fs = require("fs");
const path = require("path");
const sharp = require("/root/hanubees/node_modules/sharp");
const C = require("../config.js");
const { fitHeadline } = require("./render.js");

// average-hash for near-duplicate photo detection
async function aHash(file) {
  const buf = await sharp(file).flatten({ background: "#000" }).greyscale().resize(8, 8, { fit: "fill" }).raw().toBuffer();
  const mean = buf.reduce((a, b) => a + b, 0) / buf.length;
  let bits = "";
  for (const px of buf) bits += px >= mean ? "1" : "0";
  return bits;
}
const similarity = (a, b) => { let same = 0; for (let i = 0; i < a.length; i++) if (a[i] === b[i]) same++; return same / a.length; };

async function checkPost(post) {
  const checks = [];
  const add = (name, pass, detail) => checks.push({ name, pass, detail });

  // 1) all slides exist + correct 3:4 dimensions
  let dimsOk = true;
  for (let i = 0; i < C.SLIDES.count; i++) {
    const f = path.join(post.outDir, `s${i + 1}.png`);
    if (!fs.existsSync(f)) { dimsOk = false; add(`slide_${i + 1}_exists`, false, "missing"); continue; }
    const m = await sharp(f).metadata();
    const ok = m.width === C.CANVAS.W && m.height === C.CANVAS.H;
    if (!ok) dimsOk = false;
    add(`slide_${i + 1}_size`, ok, `${m.width}x${m.height}`);
  }

  // 2) content slides use a DIFFERENT photo each (no near-duplicates)
  const persons = post.slides.filter((s) => s.person).map((s) => s.person);
  add("photo_count", persons.length >= C.MEDIA.minDistinctPhotos, `${persons.length} (need ${C.MEDIA.minDistinctPhotos})`);
  const hashes = await Promise.all(persons.map(aHash));
  let maxSim = 0, dupPair = "";
  for (let i = 0; i < hashes.length; i++) for (let j = i + 1; j < hashes.length; j++) {
    const s = similarity(hashes[i], hashes[j]); if (s > maxSim) { maxSim = s; dupPair = `${i + 1}~${j + 1}`; }
  }
  add("photos_distinct", maxSim <= C.MEDIA.dupHashMaxSimilarity, `maxSim ${maxSim.toFixed(2)} (${dupPair})`);

  // 3) logo present on content slides
  add("logo_present", post.slides.filter((s) => s.role !== "agency").every((s) => s.logo && fs.existsSync(s.logo)), "");

  // 4) headline auto-fit succeeds (fits maxLines without dropping below minSize)
  let fitOk = true, worst = "";
  for (const s of post.slides) {
    const text = s.role === "agency" ? C.SLIDES.agency.text : s.headline;
    if (!text) continue;
    const f = fitHeadline(text);
    const overflow = f.size === C.TEXT.headline.minSize && f.lines.length > C.TEXT.headline.maxLines;
    if (overflow) { fitOk = false; worst = text.slice(0, 30); }
  }
  add("text_fits", fitOk, fitOk ? "all fit" : `overflow: "${worst}…"`);

  // 5) facts verified (set by P3 truth-check); strict for live posting
  add("facts_verified", post.factsVerified === true, post.factsVerified === true ? "ok" : "NOT verified (P3 pending)");

  // 6) uniqueness claimed before posting (set by P9)
  add("uniqueness_claimed", post.claimed === true, post.claimed === true ? "ok" : "not claimed (dry-run)");

  const hardFails = checks.filter((c) => !c.pass && !["facts_verified", "uniqueness_claimed"].includes(c.name));
  return { pass: hardFails.length === 0, designPass: dimsOk && fitOk, checks };
}

module.exports = { checkPost };
