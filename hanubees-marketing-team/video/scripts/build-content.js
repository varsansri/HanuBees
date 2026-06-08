#!/usr/bin/env node
// Pick the next un-posted script from content.js and write out/props.json (render
// props + captions) + out/id.txt. VIDEO_ID env forces a specific one. Uses a
// `video_log` table (id, posted_at) so the scheduler never repeats a video.
const fs = require("fs");
const path = require("path");
const CONTENT = require("./content.js");

(function loadEnv() {
  try {
    for (const l of fs.readFileSync(path.join(__dirname, "../../../.env.local"), "utf8").split("\n")) {
      const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {}
})();

const REF = process.env.SUPABASE_PROJECT_REF, TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const MUSIC = { shock: "drive", frustration: "tense", relief: "uplift", curiosity: "drive" };
const TRACKS = { drive: "Hitman", tense: "The Complex", uplift: "Inspired" };

async function sql(q) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`,
    { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
  if (!r.ok) throw new Error("sql " + r.status + " " + (await r.text()).slice(0, 200));
  return r.json();
}

(async () => {
  let pick;
  if (process.env.VIDEO_ID) {
    pick = CONTENT.find((c) => c.id === process.env.VIDEO_ID);
  } else if (REF && TOKEN) {
    const posted = new Set((await sql(`select id from video_log;`)).map((r) => r.id));
    pick = CONTENT.find((c) => !posted.has(c.id)) || CONTENT[0]; // wrap around if all posted
  } else {
    pick = CONTENT[0];
  }
  if (!pick) { console.error("No content to build"); process.exit(1); }

  const music = MUSIC[pick.emotion] || "drive";
  const credit = `\n\n🎵 "${TRACKS[music]}" — Kevin MacLeod (incompetech.com), CC BY 4.0`;
  const hashtags = "#hanubees #localbusiness #smallbusiness #AI #reels #fyp";

  const props = {
    id: pick.id, emotion: pick.emotion, music,
    hook: pick.hook, scenes: pick.scenes, cta: pick.cta,
    caption_ig: `${pick.hook}\n\n${pick.cta} → hanubees.com\n\n${hashtags}${credit}`,
    caption_tt: `${pick.hook} ${pick.cta}`.slice(0, 90),
  };

  fs.mkdirSync(path.join(__dirname, "../out"), { recursive: true });
  fs.writeFileSync(path.join(__dirname, "../out/props.json"), JSON.stringify(props, null, 2));
  fs.writeFileSync(path.join(__dirname, "../out/id.txt"), pick.id);
  console.log("Built", pick.id, `(${pick.emotion}/${music}) →`, pick.hook);
})();
