-- ScrollUniversity Admissions System Migration
-- "Many are called, but few are chosen" - Matthew 22:14

-- Add new user roles for admissions
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ADMISSIONS_OFFICER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ADMISSIONS_COMMITTEE';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'INTERVIEWER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SPIRITUAL_EVALUATOR';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ACADEMIC_ASSESSOR';

-- Create application status enum
CREATE TYPE "ApplicationStatus" AS ENUM (
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSESSMENT_PENDING',
  'INTERVIEW_SCHEDULED',
  'DECISION_PENDING',
  'ACCEPTED',
  'REJECTED',
  'WAITLISTED',
  'DEFERRED',
  'WITHDRAWN'
);

-- Create program type enum
CREATE TYPE "ProgramType" AS ENUM (
  'SCROLL_OPEN',
  'SCROLL_STARTER',
  'SCROLL_DEGREE',
  'SCROLL_DOCTORATE',
  'SCROLL_SCHOLARSHIP',
  'DSGEI_PROGRAM'
);

-- Create admission decision type enum
CREATE TYPE "AdmissionDecisionType" AS ENUM (
  'ACCEPTED',
  'REJECTED',
  'WAITLISTED',
  'DEFERRED',
  'CONDITIONAL_ACCEPTANCE'
);

-- Create eligibility status enum
CREATE TYPE "EligibilityStatus" AS ENUM (
  'ELIGIBLE',
  'CONDITIONALLY_ELIGIBLE',
  'INELIGIBLE',
  'PENDING_REVIEW'
);

-- Create evaluator type enum
CREATE TYPE "EvaluatorType" AS ENUM (
  'AI_ASSESSMENT',
  'HUMAN_EVALUATOR',
  'SCROLL_ELDER',
  'PROPHET_REVIEW',
  'COMMITTEE_REVIEW'
);

-- Create maturity level enum
CREATE TYPE "MaturityLevel" AS ENUM (
  'SEEKER',
  'NEW_BELIEVER',
  'GROWING',
  'MATURE',
  'ELDER',
  'PROPHET'
);

-- Create interview type enum
CREATE TYPE "InterviewType" AS ENUM (
  'INITIAL_SCREENING',
  'ACADEMIC_ASSESSMENT',
  'SPIRITUAL_EVALUATION',
  'CHARACTER_INTERVIEW',
  'FINAL_INTERVIEW',
  'COMMITTEE_INTERVIEW'
);

-- Create interview format enum
CREATE TYPE "InterviewFormat" AS ENUM (
  'VIDEO_CONFERENCE',
  'PHONE_CALL',
  'IN_PERSON',
  'ASYNCHRONOUS_VIDEO'
);

-- Create recommendation type enum
CREATE TYPE "RecommendationType" AS ENUM (
  'STRONG_RECOMMEND',
  'RECOMMEND',
  'NEUTRAL',
  'NOT_RECOMMEND',
  'STRONG_NOT_RECOMMEND'
);

-- Create interview status enum
CREATE TYPE "InterviewStatus" AS ENUM (
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'RESCHEDULED',
  'NO_SHOW'
);

-- Create appeal decision type enum
CREATE TYPE "AppealDecisionType" AS ENUM (
  'UPHELD',
  'OVERTURNED',
  'MODIFIED',
  'REFERRED_BACK'
);

-- Create appeal status enum
CREATE TYPE "AppealStatus" AS ENUM (
  'SUBMITTED',
  'UNDER_REVIEW',
  'DECIDED',
  'CLOSED'
);

-- Create waitlist priority enum
CREATE TYPE "WaitlistPriority" AS ENUM (
  'HIGH',
  'STANDARD',
  'LOW'
);

-- Create waitlist status enum
CREATE TYPE "WaitlistStatus" AS ENUM (
  'ACTIVE',
  'OFFERED_ADMISSION',
  'DECLINED',
  'EXPIRED',
  'REMOVED'
);

