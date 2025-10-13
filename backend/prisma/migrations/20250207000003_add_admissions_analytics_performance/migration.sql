-- ScrollUniversity Admissions Analytics and Performance Tracking Schema
-- "For which of you, desiring to build a tower, does not first sit down and count the cost" - Luke 14:28

-- Admissions Analytics Reports Table
CREATE TABLE IF NOT EXISTS admissions_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('DAILY_SUMMARY', 'WEEKLY_REPORT', 'MONTHLY_ANALYSIS', 'QUARTERLY_REVIEW', 'ANNUAL_REPORT', 'CUSTOM_REPORT')),
    total_applications INTEGER NOT NULL DEFAULT 0,
    acceptance_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    yield_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    demographic_breakdown JSONB NOT NULL DEFAULT '{}',
    geographic_distribution JSONB NOT NULL DEFAULT '{}',
    average_scores JSONB NOT NULL DEFAULT '{}',
    assessment_trends JSONB NOT NULL DEFAULT '{}',
    process_efficiency JSONB NOT NULL DEFAULT '{}',
    bottleneck_analysis JSONB NOT NULL DEFAULT '{}',
    report_data JSONB NOT NULL DEFAULT '{}',
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    report_period_start DATE,
    report_period_end DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    metric_type VARCHAR(20) NOT NULL CHECK (metric_type IN ('VOLUME', 'CONVERSION', 'TIME', 'QUALITY', 'EFFICIENCY')),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    context JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Alerts Table
CREATE TABLE IF NOT EXISTS performance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('THRESHOLD_BREACH', 'TREND_ANOMALY', 'SYSTEM_ISSUE', 'QUALITY_CONCERN')),
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    message TEXT NOT NULL,
    affected_metrics JSONB NOT NULL DEFAULT '[]',
    recommended_actions JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED')),
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optimization Recommendations Table
CREATE TABLE IF NOT EXISTS optimization_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area VARCHAR(100) NOT NULL,
    current_performance DECIMAL(10,2) NOT NULL,
    target_performance DECIMAL(10,2) NOT NULL,
    recommendations JSONB NOT NULL DEFAULT '[]',
    estimated_impact VARCHAR(10) NOT NULL CHECK (estimated_impact IN ('LOW', 'MEDIUM', 'HIGH')),
    implementation_complexity VARCHAR(10) NOT NULL CHECK (implementation_complexity IN ('SIMPLE', 'MODERATE', 'COMPLEX')),
    priority INTEGER NOT NULL CHECK (priority >= 1 AND priority <= 10),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED')),
    assigned_to UUID REFERENCES users(id),
    implemented_by UUID REFERENCES users(id),
    implemented_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trend Analysis Table
