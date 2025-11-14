-- Add institution_id to ai_tutors table for multi-tenancy
ALTER TABLE public.ai_tutors 
ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);

-- Backfill existing tutors to ScrollUniversity institution
UPDATE public.ai_tutors
SET institution_id = (
  SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1
)
WHERE institution_id IS NULL;

-- Create ai_tutor_sessions table if not exists
CREATE TABLE IF NOT EXISTS public.ai_tutor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES public.ai_tutors(id) ON DELETE SET NULL,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE SET NULL,
  institution_id UUID NOT NULL REFERENCES public.institutions(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  total_messages INTEGER DEFAULT 0,
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_tutor_sessions ENABLE ROW LEVEL SECURITY;

-- Create ai_tutor_messages table if not exists
CREATE TABLE IF NOT EXISTS public.ai_tutor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.ai_tutor_sessions(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'tutor', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_tutor_messages ENABLE ROW LEVEL SECURITY;

-- Add institution_id to ai_tutor_interactions if missing
ALTER TABLE public.ai_tutor_interactions 
ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);

UPDATE public.ai_tutor_interactions
SET institution_id = (
  SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1
)
WHERE institution_id IS NULL;

-- RLS Policies for ai_tutors
DROP POLICY IF EXISTS "Anyone can view ai_tutors" ON public.ai_tutors;
CREATE POLICY "Users can view tutors in their institution"
  ON public.ai_tutors FOR SELECT
  USING (
    institution_id IN (
      SELECT institution_id FROM public.institution_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- RLS Policies for ai_tutor_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.ai_tutor_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON public.ai_tutor_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.ai_tutor_sessions;

CREATE POLICY "Users can view own sessions"
  ON public.ai_tutor_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own sessions"
  ON public.ai_tutor_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON public.ai_tutor_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for ai_tutor_messages  
DROP POLICY IF EXISTS "Users can view messages from own sessions" ON public.ai_tutor_messages;
DROP POLICY IF EXISTS "Users can create messages in own sessions" ON public.ai_tutor_messages;

CREATE POLICY "Users can view messages from own sessions"
  ON public.ai_tutor_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.ai_tutor_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own sessions"
  ON public.ai_tutor_messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.ai_tutor_sessions WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for ai_tutor_interactions
DROP POLICY IF EXISTS "Users can view own interactions" ON public.ai_tutor_interactions;
DROP POLICY IF EXISTS "System can create interactions" ON public.ai_tutor_interactions;

CREATE POLICY "Users can view own interactions"
  ON public.ai_tutor_interactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create interactions"
  ON public.ai_tutor_interactions FOR INSERT
  WITH CHECK (true);

-- Faculty and admin can view all interactions in their institution
CREATE POLICY "Faculty can view institution interactions"
  ON public.ai_tutor_interactions FOR SELECT
  USING (
    has_role(auth.uid(), 'faculty'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'superadmin'::app_role)
  );