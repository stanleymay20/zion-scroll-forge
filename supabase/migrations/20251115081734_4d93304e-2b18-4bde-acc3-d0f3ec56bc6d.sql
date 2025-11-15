-- Create student_applications table for admissions
CREATE TABLE IF NOT EXISTS public.student_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  program_interest TEXT NOT NULL,
  education_background TEXT NOT NULL,
  motivation TEXT NOT NULL,
  spiritual_journey TEXT NOT NULL,
  reference_info TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected', 'waitlisted')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  decision_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;

-- Users can create their own applications
CREATE POLICY "Users can create own applications"
  ON public.student_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON public.student_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all applications for their institution
CREATE POLICY "Admins view institution applications"
  ON public.student_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.institution_members
      WHERE institution_members.user_id = auth.uid()
        AND institution_members.institution_id = student_applications.institution_id
        AND institution_members.role IN ('admin', 'owner')
        AND institution_members.status = 'active'
    )
  );

-- Admins can update applications
CREATE POLICY "Admins update applications"
  ON public.student_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.institution_members
      WHERE institution_members.user_id = auth.uid()
        AND institution_members.institution_id = student_applications.institution_id
        AND institution_members.role IN ('admin', 'owner')
        AND institution_members.status = 'active'
    )
  );

-- Create index for performance
CREATE INDEX idx_applications_institution ON public.student_applications(institution_id);
CREATE INDEX idx_applications_status ON public.student_applications(status);
CREATE INDEX idx_applications_user ON public.student_applications(user_id);