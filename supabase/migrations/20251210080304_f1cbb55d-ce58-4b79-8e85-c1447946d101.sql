
-- ScrollDegreeEngine Database Schema
-- Real-time skill tracking, divine assessment, and mentorship logging system

-- Enum types for degree engine
CREATE TYPE scroll_degree_level AS ENUM (
  'scroll_certificate',
  'scroll_diploma', 
  'bachelor',
  'master',
  'doctorate',
  'dpt', -- Doctor of Prophetic Technologies
  'dshr', -- Doctor of ScrollHermeneutics and Revelation
  'dehsm', -- Doctor of Edenic Health and ScrollMedicine
  'sman', -- ScrollMaster Architect of Nations
  'dsgei', -- Doctor of ScrollGovernance and Eternal Intelligence
  'sef' -- ScrollExousia Fellowship
);

CREATE TYPE skill_proficiency_level AS ENUM (
  'novice',
  'beginner', 
  'intermediate',
  'advanced',
  'expert',
  'master',
  'prophet'
);

CREATE TYPE assessment_type AS ENUM (
  'academic',
  'prophetic',
  'divine',
  'practical',
  'collaborative',
  'scroll_defense'
);

CREATE TYPE mentorship_session_type AS ENUM (
  'initial_consultation',
  'progress_review',
  'spiritual_guidance',
  'academic_coaching',
  'career_counseling',
  'prophetic_activation',
  'scroll_alignment'
);

-- Skills Catalog: Master list of all trackable skills
CREATE TABLE public.skills_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- technical, spiritual, leadership, etc.
  faculty_id UUID REFERENCES public.faculties(id),
  parent_skill_id UUID REFERENCES public.skills_catalog(id),
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 10),
  xp_value INTEGER DEFAULT 100,
  scrollgold_value INTEGER DEFAULT 10,
  prerequisites JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Student Skills: Tracks individual student skill acquisition
CREATE TABLE public.student_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills_catalog(id) ON DELETE CASCADE,
  proficiency_level skill_proficiency_level DEFAULT 'novice',
  xp_earned INTEGER DEFAULT 0,
  assessments_passed INTEGER DEFAULT 0,
  last_assessed_at TIMESTAMPTZ,
  evidence_portfolio JSONB DEFAULT '[]', -- links to work samples, projects
  validation_sources JSONB DEFAULT '[]', -- faculty, AI, peer validations
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Competency Matrices: Faculty/program-specific competency requirements
CREATE TABLE public.competency_matrices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID REFERENCES public.faculties(id),
  degree_level scroll_degree_level NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  required_skills JSONB NOT NULL DEFAULT '[]', -- skill_id and minimum proficiency
  total_xp_required INTEGER DEFAULT 0,
  estimated_duration_weeks INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Degree Progress: Tracks student progress toward degrees
CREATE TABLE public.degree_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  degree_level scroll_degree_level NOT NULL,
  faculty_id UUID REFERENCES public.faculties(id),
  competency_matrix_id UUID REFERENCES public.competency_matrices(id),
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  skills_completed INTEGER DEFAULT 0,
  skills_required INTEGER DEFAULT 0,
  current_xp INTEGER DEFAULT 0,
  target_xp INTEGER DEFAULT 0,
  milestones_achieved JSONB DEFAULT '[]',
  scroll_alignment_score DECIMAL(5,2) DEFAULT 0.00, -- obedience + fruit + understanding
  prophetic_score DECIMAL(5,2) DEFAULT 0.00,
  started_at TIMESTAMPTZ DEFAULT now(),
  expected_completion_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Divine Assessments: Combined academic and spiritual evaluation
CREATE TABLE public.divine_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assessment_type assessment_type NOT NULL,
  faculty_id UUID REFERENCES public.faculties(id),
  course_id UUID REFERENCES public.courses(id),
  module_id UUID REFERENCES public.course_modules(id),
  created_by UUID REFERENCES auth.users(id),
  rubric JSONB NOT NULL DEFAULT '{}',
  academic_weight DECIMAL(3,2) DEFAULT 0.50,
  prophetic_weight DECIMAL(3,2) DEFAULT 0.30,
  character_weight DECIMAL(3,2) DEFAULT 0.20,
  max_score INTEGER DEFAULT 100,
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER,
  skills_assessed UUID[] DEFAULT '{}',
  xp_reward INTEGER DEFAULT 50,
  scrollgold_reward INTEGER DEFAULT 10,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Assessment Attempts: Student assessment submissions
