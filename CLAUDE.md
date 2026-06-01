# Hanubees.com — Full Project Memory

## Owner
- **Name:** varsansri
- **Email:** varsansri88@gmail.com
- **GitHub:** https://github.com/varsansri
- **Device:** Android mobile (Termux/PRoot Linux / PRoot-Distro Ubuntu)

---

## Project: Hanubees.com
- **Live site:** https://hanubees.com
- **GitHub repo:** https://github.com/varsansri/HanuBees
- **Vercel project:** https://vercel.com/varsansri88-gmailcoms-projects/hanubees
- **Domain registrar:** Cloudflare (DNS configured via Vercel)
- **Supabase project:** Health social app backend (auth, DB, storage)
- **Analytics 1:** PostHog — key: phc_pnLuYMGWkCWHS9SiwWbYDRdT2bnUbCP6SKfD3NAGKYni, host: https://us.i.posthog.com
- **Analytics 2:** Umami — website-id: f8958711-c907-4cac-89f7-34e55c9f065c, src: https://cloud.umami.is/script.js

---

## What This App Is
**Hanubees** is a health social platform — Twitter/Threads-style feed where users share health journeys, log supplements/medicines, track goals, and support each other. Target: people dealing with chronic conditions, supplements, wellness.

---

## Tech Stack
- **Framework:** Next.js 16.2.6 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 + inline styles (no CSS modules)
- **Font:** Space Grotesk (300, 400, 500, 700) — loaded via Google Fonts
- **Backend:** Supabase (Auth, Postgres DB, Storage)
- **3D/Landing:** react-three-fiber + @react-three/drei + @shadergradient/react
- **Analytics:** PostHog + Umami
- **Deployment:** Vercel (auto-deploy on push to main)
- **Node:** 20.x

---

## Brand / Design System

### Colors (STRICT — only these 5 exist in the app)
| Variable | Hex | Usage |
|---|---|---|
| `--yellow` / `--amber` | `#FFBE00` | Top-half accents: header borders, active tabs, Post buttons, vote-up, logo glow |
| `--green` | `#98AA9D` | Bottom-half accents: nav active icons, tags, links, liked hearts, progress bars |
| `--fg` | `#EAEAEA` | Primary text |
| `--fg2` | `#A9A9A7` | Secondary text, timestamps, placeholders |
| `--bg` | `#121212` | Background |
| `--bg2` | `#1A1A1A` | Card backgrounds |
| `--bg3` | `#242424` | Input backgrounds, avatars |

### Color Rules
- **Yellow always on top half:** sticky headers, active tab underlines, "Post" button text, logo drop-shadow, type chips when active, vote-up active, section titles
- **Green always on bottom half:** bottom nav active icons, all #hashtags, all links/CTAs, liked heart, reply button, progress bars, goal cards
- **No other colors** — no red, blue, purple anywhere

### Font
- Space Grotesk everywhere — no Inter or other fonts
- Weights used: 400 (body), 500 (medium), 600 (semi), 700 (bold)

### Logo
- **File:** `/public/bee.png` — pixel/isometric bee, transparent background, 706×622px
- **File:** `/public/logo.png` — original with white background + wordmark (kept for reference)
- Bee used in: feed header (48px), login/signup (140px wide), OG images, favicon

---

## File Structure

```
/root/hanubees/
├── app/
│   ├── globals.css              — CSS vars, Space Grotesk import, all utility classes
│   ├── layout.tsx               — Root layout: metadata, OG tags, favicon, Umami script
│   ├── page.tsx                 — Landing page (3D/WebGL, ShaderGradient, glass cards)
│   ├── icon.png                 — Favicon (copy of bee.png)
│   ├── apple-icon.png           — Apple touch icon (copy of bee.png)
│   ├── (auth)/
│   │   ├── login/page.tsx       — Login page
│   │   └── signup/page.tsx      — Signup page
│   ├── (app)/
│   │   ├── layout.tsx           — App layout with BottomNav
│   │   ├── feed/page.tsx        — Main feed (server component)
│   │   ├── search/page.tsx      — Search with popular tags
│   │   ├── journal/page.tsx     — Supplement/medicine logger with AI identify
│   │   ├── goals/page.tsx       — Goals & Insights dashboard
│   │   ├── profile/page.tsx     — User profile + posts + journal tab
│   │   └── post/
│   │       ├── new/page.tsx     — Create post with image upload
│   │       └── [id]/
│   │           ├── page.tsx     — Post page (generateMetadata with OG)
│   │           └── PostDetail.tsx — Post detail + comments (client)
│   └── api/
│       ├── identify/            — AI supplement identification (Gemini Flash)
│       └── og/route.tsx         — Dynamic OG image generation (edge runtime)
├── components/
│   ├── feed/PostCard.tsx        — Post card with share sheet
│   ├── ui/BottomNav.tsx         — Bottom navigation (4 tabs)
│   ├── ClientOnly.tsx           — SSR-false wrapper for WebGL
│   ├── ShaderBackground.tsx     — Animated WebGL gradient
│   ├── Scene3D.tsx              — 3D icosahedron + particles
│   ├── LiquidGlassCard.tsx      — SVG turbulence glass cards
│   ├── Features.tsx, Marquee.tsx, Nav.tsx, Logo.tsx, HexGrid.tsx
│   └── PostHogProvider.tsx
├── lib/
│   └── supabase/
│       ├── client.ts            — Browser Supabase client
│       ├── server.ts            — Server Supabase client
│       └── middleware.ts        — Auth middleware (public: /, /post/*, /api/*)
├── middleware.ts                — Applies session update to all routes
├── public/
│   ├── bee.png                  — Main logo (transparent bg, 706×622)
│   ├── logo.png                 — Original logo with wordmark
│   └── threads-ref.jpg          — UI reference screenshot
└── package.json
```

