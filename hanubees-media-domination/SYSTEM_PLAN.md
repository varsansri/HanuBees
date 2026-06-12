# SYSTEM PLAN — Hanubees Media Domination (production engine)
# Status: PLAN APPROVED-PENDING (founder reviewing). Do NOT build until green light.
# Last updated: 2026-06-12

## Principle
ONE locked template. Only the MEDIA and the CONTENT change per post; layout,
fonts, colors, geometry, logo treatment, and text rules are hard-coded and
identical every time. Pipeline = sequential phases, each a GATE (pass / auto-fix
/ reject) before the next runs.

## Founder decisions (LOCKED 2026-06-12)
1. Comparison persona = **MIX PER POST**: ranking posts -> 1 hero face;
   direct "A vs B" posts -> 2 face bubbles (versus layout).
2. Niches at launch = **PEOPLE-LED FIRST** (wealthy people/founders, footballers,
   artists, influencers, creators). Product/car/company niches = later upgrade
   (subjectType + object-center crop reserved in config but not built yet).
3. Layout variety = **3 LOCKED ANGLES** rotated: person-right / person-left /
   person-center. Same rules + brand, mirrored placement only.

## Pipeline (each phase gated)
- P1 Topic    : niche -> "Top 10 X this year" -> #1 hero + comparison. GATE: not used recently (dedup DB).
- P2 Hook     : pull a DIFFERENCE template from hook_bank.json (from the PDF), fill (insert) slots. GATE: difference-type, fits s1.
- P3 Facts    : draft real numbers -> truth-check pass. GATE: all numbers verified or KILL post.
- P4 Media    : scrape >=5 sources, last-4-yrs, >=3 distinct subject photos + real logo. GATE: enough fresh distinct photos + logo.
- P5 Prep     : face-detect -> circle-crop centered on face (per slide); build logo coin badge. GATE: face centered within tolerance.
- P6 Compose  : apply locked template + auto-fit text (rotate one of 3 angles). GATE: 4 slides render.
- P7 Quality  : automated checker (below). GATE: all pass, else auto-fix once or reject+retry.
- P8 Export   : Threads = 4 image slides; IG/TikTok/YT = reel from slides + music.
- P9 Post     : scheduler per account; claim subject so no account repeats it. GATE: uniqueness claim ok.
- P10 Cleanup : delete rendered PNGs after posting.
- P11 Learn   : log performance to analytics.

## Template spec (locked constants -> config.js + TEMPLATE_SPEC.md)
- Canvas 1080x1440 (3:4). Safe margin 56px.
- Space Grotesk ONLY (300/400/500/700). Brand-palette hex ONLY. No emojis.
- Grid (fixed coords): geo marks + kicker + code (top-left); HANUBEES + hanubees.com
  (top-right); yellow topic word under kicker; vertical ruler (left); logo badge
  (behind); person bubble (front) + soft ring; bottom black gradient text band;
  bee watermark (bottom-right).
- Layer order back->front: bg gradient -> logo badge -> person bubble -> ring ->
  text band -> bee.
- 3 angles only move the person/logo cluster (right/left/center mirror).

## The 3 variables and their hard rules
LOGO: prefer transparent SVG -> crisp raster; fallback rembg on PNG. Centered on
  its bbox inside a circular coin. COIN COLOR auto by logo luminance (dark logo ->
  light coin, light logo -> dark coin) so it always reads. Fixed diameter/position.
PERSON+FACE: >=3 distinct photos, different one per content slide, all <=4 yrs.
  OpenCV face-detect -> largest face -> circle crop centered on face, nudged down
  for chin+shoulders. Fallback upper-third. REJECT: no face / crowd-ambiguous /
  low-res / near-duplicate of another slide -> drop, try next.
CONTENT: s1 hook/question · s2 number · s3 answer/difference · s4 fixed agency card.
  TEXT AUTO-FIT: measure line width -> wrap to max chars/line -> if still too wide,
  step font size DOWN in fixed increments until it fits -> cap max line count
  (else shorten upstream) -> enforce MIN font size (never smaller). Topic word and
  big number get their own length-based auto-fit. All text inside band safe box,
  left-aligned to grid.

## Quality checker (P7) — assertions
1) 4 slides, correct 3:4 size. 2) Face present+centered (s1-s3). 3) Each content
slide a DIFFERENT photo (hash). 4) Logo badge present+opaque+contrast ok.
5) Headline fits band (no clip), within min/max font + max lines. 6) Text contrast
>= threshold. 7) Inside safe margins; bee + hanubees.com present. 8) Brand colors
only (palette scan; logo colors exempt). 9) Facts truth-check passed. 10) Caption
within platform limit; uniqueness claimed. Fail -> auto-fix once, else reject+retry.

## Reserved for later (documented, not built at launch)
subjectType=product/company + object-center crop; reel music selection polish;
licensing/attribution tracking; long-term subject dedup window; analytics->strategist
loop; post-then-delete already in P10.

## File structure
config.js · TEMPLATE_SPEC.md · hook_bank.json ·
pipeline/{p1_topic,p2_hook,p3_facts,p4_media}.js · pipeline/p5_prep.py ·
pipeline/{p6_render,p7_quality,p8_export,p9_post,p10_cleanup}.js · run-post.js
(Current sample scripts render-tipo2.js + prep_circles.py become the basis of
p6_render + p5_prep.)
