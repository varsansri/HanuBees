#!/usr/bin/env node
require("./_env");
// ─────────────────────────────────────────────────────────────────────────────
// HANUBEES MEDIA ARMY — keyword control panel (what opencode / you trigger)
//
//   node scripts/army.js status            # today's progress + every scheduled post
//   node scripts/army.js next              # build + SCHEDULE the next batch (10 posts)
//   node scripts/army.js next 20           # next batch of 20
//   node scripts/army.js plan              # PREVIEW the next batch (no posting)
//   node scripts/army.js subjects          # library / concept supply health
//   node scripts/army.js help
//
// A "batch" = config.VOLUME.batchSize (10) posts, spread across the 8 accounts with
// anti-burst random gaps, each appended AFTER that account's last scheduled slot today.
// Call `next` ~13× to reach the 130/day target. Subjects are claimed in the shared DB so
// this army and the original never double-post.
// ─────────────────────────────────────────────────────────────────────────────
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execSync } = require("child_process");
const { ACCOUNTS, VOLUME, TRACKS, SYSTEM_ID } = require("./config");
const { usedRecently, sql } = require("./claim");

const ROOT = path.join(__dirname, "..");
const ZB = "https://api.zernio.com/v1";
const esc = (s) => String(s).replace(/'/g, "''");
const rnd = (n) => Math.floor(Math.random() * n);
const jitter = () => { const [a, b] = VOLUME.jitterMinutes; return a + rnd(b - a + 1); };
const hhmm = (d) => new Date(d).toISOString().slice(11, 16) + "Z";

function loadConcepts() {
  const src = fs.readFileSync(path.join(__dirname, "daily-batch.js"), "utf8");
  const a = src.indexOf("const CONCEPTS =");
  const code = src.slice(a, src.indexOf("\n];", a) + 3) + "\nmodule.exports=CONCEPTS;";
  const m = { exports: {} }; vm.runInNewContext(code, { module: m, require });
  return m.exports;
}
const hasMedia = (id) => fs.existsSync(path.join(ROOT, "assets/library", id, "photo.jpg"));

// rows scheduled for TODAY (UTC) by this army
async function todayRows() {
  return sql(`select subject, account, scheduled_for from subject_log
    where system='${esc(SYSTEM_ID)}' and scheduled_for is not null
      and scheduled_for::date = (now() at time zone 'utc')::date
    order by scheduled_for;`);
}
async function availablePool() {
  const concepts = loadConcepts().filter((c) => hasMedia(c.id));
  const used = await usedRecently(concepts.map((c) => c.id), 10);
  return concepts.filter((c) => !used.has(c.id));
}

function captions(c, track) {
  const ins = c.slides?.[0]?.[1]?.[0];
  const insight = ins ? `${ins[1]} ${ins[2]}` : "";
  return [c.headline.trim(), c.question.trim(), insight,
    "Built by Hanubees — the AI that answers a business 24/7. hanubees.com",
    `#${c.id} #startup #business #founders #entrepreneur`,
    track ? track.credit : ""].filter(Boolean).join("\n\n");
}
async function presignPut(key, file, ct, name) {
  const pre = await (await fetch(`${ZB}/media/presign`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ filename: name, contentType: ct }),
  })).json();
  await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": ct }, body: fs.readFileSync(file) });
  return pre.publicUrl;
}
async function acctId(key, platform) {
  const j = await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${key}` } })).json();
  return ((j.accounts || []).find((a) => a.platform === platform) || {})._id;
}

// Greedy balanced assignment + anti-burst placement, seeded by what's already scheduled today.
async function buildBatchPlan(n) {
  const pool = await availablePool();
  const rows = await todayRows();
  const count = {}, last = {};
  // seed one gap in the past so the FIRST post of the day lands ~now+jitter, not now+45min
  ACCOUNTS.forEach((a) => { const k = `${a.platform}/${a.username}`; count[k] = 0; last[k] = Date.now() - VOLUME.minGapMinutesSameAccount * 60000; });
  for (const r of rows) { if (r.account in count) { count[r.account]++; last[r.account] = Math.max(last[r.account], +new Date(r.scheduled_for)); } }

  const take = Math.min(n, pool.length);
  const plan = [];
  for (let i = 0; i < take; i++) {
    // pick least-loaded account (respects running balance across batches)
    const acc = ACCOUNTS.slice().sort((a, b) => count[`${a.platform}/${a.username}`] - count[`${b.platform}/${b.username}`])[0];
    const k = `${acc.platform}/${acc.username}`;
    const gap = Math.max(VOLUME.minGapMinutesSameAccount, 0) + jitter();
    const when = new Date(Math.max(Date.now() + 2 * 60000, last[k] + gap * 60000));
    last[k] = +when; count[k]++;
    plan.push({ acc, c: pool[i], when, track: TRACKS[(rows.length + i) % TRACKS.length] });
  }
  plan.sort((a, b) => a.when - b.when);
  return { plan, pool, take, scheduledToday: rows.length };
}

async function cmdStatus() {
  const rows = await todayRows();
  const pool = await availablePool();
  const target = VOLUME.dailyTarget, done = rows.length;
  const remaining = Math.max(0, target - done);
  const needCreate = Math.max(0, remaining - pool.length);
  console.log(`\n📊 HANUBEES MEDIA ARMY — today (${new Date().toISOString().slice(0, 10)} UTC)\n`);
  console.log(`   Target:     ${target} posts (${Math.ceil(target / VOLUME.batchSize)} batches of ${VOLUME.batchSize})`);
  console.log(`   Scheduled:  ${done}  (${(done / VOLUME.batchSize).toFixed(1)} batches done)`);
  console.log(`   Remaining:  ${remaining} to reach target`);
  console.log(`   Concepts ready to schedule now: ${pool.length}`);
  if (needCreate > 0) console.log(`   ⚠ WRITE ${needCreate} MORE concepts in daily-batch.js (+ build-library.js) to fully hit target.`);
  else console.log(`   ✓ Enough concepts in stock for the rest of today.`);
  const perAcc = {};
  rows.forEach((r) => (perAcc[r.account] = (perAcc[r.account] || 0) + 1));
  console.log(`\n   Per account (floor ${VOLUME.minPerAccountPerDay}):`);
  ACCOUNTS.forEach((a) => { const k = `${a.platform}/${a.username}`; const n = perAcc[k] || 0; console.log(`     ${n >= VOLUME.minPerAccountPerDay ? "✓" : "·"} ${k.padEnd(26)} ${n}`); });
  if (rows.length) {
    console.log(`\n   ── All ${rows.length} posts scheduled today ──`);
    rows.forEach((r) => console.log(`     ${hhmm(r.scheduled_for)}  ${r.account.padEnd(26)} ${r.subject}`));
  } else console.log(`\n   (nothing scheduled yet — run: node scripts/army.js next)`);
  console.log("");
}

async function cmdSubjects() {
  const concepts = loadConcepts();
  const withMedia = concepts.filter((c) => hasMedia(c.id));
  const pool = await availablePool();
  console.log(`\n🧱 SUPPLY: ${concepts.length} concepts in daily-batch.js · ${withMedia.length} have media · ${pool.length} unused & ready.`);
  const noMedia = concepts.filter((c) => !hasMedia(c.id)).map((c) => c.id);
  if (noMedia.length) console.log(`   ⚠ no media (run build-library.js): ${noMedia.join(", ")}`);
  console.log("");
}

async function cmdNext(n, live) {
  const { plan, take, scheduledToday } = await buildBatchPlan(n);
  if (!take) { console.log("\n(no unused concepts available — write more in daily-batch.js, then build-library.js)\n"); return; }
  console.log(`\n${live ? "▶ SCHEDULING" : "👀 PREVIEW"} next batch — ${take} posts (already scheduled today: ${scheduledToday})\n`);
  plan.forEach((p) => console.log(`   ${hhmm(p.when)}  ${`${p.acc.platform}/${p.acc.username}`.padEnd(26)} ${p.acc.media.padEnd(5)} ${p.c.id}`));
  if (!live) { console.log(`\n   Preview only. Run: node scripts/army.js next ${n}\n`); return; }

  let ok = 0, fail = 0;
  const idc = {};
  for (const p of plan) {
    const key = process.env[p.acc.keyEnv];
    const dir = path.join(ROOT, "out/daily", p.c.id);
    try {
      if (!fs.existsSync(path.join(dir, "s0.png"))) execSync(`node "${path.join(__dirname, "daily-batch.js")}" ${p.c.id}`, { stdio: "ignore" });
      let mediaItems;
      if (p.acc.media === "video") {
        execSync(`bash "${path.join(__dirname, "make-reel.sh")}" "${dir}" "${p.track.file}" "${dir}/reel.mp4" 3.6 27`, { stdio: "pipe" });
        mediaItems = [{ url: await presignPut(key, path.join(dir, "reel.mp4"), "video/mp4", `${p.c.id}.mp4`), type: "video" }];
      } else {
        const urls = [];
        for (const f of ["s0.png", "s1.png", "s2.png"]) urls.push(await presignPut(key, path.join(dir, f), "image/png", `${p.c.id}-${f}`));
        mediaItems = urls.map((u) => ({ url: u, type: "image" }));
      }
      const ck = p.acc.keyEnv + p.acc.platform;
      if (!(ck in idc)) idc[ck] = await acctId(key, p.acc.platform);
      const res = await fetch(`${ZB}/posts`, {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: captions(p.c, p.acc.media === "video" ? p.track : null), mediaItems,
          platforms: [{ platform: p.acc.platform, accountId: idc[ck] }], publishNow: true }),
      });
      if (res.ok) {
        ok++;
        await sql(`insert into subject_log (subject, system, account, scheduled_for) values ('${esc(p.c.id)}','${esc(SYSTEM_ID)}','${esc(p.acc.platform + "/" + p.acc.username)}','${p.when.toISOString()}');`);
        console.log(`   ✓ ${p.acc.platform}/${p.acc.username} ${p.c.id} @ ${hhmm(p.when)}`);
      } else { fail++; console.log(`   ✗ ${p.acc.platform}/${p.c.id}:`, (await res.text()).slice(0, 110)); }
    } catch (e) { fail++; console.log(`   ✗ ${p.acc.platform}/${p.c.id} ERR`, e.message); }
  }
  console.log(`\n   batch done — scheduled ${ok}, failed ${fail}. Run \`status\` to see the full day.\n`);
}

function cmdHelp() {
  console.log(`
HANUBEES MEDIA ARMY — commands
  status      today's progress + every scheduled post (target ${VOLUME.dailyTarget}, batches of ${VOLUME.batchSize})
  next [n]    build + SCHEDULE the next batch (default ${VOLUME.batchSize})
  plan [n]    preview the next batch without posting
  subjects    concept / media supply health
  help        this list
`);
}

(async () => {
  const a = process.argv.slice(2).filter((x) => x !== "batch"); // allow "next batch"
  const cmd = (a[0] || "status").toLowerCase();
  const n = Number(a[1]) || VOLUME.batchSize;
  try {
    if (cmd === "status") await cmdStatus();
    else if (cmd === "next" || cmd === "go") await cmdNext(n, true);
    else if (cmd === "plan" || cmd === "preview") await cmdNext(n, false);
    else if (cmd === "subjects" || cmd === "supply") await cmdSubjects();
    else cmdHelp();
  } catch (e) { console.error("error:", e.message); process.exit(1); }
})();
