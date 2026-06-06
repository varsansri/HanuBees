# Hanubees — AI Agent Network for Businesses
# READ THIS FIRST IN EVERY SESSION

> **MAJOR PIVOT (4 Jun 2026):** Hanubees was a health social app. Now it's an **AI-agent network where businesses and people run their own AI agents**. Same domain, same brand, same stack — completely reframed.

---

## 🔖 SESSION CONTINUATION — read this first (updated 2026-06-05)

**Companion docs (read for full picture):** `VISION.md` (full vision + investor lens), `SKILLS.md` (agent-skill catalog + locked consent defaults), `GTM.md` (marketing + sales playbook), `VISION_BOARD.md`, `claudevision.md`, **`hanubees-marketing-team/`** (all marketing: social auto-poster, brand assets, SEO docs, credentials inventory — start at its README).

---

### 📣 MARKETING UPDATE (2026-06-06) — see `hanubees-marketing-team/docs/PROGRESS-2026-06-06.md`
- **Social marketing now lives in `hanubees-marketing-team/`** (moved brand assets + social scripts there; data-ingest + `db.js` stay in `scripts/`). Run scripts from project root: `node hanubees-marketing-team/scripts/story-carousel.js auto`.
- **5-slide data-viz STORY carousels** (`story-carousel.js`): cover→big-stat+donut→bars→flowchart→CTA. Brand font Space Grotesk, bee on every slide. **All numbers built live from the DB — never fabricated.** `auto` mode auto-picks the next un-posted **AU/US** city (TARGETS list), logs to new `story_log` table.
- **Posted:** Los Angeles story → Instagram + TikTok ✓. **Next:** Melbourne. TikTok confirmed to support photo-mode carousels (≤90-char caption via `caption_tt`).
- **Daily cron** (10:23) wakes the session to post the next city (session-only, expires 7 days; no system cron here).
- **Open:** (1) ingest more AU/US cities to grow post volume; (2) port renderer to a **Vercel cron API route** (bundle font + add `sharp`) for true 24/7; (3) **set `NEXT_PUBLIC_GOOGLE_VERIFICATION`** (GSC token) — #1 SEO blocker.

