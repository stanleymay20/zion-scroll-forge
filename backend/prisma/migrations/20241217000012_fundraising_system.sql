-- Fundraising & Donor Management System Migration
-- Creates tables for AI-powered donor intelligence and fundraising

-- ============================================================================
-- Donors Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zip VARCHAR(20),
    address_country VARCHAR(100),
    donor_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    first_gift_date TIMESTAMP,
    last_gift_date TIMESTAMP,
    total_lifetime_giving DECIMAL(12, 2) DEFAULT 0,
    engagement_level VARCHAR(50),
    preferred_contact_method VARCHAR(50),
    communication_email_opt_in BOOLEAN DEFAULT true,
    communication_phone_opt_in BOOLEAN DEFAULT false,
    communication_mail_opt_in BOOLEAN DEFAULT true,
    communication_frequency VARCHAR(50) DEFAULT 'monthly',
    notes TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_donors_email ON donors(email);
CREATE INDEX idx_donors_status ON donors(status);
CREATE INDEX idx_donors_donor_type ON donors(donor_type);
CREATE INDEX idx_donors_last_gift_date ON donors(last_gift_date);

-- ============================================================================
-- Donations Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    campaign_id UUID,
    designation VARCHAR(255),
    payment_method VARCHAR(50) NOT NULL,
    recurring BOOLEAN DEFAULT false,
    recurring_frequency VARCHAR(50),
    tax_deductible BOOLEAN DEFAULT true,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_date TIMESTAMP,
    transaction_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_date ON donations(date);
CREATE INDEX idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX idx_donations_designation ON donations(designation);

-- ============================================================================
-- Donor Interests Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS donor_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    category VARCHAR(255) NOT NULL,
    subcategories TEXT[],
    strength DECIMAL(3, 2) DEFAULT 0.5,
    evidence TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_donor_interests_donor_id ON donor_interests(donor_id);
CREATE INDEX idx_donor_interests_category ON donor_interests(category);

-- ============================================================================
-- Donor Relationships Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS donor_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,
    related_donor_id UUID REFERENCES donors(id) ON DELETE SET NULL,
    organization_name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_donor_relationships_donor_id ON donor_relationships(donor_id);
CREATE INDEX idx_donor_relationships_type ON donor_relationships(relationship_type);

-- ============================================================================
-- Donor Intelligence Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS donor_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    estimated_capacity DECIMAL(12, 2),
    capacity_min DECIMAL(12, 2),
    capacity_max DECIMAL(12, 2),
    capacity_confidence DECIMAL(3, 2),
    engagement_score INTEGER,
    engagement_trend VARCHAR(50),
    optimal_ask_amount DECIMAL(12, 2),
    best_contact_method VARCHAR(50),
    best_contact_time VARCHAR(100),
    risk_factors TEXT[],
    opportunities TEXT[],
    analysis TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_donor_intelligence_donor_id ON donor_intelligence(donor_id);
CREATE INDEX idx_donor_intelligence_engagement_score ON donor_intelligence(engagement_score);

-- ============================================================================
-- Appeals Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    campaign_id UUID,
    subject VARCHAR(500),
    greeting TEXT,
    opening TEXT,
    body TEXT,
    ask_statement TEXT,
    suggested_amount DECIMAL(12, 2),
    alternative_amounts DECIMAL(12, 2)[],
    call_to_action TEXT,
    closing TEXT,
    signature TEXT,
    postscript TEXT,
    confidence DECIMAL(3, 2),
    reasoning TEXT,
    sent_date TIMESTAMP,
    opened_date TIMESTAMP,
    clicked_date TIMESTAMP,
    responded_date TIMESTAMP,
    response_amount DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appeals_donor_id ON appeals(donor_id);
CREATE INDEX idx_appeals_campaign_id ON appeals(campaign_id);
CREATE INDEX idx_appeals_sent_date ON appeals(sent_date);

-- ============================================================================
-- Engagement Plans Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS engagement_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    current_status VARCHAR(255),
    goals TEXT[],
    relationship_health_score INTEGER,
    relationship_health_trend VARCHAR(50),
    relationship_strengths TEXT[],
    relationship_concerns TEXT[],
    relationship_recommendations TEXT[],
    next_review_date TIMESTAMP,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_engagement_plans_donor_id ON engagement_plans(donor_id);
CREATE INDEX idx_engagement_plans_next_review ON engagement_plans(next_review_date);

-- ============================================================================
-- Planned Touchpoints Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS planned_touchpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_plan_id UUID NOT NULL REFERENCES engagement_plans(id) ON DELETE CASCADE,
    touchpoint_type VARCHAR(50) NOT NULL,
    timing VARCHAR(255),
    method VARCHAR(50),
    purpose TEXT,
    suggested_content TEXT,
    priority VARCHAR(20),
    completed BOOLEAN DEFAULT false,
    completed_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_planned_touchpoints_plan_id ON planned_touchpoints(engagement_plan_id);
