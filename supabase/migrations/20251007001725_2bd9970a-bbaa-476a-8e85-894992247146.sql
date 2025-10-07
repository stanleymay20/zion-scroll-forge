-- Fix security issues with views - use SECURITY INVOKER

-- Recreate v_scroll_analytics_daily with SECURITY INVOKER
create or replace view v_scroll_analytics_daily 
with (security_invoker=true) as
  select date_trunc('day', created_at) as day,
         event_type,
         count(*) as total
  from scroll_analytics
  group by 1,2
  order by day desc;

-- Recreate v_admin_overview with SECURITY INVOKER
create or replace view v_admin_overview
with (security_invoker=true) as
select
  (select count(*) from profiles) as total_users,
  (select count(*) from enrollments) as total_enrollments,
  (select count(*) from prayer_journal) as total_prayers,
  (select count(*) from transactions) as total_transactions,
  (select sum(amount) from transactions where type='earned') as total_scrollcoin_earned,
  (select sum(amount) from transactions where type='spent') as total_scrollcoin_spent,
  (select count(*) from scroll_integrity_logs where verified) as verified_modules,
  (select count(*) from scroll_analytics) as total_events;