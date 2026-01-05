
-- Add missing columns to profiles for leaderboard
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_xp integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS courses_completed integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_on_leaderboard boolean DEFAULT true;

-- Fix leaderboard view - convert from security definer to security invoker
DROP VIEW IF EXISTS leaderboard;
CREATE OR REPLACE VIEW leaderboard WITH (security_invoker = true) AS
SELECT 
  p.id as user_id,
  p.full_name as display_name,
  p.avatar_url,
  COALESCE(p.total_xp, 0) as total_xp,
  COALESCE(p.scrollcoins, 0) as total_scrollcoins,
  COALESCE(p.courses_completed, 0) as courses_completed,
  COALESCE(p.current_streak, 0) as current_streak,
  COALESCE(p.longest_streak, 0) as longest_streak,
  0 as badges_earned
FROM profiles p
WHERE p.display_on_leaderboard = true OR p.display_on_leaderboard IS NULL
ORDER BY p.total_xp DESC NULLS LAST;

COMMENT ON COLUMN profiles.display_on_leaderboard IS 'Whether user appears on public leaderboard';
