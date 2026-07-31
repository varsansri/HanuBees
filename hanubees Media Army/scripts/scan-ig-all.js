require("./_env");
const fs = require("fs");
const path = require("path");

(function loadEnv() {
  try {
    const envPath = path.join(__dirname, "../../.env.local");
    if (fs.existsSync(envPath)) {
      for (const l of fs.readFileSync(envPath, "utf8").split("\n")) {
        const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
      }
    }
  } catch {}
})();

const ZB = "https://api.zernio.com/v1";

const KEY_NAMES = [
  "ZERNIO_API_KEY",
  "ZERNIO_API_KEY_1",
  "ZERNIO_API_KEY_2",
  "ZERNIO_API_KEY_3",
  "ZERNIO_API_KEY_4",
  "ZERNIO_API_KEY_6",
  "ZERNIO_API_KEY_7"
];

async function scanAll() {
  console.log("=== Scanning ALL 7 Zernio API Keys for Instagram Accounts ===");
  for (const keyName of KEY_NAMES) {
    const key = process.env[keyName];
    if (!key) {
      console.log(`${keyName}: (Not set in .env.local)`);
      continue;
    }
    try {
      const res = await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } });
      if (!res.ok) {
        console.log(`${keyName}: HTTP Error ${res.status}`);
        continue;
      }
      const data = await res.json();
      const igs = (data.accounts || []).filter(a => a.platform === "instagram");
      if (igs.length === 0) {
        console.log(`${keyName}: No Instagram accounts connected (Other accounts: ${(data.accounts || []).map(a => `${a.platform}:${a.username || a.name}`).join(", ")})`);
      } else {
        console.log(`${keyName}: Found ${igs.length} Instagram account(s):`);
        for (const ig of igs) {
          console.log(`  - Username: ${ig.username || ig.name}, ID: ${ig._id}`);
        }
      }
    } catch (e) {
      console.log(`${keyName}: Error: ${e.message}`);
    }
  }
}

scanAll();
