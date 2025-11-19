-- Content Creation System Migration
-- "The Spirit of truth will guide you into all truth" - John 16:13

-- AI-Generated Content Table
CREATE TABLE IF NOT EXISTS ai_generated_content (
    id TEXT PRIMARY KEY,
    content_type TEXT NOT NULL CHECK (content_type IN ('LECTURE', 'ASSESSMENT', 'RESOURCE')),
    course_id TEXT,
    module_id TEXT,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    
    -- Generation Details
    generated_by TEXT DEFAULT 'AI',
    generation_cost DECIMAL(10, 4) DEFAULT 0.0,
    generation_time INTEGER, -- milliseconds
    confidence_score DECIMAL(3, 2),
    
    -- Review Status
    review_status TEXT DEFAULT 'PENDING_REVIEW' CHECK (review_status IN ('DRAFT', 'PENDING_REVIEW', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED')),
    review_required BOOLEAN DEFAULT true,
    
    -- Version Control
    version TEXT DEFAULT '1.0',
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_content_type ON ai_generated_content(content_type);
CREATE INDEX idx_ai_content_course ON ai_generated_content(course_id);
CREATE INDEX idx_ai_content_status ON ai_generated_content(review_status);
CREATE INDEX idx_ai_content_published ON ai_generated_content(is_published);

-- Content Reviews Table
CREATE TABLE IF NOT EXISTS content_reviews (
    id TEXT PRIMARY KEY,
    content_id TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('LECTURE', 'ASSESSMENT', 'RESOURCE')),
    
    -- Reviewer Information
    reviewer_id TEXT NOT NULL,
    reviewer_name TEXT NOT NULL,
    
    -- Review Status
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_REVIEW', 'APPROVED', 'APPROVED_WITH_CHANGES', 'REJECTED', 'REVISION_REQUESTED')),
    
    -- Review Feedback
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    feedback JSONB DEFAULT '{}',
    
    -- Modifications
    modifications JSONB DEFAULT '[]',
    
    -- Decision
    approval_date TIMESTAMP,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_content FOREIGN KEY (content_id) REFERENCES ai_generated_content(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_review_content ON content_reviews(content_id);
CREATE INDEX idx_review_reviewer ON content_reviews(reviewer_id);
CREATE INDEX idx_review_status ON content_reviews(status);

-- Content Versions Table
CREATE TABLE IF NOT EXISTS content_versions (
    id TEXT PRIMARY KEY,
    content_id TEXT NOT NULL,
    version TEXT NOT NULL,
    content JSONB NOT NULL,
    
    -- Version Metadata
    created_by TEXT NOT NULL,
    changes TEXT,
    is_published BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_content_version FOREIGN KEY (content_id) REFERENCES ai_generated_content(id) ON DELETE CASCADE,
    CONSTRAINT fk_version_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_version_content ON content_versions(content_id);
CREATE INDEX idx_version_published ON content_versions(is_published);

-- Content Modifications Table
CREATE TABLE IF NOT EXISTS content_modifications (
    id TEXT PRIMARY KEY,
    review_id TEXT NOT NULL,
    content_id TEXT NOT NULL,
    
    -- Modification Details
    section TEXT NOT NULL,
    original_content TEXT,
    modified_content TEXT,
    reason TEXT,
    
    -- Modification Metadata
    modified_by TEXT NOT NULL,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_mod_review FOREIGN KEY (review_id) REFERENCES content_reviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_mod_content FOREIGN KEY (content_id) REFERENCES ai_generated_content(id) ON DELETE CASCADE,
    CONSTRAINT fk_modifier FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_mod_review ON content_modifications(review_id);
CREATE INDEX idx_mod_content ON content_modifications(content_id);

-- Curated Resources Table
CREATE TABLE IF NOT EXISTS curated_resources (
    id TEXT PRIMARY KEY,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('ACADEMIC_PAPER', 'TEXTBOOK', 'VIDEO', 'ARTICLE', 'CASE_STUDY', 'TUTORIAL', 'DOCUMENTATION', 'PODCAST', 'COURSE')),
    
    -- Resource Information
    title TEXT NOT NULL,
    author TEXT,
    source TEXT NOT NULL,
    url TEXT,
    description TEXT,
    summary TEXT,
    key_points JSONB DEFAULT '[]',
    
    -- Scoring
    relevance_score DECIMAL(3, 2),
    quality_score DECIMAL(3, 2),
    spiritual_alignment DECIMAL(3, 2),
    
    -- Classification
    difficulty TEXT CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    learning_objectives JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resource_type ON curated_resources(resource_type);
CREATE INDEX idx_resource_difficulty ON curated_resources(difficulty);
CREATE INDEX idx_resource_relevance ON curated_resources(relevance_score);

-- Learning Objectives Table
CREATE TABLE IF NOT EXISTS learning_objectives (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    module_id TEXT,
    
    -- Objective Details
    description TEXT NOT NULL,
    bloom_level TEXT NOT NULL CHECK (bloom_level IN ('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE')),
    assessment_method TEXT,
    spiritual_integration TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_objective_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX idx_objective_course ON learning_objectives(course_id);
CREATE INDEX idx_objective_bloom ON learning_objectives(bloom_level);

-- Content Generation Logs Table
CREATE TABLE IF NOT EXISTS content_generation_logs (
    id TEXT PRIMARY KEY,
    content_id TEXT,
    content_type TEXT NOT NULL,
    
    -- Request Details
    request_data JSONB NOT NULL,
    
    -- Response Details
    success BOOLEAN NOT NULL,
    confidence_score DECIMAL(3, 2),
    cost DECIMAL(10, 4),
    processing_time INTEGER, -- milliseconds
    
    -- Quality Metrics
    warnings JSONB DEFAULT '[]',
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_log_content FOREIGN KEY (content_id) REFERENCES ai_generated_content(id) ON DELETE SET NULL
);

CREATE INDEX idx_log_content ON content_generation_logs(content_id);
CREATE INDEX idx_log_type ON content_generation_logs(content_type);
CREATE INDEX idx_log_success ON content_generation_logs(success);
CREATE INDEX idx_log_created ON content_generation_logs(created_at);

-- Review Statistics View
CREATE OR REPLACE VIEW review_statistics AS
SELECT 
    reviewer_id,
    reviewer_name,
    COUNT(*) as total_reviews,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_reviews,
    COUNT(CASE WHEN status IN ('APPROVED', 'APPROVED_WITH_CHANGES') THEN 1 END) as approved_reviews,
    COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_reviews,
    AVG(overall_rating) as average_rating,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_review_time_seconds
FROM content_reviews
GROUP BY reviewer_id, reviewer_name;

-- Content Quality Metrics View
CREATE OR REPLACE VIEW content_quality_metrics AS
SELECT 
    content_type,
    COUNT(*) as total_content,
    AVG(confidence_score) as avg_confidence,
    AVG(generation_cost) as avg_cost,
    AVG(generation_time) as avg_generation_time,
    COUNT(CASE WHEN review_status = 'APPROVED' THEN 1 END) as approved_count,
    COUNT(CASE WHEN review_status = 'REJECTED' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN is_published = true THEN 1 END) as published_count
FROM ai_generated_content
GROUP BY content_type;

-- Add comments for documentation
COMMENT ON TABLE ai_generated_content IS 'Stores AI-generated educational content including lectures, assessments, and resources';
COMMENT ON TABLE content_reviews IS 'Faculty review records for AI-generated content';
COMMENT ON TABLE content_versions IS 'Version history for content changes and iterations';
COMMENT ON TABLE content_modifications IS 'Detailed modifications made during faculty review';
COMMENT ON TABLE curated_resources IS 'Curated academic resources for courses';
COMMENT ON TABLE learning_objectives IS 'Learning objectives for courses and modules';
COMMENT ON TABLE content_generation_logs IS 'Audit logs for content generation requests';
