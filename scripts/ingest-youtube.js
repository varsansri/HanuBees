#!/usr/bin/env node
// YouTube Data API ingester: find business videos -> dedupe by channel ->
// extract phone/website/email/instagram from descriptions -> store as directory accounts
// (+ about/contact data_entries). Autonomous via Supabase Management API.
// Reads GOOGLE_API_KEY, SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF from .env.local.
// TEST=1 -> only LA + 3 categories (small quota) for a dry validation run.
//
// RULES (agreed 2026-06-07):
//  - TOP-OF-NICHE: for each topic, target the leading ~10% of the niche. We run two
//    search intents per (city,category) — "<cat> in <city>" and "best <cat> <city>" —
//    sorted by relevance so the most prominent/established businesses surface first.
//  - FULL RUN = 4 cities. QUOTA GUARD stops searching before the 10k/day cap (QCAP).
//  - LOOK FOR LINKS: extract website AND instagram (plus email/phone) from descriptions.
//  - PUBLIC INFO ONLY, official API, dedupe by channel, idempotent (on conflict do nothing).
const fs = require("fs");

function loadEnv() {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}
loadEnv();
const KEY = process.env.GOOGLE_API_KEY, REF = process.env.SUPABASE_PROJECT_REF, TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const TEST = process.env.TEST === "1";

const CITIES = TEST
  ? [["Los Angeles", "US", "en"]]
  : [["Los Angeles", "US", "en"], ["Melbourne", "AU", "en"], ["Coimbatore", "IN", "en"], ["Chennai", "IN", "en"]];

const CATEGORIES = TEST
  ? ["restaurant", "gym", "dentist"]
  : ["restaurant", "cafe", "gym", "salon", "dentist", "clinic", "photographer", "real estate", "tuition coaching", "boutique", "interior designer", "bakery"];

// ONLY_CITY=<name> -> run just one city (small/targeted run). DELAY ms between searches.
const REGION = { "Los Angeles": ["US", "en"], "Melbourne": ["AU", "en"], "Coimbatore": ["IN", "en"], "Chennai": ["IN", "en"], "Sydney": ["AU", "en"], "Brisbane": ["AU", "en"], "Perth": ["AU", "en"], "San Francisco": ["US", "en"], "New York": ["US", "en"], "Chicago": ["US", "en"] };
if (process.env.ONLY_CITY) { const c = process.env.ONLY_CITY, rl = REGION[c] || ["US", "en"]; CITIES.length = 0; CITIES.push([c, rl[0], rl[1]]); }
const DELAY = +(process.env.DELAY || 350);

let quota = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30);
const beeify = (s) => (s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "biz");

async function ytSearch(q, regionCode, lang) {
  quota += 100;
  const u = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=50&q=${encodeURIComponent(q)}&regionCode=${regionCode}&relevanceLanguage=${lang}&key=${KEY}`;
  const r = await fetch(u); const d = await r.json();
  if (d.error) { console.error("  search err:", d.error.message.slice(0, 80)); return []; }
  return d.items || [];
}
async function ytVideos(ids) {
  quota += 1;
  const u = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids.join(",")}&key=${KEY}`;
  const r = await fetch(u); const d = await r.json();
  return d.items || [];
}

function extract(text) {
  const website = (text.match(/https?:\/\/(?!(?:www\.)?(?:youtube|youtu\.be|instagram|facebook|fb\.|tiktok|twitter|x\.com))[^\s)]+/i) || [])[0] || null;
  const email = (text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) || [])[0] || null;
  // look for links: instagram handle (from instagram.com/<handle>)
  let instagram = (text.match(/instagram\.com\/([A-Za-z0-9_.]{2,30})/i) || [])[1] || null;
  if (instagram) instagram = instagram.replace(/\/$/, "").toLowerCase();
  let phone = null;
  for (const m of text.matchAll(/\+?\d[\d().\-\s]{7,}\d/g)) {
    const digits = m[0].replace(/\D/g, "");
    if (digits.length >= 8 && digits.length <= 15) { phone = m[0].trim().replace(/\s+/g, " "); break; }
  }
  return { website, email, phone, instagram };
}

