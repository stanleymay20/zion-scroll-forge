-- Spiritual Formation AI System Migration
-- Creates tables for spiritual check-ins, prayer requests, journal entries, and analysis

-- Spiritual Check-ins Table
CREATE TABLE IF NOT EXISTS spiritual_check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood VARCHAR(100),
    spiritual_temperature INTEGER CHECK (spiritual_temperature >= 1 AND spiritual_temperature <= 10),
    responses JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spiritual Analysis Table
CREATE TABLE IF NOT EXISTS spiritual_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_in_id UUID NOT NULL REFERENCES spiritual_check_ins(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    growth_areas JSONB DEFAULT '[]',
    struggles JSONB DEFAULT '[]',
    breakthroughs JSONB DEFAULT '[]',
    insights JSONB DEFAULT '[]',
    recommended_scripture JSONB DEFAULT '[]',
    suggested_resources JSONB DEFAULT '[]',
    advisor_alert BOOLEAN DEFAULT FALSE,
    alert_reason TEXT,
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prayer Requests Table
CREATE TABLE IF NOT EXISTS prayer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request TEXT NOT NULL,
    category VARCHAR(100),
    is_private BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'answered', 'ongoing')),
    answered_date TIMESTAMP WITH TIME ZONE,
    testimony TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prayer Categories Table
CREATE TABLE IF NOT EXISTS prayer_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
    categories JSONB DEFAULT '[]',
    themes JSONB DEFAULT '[]',
    urgency VARCHAR(50) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
    suggested_scripture JSONB DEFAULT '[]',
    recommended_resources JSONB DEFAULT '[]',
    prayer_partners JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mood VARCHAR(100),
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Journal Insights Table
CREATE TABLE IF NOT EXISTS journal_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spiritual_insights JSONB DEFAULT '[]',
    questions_and_doubts JSONB DEFAULT '[]',
    growth_opportunities JSONB DEFAULT '[]',
    emotional_state JSONB,
    theological_themes JSONB DEFAULT '[]',
    privacy_maintained BOOLEAN DEFAULT TRUE,
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spiritual Profiles Table
CREATE TABLE IF NOT EXISTS spiritual_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    strengths JSONB DEFAULT '[]',
    growth_areas JSONB DEFAULT '[]',
    spiritual_gifts JSONB DEFAULT '[]',
    calling_indicators JSONB DEFAULT '[]',
    discipline_preferences JSONB DEFAULT '[]',
    mentorship_needs JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spiritual Practice Recommendations Table
CREATE TABLE IF NOT EXISTS spiritual_practice_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    practices JSONB DEFAULT '[]',
    devotional_materials JSONB DEFAULT '[]',
    mentor_connections JSONB DEFAULT '[]',
    scripture_reading_plan JSONB,
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crisis Detections Table
CREATE TABLE IF NOT EXISTS crisis_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crisis_type VARCHAR(100) NOT NULL CHECK (crisis_type IN ('spiritual', 'emotional', 'theological', 'relational', 'mental-health')),
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('concern', 'urgent', 'critical')),
    indicators JSONB DEFAULT '[]',
    patterns JSONB DEFAULT '[]',
    immediate_actions JSONB DEFAULT '[]',
    advisors_to_alert JSONB DEFAULT '[]',
    support_resources JSONB DEFAULT '[]',
    emergency_contacts JSONB DEFAULT '[]',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_spiritual_check_ins_user_id ON spiritual_check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_check_ins_created_at ON spiritual_check_ins(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_spiritual_analyses_user_id ON spiritual_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_analyses_check_in_id ON spiritual_analyses(check_in_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_analyses_advisor_alert ON spiritual_analyses(advisor_alert) WHERE advisor_alert = TRUE;

CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_id ON prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_status ON prayer_requests(status);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prayer_categories_request_id ON prayer_categories(request_id);
CREATE INDEX IF NOT EXISTS idx_prayer_categories_urgency ON prayer_categories(urgency);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_journal_insights_user_id ON journal_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_insights_entry_id ON journal_insights(entry_id);

CREATE INDEX IF NOT EXISTS idx_spiritual_profiles_user_id ON spiritual_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_spiritual_practice_recommendations_user_id ON spiritual_practice_recommendations(user_id);

CREATE INDEX IF NOT EXISTS idx_crisis_detections_user_id ON crisis_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_crisis_detections_severity ON crisis_detections(severity);
CREATE INDEX IF NOT EXISTS idx_crisis_detections_resolved ON crisis_detections(resolved) WHERE resolved = FALSE;
CREATE INDEX IF NOT EXISTS idx_crisis_detections_created_at ON crisis_detections(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE spiritual_check_ins IS 'Stores spiritual check-in responses from students';
COMMENT ON TABLE spiritual_analyses IS 'AI-generated analysis of spiritual check-ins';
COMMENT ON TABLE prayer_requests IS 'Student prayer requests for tracking and support';
COMMENT ON TABLE prayer_categories IS 'AI categorization of prayer requests';
COMMENT ON TABLE journal_entries IS 'Private spiritual journal entries';
COMMENT ON TABLE journal_insights IS 'AI-generated insights from journal entries';
COMMENT ON TABLE spiritual_profiles IS 'Comprehensive spiritual formation profiles';
COMMENT ON TABLE spiritual_practice_recommendations IS 'Personalized spiritual practice recommendations';
COMMENT ON TABLE crisis_detections IS 'Detected spiritual or emotional crises requiring immediate attention';
