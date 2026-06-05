# Hanubees — Agent Skill Catalog (SPEC)
> The differentiator: agents don't just answer, they **do tasks for each other —
> asynchronously, overnight, inside our ecosystem.** This doc specs every skill
> before we build. Status: DESIGN (nothing here is built yet).

---

## 0. First principles

1. **Structured protocol, not chatter.** Agents talk to each other as `skill(params)`
   calls returning typed results — never long free-form English. This is what keeps
   it cheap and reliable. Natural language exists only at the **human edges**.
2. **Async by default.** A task is left for the other agent and answered when its
   side is "available." Neither human is online at the same time → it runs overnight.
3. **Consent before capability.** A skill only runs if the target's owner/customer
   enabled it and within the limits they set (price floors, shareable fields, who can reach me).
4. **Cost discipline.** Instant skills = DB only (free). Watchers = scheduled checks,
   LLM=0 unless something matches. Async = at most one cheap LLM call per human edge,
   batched overnight, with fan-out caps.

### Handles
- Display: `@<bee_name>.B` (e.g. `@aromacaterin.B`) — purple, tappable.
- Profile URL: `/<bee_name>.bee`.

### Common skill envelope
```
SkillCall {
  id            uuid
  skill         string            // e.g. "getShippingEstimate"
  from_agent    account_id        // requester
  to_agent      account_id | null // null = broadcast to a query (category/area)
  target_query  { category?, city?, niche? } | null
  params        json
  status        queued | running | answered | declined | expired
  result        json | null
  priority      int               // for ordering in the inbox
  color         string | null     // resolved from user rules
  folder        primary | general | spam
  created_at, expires_at
}
```

---

## A. INSTANT SKILLS — read the target's stored data (DB-only, no human, ~free)

| Skill | Params | Returns | Consent gate |
|---|---|---|---|
| `getPrice` | item? | pricing fact(s) | public LIVE FACT |
| `getHours` | — | hours | public |
| `getServices` | — | services list | public |
| `getLocation` | — | area/address | public |
| `getOffers` | activeOnly | current offers/specials | public |
| `getMenuToday` | — | today's special (effective_date = today) | public |
| `getPolicy` | topic | returns/cancellation/etc | public |
| `getContact` | channel: phone\|email\|whatsapp | the value | **per-channel shareable flag** |
| `getShippingEstimate` | toLocation | eta/cost if a shipping table exists; else auto-escalates to `askCustom` | public |
| `checkAvailability` | date\|slot | yes/no if calendar data exists; else escalates | public |

- **Output shape:** `{ found: bool, value, source: "@handle.B" }`.
- **Cost:** 1 DB read. No LLM. These are answerable instantly even at 3am.
- **Escalation:** if the data isn't on file, an instant skill can convert itself into an
  async `askCustom` task automatically (and tell the requester "asked them, will notify you").

---

## B. ASYNC TASKS — need the target's owner/AI to decide (queued, overnight)

| Skill | Params | Returns | Notes |
|---|---|---|---|
| `askCustom` | question | text answer | the free-form catch-all; 1 LLM to parse/draft |
| `requestQuote` | item, qty, constraints{budget, deadline, location} | {price, eta, terms, accepted?} | structured negotiation seed |
| `negotiate` | offerTerms | accept \| counter \| decline | bounded rounds; owner sets auto-accept thresholds |
| `requestBooking` | slot, details | tentative \| confirmed \| declined | owner confirms unless auto-rules allow |
| `bulkInquiry` | category, question, maxTargets | list of {@handle, answer} | concierge-as-task: "ask all caterers if they do vegan, notify who says yes" — **fan-out capped** |

**Lifecycle:** `queued → (overnight cron delivers) → responder auto-answers within limits OR
flags for owner → answered → result lands in requester's notifications.`

**Consent / safety (owner-set):**
- Auto-answer **instant facts**: on/off.
- Tasks: auto-answer within limits, or always require approval.
- Commitment limits: min price, max discount %, blackout dates → agent can't agree beyond these.
- Reachability: who may send me tasks — anyone / verified only / prior customers only.

**Cost:** ≤1 LLM call at requester (parse), ≤1 at responder (draft/auto-answer),
≤1 to summarize back. Batched overnight. `bulkInquiry` reuses one structured question
across N targets (no per-target LLM).

---

## C. WATCHERS — standing rules, scheduled, LLM=0 unless matched (the "while you sleep" engine)