async function runSQL(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) console.error("  SQL error:", (await res.text()).slice(0, 160));
  return res.ok;
}

(async () => {
  if (!KEY || !REF || !TOKEN) { console.error("missing keys"); process.exit(1); }
  const seenChannel = new Set();
  const businesses = [];
  const QCAP = 9400; // stay safely under the 10k/day quota

  outer:
  for (const [city, region, lang] of CITIES) {
    for (const cat of CATEGORIES) {
      // two search intents per niche -> surface the leaders (top of niche)
      for (const q of [`${cat} in ${city}`, `best ${cat} ${city}`]) {
        if (quota + 150 > QCAP) { console.log(`\n⚠ quota cap (${QCAP}) reached — stopping search early, storing what we have.`); break outer; }
        const items = await ytSearch(q, region, lang);
        const vids = items.map((i) => i.id?.videoId).filter(Boolean);
        const descById = {};
        for (let i = 0; i < vids.length; i += 50) {
          const got = await ytVideos(vids.slice(i, i + 50));
          for (const v of got) descById[v.id] = v.snippet;
        }
        let kept = 0;
        for (const it of items) {
          const sn = descById[it.id?.videoId] || it.snippet;
          const chId = sn.channelId; if (!chId || seenChannel.has(chId)) continue;
          const desc = sn.description || "";
          const { website, email, phone, instagram } = extract(desc);
          if (!website && !phone) continue;          // quality gate: must be contactable
          seenChannel.add(chId);
          const name = (sn.channelTitle || "").slice(0, 100); if (!name) continue;
          businesses.push({
            chId, name, city, category: cat[0].toUpperCase() + cat.slice(1),
            phone, website, email, instagram, about: desc.replace(/\s+/g, " ").slice(0, 700),
          });
          kept++;
        }
        console.log(`${city} / "${q}": ${items.length} videos -> ${kept} new (quota ${quota})`);
        await sleep(DELAY);
      }
    }
  }

  console.log(`\nTotal unique businesses: ${businesses.length} | quota used: ${quota}`);
  if (!businesses.length) return;

  // 1) accounts
  const accRows = businesses.map((b) => ({
    user_id: `yt-${b.chId}`, name: b.name,
    slug: `${slugify(b.name)}-yt${b.chId.slice(-6)}`,
    bee_name: `${beeify(b.name)}${b.chId.slice(-5)}`,
    category: b.category, city: b.city, phone: b.phone, website: b.website, instagram: b.instagram || null,
  }));
  for (let i = 0; i < accRows.length; i += 150) {
    const json = JSON.stringify(accRows.slice(i, i + 150));
    await runSQL(
      `insert into accounts (user_id,type,name,slug,bee_name,category,city,phone,website,instagram) ` +
      `select user_id,'business',name,slug,bee_name,category,city,phone,website,instagram ` +
      `from jsonb_to_recordset($hbz$${json}$hbz$::jsonb) as x(user_id text,name text,slug text,bee_name text,category text,city text,phone text,website text,instagram text) ` +
      `on conflict (user_id) do nothing;`
    );
  }

  // 2) data_entries (about = RICH, contact = LIVE) joined by user_id
  const deRows = [];
  for (const b of businesses) {
    if (b.about) deRows.push({ user_id: `yt-${b.chId}`, content: b.about, tag: "about", info_type: null, is_live: false });
    if (b.phone) deRows.push({ user_id: `yt-${b.chId}`, content: `Phone: ${b.phone}`, tag: "contact", info_type: "contact", is_live: true });
  }
  for (let i = 0; i < deRows.length; i += 150) {
    const json = JSON.stringify(deRows.slice(i, i + 150));
    await runSQL(
      `insert into data_entries (account_id,content,tag,info_type,visibility,is_live_fact) ` +
      `select a.id, v.content, v.tag, v.info_type, 'public', v.is_live ` +
      `from jsonb_to_recordset($hbz$${json}$hbz$::jsonb) as v(user_id text,content text,tag text,info_type text,is_live bool) ` +
      `join accounts a on a.user_id = v.user_id;`
    );
  }
  console.log("Stored.");
})();