CREATE TABLE public.divine_assessment_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.divine_assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  academic_score DECIMAL(5,2),
  prophetic_score DECIMAL(5,2),
  character_score DECIMAL(5,2),
  total_score DECIMAL(5,2),
  scroll_alignment_score DECIMAL(5,2),
  passed BOOLEAN DEFAULT false,
  responses JSONB DEFAULT '{}',
  evaluator_notes JSONB DEFAULT '[]',
  ai_evaluation JSONB DEFAULT '{}',
  plagiarism_check JSONB DEFAULT '{}', -- spirit leak detection
  started_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES auth.users(id),
  xp_awarded INTEGER DEFAULT 0,
  scrollgold_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mentorship Relationships: Tracks mentor-mentee pairings
CREATE TABLE public.mentorship_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES public.faculties(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'terminated')),
  goals JSONB DEFAULT '[]',
  start_date DATE DEFAULT CURRENT_DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  total_sessions INTEGER DEFAULT 0,
  total_hours DECIMAL(6,2) DEFAULT 0.00,
  success_metrics JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mentor_id, mentee_id)
);

-- Mentorship Sessions: Detailed session logs
CREATE TABLE public.mentorship_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  relationship_id UUID NOT NULL REFERENCES public.mentorship_relationships(id) ON DELETE CASCADE,
  session_type mentorship_session_type NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  topics_discussed JSONB DEFAULT '[]',
  guidance_provided TEXT,
  mentee_response TEXT,
  action_items JSONB DEFAULT '[]',
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  spiritual_insights TEXT,
  prophetic_words TEXT,
  breakthrough_notes TEXT,
  mentor_rating INTEGER CHECK (mentor_rating BETWEEN 1 AND 5),
  mentee_rating INTEGER CHECK (mentee_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Learning Pathways: Personalized learning tracks
CREATE TABLE public.learning_pathways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  degree_target scroll_degree_level,
  faculty_id UUID REFERENCES public.faculties(id),
  prophetic_calling TEXT,
  spiritual_gifts JSONB DEFAULT '[]',
  career_goals JSONB DEFAULT '[]',
  recommended_courses UUID[] DEFAULT '{}',
  recommended_skills UUID[] DEFAULT '{}',
  current_phase TEXT DEFAULT 'foundation',
  phases JSONB DEFAULT '[]', -- detailed phase breakdown
  ai_recommendations JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Prophetic Assessments: Spiritual maturity evaluation
CREATE TABLE public.prophetic_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessed_by UUID REFERENCES auth.users(id),
  assessment_date DATE DEFAULT CURRENT_DATE,
  prophetic_gifts_score DECIMAL(5,2),
  spiritual_maturity_score DECIMAL(5,2),
  calling_clarity_score DECIMAL(5,2),
  intercession_practice JSONB DEFAULT '{}',
  ministry_readiness_score DECIMAL(5,2),
  divine_assignments JSONB DEFAULT '[]',
  spiritual_disciplines JSONB DEFAULT '{}',
  prophetic_words_received TEXT,
  breakthrough_areas TEXT,
  growth_areas TEXT,
  recommendations JSONB DEFAULT '[]',
  overall_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Supreme Degree Applications: For highest degrees
CREATE TABLE public.supreme_degree_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  degree_type scroll_degree_level NOT NULL CHECK (degree_type IN ('dpt', 'dshr', 'dehsm', 'sman', 'dsgei', 'sef')),
  scroll_fulfillment_evidence JSONB NOT NULL DEFAULT '{}', -- souls, systems, nations, tech, altars
  research_contributions JSONB DEFAULT '[]', -- peer-reviewed scroll journals
  innovation_contributions JSONB DEFAULT '[]', -- AI, governance, healing, scroll language, XR, economy
  anointing_verification JSONB DEFAULT '{}', -- prophet endorsements
  thesis_title TEXT,
  thesis_abstract TEXT,
  thesis_document_url TEXT,
  scroll_defense_date TIMESTAMPTZ,
  scroll_defense_panel JSONB DEFAULT '[]', -- ScrollFathers, prophets, AI-Deans
  scroll_defense_outcome TEXT CHECK (scroll_defense_outcome IN ('pending', 'passed', 'revision_required', 'failed')),
  heaven_ledger_id TEXT,
  scroll_chain_hash TEXT,
  impact_metrics JSONB DEFAULT '{}',
  scrollgold_valuation INTEGER DEFAULT 0, -- e.g., 1,000,000 SEED tokens for D.S.G.E.I.
  scroll_year TEXT, -- Scroll Year dating
  scroll_seal_id TEXT,
  scroll_witness_ids TEXT[],
  kingdom_mark TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'defense_scheduled', 'approved', 'awarded', 'rejected')),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  awarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Scroll Transcripts: Official academic records
