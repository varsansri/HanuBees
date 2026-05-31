# Hanubees.com — Claude Session Memory

## Owner
- **Name:** varsansri
- **Email:** varsansri88@gmail.com
- **GitHub:** https://github.com/varsansri
- **Device:** Android mobile (Termux/PRoot Linux)

---

## Project: Hanubees.com
- **Live site:** https://hanubees.com
- **GitHub repo:** https://github.com/varsansri/HanuBees
- **Vercel project:** https://vercel.com/varsansri88-gmailcoms-projects/hanubees
- **Domain registrar:** Cloudflare (DNS configured via Vercel)
- **Analytics:** PostHog — project ID 448217, key: phc_pnLuYMGWkCWHS9SiwWbYDRdT2bnUbCP6SKfD3NAGKYni
- **PostHog host:** https://us.i.posthog.com
- **PostHog dashboard:** https://app.posthog.com

---

## What Was Built (31 May 2026)

Full landing page website with:

| Component | Description |
|-----------|-------------|
| ShaderBackground | Animated amber/dark WebGL gradient (via @shadergradient/react) |
| Logo | SVG honeycomb icon + Berthold-style Montserrat Black wordmark |
| Nav | Sticky glass navbar that appears on scroll |
| HexGrid | Hex pattern SVG overlay |
| Scene3D | react-three-fiber golden icosahedron + particle ring orbit |
| LiquidGlassCard | SVG turbulence filter + backdrop-blur cards with mouse distortion |
| Features | 3 liquid glass feature cards |
| Marquee | Auto-scrolling brand strip |
| Contact form | Glass-style input form |
| PostHogProvider | Analytics + session recording |

---

## Tech Stack
- **Framework:** Next.js 16.2.6 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4
- **3D:** react-three-fiber + @react-three/drei + three.js
- **Gradient:** @shadergradient/react
- **Analytics:** posthog-js
- **Font:** Montserrat Black (Berthold substitute) + Inter
- **Deployment:** Vercel (auto-deploy on push to main)
- **Node:** 20.x

---

## Design Decisions
- Font "Berthold" → substituted with Montserrat 900 weight (user's brand font)
- liquid-glass-js and liquid-logo have no npm packages → implemented manually with SVG feTurbulence filters and CSS backdrop-filter
- ShaderGradient colors: amber (#f5a623), dark purple (#1a0530), near-black (#06060f)
- All WebGL/3D components are client-only via dynamic imports with ssr:false (wrapped in ClientOnly.tsx due to Next.js 16 Server Component restriction)
- PostHog PageView wrapped in Suspense boundary (required by Next.js 16 for useSearchParams)

---

## Environment Variables (Vercel production)
- NEXT_PUBLIC_POSTHOG_KEY=phc_pnLuYMGWkCWHS9SiwWbYDRdT2bnUbCP6SKfD3NAGKYni
- NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

---

## File Structure
```
/root/hanubees/
├── app/
│   ├── globals.css        — fonts, CSS vars, animations, glass styles
│   ├── layout.tsx         — metadata + PostHogProvider wrapper
│   └── page.tsx           — full landing page
├── components/
│   ├── ClientOnly.tsx     — dynamic SSR-false wrapper for WebGL
│   ├── ShaderBackground.tsx
│   ├── Logo.tsx
│   ├── Nav.tsx
│   ├── HexGrid.tsx
│   ├── Scene3D.tsx
│   ├── LiquidGlassCard.tsx
│   ├── Features.tsx
│   ├── Marquee.tsx
│   └── PostHogProvider.tsx
├── .env.local             — PostHog keys (local only, not committed)
├── next.config.ts         — transpilePackages for three/shadergradient
└── package.json
```

---

## Git Commits This Session
1. `2b42fc6` — feat: initial Hanubees.com launch build
2. `bb6f0f6` — feat: add PostHog analytics with session recording

---

## How to Update & Deploy
```bash
# Edit files in /root/hanubees/
git add .
git commit -m "your message"
git push
# Vercel auto-deploys in ~25 seconds
```

---

## GitHub Auth (important)
- **Never paste GitHub tokens in chat** — GitHub's secret scanner revokes them instantly
- Use device flow: `gh auth login` → opens browser code flow
- Or embed in command: `! git remote set-url origin https://varsansri:TOKEN@github.com/...`

---

## Other Projects by varsansri
- https://github.com/varsansri/fxabsolute — forex backtester
- https://github.com/varsansri/biyatrix — AI social platform
- https://github.com/varsansri/builtix — mobile AI terminal
- https://github.com/varsansri/monitor — AI visual monitoring
- https://github.com/varsansri/memoryai — MemoryAI
- fxabsolute.com — another live Vercel domain

---

## Session Notes (31 May 2026)
- User bought hanubees.com on Cloudflare
- Multiple GitHub token attempts failed (GitHub secret scanning)
- Used `gh auth login` device flow successfully to authenticate
- Vercel linked via `vercel link --yes` → auto-detected GitHub repo
- PostHog US Cloud region, web analytics domain set to https://hanubees.com
- Project files backed up to /sdcard/Documents/Hanubees/ on device
