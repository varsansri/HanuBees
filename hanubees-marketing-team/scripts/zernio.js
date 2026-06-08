// Shared Zernio poster for image carousels. Posts across BOTH keys:
// ZERNIO_API_KEY (Instagram + TikTok) and ZERNIO_API_KEY_2 (Threads + YouTube).
// Images skip YouTube (video-only). TikTok gets the short caption, others the IG one.
const fs = require("fs");
const path = require("path");
const ZB = "https://api.zernio.com/v1";

// Digit-safe env load (the callers' loaders use [A-Z_]+ which misses ZERNIO_API_KEY_2).
(function loadEnv() {
  try {
    for (const l of fs.readFileSync(path.join(__dirname, "../../.env.local"), "utf8").split("\n")) {
      const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {}
})();

async function uploadImg(key, buf) {
  const pre = await (await fetch(`${ZB}/media/presign`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ filename: "s.png", contentType: "image/png" }),
  })).json();
  await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": "image/png" }, body: buf });
  return pre.publicUrl;
}

async function postImages(buffers, capIg, capTt) {
  const keys = [process.env.ZERNIO_API_KEY, process.env.ZERNIO_API_KEY_2, process.env.ZERNIO_API_KEY_3, process.env.ZERNIO_API_KEY_4].filter(Boolean);
  const ok = [];
  for (const key of keys) {
    let accs = [];
    try { accs = (await (await fetch(`${ZB}/accounts`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json" } })).json()).accounts || []; }
    catch { accs = []; }
    const targets = accs.filter((a) => a.platform !== "youtube"); // images can't post to YouTube
    if (!targets.length) continue;
    const urls = [];
    for (const b of buffers) urls.push(await uploadImg(key, b));
    const media = urls.map((u) => ({ url: u, type: "image" }));
    for (const a of targets) {
      const cap = a.platform === "tiktok" ? capTt : capIg;
      const res = await fetch(`${ZB}/posts`, {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: cap, mediaItems: media, platforms: [{ platform: a.platform, accountId: a._id }], publishNow: true }),
      });
      if (res.ok) { ok.push(a.platform); console.log(a.platform, "PUBLISHED ✓"); }
      else console.log(a.platform, "FAILED:", (await res.text()).slice(0, 150));
    }
  }
  return ok;
}

module.exports = { postImages };