| Skill | Params | Fires when |
|---|---|---|
| `watchOffers` | category?, business?, discountAtLeast, priceUnder | a new matching offer is posted |
| `watchPriceDrop` | item\|business, under: X | price falls below X |
| `watchMenuItem` | business, item | today's special contains item |
| `watchOpening` | business | they open / hours change / reopen |
| `watchAvailability` | business, slot | a slot frees up |
| `watchNewBusiness` | category, area | a new agent joins that niche |
| `watchKeyword` | query | any business posts data matching the query |

- **Definition:** `{ owner, condition (json), frequency, color, folder, expires_at, active }`.
- **Engine:** a Vercel Cron endpoint runs all active watchers on a schedule, dedupes,
  and emits notifications. No LLM on the no-match path. Optional 1 cheap call (or a
  template) to phrase the alert text.
- **Example (your laptop case):** `watchOffers(category: electronics, discountAtLeast: 20)`
  → on match → notification, **color = red**, folder = Primary.

---

## D. CUSTOMER-TO-CUSTOMER — route requests to other customers' agents (opt-in)

| Skill | Params | Returns | Consent |
|---|---|---|---|
| `askExperience` | niche/product, question | opinions from real buyers | buyers opt-in to be reachable; identity hidden until both agree |
| `requestReview` | orderId | a verified review | only valid after a real platform-brokered interaction (order-id) |
| `findBuyers` | niche | list of reachable customer agents | opt-in directory only |
| `shareRecommendation` | toAgent, business | delivered rec | — |

- This is the part nobody else can do: buyers learning from **buyers**, not just sellers.
- **Anti-harassment:** per-niche caps, cooldowns, hide identity, easy opt-out.
- **Reviews stay trustworthy:** `requestReview` ties to your platform-issued order-id —
  no real interaction, no review.

---

## E. NOTIFICATION AREA (upgrade of Messages)

- **Tasks strip (top):** outstanding `SkillCall`s you initiated + live status + results.
- **Folders:** `Primary · General · Spam` (email-style).
- **Color rules (user-defined):** `rule(condition) → {color, folder, priority}`.
  e.g. *offer < 20% → red*; *@aura.B → blue*; *unknown sender → Spam*.
- Reachable from **Messages** and the **chat** area.
- Every skill result / watcher hit becomes a notification carrying `{source: @handle.B, body, color, folder}`.

### Spam control
- Rate limits per sender; bulk/unknown/off-topic → Spam.
- Typed skills make junk easy to drop (not a valid skill call = rejected).
- Trust gating: verified + prior-interaction → Primary; strangers → General/Spam.

---

## F. CONSENT & SAFETY LAYER (per account)

Stored on each account; every skill checks it before running:
- `shareable_fields`: which contact channels an agent may hand out (email/phone/whatsapp).
- `auto_answer`: instant facts auto? tasks auto-within-limits or manual?
- `commitment_limits`: min price, max discount %, blackout dates.
- `reachability`: anyone / verified / prior-customers.
- `c2c_optin`: reachable as a customer? for which niches?
- `rate_limits`: max inbound tasks/day per sender.

### LOCKED DEFAULTS (decided 2026-06-05)
- **Autonomy = "facts auto, deals need approval":** instant skills (A) auto-answer 24/7;
  any async task that commits something (`requestQuote` accept, `negotiate`, `requestBooking`)
  is drafted but **held in the owner's inbox for a tap**. (Auto-within-limits stays available
  as an opt-in once `commitment_limits` UI exists.)
- **Reachability = "verified + prior customers":** their tasks reach **Primary**; unknown
  senders land in **General/Spam** and are rate-limited. Owner can widen or narrow later.

---

## G. DATA MODEL ADDITIONS (when we build)
- `agent_tasks` — the SkillCall envelope above.
- `watchers` — standing rules.
- `notifications` — account, source, body, color, folder, read.
- `skill_support` — which skills each account advertises (a business may not do booking).
- `consent` columns/table — section F.
- **Cron endpoint** — the overnight engine: processes queued tasks + runs watchers.

---

## H. SKILL REGISTRY (extensibility)
Every skill is declared once: `{ name, kind, params_schema, result_schema, consent_keys, cost_tag }`.
Agents advertise supported skills (`skill_support`). Adding a capability = adding a registry
entry + a handler. The chat/concierge LLM's only job is to map a human request →
the right skill call, and to phrase the result.

---

## I. BUILD ORDER (proposed)
1. **Phase 1 — Watchers + Notification area** (timing/offers; mostly no-LLM). Highest wow, lowest risk.
2. **Phase 2 — Async tasks** (`askCustom`, `requestQuote`) + overnight cron + consent limits.
3. **Phase 3 — Customer-to-customer + verified reviews**, richer registry, spam tuning.

Cross-cutting from day one: the **consent layer** (F) and the **skill envelope** (0), so
nothing is built without permission rules and a consistent protocol.
