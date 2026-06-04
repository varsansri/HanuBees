# Hanubees v1 — Vision Board
## What We Built, How It Connects, Timeline of Changes

---

## 🎯 What Was Built (v1 Product Map)

```
HANUBEES v1.0 PRODUCT MAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BUSINESS OWNERS
  ├─ Onboarding (name bee, teach agent)
  ├─ Chat (talk to agent, add facts naturally)
  ├─ Messages (see all customer questions, mark fulfilled)
  ├─ Dashboard (agent score, knowledge gaps, how to rank)
  └─ Profile (manage Business Info + Content)

CUSTOMERS (PUBLIC)
  ├─ Landing page (pitch: free AI receptionist)
  └─ Public agent page (chat with business agent, instant answers)

AI INFRASTRUCTURE
  ├─ Two-tier memory (LIVE FACTS + RICH CONTEXT)
  ├─ Semantic search (embed + pgvector cosine similarity)
  ├─ Multi-provider LLM (OpenAI primary, Cerebras free fallback)
  └─ Push-to-talk voice (Web Speech API + bee ball)

UX SIGNATURE FEATURE
  └─ Floating bee ball (draggable, voice-enabled, cross-page)
```

---

## 🔗 Neural Connections (How Components Wire Together)

### Connection Layer 1: User Input Paths

```
VOICE INPUT FLOW
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  BeeBall (voice)  ─────────→  BeeProvider.emit(text)         │
│  ↓                                    ↓                        │
│  Web Speech API               sessionStorage.bee_pending      │
│  ↓                                    ↓                        │
│  startListening()                 Chat.subscribe()            │
│  ↓                                    ↓                        │
│  Transcript                      /api/agent (mode=owner)      │
│                                       ↓                        │
│                                  store fact in DB              │
│                                                               │
└─────────────────────────────────────────────────────────────┘

TEXT INPUT FLOW
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  Chat input field                 Profile input              │
│  ↓                                 ↓                          │
│  onChange → setState              onChange → setState         │
│  ↓                                 ↓                          │
│  onSubmit → /api/agent             addEntry()                │
│  ↓                                 ↓                          │
│  mode=owner                    is_live_fact=true             │
│  ↓                                 ↓                          │
│  parseFactsFromText()          data_entries.insert()         │
│  ↓                                 ↓                          │
│  storeAs(fact, type)           return { stored: [...] }      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Connection Layer 2: Data Retrieval Paths

```
OWNER QUERY ("What info do I have?")
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  Profile.tsx (Content tab)                                   │
│  ├─ fetch RICH CONTEXT (all entries where is_live_fact=false) │
│  │  ↓                                                          │
│  │  data_entries WHERE account_id=X AND is_live_fact=false    │
│  │                                                             │
│  └─ fetch LIVE FACTS (all entries where is_live_fact=true)    │
│     ↓                                                           │
│     data_entries WHERE account_id=X AND is_live_fact=true     │
│                                                               │
└─────────────────────────────────────────────────────────────┘

VISITOR QUERY ("How much does it cost?")
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  PublicAgent.tsx (visitor chat)                              │
│  ├─ User types: "How much?"                                 │
│  ├─ Sends to /api/agent (mode=visitor, text="How much?")     │
│  │                                                             │
│  └─→ /api/agent retrieve() function:                         │
│      ├─ Step 1: Fetch LIVE FACTS (pricing, hours, etc)      │
│      │  ↓                                                      │
│      │  WHERE is_live_fact=true AND account_id=X             │
│      │                                                         │
│      ├─ Step 2: Embed question → search RICH CONTEXT         │
│      │  ↓                                                      │
│      │  embed("How much?") → [768 dims]                      │
│      │  ↓                                                      │
│      │  SELECT FROM data_entries                              │
│      │  ORDER BY embedding <-> question_vector               │
│      │  LIMIT 6                                                │
│      │                                                         │
│      └─ Step 3: LLM answers using both                       │
│         ↓                                                      │
│         gpt-4o-mini with LIVE + RICH context                 │
│         ↓                                                      │
│         return { answer, confidence }                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Connection Layer 3: Caching for Fast Back Button

