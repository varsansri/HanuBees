# Hanubees — Full Vision (founder brain-dump, captured 2026-06-05)
> Everything discussed, nothing left out. This is the raw, complete vision —
> organized but not trimmed. Companion docs: `CLAUDE.md` (how it's built),
> `SKILLS.md` (the agent-skill spec), `VISION_BOARD.md` (what's shipped).

---

## 1. One-line thesis
**Every middleman that takes a commission is really just charging for information +
coordination — and that's exactly what an AI agent can do for almost nothing.**
Turn every commission-taking intermediary into a zero-commission *skill* on a shared
network of agents. One subscription, 0% commission, the only cost is tokens.

---

## 2. The core differentiator — agent-to-agent TASKS (not just answers)
- ChatGPT, Claude, Perplexity all answer questions and "customize." Everyone is doing that.
  **The only thing nobody else has is a live network of real agents that can connect
  *directly with each other* and do tasks.**
- It's not information anymore — **it's doing tasks.** Agents collect information from
  other agents and bring back the whole answer/file.
- **Async / overnight.** Businesses don't run 24 hours. Because it's agent-to-agent, a
  request can be left for another agent and answered "whenever available" — overnight, in
  six hours, whenever. **While you sleep, your AI keeps talking to other agents**, so people
  keep getting information and things keep moving.
- Example (the shipping case): a customer wants a very specific detail — *"how long does it
  take to ship this to my location, made as fast as possible? I'll only buy from you if it's
  fast. Is that possible? Can you make it affordable? What are the constraints?"* The business
  agent takes that, asks the owner / whoever attends the AI: *"this is what someone asked us —
  can we do this?"* and the answer flows back when available. Completely agent-to-agent.
- It must **not drain our tokens** — skills should be "go to that agent, get this specific
  info, done," not endless free-form chatter. A midrange model is plenty capable.

---

## 3. What it actually is
- **A mix of Gmail + WhatsApp + phone calls — but with AI.** You contact friends through your
  AI, you connect with business AIs, and you pull customized information from them.
- **A personal assistant for everyone** AND **a receptionist for every business**, on the same
  account (switch between **business mode** and **customer mode** — one subscription is both the
  sending end and the receiving end).
- **The AI represents the human.** Each person and each business has their own agent. Instead of
  logging into Gmail every time to leave a review or answer a question, everything happens inside
  one platform, in text (plus optional images), where you can do a lot.
- You're **not building anything** (no social-media grind, no credibility/visibility game). You
  just **document your business**; the AI uses it for your personal use and as your receptionist.
  It does **not** spam or promote to other people — it simply answers questions when they come up.

---

## 4. Why now / the market
- AI is used by ~**1–2% of the world** and is **not in the hands of small businesses yet.**
- Huge investment is flowing into billion-dollar AI companies; meanwhile people are getting laid
  off — the economy is pushing everyone toward AI; adoption is **inevitable.**
- Most people (especially older people) don't use AI because they **find no use for it.** The
  moment it's **connected to their business/their daily needs**, it becomes useful and sticky.
- Like Facebook/Instagram, it's **human-driven — the people are the product.** We don't hold
  inventory. Build critical mass in **one city** and it becomes massive.

---

## 5. The adoption unlock — voice-first, no website, no effort
- The reason shops don't already sell online / keep listings updated: **they don't want to manage
  daily updates.** Many already have QR codes/scanners and *could* list products, but maintaining
  it on Zomato or a website is a burden. **Unless a receptionist does it for them consistently.**
- With us, you **just record your voice** — no typing. The AI structures your business, keeps it
  live, and **asks you questions**: what do you want to put in front, what are people in your area
  asking about, why aren't you getting enough.
- Online presence today fails small businesses: even pages of text on a webpage won't surface the
  *specific* value to a customer. Not every small business owner is a copywriter. The AI lets every
  business **present itself at its best** and **store as much info as possible**, then serves the
  exact answer a customer needs.
- Cost used to be the blocker (do it yourself, or voice-record to a WhatsApp group and have a
  company manage it — constant human work). AI has a brain, does it cheaply, small tokens.

---

## 6. Discoverability model
- Search **by term** *and* **by specialty/uniqueness** — e.g. *"within 1km, is there a shop that's
  specially known for [specific thing], and how many ratings?"* Get a **quick answer like a short
  reel / a hook.**
- **Radius-aware** — connect a query to businesses within ~**10km** (not just 1km), and return
  relevant + recommendable results.
- **Product/variety problem with e-commerce:** sites lack real variety/customization; people want
  very specific designs and details. Example: *"I don't like metal bottles — is anyone selling
  wooden bottles? Can I customize it? Which shops/sites have it?"* Because businesses store
  everything as text (+ optional images), it's easy to keep data and connect buyers to it.
- **If the answer isn't in the database**, the agent says: *"I don't have that answer — I'll reach
  my owner and get back to you in 2–3 minutes / tell you if it's possible."* (Agent-to-agent or
  agent-to-owner relay.)
- **Reviews:** people review after every interaction/project; the agent (representing the human)
  makes leaving and fetching reviews effortless and in-platform.
- Example: *"What's the best clothing shop, highly reviewed, near here?"* → ranked, recommendable.
- Example: *"I'm looking for this specific product within 1km — who has it?"* → pops up every shop
  that listed it, with their prices, so the buyer picks.

---

## 7. Skills = the moat (full spec in `SKILLS.md`)
**Everything a commission-taking middleman does is just a UI around information + a connection.
Each one becomes a skill in our app.** "Find a cab" = a skill (with tracking/updates on where
it's traveling). "Find a service" = a skill. BookMyShow = a skill (no commission; connect to the
system; ticket stored in your app; payment goes directly to the business; compare freely). The
middlemen only provide the visual representation/UI — we make it a skill on shared rails.

Four kinds of skills:
1. **Instant** — read another agent's stored data (price, hours, email, shipping estimate, today's
   menu). DB-only, no human, answerable even at 3am. *"Can you get me the email?" → it gets it.*
