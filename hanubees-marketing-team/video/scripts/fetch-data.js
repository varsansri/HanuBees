#!/usr/bin/env node
// Build out/props.json for the Remotion render from LIVE DB numbers (never fabricated).
// Picks a city: env CITY="Coimbatore", or "auto" = next un-featured city (>=40 businesses).
// Needs SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF (GitHub secrets / .env.local).
const fs = require("fs");

(function loadEnv() {
  try {
    for (const l of fs.readFileSync(__dirname + "/../../../.env.local", "utf8").split("\n")) {
      const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {}
})();

const REF = process.env.SUPABASE_PROJECT_REF, TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

async function sql(query) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!r.ok) throw new Error("SQL " + r.status + " " + (await r.text()).slice(0, 200));
  return r.json();
}
const esc = (s) => String(s).replace(/'/g, "''");

(async () => {
  if (!REF || !TOKEN) { console.error("Missing SUPABASE_PROJECT_REF / SUPABASE_ACCESS_TOKEN"); process.exit(1); }
  const want = (process.env.CITY || "Coimbatore").trim();

  let row;
  if (want.toLowerCase() === "auto") {
    const rows = await sql(`
      select coalesce(a.city,'?') city, count(*) total,
        count(*) filter (where a.phone is null) no_phone,
        count(*) filter (where a.website is null) no_site,
        count(*) filter (where a.phone is not null) reachable
      from accounts a
      where a.type='business' and a.city is not null
      group by 1 having count(*) >= 40
      order by count(*) desc limit 1;`);
    row = rows[0];
  } else {
    const rows = await sql(`
      select '${esc(want)}' city, count(*) total,
        count(*) filter (where phone is null) no_phone,
        count(*) filter (where website is null) no_site,
        count(*) filter (where phone is not null) reachable
      from accounts where type='business' and city ilike '%${esc(want)}%';`);
    row = rows[0];
  }
  if (!row || +row.total < 1) { console.error("No data for city:", want); process.exit(1); }

  const total = +row.total, noPhone = +row.no_phone, noSite = +row.no_site, reachable = +row.reachable;

  // Rotate the royalty-free music bed (CC-BY by Kevin MacLeod, incompetech.com).
  const TRACKS = { drive: "Hitman", tense: "The Complex", uplift: "Inspired" };
  const keys = Object.keys(TRACKS);
  const music = (process.env.MUSIC && keys.includes(process.env.MUSIC))
    ? process.env.MUSIC
    : keys[Math.abs([...row.city].reduce((a, c) => a + c.charCodeAt(0), 0)) % keys.length];
  const credit = `\n\n🎵 "${TRACKS[music]}" by Kevin MacLeod (incompetech.com) — CC BY 4.0`;

  const props = {
    city: row.city, total, noPhone, noSite, reachable,
    pct: Math.round((noPhone / total) * 100),
    music,
    caption_ig: `We mapped ${total} ${row.city} businesses — ${noPhone} have no phone you can find online, ${noSite} have no website at all. Customers lost every day.\n\nHanubees gives every business a free AI that answers instantly. Free → hanubees.com\n#${row.city.replace(/\s+/g, "")} #smallbusiness #AI #Hanubees${credit}`,
    caption_tt: `${total} ${row.city} businesses, ${noPhone} unreachable online. Hanubees fixes it free.`.slice(0, 90),
  };

  fs.mkdirSync(__dirname + "/../out", { recursive: true });
  fs.writeFileSync(__dirname + "/../out/props.json", JSON.stringify(props, null, 2));
  console.log("Wrote out/props.json for", row.city, "→", JSON.stringify(props).slice(0, 160));
})();