```
INSTANT BACK-BUTTON PATTERN
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  Page Mount                                                   │
│  ├─ cache.get(KEY)                                           │
│  │  ├─ Yes: show cached data (0ms)  ✓ INSTANT                │
│  │  │         start loadFresh() in background                │
│  │  └─ No: fetch fresh data (network)                        │
│  │                                                             │
│  Fresh Data Arrives (1-2s)                                   │
│  ├─ cache.set(KEY, data)                                     │
│  └─ setState(data)  ✓ SMOOTH UPDATE                          │
│                                                               │
│  Example: /messages                                          │
│  ├─ KEY = "messages_{accountId}"                             │
│  └─ caches: { convs: [...], msgs: [...] }                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Connection Layer 4: Database & Semantic Search

```
DATA_ENTRIES TABLE (The Heart)
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│  CREATE TABLE data_entries (                                 │
│    id UUID                     ← unique identifier             │
│    account_id UUID             ← owner                         │
│    content TEXT                ← actual data                   │
│    is_live_fact BOOLEAN        ← LIVE (structured) or RICH    │
│    info_type TEXT              ← pricing|hours|...            │
│    effective_date DATE         ← when did this become true?   │
│    supersedes UUID             ← version chain (old → new)    │
│    embedding VECTOR(768)       ← semantic search               │
│    created_at TIMESTAMP                                       │
│  )                                                             │
│                                                                │
│  LIVE FACTS Query:                                            │
│  ├─ WHERE is_live_fact=true AND account_id=X                │
│  ├─ Fast lookup via data_entries_live_idx                    │
│  └─ Guaranteed fresh (always current version)                │
│                                                                │
│  RICH CONTEXT Query:                                          │
│  ├─ Embed question → [768 dims]                              │
│  ├─ WHERE embedding IS NOT NULL AND account_id=X            │
│  ├─ ORDER BY embedding <-> question_vector LIMIT 6           │
│  └─ Uses HNSW index (fast cosine similarity)                 │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### Connection Layer 5: Bee Ball to Chat to API

