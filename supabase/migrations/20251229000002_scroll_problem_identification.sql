-- ScrollProblem Identification System Migration
-- Creates tables for real-world problem database and assignment algorithms

-- ScrollProblem table
CREATE TABLE IF NOT EXISTS scroll_problem (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'climate_solutions', 'ai_ethics', 'health_access', 'biblical_literacy',
        'economic_justice', 'educational_reform', 'governance_systems',
        'spiritual_formation', 'social_justice', 'technology_access'
    )),
    complexity TEXT NOT NULL CHECK (complexity IN ('beginner', 'intermediate', 'advanced', 'expert')),
    affected_population INTEGER NOT NULL DEFAULT 0,
    geographic_scope TEXT NOT NULL,
    urgency INTEGER NOT NULL CHECK (urgency >= 1 AND urgency <= 10),
    priority INTEGER NOT NULL CHECK (priority >= 1 AND priority <= 10),
    current_solutions JSONB DEFAULT '[]'::jsonb,
    gaps JSONB DEFAULT '[]'::jsonb,
    constraints JSONB DEFAULT '[]'::jsonb,
    stakeholders JSONB DEFAULT '[]'::jsonb,
    data_available JSONB DEFAULT '[]'::jsonb,
    success_metrics JSONB DEFAULT '[]'::jsonb,
    kingdom_relevance INTEGER NOT NULL CHECK (kingdom_relevance >= 1 AND kingdom_relevance <= 10),
    scriptural_basis JSONB DEFAULT '[]'::jsonb,
    transformational_potential INTEGER NOT NULL CHECK (transformational_potential >= 1 AND transformational_potential <= 10),
    required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    estimated_duration INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problem Assignment table