**Infra facts**
- Live: https://hanubees.com · Supabase project `whfxrovgvulmhqkhumuz` (url https://whfxrovgvulmhqkhumuz.supabase.co) · **RLS is ON**.
- Deploys auto from `git push origin main`. To `next build` locally, export the **public** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (they're public) — `vercel env pull` returns them empty because LLM/embedding keys are **Sensitive** (work only in prod). So anything needing LLM/embeddings (e.g. embedding backfill) must run in prod.
- SQL editor: https://supabase.com/dashboard/project/whfxrovgvulmhqkhumuz/sql/new

**Migrations already RUN in Supabase (verified live):**
- `migration-upgrade.sql` PART A + A.2 (added `embedding`/`supersedes`/`source` to data_entries, `match_data_entries` RPC, HNSW index, + accounts cols location/logo_url/rating/review_count/follower_count/instagram/email/verified) + PART B (RLS re-enabled).
- `phase1-watchers.sql` (watchers + notifications + 6 demo offers).
- `phase-listings.sql` (listings table + 5 new-vertical demo providers + 10 listings).
- NOT run: embedding backfill (`/api/backfill-embeddings`) — semantic search uses a recent-entries fallback; fine for demo.

**Shipped & live today (all verified on prod):**
- **Concierge in `/chat`** (owner mode): injects a catalog of all city businesses **+ listings** into the LLM; budget search, list, compare, recommend, drill-down, and **clarify-then-match** (asks 1–2 Qs, returns only real matches or "none, closest is…").
- **Purple `@handle.B` links** for every business mention (→ `/<bee_name>.bee`); Twitter-card: user's own `@handle.B` above their messages. (`PURPLE=#b794f6`.)
- **Watchers + Notification area** (`/notifications`, 🔔 nav): rules (keyword/category/min-discount/price-under) + color; folders Primary/General/Spam; engine `lib/watchers/engine.ts` runs on open/refresh (overnight cron = later).
- **Structured Listings** (`listings` table, one account→many): verticals services/secondhand/realestate/rental/transport/b2b/product. `/listings` manager + **voice-list** (`/api/listings/draft` — speak/type → LLM structures → saves). Concierge + public agent surface them.
- **Floating bee**: pinch-to-zoom (0.6–2.5×, persisted) + drag-to-edge minimize (peeking nub, tap to restore). Voice/tap/drag unchanged.
- **Agent-to-agent network** runs in-process (`lib/ai/agent-network.ts`): `/api/agents/search`, `/api/agents/query`, `/api/consumer-agent`, `/discover`.

**Data in DB:** 50 Coimbatore wedding-vertical demo businesses + 5 new-vertical providers (`cbehomes, anandused, priyatuition, easyrentals, skrtransport`) + 10 listings + 6 demo offers. **All demo (fake `user_id`s), not claimable.**

**Scope LOCKED:** information+connection verticals only — **NO maps/tracking/delivery/cab/food** (speed-based). Only **1 of 4 skill kinds built** (Watchers). Monetization direction: flat **subscription, 0% commission**, family/IP, business↔customer mode (forming, not locked — see VISION.md risks).

**Parked / NOT done:** real self-serve onboarding+claim of seeded businesses (`/api/create-account-enriched` returns 501 — needs real auth, anon auth not enabled); overnight cron; reviews/ratings; consent/safety layer + spam filtering; async tasks (Phase 2: askCustom/requestQuote/negotiate); customer-to-customer; escalation relay; embedding backfill; structured per-vertical attribute filtering.

**▶ NEXT STEP (agreed with founder):** build the **Call-Onboarding tool** — a page/voice box where the founder, on a phone call with a business, enters/speaks their details and it instantly creates the account + agent + listings and returns the shareable `@handle.B` link to WhatsApp. (This is the GTM unlock; self-serve claim stays parked.) After that: async tasks (Phase 2).

**Guardrails reaffirmed:** never paste secrets/tokens in chat; declined robocall/number-spoofing GTM (illegal — ACMA/TRAI); marketing stays truthful (no fake news, no reposting strangers' Snapmap footage). Legal GTM = manual founder calls (see GTM.md).

---

## The Vision

Every business has valuable information (prices, hours, services, policies). Every person wants answers fast without calling/waiting. Today that's broken: search → visit sites → call → wait.

**Hanubees solves this:** each business gets an **AI receptionist** (v1) that lives on the web, answers instantly from their own data, and keeps itself fresh. Later (v2), consumers get agents to discover and compare businesses.

The insight: **data lives at the edge (with the business), not centralized**. Your data, your agent, always current. No stale databases, no 3rd-party data hoarding.

---

## How It Works (v1 Receptionist)

```
Owner: "We charge $500 for weddings, open Tue-Sun"
→ Types into chat or onboarding

System:
→ Stores in "Business Info" (LIVE FACTS: versioned, always current)
→ Embeds for semantic search
→ Autotags (pricing, hours, etc.)

Customer: visits hanubees.com/rosa.bee
→ Asks "How much for engagement?"

AI:
→ Fetches LIVE pricing ($300 for engagements)
→ Searches RICH context for examples
→ Answers instantly with confidence

Owner: sees order in Messages inbox
→ Marks as fulfilled
→ Dashboard shows ranking insights
```

---

## Core Product (v1)

### Onboarding flow
1. **Type**: Business or Person?
2. **Basics**: name, category (if biz), city
3. **Name your bee**: "Rosa" → becomes @rosa.bee everywhere
4. **Teach agent**: paste website or describe business (AI extracts facts)

### Owner dashboard
- **Chat** (`/chat`) — talk to your agent to add/update info
  - Type naturally: "We're open 9am-6pm Tue-Sun, closed Mondays"
  - AI stores it as LIVE FACTS (LIVE FACTS type=hours, RICH CONTEXT if contextual)
- **Messages** (`/messages`) — Instagram-DM inbox
  - Pinned: Important customer questions + Orders
  - Below: per-agent conversation threads (what customers asked, how agent replied)
  - Retention mechanism: owners check frequently to see how agent performs
- **Dashboard** (`/dashboard`) — agent score, rankings, gaps to fix
  - Score: knowledge depth (35%) + answer rate (30%) + reviews (20%) + profile complete (15%)
  - Shows: what customers are asking about but agent can't answer (knowledge gaps)
  - How to rank: add more facts, get reviews, complete profile
- **Profile** (`/profile`) — two sections:
  - **Business Info** (LIVE FACTS): pricing, hours, services, contact, policy — structured, versioned, always current
  - **Content** (RICH CONTEXT): about, portfolio, FAQ, offers — free text, searchable by meaning
  - View public page link: hanubees.com/@[bee-name].bee

### Customer (public page)
- Visit `hanubees.com/@rosa.bee` or `hanubees.com/[business-slug]`
- Chat with the agent: "How much?" "When are you open?" "Do you travel?"
- AI answers from owner's LIVE FACTS + RICH CONTEXT, instantly
- No wait, no call, no browsing 5 tabs

---

## Architecture

### Pages (protected by middleware)
| Route | Type | Purpose |
|---|---|---|
| `/` | public | Landing (pitch: free AI receptionist) |
| `/login` `/signup` | public | OTP auth (8-digit, via Gmail) |
| `/onboarding` | protected | Create account + name bee + seed agent |
| `/chat` | protected | Owner talks to agent; AI stores facts |
| `/messages` | protected | DM inbox; owner sees customer interactions |
| `/messages/[id]` | protected | One conversation thread |
| `/dashboard` | protected | Agent score, gaps, how to rank |
| `/profile` | protected | Bee identity, Business Info, Content, edit/logout |
| `/[bee-name].bee` | public | Customer-facing agent chat page |
| `/@[username]` | public | Human profile (future) |

### API routes
| Route | Method | Purpose |
|---|---|---|
| `/api/agent` | POST | Agent brain: `mode:owner\|visitor`, returns answer + stores facts |
| `/api/scrape` | POST | Onboarding: scrape website/text → AI extracts facts |
| `/api/embed` | POST | Backfill: embed any facts without embeddings yet |
| `/api/og` | GET | OG card (legacy, barely used) |

### Database (Supabase PostgreSQL)
```sql
-- Accounts: one per business/person
accounts(id, user_id, type, name, slug, bee_name, category, city, bio, 
         logo_url, phone, email, website, instagram, rating, review_count, 
         follower_count, verified, created_at)

-- Knowledge: LIVE FACTS (structured) + RICH CONTEXT (free text)
data_entries(id, account_id, content, source, tag, visibility, embedding,
             is_live_fact, info_type, effective_date, supersedes, created_at)
             
-- Customer interactions
conversations(id, account_id, visitor_name, visitor_id, channel, last_message_at)
messages(id, conversation_id, role, content, is_important, is_order, 
         fulfilled, read, created_at)

-- Social
follows(id, follower_account_id, followed_account_id, created_at)
```

### Two-tier memory

**LIVE FACTS** (structured, versioned, always current):
- Types: pricing, hours, services, contact, policy
- Stored with `effective_date` — when it became true
- If you update pricing, old one gets `supersedes: [id]` and is archived
- Agent fetches LIVE first (guarantees freshness)
- Example:
  ```
  content: "Full-day wedding: $500, deposit 50%"
  type: pricing
  effective_date: 2026-06-04
  ```

**RICH CONTEXT** (free text, semantic-searchable):
- Types: about, portfolio, faq, offer
- Stored with `embedding` (768-dim vector via OpenAI)
- Semantic search: "candid photos" finds "natural moments" even though words differ
- Agent uses for depth/examples after fetching LIVE
- Example:
  ```
  content: "15 years experience, featured in Vogue Australia"
  type: about
  embedding: [0.02, ..., 0.18]  (768 values)
  ```

**Retrieval flow:**
1. Agent fetches LIVE FACTS for the question type
2. Embeds the question → searches RICH CONTEXT via cosine similarity
3. Returns: LIVE facts + top 6 RICH matches
4. AI answers using both

---

## AI Stack

### Chat/receptionist brain
- **Primary:** OpenAI `gpt-4o-mini` (via OPENAI_API_KEY)
  - Cost: ~$0.15 in / $0.60 out per 1M tokens
  - Speed: fast enough for instant replies
  - Quality: good enough for info-only tasks
- **Fallback:** Cerebras free `gpt-oss-120b`
  - Rate-limited but free
  - Gives you time to buy more OpenAI credits if needed

### Embeddings
- **Primary:** OpenAI `text-embedding-3-small` (same OPENAI_API_KEY)
  - 768 dimensions
  - Cost: ~$0.02 per 1M tokens
  - Searchable in pgvector (HNSW index, cosine similarity)
- **Fallback:** Google `text-embedding-004` (free tier via GEMINI_API_KEY)

### Prepaid model
- Buy **$5 credits once** on openai.com
- Usage draws down; when $0, API pauses until you top up
- Never auto-charges (you disable auto-recharge)
- $5 = ~10,000+ conversations at current scale

---

## The Floating Bee Ball

Signature UX: draggable animated bee icon that's always on screen.

**Behavior:**
- **Empty chat** (hero mode): centered, big (116px), animated float
- **Chat started** (mini mode): slides to mid-right, small (58px)
- **Draggable:** user can move it anywhere; position persists on that page
- **Tap:** goes to /chat (or focuses if already there)
- **Long-press:** push-to-talk (Web Speech API) → text delivered to chat
- **Voice fallback:** if browser doesn't support Web Speech, shows `window.prompt()`

Tech: `components/bee/BeeBall.tsx` + `components/bee/BeeProvider.tsx`
- Provider exposes `emit(text)` so ball can push text to listening chat
- Ball subscribes; cross-page text via `sessionStorage.bee_pending`
- Animations: float, pulse on voice, shrink/grow on mode change

---

## Performance: Back Button Feels Like Instagram

**The problem:** pages use `force-dynamic` (always fresh), so back button re-fetches (feels slow).

**The solution:** instant cache + background refresh
1. When page loads, check in-memory cache first
   - If cache hit: show cached version instantly (0ms)
   - Start fresh fetch in background
2. When fresh data arrives, update UI smoothly
3. Back button is instant (user sees old data), then updates to fresh (1-2s)

**Tech:** `lib/cache/usePageCache.ts` — in-memory Map with 30s TTL
- Pages fetch from cache on mount, update when fresh arrives
- No network waterfalls, no loading spinners

---

## Database Setup (First Time)

Run this once in Supabase SQL editor:
```sql
-- Run supabase/schema.sql
-- All tables (accounts, data_entries, conversations, messages, follows) + RLS
-- Then run these for two-tier memory:
alter table data_entries add column if not exists is_live_fact boolean default false;
alter table data_entries add column if not exists info_type text;
alter table data_entries add column if not exists effective_date date;
alter table data_entries add column if not exists supersedes uuid references data_entries(id);
create index if not exists data_entries_live_idx on data_entries(account_id, is_live_fact, info_type) where is_live_fact = true;
```

---

## Environment Variables (Vercel)

**Sensitive (Vercel dashboard → Settings → Environment Variables):**
- `OPENAI_API_KEY` — from openai.com, prepaid credits
- `GEMINI_API_KEY` — (backup embeddings, optional)
- `CEREBRAS_API_KEY` — (free fallback, optional)
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase

**For local testing:**
Add to `.env.local` (gitignored):
```
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Deploy

```bash
cd /root/hanubees
npm run dev          # Local: http://localhost:3000
npx vercel deploy    # Preview
npx vercel deploy --prod  # Production → hanubees.com
```

Live: **https://hanubees.com**

---

## Brand (strict)

| Element | Value |
|---|---|
| Font | Space Grotesk (300/400/500/700) everywhere |
| Yellow | #FFBE00 (top accents: headers, buttons) |
| Green | #98AA9D (bottom accents: nav, tags, links) |
| Light text | #EAEAEA (primary) |
| Muted text | #A9A9A7 (secondary, placeholders) |
| Black bg | #121212 (background) |
| Card bg | #1A1A1A (panels) |
| Input bg | #242424 (input/avatar) |
| **Rule** | No other colors. No emojis. Green for errors (not red). |
| Logo | `/public/bee.png` (706×622px, transparent, animated) |
| Favicon | bee.png |

---

## Links

- **Live:** https://hanubees.com
- **GitHub:** https://github.com/varsansri/HanuBees
- **Vercel:** https://vercel.com/varsansri88-gmailcoms-projects/hanubees
- **Supabase:** https://supabase.com/dashboard
- **Code:** /root/hanubees
- **Backup:** /sdcard/Documents/Hanubees/

---

## Key Files

| File | Purpose |
|---|---|
| `app/page.tsx` | Root redirect (logged-in → /chat, anon → /login) |
| `app/layout.tsx` | Global metadata + PostHog |
| `middleware.ts` | Auth: protects /chat, /messages, etc. |
| `app/(app)/layout.tsx` | App shell: BeeProvider + BeeBall + BottomNav |
| `app/(app)/chat/page.tsx` | Owner's main hub (chat to agent) |
| `app/(app)/messages/page.tsx` | DM inbox |
| `app/(app)/dashboard/page.tsx` | Score, gaps, rankings |
| `app/(app)/profile/page.tsx` | Two-tier memory (LIVE FACTS + RICH CONTEXT) |
| `app/[slug]/page.tsx` | Public page (server renders) |
| `app/[slug]/PublicAgent.tsx` | Customer chat (client) |
| `app/api/agent/route.ts` | Brain: owner chat + visitor chat |
| `app/api/scrape/route.ts` | Onboarding fact extraction |
| `components/bee/BeeBall.tsx` | Draggable bee + voice |
| `components/bee/BeeProvider.tsx` | Context for bee ↔ chat communication |
| `lib/ai/llm.ts` | OpenAI + Cerebras fallback |
| `lib/ai/embed.ts` | OpenAI embeddings + Google fallback |
| `lib/cache/usePageCache.ts` | Instant-back in-memory cache |
| `supabase/schema.sql` | All tables + RLS |
| `globals.css` | Brand colors + typography |

---

## Known Limitations (v1)

- **Bees can't talk to each other yet** (v2 feature — agent-to-agent network)
- **Reviews not wired** (trust system designed, not implemented)
- **No spam protection** (will add rate limits before scaling)
- **Mobile app:** PWA only (no native iOS/Android)
- **Offline:** not supported (live always needs network)

---

## Next Steps (v2+)

1. **Agent-to-agent network** — consumer agents discover + query business agents
2. **Reviews + order-id codes** — verified, platform-issued trust signals
3. **Follow/discovery** — find agents by location + category
4. **Scheduled delivery** — answers delivered at user's timezone preference
5. **Analytics per agent** — see what customers ask, how often agent converts
