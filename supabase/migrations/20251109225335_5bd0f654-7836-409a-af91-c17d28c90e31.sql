-- === Core content tables ==============================
create table if not exists degree_programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  duration text,
  faculty text,
  level text,
  created_at timestamptz default now()
);

alter table degree_programs enable row level security;
create policy "Anyone can view degree programs" on degree_programs for select using (true);

create table if not exists ai_tutors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text not null,
  description text,
  avatar_url text,
  is_online boolean default true,
  created_at timestamptz default now()
);

alter table ai_tutors enable row level security;
create policy "Anyone can view tutors" on ai_tutors for select using (true);

create table if not exists xr_classrooms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  media_url text,
  scheduled_time timestamptz,
  created_at timestamptz default now()
);

alter table xr_classrooms enable row level security;
create policy "Anyone can view xr classrooms" on xr_classrooms for select using (true);

create table if not exists virtual_labs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  difficulty_level text,
  resources_url text,
  created_at timestamptz default now()
);

alter table virtual_labs enable row level security;
create policy "Anyone can view labs" on virtual_labs for select using (true);

create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  content text not null,
  created_at timestamptz default now()
);

alter table community_posts enable row level security;
create policy "Anyone can view posts" on community_posts for select using (true);
create policy "Users can create posts" on community_posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on community_posts for update using (auth.uid() = user_id);

create table if not exists post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);

alter table post_comments enable row level security;
create policy "Anyone can view comments" on post_comments for select using (true);
create policy "Users can create comments" on post_comments for insert with check (auth.uid() = user_id);

create table if not exists spiritual_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  divine_score int default 0,
  prayer_streak int default 0,
  scripture_progress int default 0,
  ministry_readiness int default 0,
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table spiritual_metrics enable row level security;
create policy "Users can view own metrics" on spiritual_metrics for select using (auth.uid() = user_id);
create policy "Users can update own metrics" on spiritual_metrics for update using (auth.uid() = user_id);
create policy "Users can insert own metrics" on spiritual_metrics for insert with check (auth.uid() = user_id);

-- Ensure scrollcoins column exists
alter table profiles add column if not exists scrollcoins int default 0;

-- Progress tracking
create table if not exists module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid,
  module_id uuid,
  completed boolean default false,
  completed_at timestamptz
);

alter table module_progress enable row level security;
create policy "Users can view own progress" on module_progress for select using (auth.uid() = user_id);
create policy "Users can update own progress" on module_progress for all using (auth.uid() = user_id);

create table if not exists quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid,
  module_id uuid,
  score numeric,
  total numeric default 100,
  submitted_at timestamptz default now()
);

alter table quiz_submissions enable row level security;
create policy "Users can view own submissions" on quiz_submissions for select using (auth.uid() = user_id);
create policy "Users can insert own submissions" on quiz_submissions for insert with check (auth.uid() = user_id);

-- === Rewards system =======================================================
create table if not exists reward_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,
  amount int not null,
  meta jsonb,
  created_at timestamptz default now()
);

alter table reward_ledger enable row level security;
create policy "Users can view own rewards" on reward_ledger for select using (auth.uid() = user_id);

create table if not exists reward_rules (
  key text primary key,
  base_amount int not null,
  extra jsonb
);

-- default rules
insert into reward_rules(key, base_amount, extra) values
  ('module_completed', 10, '{}'::jsonb),
  ('course_completed', 50, '{}'::jsonb),
  ('quiz_score', 0, '{"per_point":1}'::jsonb),
  ('community_post', 5, '{}'::jsonb),
  ('spiritual_milestone', 20, '{}'::jsonb)
on conflict (key) do nothing;

