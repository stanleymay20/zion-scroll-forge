-- Scholarship Management System Migration
-- "The Lord is my shepherd; I shall not want" - Psalm 23:1

-- Create Scholarship table
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "total_funding" DECIMAL(12,2) NOT NULL,
    "remaining_funding" DECIMAL(12,2) NOT NULL,
    "max_recipients" INTEGER NOT NULL,
    "current_recipients" INTEGER NOT NULL DEFAULT 0,
    "eligibility_criteria" JSONB NOT NULL,
    "application_deadline" TIMESTAMP NOT NULL,
    "award_date" TIMESTAMP NOT NULL,
    "disbursement_schedule" JSONB,
    "renewal_eligible" BOOLEAN NOT NULL DEFAULT false,
    "renewal_criteria" JSONB,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Scholarship_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create ScholarshipApplication table
CREATE TABLE "ScholarshipApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scholarship_id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP,
    "reviewed_at" TIMESTAMP,
    "reviewed_by_id" TEXT,
    "review_notes" TEXT,
    "application_data" JSONB NOT NULL,
    "eligibility_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "award_amount" DECIMAL(10,2),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScholarshipApplication_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "Scholarship"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScholarshipApplication_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScholarshipApplication_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create ApplicationDocument table
CREATE TABLE "ApplicationDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "application_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP,
    "verified_by_id" TEXT,
    CONSTRAINT "ApplicationDocument_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "ScholarshipApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApplicationDocument_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create ScholarshipDisbursement table
CREATE TABLE "ScholarshipDisbursement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scholarship_id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "scheduled_date" TIMESTAMP NOT NULL,
    "actual_date" TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "method" TEXT NOT NULL,
    "transaction_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScholarshipDisbursement_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "Scholarship"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScholarshipDisbursement_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "ScholarshipApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScholarshipDisbursement_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create ScholarshipNotification table
CREATE TABLE "ScholarshipNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipient_id" TEXT NOT NULL,
    "scholarship_id" TEXT,
    "application_id" TEXT,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "channels" TEXT[] NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP,
    "scheduled_at" TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScholarshipNotification_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScholarshipNotification_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "Scholarship"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ScholarshipNotification_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "ScholarshipApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX "Scholarship_status_idx" ON "Scholarship"("status");
CREATE INDEX "Scholarship_type_idx" ON "Scholarship"("type");
CREATE INDEX "Scholarship_application_deadline_idx" ON "Scholarship"("application_deadline");
CREATE INDEX "Scholarship_created_by_id_idx" ON "Scholarship"("created_by_id");

CREATE INDEX "ScholarshipApplication_scholarship_id_idx" ON "ScholarshipApplication"("scholarship_id");
CREATE INDEX "ScholarshipApplication_applicant_id_idx" ON "ScholarshipApplication"("applicant_id");
CREATE INDEX "ScholarshipApplication_status_idx" ON "ScholarshipApplication"("status");
CREATE INDEX "ScholarshipApplication_reviewed_by_id_idx" ON "ScholarshipApplication"("reviewed_by_id");
CREATE INDEX "ScholarshipApplication_eligibility_score_idx" ON "ScholarshipApplication"("eligibility_score");

CREATE INDEX "ApplicationDocument_application_id_idx" ON "ApplicationDocument"("application_id");
CREATE INDEX "ApplicationDocument_verified_idx" ON "ApplicationDocument"("verified");

CREATE INDEX "ScholarshipDisbursement_scholarship_id_idx" ON "ScholarshipDisbursement"("scholarship_id");
CREATE INDEX "ScholarshipDisbursement_application_id_idx" ON "ScholarshipDisbursement"("application_id");
CREATE INDEX "ScholarshipDisbursement_recipient_id_idx" ON "ScholarshipDisbursement"("recipient_id");
CREATE INDEX "ScholarshipDisbursement_status_idx" ON "ScholarshipDisbursement"("status");
CREATE INDEX "ScholarshipDisbursement_scheduled_date_idx" ON "ScholarshipDisbursement"("scheduled_date");

CREATE INDEX "ScholarshipNotification_recipient_id_idx" ON "ScholarshipNotification"("recipient_id");
CREATE INDEX "ScholarshipNotification_scholarship_id_idx" ON "ScholarshipNotification"("scholarship_id");
CREATE INDEX "ScholarshipNotification_application_id_idx" ON "ScholarshipNotification"("application_id");
CREATE INDEX "ScholarshipNotification_sent_idx" ON "ScholarshipNotification"("sent");
CREATE INDEX "ScholarshipNotification_read_idx" ON "ScholarshipNotification"("read");

-- Create unique constraint to prevent duplicate applications
CREATE UNIQUE INDEX "ScholarshipApplication_scholarship_applicant_unique" ON "ScholarshipApplication"("scholarship_id", "applicant_id");

-- Add comments for documentation
COMMENT ON TABLE "Scholarship" IS 'Scholarship opportunities for students';
COMMENT ON TABLE "ScholarshipApplication" IS 'Student applications for scholarships';
COMMENT ON TABLE "ApplicationDocument" IS 'Supporting documents for scholarship applications';
COMMENT ON TABLE "ScholarshipDisbursement" IS 'Scholarship payment disbursements';
COMMENT ON TABLE "ScholarshipNotification" IS 'Notifications related to scholarships and applications';
