-- Faculty Support System Migration
-- Supports AI teaching assistant, discussion grading, quiz generation,
-- extension management, and office hours scheduling

-- Teaching Assistant Interactions
CREATE TABLE IF NOT EXISTS teaching_assistant_interactions (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    faculty_id TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    sources JSONB,
    professor_review_needed BOOLEAN DEFAULT false,
    professor_reviewed BOOLEAN DEFAULT false,
    professor_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ta_interactions_student ON teaching_assistant_interactions(student_id);
CREATE INDEX IF NOT EXISTS idx_ta_interactions_course ON teaching_assistant_interactions(course_id);
CREATE INDEX IF NOT EXISTS idx_ta_interactions_faculty ON teaching_assistant_interactions(faculty_id);
CREATE INDEX IF NOT EXISTS idx_ta_interactions_review ON teaching_assistant_interactions(professor_review_needed);

-- Discussion Grades
CREATE TABLE IF NOT EXISTS discussion_grades (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    discussion_id TEXT NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL,
    participation_score DECIMAL(5,2) NOT NULL,
    critical_thinking_score DECIMAL(5,2) NOT NULL,
    peer_engagement_score DECIMAL(5,2) NOT NULL,
    substantive_contribution_score DECIMAL(5,2) NOT NULL,
    feedback TEXT NOT NULL,
    strengths JSONB,
    areas_for_improvement JSONB,
    post_count INTEGER NOT NULL,
    average_word_count INTEGER NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by_faculty BOOLEAN DEFAULT false,
    faculty_override_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_discussion_grades_student ON discussion_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_discussion_grades_course ON discussion_grades(course_id);
CREATE INDEX IF NOT EXISTS idx_discussion_grades_discussion ON discussion_grades(discussion_id);

-- Generated Quizzes
CREATE TABLE IF NOT EXISTS generated_quizzes (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    faculty_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    topics JSONB NOT NULL,
    learning_objectives JSONB NOT NULL,
    difficulty TEXT NOT NULL,
    questions JSONB NOT NULL,
    answer_key JSONB NOT NULL,
    estimated_time INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    used_count INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_generated_quizzes_course ON generated_quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_generated_quizzes_faculty ON generated_quizzes(faculty_id);
CREATE INDEX IF NOT EXISTS idx_generated_quizzes_difficulty ON generated_quizzes(difficulty);

-- Extension Requests
CREATE TABLE IF NOT EXISTS extension_requests (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    assignment_id TEXT NOT NULL,
    request_date TIMESTAMP NOT NULL,
    original_due_date TIMESTAMP NOT NULL,
    requested_due_date TIMESTAMP NOT NULL,
    reason TEXT NOT NULL,
    supporting_documentation JSONB,
    ai_decision TEXT NOT NULL,
    ai_approved BOOLEAN NOT NULL,
    ai_reasoning TEXT NOT NULL,
    ai_confidence DECIMAL(3,2) NOT NULL,
    requires_human_review BOOLEAN NOT NULL,
    human_reviewed BOOLEAN DEFAULT false,
    human_decision TEXT,
    human_reasoning TEXT,
    final_approved BOOLEAN,
    final_due_date TIMESTAMP,
    conditions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_extension_requests_student ON extension_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_extension_requests_course ON extension_requests(course_id);
CREATE INDEX IF NOT EXISTS idx_extension_requests_assignment ON extension_requests(assignment_id);
CREATE INDEX IF NOT EXISTS idx_extension_requests_review ON extension_requests(requires_human_review);
CREATE INDEX IF NOT EXISTS idx_extension_requests_status ON extension_requests(human_reviewed);

-- Office Hours Appointments
CREATE TABLE IF NOT EXISTS office_hours_appointments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    faculty_id TEXT NOT NULL,
    course_id TEXT,
    scheduled_time TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL,
    topic TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMP,
    attendance_status TEXT,
    topics_discussed JSONB,
    action_items JSONB,
    follow_up_needed BOOLEAN DEFAULT false,
    faculty_notes TEXT,
    student_satisfaction INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_office_hours_student ON office_hours_appointments(student_id);
CREATE INDEX IF NOT EXISTS idx_office_hours_faculty ON office_hours_appointments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_office_hours_course ON office_hours_appointments(course_id);
CREATE INDEX IF NOT EXISTS idx_office_hours_time ON office_hours_appointments(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_office_hours_status ON office_hours_appointments(status);

-- Faculty Assistant Configuration
CREATE TABLE IF NOT EXISTS faculty_assistant_config (
    id TEXT PRIMARY KEY,
    faculty_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    teaching_style JSONB NOT NULL,
    auto_response_enabled BOOLEAN DEFAULT true,
    confidence_threshold DECIMAL(3,2) DEFAULT 0.85,
    max_response_time INTEGER DEFAULT 5000,
    custom_instructions TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(faculty_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_faculty_config_faculty ON faculty_assistant_config(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_config_course ON faculty_assistant_config(course_id);

-- Faculty Assistant Metrics
CREATE TABLE IF NOT EXISTS faculty_assistant_metrics (
    id TEXT PRIMARY KEY,
    faculty_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    metric_date DATE NOT NULL,
    total_questions INTEGER DEFAULT 0,
    auto_responded INTEGER DEFAULT 0,
    flagged_for_review INTEGER DEFAULT 0,
    average_confidence DECIMAL(3,2),
    average_response_time INTEGER,
    student_satisfaction DECIMAL(3,2),
    faculty_satisfaction DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(faculty_id, course_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_faculty_metrics_faculty ON faculty_assistant_metrics(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_metrics_course ON faculty_assistant_metrics(course_id);
CREATE INDEX IF NOT EXISTS idx_faculty_metrics_date ON faculty_assistant_metrics(metric_date);

-- Student Extension History (for tracking patterns)
CREATE TABLE IF NOT EXISTS student_extension_history (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    total_extensions_requested INTEGER DEFAULT 0,
    total_extensions_approved INTEGER DEFAULT 0,
    average_extension_days DECIMAL(5,2),
    academic_standing TEXT DEFAULT 'good',
    last_extension_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_extension_history_student ON student_extension_history(student_id);
CREATE INDEX IF NOT EXISTS idx_extension_history_course ON student_extension_history(course_id);

-- Comments
COMMENT ON TABLE teaching_assistant_interactions IS 'AI teaching assistant Q&A interactions with students';
COMMENT ON TABLE discussion_grades IS 'AI-generated grades for discussion participation';
COMMENT ON TABLE generated_quizzes IS 'AI-generated quizzes and assessments';
COMMENT ON TABLE extension_requests IS 'Student extension requests with AI evaluation';
COMMENT ON TABLE office_hours_appointments IS 'Office hours scheduling and outcomes';
COMMENT ON TABLE faculty_assistant_config IS 'Faculty-specific AI assistant configuration';
COMMENT ON TABLE faculty_assistant_metrics IS 'Performance metrics for faculty AI assistant';
COMMENT ON TABLE student_extension_history IS 'Student extension request patterns and history';
