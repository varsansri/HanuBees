# THE BRAIN — Hanubees Content System (master spec)

Canonical operating system for all Hanubees social content. Claude = the brain.
Read this + `VIRALITY-LEVERS.md` before every run. Last set: 2026-06-09.

═══════════════════════════════════════════════════════════════════════════════
## 0. FIXED DOCTRINE (never violate)
═══════════════════════════════════════════════════════════════════════════════
0.1  Brand = **faceless, influential, business-niche** page. Audience = small/local
     business owners, freelancers, solopreneurs. Value-first. NOT a product ad.
0.2  Goal NOW = **audience + reach + brand influence**, not signups.
0.3  Hanubees appears as **ONE quiet sentence at the end** of every post (caption
     footer + small end-slide). Never the point of the post.
0.4  **Claude is the brain.** No external AI/LLM keys. No prebuilt/templated
     creativity. Fresh creation every day. (Zernio + Supabase = hands, allowed.)
0.5  **No manual posting, no paid boost, no engagement squad, free tools only.**
0.6  Every post is built on **≥1 of the 4 levers**: Funny · Trend · Reaction ·
     Copy-proven-hook. Value + footer wrapped *inside* the lever.
0.7  **No faking** — no fabricated stats/reviews/news. Real numbers only (DB or cited).
0.8  **Each post iterated ≥4×** to the bar (Section 5). Below bar = redo, not ship.
0.9  **Spam/ban = brand death.** All 8 accounts are "hanubees". Stay under platform
     caps; vary content; copyright-clean only.
