#!/usr/bin/env node
// Log a just-posted video id into video_log so the scheduler moves to the next one.
const fs = require("fs");
const path = require("path");

(function loadEnv() {
  try {
    for (const l of fs.readFileSync(path.join(__dirname, "../../../.env.local"), "utf8").split("\n")) {
      const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {}
})();

const REF = process.env.SUPABASE_PROJECT_REF, TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

(async () => {
  const idPath = path.join(__dirname, "../out/id.txt");
  if (!fs.existsSync(idPath)) { console.log("no id.txt — nothing to log"); return; }
  const id = fs.readFileSync(idPath, "utf8").trim();
  if (!id || !REF || !TOKEN) { console.log("missing id or keys — skip log"); return; }
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`,
    { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: `insert into video_log(id) values ('${id.replace(/'/g, "")}') on conflict (id) do update set posted_at = now();` }) });
  console.log("logged", id, r.ok ? "✓" : "FAILED " + (await r.text()).slice(0, 120));
})();
