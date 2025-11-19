-- AI Database Integration Migration
-- "The Spirit of truth will guide you into all truth" - John 16:13
-- Comprehensive database integration for all AI automation services

-- ============================================================================
-- AI SERVICE REQUESTS TABLE
-- Tracks all AI service interactions with comprehensive audit trail
-- ============================================================================

-- Ensure AI Service Requests table exists with all required fields
CREATE TABLE IF NOT EXISTS "ai_service_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestData" JSONB NOT NULL,
    "responseData" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confidence" DOUBLE PRECISION,
    "cost" DOUBLE PRECISION,
    "processingTimeMs" INTEGER,
    "humanReviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "humanReviewed" BOOLEAN NOT NULL DEFAULT false,
    "humanReviewerId" TEXT,
    "reviewOutcome" TEXT,
    "reviewNotes" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_service_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ai_service_requests_humanReviewerId_fkey" FOREIGN KEY ("humanReviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for AI Service Requests
CREATE INDEX IF NOT EXISTS "ai_service_requests_userId_idx" ON "ai_service_requests"("userId");
CREATE INDEX IF NOT EXISTS "ai_service_requests_serviceType_idx" ON "ai_service_requests"("serviceType");
CREATE INDEX IF NOT EXISTS "ai_service_requests_status_idx" ON "ai_service_requests"("status");
CREATE INDEX IF NOT EXISTS "ai_service_requests_createdAt_idx" ON "ai_service_requests"("createdAt");
CREATE INDEX IF NOT EXISTS "ai_service_requests_review_idx" ON "ai_service_requests"("humanReviewRequired", "humanReviewed");

-- ============================================================================
-- AI CONVERSATIONS TABLE
-- Stores conversation histories for chatbot and support services
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ai_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "conversationData" JSONB NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "escalationReason" TEXT,
    "satisfactionRating" INTEGER,
    CONSTRAINT "ai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for AI Conversations
CREATE INDEX IF NOT EXISTS "ai_conversations_userId_idx" ON "ai_conversations"("userId");
CREATE INDEX IF NOT EXISTS "ai_conversations_serviceType_idx" ON "ai_conversations"("serviceType");
CREATE INDEX IF NOT EXISTS "ai_conversations_endedAt_idx" ON "ai_conversations"("endedAt");

-- ============================================================================
-- AI GENERATED CONTENT TABLE
-- Tracks all AI-generated content with review workflow
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ai_generated_content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentType" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "generatedByUserId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "generatedContent" JSONB NOT NULL,
    "metadata" JSONB,
    "confidence" DOUBLE PRECISION,
    "theologicalAlignmentScore" DOUBLE PRECISION,
    "qualityScore" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "reviewedByUserId" TEXT,
    "reviewStatus" TEXT,
    "reviewNotes" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_generated_content_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ai_generated_content_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for AI Generated Content
CREATE INDEX IF NOT EXISTS "ai_generated_content_contentType_idx" ON "ai_generated_content"("contentType");
CREATE INDEX IF NOT EXISTS "ai_generated_content_serviceType_idx" ON "ai_generated_content"("serviceType");
CREATE INDEX IF NOT EXISTS "ai_generated_content_status_idx" ON "ai_generated_content"("status");
CREATE INDEX IF NOT EXISTS "ai_generated_content_generatedByUserId_idx" ON "ai_generated_content"("generatedByUserId");
CREATE INDEX IF NOT EXISTS "ai_generated_content_reviewStatus_idx" ON "ai_generated_content"("reviewStatus");

-- ============================================================================
-- AI AUDIT LOG TABLE
-- Comprehensive audit trail for all AI operations
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ai_audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "inputData" JSONB,
    "outputData" JSONB,
    "confidence" DOUBLE PRECISION,
    "cost" DOUBLE PRECISION,
    "processingTimeMs" INTEGER,
    "humanReviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewOutcome" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for AI Audit Logs
CREATE INDEX IF NOT EXISTS "ai_audit_logs_serviceType_idx" ON "ai_audit_logs"("serviceType");
CREATE INDEX IF NOT EXISTS "ai_audit_logs_action_idx" ON "ai_audit_logs"("action");
CREATE INDEX IF NOT EXISTS "ai_audit_logs_userId_idx" ON "ai_audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "ai_audit_logs_entity_idx" ON "ai_audit_logs"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "ai_audit_logs_createdAt_idx" ON "ai_audit_logs"("createdAt");

