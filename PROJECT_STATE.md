# HanuBees Project State

Last updated: 2026-08-20 (Asia/Calcutta)

## Resume protocol

1. Read `AGENTS.md`, this file, `docs/DESIGN_LIBRARY_REQUEST_LOG.md`, and `docs/DESIGN_LIBRARY_REFERENCE_QUEUE.md` before changing the Design Library.
2. Inspect `git status`, `git log -1`, and the current live deployment before continuing.
3. Preserve all existing source, generated assets, downloadable packages, and project notes.
4. Complete only one reference design at a time. Ask the user for explicit permission before starting the next reference.
5. After every meaningful change, update this file, test proportionately, commit to `main`, push to `origin`, and verify the live site when deployment access is available.
6. Never place credentials, tokens, secrets, or private access details in this file or any other committed file.

## Product brief

HanuBees is becoming a Design Library of polished, UI-ready website sections and full themes. Each collection entry must provide three usable deliverables:

- An interactive browser preview that shows the real design, motion, hover states, and responsive behavior, plus downloadable preview source code.
- An editable theme folder with design tokens, source, assets, and editing guidance.
- A project abstract that explains the concept, system, ownership, and implementation.

Quality requirements: close visual fidelity to each supplied reference, original branding and assets, rich but purposeful motion, smooth interactions, responsive layouts, broad modern-browser support, accessible controls, high-quality visuals, and minimal friction.

## Source collection

- Reference folder: `C:\Users\varsa\Downloads\ui Hanubeees Collection`
- Total references inventoried: 29
- Processing order: stable filename order unless the user changes priority.
- Queue and completion markers: `docs/DESIGN_LIBRARY_REFERENCE_QUEUE.md`

## Current milestone: Design 01 — Unruled

Status: implementation, packaging, production build, responsive checks, and interaction checks are complete locally. Work is paused at the user's request. Do not resume implementation or deployment until the user explicitly asks to continue.

Reference used:

- `#Shopify #ShopifyStore #Ecommerce #OnlineStore….jpg` (`736x1308`)

Creative direction:

- Original monochrome streetwear storefront inspired by the reference composition.
- Theme name and branding: **Unruled**.
- No copied logos, brand marks, people, or reference text.
- Seven original raster assets were generated for the hero, four products, and two editorial scenes.

Implemented routes:

- `/design` — Design Library landing and categorized collections.
- `/design/unruled-streetwear-storefront` — Unruled library detail page and interactive device preview.
- `/theme/unruled` — full-screen theme preview.

Primary implementation files:

- `app/design/page.tsx`
- `app/design/library.module.css`
- `app/design/unruled-streetwear-storefront/page.tsx`
- `app/design/unruled-streetwear-storefront/page.module.css`
- `app/theme/unruled/page.tsx`
- `app/theme/unruled/theme.css`
- `components/interactive-theme-preview.tsx`
- `components/interactive-theme-preview.module.css`
- `components/theme/unruled-home.tsx`
- `components/theme/unruled-data.ts`
- `lib/theme-library.ts`

Generated image assets:

- `public/themes/unruled/hero-campaign.png`
- `public/themes/unruled/hoodie-arch.png`
- `public/themes/unruled/hoodie-orbit.png`
- `public/themes/unruled/hoodie-flare.png`
- `public/themes/unruled/hoodie-eclipse.png`
- `public/themes/unruled/editorial-mission.png`
- `public/themes/unruled/editorial-vision.png`

Downloadable deliverables:

- `public/downloads/unruled/unruled-preview-source.zip`
- `public/downloads/unruled/unruled-editable-theme.zip`
- `public/downloads/unruled/unruled-project-abstract.pdf`
- `public/downloads/unruled/unruled-project-abstract.html`
- Editable source and documentation: `theme-kits/unruled/`

## Verification completed

- Root `npm run build`: passed on Next.js 16.2.6; 25 routes generated.
- Targeted ESLint on modified/new source: passed.
- TypeScript `npx tsc --noEmit`: passed.
- Extracted standalone preview archive: dependency install and production build passed.
- Both ZIP archives extracted and required contents were validated.
- Abstract PDF structure validated as three pages.
- Local production HTTP checks: all three routes and all four downloads returned `200` with expected content types and lengths.
- True 390px browser emulation: document width remained 390px with no page-level overflow.
- Keyboard and UI checks passed for menu open/close, Escape, search focus, product drawer, size selection, add-to-bag count, and toast feedback.
- Design detail preview iframe loaded the Unruled route and switched to the mobile device frame correctly.
- Generated images include alternative text; interactive controls have accessible names.

## Decisions already made

- The navigation label is **Design Library** (replacing the earlier user-facing “Design Lab” wording).
- Unruled is listed before the existing Kart theme on the Design Library page.
- The existing Liquid Glass component collection remains available.
- Theme previews use real routes inside an interactive iframe rather than static screenshots.
- Mobile product cards intentionally use a horizontal shelf; other layout overflow is not allowed.
- Respect `prefers-reduced-motion` and retain a usable no-JavaScript visual fallback.

## Pause marker

On 2026-08-20, the user instructed the agent to stop task work and only save durable memory and progress. This checkpoint preserves the completed local implementation and all supplied requirements. A future session must report the saved state before taking further action.

## Next action — permission required

Do not deploy, modify Design 01, or start Design 02 until the user asks to resume. When the user resumes, inspect the saved Git state and ask for permission before advancing beyond Design 01. If permission is granted and no new priority is supplied, the next queue item is:

- `16747829861821635.jpg` (`600x600`)

Before implementing it, inspect the full-resolution reference, assign a distinct original theme name/category, and update this state file.