```
END-TO-END VOICE INPUT
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│ Step 1: User long-presses bee ball                           │
│ ├─ BeeBall.tsx: onPointerDown()                              │
│ ├─ setTimeout(startListening, HOLD_MS)                       │
│ └─ Web Speech API starts recording                            │
│                                                                │
│ Step 2: User speaks "We open 9am-6pm"                        │
│ ├─ onresult() fired with transcript                          │
│ ├─ interim display updates                                   │
│ └─ onend() fires when done                                   │
│                                                                │
│ Step 3: Deliver text                                         │
│ ├─ deliver(text) checks if on /chat                          │
│ │  ├─ Yes: emit(text) via BeeProvider                        │
│ │  │       chat.subscribe() receives it                      │
│ │  └─ No: sessionStorage.bee_pending + router.push("/chat")  │
│                                                                │
│ Step 4: Chat processes                                       │
│ ├─ Chat.tsx: useBee().subscribe(onText)                      │
│ ├─ onText("We open 9am-6pm") fired                           │
│ ├─ Sends to /api/agent (mode=owner)                          │
│ └─ Agent stores fact + returns answer                        │
│                                                                │
│ Step 5: UI feedback                                          │
│ ├─ Chat shows: "✓ Saved your hours"                          │
│ └─ Next customer gets instant LIVE FACT response             │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 📅 Timeline of Changes (Build Phase)

### Jun 04, 2026 — Major Pivot & v1 Architecture

**[BEFORE]** Hanubees was a health social app (followers, feed, posts)

**[PIVOT DECISION]** Pivoted to AI-agent network:
- Every business gets free AI receptionist
- Consumers later get agents to discover services
- Data lives at the edge (with business), not centralized

**[BUILT IN v1]**

#### Phase 1: Schema & Database (Jun 04)
- [ ] Dropped old `follows` table
- [ ] Created new tables:
  - `accounts` (bee identity, type, category, location)
  - `data_entries` (LIVE FACTS + RICH CONTEXT)
  - `conversations` (customer threads)
  - `messages` (Q&A + orders)
  - `follows` (social layer for v2)
- [ ] Added HNSW index for pgvector semantic search
- [ ] Added columns to `data_entries`:
  - `is_live_fact` (bool) — distinguishes LIVE vs RICH
  - `info_type` (enum) — pricing, hours, services, contact, policy, about, portfolio, faq, offer
  - `effective_date` (date) — when this became true
  - `supersedes` (uuid) — versioning chain
- [ ] RLS policies (public read, auth write)

#### Phase 2: AI & Performance (Jun 04)
- [x] `lib/ai/llm.ts` — OpenAI + Cerebras fallback
  - Primary: `gpt-4o-mini` (cheap + fast)
  - Fallback: Cerebras free `gpt-oss-120b` (if OpenAI out of credits)
  - Retry logic for rate limits
- [x] `lib/ai/embed.ts` — OpenAI + Google embeddings
  - Primary: `text-embedding-3-small` (768 dims, cheap)
  - Fallback: Google `text-embedding-004` (free)
  - Used for RICH CONTEXT semantic search
- [x] `lib/cache/usePageCache.ts` — In-memory cache (30s TTL)
  - Solves "back button feels slow" (force-dynamic issue)
  - Shows cached data instantly (0ms), refreshes in background
  - Pattern: Instagram-style UX on web

#### Phase 3: Components (Jun 04)
- [x] `components/bee/BeeBall.tsx` — Signature UX
  - Draggable, animated bee icon (floating AssistiveTouch style)
  - Two modes: hero (centered, 116px when empty) → mini (58px, parked right when chatting)
  - Push-to-talk voice (Web Speech API)
  - Text removed per user request (only bee visible)
  - Position persists on page
- [x] `components/bee/BeeProvider.tsx` — Cross-page communication
  - `emit(text)` sends voice/quick input to listening chat
  - `subscribe(fn)` lets chat receive from bee
  - `sessionStorage.bee_pending` for cross-page delivery

#### Phase 4: Pages (Jun 04)
- [x] **Protected routes** (middleware guards `/chat`, `/messages`, `/profile`, `/dashboard`)
- [x] `app/[slug]/page.tsx` + `app/[slug]/PublicAgent.tsx`
  - Public business page: `/rosa.bee` or `/[slug]`
  - Visitor chats with agent, gets instant answers from LIVE + RICH
  - Stores conversation in `messages` (owner sees inbox)
- [x] `app/(app)/chat/page.tsx` — Owner's main hub
  - ChatGPT-style chat with agent
  - Bee ball centered when empty, listens to voice
  - Types naturally: "We charge $500" → AI parses → stores as LIVE FACT
  - Real-time feedback: "✓ Saved your pricing"
- [x] `app/(app)/messages/page.tsx` — Instagram-style DM inbox
  - Instant back-button via caching
  - Important + orders pinned at top
  - Conversation threads below (visitor name, last message, unread dot)
  - Toggle `fulfilled` on orders
- [x] `app/(app)/profile/page.tsx` — Two-tier memory editor
  - Tab 1: **Business Info** (LIVE FACTS)
    - Sections: pricing, hours, services, contact, policy
    - Structured input (type into section, auto-tags)
    - Versioning: updates archive old entries
  - Tab 2: **Content** (RICH CONTEXT)
    - Free text: about, portfolio, FAQ, offers
    - Semantic search for retrieval
  - View public page link
- [x] `app/(app)/dashboard/page.tsx` — Agent insights
  - Score, rankings, knowledge gaps
  - Placeholder in v1 (full logic in v2)
- [x] `app/(app)/onboarding/page.tsx` — First-run setup
  - Step 1: Type (business or person)
  - Step 2: Basics (name, category if biz, city)
  - Step 3: Name your bee (AI naming)
  - Step 4: Seed agent (scrape website or manual)
- [x] `components/ui/BottomNav.tsx` — Navigation
  - 3 tabs: Chat, Messages, Profile (removed feed/search/post)
  - Yellow accent on active

#### Phase 5: API Brain (Jun 04)
- [x] `app/api/agent/route.ts` — Core agent logic
  - `POST /api/agent` with `mode=owner|visitor`
  - **Owner mode:** Chat to add/update facts
    - parseFactsFromText() extracts structured data
    - storeAs() saves with versioning
    - Returns answer confirmation
  - **Visitor mode:** Customer asks questions
    - retrieve() fetches LIVE FACTS + semantic search RICH
    - LLM answers with confidence
    - Stores in `messages` for owner inbox
  - Fallback chain: OpenAI → Cerebras → error
- [x] `app/api/scrape/route.ts` — Onboarding helper
  - Fetch URL or paste text → AI extracts facts
  - Auto-tags as pricing/hours/etc
  - Stores as LIVE FACTS
- [x] `app/api/embed/route.ts` — Backfill embeddings
  - Background job to embed missing data_entries
  - Called periodically to keep RICH CONTEXT searchable

#### Phase 6: Landing & Auth (Jun 04)
- [x] `components/Landing.tsx` — Reframed pitch
  - "Give your business its own AI receptionist"
  - Three feature cards
  - CTA: "Start free"
- [x] `middleware.ts` — Auth guards
  - Public: /, /login, /signup, /[slug], /api
  - Protected: /chat, /messages, /profile, /dashboard, /onboarding
  - Redirects unauth to /login

#### Phase 7: Documentation (Jun 05)
- [x] **CLAUDE.md** — Complete v1 architecture documentation
  - Vision, how it works, product, architecture, code walkthrough
  - Database schema, AI stack, performance patterns
  - Deploy instructions, brand guidelines
- [x] **claudevision.md** — Personal navigation & connections
  - System overview with ASCII diagrams
  - Component connections (auth, dashboard, public)
  - Brain explanation (/api/agent)
  - Two-tier memory breakdown
  - Common task lookup table
- [x] **VISION_BOARD.md** — What was built, neural connections, timeline
  - This file (you are reading it)

#### Phase 8: Deployment (Jun 04)
- [x] GitHub commit: `be35b8e` (full v1 code)
- [x] Vercel deployment: https://hanubees.com (live)
- [x] Phone backup: `/sdcard/Documents/Hanubees/`

---

## 🧠 Neural Connection Map (Visual Architecture)

```
COMPONENT INFLUENCE GRAPH
(arrows show data/state flow)

                    ┌──────────────┐
                    │  BeeBall.tsx │
                    │  (voice UI)  │
                    └───────┬──────┘
                            │ emit(text)
                            ▼
                    ┌──────────────┐
                    │BeeProvider.  │
                    │  tsx (ctx)   │
                    └───────┬──────┘
                            │ subscribe()
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
          ┌─────┐      ┌───────┐    ┌──────────┐
          │Chat │      │Messages   │   Profile │
          └──┬──┘      └───┬──────┘    └────┬────┘
             │             │               │
             └─────────────┼───────────────┘
                           │
                   ┌───────▼────────┐
                   │ /api/agent/    │
                   │ route.ts       │
                   │ (BRAIN)        │
                   └───────┬────────┘
                           │
                  ┌────────┼────────┐
                  ▼        ▼        ▼
            ┌────────┐ ┌──────┐ ┌─────────┐
            │  LLM   │ │EMBED │ │RETRIEVE │
            │(OpenAI)│ │(OAI) │ │(PGVEC)  │
            └────┬───┘ └──┬───┘ └────┬────┘
                 │        │          │
                 └────────┼──────────┘
                          ▼
                   ┌─────────────────┐
                   │ data_entries    │
                   │ (Supabase DB)   │
                   │                 │
                   ├─ LIVE FACTS     │
                   │ (structured)    │
                   │                 │
                   └─ RICH CONTEXT   │
                     (semantic)      │
                   └─────────────────┘

