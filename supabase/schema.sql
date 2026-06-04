-- Hanubees — AI agent network schema (v1: receptionist)
-- Run this in Supabase SQL editor. Safe to re-run (IF NOT EXISTS / OR REPLACE).

-- ── accounts: one AI agent per business/person ───────────────────────────────
create table if not exists accounts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  type           text not null default 'business' check (type in ('business','person')),
  name           text not null,
  slug           text unique not null,
  category       text,               -- e.g. 'wedding-photography'
  city           text,
  location       text,               -- free-text address/area
  bio            text,
  persona        text,               -- extra personality / answering instructions for the agent
  logo_url       text,
  phone          text,
  email          text,
  website        text,
  instagram      text,
  verified       boolean not null default false,
  rating         numeric(3,2) not null default 0,
  review_count   integer not null default 0,
  follower_count integer not null default 0,
  created_at     timestamptz not null default now()
);
create index if not exists accounts_user_id_idx  on accounts(user_id);
create index if not exists accounts_category_idx on accounts(category);
create index if not exists accounts_city_idx     on accounts(city);

-- ── data_entries: the knowledge each agent answers from ──────────────────────
create table if not exists data_entries (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references accounts(id) on delete cascade,
  content     text not null,
  source      text not null default 'manual' check (source in ('scrape','manual','voice','image')),
  tag         text,                  -- 'pricing' | 'hours' | 'services' | 'faq' | ...
  -- public  = agent may share this with customers / shown on public page
  -- private = owner-only; agent uses it for context but never reveals verbatim
  visibility  text not null default 'public' check (visibility in ('public','private')),
  image_url   text,
  created_at  timestamptz not null default now()
);
create index if not exists data_entries_account_idx on data_entries(account_id);

-- ── conversations: a chat thread with an account's agent ─────────────────────
create table if not exists conversations (
  id              uuid primary key default gen_random_uuid(),
  account_id      uuid not null references accounts(id) on delete cascade,
  visitor_name    text,
  visitor_id      text,              -- anon id for public chat
  channel         text not null default 'public' check (channel in ('public','owner','agent')),
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now()
);
create index if not exists conversations_account_idx on conversations(account_id, last_message_at desc);

-- ── messages ─────────────────────────────────────────────────────────────────
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role            text not null check (role in ('visitor','agent','owner')),
  content         text not null,
  is_important    boolean not null default false,
  is_order        boolean not null default false,
  fulfilled       boolean not null default false,
  read            boolean not null default false,
  created_at      timestamptz not null default now()
);
create index if not exists messages_conversation_idx on messages(conversation_id, created_at);

-- ── follows: account follows account (adds trust) ────────────────────────────
-- Drop the old health-app follows table (had follower_id/following_id) if present.
drop table if exists follows cascade;
create table follows (
  id                  uuid primary key default gen_random_uuid(),
  follower_account_id uuid not null references accounts(id) on delete cascade,
  followed_account_id uuid not null references accounts(id) on delete cascade,
  created_at          timestamptz not null default now(),
  unique (follower_account_id, followed_account_id)
);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table accounts      enable row level security;
alter table data_entries  enable row level security;
alter table conversations enable row level security;
alter table messages      enable row level security;
alter table follows       enable row level security;

-- accounts: world-readable (public directory); owner writes
drop policy if exists accounts_read on accounts;
create policy accounts_read on accounts for select using (true);
drop policy if exists accounts_write on accounts;
create policy accounts_write on accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- data_entries: public entries world-readable; private entries owner-only. Owner writes all.
drop policy if exists data_read on data_entries;
create policy data_read on data_entries for select using (
  visibility = 'public'
  or exists (select 1 from accounts a where a.id = account_id and a.user_id = auth.uid())
);
drop policy if exists data_write on data_entries;
create policy data_write on data_entries for all
  using (exists (select 1 from accounts a where a.id = account_id and a.user_id = auth.uid()))
  with check (exists (select 1 from accounts a where a.id = account_id and a.user_id = auth.uid()));

-- conversations/messages: owner of the account can read.
-- Public chat writes go through a server route using the service role (bypasses RLS).
drop policy if exists conv_owner_read on conversations;
create policy conv_owner_read on conversations for select
  using (exists (select 1 from accounts a where a.id = account_id and a.user_id = auth.uid()));
drop policy if exists conv_owner_write on conversations;
create policy conv_owner_write on conversations for all
  using (exists (select 1 from accounts a where a.id = account_id and a.user_id = auth.uid()))
  with check (exists (select 1 from accounts a where a.id = account_id and a.user_id = auth.uid()));
-- public visitors (anon) may start conversations with any account's agent
drop policy if exists conv_public_insert on conversations;
create policy conv_public_insert on conversations for insert with check (channel = 'public');

drop policy if exists msg_owner_read on messages;
create policy msg_owner_read on messages for select
  using (exists (select 1 from conversations c join accounts a on a.id = c.account_id
                 where c.id = conversation_id and a.user_id = auth.uid()));
drop policy if exists msg_owner_write on messages;
create policy msg_owner_write on messages for all
  using (exists (select 1 from conversations c join accounts a on a.id = c.account_id
                 where c.id = conversation_id and a.user_id = auth.uid()))
  with check (exists (select 1 from conversations c join accounts a on a.id = c.account_id
                 where c.id = conversation_id and a.user_id = auth.uid()));
-- public visitors (anon) may append messages to public conversations
drop policy if exists msg_public_insert on messages;
create policy msg_public_insert on messages for insert with check (
  role in ('visitor','agent')
  and exists (select 1 from conversations c where c.id = conversation_id and c.channel = 'public')
);

-- follows: world-readable; owner of follower account writes
drop policy if exists follows_read on follows;
create policy follows_read on follows for select using (true);
drop policy if exists follows_write on follows;
create policy follows_write on follows for all
  using (exists (select 1 from accounts a where a.id = follower_account_id and a.user_id = auth.uid()))
  with check (exists (select 1 from accounts a where a.id = follower_account_id and a.user_id = auth.uid()));
