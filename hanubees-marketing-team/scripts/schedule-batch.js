#!/usr/bin/env node
// Schedule the founder-face Q&A batches (Batch2 + Batch4 = 16 subjects) across the 8 brand
// accounts, each account getting UNIQUE subjects, dripped with random gaps. DRY by default;
// pass --live to actually schedule via Zernio.
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const ZB = "https://api.zernio.com/v1";
const LIVE = process.argv.includes("--live");

// env (digit-safe)
for (const l of fs.readFileSync(path.join(ROOT, "../.env.local"), "utf8").split("\n")) {
  const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
}

// pull CONCEPTS out of daily-batch.js
const src = fs.readFileSync(path.join(__dirname, "daily-batch.js"), "utf8");
const a = src.indexOf("const CONCEPTS =");
const code = src.slice(a, src.indexOf("\n];", a) + 3) + "\nmodule.exports=CONCEPTS;";
const mod = { exports: {} }; vm.runInNewContext(code, { module: mod });
const CONCEPTS = mod.exports;

const SUBJECTS = ["whatsapp","shopify","spacex","dyson","lego","patagonia",            // Batch2
  "airbnb","dropbox","reddit","dell","walmart","blackrock","zoom","x","jpmorgan","bridgewater"]; // Batch4

const TRACKS = [
  { file: "/tmp/ncs_weare.mp3",      credit: 'Music: "We Are" — Jo Cohen & Sex Whales [NCS]' },
  { file: "/tmp/ncs_comingback.mp3", credit: 'Music: "Coming Back" — The Uncommon & Kaphy [NCS]' },
  { file: "/tmp/ncs_fireflies.mp3",  credit: 'Music: "Fireflies" — KREZUS [NCS]' },
];

// 8 account slots (filled with real accountIds at runtime)
const SLOTS = [
  { keyEnv: "ZERNIO_API_KEY",   platform: "instagram", media: "video" },
  { keyEnv: "ZERNIO_API_KEY",   platform: "tiktok",    media: "image" },
  { keyEnv: "ZERNIO_API_KEY_2", platform: "threads",   media: "image" },
  { keyEnv: "ZERNIO_API_KEY_2", platform: "youtube",   media: "video" },
  { keyEnv: "ZERNIO_API_KEY_3", platform: "instagram", media: "video" },
  { keyEnv: "ZERNIO_API_KEY_3", platform: "threads",   media: "image" },
  { keyEnv: "ZERNIO_API_KEY_4", platform: "instagram", media: "video" },
  { keyEnv: "ZERNIO_API_KEY_4", platform: "threads",   media: "image" },
];

const rnd = (n) => Math.floor(Math.random() * n);
const tagOf = (id) => `#${id} #startup #business #founders #entrepreneur`;

function captions(c, track) {
  const ins = c.slides?.[0]?.[1]?.[0]; // [n, head, body]
  const insight = ins ? `${ins[1]} ${ins[2]}` : "";
  const ig = [
    c.headline.trim(),
    c.question.trim(),
    insight,
    "The bee keeps a business's whole story answerable in one chat — hanubees.com",
    tagOf(c.id),
    track ? track.credit : "",
  ].filter(Boolean).join("\n\n");
  // TikTok ≤90 chars
  let tt = c.headline.trim();
  if (tt.length > 88) tt = tt.slice(0, 85) + "…";
  return { ig, tt };
}

async function zget(key, p) {
  const r = await fetch(`${ZB}${p}`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } });
  return r.json();
}
async function presignPut(key, file, contentType, name) {
  const pre = await (await fetch(`${ZB}/media/presign`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ filename: name, contentType }),
  })).json();
  await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body: fs.readFileSync(file) });
  return pre.publicUrl;
}

(async () => {
  // resolve accountIds per slot
  const accCache = {};
  for (const s of SLOTS) {
    const key = process.env[s.keyEnv];
    if (!accCache[s.keyEnv]) accCache[s.keyEnv] = (await zget(key, "/accounts")).accounts || [];
    const acc = accCache[s.keyEnv].find((x) => x.platform === s.platform);
    s.accountId = acc && acc._id; s.username = acc && (acc.username || acc.name);
  }

  // ensure all 16 reels exist with the KNOWN music map (re-render for correct credit)
  for (let i = 0; i < SUBJECTS.length; i++) {
    const id = SUBJECTS[i], track = TRACKS[i % 3];
    const dir = path.join(ROOT, "out/daily", id);
    execSync(`bash ${path.join(__dirname, "make-reel.sh")} "${dir}" "${track.file}" "${dir}/reel.mp4" 3.6 27`, { stdio: "ignore" });
  }

  // build the plan: subject i -> slot (i % 8); two waves
  const plan = SUBJECTS.map((id, i) => {
    const slot = SLOTS[i % 8];
    const wave = Math.floor(i / 8); // 0 or 1
    const track = TRACKS[i % 3];
    const c = CONCEPTS.find((x) => x.id === id);
    const cap = captions(c, slot.media === "video" ? track : null);
    // timing: wave A 25..~135min, wave B 205..~340min, jittered, same-account waves ~3h apart
    const off = wave === 0 ? 25 + (i % 8) * 12 + rnd(11) : 205 + (i % 8) * 14 + rnd(15);
    const when = new Date(Date.now() + off * 60000);
    return { id, slot, media: slot.media, off, when, cap, headline: c.headline.trim() };
  });

  console.log(LIVE ? "=== LIVE SCHEDULING ===" : "=== DRY RUN (no posts) — pass --live to schedule ===");
  for (const p of plan) {
    console.log(`\n[${p.when.toISOString().slice(11,16)}Z +${p.off}m] ${p.slot.platform}/${p.slot.username} (${p.media}) — ${p.id}`);
    console.log("  IG/TEXT:", p.cap.ig.replace(/\n+/g, " / ").slice(0, 160));
    if (p.slot.platform === "tiktok") console.log("  TT:", p.cap.tt);
  }

  if (!LIVE) { console.log(`\n${plan.length} posts planned. Re-run with --live to schedule.`); return; }

  let ok = 0, fail = 0;
  for (const p of plan) {
    const key = process.env[p.slot.keyEnv];
    const dir = path.join(ROOT, "out/daily", p.id);
    try {
      let mediaItems;
      if (p.media === "video") {
        const u = await presignPut(key, path.join(dir, "reel.mp4"), "video/mp4", `${p.id}.mp4`);
        mediaItems = [{ url: u, type: "video" }];
      } else {
        const urls = [];
        for (const f of ["s0.png","s1.png","s2.png"]) urls.push(await presignPut(key, path.join(dir, f), "image/png", `${p.id}-${f}`));
        mediaItems = urls.map((u) => ({ url: u, type: "image" }));
      }
      const content = p.slot.platform === "tiktok" ? p.cap.tt : p.cap.ig;
      const res = await fetch(`${ZB}/posts`, {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content, mediaItems, platforms: [{ platform: p.slot.platform, accountId: p.slot.accountId }],
          scheduledFor: p.when.toISOString(), timezone: "Etc/UTC" }),
      });
      if (res.ok) { ok++; console.log(`✓ ${p.slot.platform}/${p.id} @ ${p.when.toISOString().slice(11,16)}Z`); }
      else { fail++; console.log(`✗ ${p.slot.platform}/${p.id}:`, (await res.text()).slice(0, 160)); }
    } catch (e) { fail++; console.log(`✗ ${p.slot.platform}/${p.id} ERR`, e.message); }
  }
  console.log(`\nDONE — scheduled ${ok}, failed ${fail}.`);
})();