KEY INSIGHTS:
─────────────────────────────────────────────
• BeeBall is the input nerve ending
• BeeProvider is the signal relay
• /api/agent is the brain
• data_entries is the memory
• Cache keeps UX fast (invisible to diagram)

CONNECTION STRENGTH:
─────────────────────────────────────────────
█████ Critical (must work):    BeeBall → BeeProvider → /api/agent
███░░ Important:              Cache ← → Pages
██░░░ Enhancement:            Dashboard (partially wired v1)
```

---

## 🔄 Feedback Loops (Engagement Mechanics)

```
OWNER RETENTION LOOP
┌─────────────────────────────────────────┐
│ 1. Owner adds "pricing"                 │
│    → Stored in LIVE FACTS               │
│                                          │
│ 2. Customer asks "How much?"            │
│    → Instant answer from LIVE FACTS     │
│                                          │
│ 3. Owner sees in Messages inbox         │
│    → Engagement: "My agent is working!" │
│                                          │
│ 4. Dashboard shows score + gaps         │
│    → "Add more facts to rank higher"    │
│                                          │
│ 5. Owner adds more (hours, services)    │
│    → Loop repeats                       │
│    → Agent gets better                  │
│    → More customers ask                 │
│    → More fulfillment                   │
│                                          │
└─────────────────────────────────────────┘