-- ============================================================================
-- AI SERVICE METRICS TABLE
-- Performance and quality metrics for AI services
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ai_service_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceType" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "metricUnit" TEXT,
    "tags" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for AI Service Metrics
CREATE INDEX IF NOT EXISTS "ai_service_metrics_serviceType_idx" ON "ai_service_metrics"("serviceType");
CREATE INDEX IF NOT EXISTS "ai_service_metrics_metricName_idx" ON "ai_service_metrics"("metricName");
CREATE INDEX IF NOT EXISTS "ai_service_metrics_recordedAt_idx" ON "ai_service_metrics"("recordedAt");

-- ============================================================================
-- AI COST TRACKING TABLE
-- Detailed cost tracking for budget management
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ai_cost_tracking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "serviceType" TEXT NOT NULL,
    "operationType" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "cost" DOUBLE PRECISION NOT NULL,
    "modelUsed" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_cost_tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for AI Cost Tracking
CREATE INDEX IF NOT EXISTS "ai_cost_tracking_userId_idx" ON "ai_cost_tracking"("userId");
CREATE INDEX IF NOT EXISTS "ai_cost_tracking_serviceType_idx" ON "ai_cost_tracking"("serviceType");
CREATE INDEX IF NOT EXISTS "ai_cost_tracking_createdAt_idx" ON "ai_cost_tracking"("createdAt");

-- ============================================================================
-- AI QUALITY METRICS TABLE
-- Quality assurance metrics for AI outputs
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ai_quality_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceType" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "accuracyScore" DOUBLE PRECISION,
    "confidenceScore" DOUBLE PRECISION,
    "humanAgreementScore" DOUBLE PRECISION,
    "theologicalAlignmentScore" DOUBLE PRECISION,
    "responseTimeMs" INTEGER,
    "humanFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for AI Quality Metrics
CREATE INDEX IF NOT EXISTS "ai_quality_metrics_serviceType_idx" ON "ai_quality_metrics"("serviceType");
CREATE INDEX IF NOT EXISTS "ai_quality_metrics_requestId_idx" ON "ai_quality_metrics"("requestId");
CREATE INDEX IF NOT EXISTS "ai_quality_metrics_createdAt_idx" ON "ai_quality_metrics"("createdAt");

-- ============================================================================
-- AI RATE LIMIT TABLE
-- Rate limiting for AI service usage
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ai_rate_limits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "limitExceeded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_rate_limits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ai_rate_limits_userId_serviceType_windowStart_key" UNIQUE ("userId", "serviceType", "windowStart")
);

-- Create indexes for AI Rate Limits
CREATE INDEX IF NOT EXISTS "ai_rate_limits_userId_idx" ON "ai_rate_limits"("userId");
CREATE INDEX IF NOT EXISTS "ai_rate_limits_serviceType_idx" ON "ai_rate_limits"("serviceType");
CREATE INDEX IF NOT EXISTS "ai_rate_limits_windowEnd_idx" ON "ai_rate_limits"("windowEnd");

-- ============================================================================
-- AI REVIEW QUEUE TABLE
-- Human review queue for low-confidence AI outputs
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ai_review_queue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceType" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "contentType" TEXT NOT NULL,
    "contentData" JSONB NOT NULL,
    "aiRecommendation" JSONB,
    "confidence" DOUBLE PRECISION,
    "reasonForReview" TEXT,
    "assignedToUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedAt" TIMESTAMP(3),
    "reviewDecision" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_review_queue_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for AI Review Queue
CREATE INDEX IF NOT EXISTS "ai_review_queue_serviceType_idx" ON "ai_review_queue"("serviceType");
CREATE INDEX IF NOT EXISTS "ai_review_queue_status_idx" ON "ai_review_queue"("status");
CREATE INDEX IF NOT EXISTS "ai_review_queue_priority_idx" ON "ai_review_queue"("priority");
CREATE INDEX IF NOT EXISTS "ai_review_queue_assignedToUserId_idx" ON "ai_review_queue"("assignedToUserId");
CREATE INDEX IF NOT EXISTS "ai_review_queue_createdAt_idx" ON "ai_review_queue"("createdAt");

-- ============================================================================
-- AI DATA RETENTION TABLE
-- Data retention policies for GDPR/FERPA compliance
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ai_data_retention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataType" TEXT NOT NULL UNIQUE,
    "retentionDays" INTEGER NOT NULL,
    "lastCleanupAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ============================================================================
