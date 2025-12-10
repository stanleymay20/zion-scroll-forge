-- Create student_qualifications table to track both Scroll and external degrees
CREATE TABLE public.student_qualifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  qualification_type TEXT NOT NULL CHECK (qualification_type IN ('scroll_degree', 'external_degree', 'certificate', 'diploma')),
  qualification_name TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('certificate', 'diploma', 'bachelor', 'master', 'doctorate', 'ScrollCertificate', 'ScrollDiploma', 'ScrollBachelor', 'ScrollMaster', 'ScrollDoctorate', 'ScrollExousia')),
  institution_name TEXT,
  field_of_study TEXT,
  graduation_date DATE,
  is_verified BOOLEAN DEFAULT false,
  verification_document_url TEXT,
  scroll_degree_id UUID REFERENCES public.degree_programs(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create degree_prerequisites table to define requirements for each degree level
CREATE TABLE public.degree_prerequisites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  degree_level TEXT NOT NULL CHECK (degree_level IN ('ScrollCertificate', 'ScrollDiploma', 'ScrollBachelor', 'ScrollMaster', 'ScrollDoctorate', 'ScrollExousia')),
  prerequisite_type TEXT NOT NULL CHECK (prerequisite_type IN ('scroll_degree', 'external_degree', 'experience', 'assessment', 'courses_completed')),
  prerequisite_level TEXT,
  min_courses_completed INTEGER,
  min_credits INTEGER,
  min_xp INTEGER,
  description TEXT NOT NULL,
  is_required BOOLEAN DEFAULT true,
  alternative_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create degree_applications table for application workflow
CREATE TABLE public.degree_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  degree_id UUID NOT NULL REFERENCES public.degree_programs(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'conditional')),
  applied_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  qualifications_submitted JSONB DEFAULT '[]',
  prerequisites_met JSONB DEFAULT '{}',
  reviewer_notes TEXT,
  conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.degree_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.degree_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_qualifications
CREATE POLICY "Users can view their own qualifications" ON public.student_qualifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own qualifications" ON public.student_qualifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own qualifications" ON public.student_qualifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for degree_prerequisites (public read)
CREATE POLICY "Anyone can view degree prerequisites" ON public.degree_prerequisites
  FOR SELECT USING (true);

-- RLS Policies for degree_applications
CREATE POLICY "Users can view their own applications" ON public.degree_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" ON public.degree_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending applications" ON public.degree_applications
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Insert default prerequisites for each degree level
INSERT INTO public.degree_prerequisites (degree_level, prerequisite_type, prerequisite_level, description, is_required, alternative_path) VALUES
-- ScrollCertificate: Open to all
('ScrollCertificate', 'courses_completed', NULL, 'No prior qualifications required - open enrollment for all seekers of knowledge', false, NULL),

-- ScrollDiploma: Requires ScrollCertificate or basic courses
('ScrollDiploma', 'scroll_degree', 'ScrollCertificate', 'Completion of ScrollCertificate from Scroll University', true, 'Complete foundation assessment'),
('ScrollDiploma', 'courses_completed', NULL, 'Minimum 3 courses completed with passing grades', true, NULL),

-- ScrollBachelor: Requires ScrollDiploma or external diploma/some college
('ScrollBachelor', 'scroll_degree', 'ScrollDiploma', 'Completion of ScrollDiploma from Scroll University', true, 'Hold external diploma or equivalent'),
('ScrollBachelor', 'external_degree', 'diploma', 'External diploma or associate degree from accredited institution', false, 'Complete ScrollDiploma'),
('ScrollBachelor', 'courses_completed', NULL, 'Minimum 12 courses completed with 75% average', true, NULL),

-- ScrollMaster: Requires ScrollBachelor OR standard bachelor degree
('ScrollMaster', 'scroll_degree', 'ScrollBachelor', 'Completion of ScrollBachelor from Scroll University', true, 'Hold accredited bachelor degree'),
('ScrollMaster', 'external_degree', 'bachelor', 'Bachelor degree from accredited institution (any field)', false, 'Complete ScrollBachelor program'),
('ScrollMaster', 'experience', NULL, 'Minimum 2 years professional or ministry experience (for external degree holders)', false, NULL),

-- ScrollDoctorate: Requires ScrollMaster OR standard master degree
('ScrollDoctorate', 'scroll_degree', 'ScrollMaster', 'Completion of ScrollMaster from Scroll University', true, 'Hold accredited master degree'),
('ScrollDoctorate', 'external_degree', 'master', 'Master degree from accredited institution', false, 'Complete ScrollMaster program'),
('ScrollDoctorate', 'assessment', NULL, 'Pass doctoral readiness assessment demonstrating research capability', true, NULL),

-- ScrollExousia: Supreme fellowship - requires ScrollDoctorate OR exceptional achievements
('ScrollExousia', 'scroll_degree', 'ScrollDoctorate', 'Completion of ScrollDoctorate from Scroll University', true, 'Demonstrate exceptional kingdom impact'),
('ScrollExousia', 'experience', NULL, 'Demonstrated nation-level impact in ministry, innovation, or governance', true, NULL),
('ScrollExousia', 'assessment', NULL, 'Prophetic council evaluation and kingdom fruit verification', true, NULL);

-- Add level column to degree_programs if not exists (using scroll levels)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'degree_programs' AND column_name = 'scroll_level') THEN
    ALTER TABLE public.degree_programs ADD COLUMN scroll_level TEXT CHECK (scroll_level IN ('ScrollCertificate', 'ScrollDiploma', 'ScrollBachelor', 'ScrollMaster', 'ScrollDoctorate', 'ScrollExousia'));
  END IF;
END $$;

-- Create updated_at trigger for new tables
CREATE TRIGGER update_student_qualifications_updated_at
  BEFORE UPDATE ON public.student_qualifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_degree_applications_updated_at
  BEFORE UPDATE ON public.degree_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();