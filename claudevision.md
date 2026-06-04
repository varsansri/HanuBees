# Hanubees v1 — Personal Navigation & Architecture Map
# For quick mental navigation when working on the project

---

## System Overview (The Big Picture)

```
┌─────────────────────────────────────────────────────────────────┐
│                     HANUBEES ARCHITECTURE v1                     │
└─────────────────────────────────────────────────────────────────┘

                           ┌──────────────┐
                           │   Landing    │ (public pitch)
                           └──────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
            ┌──────▼──────┐             ┌──────▼──────┐
            │  Login/Signup│             │  Public Page │
            │ (OTP via GM) │             │ /@bee.name   │
            └──────┬──────┘             └──────┬──────┘
                   │                           │
                   │ (authenticated)           │ (visitor)
                   │                           │
            ┌──────▼──────────────┐    ┌──────▼──────────────┐
            │  APP SHELL           │    │  PUBLIC AGENT CHAT   │
            │ (BeeProvider+Ball+Nav)   │  (PublicAgent.tsx)    │
            └──────┬───────────────┘    └─────────────────────┘
                   │                           │
         ┌─────────┼─────────┬────────┐        │
         │         │         │        │        │
    ┌────▼──┐ ┌───▼──┐ ┌───▼──┐ ┌──▼───┐   │
    │ Chat  │ │Msgs  │ │Prof  │ │Dash  │   │
    │/chat  │ │/msgs │ │/prof │ │/dash │   │
    └────┬──┘ └───┬──┘ └───┬──┘ └──┬───┘   │
         │        │        │       │       │
         └────────┼────────┼───────┘       │
                  │        │               │
              ┌───▼────────▼───┐           │
              │  /api/agent    │ ◄─────────┘
              │ (brain)        │
              └───┬───────┬────┘
                  │       │
         ┌────────▼─┐ ┌──▼─────────┐
         │LIVE FACTS│ │RICH CONTEXT│
         │(typed)   │ │(embedded)   │
         └──────────┘ └─────────────┘
                  │
         ┌────────▼──────────┐
         │  data_entries     │
         │ (Supabase)        │
         └───────────────────┘
```

---

## Key Component Connections

### 1. **Authentication & App Shell**
- `middleware.ts`: Guards routes, redirects unauth to `/login`
- `app/page.tsx`: Root page → determines logged-in vs. anon
- `app/(app)/layout.tsx`: Wraps app with `<BeeProvider>` + `<BeeBall>` + `<BottomNav>`
  - **Why here?** All app pages (chat, messages, profile, dashboard) need bee ball access
  - **BeeProvider role**: Exposes `emit(text)` + `subscribe(fn)` for cross-component voice delivery

### 2. **Owner Dashboard (Protected Pages)**
**All use caching pattern: show cached → refresh in background**

#### `/chat` — Main hub
- `app/(app)/chat/page.tsx` — Chat with agent to add/update business info
- Calls `/api/agent` with `mode="owner"` 
- Listens to bee ball via `useBee().subscribe()`
- **Stores what?** User types "We open 9am" → AI parses → stores as LIVE or RICH
- **Flow:**
  1. Owner types or uses voice (bee ball)
  2. Sent to `/api/agent` with `mode="owner"` + text
  3. Agent extracts facts (e.g., "hours: 9am-5pm")
  4. Stores in `data_entries` with `is_live_fact=true, info_type="hours"`

#### `/messages` — DM inbox
- `app/(app)/messages/page.tsx` — See all customer interactions (Instagram-style)
- Uses cache system for instant back-button (key: `messages_${accountId}`)
- **Data flow:**
  1. Page loads: `load(true)` checks cache
  2. If cache hit: show immediately, then `loadFresh()` in background
  3. Fresh data updates UI smoothly
- Shows important + orders pinned at top, conversation threads below
- **Editing messages:** toggleFulfilled() updates `messages.fulfilled` directly

#### `/profile` — Two-tier memory editor
- `app/(app)/profile/page.tsx` — Bee identity + Business Info + Content
- **Two tabs:**
  - **Business Info** (LIVE FACTS): pricing, hours, services, contact, policy
    - User types structured entry → auto-saves with `is_live_fact=true, info_type="pricing"` etc.
  - **Content** (RICH CONTEXT): about, portfolio, FAQ, offers
    - Free text → AI auto-tags → stores with embedding
- **Versioning:** If update existing LIVE FACT, old one gets `supersedes: [id]`

#### `/dashboard` — Rankings & insights (stub)
- `app/(app)/dashboard/page.tsx` — Agent score, gaps, how to improve
- **Future:** Show knowledge depth %, answer rate, what customers ask but can't answer
- Currently just a placeholder linking to insights

### 3. **Public Pages (No Auth)**

