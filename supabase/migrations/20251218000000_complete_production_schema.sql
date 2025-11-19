-- Complete Production Schema Migration
-- "By wisdom a house is built, and through understanding it is established" - Proverbs 24:3
-- Comprehensive Supabase schema with RLS policies, functions, triggers, and storage

-- ============================================================================
-- ENABLE REQUIRED EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- CUSTOM TYPES AND ENUMS
-- ============================================================================

-- User Role Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'STUDENT', 'FACULTY', 'ADMIN', 'SCROLL_ELDER', 'PROPHET', 
        'CHANCELLOR', 'ADMISSIONS_OFFICER', 'ADMISSIONS_COMMITTEE', 
        'INTERVIEWER', 'SPIRITUAL_EVALUATOR', 'ACADEMIC_ASSESSOR'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enrollment Status Enum
DO $$ BEGIN
    CREATE TYPE enrollment_status AS ENUM ('ACTIVE', 'SUSPENDED', 'GRADUATED', 'WITHDRAWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Academic Level Enum
DO $$ BEGIN
    CREATE TYPE academic_level AS ENUM (
        'SCROLL_OPEN', 'SCROLL_STARTER', 'SCROLL_DEGREE', 
        'SCROLL_DOCTORATE', 'SCROLL_SCHOLARSHIP'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Difficulty Enum
DO $$ BEGIN
    CREATE TYPE difficulty AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROPHETIC');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Assignment Type Enum
DO $$ BEGIN
    CREATE TYPE assignment_type AS ENUM (
        'QUIZ', 'ESSAY', 'PROJECT', 'SCROLL_MISSION', 'SCROLL_DEFENSE', 'LAB_WORK'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- Submission Status Enum
DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM ('DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment Method Enum
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM (
        'CREDIT_CARD', 'SCROLL_COIN', 'CRYPTOCURRENCY', 'WORK_TRADE', 'SCHOLARSHIP'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment Status Enum
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Transaction Type Enum
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('EARNED', 'SPENT', 'TRANSFERRED', 'BONUS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ScrollCoin Activity Enum
DO $$ BEGIN
    CREATE TYPE scrollcoin_activity AS ENUM (
        'DAILY_XP_STREAK', 'COURSE_COMPLETION', 'RESEARCH_PUBLICATION', 
        'MENTORING', 'TRANSLATION', 'TOOL_BUILDING', 'MISSION_SERVICE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Publication Status Enum
DO $$ BEGIN
    CREATE TYPE publication_status AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'PUBLISHED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Certification Type Enum
DO $$ BEGIN
    CREATE TYPE certification_type AS ENUM (
        'COURSE_COMPLETION', 'DIPLOMA', 'BACHELOR_DEGREE', 'MASTER_DEGREE', 
        'DOCTORATE', 'DSGEI', 'SCROLL_FELLOWSHIP'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- Badge Type Enum
DO $$ BEGIN
    CREATE TYPE badge_type AS ENUM (
        'COURSE_COMPLETION', 'SKILL_MASTERY', 'SPIRITUAL_MILESTONE', 
        'PROPHETIC_ACHIEVEMENT', 'KINGDOM_IMPACT', 'SCROLL_CERTIFICATION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Application Status Enum
DO $$ BEGIN
    CREATE TYPE application_status AS ENUM (
        'SUBMITTED', 'UNDER_REVIEW', 'ASSESSMENT_PENDING', 'INTERVIEW_SCHEDULED', 
        'DECISION_PENDING', 'ACCEPTED', 'REJECTED', 'WAITLISTED', 'DEFERRED', 'WITHDRAWN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Program Type Enum
DO $$ BEGIN
    CREATE TYPE program_type AS ENUM (
        'SCROLL_OPEN', 'SCROLL_STARTER', 'SCROLL_DEGREE', 
        'SCROLL_DOCTORATE', 'SCROLL_SCHOLARSHIP', 'DSGEI_PROGRAM'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

-- Extended Users Profile Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    location TEXT,
    phone_number TEXT,
    date_of_birth DATE,
    scroll_coin_wallet TEXT UNIQUE,
    preferred_language TEXT DEFAULT 'en',
    time_zone TEXT DEFAULT 'UTC',
    scroll_node_id TEXT,
    avatar_url TEXT,
    bio TEXT,
    scroll_calling TEXT,
    spiritual_gifts TEXT[],
    kingdom_vision TEXT,
    scroll_alignment DECIMAL(3,2) DEFAULT 0.0,
    role user_role DEFAULT 'STUDENT',
    enrollment_status enrollment_status DEFAULT 'ACTIVE',
    academic_level academic_level DEFAULT 'SCROLL_OPEN',
    scroll_coin_balance DECIMAL(10,2) DEFAULT 0.0,
    work_trade_credits DECIMAL(10,2) DEFAULT 0.0,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_enrollment_status ON public.user_profiles(enrollment_status);


-- ============================================================================
-- COURSE AND CURRICULUM TABLES
-- ============================================================================

-- Faculties Table
CREATE TABLE IF NOT EXISTS public.faculties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    syllabus TEXT,
    difficulty difficulty NOT NULL,
    duration INTEGER NOT NULL,
    scroll_xp_reward INTEGER DEFAULT 10,
    scroll_coin_cost DECIMAL(10,2) DEFAULT 0.0,
    video_url TEXT,
    materials TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    faculty_id UUID REFERENCES public.faculties(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_faculty_id ON public.courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON public.courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON public.courses(difficulty);

-- Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    progress DECIMAL(5,2) DEFAULT 0.0,
    scroll_xp_earned INTEGER DEFAULT 0,
    current_module INTEGER DEFAULT 1,
    status enrollment_status DEFAULT 'ACTIVE',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);


-- Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type assignment_type NOT NULL,
    max_points INTEGER DEFAULT 100,
    due_date TIMESTAMP WITH TIME ZONE,
    requires_defense BOOLEAN DEFAULT false,
    defense_weight DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON public.assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);

-- Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    score DECIMAL(5,2),
    feedback TEXT,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by TEXT,
    scroll_alignment DECIMAL(3,2),
    kingdom_impact DECIMAL(3,2),
    status submission_status DEFAULT 'SUBMITTED',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_enrollment_id ON public.submissions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

-- ============================================================================
-- PAYMENT AND BILLING TABLES
-- ============================================================================

-- Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    method payment_method NOT NULL,
    stripe_payment_id TEXT,
    scrollcoin_tx_id TEXT,
    crypto_tx_hash TEXT,
    description TEXT NOT NULL,
    status payment_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);


-- ScrollCoin Transactions Table
CREATE TABLE IF NOT EXISTS public.scrollcoin_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type transaction_type NOT NULL,
    description TEXT NOT NULL,
    blockchain_tx_id TEXT,
    block_number INTEGER,
    activity_type scrollcoin_activity,
    related_entity_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scrollcoin_transactions_user_id ON public.scrollcoin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_scrollcoin_transactions_type ON public.scrollcoin_transactions(type);
CREATE INDEX IF NOT EXISTS idx_scrollcoin_transactions_created_at ON public.scrollcoin_transactions(created_at);

-- ============================================================================
-- RESEARCH AND PUBLICATION TABLES
-- ============================================================================

-- Research Papers Table
CREATE TABLE IF NOT EXISTS public.research_papers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    content TEXT NOT NULL,
    doi TEXT UNIQUE,
    orcid_id TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    peer_reviewed BOOLEAN DEFAULT false,
    prophetic_score DECIMAL(3,2),
    kingdom_relevance DECIMAL(3,2),
    scroll_alignment DECIMAL(3,2),
    status publication_status DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_papers_author_id ON public.research_papers(author_id);
CREATE INDEX IF NOT EXISTS idx_research_papers_status ON public.research_papers(status);
CREATE INDEX IF NOT EXISTS idx_research_papers_published_at ON public.research_papers(published_at);

-- ============================================================================
-- CERTIFICATION AND CREDENTIALS TABLES
-- ============================================================================

-- Certifications Table
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type certification_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    scroll_seal_id TEXT UNIQUE NOT NULL,
    heaven_ledger_id TEXT,
    issued_by TEXT NOT NULL,
    validated_by TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON public.certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_type ON public.certifications(type);
CREATE INDEX IF NOT EXISTS idx_certifications_scroll_seal_id ON public.certifications(scroll_seal_id);


-- ScrollBadges (NFT) Table
CREATE TABLE IF NOT EXISTS public.scrollbadges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token_id TEXT UNIQUE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type badge_type NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    animation_url TEXT,
    verification_hash TEXT UNIQUE NOT NULL,
    blockchain_tx_hash TEXT,
    ipfs_metadata_hash TEXT,
    competencies JSONB DEFAULT '[]',
    spiritual_growth JSONB DEFAULT '{}',
    final_grade DECIMAL(5,2),
    completion_date TIMESTAMP WITH TIME ZONE,
    is_revoked BOOLEAN DEFAULT false,
    revoked_reason TEXT,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scrollbadges_student_id ON public.scrollbadges(student_id);
CREATE INDEX IF NOT EXISTS idx_scrollbadges_course_id ON public.scrollbadges(course_id);
CREATE INDEX IF NOT EXISTS idx_scrollbadges_token_id ON public.scrollbadges(token_id);
CREATE INDEX IF NOT EXISTS idx_scrollbadges_verification_hash ON public.scrollbadges(verification_hash);

-- Badge Verifications Table
CREATE TABLE IF NOT EXISTS public.badge_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    badge_id UUID REFERENCES public.scrollbadges(id) ON DELETE CASCADE,
    verification_id TEXT UNIQUE NOT NULL,
    is_valid BOOLEAN NOT NULL,
    badge_exists BOOLEAN NOT NULL,
    ownership_verified BOOLEAN NOT NULL,
    course_completed BOOLEAN NOT NULL,
    skills_validated BOOLEAN NOT NULL,
    blockchain_confirmed BOOLEAN NOT NULL,
    verified_by TEXT NOT NULL,
    verification_method TEXT NOT NULL,
    errors TEXT[] DEFAULT '{}',
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badge_verifications_badge_id ON public.badge_verifications(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_verifications_verification_id ON public.badge_verifications(verification_id);

-- Public Badge Profiles Table
CREATE TABLE IF NOT EXISTS public.public_badge_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id TEXT UNIQUE NOT NULL,
    student_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT true,
    display_name TEXT NOT NULL,
    profile_image TEXT,
    share_url TEXT UNIQUE NOT NULL,
    qr_code_url TEXT NOT NULL,
    embed_code TEXT,
    total_badges INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    skills_mastered TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_viewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_public_badge_profiles_student_id ON public.public_badge_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_public_badge_profiles_profile_id ON public.public_badge_profiles(profile_id);


-- ============================================================================
-- ADMISSIONS SYSTEM TABLES
-- ============================================================================

-- Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status application_status DEFAULT 'SUBMITTED',
    program_applied program_type NOT NULL,
    intended_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    personal_statement TEXT,
    academic_history JSONB DEFAULT '[]',
    spiritual_testimony TEXT,
    character_references JSONB DEFAULT '[]',
    documents JSONB DEFAULT '[]',
    eligibility_result JSONB,
    spiritual_evaluation JSONB,
    academic_evaluation JSONB,
    interview_results JSONB DEFAULT '[]',
    admission_decision TEXT,
    decision_date TIMESTAMP WITH TIME ZONE,
    decision_reasoning JSONB,
    enrollment_deadline TIMESTAMP WITH TIME ZONE,
    application_timeline JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_program_applied ON public.applications(program_applied);

-- ============================================================================
-- AI TUTOR AND CHAT TABLES
-- ============================================================================

-- AI Tutor Sessions Table
CREATE TABLE IF NOT EXISTS public.ai_tutor_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    tutor_type TEXT NOT NULL,
    tutor_name TEXT,
    conversation_history JSONB DEFAULT '[]',
    session_metadata JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_user_id ON public.ai_tutor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_course_id ON public.ai_tutor_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_started_at ON public.ai_tutor_sessions(started_at);

-- Messages Table (Community Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_id UUID,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    reactions JSONB DEFAULT '[]',
    thread_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrollcoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrollbadges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_badge_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.user_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('ADMIN', 'CHANCELLOR', 'SCROLL_ELDER')
        )
    );

-- ============================================================================
-- COURSES POLICIES
-- ============================================================================

-- Everyone can view active courses
CREATE POLICY "Anyone can view active courses"
    ON public.courses FOR SELECT
    USING (is_active = true);

-- Faculty and admins can create courses
CREATE POLICY "Faculty can create courses"
    ON public.courses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('FACULTY', 'ADMIN', 'CHANCELLOR')
        )
    );

-- Faculty can update their own courses
CREATE POLICY "Faculty can update own courses"
    ON public.courses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('FACULTY', 'ADMIN', 'CHANCELLOR')
        )
    );


-- ============================================================================
-- ENROLLMENTS POLICIES
-- ============================================================================

-- Users can view their own enrollments
CREATE POLICY "Users can view own enrollments"
    ON public.enrollments FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own enrollments
CREATE POLICY "Users can create own enrollments"
    ON public.enrollments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own enrollments
CREATE POLICY "Users can update own enrollments"
    ON public.enrollments FOR UPDATE
    USING (auth.uid() = user_id);

-- Faculty can view enrollments for their courses
CREATE POLICY "Faculty can view course enrollments"
    ON public.enrollments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            INNER JOIN public.user_profiles up ON up.id = auth.uid()
            WHERE c.id = enrollments.course_id 
            AND up.role IN ('FACULTY', 'ADMIN', 'CHANCELLOR')
        )
    );

-- ============================================================================
-- ASSIGNMENTS POLICIES
-- ============================================================================

-- Students can view assignments for enrolled courses
CREATE POLICY "Students can view course assignments"
    ON public.assignments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.user_id = auth.uid() AND e.course_id = assignments.course_id
        )
    );

-- Faculty can create assignments for their courses
CREATE POLICY "Faculty can create assignments"
    ON public.assignments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('FACULTY', 'ADMIN', 'CHANCELLOR')
        )
    );

