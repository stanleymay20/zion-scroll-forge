-- Career Services System Migration
-- AI-powered career matching, resume review, mock interviews, and analytics

-- Student Career Profiles
CREATE TABLE IF NOT EXISTS student_career_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skills JSONB NOT NULL DEFAULT '[]',
    interests TEXT[] NOT NULL DEFAULT '{}',
    values TEXT[] NOT NULL DEFAULT '{}',
    career_goals TEXT[] NOT NULL DEFAULT '{}',
    preferred_industries TEXT[] NOT NULL DEFAULT '{}',
    preferred_locations TEXT[] NOT NULL DEFAULT '{}',
    salary_expectations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id)
);

-- Career Matches
CREATE TABLE IF NOT EXISTS career_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_title VARCHAR(255) NOT NULL,
    career_industry VARCHAR(255) NOT NULL,
    match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    skill_gaps JSONB NOT NULL DEFAULT '[]',
    pathway_steps JSONB NOT NULL DEFAULT '[]',
    salary_range JSONB,
    job_outlook JSONB,
    reasoning TEXT,
    spiritual_alignment INTEGER CHECK (spiritual_alignment >= 0 AND spiritual_alignment <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_career_matches_student ON career_matches(student_id);
CREATE INDEX IF NOT EXISTS idx_career_matches_score ON career_matches(match_score DESC);

-- Resumes
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    format VARCHAR(50) NOT NULL DEFAULT 'txt',
    target_role VARCHAR(255),
    target_industry VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resumes_student ON resumes(student_id);

-- Resume Reviews
CREATE TABLE IF NOT EXISTS resume_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    content_score INTEGER NOT NULL CHECK (content_score >= 0 AND content_score <= 100),
    formatting_score INTEGER NOT NULL CHECK (formatting_score >= 0 AND formatting_score <= 100),
    ats_compatibility INTEGER NOT NULL CHECK (ats_compatibility >= 0 AND ats_compatibility <= 100),
    strengths TEXT[] NOT NULL DEFAULT '{}',
    weaknesses TEXT[] NOT NULL DEFAULT '{}',
    suggestions JSONB NOT NULL DEFAULT '[]',
    keyword_analysis JSONB NOT NULL DEFAULT '{}',
    revised_version TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resume_reviews_resume ON resume_reviews(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_reviews_student ON resume_reviews(student_id);

-- Mock Interview Sessions
CREATE TABLE IF NOT EXISTS mock_interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_title VARCHAR(255) NOT NULL,
    role_level VARCHAR(50) NOT NULL,
    role_industry VARCHAR(255) NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]',
    responses JSONB NOT NULL DEFAULT '[]',
    feedback JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mock_interviews_student ON mock_interview_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_status ON mock_interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_session_id ON mock_interview_sessions(session_id);

-- Employers
CREATE TABLE IF NOT EXISTS employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(255) NOT NULL,
    size VARCHAR(50) NOT NULL,
    locations TEXT[] NOT NULL DEFAULT '{}',
    culture JSONB NOT NULL DEFAULT '{}',
    values TEXT[] NOT NULL DEFAULT '{}',
    benefits TEXT[] NOT NULL DEFAULT '{}',
    christian_friendly BOOLEAN DEFAULT false,
    ministry_opportunities TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employers_industry ON employers(industry);
CREATE INDEX IF NOT EXISTS idx_employers_christian_friendly ON employers(christian_friendly);

-- Job Postings
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] NOT NULL DEFAULT '{}',
    preferred_qualifications TEXT[] NOT NULL DEFAULT '{}',
    salary_range JSONB,
    location VARCHAR(255) NOT NULL,
    remote BOOLEAN DEFAULT false,
    posted_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    application_deadline TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_postings_employer ON job_postings(employer_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_remote ON job_postings(remote);

-- Employer Matches
CREATE TABLE IF NOT EXISTS employer_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    position_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    fit_analysis JSONB NOT NULL DEFAULT '{}',
    application_strategy JSONB NOT NULL DEFAULT '{}',
    reasoning TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employer_matches_student ON employer_matches(student_id);
CREATE INDEX IF NOT EXISTS idx_employer_matches_employer ON employer_matches(employer_id);
CREATE INDEX IF NOT EXISTS idx_employer_matches_score ON employer_matches(match_score DESC);

-- Application Tracking
CREATE TABLE IF NOT EXISTS application_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    position_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    application_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    interview_dates TIMESTAMP WITH TIME ZONE[] DEFAULT '{}',
    offer_received BOOLEAN DEFAULT false,
    offer_details JSONB,
    outcome VARCHAR(50),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_application_outcomes_student ON application_outcomes(student_id);
CREATE INDEX IF NOT EXISTS idx_application_outcomes_employer ON application_outcomes(employer_id);
CREATE INDEX IF NOT EXISTS idx_application_outcomes_status ON application_outcomes(status);
CREATE INDEX IF NOT EXISTS idx_application_outcomes_outcome ON application_outcomes(outcome);

-- Employment Outcomes (for analytics)
CREATE TABLE IF NOT EXISTS employment_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    graduation_year INTEGER NOT NULL,
    major VARCHAR(255) NOT NULL,
    employer_name VARCHAR(255),
    position_title VARCHAR(255),
    industry VARCHAR(255),
    starting_salary DECIMAL(10, 2),
    employment_date TIMESTAMP WITH TIME ZONE,
    days_to_employment INTEGER,
    satisfaction_score INTEGER CHECK (satisfaction_score >= 0 AND satisfaction_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employment_outcomes_student ON employment_outcomes(student_id);
CREATE INDEX IF NOT EXISTS idx_employment_outcomes_year ON employment_outcomes(graduation_year);
CREATE INDEX IF NOT EXISTS idx_employment_outcomes_major ON employment_outcomes(major);
CREATE INDEX IF NOT EXISTS idx_employment_outcomes_industry ON employment_outcomes(industry);

-- Career Analytics Cache
CREATE TABLE IF NOT EXISTS career_analytics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    analytics_data JSONB NOT NULL,
    timeframe_start TIMESTAMP WITH TIME ZONE NOT NULL,
    timeframe_end TIMESTAMP WITH TIME ZONE NOT NULL,
    major VARCHAR(255),
    industry VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_cache_key ON career_analytics_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires ON career_analytics_cache(expires_at);

-- Curriculum Recommendations
CREATE TABLE IF NOT EXISTS curriculum_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    major VARCHAR(255) NOT NULL,
    recommendation TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL,
    rationale TEXT NOT NULL,
    expected_impact TEXT NOT NULL,
    implementation_cost VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_curriculum_recommendations_major ON curriculum_recommendations(major);
CREATE INDEX IF NOT EXISTS idx_curriculum_recommendations_priority ON curriculum_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_curriculum_recommendations_status ON curriculum_recommendations(status);

-- Add comments for documentation
COMMENT ON TABLE student_career_profiles IS 'Student career profiles with skills, interests, and preferences';
COMMENT ON TABLE career_matches IS 'AI-generated career matches for students';
COMMENT ON TABLE resumes IS 'Student resumes for review and optimization';
COMMENT ON TABLE resume_reviews IS 'AI-powered resume reviews with feedback';
COMMENT ON TABLE mock_interview_sessions IS 'Mock interview sessions with questions and responses';
COMMENT ON TABLE employers IS 'Employer database for job matching';
COMMENT ON TABLE job_postings IS 'Job postings from employers';
COMMENT ON TABLE employer_matches IS 'AI-generated employer/position matches for students';
COMMENT ON TABLE application_outcomes IS 'Tracking of student job applications and outcomes';
COMMENT ON TABLE employment_outcomes IS 'Graduate employment outcomes for analytics';
COMMENT ON TABLE career_analytics_cache IS 'Cached career analytics data';
COMMENT ON TABLE curriculum_recommendations IS 'Data-driven curriculum improvement recommendations';
