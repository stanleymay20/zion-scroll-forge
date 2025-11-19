-- Assessment and Progress Tracking System Migration
-- Complete implementation of quizzes, assignments, grading, and progress tracking

-- Enhanced assessments table
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS assessment_type TEXT DEFAULT 'quiz' CHECK (assessment_type IN ('quiz', 'exam', 'project', 'discussion', 'peer_review', 'practical'));
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 1;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS passing_score DECIMAL(5,2) DEFAULT 70.0;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS randomize_questions BOOLEAN DEFAULT false;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS show_results_immediately BOOLEAN DEFAULT true;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS allow_review BOOLEAN DEFAULT true;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]';
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS rubric JSONB DEFAULT '{}';
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS generation_job_id UUID REFERENCES public.content_generation_jobs(id);

-- Quiz questions with enhanced features
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching', 'fill_blank', 'ordering')),
    options JSONB DEFAULT '[]', -- For multiple choice, matching, etc.
    correct_answer JSONB NOT NULL, -- Flexible storage for different answer types
    explanation TEXT,
    points DECIMAL(5,2) DEFAULT 1.0,
    order_index INTEGER NOT NULL,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    tags JSONB DEFAULT '[]',
    learning_objective TEXT,
    time_estimate INTEGER, -- seconds
    ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student quiz attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded', 'expired')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    time_taken_seconds INTEGER,
    score DECIMAL(5,2),
    max_possible_score DECIMAL(5,2),
    percentage DECIMAL(5,2),
    passed BOOLEAN,
    responses JSONB DEFAULT '{}', -- question_id -> response mapping
    feedback JSONB DEFAULT '{}', -- Per-question feedback
    grader_notes TEXT,
    graded_by UUID REFERENCES auth.users(id),
    graded_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    proctoring_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, assessment_id, attempt_number)
);

-- Enhanced assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    assignment_type TEXT DEFAULT 'written' CHECK (assignment_type IN ('written', 'project', 'presentation', 'code', 'portfolio', 'reflection', 'research')),
    instructions TEXT,
    requirements JSONB DEFAULT '{}',
    rubric JSONB DEFAULT '{}',
    max_points DECIMAL(5,2) NOT NULL DEFAULT 100,
    due_date TIMESTAMP WITH TIME ZONE,
    late_policy JSONB DEFAULT '{}',
    submission_format JSONB DEFAULT '[]', -- ['pdf', 'doc', 'txt', 'zip']
    max_file_size INTEGER DEFAULT 10485760, -- 10MB in bytes
    allow_resubmission BOOLEAN DEFAULT false,
    peer_review_required BOOLEAN DEFAULT false,
    group_assignment BOOLEAN DEFAULT false,
    max_group_size INTEGER DEFAULT 1,
    auto_grading BOOLEAN DEFAULT false,
    ai_grading_enabled BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID, -- For group assignments
    submission_text TEXT,
    file_attachments JSONB DEFAULT '[]',
    submission_data JSONB DEFAULT '{}', -- Flexible storage for different submission types
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_late BOOLEAN DEFAULT false,
    late_penalty DECIMAL(5,2) DEFAULT 0,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'returned', 'resubmitted')),
    grade DECIMAL(5,2),
    feedback TEXT,
    rubric_scores JSONB DEFAULT '{}',
    graded_by UUID REFERENCES auth.users(id),
    graded_at TIMESTAMP WITH TIME ZONE,
    returned_at TIMESTAMP WITH TIME ZONE,
    revision_requested BOOLEAN DEFAULT false,
    revision_notes TEXT,
    attempt_number INTEGER DEFAULT 1,
    plagiarism_check JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assignment_id, user_id, attempt_number)
);

-- Student progress tracking
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.course_modules(id) ON DELETE SET NULL,
    lecture_id UUID REFERENCES public.lectures(id) ON DELETE SET NULL,
    progress_type TEXT NOT NULL CHECK (progress_type IN ('course_started', 'module_started', 'module_completed', 'lecture_viewed', 'lecture_completed', 'assessment_started', 'assessment_completed', 'assignment_submitted')),
    progress_value DECIMAL(5,2) DEFAULT 0, -- Percentage or score
    time_spent_seconds INTEGER DEFAULT 0,
    completion_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning analytics and insights
CREATE TABLE IF NOT EXISTS public.learning_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_type TEXT CHECK (metric_type IN ('time', 'score', 'count', 'percentage')),
    calculation_date DATE DEFAULT CURRENT_DATE,
    academic_week INTEGER,
    comparison_data JSONB DEFAULT '{}', -- Peer comparisons, class averages, etc.
    insights JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id, metric_name, calculation_date)
);