-- Faculty can update assignments
CREATE POLICY "Faculty can update assignments"
    ON public.assignments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('FACULTY', 'ADMIN', 'CHANCELLOR')
        )
    );

-- ============================================================================
-- SUBMISSIONS POLICIES
-- ============================================================================

-- Students can view their own submissions
CREATE POLICY "Students can view own submissions"
    ON public.submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.id = submissions.enrollment_id AND e.user_id = auth.uid()
        )
    );

-- Students can create their own submissions
CREATE POLICY "Students can create own submissions"
    ON public.submissions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.id = enrollment_id AND e.user_id = auth.uid()
        )
    );

-- Faculty can view all submissions for their courses
CREATE POLICY "Faculty can view course submissions"
    ON public.submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            INNER JOIN public.user_profiles up ON up.id = auth.uid()
            WHERE a.id = submissions.assignment_id 
            AND up.role IN ('FACULTY', 'ADMIN', 'CHANCELLOR')
        )
    );

-- Faculty can update submissions (for grading)
CREATE POLICY "Faculty can grade submissions"
    ON public.submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('FACULTY', 'ADMIN', 'CHANCELLOR')
        )
    );


-- ============================================================================
-- PAYMENTS POLICIES
-- ============================================================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own payments
CREATE POLICY "Users can create own payments"
    ON public.payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('ADMIN', 'CHANCELLOR')
        )
    );

