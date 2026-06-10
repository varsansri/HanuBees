// Hanubees Media Army — robust env loader. Loads THIS folder's own .env.local,
// digit-safe, regardless of current working directory. Required first by every script.
const fs = require("fs"), path = require("path");
try {
  for (const l of fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8").split("\n")) {
    const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
} catch { /* env file optional; falls back to process.env */ }