CREATE TABLE IF NOT EXISTS trend_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    current_value DECIMAL(10,2) NOT NULL,
    previous_value DECIMAL(10,2) NOT NULL,
    change_percentage DECIMAL(10,2) NOT NULL,
    trend VARCHAR(15) NOT NULL CHECK (trend IN ('INCREASING', 'DECREASING', 'STABLE')),
    significance VARCHAR(10) NOT NULL CHECK (significance IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    analysis_period_days INTEGER NOT NULL DEFAULT 30,
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Funnel Analysis Table
CREATE TABLE IF NOT EXISTS funnel_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_name VARCHAR(50) NOT NULL,
    applicant_count INTEGER NOT NULL DEFAULT 0,
    conversion_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    average_time_in_stage DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    dropoff_reasons JSONB NOT NULL DEFAULT '[]',
    bottleneck_severity VARCHAR(10) CHECK (bottleneck_severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    recommendations JSONB NOT NULL DEFAULT '[]',
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_start DATE NOT NULL,
    analysis_period_end DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Demographic Analysis Table
CREATE TABLE IF NOT EXISTS demographic_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_type VARCHAR(30) NOT NULL CHECK (analysis_type IN ('AGE_DISTRIBUTION', 'GEOGRAPHIC_DISTRIBUTION', 'SPIRITUAL_MATURITY', 'ACADEMIC_BACKGROUND', 'DIVERSITY_METRICS')),
    distribution_data JSONB NOT NULL DEFAULT '{}',
    diversity_index DECIMAL(5,2),
    total_count INTEGER NOT NULL DEFAULT 0,
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    analysis_period_start DATE NOT NULL,
    analysis_period_end DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application Volume Tracking Table
CREATE TABLE IF NOT EXISTS application_volume_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
    daily_volume INTEGER NOT NULL DEFAULT 0,
    weekly_volume INTEGER NOT NULL DEFAULT 0,
    monthly_volume INTEGER NOT NULL DEFAULT 0,
    program_breakdown JSONB NOT NULL DEFAULT '{}',
    peak_hours JSONB NOT NULL DEFAULT '{}',
    growth_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversion Rate Tracking Table
CREATE TABLE IF NOT EXISTS conversion_rate_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
    stage_name VARCHAR(50) NOT NULL,
    conversion_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    dropoff_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    applicant_count INTEGER NOT NULL DEFAULT 0,
    converted_count INTEGER NOT NULL DEFAULT 0,
    program_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_admissions_analytics_report_type ON admissions_analytics(report_type);
CREATE INDEX IF NOT EXISTS idx_admissions_analytics_generated_at ON admissions_analytics(generated_at);
CREATE INDEX IF NOT EXISTS idx_admissions_analytics_period ON admissions_analytics(report_period_start, report_period_end);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_performance_alerts_severity ON performance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_status ON performance_alerts(status);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_created_at ON performance_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_priority ON optimization_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_status ON optimization_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_impact ON optimization_recommendations(estimated_impact);

CREATE INDEX IF NOT EXISTS idx_trend_analysis_metric_name ON trend_analysis(metric_name);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_date ON trend_analysis(analysis_date);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_significance ON trend_analysis(significance);

CREATE INDEX IF NOT EXISTS idx_funnel_analysis_stage ON funnel_analysis(stage_name);
CREATE INDEX IF NOT EXISTS idx_funnel_analysis_date ON funnel_analysis(analysis_date);
CREATE INDEX IF NOT EXISTS idx_funnel_analysis_period ON funnel_analysis(analysis_period_start, analysis_period_end);

CREATE INDEX IF NOT EXISTS idx_demographic_analysis_type ON demographic_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_demographic_analysis_date ON demographic_analysis(analysis_date);

CREATE INDEX IF NOT EXISTS idx_volume_tracking_date ON application_volume_tracking(tracking_date);
CREATE INDEX IF NOT EXISTS idx_conversion_tracking_date ON conversion_rate_tracking(tracking_date);
CREATE INDEX IF NOT EXISTS idx_conversion_tracking_stage ON conversion_rate_tracking(stage_name);

-- Add missing columns to existing tables if they don't exist
DO $$ 
BEGIN
    -- Add applicant_country to applications table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'applicant_country') THEN
        ALTER TABLE applications ADD COLUMN applicant_country VARCHAR(100);
    END IF;
    
    -- Add admission_decision to applications table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'admission_decision') THEN
        ALTER TABLE applications ADD COLUMN admission_decision VARCHAR(20) CHECK (admission_decision IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WAITLISTED', 'DEFERRED'));
    END IF;
END $$;

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
DROP TRIGGER IF EXISTS update_admissions_analytics_updated_at ON admissions_analytics;
CREATE TRIGGER update_admissions_analytics_updated_at 
    BEFORE UPDATE ON admissions_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_performance_alerts_updated_at ON performance_alerts;
CREATE TRIGGER update_performance_alerts_updated_at 
    BEFORE UPDATE ON performance_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_optimization_recommendations_updated_at ON optimization_recommendations;
CREATE TRIGGER update_optimization_recommendations_updated_at 
    BEFORE UPDATE ON optimization_recommendations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample performance thresholds and configurations
INSERT INTO performance_metrics (metric_name, metric_value, metric_type, context) VALUES
('application_volume_threshold', 50, 'VOLUME', '{"description": "Daily application volume threshold", "unit": "applications_per_day"}'),
('conversion_rate_threshold', 60, 'CONVERSION', '{"description": "Minimum acceptable conversion rate", "unit": "percentage"}'),
('processing_time_threshold', 30, 'TIME', '{"description": "Maximum processing time", "unit": "days"}'),
('quality_score_threshold', 75, 'QUALITY', '{"description": "Minimum quality score", "unit": "percentage"}'),
('efficiency_score_threshold', 80, 'EFFICIENCY', '{"description": "Minimum efficiency score", "unit": "percentage"}')
ON CONFLICT DO NOTHING;

-- Create a view for analytics dashboard summary
CREATE OR REPLACE VIEW analytics_dashboard_summary AS
SELECT 
    COUNT(DISTINCT a.id) as total_applications,
    COUNT(DISTINCT CASE WHEN a.admission_decision = 'ACCEPTED' THEN a.id END) as accepted_applications,
    ROUND(
        CASE 
            WHEN COUNT(DISTINCT a.id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN a.admission_decision = 'ACCEPTED' THEN a.id END)::DECIMAL / COUNT(DISTINCT a.id)) * 100 
            ELSE 0 
        END, 2
    ) as overall_conversion_rate,
    COUNT(DISTINCT a.applicant_country) as countries_represented,
    AVG(se.scroll_alignment) as avg_spiritual_alignment,
    AVG(ae.learning_potential) as avg_academic_readiness,
    AVG(EXTRACT(EPOCH FROM (ad.decision_date - a.submission_date)) / 86400) as avg_processing_days
FROM applications a
LEFT JOIN spiritual_evaluations se ON a.id = se.application_id
LEFT JOIN academic_evaluations ae ON a.id = ae.application_id
LEFT JOIN admission_decisions ad ON a.id = ad.application_id
WHERE a.submission_date >= CURRENT_DATE - INTERVAL '30 days';

COMMENT ON VIEW analytics_dashboard_summary IS 'Real-time analytics dashboard summary for the last 30 days';

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON admissions_analytics TO scroll_admissions_user;
GRANT SELECT, INSERT, UPDATE ON performance_metrics TO scroll_admissions_user;
GRANT SELECT, INSERT, UPDATE ON performance_alerts TO scroll_admissions_user;
GRANT SELECT, INSERT, UPDATE ON optimization_recommendations TO scroll_admissions_user;
GRANT SELECT, INSERT, UPDATE ON trend_analysis TO scroll_admissions_user;
GRANT SELECT, INSERT, UPDATE ON funnel_analysis TO scroll_admissions_user;
GRANT SELECT, INSERT, UPDATE ON demographic_analysis TO scroll_admissions_user;
GRANT SELECT, INSERT, UPDATE ON application_volume_tracking TO scroll_admissions_user;
GRANT SELECT, INSERT, UPDATE ON conversion_rate_tracking TO scroll_admissions_user;
GRANT SELECT ON analytics_dashboard_summary TO scroll_admissions_user;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO scroll_admissions_user;