#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const ZB = "https://api.zernio.com/v1";

(function loadEnv() {
  try {
    for (const l of fs.readFileSync(path.join(__dirname, "../../.env.local"), "utf8").split("\n")) {
      const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {}
})();

(async () => {
  const keys = [
    { env: "ZERNIO_API_KEY", label: "K1" },
    { env: "ZERNIO_API_KEY_2", label: "K2" },
    { env: "ZERNIO_API_KEY_3", label: "K3" },
    { env: "ZERNIO_API_KEY_4", label: "K4" },
  ];
  for (const { env, label } of keys) {
    const key = process.env[env];
    if (!key) { console.log(label + ": no key"); continue; }
    try {
      const r = await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } });
      const d = await r.json();
      const ig = (d.accounts || []).filter(a => a.platform === "instagram");
      for (const a of ig) {
        console.log(`${label} → IG: @${a.username || a._id}`);
        // Try to get recent posts
        try {
          const pr = await fetch(`${ZB}/posts?accountId=${a._id}&limit=10`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } });
          const pd = await pr.json();
          if (pd.posts) console.log(`  Posts: ${pd.posts.length} total`);
          else console.log(`  Posts response:`, JSON.stringify(pd).slice(0, 200));
        } catch(e) { console.log(`  Can't fetch posts:`, e.message.slice(0, 60)); }
      }
    } catch(e) { console.log(label + ":", e.message.slice(0, 80)); }
  }
})();
