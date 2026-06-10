#!/usr/bin/env node
require("./_env");
// ─────────────────────────────────────────────────────────────────────────────
// HANUBEES MEDIA ARMY — DAILY ORCHESTRATOR (the one command opencode runs each day)
//
//   node scripts/run-day.js            # DRY RUN — plan only, no posts
//   node scripts/run-day.js --live     # render + SCHEDULE everything via Zernio
//   node scripts/run-day.js --live --target 16   # ~16/account (~130/day)
//
// What it does, end to end:
//   1. Reads today's CONCEPTS from daily-batch.js (the hooks the AI brain wrote).
//   2. Keeps only subjects whose media exists in assets/library/<id> (run build-library first).
//   3. CLAIMS subjects in the shared DB so this army & the original never double-post.
//   4. Renders the SAME-quality assets: slides (daily-batch.js) + reel.mp4 (make-reel.sh + NCS music).
//   5. Assigns subjects across the 8 accounts (config.ACCOUNTS): IG/TikTok/YouTube = VIDEO,
//      Threads = IMAGE. Each account gets >= VOLUME.minPerAccountPerDay UNIQUE subjects.
//   6. Schedules with ANTI-BURST random gaps (>= minGap, jittered) spread across the day.
// ─────────────────────────────────────────────────────────────────────────────
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execSync } = require("child_process");
const { ACCOUNTS, VOLUME, TRACKS, SYSTEM_ID } = require("./config");
const { claimSubjects } = require("./claim");

const ROOT = path.join(__dirname, "..");
const ZB = "https://api.zernio.com/v1";
const LIVE = process.argv.includes("--live");
const argN = (flag, def) => { const i = process.argv.indexOf(flag); return i > -1 ? Number(process.argv[i + 1]) : def; };
const TARGET = argN("--target", VOLUME.perAccountPerDay); // posts per account
const rnd = (n) => Math.floor(Math.random() * n);
const jitter = () => { const [a, b] = VOLUME.jitterMinutes; return a + rnd(b - a + 1); };

// ── load CONCEPTS array out of daily-batch.js (no rendering side-effects) ──
function loadConcepts() {
  const src = fs.readFileSync(path.join(__dirname, "daily-batch.js"), "utf8");
  const a = src.indexOf("const CONCEPTS =");
  const code = src.slice(a, src.indexOf("\n];", a) + 3) + "\nmodule.exports=CONCEPTS;";
  const m = { exports: {} }; vm.runInNewContext(code, { module: m, require });
  return m.exports;
}
const hasMedia = (id) => fs.existsSync(path.join(ROOT, "assets/library", id, "photo.jpg"));

function captions(c, track) {
  const ins = c.slides?.[0]?.[1]?.[0];
  const insight = ins ? `${ins[1]} ${ins[2]}` : "";
  const ig = [c.headline.trim(), c.question.trim(), insight,
    "Built by Hanubees — the AI that answers a business 24/7. hanubees.com",
    `#${c.id} #startup #business #founders #entrepreneur`,
    track ? track.credit : ""].filter(Boolean).join("\n\n");
  let tt = c.headline.trim(); if (tt.length > 88) tt = tt.slice(0, 85) + "…";
  return { ig, tt };
}