CREATE INDEX idx_planned_touchpoints_completed ON planned_touchpoints(completed);
CREATE INDEX idx_planned_touchpoints_priority ON planned_touchpoints(priority);

-- ============================================================================
-- Recognition Opportunities Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS recognition_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_plan_id UUID NOT NULL REFERENCES engagement_plans(id) ON DELETE CASCADE,
    recognition_type VARCHAR(50) NOT NULL,
    occasion VARCHAR(255),
    timing VARCHAR(255),
    suggested_approach TEXT,
    impact TEXT,
    completed BOOLEAN DEFAULT false,
    completed_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recognition_opportunities_plan_id ON recognition_opportunities(engagement_plan_id);
CREATE INDEX idx_recognition_opportunities_type ON recognition_opportunities(recognition_type);

-- ============================================================================
-- Prospects Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    source VARCHAR(50) NOT NULL,
    estimated_capacity DECIMAL(12, 2),
    capacity_confidence DECIMAL(3, 2),
    affinity_score INTEGER,
    readiness_score INTEGER,
    overall_score INTEGER,
    interests TEXT[],
    connections TEXT[],
    engagement_history TEXT[],
    recommended_strategy TEXT,
    priority VARCHAR(20),
    status VARCHAR(50) NOT NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT[],
    converted_to_donor_id UUID REFERENCES donors(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prospects_source ON prospects(source);
CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_prospects_priority ON prospects(priority);
CREATE INDEX idx_prospects_overall_score ON prospects(overall_score);

-- ============================================================================
-- Wealth Indicators Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS wealth_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    indicator_type VARCHAR(100) NOT NULL,
    value TEXT,
    confidence DECIMAL(3, 2),
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wealth_indicators_prospect_id ON wealth_indicators(prospect_id);
CREATE INDEX idx_wealth_indicators_type ON wealth_indicators(indicator_type);

-- ============================================================================
-- Impact Reports Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS impact_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    period_start_date TIMESTAMP NOT NULL,
    period_end_date TIMESTAMP NOT NULL,
    period_label VARCHAR(100),
    total_impact DECIMAL(12, 2),
    thank_you_message TEXT,
    future_opportunities TEXT[],
    confidence DECIMAL(3, 2),
    sent_date TIMESTAMP,
    viewed_date TIMESTAMP,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_impact_reports_donor_id ON impact_reports(donor_id);
CREATE INDEX idx_impact_reports_period ON impact_reports(period_start_date, period_end_date);

-- ============================================================================
-- Impact Outcomes Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS impact_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    impact_report_id UUID NOT NULL REFERENCES impact_reports(id) ON DELETE CASCADE,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    impact TEXT,
    donor_contribution DECIMAL(12, 2),
    percentage_of_total DECIMAL(5, 2),
    evidence TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_impact_outcomes_report_id ON impact_outcomes(impact_report_id);

-- ============================================================================
-- Student Stories Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    impact_report_id UUID REFERENCES impact_reports(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    program VARCHAR(255),
    story TEXT,
    outcome TEXT,
    quote TEXT,
    image_url VARCHAR(500),
    relevance_to_donor TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_stories_report_id ON student_stories(impact_report_id);

-- ============================================================================
-- Campaigns Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goal DECIMAL(12, 2),
    raised DECIMAL(12, 2) DEFAULT 0,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    target_audience TEXT[],
    theme VARCHAR(255),
    key_messages TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- ============================================================================
-- Campaign Metrics Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaign_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    donor_count INTEGER DEFAULT 0,
    average_gift DECIMAL(12, 2) DEFAULT 0,
    conversion_rate DECIMAL(5, 4) DEFAULT 0,
    retention_rate DECIMAL(5, 4) DEFAULT 0,
    cost_per_dollar_raised DECIMAL(5, 4) DEFAULT 0,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaign_metrics_campaign_id ON campaign_metrics(campaign_id);

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE donors IS 'Donor profiles and contact information';
COMMENT ON TABLE donations IS 'Individual donation transactions';
COMMENT ON TABLE donor_intelligence IS 'AI-generated donor intelligence and analysis';
COMMENT ON TABLE appeals IS 'Personalized donation appeals generated by AI';
COMMENT ON TABLE engagement_plans IS 'Donor relationship management plans';
COMMENT ON TABLE prospects IS 'Potential donors identified for cultivation';
COMMENT ON TABLE impact_reports IS 'Personalized impact reports for donors';
COMMENT ON TABLE campaigns IS 'Fundraising campaigns';
