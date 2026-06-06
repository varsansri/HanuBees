# Hanubees Marketing Team

The self-driving marketing system for **Hanubees** — an AI-agent network for local
businesses. This folder is the home of everything marketing: the social-post engine,
brand assets, SEO/AI-SEO docs, and the operating playbook.

> **Focus: Australia + USA.** Indian audiences are harder to monetize, so all
> social marketing targets AU/US cities. (Product/data still covers India.)

---

## What's in here

```
hanubees-marketing-team/
├── README.md                  ← you are here
├── CREDENTIALS.md             ← inventory of API keys (masked; real values live in .env.local)
├── assets/
│   └── brand/                 ← bee.png, brand.json, Space Grotesk font, REFERENCES.md
│       ├── bee.png            ← logo, goes on every generated image
│       ├── brand.json         ← colors + font rules
│       ├── fonts/SpaceGrotesk.ttf  ← brand font (used by sharp/SVG rendering)
│       └── REFERENCES.md      ← visual-effect libraries for the website
├── docs/
│   ├── PROGRESS-2026-06-06.md ← dated change log (today's full update)
│   ├── SOCIAL-SYSTEM.md       ← how the auto-poster works, end to end
│   └── SEO.md                 ← SEO + AI-SEO status and what's pending
└── scripts/
    ├── story-carousel.js      ← ★ main: data-viz STORY carousels, auto-picks next city
    ├── post-carousel.js       ← 2-page insight+promo carousel poster
    ├── post-instagram.js      ← single image-card → Instagram
    ├── gen-social.js          ← text-post queue generator
    ├── social-post.js         ← text-post Zernio poster
    └── social.cron.yml.txt    ← reference cron config (GitHub Actions blocked by token scope)
```

> **Run all scripts from the project root** (`/root/hanubees`), e.g.
> `node hanubees-marketing-team/scripts/story-carousel.js auto`.
> Scripts read `.env.local` and asset paths relative to the project root.

---

## The one command that matters

```bash
# from /root/hanubees
node hanubees-marketing-team/scripts/story-carousel.js auto
```

Builds a **5-slide data-viz story** for the next un-posted AU/US city — entirely from
**real database numbers** (no fabrication) — and publishes it to **Instagram + TikTok**,
then logs it to the `story_log` table so it never repeats.

Other modes:
- `render auto` — render the next city's slides to `/tmp/story/` (preview, no post)
- `render "<City>"` / `<City>` — target a specific city
- `auto` — post the next city (used by the daily cron)

See **docs/SOCIAL-SYSTEM.md** for the full pipeline.

---

## Operating principles (locked)

1. **Truth only.** Every stat comes live from the DB. No fake reviews, numbers, or news.
2. **Brand only.** Every image uses `assets/brand` — bee.png, brand colors, Space Grotesk.
3. **Own accounts only.** Post to @hanubees IG/TikTok. No community spam, no reposting strangers' content.
4. **AU/US focus** for social; product/data may include other regions.
5. **No secrets in git.** Keys live in `.env.local` (gitignored). See CREDENTIALS.md.