---

## Supabase Database Tables

### Existing (from Session 1)
```sql
-- Users handled by Supabase Auth
profiles (id, username, display_name, bio, avatar_url, created_at)
posts (id, user_id, content, image_url, post_type, tags[], value_up, value_down, likes, views, created_at)
comments (id, post_id, user_id, content, created_at)
journal_entries (id, user_id, name, category, raw_input, dose_amount, dose_unit, notes, dose_time)
```

### Added (Session 2 — 1 June 2026)
```sql
goals (id, user_id, title, type, target_value, unit, icon, color, created_at)
goal_logs (id, goal_id, user_id, value, notes, logged_at)
calorie_logs (id, user_id, food_name, calories, logged_at)
```

### RLS Policies
- All tables: users can only read/write their own rows (`auth.uid() = user_id`)
- `posts` + `comments`: publicly readable for OG scraping (post pages are public routes)

### Storage
- **Bucket:** `post-images` (public) — stores post images
- Path format: `{user_id}/{timestamp}.{ext}`
- Max file size: 8MB
- Allowed types: `image/*`
- Policies: authenticated INSERT, public SELECT

---

## Features Built

### Session 1 (31 May 2026)
- Landing page with 3D/WebGL effects
- Auth (login/signup) with Supabase
- Feed (Threads-style): posts, likes, value votes, comments, tags
- Post creation with type chips (Story, Tip, Question, Highlight)
- Post detail page with comments/replies
- Search page with popular health topics
- Journal: log supplements/medicines/drugs with AI identification (Gemini Flash)
- Profile page: stats, posts tab, journal tab, sign out
- Bottom navigation (Feed, Search, New Post, Profile)

### Session 2 (1 June 2026)
1. **Real logo** — bee.png copied from phone, transparent bg extracted via Pillow Python
2. **Threads-style feed redesign** — center logo, "What's your health journey today?" prompt, follow+ avatar badge, action row
3. **5-color brand system** — applied to ALL pages, strict yellow/green split
4. **Hamburger menu on Profile** — only Logout inside
5. **Share button** — opens bottom sheet with branded post preview card; "Copy link" + native share
6. **OG image cards** — `/api/og?id=` generates 1200×630 branded card; bee logo fetched as base64 for edge runtime
7. **Site OG** — hanubees.com link shares full bee-centered card; favicon set to bee.png
8. **Smart post images** — natural aspect ratio on load, capped at 1:1 max (portrait → square); text line-clamped (3 lines with image, 6 without)
9. **Photo upload** — camera icon in new post composer; Supabase Storage `post-images` bucket; 8MB limit
10. **Umami analytics** — script added to root layout
11. **Goals & Insights page** (`/goals`)
12. **OTP signup** — 8-digit code sent via email, verify boxes UI, resend option
13. **Forgot password** — `/forgot-password` + `/reset-password` pages, Gmail SMTP configured
14. **Public profile pages** — `/profile/[username]`, clickable names in feed/post detail
15. **Follow system** — Follow/Unfollow button, follower/following counts, `follows` table — at `/goals`, linked from Journal via "Goals" button
    - Insights strip: day streak, week supplement count, goals on track, top supplement
    - Default supplement tracker card (pulls from journal_entries)
    - Default calories tracker card (log food, set daily goal, progress bar)
    - Custom goal cards (water, sleep, exercise, weight, custom) with daily log + progress
    - "Create Goal" dashed card → bottom sheet picker → config screen
    - Log sheet for each goal
    - All green progress bars, yellow highlights

---

## Key Design Decisions & Rules

