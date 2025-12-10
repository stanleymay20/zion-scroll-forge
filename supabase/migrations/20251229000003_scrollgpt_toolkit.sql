-- ScrollGPT Toolkit Migration
-- Creates tables for GPT integration, design thinking, and collaborative AI

-- ScrollGPT Toolkit table
CREATE TABLE IF NOT EXISTS scrollgpt_toolkit (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    available_models TEXT[] DEFAULT ARRAY['gpt-4o', 'scroll-mentor-gpt', 'lab-gpt']::TEXT[],
    active_model TEXT NOT NULL DEFAULT 'gpt-4o',
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    conversation_history JSONB DEFAULT '[]'::jsonb,
    data_analysis_tools JSONB DEFAULT '[]'::jsonb,
    research_resources JSONB DEFAULT '[]'::jsonb,
    collaboration_mode BOOLEAN DEFAULT false,
    team_members TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Design Thinking Session table
CREATE TABLE IF NOT EXISTS design_thinking_session (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT NOT NULL,
    phase TEXT NOT NULL CHECK (phase IN ('empathize', 'define', 'ideate', 'prototype', 'test')),
    facilitator TEXT NOT NULL DEFAULT 'scroll-mentor-gpt',
    participants TEXT[] DEFAULT ARRAY[]::TEXT[],
    insights JSONB DEFAULT '[]'::jsonb,
    ideas JSONB DEFAULT '[]'::jsonb,
    prototypes JSONB DEFAULT '[]'::jsonb,
    feedback JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Collaborative AI Session table
CREATE TABLE IF NOT EXISTS collaborative_ai_session (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT NOT NULL,
    team_id TEXT NOT NULL,
    models TEXT[] DEFAULT ARRAY['gpt-4o', 'scroll-mentor-gpt', 'lab-gpt']::TEXT[],
    purpose TEXT NOT NULL,
    shared_context TEXT DEFAULT '',
    contributions JSONB DEFAULT '[]'::jsonb,
    synthesis TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scrollgpt_toolkit_user ON scrollgpt_toolkit(user_id);
CREATE INDEX IF NOT EXISTS idx_scrollgpt_toolkit_project ON scrollgpt_toolkit(project_id);
CREATE INDEX IF NOT EXISTS idx_design_thinking_session_project ON design_thinking_session(project_id);
CREATE INDEX IF NOT EXISTS idx_design_thinking_session_phase ON design_thinking_session(phase);
CREATE INDEX IF NOT EXISTS idx_collaborative_ai_session_project ON collaborative_ai_session(project_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_ai_session_team ON collaborative_ai_session(team_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_scrollgpt_toolkit_updated_at
    BEFORE UPDATE ON scrollgpt_toolkit
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON scrollgpt_toolkit TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON design_thinking_session TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON collaborative_ai_session TO authenticated;

-- Enable Row Level Security
ALTER TABLE scrollgpt_toolkit ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_thinking_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_ai_session ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scrollgpt_toolkit
CREATE POLICY "Users can view their own toolkits"
    ON scrollgpt_toolkit FOR SELECT
    TO authenticated
    USING (user_id = auth.uid()::text OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can create their own toolkits"
    ON scrollgpt_toolkit FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own toolkits"
    ON scrollgpt_toolkit FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid()::text OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all toolkits"
    ON scrollgpt_toolkit FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for design_thinking_session
CREATE POLICY "Users can view sessions they participate in"
    ON design_thinking_session FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text = ANY(participants) OR 
        auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Users can create design thinking sessions"
    ON design_thinking_session FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = ANY(participants));

CREATE POLICY "Participants can update sessions"
    ON design_thinking_session FOR UPDATE
    TO authenticated
    USING (
        auth.uid()::text = ANY(participants) OR 
        auth.jwt() ->> 'role' = 'admin'
    );

-- RLS Policies for collaborative_ai_session
CREATE POLICY "Team members can view their sessions"
    ON collaborative_ai_session FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM scrollgpt_toolkit
            WHERE scrollgpt_toolkit.project_id = collaborative_ai_session.project_id
            AND (scrollgpt_toolkit.user_id = auth.uid()::text OR auth.uid()::text = ANY(scrollgpt_toolkit.team_members))
        ) OR auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Users can create collaborative sessions"
    ON collaborative_ai_session FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Team members can update sessions"
    ON collaborative_ai_session FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM scrollgpt_toolkit
            WHERE scrollgpt_toolkit.project_id = collaborative_ai_session.project_id
            AND (scrollgpt_toolkit.user_id = auth.uid()::text OR auth.uid()::text = ANY(scrollgpt_toolkit.team_members))
        ) OR auth.jwt() ->> 'role' = 'admin'
    );

COMMENT ON TABLE scrollgpt_toolkit IS 'GPT toolkit instances for innovation projects';
COMMENT ON TABLE design_thinking_session IS 'Design thinking sessions facilitated by AI';
COMMENT ON TABLE collaborative_ai_session IS 'Collaborative AI sessions for team innovation';