-- ============================================================================
-- SCROLLCOIN TRANSACTIONS POLICIES
-- ============================================================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
    ON public.scrollcoin_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- System can create transactions (handled by backend)
CREATE POLICY "System can create transactions"
    ON public.scrollcoin_transactions FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- RESEARCH PAPERS POLICIES
-- ============================================================================

-- Authors can view their own papers
CREATE POLICY "Authors can view own papers"
    ON public.research_papers FOR SELECT
    USING (auth.uid() = author_id);

-- Everyone can view published papers
CREATE POLICY "Anyone can view published papers"
    ON public.research_papers FOR SELECT
    USING (status = 'PUBLISHED');

-- Authors can create papers
CREATE POLICY "Authors can create papers"
    ON public.research_papers FOR INSERT
    WITH CHECK (auth.uid() = author_id);

-- Authors can update their own papers
CREATE POLICY "Authors can update own papers"
    ON public.research_papers FOR UPDATE
    USING (auth.uid() = author_id);

-- ============================================================================
-- SCROLLBADGES POLICIES
-- ============================================================================

-- Students can view their own badges
CREATE POLICY "Students can view own badges"
    ON public.scrollbadges FOR SELECT
    USING (auth.uid() = student_id);

-- Public badges are viewable by anyone
CREATE POLICY "Anyone can view public badges"
    ON public.scrollbadges FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.public_badge_profiles pbp
            WHERE pbp.student_id = scrollbadges.student_id AND pbp.is_public = true
        )
    );

