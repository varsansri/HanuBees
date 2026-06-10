#!/usr/bin/env node
require("./_env");
// Post the next queued item to our Instagram as a branded image card (Zernio).
// Flow: generate card (sharp) -> /v1/media/presign -> PUT upload -> POST /v1/posts.
const fs = require("fs");
const sharp = require("sharp");
function loadEnv() { try { for (const l of fs.readFileSync(".env.local", "utf8").split("\n")) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, ""); } } catch {} }
loadEnv();
// Self-configure fonts for SVG text rendering on Termux (Android system fonts).
function setupFonts() {
  if (process.env.FONTCONFIG_FILE || !fs.existsSync("/system/fonts")) return;
  try {
    fs.mkdirSync("/tmp/fonts", { recursive: true }); fs.mkdirSync("/tmp/fontcache", { recursive: true });
    fs.writeFileSync("/tmp/fonts/fonts.conf",
      `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>/system/fonts</dir><cachedir>/tmp/fontcache</cachedir>` +
      `<match target="pattern"><test qual="any" name="family"><string>sans-serif</string></test><edit name="family" mode="assign" binding="same"><string>Roboto</string></edit></match>` +
      `<match target="pattern"><test qual="any" name="family"><string>Arial</string></test><edit name="family" mode="assign" binding="same"><string>Roboto</string></edit></match></fontconfig>`);
    process.env.FONTCONFIG_FILE = "/tmp/fonts/fonts.conf";
  } catch {}
}
setupFonts();
const REF = process.env.SUPABASE_PROJECT_REF, TOKEN = process.env.SUPABASE_ACCESS_TOKEN, K = process.env.ZERNIO_API_KEY;
const ZB = "https://api.zernio.com/v1";

async function sql(q) { const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) }); return r.ok ? r.json() : []; }
const xml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function wrap(t, max) { const w = t.split(/\s+/); const out = []; let c = ""; for (const x of w) { if ((c + " " + x).trim().length > max) { if (c) out.push(c.trim()); c = x; } else c += " " + x; } if (c.trim()) out.push(c.trim()); return out; }

async function makeCard(text) {
  const lines = wrap(text, 24).slice(0, 8);
  const fs0 = 56, lh = 76, startY = 430;
  const tspans = lines.map((l, i) => `<tspan x="90" y="${startY + i * lh}">${xml(l)}</tspan>`).join("");
  const svg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1080" fill="#121212"/>
    <rect x="0" y="0" width="1080" height="12" fill="#ffbe00"/>
    <text font-family="Arial, sans-serif" font-size="${fs0}" font-weight="700" fill="#eaeaea">${tspans}</text>
    <text x="90" y="1000" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="#98aa9d">hanubees.com</text>
  </svg>`;
  const bee = await sharp("public/bee.png").resize(160, 160, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return await sharp(Buffer.from(svg)).composite([{ input: bee, top: 150, left: 90 }]).png().toBuffer();
}

(async () => {
  if (!REF || !TOKEN || !K) { console.error("missing keys"); process.exit(1); }
  const accs = await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${K}`, Accept: "application/json" } })).json();
  const ig = (accs.accounts || []).find((a) => a.platform === "instagram");
  if (!ig) { console.error("no instagram account connected"); return; }

  const rows = await sql("select id, content, link from social_posts where status='queued' order by created_at limit 1;");
  if (!rows.length) { console.log("queue empty"); return; }
  const post = rows[0];

  // 1) card
  const card = await makeCard(post.content);
  fs.writeFileSync("/tmp/card.png", card);
  console.log("card generated:", card.length, "bytes");

  // 2) presign
  const pre = await (await fetch(`${ZB}/media/presign`, { method: "POST", headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" }, body: JSON.stringify({ filename: "card.png", contentType: "image/png" }) })).json();
  if (!pre.uploadUrl || !pre.publicUrl) { console.error("presign failed:", JSON.stringify(pre).slice(0, 200)); return; }

  // 3) upload
  const put = await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": "image/png" }, body: card });
  if (!put.ok) { console.error("upload failed", put.status); return; }
  console.log("uploaded ->", pre.publicUrl);

  // 4) publish
  const caption = `${post.content}\n\n${post.link}\n\n#Coimbatore #localbusiness #Hanubees`;
  const body = { content: caption, mediaItems: [{ url: pre.publicUrl, type: "image" }], platforms: [{ platform: "instagram", accountId: ig._id }], publishNow: true };
  const res = await fetch(`${ZB}/posts`, { method: "POST", headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const out = await res.text();
  if (!res.ok) { console.error("publish failed:", out.slice(0, 300)); return; }
  await sql(`update social_posts set status='posted', posted_at=now() where id='${post.id}';`);
  console.log("PUBLISHED to Instagram:", post.content.slice(0, 60));
})();
