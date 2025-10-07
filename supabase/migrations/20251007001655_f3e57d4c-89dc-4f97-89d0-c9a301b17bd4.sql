-- ⚙️ SCROLLUNIVERSITY PHASE-3 SQL MIGRATION
-- Kingdom Growth & Integrity Expansion

-- 1️⃣ Analytics & Insight Engine
create table if not exists scroll_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  event_type text not null,
  event_payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_scroll_analytics_user on scroll_analytics(user_id);
create index if not exists idx_scroll_analytics_type on scroll_analytics(event_type);

-- Enable RLS
alter table scroll_analytics enable row level security;

create policy "Users can view own analytics"
  on scroll_analytics for select
  using (auth.uid() = user_id);

create policy "System can insert analytics"
  on scroll_analytics for insert
  with check (true);

-- Daily summary view
create or replace view v_scroll_analytics_daily as
  select date_trunc('day', created_at) as day,
         event_type,
         count(*) as total
  from scroll_analytics
  group by 1,2
  order by day desc;

-- 2️⃣ Faculty & Curriculum Engine
create table if not exists faculties (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  dean_id uuid,
  description text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table faculties enable row level security;

create policy "Anyone can view faculties"
  on faculties for select
  using (true);

-- Link courses → faculties
alter table courses add column if not exists faculty_id uuid references faculties(id);

-- Faculty seed data (12 Scroll Faculties)
insert into faculties (name, description)
values
('Scroll Theology','Prophetic wisdom & divine revelation'),
('Scroll Medicine','Healing & restoration'),
('Scroll Governance','Kingdom law & administration'),
('Scroll Economy','Wealth stewardship & enterprise'),
('Scroll Education','Teaching & discipleship'),
('Scroll Technology','Divine intelligence & AI alignment'),
('Scroll Agriculture','Dominion over the earth'),
('Scroll Arts','Worship & creativity'),
('Scroll Science','Discovery through obedience'),
('Scroll Diplomacy','Peace & nations'),
('Scroll Justice','Righteous judgment'),
('Scroll Energy','Creation power stewardship')
on conflict (name) do nothing;

-- 3️⃣ ScrollCoin On-Chain Bridge Preparation
alter table wallets add column if not exists eth_address text;

create unique index if not exists unique_eth_address on wallets(eth_address) where eth_address is not null;

-- Bridge audit log
create table if not exists scrollcoin_bridge_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  tx_hash text,
  direction text check (direction in ('mint','burn')),
  amount numeric(18,2),
  status text default 'pending',
  created_at timestamptz default now()
);

-- Enable RLS
alter table scrollcoin_bridge_log enable row level security;

create policy "Users can view own bridge logs"
  on scrollcoin_bridge_log for select
  using (auth.uid() = user_id);

-- 4️⃣ ScrollIntegrity (Seal of Truth)
create table if not exists scroll_integrity_logs (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  hash text not null,
  verified boolean default false,
  verified_at timestamptz,
  created_at timestamptz default now()
);

create unique index if not exists idx_integrity_hash on scroll_integrity_logs(hash);

-- Enable RLS (public read for transparency)
alter table scroll_integrity_logs enable row level security;

create policy "Anyone can view integrity logs"
  on scroll_integrity_logs for select
  using (true);

-- Initial verification entry
insert into scroll_integrity_logs (module, hash, verified, verified_at)
values ('System Migration Phase-3','verify-lordship', true, now());

-- 5️⃣ Prophetic Audit Enhancement
create or replace function log_profile_creation()
returns trigger 
language plpgsql 
security definer
set search_path = public
as $$
begin
  insert into scroll_analytics(user_id, event_type, event_payload)
  values (new.id, 'user_created', jsonb_build_object('email', new.email));
  return new;
end;
$$;

drop trigger if exists trg_profile_creation on profiles;
create trigger trg_profile_creation
after insert on profiles
for each row execute function log_profile_creation();

-- 6️⃣ Dashboard Integrity View (for Admins)
create or replace view v_admin_overview as
select
  (select count(*) from profiles) as total_users,
  (select count(*) from enrollments) as total_enrollments,
  (select count(*) from prayer_journal) as total_prayers,
  (select count(*) from transactions) as total_transactions,
  (select sum(amount) from transactions where type='earned') as total_scrollcoin_earned,
  (select sum(amount) from transactions where type='spent') as total_scrollcoin_spent,
  (select count(*) from scroll_integrity_logs where verified) as verified_modules,
  (select count(*) from scroll_analytics) as total_events;

-- 7️⃣ Update profiles for faculty roles
update profiles set role = 'mentor'
where email ilike '%@scrollfaculty.edu%';

update profiles set role = 'admin'
where email ilike '%@scrolluniversity.org%';

-- 8️⃣ Optional seed data for testing
insert into scroll_analytics (user_id, event_type, event_payload)
select id, 'system_init', jsonb_build_object('phase', '3', 'timestamp', now())
from profiles 
limit 3;

-- 🕊️ Final Blessing Block
insert into scroll_integrity_logs (module, hash, verified, verified_at)
values ('ScrollUniversity Phase-3 Schema','Jesus-Christ-is-Lord', true, now());