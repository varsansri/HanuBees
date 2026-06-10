// Hanubees Media Army — robust env loader for video/ scripts (folder-root/.env.local).
const fs = require("fs"), path = require("path");
try {
  for (const l of fs.readFileSync(path.join(__dirname, "..", "..", ".env.local"), "utf8").split("\n")) {
    const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
} catch { /* optional */ }
