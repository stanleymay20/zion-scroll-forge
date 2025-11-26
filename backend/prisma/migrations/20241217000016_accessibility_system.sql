-- Accessibility Compliance System Migration
-- WCAG 2.1 AA Compliance and Accommodation Management

-- Alt Text Generation Tracking
CREATE TABLE IF NOT EXISTS alt_text_generations (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    long_description TEXT,
    confidence DECIMAL(3,2) NOT NULL,
    quality_score DECIMAL(3,2) NOT NULL,
    wcag_compliant BOOLEAN NOT NULL DEFAULT false,
    content_type VARCHAR(50),
    context TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_alt_text_image_url ON alt_text_generations(image_url);
CREATE INDEX idx_alt_text_created_at ON alt_text_generations(created_at);

-- Caption Generation Tracking
CREATE TABLE IF NOT EXISTS caption_generations (
    id SERIAL PRIMARY KEY,
    video_url TEXT,
    audio_url TEXT,
    full_transcript TEXT NOT NULL,
    vtt_format TEXT NOT NULL,
    srt_format TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    speaker_count INTEGER,
    duration_seconds INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_caption_video_url ON caption_generations(video_url);
CREATE INDEX idx_caption_created_at ON caption_generations(created_at);

-- Caption Segments
CREATE TABLE IF NOT EXISTS caption_segments (
    id SERIAL PRIMARY KEY,
    caption_id INTEGER NOT NULL REFERENCES caption_generations(id) ON DELETE CASCADE,
    start_time DECIMAL(10,3) NOT NULL,
    end_time DECIMAL(10,3) NOT NULL,
    text TEXT NOT NULL,
    speaker VARCHAR(100),
    confidence DECIMAL(3,2) NOT NULL,
    segment_order INTEGER NOT NULL
);

CREATE INDEX idx_caption_segments_caption_id ON caption_segments(caption_id);
CREATE INDEX idx_caption_segments_order ON caption_segments(caption_id, segment_order);

-- Compliance Checks
CREATE TABLE IF NOT EXISTS compliance_checks (
    id SERIAL PRIMARY KEY,
    content_url TEXT,
    content_type VARCHAR(50) NOT NULL,
    wcag_level VARCHAR(3) NOT NULL DEFAULT 'AA',
    overall_score DECIMAL(3,2) NOT NULL,
    passed_checks INTEGER NOT NULL,
    total_checks INTEGER NOT NULL,
    manual_review_needed BOOLEAN NOT NULL DEFAULT false,
    summary TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_compliance_content_type ON compliance_checks(content_type);
CREATE INDEX idx_compliance_created_at ON compliance_checks(created_at);
CREATE INDEX idx_compliance_score ON compliance_checks(overall_score);

-- Accessibility Violations
CREATE TABLE IF NOT EXISTS accessibility_violations (
    id SERIAL PRIMARY KEY,
    compliance_check_id INTEGER NOT NULL REFERENCES compliance_checks(id) ON DELETE CASCADE,
    violation_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    element TEXT,
    description TEXT NOT NULL,
    wcag_criterion VARCHAR(100) NOT NULL,
    recommendation TEXT NOT NULL,
    can_auto_fix BOOLEAN NOT NULL DEFAULT false,
    fixed BOOLEAN NOT NULL DEFAULT false,
    fixed_at TIMESTAMP
);

CREATE INDEX idx_violations_check_id ON accessibility_violations(compliance_check_id);
CREATE INDEX idx_violations_type ON accessibility_violations(violation_type);
CREATE INDEX idx_violations_severity ON accessibility_violations(severity);
CREATE INDEX idx_violations_fixed ON accessibility_violations(fixed);

-- Automated Fixes
CREATE TABLE IF NOT EXISTS automated_fixes (
    id SERIAL PRIMARY KEY,
    compliance_check_id INTEGER NOT NULL REFERENCES compliance_checks(id) ON DELETE CASCADE,
    violation_type VARCHAR(50) NOT NULL,
    element TEXT,
    original_value TEXT,
    fixed_value TEXT NOT NULL,
    applied BOOLEAN NOT NULL DEFAULT false,
    description TEXT NOT NULL,
    applied_at TIMESTAMP,
    applied_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_fixes_check_id ON automated_fixes(compliance_check_id);
CREATE INDEX idx_fixes_applied ON automated_fixes(applied);

-- Student Accommodations
CREATE TABLE IF NOT EXISTS student_accommodations (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    disability_type VARCHAR(50) NOT NULL,
    documentation_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accommodations_student_id ON student_accommodations(student_id);
CREATE INDEX idx_accommodations_active ON student_accommodations(active);
CREATE INDEX idx_accommodations_disability ON student_accommodations(disability_type);

-- Accommodation Recommendations
CREATE TABLE IF NOT EXISTS accommodation_recommendations (
    id SERIAL PRIMARY KEY,
    tracking_id VARCHAR(100) UNIQUE NOT NULL,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    assessment_id INTEGER,
    disability_type VARCHAR(50) NOT NULL,
    approval_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recommendations_tracking_id ON accommodation_recommendations(tracking_id);
CREATE INDEX idx_recommendations_student_id ON accommodation_recommendations(student_id);
CREATE INDEX idx_recommendations_course_id ON accommodation_recommendations(course_id);
CREATE INDEX idx_recommendations_status ON accommodation_recommendations(approval_status);

-- Specific Accommodations
CREATE TABLE IF NOT EXISTS specific_accommodations (
    id SERIAL PRIMARY KEY,
    recommendation_id INTEGER NOT NULL REFERENCES accommodation_recommendations(id) ON DELETE CASCADE,
    accommodation_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    implementation TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL,
    estimated_effort VARCHAR(20) NOT NULL,
    implemented BOOLEAN NOT NULL DEFAULT false,
    implemented_at TIMESTAMP,
    implemented_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_specific_accommodations_recommendation_id ON specific_accommodations(recommendation_id);
CREATE INDEX idx_specific_accommodations_type ON specific_accommodations(accommodation_type);
CREATE INDEX idx_specific_accommodations_implemented ON specific_accommodations(implemented);

-- Modified Content
CREATE TABLE IF NOT EXISTS modified_content (
    id SERIAL PRIMARY KEY,
    recommendation_id INTEGER NOT NULL REFERENCES accommodation_recommendations(id) ON DELETE CASCADE,
    original_content_id VARCHAR(100) NOT NULL,
    modified_content_id VARCHAR(100) NOT NULL,
    modification_type VARCHAR(100) NOT NULL,
    changes TEXT[] NOT NULL,
    accessibility_improvements TEXT[] NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modified_content_recommendation_id ON modified_content(recommendation_id);
CREATE INDEX idx_modified_content_original_id ON modified_content(original_content_id);
CREATE INDEX idx_modified_content_modified_id ON modified_content(modified_content_id);

-- Accommodation Usage Tracking
CREATE TABLE IF NOT EXISTS accommodation_usage (
    id SERIAL PRIMARY KEY,
    tracking_id VARCHAR(100) NOT NULL,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accommodation_type VARCHAR(50) NOT NULL,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    assessment_id INTEGER,
    usage_count INTEGER NOT NULL DEFAULT 1,
    effectiveness DECIMAL(3,2),
    student_feedback TEXT,
    last_used TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_tracking_id ON accommodation_usage(tracking_id);
CREATE INDEX idx_usage_student_id ON accommodation_usage(student_id);
CREATE INDEX idx_usage_type ON accommodation_usage(accommodation_type);
CREATE INDEX idx_usage_last_used ON accommodation_usage(last_used);

-- Accessibility Audit Log
CREATE TABLE IF NOT EXISTS accessibility_audit_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    content_id VARCHAR(200) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    result JSONB NOT NULL,
    cost DECIMAL(10,4) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_action ON accessibility_audit_log(action);
CREATE INDEX idx_audit_content_id ON accessibility_audit_log(content_id);
CREATE INDEX idx_audit_user_id ON accessibility_audit_log(user_id);
CREATE INDEX idx_audit_created_at ON accessibility_audit_log(created_at);

-- Comments
COMMENT ON TABLE alt_text_generations IS 'Tracks AI-generated alt text for images';
COMMENT ON TABLE caption_generations IS 'Tracks AI-generated captions for videos';
COMMENT ON TABLE compliance_checks IS 'WCAG compliance check results';
COMMENT ON TABLE accessibility_violations IS 'Specific accessibility violations found';
COMMENT ON TABLE automated_fixes IS 'Automated fixes applied to content';
COMMENT ON TABLE student_accommodations IS 'Student disability accommodations';
COMMENT ON TABLE accommodation_recommendations IS 'AI-recommended accommodations';
COMMENT ON TABLE specific_accommodations IS 'Specific accommodation details';
COMMENT ON TABLE modified_content IS 'Modified content for accommodations';
COMMENT ON TABLE accommodation_usage IS 'Tracks accommodation usage and effectiveness';
COMMENT ON TABLE accessibility_audit_log IS 'Audit trail for accessibility actions';
