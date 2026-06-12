"use strict";
// Orchestrator: for each post -> ensure media (scrape P4 + prep P5) -> render P6
// -> quality P7. Prints a manifest of which posts PASSED and are ready to post.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { scrapeSubject } = require("./lib/scrape.js");
const { renderPost } = require("./lib/render.js");
const { checkPost } = require("./lib/quality.js");
const C = require("./config.js");
const POSTS = require("./content/posts.js");

const PREP = path.join(C.ROOT, "assets/prepared");

async function ensureMedia(p) {
  const dir = path.join(PREP, p.slug);
  const ready = ["person_s1", "person_s2", "person_s3", "logo_badge"].every((n) => fs.existsSync(path.join(dir, n + ".png")));
  if (ready) return true;
  await scrapeSubject({ slug: p.slug, person: p.person, logoQuery: p.logoQuery });
  try { execFileSync("python3", ["lib/prep.py", p.slug], { cwd: C.ROOT, stdio: "pipe" }); }
  catch (e) { return false; } // prep exits 2 if <3 faces
  return ["person_s1", "person_s2", "person_s3", "logo_badge"].every((n) => fs.existsSync(path.join(dir, n + ".png")));
}

function buildPostObject(p) {
  const dir = path.join(PREP, p.slug);
  const logo = path.join(dir, "logo_badge.png");
  const slides = p.slides.map((s, i) => ({ ...s, person: path.join(dir, `person_s${i + 1}.png`), logo }));
  slides.push({ role: "agency" });
  return { id: p.slug, outDir: path.join(C.ROOT, "out", p.slug), slides, factsVerified: true };
}

(async () => {
  const results = [];
  for (const p of POSTS) {
    process.stdout.write(`\n[${p.slug}] media… `);
    let mediaOk = false;
    try { mediaOk = await ensureMedia(p); } catch (e) { process.stdout.write("scrape-ERR " + e.message + " "); }
    if (!mediaOk) { results.push({ slug: p.slug, ok: false, why: "media (<3 clean faces or no logo)" }); process.stdout.write("FAIL media"); continue; }
    const post = buildPostObject(p);
    await renderPost(post);
    const q = await checkPost(post);
    results.push({ slug: p.slug, ok: q.pass, when: p.when, account: p.account, why: q.pass ? "" : q.checks.filter((c) => !c.pass && !["facts_verified", "uniqueness_claimed"].includes(c.name)).map((c) => c.name).join(",") });
    process.stdout.write(q.pass ? "OK ✓" : "FAIL " + results[results.length - 1].why);
  }
  console.log("\n\n===== MANIFEST =====");
  for (const r of results) console.log(`${r.ok ? "✓" : "✗"} ${r.slug.padEnd(11)} ${r.when || ""}\t${r.account || ""}\t${r.why}`);
  const ready = results.filter((r) => r.ok).length;
  console.log(`\n${ready}/${POSTS.length} ready.`);
  fs.writeFileSync(path.join(C.ROOT, "out/manifest.json"), JSON.stringify(results, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
