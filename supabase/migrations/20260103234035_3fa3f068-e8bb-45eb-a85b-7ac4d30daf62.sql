-- Create degree_course_requirements table for mapping courses to degree programs
CREATE TABLE IF NOT EXISTS public.degree_course_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  degree_id UUID NOT NULL REFERENCES public.degree_programs(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  is_required BOOLEAN NOT NULL DEFAULT true,
  credits INTEGER NOT NULL DEFAULT 3,
  semester_recommended INTEGER,
  prerequisite_course_id UUID REFERENCES public.courses(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(degree_id, course_id)
);

-- Enable RLS
ALTER TABLE public.degree_course_requirements ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view degree course requirements"
  ON public.degree_course_requirements FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage degree course requirements"
  ON public.degree_course_requirements FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create student_degree_enrollments table
CREATE TABLE IF NOT EXISTS public.student_degree_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  degree_id UUID NOT NULL REFERENCES public.degree_programs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed', 'withdrawn')),
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expected_graduation TIMESTAMP WITH TIME ZONE,
  actual_graduation TIMESTAMP WITH TIME ZONE,
  credits_completed INTEGER NOT NULL DEFAULT 0,
  credits_required INTEGER NOT NULL DEFAULT 120,
  gpa NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, degree_id)
);

-- Enable RLS
ALTER TABLE public.student_degree_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS policies for student degree enrollments
CREATE POLICY "Users can view own degree enrollments"
  ON public.student_degree_enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own degree enrollments"
  ON public.student_degree_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own degree enrollments"
  ON public.student_degree_enrollments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all degree enrollments"
  ON public.student_degree_enrollments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Update degree_programs with additional fields
ALTER TABLE public.degree_programs 
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id),
  ADD COLUMN IF NOT EXISTS total_credits INTEGER DEFAULT 120,
  ADD COLUMN IF NOT EXISTS min_gpa NUMERIC(3,2) DEFAULT 2.0,
  ADD COLUMN IF NOT EXISTS spiritual_requirements JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS career_paths TEXT[],
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Seed degree-course requirements for existing programs
INSERT INTO public.degree_course_requirements (degree_id, course_id, is_required, credits, semester_recommended)
SELECT 
  dp.id as degree_id,
  c.id as course_id,
  true as is_required,
  3 as credits,
  CASE 
    WHEN ROW_NUMBER() OVER (PARTITION BY dp.id ORDER BY c.title) <= 4 THEN 1
    WHEN ROW_NUMBER() OVER (PARTITION BY dp.id ORDER BY c.title) <= 8 THEN 2
    WHEN ROW_NUMBER() OVER (PARTITION BY dp.id ORDER BY c.title) <= 12 THEN 3
    ELSE 4
  END as semester_recommended
FROM public.degree_programs dp
CROSS JOIN LATERAL (
  SELECT * FROM public.courses c
  WHERE c.faculty ILIKE '%' || SPLIT_PART(dp.faculty, ' ', 1) || '%'
     OR c.faculty ILIKE '%' || dp.faculty || '%'
     OR dp.title ILIKE '%' || c.faculty || '%'
  LIMIT 12
) c
ON CONFLICT (degree_id, course_id) DO NOTHING;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_degree_course_requirements_degree ON public.degree_course_requirements(degree_id);
CREATE INDEX IF NOT EXISTS idx_degree_course_requirements_course ON public.degree_course_requirements(course_id);
CREATE INDEX IF NOT EXISTS idx_student_degree_enrollments_user ON public.student_degree_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_student_degree_enrollments_degree ON public.student_degree_enrollments(degree_id);