# Hanubees — Consumer Hub + Page-Aware Bee Copilot (spec)

> Captured 2026-06-07 from founder voice notes. Source of truth for this feature set.
> GTM context: not a virality business — **useful + free**, won one business at a time, in
> person. Pitch to a shop owner: "people call you just to *ask things*; your site doesn't
> rank, Instagram won't surface you, WhatsApp isn't discoverable. We give you a **free AI
> agent** that answers 24/7 from your own info, pushes your offers to followers, and is
> **found by what customers actually ask** (location + specific needs)."

## Decisions locked
- **Consumer identity = anonymous on-device** (localStorage + anon id). Zero friction, no signup. (Optional login later.)
- **Build the full hub first** (Chats + Explore), then wire the share/QR deep-link.

---

## 1. The Bee = one page-aware brain (not a mic button)
The floating bee travels every page and **sees what the user sees** (current page context is
injected into its prompt). It's role-aware (customer vs logged-in owner) and acts based on the
page it's on. Same bee, same brain, everywhere.

## 2. Customer experience — the messaging hub (anonymous)
- App opens to a **WhatsApp/Instagram-DM style hub**: a list of business agents you've chatted
  with (business name + last message). Tap → reopen that conversation; business name on top.
- Two buttons: **Chats** (your agent conversations) and **Explore** (ask the concierge to
  discover businesses by location / specific need).
- **Opening an agent shows an intro card + guided questions** (like a chatbot onboarding):
  "Welcome to [X] — we do Y." then asks "Where are you from? What are you looking for? Budget?
  Anything specific?" — and **answers from the owner's stored info** when available.
- **Follow** an agent → its offers appear in the customer's feed.
- Persistence is **on-device** (chats list, messages, follows in localStorage).

### 2.1 Default = autonomous conversion
When the owner doesn't step in, the agent **runs the whole conversation on its own and works
to convert the potential customer** — greet, answer from stored info, qualify (location /
need / budget), surface the right offer, and nudge toward the action (book / visit / call /
get directions). The owner's drag-to-pin involvement (§5) is **optional** — the agent is the
always-on salesperson by default.

## 3. Share / QR deep-link
- Every business has a shareable **link + QR** (`/c/<slug>`). Scanning/clicking lands the
  person **directly in that agent's chat** (business name on top) and adds it to their Chats.

## 4. Owner experience — edit-by-voice from the message area
- When the owner is **logged into their business** and viewing the message area, they can
  **modify what customers see** by talking to the bee (record): e.g. "in the intro, show this
  number instead of that" → the bee updates the stored info **instantly**.

## 5. Drag-to-pin → three-party chat (the key UI mechanic)
Conceptually three participants in a business chat: **the customer**, **the business's own
agent**, and **the Hanubees bee (us / copilot)**.
- **Bee NOT pinned:** the chat is **customer ↔ business agent** only (public, what the
  customer sees).
- **Owner drags the bee onto the type/chat area = pinned:** typing now goes to the **bee
  (private copilot)**, *not* the customer. The owner can see the customer's questions, ask the
  bee for help, or instruct changes to stored info. **These messages are visible only to the
  owner + bee — never the customer.**
- So the bee becomes a private helper layered over the live customer conversation.

## 6. Explore page behavior
- On Explore there are two parties: **customer ↔ bee**. The customer can search / gather data
  by chatting with the bee.
- The same bee also serves the **owner as a growth advisor** with page context: "what am I
  missing in my business?", "how do I rank up for this?", "should I add this?" — because it
  sees what the owner is seeing.

## 7. Unifying principle
Whichever page the bee is on, it **shares the user's current context** and behaves
accordingly. Message area, Explore, profile — same brain, page-aware.

---

## Build phases
**Phase 1 — Consumer hub (demo core, agreed first):**
chats list + Explore + agent chat with **intro card + guided questions**, anonymous local
persistence, shareable **/c/<slug> deep-link + QR**.

**Phase 2 — Page-aware bee copilot:**
inject current-page context into the bee; owner **voice-edit** of agent info from the message
area; bee as **growth advisor** on Explore/any page.

**Phase 3 — Drag-to-pin three-party chat:**
pin mechanic switching the chat target (public customer↔agent vs private owner↔bee), with the
visibility rules in §5.
