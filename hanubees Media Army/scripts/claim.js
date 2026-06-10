require("./_env");
// Shared cross-system de-dup. Both "media-army" and "hanubees-marketing-team" write to the
// SAME Supabase `subject_log`. Before scheduling a subject, claim it here so the two armies
// (running alongside on the SAME accounts) never post the same subject twice.
const { SYSTEM_ID } = require("./config");

const REF = process.env.SUPABASE_PROJECT_REF, TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const esc = (s) => String(s).replace(/'/g, "''");

async function sql(q) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: q }),
  });
  if (!r.ok) throw new Error("subject_log sql: " + (await r.text()).slice(0, 160));
  return r.json();
}

// Which of `subjects` were already used (by ANY system) within the last `days`?
async function usedRecently(subjects, days = 10) {
  if (!subjects.length) return new Set();
  const list = subjects.map((s) => `'${esc(s)}'`).join(",");
  const rows = await sql(`select distinct subject from subject_log
     where subject in (${list}) and created_at > now() - interval '${days} days';`);
  return new Set(rows.map((r) => r.subject));
}

// Filter to subjects free across BOTH systems, then claim them. Returns the free list.
async function claimSubjects(subjects, opts = {}) {
  const days = opts.days ?? 10;
  const used = await usedRecently(subjects, days);
  const free = subjects.filter((s) => !used.has(s));
  if (free.length && !opts.dryRun) {
    const vals = free.map((s) => `('${esc(s)}','${esc(SYSTEM_ID)}')`).join(",");
    await sql(`insert into subject_log (subject, system) values ${vals};`);
  }
  if (used.size) console.log(`claim: skipped ${used.size} already-used subjects → ${[...used].join(", ")}`);
  console.log(`claim: ${free.length}/${subjects.length} subjects claimed for ${SYSTEM_ID}`);
  return free;
}

module.exports = { claimSubjects, usedRecently, sql };
