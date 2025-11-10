-- Create faculties table for the 12 Supreme Scroll Faculties
CREATE TABLE IF NOT EXISTS public.faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  faculty_code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  mission TEXT NOT NULL,
  key_scripture TEXT NOT NULL,
  emblem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add rewards_amount field to course_modules if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'course_modules' AND column_name = 'rewards_amount'
  ) THEN
    ALTER TABLE public.course_modules ADD COLUMN rewards_amount INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create course_materials table
CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'video', 'slides', 'infographic')),
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create academic_terms table
CREATE TABLE IF NOT EXISTS public.academic_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course_offerings table
CREATE TABLE IF NOT EXISTS public.course_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  term_id UUID REFERENCES public.academic_terms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(course_id, term_id)
);

-- Create reward_ledger table for ScrollCoin tracking
CREATE TABLE IF NOT EXISTS public.reward_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('module', 'course', 'quiz')),
  entity_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_ledger ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view faculties" ON public.faculties;
DROP POLICY IF EXISTS "Anyone can view course materials" ON public.course_materials;
DROP POLICY IF EXISTS "Anyone can view quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Anyone can view academic terms" ON public.academic_terms;
DROP POLICY IF EXISTS "Anyone can view course offerings" ON public.course_offerings;
DROP POLICY IF EXISTS "Users can view own reward ledger" ON public.reward_ledger;
DROP POLICY IF EXISTS "System can insert reward ledger" ON public.reward_ledger;

-- Create RLS Policies for public viewing
CREATE POLICY "Anyone can view faculties" ON public.faculties FOR SELECT USING (true);
CREATE POLICY "Anyone can view course materials" ON public.course_materials FOR SELECT USING (true);
CREATE POLICY "Anyone can view quizzes" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Anyone can view quiz questions" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can view academic terms" ON public.academic_terms FOR SELECT USING (true);
CREATE POLICY "Anyone can view course offerings" ON public.course_offerings FOR SELECT USING (true);

-- Create RLS Policies for reward ledger
CREATE POLICY "Users can view own reward ledger" ON public.reward_ledger 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert reward ledger" ON public.reward_ledger 
  FOR INSERT WITH CHECK (true);

-- Create storage bucket for faculty emblems
INSERT INTO storage.buckets (id, name, public) 
VALUES ('faculty-emblems', 'faculty-emblems', true)
ON CONFLICT (id) DO NOTHING;