-- Grade book entries
CREATE TABLE IF NOT EXISTS public.gradebook_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
    grade_category TEXT NOT NULL CHECK (grade_category IN ('quiz', 'exam', 'assignment', 'participation', 'project', 'extra_credit')),
    raw_score DECIMAL(8,2),
    max_points DECIMAL(8,2),
    weighted_score DECIMAL(8,2),
    percentage DECIMAL(5,2),
    letter_grade TEXT,
    is_excused BOOLEAN DEFAULT false,
    is_dropped BOOLEAN DEFAULT false,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course completion certificates
CREATE TABLE IF NOT EXISTS public.course_certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    completion_date DATE NOT NULL,
    final_grade DECIMAL(5,2),
    letter_grade TEXT,
    gpa_points DECIMAL(3,2),
    credit_hours DECIMAL(4,2),
    certificate_url TEXT,
    blockchain_hash TEXT, -- For verification
    verification_url TEXT,
    is_valid BOOLEAN DEFAULT true,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES auth.users(id),
    revocation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Functions for assessment and progress

-- Function to calculate course progress
CREATE OR REPLACE FUNCTION public.calculate_course_progress(
    user_uuid UUID,
    course_uuid UUID
) RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_items INTEGER;
    completed_items INTEGER;
    progress_percentage DECIMAL(5,2);
BEGIN
    -- Count total lectures and assessments
    SELECT COUNT(*) INTO total_items
    FROM (
        SELECT l.id FROM lectures l
        JOIN course_modules cm ON l.module_id = cm.id
        WHERE cm.course_id = course_uuid
        UNION ALL
        SELECT a.id FROM assessments a
        WHERE a.course_id = course_uuid
    ) total;
    
    IF total_items = 0 THEN
        RETURN 0;
    END IF;
    
    -- Count completed items
    SELECT COUNT(*) INTO completed_items
    FROM (
        SELECT DISTINCT sp.lecture_id FROM student_progress sp
        WHERE sp.user_id = user_uuid 
        AND sp.progress_type = 'lecture_completed'
        AND sp.lecture_id IN (
            SELECT l.id FROM lectures l
            JOIN course_modules cm ON l.module_id = cm.id
            WHERE cm.course_id = course_uuid
        )
        UNION ALL
        SELECT DISTINCT qa.assessment_id FROM quiz_attempts qa
        WHERE qa.user_id = user_uuid 
        AND qa.status = 'graded'
        AND qa.passed = true
        AND qa.assessment_id IN (
            SELECT a.id FROM assessments a WHERE a.course_id = course_uuid
        )
    ) completed;
    
    progress_percentage := (completed_items::DECIMAL / total_items::DECIMAL) * 100;
    
    -- Update or insert progress record
    INSERT INTO student_progress (
        user_id, course_id, progress_type, progress_value, completion_date
    ) VALUES (
        user_uuid, course_uuid, 'course_progress', progress_percentage,
        CASE WHEN progress_percentage = 100 THEN NOW() ELSE NULL END
    )
    ON CONFLICT (user_id, course_id, progress_type, DATE(created_at))
    DO UPDATE SET 
        progress_value = progress_percentage,
        completion_date = CASE WHEN progress_percentage = 100 THEN NOW() ELSE student_progress.completion_date END,
        created_at = NOW();
    
    RETURN progress_percentage;
END;
$$;

