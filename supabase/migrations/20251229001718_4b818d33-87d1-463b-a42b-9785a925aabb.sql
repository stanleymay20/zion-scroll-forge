-- ========================================
-- SUYAS Complete Database Schema
-- Scroll University Year Automation System
-- ========================================

-- ========================================
-- 1. Add status column to academic_years if missing
-- ========================================
ALTER TABLE public.academic_years 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS created_by uuid;

-- ========================================
-- 2. Update semesters table to link properly with academic_years
-- ========================================
ALTER TABLE public.semesters 
ADD COLUMN IF NOT EXISTS term_type text DEFAULT 'semester',
ADD COLUMN IF NOT EXISTS registration_open boolean DEFAULT false;

-- ========================================
-- 3. Registration Windows Table
-- ========================================
CREATE TABLE IF NOT EXISTS public.registration_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id uuid REFERENCES public.semesters(id) ON DELETE CASCADE,
  open_at timestamp with time zone NOT NULL,
  close_at timestamp with time zone NOT NULL,
  audience text NOT NULL DEFAULT 'all',
  rules_json jsonb DEFAULT '{}',
  priority_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT registration_window_dates CHECK (close_at > open_at)
);

-- ========================================
-- 4. Enrollment Records Table (enhanced)
-- ========================================
CREATE TABLE IF NOT EXISTS public.enrollment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_offering_id uuid REFERENCES public.course_offerings(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  term_id uuid REFERENCES public.semesters(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'enrolled',
  enrolled_at timestamp with time zone DEFAULT now(),
  dropped_at timestamp with time zone,
  grade text,
  grade_points numeric(3,2),
  credits_earned integer DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- 5. Academic Deadlines Table
-- ========================================
CREATE TABLE IF NOT EXISTS public.academic_deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id uuid REFERENCES public.semesters(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE CASCADE,
  deadline_type text NOT NULL,
  title text NOT NULL,
  description text,
  due_at timestamp with time zone NOT NULL,
  audience text DEFAULT 'all',
  is_published boolean DEFAULT false,
  reminder_sent boolean DEFAULT false,
  reminder_days_before integer[] DEFAULT '{7,3,1}',
  metadata jsonb DEFAULT '{}',
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- 6. Faculty Workloads Table
-- ========================================
CREATE TABLE IF NOT EXISTS public.faculty_workloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id uuid REFERENCES public.semesters(id) ON DELETE CASCADE,
  faculty_id uuid NOT NULL,
  max_courses integer DEFAULT 4,
  max_hours integer DEFAULT 20,
  max_students integer DEFAULT 120,
  assigned_courses integer DEFAULT 0,
  assigned_hours integer DEFAULT 0,
  assigned_students integer DEFAULT 0,
  overload_approved boolean DEFAULT false,
  overload_approved_by uuid,
  overload_approved_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(term_id, faculty_id)
);

-- ========================================
-- 7. Graduation Requirements Table
-- ========================================
CREATE TABLE IF NOT EXISTS public.graduation_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid,
  faculty_id uuid REFERENCES public.faculties(id) ON DELETE SET NULL,
  degree_level text NOT NULL,
  requirement_name text NOT NULL,
  min_credits integer DEFAULT 120,
  min_gpa numeric(3,2) DEFAULT 2.0,
  required_courses uuid[] DEFAULT '{}',
  elective_credits integer DEFAULT 30,
  capstone_required boolean DEFAULT true,
  spiritual_formation_required boolean DEFAULT true,
  rules_json jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- 8. Enhance student_holds table
-- ========================================
ALTER TABLE public.student_holds
ADD COLUMN IF NOT EXISTS hold_type text DEFAULT 'administrative',
ADD COLUMN IF NOT EXISTS blocks_registration boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS blocks_graduation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS blocks_transcript boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS placed_by uuid,
ADD COLUMN IF NOT EXISTS placed_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS resolved_by uuid,
ADD COLUMN IF NOT EXISTS resolution_notes text;

-- ========================================
-- 9. Student Profiles Enhancement (lifecycle status)
-- ========================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS lifecycle_status text DEFAULT 'applicant',
ADD COLUMN IF NOT EXISTS admitted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS enrolled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS graduated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS withdrawn_at timestamp with time zone;

-- ========================================
-- 10. Enhance suyas_audit_logs for comprehensive tracking
-- ========================================
ALTER TABLE public.suyas_audit_logs
ADD COLUMN IF NOT EXISTS old_value jsonb,
ADD COLUMN IF NOT EXISTS new_value jsonb,
ADD COLUMN IF NOT EXISTS reason text,
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS user_agent text;

-- ========================================
-- RLS POLICIES
-- ========================================

-- Registration Windows
ALTER TABLE public.registration_windows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view registration windows" ON public.registration_windows;
CREATE POLICY "Anyone can view registration windows" ON public.registration_windows
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage registration windows" ON public.registration_windows;
CREATE POLICY "Admins can manage registration windows" ON public.registration_windows
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Enrollment Records
ALTER TABLE public.enrollment_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own enrollment records" ON public.enrollment_records;
CREATE POLICY "Users can view own enrollment records" ON public.enrollment_records
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins and registrars can manage enrollments" ON public.enrollment_records;
CREATE POLICY "Admins and registrars can manage enrollments" ON public.enrollment_records
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Academic Deadlines
ALTER TABLE public.academic_deadlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published deadlines" ON public.academic_deadlines;
CREATE POLICY "Anyone can view published deadlines" ON public.academic_deadlines
  FOR SELECT USING (is_published = true OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'faculty'));

DROP POLICY IF EXISTS "Admins can manage deadlines" ON public.academic_deadlines;
CREATE POLICY "Admins can manage deadlines" ON public.academic_deadlines
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Faculty Workloads
ALTER TABLE public.faculty_workloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Faculty can view own workload" ON public.faculty_workloads;
CREATE POLICY "Faculty can view own workload" ON public.faculty_workloads
  FOR SELECT USING (auth.uid() = faculty_id OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage all workloads" ON public.faculty_workloads;
CREATE POLICY "Admins can manage all workloads" ON public.faculty_workloads
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Graduation Requirements
ALTER TABLE public.graduation_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view graduation requirements" ON public.graduation_requirements;
CREATE POLICY "Anyone can view graduation requirements" ON public.graduation_requirements
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage graduation requirements" ON public.graduation_requirements;
CREATE POLICY "Admins can manage graduation requirements" ON public.graduation_requirements
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ========================================
-- INDEXES for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_enrollment_records_user ON enrollment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_records_term ON enrollment_records(term_id);
CREATE INDEX IF NOT EXISTS idx_academic_deadlines_due ON academic_deadlines(due_at);
CREATE INDEX IF NOT EXISTS idx_faculty_workloads_term ON faculty_workloads(term_id);
CREATE INDEX IF NOT EXISTS idx_student_holds_user ON student_holds(user_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_schedule ON class_sessions(day_of_week, start_time, end_time);