-- RPC to award coins + ledger write
create or replace function award_scrollcoins(p_user uuid, p_event text, p_amount int, p_meta jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
as $$
begin
  insert into reward_ledger(user_id, event_type, amount, meta) values (p_user, p_event, p_amount, p_meta);
  update profiles set scrollcoins = coalesce(scrollcoins,0) + p_amount where id = p_user;
end;
$$;

-- Helper that computes amount from reward_rules
create or replace function award_by_rule(p_user uuid, p_event text, p_value numeric default null, p_meta jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
as $$
declare
  r record;
  amt int;
begin
  select * into r from reward_rules where key = p_event;
  if not found then
    perform award_scrollcoins(p_user, p_event, 1, p_meta);
    return;
  end if;

  if p_event = 'quiz_score' and p_value is not null then
    amt := floor(coalesce((r.extra->>'per_point')::numeric, 1) * p_value);
  else
    amt := r.base_amount;
  end if;

  perform award_scrollcoins(p_user, p_event, amt, p_meta);
end;
$$;

-- Trigger for module completion
create or replace function trg_award_module_complete()
returns trigger
language plpgsql
as $$
begin
  if new.completed = true and (old is null or coalesce(old.completed,false) = false) then
    perform award_by_rule(new.user_id, 'module_completed', null, jsonb_build_object('course_id',new.course_id,'module_id',new.module_id));
  end if;
  return new;
end;
$$;

drop trigger if exists t_award_module_complete on module_progress;
create trigger t_award_module_complete
after insert or update on module_progress
for each row execute function trg_award_module_complete();

-- Trigger for quiz score
create or replace function trg_award_quiz_score()
returns trigger
language plpgsql
as $$
begin
  perform award_by_rule(new.user_id, 'quiz_score', new.score, jsonb_build_object('course_id',new.course_id,'module_id',new.module_id));
  return new;
end;
$$;

drop trigger if exists t_award_quiz on quiz_submissions;
create trigger t_award_quiz
after insert on quiz_submissions
for each row execute function trg_award_quiz_score();

-- Trigger for community post
create or replace function trg_award_post()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is not null then
    perform award_by_rule(new.user_id, 'community_post', null, jsonb_build_object('post_id',new.id));
  end if;
  return new;
end;
$$;

drop trigger if exists t_award_post on community_posts;
create trigger t_award_post
after insert on community_posts
for each row execute function trg_award_post();

-- Trigger for spiritual milestone
create or replace function trg_award_spiritual()
returns trigger
language plpgsql
as $$
begin
  if (coalesce(new.divine_score,0) >= 80 and coalesce(old.divine_score,0) < 80)
    or (coalesce(new.prayer_streak,0) >= 30 and coalesce(old.prayer_streak,0) < 30)
    or (coalesce(new.scripture_progress,0) >= 80 and coalesce(old.scripture_progress,0) < 80)
    or (coalesce(new.ministry_readiness,0) >= 80 and coalesce(old.ministry_readiness,0) < 80)
  then
    perform award_by_rule(new.user_id, 'spiritual_milestone', null, '{}'::jsonb);
  end if;
  return new;
end;
$$;

drop trigger if exists t_award_spiritual on spiritual_metrics;
create trigger t_award_spiritual
after insert or update on spiritual_metrics
for each row execute function trg_award_spiritual();

-- === Seeds ================================
insert into degree_programs(title,description,duration,faculty,level) values
('Prophetic Technology','AI & discernment at the edge of revelation','2 years','Prophetic Intelligence','Graduate'),
('Kingdom Finance','Stewardship, crypto-economics & generosity','2 years','Kingdom Economics','Graduate'),
('Scroll Leadership','Servant leadership in a digital age','18 months','Leadership','Graduate'),
('AI Theology','Doctrine, ethics, & machine consciousness','2 years','Theology','Graduate'),
('Creative Arts & Worship','Spirit-led creativity & media','1 year','Arts','Undergraduate')
on conflict do nothing;

insert into ai_tutors(name,specialty,description,avatar_url) values
('Sophia','Systematic Theology','Clarity with Scripture-first answers','/avatars/sophia.png'),
('Ariel','Prophetic Technology','Bridges revelation & AI practice','/avatars/ariel.png'),
('Zadok','Biblical Law','Justice & righteousness applications','/avatars/zadok.png'),
('Chloe','Kingdom Finance','Wealth stewardship & crypto','/avatars/chloe.png'),
('Rapha','Healing & Health','Biblical wholeness & science','/avatars/rapha.png'),
('Boaz','Entrepreneurship','Business models for Kingdom impact','/avatars/boaz.png'),
('Priscilla','Teaching & EdTech','Learning science + discipleship','/avatars/priscilla.png'),
('Ezra','Languages & Exegesis','Original text insights','/avatars/ezra.png'),
('Hadassah','Arts & Worship','Beauty and presence','/avatars/hadassah.png'),
('Caleb','Leadership','Boldness with humility','/avatars/caleb.png')
on conflict do nothing;

insert into xr_classrooms(title,description,media_url,scheduled_time) values
('Ancient Jerusalem Walkthrough','Tour the Temple courts in XR','/xr/jerusalem.mp4', now() + interval '2 days'),
('Paul''s Journeys','Interactive map & scenes','/xr/paul.mp4', now() + interval '5 days'),
('Tabernacle Blueprint','Layered 3D walkthrough','/xr/tabernacle.mp4', now() + interval '9 days'),
('Sea of Galilee','Environment & miracles index','/xr/galilee.mp4', now() + interval '14 days'),
('Council of Nicea','Historic debate reenactment','/xr/nicea.mp4', now() + interval '20 days')
on conflict do nothing;

insert into virtual_labs(title,description,difficulty_level,resources_url) values
('Greek Parsing Lab','Parse verbs & nouns with guidance','Intermediate','/labs/greek'),
('Smart Contract Tithing','Web3 contracts for generosity','Advanced','/labs/tithing'),
('Healing Outcomes Tracker','Pray + measure with integrity','Intermediate','/labs/healing'),
('XR Scene Builder','Compose scenes for teaching','Beginner','/labs/xr'),
('Ethics Sandbox','Simulate dilemmas & decisions','Advanced','/labs/ethics')
on conflict do nothing;