2. **Async tasks** — need the other side to decide; queued and answered overnight (custom questions,
   quotes, negotiation, booking, bulk inquiry across many businesses).
3. **Watchers** — standing rules, scheduled, **no LLM unless something matches** (the "while you
   sleep" engine). *"If any offer comes under 20%+ sale from any agent, notify me in red."* Watch
   opening times, menu-of-the-day, new offers, price drops.
4. **Customer-to-customer** — route requests to *other customers'* agents: *"find customers who
   bought in this niche and ask them"* for real reviews/experience, instead of asking the business.

Skills are added/triggered conversationally (chat or voice). **Today our agents have no skills —
skills are what make the difference.**

---

## 8. Business model — subscription, ZERO commission
- **Flat subscription, no commission on transactions.** The opposite of Zomato/Swiggy/Porter/
  UrbanCompany/BookMyShow, who take a cut forever.
- **One subscription covers a whole family** (~3–4 people). **Device/IP-verified** — as long as it's
  used inside their phones and the subscription covers it. The woman's needs, the man's needs, and
  the children's needs all under the same subscription.
- **One account does both sides:** a business uses a single subscription as both the **sending** and
  **receiving** end — switch **customer mode** ↔ **business mode**.
- **Payments can connect to the app** (later): when something is booked, payment goes **directly to
  the business**, the ticket/record is stored in your app, and you can compare freely. No intermediary.
- **The only thing we burn is tokens.** Everything — porting something, getting information, booking a
  call, finding a pediatrician/therapist — comes under one subscription. **All businesses under one flag.**

---

## 9. Scope / verticals (everything is "just information")
- **Retail products** — shops list products; buyers find and buy instantly, lower cost; availability
  (available / not available) kept live by the agent.
- **Services (single-person businesses are the sweet spot)** — plumbers, beauticians, pet care, etc.,
  **and individual providers like tuition teachers.** *"My name is X, I'm a tuition teacher in [area of
  Coimbatore], I teach [subjects] — suggest me when someone nearby asks."* *"Is there a pet-care person
  who can come to my home and care for my dog?"* The provider keeps status live (**agent online/offline**),
  accepts orders, says when they'll come, sets price points. Today finding a plumber means calling around
  and accepting *"I'll come in 2 days"* — we fix that, because service businesses are **all about
  information**, kept fresh by **voice**.
  - **SCOPE DECISION (2026-06-05):** this is **information + availability discovery only** —
    *no maps, no live tracking, no delivery routing.* We connect people to the right provider by
    information; we do **not** do the map/GPS/delivery layer.
