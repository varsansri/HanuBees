#!/usr/bin/env node
// Insert an OSM city+category directly into accounts (no SQL paste needed).
// Requires accounts RLS to be OFF briefly (anon insert). Reads /tmp/osm.json if present.
const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");
const fs = require("fs");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sb = createClient(url, key, { realtime: { transport: ws } });

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 36);
const beeify = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) || "biz";

(async () => {
  const d = JSON.parse(fs.readFileSync(process.env.OSM_FILE || "/tmp/osm.json", "utf8"));
  const els = (d.elements || []).filter((e) => e.tags && e.tags.name);
  const seenS = new Set(), seenB = new Set();
  const rows = [];
  for (const e of els) {
    const t = e.tags, id = (e.type[0] + e.id).slice(-8);
    let slug = slugify(t.name) || "biz"; if (seenS.has(slug)) slug = `${slug}-${id}`; seenS.add(slug);
    let bee = beeify(t.name), b = bee, n = 1; while (seenB.has(b)) b = `${bee}${n++}`; seenB.add(b);
    const cat = t.amenity === "clinic" ? "Healthcare - Clinic" : t.amenity === "doctors" ? "Healthcare - Doctor" : "Healthcare";
    rows.push({
      user_id: `osm-${id}`, type: "business", name: t.name, slug, bee_name: b,
      category: cat, city: "Coimbatore",
      location: t["addr:suburb"] || t["addr:city"] || null,
      phone: t.phone || t["contact:phone"] || null,
      website: t.website || t["contact:website"] || null,
    });
  }
  let ok = 0, err = null;
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { data, error } = await sb.from("accounts").upsert(batch, { onConflict: "slug", ignoreDuplicates: true }).select("id");
    if (error) { err = error.message; break; }
    ok += data?.length || 0;
  }
  if (err) { console.log("ERROR:", err); process.exit(1); }
  const { count } = await sb.from("accounts").select("*", { count: "exact", head: true }).like("user_id", "osm-%");
  console.log(`Inserted/upserted OK. osm-* accounts now in DB: ${count}`);
  process.exit(0);
})();
