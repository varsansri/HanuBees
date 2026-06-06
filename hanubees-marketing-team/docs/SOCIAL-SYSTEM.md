# Social System — How the Auto-Poster Works

The flagship is **`story-carousel.js`**: a 5-slide data-viz STORY carousel generator
that is fully data-driven (every number comes from the live database) and self-driving
(it picks the next un-posted city and logs itself).

## The 5 slides

Each story is a swipeable carousel, brand-styled (dark gradient + glass + bee.png + Space Grotesk):

1. **Cover** — emotion word ("INVISIBLE") + headline (`We mapped N businesses in <City>…`)
2. **Big stat** — huge number (businesses with no findable phone) + donut ring showing the %
3. **Bar chart** — No phone online / No website / Listed & reachable, scaled to the max
4. **Flowchart** — "THE OLD WAY" (Google → map → site → call) vs "WITH HANUBEES" (ask → instant)
5. **CTA** — "THE FIX" + yellow `Free → hanubees.com` button

All numbers are computed live from the `accounts` table — **nothing is fabricated.**

## Modes

```bash
# from /root/hanubees
node hanubees-marketing-team/scripts/story-carousel.js render auto   # preview next city → /tmp/story/
node hanubees-marketing-team/scripts/story-carousel.js render "Sydney"  # preview a specific city
node hanubees-marketing-team/scripts/story-carousel.js auto          # POST the next un-posted city
node hanubees-marketing-team/scripts/story-carousel.js "Melbourne"   # POST a specific city
```

## City selection (`auto`)

`nextCity()` queries the `accounts` table joined to `story_log`, and:
- restricts to the **AU/US target list** (`TARGETS` in the script — LA, Melbourne, Sydney,
  Brisbane, Perth, Adelaide, SF, NYC, Chicago, Austin, Seattle, Miami, San Diego),
- requires **≥ 40 businesses** of real data,
- prefers **never-posted** cities, then the **oldest-posted** (so it rotates).

After a successful post it inserts a row into `story_log (city, slides, platforms, posted_at)`.

## Per-platform captions

- **Instagram** — long caption with full numbers + hashtags.
- **TikTok** — short caption, hard-capped at **90 characters** (TikTok photo-post limit).

Posted as separate Zernio calls so each platform gets the right caption. TikTok supports
**Photo Mode** (carousel/slideshow up to 35 images), so the same 5 slides post to both.

## The `story_log` table

```sql
create table story_log (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  slides int,
  platforms text,           -- e.g. 'instagram+tiktok'
  posted_at timestamptz default now()
);
```

## Always-running poster (cron)

A **daily session cron** (10:23 AM local) wakes the assistant to run
`story-carousel.js auto`. Constraints to know:
- It runs while the Claude Code session is alive; **auto-expires after 7 days** (re-create to extend).
- This environment has **no system cron** and `sharp` is not a Vercel dependency, so true 24/7
  cloud posting would require porting the renderer into a **Vercel cron API route**
  (bundle Space Grotesk + add `sharp`). Open task — see PROGRESS.

## Volume

One genuine story = one city of real data. Currently mapped AU/US: **Los Angeles** (posted),
**Melbourne** (next). To grow toward ~40 posts, **ingest more AU/US cities** (each becomes a
story): `node scripts/ingest-osm.js` / `ingest-city.js`. The `TARGETS` list is pre-wired.

## `meet-carousel.js` — the viral "MEET X" format

A 7-slide carousel modeled on the uncover.ai "MEET [person]" viral format, applied to our
real data as **"MEET THE [N]"** (the un-reachable businesses in a city). Arc:
1. **Hook** — `MEET` + giant number (no-phone count) + "the <City> businesses your customers can't reach"
2. **The scale** — total mapped + % with no findable phone
3. **The old way** — numbered step-by-step **flowchart** (Google → map → website → call & wait)
4. **The data** — bar chart (no phone / no website / reachable)
5. **The hidden cost** — emotional beat with the % number
6. **The fix** — 2-step **flowchart** (Ask Hanubees → instant answer)
7. **CTA** — free → hanubees.com

All numbers pulled live from the DB; brand theme + Space Grotesk + bee on every slide.
Highlighted keywords in brand yellow/red (scannable in 1s). Run:
```bash
node hanubees-marketing-team/scripts/meet-carousel.js render "Los Angeles"   # preview → /tmp/meet/
node hanubees-marketing-team/scripts/meet-carousel.js post "Los Angeles"     # publish IG + TikTok
```

## Other scripts

- `post-carousel.js` — 2-page insight+promo carousel, drips from `carousel_queue`.
- `post-instagram.js` — single branded image-card → Instagram, from `social_posts` queue.
- `gen-social.js` / `social-post.js` — text-post queue + Zernio text poster.
