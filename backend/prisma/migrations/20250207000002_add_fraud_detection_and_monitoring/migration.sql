-- ScrollUniversity Admissions - Fraud Detection and Monitoring Migration
-- "Many are called, but few are chosen" - Matthew 22:14

-- Create activity type enum for suspicious activity monitoring
CREATE TYPE "ActivityType" AS ENUM (
  'RAPID_SUBMISSIONS',
  'DUPLICATE_DOCUMENTS',
  'FAILED_VERIFICATIONS',
  'SUSPICIOUS_IP',
  'BEHAVIORAL_ANOMALY',
  'IDENTITY_MISMATCH',
  'DOCUMENT_TAMPERING',
  'AUTOMATED_BEHAVIOR',
  'LOCATION_INCONSISTENCY',
  'TIME_PATTERN_ANOMALY'
);

-- Create severity level enum
CREATE TYPE "SeverityLevel" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
);

-- Create verification component status enum
CREATE TYPE "VerificationComponentStatus" AS ENUM (
  'PASSED',
  'FAILED',
  'PARTIAL',
  'PENDING'
);

-- Create verification level enum
CREATE TYPE "VerificationLevel" AS ENUM (
  'BASIC',
  'ENHANCED',
  'COMPREHENSIVE'
);

-- Create background clearance enum
CREATE TYPE "BackgroundClearance" AS ENUM (
  'CLEAR',
  'CONDITIONAL',
  'FLAGGED',
  'REJECTED'
);

-- Create alert status enum
CREATE TYPE "AlertStatus" AS ENUM (
  'PENDING',
  'ACKNOWLEDGED',
  'INVESTIGATING',
  'RESOLVED'
);

-- Create investigation status enum
CREATE TYPE "InvestigationStatus" AS ENUM (
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CLOSED'
);

-- Create block status enum
CREATE TYPE "BlockStatus" AS ENUM (
  'ACTIVE',
  'SUSPENDED',
  'LIFTED'
);

-- Extend document_verifications table with additional fraud detection fields
ALTER TABLE "document_verifications" ADD COLUMN "fileHash" TEXT;
ALTER TABLE "document_verifications" ADD COLUMN "confidence" DOUBLE PRECISION;
ALTER TABLE "document_verifications" ADD COLUMN "flags" JSONB DEFAULT '[]';
ALTER TABLE "document_verifications" ADD COLUMN "metadata" JSONB DEFAULT '{}';
ALTER TABLE "document_verifications" ADD COLUMN "recommendations" JSONB DEFAULT '[]';

-- Create document verification log table for detailed tracking
CREATE TABLE "document_verification_log" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "isAuthentic" BOOLEAN NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "verificationScore" DOUBLE PRECISION NOT NULL,
    "flags" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_verification_log_pkey" PRIMARY KEY ("id")
);

-- Create identity verification log table
CREATE TABLE "identity_verification_log" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "flags" JSONB NOT NULL DEFAULT '[]',
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "identity_verification_log_pkey" PRIMARY KEY ("id")
);

-- Create identity verification result table
CREATE TABLE "identity_verification_result" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL,
    "verificationLevel" "VerificationLevel" NOT NULL,
    "overallConfidence" DOUBLE PRECISION NOT NULL,
    "verificationComponents" JSONB NOT NULL DEFAULT '[]',
    "riskFactors" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "backgroundCheckResults" JSONB,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "identity_verification_result_pkey" PRIMARY KEY ("id")
);

-- Create fraud analysis log table
CREATE TABLE "fraud_analysis_log" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "overallRiskScore" DOUBLE PRECISION NOT NULL,
    "riskLevel" "SeverityLevel" NOT NULL,
    "detectedPatterns" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "requiresManualReview" BOOLEAN NOT NULL DEFAULT false,
    "autoReject" BOOLEAN NOT NULL DEFAULT false,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_analysis_log_pkey" PRIMARY KEY ("id")
);

-- Create fraud alert table
CREATE TABLE "fraud_alert" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "riskLevel" "SeverityLevel" NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "alertType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_alert_pkey" PRIMARY KEY ("id")
);

-- Create suspicious activity table
CREATE TABLE "suspicious_activity" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "severity" "SeverityLevel" NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "riskScore" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "investigatorId" TEXT,
    "resolution" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suspicious_activity_pkey" PRIMARY KEY ("id")
);

-- Create suspicious activity alert table (legacy support)
CREATE TABLE "suspicious_activity_alert" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "SeverityLevel" NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suspicious_activity_alert_pkey" PRIMARY KEY ("id")
);

-- Create monitoring alert table
CREATE TABLE "monitoring_alert" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "alertType" "ActivityType" NOT NULL,
    "severity" "SeverityLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "recommendedActions" JSONB NOT NULL DEFAULT '[]',
    "status" "AlertStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,

    CONSTRAINT "monitoring_alert_pkey" PRIMARY KEY ("id")
);

