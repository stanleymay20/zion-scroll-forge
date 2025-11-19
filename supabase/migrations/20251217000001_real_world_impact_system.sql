-- Real-World Impact System Migration
-- "Faith without works is dead" - James 2:26
-- Enables students to solve actual problems and track their impact

-- ============================================================================
-- SCROLLMISSIONS - Real-World Projects
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.scroll_missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    career_track TEXT NOT NULL CHECK (career_track IN (
        'ScrollFounder', 'ScrollAmbassador', 'ScrollPriest', 
        'ScrollEngineer', 'ScrollScholar', 'ScrollBuilder'
    )),
    real_world_problem TEXT NOT NULL,
    community_impact TEXT NOT NULL,
    difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_hours INTEGER NOT NULL,
    deliverables JSONB DEFAULT '[]',
    success_metrics JSONB DEFAULT '[]',
    mentor_support_available BOOLEAN DEFAULT true,
    funding_available BOOLEAN DEFAULT false,
    funding_amount DECIMAL(10,2),
    partner_organization TEXT,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Mission Enrollments
CREATE TABLE IF NOT EXISTS public.mission_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id UUID REFERENCES public.scroll_missions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress' CHECK (status IN (
        'enrolled', 'in_progress', 'submitted', 'under_review', 
        'approved', 'completed', 'failed'
    )),
    progress_percentage DECIMAL(5,2) DEFAULT 0.0,
    deliverables_submitted JSONB DEFAULT '[]',
    mentor_id UUID REFERENCES auth.users(id),
    impact_metrics JSONB DEFAULT '{}',
    feedback TEXT,
    grade DECIMAL(5,2),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mission_id, student_id)
);

-- ============================================================================
-- COMMUNITY PARTNERSHIPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.community_partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_name TEXT NOT NULL,
    organization_type TEXT NOT NULL CHECK (organization_type IN (
        'NGO', 'Church', 'School', 'Government', 'Startup', 
        'Social Enterprise', 'Community Group'
    )),
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    location TEXT NOT NULL,
    country TEXT NOT NULL,
    description TEXT,
    needs JSONB DEFAULT '[]',
    active_projects INTEGER DEFAULT 0,
    students_helped INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partnership Projects
CREATE TABLE IF NOT EXISTS public.partnership_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID REFERENCES public.community_partners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    required_skills TEXT[] DEFAULT '{}',
    career_tracks TEXT[] DEFAULT '{}',
    max_students INTEGER DEFAULT 5,
    current_students INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    deliverables JSONB DEFAULT '[]',
    impact_goals JSONB DEFAULT '{}',
    actual_impact JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Project Assignments
CREATE TABLE IF NOT EXISTS public.project_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.partnership_projects(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    responsibilities TEXT,
    hours_committed INTEGER,
    hours_completed INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
    performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 5),
    partner_feedback TEXT,
    student_reflection TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, student_id)
);

-- ============================================================================
-- SCROLLPACT - Employer Network
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.employer_partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    organization_type TEXT NOT NULL CHECK (organization_type IN (
        'NGO', 'Tech Company', 'Government', 'Church', 
        'Social Enterprise', 'Startup', 'Corporation'
    )),
    size TEXT CHECK (size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
    location TEXT NOT NULL,
    country TEXT NOT NULL,
    website TEXT,
    description TEXT,
    hiring_needs JSONB DEFAULT '[]',
    preferred_tracks TEXT[] DEFAULT '{}',
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Postings
CREATE TABLE IF NOT EXISTS public.job_postings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employer_id UUID REFERENCES public.employer_partners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    career_track TEXT,
    required_skills TEXT[] DEFAULT '{}',
    preferred_skills TEXT[] DEFAULT '{}',
    location TEXT NOT NULL,
    is_remote BOOLEAN DEFAULT false,
    employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
    salary_range TEXT,
    application_deadline TIMESTAMP WITH TIME ZONE,
    positions_available INTEGER DEFAULT 1,
    positions_filled INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Applications
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    resume_url TEXT,
    portfolio_url TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'under_review', 'interview_scheduled', 
        'interviewed', 'offered', 'accepted', 'rejected', 'withdrawn'
    )),
    employer_notes TEXT,
    interview_date TIMESTAMP WITH TIME ZONE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, student_id)
);

-- ============================================================================
-- PORTFOLIO & SHOWCASE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.student_portfolios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    public_url TEXT UNIQUE,
    is_public BOOLEAN DEFAULT true,
    headline TEXT,
    bio TEXT,
    career_track TEXT,
    skills TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    availability TEXT,
    resume_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    website_url TEXT,
    video_intro_url TEXT,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio Projects
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    portfolio_id UUID REFERENCES public.student_portfolios(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    problem_solved TEXT NOT NULL,
    solution_approach TEXT NOT NULL,
    technologies_used TEXT[] DEFAULT '{}',
    role TEXT NOT NULL,
    team_size INTEGER,
    duration_months INTEGER,
    images JSONB DEFAULT '[]',
    video_url TEXT,
    live_url TEXT,
    github_url TEXT,
    impact_metrics JSONB DEFAULT '{}',
    testimonials JSONB DEFAULT '[]',
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MENTORSHIP PROGRAM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    expertise_areas TEXT[] DEFAULT '{}',
    career_track TEXT,
    industry TEXT,
    years_experience INTEGER,
    current_position TEXT,
    organization TEXT,
    bio TEXT,
    mentorship_capacity INTEGER DEFAULT 5,
    current_mentees INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentorship Relationships
CREATE TABLE IF NOT EXISTS public.mentorship_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    focus_area TEXT NOT NULL,
    goals JSONB DEFAULT '[]',
    meeting_frequency TEXT DEFAULT 'monthly',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    sessions_completed INTEGER DEFAULT 0,
    next_session_date TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, mentee_id)
);