- **Secondhand / peer listings (OLX-style)** — see §11.
- **Transport / logistics (Porter alternative)** — find a lorry/tempo/car/camp-booking fast, same
  quality, **no commission split** — just the subscription.
- **Tickets/booking (BookMyShow alternative)** — a skill, payment direct to the business.
- **Flexible gig / open tasks** — see §10.
- **Food/delivery** — explicitly **not the focus now** (noted as future; lots more to it).

---

## 10. Flexible work / open tasks (a later, heavier vertical)
- Delivery people want *more* kinds of jobs, not one product. Example: *"Transfer a bucket (~4–5
  litres) of this to this place, I'll pay this much — anyone want to take it?"* Whoever has the right
  vehicle/capacity and is traveling the same area can accept.
- Even normal people can pick up jobs: *"I want food for ₹100, everyone quotes more — anyone nearby
  traveling that way want to grab it and bring it for a small fee?"*
- **Not restricted by the app to one thing** — "I want to do this, can anyone help, I'll pay this
  much." Possibilities multiply. (Acknowledged: needs management + trust/safety; heavier; later.)
- **Economics of delivery today:** Amazon/Swiggy burn money on underserved one-area-to-another trips
  with few bookings per route. A single person could instead collect everything within one area. (More
  to this; not the current focus.)

---

## 11. Secondhand / OLX-style (one of the sharpest wedges)
- People know secondhand goods are viable but **never use those sites** — they don't know the process
  or how to connect, and they have turn-off questions.
- When you list, buyers want **more questions answered than you wrote**; the only way is answering
  **manually every time** → it becomes stress, not relief. *10 calls to make 1 sale.*
- With us: **record the listing once** (sit 5–10 min, talk about the product, cover everything). The
  listing shows **highlights**; any buyer question goes to **your agent**, which answers for you. You
  get far fewer calls (3–4 instead of 10), the info is logged, and **sale probability goes up.**
- Buyers who'd never try secondhand now will, because they can get **all the info from the seller's
  agent**, with **no platform restriction.**
- Example: someone sees a bike listing, has mild interest, doesn't want to call but wants to ask
  questions. Today the only options are call/comment, and those sites **charge commission just for the
  contact** — unfair, and they hide details to extract fees. With us, the agent answers the inquiry; no
  commission, no hidden details.

---

## 12. Why people switch (behavior)
- Many providers offer the **same product, same quality, better price, with live offers** — but buyers
  don't know, because they're **behaviorally addicted to one familiar app** and overpay out of habit.
- Once people get familiar with ours and we deliver quality, when a provider runs an offer the buyer can
  actually **see it and decide** based on quality/price. Choice expands.

---

## 13. Notifications, colors, folders (built — Phase 1)
- **Color-coded notification area** for quick daily scanning. Assign colors to agents / rules; e.g.
  *offer under 20% → red.* Glance and know what's important.
- **Folders like email: Primary / General / Spam** — spam is a real risk (agent-to-agent messages could
  irritate people), so it must be filtered.
- The **messaging area** shows agent communications; the **top** shows the **tasks you've assigned** and
  their status. Reachable from the **chat area** too.

---

## 14. Operations / team
- The only human layer needed is essentially **one call-center / management function** — and even that
  mostly doesn't need humans, because the AI provides the information. If more is needed, they can call
  the customer or sit inside the team to manage. **More profitable for workers and for customers**, and
  everyone stays flexible.

---

## 15. The wedge vs the vision (the discipline that wins funding)
- **Vision:** replace every commission-taking intermediary with a zero-commission skill on shared agent
  rails; one subscription; all businesses under one flag. The `SKILLS.md` architecture makes this
  technically coherent ("every new vertical is just another skill").
