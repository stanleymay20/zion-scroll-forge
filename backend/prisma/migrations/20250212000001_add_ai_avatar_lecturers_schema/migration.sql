-- AI Avatar Lecturers Database Schema Migration
-- Creates comprehensive database structure for AI avatar lecturer system

-- Avatar Lecturers Table
CREATE TABLE avatar_lecturers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Appearance Configuration (JSON)
    appearance JSONB NOT NULL DEFAULT '{}',
    voice_profile JSONB NOT NULL DEFAULT '{}',
    personality_profile JSONB NOT NULL DEFAULT '{}',
    
    -- Teaching Configuration
    subjects TEXT[] DEFAULT '{}',
    teaching_style VARCHAR(100),
    spiritual_approach VARCHAR(100),
    cultural_adaptation JSONB DEFAULT '{}',
    
    -- Capabilities
    capabilities JSONB DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    interaction_modes TEXT[] DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    version VARCHAR(50) DEFAULT '1.0.0',
    
    -- Indexes
    CONSTRAINT avatar_lecturers_name_check CHECK (length(name) > 0),
    CONSTRAINT avatar_lecturers_title_check CHECK (length(title) > 0)
);

-- Lecture Sessions Table
CREATE TABLE lecture_sessions (
    id VARCHAR(255) PRIMARY KEY,
    avatar_id VARCHAR(255) NOT NULL REFERENCES avatar_lecturers(id) ON DELETE CASCADE,
    course_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Session Configuration
    config JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    
    -- Capacity
    max_participants INTEGER DEFAULT 100,
    
    -- Content
    lecture_content JSONB DEFAULT '{}',
    
    -- Analytics
    engagement_metrics JSONB DEFAULT '{}',
    learning_outcomes JSONB DEFAULT '{}',
    
    -- Spiritual Formation
    spiritual_insights JSONB DEFAULT '{}',
    prayer_requests JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT lecture_sessions_status_check CHECK (
        status IN ('scheduled', 'starting', 'active', 'paused', 'ending', 'completed', 'cancelled')
    ),
    CONSTRAINT lecture_sessions_times_check CHECK (
        end_time IS NULL OR end_time > start_time
    )
);

