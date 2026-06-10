# SEO + AI-SEO Status

Goal: get Hanubees found by **search engines** (traditional SEO) **and by AI tools**
(GEO / "AI-SEO" — so ChatGPT, Gemini, Perplexity etc. can discover and cite us).

## Shipped & live

| Item | File | Purpose |
|---|---|---|
| `robots.txt` | `app/robots.ts` | Welcomes search + AI crawlers |
| `llms.txt` | `public/llms.txt` | AI-SEO: tells LLM crawlers what Hanubees is |
| Sitemap | `app/sitemap.ts` | Lists all city/category/business pages |
| JSON-LD (site) | `app/layout.tsx` | Org/site structured data |
| JSON-LD (city hub) | `app/[slug]/CityHub.tsx` | `ItemList` of businesses |
| JSON-LD (business) | `app/[slug]/page.tsx` | `LocalBusiness` |
| JSON-LD (category) | `app/[slug]/[category]/page.tsx` | `ItemList` / `FAQPage` |
| GSC verification | `app/layout.tsx` | Reads `NEXT_PUBLIC_GOOGLE_VERIFICATION` |

Programmatic SEO: every city + category + business renders its own indexable page with
structured data, so each is a potential search landing page.

## ⚠ Pending (the #1 SEO blocker)

- **Google Search Console verification token is NOT set.** The wiring exists
  (`NEXT_PUBLIC_GOOGLE_VERIFICATION` in `app/layout.tsx`), but until the founder adds the
  token (Vercel env var) and verifies the property, none of the above gets indexed by Google.
  - Get it: https://search.google.com/search-console → add `hanubees.com` → HTML-tag method →
    copy the `content` value → set `NEXT_PUBLIC_GOOGLE_VERIFICATION` in Vercel → redeploy → Verify.

## Next SEO steps

1. Add the GSC token + submit the sitemap.
2. Run the embedding backfill (`/api/backfill-embeddings`) in prod for better semantic answers.
3. Expand programmatic pages as more AU/US cities are ingested (each city/category page is SEO surface).
4. Add Bing Webmaster + IndexNow for faster indexing.
