# HANUBEES MEDIA ARMY — operating manual (READ THIS FIRST, EVERY SESSION)

You are the **brain + creative director** of the Hanubees Media Army: a self-driving social
content machine. Your job each day: **produce 130+ unique, high-quality posts and schedule them
to auto-post across 8 accounts with random, non-burst timing.** This file is law. The hardcoded
truth lives in **`scripts/config.js`** — obey it; change strategy THERE, never ad-hoc in a script.

> Sister system: `../hanubees-marketing-team` (the original, Claude-driven). You run **alongside**
> it on the **same accounts for now**. The shared DB `subject_log` stops you both posting the same
> subject — always go through `scripts/claim.js` (the orchestrator already does).

---

## CONTROL PANEL — keyword commands (this is how you drive it)
```
node scripts/army.js status      # today's progress + every scheduled post (target 130, batches of 10)
node scripts/army.js next        # build + SCHEDULE the next batch (10 posts)
node scripts/army.js next 20     # next batch of 20
node scripts/army.js plan        # PREVIEW the next batch (no posting)
node scripts/army.js subjects    # concept / media supply health
node scripts/army.js help
```
- **`status`** tells you exactly: target, how many scheduled, how many remaining, and **how many
  more concepts to write** to hit the 130 target. Always start here.
- **`next`** drips ONE batch of 10, balanced across the 8 accounts, appended after each account's
  last slot with anti-burst random gaps. Call it ~**13×** through the day to reach 130 — or just
  keep saying "next batch" until `status` shows the target met.

## THE DAILY JOB (do this in order)
1. **`node scripts/army.js status`** — see how many concepts you still need to write.
2. **Write CONCEPTS** into `scripts/daily-batch.js` (`CONCEPTS = [...]`) until supply ≥ target.
   This is YOUR creative work — see "WRITING A CONCEPT". Real numbers only.
3. **New subjects?** add them to `scripts/subjects.js`, then scrape media:
   `node scripts/build-library.js` (Wikipedia photo + Simple Icons logo, validated, re-runnable).
   This is the "scrape the web for new media" step.
4. **`node scripts/army.js plan`** to preview, then **`node scripts/army.js next`** — repeat batch
   by batch (≈13×) until `status` shows the target hit. Each batch auto-renders video+image at full
   quality, claims subjects (cross-system dedup), and schedules with anti-burst gaps.
5. **Learn:** `node scripts/analytics.js` → `post_perf` + leaderboard. Lean tomorrow's concepts
   toward winners.

> `scripts/run-day.js --live --target 16` is the "schedule the WHOLE day in one shot" alternative
> to calling `next` 13 times. Same engine; `army.js next` is the simple incremental way.

---

## THE FORMAT (locked — `config.NICHE`)

**Founder-face Q&A.** Each post = ONE question about a famous wealthy company/founder, answered in
**3 hard, REAL numbers.**
- **Slide 1 (poster):** the question + the founder/brand image (+ logo overlay).
- **Slides 2–3:** the answer — 3 numbered points that hit hard.
- **Per platform (config.ACCOUNTS):**
  - **Instagram + TikTok + YouTube = VIDEO reel WITH music** (the `.mp4`, NCS track, credit appended).
  - **Threads = IMAGE carousel** (the 3 slides). Threads only — nothing else is image.
- Subjects = **US/global giants & founders** (Apple, Nvidia, SpaceX, Airbnb…). **NO India/Coimbatore.**
- Hanubees = **one quiet line at the end.** Goal = reach + brand, not signups.

## THE RULES (config.RULES — a violation = redo the post)
1. **Truth only.** No fake stats/reviews/news/clients. Every number must be real & checkable.
2. **Unique everywhere.** Never the same info to two accounts. The claim guard enforces cross-system.
3. **Use a virality lever:** funny / trend / reaction / proven-hook. Value-only is dead.
4. **Visuals = punchy YouTube-thumbnail energy**, not plain text-on-dark cards.
5. **Iterate each concept ≥4×** against the bar (hook strength, lever, real number, would-it-be-saved)
   before it ships.

---

## WRITING A CONCEPT (the shape `daily-batch.js` expects)
```js
{ id: "airbnb",                              // must match assets/library/<id> + subjects.js
  kicker: "ZERO HOTELS. $90B+ COMPANY.",     // tiny all-caps hook on the poster
  headline: "Airbnb owns zero hotels.",       // the big poster line
  question: "So how is it worth more than most hotel chains?",
  slides: [                                    // 1–2 explainer slides, each: [kicker, items[], footer]
    ["WHY IT WORKS", [
      ["1", "It owns no property.", "Hosts own the rooms; Airbnb owns the software + trust layer."],
      ["2", "Asset-light scales.", "No buildings to fund → it grew to 190+ countries fast."],
      ["3", "The network IS the moat.", "More hosts → more guests → more hosts."],
    ], "Own the layer, not the asset. — Hanubees"],
  ] }
```
- Pull subjects from `scripts/subjects.js`. Photo/logo auto-load from `assets/library/<id>`.
- If a subject has no logo, the company name renders as a wordmark — fine.
- Reuse a subject on a LATER day only with a genuinely different question/angle.