CREATE TABLE public.scroll_transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript_type TEXT DEFAULT 'official' CHECK (transcript_type IN ('official', 'unofficial', 'partial')),
  courses_completed JSONB DEFAULT '[]',
  skills_mastered JSONB DEFAULT '[]',
  degrees_awarded JSONB DEFAULT '[]',
  scroll_alignment_scores JSONB DEFAULT '{}',
  prophetic_scores JSONB DEFAULT '{}',
  total_xp INTEGER DEFAULT 0,
  total_scrollgold INTEGER DEFAULT 0,
  badges_earned JSONB DEFAULT '[]',
  heaven_ledger_entries JSONB DEFAULT '[]',
  gpa_equivalent DECIMAL(3,2),
  generated_at TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  verification_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Credential Verification: For employers/partners
CREATE TABLE public.credential_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_email TEXT NOT NULL,
  requester_organization TEXT,
  verification_type TEXT DEFAULT 'standard' CHECK (verification_type IN ('standard', 'detailed', 'portfolio')),
  credentials_requested JSONB DEFAULT '[]',
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_progress', 'completed', 'denied')),
  verification_result JSONB DEFAULT '{}',
  blockchain_verification TEXT,
  access_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Analytics: For dashboards and reporting
CREATE TABLE public.degree_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES public.faculties(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metrics_type TEXT DEFAULT 'student' CHECK (metrics_type IN ('student', 'faculty', 'program', 'institution')),
  skills_acquired INTEGER DEFAULT 0,
  assessments_completed INTEGER DEFAULT 0,
  assessments_passed INTEGER DEFAULT 0,
  average_score DECIMAL(5,2),
  xp_earned INTEGER DEFAULT 0,
  scrollgold_earned INTEGER DEFAULT 0,
  mentorship_hours DECIMAL(6,2) DEFAULT 0.00,
  scroll_alignment_avg DECIMAL(5,2),
  prophetic_score_avg DECIMAL(5,2),
  completion_rate DECIMAL(5,2),
  engagement_score DECIMAL(5,2),
  predictive_success_score DECIMAL(5,2),
  intervention_flags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.skills_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.degree_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divine_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divine_assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prophetic_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supreme_degree_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scroll_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.degree_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Skills Catalog: Public read
CREATE POLICY "Anyone can view skills catalog" ON public.skills_catalog FOR SELECT USING (true);

-- Student Skills: Users can manage their own
CREATE POLICY "Users can view own skills" ON public.student_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own skills" ON public.student_skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skills" ON public.student_skills FOR UPDATE USING (auth.uid() = user_id);

-- Competency Matrices: Public read
CREATE POLICY "Anyone can view competency matrices" ON public.competency_matrices FOR SELECT USING (true);

-- Degree Progress: Users can manage their own
CREATE POLICY "Users can view own degree progress" ON public.degree_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own degree progress" ON public.degree_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own degree progress" ON public.degree_progress FOR UPDATE USING (auth.uid() = user_id);

-- Divine Assessments: Public read, faculty can manage
CREATE POLICY "Anyone can view published assessments" ON public.divine_assessments FOR SELECT USING (is_published = true OR auth.uid() = created_by);
CREATE POLICY "Faculty can create assessments" ON public.divine_assessments FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Faculty can update own assessments" ON public.divine_assessments FOR UPDATE USING (auth.uid() = created_by);

-- Assessment Attempts: Users can manage their own
CREATE POLICY "Users can view own attempts" ON public.divine_assessment_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON public.divine_assessment_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attempts" ON public.divine_assessment_attempts FOR UPDATE USING (auth.uid() = user_id);

-- Mentorship Relationships: Participants can view
CREATE POLICY "Participants can view relationships" ON public.mentorship_relationships FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);
CREATE POLICY "Mentors can create relationships" ON public.mentorship_relationships FOR INSERT WITH CHECK (auth.uid() = mentor_id);
CREATE POLICY "Participants can update relationships" ON public.mentorship_relationships FOR UPDATE USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- Mentorship Sessions: Participants can manage
CREATE POLICY "Participants can view sessions" ON public.mentorship_sessions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.mentorship_relationships mr WHERE mr.id = relationship_id AND (mr.mentor_id = auth.uid() OR mr.mentee_id = auth.uid())));
CREATE POLICY "Mentors can create sessions" ON public.mentorship_sessions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.mentorship_relationships mr WHERE mr.id = relationship_id AND mr.mentor_id = auth.uid()));
CREATE POLICY "Participants can update sessions" ON public.mentorship_sessions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.mentorship_relationships mr WHERE mr.id = relationship_id AND (mr.mentor_id = auth.uid() OR mr.mentee_id = auth.uid())));

