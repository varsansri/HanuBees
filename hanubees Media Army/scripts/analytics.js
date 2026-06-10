#!/usr/bin/env node
require("./_env");
// The learning loop: pull per-post/per-platform metrics from Zernio (both keys),
// upsert into post_perf, and print the leaderboard so content generation can bias
// toward what's actually getting eyeballs. Run on a schedule.
const fs = require("fs");
const path = require("path");

(function loadEnv() {
  try {
    for (const l of fs.readFileSync(path.join(__dirname, "../../.env.local"), "utf8").split("\n")) {
      const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {}
})();

const ZB = "https://api.zernio.com/v1";
const REF = process.env.SUPABASE_PROJECT_REF, TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
// pull EVERY connected account across all 4 Zernio keys (must match plan-fanout's KEY_ENVS),
// else the leaderboard is blind to accounts on keys 3-4 and the strategist biases on partial data.
const KEYS = [process.env.ZERNIO_API_KEY, process.env.ZERNIO_API_KEY_2, process.env.ZERNIO_API_KEY_3, process.env.ZERNIO_API_KEY_4].filter(Boolean);
const esc = (s) => String(s == null ? "" : s).replace(/'/g, "''");
const num = (v) => (Number.isFinite(+v) ? +v : 0);

async function sql(q) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`,
    { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
  if (!r.ok) throw new Error("sql " + r.status + " " + (await r.text()).slice(0, 200));
  return r.json();
}

(async () => {
  let rows = [];
  for (const key of KEYS) {
    let data;
    try { data = await (await fetch(`${ZB}/analytics`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } })).json(); }
    catch { continue; }
    for (const p of data.posts || []) {
      for (const pl of p.platforms || []) {
        const a = pl.analytics || {};
        rows.push({
          post_id: pl.platformPostId || p._id + "-" + pl.platform, platform: pl.platform,
          content: (p.content || "").slice(0, 300), media_type: p.mediaType || "",
          account: pl.accountUsername || "",
          impressions: num(a.impressions), reach: num(a.reach), likes: num(a.likes),
          comments: num(a.comments), shares: num(a.shares), saves: num(a.saves),
          views: num(a.views), engagement_rate: num(a.engagementRate),
          published_at: p.publishedAt || null,
        });
      }
    }
  }
  if (rows.length) {
    const values = rows.map((r) =>
      `('${esc(r.post_id)}','${esc(r.platform)}','${esc(r.content)}','${esc(r.media_type)}','${esc(r.account)}',${r.impressions},${r.reach},${r.likes},${r.comments},${r.shares},${r.saves},${r.views},${r.engagement_rate},${r.published_at ? `'${esc(r.published_at)}'` : "null"},now())`).join(",");
    await sql(`insert into post_perf (post_id,platform,content,media_type,account,impressions,reach,likes,comments,shares,saves,views,engagement_rate,published_at,updated_at) values ${values}
      on conflict (post_id,platform) do update set impressions=excluded.impressions,reach=excluded.reach,likes=excluded.likes,comments=excluded.comments,shares=excluded.shares,saves=excluded.saves,views=excluded.views,engagement_rate=excluded.engagement_rate,updated_at=now();`);
  }
  console.log(`synced ${rows.length} post-platform rows`);

  // leaderboard: weighted "eyeballs" score
  const top = await sql(`select platform, left(content,60) as content,
      views, reach, likes, shares, saves,
      (views + reach + likes*5 + shares*12 + saves*8 + comments*6) as score
    from post_perf order by score desc limit 12;`);
  console.log("\n=== TOP performers (by weighted eyeballs) ===");
  for (const r of top) console.log(`[${r.platform}] score ${r.score} · ${r.views}v ${r.reach}reach ${r.likes}♥ ${r.shares}↗ — ${r.content}`);
  const byp = await sql(`select platform, count(*) posts, sum(views) views, sum(reach) reach, sum(likes) likes from post_perf group by platform order by views desc;`);
  console.log("\n=== by platform ===");
  for (const r of byp) console.log(`${r.platform}: ${r.posts} posts · ${r.views} views · ${r.reach} reach · ${r.likes} likes`);
})();
