# Hanubees.com — Complete Project Memory
# READ THIS FIRST IN EVERY NEW SESSION

---

## How To Resume Work Immediately

```bash
# 1. Go to project
cd /root/hanubees

# 2. Pull latest code
git pull

# 3. Install deps if needed
npm install

# 4. Run locally
npm run dev

# 5. Deploy to production
git add . && git commit -m "your message" && git push
npx --yes vercel deploy --prod
```

Vercel also auto-deploys ~30s after every `git push` to main.

---

## Who Is The User
- **Name:** varsansri
- **Email:** varsansri88@gmail.com
- **GitHub:** https://github.com/varsansri
- **Device:** Android phone running Termux + PRoot-Distro Ubuntu
- **Working directory:** `/root/hanubees/`
- **Phone backup:** `/sdcard/Documents/Hanubees/`
- **Style:** Fast execution, short responses, no over-explaining, no emojis

---

## What Hanubees Is
A **health social platform** — Threads/Twitter-style feed where people share health journeys, log supplements/medicines, track personal goals, and support each other. Target users: people managing chronic conditions, supplements, wellness routines.

---

## Live Links
| Resource | URL |
|---|---|
| Live site | https://hanubees.com |
| GitHub repo | https://github.com/varsansri/HanuBees |
| Vercel project | https://vercel.com/varsansri88-gmailcoms-projects/hanubees |
| Supabase dashboard | https://supabase.com/dashboard |
| PostHog dashboard | https://app.posthog.com |
| Umami dashboard | https://cloud.umami.is |
| Cloudflare (domain) | https://dash.cloudflare.com |

---

## Tech Stack
| Layer | Tech |
|---|---|
| Framework | Next.js 16.2.6 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 + inline styles (no CSS modules) |
| Font | Space Grotesk 300/400/500/700 via Google Fonts |
| Backend | Supabase — Auth, Postgres, Storage |
| AI | Gemini Flash — journal supplement identification |
| 3D/Landing | react-three-fiber, @react-three/drei, @shadergradient/react |
| Analytics | PostHog + Umami |
| Deployment | Vercel (auto from GitHub push) |
| Node | 20.x |

---

## Brand & Design System

### 5 Colors — STRICT, NO OTHERS ALLOWED
| Name | Hex | Where |
|---|---|---|
| Yellow | `#FFBE00` | Top-half: headers, active tabs, Post button, vote-up, logo glow |
| Green | `#98AA9D` | Bottom-half: nav icons, #tags, links, liked heart, progress bars |
| Light | `#EAEAEA` | Primary text |
| Muted | `#A9A9A7` | Secondary text, timestamps, placeholders |
| Black | `#121212` | Background |
| Card bg | `#1A1A1A` | Card/panel backgrounds |
| Input bg | `#242424` | Inputs, avatars, chips |

