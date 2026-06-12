#!/usr/bin/env node
require("./_env");
// IMMEDIATE post — one concept per account, published ~now (not appended to today's schedule).
// Usage: node scripts/post-now.js id1 id2 id3 ...   (assigned to ACCOUNTS in order)
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execSync } = require("child_process");
const { ACCOUNTS, TRACKS, SYSTEM_ID } = require("./config");
const { sql } = require("./claim");

const ROOT = path.join(__dirname, "..");
const ZB = "https://api.zernio.com/v1";
const esc = (s) => String(s).replace(/'/g, "''");

function loadConcepts() {
  const src = fs.readFileSync(path.join(__dirname, "daily-batch.js"), "utf8");
  const a = src.indexOf("const CONCEPTS =");
  const code = src.slice(a, src.indexOf("\n];", a) + 3) + "\nmodule.exports=CONCEPTS;";
  const m = { exports: {} }; vm.runInNewContext(code, { module: m, require });
  return m.exports;
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

(async () => {
  const ids = process.argv.slice(2);
  if (!ids.length) { console.log("pass concept ids"); return; }
  const concepts = loadConcepts();
  const byId = Object.fromEntries(concepts.map((c) => [c.id, c]));
  const when = new Date(Date.now() + 60 * 1000); // ~this minute
  let ok = 0, fail = 0; const idc = {};
  for (let i = 0; i < ACCOUNTS.length && i < ids.length; i++) {
    const acc = ACCOUNTS[i];
    const c = byId[ids[i]];
    if (!c) { console.log(`   ✗ ${acc.platform}/${acc.username}: no concept ${ids[i]}`); fail++; continue; }
    const key = process.env[acc.keyEnv];
    const dir = path.join(ROOT, "out/daily", c.id);
    const track = TRACKS[i % TRACKS.length];
    try {
      if (!fs.existsSync(path.join(dir, "s0.png"))) execSync(`node "${path.join(__dirname, "daily-batch.js")}" ${c.id}`, { stdio: "ignore" });
      let mediaItems;
      if (acc.media === "video") {
        execSync(`bash "${path.join(__dirname, "make-reel.sh")}" "${dir}" "${track.file}" "${dir}/reel.mp4" 3.6 27`, { stdio: "pipe" });
        mediaItems = [{ url: await presignPut(key, path.join(dir, "reel.mp4"), "video/mp4", `${c.id}.mp4`), type: "video" }];
      } else {
        const urls = [];
        for (const f of ["s0.png", "s1.png", "s2.png"]) urls.push(await presignPut(key, path.join(dir, f), "image/png", `${c.id}-${f}`));
        mediaItems = urls.map((u) => ({ url: u, type: "image" }));
      }
      const ck = acc.keyEnv + acc.platform;
      if (!(ck in idc)) idc[ck] = await acctId(key, acc.platform);
      const res = await fetch(`${ZB}/posts`, {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: captions(c, acc.media === "video" ? track : null), mediaItems,
          platforms: [{ platform: acc.platform, accountId: idc[ck] }], scheduledFor: when.toISOString(), timezone: "Etc/UTC" }),
      });
      if (res.ok) {
        ok++;
        await sql(`insert into subject_log (subject, system, account, scheduled_for) values ('${esc(c.id)}','${esc(SYSTEM_ID)}','${esc(acc.platform + "/" + acc.username)}','${when.toISOString()}');`);
        console.log(`   ✓ ${acc.platform}/${acc.username} ${c.id} (${acc.media}) NOW`);
      } else { fail++; console.log(`   ✗ ${acc.platform}/${acc.username} ${c.id}:`, (await res.text()).slice(0, 120)); }
    } catch (e) { fail++; console.log(`   ✗ ${acc.platform}/${acc.username} ${c.id} ERR`, e.message); }
  }
  console.log(`\n   immediate batch done — posted ${ok}, failed ${fail}.\n`);
})();
