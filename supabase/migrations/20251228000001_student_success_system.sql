-- ============================================================================
-- Student Success and Retention System Database Schema
-- ============================================================================
-- This migration creates the comprehensive database schema for tracking
-- student success metrics, risk assessments, interventions, and support teams.
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- Enums
-- ============================================================================

CREATE TYPE risk_level AS ENUM ('low', 'moderate', 'high', 'critical');
CREATE TYPE case_status AS ENUM ('open', 'in_progress', 'monitoring', 'resolved', 'closed');
CREATE TYPE escalation_level AS ENUM ('none', 'advisor', 'department', 'dean', 'emergency');
CREATE TYPE calling_stage AS ENUM ('exploration', 'discernment', 'confirmation', 'preparation', 'deployment');
CREATE TYPE financial_aid_status AS ENUM ('active', 'pending', 'suspended', 'completed');
CREATE TYPE intervention_type AS ENUM ('academic_support', 'financial_aid', 'spiritual_guidance', 'mental_health', 'career_counseling', 'peer_mentoring');
CREATE TYPE student_status AS ENUM ('active', 'on_leave', 'probation', 'suspended', 'graduated', 'withdrawn');

-- ============================================================================
-- Student Success Profiles
-- ============================================================================

CREATE TABLE student_success_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Academic Metrics
  gpa DECIMAL(3, 2) DEFAULT 0.00,
  credit_hours INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0.00,
  attendance_rate DECIMAL(5, 2) DEFAULT 0.00,
  assignment_submission_rate DECIMAL(5, 2) DEFAULT 0.00,
  progress_toward_degree DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Grade Distribution
  grade_a_count INTEGER DEFAULT 0,
  grade_b_count INTEGER DEFAULT 0,
  grade_c_count INTEGER DEFAULT 0,
  grade_d_count INTEGER DEFAULT 0,
  grade_f_count INTEGER DEFAULT 0,
  incomplete_count INTEGER DEFAULT 0,
  withdrawal_count INTEGER DEFAULT 0,
  
  -- Financial Health
  tuition_balance DECIMAL(10, 2) DEFAULT 0.00,
  financial_aid_status financial_aid_status DEFAULT 'pending',
  scrollgold_earnings DECIMAL(10, 2) DEFAULT 0.00,
  work_study_participation BOOLEAN DEFAULT FALSE,
  
  -- Spiritual Formation
  calling_discernment_stage calling_stage DEFAULT 'exploration',
  spiritual_growth_score DECIMAL(5, 2) DEFAULT 0.00,
  mentorship_engagement DECIMAL(5, 2) DEFAULT 0.00,
  prayer_journal_activity DECIMAL(5, 2) DEFAULT 0.00,
  scripture_memory_progress DECIMAL(5, 2) DEFAULT 0.00,
  ministry_involvement_level DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Engagement Patterns
  login_frequency INTEGER DEFAULT 0,
  course_access_rate DECIMAL(5, 2) DEFAULT 0.00,
  discussion_participation DECIMAL(5, 2) DEFAULT 0.00,
  resource_utilization DECIMAL(5, 2) DEFAULT 0.00,
  peer_interaction_score DECIMAL(5, 2) DEFAULT 0.00,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  
  -- Predictive Scores
  retention_probability DECIMAL(5, 2) DEFAULT 0.00,
  graduation_probability DECIMAL(5, 2) DEFAULT 0.00,
  time_to_graduation INTEGER, -- in months
  success_likelihood DECIMAL(5, 2) DEFAULT 0.00,
  model_version VARCHAR(50),
  scores_calculated_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(student_id)
);

CREATE INDEX idx_student_success_student_id ON student_success_profiles(student_id);
CREATE INDEX idx_student_success_gpa ON student_success_profiles(gpa);
CREATE INDEX idx_student_success_retention_prob ON student_success_profiles(retention_probability);

-- ============================================================================
-- Risk Assessments
-- ============================================================================

CREATE TABLE risk_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Overall Risk
  overall_risk_score INTEGER CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  
  -- Risk Categories
  academic_risk risk_level DEFAULT 'low',
  financial_risk risk_level DEFAULT 'low',
  social_risk risk_level DEFAULT 'low',
  spiritual_risk risk_level DEFAULT 'low',
  engagement_risk risk_level DEFAULT 'low',
  
  -- Model Confidence
  confidence_level DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_risk_assessments_student_id ON risk_assessments(student_id);