-- Create document type enum
CREATE TYPE "DocumentType" AS ENUM (
  'TRANSCRIPT',
  'DIPLOMA',
  'CERTIFICATE',
  'IDENTITY_DOCUMENT',
  'RECOMMENDATION_LETTER',
  'PORTFOLIO',
  'ESSAY',
  'PERSONAL_STATEMENT'
);

-- Create fraud risk level enum
CREATE TYPE "FraudRiskLevel" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
);

-- Create analytics report type enum
CREATE TYPE "AnalyticsReportType" AS ENUM (
  'DAILY_SUMMARY',
  'WEEKLY_REPORT',
  'MONTHLY_ANALYSIS',
  'QUARTERLY_REVIEW',
  'ANNUAL_REPORT',
  'CUSTOM_REPORT'
);

-- Create config category enum
CREATE TYPE "ConfigCategory" AS ENUM (
  'APPLICATION_SETTINGS',
  'ASSESSMENT_CRITERIA',
  'INTERVIEW_CONFIGURATION',
  'DECISION_PARAMETERS',
  'NOTIFICATION_SETTINGS',
  'SYSTEM_PARAMETERS'
);

-- Create applications table
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "programApplied" "ProgramType" NOT NULL,
    "intendedStartDate" TIMESTAMP(3) NOT NULL,
    "personalStatement" TEXT,
    "academicHistory" JSONB NOT NULL DEFAULT '[]',
    "spiritualTestimony" TEXT,
    "characterReferences" JSONB NOT NULL DEFAULT '[]',
    "documents" JSONB NOT NULL DEFAULT '[]',
    "eligibilityResult" JSONB,
    "spiritualEvaluation" JSONB,
    "academicEvaluation" JSONB,
    "interviewResults" JSONB NOT NULL DEFAULT '[]',
    "admissionDecision" "AdmissionDecisionType",
    "decisionDate" TIMESTAMP(3),
    "decisionReasoning" JSONB,
    "enrollmentDeadline" TIMESTAMP(3),
    "applicationTimeline" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- Create eligibility assessments table
CREATE TABLE "eligibility_assessments" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "basicRequirements" JSONB NOT NULL DEFAULT '{}',
    "academicPrerequisites" JSONB NOT NULL DEFAULT '{}',
    "languageProficiency" JSONB NOT NULL DEFAULT '{}',
    "technicalRequirements" JSONB NOT NULL DEFAULT '{}',
    "accessibilityNeeds" JSONB NOT NULL DEFAULT '{}',
    "globalCompliance" JSONB NOT NULL DEFAULT '{}',
    "overallEligibility" "EligibilityStatus" NOT NULL,
    "assessmentNotes" TEXT,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eligibility_assessments_pkey" PRIMARY KEY ("id")
);

-- Create spiritual evaluations table
CREATE TABLE "spiritual_evaluations" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "evaluatorId" TEXT,
    "evaluatorType" "EvaluatorType" NOT NULL DEFAULT 'AI_ASSESSMENT',
    "personalTestimony" JSONB NOT NULL DEFAULT '{}',
    "spiritualMaturity" "MaturityLevel" NOT NULL,
    "characterTraits" JSONB NOT NULL DEFAULT '[]',
    "ministryExperience" JSONB NOT NULL DEFAULT '[]',
    "callingClarity" JSONB NOT NULL DEFAULT '{}',
    "scrollAlignment" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "kingdomVision" TEXT,
    "spiritualRecommendations" JSONB NOT NULL DEFAULT '[]',
    "propheticInput" JSONB,
    "elderReview" JSONB,
    "authenticityScore" DOUBLE PRECISION,
    "clarityScore" DOUBLE PRECISION,
    "depthScore" DOUBLE PRECISION,
    "transformationScore" DOUBLE PRECISION,
    "kingdomFocusScore" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spiritual_evaluations_pkey" PRIMARY KEY ("id")
);

