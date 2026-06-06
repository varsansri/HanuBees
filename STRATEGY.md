# Hanubees — Strategy & Operating Principles (captured 2026-06-06)
> Founder thinking, synthesized. Companion to VISION.md / SKILLS.md / SEO.md / GTM.md.

## The through-line
We are a **cumulative LLM**: ChatGPT specializes in *general information*; we specialize in
**agent-to-agent, customer-to-business** conversation over **real, local, first-party data we
collect**. The moat isn't smarter answers — it's *proximity + the data + the network of agents*.

## Core principles
1. **Proximity is power.** Time + location are the axes. The AI should reason about *where* and
   *when*, ask intent, and answer relative to the user's place and moment.
2. **Top 10% only.** Don't cover whole niches — represent the **top 10%** of each niche/city
   (the best wedding photographer, the biggest channel, the standout clinic). People want the
   best; covering the long tail wastes effort while we're early. *(Needs a ranking signal — see
   caveats; YouTube view counts / reviews can define "top".)*
3. **The data advantage.** We already hold more real local-business data than a stock LLM has,
   and it's verifiable (not hallucinated). Keep widening this with new sources.
4. **Numbers beat prose.** Present facts with **numbers + math + rank**: not "the biggest channel"
   but "ranked #1 of 346." Same space, far more validity and context. The concierge should answer
   with figures, distance, time, counts — fast to grasp.
5. **Chat-first, not voice.** 11Labs et al. do automated AI *calls*; we own the **text/chat**
   surface. Not competing on voice now.
6. **Minimal, clean UI.** Every page minimal; few elements; buttons only where they earn their place.

## Cold-start: build the base before the network
Agent-to-agent needs both sides. If a customer agent + business agent both depend on one sparse
business, people bounce. So we **pre-build the base** from existing public data (what we're doing),
and make business onboarding trivial: a business shares **a link / a PDF / a voice recording**, and
we **extract everything** they offer. Lowest friction → fastest supply.

## The product wedge: the embeddable agent
Every site is bolting on an AI chatbot — and **rebuilding it each time is the pain point.**
- We let any business **add *our* agent to their website** (a simple embed/button), **free**.
- They get **analytics inside our platform**; the agent also lives on their own site.
- We get their **data + usage + a foothold on their site** (and they remember us).
- On our profiles: a **"Visit website" link button** under the agent, so users can hop to the real
  site and back. If their site already embeds our agent, the loop is closed and free.

## "Links are the way in" (today's key learning)
The day's real discovery: **links unlock the data.** YouTube descriptions alone are thin, but the
**website link** in them → fetch the site → rich first-party info (most small-business sites *don't*
block bots). Generalize it:
- More links = more reach. Follow links from YouTube, and add **Twitter/X, Reddit (via APIs)**,
  business sites, etc. — go through them, gather, categorize, store, connect the dots in our ecosystem.
- If a source blocks us, skip it; take what's open. We need *information*, and open links give it.

## Honest caveats (so we build on truth)
- **"Top 10%" needs a ranking signal.** We have none yet (no reviews). Use **YouTube view counts**,
  later **verified reviews**, as the rank. Until then "top" is approximate.
- **X/Reddit APIs aren't a free volume game anymore** — X API is paid/expensive; Reddit's is
  restricted/paid at volume. Budget for that or use them sparingly. (YouTube + open business sites
  remain the free engines.)
- **Respect blocks on big platforms** (Maps/JustDial/domain) — scraping their *own* sites is fine;
  forcing past anti-bot on big platforms = legal/technical wall. Stick to open links.
- **Quality/categorization** of scraped data needs an LLM cleanup pass (categories, dedupe, "top").

## Buildable now vs later
- **Now (cheap, high-leverage):** numbers/rank in concierge answers; "Visit website" button on
  profiles; an embeddable agent script (`/embed`) businesses can paste.
- **Later:** ranking signal (views→reviews) to power Top-10%; Twitter/Reddit link mining;
  PDF/voice onboarding; LLM cleanup pass.
