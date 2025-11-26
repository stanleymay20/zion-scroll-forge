-- Degree Program System Migration
-- Implements complete academic degree infrastructure from Certificate to Doctorate

-- Create DegreeType enum
CREATE TYPE "DegreeType" AS ENUM (
  'CERTIFICATE',
  'DIPLOMA',
  'ASSOCIATE',
  'BACHELOR',
  'MASTER',
  'DOCTORATE'
);

-- Create RequirementCategory enum
CREATE TYPE "RequirementCategory" AS ENUM (
  'CORE',
  'MAJOR',
  'MINOR',
  'ELECTIVE',
  'SPIRITUAL_FORMATION',
  'CAPSTONE',
  'GENERAL_EDUCATION'
);

-- Create DegreeEnrollmentStatus enum
CREATE TYPE "DegreeEnrollmentStatus" AS ENUM (
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'WITHDRAWN',
  'DISMISSED'
);

-- Create HonorsLevel enum
CREATE TYPE "HonorsLevel" AS ENUM (
  'SUMMA_CUM_LAUDE',
  'MAGNA_CUM_LAUDE',
  'CUM_LAUDE',
  'NONE'
);

-- DegreeProgram table
CREATE TABLE "degree_programs" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL UNIQUE,
  "degree_type" "DegreeType" NOT NULL,
  "faculty_id" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "total_credits" INTEGER NOT NULL,
  "minimum_gpa" DECIMAL(3,2) NOT NULL DEFAULT 2.0,
  "estimated_duration_months" INTEGER NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "accreditation_status" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_degree_program_faculty" FOREIGN KEY ("faculty_id") 
    REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- DegreeRequirement table
CREATE TABLE "degree_requirements" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "degree_program_id" TEXT NOT NULL,
  "category" "RequirementCategory" NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "credit_hours" INTEGER NOT NULL,
  "required_courses" TEXT[],
  "elective_options" TEXT[],
  "minimum_grade" TEXT,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_degree_requirement_program" FOREIGN KEY ("degree_program_id") 
    REFERENCES "degree_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- DegreeEnrollment table
CREATE TABLE "degree_enrollments" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "degree_program_id" TEXT NOT NULL,
  "status" "DegreeEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
  "enrolled_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expected_graduation_date" TIMESTAMP,
  "actual_graduation_date" TIMESTAMP,
  "cumulative_gpa" DECIMAL(3,2),
  "credits_completed" INTEGER NOT NULL DEFAULT 0,
  "credits_in_progress" INTEGER NOT NULL DEFAULT 0,
  "academic_standing" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_degree_enrollment_program" FOREIGN KEY ("degree_program_id") 
    REFERENCES "degree_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "unique_user_degree_program" UNIQUE ("user_id", "degree_program_id")
);

-- DegreeRequirementProgress table
CREATE TABLE "degree_requirement_progress" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "degree_enrollment_id" TEXT NOT NULL,
  "degree_requirement_id" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "credits_completed" INTEGER NOT NULL DEFAULT 0,
  "completed_courses" TEXT[],
  "in_progress_courses" TEXT[],
  "completion_date" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_requirement_progress_enrollment" FOREIGN KEY ("degree_enrollment_id") 
    REFERENCES "degree_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_requirement_progress_requirement" FOREIGN KEY ("degree_requirement_id") 
    REFERENCES "degree_requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "unique_enrollment_requirement" UNIQUE ("degree_enrollment_id", "degree_requirement_id")
);

-- SpiritualFormationRequirement table
CREATE TABLE "spiritual_formation_requirements" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "degree_program_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "minimum_score" INTEGER,
  "required" BOOLEAN NOT NULL DEFAULT true,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_spiritual_requirement_program" FOREIGN KEY ("degree_program_id") 
    REFERENCES "degree_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- SpiritualFormationProgress table
CREATE TABLE "spiritual_formation_progress" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "degree_enrollment_id" TEXT NOT NULL,
  "spiritual_requirement_id" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "score" INTEGER,
  "completion_date" TIMESTAMP,
  "notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_spiritual_progress_enrollment" FOREIGN KEY ("degree_enrollment_id") 
    REFERENCES "degree_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "fk_spiritual_progress_requirement" FOREIGN KEY ("spiritual_requirement_id") 
    REFERENCES "spiritual_formation_requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "unique_enrollment_spiritual_requirement" UNIQUE ("degree_enrollment_id", "spiritual_requirement_id")
);

-- GraduationApplication table
CREATE TABLE "graduation_applications" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "degree_enrollment_id" TEXT NOT NULL,
  "application_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ceremony_date" TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "eligibility_checked" BOOLEAN NOT NULL DEFAULT false,
  "approved_by" TEXT,
  "approved_at" TIMESTAMP,
  "diploma_issued" BOOLEAN NOT NULL DEFAULT false,
  "diploma_issued_at" TIMESTAMP,
  "honors_level" "HonorsLevel" DEFAULT 'NONE',
  "notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_graduation_application_enrollment" FOREIGN KEY ("degree_enrollment_id") 
    REFERENCES "degree_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- OfficialTranscript table