1. **No emojis anywhere** — use custom SVG icons only
2. **Space Grotesk exclusively** — no Inter, no system fonts in UI
3. **5 colors only** — #FFBE00, #98AA9D, #EAEAEA, #A9A9A7, #121212 (+ bg2 #1A1A1A, bg3 #242424 as dark variants)
4. **Yellow top / Green bottom** — strict positional color rule
5. **No comments in code** unless absolutely necessary
6. **No red for errors** — use green (#98AA9D) for error messages (keeps color system clean)
7. **Post pages are public routes** — `/post/*` and `/api/*` bypass auth middleware so OG scrapers work
8. **OG images need base64** — edge runtime can't fetch its own public assets; fetch + btoa() to data URL

---

## Middleware Public Routes
```typescript
const isPublicPage =
  pathname === "/" ||
  pathname.startsWith("/post/") ||
  pathname.startsWith("/api/");
```

---

## OG Image System
- **Site card:** `GET /api/og` (no params) → big bee centered, Hanubees wordmark, tagline
- **Post card:** `GET /api/og?id={postId}` → author, content, tags, bee top-right
- **Post metadata:** absolute URL `https://hanubees.com/api/og?id={id}` (relative URLs don't work for external scrapers)
- **Edge runtime:** bee.png fetched via fetch() + Uint8Array → btoa() → data:image/png;base64,...

---

## Bottom Navigation
| Tab | Route | Icon | Active Color |
|---|---|---|---|
| Home | /feed | House | Green |
| Search | /search | Search circle | Green |
| New Post | /post/new | Yellow pill with + | Yellow (always) |
| Profile | /profile | Person | Green |

---

## Deploy Commands
```bash
cd /root/hanubees
git add .
git commit -m "your message"
git push
npx --yes vercel deploy --prod
# Vercel auto-deploys from GitHub push in ~30s
# Manual deploy needed sometimes: npx --yes vercel deploy --prod
```

---

## Environment Variables (Vercel Production)
```
NEXT_PUBLIC_SUPABASE_URL=<supabase project url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase anon key>
NEXT_PUBLIC_POSTHOG_KEY=phc_pnLuYMGWkCWHS9SiwWbYDRdT2bnUbCP6SKfD3NAGKYni
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
GEMINI_API_KEY=<gemini key for journal AI>
```

---

## GitHub Auth
- **Never paste tokens in chat** — GitHub secret scanner revokes instantly
- Use: `gh auth login` → device flow → browser
- Repo: https://github.com/varsansri/HanuBees

---

## New DB Tables (Session 2 additions)
```sql
-- Follow system
follows (id, follower_id, following_id, created_at) — unique(follower_id, following_id)
-- RLS: manage own follows (follower_id = auth.uid()), public select
```

---

## All Git Commits (chronological)
```
52789c4  fix: use trigger for profile creation, pass username in metadata
3f20ef1  feat: post detail page with comments, search page with tag filters
32af312  feat: add profile page with stats, posts, sign out
5965dd5  feat: switch journal AI identification to Gemini Flash
22d0748  fix: add error handling to journal log entry
fe2d0b8  feat: move journal inside profile as tab, clean up bottom nav
6eb1a51  redesign: Threads-inspired UI — clean feed, SVG nav icons, thread lines, minimal post cards
35acbcb  design: Space Grotesk font + brand colors
1051b36  feat: add SVG logo to feed header and auth pages
d462c1d  feat: replace SVG with real Hanubees logo PNG
e51354d  redesign: Threads-accurate feed — center logo, create prompt, follow+ avatar, action row
cbabf92  feat: bee-only logo, transparent bg, bigger in header
b20c7ef  design: strict 5-color brand system — yellow top, green bottom
31b580a  design: apply 5-color brand system across all pages
0ff0d74  design: tabs, tags, links, post button — all green
9b2f5ab  fix: remove duplicate color property in search page
acbe8d1  feat: hamburger menu on profile with logout only
3509cb8  feat: share button — Web Share API with clipboard fallback
0da325b  feat: share sheet with post preview card
ee46e7f  feat: dynamic OG image cards for post links shared on WhatsApp/Telegram/X
4010432  feat: smart image sizing (max 1:1), line-clamped text per image presence
5dd7015  fix: OG card — real bee logo top-right, bolder closer text
03ebaee  fix: fetch bee.png as base64 data URL for OG image on edge runtime
bc2fa79  fix: absolute OG image URL so Threads/X can fetch it
58a7b93  feat: add Umami analytics tracking
7e5a55a  feat: bee favicon + site OG card with big logo for hanubees.com
7a6ebd0  feat: photo upload while posting — image picker, preview, Supabase Storage
41b4a17  fix: limit image upload to 5MB
9f4717e  fix: image limit 8MB
45cea33  feat: public profile pages + follow system
f9d4698  fix: 8-digit OTP boxes to match Supabase token length
467f286  feat: OTP signup verification + forgot/reset password flow
9738569  fix: add Goals & Insights link inside Profile journal tab
6d806b1  fix: add Insights section label on goals page
632f938  feat: Goals & Insights page — streak, supplement tracker, calories, custom goals
```

---

## Other Projects by varsansri
- https://github.com/varsansri/fxabsolute — forex backtester (fxabsolute.com)
- https://github.com/varsansri/biyatrix — AI social platform
- https://github.com/varsansri/builtix — mobile AI terminal
- https://github.com/varsansri/monitor — AI visual monitoring
- https://github.com/varsansri/memoryai — MemoryAI
