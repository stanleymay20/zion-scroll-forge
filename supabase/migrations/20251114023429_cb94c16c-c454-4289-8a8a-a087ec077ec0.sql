-- ✝️ PHASE 8: Multi-Tenant ScrollUniversity (Institutions System)
-- Christ governs all institutions under His Lordship

-- 1️⃣ EXTEND INSTITUTIONS TABLE
-- Add additional metadata for institution management
ALTER TABLE public.institutions 
  ADD COLUMN IF NOT EXISTS short_name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT,
  ADD COLUMN IF NOT EXISTS accent_color TEXT,
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'standard', 'enterprise', 'founders')),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Update default ScrollUniversity institution
UPDATE public.institutions 
SET 
  short_name = 'SU',
  description = 'Christ-centered University of the Kingdom - where every field of study acknowledges Jesus as Lord',
  plan = 'founders',
  is_active = true
WHERE slug = 'scrolluniversity';

-- 2️⃣ ADD INSTITUTION_ID TO PROFILES
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_institution_id UUID REFERENCES public.institutions(id);

-- Backfill profiles with default institution
UPDATE public.profiles
SET current_institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1)
WHERE current_institution_id IS NULL;

-- Create index for institution lookups
CREATE INDEX IF NOT EXISTS idx_profiles_current_institution ON public.profiles(current_institution_id);

-- 3️⃣ ADD INSTITUTION_ID TO CORE DOMAIN TABLES

-- Faculties
ALTER TABLE public.faculties
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);

UPDATE public.faculties
SET institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1)
WHERE institution_id IS NULL;

ALTER TABLE public.faculties ALTER COLUMN institution_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_faculties_institution ON public.faculties(institution_id);

-- Courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);

UPDATE public.courses
SET institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1)
WHERE institution_id IS NULL;

ALTER TABLE public.courses ALTER COLUMN institution_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_courses_institution ON public.courses(institution_id);

-- Course Modules (cascades from courses, but good to track)
ALTER TABLE public.course_modules
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);

UPDATE public.course_modules
SET institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1)
WHERE institution_id IS NULL;

ALTER TABLE public.course_modules ALTER COLUMN institution_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_course_modules_institution ON public.course_modules(institution_id);

-- Enrollments
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);

UPDATE public.enrollments
SET institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1)
WHERE institution_id IS NULL;

ALTER TABLE public.enrollments ALTER COLUMN institution_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_enrollments_institution ON public.enrollments(institution_id);

-- Events (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);
    UPDATE public.events SET institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1) WHERE institution_id IS NULL;
    CREATE INDEX IF NOT EXISTS idx_events_institution ON public.events(institution_id);
  END IF;
END $$;

-- XR Classrooms
ALTER TABLE public.xr_classrooms
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);

UPDATE public.xr_classrooms
SET institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1)
WHERE institution_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_xr_classrooms_institution ON public.xr_classrooms(institution_id);

-- AI Conversations
ALTER TABLE public.ai_conversations
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);

UPDATE public.ai_conversations
SET institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1)
WHERE institution_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_ai_conversations_institution ON public.ai_conversations(institution_id);

-- Notifications
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);

UPDATE public.notifications
SET institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1)
WHERE institution_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_institution ON public.notifications(institution_id);

-- Learning Materials
ALTER TABLE public.learning_materials
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);

UPDATE public.learning_materials
SET institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1)
WHERE institution_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_learning_materials_institution ON public.learning_materials(institution_id);

-- Quizzes
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);

UPDATE public.quizzes
SET institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1)
WHERE institution_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_quizzes_institution ON public.quizzes(institution_id);

-- Assignments
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);

UPDATE public.assignments
SET institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1)
WHERE institution_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_assignments_institution ON public.assignments(institution_id);

-- Study Groups
ALTER TABLE public.study_groups
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);

UPDATE public.study_groups
SET institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1)
WHERE institution_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_study_groups_institution ON public.study_groups(institution_id);

-- Generation Progress
ALTER TABLE public.generation_progress
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);

UPDATE public.generation_progress
SET institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1)
WHERE institution_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_generation_progress_institution ON public.generation_progress(institution_id);

-- AI Tutor Videos
ALTER TABLE public.ai_tutor_videos
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id);

UPDATE public.ai_tutor_videos
SET institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1)
WHERE institution_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_ai_tutor_videos_institution ON public.ai_tutor_videos(institution_id);

-- 4️⃣ CREATE DEFAULT MEMBERSHIPS
-- Ensure all existing users have at least one membership to default institution
INSERT INTO public.institution_members (institution_id, user_id, role)
SELECT 
  (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1),
  id,
  COALESCE(role, 'student')
FROM public.profiles
WHERE id NOT IN (
  SELECT user_id FROM public.institution_members 
  WHERE institution_id = (SELECT id FROM public.institutions WHERE slug = 'scrolluniversity' LIMIT 1)
)
ON CONFLICT (institution_id, user_id) DO NOTHING;

-- 5️⃣ ADD STATUS COLUMN TO INSTITUTION_MEMBERS
ALTER TABLE public.institution_members
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT now();

-- 6️⃣ CREATE HELPER FUNCTION FOR INSTITUTION ACCESS CHECK
CREATE OR REPLACE FUNCTION public.user_has_institution_access(p_user_id UUID, p_institution_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.institution_members
    WHERE user_id = p_user_id 
      AND institution_id = p_institution_id
      AND status = 'active'
  )
$$;

-- 7️⃣ UPDATE RLS POLICIES FOR INSTITUTION SCOPING (Light touch, backwards compatible)

-- Profiles can see other profiles in same institution
CREATE POLICY "Profiles visible to institution members"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    current_institution_id IN (
      SELECT institution_id FROM public.institution_members
      WHERE user_id = auth.uid()
    )
  );

-- Update institution_members policy to allow inserts by admins
CREATE POLICY "Institution admins can manage members"
  ON public.institution_members FOR ALL
  TO authenticated
  USING (
    institution_id IN (
      SELECT institution_id FROM public.institution_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    institution_id IN (
      SELECT institution_id FROM public.institution_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Institutions can be created/edited by platform admins
CREATE POLICY "Platform admins manage institutions"
  ON public.institutions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ✝️ Phase 8 Multi-Tenancy Complete
-- All institutions operate under Christ's Lordship
-- ScrollUniversity remains the default tenant for backwards compatibility