CREATE TABLE "official_transcripts" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "degree_enrollment_id" TEXT,
  "transcript_type" TEXT NOT NULL DEFAULT 'OFFICIAL',
  "issued_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "issued_by" TEXT NOT NULL,
  "cumulative_gpa" DECIMAL(3,2) NOT NULL,
  "total_credits" INTEGER NOT NULL,
  "blockchain_hash" TEXT,
  "verification_url" TEXT,
  "pdf_url" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_transcript_enrollment" FOREIGN KEY ("degree_enrollment_id") 
    REFERENCES "degree_enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Diploma table
CREATE TABLE "diplomas" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "graduation_application_id" TEXT NOT NULL UNIQUE,
  "degree_enrollment_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "degree_title" TEXT NOT NULL,
  "degree_type" "DegreeType" NOT NULL,
  "faculty_name" TEXT NOT NULL,
  "graduation_date" TIMESTAMP NOT NULL,
  "final_gpa" DECIMAL(3,2) NOT NULL,
  "honors_level" "HonorsLevel" DEFAULT 'NONE',
  "blockchain_hash" TEXT,
  "ipfs_hash" TEXT,
  "verification_url" TEXT,
  "pdf_url" TEXT,
  "issued_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_diploma_graduation_application" FOREIGN KEY ("graduation_application_id") 
    REFERENCES "graduation_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "fk_diploma_enrollment" FOREIGN KEY ("degree_enrollment_id") 
    REFERENCES "degree_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX "idx_degree_program_faculty" ON "degree_programs"("faculty_id");
CREATE INDEX "idx_degree_program_type" ON "degree_programs"("degree_type");
CREATE INDEX "idx_degree_program_active" ON "degree_programs"("is_active");

CREATE INDEX "idx_degree_requirement_program" ON "degree_requirements"("degree_program_id");
CREATE INDEX "idx_degree_requirement_category" ON "degree_requirements"("category");

CREATE INDEX "idx_degree_enrollment_user" ON "degree_enrollments"("user_id");
CREATE INDEX "idx_degree_enrollment_program" ON "degree_enrollments"("degree_program_id");
CREATE INDEX "idx_degree_enrollment_status" ON "degree_enrollments"("status");

CREATE INDEX "idx_requirement_progress_enrollment" ON "degree_requirement_progress"("degree_enrollment_id");
CREATE INDEX "idx_requirement_progress_requirement" ON "degree_requirement_progress"("degree_requirement_id");

CREATE INDEX "idx_spiritual_requirement_program" ON "spiritual_formation_requirements"("degree_program_id");

CREATE INDEX "idx_spiritual_progress_enrollment" ON "spiritual_formation_progress"("degree_enrollment_id");

CREATE INDEX "idx_graduation_application_enrollment" ON "graduation_applications"("degree_enrollment_id");
CREATE INDEX "idx_graduation_application_status" ON "graduation_applications"("status");

CREATE INDEX "idx_transcript_user" ON "official_transcripts"("user_id");
CREATE INDEX "idx_transcript_enrollment" ON "official_transcripts"("degree_enrollment_id");

CREATE INDEX "idx_diploma_user" ON "diplomas"("user_id");
CREATE INDEX "idx_diploma_enrollment" ON "diplomas"("degree_enrollment_id");

-- Add relation from Course to DegreeRequirement (many-to-many through array)
-- This is handled through the required_courses and elective_options arrays in degree_requirements

-- Update Course table to add prerequisite tracking
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "prerequisites" TEXT[];
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "corequisites" TEXT[];

-- Comments for documentation
COMMENT ON TABLE "degree_programs" IS 'Academic degree programs from Certificate to Doctorate';
COMMENT ON TABLE "degree_requirements" IS 'Course and credit requirements for each degree program';
COMMENT ON TABLE "degree_enrollments" IS 'Student enrollment in degree programs with progress tracking';
COMMENT ON TABLE "degree_requirement_progress" IS 'Progress tracking for each requirement within a degree';
COMMENT ON TABLE "spiritual_formation_requirements" IS 'Spiritual formation requirements for degree completion';
COMMENT ON TABLE "spiritual_formation_progress" IS 'Student progress on spiritual formation requirements';
COMMENT ON TABLE "graduation_applications" IS 'Applications for graduation with approval workflow';
COMMENT ON TABLE "official_transcripts" IS 'Official academic transcripts with blockchain verification';
COMMENT ON TABLE "diplomas" IS 'Issued diplomas with blockchain verification and NFT support';