-- Create academic evaluations table
CREATE TABLE "academic_evaluations" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "evaluatorId" TEXT,
    "previousEducation" JSONB NOT NULL DEFAULT '[]',
    "academicPerformance" JSONB NOT NULL DEFAULT '{}',
    "coreSkills" JSONB NOT NULL DEFAULT '[]',
    "learningPotential" DOUBLE PRECISION,
    "intellectualCapacity" JSONB NOT NULL DEFAULT '{}',
    "recommendedLevel" "AcademicLevel" NOT NULL,
    "supportNeeds" JSONB NOT NULL DEFAULT '[]',
    "remedialRequirements" JSONB NOT NULL DEFAULT '[]',
    "academicReadiness" DOUBLE PRECISION,
    "skillProficiency" JSONB NOT NULL DEFAULT '{}',
    "potentialScore" DOUBLE PRECISION,
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_evaluations_pkey" PRIMARY KEY ("id")
);

-- Create interview records table
CREATE TABLE "interview_records" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "interviewType" "InterviewType" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "interviewerId" TEXT,
    "interviewerName" TEXT,
    "format" "InterviewFormat" NOT NULL,
    "duration" INTEGER NOT NULL,
    "platform" TEXT,
    "meetingUrl" TEXT,
    "communicationScore" DOUBLE PRECISION,
    "spiritualMaturityScore" DOUBLE PRECISION,
    "academicReadinessScore" DOUBLE PRECISION,
    "characterScore" DOUBLE PRECISION,
    "motivationScore" DOUBLE PRECISION,
    "culturalFitScore" DOUBLE PRECISION,
    "overallRecommendation" "RecommendationType",
    "interviewNotes" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "recordingUrl" TEXT,
    "transcriptUrl" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conductedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_records_pkey" PRIMARY KEY ("id")
);

-- Create admission decisions table
CREATE TABLE "admission_decisions" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "decision" "AdmissionDecisionType" NOT NULL,
    "decisionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decisionMakers" JSONB NOT NULL DEFAULT '[]',
    "committeeVotes" JSONB,
    "strengths" JSONB NOT NULL DEFAULT '[]',
    "concerns" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "overallAssessment" TEXT,
    "futureConsiderations" JSONB NOT NULL DEFAULT '[]',
    "admissionConditions" JSONB NOT NULL DEFAULT '[]',
    "enrollmentDeadline" TIMESTAMP(3),
    "appealEligible" BOOLEAN NOT NULL DEFAULT true,
    "appealDeadline" TIMESTAMP(3),
    "nextSteps" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_decisions_pkey" PRIMARY KEY ("id")
);

-- Create appeal records table
CREATE TABLE "appeal_records" (
    "id" TEXT NOT NULL,
    "decisionId" TEXT NOT NULL,
    "appealReason" TEXT NOT NULL,
    "supportingDocuments" JSONB NOT NULL DEFAULT '[]',
    "reviewerId" TEXT,
    "reviewNotes" TEXT,
    "appealDecision" "AppealDecisionType",
    "appealDecisionReason" TEXT,
    "status" "AppealStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appeal_records_pkey" PRIMARY KEY ("id")
);

-- Create waitlist entries table
CREATE TABLE "waitlist_entries" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "programType" "ProgramType" NOT NULL,
    "position" INTEGER NOT NULL,
    "priority" "WaitlistPriority" NOT NULL DEFAULT 'STANDARD',
    "estimatedAdmissionDate" TIMESTAMP(3),
    "probabilityScore" DOUBLE PRECISION,
    "lastContactDate" TIMESTAMP(3),
    "responseDeadline" TIMESTAMP(3),
    "status" "WaitlistStatus" NOT NULL DEFAULT 'ACTIVE',
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- Create document verifications table
CREATE TABLE "document_verifications" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "isAuthentic" BOOLEAN,
    "verificationMethod" TEXT,
    "verificationScore" DOUBLE PRECISION,
    "fraudRiskLevel" "FraudRiskLevel",
    "verifiedBy" TEXT,
    "verificationNotes" TEXT,
    "flaggedIssues" JSONB NOT NULL DEFAULT '[]',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_verifications_pkey" PRIMARY KEY ("id")
);

