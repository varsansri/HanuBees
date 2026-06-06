#!/usr/bin/env node
// Multi-category OSM ingest for a city -> inserts into accounts via Supabase Management API.
// ONE combined Overpass query per city (rate-limit friendly), then map tags -> category.
// Autonomous: reads SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF from .env.local.
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
const REF = process.env.SUPABASE_PROJECT_REF, TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

const AMENITY = "restaurant|cafe|fast_food|hospital|clinic|pharmacy|dentist|doctors|school|college|bank|veterinary";
const SHOP = "hairdresser|beauty|car_repair|supermarket|electronics|clothes|bakery|hardware|mobile_phone";

const AMEN_LABEL = { restaurant:"Restaurant", cafe:"Cafe", fast_food:"Fast Food", hospital:"Hospital", clinic:"Clinic", pharmacy:"Pharmacy", dentist:"Dentist", doctors:"Doctor", school:"School", college:"College", bank:"Bank", veterinary:"Veterinary" };
const SHOP_LABEL = { hairdresser:"Salon", beauty:"Beauty", car_repair:"Car Repair", supermarket:"Supermarket", electronics:"Electronics", clothes:"Clothing", bakery:"Bakery", hardware:"Hardware", mobile_phone:"Mobile Shop" };

const CITIES = [
  ["Los Angeles", 34.0522, -118.2437, 12000],
  ["Melbourne", -37.8136, 144.9631, 11000],
  ["Chennai", 13.0827, 80.2707, 11000],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 36);
const beeify = (s) => (s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "biz");
const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

function labelFor(t) {
  if (t.amenity && AMEN_LABEL[t.amenity]) return AMEN_LABEL[t.amenity];
  if (t.shop && SHOP_LABEL[t.shop]) return SHOP_LABEL[t.shop];
  if (t.leisure === "fitness_centre") return "Gym";
  if (t.tourism === "hotel") return "Hotel";
  if (t.office === "lawyer") return "Lawyer";
  return null;
}

async function overpassQuery(q) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const ep = ENDPOINTS[attempt % ENDPOINTS.length];
    try {
      const res = await fetch(ep, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(q), signal: AbortSignal.timeout(120000) });
      const txt = await res.text();
      if (txt.trim().startsWith("{")) return (JSON.parse(txt).elements || []).filter((e) => e.tags && e.tags.name);
      console.error(`  (busy @ ${ep.split("/")[2]}, retry…)`);
    } catch { console.error(`  (err @ ${ep.split("/")[2]}, retry…)`); }
    await sleep(7000 + attempt * 2000);
  }
  return [];
}

// Split into 3 lighter queries per city to avoid throttling on the big public mirrors.
async function overpassCity(lat, lon, r) {
  const groups = [
    `node["amenity"~"${AMENITY}"](around:${r},${lat},${lon});way["amenity"~"${AMENITY}"](around:${r},${lat},${lon});`,
    `node["shop"~"${SHOP}"](around:${r},${lat},${lon});way["shop"~"${SHOP}"](around:${r},${lat},${lon});`,
    `node["leisure"="fitness_centre"](around:${r},${lat},${lon});node["tourism"="hotel"](around:${r},${lat},${lon});way["tourism"="hotel"](around:${r},${lat},${lon});node["office"="lawyer"](around:${r},${lat},${lon});`,
  ];
  let all = [];
  for (const g of groups) {
    const els = await overpassQuery(`[out:json][timeout:90];(${g});out center tags 1200;`);
    all = all.concat(els);
    await sleep(5000);
  }
  return all;
}

async function runSQL(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) console.error("  SQL error:", (await res.text()).slice(0, 200));
  return res.ok;
}

async function insertRows(rows) {
  for (let i = 0; i < rows.length; i += 150) {
    const batch = rows.slice(i, i + 150);
    const json = JSON.stringify(batch).replace(/'/g, "''");
    const sql = `insert into accounts (user_id,type,name,slug,bee_name,category,city,location,phone,website) ` +
      `select user_id,'business',name,slug,bee_name,category,city,location,phone,website ` +
      `from jsonb_to_recordset('${json}'::jsonb) as x(user_id text,name text,slug text,bee_name text,category text,city text,location text,phone text,website text) ` +
      `on conflict (slug) do nothing;`;
    await runSQL(sql);
  }
}

(async () => {
  if (!REF || !TOKEN) { console.error("missing token/ref"); process.exit(1); }
  const seen = new Set();
  let grand = 0;
  for (const [city, lat, lon, r] of CITIES) {
    const els = await overpassCity(lat, lon, r);
    const byCat = {};
    const rows = [];
    for (const e of els) {
      const t = e.tags; const label = labelFor(t); if (!label) continue;
      const id = (e.type[0] + e.id).slice(-8);
      if (seen.has(id)) continue; seen.add(id);
      rows.push({
        user_id: `osm-${id}`, name: t.name, slug: `${slugify(t.name) || "biz"}-${id}`,
        bee_name: `${beeify(t.name)}${id.slice(-5)}`, category: label, city,
        location: t["addr:suburb"] || t["addr:city"] || null,
        phone: t.phone || t["contact:phone"] || null,
        website: t.website || t["contact:website"] || null,
      });
      byCat[label] = (byCat[label] || 0) + 1;
    }
    console.log(`${city}: ${rows.length} businesses`, JSON.stringify(byCat));
    await insertRows(rows);
    console.log(`==> ${city} inserted`);
    grand += rows.length;
    await sleep(6000);
  }
  console.log(`\nTOTAL ingested: ${grand}`);
})();
