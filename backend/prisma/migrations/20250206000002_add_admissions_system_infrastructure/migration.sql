-- ScrollUniversity Admissions System Infrastructure Migration
-- This migration creates the core database schema for applications, assessments, interviews, and decisions

-- Create custom types for admissions system
CREATE TYPE application_status AS ENUM (
    'submitted',
    'under_review',
    'assessment_pending',
    'interview_scheduled',
    'decision_pending',
    'accepted',
    'rejected',
    'waitlisted'
);

CREATE TYPE program_type AS ENUM (
    'scroll_builder',
    'scroll_scholar',
    'scroll_engineer',
    'scroll_priest_scribe',
    'scroll_ambassador',
    'scroll_founder'
);

CREATE TYPE eligibility_status AS ENUM (
    'eligible',
    'conditionally_eligible',
    'ineligible',
    'pending_review'
);

CREATE TYPE maturity_level AS ENUM (
    'beginner',
    'developing',
    'mature',
    'advanced',
    'exemplary'
);

CREATE TYPE academic_level AS ENUM (
    'foundation',
    'undergraduate',
    'graduate',
    'doctoral',
    'post_doctoral'
);

CREATE TYPE interview_type AS ENUM (
    'initial_screening',
    'spiritual_assessment',
    'academic_evaluation',
    'character_interview',
    'final_committee'
);

CREATE TYPE interview_format AS ENUM (
    'video_conference',
    'phone_call',
    'in_person',
    'written_response'
);

CREATE TYPE decision_type AS ENUM (
    'accepted',
    'rejected',
    'waitlisted',
    'deferred',
    'conditional_acceptance'
);

CREATE TYPE check_status AS ENUM (
    'passed',
    'failed',
    'pending',
    'not_applicable'
);

CREATE TYPE recommendation_type AS ENUM (
    'strongly_recommend',
    'recommend',
    'neutral',
    'not_recommend',
    'strongly_not_recommend'
);

-- Applications Table - Core application data
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES users(id),
    submission_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status application_status NOT NULL DEFAULT 'submitted',
    program_applied program_type NOT NULL,
    intended_start_date DATE NOT NULL,
    application_data JSONB NOT NULL DEFAULT '{}',
    documents JSONB NOT NULL DEFAULT '[]',
    timeline JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Eligibility Assessments Table
CREATE TABLE eligibility_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    basic_requirements JSONB NOT NULL DEFAULT '[]',
    academic_prerequisites JSONB NOT NULL DEFAULT '[]',
    language_proficiency JSONB NOT NULL DEFAULT '{}',
    technical_requirements JSONB NOT NULL DEFAULT '[]',
    accessibility_needs JSONB NOT NULL DEFAULT '{}',
    global_compliance JSONB NOT NULL DEFAULT '[]',
    overall_eligibility eligibility_status NOT NULL DEFAULT 'pending_review',
    assessor_id UUID REFERENCES users(id),
    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spiritual Evaluations Table
CREATE TABLE spiritual_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    personal_testimony JSONB NOT NULL DEFAULT '{}',
    spiritual_maturity maturity_level NOT NULL DEFAULT 'beginner',
    character_traits JSONB NOT NULL DEFAULT '[]',
    ministry_experience JSONB NOT NULL DEFAULT '[]',
    calling_clarity JSONB NOT NULL DEFAULT '{}',
    scroll_alignment DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    recommendations JSONB NOT NULL DEFAULT '[]',
    evaluator_id UUID REFERENCES users(id),
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Academic Evaluations Table
CREATE TABLE academic_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    previous_education JSONB NOT NULL DEFAULT '[]',
    academic_performance JSONB NOT NULL DEFAULT '{}',
    core_skills JSONB NOT NULL DEFAULT '[]',
    learning_potential DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    intellectual_capacity JSONB NOT NULL DEFAULT '{}',
    recommended_level academic_level NOT NULL DEFAULT 'foundation',
    support_needs JSONB NOT NULL DEFAULT '[]',
    evaluator_id UUID REFERENCES users(id),
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview Records Table
CREATE TABLE interview_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    interview_type interview_type NOT NULL,
    scheduled_date TIMESTAMP NOT NULL,
    interviewer_id UUID NOT NULL REFERENCES users(id),
    format interview_format NOT NULL,
    duration INTEGER NOT NULL DEFAULT 0,
    evaluation JSONB NOT NULL DEFAULT '{}',
    recording_url VARCHAR(500),
    follow_up_required BOOLEAN DEFAULT FALSE,
    notes TEXT,
    conducted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admission Decisions Table
