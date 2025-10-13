-- ScrollUniversity Admissions Predictive Analytics Migration
-- "For I know the plans I have for you," declares the Lord - Jeremiah 29:11

-- Predictive Models Table
CREATE TABLE predictive_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id VARCHAR(255) NOT NULL UNIQUE,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN ('ADMISSION_SUCCESS', 'YIELD_PREDICTION', 'ENROLLMENT_FORECAST', 'PROCESS_OPTIMIZATION')),
    accuracy DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    last_trained TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    features TEXT[] NOT NULL DEFAULT '{}',
    parameters JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admission Success Predictions Table
CREATE TABLE admission_success_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    model_id VARCHAR(255) NOT NULL REFERENCES predictive_models(model_id),
    success_probability DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    confidence_level DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    key_factors JSONB NOT NULL DEFAULT '[]',
    risk_factors TEXT[] NOT NULL DEFAULT '{}',
    recommendations TEXT[] NOT NULL DEFAULT '{}',
    prediction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Yield Predictions Table
CREATE TABLE yield_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_type VARCHAR(100) NOT NULL,
    model_id VARCHAR(255) NOT NULL REFERENCES predictive_models(model_id),
    predicted_yield_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    confidence_interval_lower DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    confidence_interval_upper DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    historical_yield_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    influencing_factors JSONB NOT NULL DEFAULT '[]',
    seasonal_trends JSONB NOT NULL DEFAULT '[]',
    prediction_period VARCHAR(50) NOT NULL,
    prediction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrollment Forecasts Table
CREATE TABLE enrollment_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_period VARCHAR(50) NOT NULL,
    model_id VARCHAR(255) NOT NULL REFERENCES predictive_models(model_id),
    predicted_enrollment INTEGER NOT NULL DEFAULT 0,
    capacity_utilization DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    demand_trends JSONB NOT NULL DEFAULT '[]',
    resource_requirements JSONB NOT NULL DEFAULT '[]',
    forecast_accuracy DECIMAL(5,4),
    forecast_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Process Improvement Recommendations Table
CREATE TABLE process_improvement_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_area VARCHAR(100) NOT NULL,
    current_efficiency DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    predicted_improvement DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    recommendations JSONB NOT NULL DEFAULT '[]',
    quality_assurance_metrics JSONB NOT NULL DEFAULT '[]',
    implementation_priority INTEGER NOT NULL DEFAULT 5,
    estimated_impact VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (estimated_impact IN ('LOW', 'MEDIUM', 'HIGH')),
    implementation_complexity VARCHAR(20) NOT NULL DEFAULT 'MODERATE' CHECK (implementation_complexity IN ('SIMPLE', 'MODERATE', 'COMPLEX')),
    recommendation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'IMPLEMENTED', 'REJECTED')),
    implemented_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quality Assurance Recommendations Table
CREATE TABLE quality_assurance_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area VARCHAR(100) NOT NULL,
    current_quality_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    target_quality_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    enhancement_suggestions TEXT[] NOT NULL DEFAULT '{}',
    monitoring_metrics TEXT[] NOT NULL DEFAULT '{}',
    implementation_plan JSONB NOT NULL DEFAULT '[]',
    priority_level INTEGER NOT NULL DEFAULT 5,
    recommendation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'IMPLEMENTED', 'REJECTED')),
    implemented_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model Performance Tracking Table
CREATE TABLE model_performance_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id VARCHAR(255) NOT NULL REFERENCES predictive_models(model_id),
    evaluation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accuracy_score DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    precision_score DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    recall_score DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    f1_score DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    prediction_count INTEGER NOT NULL DEFAULT 0,
    correct_predictions INTEGER NOT NULL DEFAULT 0,
    false_positives INTEGER NOT NULL DEFAULT 0,
    false_negatives INTEGER NOT NULL DEFAULT 0,
    performance_metrics JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Predictive Analytics Audit Trail
CREATE TABLE predictive_analytics_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type VARCHAR(50) NOT NULL,
    model_id VARCHAR(255),
    prediction_id UUID,
    user_id UUID REFERENCES users(id),
    operation_details JSONB NOT NULL DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_predictive_models_type ON predictive_models(model_type);
CREATE INDEX idx_predictive_models_active ON predictive_models(is_active);
CREATE INDEX idx_admission_predictions_applicant ON admission_success_predictions(applicant_id);
CREATE INDEX idx_admission_predictions_current ON admission_success_predictions(is_current);
CREATE INDEX idx_yield_predictions_program ON yield_predictions(program_type);
CREATE INDEX idx_yield_predictions_current ON yield_predictions(is_current);
CREATE INDEX idx_enrollment_forecasts_period ON enrollment_forecasts(forecast_period);
CREATE INDEX idx_enrollment_forecasts_current ON enrollment_forecasts(is_current);
CREATE INDEX idx_process_recommendations_area ON process_improvement_recommendations(process_area);
CREATE INDEX idx_process_recommendations_status ON process_improvement_recommendations(status);
CREATE INDEX idx_quality_recommendations_area ON quality_assurance_recommendations(area);
CREATE INDEX idx_quality_recommendations_status ON quality_assurance_recommendations(status);
CREATE INDEX idx_model_performance_model ON model_performance_tracking(model_id);
CREATE INDEX idx_predictive_audit_timestamp ON predictive_analytics_audit(timestamp);
CREATE INDEX idx_predictive_audit_operation ON predictive_analytics_audit(operation_type);

-- Add comments for documentation
COMMENT ON TABLE predictive_models IS 'Stores trained predictive models for admissions analytics';
COMMENT ON TABLE admission_success_predictions IS 'Individual applicant success probability predictions';
COMMENT ON TABLE yield_predictions IS 'Program-level yield rate predictions';
COMMENT ON TABLE enrollment_forecasts IS 'Enrollment forecasting data';
COMMENT ON TABLE process_improvement_recommendations IS 'AI-generated process improvement suggestions';
COMMENT ON TABLE quality_assurance_recommendations IS 'Quality enhancement recommendations';
COMMENT ON TABLE model_performance_tracking IS 'Tracks predictive model performance over time';
COMMENT ON TABLE predictive_analytics_audit IS 'Audit trail for all predictive analytics operations';