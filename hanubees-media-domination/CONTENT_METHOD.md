> ⛔ DEPRECATED (2026-06-12). This describes the OLD photo / top-10 DIFFERENCE system
> (person cut-outs, logos, Space Grotesk). It is SUPERSEDED by the text-only math-marketing
> system. **Authoritative method now = `MATH_MARKETING_SYSTEM.md`.** Do NOT follow this file.
> Kept only for history. Reason for pivot: media is unreliable from code (see new doc).

# CONTENT METHOD — LOCKED (Hanubees Media Domination)

> This is the hard-coded method. It MUST survive context loss. If you are an
> agent picking this project back up: obey this file exactly. Changes happen
> ONLY when the founder explicitly says so (and that request is logged in
> requested.txt). Read plan.txt for the full build picture.

## 1. The single content type (right now): DIFFERENCE
Every post is a **"TOP 10 of <niche> THIS YEAR"** built as a **DIFFERENCE /
comparison**. Q&A and raw-numbers are allowed flavors, but the focus is
DIFFERENCES only — they get the most views.

Recipe for one post:
1. Pick a **TOP 10** of a niche (wealthiest companies, wealthiest people,
   footballers, cars, female influencers, music artists, influencers, business
   creators, …). Always current-year.
2. **Compare** it against something relevant.
3. Frame **slide 1 as a QUESTION** about the difference.
4. **Slides 2-3** reveal the comparison / difference in **HARD REAL NUMBERS**.
5. Resolve with the answer/solution.
6. **Slide 4** is the fixed agency card (sec 4).

## 2. TRUTH ONLY (hard rule)
No fabricated stats, ever. Numbers are drafted then **verified** before render.
Only real, current figures ship.

## 3. The 4-slide anatomy (1080×1080)
**Slides 1-3** (back → front):
- dark `#121212` + premium gradient background
- subject **LOGO behind**, background-removed, large
- subject **PERSON photo in front** — a DIFFERENT image each slide, last 4 yrs
- **black gradient over the bottom 30%** (black → transparent upward)
- **text only inside that bottom-30% band**, perfectly aligned, clearly visible
- bee.png logo + "hanubees.com" watermark on every slide

**Slide 4 (mandatory on EVERY post):**
- Hanubees **bee.png placed BIGGER** (hero)
- copy (working draft, confirm final wording with founder):
  *"We're a marketing agency producing a high volume of posts and videos to
  dominate social media."*

## 4. Branding — ONLY these (Hanubees brand.json)
- **Font:** Space Grotesk ONLY (`assets/brand/fonts/SpaceGrotesk.ttf`),
  weights 300/400/500/700. No other font.
- **Colors ONLY:** yellow `#ffbe00` (primary accent), green `#98aa9d`,
  fg `#eaeaea`, muted `#a9a9a7`, bg `#121212`, card `#1a1a1a`, input `#242424`,
  purple `#b794f6`. No other colors. No emojis.
- bee.png on every image; "hanubees.com" watermark.

## 5. Hooks — ONLY from the 1000-hooks PDF
Hooks come exclusively from the founder's **1000 HOOKS PDF**, written in that
PDF's format. Do NOT invent hooks. (PDF not yet provided — BLOCKED until founder
supplies it.)

## 6. Craft rule (non-negotiable)
Every single image is **PLANNED (layout + alignment + crop) THEN created** —
individually. No lazy template stamping. It must look premium
(YouTube-thumbnail energy), not plain text-on-dark.

## 7. Uniqueness (hard rule)
Each post is 100% unique to ONE account/platform. Never reuse the same
subject/info on a second account. Use the shared Supabase claim DB to enforce.

## 8. Media sourcing
Per subject: pull from **≥5 sources** (Wikimedia Commons + others), **last 4
years only**, collect many assets (different image per slide). Logos: prefer
already-transparent; else background-remove locally (rembg/U2Net). Cut out the
person for the foreground when needed.

## 9. Platform routing
- **Threads → IMAGE carousel** (the 4 slides). Image posts are Threads-only.
- **Instagram / TikTok / YouTube → VIDEO reel** built from the same 4 slides
  (+ music), 1080×1920.

## 10. Lifecycle (build later)
Each image created once. After the scheduler posts it, **delete the PNG**
(post-then-delete). Deferred until posters look right.

## 11. Design-approval loop
Founder shares inspiration images → produce **named template variations** →
render samples → save to **phone storage** (`/sdcard/Documents/Hanubees/
media-domination/<template>/`) → when founder says "good/great", that template
is **locked** as production.
