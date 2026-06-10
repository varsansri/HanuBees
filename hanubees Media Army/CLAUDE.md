# Hanubees Media Army — CLAUDE.md
# READ THIS FIRST EVERY SESSION

## What this is
A self-contained social media content machine. It renders business-story carousel slides + reels and schedules them across 8 accounts via Zernio. Target: **130 posts/day** across Instagram, TikTok, Threads, and YouTube.

---

## Quick commands

```bash
node scripts/army.js status       # today's progress, per-account counts, full schedule
node scripts/army.js next         # schedule next batch of 10 posts (build + post)
node scripts/army.js next 20      # batch of 20
node scripts/army.js plan         # preview next batch WITHOUT posting
node scripts/army.js subjects     # concept supply health
```

**To hit 130/day: run `next` 13 times.**

---

## Architecture

```
daily-batch.js      → defines ALL concepts (CONCEPTS array)
army.js             → control panel: status / next / plan / subjects
config.js           → accounts, tracks, volume settings
claim.js            → cross-system dedup via Supabase subject_log
make-reel.sh        → ffmpeg: slides → MP4 reel
assets/library/{id}/photo.jpg  → face photo for each concept
assets/library/{id}/logo.png   → optional logo overlay
out/daily/{id}/     → rendered slides (s0.png, s1.png, s2.png) + reel.mp4
```

---

## 8 Accounts (config.js)

| Platform | Username | Media | Key |
|----------|----------|-------|-----|
| instagram | hanubees | video | ZERNIO_API_KEY |
| tiktok | riaze_charlie | video | ZERNIO_API_KEY |
| threads | hanubees | image | ZERNIO_API_KEY |
| youtube | hugo_mapa | video | ZERNIO_API_KEY |
| instagram | fxabsolute.com_ | video | ZERNIO_API_KEY_2 |
| threads | fxabsolute.com_ | image | ZERNIO_API_KEY_2 |
| instagram | hanubees.biz | video | ZERNIO_API_KEY_3 |
| threads | hanubees.biz | image | ZERNIO_API_KEY_3 |

**Video accounts** (IG/TikTok/YouTube): get MP4 reels (ffmpeg renders slides + music).
**Image accounts** (Threads): get image carousels (s0, s1, s2 PNGs).

---

## Concept format (daily-batch.js)

```javascript
{ id: "unique_id",           // must match assets/library/{id}/
  company: "Company Name",   // optional — used as wordmark if no logo
  kicker: "ALL CAPS HOOK",   // short punchy line at top of poster
  headline: "Main hook with NUMBER.",  // 1 sentence, emotional
  question: "Curiosity gap question?", // makes viewer swipe
  slides: [
    ["SLIDE TITLE", [
      ["1", "Point headline.", "Body with numbers and story."],
      ["2", "Point headline.", "Body."],
    ]],
    ["SLIDE 2 TITLE", [
      ["3", "Point headline.", "Body."],
    ], "Lesson — Hanubees"],   // optional footer
  ] },
```

**Hook formula:**
- Kicker: shock stat or contradiction in CAPS
- Headline: number + emotion + company name
- Question: curiosity gap ("How?" / "Why?" / "What happened?")
- Slides: 3 numbered facts, rising tension, lesson footer

---

## Adding new concepts

1. Add concept object to `CONCEPTS` array in `scripts/daily-batch.js`
2. Create `assets/library/{id}/photo.jpg` (face photo for poster background)
3. Optionally add `assets/library/{id}/logo.png`
4. Run `node scripts/army.js subjects` to confirm it's picked up
5. Run `node scripts/army.js next` to schedule

**Quick media folder creation:**
```bash
mkdir -p assets/library/new_id
cp assets/library/nvidia/photo.jpg assets/library/new_id/photo.jpg
```

---

## Known bugs fixed (2026-06-10)

**VIDEO RENDERING WAS BROKEN** — root cause: folder name `hanubees Media Army` has a space. The `execSync` call in `army.js` was building bash commands with unquoted paths, which bash split at the space.

**Fix applied in `scripts/army.js` line ~147:**
```javascript
// BEFORE (broken):
execSync(`bash ${path.join(__dirname, "make-reel.sh")} "${dir}" ...`)
// AFTER (fixed):
execSync(`bash "${path.join(__dirname, "make-reel.sh")}" "${dir}" ...`)
```
Also changed `stdio: "ignore"` → `stdio: "pipe"` so errors surface.

---

## Dedup system

All posted subjects are logged to Supabase `subject_log` table. The `claim.js` script:
- Checks which concepts were posted in the last 10 days (by ANY system)
- Blocks repeats across both `hanubees Media Army` and `hanubees-marketing-team`
- `SYSTEM_ID` is set in `config.js`

**To reset dedup (clear all history):**
```bash
node -e "const { sql } = require('./scripts/claim'); (async () => { await sql('delete from subject_log;'); console.log('cleared'); })();"
```

---

## Music tracks (config.js → TRACKS)