-- Function to auto-grade quiz attempt
CREATE OR REPLACE FUNCTION public.auto_grade_quiz(
    attempt_uuid UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    attempt_record RECORD;
    question RECORD;
    user_answer JSONB;
    correct_answer JSONB;
    question_score DECIMAL(5,2);
    total_score DECIMAL(5,2) := 0;
    max_score DECIMAL(5,2) := 0;
    percentage DECIMAL(5,2);
    scrollcoins_earned INTEGER;
BEGIN
    -- Get attempt details
    SELECT * INTO attempt_record FROM quiz_attempts WHERE id = attempt_uuid;
    
    IF attempt_record.status != 'submitted' THEN
        RAISE EXCEPTION 'Attempt must be submitted for grading';
    END IF;
    
    -- Grade each question
    FOR question IN 
        SELECT * FROM quiz_questions 
        WHERE assessment_id = attempt_record.assessment_id 
        ORDER BY order_index
    LOOP
        user_answer := attempt_record.responses->question.id::TEXT;
        correct_answer := question.correct_answer;
        question_score := 0;
        
        -- Score based on question type
        CASE question.question_type
            WHEN 'multiple_choice', 'true_false' THEN
                IF user_answer = correct_answer THEN
                    question_score := question.points;
                END IF;
            WHEN 'short_answer' THEN
                -- Simple exact match (in production, use fuzzy matching)
                IF LOWER(user_answer::TEXT) = LOWER(correct_answer::TEXT) THEN
                    question_score := question.points;
                END IF;
            WHEN 'fill_blank' THEN
                -- Check if all blanks are filled correctly
                IF user_answer = correct_answer THEN
                    question_score := question.points;
                END IF;
            -- Additional question types would be handled here
        END CASE;
        
        total_score := total_score + question_score;
        max_score := max_score + question.points;
    END LOOP;
    
    -- Calculate percentage
    percentage := CASE WHEN max_score > 0 THEN (total_score / max_score) * 100 ELSE 0 END;
    
    -- Update attempt with grade
    UPDATE quiz_attempts 
    SET 
        score = total_score,
        max_possible_score = max_score,
        percentage = percentage,
        passed = percentage >= (SELECT passing_score FROM assessments WHERE id = attempt_record.assessment_id),
        status = 'graded',
        graded_at = NOW()
    WHERE id = attempt_uuid;
    
    -- Award ScrollCoins for passing
    IF percentage >= (SELECT passing_score FROM assessments WHERE id = attempt_record.assessment_id) THEN
        scrollcoins_earned := LEAST(ROUND(percentage), 100); -- 1 coin per percentage point, max 100
        PERFORM earn_scrollcoin(
            attempt_record.user_id,
            scrollcoins_earned,
            'Quiz completion: ' || (SELECT title FROM assessments WHERE id = attempt_record.assessment_id),
            attempt_record.assessment_id,
            'assessment_completion'
        );
    END IF;
    
    -- Update progress tracking
    INSERT INTO student_progress (
        user_id, 
        course_id, 
        progress_type, 
        progress_value,
        completion_date
    ) VALUES (
        attempt_record.user_id,
        (SELECT course_id FROM assessments WHERE id = attempt_record.assessment_id),
        'assessment_completed',
        percentage,
        CASE WHEN percentage >= (SELECT passing_score FROM assessments WHERE id = attempt_record.assessment_id) 
             THEN NOW() ELSE NULL END
    );
    
    RETURN true;
END;
$$;

-- Function to generate course certificate
CREATE OR REPLACE FUNCTION public.generate_course_certificate(
    user_uuid UUID,
    course_uuid UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    certificate_id UUID;
    cert_number TEXT;
    final_grade DECIMAL(5,2);
    letter_grade TEXT;
    credit_hours DECIMAL(4,2);
    course_progress DECIMAL(5,2);
BEGIN
    -- Check if course is completed
    course_progress := calculate_course_progress(user_uuid, course_uuid);
    
    IF course_progress < 100 THEN
        RAISE EXCEPTION 'Course must be 100% completed to generate certificate';
    END IF;
    
    -- Generate certificate number
    cert_number := 'SCROLL-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('certificate_sequence')::TEXT, 6, '0');
    
    -- Calculate final grade (simple average of all assessments)
    SELECT AVG(percentage) INTO final_grade
    FROM quiz_attempts qa
    JOIN assessments a ON qa.assessment_id = a.id
    WHERE qa.user_id = user_uuid 
    AND a.course_id = course_uuid
    AND qa.passed = true;
    
    -- Determine letter grade
    letter_grade := CASE 
        WHEN final_grade >= 97 THEN 'A+'
        WHEN final_grade >= 93 THEN 'A'
        WHEN final_grade >= 90 THEN 'A-'
        WHEN final_grade >= 87 THEN 'B+'
        WHEN final_grade >= 83 THEN 'B'
        WHEN final_grade >= 80 THEN 'B-'
        WHEN final_grade >= 77 THEN 'C+'
        WHEN final_grade >= 73 THEN 'C'
        WHEN final_grade >= 70 THEN 'C-'
        ELSE 'F'
    END;
    
    -- Get credit hours from course
    SELECT COALESCE(credit_hours, 3.0) INTO credit_hours FROM courses WHERE id = course_uuid;
    
    -- Create certificate
    INSERT INTO course_certificates (
        user_id,
        course_id,
        certificate_number,
        completion_date,
        final_grade,
        letter_grade,
        credit_hours
    ) VALUES (
        user_uuid,
        course_uuid,
        cert_number,
        CURRENT_DATE,
        final_grade,
        letter_grade,
        credit_hours
    ) RETURNING id INTO certificate_id;
    
    -- Award completion ScrollCoins
    PERFORM earn_scrollcoin(
        user_uuid,
        500, -- 500 coins for course completion
        'Course completion: ' || (SELECT title FROM courses WHERE id = course_uuid),
        course_uuid,
        'course_completion'
    );
    
    RETURN certificate_id;
END;
$$;

-- Create sequence for certificate numbers
CREATE SEQUENCE IF NOT EXISTS certificate_sequence START 1000;

-- RLS Policies

-- Quiz questions
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view questions during attempts" ON public.quiz_questions
    FOR SELECT USING (
        assessment_id IN (
            SELECT qa.assessment_id FROM quiz_attempts qa 
            WHERE qa.user_id = auth.uid() AND qa.status = 'in_progress'
        ) OR
        assessment_id IN (
            SELECT a.id FROM assessments a
            JOIN courses c ON a.course_id = c.id
            WHERE has_role(auth.uid(), 'faculty') OR has_role(auth.uid(), 'admin')
        )
    );
CREATE POLICY "Faculty can manage quiz questions" ON public.quiz_questions
    FOR ALL USING (
        assessment_id IN (
            SELECT a.id FROM assessments a
            JOIN courses c ON a.course_id = c.id
            JOIN faculties f ON c.faculty_id = f.id
            WHERE f.id IN (
                SELECT faculty_id FROM faculty_members WHERE user_id = auth.uid()
            )
        ) OR
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'superadmin')
    );

-- Quiz attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own attempts" ON public.quiz_attempts
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Students can create attempts" ON public.quiz_attempts
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Students can update their in-progress attempts" ON public.quiz_attempts
    FOR UPDATE USING (user_id = auth.uid() AND status = 'in_progress');
CREATE POLICY "Faculty can view and grade attempts" ON public.quiz_attempts
    FOR SELECT USING (
        assessment_id IN (
            SELECT a.id FROM assessments a
            JOIN courses c ON a.course_id = c.id
            WHERE has_role(auth.uid(), 'faculty') OR has_role(auth.uid(), 'admin')
        )
    );

-- Assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view published assignments" ON public.assignments
    FOR SELECT USING (is_published = true);
CREATE POLICY "Faculty can manage assignments" ON public.assignments
    FOR ALL USING (
        created_by = auth.uid() OR
        course_id IN (
            SELECT c.id FROM courses c
            WHERE has_role(auth.uid(), 'faculty') OR has_role(auth.uid(), 'admin')
        )
    );

-- Assignment submissions
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can manage their own submissions" ON public.assignment_submissions
    FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Faculty can view and grade submissions" ON public.assignment_submissions
    FOR SELECT USING (
        assignment_id IN (
            SELECT a.id FROM assignments a
            JOIN courses c ON a.course_id = c.id
            WHERE has_role(auth.uid(), 'faculty') OR has_role(auth.uid(), 'admin')
        )
    );

-- Student progress
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own progress" ON public.student_progress
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create progress records" ON public.student_progress
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Faculty can view student progress" ON public.student_progress
    FOR SELECT USING (
        course_id IN (
            SELECT c.id FROM courses c
            WHERE has_role(auth.uid(), 'faculty') OR has_role(auth.uid(), 'admin')
        )
    );

-- Learning analytics
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own analytics" ON public.learning_analytics
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Faculty can view course analytics" ON public.learning_analytics
    FOR SELECT USING (
        course_id IN (
            SELECT c.id FROM courses c
            WHERE has_role(auth.uid(), 'faculty') OR has_role(auth.uid(), 'admin')
        )
    );

-- Gradebook entries
ALTER TABLE public.gradebook_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own grades" ON public.gradebook_entries
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Faculty can manage grades" ON public.gradebook_entries
    FOR ALL USING (
        course_id IN (
            SELECT c.id FROM courses c
            WHERE has_role(auth.uid(), 'faculty') OR has_role(auth.uid(), 'admin')
        )
    );

-- Course certificates
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own certificates" ON public.course_certificates
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create certificates" ON public.course_certificates
    FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_assessment_order ON public.quiz_questions(assessment_id, order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_assessment ON public.quiz_attempts(user_id, assessment_id, attempt_number);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_user ON public.assignment_submissions(assignment_id, user_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_user_course ON public.student_progress(user_id, course_id, progress_type);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_user_course_date ON public.learning_analytics(user_id, course_id, calculation_date);
CREATE INDEX IF NOT EXISTS idx_gradebook_user_course ON public.gradebook_entries(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_course_certificates_user ON public.course_certificates(user_id, course_id);

-- Insert development flag
INSERT INTO public.development_flags (name, flag_key, is_enabled, created_at)
VALUES ('Assessment and Progress System', 'Jesus-Christ-is-Lord-Assessment', true, NOW());