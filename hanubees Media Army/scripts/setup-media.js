#!/usr/bin/env node
// Setup media: for every concept in daily-batch.js, ensure assets/library/<id>/photo.jpg exists
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");

// Load concepts
const src = fs.readFileSync(path.join(__dirname, "daily-batch.js"), "utf8");
const a = src.indexOf("const CONCEPTS =");
const code = src.slice(a, src.indexOf("\n];", a) + 3) + "\nmodule.exports=CONCEPTS;";
const m = { exports: {} };
vm.runInNewContext(code, { module: m, require });
const concepts = m.exports;

let created = 0, skipped = 0, missingFace = 0;

for (const c of concepts) {
  const libDir = path.join(ROOT, "assets/library", c.id);
  const photoPath = path.join(libDir, "photo.jpg");

  if (fs.existsSync(photoPath)) {
    skipped++;
    continue;
  }

  // Find a face source
  let faceSrc = c.face;
  if (!faceSrc) {
    // Try to find from company name
    const companyLower = (c.company || "").toLowerCase();
    const founderMap = {
      "apple": "/tmp/founders/jobs0.jpg",
      "microsoft": "/tmp/founders/gates0.jpg",
      "amazon": "/tmp/founders/bezos0.jpg",
      "google": "/tmp/founders/page0.jpg",
      "nvidia": "/tmp/founders/huang0.jpg",
      "meta": "/tmp/founders/zuck0.jpg",
      "tesla": "/tmp/founders/musk0.jpg",
      "spacex": "/tmp/founders/musk0.jpg",
      "netflix": "/tmp/founders/bezos0.jpg", // fallback
      "starbucks": "/tmp/founders/bezos1.jpg",
      "uber": "/tmp/founders/bezos20.jpg",
      "spotify": "/tmp/founders/page1.jpg",
      "shopify": "/tmp/founders/gates1.jpg",
      "airbnb": "/tmp/founders/page2.jpg",
      "stripe": "/tmp/founders/zuck1.jpg",
    };
    faceSrc = founderMap[companyLower];
  }

  if (!faceSrc || !fs.existsSync(faceSrc)) {
    console.log(`  ✗ ${c.id}: no face found`);
    missingFace++;
    continue;
  }

  fs.mkdirSync(libDir, { recursive: true });
  fs.copyFileSync(faceSrc, photoPath);
  created++;
  console.log(`  ✓ ${c.id} ← ${path.basename(faceSrc)}`);
}

console.log(`\nDone: ${created} created, ${skipped} existing, ${missingFace} missing face`);
