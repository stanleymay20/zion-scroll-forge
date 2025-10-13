-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('bug', 'suggestion', 'general', 'usability');

-- CreateEnum
CREATE TYPE "FeedbackPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "admissions_feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "FeedbackType" NOT NULL,
    "rating" INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
    "category" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "current_step" INTEGER,
    "user_agent" VARCHAR(500) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "user_id" UUID,
    "application_id" UUID,
    "ip_address" INET,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "priority" "FeedbackPriority" NOT NULL DEFAULT 'MEDIUM',
    "resolution" TEXT,
    "resolved_by" VARCHAR(100),
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admissions_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admissions_feedback_type_idx" ON "admissions_feedback"("type");

-- CreateIndex
CREATE INDEX "admissions_feedback_rating_idx" ON "admissions_feedback"("rating");

-- CreateIndex
CREATE INDEX "admissions_feedback_category_idx" ON "admissions_feedback"("category");

-- CreateIndex
CREATE INDEX "admissions_feedback_current_step_idx" ON "admissions_feedback"("current_step");

-- CreateIndex
CREATE INDEX "admissions_feedback_timestamp_idx" ON "admissions_feedback"("timestamp");

-- CreateIndex
CREATE INDEX "admissions_feedback_user_id_idx" ON "admissions_feedback"("user_id");

-- CreateIndex
CREATE INDEX "admissions_feedback_application_id_idx" ON "admissions_feedback"("application_id");

-- CreateIndex
CREATE INDEX "admissions_feedback_resolved_idx" ON "admissions_feedback"("resolved");

-- CreateIndex
CREATE INDEX "admissions_feedback_priority_idx" ON "admissions_feedback"("priority");

-- CreateIndex
CREATE INDEX "admissions_feedback_created_at_idx" ON "admissions_feedback"("created_at");

-- Add foreign key constraints if users and applications tables exist
-- ALTER TABLE "admissions_feedback" ADD CONSTRAINT "admissions_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- ALTER TABLE "admissions_feedback" ADD CONSTRAINT "admissions_feedback_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admissions_feedback_updated_at 
    BEFORE UPDATE ON admissions_feedback 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();