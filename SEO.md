# Hanubees — Master Marketing / SEO Plan (captured 2026-06-06)
> The growth engine for the directory: turn our data into thousands of pages that
> rank for "X in [place]" searches, and feed the demand-logging flywheel.
> Companion: GTM.md (calls + social), VISION.md, SKILLS.md, CLAUDE.md.

---

## 0. The thesis (one line)
**Every business + every location + every category we have = a page that can rank.**
We don't "do SEO," we *generate* it from structured data (programmatic SEO), the same
playbook JustDial / Yelp / Zomato used to dominate local search. That organic traffic
then powers the flywheel: traffic → demand data (the `searches` table) → business
outreach ("people searched you 40× this week") → more data → more pages.

---

## 1. Page architecture (the templates that rank)
| Page type | URL | Targets the search | Source |
|---|---|---|---|
| **City × Category** (workhorse) | `/coimbatore/eye-hospitals` | "eye hospitals in coimbatore" | directory data |
| **Area × Category** | `/coimbatore/rs-puram/clinics` | "clinics in rs puram" | data + `location` |
| **City hub** | `/coimbatore` | "coimbatore directory / businesses" | all categories |
| **Business page** | `/[slug]` (exists) | "[business name]" + Q&A | account + agent |
| **Guides / articles** | `/guides/best-eye-hospitals-in-coimbatore` | "best/top X in [city]" | AI + data |
| **Country/state hubs** | `/india/tamil-nadu`, `/usa/california` | broad discovery | cities index |

Long-tail math: cities × categories × areas = **thousands of pages**, each chasing a
specific low-competition query. That's the whole game.

---

## 2. Content rules (so Google rewards, not penalizes us)
Google penalizes **thin, scaled AI fluff** (2024 "scaled content abuse"). We avoid that by
making every page **genuinely useful with REAL data**:
- The actual **list** of businesses (names, areas, phones, the count: "358 hospitals in Coimbatore").
- A short, specific **AI-written intro** (2–4 sentences, data-backed — not generic filler).
- **Comparisons / filters** ("by area", "with phone", "open now" later).
- **Structured data (JSON-LD):** `ItemList` + `LocalBusiness` + `BreadcrumbList`.
- Unique templated **title / meta / H1** per page.
Rule of thumb: if the page would help a real person, it's safe. If it's AI words around no
data, it's a doorway page — don't ship it.

---

## 3. Technical SEO checklist
- **Dynamic routes** for city/category/area pages, rendered **static/ISR** (fast, cacheable).
- **Sitemap**: expand `app/sitemap.ts` to include every city, city×category, and business URL.
- **JSON-LD** on every page (ItemList / LocalBusiness / Breadcrumb / Organization+WebSite already added).
- **Internal linking**: city hub → categories → businesses → related categories/areas. (Crawl depth + link equity.)
- **Templated metadata**: `Eye Hospitals in Coimbatore (2026) — 12 listed | Hanubees`.
- **Canonical URLs**, clean slugs, breadcrumbs.
- **Search Console + Bing Webmaster**: verify domain, submit sitemap, request indexing. *(Your action — only the owner can.)*
- Confirm **hanubees.com** itself serves the app (not just the vercel.app URL) so there's something to index.

---

## 4. The article / blog layer (the "write articles" ask)
AI-generated, **data-backed** guides — refreshed as data grows:
- "Best 10 Eye Hospitals in Coimbatore (2026)" · "Where to find a 24/7 Pharmacy in Chennai"
  · "Top Cafés in Melbourne CBD" · "How to choose a dentist in [area]".
- Each guide = real shortlist from our data + concise helpful prose + links to the business pages.
- Targets informational + "best/top/near me" queries that feed into the directory pages.
- Cadence: start with the **top 5 categories per active city**, expand from demand data.

---

## 5. The flywheel (why SEO + demand logging compound)
```
programmatic pages  ->  organic long-tail traffic
        ^                          |
        |                          v
   more pages  <- prioritize  <-  searches table
   & outreach     (what people searched + what we LACK)
        |                          |
        +----> tell businesses: "you were searched 40× — claim your free agent"
```
The `searches` table tells us exactly which **new categories/cities/areas** to generate
pages for next, and gives the sales pitch to businesses. SEO feeds sales; sales feeds data;
data feeds SEO.

---

## 6. Measurement
- **Google Search Console** — impressions, clicks, which queries, which pages.
- **Umami** — traffic, sources, geos.
- **`searches` table** — internal demand: top queries, % found vs not-found, by city.
- North-star: indexed pages → impressions → clicks → searches → claimed businesses.

---

## 7. Distribution beyond SEO (tie-in)
- **FOMO social reels** (GTM.md) drive spikes + brand searches (which also help SEO).
- **Business outreach** (GTM.md calls) using demand data.
- Each business page is shareable (`@handle.B`) — businesses share their own page = backlinks + traffic.

---

## 8. Roadmap (phased)
1. **Page engine** — build `/[city]/[category]` (+ city hub) template from existing data, with JSON-LD + internal links. *(I can build now.)*
2. **Sitemap expansion** — every city/category/business URL. *(I can build now.)*
3. **Search Console submission** — verify + submit sitemap + request indexing. *(Owner action.)*
4. **Guides/articles** — AI-written, data-backed, top categories per city. *(I can generate.)*
5. **Data depth** — Google Places API for phones/hours → richer, more useful pages → better ranking.
6. **Scale** — more categories, areas, cities; driven by the `searches` demand data.

---

## 9. Honest dependencies / risks
- **Pages are only as good as the data.** Coimbatore healthcare (358) is solid → start SEO proof there. Thin categories make thin pages — don't publish until a category has enough entries.
- **Indexing takes days–weeks** and needs Search Console submission (owner). "hanubees" won't appear until that's done.
- **AI content must wrap real data**, or risk Google's scaled-content penalty.
- **Phone-poor data** (OSM) makes weaker pages → Places API materially improves SEO quality.
