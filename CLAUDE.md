# Hanubees — AI Agent Network for Businesses
# READ THIS FIRST IN EVERY NEW SESSION

> **PIVOT (4 Jun 2026):** Hanubees was a health social app. It is now an **AI-agent
> network for businesses**. Same domain, same brand, same Next.js + Supabase stack.
> The health domain (feed/journal/goals/knowledge/posts) has been removed.

---

## The product

Every business gets its own **AI receptionist** — an agent that answers its customers
instantly from the business's own info. The business teaches the agent by chatting
(text/voice) or pasting its website; the agent keeps the info and answers visitors on a
public page `hanubees.com/[slug]`.

**v1 = single-player receptionist** (built). v2 = agent-to-agent network (a customer's
agent talks to business agents to find/compare) — not built yet.

### Locked decisions
- v1 = AI receptionist only. Network is later.
- Keep Hanubees brand + domain.
- Data ingestion = scrape public info to seed + manual edit/chat.
- Wedge = **Events** (wedding/photography/catering), one Australian metro.
- Model = **Cerebras `gpt-oss-120b`** (cheap, fast, info-only).
- Trust = verified reviews (platform issues order-id codes; no code → no review) — designed, not built.
- GTM = build free receptionist for businesses, email/DM them honestly. No fake-customer lies, no comment-spam.

---

## Resume work
```bash
cd /root/hanubees && npm run dev     # local dev
npx --yes vercel deploy --prod        # manual deploy (also auto-deploys on git push)
```

## IMPORTANT — two manual steps before it runs
1. **Run the schema:** open Supabase SQL editor and run `supabase/schema.sql` (creates
   accounts, data_entries, conversations, messages, follows + RLS). Safe to re-run.
2. **AI key locally:** `CEREBRAS_API_KEY` is a Vercel *Sensitive* var — `vercel env pull`
   returns empty, so AI won't work locally unless you add the key to `.env.local`
   yourself. It works fine in production / on Vercel previews.

---

## Architecture

### Routes
| Route | What |
|---|---|
| `/` | Marketing landing (`components/Landing.tsx`); logged-in users → `/chat` |
| `/login` `/signup` `/forgot-password` `/reset-password` | Auth (OTP, 8-digit) |
| `/onboarding` | Create account (name/category/city) → seed agent (scrape+manual) |
| `/chat` | **Owner chat home** — talk to your agent to add info / ask about orders. Floating bee ball centered when empty. |
| `/messages` | Instagram-DM inbox. Pinned Important/Orders strip. Insight icon (top-left → /dashboard), Menu icon (top-right → /profile). |
| `/messages/[id]` | A conversation thread (read-only; agent auto-replies). |
| `/dashboard` | Agent score + stats + knowledge gaps + how-to-rank-up. Reached from Messages top-left icon. |
| `/profile` | Identity, trust row, **Public/Private data manager**, edit sheet, menu (view public page / edit / logout). |
| `/[slug]` | **Public business page** — customer chats the agent. The shareable surface. |

Protected routes (middleware): `/chat /messages /dashboard /onboarding /profile /settings`.
Everything else is public (landing, `/[slug]`, api) for SEO.

### API
- `POST /api/agent` — `mode: 'owner'|'visitor'`.
  - owner: loads account + all data_entries; model returns JSON `{action:store|reply, entries[], reply}`; stores new facts via owner's RLS.
  - visitor: loads account + **public** data_entries (anon RLS); model returns `{reply, answered, isOrder}`; persists conversation+messages; unanswered/order → `is_important` (shows in owner's Important strip).
- `POST /api/scrape` — owner; fetches a URL + pasted text → Cerebras extracts facts → inserts data_entries.
- `GET /api/og` — OG card (legacy post branch unused; site card still works).
- `lib/ai/cerebras.ts` — `cerebrasChat()` + `parseJson()` helper.

### DB (see `supabase/schema.sql`)
- `accounts` — one agent per business (user_id, slug, category, city, bio, persona, contact, rating, review_count, follower_count).
- `data_entries` — the knowledge (content, tag, **visibility public|private**, source). Public = agent shares; private = context only, never revealed.
- `conversations` / `messages` — chat threads. Messages have is_important / is_order / fulfilled / read.
- `follows` — account→account (trust).
- RLS: accounts world-read; data_entries public world-read (private owner-only); conversations/messages owner-read + anon-insert for public channel (so visitor chat works without a service-role key).

### The floating Bee ball (`components/bee/`)
- `BeeBall.tsx` — `bee.png` as iPhone-AssistiveTouch ball. Centered+big (`hero`) on empty chat, parks mid-right + small (`mini`) once chatting. Draggable anywhere. **Tap** = focus/go to chat; **hold** = push-to-talk voice (Web Speech API) → text delivered to chat. Persists across all `(app)` pages.
- `BeeProvider.tsx` — context: `mode` (hero/mini) + `emit`/`subscribe` so the ball feeds text to the active chat. Chat sets mode and subscribes; cross-page voice uses `sessionStorage.bee_pending`.

---

## Brand (strict — also in `app/globals.css`)
- Font: **Space Grotesk** everywhere (300/400/500/700).
- Yellow `#FFBE00` (top accents) · Green `#98AA9D` (bottom/nav/links) · Light `#EAEAEA` text · Muted `#A9A9A7` · Black `#121212` bg · Card `#1A1A1A` · Input `#242424`.
- No other colors. Errors green not red. **No emojis — SVG icons only.**
- Logo `/public/bee.png` (706×622 transparent) = the floating ball.
- Bottom nav (3 tabs): Chat · Messages · Profile.

---

## Stack
Next.js 16.2.6 · Supabase (auth/db/storage) · Tailwind v4 · Cerebras `gpt-oss-120b` · PostHog · Vercel.
Vercel project `prj_m8rf8T5CDcRWvsZVnFGhSTWNLxI2` (team varsansri88-gmailcoms-projects).
GitHub: https://github.com/varsansri/HanuBees — **never paste tokens in chat** (secret scanner revokes).

## User
varsansri · varsansri88@gmail.com · Android/Termux · prefers fast execution, short responses, no emojis.

---

## Status / next
- **Built:** full v1 receptionist (all routes above), clean `next build`.
- **Pending before live:** run `supabase/schema.sql`; add Cerebras key for local test (or test on Vercel); end-to-end test the signup→onboarding→chat→public-page→messages loop.
- **Not built (v2+):** directory/search, agent-to-agent network, reviews/order-id codes, follow-others UI, voice fallback for non-Chrome.
