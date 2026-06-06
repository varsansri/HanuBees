#!/usr/bin/env node
// Posts the next queued item to OUR OWN brand accounts. No keys yet -> dry-run (prints).
// GUARDRAILS: our own accounts only; real content from the queue; never community spam.
const fs = require("fs");
function loadEnv() { try { for (const l of fs.readFileSync(".env.local", "utf8").split("\n")) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, ""); } } catch {} }
loadEnv();
const REF = process.env.SUPABASE_PROJECT_REF, TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const ZERNIO = process.env.ZERNIO_API_KEY;
const N = parseInt(process.env.POSTS_PER_RUN || "1");

async function runSQL(sql) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ query: sql }),
  });
  if (!r.ok) { console.error("SQL err", (await r.text()).slice(0, 160)); return []; }
  return r.json();
}

async function publish(text, link) {
  const body = link ? `${text}\n${link}` : text;
  if (ZERNIO) {
    // Zernio unified API (adjust to exact spec when the key is added).
    const r = await fetch("https://api.zernio.com/v1/posts", {
      method: "POST", headers: { Authorization: `Bearer ${ZERNIO}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: body }),
    });
    const ok = r.ok; const data = await r.text();
    return { ok, id: ok ? "zernio" : null, info: data.slice(0, 120) };
  }
  // dry-run
  console.log("DRY-RUN would post:\n" + body + "\n");
  return { ok: false, dry: true };
}

(async () => {
  if (!REF || !TOKEN) { console.error("missing supabase keys"); process.exit(1); }
  const rows = await runSQL(`select id, content, link from social_posts where status='queued' order by created_at limit ${N};`);
  if (!rows.length) { console.log("queue empty — run gen-social.js to refill."); return; }
  for (const p of rows) {
    const res = await publish(p.content, p.link);
    if (res.ok) {
      await runSQL(`update social_posts set status='posted', posted_at=now(), external_id='${res.id || ""}' where id='${p.id}';`);
      console.log("posted:", p.content.slice(0, 60));
    } else if (!res.dry) {
      console.error("post failed:", res.info);
    }
  }
})();
