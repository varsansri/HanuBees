# HANUBEES MARKETING TEAM — RUNBOOK (resume here each session)

Self-driving social system. **Claude is the brain.** Founder triggers daily → Claude
creates a batch of unique founder/company posts → schedules them to drip across the day.

## DAILY MODEL (locked)
- Founder triggers → I create the batch → I **schedule** it (Zernio `scheduledFor`).
- **VOLUME: ~100–130/day is the goal and is SAFE if done right.** What gets flagged is NOT the
  daily count — it's **burst velocity** (many posts in seconds), **duplicate content**, and
  **robotic identical timing**. Our posts are all unique → safe. So: **2–4 posts per account per
  "wave," with RANDOM gaps**, several waves/day → **~10–15 posts/account/day**. 8 accounts ×
  ~12–15 ≈ 100–130/day. (Earlier "~8–10/day total" was too conservative — corrected by founder.)
- **HARD CAP to respect:** Instagram's official Graph API (what Zernio uses) allows **~25
  posts / 24h per account** — IG counts API posts directly. Stay ≤~20/IG/day. Threads tolerates
  much more. The gate on volume is **content supply**, so keep the library big.
- **Each piece unique per account.** No fakes, real facts only. 4× quality bar.
- **Niche:** famous companies + founders, **evergreen surprising business facts** (not just
  market caps). US/global giants — **NO India/Coimbatore**.
- **Formats:** IG = **Reel** (video+music) · Threads = **carousel** · TikTok = carousel
  (title ≤90 chars) · YouTube = **Short** (video; no image carousels).

## PIPELINE (everything in `hanubees-marketing-team/`)
1. **`scripts/subjects.js`** — subject pool: `{id, company, founder, wiki, logo, color}`.
2. **`scripts/build-library.js`** — pre-fetches founder photo (Wikipedia pageimages →
   **Wikidata P18 fallback**) + logo (Simple Icons) → `assets/library/<id>/{photo.jpg,logo.png}`
   + `manifest.json`. Throttled 1.6s (Wikipedia rate-limits); re-runnable (skips existing).
   Run: `node hanubees-marketing-team/scripts/build-library.js`
3. **`scripts/daily-batch.js`** — `CONCEPTS` array (hand-written hooks). Auto-pulls photo/logo
   from `assets/library/<id>` by id. Logo missing → wordmark (company name). Render one:
   `node hanubees-marketing-team/scripts/daily-batch.js <id>` → `out/daily/<id>/s0-2.png`.
4. **`scripts/make-reel.sh`** — `bash make-reel.sh <slidesDir> <audio.mp3> <out.mp4> [secs=3.6] [audioStart=27]`
   → 9:16 MP4 (slides on dark bg) + NCS music + fade. Same MP4 = IG Reel AND YT Short.
5. **Posting = Zernio** (`api.zernio.com/v1`, keys in `.env.local`): presign → PUT upload →
   `POST /posts`. Immediate: `publishNow:true`. Scheduled: `scheduledFor:<ISO>` + `timezone`.

## EPHEMERAL — RE-DO EVERY SESSION (`/tmp` is wiped; library in git persists)
```
curl -sL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /tmp/yt-dlp && chmod +x /tmp/yt-dlp
/tmp/yt-dlp -x --audio-format mp3 -o /tmp/ncs_weare.%(ext)s      https://youtu.be/C6IaUMAg3Dc   # "We Are" - Jo Cohen & Sex Whales [NCS]
/tmp/yt-dlp -x --audio-format mp3 -o /tmp/ncs_comingback.%(ext)s https://youtu.be/hwaRqU5cmEk   # "Coming Back" - The Uncommon, Kaphy [NCS]
/tmp/yt-dlp -x --audio-format mp3 -o /tmp/ncs_fireflies.%(ext)s  https://youtu.be/HF3IG43NylM   # "Fireflies" - KREZUS [NCS]
```
NCS tracks are free WITH attribution → append `Music: "<song>" — <artist> [NCS]` to Reel captions.
(4th track — funk hceNBCnOx44 — license unverified; don't use live until checked.)

## ACCOUNTS (8) + ZERNIO KEYS (.env.local)
| Key | Accounts |
|---|---|
| ZERNIO_API_KEY   | instagram/hanubees, tiktok/riaze_charlie |
| ZERNIO_API_KEY_2 | threads/hanubees, youtube/hugo_mapa |
| ZERNIO_API_KEY_3 | instagram/fxabsolute.com_, threads/fxabsolute.com_ |
| ZERNIO_API_KEY_4 | instagram/hanubees.biz, threads/hanubees.biz |
Usernames show STALE in Zernio but they ARE the brand accounts (founder confirmed). Render
locally uses fallback font (Space Grotesk applies in the CI/render farm).

## SCHEDULING PATTERN (how Batch 3 was scheduled)
Array of `{off(min from now), keyEnv, platform, user, type:"video"|"carousel", src, cap}`.
presign+PUT each media → `POST /posts` with `scheduledFor: new Date(Date.now()+off*60000).toISOString(), timezone:"Etc/UTC"`.
**Cadence (corrected):** give each account ~10–15 posts/day in waves of 2–4, with **RANDOM gaps**
(jitter the `off` minutes — e.g. base interval ± a random 10–25 min — so timing isn't robotic).
Never bunch many posts on one account within a few minutes. Threads = heaviest, IG ≤~20/day.

## STATE — 2026-06-09
- **Library:** 46/50 usable.
- **Batches built:** wealthy-8, Batch1(8), Batch2(6), Batch3(10), Batch4(10).
- **POSTED LIVE today:** 16 (wealthy-8 + Batch1).
- **SCHEDULED today:** Batch3 (10) dripping 12:19–23:36 UTC; **Batch2 (6) + Batch4 (10) NOW
  SCHEDULED** (16 posts, 17:44–22:24 UTC, via `scripts/schedule-batch.js --live`) — each of the
  8 brand accounts got 2 UNIQUE subjects (IG/YT=video reel, TikTok/Threads=image carousel),
  random gaps, NCS credit on videos. Reels for all 16 rendered to `out/daily/<id>/reel.mp4`.
- **`scripts/schedule-batch.js`** = the reusable scheduler (extracts CONCEPTS from daily-batch.js,
  re-renders reels with a known music map, assigns subject→account-slot uniquely, schedules with
  jitter). Dry-run by default; `--live` to schedule. Use this for future batches.
- **Subjects USED (don't repeat):** nvidia, apple, meta, amazon, microsoft, google, tesla,
  berkshire, netflix, starbucks, nike, uber, spotify, ikea, oracle, disney, whatsapp, shopify,
  spacex, dyson, lego, patagonia, openai, stripe, snap, linkedin, salesforce, pinterest, ford,
  alibaba, lvmh, tonyhsieh, airbnb, dropbox, reddit, dell, walmart, blackrock, zoom, x, jpmorgan,
  bridgewater (= 42).
- **Subjects LEFT in library:** mcdonalds, virgin, harley, softbank, palantir (≈5) → RESTOCK.

## NEXT (tomorrow)
1. **Restock** `subjects.js` (+20–30 new companies/founders) → re-run `build-library.js`
   (≈5 subjects left: mcdonalds, virgin, harley, softbank, palantir).
2. **Build the next batch** (fresh CONCEPTS in daily-batch.js for the new subjects) →
   render → `node scripts/schedule-batch.js --live` to drip them.
3. Continue daily batches on trigger. (Batch2 + Batch4 already scheduled 2026-06-09.)