- **Trap:** "we replace Zomato + Swiggy + Porter + UrbanCompany + BookMyShow + OLX + gig work + payments"
  reads to an investor as **"we'll execute none of them."** Breadth = vision; **focus = plan.**
- **Recommended wedge:** one city (Coimbatore), **services-first and/or secondhand**, because the pain is
  visceral, it's pure information/coordination, and it needs **no payments, no fleet, no labor law.** The
  loop — **voice-list → discoverable → agent answers buyer questions → connection, 0% commission** — is
  already mostly built. Tell the rest as "...and every other vertical is the same rails."

---

## 16. Investor lens (India, early / first-day)
**Context:** pitching in a non-investing culture; targeting newly-wealthy people who want to become
angels/VCs — even literally approaching them in person.

**Questions they will ask:**
- Who's the customer first — business or consumer? Why now? Painkiller or vitamin?
- **How do you make money?** Cost per business in AI vs price. LTV/CAC, payback.
- **Cold-start:** how do you bootstrap a two-sided network? First 1,000 businesses? Why will a
  non-technical 55-year-old adopt it?
- **Defensibility:** why won't ChatGPT/Google/Meta do this? WhatsApp already connects SMBs — why not them?
  What's proprietary when data is semi-public?
- **Trust:** fake reviews, agent spam, bad info?
- **Traction:** how many businesses are *actually live and using it weekly?*

**The 4 to nail:**
1. **Moat vs labs:** "They build the brain; we build the network + consented, structured, live local data
   + the agent-to-agent protocol + verified reviews tied to real orders. We're the rails, not the model."
2. **Cold-start:** each business agent is useful **single-player** (free 24/7 receptionist) before any
   consumer exists — exactly the 50 seeded Coimbatore agents.
3. **Monetization + willingness to pay:** "free/cheap receptionist, pay for premium skills / priority /
   household subscription." Have a number.
4. **Demo vs traction — be honest:** the 50 Coimbatore businesses are **seeded demo data with placeholder
   owners, not paying users.** Frame it as *"a fully working machine + a plan to convert N into claimed,
   active accounts,"* never as customers.

**Risks specific to the new model:**
- Will Indian consumers pay a **recurring subscription** for local discovery when JustDial/Google/WhatsApp
  are free? (Biggest risk.)
- **Who is the primary payer** — business, consumer, or both?
- **Flat subscription caps the ceiling** vs take-rate models VCs love → answer with volume × low churn ×
  many verticals on one platform.
- **Family/IP sharing** = ARPU dilution + abuse + weak enforcement.
- Must rehearse **vs JustDial / Sulekha (static directories)** and **UrbanCompany / Porter (commission
  marketplaces).**

**India-specific edges:** Tamil/vernacular support (most AI is English-first), UPI/payments hook later,
WhatsApp/feature-phone reach, voice-first for older users.

**Unfair advantage on day one:** you don't pitch slides — you have a **live product** (hanubees.com), an
agent-to-agent concierge across 50 Coimbatore businesses, budget search, tappable @handle profiles, and a
working watcher/alerts engine. Walking an investor through *"watch for 20%+ offers → red alert → tap the
business"* on a real phone beats any deck.

---

## 17. Deliberately LATER / OUT OF SCOPE (naming these shows rigor)
- **Maps / live tracking / delivery routing skills — OUT for now.** Too complex (real-time GPS,
  routing); needs us to be very clear about what we're doing. We do service *information* discovery,
  **not** the delivery/tracking layer. (Scope decision 2026-06-05.)
- **Open gig labor** ("anyone deliver this") — trust/safety, liability, labour law. Tied to the maps
  layer above; deferred with it.
- **Payments / escrow** — RBI/payments regulation, money handling.
- **Delivery fleet / logistics ops** — capital + operations heavy.
- **Secondhand fraud handling** at scale.

---

