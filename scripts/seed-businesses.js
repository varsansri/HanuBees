#!/usr/bin/env node

// Simple script to seed 50 businesses
// Usage: node scripts/seed-businesses.js

const SEED_KEY = "hanubees-seed-secret-key-2024";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const COUNT = process.env.COUNT || 50;

async function seed() {
  console.log(`🐝 Seeding ${COUNT} businesses...`);
  console.log(`📍 Target: ${BASE_URL}`);

  try {
    const response = await fetch(`${BASE_URL}/api/seed-businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-seed-key": SEED_KEY,
      },
      body: JSON.stringify({ count: parseInt(COUNT) }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error:", data.error);
      process.exit(1);
    }

    console.log(`✅ Created ${data.created} businesses!`);
    console.log("\nFirst 5 businesses:");
    data.businesses.slice(0, 5).forEach((b) => {
      console.log(
        `  • ${b.name} (@${b.bee_name}) — https://${BASE_URL.replace(
          "http://",
          ""
        ).replace("https://", "")}/${b.slug}`
      );
    });

    if (data.businesses.length > 5) {
      console.log(`  ... and ${data.businesses.length - 5} more`);
    }

    console.log("\n🎉 Done!");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
