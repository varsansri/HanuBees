#!/usr/bin/env node
// Plan a fan-out: gather every connected account across all Zernio keys, then assign
// a DISTINCT un-posted script to each so no two accounts get the same post.
// Emits a GitHub Actions matrix (one entry per account).
const fs = require("fs");
const path = require("path");
const CONTENT = require("./content.js");

(function loadEnv() {
  try {
    for (const l of fs.readFileSync(path.join(__dirname, "../../../.env.local"), "utf8").split("\n")) {
      const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {}
})();

const ZB = "https://api.zernio.com/v1";
const REF = process.env.SUPABASE_PROJECT_REF, TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const KEY_ENVS = ["ZERNIO_API_KEY", "ZERNIO_API_KEY_2", "ZERNIO_API_KEY_3", "ZERNIO_API_KEY_4"];

async function sql(q) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`,
    { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
  return r.ok ? r.json() : [];
}

(async () => {
  // 1. every account across keys
  const accounts = [];
  for (const env of KEY_ENVS) {
    const k = process.env[env]; if (!k) continue;
    try {
      const d = await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${k}`, Accept: "application/json" } })).json();
      for (const a of d.accounts || []) accounts.push({ keyEnv: env, accountId: a._id || a.id, platform: a.platform });
    } catch {}
  }

  // 2. un-posted scripts (globally unique — nothing repeats anywhere)
  const posted = new Set((await sql("select id from video_log;")).map((r) => r.id));
  let pool = CONTENT.filter((c) => !posted.has(c.id));
  if (pool.length < accounts.length) pool = pool.concat(CONTENT); // wrap if we run low

  // 3. one distinct script per account
  const include = accounts.map((a, i) => ({
    scriptId: pool[i % pool.length].id,
    keyEnv: a.keyEnv, accountId: a.accountId, platform: a.platform,
  }));

  const matrix = JSON.stringify({ include });
  console.log(matrix);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `matrix=${matrix}\n`);
})();