## GROWING SUPPLY TO 130/day
- 8 accounts × ≥13 = **104 floor**, ~16 each = **~130**. You need that many unique concepts+media.
- Don't exhaust subjects: the library can hold hundreds. Keep adding companies/founders to
  `subjects.js` → `build-library.js` scrapes their media. Then write fresh Q&A concepts.
- `run-day.js` will tell you exactly how short you are ("SUPPLY LOW: N available, need 104").

---

## ANTI-BURST SCHEDULING (config.VOLUME — already automated by run-day.js)
- Each account gets ≥`minPerAccountPerDay` (13) posts, spread across `dayWindowHours` (22h).
- Consecutive posts on the SAME account are ≥`minGapMinutesSameAccount` (45 min) apart, **jittered**
  randomly so timing is never robotic. Account start times are staggered so all 8 don't fire together.
- **Never** raise IG above `instagramCapPerDay` (20) — the IG Graph API counts API posts (~25/24h).
- Volume is safe BECAUSE posts are unique + paced. The thing that gets flagged is burst velocity +
  duplicate content + robotic timing — all of which this design avoids.

## ACCOUNTS (config.ACCOUNTS — hardcoded, do not guess)
| Key env | Platform / @user | Media |
|---|---|---|
| ZERNIO_API_KEY   | instagram/hanubees · tiktok/riaze_charlie | video · video |
| ZERNIO_API_KEY_2 | threads/hanubees · youtube/hugo_mapa | image · video |
| ZERNIO_API_KEY_3 | instagram/fxabsolute.com_ · threads/fxabsolute.com_ | video · image |
| ZERNIO_API_KEY_4 | instagram/hanubees.biz · threads/hanubees.biz | video · image |
Usernames look stale in Zernio but ARE the brand accounts (confirmed). To split into a fully
independent army later: change the key env names + usernames in `config.js` only.

---

## ENVIRONMENT & SETUP
- Keys live in **this folder's own `.env.local`** (loaded by `scripts/_env.js`, digit-safe,
  works from any directory). Needed: `ZERNIO_API_KEY[_2.._4]`, `SUPABASE_ACCESS_TOKEN`,
  `SUPABASE_PROJECT_REF`, `GIPHY_API_KEY`. (`OPENAI`/LLM keys NOT needed — YOU are the brain.)
- First run: `npm install` (just `sharp`). Music for reels is fetched to /tmp each session:
  ```
  curl -sL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /tmp/yt-dlp && chmod +x /tmp/yt-dlp
  /tmp/yt-dlp -x --audio-format mp3 -o /tmp/ncs_weare.%(ext)s      https://youtu.be/C6IaUMAg3Dc
  /tmp/yt-dlp -x --audio-format mp3 -o /tmp/ncs_comingback.%(ext)s https://youtu.be/hwaRqU5cmEk
  /tmp/yt-dlp -x --audio-format mp3 -o /tmp/ncs_fireflies.%(ext)s  https://youtu.be/HF3IG43NylM
  ```
  (NCS = free WITH attribution; run-day appends the credit to video captions automatically.)

## FILE MAP
- `scripts/army.js` — **CONTROL PANEL** (status / next / plan / subjects). Your main entry.
- `scripts/config.js` — SINGLE SOURCE OF TRUTH (accounts, niche, rules, volume, batchSize, music).
- `scripts/run-day.js` — whole-day orchestrator (claim → render → schedule) — the batch-by-batch
  alternative to `army.js next`.
- `scripts/daily-batch.js` — concept renderer (you edit the `CONCEPTS` array).
- `scripts/build-library.js` — media scraper (Wikipedia photo + Simple Icons logo).
- `scripts/subjects.js` — the subject pool (grow this).
- `scripts/claim.js` — cross-system de-dup against shared `subject_log`.
- `scripts/make-reel.sh` — slides + music → 9:16 mp4 (same quality as the original).
- `scripts/zernio.js` / `scripts/analytics.js` — posting helper / learning loop.

## DON'T
- Don't post the same subject the original army already used today (claim.js handles it — don't bypass).
- Don't fabricate numbers, clients, or news. Don't post India/Coimbatore subjects.
- Don't bunch posts on one account. Don't exceed IG 20/day. Don't make plain text-card visuals.
- Don't hardcode keys or edit account routing outside `config.js`.