-- Mentorship Sessions
CREATE TABLE IF NOT EXISTS public.mentorship_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    relationship_id UUID REFERENCES public.mentorship_relationships(id) ON DELETE CASCADE,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER,
    topics_discussed TEXT[] DEFAULT '{}',
    action_items JSONB DEFAULT '[]',
    mentor_notes TEXT,
    mentee_notes TEXT,
    mentee_rating INTEGER CHECK (mentee_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- IMPACT TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.student_impact_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Employment Metrics
    employment_status TEXT,
    current_position TEXT,
    current_organization TEXT,
    salary_range TEXT,
    job_satisfaction_score INTEGER CHECK (job_satisfaction_score BETWEEN 1 AND 10),
    
    -- Entrepreneurship Metrics
    businesses_launched INTEGER DEFAULT 0,
    revenue_generated DECIMAL(12,2) DEFAULT 0,
    jobs_created INTEGER DEFAULT 0,
    
    -- Community Impact Metrics
    people_served INTEGER DEFAULT 0,
    projects_completed INTEGER DEFAULT 0,
    volunteer_hours INTEGER DEFAULT 0,
    communities_impacted INTEGER DEFAULT 0,
    
    -- Kingdom Impact Metrics
    churches_planted INTEGER DEFAULT 0,
    disciples_made INTEGER DEFAULT 0,
    ministries_started INTEGER DEFAULT 0,
    missions_trips INTEGER DEFAULT 0,
    
    -- Innovation Metrics
    patents_filed INTEGER DEFAULT 0,
    products_launched INTEGER DEFAULT 0,
    research_published INTEGER DEFAULT 0,
    
    -- Leadership Metrics
    organizations_led INTEGER DEFAULT 0,
    teams_managed INTEGER DEFAULT 0,
    policies_influenced INTEGER DEFAULT 0,
    
    -- Last Updated
    last_survey_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Impact Stories
CREATE TABLE IF NOT EXISTS public.impact_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    story TEXT NOT NULL,
    problem_addressed TEXT NOT NULL,
    solution_implemented TEXT NOT NULL,
    impact_achieved TEXT NOT NULL,
    metrics JSONB DEFAULT '{}',
    images JSONB DEFAULT '[]',
    video_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INTERNSHIPS & FELLOWSHIPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.internship_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.employer_partners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    program_type TEXT NOT NULL CHECK (program_type IN (
        'summer_internship', 'gap_year_fellowship', 'part_time_apprenticeship',
        'mission_trip', 'research_assistantship'
    )),
    duration_months INTEGER NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    stipend_amount DECIMAL(10,2),
    scrollcoin_reward INTEGER,
    location TEXT NOT NULL,
    is_remote BOOLEAN DEFAULT false,
    required_skills TEXT[] DEFAULT '{}',
    application_deadline TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    positions_available INTEGER DEFAULT 1,
    positions_filled INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Internship Applications
CREATE TABLE IF NOT EXISTS public.internship_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    program_id UUID REFERENCES public.internship_programs(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    motivation_letter TEXT NOT NULL,
    relevant_experience TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted'
    )),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(program_id, student_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- ScrollMissions RLS
ALTER TABLE public.scroll_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active missions" ON public.scroll_missions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage missions" ON public.scroll_missions
    FOR ALL USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin') OR
        has_role(auth.uid(), 'faculty')
    );

-- Mission Enrollments RLS
ALTER TABLE public.mission_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own enrollments" ON public.mission_enrollments
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can enroll in missions" ON public.mission_enrollments
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own enrollments" ON public.mission_enrollments
    FOR UPDATE USING (student_id = auth.uid());

-- Community Partners RLS
ALTER TABLE public.community_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified partners" ON public.community_partners
    FOR SELECT USING (is_verified = true AND is_active = true);

-- Job Postings RLS
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open job postings" ON public.job_postings
    FOR SELECT USING (status = 'open');

-- Student Portfolios RLS
ALTER TABLE public.student_portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public portfolios" ON public.student_portfolios
    FOR SELECT USING (is_public = true);

CREATE POLICY "Students can manage their own portfolio" ON public.student_portfolios
    FOR ALL USING (student_id = auth.uid());

-- Impact Metrics RLS
ALTER TABLE public.student_impact_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own metrics" ON public.student_impact_metrics
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can update their own metrics" ON public.student_impact_metrics
    FOR UPDATE USING (student_id = auth.uid());

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_scroll_missions_career_track ON public.scroll_missions(career_track);
CREATE INDEX IF NOT EXISTS idx_mission_enrollments_student_id ON public.mission_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_mission_enrollments_status ON public.mission_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_community_partners_country ON public.community_partners(country);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON public.job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_career_track ON public.job_postings(career_track);
CREATE INDEX IF NOT EXISTS idx_job_applications_student_id ON public.job_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_student_portfolios_public_url ON public.student_portfolios(public_url);
CREATE INDEX IF NOT EXISTS idx_mentorship_relationships_mentee_id ON public.mentorship_relationships(mentee_id);
CREATE INDEX IF NOT EXISTS idx_impact_stories_student_id ON public.impact_stories(student_id);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- COMPLETION FLAG
-- ============================================================================

INSERT INTO public.development_flags (name, flag_key, is_enabled, created_at)
VALUES ('Real-World Impact System', 'Jesus-Christ-is-Lord-Real-World-Impact', true, NOW())
ON CONFLICT (flag_key) DO UPDATE SET is_enabled = true, created_at = NOW();