#### `/[bee-name].bee` or `/@username`
- `app/[slug]/page.tsx` — Server component, renders public agent page
- Finds account by `bee_name` or slug
- **Child:** `app/[slug]/PublicAgent.tsx` (client) — chat interface
- Visitor chats → calls `/api/agent` with `mode="visitor"`
- Agent responds from LIVE + RICH context

#### `/` — Landing
- `components/Landing.tsx` — Pitch: "Get a free AI receptionist"
- Shows three features, CTA to login/signup

---

## Brain: `/api/agent/route.ts`

**The most important file.** Powers both owner + visitor modes.

```
POST /api/agent
{
  mode: "owner" | "visitor",
  text: string,
  conversation_id?: string
}

If mode="owner":
  → Parse text for business facts
  → Store in data_entries (sets is_live_fact, info_type, effective_date)
  → Return: { answer, stored: [...] }

If mode="visitor":
  → Retrieve LIVE FACTS for question type
  → Embed question → search RICH CONTEXT via cosine similarity
  → LLM answers using both
  → Store message in conversations/messages
  → Return: { answer, confidence }
```

**Key functions:**
- `retrieve(accountId, question)` — Fetch LIVE + semantic search RICH
- `parseFactsFromText(text)` — AI extracts structured data
- `storeAs(fact, type)` — Saves to DB with versioning

**Fallback chain:** OpenAI (gpt-4o-mini) → Cerebras (free) → error

---

## Two-Tier Memory System

### LIVE FACTS (Structured)
**Where?** `data_entries` table with `is_live_fact=true`

| Column | Purpose |
|--------|---------|
| `content` | "Full-day wedding: $500, 50% deposit" |
| `info_type` | pricing, hours, services, contact, policy |
| `effective_date` | 2026-06-04 (when this became true) |
| `supersedes` | UUID of previous version (for archiving) |

**Retrieval:** Fetch all LIVE where `is_live_fact=true AND info_type=[matching type]`

### RICH CONTEXT (Free Text, Semantic)
**Where?** `data_entries` table with `is_live_fact=false`

| Column | Purpose |
|--------|---------|
| `content` | "15 years of experience, featured in Vogue" |
| `tag` | about, portfolio, faq, offer |
| `embedding` | 768-dim vector (OpenAI text-embedding-3-small) |

**Retrieval:** Embed question → cosine similarity search in pgvector → top 6 results

---

## AI Stack (Cost-Conscious)

### Chat Completion
- **Primary:** `gpt-4o-mini` ($0.15 in / $0.60 out per 1M tokens)
- **Fallback:** Cerebras free `gpt-oss-120b`
- **Prepaid model:** $5 OpenAI credits = ~10k+ conversations

Located in: `lib/ai/llm.ts`
- `callLLM(messages, provider?, model?)` — unified interface
- Auto-retries on rate-limit
- Falls back to Cerebras if OpenAI exhausted

### Embeddings
- **Primary:** `text-embedding-3-small` (768 dims, $0.02 per 1M tokens)
- **Fallback:** Google `text-embedding-004` (free)

Located in: `lib/ai/embed.ts`
- `embed(text)` → returns 768-dim vector
- Used for RICH CONTEXT semantic search in pgvector HNSW index

---

## Performance: Instant Back Button Pattern

Problem: Pages use `force-dynamic` (always server-fetches), so back-button feels slow.

Solution: **In-memory cache + background refresh**

```
// lib/cache/usePageCache.ts
const cache = new Map()  // global, in-memory, 30s TTL

// On mount:
const cached = cache.get(KEY)
if (cached) {
  show(cached)           // instant (0ms)
  loadFresh()            // background
} else {
  loadFresh()            // first load
}

// When fresh arrives:
cache.set(KEY, data)
setState(data)           // smooth update
```

**Pages using this:**
- `/messages` — key: `messages_${accountId}`
- Future: `/dashboard`, `/profile` for lists

---

## Flow: "Owner Adds Business Hours"

```
1. Owner in /chat types: "We open 9am-6pm Tue-Sun"

2. BeeBall.tsx listens via useBee().subscribe()
   → emit(text) sent to listening chat

3. app/(app)/chat/page.tsx receives text
   → Sends to /api/agent with mode="owner", text="We open..."

4. /api/agent/route.ts processes:
   a. parseFactsFromText() via LLM
      → extracts { type: "hours", content: "9am-6pm Tue-Sun" }
   b. storeAs() saves to data_entries:
      - is_live_fact: true
      - info_type: "hours"
      - effective_date: today
   c. Returns { answer: "Saved your hours", stored: [id] }

5. Chat updates UI: "✓ Saved your hours"

6. Next time visitor asks "When are you open?"
   /api/agent mode="visitor" retrieves LIVE FACTS:
   → WHERE is_live_fact=true AND info_type="hours"
   → Found: "9am-6pm Tue-Sun"
   → Returns answer instantly
```

