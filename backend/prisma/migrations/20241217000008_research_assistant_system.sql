-- ScrollUniversity Research Assistant System Migration
-- "The Spirit of truth will guide you into all truth" - John 16:13

-- Literature Reviews Table
CREATE TABLE IF NOT EXISTS literature_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(500) NOT NULL,
    search_query TEXT NOT NULL,
    total_papers INTEGER NOT NULL DEFAULT 0,
    research_gaps JSONB DEFAULT '[]',
    methodologies JSONB DEFAULT '[]',
    theoretical_frameworks JSONB DEFAULT '[]',
    synthesis_map JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Paper Summaries Table
CREATE TABLE IF NOT EXISTS paper_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    literature_review_id UUID REFERENCES literature_reviews(id) ON DELETE CASCADE,
    paper_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    authors JSONB NOT NULL DEFAULT '[]',
    year INTEGER NOT NULL,
    key_findings JSONB DEFAULT '[]',
    methodology TEXT,
    limitations JSONB DEFAULT '[]',
    connections JSONB DEFAULT '[]',
    relevance_score INTEGER DEFAULT 50,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(literature_review_id, paper_id)
);

-- Research Proposals Table
CREATE TABLE IF NOT EXISTS research_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    research_question TEXT NOT NULL,
    objectives JSONB DEFAULT '[]',
    background TEXT,
    proposed_methodology TEXT,
    expected_outcomes JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Methodology Suggestions Table
CREATE TABLE IF NOT EXISTS methodology_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES research_proposals(id) ON DELETE CASCADE,
    research_type VARCHAR(50) NOT NULL,
    recommended_methods JSONB DEFAULT '[]',
    statistical_analyses JSONB DEFAULT '[]',
    confounding_variables JSONB DEFAULT '[]',
    data_collection_strategies JSONB DEFAULT '[]',
    sample_size_recommendation TEXT,
    ethical_considerations JSONB DEFAULT '[]',
    templates JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Citations Table
CREATE TABLE IF NOT EXISTS citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    authors JSONB NOT NULL DEFAULT '[]',
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    journal VARCHAR(500),
    volume VARCHAR(50),
    issue VARCHAR(50),
    pages VARCHAR(50),
    publisher VARCHAR(500),
    url TEXT,
    doi VARCHAR(255),
    access_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bibliographies Table
CREATE TABLE IF NOT EXISTS bibliographies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    style VARCHAR(50) NOT NULL,
    citation_ids JSONB DEFAULT '[]',
    formatted_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Research Papers Table
CREATE TABLE IF NOT EXISTS research_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    abstract TEXT,
    introduction TEXT,
    methodology TEXT,
    results TEXT,
    discussion TEXT,
    conclusion TEXT,
    references JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Research Feedback Table
CREATE TABLE IF NOT EXISTS research_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES research_papers(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    strengths JSONB DEFAULT '[]',
    weaknesses JSONB DEFAULT '[]',
    argument_structure JSONB DEFAULT '{}',
    evidence_quality JSONB DEFAULT '{}',
    writing_quality JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    detailed_comments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Research Assistant Audit Log
CREATE TABLE IF NOT EXISTS research_assistant_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ai_cost DECIMAL(10, 4) DEFAULT 0,
    processing_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_literature_reviews_user_id ON literature_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_literature_reviews_created_at ON literature_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_paper_summaries_review_id ON paper_summaries(literature_review_id);
CREATE INDEX IF NOT EXISTS idx_paper_summaries_paper_id ON paper_summaries(paper_id);
CREATE INDEX IF NOT EXISTS idx_research_proposals_user_id ON research_proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_research_proposals_status ON research_proposals(status);
CREATE INDEX IF NOT EXISTS idx_methodology_suggestions_proposal_id ON methodology_suggestions(proposal_id);
CREATE INDEX IF NOT EXISTS idx_citations_user_id ON citations(user_id);
CREATE INDEX IF NOT EXISTS idx_citations_type ON citations(type);
CREATE INDEX IF NOT EXISTS idx_bibliographies_user_id ON bibliographies(user_id);
CREATE INDEX IF NOT EXISTS idx_research_papers_user_id ON research_papers(user_id);
CREATE INDEX IF NOT EXISTS idx_research_papers_status ON research_papers(status);
CREATE INDEX IF NOT EXISTS idx_research_feedback_paper_id ON research_feedback(paper_id);
CREATE INDEX IF NOT EXISTS idx_research_audit_user_id ON research_assistant_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_research_audit_action ON research_assistant_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_research_audit_created_at ON research_assistant_audit_log(created_at DESC);

-- Comments
COMMENT ON TABLE literature_reviews IS 'Stores comprehensive literature review results';
COMMENT ON TABLE paper_summaries IS 'AI-generated summaries of academic papers';
COMMENT ON TABLE research_proposals IS 'Student research proposals for methodology suggestions';
COMMENT ON TABLE methodology_suggestions IS 'AI-generated methodology recommendations';
COMMENT ON TABLE citations IS 'Academic citations in various formats';
COMMENT ON TABLE bibliographies IS 'Formatted bibliographies for research papers';
COMMENT ON TABLE research_papers IS 'Student research papers for feedback';
COMMENT ON TABLE research_feedback IS 'AI-generated feedback on research papers';
COMMENT ON TABLE research_assistant_audit_log IS 'Audit trail for research assistant operations';
