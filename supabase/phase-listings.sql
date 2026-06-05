-- ============================================================
-- Hanubees: structured Listings (one account -> many listings)
-- Run in: https://supabase.com/dashboard/project/whfxrovgvulmhqkhumuz/sql/new
-- Adds the listing object + demo listings across new verticals so discovery
-- (concierge clarify-then-match) works for secondhand / real estate / rentals /
-- tuition-services / goods transport.
-- ============================================================

-- 1) Listings table
create table if not exists listings (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references accounts(id) on delete cascade,
  vertical    text not null,                 -- services|secondhand|realestate|rental|b2b|transport|product
  title       text not null,
  description text,
  price       numeric,                       -- nullable; top-level for easy filter/sort
  area        text,                          -- locality within the city
  status      text not null default 'active',-- active|sold|paused
  attributes  jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_listings_account on listings(account_id, status);
create index if not exists idx_listings_discover on listings(vertical, status, price);

-- 2) RLS: anyone reads active listings; owner manages own
alter table listings enable row level security;

drop policy if exists listings_public_read on listings;
create policy listings_public_read on listings for select using (
  status = 'active'
  or exists (select 1 from accounts a where a.id = listings.account_id and a.user_id = auth.uid()::text)
);
drop policy if exists listings_owner_all on listings;
create policy listings_owner_all on listings for all
  using (exists (select 1 from accounts a where a.id = listings.account_id and a.user_id = auth.uid()::text))
  with check (exists (select 1 from accounts a where a.id = listings.account_id and a.user_id = auth.uid()::text));

-- 3) Demo provider accounts for the new verticals (idempotent on slug)
insert into accounts (user_id, type, name, slug, bee_name, category, city, bio, phone) values
  ('demo-realty-1','business','Coimbatore Homes Realty','coimbatore-homes-realty','cbehomes','Real Estate','Coimbatore','Flats, villas and plots across Coimbatore.','+91 90000 10001'),
  ('demo-used-1','business','Anand Used Cars & Bikes','anand-used-cars','anandused','Secondhand Vehicles','Coimbatore','Verified pre-owned two & four wheelers.','+91 90000 10002'),
  ('demo-tuition-1','business','Priya Maths & Science Tuition','priya-tuition','priyatuition','Tuition','Coimbatore','Home & batch tuition, classes 8-12.','+91 90000 10003'),
  ('demo-rentals-1','business','Easy Rentals Coimbatore','easy-rentals-coimbatore','easyrentals','Rentals','Coimbatore','Rent chairs, cameras, equipment by the day.','+91 90000 10004'),
  ('demo-transport-1','business','SKR Goods Transport','skr-goods-transport','skrtransport','Goods Transport','Coimbatore','Mini trucks & tempos for in-city and inter-city goods.','+91 90000 10005')
on conflict (slug) do nothing;

-- 4) Demo listings
insert into listings (account_id, vertical, title, description, price, area, status)
select id, 'realestate', '2BHK flat for sale', 'Semi-furnished, 2nd floor, 950 sqft, covered parking.', 4500000, 'Saibaba Colony', 'active' from accounts where slug='coimbatore-homes-realty';
insert into listings (account_id, vertical, title, description, price, area, status)
select id, 'realestate', '3BHK villa for sale', '3 bath, car park, 1800 sqft, gated community.', 9500000, 'Vadavalli', 'active' from accounts where slug='coimbatore-homes-realty';
insert into listings (account_id, vertical, title, description, price, area, status)
select id, 'rental', '2BHK flat for rent', 'Semi-furnished, family preferred, 1st floor.', 14000, 'Race Course', 'active' from accounts where slug='coimbatore-homes-realty';
insert into listings (account_id, vertical, title, description, price, area, status)
select id, 'rental', '1BHK for rent', 'Bachelors ok, near bus stand.', 8000, 'Gandhipuram', 'active' from accounts where slug='coimbatore-homes-realty';

insert into listings (account_id, vertical, title, description, price, area, status)
select id, 'secondhand', '2019 Honda Activa 5G', '18,000 km, single owner, new battery, well maintained.', 65000, 'Peelamedu', 'active' from accounts where slug='anand-used-cars';
insert into listings (account_id, vertical, title, description, price, area, status)
select id, 'secondhand', '2017 Maruti Swift VDI', '45,000 km, diesel, insured till 2026, second owner.', 450000, 'RS Puram', 'active' from accounts where slug='anand-used-cars';

insert into listings (account_id, vertical, title, description, price, area, status)
select id, 'services', 'Maths & Physics tuition (classes 8-12)', 'CBSE & State board, evening batches, small groups.', 3000, 'Gandhipuram', 'active' from accounts where slug='priya-tuition';

insert into listings (account_id, vertical, title, description, price, area, status)
select id, 'rental', 'Party chairs & tables on rent', '₹20 per chair per day, delivery within city.', 20, 'Town Hall', 'active' from accounts where slug='easy-rentals-coimbatore';
insert into listings (account_id, vertical, title, description, price, area, status)
select id, 'rental', 'DSLR camera kit on rent', 'Canon 90D + 2 lenses, ₹800/day, ID deposit.', 800, 'Saibaba Colony', 'active' from accounts where slug='easy-rentals-coimbatore';

insert into listings (account_id, vertical, title, description, price, area, status)
select id, 'transport', 'Tata Ace (1 ton) for goods', 'In-city goods moving, ₹1500/trip, call to book.', 1500, 'Ukkadam', 'active' from accounts where slug='skr-goods-transport';
insert into listings (account_id, vertical, title, description, price, area, status)
select id, 'transport', 'Tempo (3 ton) for goods', 'Inter-city goods moving, price on distance.', 3000, 'Peelamedu', 'active' from accounts where slug='skr-goods-transport';

select 'Listings ready: ' || count(*) || ' demo listings' as status from listings;
