-- CreateEnum
CREATE TYPE "AccreditationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'PROPHETIC_VALIDATION', 'DATA_SCIENCE_VALIDATION', 'JOINT_VALIDATION', 'APPROVED', 'REJECTED', 'RENEWAL_REQUIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AvatarType" AS ENUM ('REAL', 'AI_GENERATED', 'HYBRID');

-- CreateEnum
CREATE TYPE "ResearchStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PartnershipType" AS ENUM ('NGO', 'STARTUP', 'GOVERNMENT', 'MULTINATIONAL', 'ACADEMIC', 'NONPROFIT');

-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('SCROLL_TRANSCRIPT', 'DSGEI_DEGREE', 'B_SCROLL_CERTIFICATION', 'COURSE_COMPLETION', 'RESEARCH_PUBLICATION', 'INNOVATION_CERTIFICATE');

-- CreateEnum
CREATE TYPE "CredentialStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "accreditation_records" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AccreditationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "revelationAssessment" JSONB NOT NULL DEFAULT '{}',
    "empiricalValidation" JSONB NOT NULL DEFAULT '{}',
    "impactAssessment" JSONB NOT NULL DEFAULT '{}',
    "scrollSealValidation" JSONB NOT NULL DEFAULT '{}',
    "propheticValidators" JSONB NOT NULL DEFAULT '[]',
    "dataScienceValidators" JSONB NOT NULL DEFAULT '[]',
    "accreditationDecision" JSONB NOT NULL DEFAULT '{}',
    "certificateHash" TEXT,
    "validityPeriod" JSONB NOT NULL DEFAULT '{}',
    "validationHistory" JSONB NOT NULL DEFAULT '[]',
    "renewalHistory" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accreditation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scroll_transcripts" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "accreditationId" TEXT NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "creditHours" INTEGER NOT NULL,
    "courses" JSONB NOT NULL DEFAULT '[]',
    "scrollXP" INTEGER NOT NULL DEFAULT 0,
    "innovationScore" JSONB NOT NULL DEFAULT '{}',
    "propheticDefense" JSONB NOT NULL DEFAULT '{}',
    "communityImpact" JSONB NOT NULL DEFAULT '{}',
    "blockchainCredentialsJson" JSONB NOT NULL DEFAULT '[]',
    "verificationHashes" TEXT[],
    "researchPublications" JSONB NOT NULL DEFAULT '[]',
    "projects" JSONB NOT NULL DEFAULT '[]',
    "certifications" JSONB NOT NULL DEFAULT '[]',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scroll_transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_avatars" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "accreditationId" TEXT NOT NULL,
    "avatarType" "AvatarType" NOT NULL DEFAULT 'AI_GENERATED',
    "specialization" TEXT NOT NULL,
    "knowledgeDomains" JSONB NOT NULL DEFAULT '[]',
    "trainingContent" JSONB NOT NULL DEFAULT '[]',
    "voiceModel" JSONB NOT NULL DEFAULT '{}',
    "personalityProfile" JSONB NOT NULL DEFAULT '{}',
    "supportedLanguages" JSONB NOT NULL DEFAULT '[]',
    "interactionModes" JSONB NOT NULL DEFAULT '[]',
    "availabilitySchedule" JSONB NOT NULL DEFAULT '{}',
    "studentInteractions" JSONB NOT NULL DEFAULT '[]',
    "satisfactionRatings" JSONB NOT NULL DEFAULT '[]',
    "learningOutcomes" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculty_avatars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_projects" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "accreditationId" TEXT,
    "title" TEXT NOT NULL,
    "researchProblem" JSONB NOT NULL,
    "methodology" JSONB NOT NULL DEFAULT '{}',
    "realWorldDataSources" JSONB NOT NULL DEFAULT '[]',
    "propheticInsights" JSONB NOT NULL DEFAULT '[]',
    "gptAnalysisResults" JSONB NOT NULL DEFAULT '[]',
    "statisticalAnalysis" JSONB NOT NULL DEFAULT '{}',
    "findings" JSONB NOT NULL DEFAULT '{}',
    "publications" JSONB NOT NULL DEFAULT '[]',
    "citationMetrics" JSONB NOT NULL DEFAULT '{}',
    "impactMetrics" JSONB NOT NULL DEFAULT '{}',
    "status" "ResearchStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employer_partnerships" (
    "id" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "partnershipType" "PartnershipType" NOT NULL,
    "industry" TEXT,
    "organizationSize" TEXT,
    "locations" JSONB NOT NULL DEFAULT '[]',
    "talentRequirements" JSONB NOT NULL DEFAULT '[]',
    "activeProjects" JSONB NOT NULL DEFAULT '[]',
    "hiredGraduates" JSONB NOT NULL DEFAULT '[]',
    "researchAccess" JSONB NOT NULL DEFAULT '{}',
    "techInsightsAccess" JSONB NOT NULL DEFAULT '{}',
    "networkingOpportunities" JSONB NOT NULL DEFAULT '[]',
    "hiringSuccessMetrics" JSONB NOT NULL DEFAULT '{}',
    "partnershipSatisfaction" JSONB NOT NULL DEFAULT '{}',
    "renewalHistory" JSONB NOT NULL DEFAULT '[]',
    "partnershipStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employer_partnerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_credentials" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "transcriptId" TEXT,
    "credentialType" "CredentialType" NOT NULL,
    "blockchainHash" TEXT NOT NULL,
    "smartContractAddress" TEXT,
    "verificationUrl" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "status" "CredentialStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ipfsHash" TEXT,
    "documentUrl" TEXT,

    CONSTRAINT "blockchain_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accreditation_records_institutionId_idx" ON "accreditation_records"("institutionId");

-- CreateIndex
CREATE INDEX "accreditation_records_status_idx" ON "accreditation_records"("status");

-- CreateIndex
CREATE INDEX "scroll_transcripts_studentId_idx" ON "scroll_transcripts"("studentId");

-- CreateIndex
CREATE INDEX "scroll_transcripts_accreditationId_idx" ON "scroll_transcripts"("accreditationId");

-- CreateIndex
CREATE INDEX "faculty_avatars_facultyId_idx" ON "faculty_avatars"("facultyId");

-- CreateIndex
CREATE INDEX "faculty_avatars_accreditationId_idx" ON "faculty_avatars"("accreditationId");

-- CreateIndex
CREATE INDEX "research_projects_teamId_idx" ON "research_projects"("teamId");

-- CreateIndex
CREATE INDEX "research_projects_accreditationId_idx" ON "research_projects"("accreditationId");

-- CreateIndex
CREATE INDEX "employer_partnerships_partnershipType_idx" ON "employer_partnerships"("partnershipType");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_credentials_blockchainHash_key" ON "blockchain_credentials"("blockchainHash");

-- CreateIndex
CREATE INDEX "blockchain_credentials_studentId_idx" ON "blockchain_credentials"("studentId");

-- CreateIndex
CREATE INDEX "blockchain_credentials_transcriptId_idx" ON "blockchain_credentials"("transcriptId");

-- AddForeignKey
ALTER TABLE "scroll_transcripts" ADD CONSTRAINT "scroll_transcripts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scroll_transcripts" ADD CONSTRAINT "scroll_transcripts_accreditationId_fkey" FOREIGN KEY ("accreditationId") REFERENCES "accreditation_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_avatars" ADD CONSTRAINT "faculty_avatars_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_avatars" ADD CONSTRAINT "faculty_avatars_accreditationId_fkey" FOREIGN KEY ("accreditationId") REFERENCES "accreditation_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_projects" ADD CONSTRAINT "research_projects_accreditationId_fkey" FOREIGN KEY ("accreditationId") REFERENCES "accreditation_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_credentials" ADD CONSTRAINT "blockchain_credentials_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_credentials" ADD CONSTRAINT "blockchain_credentials_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "scroll_transcripts"("id") ON DELETE SET NULL ON UPDATE CASCADE;