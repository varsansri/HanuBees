-- ============================================================
-- Hanubees Phase 1: Watchers + Notifications (+ demo offers)
-- Run in: https://supabase.com/dashboard/project/whfxrovgvulmhqkhumuz/sql/new
-- SQL editor bypasses RLS, so the demo-offer inserts work.
-- ============================================================

-- 1) Watchers: standing rules a person/business sets to be alerted.
create table if not exists watchers (
  id           uuid primary key default gen_random_uuid(),
  account_id   uuid not null references accounts(id) on delete cascade,
  label        text not null,
  kind         text not null default 'offer',          -- offer | keyword | price
  params       jsonb not null default '{}'::jsonb,      -- {query?, category?, discountAtLeast?, priceUnder?}
  color        text not null default '#ffbe00',
  active       boolean not null default true,
  last_checked timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists idx_watchers_account on watchers(account_id, active);

-- 2) Notifications: results from watchers (later: task results too).
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references accounts(id) on delete cascade,
  watcher_id  uuid references watchers(id) on delete cascade,
  source      text,            -- "@handle.B"
  source_slug text,            -- profile link target
  body        text not null,
  color       text not null default '#ffbe00',
  folder      text not null default 'primary',  -- primary | general | spam
  dedupe_key  text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create unique index if not exists uq_notifications_dedupe on notifications(account_id, dedupe_key);
create index if not exists idx_notifications_inbox on notifications(account_id, folder, created_at desc);

-- 3) RLS: each account manages only its own watchers + notifications.
alter table watchers enable row level security;
alter table notifications enable row level security;

drop policy if exists watchers_owner_all on watchers;
create policy watchers_owner_all on watchers for all
  using (exists (select 1 from accounts a where a.id = watchers.account_id and a.user_id = auth.uid()::text))
  with check (exists (select 1 from accounts a where a.id = watchers.account_id and a.user_id = auth.uid()::text));

drop policy if exists notifications_owner_all on notifications;
create policy notifications_owner_all on notifications for all
  using (exists (select 1 from accounts a where a.id = notifications.account_id and a.user_id = auth.uid()::text))
  with check (exists (select 1 from accounts a where a.id = notifications.account_id and a.user_id = auth.uid()::text));

-- 4) Demo offers so watchers have something to catch right away.
insert into data_entries (account_id, content, tag, info_type, visibility, is_live_fact)
select id, 'Monsoon Special: 25% off all full-day wedding packages booked this month.', 'offer', 'offer', 'public', false
from accounts where slug = 'shree-photography-studio';

insert into data_entries (account_id, content, tag, info_type, visibility, is_live_fact)
select id, 'Weekend deal: 30% off wedding DJ packages this month.', 'offer', 'offer', 'public', false
from accounts where slug = 'dj-beats-entertainment';

insert into data_entries (account_id, content, tag, info_type, visibility, is_live_fact)
select id, 'Flat 35% off airport transfers and wedding transport this month.', 'offer', 'offer', 'public', false
from accounts where slug = 'luxe-limousine-service';

insert into data_entries (account_id, content, tag, info_type, visibility, is_live_fact)
select id, 'Festive offer: 20% off catering for orders above 100 guests.', 'offer', 'offer', 'public', false
from accounts where slug = 'aroma-catering';

insert into data_entries (account_id, content, tag, info_type, visibility, is_live_fact)
select id, 'Early bird: 15% off venue bookings for next quarter.', 'offer', 'offer', 'public', false
from accounts where slug = 'grand-banquet-hall';

insert into data_entries (account_id, content, tag, info_type, visibility, is_live_fact)
select id, '10% off bridal bouquets this week.', 'offer', 'offer', 'public', false
from accounts where slug = 'bloom-petals-florals';

select 'Phase 1 schema + demo offers ready' as status;