-- Session Participants Table
CREATE TABLE session_participants (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL REFERENCES lecture_sessions(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    
    -- Timing
    join_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leave_time TIMESTAMP WITH TIME ZONE,
    
    -- Engagement
    engagement_data JSONB DEFAULT '{}',
    permissions TEXT[] DEFAULT '{}',
    
    -- Constraints
    UNIQUE(session_id, user_id),
    CONSTRAINT session_participants_role_check CHECK (
        role IN ('student', 'teaching_assistant', 'observer', 'moderator', 'administrator')
    ),
    CONSTRAINT session_participants_times_check CHECK (
        leave_time IS NULL OR leave_time > join_time
    )
);

-- Avatar Responses Table
CREATE TABLE avatar_responses (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL REFERENCES lecture_sessions(id) ON DELETE CASCADE,
    user_id VARCHAR(255),
    
    -- Response Content
    text_response TEXT NOT NULL,
    audio_response_url VARCHAR(500),
    visual_effects JSONB DEFAULT '{}',
    
    -- Animation Instructions
    animations JSONB DEFAULT '{}',
    emotions JSONB DEFAULT '{}',
    gestures JSONB DEFAULT '{}',
    
    -- Metadata
    response_time_ms INTEGER NOT NULL DEFAULT 0,
    confidence DECIMAL(3,2) DEFAULT 0.0,
    spiritual_alignment DECIMAL(3,2) DEFAULT 0.0,
    
    -- Follow-up
    suggested_actions TEXT[] DEFAULT '{}',
    related_questions TEXT[] DEFAULT '{}',
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT avatar_responses_confidence_check CHECK (confidence >= 0.0 AND confidence <= 1.0),
    CONSTRAINT avatar_responses_spiritual_check CHECK (spiritual_alignment >= 0.0 AND spiritual_alignment <= 1.0),
    CONSTRAINT avatar_responses_response_time_check CHECK (response_time_ms >= 0)
);

-- Q&A Questions Table
CREATE TABLE qa_questions (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL REFERENCES lecture_sessions(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    
    -- Classification
    category VARCHAR(50) NOT NULL DEFAULT 'academic',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    
    -- Timing
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP WITH TIME ZONE,
    
    -- Response
    response_id VARCHAR(255) REFERENCES avatar_responses(id),
    
    -- Engagement
    upvotes INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT qa_questions_category_check CHECK (
        category IN ('academic', 'spiritual', 'technical', 'personal', 'clarification')
    ),
    CONSTRAINT qa_questions_priority_check CHECK (
        priority IN ('low', 'medium', 'high', 'urgent')
    ),
    CONSTRAINT qa_questions_status_check CHECK (
        status IN ('pending', 'acknowledged', 'answered', 'deferred', 'inappropriate')
    ),
    CONSTRAINT qa_questions_upvotes_check CHECK (upvotes >= 0),
    CONSTRAINT qa_questions_answered_check CHECK (
        (status = 'answered' AND answered_at IS NOT NULL) OR 
        (status != 'answered' AND answered_at IS NULL)
    )
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL REFERENCES lecture_sessions(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL DEFAULT 'text',
    
    -- Threading
    reply_to VARCHAR(255) REFERENCES chat_messages(id),
    
    -- Engagement
    reactions JSONB DEFAULT '{}',
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chat_messages_type_check CHECK (
        message_type IN ('text', 'question', 'prayer_request', 'testimony', 'system')
    ),
    CONSTRAINT chat_messages_length_check CHECK (length(message) > 0)
);

-- Spiritual Insights Table
CREATE TABLE spiritual_insights (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL REFERENCES lecture_sessions(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    insight TEXT NOT NULL,
    scripture_reference VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    relevance DECIMAL(3,2) DEFAULT 0.0,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT spiritual_insights_category_check CHECK (
        category IN ('biblical_truth', 'personal_growth', 'ministry_calling', 
                    'prayer_guidance', 'worship_insight', 'prophetic_word')
    ),
    CONSTRAINT spiritual_insights_relevance_check CHECK (relevance >= 0.0 AND relevance <= 1.0)
);

-- Prayer Requests Table
CREATE TABLE prayer_requests (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) REFERENCES lecture_sessions(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    request TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    urgency VARCHAR(20) NOT NULL DEFAULT 'medium',
    is_private BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    
    -- Timing
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Responses
    prayer_responses JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT prayer_requests_urgency_check CHECK (
        urgency IN ('low', 'medium', 'high', 'urgent')
    ),
    CONSTRAINT prayer_requests_status_check CHECK (
        status IN ('active', 'answered', 'ongoing', 'closed')
    )
);

-- Avatar Performance Metrics Table
CREATE TABLE avatar_performance_metrics (
    id SERIAL PRIMARY KEY,
    avatar_id VARCHAR(255) NOT NULL REFERENCES avatar_lecturers(id) ON DELETE CASCADE,
    session_id VARCHAR(255) REFERENCES lecture_sessions(id) ON DELETE CASCADE,
    
    -- Performance Data
    metric_type VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit VARCHAR(50),
    
    -- Context
    context_data JSONB DEFAULT '{}',
    
    -- Timing
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT avatar_performance_metrics_type_check CHECK (length(metric_type) > 0)
);

-- Conversation Context Table
CREATE TABLE conversation_contexts (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL REFERENCES lecture_sessions(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    
    -- Context Data
    conversation_history JSONB DEFAULT '{}',
    user_profile JSONB DEFAULT '{}',
    course_context JSONB DEFAULT '{}',
    spiritual_context JSONB DEFAULT '{}',
    cultural_context JSONB DEFAULT '{}',
    emotional_state JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(session_id, user_id)
);

-- Create Indexes for Performance
CREATE INDEX idx_avatar_lecturers_active ON avatar_lecturers(is_active) WHERE is_active = true;
CREATE INDEX idx_avatar_lecturers_subjects ON avatar_lecturers USING GIN(subjects);
CREATE INDEX idx_avatar_lecturers_languages ON avatar_lecturers USING GIN(languages);
CREATE INDEX idx_avatar_lecturers_created_by ON avatar_lecturers(created_by);

CREATE INDEX idx_lecture_sessions_avatar_id ON lecture_sessions(avatar_id);
CREATE INDEX idx_lecture_sessions_course_id ON lecture_sessions(course_id);
CREATE INDEX idx_lecture_sessions_status ON lecture_sessions(status);
CREATE INDEX idx_lecture_sessions_start_time ON lecture_sessions(start_time);
CREATE INDEX idx_lecture_sessions_active ON lecture_sessions(status, start_time) 
    WHERE status IN ('active', 'starting');

CREATE INDEX idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX idx_session_participants_user_id ON session_participants(user_id);
CREATE INDEX idx_session_participants_role ON session_participants(role);
CREATE INDEX idx_session_participants_active ON session_participants(session_id, user_id) 
    WHERE leave_time IS NULL;

CREATE INDEX idx_avatar_responses_session_id ON avatar_responses(session_id);
CREATE INDEX idx_avatar_responses_user_id ON avatar_responses(user_id);
CREATE INDEX idx_avatar_responses_created_at ON avatar_responses(created_at);
CREATE INDEX idx_avatar_responses_confidence ON avatar_responses(confidence);

CREATE INDEX idx_qa_questions_session_id ON qa_questions(session_id);
CREATE INDEX idx_qa_questions_user_id ON qa_questions(user_id);
CREATE INDEX idx_qa_questions_status ON qa_questions(status);
CREATE INDEX idx_qa_questions_priority ON qa_questions(priority);
CREATE INDEX idx_qa_questions_category ON qa_questions(category);
CREATE INDEX idx_qa_questions_submitted_at ON qa_questions(submitted_at);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_type ON chat_messages(message_type);

CREATE INDEX idx_spiritual_insights_session_id ON spiritual_insights(session_id);
CREATE INDEX idx_spiritual_insights_user_id ON spiritual_insights(user_id);
CREATE INDEX idx_spiritual_insights_category ON spiritual_insights(category);
CREATE INDEX idx_spiritual_insights_created_at ON spiritual_insights(created_at);

CREATE INDEX idx_prayer_requests_user_id ON prayer_requests(user_id);
CREATE INDEX idx_prayer_requests_session_id ON prayer_requests(session_id);
CREATE INDEX idx_prayer_requests_status ON prayer_requests(status);
CREATE INDEX idx_prayer_requests_urgency ON prayer_requests(urgency);
CREATE INDEX idx_prayer_requests_submitted_at ON prayer_requests(submitted_at);

CREATE INDEX idx_avatar_performance_avatar_id ON avatar_performance_metrics(avatar_id);
CREATE INDEX idx_avatar_performance_session_id ON avatar_performance_metrics(session_id);
CREATE INDEX idx_avatar_performance_type ON avatar_performance_metrics(metric_type);
CREATE INDEX idx_avatar_performance_recorded_at ON avatar_performance_metrics(recorded_at);

CREATE INDEX idx_conversation_contexts_session_user ON conversation_contexts(session_id, user_id);
CREATE INDEX idx_conversation_contexts_updated_at ON conversation_contexts(updated_at);

-- Create Functions for Automatic Timestamp Updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers for Automatic Timestamp Updates
CREATE TRIGGER update_avatar_lecturers_updated_at 
    BEFORE UPDATE ON avatar_lecturers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lecture_sessions_updated_at 
    BEFORE UPDATE ON lecture_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prayer_requests_updated_at 
    BEFORE UPDATE ON prayer_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_contexts_updated_at 
    BEFORE UPDATE ON conversation_contexts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Views for Common Queries
CREATE VIEW active_lecture_sessions AS
SELECT 
    ls.*,
    al.name as avatar_name,
    al.title as avatar_title,
    COUNT(sp.id) as participant_count
FROM lecture_sessions ls
JOIN avatar_lecturers al ON ls.avatar_id = al.id
LEFT JOIN session_participants sp ON ls.id = sp.session_id AND sp.leave_time IS NULL
WHERE ls.status IN ('active', 'starting')
GROUP BY ls.id, al.name, al.title;

CREATE VIEW session_engagement_summary AS
SELECT 
    ls.id as session_id,
    ls.title,
    ls.start_time,
    COUNT(DISTINCT sp.user_id) as total_participants,
    COUNT(DISTINCT cm.user_id) as active_chatters,
    COUNT(DISTINCT qq.user_id) as question_askers,
    COUNT(cm.id) as total_messages,
    COUNT(qq.id) as total_questions,
    AVG(ar.confidence) as avg_response_confidence,
    AVG(ar.spiritual_alignment) as avg_spiritual_alignment
FROM lecture_sessions ls
LEFT JOIN session_participants sp ON ls.id = sp.session_id
LEFT JOIN chat_messages cm ON ls.id = cm.session_id
LEFT JOIN qa_questions qq ON ls.id = qq.session_id
LEFT JOIN avatar_responses ar ON ls.id = ar.session_id
GROUP BY ls.id, ls.title, ls.start_time;

CREATE VIEW avatar_performance_summary AS
SELECT 
    al.id as avatar_id,
    al.name,
    al.title,
    COUNT(DISTINCT ls.id) as total_sessions,
    COUNT(DISTINCT sp.user_id) as total_students_taught,
    AVG(ar.confidence) as avg_confidence,
    AVG(ar.spiritual_alignment) as avg_spiritual_alignment,
    AVG(ar.response_time_ms) as avg_response_time_ms,
    COUNT(qq.id) as total_questions_answered
FROM avatar_lecturers al
LEFT JOIN lecture_sessions ls ON al.id = ls.avatar_id
LEFT JOIN session_participants sp ON ls.id = sp.session_id
LEFT JOIN avatar_responses ar ON ls.id = ar.session_id
LEFT JOIN qa_questions qq ON ls.id = qq.session_id AND qq.status = 'answered'
WHERE al.is_active = true
GROUP BY al.id, al.name, al.title;

-- Add Comments for Documentation
COMMENT ON TABLE avatar_lecturers IS 'Stores AI avatar lecturer configurations and metadata';
COMMENT ON TABLE lecture_sessions IS 'Manages live lecture sessions with AI avatars';
COMMENT ON TABLE session_participants IS 'Tracks participants in lecture sessions';
COMMENT ON TABLE avatar_responses IS 'Stores AI avatar responses with animation data';
COMMENT ON TABLE qa_questions IS 'Manages Q&A questions and their lifecycle';
COMMENT ON TABLE chat_messages IS 'Stores chat messages from lecture sessions';
COMMENT ON TABLE spiritual_insights IS 'Captures spiritual insights shared during sessions';
COMMENT ON TABLE prayer_requests IS 'Manages prayer requests from students';
COMMENT ON TABLE avatar_performance_metrics IS 'Tracks avatar performance metrics';
COMMENT ON TABLE conversation_contexts IS 'Stores conversation context for AI processing';

COMMENT ON VIEW active_lecture_sessions IS 'Shows currently active lecture sessions with participant counts';
COMMENT ON VIEW session_engagement_summary IS 'Provides engagement metrics for lecture sessions';
COMMENT ON VIEW avatar_performance_summary IS 'Summarizes performance metrics for each avatar';