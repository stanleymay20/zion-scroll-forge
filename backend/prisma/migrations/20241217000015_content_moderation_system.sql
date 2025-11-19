-- Content Moderation System Migration
-- Implements AI-powered content moderation for community safety

-- Moderation Results Table
CREATE TABLE IF NOT EXISTS moderation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    content_text TEXT NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT false,
    overall_severity VARCHAR(20) NOT NULL,
    recommended_action VARCHAR(50) NOT NULL,
    reasoning TEXT NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    requires_human_review BOOLEAN NOT NULL DEFAULT false,
    violations JSONB NOT NULL DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    final_action VARCHAR(50),
    CONSTRAINT fk_moderation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_moderation_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Theological Reviews Table
CREATE TABLE IF NOT EXISTS theological_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderation_id UUID NOT NULL,
    content_id VARCHAR(255) NOT NULL,
    has_doctrinal_error BOOLEAN NOT NULL DEFAULT false,
    concerns JSONB NOT NULL DEFAULT '[]',
    overall_alignment DECIMAL(5,4) NOT NULL,
    requires_advisor_review BOOLEAN NOT NULL DEFAULT false,
    suggested_corrections JSONB DEFAULT '[]',
    confidence DECIMAL(5,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_by_advisor UUID,
    advisor_notes TEXT,
    CONSTRAINT fk_theological_moderation FOREIGN KEY (moderation_id) REFERENCES moderation_results(id) ON DELETE CASCADE,
    CONSTRAINT fk_theological_advisor FOREIGN KEY (reviewed_by_advisor) REFERENCES users(id) ON DELETE SET NULL
);

-- Tone Analysis Table
CREATE TABLE IF NOT EXISTS tone_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderation_id UUID NOT NULL,
    content_id VARCHAR(255) NOT NULL,
    sentiment VARCHAR(50) NOT NULL,
    emotional_tone JSONB NOT NULL,
    is_constructive BOOLEAN NOT NULL DEFAULT true,
    is_divisive BOOLEAN NOT NULL DEFAULT false,
    is_hostile BOOLEAN NOT NULL DEFAULT false,
    encouragement_score DECIMAL(5,4) NOT NULL,
    respect_score DECIMAL(5,4) NOT NULL,
    clarity_score DECIMAL(5,4) NOT NULL,
    suggestions JSONB DEFAULT '[]',
    confidence DECIMAL(5,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tone_moderation FOREIGN KEY (moderation_id) REFERENCES moderation_results(id) ON DELETE CASCADE
);

-- Moderation Appeals Table
CREATE TABLE IF NOT EXISTS moderation_appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderation_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content_id VARCHAR(255) NOT NULL,
    original_action VARCHAR(50) NOT NULL,
    appeal_reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    outcome JSONB,
    ai_context JSONB,
    CONSTRAINT fk_appeal_moderation FOREIGN KEY (moderation_id) REFERENCES moderation_results(id) ON DELETE CASCADE,
    CONSTRAINT fk_appeal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_appeal_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Moderation History Table
CREATE TABLE IF NOT EXISTS moderation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    total_violations INTEGER NOT NULL DEFAULT 0,
    violations_by_type JSONB NOT NULL DEFAULT '{}',
    violations_by_severity JSONB NOT NULL DEFAULT '{}',
    actions_taken JSONB NOT NULL DEFAULT '{}',
    appeals_submitted INTEGER NOT NULL DEFAULT 0,
    appeals_successful INTEGER NOT NULL DEFAULT 0,
    last_violation TIMESTAMP WITH TIME ZONE,
    current_suspension JSONB,
    risk_score DECIMAL(5,4) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Statement of Faith Table