CREATE INDEX idx_risk_assessments_overall_score ON risk_assessments(overall_risk_score);
CREATE INDEX idx_risk_assessments_academic_risk ON risk_assessments(academic_risk);

-- ============================================================================
-- Risk Factors
-- ============================================================================

CREATE TABLE risk_factors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
  
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  severity risk_level NOT NULL,
  indicators JSONB DEFAULT '[]',
  
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_risk_factors_assessment_id ON risk_factors(assessment_id);
CREATE INDEX idx_risk_factors_severity ON risk_factors(severity);

-- ============================================================================
-- Intervention Cases
-- ============================================================================

CREATE TABLE intervention_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id VARCHAR(50) UNIQUE NOT NULL,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  status case_status DEFAULT 'open',
  escalation_level escalation_level DEFAULT 'none',
  
  -- Intervention Plan
  intervention_plan JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_intervention_cases_student_id ON intervention_cases(student_id);
CREATE INDEX idx_intervention_cases_status ON intervention_cases(status);
CREATE INDEX idx_intervention_cases_escalation ON intervention_cases(escalation_level);

-- ============================================================================
-- Case Timeline
-- ============================================================================

CREATE TABLE case_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES intervention_cases(id) ON DELETE CASCADE,
  
  event VARCHAR(255) NOT NULL,
  actor VARCHAR(255) NOT NULL,
  details TEXT,
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_case_timeline_case_id ON case_timeline(case_id);
CREATE INDEX idx_case_timeline_timestamp ON case_timeline(timestamp);

-- ============================================================================
-- Intervention Outcomes
-- ============================================================================

CREATE TABLE intervention_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES intervention_cases(id) ON DELETE CASCADE,
  
  metric VARCHAR(100) NOT NULL,
  before_value DECIMAL(10, 2) NOT NULL,
  after_value DECIMAL(10, 2) NOT NULL,
  improvement DECIMAL(10, 2) NOT NULL,
  
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_intervention_outcomes_case_id ON intervention_outcomes(case_id);

-- ============================================================================
-- Support Team Assignments
-- ============================================================================

CREATE TABLE support_team_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  academic_advisor_id UUID REFERENCES users(id),
  spiritual_mentor_id UUID REFERENCES users(id),
  financial_aid_officer_id UUID REFERENCES users(id),
  career_counselor_id UUID REFERENCES users(id),
  
  additional_support JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(student_id)
);

CREATE INDEX idx_support_team_student_id ON support_team_assignments(student_id);
CREATE INDEX idx_support_team_advisor ON support_team_assignments(academic_advisor_id);
CREATE INDEX idx_support_team_mentor ON support_team_assignments(spiritual_mentor_id);

-- ============================================================================
-- Milestones
-- ============================================================================

CREATE TABLE student_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  target_date DATE NOT NULL,
  completed_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  celebration_sent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_student_milestones_student_id ON student_milestones(student_id);
CREATE INDEX idx_student_milestones_status ON student_milestones(status);
CREATE INDEX idx_student_milestones_target_date ON student_milestones(target_date);

-- ============================================================================
-- Intervention Records
-- ============================================================================

CREATE TABLE intervention_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES intervention_cases(id) ON DELETE SET NULL,
  
  type intervention_type NOT NULL,
  assigned_to JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'active',
  effectiveness DECIMAL(5, 2),
  notes TEXT,
  
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_intervention_records_student_id ON intervention_records(student_id);
CREATE INDEX idx_intervention_records_type ON intervention_records(type);
CREATE INDEX idx_intervention_records_status ON intervention_records(status);

-- ============================================================================
-- Alerts
-- ============================================================================

CREATE TABLE student_success_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(100) NOT NULL,
  severity risk_level NOT NULL,
  message TEXT NOT NULL,
  recommendations JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES users(id)
);

CREATE INDEX idx_success_alerts_student_id ON student_success_alerts(student_id);
CREATE INDEX idx_success_alerts_severity ON student_success_alerts(severity);
CREATE INDEX idx_success_alerts_acknowledged ON student_success_alerts(acknowledged_at);

-- ============================================================================
-- Privacy Settings
-- ============================================================================

CREATE TABLE student_privacy_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  family_access_enabled BOOLEAN DEFAULT FALSE,
  shared_metrics JSONB DEFAULT '[]',
  restricted_data JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(student_id)
);

CREATE INDEX idx_privacy_settings_student_id ON student_privacy_settings(student_id);