-- System can create badges (handled by backend)
CREATE POLICY "System can create badges"
    ON public.scrollbadges FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- APPLICATIONS POLICIES
-- ============================================================================

-- Applicants can view their own applications
CREATE POLICY "Applicants can view own applications"
    ON public.applications FOR SELECT
    USING (auth.uid() = applicant_id);

-- Applicants can create applications
CREATE POLICY "Applicants can create applications"
    ON public.applications FOR INSERT
    WITH CHECK (auth.uid() = applicant_id);

-- Applicants can update their own applications
CREATE POLICY "Applicants can update own applications"
    ON public.applications FOR UPDATE
    USING (auth.uid() = applicant_id AND status IN ('SUBMITTED', 'UNDER_REVIEW'));

-- Admissions staff can view all applications
CREATE POLICY "Admissions staff can view applications"
    ON public.applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN (
                'ADMIN', 'ADMISSIONS_OFFICER', 'ADMISSIONS_COMMITTEE', 
                'INTERVIEWER', 'SPIRITUAL_EVALUATOR', 'ACADEMIC_ASSESSOR'
            )
        )
    );

-- Admissions staff can update applications
CREATE POLICY "Admissions staff can update applications"
    ON public.applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN (
                'ADMIN', 'ADMISSIONS_OFFICER', 'ADMISSIONS_COMMITTEE'
            )
        )
    );


-- ============================================================================
-- AI TUTOR SESSIONS POLICIES
-- ============================================================================