---

## Flow: "Visitor Asks About Price"

```
1. Visitor on /rosa.bee (PublicAgent.tsx) types: "How much for engagement?"

2. PublicAgent calls /api/agent with:
   { mode: "visitor", text: "How much for engagement?" }

3. /api/agent/route.ts:
   a. retrieve() function:
      - Fetch LIVE FACTS: WHERE is_live_fact=true AND info_type="pricing"
        → Found: "Engagement: $300, Deposit: $150"
      - Embed question → search RICH (semantic)
        → Found examples, portfolio samples
   b. LLM answers: "We charge $300 for engagements..."
   c. Store in messages table (for owner inbox)

4. Agent returns answer to visitor
   Chat updates: Shows answer + confidence

5. Owner sees in /messages inbox:
   - Conversation thread with "engagement" question
   - Marked as `role="visitor"`
```

---

## Database Quick Guide

### Main Tables
| Table | Stores | Key Columns |
|-------|--------|------------|
| `accounts` | Bee identity | user_id, bee_name, slug, category, city |
| `data_entries` | All knowledge | account_id, content, is_live_fact, info_type, embedding |
| `conversations` | Customer threads | account_id, visitor_name, last_message_at |
| `messages` | Q&A + orders | conversation_id, role, content, is_important, is_order, fulfilled |
| `follows` | Social (v2) | follower_account_id, followed_account_id |

### Critical Indexes
```sql
-- LIVE FACTS fast lookup
CREATE INDEX data_entries_live_idx 
  ON data_entries(account_id, is_live_fact, info_type) 
  WHERE is_live_fact = true;

-- RICH CONTEXT semantic search (HNSW vector index)
CREATE INDEX data_entries_embedding_idx 
  ON data_entries USING hnsw(embedding vector_cosine_ops) 
  WHERE embedding IS NOT NULL;
```

---

## Environment Variables (What Gets Set Where)

### On Vercel (Deployment)
```
OPENAI_API_KEY=sk-...          (from openai.com, prepaid credits)
NEXT_PUBLIC_SUPABASE_URL=...   (from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Local Testing (.env.local, gitignored)
```
OPENAI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**No env secrets needed in repo** — Vercel dashboard ownsthem.

---

## Common Tasks & Where to Find Code

| Task | File |
|------|------|
| Add new info type (e.g., "warranty") | `app/api/agent/route.ts` — parseFactsFromText() |
| Customize bee ball drag behavior | `components/bee/BeeBall.tsx` — onPointerMove() |
| Change LIVE FACTS display | `app/(app)/profile/page.tsx` — "Business Info" tab |
| Add new customer page tab | `app/(app)/layout.tsx` — BottomNav, then create route |
| Debug caching | `lib/cache/usePageCache.ts` — cache.get/set logging |
| Change AI model | `lib/ai/llm.ts` — OPENAI_MODEL constant |
| Adjust search relevance | `app/api/agent/route.ts` — retrieve() function |
| Update brand colors | `globals.css` or inline `const YELLOW = "#ffbe00"` |

---

## Handy Constants

```js
// Colors (matched everywhere)
YELLOW = "#ffbe00"    // top accents, buttons
GREEN  = "#98aa9d"    // bottom accents, nav, tags, errors
FG     = "#eaeaea"    // primary text
MUTED  = "#a9a9a7"    // secondary text, placeholders
BG     = "#121212"    // background
BG2    = "#1a1a1a"    // cards
INPUT  = "#242424"    // inputs

// Bee ball
SIZE_HERO = 116       // centered, empty chat
SIZE_MINI = 58        // parked, chat active
HOLD_MS   = 380       // hold before voice starts

// Cache
CACHE_TTL = 30000     // 30 seconds
```

---

## Checklist: Before Deploying

- [ ] OPENAI_API_KEY set on Vercel (prepaid balance confirmed)
- [ ] Supabase schema.sql run (tables + RLS + indexes)
- [ ] Brand colors consistent (no red, no emojis)
- [ ] Bee ball responds to voice + drag on desktop/mobile
- [ ] Messages cache shows old data, then updates fresh
- [ ] Profile save works (LIVE FACTS + RICH CONTEXT)
- [ ] Public page (@rosa.bee) loads + agent answers
- [ ] Onboarding completes + bee_name assigned

---

## Future Wiring (v2)

- **Agent-to-agent network:** Consumer agents query business agents
- **Reviews + order-ids:** Verified trust signals
- **Follow/discovery:** Find agents by location + category
- **Analytics:** What do customers ask? How does agent score?
- **Webhooks:** Business can send updates via API
- **Mobile app:** Standalone iOS/Android (or PWA upgrade)

All foundation laid in v1; just missing UI + backend logic.