CREATE TABLE admission_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    decision decision_type NOT NULL,
    decision_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decision_makers JSONB NOT NULL DEFAULT '[]',
    reasoning JSONB NOT NULL DEFAULT '{}',
    conditions JSONB NOT NULL DEFAULT '[]',
    enrollment_deadline DATE,
    appeal_eligible BOOLEAN DEFAULT TRUE,
    next_steps JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application Status History Table - For audit trail
CREATE TABLE application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    previous_status application_status,
    new_status application_status NOT NULL,
    changed_by UUID REFERENCES users(id),
    change_reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admissions Committee Members Table
CREATE TABLE admissions_committee_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    appointed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document Verification Table
CREATE TABLE document_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    verification_status check_status NOT NULL DEFAULT 'pending',
    verified_by UUID REFERENCES users(id),
    verification_notes TEXT,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_program_applied ON applications(program_applied);
CREATE INDEX idx_applications_submission_date ON applications(submission_date);

CREATE INDEX idx_eligibility_assessments_application_id ON eligibility_assessments(application_id);
CREATE INDEX idx_eligibility_assessments_overall_eligibility ON eligibility_assessments(overall_eligibility);

CREATE INDEX idx_spiritual_evaluations_application_id ON spiritual_evaluations(application_id);
CREATE INDEX idx_spiritual_evaluations_spiritual_maturity ON spiritual_evaluations(spiritual_maturity);

CREATE INDEX idx_academic_evaluations_application_id ON academic_evaluations(application_id);
CREATE INDEX idx_academic_evaluations_recommended_level ON academic_evaluations(recommended_level);

CREATE INDEX idx_interview_records_application_id ON interview_records(application_id);
CREATE INDEX idx_interview_records_interviewer_id ON interview_records(interviewer_id);
CREATE INDEX idx_interview_records_scheduled_date ON interview_records(scheduled_date);

CREATE INDEX idx_admission_decisions_application_id ON admission_decisions(application_id);
CREATE INDEX idx_admission_decisions_decision ON admission_decisions(decision);
CREATE INDEX idx_admission_decisions_decision_date ON admission_decisions(decision_date);

CREATE INDEX idx_application_status_history_application_id ON application_status_history(application_id);
CREATE INDEX idx_application_status_history_changed_at ON application_status_history(changed_at);

CREATE INDEX idx_document_verifications_application_id ON document_verifications(application_id);
CREATE INDEX idx_document_verifications_verification_status ON document_verifications(verification_status);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eligibility_assessments_updated_at BEFORE UPDATE ON eligibility_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spiritual_evaluations_updated_at BEFORE UPDATE ON spiritual_evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_evaluations_updated_at BEFORE UPDATE ON academic_evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_records_updated_at BEFORE UPDATE ON interview_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admission_decisions_updated_at BEFORE UPDATE ON admission_decisions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admissions_committee_members_updated_at BEFORE UPDATE ON admissions_committee_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_verifications_updated_at BEFORE UPDATE ON document_verifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for application status history
CREATE OR REPLACE FUNCTION log_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO application_status_history (
            application_id,
            previous_status,
            new_status,
            changed_at
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            CURRENT_TIMESTAMP
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_application_status_change_trigger
    AFTER UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION log_application_status_change();