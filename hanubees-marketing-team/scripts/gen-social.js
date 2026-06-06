#!/usr/bin/env node
// The "brain": generate real marketing posts from our live data and queue them.
// Genuine content only (real counts + links), no fakery. Autonomous via Management API.
const fs = require("fs");
function loadEnv() { for (const l of fs.readFileSync(".env.local", "utf8").split("\n")) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, ""); } }
loadEnv();
const REF = process.env.SUPABASE_PROJECT_REF, TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SITE = "https://www.hanubees.com";

async function runSQL(sql) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ query: sql }),
  });
  if (!r.ok) { console.error("SQL err", (await r.text()).slice(0, 160)); return []; }
  return r.json();
}
const esc = (s) => s.replace(/'/g, "''");

const CATS = [
  ["hospitals", "Hospitals", "hospital"], ["eye-hospitals", "Eye hospitals", "eye"],
  ["dental-clinics", "Dental clinics", "dental"], ["pharmacies", "Pharmacies", "pharmacy"],
  ["restaurants", "Restaurants", "restaurant"], ["cafes", "Cafés", "cafe"],
  ["salons", "Salons & beauty", "salon"], ["gyms", "Gyms", "gym"],
  ["clinics", "Clinics", "clinic"], ["doctors", "Doctors", "doctor"],
];

(async () => {
  if (!REF || !TOKEN) { console.error("missing token"); process.exit(1); }
  const totalRows = await runSQL("select count(*) as n from accounts where type='business' and city ilike '%Coimbatore%';");
  const total = totalRows[0]?.n || 0;

  const posts = [];
  // evergreen
  posts.push({ content: `Stop opening 5 tabs to find a local business. Ask one AI for anything in Coimbatore — prices, hours, contacts.`, link: `${SITE}/discover` });
  posts.push({ content: `${total}+ Coimbatore businesses you can now just *ask* anything — no calls, no waiting.`, link: SITE });
  posts.push({ content: `Own a business in Coimbatore? Get a free AI agent that answers your customers 24/7.`, link: `${SITE}/claim` });
  posts.push({ content: `Add a free AI assistant to your website in one line. Your own bot, your data, zero cost.`, link: `${SITE}/claim` });

  // per-category (only if enough real listings)
  for (const [slug, title, term] of CATS) {
    const rows = await runSQL(`select count(*) as n from accounts where type='business' and city ilike '%Coimbatore%' and (category ilike '%${esc(term)}%' or name ilike '%${esc(term)}%');`);
    const n = rows[0]?.n || 0;
    if (n >= 3) {
      posts.push({ content: `Looking for ${title.toLowerCase()} in Coimbatore? ${n} listed — ask any of them instantly.`, link: `${SITE}/coimbatore/${slug}` });
    }
  }

  // enqueue (skip exact duplicates already in the queue/posted)
  let added = 0;
  for (const p of posts) {
    const dup = await runSQL(`select 1 from social_posts where content='${esc(p.content)}' limit 1;`);
    if (dup.length) continue;
    await runSQL(`insert into social_posts (content, link, status) values ('${esc(p.content)}', '${esc(p.link)}', 'queued');`);
    added++;
  }
  const q = await runSQL("select count(*) as n from social_posts where status='queued';");
  console.log(`Generated ${posts.length} posts, added ${added} new. Queue size: ${q[0]?.n}`);
})();