CREATE TABLE IF NOT EXISTS statement_of_faith (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section VARCHAR(255) NOT NULL,
    statement TEXT NOT NULL,
    scripture_references JSONB NOT NULL DEFAULT '[]',
    keywords JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Community Guidelines Table
CREATE TABLE IF NOT EXISTS community_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(255) NOT NULL,
    guideline TEXT NOT NULL,
    examples JSONB NOT NULL DEFAULT '[]',
    violation_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Moderation Metrics Table
CREATE TABLE IF NOT EXISTS moderation_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_content_scanned INTEGER NOT NULL DEFAULT 0,
    violations_detected INTEGER NOT NULL DEFAULT 0,
    violations_by_type JSONB NOT NULL DEFAULT '{}',
    violations_by_severity JSONB NOT NULL DEFAULT '{}',
    actions_taken JSONB NOT NULL DEFAULT '{}',
    human_review_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    average_confidence DECIMAL(5,4) NOT NULL DEFAULT 0,
    average_processing_time INTEGER NOT NULL DEFAULT 0,
    appeal_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    appeal_success_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    false_positive_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    accuracy_score DECIMAL(5,4) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_moderation_user ON moderation_results(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_content ON moderation_results(content_id);
CREATE INDEX IF NOT EXISTS idx_moderation_created ON moderation_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_review ON moderation_results(requires_human_review) WHERE requires_human_review = true;
CREATE INDEX IF NOT EXISTS idx_moderation_severity ON moderation_results(overall_severity);

CREATE INDEX IF NOT EXISTS idx_theological_moderation ON theological_reviews(moderation_id);
CREATE INDEX IF NOT EXISTS idx_theological_advisor_review ON theological_reviews(requires_advisor_review) WHERE requires_advisor_review = true;

CREATE INDEX IF NOT EXISTS idx_tone_moderation ON tone_analyses(moderation_id);

CREATE INDEX IF NOT EXISTS idx_appeal_status ON moderation_appeals(status);
CREATE INDEX IF NOT EXISTS idx_appeal_user ON moderation_appeals(user_id);
CREATE INDEX IF NOT EXISTS idx_appeal_submitted ON moderation_appeals(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_history_user ON moderation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_risk ON moderation_history(risk_score DESC);

CREATE INDEX IF NOT EXISTS idx_guidelines_active ON community_guidelines(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_guidelines_category ON community_guidelines(category);

CREATE INDEX IF NOT EXISTS idx_metrics_date ON moderation_metrics(date DESC);

-- Insert default Statement of Faith entries
INSERT INTO statement_of_faith (section, statement, scripture_references, keywords) VALUES
('Trinity', 'We believe in one God, eternally existing in three persons: Father, Son, and Holy Spirit.', '["Matthew 28:19", "2 Corinthians 13:14", "John 1:1-14"]', '["trinity", "father", "son", "holy spirit", "godhead"]'),
('Scripture', 'We believe the Bible is the inspired, infallible Word of God and the final authority for faith and practice.', '["2 Timothy 3:16-17", "2 Peter 1:20-21", "Psalm 119:105"]', '["bible", "scripture", "word of god", "inspired", "infallible"]'),
('Salvation', 'We believe salvation is by grace alone through faith alone in Christ alone.', '["Ephesians 2:8-9", "John 3:16", "Romans 10:9-10"]', '["salvation", "grace", "faith", "jesus christ", "redemption"]'),
('Resurrection', 'We believe in the bodily resurrection of Jesus Christ and His return in glory.', '["1 Corinthians 15:3-4", "Acts 1:11", "1 Thessalonians 4:16-17"]', '["resurrection", "second coming", "return of christ"]'),
('Church', 'We believe in the universal Church as the body of Christ, called to worship, fellowship, and mission.', '["Ephesians 1:22-23", "1 Corinthians 12:12-27", "Matthew 28:19-20"]', '["church", "body of christ", "fellowship", "mission"]')
ON CONFLICT DO NOTHING;

-- Insert default Community Guidelines
INSERT INTO community_guidelines (category, guideline, examples, violation_type, severity) VALUES
('Respect', 'Treat all members with respect and dignity, reflecting Christ''s love.', '["Use kind and encouraging language", "Avoid personal attacks", "Respect different perspectives"]', 'bullying', 'high'),
('Language', 'Use appropriate language free from profanity, vulgarity, or offensive content.', '["No cursing or swearing", "No sexually explicit content", "No hate speech"]', 'inappropriate_language', 'high'),
('Theology', 'Maintain theological discussions within the bounds of our Statement of Faith.', '["Respect core doctrines", "Discuss differences graciously", "Avoid heretical teachings"]', 'theological_error', 'medium'),
('Constructive Dialogue', 'Engage in constructive dialogue that builds up rather than tears down.', '["Ask clarifying questions", "Provide evidence for claims", "Acknowledge valid points"]', 'divisive_content', 'medium'),
('Academic Integrity', 'Maintain honesty and integrity in all academic discussions and submissions.', '["No plagiarism", "Cite sources properly", "Don''t share answers"]', 'policy_violation', 'high')
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE moderation_results IS 'Stores AI moderation results for all content';
COMMENT ON TABLE theological_reviews IS 'Stores theological alignment reviews for content';
COMMENT ON TABLE tone_analyses IS 'Stores tone and sentiment analysis results';
COMMENT ON TABLE moderation_appeals IS 'Handles user appeals of moderation decisions';
COMMENT ON TABLE moderation_history IS 'Tracks user moderation history and risk scores';
COMMENT ON TABLE statement_of_faith IS 'Core theological beliefs for doctrinal checking';
COMMENT ON TABLE community_guidelines IS 'Community standards and behavioral expectations';
COMMENT ON TABLE moderation_metrics IS 'Daily aggregated moderation system metrics';