-- ============================================================================
-- Family Access
-- ============================================================================

CREATE TABLE family_access_grants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  access_level VARCHAR(50) NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(student_id, family_member_id)
);

CREATE INDEX idx_family_access_student_id ON family_access_grants(student_id);
CREATE INDEX idx_family_access_family_id ON family_access_grants(family_member_id);

-- ============================================================================
-- Prophetic Assessments
-- ============================================================================

CREATE TABLE prophetic_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessor_id UUID NOT NULL REFERENCES users(id),
  
  insights TEXT NOT NULL,
  recommendations JSONB DEFAULT '[]',
  score DECIMAL(5, 2),
  
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prophetic_assessments_student_id ON prophetic_assessments(student_id);
CREATE INDEX idx_prophetic_assessments_date ON prophetic_assessments(assessment_date);

-- ============================================================================
-- Emergency Fund Requests
-- ============================================================================

CREATE TABLE emergency_fund_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id)
);

CREATE INDEX idx_emergency_requests_student_id ON emergency_fund_requests(student_id);
CREATE INDEX idx_emergency_requests_status ON emergency_fund_requests(status);

-- ============================================================================
-- Payment History
-- ============================================================================

CREATE TABLE student_payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(100),
  status VARCHAR(50) DEFAULT 'completed',
  
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_history_student_id ON student_payment_history(student_id);
CREATE INDEX idx_payment_history_date ON student_payment_history(payment_date);

-- ============================================================================
-- Retention and Graduation Metrics (Aggregated)
-- ============================================================================

CREATE TABLE retention_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  cohort VARCHAR(100) NOT NULL,
  total_students INTEGER NOT NULL,
  retained_students INTEGER NOT NULL,
  retention_rate DECIMAL(5, 2) NOT NULL,
  period VARCHAR(50) NOT NULL,
  
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(cohort, period)
);

CREATE INDEX idx_retention_metrics_cohort ON retention_metrics(cohort);
CREATE INDEX idx_retention_metrics_period ON retention_metrics(period);

CREATE TABLE graduation_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  cohort VARCHAR(100) NOT NULL,
  total_students INTEGER NOT NULL,
  graduated_students INTEGER NOT NULL,
  graduation_rate DECIMAL(5, 2) NOT NULL,
  average_time_to_graduation DECIMAL(5, 2), -- in years
  
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(cohort)
);

CREATE INDEX idx_graduation_metrics_cohort ON graduation_metrics(cohort);

-- ============================================================================
-- Benchmark Data
-- ============================================================================

CREATE TABLE benchmark_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  metric VARCHAR(100) NOT NULL,
  institution_value DECIMAL(10, 2) NOT NULL,
  national_average DECIMAL(10, 2),
  christian_education_average DECIMAL(10, 2),
  percentile DECIMAL(5, 2),
  
  period VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(metric, period)
);

CREATE INDEX idx_benchmark_data_metric ON benchmark_data(metric);

-- ============================================================================
-- Triggers for Updated Timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_success_profiles_updated_at
  BEFORE UPDATE ON student_success_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at
  BEFORE UPDATE ON risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intervention_cases_updated_at
  BEFORE UPDATE ON intervention_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_team_assignments_updated_at
  BEFORE UPDATE ON support_team_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_privacy_settings_updated_at
  BEFORE UPDATE ON student_privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE student_success_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_success_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE prophetic_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_fund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_payment_history ENABLE ROW LEVEL SECURITY;

-- Students can view their own data
CREATE POLICY student_success_profiles_select_own ON student_success_profiles
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY risk_assessments_select_own ON risk_assessments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY intervention_cases_select_own ON intervention_cases
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY student_milestones_select_own ON student_milestones
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY student_success_alerts_select_own ON student_success_alerts
  FOR SELECT USING (auth.uid() = student_id);

-- Advisors and staff can view assigned students
-- (Additional policies would be added based on role-based access control)

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE student_success_profiles IS 'Comprehensive student success tracking with academic, financial, and spiritual metrics';
COMMENT ON TABLE risk_assessments IS 'Risk assessment data for identifying at-risk students';
COMMENT ON TABLE intervention_cases IS 'Case management for student interventions and support';
COMMENT ON TABLE support_team_assignments IS 'Assignment of advisors, mentors, and support staff to students';
COMMENT ON TABLE student_success_alerts IS 'Automated alerts for risk factors and milestone achievements';
