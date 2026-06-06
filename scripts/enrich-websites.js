#!/usr/bin/env node
// Website-follow enrichment: for businesses with a website, fetch their own site
// and pull about/phone/email/hours -> store. Autonomous via Supabase Management API.
// Their own public homepage = legal to fetch. Resumable via accounts.enriched_at.
const fs = require("fs");

function loadEnv() {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}
loadEnv();
const REF = process.env.SUPABASE_PROJECT_REF, TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const BATCH = parseInt(process.env.BATCH || "400");

async function runSQL(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) { console.error("SQL err:", (await res.text()).slice(0, 160)); return null; }
  return res.json();
}

function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }

function extract(html) {
  const og = (html.match(/<meta[^>]+(?:property|name)=["'](?:og:description|description|twitter:description)["'][^>]+content=["']([^"']{20,400})["']/i) || [])[1];
  const title = clean((html.match(/<title[^>]*>([^<]{3,160})<\/title>/i) || [])[1] || "");
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
  const ct = clean(text);
  const about = clean(og) || (title ? `${title}. ${ct.slice(0, 400)}` : ct.slice(0, 500));
  const email = (ct.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) || [])[0] || null;
  let phone = null;
  for (const m of ct.matchAll(/\+?\d[\d().\-\s]{7,}\d/g)) {
    const d = m[0].replace(/\D/g, ""); if (d.length >= 8 && d.length <= 15) { phone = clean(m[0]); break; }
  }
  // best-effort hours: a chunk mentioning a weekday + a time
  let hours = null;
  const hm = ct.match(/((?:mon|tue|wed|thu|fri|sat|sun)[a-z]*[^.]{0,60}?\d{1,2}\s*(?::\d{2})?\s*(?:am|pm)[^.]{0,40})/i);
  if (hm) hours = clean(hm[1]).slice(0, 120);
  return { about: about.slice(0, 700), email, phone, hours };
}

async function fetchSite(url) {
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; HanubeesBot/1.0)" }, redirect: "follow", signal: AbortSignal.timeout(11000) });
    if (!r.ok) return null;
    const html = (await r.text()).slice(0, 300000);
    return extract(html);
  } catch { return null; }
}

(async () => {
  if (!REF || !TOKEN) { console.error("missing token/ref"); process.exit(1); }
  const got = await runSQL(`select id, user_id, name, website, phone from accounts where website is not null and enriched_at is null limit ${BATCH};`);
  const rows = got || [];
  console.log("to process:", rows.length);

  const phoneUpd = [];      // {id, phone}
  const deRows = [];        // {account_id, content, tag, info_type, is_live}
  const doneIds = [];
  let ok = 0;

  for (let i = 0; i < rows.length; i += 6) {
    const chunk = rows.slice(i, i + 6);
    await Promise.all(chunk.map(async (b) => {
      doneIds.push(b.id);
      const ex = await fetchSite(b.website);
      if (!ex) return;
      ok++;
      if (ex.about) deRows.push({ account_id: b.id, content: ex.about, tag: "about", info_type: null, is_live: false });
      if (ex.hours) deRows.push({ account_id: b.id, content: ex.hours, tag: "hours", info_type: "hours", is_live: true });
      if (ex.email) deRows.push({ account_id: b.id, content: `Email: ${ex.email}`, tag: "contact", info_type: "contact", is_live: true });
      if (!b.phone && ex.phone) { phoneUpd.push({ id: b.id, phone: ex.phone }); deRows.push({ account_id: b.id, content: `Phone: ${ex.phone}`, tag: "contact", info_type: "contact", is_live: true }); }
    }));
    if (i % 60 === 0) console.log(`  ${i + chunk.length}/${rows.length} fetched (${ok} ok)`);
  }

  // mark all processed enriched
  for (let i = 0; i < doneIds.length; i += 200) {
    const ids = doneIds.slice(i, i + 200).map((x) => `'${x}'`).join(",");
    await runSQL(`update accounts set enriched_at=now() where id in (${ids});`);
  }
  // fill missing phones
  if (phoneUpd.length) {
    const json = JSON.stringify(phoneUpd).replace(/'/g, "''");
    await runSQL(`update accounts a set phone=v.phone from jsonb_to_recordset('${json}'::jsonb) as v(id uuid, phone text) where a.id=v.id and a.phone is null;`);
  }
  // insert data_entries
  for (let i = 0; i < deRows.length; i += 200) {
    const json = JSON.stringify(deRows.slice(i, i + 200)).replace(/'/g, "''");
    await runSQL(`insert into data_entries (account_id,content,tag,info_type,visibility,is_live_fact) select account_id,content,tag,info_type,'public',is_live from jsonb_to_recordset('${json}'::jsonb) as v(account_id uuid,content text,tag text,info_type text,is_live bool);`);
  }
  console.log(`\nDone. sites ok: ${ok}/${rows.length} | phones filled: ${phoneUpd.length} | data_entries: ${deRows.length}`);
})();
