-- AI Integration System Migration
-- "The Spirit of truth will guide you into all truth" - John 16:13
-- Comprehensive database schema for AI service integration

-- AI Service Request Log
CREATE TABLE IF NOT EXISTS ai_service_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    service_type TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    request_data JSONB NOT NULL,
    response_data JSONB,
    status TEXT NOT NULL DEFAULT 'pending',
    confidence DECIMAL(5,4),
    cost DECIMAL(10,4),
    processing_time_ms INTEGER,
    human_review_required BOOLEAN DEFAULT false,
    human_reviewed BOOLEAN DEFAULT false,
    human_reviewer_id TEXT,
    review_outcome TEXT,
    review_notes TEXT,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (human_reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_ai_requests_user ON ai_service_requests(user_id);
CREATE INDEX idx_ai_requests_service ON ai_service_requests(service_type);
CREATE INDEX idx_ai_requests_status ON ai_service_requests(status);
CREATE INDEX idx_ai_requests_created ON ai_service_requests(created_at);
CREATE INDEX idx_ai_requests_review ON ai_service_requests(human_review_required, human_reviewed);

-- AI Conversation History
CREATE TABLE IF NOT EXISTS ai_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    service_type TEXT NOT NULL,
    conversation_data JSONB NOT NULL,
    message_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    escalated BOOLEAN DEFAULT false,
    escalation_reason TEXT,
    satisfaction_rating INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_service ON ai_conversations(service_type);
CREATE INDEX idx_ai_conversations_active ON ai_conversations(ended_at) WHERE ended_at IS NULL;

-- AI Generated Content
CREATE TABLE IF NOT EXISTS ai_generated_content (
    id TEXT PRIMARY KEY,
    content_type TEXT NOT NULL,
    service_type TEXT NOT NULL,
    generated_by_user_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    generated_content JSONB NOT NULL,
    metadata JSONB,
    confidence DECIMAL(5,4),
    theological_alignment_score DECIMAL(5,4),
    quality_score DECIMAL(5,4),
    status TEXT NOT NULL DEFAULT 'draft',
    reviewed_by_user_id TEXT,
    review_status TEXT,
    review_notes TEXT,
    published_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_ai_content_type ON ai_generated_content(content_type);
CREATE INDEX idx_ai_content_service ON ai_generated_content(service_type);
CREATE INDEX idx_ai_content_status ON ai_generated_content(status);
CREATE INDEX idx_ai_content_user ON ai_generated_content(generated_by_user_id);
CREATE INDEX idx_ai_content_review ON ai_generated_content(review_status);

-- AI Audit Trail
CREATE TABLE IF NOT EXISTS ai_audit_logs (
    id TEXT PRIMARY KEY,
    service_type TEXT NOT NULL,
    action TEXT NOT NULL,
    user_id TEXT,
    entity_type TEXT,
    entity_id TEXT,
    input_data JSONB,
    output_data JSONB,
    confidence DECIMAL(5,4),
    cost DECIMAL(10,4),
    processing_time_ms INTEGER,
    human_reviewed BOOLEAN DEFAULT false,
    review_outcome TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_ai_audit_service ON ai_audit_logs(service_type);
CREATE INDEX idx_ai_audit_action ON ai_audit_logs(action);
CREATE INDEX idx_ai_audit_user ON ai_audit_logs(user_id);
CREATE INDEX idx_ai_audit_entity ON ai_audit_logs(entity_type, entity_id);
CREATE INDEX idx_ai_audit_created ON ai_audit_logs(created_at);

-- AI Service Metrics
CREATE TABLE IF NOT EXISTS ai_service_metrics (
    id TEXT PRIMARY KEY,
    service_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit TEXT,
    tags JSONB,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_metrics_service ON ai_service_metrics(service_type);
CREATE INDEX idx_ai_metrics_name ON ai_service_metrics(metric_name);
CREATE INDEX idx_ai_metrics_recorded ON ai_service_metrics(recorded_at);

-- AI Cost Tracking
CREATE TABLE IF NOT EXISTS ai_cost_tracking (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    service_type TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    tokens_used INTEGER,
    cost DECIMAL(10,4) NOT NULL,
    model_used TEXT,
    request_id TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_ai_cost_user ON ai_cost_tracking(user_id);
CREATE INDEX idx_ai_cost_service ON ai_cost_tracking(service_type);
CREATE INDEX idx_ai_cost_created ON ai_cost_tracking(created_at);

-- AI Quality Metrics
CREATE TABLE IF NOT EXISTS ai_quality_metrics (
    id TEXT PRIMARY KEY,
    service_type TEXT NOT NULL,
    request_id TEXT NOT NULL,
    accuracy_score DECIMAL(5,4),
    confidence_score DECIMAL(5,4),
    human_agreement_score DECIMAL(5,4),
    theological_alignment_score DECIMAL(5,4),
    response_time_ms INTEGER,
    human_feedback TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_quality_service ON ai_quality_metrics(service_type);
CREATE INDEX idx_ai_quality_request ON ai_quality_metrics(request_id);
CREATE INDEX idx_ai_quality_created ON ai_quality_metrics(created_at);

-- AI Rate Limiting
CREATE TABLE IF NOT EXISTS ai_rate_limits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    service_type TEXT NOT NULL,
    request_count INTEGER DEFAULT 0,
    window_start TIMESTAMP NOT NULL,
    window_end TIMESTAMP NOT NULL,
    limit_exceeded BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, service_type, window_start)
);

CREATE INDEX idx_ai_rate_user ON ai_rate_limits(user_id);
CREATE INDEX idx_ai_rate_service ON ai_rate_limits(service_type);
CREATE INDEX idx_ai_rate_window ON ai_rate_limits(window_end);

-- AI Human Review Queue
CREATE TABLE IF NOT EXISTS ai_review_queue (
    id TEXT PRIMARY KEY,
    service_type TEXT NOT NULL,
    request_id TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    content_type TEXT NOT NULL,
    content_data JSONB NOT NULL,
    ai_recommendation JSONB,
    confidence DECIMAL(5,4),
    reason_for_review TEXT,
    assigned_to_user_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    reviewed_at TIMESTAMP,
    review_decision TEXT,
    review_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_ai_review_service ON ai_review_queue(service_type);
CREATE INDEX idx_ai_review_status ON ai_review_queue(status);
CREATE INDEX idx_ai_review_priority ON ai_review_queue(priority);
CREATE INDEX idx_ai_review_assigned ON ai_review_queue(assigned_to_user_id);
CREATE INDEX idx_ai_review_created ON ai_review_queue(created_at);

-- AI Data Retention Policy
CREATE TABLE IF NOT EXISTS ai_data_retention (
    id TEXT PRIMARY KEY,
    data_type TEXT NOT NULL,
    retention_days INTEGER NOT NULL,
    last_cleanup_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(data_type)
);

-- Insert default retention policies
INSERT INTO ai_data_retention (id, data_type, retention_days) VALUES
    ('ret_requests', 'ai_service_requests', 365),
    ('ret_conversations', 'ai_conversations', 180),
    ('ret_content', 'ai_generated_content', 730),
    ('ret_audit', 'ai_audit_logs', 1095),
    ('ret_metrics', 'ai_service_metrics', 90),
    ('ret_cost', 'ai_cost_tracking', 1095),
    ('ret_quality', 'ai_quality_metrics', 365),
    ('ret_rate', 'ai_rate_limits', 7),
    ('ret_review', 'ai_review_queue', 365)
ON CONFLICT (data_type) DO NOTHING;

-- AI Service Configuration
CREATE TABLE IF NOT EXISTS ai_service_config (
    id TEXT PRIMARY KEY,
    service_type TEXT NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT true,
    max_requests_per_hour INTEGER DEFAULT 100,
    max_cost_per_day DECIMAL(10,2),
    confidence_threshold DECIMAL(5,4) DEFAULT 0.85,
    require_human_review BOOLEAN DEFAULT false,
    config_data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default service configurations
INSERT INTO ai_service_config (id, service_type, max_requests_per_hour, confidence_threshold) VALUES
    ('cfg_chatbot', 'chatbot', 200, 0.80),
    ('cfg_grading', 'grading', 100, 0.85),
    ('cfg_content', 'content-creation', 50, 0.90),
    ('cfg_personalization', 'personalization', 150, 0.85),
    ('cfg_integrity', 'integrity', 100, 0.90),
    ('cfg_admissions', 'admissions', 50, 0.85),
    ('cfg_research', 'research', 75, 0.85),
    ('cfg_course_rec', 'course-recommendation', 100, 0.85),
    ('cfg_faculty', 'faculty-assistant', 150, 0.85),
    ('cfg_translation', 'translation', 100, 0.90),
    ('cfg_spiritual', 'spiritual-formation', 100, 0.85),
    ('cfg_fundraising', 'fundraising', 50, 0.85),
    ('cfg_career', 'career-services', 100, 0.85),
    ('cfg_moderation', 'moderation', 200, 0.90),
    ('cfg_accessibility', 'accessibility', 150, 0.85)
ON CONFLICT (service_type) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_ai_service_requests_updated_at
    BEFORE UPDATE ON ai_service_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_updated_at();

CREATE TRIGGER update_ai_generated_content_updated_at
    BEFORE UPDATE ON ai_generated_content
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_updated_at();

CREATE TRIGGER update_ai_rate_limits_updated_at
    BEFORE UPDATE ON ai_rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_updated_at();

CREATE TRIGGER update_ai_review_queue_updated_at
    BEFORE UPDATE ON ai_review_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_updated_at();

CREATE TRIGGER update_ai_data_retention_updated_at
    BEFORE UPDATE ON ai_data_retention
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_updated_at();

CREATE TRIGGER update_ai_service_config_updated_at
    BEFORE UPDATE ON ai_service_config
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_updated_at();

-- Create views for common queries

-- Active AI conversations view
CREATE OR REPLACE VIEW active_ai_conversations AS
SELECT 
    c.*,
    u.email as user_email,
    u.first_name || ' ' || u.last_name as user_name
FROM ai_conversations c
JOIN users u ON c.user_id = u.id
WHERE c.ended_at IS NULL;

-- Pending review queue view
CREATE OR REPLACE VIEW pending_ai_reviews AS
SELECT 
    r.*,
    u.email as assigned_to_email,
    u.first_name || ' ' || u.last_name as assigned_to_name
FROM ai_review_queue r
LEFT JOIN users u ON r.assigned_to_user_id = u.id
WHERE r.status = 'pending'
ORDER BY 
    CASE r.priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    r.created_at ASC;

-- AI service usage summary view
CREATE OR REPLACE VIEW ai_service_usage_summary AS
SELECT 
    service_type,
    COUNT(*) as total_requests,
    AVG(confidence) as avg_confidence,
    SUM(cost) as total_cost,
    AVG(processing_time_ms) as avg_processing_time,
    SUM(CASE WHEN human_review_required THEN 1 ELSE 0 END) as reviews_required,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_requests,
    DATE(created_at) as date
FROM ai_service_requests
GROUP BY service_type, DATE(created_at)
ORDER BY date DESC, service_type;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON ai_service_requests TO PUBLIC;
GRANT SELECT, INSERT, UPDATE ON ai_conversations TO PUBLIC;
GRANT SELECT, INSERT, UPDATE ON ai_generated_content TO PUBLIC;
GRANT SELECT, INSERT ON ai_audit_logs TO PUBLIC;
GRANT SELECT, INSERT ON ai_service_metrics TO PUBLIC;
GRANT SELECT, INSERT ON ai_cost_tracking TO PUBLIC;
GRANT SELECT, INSERT ON ai_quality_metrics TO PUBLIC;
GRANT SELECT, INSERT, UPDATE ON ai_rate_limits TO PUBLIC;
GRANT SELECT, INSERT, UPDATE ON ai_review_queue TO PUBLIC;
GRANT SELECT ON ai_data_retention TO PUBLIC;
GRANT SELECT ON ai_service_config TO PUBLIC;
GRANT SELECT ON active_ai_conversations TO PUBLIC;
GRANT SELECT ON pending_ai_reviews TO PUBLIC;
GRANT SELECT ON ai_service_usage_summary TO PUBLIC;
