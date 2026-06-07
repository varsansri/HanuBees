-- ── Consumer-contributed knowledge (the consumer-first wedge) ───────────────
-- Anyone (anonymous) can drop specific, perishable, experiential info by voice/text.
-- The AI structures it into one of four kinds. The key differentiator vs Google/Insta:
-- `valid_until` — perishable info (PG slots) decays; evergreen info (a tip) doesn't.
create table if not exists contributions (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('availability','experience','tip','question')),
  account_id  uuid references accounts(id) on delete set null,  -- linked place, if matched
  place_name  text,                 -- free-text place when no account ("Sri PG", "Anna Auto Parts")
  city        text,
  area        text,
  category    text,
  title       text,                 -- short summary for cards
  content     text not null,        -- the body, or the question text
  answer      text,                 -- filled when a question gets answered
  price       numeric,
  rating      smallint,             -- optional 1–5 if the user rated
  author_id   text not null,        -- anonymous on-device id
  valid_until timestamptz,          -- freshness: null = evergreen; past = stale
  upvotes     integer not null default 0,
  status      text not null default 'active' check (status in ('active','answered','removed')),
  created_at  timestamptz not null default now()
);
create index if not exists contributions_account_idx on contributions(account_id);
create index if not exists contributions_city_idx     on contributions(city);
create index if not exists contributions_kind_idx     on contributions(kind);
create index if not exists contributions_created_idx  on contributions(created_at desc);

alter table contributions enable row level security;
-- Anyone may read (it's a public knowledge layer).
drop policy if exists contributions_read on contributions;
create policy contributions_read on contributions for select using (true);
-- No public INSERT policy on purpose: writes go through the service-role client in
-- /api/contribute (which runs the text through the LLM first). Add rate-limiting later.

select 'contributions table ready' as status;