## 18. Status (what exists today)
- Live product at **hanubees.com**; code in `/root/hanubees`; full build notes in `CLAUDE.md`.
- 50 real-modeled **Coimbatore** businesses with pricing/hours/services + public agents.
- **Concierge chat** (budget search, list, compare, recommend, drill-down), purple tappable `@handle.B`
  profile links.
- **Agent-to-agent** query + multi-agent compare.
- **Phase 1 skills shipped:** Watchers + Notification area (Primary/General/Spam, color rules, e.g. 20%+
  offers in red) — the "while you sleep" engine (currently runs on open/refresh; overnight cron = Phase 2).
- Skill catalog + consent defaults specified in `SKILLS.md` (facts auto-answer; deals need owner approval;
  reachable by verified + prior customers).
- **Parked:** real self-serve signup/claim flow (so a business can take over its seeded agent).

---

## 19. ADDENDUM (2026-06-06) — the static-website problem + the free-chatbot wedge

**The problem we actually solve: static, low-discoverability presence.**
- A business could explain itself in 300–400 pages, but no one reads that, so they're forced into a
  thin "ad-copy" website that says almost nothing. Websites are cheap now but **not interactive, not
  flexible, low discoverability**, and you can't really *sell* inside them. Editing needs a developer
  or a PC. So owners give up and run on WhatsApp + word-of-mouth.
- Instagram isn't the answer either: it **forces content-creation** and **validates by follower count**
  — punishing great-but-small businesses that just want to do their work, not become creators.
- Result today: customers **jump between Google → Maps → website → Instagram → a phone call**, asking
  questions one at a time and forgetting half. **Friction is huge.**

**Our fix: the business's agent replaces the website/Instagram/repetitive calls.**
- The owner dumps *everything* once — text / voice / PDF / video / reviews / "why we're best" / honest
  limitations — and the agent **remembers it all**. A customer can ask **a thousand questions**; the
  agent answers from that context, and **pops up the right photo/video/message** when relevant.
- It's a **prebuilt website-as-chat**: see the info, ask, get the exact amount you need — no scrolling
  400 pages, no PC to edit, no developer.
- **Custom persona/avatar:** the agent can role-play the business's character, not a generic bot.
- **Not only businesses:** freelancers, secondhand sellers, anyone gets an agent. A secondhand-bike
  seller lists on OLX and links to *their* Hanubees agent for questions. Per-product / per-link agents.
- **Owner analytics:** every question asked = insight (frequent questions, trust signals, gaps).
- **Flexibility/control:** owner can pin rules ("when asked X, say only Y").
- **Local discovery:** "any tuition teacher / pet groomer / nail-only specialist near me?" — the
  provider just tells their agent once; it surfaces when that question arises in that location.

**The GTM wedge: a free, managed AI chatbot for any website.**
- Every website wants an AI chatbot; today the options are **paid** (dev charges) or **static** (a dev
  hardcodes a $5 OpenAI key → can't be changed without a developer/PC). **No good free + flexible one.**
- We give them a **free chatbot they manage by talking to the AI** (no code, no PC) — and it also lives
  **inside our platform**. Cheap for us (moderate tokens). 
- **Why it wins for us:** every install feeds the **main platform** with data + users + a foothold; the
  belief "teleports" from their website to **our app**. Once enough people use it *in our app*, it
  stops being a "chatbot" and becomes their **agent / representative**.
- **Positioning caution (founder):** we are NOT a chatbot company — we hate the word. Market the free
  chatbot as the *acquisition wedge*, but brand the *outcome* (get discovered + answered), not the tool.
  The "chatbot" label is changeable once the network has real users.

**Open questions raised (answered in chat 2026-06-06):**
1. Competition — managed AI website chatbots already exist & are commoditized (Chatbase, SiteGPT,
   Tidio/Lyro, Intercom Fin, Chatling, Botpress, etc.). Our edge is NOT the chatbot — it's the
   **discovery network + agent-to-agent + local proximity + data**. Don't compete as "another chatbot."
2. Fear of being typecast as a chatbot provider — valid but changeable; lead with discovery/representation,
   keep "chatbot" as the install, not the identity.
