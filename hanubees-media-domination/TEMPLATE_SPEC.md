> ⛔ DEPRECATED (2026-06-12). Photo-era template (person bubbles, logo coins, face crops).
> SUPERSEDED by text-only math-marketing. Authoritative = `MATH_MARKETING_SYSTEM.md`.
> The new visual template is locked per the founder-approved aesthetic variation (TBD).

# TEMPLATE SPEC — template-tipo (the perfect, replicable guidance)

> Single source of truth for the DESIGN is `config.js` (deep-frozen). This file
> explains it from every angle so the result is reproducible pixel-for-pixel.
> Renderer = `lib/render.js`. Checker = `lib/quality.js`. NEVER hand-edit numbers
> in the renderer — change `config.js` only (and that is a brand decision).

## Canvas & frame
- 1080 × 1440 (3:4). Safe margin 56px on all sides — no element crosses it.
- Background: diagonal gradient #33373f → #1b1d24 → #121212 (brand bg).

## Fixed grid (every post, identical) — see CONFIG.GRID
```
┌───────────────────────────────────────────────┐
│ ▣▢▣  (geo marks)                    HANUBEES   │  top-right brand (yellow)
│ KICKER (cat · caps)                hanubees.com│  code line / url (muted)
│ 2026 / DIFFERENCE / 01                          │
│ TOPIC WORD (yellow, auto-sized)                 │  y=262
│ │                                               │
│ │ ruler        ┌────────┐                       │  logo badge (behind)
│ │ ticks        │  LOGO  │   ┌──────────┐        │
│ │ (left)       └────────┘   │  PERSON  │        │  face bubble (front) + ring
│ │                           │  BUBBLE  │        │
│ │                           └──────────┘        │
│                                                 │
│ ▔▔ (yellow rule)                                │
│ TAG (yellow caps)                               │
│ Headline — big, bold, auto-fit, max 3 lines     │  bottom black gradient band
│                                          🐝     │  bee watermark bottom-right
└───────────────────────────────────────────────┘
```

## The circle cluster + 3 LOCKED angles (CONFIG.ANGLES)
- person bubble Ø700, logo badge Ø380. Logo sits BEHIND, peeking; person IN FRONT
  with a faint white ring (6px, 15% opacity).
- The cluster is the ONLY thing that moves, via 3 angles rotated per content slide:
  - **right**  person x=320 / logo x=96   (the originally-approved look)
  - **left**   person x=60  / logo x=604
  - **center** person x=190 / logo x=350
- Rotation order: right → left → center → right … (gives feed variety, stays on-brand).

## Logo treatment (hard rule) — CONFIG.MEDIA
- Real company logo, transparent (prefer SVG → crisp raster; else rembg).
- Centered on its bounding box inside a circular COIN, filling 60% of the coin.
- Coin color auto by logo luminance: dark logo → light coin (#f5f5f5), light/white
  logo → dark coin (#1a1a1a). Guarantees the logo always reads.

## Person + face (hard rule) — prep_circles.py / CONFIG.MEDIA
- ≥3 DISTINCT photos, one per content slide, all within 4 years.
- OpenCV Haar → largest face → square crop centered on the face, nudged down 0.18×
  face-height for chin+shoulders → circle mask. Fallback: upper-third if no face.
- Rejected: no face / crowd-ambiguous / width < 600px / near-duplicate of another
  slide (avg-hash similarity > 0.92).

## Text & auto-fit (so it's ALWAYS clearly visible) — CONFIG.TEXT
- Font: Space Grotesk only. Headline weight 700, color #eaeaea on the black band.
- Topic word: size by length (1–3 chars → 64, 4 → 60, 5 → 56, 6 → 50, else 44).
- Headline auto-fit algorithm (LOCKED):
  1. text area width = W − x(64) − safe(56).
  2. For size from 60 down to 40 step 4: chars/line = floor(areaW ÷ size·0.56);
     wrap; if lines ≤ 3 → use this size.
  3. If nothing fits by 40, the content is TOO LONG → it must be shortened upstream
     (P1/P2), never rendered clipped. Line-height = size × 1.16.
- Tag: 25px yellow caps with a 64×7 yellow rule above it.

## Slides (LOCKED structure) — CONFIG.SLIDES
1. hook (the difference QUESTION) · 2. number · 3. answer/difference ·
4. agency card (fixed: big bee Ø520 + "We're a marketing agency producing a high
   volume of posts & videos to dominate social media.").

## Quality gate (must pass before export/post) — lib/quality.js
4 slides at exact 1080×1440 · ≥3 distinct photos (avg-hash) · logo present ·
headline auto-fit succeeds (no clip) · facts verified (P3) · uniqueness claimed (P9).
Design checks are hard fails; facts/uniqueness are phase gates wired later.

## What varies vs what is locked
- VARIES: the person photos, the logo, the topic word, the kicker/code/tag, the
  headline text, the chosen angle (auto-rotated).
- LOCKED (config-frozen, cannot drift): canvas, colors, font, grid coordinates,
  circle sizes, ring, gradients, ruler, watermark, agency slide, auto-fit rules.