-- Create applicant block table
CREATE TABLE "applicant_block" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "blockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "status" "BlockStatus" NOT NULL DEFAULT 'ACTIVE',
    "blockedBy" TEXT,
    "liftedAt" TIMESTAMP(3),
    "liftedBy" TEXT,

    CONSTRAINT "applicant_block_pkey" PRIMARY KEY ("id")
);

-- Create investigation case table
CREATE TABLE "investigation_case" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "caseType" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "status" "InvestigationStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assignedTo" TEXT,
    "findings" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investigation_case_pkey" PRIMARY KEY ("id")
);

-- Create user session table for behavioral tracking
CREATE TABLE "user_session" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "deviceFingerprint" TEXT,
    "sessionDuration" INTEGER,
    "activityLevel" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "user_session_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "document_verification_log_applicantId_idx" ON "document_verification_log"("applicantId");
CREATE INDEX "document_verification_log_verifiedAt_idx" ON "document_verification_log"("verifiedAt");
CREATE INDEX "document_verification_log_isAuthentic_idx" ON "document_verification_log"("isAuthentic");

CREATE INDEX "identity_verification_log_applicantId_idx" ON "identity_verification_log"("applicantId");
CREATE INDEX "identity_verification_log_verifiedAt_idx" ON "identity_verification_log"("verifiedAt");

CREATE INDEX "identity_verification_result_applicantId_idx" ON "identity_verification_result"("applicantId");
CREATE INDEX "identity_verification_result_verifiedAt_idx" ON "identity_verification_result"("verifiedAt");

CREATE INDEX "fraud_analysis_log_applicantId_idx" ON "fraud_analysis_log"("applicantId");
CREATE INDEX "fraud_analysis_log_riskLevel_idx" ON "fraud_analysis_log"("riskLevel");
CREATE INDEX "fraud_analysis_log_analyzedAt_idx" ON "fraud_analysis_log"("analyzedAt");

CREATE INDEX "fraud_alert_applicantId_idx" ON "fraud_alert"("applicantId");
CREATE INDEX "fraud_alert_riskLevel_idx" ON "fraud_alert"("riskLevel");
CREATE INDEX "fraud_alert_createdAt_idx" ON "fraud_alert"("createdAt");

CREATE INDEX "suspicious_activity_applicantId_idx" ON "suspicious_activity"("applicantId");
CREATE INDEX "suspicious_activity_activityType_idx" ON "suspicious_activity"("activityType");
CREATE INDEX "suspicious_activity_severity_idx" ON "suspicious_activity"("severity");
CREATE INDEX "suspicious_activity_detectedAt_idx" ON "suspicious_activity"("detectedAt");

CREATE INDEX "suspicious_activity_alert_applicantId_idx" ON "suspicious_activity_alert"("applicantId");
CREATE INDEX "suspicious_activity_alert_type_idx" ON "suspicious_activity_alert"("type");
CREATE INDEX "suspicious_activity_alert_createdAt_idx" ON "suspicious_activity_alert"("createdAt");

CREATE INDEX "monitoring_alert_applicantId_idx" ON "monitoring_alert"("applicantId");
CREATE INDEX "monitoring_alert_alertType_idx" ON "monitoring_alert"("alertType");
CREATE INDEX "monitoring_alert_status_idx" ON "monitoring_alert"("status");
CREATE INDEX "monitoring_alert_createdAt_idx" ON "monitoring_alert"("createdAt");

CREATE INDEX "applicant_block_applicantId_idx" ON "applicant_block"("applicantId");
CREATE INDEX "applicant_block_status_idx" ON "applicant_block"("status");
CREATE INDEX "applicant_block_blockedAt_idx" ON "applicant_block"("blockedAt");

CREATE INDEX "investigation_case_applicantId_idx" ON "investigation_case"("applicantId");
CREATE INDEX "investigation_case_status_idx" ON "investigation_case"("status");
CREATE INDEX "investigation_case_priority_idx" ON "investigation_case"("priority");
CREATE INDEX "investigation_case_createdAt_idx" ON "investigation_case"("createdAt");

CREATE INDEX "user_session_applicantId_idx" ON "user_session"("applicantId");
CREATE INDEX "user_session_sessionId_idx" ON "user_session"("sessionId");
CREATE INDEX "user_session_createdAt_idx" ON "user_session"("createdAt");

-- Add foreign key constraints
ALTER TABLE "document_verification_log" ADD CONSTRAINT "document_verification_log_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "identity_verification_log" ADD CONSTRAINT "identity_verification_log_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "identity_verification_result" ADD CONSTRAINT "identity_verification_result_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fraud_analysis_log" ADD CONSTRAINT "fraud_analysis_log_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fraud_alert" ADD CONSTRAINT "fraud_alert_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "suspicious_activity" ADD CONSTRAINT "suspicious_activity_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "suspicious_activity_alert" ADD CONSTRAINT "suspicious_activity_alert_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "monitoring_alert" ADD CONSTRAINT "monitoring_alert_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "applicant_block" ADD CONSTRAINT "applicant_block_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "investigation_case" ADD CONSTRAINT "investigation_case_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;