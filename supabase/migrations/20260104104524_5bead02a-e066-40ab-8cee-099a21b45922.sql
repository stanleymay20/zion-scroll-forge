-- Fix Security Definer Views - Convert to Security Invoker
-- These views should use the permissions of the querying user, not the view creator

-- Fix leaderboard view
DROP VIEW IF EXISTS public.leaderboard;
CREATE OR REPLACE VIEW public.leaderboard WITH (security_invoker = true) AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.avatar_url,
  p.scrollcoins,
  COALESCE(us.total_xp, 0) as total_xp,
  COALESCE(us.courses_completed, 0) as courses_completed,
  ROW_NUMBER() OVER (ORDER BY COALESCE(us.total_xp, 0) DESC) as rank
FROM profiles p
LEFT JOIN user_stats us ON p.id = us.user_id
WHERE p.scrollcoins > 0 OR COALESCE(us.total_xp, 0) > 0;

-- Fix v_admin_overview view
DROP VIEW IF EXISTS public.v_admin_overview;
CREATE OR REPLACE VIEW public.v_admin_overview WITH (security_invoker = true) AS
SELECT
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM enrollments) as total_enrollments,
  (SELECT COUNT(*) FROM prayer_journal) as total_prayers,
  (SELECT COUNT(*) FROM transactions) as total_transactions,
  (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'earned') as total_scrollcoin_earned,
  (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'spent') as total_scrollcoin_spent,
  (SELECT COUNT(*) FROM scroll_integrity_logs WHERE verified = true) as verified_modules,
  (SELECT COUNT(*) FROM academic_events) as total_events;

-- Fix ai_tutor_analytics view
DROP VIEW IF EXISTS public.ai_tutor_analytics;
CREATE OR REPLACE VIEW public.ai_tutor_analytics WITH (security_invoker = true) AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_interactions,
  AVG(satisfaction_rating) as avg_satisfaction,
  AVG(session_duration) as avg_duration
FROM ai_tutor_interactions
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Add RLS policies for tables without policies

-- reward_rules RLS
ALTER TABLE public.reward_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reward rules"
ON public.reward_rules
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage reward rules"
ON public.reward_rules
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- rubric_criteria RLS
ALTER TABLE public.rubric_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rubric criteria"
ON public.rubric_criteria
FOR SELECT
USING (true);

CREATE POLICY "Faculty can manage rubric criteria"
ON public.rubric_criteria
FOR ALL
USING (has_role(auth.uid(), 'faculty'::app_role));

-- Fix functions without search_path set
CREATE OR REPLACE FUNCTION public.trg_award_module_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  if new.completed = true and (old is null or coalesce(old.completed,false) = false) then
    perform award_by_rule(new.user_id, 'module_completed', null, jsonb_build_object('course_id',new.course_id,'module_id',new.module_id));
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.trg_award_quiz_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  perform award_by_rule(new.user_id, 'quiz_score', new.score, jsonb_build_object('course_id',new.course_id,'module_id',new.module_id));
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.trg_award_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  if new.user_id is not null then
    perform award_by_rule(new.user_id, 'community_post', null, jsonb_build_object('post_id',new.id));
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.trg_award_spiritual()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.increment_post_likes(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.discussion_posts
  SET likes_count = likes_count + 1
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_post_likes(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.discussion_posts
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.award_scrollcoins(p_user uuid, p_event text, p_amount integer, p_meta jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  insert into reward_ledger(user_id, event_type, amount, meta) values (p_user, p_event, p_amount, p_meta);
  update profiles set scrollcoins = coalesce(scrollcoins,0) + p_amount where id = p_user;
end;
$function$;

CREATE OR REPLACE FUNCTION public.award_by_rule(p_user uuid, p_event text, p_value numeric DEFAULT NULL::numeric, p_meta jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;