-- Create admissions analytics table
CREATE TABLE "admissions_analytics" (
    "id" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportType" "AnalyticsReportType" NOT NULL,
    "totalApplications" INTEGER NOT NULL DEFAULT 0,
    "acceptanceRate" DOUBLE PRECISION,
    "yieldRate" DOUBLE PRECISION,
    "demographicBreakdown" JSONB NOT NULL DEFAULT '{}',
    "geographicDistribution" JSONB NOT NULL DEFAULT '{}',
    "averageScores" JSONB NOT NULL DEFAULT '{}',
    "assessmentTrends" JSONB NOT NULL DEFAULT '{}',
    "processEfficiency" JSONB NOT NULL DEFAULT '{}',
    "bottleneckAnalysis" JSONB NOT NULL DEFAULT '{}',
    "enrollmentForecast" JSONB,
    "successPredictions" JSONB,
    "reportData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admissions_analytics_pkey" PRIMARY KEY ("id")
);

-- Create admissions configuration table
CREATE TABLE "admissions_configuration" (
    "id" TEXT NOT NULL,
    "configKey" TEXT NOT NULL,
    "configValue" JSONB NOT NULL,
    "description" TEXT,
    "category" "ConfigCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admissions_configuration_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "eligibility_assessments_applicationId_key" ON "eligibility_assessments"("applicationId");
CREATE UNIQUE INDEX "waitlist_entries_applicationId_key" ON "waitlist_entries"("applicationId");
CREATE UNIQUE INDEX "admissions_configuration_configKey_key" ON "admissions_configuration"("configKey");

-- Create foreign key constraints
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "eligibility_assessments" ADD CONSTRAINT "eligibility_assessments_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "spiritual_evaluations" ADD CONSTRAINT "spiritual_evaluations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "academic_evaluations" ADD CONSTRAINT "academic_evaluations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "interview_records" ADD CONSTRAINT "interview_records_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "admission_decisions" ADD CONSTRAINT "admission_decisions_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "appeal_records" ADD CONSTRAINT "appeal_records_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "admission_decisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create indexes for performance
CREATE INDEX "applications_applicantId_idx" ON "applications"("applicantId");
CREATE INDEX "applications_status_idx" ON "applications"("status");
CREATE INDEX "applications_programApplied_idx" ON "applications"("programApplied");
CREATE INDEX "applications_submissionDate_idx" ON "applications"("submissionDate");
CREATE INDEX "spiritual_evaluations_applicationId_idx" ON "spiritual_evaluations"("applicationId");
CREATE INDEX "academic_evaluations_applicationId_idx" ON "academic_evaluations"("applicationId");
CREATE INDEX "interview_records_applicationId_idx" ON "interview_records"("applicationId");
CREATE INDEX "interview_records_scheduledDate_idx" ON "interview_records"("scheduledDate");
CREATE INDEX "admission_decisions_applicationId_idx" ON "admission_decisions"("applicationId");
CREATE INDEX "admission_decisions_decisionDate_idx" ON "admission_decisions"("decisionDate");
CREATE INDEX "waitlist_entries_programType_idx" ON "waitlist_entries"("programType");
CREATE INDEX "waitlist_entries_position_idx" ON "waitlist_entries"("position");
CREATE INDEX "document_verifications_applicationId_idx" ON "document_verifications"("applicationId");
CREATE INDEX "admissions_analytics_reportType_idx" ON "admissions_analytics"("reportType");
CREATE INDEX "admissions_analytics_reportDate_idx" ON "admissions_analytics"("reportDate");
CREATE INDEX "admissions_configuration_category_idx" ON "admissions_configuration"("category");
CREATE INDEX "admissions_configuration_isActive_idx" ON "admissions_configuration"("isActive");