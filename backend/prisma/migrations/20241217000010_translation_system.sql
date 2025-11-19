-- Translation & Localization System Migration
-- Supports multilingual content delivery with quality tracking

-- Translation Cache Table
CREATE TABLE IF NOT EXISTS translation_cache (
    id SERIAL PRIMARY KEY,
    source_text TEXT NOT NULL,
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    translated_text TEXT NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    accuracy DECIMAL(3,2),
    fluency DECIMAL(3,2),
    theological_correctness DECIMAL(3,2),
    cultural_sensitivity DECIMAL(3,2),
    technical_accuracy DECIMAL(3,2),
    formatting_preserved BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    INDEX idx_translation_lookup (source_language, target_language, content_type),
    INDEX idx_translation_expiry (expires_at)
);

-- Translation Quality Metrics Table
CREATE TABLE IF NOT EXISTS translation_quality_metrics (
    id SERIAL PRIMARY KEY,
    translation_id VARCHAR(255) NOT NULL,
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    accuracy DECIMAL(3,2) NOT NULL,
    fluency DECIMAL(3,2) NOT NULL,
    theological_correctness DECIMAL(3,2),
    cultural_sensitivity DECIMAL(3,2),
    technical_accuracy DECIMAL(3,2),
    overall_score DECIMAL(3,2),
    grade VARCHAR(1),
    review_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_quality_language_pair (source_language, target_language),
    INDEX idx_quality_content_type (content_type),
    INDEX idx_quality_score (overall_score)
);

-- Theological Translation Reviews Table
CREATE TABLE IF NOT EXISTS theological_translation_reviews (
    id SERIAL PRIMARY KEY,
    translation_id VARCHAR(255) NOT NULL,
    original_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    theological_accuracy DECIMAL(3,2),
    bible_references JSONB,
    consulted_translations JSONB,
    expert_review_required BOOLEAN DEFAULT false,
    review_status VARCHAR(50) DEFAULT 'pending',
    assigned_expert VARCHAR(255),
    expert_notes TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_theological_review_status (review_status),
    INDEX idx_theological_expert (assigned_expert)
);

-- Student Language Profiles Table
CREATE TABLE IF NOT EXISTS student_language_profiles (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL UNIQUE,
    primary_language VARCHAR(10) NOT NULL,
    proficiency VARCHAR(50) NOT NULL,
    preferred_dialect VARCHAR(100),
    cultural_context VARCHAR(50),
    region VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_language (student_id),
    INDEX idx_primary_language (primary_language)
);

-- Multilingual Tutoring Sessions Table
CREATE TABLE IF NOT EXISTS multilingual_tutoring_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    student_id VARCHAR(255) NOT NULL,
    language VARCHAR(10) NOT NULL,
    culture VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    course_context VARCHAR(255),
    culturally_sensitive BOOLEAN DEFAULT true,
    academic_rigor DECIMAL(3,2),
    confidence DECIMAL(3,2),
    helpful BOOLEAN,
    student_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tutoring_student (student_id),
    INDEX idx_tutoring_language (language),
    INDEX idx_tutoring_course (course_context)
);

-- Localization Adaptations Table
CREATE TABLE IF NOT EXISTS localization_adaptations (
    id SERIAL PRIMARY KEY,
    content_id VARCHAR(255) NOT NULL,
    original_content TEXT NOT NULL,
    localized_content TEXT NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    target_region VARCHAR(50) NOT NULL,
    target_culture VARCHAR(50) NOT NULL,
    adapted_examples JSONB,
    cultural_notes JSONB,
    learning_objectives_preserved BOOLEAN DEFAULT true,
    confidence DECIMAL(3,2),
    review_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_localization_content (content_id),
    INDEX idx_localization_target (target_language, target_region)
);

-- Translation Error Logs Table
CREATE TABLE IF NOT EXISTS translation_error_logs (
    id SERIAL PRIMARY KEY,
    error_code VARCHAR(50) NOT NULL,
    error_message TEXT NOT NULL,
    source_text TEXT,
    source_language VARCHAR(10),
    target_language VARCHAR(10),
    content_type VARCHAR(50),
    stack_trace TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_error_code (error_code),
    INDEX idx_error_language_pair (source_language, target_language)
);

-- Translation Review Queue Table
CREATE TABLE IF NOT EXISTS translation_review_queue (
    id SERIAL PRIMARY KEY,
    review_id VARCHAR(255) NOT NULL UNIQUE,
    translation_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    reason TEXT,
    assigned_reviewer VARCHAR(255),
    review_status VARCHAR(50) DEFAULT 'pending',
    reviewer_notes TEXT,
    approved BOOLEAN,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_review_status (review_status),
    INDEX idx_review_priority (priority),
    INDEX idx_review_assigned (assigned_reviewer)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_translation_cache_created ON translation_cache(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_created ON translation_quality_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_created ON multilingual_tutoring_sessions(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE translation_cache IS 'Caches translated content to reduce API costs and improve response times';
COMMENT ON TABLE translation_quality_metrics IS 'Tracks quality metrics for all translations to monitor and improve accuracy';
COMMENT ON TABLE theological_translation_reviews IS 'Manages review process for theological and biblical translations';
COMMENT ON TABLE student_language_profiles IS 'Stores student language preferences and proficiency levels';
COMMENT ON TABLE multilingual_tutoring_sessions IS 'Logs all multilingual AI tutoring interactions for quality tracking';
COMMENT ON TABLE localization_adaptations IS 'Stores culturally adapted content for different regions';
COMMENT ON TABLE translation_error_logs IS 'Logs translation errors for debugging and improvement';
COMMENT ON TABLE translation_review_queue IS 'Manages human review queue for flagged translations';
