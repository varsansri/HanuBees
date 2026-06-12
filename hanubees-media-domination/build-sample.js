"use strict";
// Demo: build the NVIDIA post object (content + media only) and render it through
// the locked config-driven pipeline. Proves design is reproduced from config.
const path = require("path");
const { renderPost } = require("./lib/render.js");
const { checkPost } = require("./lib/quality.js");
const P = path.join(__dirname, "assets/prepared");
const logo = path.join(P, "logo_badge.png");

const post = {
  id: "nvidia-difference-2026",
  outDir: path.join(__dirname, "out/template-tipo"),
  slides: [
    { role: "hook",   topic: "NVIDIA", kicker: "TOP 10 · BIGGEST COMPANIES", code: "2026 / DIFFERENCE / 01",
      tag: "TOP 10 TECH · 2026", headline: "Here's the difference between NVIDIA, AMD & Intel.",
      person: path.join(P, "person_s1.png"), logo },
    { role: "number", topic: "$3.4T", kicker: "MARKET VALUE", code: "2026 / DIFFERENCE / 02",
      tag: "THE GAP", headline: "NVIDIA passed $3T — worth more than AMD + Intel combined.",
      person: path.join(P, "person_s2.png"), logo },
    { role: "answer", topic: "CUDA", kicker: "WHY IT WINS", code: "2026 / DIFFERENCE / 03",
      tag: "THE REAL DIFFERENCE", headline: "It's not the chip — it's CUDA. NVIDIA owns the AI software stack.",
      person: path.join(P, "person_s3.png"), logo },
    { role: "agency" },
  ],
};

(async () => {
  const d = await renderPost(post);
  console.log("rendered ->", d);
  const q = await checkPost(post);
  console.log("\nQUALITY CHECK:", q.pass ? "PASS ✅" : "FAIL ❌", "(design:", q.designPass ? "ok" : "BAD", ")");
  for (const c of q.checks) console.log(` ${c.pass ? "✓" : "✗"} ${c.name} — ${c.detail}`);
})().catch((e) => { console.error(e); process.exit(1); });