0.10 Visual identity consistent: bee.png, Space Grotesk, brand colors (#FFBE00 /
     #98AA9D / #121212 …) on every asset for recognition.

═══════════════════════════════════════════════════════════════════════════════
## 1. ACCOUNTS & CADENCE (the numbers)
═══════════════════════════════════════════════════════════════════════════════
1.1  8 accounts via 4 Zernio keys: IG ×3, Threads ×3, TikTok ×1, YouTube ×1.
1.2  **Daily volume: 8 posts/day = 1 unique post per account** (start point; the
     brain may scale to 16 when quality holds + caps allow). Quality is fixed, only
     pace flexes.
1.3  Per-account safe ceiling: **≤2 posts/account/day**, spaced ≥4h apart.
1.4  **Every account gets a DIFFERENT post** — nothing duplicated anywhere
     (enforced via `video_log` / `post_log`).
1.5  Post timing = audience-local peak windows (morning + evening), not arbitrary UTC.

═══════════════════════════════════════════════════════════════════════════════
## 2. THE 4 LEVERS (every post picks ≥1) — see VIRALITY-LEVERS.md
═══════════════════════════════════════════════════════════════════════════════
2.1  FUNNY — small-biz/owner-life memes, relatable pain humor.
2.2  TREND — fresh business/AI/marketing news or hot topic owners care about.
2.3  REACTION — our take on a viral premise, in OUR visuals (never repost pixels).
2.4  COPY-PROVEN-HOOK — keep a viral skeleton, swap in business substance (cheat code).
2.5  Each post tagged with its lever(s); learning loop biases toward winning levers.

═══════════════════════════════════════════════════════════════════════════════
## 3. STAGE 1 — HARVEST (build the reference library, free + automated)
═══════════════════════════════════════════════════════════════════════════════
3.1  Sources (all free):
     a. **YouTube Data API** (key we have): search business/marketing/entrepreneur
        Shorts by topic, sort by **view count** → real top performers + view numbers.
     b. **My own web research** (WebSearch/WebFetch, no key): viral-post breakdowns,
        real hooks, examples, structure analyses.
     c. **Reddit** (free `.json`): top/hot in r/smallbusiness, r/Entrepreneur,
        r/marketing → proven hooks, topics, fresh news (Trend lever).
3.2  Per run: pick **3–4 angles/categories** for the day.
3.3  Per angle: harvest a **comparison set of 3–5 proven performers in the SAME
     category** (this is what Stage 2 compares).
3.4  Store every reference in `viral_refs`: source, url, hook, views/upvotes,
     structure, lever, category, harvested_at.

═══════════════════════════════════════════════════════════════════════════════
## 4. STAGE 2 — DIFFERENTIAL ANALYSIS (the validation method)
═══════════════════════════════════════════════════════════════════════════════
4.1  For each angle's comparison set (e.g. 4 videos ~1M views each):
4.2  Find the **COMMON pattern** across all of them = table stakes (must-haves).
4.3  Find what the **single BEST one does that the others DON'T** = **the EDGE**.
4.4  Same category controls the topic → the view gap isolates *execution* (hook,
     structure, pacing, format). The EDGE is the thing worth copying.
4.5  Record: common-pattern + the-edge per category → these become the target our
     remake must hit (used as the 4× recheck yardstick, not my opinion).

═══════════════════════════════════════════════════════════════════════════════
## 5. STAGE 3 — CREATE & REMIX (the brain creates) + THE 4× QUALITY RECHECK
═══════════════════════════════════════════════════════════════════════════════
5.1  For each of the day's 8 posts, the brain creates fresh: pick lever + proven
     skeleton/edge → write hook + body + footer → design the visual from the
     reference → assemble.
5.2  **MANDATORY ≥4 ITERATION PASSES per post. Each pass = critique → re-edit.
     If any pass fails the bar, REDO (not tweak). More than 4 if needed.**

   PASS 1 — CONCEPT & HOOK
     □ Is the first line/frame a genuine scroll-stopper (≤2s)?
     □ Which lever? Is it actually using it, not just labeled?
     □ Does it hit the category's COMMON pattern + the EDGE from Stage 2?
     □ Is the idea ONE clear idea (not muddled)?
     → fail any → rewrite the concept.

   PASS 2 — SUBSTANCE, VALUE & TRUTH
     □ Real value an owner would SAVE or SHARE? (saves/shares > likes)
     □ Every number/claim TRUE (DB-verified or cited)? Zero fabrication.
     □ Tight, no filler, no fluff sentences.
     □ On-niche (small/local business) + on-brand voice.
     → fail any → rewrite the body.

   PASS 3 — VISUAL / RENDER (look with my own eyes)
     □ Render it, then VIEW the actual frames/images.
     □ Compare side-by-side to the reference's EDGE — did we match it?
     □ Legible on mobile (text size/contrast), paced well, cuts on beat (video).
     □ Brand identity present + consistent (bee, font, colors). Not generic.
     → fail any → fix design/pacing/render and re-view.

   PASS 4 — POLISH & SHIP-CHECK
     □ Caption SEO: leads/ends with the searchable query; platform-correct
       (YouTube title + #shorts; TikTok keyword caption; IG niche tags — no #fyp).
     □ Hanubees one-line footer present (caption + end-slide).
     □ Unique vs the other 7 accounts' posts today (no dup).
     □ Copyright-clean: CC/licensed footage + licensed audio only.
     □ Brand-safety: nothing that risks a strike/flag.
     → fail any → fix, then final read.

5.3  A post only ships when all 4 passes are clean. Log iteration count per post.

═══════════════════════════════════════════════════════════════════════════════
## 6. STAGE 4 — FOOTAGE & ASSEMBLY (copyright-clean, premium)
═══════════════════════════════════════════════════════════════════════════════
6.1  Footage sources (ALL legally remixable — NO ripping copyrighted clips):
     a. **YouTube Creative Commons** (`videoLicense=creativeCommon`) — real YouTube
        footage licensed for reuse; credit the source. THE primary footage source.
     b. Free-license libraries: Mixkit, Coverr, Mazwai, Pexels/Pixabay video.
     c. Our own motion graphics + phone-mockup demos (Remotion).
6.2  Quality = the **EDIT**, not rare clips: **mix 3–5 clips**, cut on the beat,
     speed ramps, kinetic typography, branded overlays → transformed & ours.
6.3  Audio = licensed beds only (CC-BY, credited). Trending/copyrighted audio gets
     Content-ID muted → never used.
6.4  REACTION lever = our visuals + our take referencing the topic; never re-upload
     someone's pixels.

═══════════════════════════════════════════════════════════════════════════════
## 7. STAGE 5 — RENDER & SCHEDULE (the hands)
═══════════════════════════════════════════════════════════════════════════════
7.1  Render via Remotion on **GitHub Actions** (free; pinned @remotion 4.0.290,
     npm install not ci, font once, 90s timeout — see marketing memory CI gotchas).
7.2  Post via **Zernio**: video → IG/TikTok/YouTube; Threads = hook as TEXT
     (Zernio drops video on Threads). Per-platform caption from build-content.
7.3  Schedule into local-peak windows; mark posted in log (no repeats).

═══════════════════════════════════════════════════════════════════════════════
## 8. STAGE 6 — LEARNING LOOP (luck → signal; exploit winners)
═══════════════════════════════════════════════════════════════════════════════
8.1  `analytics.js` pulls all **4 Zernio keys** → `post_perf` → weighted-eyeballs
     leaderboard (views + reach + likes·5 + shares·12 + saves·8 + comments·6).
8.2  Tie each post back to its **lever + skeleton + category + footage type**.
8.3  EXPLORE: keep trying new skeletons/levers each day.
8.4  EXPLOIT: the few that hit → remix 10× harder, kill the duds. Compound.
8.5  Brain reads the leaderboard at the start of every run before creating.

═══════════════════════════════════════════════════════════════════════════════
## 9. DATA MODEL (Supabase)
═══════════════════════════════════════════════════════════════════════════════
9.1  `viral_refs`  — harvested proven posts (source, hook, views, structure, lever, category).
9.2  `post_log`    — every post we ship (id, account, platform, lever, skeleton, category,
                     footage_type, iterations, posted_at) → enforces uniqueness.
9.3  `post_perf`   — per-post metrics from Zernio (existing).
9.4  `accounts`    — the business DB (2,088 rows) feeding real numbers/topics.

═══════════════════════════════════════════════════════════════════════════════
## 10. DAILY RUN — END TO END
═══════════════════════════════════════════════════════════════════════════════
10.1 Read leaderboard (Stage 5) → what's winning.
10.2 Pick 3–4 angles for the day (levers + trends).
10.3 Harvest comparison sets (Stage 1).
10.4 Differential analysis → common + edge per angle (Stage 2).
10.5 Create 8 posts, each ≥4× iterated to the bar (Stage 3).
10.6 Source CC/licensed footage, assemble premium edits (Stage 4).
10.7 Render + schedule across 8 accounts into peak windows (Stage 5).
10.8 Log everything; next day, exploit winners.

═══════════════════════════════════════════════════════════════════════════════
## 11. SCHEDULING (how the brain runs daily)
═══════════════════════════════════════════════════════════════════════════════
11.1 No system cron here → brain runs in a **scheduled session/routine** (daily) or
     on founder trigger. Posting itself is automated; creation = me each run.
11.2 If a run is missed, posting continues on queued content; only the refill pauses.

═══════════════════════════════════════════════════════════════════════════════
## 12. HONEST LIMITATIONS
═══════════════════════════════════════════════════════════════════════════════
12.1 Visuals = clean branded motion-graphics + licensed/CC b-roll, NOT hand-cut
     CapCut meme edits (those need a human editor in-app).
12.2 Viral-signal data strongest on YouTube (real views) + web/Reddit; TikTok/IG
     virality is inferred from those (a correlated proxy).
12.3 Original-aesthetic invention is not my strength → system is reference-driven
     (replicate proven, adapt to niche). By design.
12.4 Creation depends on a live session (the brain); the rest is autonomous.

═══════════════════════════════════════════════════════════════════════════════
## 13. SUCCESS METRICS
═══════════════════════════════════════════════════════════════════════════════
13.1 Primary: reach/views + saves + shares (audience growth), per lever/category.
13.2 Secondary: follower growth across the 8 accounts.
13.3 Hanubees signups = NOT a goal yet (footer only). Revisit when product matures.