Stored in `/tmp/` at runtime:
- `/tmp/ncs_weare.mp3` — "We Are" by Jo Cohen & Sex Whales [NCS]
- `/tmp/ncs_comingback.mp3` — "Coming Back" by The Uncommon & Kaphy [NCS]
- `/tmp/ncs_fireflies.mp3` — "Fireflies" by KREZUS [NCS]

If `/tmp/` is cleared, the `_env.js` script re-downloads them. Check `scripts/_env.js`.

---

## Environment variables (.env or Termux)

```
ZERNIO_API_KEY       # key 1 → hanubees accounts
ZERNIO_API_KEY_2     # key 2 → fxabsolute accounts
ZERNIO_API_KEY_3     # key 3 → hanubees.biz accounts
ZERNIO_API_KEY_4     # key 4 → (reserved)
SUPABASE_PROJECT_REF # for subject_log dedup
SUPABASE_ACCESS_TOKEN
```

---

## Today's content themes (2026-06-10 — 61 scheduled)

**Batches 1–5 (original 51 concepts):** Big tech origin stories — Nvidia, Apple, Amazon, Meta, Tesla, Netflix, Berkshire, WhatsApp, Starbucks, Shopify, SpaceX, Disney, Oracle, Stripe, Lego, Patagonia, Snap, LinkedIn, Salesforce, Alibaba, Ford, Dell, Zoom, JPMorgan, Reddit, Walmart, BlackRock, McDonalds, Nintendo, HP, Sony, Harley, IBM, Target, eBay, PayPal, Virgin, Bridgewater, etc.

**Batch 6 (new — emotional/numbers):** Past 2 decades viral business moments — iPhone launch bluff, WeWork $47B→0, FTX collapse, GameStop squeeze, Luna $40B evaporated in 72hrs, Zoom 2900% growth, Threads 100M in 5 days, Meta Metaverse $47B loss, Apple kills Meta with one popup, Sam Altman fired+rehired in 5 days, Nvidia +$1T in 12 months, Elon's $44B Twitter disaster, CrowdStrike crash 8.5M computers, Airbnb near-death→$100B IPO, Squid Game 42× ROI, Apple $1T, Bitcoin pizza day, Instagram pivot, TikTok algorithm, Uber CEO ousted, OpenAI $157B valuation, Shopify 500% in 6 months, Robinhood betrayal, Microsoft comeback 10×, Tesla shorts crushed $38B, Netflix password ban backfired perfectly, Clubhouse rise+death, Apple M1 destroys Intel, Google Chrome as defence, Cambridge Analytica, Amazon Prime loss-leader, Roblox 60% of US kids, Stripe stays private at $95B, YouTube $1.65B→$300B, GitHub data moat, Alexa $20B failure, Klarna 85% down then back, Google Stadia killed, SoftBank $130B loss, DoorDash IPO loss-then-profit, Snap vs Instagram Stories, Coinbase crypto legitimacy.

**Batch 7 (trending):** MrBeast $700M/year, GPT-4 passed bar exam, India UPI beats Visa, ChatGPT plugins App Store, Zomato IPO, DeepSeek $6M vs $100M, Perplexity eating Google, Jio destroyed 7 telecoms, SpaceX Starship catch, Paytm IPO -40%, Canva 100 rejections, BYJU'S 99% collapse, Wordle sold for $1M, India 100 unicorns, Apple Services $85B.

---

## Concept supply (as of 2026-06-10)

- **Total concepts in daily-batch.js:** ~107
- **With media (ready to schedule):** ~90+
- **10-day dedup window:** resets daily
- **Target per day:** 130 (13 batches of 10)
- **Practical daily max with current stock:** ~90 (need ~40 more concepts to hit 130 consistently)

---

## Folder structure

```
hanubees Media Army/
├── CLAUDE.md              ← this file
├── AGENTS.md              ← opencode agent instructions
├── README.md              ← quick start
├── RUNBOOK.md             ← ops runbook
├── CREDENTIALS.md         ← account credentials (gitignored)
├── config.js              ← accounts, tracks, volume
├── package.json
├── scripts/
│   ├── army.js            ← MAIN CONTROL PANEL
│   ├── daily-batch.js     ← ALL CONCEPTS (edit this to add content)
│   ├── claim.js           ← dedup via Supabase
│   ├── make-reel.sh       ← ffmpeg slide→MP4
│   ├── _env.js            ← loads .env + downloads music to /tmp
│   ├── analytics.js       ← post performance tracker
│   └── ...other scripts
├── assets/
│   ├── brand/bee.png      ← bee watermark on every slide
│   └── library/           ← one folder per concept
│       └── {id}/
│           ├── photo.jpg  ← REQUIRED: face/background photo
│           └── logo.png   ← optional: company logo overlay
├── out/
│   └── daily/             ← rendered output (gitignored)
│       └── {id}/
│           ├── s0.png     ← poster slide
│           ├── s1.png     ← answer slide 1
│           ├── s2.png     ← answer slide 2
│           └── reel.mp4   ← video (for IG/TikTok/YouTube)
└── video/                 ← Remotion video engine (separate system)
```