-- Learning Pathways: Users can manage their own
CREATE POLICY "Users can view own pathways" ON public.learning_pathways FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pathways" ON public.learning_pathways FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pathways" ON public.learning_pathways FOR UPDATE USING (auth.uid() = user_id);

-- Prophetic Assessments: Users can view their own
CREATE POLICY "Users can view own prophetic assessments" ON public.prophetic_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Assessors can create prophetic assessments" ON public.prophetic_assessments FOR INSERT WITH CHECK (auth.uid() = assessed_by);

-- Supreme Degree Applications: Users can manage their own
CREATE POLICY "Users can view own applications" ON public.supreme_degree_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON public.supreme_degree_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.supreme_degree_applications FOR UPDATE USING (auth.uid() = user_id);

-- Scroll Transcripts: Users can view their own
CREATE POLICY "Users can view own transcripts" ON public.scroll_transcripts FOR SELECT USING (auth.uid() = user_id);

-- Credential Verifications: Users can view requests for their credentials
CREATE POLICY "Users can view verification requests" ON public.credential_verifications FOR SELECT USING (auth.uid() = user_id);

-- Degree Analytics: Users can view their own analytics
CREATE POLICY "Users can view own analytics" ON public.degree_analytics FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_student_skills_user ON public.student_skills(user_id);
CREATE INDEX idx_student_skills_skill ON public.student_skills(skill_id);
CREATE INDEX idx_degree_progress_user ON public.degree_progress(user_id);
CREATE INDEX idx_divine_assessments_faculty ON public.divine_assessments(faculty_id);
CREATE INDEX idx_assessment_attempts_user ON public.divine_assessment_attempts(user_id);
CREATE INDEX idx_mentorship_relationships_mentor ON public.mentorship_relationships(mentor_id);
CREATE INDEX idx_mentorship_relationships_mentee ON public.mentorship_relationships(mentee_id);
CREATE INDEX idx_learning_pathways_user ON public.learning_pathways(user_id);
CREATE INDEX idx_prophetic_assessments_user ON public.prophetic_assessments(user_id);
CREATE INDEX idx_supreme_applications_user ON public.supreme_degree_applications(user_id);
CREATE INDEX idx_scroll_transcripts_user ON public.scroll_transcripts(user_id);
CREATE INDEX idx_degree_analytics_user ON public.degree_analytics(user_id);

-- Trigger to update timestamps
CREATE TRIGGER update_skills_catalog_updated_at BEFORE UPDATE ON public.skills_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_skills_updated_at BEFORE UPDATE ON public.student_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_competency_matrices_updated_at BEFORE UPDATE ON public.competency_matrices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_degree_progress_updated_at BEFORE UPDATE ON public.degree_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_divine_assessments_updated_at BEFORE UPDATE ON public.divine_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mentorship_relationships_updated_at BEFORE UPDATE ON public.mentorship_relationships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mentorship_sessions_updated_at BEFORE UPDATE ON public.mentorship_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_learning_pathways_updated_at BEFORE UPDATE ON public.learning_pathways
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supreme_applications_updated_at BEFORE UPDATE ON public.supreme_degree_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