### Rules
- Yellow = top of screen. Green = bottom of screen. Always.
- No red, blue, purple, or any other color anywhere
- Error messages use green (#98AA9D), not red
- Space Grotesk font everywhere — no Inter, no system font in UI
- No emojis — SVG icons only
- No code comments unless truly non-obvious

### Logo
- `/public/bee.png` — pixel isometric bee, transparent bg, 706×622px
- Used as: favicon (`app/icon.png`), feed header (48px height), auth pages (140px wide), OG images
- `/public/logo.png` — original with white bg + wordmark (reference only)

---

## Full File Structure

```
/root/hanubees/
├── app/
│   ├── globals.css                    — All CSS vars, fonts, utility classes
│   ├── layout.tsx                     — Root: metadata, OG, favicon, Umami script
│   ├── page.tsx                       — Landing page (3D/WebGL effects)
│   ├── icon.png                       — Favicon = bee.png
│   ├── apple-icon.png                 — Apple icon = bee.png
│   ├── (auth)/
│   │   ├── login/page.tsx             — Login with forgot password link
│   │   ├── signup/page.tsx            — Signup + 8-digit OTP verify step
│   │   ├── forgot-password/page.tsx   — Send reset email
│   │   └── reset-password/page.tsx   — Set new password (handles Supabase token)
│   ├── (app)/
│   │   ├── layout.tsx                 — App shell with BottomNav, paddingBottom 80
│   │   ├── feed/page.tsx              — Main feed (server component)
│   │   ├── search/page.tsx            — Search + popular health topics
│   │   ├── journal/page.tsx           — Supplement/medicine logger + AI identify
│   │   ├── goals/page.tsx             — Goals & Insights dashboard
│   │   ├── profile/
│   │   │   ├── page.tsx               — Own profile + posts + journal tab + Goals link
│   │   │   └── [username]/page.tsx    — Other users' public profile + follow button
│   │   └── post/
│   │       ├── new/page.tsx           — Create post + image upload (8MB)
│   │       └── [id]/
│   │           ├── page.tsx           — Post page with OG generateMetadata
│   │           └── PostDetail.tsx     — Post detail + comments (client component)
│   └── api/
│       ├── identify/route.ts          — Gemini Flash: identify supplement from text
│       └── og/route.tsx               — Edge: dynamic OG image 1200×630
├── components/
│   ├── feed/PostCard.tsx              — Post card: likes, votes, share sheet, clickable name
│   ├── ui/BottomNav.tsx               — 4-tab nav: Feed, Search, New Post, Profile
│   ├── ClientOnly.tsx                 — SSR-false wrapper
│   ├── ShaderBackground.tsx           — WebGL gradient (landing only)
│   ├── Scene3D.tsx                    — 3D icosahedron (landing only)
│   ├── LiquidGlassCard.tsx            — Glass cards (landing only)
│   ├── Features.tsx                   — Landing features section
│   ├── Marquee.tsx                    — Auto-scroll strip (landing)
│   ├── Nav.tsx                        — Landing sticky nav
│   ├── Logo.tsx                       — Landing logo component
│   ├── HexGrid.tsx                    — Hex SVG overlay (landing)
│   └── PostHogProvider.tsx            — PostHog analytics wrapper
├── lib/
│   └── supabase/
│       ├── client.ts                  — Browser Supabase client
│       ├── server.ts                  — Server Supabase client
│       └── middleware.ts              — Auth: public routes bypass auth
├── middleware.ts                      — Applies session to all routes
├── public/
│   ├── bee.png                        — Main logo (transparent bg)
│   ├── logo.png                       — Original logo with wordmark
│   └── threads-ref.jpg                — UI reference
└── package.json
```

---

## Supabase Database — All Tables

```sql
-- Auth (managed by Supabase)
profiles       (id, username, display_name, bio, avatar_url, created_at)

-- Social feed
posts          (id, user_id, content, image_url, post_type, tags[], value_up, value_down, likes, views, created_at)
comments       (id, post_id, user_id, content, created_at)

-- Follow system
follows        (id, follower_id, following_id, created_at) — UNIQUE(follower_id, following_id)

-- Journal
journal_entries (id, user_id, name, category, raw_input, dose_amount, dose_unit, notes, dose_time)

-- Goals
goals          (id, user_id, title, type, target_value, unit, icon, color, created_at)
goal_logs      (id, goal_id, user_id, value, notes, logged_at)
calorie_logs   (id, user_id, food_name, calories, logged_at)
```

### RLS Policies (all tables)
- Users read/write only their own rows: `auth.uid() = user_id`
- `follows`: follower_id = auth.uid() for write; public SELECT
- `posts` + `comments`: public SELECT (needed for OG scrapers)

### Storage
- **Bucket:** `post-images` — public, `image/*`, 8MB max
- Path: `{user_id}/{timestamp}.{ext}`
- Policies: authenticated INSERT, public SELECT

---

## Auth Configuration (Supabase)
- **Email confirmations:** ON (sends 8-digit OTP)
- **OTP length:** 8 digits (Supabase default)
- **Email template:** Confirm signup → body includes `{{ .Token }}`
- **SMTP:** Gmail via App Password
  - Host: smtp.gmail.com, Port: 587
  - Username: varsansri88@gmail.com
  - Sender name: Hanubees
- **Rate limit:** 60 seconds per user minimum interval
- **Forgot password:** redirectTo → https://hanubees.com/reset-password

---

## Middleware — Public Routes (no auth needed)
```typescript
// lib/supabase/middleware.ts
const isAuthPage =
  pathname.startsWith("/login") ||
  pathname.startsWith("/signup") ||
  pathname.startsWith("/forgot-password") ||
  pathname.startsWith("/reset-password");

const isPublicPage =
  pathname === "/" ||
  pathname.startsWith("/post/") ||
  pathname.startsWith("/api/");
```

---

## OG Image System
- `GET /api/og` → site card (big bee, centered, Hanubees wordmark + tagline)
- `GET /api/og?id={postId}` → post card (author, content, tags, bee top-right)
- Uses edge runtime — bee.png fetched via `fetch()` + `btoa()` to base64 data URL
- og:image must be **absolute URL**: `https://hanubees.com/api/og?id={id}`
- Relative URLs don't work for Threads/X/WhatsApp scrapers

---

## Bottom Navigation
| Tab | Route | Active color |
|---|---|---|
| Feed | /feed | Green |
| Search | /search | Green |
| New Post | /post/new | Yellow pill (always yellow) |
| Profile | /profile | Green |

---

## All Features Built

### Session 1 — 31 May 2026
- Landing page (3D WebGL, shader gradient, glass cards, marquee)
- Auth: login, signup with Supabase
- Threads-style social feed: posts, likes, value votes, tags
- Post creation: type chips (Story, Tip, Question, Highlight)
- Post detail page with threaded comments
- Search page with popular health topics
- Journal: log supplements/medicines/drugs, AI identification via Gemini Flash
- Profile page: stats, posts tab, journal tab
- Bottom navigation (4 tabs)

### Session 2 — 1 June 2026
- Real pixel bee logo (transparent bg extracted with Pillow)
- Threads-accurate feed redesign (center logo, create prompt, follow+ badge)
- Strict 5-color brand system across ALL pages
- Hamburger menu on profile → Logout only
- Share button → branded bottom sheet card + native share / copy link
- Dynamic OG image cards (`/api/og`) for every post
- Site OG card (bee centered) + favicon = bee.png
- Smart post images: natural ratio, max 1:1, portrait → capped square
- Text line-clamp: 3 lines when image present, 6 without
- Photo upload in post composer (Supabase Storage, 8MB)
- Umami analytics added to root layout
- Goals & Insights page (`/goals`):
  - Insight strip: streak, weekly count, goals on track, top supplement
  - Supplement tracker card (from journal_entries)
  - Calories tracker card (log food, set daily target, progress bar)
  - Custom goal cards: water, sleep, exercise, weight, custom
  - Create Goal bottom sheet → type picker → config → saves to DB
  - Log sheet per goal with progress bar
- Goals link inside Profile → Journal tab
- OTP signup: 8-digit code, auto-verify on last digit, resend, back to form
- Forgot password page + Reset password page
- Gmail SMTP configured (permanent, no rate limit)
- Public profile pages: `/profile/[username]`
  - Avatar, display name, @username, bio
  - Follower/following/post counts
  - Follow / Unfollow button
  - Posts list
- Follow system: `follows` table, RLS, instant UI update
- Clickable names + `+` badges in feed → user profiles
- Clickable author name in post detail

---

## Key Decisions (don't undo these)
1. No emojis — SVG icons only
2. Space Grotesk only — no Inter
3. 5 colors strict — yellow top, green bottom
4. Error messages in green, not red
5. Post pages public (`/post/*`) — OG scrapers need unauthenticated access
6. OG image uses base64 — edge runtime can't self-fetch public assets
7. OTP is 8 digits (Supabase default, not 6)
8. `npx --yes vercel deploy --prod` for manual deploys (just `npx vercel` fails in this env)

---

## Environment Variables (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=<get from Supabase → Settings → API>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from Supabase → Settings → API>
NEXT_PUBLIC_POSTHOG_KEY=phc_pnLuYMGWkCWHS9SiwWbYDRdT2bnUbCP6SKfD3NAGKYni
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
GEMINI_API_KEY=<get from Google AI Studio>
```

---

## GitHub
- Repo: https://github.com/varsansri/HanuBees
- Never paste tokens in chat — GitHub secret scanning revokes them instantly
- Auth: `gh auth login` → device flow

---

## All Git Commits
```
52789c4  fix: use trigger for profile creation, pass username in metadata
3f20ef1  feat: post detail page with comments, search page with tag filters
32af312  feat: add profile page with stats, posts, sign out
5965dd5  feat: switch journal AI identification to Gemini Flash
22d0748  fix: add error handling to journal log entry
fe2d0b8  feat: move journal inside profile as tab, clean up bottom nav
6eb1a51  redesign: Threads-inspired UI — clean feed, SVG nav icons, thread lines
35acbcb  design: Space Grotesk font + brand colors
1051b36  feat: add SVG logo to feed header and auth pages
d462c1d  feat: replace SVG with real Hanubees logo PNG
e51354d  redesign: Threads-accurate feed — center logo, create prompt, follow+ avatar
cbabf92  feat: bee-only logo, transparent bg, bigger in header
b20c7ef  design: strict 5-color brand system — yellow top, green bottom
31b580a  design: apply 5-color brand system across all pages
0ff0d74  design: tabs, tags, links, post button — all green
9b2f5ab  fix: remove duplicate color property in search page
acbe8d1  feat: hamburger menu on profile with logout only
3509cb8  feat: share button — Web Share API with clipboard fallback
0da325b  feat: share sheet with post preview card
ee46e7f  feat: dynamic OG image cards for post links shared externally
4010432  feat: smart image sizing (max 1:1), line-clamped text
5dd7015  fix: OG card — real bee logo top-right, bolder closer text
03ebaee  fix: fetch bee.png as base64 data URL for OG image on edge runtime
bc2fa79  fix: absolute OG image URL so Threads/X can fetch it
58a7b93  feat: add Umami analytics tracking
7e5a55a  feat: bee favicon + site OG card with big logo
7a6ebd0  feat: photo upload while posting — image picker, preview, Supabase Storage
9f4717e  fix: image limit 8MB
632f938  feat: Goals & Insights page — streak, supplement tracker, calories, custom goals
6d806b1  fix: add Insights section label on goals page
9738569  fix: add Goals & Insights link inside Profile journal tab
467f286  feat: OTP signup verification + forgot/reset password flow
f9d4698  fix: 8-digit OTP boxes to match Supabase token length
45cea33  feat: public profile pages + follow system
ca3440b  docs: update CLAUDE.md — OTP, forgot password, follow system, public profiles
```

---

## Other Projects by varsansri
- fxabsolute.com — forex backtester (https://github.com/varsansri/fxabsolute)
- https://github.com/varsansri/biyatrix — AI social platform
- https://github.com/varsansri/builtix — mobile AI terminal
- https://github.com/varsansri/monitor — AI visual monitoring
- https://github.com/varsansri/memoryai — MemoryAI
