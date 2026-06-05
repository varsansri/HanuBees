-- ============================================================
-- Hanubees: upgrade data_entries to the full semantic schema
-- Run at: https://supabase.com/dashboard/project/whfxrovgvulmhqkhumuz/sql/new
--
-- Run PART A now. Deploy the app. (Optionally) run the embedding
-- backfill endpoint. Then run PART B last (it re-locks the tables).
-- ============================================================

-- ---------- PART A: columns + semantic search (run first) ----------

create extension if not exists vector;

alter table data_entries add column if not exists embedding vector(768);
alter table data_entries add column if not exists supersedes uuid references data_entries(id);
alter table data_entries add column if not exists source text;

-- Semantic match function called by /api/agent retrieve()
-- Signature matches the rpc call exactly: (p_account, query_embedding, match_count, public_only)
create or replace function match_data_entries(
  p_account uuid,
  query_embedding vector(768),
  match_count int default 6,
  public_only boolean default true
)
returns table (id uuid, content text, tag text, info_type text, similarity float)
language sql stable
as $$
  select de.id, de.content, de.tag, de.info_type,
         1 - (de.embedding <=> query_embedding) as similarity
  from data_entries de
  where de.account_id = p_account
    and de.embedding is not null
    and de.is_live_fact = false
    and (not public_only or de.visibility = 'public')
  order by de.embedding <=> query_embedding
  limit match_count
$$;

-- Vector index for fast cosine search
create index if not exists idx_data_entries_embedding
  on data_entries using hnsw (embedding vector_cosine_ops)
  where embedding is not null;

select 'PART A done: columns + match_data_entries + index created' as status;


-- ============================================================
-- ---------- PART B: re-enable RLS (run LAST) ----------
-- Demo-now model: anyone can READ public business data; only the
-- owning auth user can WRITE their own rows. Run this AFTER the
-- embedding backfill (the anon backfill needs writes open).
-- ============================================================

-- alter table accounts      enable row level security;
-- alter table data_entries  enable row level security;
-- alter table conversations enable row level security;
-- alter table messages      enable row level security;
--
-- -- accounts: public read of businesses; owner can update own
-- drop policy if exists accounts_public_read on accounts;
-- create policy accounts_public_read on accounts
--   for select using (type = 'business' or auth.uid()::text = user_id);
-- drop policy if exists accounts_owner_write on accounts;
-- create policy accounts_owner_write on accounts
--   for all using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);
--
-- -- data_entries: public read of public rows; owner manages own
-- drop policy if exists de_public_read on data_entries;
-- create policy de_public_read on data_entries
--   for select using (
--     visibility = 'public'
--     or exists (select 1 from accounts a where a.id = data_entries.account_id and a.user_id = auth.uid()::text)
--   );
-- drop policy if exists de_owner_write on data_entries;
-- create policy de_owner_write on data_entries
--   for all using (
--     exists (select 1 from accounts a where a.id = data_entries.account_id and a.user_id = auth.uid()::text)
--   );
--
-- -- conversations + messages: anyone can start/append (public chat); owner reads
-- drop policy if exists conv_insert on conversations;
-- create policy conv_insert on conversations for insert with check (true);
-- drop policy if exists conv_owner_read on conversations;
-- create policy conv_owner_read on conversations for select using (
--   exists (select 1 from accounts a where a.id = conversations.account_id and a.user_id = auth.uid()::text)
-- );
-- drop policy if exists msg_insert on messages;
-- create policy msg_insert on messages for insert with check (true);
-- drop policy if exists msg_read on messages;
-- create policy msg_read on messages for select using (true);
--
-- select 'PART B done: RLS re-enabled' as status;
