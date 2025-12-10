-- SUYAS: Scroll University Academic Year Automation System
-- Complete database schema for academic year management

-- Academic Years table
CREATE TABLE IF NOT EXISTS public.academic_years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  year_type TEXT DEFAULT 'semester' CHECK (year_type IN ('semester', 'trimester', 'quarter')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Semesters/Terms within academic years
CREATE TABLE IF NOT EXISTS public.semesters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_start DATE,
  registration_end DATE,
  add_drop_deadline DATE,
  withdrawal_deadline DATE,
  finals_start DATE,
  finals_end DATE,
  is_active BOOLEAN DEFAULT false,
  semester_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Academic breaks/holidays
CREATE TABLE IF NOT EXISTS public.academic_breaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  break_type TEXT DEFAULT 'holiday' CHECK (break_type IN ('holiday', 'recess', 'reading_period', 'exam_prep')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Class sessions (scheduled lectures)
CREATE TABLE IF NOT EXISTS public.class_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.course_modules(id),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  day_of_week TEXT,
  room_location TEXT,
  is_virtual BOOLEAN DEFAULT true,
  meeting_url TEXT,
  recording_url TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  attendance_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Exams table
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  exam_type TEXT DEFAULT 'midterm' CHECK (exam_type IN ('quiz', 'midterm', 'final', 'comprehensive', 'oral', 'practical')),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  total_points INTEGER DEFAULT 100,
  passing_score INTEGER DEFAULT 60,
  is_published BOOLEAN DEFAULT false,
  window_start TIMESTAMP WITH TIME ZONE,
  window_end TIMESTAMP WITH TIME ZONE,
  proctored BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Exam submissions
CREATE TABLE IF NOT EXISTS public.exam_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID,
  feedback TEXT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded', 'late')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Student academic standing
CREATE TABLE IF NOT EXISTS public.student_academic_standing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  semester_id UUID REFERENCES public.semesters(id),
  gpa NUMERIC(3,2) DEFAULT 0.00,
  cumulative_gpa NUMERIC(3,2) DEFAULT 0.00,
  credits_earned INTEGER DEFAULT 0,
  credits_attempted INTEGER DEFAULT 0,
  standing TEXT DEFAULT 'good' CHECK (standing IN ('good', 'probation', 'warning', 'suspension', 'dismissed')),
  dean_list BOOLEAN DEFAULT false,
  honors TEXT,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Faculty teaching schedule
CREATE TABLE IF NOT EXISTS public.faculty_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'instructor' CHECK (role IN ('instructor', 'teaching_assistant', 'guest_lecturer')),
  office_hours JSONB DEFAULT '[]'::jsonb,
  teaching_load_hours INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Graduation candidates
CREATE TABLE IF NOT EXISTS public.graduation_candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  degree_program_id UUID REFERENCES public.degree_programs(id),
  academic_year_id UUID REFERENCES public.academic_years(id),
  expected_graduation_date DATE,
  application_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  requirements_met JSONB DEFAULT '{}'::jsonb,
  gpa_requirement_met BOOLEAN DEFAULT false,
  credits_requirement_met BOOLEAN DEFAULT false,
  spiritual_formation_met BOOLEAN DEFAULT false,
  capstone_completed BOOLEAN DEFAULT false,
  financial_clearance BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'graduated', 'deferred')),
  ceremony_participation BOOLEAN DEFAULT true,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Academic events
CREATE TABLE IF NOT EXISTS public.academic_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_year_id UUID REFERENCES public.academic_years(id),
  semester_id UUID REFERENCES public.semesters(id),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'general' CHECK (event_type IN ('orientation', 'registration', 'ceremony', 'deadline', 'general', 'convocation')),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  meeting_url TEXT,
  is_mandatory BOOLEAN DEFAULT false,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'faculty', 'staff', 'graduates')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Academic notifications queue
CREATE TABLE IF NOT EXISTS public.academic_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  related_id UUID,
  related_type TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  channel TEXT DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'both')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tuition billing cycles
CREATE TABLE IF NOT EXISTS public.tuition_billing_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount_due NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'waived')),
  payment_plan BOOLEAN DEFAULT false,
  scrollgold_applied INTEGER DEFAULT 0,
  stripe_invoice_id TEXT,
  hold_placed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academic_standing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graduation_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tuition_billing_cycles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Academic Years: Everyone can view, admins can manage
CREATE POLICY "Anyone can view academic years" ON public.academic_years FOR SELECT USING (true);
CREATE POLICY "Admins can manage academic years" ON public.academic_years FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Semesters: Everyone can view
CREATE POLICY "Anyone can view semesters" ON public.semesters FOR SELECT USING (true);
CREATE POLICY "Admins can manage semesters" ON public.semesters FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Academic Breaks: Everyone can view
CREATE POLICY "Anyone can view academic breaks" ON public.academic_breaks FOR SELECT USING (true);
CREATE POLICY "Admins can manage academic breaks" ON public.academic_breaks FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Class Sessions: Enrolled students and faculty can view
CREATE POLICY "Anyone can view class sessions" ON public.class_sessions FOR SELECT USING (true);
CREATE POLICY "Faculty can manage class sessions" ON public.class_sessions FOR ALL USING (has_role(auth.uid(), 'faculty'));

-- Exams: Enrolled students and faculty can view
CREATE POLICY "Anyone can view published exams" ON public.exams FOR SELECT USING (is_published = true OR has_role(auth.uid(), 'faculty'));
CREATE POLICY "Faculty can manage exams" ON public.exams FOR ALL USING (has_role(auth.uid(), 'faculty'));

-- Exam Submissions: Users own submissions
CREATE POLICY "Users can view own exam submissions" ON public.exam_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exam submissions" ON public.exam_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exam submissions" ON public.exam_submissions FOR UPDATE USING (auth.uid() = user_id);

-- Student Academic Standing: Users own records
CREATE POLICY "Users can view own academic standing" ON public.student_academic_standing FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage academic standing" ON public.student_academic_standing FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Faculty Schedule: Faculty can view own, admins can manage all
CREATE POLICY "Faculty can view own schedule" ON public.faculty_schedule FOR SELECT USING (auth.uid() = faculty_user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage faculty schedule" ON public.faculty_schedule FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Graduation Candidates: Users own records
CREATE POLICY "Users can view own graduation status" ON public.graduation_candidates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can apply for graduation" ON public.graduation_candidates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage graduation candidates" ON public.graduation_candidates FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Academic Events: Everyone can view
CREATE POLICY "Anyone can view academic events" ON public.academic_events FOR SELECT USING (true);
CREATE POLICY "Admins can manage academic events" ON public.academic_events FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Academic Notifications: Users own notifications
CREATE POLICY "Users can view own academic notifications" ON public.academic_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage notifications" ON public.academic_notifications FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Tuition Billing: Users own records
CREATE POLICY "Users can view own billing" ON public.tuition_billing_cycles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage billing" ON public.tuition_billing_cycles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_semesters_academic_year ON public.semesters(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_course ON public.class_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_semester ON public.class_sessions(semester_id);
CREATE INDEX IF NOT EXISTS idx_exams_course ON public.exams(course_id);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_user ON public.exam_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_graduation_candidates_user ON public.graduation_candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_academic_notifications_user ON public.academic_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_tuition_billing_user ON public.tuition_billing_cycles(user_id);