-- AI SERVICE CONFIG TABLE
-- Configuration settings for each AI service
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ai_service_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceType" TEXT NOT NULL UNIQUE,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "maxRequestsPerHour" INTEGER NOT NULL DEFAULT 100,
    "maxCostPerDay" DOUBLE PRECISION,
    "confidenceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "requireHumanReview" BOOLEAN NOT NULL DEFAULT false,
    "configData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ============================================================================
-- INSERT DEFAULT DATA RETENTION POLICIES
-- ============================================================================

INSERT INTO "ai_data_retention" ("id", "dataType", "retentionDays", "createdAt", "updatedAt")
VALUES 
    ('retention_conversations', 'ai_conversations', 365, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('retention_audit_logs', 'ai_audit_logs', 730, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('retention_service_requests', 'ai_service_requests', 180, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('retention_generated_content', 'ai_generated_content', 1095, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('retention_cost_tracking', 'ai_cost_tracking', 1095, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('retention_quality_metrics', 'ai_quality_metrics', 365, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('retention_rate_limits', 'ai_rate_limits', 90, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('retention_review_queue', 'ai_review_queue', 180, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("dataType") DO NOTHING;

-- ============================================================================
-- INSERT DEFAULT AI SERVICE CONFIGURATIONS
-- ============================================================================

INSERT INTO "ai_service_config" ("id", "serviceType", "enabled", "maxRequestsPerHour", "maxCostPerDay", "confidenceThreshold", "requireHumanReview", "createdAt", "updatedAt")
VALUES 
    ('config_chatbot', 'support_chatbot', true, 1000, 100.00, 0.80, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('config_grading', 'automated_grading', true, 500, 200.00, 0.85, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('config_content', 'content_creation', true, 200, 150.00, 0.85, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('config_personalization', 'personalized_learning', true, 2000, 50.00, 0.75, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('config_integrity', 'academic_integrity', true, 1000, 100.00, 0.90, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('config_admissions', 'admissions_processing', true, 100, 75.00, 0.85, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('config_research', 'research_assistant', true, 300, 100.00, 0.80, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('config_course_rec', 'course_recommendation', true, 500, 30.00, 0.80, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('config_faculty', 'faculty_support', true, 800, 80.00, 0.80, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('config_translation', 'translation_localization', true, 400, 60.00, 0.85, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('config_spiritual', 'spiritual_formation', true, 300, 40.00, 0.85, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('config_fundraising', 'fundraising_donor', true, 200, 50.00, 0.80, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('config_career', 'career_services', true, 400, 70.00, 0.80, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('config_moderation', 'content_moderation', true, 2000, 80.00, 0.90, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('config_accessibility', 'accessibility_compliance', true, 500, 60.00, 0.85, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("serviceType") DO NOTHING;

-- ============================================================================
-- CREATE VIEWS FOR ANALYTICS AND REPORTING
-- ============================================================================

-- View for AI service usage summary
CREATE OR REPLACE VIEW "ai_service_usage_summary" AS
SELECT 
    "serviceType",
    COUNT(*) as "totalRequests",
    AVG("confidence") as "avgConfidence",
    SUM("cost") as "totalCost",
    AVG("processingTimeMs") as "avgProcessingTime",
    COUNT(CASE WHEN "humanReviewRequired" = true THEN 1 END) as "reviewRequiredCount",
    COUNT(CASE WHEN "status" = 'completed' THEN 1 END) as "completedCount",
    COUNT(CASE WHEN "status" = 'failed' THEN 1 END) as "failedCount"
FROM "ai_service_requests"
GROUP BY "serviceType";

-- View for daily cost tracking
CREATE OR REPLACE VIEW "ai_daily_cost_summary" AS
SELECT 
    DATE("createdAt") as "date",
    "serviceType",
    SUM("cost") as "dailyCost",
    COUNT(*) as "requestCount",
    SUM("tokensUsed") as "totalTokens"
FROM "ai_cost_tracking"
GROUP BY DATE("createdAt"), "serviceType"
ORDER BY "date" DESC, "dailyCost" DESC;

-- View for review queue summary
CREATE OR REPLACE VIEW "ai_review_queue_summary" AS
SELECT 
    "serviceType",
    "status",
    "priority",
    COUNT(*) as "itemCount",
    AVG("confidence") as "avgConfidence",
    MIN("createdAt") as "oldestItem",
    MAX("createdAt") as "newestItem"
FROM "ai_review_queue"
GROUP BY "serviceType", "status", "priority";

-- View for quality metrics summary
CREATE OR REPLACE VIEW "ai_quality_summary" AS
SELECT 
    "serviceType",
    COUNT(*) as "totalEvaluations",
    AVG("accuracyScore") as "avgAccuracy",
    AVG("confidenceScore") as "avgConfidence",
    AVG("humanAgreementScore") as "avgHumanAgreement",
    AVG("theologicalAlignmentScore") as "avgTheologicalAlignment",
    AVG("responseTimeMs") as "avgResponseTime"
FROM "ai_quality_metrics"
GROUP BY "serviceType";

-- ============================================================================
-- CREATE FUNCTIONS FOR DATA CLEANUP
-- ============================================================================

-- Function to clean up old AI data based on retention policies
CREATE OR REPLACE FUNCTION cleanup_ai_data()
RETURNS TABLE(
    data_type TEXT,
    records_deleted BIGINT
) AS $$
DECLARE
    retention_record RECORD;
    deleted_count BIGINT;
BEGIN
    FOR retention_record IN 
        SELECT "dataType", "retentionDays" 
        FROM "ai_data_retention"
    LOOP
        CASE retention_record."dataType"
            WHEN 'ai_conversations' THEN
                DELETE FROM "ai_conversations"
                WHERE "endedAt" < NOW() - (retention_record."retentionDays" || ' days')::INTERVAL;
                GET DIAGNOSTICS deleted_count = ROW_COUNT;
                
            WHEN 'ai_audit_logs' THEN
                DELETE FROM "ai_audit_logs"
                WHERE "createdAt" < NOW() - (retention_record."retentionDays" || ' days')::INTERVAL;
                GET DIAGNOSTICS deleted_count = ROW_COUNT;
                
            WHEN 'ai_service_requests' THEN
                DELETE FROM "ai_service_requests"
                WHERE "createdAt" < NOW() - (retention_record."retentionDays" || ' days')::INTERVAL
                AND "status" IN ('completed', 'failed');
                GET DIAGNOSTICS deleted_count = ROW_COUNT;
                
            WHEN 'ai_cost_tracking' THEN
                DELETE FROM "ai_cost_tracking"
                WHERE "createdAt" < NOW() - (retention_record."retentionDays" || ' days')::INTERVAL;
                GET DIAGNOSTICS deleted_count = ROW_COUNT;
                
            WHEN 'ai_quality_metrics' THEN
                DELETE FROM "ai_quality_metrics"
                WHERE "createdAt" < NOW() - (retention_record."retentionDays" || ' days')::INTERVAL;
                GET DIAGNOSTICS deleted_count = ROW_COUNT;
                
            WHEN 'ai_rate_limits' THEN
                DELETE FROM "ai_rate_limits"
                WHERE "windowEnd" < NOW() - (retention_record."retentionDays" || ' days')::INTERVAL;
                GET DIAGNOSTICS deleted_count = ROW_COUNT;
                
            WHEN 'ai_review_queue' THEN
                DELETE FROM "ai_review_queue"
                WHERE "reviewedAt" < NOW() - (retention_record."retentionDays" || ' days')::INTERVAL
                AND "status" = 'completed';
                GET DIAGNOSTICS deleted_count = ROW_COUNT;
                
            ELSE
                deleted_count := 0;
        END CASE;
        
        -- Update last cleanup timestamp
        UPDATE "ai_data_retention"
        SET "lastCleanupAt" = NOW()
        WHERE "dataType" = retention_record."dataType";
        
        -- Return results
        data_type := retention_record."dataType";
        records_deleted := deleted_count;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE "ai_service_requests" IS 'Tracks all AI service requests with comprehensive audit trail';
COMMENT ON TABLE "ai_conversations" IS 'Stores conversation histories for chatbot and support services';
COMMENT ON TABLE "ai_generated_content" IS 'Tracks all AI-generated content with review workflow';
COMMENT ON TABLE "ai_audit_logs" IS 'Comprehensive audit trail for all AI operations';
COMMENT ON TABLE "ai_service_metrics" IS 'Performance and quality metrics for AI services';
COMMENT ON TABLE "ai_cost_tracking" IS 'Detailed cost tracking for budget management';
COMMENT ON TABLE "ai_quality_metrics" IS 'Quality assurance metrics for AI outputs';
COMMENT ON TABLE "ai_rate_limits" IS 'Rate limiting for AI service usage';
COMMENT ON TABLE "ai_review_queue" IS 'Human review queue for low-confidence AI outputs';
COMMENT ON TABLE "ai_data_retention" IS 'Data retention policies for GDPR/FERPA compliance';
COMMENT ON TABLE "ai_service_config" IS 'Configuration settings for each AI service';

-- Migration complete