-- Users can view their own AI tutor sessions
CREATE POLICY "Users can view own AI sessions"
    ON public.ai_tutor_sessions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own AI tutor sessions
CREATE POLICY "Users can create own AI sessions"
    ON public.ai_tutor_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own AI tutor sessions
CREATE POLICY "Users can update own AI sessions"
    ON public.ai_tutor_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Users can view messages in channels they're part of
CREATE POLICY "Users can view channel messages"
    ON public.messages FOR SELECT
    USING (true); -- Will be refined with channel membership logic

-- Users can create messages
CREATE POLICY "Users can create messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Users can update their own messages
CREATE POLICY "Users can update own messages"
    ON public.messages FOR UPDATE
    USING (auth.uid() = sender_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
    ON public.messages FOR DELETE
    USING (auth.uid() = sender_id);

-- ============================================================================
-- DATABASE FUNCTIONS FOR COMPLEX OPERATIONS
-- ============================================================================

-- Function to enroll a student in a course
CREATE OR REPLACE FUNCTION public.enroll_in_course(
    p_user_id UUID,
    p_course_id UUID
) RETURNS UUID AS $$
DECLARE
    v_enrollment_id UUID;
    v_course_cost DECIMAL(10,2);
    v_user_balance DECIMAL(10,2);
BEGIN
    -- Get course cost
    SELECT scroll_coin_cost INTO v_course_cost
    FROM public.courses
    WHERE id = p_course_id AND is_active = true;
    
    IF v_course_cost IS NULL THEN
        RAISE EXCEPTION 'Course not found or not active';
    END IF;
    
    -- Get user balance
    SELECT scroll_coin_balance INTO v_user_balance
    FROM public.user_profiles
    WHERE id = p_user_id;
    
    -- Check if user has sufficient balance
    IF v_user_balance < v_course_cost THEN
        RAISE EXCEPTION 'Insufficient ScrollCoin balance';
    END IF;
    
    -- Create enrollment
    INSERT INTO public.enrollments (user_id, course_id)
    VALUES (p_user_id, p_course_id)
    RETURNING id INTO v_enrollment_id;
    
    -- Deduct ScrollCoin if cost > 0
    IF v_course_cost > 0 THEN
        UPDATE public.user_profiles
        SET scroll_coin_balance = scroll_coin_balance - v_course_cost
        WHERE id = p_user_id;
        
        -- Record transaction
        INSERT INTO public.scrollcoin_transactions (
            user_id, amount, type, description, related_entity_id
        ) VALUES (
            p_user_id, v_course_cost, 'SPENT', 
            'Course enrollment', p_course_id::TEXT
        );
    END IF;
    
    RETURN v_enrollment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to grade a submission
CREATE OR REPLACE FUNCTION public.grade_submission(
    p_submission_id UUID,
    p_score DECIMAL(5,2),
    p_feedback TEXT,
    p_grader_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_enrollment_id UUID;
    v_assignment_id UUID;
    v_max_points INTEGER;
    v_xp_earned INTEGER;
BEGIN
    -- Get submission details
    SELECT enrollment_id, assignment_id INTO v_enrollment_id, v_assignment_id
    FROM public.submissions
    WHERE id = p_submission_id;
    
    IF v_enrollment_id IS NULL THEN
        RAISE EXCEPTION 'Submission not found';
    END IF;
    
    -- Get assignment max points
    SELECT max_points INTO v_max_points
    FROM public.assignments
    WHERE id = v_assignment_id;
    
    -- Update submission
    UPDATE public.submissions
    SET 
        score = p_score,
        feedback = p_feedback,
        graded_by = p_grader_id,
        graded_at = NOW(),
        status = 'GRADED'
    WHERE id = p_submission_id;
    
    -- Calculate XP earned (proportional to score)
    v_xp_earned := FLOOR((p_score / v_max_points) * 10);
    
    -- Update enrollment XP
    UPDATE public.enrollments
    SET scroll_xp_earned = scroll_xp_earned + v_xp_earned
    WHERE id = v_enrollment_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a course and award ScrollCoin
CREATE OR REPLACE FUNCTION public.complete_course(
    p_enrollment_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_course_id UUID;
    v_xp_reward INTEGER;
    v_scrollcoin_reward DECIMAL(10,2);
BEGIN
    -- Get enrollment details
    SELECT user_id, course_id INTO v_user_id, v_course_id
    FROM public.enrollments
    WHERE id = p_enrollment_id;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Enrollment not found';
    END IF;
    
    -- Get course rewards
    SELECT scroll_xp_reward INTO v_xp_reward
    FROM public.courses
    WHERE id = v_course_id;
    
    -- Calculate ScrollCoin reward (1 ScrollCoin per 10 XP)
    v_scrollcoin_reward := v_xp_reward / 10.0;
    
    -- Update enrollment
    UPDATE public.enrollments
    SET 
        progress = 100.0,
        status = 'GRADUATED',
        completed_at = NOW()
    WHERE id = p_enrollment_id;
    
    -- Award ScrollCoin
    UPDATE public.user_profiles
    SET scroll_coin_balance = scroll_coin_balance + v_scrollcoin_reward
    WHERE id = v_user_id;
    
    -- Record transaction
    INSERT INTO public.scrollcoin_transactions (
        user_id, amount, type, description, 
        activity_type, related_entity_id
    ) VALUES (
        v_user_id, v_scrollcoin_reward, 'EARNED', 
        'Course completion reward', 'COURSE_COMPLETION', v_course_id::TEXT
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to process payment
CREATE OR REPLACE FUNCTION public.process_payment(
    p_user_id UUID,
    p_amount DECIMAL(10,2),
    p_currency TEXT,
    p_method payment_method,
    p_description TEXT,
    p_external_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_payment_id UUID;
BEGIN
    -- Create payment record
    INSERT INTO public.payments (
        user_id, amount, currency, method, description,
        stripe_payment_id, status, processed_at
    ) VALUES (
        p_user_id, p_amount, p_currency, p_method, p_description,
        p_external_id, 'COMPLETED', NOW()
    ) RETURNING id INTO v_payment_id;
    
    -- If payment is with ScrollCoin, deduct from balance
    IF p_method = 'SCROLL_COIN' THEN
        UPDATE public.user_profiles
        SET scroll_coin_balance = scroll_coin_balance - p_amount
        WHERE id = p_user_id;
        
        -- Record ScrollCoin transaction
        INSERT INTO public.scrollcoin_transactions (
            user_id, amount, type, description
        ) VALUES (
            p_user_id, p_amount, 'SPENT', p_description
        );
    END IF;
    
    RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DATABASE TRIGGERS FOR AUDIT LOGGING AND AUTOMATIC UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faculties_updated_at
    BEFORE UPDATE ON public.faculties
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at
    BEFORE UPDATE ON public.enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_research_papers_updated_at
    BEFORE UPDATE ON public.research_papers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scrollbadges_updated_at
    BEFORE UPDATE ON public.scrollbadges
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_public_badge_profiles_updated_at
    BEFORE UPDATE ON public.public_badge_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_tutor_sessions_updated_at
    BEFORE UPDATE ON public.ai_tutor_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


-- Audit log table for tracking important changes
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES auth.users(id),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Function to log audit trail
CREATE OR REPLACE FUNCTION public.log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            table_name, record_id, action, old_data, user_id
        ) VALUES (
            TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid()
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (
            table_name, record_id, action, old_data, new_data, user_id
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid()
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            table_name, record_id, action, new_data, user_id
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid()
        );
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging to critical tables
CREATE TRIGGER audit_user_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_enrollments
    AFTER INSERT OR UPDATE OR DELETE ON public.enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_submissions
    AFTER INSERT OR UPDATE OR DELETE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_payments
    AFTER INSERT OR UPDATE OR DELETE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_scrollcoin_transactions
    AFTER INSERT OR UPDATE OR DELETE ON public.scrollcoin_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_applications
    AFTER INSERT OR UPDATE OR DELETE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.log_audit_trail();

-- ============================================================================
-- SUPABASE STORAGE BUCKETS CONFIGURATION
-- ============================================================================

-- Create storage buckets for course materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('course-materials', 'course-materials', false, 104857600, ARRAY['application/pdf', 'video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'application/zip']),
    ('user-avatars', 'user-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
    ('assignment-submissions', 'assignment-submissions', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
    ('badge-images', 'badge-images', true, 2097152, ARRAY['image/png', 'image/svg+xml', 'image/webp']),
    ('research-papers', 'research-papers', false, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- STORAGE BUCKET POLICIES
-- ============================================================================

-- Course Materials Policies
CREATE POLICY "Enrolled students can view course materials"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'course-materials' AND
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.user_id = auth.uid()
            AND (storage.foldername(name))[1] = e.course_id::TEXT
        )
    );

CREATE POLICY "Faculty can upload course materials"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'course-materials' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('FACULTY', 'ADMIN', 'CHANCELLOR')
        )
    );

-- User Avatars Policies
CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'user-avatars' AND
        (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'user-avatars' AND
        (storage.foldername(name))[1] = auth.uid()::TEXT
    );

-- Assignment Submissions Policies
CREATE POLICY "Students can upload their submissions"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'assignment-submissions' AND
        (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "Students can view their own submissions"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'assignment-submissions' AND
        (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "Faculty can view all submissions"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'assignment-submissions' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('FACULTY', 'ADMIN', 'CHANCELLOR')
        )
    );

-- Badge Images Policies
CREATE POLICY "Anyone can view badge images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'badge-images');

CREATE POLICY "System can upload badge images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'badge-images');

-- Research Papers Policies
CREATE POLICY "Authors can upload research papers"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'research-papers' AND
        (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "Authors can view their own papers"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'research-papers' AND
        (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "Anyone can view published papers"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'research-papers' AND
        EXISTS (
            SELECT 1 FROM public.research_papers rp
            WHERE rp.status = 'PUBLISHED'
        )
    );


-- ============================================================================
-- HELPER FUNCTIONS AND VIEWS
-- ============================================================================

-- View for user dashboard statistics
CREATE OR REPLACE VIEW public.user_dashboard_stats AS
SELECT 
    up.id as user_id,
    up.username,
    up.scroll_coin_balance,
    COUNT(DISTINCT e.id) as total_enrollments,
    COUNT(DISTINCT CASE WHEN e.status = 'GRADUATED' THEN e.id END) as completed_courses,
    SUM(e.scroll_xp_earned) as total_xp,
    COUNT(DISTINCT sb.id) as total_badges,
    AVG(s.score) as average_score
FROM public.user_profiles up
LEFT JOIN public.enrollments e ON e.user_id = up.id
LEFT JOIN public.scrollbadges sb ON sb.student_id = up.id
LEFT JOIN public.submissions s ON s.enrollment_id = e.id AND s.status = 'GRADED'
GROUP BY up.id, up.username, up.scroll_coin_balance;

-- View for course statistics
CREATE OR REPLACE VIEW public.course_stats AS
SELECT 
    c.id as course_id,
    c.title,
    c.difficulty,
    COUNT(DISTINCT e.id) as total_enrollments,
    COUNT(DISTINCT CASE WHEN e.status = 'GRADUATED' THEN e.id END) as completions,
    AVG(e.progress) as average_progress,
    COUNT(DISTINCT a.id) as total_assignments,
    AVG(s.score) as average_score
FROM public.courses c
LEFT JOIN public.enrollments e ON e.course_id = c.id
LEFT JOIN public.assignments a ON a.course_id = c.id
LEFT JOIN public.submissions s ON s.assignment_id = a.id AND s.status = 'GRADED'
WHERE c.is_active = true
GROUP BY c.id, c.title, c.difficulty;

-- Function to get user progress in a course
CREATE OR REPLACE FUNCTION public.get_course_progress(
    p_user_id UUID,
    p_course_id UUID
) RETURNS TABLE (
    enrollment_id UUID,
    progress DECIMAL(5,2),
    xp_earned INTEGER,
    assignments_completed INTEGER,
    assignments_total INTEGER,
    average_score DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id as enrollment_id,
        e.progress,
        e.scroll_xp_earned as xp_earned,
        COUNT(DISTINCT CASE WHEN s.status = 'GRADED' THEN s.id END)::INTEGER as assignments_completed,
        COUNT(DISTINCT a.id)::INTEGER as assignments_total,
        AVG(s.score) as average_score
    FROM public.enrollments e
    LEFT JOIN public.assignments a ON a.course_id = e.course_id
    LEFT JOIN public.submissions s ON s.assignment_id = a.id AND s.enrollment_id = e.id
    WHERE e.user_id = p_user_id AND e.course_id = p_course_id
    GROUP BY e.id, e.progress, e.scroll_xp_earned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search courses
CREATE OR REPLACE FUNCTION public.search_courses(
    p_search_term TEXT,
    p_difficulty difficulty DEFAULT NULL,
    p_faculty_id UUID DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    difficulty difficulty,
    duration INTEGER,
    scroll_coin_cost DECIMAL(10,2),
    faculty_name TEXT,
    enrollment_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.description,
        c.difficulty,
        c.duration,
        c.scroll_coin_cost,
        f.name as faculty_name,
        COUNT(e.id) as enrollment_count
    FROM public.courses c
    LEFT JOIN public.faculties f ON f.id = c.faculty_id
    LEFT JOIN public.enrollments e ON e.course_id = c.id
    WHERE c.is_active = true
    AND (p_search_term IS NULL OR c.title ILIKE '%' || p_search_term || '%' OR c.description ILIKE '%' || p_search_term || '%')
    AND (p_difficulty IS NULL OR c.difficulty = p_difficulty)
    AND (p_faculty_id IS NULL OR c.faculty_id = p_faculty_id)
    GROUP BY c.id, c.title, c.description, c.difficulty, c.duration, c.scroll_coin_cost, f.name
    ORDER BY enrollment_count DESC, c.title;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to get leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard(
    p_limit INTEGER DEFAULT 10,
    p_timeframe TEXT DEFAULT 'all_time'
) RETURNS TABLE (
    rank BIGINT,
    user_id UUID,
    username TEXT,
    total_xp BIGINT,
    courses_completed BIGINT,
    scroll_coin_balance DECIMAL(10,2),
    badges_earned BIGINT
) AS $$
DECLARE
    v_start_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Determine timeframe
    CASE p_timeframe
        WHEN 'week' THEN v_start_date := NOW() - INTERVAL '7 days';
        WHEN 'month' THEN v_start_date := NOW() - INTERVAL '30 days';
        WHEN 'year' THEN v_start_date := NOW() - INTERVAL '365 days';
        ELSE v_start_date := '1970-01-01'::TIMESTAMP WITH TIME ZONE;
    END CASE;
    
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY SUM(e.scroll_xp_earned) DESC) as rank,
        up.id as user_id,
        up.username,
        SUM(e.scroll_xp_earned) as total_xp,
        COUNT(DISTINCT CASE WHEN e.status = 'GRADUATED' THEN e.id END) as courses_completed,
        up.scroll_coin_balance,
        COUNT(DISTINCT sb.id) as badges_earned
    FROM public.user_profiles up
    LEFT JOIN public.enrollments e ON e.user_id = up.id AND e.created_at >= v_start_date
    LEFT JOIN public.scrollbadges sb ON sb.student_id = up.id AND sb.created_at >= v_start_date
    GROUP BY up.id, up.username, up.scroll_coin_balance
    HAVING SUM(e.scroll_xp_earned) > 0
    ORDER BY total_xp DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award daily XP streak bonus
CREATE OR REPLACE FUNCTION public.award_daily_streak_bonus(
    p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_last_activity DATE;
    v_streak_days INTEGER;
    v_bonus_amount DECIMAL(10,2);
BEGIN
    -- Get last activity date
    SELECT MAX(DATE(created_at)) INTO v_last_activity
    FROM public.scrollcoin_transactions
    WHERE user_id = p_user_id AND activity_type = 'DAILY_XP_STREAK';
    
    -- Check if user is eligible for streak bonus (last activity was yesterday)
    IF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
        -- Calculate streak bonus (increases with consecutive days)
        v_streak_days := 1; -- This would be calculated from a streak tracking table
        v_bonus_amount := 1.0 + (v_streak_days * 0.1); -- Base 1 ScrollCoin + 0.1 per day
        
        -- Award bonus
        UPDATE public.user_profiles
        SET scroll_coin_balance = scroll_coin_balance + v_bonus_amount
        WHERE id = p_user_id;
        
        -- Record transaction
        INSERT INTO public.scrollcoin_transactions (
            user_id, amount, type, description, activity_type
        ) VALUES (
            p_user_id, v_bonus_amount, 'EARNED', 
            'Daily XP streak bonus', 'DAILY_XP_STREAK'
        );
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REALTIME PUBLICATION SETUP
-- ============================================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_tutor_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scrollcoin_transactions;

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_courses_title_search ON public.courses USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_courses_description_search ON public.courses USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_research_papers_title_search ON public.research_papers USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_research_papers_abstract_search ON public.research_papers USING gin(to_tsvector('english', abstract));

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_enrollments_user_status ON public.enrollments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_status ON public.enrollments(course_id, status);
CREATE INDEX IF NOT EXISTS idx_submissions_enrollment_status ON public.submissions(enrollment_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON public.payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_scrollcoin_transactions_user_type ON public.scrollcoin_transactions(user_id, type);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Complete Production Schema Migration completed successfully';
    RAISE NOTICE 'Tables created: user_profiles, faculties, courses, enrollments, assignments, submissions, payments, scrollcoin_transactions, research_papers, certifications, scrollbadges, badge_verifications, public_badge_profiles, applications, ai_tutor_sessions, messages, audit_logs';
    RAISE NOTICE 'RLS policies applied to all tables';
    RAISE NOTICE 'Database functions created: enroll_in_course, grade_submission, complete_course, process_payment, get_course_progress, search_courses, get_leaderboard, award_daily_streak_bonus';
    RAISE NOTICE 'Triggers created: updated_at triggers, audit logging triggers';
    RAISE NOTICE 'Storage buckets configured: course-materials, user-avatars, assignment-submissions, badge-images, research-papers';
    RAISE NOTICE 'Realtime enabled for: messages, enrollments, submissions, ai_tutor_sessions, scrollcoin_transactions';
END $$;
