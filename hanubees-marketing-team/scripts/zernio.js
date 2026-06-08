// Shared Zernio poster for image carousels. Posts across BOTH keys:
// ZERNIO_API_KEY (Instagram + TikTok) and ZERNIO_API_KEY_2 (Threads + YouTube).
// Images skip YouTube (video-only). TikTok gets the short caption, others the IG one.
const ZB = "https://api.zernio.com/v1";

async function uploadImg(key, buf) {
  const pre = await (await fetch(`${ZB}/media/presign`, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ filename: "s.png", contentType: "image/png" }),
  })).json();
  await fetch(pre.uploadUrl, { method: "PUT", headers: { "Content-Type": "image/png" }, body: buf });
  return pre.publicUrl;
}

async function postImages(buffers, capIg, capTt) {
  const keys = [process.env.ZERNIO_API_KEY, process.env.ZERNIO_API_KEY_2].filter(Boolean);
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
