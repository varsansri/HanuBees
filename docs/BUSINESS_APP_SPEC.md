# Two-App Split — Customer app + Business app (PLAN, not built)

> Founder direction (2026-06-08). **Planning only — do not execute yet.** Build slowly, never break the live customer app.

## Why split
Owners and customers should NOT share one UI. Owners feel uneasy sitting in the consumer interface, and they need a focused **management console** to run their AI. So:

- **Customer app** = the existing app, *stripped of owner features*. Discovery + chatting with business agents + contributing local info.
- **Business app** = NEW. The owner's console to set up and run their AI — think **"cPanel / WordPress, but for your AI business presence"** (NOT a website builder).

The mental model: today's WhatsApp/business button-bots show an intro + canned button answers — dumb, prebuilt, no real intelligence. Hanubees Business replaces that with a **real, owner-configurable AI agent** — no developer needed.

## URLs (shared backend, two frontends)
- **Customer:** `hanubees.com` — `/hub`, `/c/[slug]` (chat a business's agent), `/[slug].bee` (public agent), contribute (Share), map, discovery.
- **Business:** new subdomain, e.g. **`biz.hanubees.com`** (founder phrasing: "hanubeesbiz.bee"). Owner login + console.
- **One Supabase backend** powers both. Business app **writes** (owner configures); customer app **reads/reflects** it. This is already the data model → minimal backend change.

## Auth & separation
- Owners authenticate in the **business app**. Customers stay **anonymous** in the customer app. → clean separation, solves the "uneasy" problem (owners never see the consumer UI).

## What MOVES OUT of the customer app → into the business app
Today's owner-only routes: `/chat`, `/messages`, `/dashboard`, `/profile`, `/onboarding`, `/listings`, `/notifications`, `/onboard` (founder call-onboarding).
**Stays in the customer app (untouched):** `/hub`, `/c/[slug]`, `/[slug]` public agent, map, contribute/Share.

## Business app — pages / navigation
Founder's list + proposed additions:

1. **Dashboard & Insights** (home) — agent score, **demand** (what customers ask most), reach/views/conversions, knowledge gaps to fix, profile completeness. Doubles as the at-a-glance home.
2. **Train** (the founder's "Experiment" page — THE CORE) — split view:
   - **Left = edit:** the owner *talks to / voice-records* their AI, uploads images, sets prices/hours/email/FAQs. The AI asks follow-up questions and structures it (reuse `/api/scrape` + `/api/agent` owner mode).
   - **Right = live preview:** the *actual* customer-facing agent chat, updating in real time as they edit — so they see exactly what a customer will experience.
   - Set: greeting/intro, hero image(s), persona/tone, key facts. **Drag-and-drop = future** (deliberately deferred — would invite endless customization demands now).
3. **Conversations** (inbox) — see live agent↔customer chats; **intervene** mid-conversation (owner jumps in, agent hands off); flagged orders + important questions. *(The "intervene" piece is net-new — Phase 2 of the copilot vision.)*
4. **Catalog** — manage listings (products / services / properties / rentals…), incl. voice-list.
5. **Profile & Settings** — identity (`@handle.bee`, logo, contact, hours, location), the **public link + QR code** to share, account + billing/subscription.

Secondary / inside pages: **Notifications & Watchers** · **Reviews & Trust** · **Skills / Automation** (what the agent can do — the 4 skill kinds) · **Team** (multiple staff managing one agent) · **Onboarding / Claim**.

## The Train/Experiment page (detailed — the heart of the business app)
- **Goal:** an owner with zero tech skill makes their AI useful in minutes by *speaking*.
- Flow: owner speaks/types/uploads → AI extracts + structures facts → **right-side preview** (the real visitor-mode agent) updates instantly.
- Reuses the existing brain: `/api/scrape` (extract), `/api/agent` owner mode (store), visitor mode (preview).
- "Better than a button-bot" because it's a *real* editable AI, no dev, always answers.

## Migration approach (keep the live app working the whole time)
- **Phase 0:** stand up a new Next.js app (separate Vercel project) on `biz.` subdomain, pointing at the **same Supabase** env. Empty shell + owner auth.
- **Phase 1:** build **Dashboard + Train + Profile** in the biz app, *copying/reusing* logic from the current app (don't rip the customer app yet).
- **Phase 2:** Conversations (+ intervene) + Catalog + Notifications.
- **Phase 3:** once the biz app is solid, **remove owner routes from the customer app** and redirect owners → `biz.hanubees.com`.
- Customer app stays fully functional throughout; nothing customer-facing changes.

## Decisions to make later (not now)
- Exact biz URL/subdomain (`biz.` vs `app.` vs separate domain).
- **Repo shape:** separate repo/Vercel project (simplest, fastest) vs **Turborepo monorepo** (two apps + shared `ui`/`supabase`/`agent` packages — cleaner long-term, bigger upfront refactor). *Recommendation: start as a separate app sharing the DB; move to monorepo only if shared code grows.*
- Shared auth vs separate auth context.
- Where `/api/agent` (the brain) lives — shared API both apps call, vs duplicated.

## Guardrail
Do NOT modify the existing customer app's core while building the business app. The business app is the focus; the customer app only ever *reads* the data the business app produces.
