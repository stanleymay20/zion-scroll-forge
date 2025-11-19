-- Academic Integrity System Migration
-- "The LORD detests dishonest scales, but accurate weights find favor with him" - Proverbs 11:1

-- ============================================================================
-- INTEGRITY VIOLATIONS TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.integrity_violations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    violation_type TEXT NOT NULL CHECK (violation_type IN (
        'plagiarism', 'cheating', 'collusion', 'fabrication',
        'unauthorized_assistance', 'contract_cheating', 'ai_misuse', 'other'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('minor', 'major', 'severe')),
    course_id UUID REFERENCES public.courses(id),
    assignment_id UUID REFERENCES public.assignments(id),
    description TEXT NOT NULL,
    evidence JSONB DEFAULT '{}',
    detection_method TEXT,
    reported_by UUID REFERENCES auth.users(id),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Review Process
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    determination TEXT CHECK (determination IN ('innocent', 'minor_violation', 'major_violation', 'severe_violation')),
    review_notes TEXT,
    
    -- Consequences
    consequences JSONB DEFAULT '[]',
    grade_penalty TEXT,
    additional_actions JSONB DEFAULT '[]',
    
    -- Appeal
    appeal_filed BOOLEAN DEFAULT false,
    appeal_status TEXT CHECK (appeal_status IN ('pending', 'approved', 'denied')),
    appeal_notes TEXT,
    
    -- Restoration
    restoration_plan JSONB DEFAULT '{}',
    restoration_complete BOOLEAN DEFAULT false,
    restoration_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PLAGIARISM DETECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.plagiarism_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Detection Results
    turnitin_score DECIMAL(5,2),
    turnitin_report_url TEXT,
    turnitin_sources JSONB DEFAULT '[]',
    
    ai_content_probability DECIMAL(5,2),
    ai_detection_details JSONB DEFAULT '{}',
    
    style_deviation_score DECIMAL(5,2),
    style_analysis JSONB DEFAULT '{}',
    
    internal_similarity_score DECIMAL(5,2),
    similar_submissions JSONB DEFAULT '[]',
    
    collusion_detected BOOLEAN DEFAULT false,
    collusion_details JSONB DEFAULT '{}',
    
    -- Overall Assessment
    overall_risk_level TEXT CHECK (overall_risk_level IN ('low', 'medium', 'high', 'critical')),
    flagged BOOLEAN DEFAULT false,
    flag_reasons TEXT[] DEFAULT '{}',
    
    -- Review
    reviewed BOOLEAN DEFAULT false,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_outcome TEXT CHECK (review_outcome IN ('cleared', 'warning', 'violation')),
    review_notes TEXT,
    
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INTEGRITY TRAINING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.integrity_training_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_name TEXT NOT NULL UNIQUE,
    module_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    quiz_questions JSONB NOT NULL,
    passing_score INTEGER DEFAULT 100,
    required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_integrity_training (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.integrity_training_modules(id) ON DELETE CASCADE,
    
    -- Progress
    started BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Assessment
    quiz_attempts INTEGER DEFAULT 0,
    quiz_scores INTEGER[] DEFAULT '{}',
    highest_score INTEGER DEFAULT 0,
    passed BOOLEAN DEFAULT false,
    
    -- Time Tracking
    time_spent_minutes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(student_id, module_id)
);

-- ============================================================================
-- PROCTORING SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.proctoring_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    proctoring_type TEXT CHECK (proctoring_type IN ('automated', 'live', 'recorded', 'in_person')),
    
    -- Session Data
    session_token TEXT UNIQUE,
    session_recording_url TEXT,
    screen_recording_url TEXT,
    webcam_recording_url TEXT,
    audio_recording_url TEXT,
    
    -- Verification
    id_verified BOOLEAN DEFAULT false,
    id_verification_method TEXT,
    id_verification_timestamp TIMESTAMP WITH TIME ZONE,
    
    environment_verified BOOLEAN DEFAULT false,
    environment_scan_url TEXT,
    environment_scan_timestamp TIMESTAMP WITH TIME ZONE,
    
    -- Monitoring Results
    flags JSONB DEFAULT '[]',
    flag_count INTEGER DEFAULT 0,
    
    ai_analysis JSONB DEFAULT '{}',
    behavior_analysis JSONB DEFAULT '{}',
    
    proctor_id UUID REFERENCES auth.users(id),
    proctor_notes TEXT,
    
    -- Integrity Assessment
    integrity_score DECIMAL(5,2),
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    requires_review BOOLEAN DEFAULT false,
    
    -- Session Timing
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proctoring Flags (detailed incidents during session)
CREATE TABLE IF NOT EXISTS public.proctoring_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.proctoring_sessions(id) ON DELETE CASCADE,
    flag_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    video_timestamp INTEGER, -- seconds into recording
    screenshot_url TEXT,
    ai_confidence DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- HONOR CODE AGREEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.honor_code_agreements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    agreement_version TEXT NOT NULL,
    agreed BOOLEAN DEFAULT false,
    agreed_at TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    signature_data TEXT, -- Digital signature
    witness_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CITATION CHECKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.citation_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Citation Analysis
    total_citations INTEGER DEFAULT 0,
    proper_citations INTEGER DEFAULT 0,
    improper_citations INTEGER DEFAULT 0,
    missing_citations INTEGER DEFAULT 0,
    
    citation_style TEXT, -- APA, MLA, Chicago, etc.
    citation_errors JSONB DEFAULT '[]',
    
    -- Assessment
    citation_quality_score DECIMAL(5,2),
    needs_improvement BOOLEAN DEFAULT false,
    feedback TEXT,
    
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INTEGRITY REPORTS (Anonymous Reporting)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.integrity_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id), -- NULL if anonymous
    reported_student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    report_type TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    
    course_id UUID REFERENCES public.courses(id),
    assignment_id UUID REFERENCES public.assignments(id),
    
    anonymous BOOLEAN DEFAULT false,
    
    -- Investigation
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'investigating', 'resolved', 'dismissed')),
    investigated_by UUID REFERENCES auth.users(id),
    investigation_notes TEXT,
    outcome TEXT,
    
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if student has completed integrity training
CREATE OR REPLACE FUNCTION public.has_completed_integrity_training(
    p_student_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    required_modules INTEGER;
    completed_modules INTEGER;
BEGIN
    -- Count required modules
    SELECT COUNT(*) INTO required_modules
    FROM integrity_training_modules
    WHERE required = true;
    
    -- Count completed modules
    SELECT COUNT(*) INTO completed_modules
    FROM student_integrity_training
    WHERE student_id = p_student_id
    AND passed = true
    AND module_id IN (
        SELECT id FROM integrity_training_modules WHERE required = true
    );
    
    RETURN completed_modules >= required_modules;
END;
$$;

-- Function to calculate student integrity score
CREATE OR REPLACE FUNCTION public.calculate_integrity_score(
    p_student_id UUID
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_score DECIMAL := 100.0;
    violation_count INTEGER;
    minor_violations INTEGER;
    major_violations INTEGER;
    severe_violations INTEGER;
BEGIN
    -- Count violations by severity
    SELECT 
        COUNT(*) FILTER (WHERE severity = 'minor'),
        COUNT(*) FILTER (WHERE severity = 'major'),
        COUNT(*) FILTER (WHERE severity = 'severe')
    INTO minor_violations, major_violations, severe_violations
    FROM integrity_violations
    WHERE student_id = p_student_id;
    
    -- Deduct points based on violations
    base_score := base_score - (minor_violations * 5);
    base_score := base_score - (major_violations * 20);
    base_score := base_score - (severe_violations * 50);
    
    -- Ensure score doesn't go below 0
    IF base_score < 0 THEN
        base_score := 0;
    END IF;
    
    RETURN base_score;
END;
$$;

-- Function to flag submission for review
CREATE OR REPLACE FUNCTION public.flag_submission_for_review(
    p_submission_id UUID,
    p_plagiarism_check_id UUID,
    p_reasons TEXT[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update plagiarism check
    UPDATE plagiarism_checks
    SET 
        flagged = true,
        flag_reasons = p_reasons,
        overall_risk_level = 'high'
    WHERE id = p_plagiarism_check_id;
    
    -- Update submission status
    UPDATE submissions
    SET status = 'RETURNED'
    WHERE id = p_submission_id;
    
    -- Create notification for instructor
    -- (Would integrate with notification system)
    
    RETURN true;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Integrity Violations RLS
ALTER TABLE public.integrity_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own violations" ON public.integrity_violations
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Faculty can view violations in their courses" ON public.integrity_violations
    FOR SELECT USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin') OR
        has_role(auth.uid(), 'faculty')
    );

CREATE POLICY "Faculty can create violations" ON public.integrity_violations
    FOR INSERT WITH CHECK (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin') OR
        has_role(auth.uid(), 'faculty')
    );

-- Plagiarism Checks RLS
ALTER TABLE public.plagiarism_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own plagiarism checks" ON public.plagiarism_checks
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Faculty can view all plagiarism checks" ON public.plagiarism_checks
    FOR SELECT USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin') OR
        has_role(auth.uid(), 'faculty')
    );

-- Integrity Training RLS
ALTER TABLE public.student_integrity_training ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own training progress" ON public.student_integrity_training
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can update their own training progress" ON public.student_integrity_training
    FOR UPDATE USING (student_id = auth.uid());

-- Proctoring Sessions RLS
ALTER TABLE public.proctoring_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own proctoring sessions" ON public.proctoring_sessions
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Faculty can view all proctoring sessions" ON public.proctoring_sessions
    FOR SELECT USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin') OR
        has_role(auth.uid(), 'faculty')
    );

-- Honor Code Agreements RLS
ALTER TABLE public.honor_code_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own honor code agreement" ON public.honor_code_agreements
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create their own honor code agreement" ON public.honor_code_agreements
    FOR INSERT WITH CHECK (student_id = auth.uid());

-- Integrity Reports RLS
ALTER TABLE public.integrity_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit integrity reports" ON public.integrity_reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Faculty can view all integrity reports" ON public.integrity_reports
    FOR SELECT USING (
        has_role(auth.uid(), 'superadmin') OR 
        has_role(auth.uid(), 'admin') OR
        has_role(auth.uid(), 'faculty')
    );

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_integrity_violations_student_id ON public.integrity_violations(student_id);
CREATE INDEX IF NOT EXISTS idx_integrity_violations_severity ON public.integrity_violations(severity);
CREATE INDEX IF NOT EXISTS idx_integrity_violations_course_id ON public.integrity_violations(course_id);
CREATE INDEX IF NOT EXISTS idx_plagiarism_checks_submission_id ON public.plagiarism_checks(submission_id);
CREATE INDEX IF NOT EXISTS idx_plagiarism_checks_flagged ON public.plagiarism_checks(flagged);
CREATE INDEX IF NOT EXISTS idx_student_integrity_training_student_id ON public.student_integrity_training(student_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_sessions_student_id ON public.proctoring_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_sessions_exam_id ON public.proctoring_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_integrity_reports_status ON public.integrity_reports(status);

-- ============================================================================
-- SEED DATA - Integrity Training Modules
-- ============================================================================

INSERT INTO public.integrity_training_modules (module_name, module_number, title, description, content, quiz_questions, passing_score, required)
VALUES 
(
    'why_integrity_matters',
    1,
    'Why Integrity Matters',
    'Understanding the biblical and practical importance of academic integrity',
    '{"sections": ["Biblical Foundation", "Long-term Consequences", "Character Building", "Professional Ethics"]}',
    '{"questions": [{"question": "What does the Bible say about honesty?", "options": ["It is optional", "It is required", "It depends"], "correct": 1}]}',
    100,
    true
),
(
    'what_constitutes_violations',
    2,
    'What Constitutes Violations',
    'Learning what academic dishonesty looks like with examples',
    '{"sections": ["Plagiarism", "Cheating", "Collusion", "Fabrication", "AI Misuse"]}',
    '{"questions": [{"question": "Is copying a friend''s homework plagiarism?", "options": ["Yes", "No", "Sometimes"], "correct": 0}]}',
    100,
    true
),
(
    'maintaining_integrity',
    3,
    'How to Maintain Integrity',
    'Practical strategies for maintaining academic integrity',
    '{"sections": ["Proper Citation", "Time Management", "Asking for Help", "Using AI Ethically"]}',
    '{"questions": [{"question": "When should you cite sources?", "options": ["Always", "Sometimes", "Never"], "correct": 0}]}',
    100,
    true
),
(
    'resources_and_support',
    4,
    'Resources and Support',
    'Available resources to help you succeed with integrity',
    '{"sections": ["Writing Center", "Tutoring", "Extensions", "Mental Health", "Academic Advising"]}',
    '{"questions": [{"question": "What should you do if you''re struggling?", "options": ["Cheat", "Ask for help", "Give up"], "correct": 1}]}',
    100,
    true
);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- COMPLETION FLAG
-- ============================================================================

INSERT INTO public.development_flags (name, flag_key, is_enabled, created_at)
VALUES ('Academic Integrity System', 'Jesus-Christ-is-Lord-Academic-Integrity', true, NOW())
ON CONFLICT (flag_key) DO UPDATE SET is_enabled = true, created_at = NOW();
