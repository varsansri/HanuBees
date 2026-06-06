# Credentials Inventory

> **Raw secret values are NEVER stored in git.** They live only in `/root/hanubees/.env.local`
> (gitignored via the `.env*` rule) and in the Vercel dashboard. This file is the
> masked inventory: what each key is, where it lives, and how to rotate it.

| Key | Used by | Where it lives | Masked preview | Rotate at |
|---|---|---|---|---|
| `ZERNIO_API_KEY` | Social posting (IG + TikTok) via Zernio API | `.env.local` | `sk_1d44…` (67 chars) | zernio.com → API keys |
| `SUPABASE_ACCESS_TOKEN` | Autonomous SQL via Supabase **Management API** (PAT) | `.env.local` | `sbp_adc3…` (44 chars) | supabase.com → Account → Access Tokens |
| `SUPABASE_PROJECT_REF` | Project id `whfxrovgvulmhqkhumuz` (not secret) | `.env.local` | `whfxrovgvu…` | n/a |
| `GOOGLE_API_KEY` | YouTube Data + Gemini (city/data ingest) | `.env.local` | `AIzaSyDMZy…` (39 chars) | console.cloud.google.com |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | App client (public, safe in browser) | Vercel env | public | Supabase → API |
| `OPENAI_API_KEY` | Receptionist brain + embeddings (prod, Sensitive) | Vercel env only | — | openai.com |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Google Search Console verification (**NOT SET YET**) | Vercel env | — | search.google.com/search-console |

## APIs in use

- **Zernio** — Bearer auth. `POST /v1/posts {content, mediaItems:[{url,type}], platforms:[{platform,accountId}], publishNow}`.
  Media: `POST /v1/media/presign {filename,contentType}` → PUT uploadUrl → use publicUrl.
  `GET /v1/accounts` (connected), `GET /v1/analytics`. First 2 accounts free; X charges per link-post;
  **TikTok photo caption ≤ 90 chars**.
- **Supabase Management API** — `POST https://api.supabase.com/v1/projects/{ref}/database/query`
  with `{query}` + `Authorization: Bearer <SUPABASE_ACCESS_TOKEN>`. Used by `scripts/db.js` and all ingest/social scripts.

## Security rules

- Never paste secrets into chat or commit them. `.env.local` stays gitignored.
- Rotate `SUPABASE_ACCESS_TOKEN` and `ZERNIO_API_KEY` when handing the project off.
- Only post to **our own** @hanubees accounts.