CREATE TABLE IF NOT EXISTS problem_assignment (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    problem_id TEXT NOT NULL REFERENCES scroll_problem(id) ON DELETE CASCADE,
    assignee_id TEXT NOT NULL,
    assignee_type TEXT NOT NULL CHECK (assignee_type IN ('student', 'team')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN (
        'assigned', 'in_progress', 'submitted', 'reviewed', 'completed', 'cancelled'
    )),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment Milestones table
CREATE TABLE IF NOT EXISTS assignment_milestone (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    assignment_id TEXT NOT NULL REFERENCES problem_assignment(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment Feedback table
CREATE TABLE IF NOT EXISTS assignment_feedback (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    assignment_id TEXT NOT NULL REFERENCES problem_assignment(id) ON DELETE CASCADE,
    provider_id TEXT NOT NULL,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('mentor', 'peer', 'ai')),
    content TEXT NOT NULL,
    helpful BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scroll_problem_category ON scroll_problem(category);
CREATE INDEX IF NOT EXISTS idx_scroll_problem_complexity ON scroll_problem(complexity);
CREATE INDEX IF NOT EXISTS idx_scroll_problem_priority ON scroll_problem(priority DESC);
CREATE INDEX IF NOT EXISTS idx_scroll_problem_active ON scroll_problem(is_active);
CREATE INDEX IF NOT EXISTS idx_problem_assignment_assignee ON problem_assignment(assignee_id, assignee_type);
CREATE INDEX IF NOT EXISTS idx_problem_assignment_problem ON problem_assignment(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_assignment_status ON problem_assignment(status);
CREATE INDEX IF NOT EXISTS idx_assignment_milestone_assignment ON assignment_milestone(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_feedback_assignment ON assignment_feedback(assignment_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scroll_problem_updated_at
    BEFORE UPDATE ON scroll_problem
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problem_assignment_updated_at
    BEFORE UPDATE ON problem_assignment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed initial problems
INSERT INTO scroll_problem (
    title, description, category, complexity, affected_population, geographic_scope,
    urgency, priority, current_solutions, gaps, constraints, stakeholders,
    data_available, success_metrics, kingdom_relevance, scriptural_basis,
    transformational_potential, required_skills, estimated_duration
) VALUES
(
    'Climate Change Mitigation in Rural Communities',
    'Develop sustainable solutions for rural communities facing climate change impacts including drought, flooding, and extreme weather events.',
    'climate_solutions',
    'intermediate',
    5000000,
    'Global - Rural Areas',
    9,
    9,
    '["Solar panels", "Water conservation", "Reforestation"]'::jsonb,
    '["Affordable technology", "Local expertise", "Funding"]'::jsonb,
    '["Limited infrastructure", "Budget constraints", "Geographic isolation"]'::jsonb,
    '["Rural farmers", "Local governments", "NGOs", "Climate scientists"]'::jsonb,
    '["Climate data", "Agricultural reports", "Community surveys"]'::jsonb,
    '["Carbon reduction", "Community resilience", "Economic sustainability"]'::jsonb,
    9,
    '["Genesis 2:15 - Stewardship of creation", "Psalm 24:1 - The earth is the Lord''s"]'::jsonb,
    9,
    ARRAY['Environmental science', 'Community development', 'Data analysis'],
    90
),
(
    'Ethical AI in Healthcare Decision Making',
    'Design ethical frameworks and AI systems for healthcare that respect human dignity, ensure fairness, and maintain transparency in medical decision-making.',
    'ai_ethics',
    'advanced',
    1000000,
    'Global - Healthcare Systems',
    8,
    9,
    '["AI diagnostic tools", "Ethics committees", "Regulatory frameworks"]'::jsonb,
    '["Bias detection", "Transparency", "Patient consent", "Spiritual considerations"]'::jsonb,
    '["Regulatory compliance", "Technical complexity", "Stakeholder buy-in"]'::jsonb,
    '["Healthcare providers", "Patients", "AI developers", "Ethicists", "Regulators"]'::jsonb,
    '["Medical datasets", "AI models", "Ethics research", "Case studies"]'::jsonb,
    '["Reduced bias", "Improved outcomes", "Patient trust", "Ethical compliance"]'::jsonb,
    8,
    '["Imago Dei - Human dignity", "Proverbs 31:8-9 - Speak up for justice"]'::jsonb,
    9,
    ARRAY['AI/ML', 'Ethics', 'Healthcare', 'Policy development'],
    120
),
(
    'Improving Healthcare Access in Underserved Areas',
    'Create innovative solutions to provide quality healthcare to underserved and remote communities through telemedicine, mobile clinics, and community health workers.',
    'health_access',
    'intermediate',
    2000000,
    'Developing Nations',
    9,
    10,
    '["Telemedicine", "Mobile clinics", "Community health workers"]'::jsonb,
    '["Internet connectivity", "Medical supplies", "Trained personnel", "Funding"]'::jsonb,
    '["Infrastructure limitations", "Cultural barriers", "Resource scarcity"]'::jsonb,
    '["Patients", "Healthcare workers", "Local governments", "NGOs", "Donors"]'::jsonb,
    '["Health statistics", "Geographic data", "Community needs assessments"]'::jsonb,
    '["Increased access", "Reduced mortality", "Improved health outcomes"]'::jsonb,
    10,
    '["Matthew 25:36 - I was sick and you looked after me", "Luke 10:9 - Heal the sick"]'::jsonb,
    10,
    ARRAY['Healthcare', 'Technology', 'Community development', 'Logistics'],
    90
),
(
    'Biblical Literacy and Discipleship in Digital Age',
    'Develop engaging digital platforms and methodologies to increase biblical literacy and facilitate discipleship among young people in the digital age.',
    'biblical_literacy',
    'beginner',
    10000000,
    'Global - Youth',
    8,
    9,
    '["Bible apps", "Online courses", "Social media content"]'::jsonb,
    '["Engagement", "Depth", "Community", "Mentorship"]'::jsonb,
    '["Attention spans", "Digital distractions", "Cultural relevance"]'::jsonb,
    '["Youth", "Parents", "Church leaders", "Educators", "Content creators"]'::jsonb,
    '["Usage statistics", "Engagement metrics", "Survey data"]'::jsonb,
    '["Increased Bible reading", "Deeper understanding", "Life transformation"]'::jsonb,
    10,
    '["2 Timothy 3:16-17 - Scripture is God-breathed", "Psalm 119:105 - Word is a lamp"]'::jsonb,
    10,
    ARRAY['Content creation', 'Digital media', 'Education', 'Theology'],
    60
),
(
    'Economic Justice and Fair Trade Systems',
    'Design fair trade systems and economic models that ensure justice for workers, sustainable practices, and kingdom-aligned business principles.',
    'economic_justice',
    'advanced',
    500000,
    'Global - Supply Chains',
    7,
    8,
    '["Fair trade certifications", "Cooperatives", "Ethical sourcing"]'::jsonb,
    '["Enforcement", "Consumer awareness", "Price competitiveness"]'::jsonb,
    '["Market pressures", "Regulatory complexity", "Cultural differences"]'::jsonb,
    '["Workers", "Farmers", "Businesses", "Consumers", "Regulators"]'::jsonb,
    '["Supply chain data", "Economic reports", "Worker surveys"]'::jsonb,
    '["Fair wages", "Sustainable practices", "Worker dignity", "Business viability"]'::jsonb,
    9,
    '["Leviticus 19:13 - Pay workers fairly", "Proverbs 11:1 - Honest scales"]'::jsonb,
    8,
    ARRAY['Economics', 'Business', 'Supply chain', 'Policy'],
    120
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON scroll_problem TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON problem_assignment TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON assignment_milestone TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON assignment_feedback TO authenticated;

-- Enable Row Level Security
ALTER TABLE scroll_problem ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_milestone ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scroll_problem (all authenticated users can read active problems)
CREATE POLICY "Anyone can view active problems"
    ON scroll_problem FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Admins can manage problems"
    ON scroll_problem FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for problem_assignment
CREATE POLICY "Users can view their own assignments"
    ON problem_assignment FOR SELECT
    TO authenticated
    USING (assignee_id = auth.uid()::text OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage assignments"
    ON problem_assignment FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for assignment_milestone
CREATE POLICY "Users can view milestones for their assignments"
    ON assignment_milestone FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM problem_assignment
            WHERE problem_assignment.id = assignment_milestone.assignment_id
            AND (problem_assignment.assignee_id = auth.uid()::text OR auth.jwt() ->> 'role' = 'admin')
        )
    );

CREATE POLICY "Admins can manage milestones"
    ON assignment_milestone FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for assignment_feedback
CREATE POLICY "Users can view feedback for their assignments"
    ON assignment_feedback FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM problem_assignment
            WHERE problem_assignment.id = assignment_feedback.assignment_id
            AND (problem_assignment.assignee_id = auth.uid()::text OR auth.jwt() ->> 'role' = 'admin')
        )
    );

CREATE POLICY "Users can provide feedback"
    ON assignment_feedback FOR INSERT
    TO authenticated
    WITH CHECK (provider_id = auth.uid()::text);

CREATE POLICY "Admins can manage feedback"
    ON assignment_feedback FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

COMMENT ON TABLE scroll_problem IS 'Real-world problems for student innovation projects';
COMMENT ON TABLE problem_assignment IS 'Problem assignments to students and teams';
COMMENT ON TABLE assignment_milestone IS 'Milestones for problem assignments';
COMMENT ON TABLE assignment_feedback IS 'Feedback on problem assignments';