CUSTOMER DELIGHT LOOP
┌─────────────────────────────────────────┐
│ 1. Customer lands on /rosa.bee          │
│    → Sees friendly bee ball             │
│                                          │
│ 2. Types "When are you open?"           │
│    → Instant answer (no wait, no call)  │
│                                          │
│ 3. Instant answer → Delight             │
│    → Comes back next time                │
│    → Tells friends (word of mouth)      │
│                                          │
└─────────────────────────────────────────┘
```

---

## 📊 Code Statistics

| Category | Count |
|----------|-------|
| **Pages** | 8 (onboarding, chat, messages, profile, dashboard, public, landing, auth) |
| **Components** | 10+ (BeeBall, BeeProvider, BottomNav, Landing, PublicAgent, etc.) |
| **API Routes** | 3 (agent, scrape, embed) |
| **Database Tables** | 5 (accounts, data_entries, conversations, messages, follows) |
| **Library Modules** | 5 (ai/llm, ai/embed, cache/usePageCache, supabase/*, auth/*) |
| **Total Lines of Code** | ~3000 (app + lib + components + API) |

---

## 🎬 What's Next? (v2 Roadmap, Not Built Yet)

```
v2 FEATURES (Foundation Laid, Not Wired)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. AGENT-TO-AGENT NETWORK
   Consumer gets agent → agent queries business agents
   Example: "Find photographers in Sydney"
            Your agent asks 10 business agents
            Collects/compares answers
            Returns summary

2. VERIFIED REVIEWS
   Platform issues order IDs after brokered transaction
   Only reviewable if order ID matches
   Anti-fake-review system

3. DISCOVERY
   Browse agents by location + category
   Follow agents (rel: followers)
   See trending agents (dashboard insights)

4. ANALYTICS
   Owner sees: What do customers ask?
   Agent score: depth, answer rate, reviews, profile %
   Knowledge gaps: "Customers asked 5x about X but you never answer"

5. SCHEDULED DELIVERY
   Customer opts in: "Tell me when X changes"
   Agent pushes updates at user's timezone
   Example: "New promotion added"

6. INTEGRATIONS
   Webhook API: business pushes updates directly
   Slack bot: receive orders in Slack
   Google Calendar: sync hours automatically

7. MOBILE APP
   PWA upgrade (install to home screen)
   Or native iOS/Android (future)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ✅ Deployment Checklist (v1 Launch)

- [x] Code pushed to GitHub: `varsansri/HanuBees`
- [x] Deployed to Vercel: https://hanubees.com
- [x] Supabase schema deployed (tables + RLS + indexes)
- [x] OpenAI key configured (prepaid balance)
- [x] Bee ball working (drag + voice)
- [x] Chat → agent → storage working
- [x] Messages inbox loading + caching
- [x] Profile (LIVE FACTS + RICH CONTEXT) editable
- [x] Public page (@bee.name) public + agent responding
- [x] Onboarding (4 steps) functional
- [x] Documentation complete (CLAUDE.md + claudevision.md + VISION_BOARD.md)
- [x] Phone backup stored
- [ ] Beta testing (gather feedback on UX)
- [ ] Polish based on feedback
- [ ] Soft launch (invite 10-20 businesses)

---

## 🏁 Summary: What Makes Hanubees Different

| Aspect | Hanubees | Competitors (ChatGPT, typical chatbots) |
|--------|----------|------------------------------------------|
| **Data ownership** | Business owns their data | Centralized, 3rd party owns it |
| **Freshness** | Always current (LIVE FACTS + versioning) | Stale training data |
| **Cost** | Free for business, $5/platform | Subscription per seat |
| **Fallback** | Free (Cerebras) if prepaid expires | Hard stop |
| **UX** | Floating bee ball, push-to-talk, native feel | Generic chatbot |
| **Multi-business** | Network effect (v2) | Single bot |
| **Retention** | Owner checks Messages (engagement loop) | One-off query |

> **The insight:** AI should be distributed, not centralized. Every business deserves an agent that knows their exact facts, speaks their language, and improves with use.

