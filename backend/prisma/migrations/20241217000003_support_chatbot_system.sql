-- ScrollUniversity Support Chatbot System
-- "Ask and it will be given to you; seek and you will find" - Matthew 7:7

-- Knowledge Base Documents
CREATE TABLE IF NOT EXISTS knowledge_base_documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    document_type TEXT NOT NULL, -- 'policy', 'faq', 'course_material', 'procedure', 'guide'
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    
    -- Metadata
    source_url TEXT,
    author TEXT,
    last_updated TIMESTAMP,
    version TEXT DEFAULT '1.0',
    
    -- Vector embedding reference
    vector_id TEXT UNIQUE,
    embedding_generated BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_published BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chatbot Conversations
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    
    -- Conversation metadata
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    status TEXT DEFAULT 'active', -- 'active', 'resolved', 'escalated', 'abandoned'
    
    -- Context
    initial_query TEXT,
    conversation_topic TEXT,
    
    -- Escalation
    escalated BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    escalated_at TIMESTAMP,
    ticket_id TEXT,
    
    -- Satisfaction
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    feedback TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chatbot Messages
CREATE TABLE IF NOT EXISTS chatbot_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    
    -- Message content
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    
    -- AI metadata
    confidence_score FLOAT,
    sources_used JSONB DEFAULT '[]',
    model_used TEXT,
    tokens_used INTEGER,
    cost FLOAT,
    
    -- Context
    context_window JSONB DEFAULT '[]',
    retrieved_documents JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets (for escalations)
CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES chatbot_conversations(id),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ticket details
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    category TEXT NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    assigned_to TEXT,
    
    -- Resolution
    resolution TEXT,
    resolved_at TIMESTAMP,
    resolved_by TEXT,
    
    -- Communication
    sms_sent BOOLEAN DEFAULT FALSE,
    email_sent BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chatbot Analytics
CREATE TABLE IF NOT EXISTS chatbot_analytics (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    
    -- Volume metrics
    total_conversations INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    
    -- Performance metrics
    average_confidence FLOAT DEFAULT 0.0,
    average_response_time FLOAT DEFAULT 0.0,
    escalation_rate FLOAT DEFAULT 0.0,
    resolution_rate FLOAT DEFAULT 0.0,
    
    -- Satisfaction metrics
    average_satisfaction FLOAT DEFAULT 0.0,
    satisfaction_responses INTEGER DEFAULT 0,
    
    -- Cost metrics
    total_cost FLOAT DEFAULT 0.0,
    average_cost_per_conversation FLOAT DEFAULT 0.0,
    
    -- Topic distribution
    topic_distribution JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kb_docs_type ON knowledge_base_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_kb_docs_category ON knowledge_base_documents(category);
CREATE INDEX IF NOT EXISTS idx_kb_docs_active ON knowledge_base_documents(is_active, is_published);
CREATE INDEX IF NOT EXISTS idx_kb_docs_vector ON knowledge_base_documents(vector_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON chatbot_conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_escalated ON chatbot_conversations(escalated);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON chatbot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON chatbot_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_conversation ON support_tickets(conversation_id);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON chatbot_analytics(date);