async function presignPut(key, file, ct, name) {
  const pre = await (await fetch(`${ZB}/media/presign`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ filename: name, contentType: ct }),
  })).json();
  await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": ct }, body: fs.readFileSync(file) });
  return pre.publicUrl;
}
async function accountId(key, platform) {
  const j = await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${key}` } })).json();
  return ((j.accounts || []).find((a) => a.platform === platform) || {})._id;
}

(async () => {
  const CONCEPTS = loadConcepts();
  const withMedia = CONCEPTS.filter((c) => hasMedia(c.id));
  const missing = CONCEPTS.filter((c) => !hasMedia(c.id)).map((c) => c.id);
  if (missing.length) console.log(`⚠ ${missing.length} concepts have no media (run build-library.js): ${missing.join(", ")}`);

  // claim subjects so the two armies never collide
  const freeIds = await claimSubjects(withMedia.map((c) => c.id), { days: 10, dryRun: !LIVE });
  let pool = withMedia.filter((c) => freeIds.includes(c.id));

  const need = ACCOUNTS.length * TARGET;
  if (pool.length < ACCOUNTS.length * VOLUME.minPerAccountPerDay) {
    console.log(`\n⚠ SUPPLY LOW: ${pool.length} unique posts available but need >= ${ACCOUNTS.length * VOLUME.minPerAccountPerDay} ` +
      `(>=${VOLUME.minPerAccountPerDay}/account). The AI brain must add more CONCEPTS to daily-batch.js + run build-library.js.`);
  }
  pool = pool.slice(0, need);

  // round-robin subject -> account slot (each account gets DISTINCT subjects)
  const perAccount = ACCOUNTS.map(() => []);
  pool.forEach((c, i) => perAccount[i % ACCOUNTS.length].push(c));

  // build the anti-burst schedule
  const now = Date.now();
  const windowMin = VOLUME.dayWindowHours * 60;
  const plan = [];
  ACCOUNTS.forEach((acc, ai) => {
    const subs = perAccount[ai];
    if (!subs.length) return;
    const step = Math.max(VOLUME.minGapMinutesSameAccount, Math.floor(windowMin / subs.length));
    let t = ai * 7; // stagger account start times so all 8 don't fire together
    subs.forEach((c) => {
      const off = Math.min(windowMin, Math.max(2, t + jitter()));
      const track = TRACKS[plan.length % TRACKS.length];
      plan.push({ acc, c, off, when: new Date(now + off * 60000), media: acc.media, track });
      t += step;
    });
  });
  plan.sort((a, b) => a.off - b.off);

  // report
  console.log(`\n${LIVE ? "=== LIVE — rendering + scheduling ===" : "=== DRY RUN (no posts) — add --live to schedule ==="}`);
  const byAcc = {};
  plan.forEach((p) => { const k = `${p.acc.platform}/${p.acc.username}`; (byAcc[k] = byAcc[k] || []).push(p); });
  for (const [k, ps] of Object.entries(byAcc)) {
    console.log(`\n${k} (${ps[0].media}) — ${ps.length} posts:`);
    ps.forEach((p) => console.log(`  ${p.when.toISOString().slice(11, 16)}Z  ${p.c.id}  — ${p.c.headline.trim().slice(0, 50)}`));
  }
  console.log(`\nTOTAL: ${plan.length} posts across ${Object.keys(byAcc).length} accounts ` +
    `(min/account ${Math.min(...Object.values(byAcc).map((x) => x.length))}, target ${TARGET}).`);
  if (!LIVE) { console.log("\nRe-run with --live to render + schedule."); return; }

  // render every needed asset (slides always; reel for video slots)
  const renderedReel = new Set();
  for (const p of plan) {
    const dir = path.join(ROOT, "out/daily", p.c.id);
    if (!fs.existsSync(path.join(dir, "s0.png"))) execSync(`node ${path.join(__dirname, "daily-batch.js")} ${p.c.id}`, { stdio: "ignore" });
    if (p.media === "video" && !renderedReel.has(p.c.id)) {
      execSync(`bash ${path.join(__dirname, "make-reel.sh")} "${dir}" "${p.track.file}" "${dir}/reel.mp4" 3.6 27`, { stdio: "ignore" });
      renderedReel.add(p.c.id);
    }
  }

  // schedule via Zernio
  const idCache = {};
  let ok = 0, fail = 0;
  for (const p of plan) {
    const key = process.env[p.acc.keyEnv];
    const ck = p.acc.keyEnv + p.acc.platform;
    if (!(ck in idCache)) idCache[ck] = await accountId(key, p.acc.platform);
    const dir = path.join(ROOT, "out/daily", p.c.id);
    try {
      let mediaItems;
      if (p.media === "video") {
        mediaItems = [{ url: await presignPut(key, path.join(dir, "reel.mp4"), "video/mp4", `${p.c.id}.mp4`), type: "video" }];
      } else {
        const urls = [];
        for (const f of ["s0.png", "s1.png", "s2.png"]) urls.push(await presignPut(key, path.join(dir, f), "image/png", `${p.c.id}-${f}`));
        mediaItems = urls.map((u) => ({ url: u, type: "image" }));
      }
      const cap = captions(p.c, p.media === "video" ? p.track : null);
      const content = p.acc.platform === "tiktok" ? cap.ig : (p.acc.platform === "threads" ? cap.ig : cap.ig);
      const res = await fetch(`${ZB}/posts`, {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content, mediaItems, platforms: [{ platform: p.acc.platform, accountId: idCache[ck] }],
          scheduledFor: p.when.toISOString(), timezone: "Etc/UTC" }),
      });
      if (res.ok) { ok++; console.log(`✓ ${p.acc.platform}/${p.acc.username} ${p.c.id} @ ${p.when.toISOString().slice(11, 16)}Z`); }
      else { fail++; console.log(`✗ ${p.acc.platform}/${p.c.id}:`, (await res.text()).slice(0, 120)); }
    } catch (e) { fail++; console.log(`✗ ${p.acc.platform}/${p.c.id} ERR`, e.message); }
  }
  console.log(`\nDONE — scheduled ${ok}, failed ${fail}. (${SYSTEM_ID})`);
})();
