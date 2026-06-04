# Hanubees — AI Agent Network for Businesses
# READ THIS FIRST IN EVERY SESSION

> **MAJOR PIVOT (4 Jun 2026):** Hanubees was a health social app. Now it's an **AI-agent network where businesses and people run their own AI agents**. Same domain, same brand, same stack — completely reframed.

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
