#!/usr/bin/env node
// Ingest a city+category from OpenStreetMap (free, legal) into Hanubees directory SQL.
// Enriches website-having entries by scraping phone/email/snippet (regex, no LLM).
// Output: a .sql file you run in the Supabase SQL editor (bypasses RLS).
//
// Usage: node scripts/ingest-osm.js "Coimbatore" 11.0168 76.9558 14000 "hospital|clinic|doctors" Healthcare out.sql

const fs = require("fs");

const [, , CITY, LAT, LON, RADIUS, AMENITY, CATEGORY, OUT] = process.argv;
const lat = parseFloat(LAT), lon = parseFloat(LON), radius = parseInt(RADIUS);
const outFile = OUT || "ingest.sql";

const sq = (s) => (s == null ? null : String(s).replace(/'/g, "''").slice(0, 1000));
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 36);
const beeify = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) || "biz";

async function overpass() {
  if (process.env.OSM_FILE) {
    const d = JSON.parse(fs.readFileSync(process.env.OSM_FILE, "utf8"));
    return (d.elements || []).filter((e) => e.tags && e.tags.name);
  }
  const q = `[out:json][timeout:90];(node["amenity"~"${AMENITY}"](around:${radius},${lat},${lon});way["amenity"~"${AMENITY}"](around:${radius},${lat},${lon}););out center tags 1000;`;
  const endpoints = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
  for (const ep of endpoints) {
    for (let i = 0; i < 2; i++) {
      try {
        const res = await fetch(ep, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(q) });
        const txt = await res.text();
        if (txt.trim().startsWith("{")) return (JSON.parse(txt).elements || []).filter((e) => e.tags && e.tags.name);
      } catch {}
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error("Overpass unavailable");
}

async function scrapeSite(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return {};
    const html = (await res.text()).slice(0, 200000);
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const email = (html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) || [])[0];
    const phone = (text.match(/(?:\+?91[-\s]?)?(?:0)?[6-9]\d{9}/) || [])[0];
    const desc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || [])[1];
    const snippet = (desc || text).slice(0, 300).trim();
    return { email, phone, snippet };
  } catch { return {}; }
}

(async () => {
  console.error(`Fetching ${AMENITY} around ${CITY}…`);
  const els = await overpass();
  console.error(`OSM named results: ${els.length}`);

  // Enrich a capped number of sites to keep runtime sane
  const withSite = els.filter((e) => e.tags.website || e.tags["contact:website"]);
  let enriched = 0;
  for (const e of withSite.slice(0, 60)) {
    let url = e.tags.website || e.tags["contact:website"];
    if (!/^https?:\/\//.test(url)) url = "https://" + url;
    e._scr = await scrapeSite(url);
    if (e._scr.phone || e._scr.email) enriched++;
  }
  console.error(`Sites scraped: ${withSite.length ? Math.min(withSite.length, 60) : 0} | enriched w/ phone or email: ${enriched}`);

  const lines = [];
  lines.push(`-- Hanubees directory ingest: ${AMENITY} in ${CITY} (source: OpenStreetMap)`);
  lines.push(`-- Run in Supabase SQL editor. Safe to re-run (on conflict do nothing).`);

  const seenBee = new Set(), seenSlug = new Set();
  let count = 0, withPhone = 0;
  for (const e of els) {
    const t = e.tags;
    const id = (e.type[0] + e.id).slice(-8);
    let slug = slugify(t.name) || "biz"; if (seenSlug.has(slug)) slug = `${slug}-${id}`; seenSlug.add(slug);
    let bee = beeify(t.name); let b = bee, n = 1; while (seenBee.has(b)) b = `${bee}${n++}`; seenBee.add(b);
    const phone = t.phone || t["contact:phone"] || (e._scr && e._scr.phone) || null;
    const website = t.website || t["contact:website"] || null;
    const area = t["addr:suburb"] || t["addr:city"] || null;
    const cat = t.amenity === "clinic" ? `${CATEGORY} - Clinic` : t.amenity === "doctors" ? `${CATEGORY} - Doctor` : CATEGORY;
    if (phone) withPhone++;

    lines.push(
      `insert into accounts (user_id,type,name,slug,bee_name,category,city,location,phone,website) values ` +
      `('osm-${id}','business','${sq(t.name)}','${slug}','${b}','${sq(cat)}','${sq(CITY)}',` +
      `${area ? `'${sq(area)}'` : "null"},${phone ? `'${sq(phone)}'` : "null"},${website ? `'${sq(website)}'` : "null"}) on conflict (slug) do nothing;`
    );
    if (phone) {
      lines.push(`insert into data_entries (account_id,content,tag,info_type,visibility,is_live_fact) select id,'Phone: ${sq(phone)}','contact','contact','public',true from accounts where slug='${slug}';`);
    }
    const snip = e._scr && e._scr.snippet;
    if (snip) {
      lines.push(`insert into data_entries (account_id,content,tag,visibility,is_live_fact) select id,'${sq(snip)}','about','public',false from accounts where slug='${slug}';`);
    }
    count++;
  }
  lines.push(`select 'ingested ${count} ${CITY} entries' as status;`);
  fs.writeFileSync(outFile, lines.join("\n"));
  console.error(`\nWrote ${count} businesses (${withPhone} with phone) -> ${outFile}`);
})();
