"use strict";
// P6-video — build a vertical reel: 4 TRANSPARENT slides composited over the
// SideRays animated background + music. All params from config.VIDEO (frozen).
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const C = require("../config.js");
const { renderPost, headlineLayout } = require("./render.js");

const V = C.VIDEO;
const slidesDur = V.secPerSlide * C.SLIDES.count;
const introSec = V.introSec || 0;
const total = introSec + slidesDur;                 // full reel = intro + slides

// render (once, cached) the rays background to a temp mp4 at the reel duration
function ensureRays(raysMp4) {
  if (fs.existsSync(raysMp4)) return raysMp4;
  const r = V.rays;
  execFileSync("python3", ["-c", `
import sys; sys.path.insert(0, ${JSON.stringify(path.join(C.ROOT, "lib"))})
from rays import render
render(${JSON.stringify(raysMp4)}, W=${r.renderW}, H=${r.renderH}, dur=${total}, fps=${V.fps},
       speed=${r.speed}, color1=${JSON.stringify(r.color1)}, color2=${JSON.stringify(r.color2)},
       intensity=${r.intensity}, spread=${r.spread}, origin=${JSON.stringify(r.origin)}, tilt=${r.tilt},
       saturation=${r.saturation}, blend=${r.blend}, falloff=${r.falloff}, opacity=${r.opacity})
`], { stdio: "pipe" });
  return raysMp4;
}

// build BlurText overlay frames for the whole reel (headline animates in per slide)
function makeTextFrames(post, framesDir) {
  const slides = [];
  post.slides.forEach((s, i) => {
    const headline = s.role === "agency" ? C.SLIDES.agency.text : s.headline;
    const lay = headlineLayout(headline);
    slides.push({ start: introSec + i * V.secPerSlide, size: lay.size, lh: lay.lh, x: lay.x, firstY: lay.firstY, lines: lay.lines });
  });
  const spec = { W: V.W, H: V.H, fps: V.fps, fontFile: C.FONT.file, fill: C.COLORS[C.TEXT.headline.fill],
    yOffset: V.slideYOffset, slideDur: V.secPerSlide, dur: total, slides };
  const specPath = path.join(framesDir, "..", "text_spec.json");
  fs.mkdirSync(framesDir, { recursive: true });
  fs.writeFileSync(specPath, JSON.stringify(spec));
  execFileSync("python3", [path.join(C.ROOT, "lib/blurtext.py"), specPath, framesDir], { stdio: "pipe" });
}

// post = { slug, slides, outDir } -> writes <outMp4>
async function makeReel(post, outMp4, raysMp4) {
  const vdir = path.join(post.outDir, "video");
  // 1) transparent slides WITHOUT the baked headline (it animates separately)
  await renderPost({ outDir: vdir, slides: post.slides, transparent: true, noHeadline: true });
  // 2) rays bg
  ensureRays(raysMp4);
  // 3) animated BlurText headline frames
  const framesDir = path.join(vdir, "text");
  makeTextFrames(post, framesDir);
  const useIntro = introSec > 0;
  const useBee = !!(V.bee && V.bee.enabled);
  // 4) folder intro frames (optional)
  if (useIntro) {
    const introDir = path.join(vdir, "intro");
    fs.mkdirSync(introDir, { recursive: true });
    const introSpec = { W: V.W, H: V.H, fps: V.fps, dur: introSec, fontFile: C.FONT.file, beePng: C.ASSETS.bee, ...V.intro };
    fs.writeFileSync(path.join(vdir, "intro_spec.json"), JSON.stringify(introSpec));
    execFileSync("python3", [path.join(C.ROOT, "lib/intro.py"), path.join(vdir, "intro_spec.json"), introDir], { stdio: "pipe" });
  }
  // 5) bee narrative frames (optional)
  if (useBee) {
    const beeDir = path.join(vdir, "bee");
    fs.mkdirSync(beeDir, { recursive: true });
    const beeSpec = { W: V.W, H: V.H, fps: V.fps, dur: total, introSec, secPerSlide: V.secPerSlide,
      beePng: C.ASSETS.bee, beeSize: V.bee.size, bigBeeCenter: V.bee.bigBeeCenter, wobbleAmp: V.bee.wobbleAmp, tiltAmp: V.bee.tiltAmp };
    fs.writeFileSync(path.join(vdir, "bee_spec.json"), JSON.stringify(beeSpec));
    execFileSync("python3", [path.join(C.ROOT, "lib/beestory.py"), path.join(vdir, "bee_spec.json"), beeDir], { stdio: "pipe" });
  }
  // 6) ffmpeg composite: rays -> slides(shifted) -> BlurText [-> intro -> bees] -> music
  const music = path.join(C.ROOT, "assets/music", V.music);
  const ins = ["-i", raysMp4];
  for (let i = 1; i <= C.SLIDES.count; i++) ins.push("-i", path.join(vdir, `s${i}.png`));
  ins.push("-framerate", String(V.fps), "-i", path.join(framesDir, "%04d.png"));   // text
  let idx = C.SLIDES.count + 1;
  const textIdx = idx++;
  let introIdx, beeIdx;
  if (useIntro) { ins.push("-framerate", String(V.fps), "-i", path.join(vdir, "intro/%04d.png")); introIdx = idx++; }
  if (useBee)   { ins.push("-framerate", String(V.fps), "-i", path.join(vdir, "bee/%04d.png")); beeIdx = idx++; }
  ins.push("-i", music); const aIdx = idx++;
  let fc = `[0:v]scale=${V.W}:${V.H},fps=${V.fps}[bg];`;
  let prev = "bg";
  for (let i = 0; i < C.SLIDES.count; i++) {
    const t0 = (introSec + i * V.secPerSlide).toFixed(2), t1 = (introSec + (i + 1) * V.secPerSlide).toFixed(2);
    fc += `[${prev}][${i + 1}:v]overlay=0:${V.slideYOffset}:enable='between(t,${t0},${t1})'[o${i}];`;
    prev = `o${i}`;
  }
  fc += `[${prev}][${textIdx}:v]overlay=0:0[wt];`; prev = "wt";
  if (useIntro) { fc += `[${prev}][${introIdx}:v]overlay=0:0:enable='between(t,0,${introSec})':eof_action=pass[wi];`; prev = "wi"; }
  if (useBee)   { fc += `[${prev}][${beeIdx}:v]overlay=0:0[wb];`; prev = "wb"; }
  fc += `[${prev}]null[v];`;
  fc += `[${aIdx}:a]afade=t=out:st=${(total - V.audioFadeOut).toFixed(2)}:d=${V.audioFadeOut},volume=${V.audioVolume}[au]`;
  const args = ["-y", ...ins, "-filter_complex", fc, "-map", "[v]", "-map", "[au]",
    "-t", String(total), "-r", String(V.fps), "-c:v", V.codec, "-pix_fmt", V.pixfmt,
    "-preset", "veryfast", "-c:a", "aac", "-b:a", V.abitrate, "-movflags", "+faststart", outMp4];
  execFileSync("ffmpeg", args, { stdio: "pipe" });
  return outMp4;
}

module.exports = { makeReel, ensureRays, total };
