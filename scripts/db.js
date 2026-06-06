#!/usr/bin/env node
// Run arbitrary SQL on Supabase via the Management API (admin: DDL + data).
// Reads SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF from .env.local.
// Usage:
//   node scripts/db.js "select count(*) from accounts;"
//   node scripts/db.js path/to/file.sql
const fs = require("fs");

function loadEnv() {
  try {
    for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  } catch {}
}
loadEnv();

const ref = process.env.SUPABASE_PROJECT_REF;
const token = process.env.SUPABASE_ACCESS_TOKEN;

(async () => {
  if (!ref || !token) { console.error("Missing SUPABASE_PROJECT_REF / SUPABASE_ACCESS_TOKEN"); process.exit(1); }
  const arg = process.argv.slice(2).join(" ").trim();
  const sql = arg.endsWith(".sql") ? fs.readFileSync(arg, "utf8") : arg;
  if (!sql) { console.error("Provide SQL or a .sql file path"); process.exit(1); }

  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  console.log("HTTP", res.status);
  try { console.log(JSON.stringify(JSON.parse(text), null, 2).slice(0, 4000)); }
  catch { console.log(text.slice(0, 2000)); }
  process.exit(res.ok ? 0 : 1);
})();
