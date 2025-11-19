-- Quality Assurance System Migration
-- Adds tables for test datasets, quality metrics, theological alignment, and review workflows

-- Test Cases Table
CREATE TABLE IF NOT EXISTS "AITestCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceType" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "expectedOutput" JSONB NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Ground Truth Datasets Table
CREATE TABLE IF NOT EXISTS "AIGroundTruthDataset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceType" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "testCaseIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Test Results Table
CREATE TABLE IF NOT EXISTS "AITestResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testCaseId" TEXT NOT NULL,
    "actualOutput" JSONB NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "errors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AITestResult_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "AITestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Quality Metrics Table
CREATE TABLE IF NOT EXISTS "AIQualityMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceType" TEXT NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "humanAgreement" DOUBLE PRECISION NOT NULL,
    "theologicalAlignment" DOUBLE PRECISION NOT NULL,
    "responseTime" DOUBLE PRECISION NOT NULL,
    "costPerRequest" DOUBLE PRECISION NOT NULL,
    "errorRate" DOUBLE PRECISION NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Theological Alignment Table
CREATE TABLE IF NOT EXISTS "AITheologicalAlignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "concerns" JSONB NOT NULL DEFAULT '[]',
    "approved" BOOLEAN NOT NULL,
    "context" JSONB,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Review Workflow Table
CREATE TABLE IF NOT EXISTS "AIReviewWorkflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "assignedTo" TEXT,
    "submittedBy" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "outcome" JSONB,
    "feedback" TEXT,
    "metadata" JSONB DEFAULT '{}'
);

-- Review Feedback Table
CREATE TABLE IF NOT EXISTS "AIReviewFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "qualityScore" DOUBLE PRECISION,
    "feedback" TEXT NOT NULL,
    "changes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIReviewFeedback_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "AIReviewWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Improvements Table
CREATE TABLE IF NOT EXISTS "AIImprovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceType" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "implementedAt" TIMESTAMP(3) NOT NULL,
    "impactMetrics" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "AITestCase_serviceType_idx" ON "AITestCase"("serviceType");
CREATE INDEX IF NOT EXISTS "AITestCase_category_idx" ON "AITestCase"("category");
CREATE INDEX IF NOT EXISTS "AITestResult_testCaseId_idx" ON "AITestResult"("testCaseId");
CREATE INDEX IF NOT EXISTS "AITestResult_timestamp_idx" ON "AITestResult"("timestamp");
CREATE INDEX IF NOT EXISTS "AIQualityMetrics_serviceType_idx" ON "AIQualityMetrics"("serviceType");
CREATE INDEX IF NOT EXISTS "AIQualityMetrics_periodEnd_idx" ON "AIQualityMetrics"("periodEnd");
CREATE INDEX IF NOT EXISTS "AITheologicalAlignment_serviceType_idx" ON "AITheologicalAlignment"("serviceType");
CREATE INDEX IF NOT EXISTS "AITheologicalAlignment_approved_idx" ON "AITheologicalAlignment"("approved");
CREATE INDEX IF NOT EXISTS "AIReviewWorkflow_status_idx" ON "AIReviewWorkflow"("status");
CREATE INDEX IF NOT EXISTS "AIReviewWorkflow_assignedTo_idx" ON "AIReviewWorkflow"("assignedTo");
CREATE INDEX IF NOT EXISTS "AIReviewWorkflow_priority_idx" ON "AIReviewWorkflow"("priority");
CREATE INDEX IF NOT EXISTS "AIReviewWorkflow_serviceType_idx" ON "AIReviewWorkflow"("serviceType");
CREATE INDEX IF NOT EXISTS "AIReviewFeedback_serviceType_idx" ON "AIReviewFeedback"("serviceType");
CREATE INDEX IF NOT EXISTS "AIImprovement_serviceType_idx" ON "AIImprovement"("serviceType");
