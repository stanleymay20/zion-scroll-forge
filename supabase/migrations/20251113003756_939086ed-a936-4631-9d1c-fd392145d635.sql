-- Personalized Learning Experience Schema

-- Student Learning Profiles
CREATE TABLE IF NOT EXISTS public.student_learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_style TEXT NOT NULL CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading_writing')),
  preferred_pace TEXT NOT NULL CHECK (preferred_pace IN ('slow', 'moderate', 'fast')),
  study_time_preference JSONB DEFAULT '{"morning": false, "afternoon": false, "evening": false, "night": false}'::jsonb,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enhanced Student Module Progress (extends existing module_progress)
CREATE TABLE IF NOT EXISTS public.student_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  time_spent INTEGER DEFAULT 0, -- in minutes
  attempts INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, module_id)
);

-- Course Recommendations
CREATE TABLE IF NOT EXISTS public.course_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  relevance_score INTEGER NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 100),
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adaptive Quiz Attempts
CREATE TABLE IF NOT EXISTS public.adaptive_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  questions_presented JSONB NOT NULL,
  score INTEGER NOT NULL,
  difficulty_progression JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Study Plans
CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  target_completion_date DATE NOT NULL,
  weekly_hours INTEGER NOT NULL CHECK (weekly_hours > 0),
  daily_schedule JSONB NOT NULL,
  milestones JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Learning Goals
CREATE TABLE IF NOT EXISTS public.learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('course_completion', 'mastery_level', 'scrollcoin_earning', 'study_time')),
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Question Difficulty Ratings (for adaptive quizzes)
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS difficulty_rating INTEGER DEFAULT 3 CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5);

-- Enable RLS
ALTER TABLE public.student_learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_learning_profiles
CREATE POLICY "Users can view own learning profile"
  ON public.student_learning_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning profile"
  ON public.student_learning_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning profile"
  ON public.student_learning_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for student_module_progress
CREATE POLICY "Users can view own module progress"
  ON public.student_module_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own module progress"
  ON public.student_module_progress FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for course_recommendations
CREATE POLICY "Users can view own recommendations"
  ON public.course_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations"
  ON public.course_recommendations FOR INSERT
  WITH CHECK (true);

-- RLS Policies for adaptive_quiz_attempts
CREATE POLICY "Users can view own quiz attempts"
  ON public.adaptive_quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quiz attempts"
  ON public.adaptive_quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for study_plans
CREATE POLICY "Users can manage own study plans"
  ON public.study_plans FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for learning_goals
CREATE POLICY "Users can manage own learning goals"
  ON public.learning_goals FOR ALL
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_learning_profiles_user_id ON public.student_learning_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_module_progress_user_id ON public.student_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_student_module_progress_module_id ON public.student_module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_course_recommendations_user_id ON public.course_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_quiz_attempts_user_id ON public.adaptive_quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON public.study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_goals_user_id ON public.learning_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_goals_status ON public.learning_goals(status);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_learning_profiles_updated_at
  BEFORE UPDATE ON public.student_learning_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_plans_updated_at
  BEFORE UPDATE ON public.study_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();