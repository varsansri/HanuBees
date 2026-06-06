#!/usr/bin/env node
// Premium carousel generator + IG poster.
// Page 1 = emotion hook + TRUE insight. Page 2 = "the fix" = promote Hanubees.
// Gradient + liquid-glass look via SVG; bee.png on every card.
const fs = require("fs");
const sharp = require("sharp");
function loadEnv() { try { for (const l of fs.readFileSync(".env.local", "utf8").split("\n")) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, ""); } } catch {} }
loadEnv();
function setupFonts() { if (process.env.FONTCONFIG_FILE || !fs.existsSync("/system/fonts")) return; try { fs.mkdirSync("/tmp/fonts", { recursive: true }); fs.mkdirSync("/tmp/fontcache", { recursive: true }); fs.writeFileSync("/tmp/fonts/fonts.conf", `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>/system/fonts</dir><cachedir>/tmp/fontcache</cachedir><match target="pattern"><test qual="any" name="family"><string>sans-serif</string></test><edit name="family" mode="assign" binding="same"><string>Roboto</string></edit></match></fontconfig>`); process.env.FONTCONFIG_FILE = "/tmp/fonts/fonts.conf"; } catch {} }
setupFonts();
const K = process.env.ZERNIO_API_KEY; const ZB = "https://api.zernio.com/v1";
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function wrap(t, max) { const w = t.split(/\s+/), out = []; let c = ""; for (const x of w) { if ((c + " " + x).trim().length > max) { if (c) out.push(c.trim()); c = x; } else c += " " + x; } if (c.trim()) out.push(c.trim()); return out; }

async function makeCard(o) {
  const glow = o.type === "promo" ? "#98aa9d" : "#ffbe00";
  const titleLines = wrap(o.title, 22).slice(0, 6);
  const titleSvg = titleLines.map((l, i) => `<tspan x="100" y="${600 + i * 70}">${xml(l)}</tspan>`).join("");
  let center = "";
  if (o.type === "insight") {
    center = `<text x="100" y="470" font-family="Roboto,sans-serif" font-size="104" font-weight="800" fill="#ffbe00" letter-spacing="-2">${xml(o.emotion)}</text>
              <text font-family="Roboto,sans-serif" font-size="50" font-weight="700" fill="#eaeaea">${titleSvg}</text>`;
  } else {
    center = `<text x="100" y="440" font-family="Roboto,sans-serif" font-size="40" font-weight="800" fill="#98aa9d" letter-spacing="3">THE FIX</text>
              <text font-family="Roboto,sans-serif" font-size="50" font-weight="700" fill="#eaeaea">${titleSvg}</text>
              <rect x="100" y="850" width="540" height="84" rx="42" fill="#ffbe00"/>
              <text x="370" y="904" text-anchor="middle" font-family="Roboto,sans-serif" font-size="38" font-weight="800" fill="#121212">Free → hanubees.com</text>`;
  }
  const svg = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d0f1a"/><stop offset="0.5" stop-color="#15182b"/><stop offset="1" stop-color="#0b0d16"/></linearGradient>
      <radialGradient id="glow" cx="0.8" cy="0.15" r="0.6"><stop offset="0" stop-color="${glow}" stop-opacity="0.33"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1080" height="1080" fill="url(#bg)"/>
    <rect width="1080" height="1080" fill="url(#glow)"/>
    <rect x="60" y="150" width="960" height="800" rx="46" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1.5"/>
    <rect x="61" y="151" width="958" height="3" rx="2" fill="#ffffff" fill-opacity="0.18"/>
    ${center}
    <text x="100" y="912" font-family="Roboto,sans-serif" font-size="30" font-weight="600" fill="#98aa9d">@hanubees · hanubees.com</text>
  </svg>`;
  const bee = await sharp("hanubees-marketing-team/assets/brand/bee.png").resize(150, 150, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp(Buffer.from(svg)).composite([{ input: bee, top: 175, left: 870 }]).png().toBuffer();
}

async function upload(buf) {
  const pre = await (await fetch(`${ZB}/media/presign`, { method: "POST", headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" }, body: JSON.stringify({ filename: "c.png", contentType: "image/png" }) })).json();
  await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": "image/png" }, body: buf });
  return pre.publicUrl;
}

async function postCarousel({ emotion, insight, fix, caption, platform = "instagram", accountId }) {
  const p1 = await makeCard({ type: "insight", emotion, title: insight });
  const p2 = await makeCard({ type: "promo", title: fix });
  const u1 = await upload(p1), u2 = await upload(p2);
  const res = await fetch(`${ZB}/posts`, { method: "POST", headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content: caption, mediaItems: [{ url: u1, type: "image" }, { url: u2, type: "image" }], platforms: [{ platform, accountId }], publishNow: true }) });
  return { ok: res.ok, info: (await res.text()).slice(0, 200) };
}

async function sql(q) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_REF}/database/query`,
    { method: "POST", headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
  return r.ok ? r.json() : [];
}

// Post the next queued carousel to ALL connected accounts (IG + TikTok).
async function postNext() {
  const accs = await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${K}`, Accept: "application/json" } })).json();
  const platforms = (accs.accounts || []).map((a) => ({ platform: a.platform, accountId: a._id }));
  if (!platforms.length) { console.log("no social accounts connected"); return; }
  const rows = await sql("select id, emotion, insight, fix, caption from carousel_queue where status='queued' order by created_at limit 1;");
  if (!rows.length) { console.log("carousel queue empty — generate more."); return; }
  const c = rows[0];
  const u1 = await upload(await makeCard({ type: "insight", emotion: c.emotion, title: c.insight }));
  const u2 = await upload(await makeCard({ type: "promo", title: c.fix }));
  const res = await fetch(`${ZB}/posts`, { method: "POST", headers: { Authorization: `Bearer ${K}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content: c.caption, mediaItems: [{ url: u1, type: "image" }, { url: u2, type: "image" }], platforms, publishNow: true }) });
  const out = await res.text();
  if (res.ok) { await sql(`update carousel_queue set status='posted', posted_at=now() where id='${c.id}';`); console.log("PUBLISHED to", platforms.map((p) => p.platform).join(" + "), "—", c.emotion); }
  else console.error("FAILED:", out.slice(0, 250));
}

if (require.main === module) postNext();
module.exports = { makeCard, postCarousel, postNext };
