-- Study Groups Tables
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INT DEFAULT 10,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS study_group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Course Reviews Table
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Achievements Tables
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INT NOT NULL,
  scrollcoin_reward INT DEFAULT 0,
  xp_reward INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- User Stats for Gamification
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INT DEFAULT 0,
  total_scrollcoins INT DEFAULT 0,
  courses_completed INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Study Groups Policies
CREATE POLICY "Public groups viewable by all"
ON study_groups FOR SELECT
USING (is_public = true OR creator_id = auth.uid() OR id IN (
  SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create groups"
ON study_groups FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update groups"
ON study_groups FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete groups"
ON study_groups FOR DELETE
USING (auth.uid() = creator_id);

-- Study Group Members Policies
CREATE POLICY "Members viewable by group members"
ON study_group_members FOR SELECT
USING (group_id IN (
  SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
) OR group_id IN (
  SELECT id FROM study_groups WHERE is_public = true
));

CREATE POLICY "Users can join groups"
ON study_group_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
ON study_group_members FOR DELETE
USING (auth.uid() = user_id);

-- Study Group Messages Policies
CREATE POLICY "Messages viewable by group members"
ON study_group_messages FOR SELECT
USING (group_id IN (
  SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
));

CREATE POLICY "Members can post messages"
ON study_group_messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid())
);

-- Course Reviews Policies
CREATE POLICY "Reviews viewable by all"
ON course_reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create own reviews"
ON course_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
ON course_reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
ON course_reviews FOR DELETE
USING (auth.uid() = user_id);

-- Achievements Policies
CREATE POLICY "Achievements viewable by all"
ON achievements FOR SELECT
USING (true);

CREATE POLICY "User achievements viewable by owner"
ON user_achievements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can award achievements"
ON user_achievements FOR INSERT
WITH CHECK (true);

-- User Stats Policies
CREATE POLICY "Users can view own stats"
ON user_stats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
ON user_stats FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
ON user_stats FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Leaderboard View
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  u.id as user_id,
  p.email,
  us.total_xp,
  us.total_scrollcoins,
  us.courses_completed,
  us.current_streak,
  us.longest_streak,
  COUNT(ua.id) as badges_earned
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_stats us ON u.id = us.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
GROUP BY u.id, p.email, us.total_xp, us.total_scrollcoins, us.courses_completed, us.current_streak, us.longest_streak
ORDER BY us.total_xp DESC NULLS LAST;

-- Enable realtime for study group messages
ALTER TABLE study_group_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE study_group_messages;