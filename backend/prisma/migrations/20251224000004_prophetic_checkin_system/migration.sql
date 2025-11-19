-- Prophetic Check-in and Spiritual Growth System Migration
-- "By the Spirit's leading, we establish these tables for kingdom growth tracking"

-- Prophetic Check-ins Table
CREATE TABLE IF NOT EXISTS "PropheticCheckIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionnaire" JSONB NOT NULL,
    "spiritualTemperature" INTEGER NOT NULL,
    "mood" TEXT NOT NULL,
    "lifeCircumstances" TEXT NOT NULL,
    "prayerFocus" TEXT[] NOT NULL,
    "scriptureHighlights" TEXT[] NOT NULL,
    "godsVoice" TEXT NOT NULL,
    "obedienceLevel" INTEGER NOT NULL,
    "communityEngagement" INTEGER NOT NULL,
    "ministryActivity" TEXT NOT NULL,
    "challengesFaced" TEXT[] NOT NULL,
    "victoriesExperienced" TEXT[] NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "PropheticCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Spiritual Growth Tracking Table
CREATE TABLE IF NOT EXISTS "SpiritualGrowthTracking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "checkInId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overallGrowthScore" DOUBLE PRECISION NOT NULL,
    "growthTrend" TEXT NOT NULL,
    "growthAreas" JSONB NOT NULL,
    "progressIndicators" JSONB NOT NULL,
    "milestones" JSONB NOT NULL,
    "comparedToLastMonth" DOUBLE PRECISION NOT NULL,
    "comparedToLastQuarter" DOUBLE PRECISION NOT NULL,
    "comparedToLastYear" DOUBLE PRECISION NOT NULL,
    "insights" TEXT[] NOT NULL,
    "recommendations" TEXT[] NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "SpiritualGrowthTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SpiritualGrowthTracking_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "PropheticCheckIn"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Prophetic Guidance Table
CREATE TABLE IF NOT EXISTS "PropheticGuidance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "checkInId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guidance" JSONB NOT NULL,
    "scriptureReferences" JSONB NOT NULL,
    "propheticInsights" JSONB NOT NULL,
    "callingClarification" JSONB NOT NULL,
    "nextSteps" JSONB NOT NULL,
    "warnings" JSONB NOT NULL,
    "encouragements" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "requiresHumanReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "PropheticGuidance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PropheticGuidance_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "PropheticCheckIn"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PropheticGuidance_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Spiritual Gift Identification Table
CREATE TABLE IF NOT EXISTS "SpiritualGiftIdentification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "identifiedGifts" JSONB NOT NULL,
    "giftMix" JSONB NOT NULL,
    "assessmentScores" JSONB NOT NULL,
    "evidenceFromLife" JSONB NOT NULL,
    "confirmations" JSONB NOT NULL,
    "developmentPlan" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "requiresConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "SpiritualGiftIdentification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Calling Discernment Table
CREATE TABLE IF NOT EXISTS "CallingDiscernment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "callingStatement" TEXT NOT NULL,
    "callingConfidence" DOUBLE PRECISION NOT NULL,
    "callingComponents" JSONB NOT NULL,
    "discernmentJourney" JSONB NOT NULL,
    "confirmations" JSONB NOT NULL,
    "questions" JSONB NOT NULL,
    "giftAlignment" DOUBLE PRECISION NOT NULL,
    "passionAlignment" DOUBLE PRECISION NOT NULL,
    "opportunityAlignment" DOUBLE PRECISION NOT NULL,
    "fruitAlignment" DOUBLE PRECISION NOT NULL,
    "nextSteps" JSONB NOT NULL,
    "preparationPath" JSONB NOT NULL,
    "timingGuidance" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "CallingDiscernment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Spiritual Mentor Match Table
CREATE TABLE IF NOT EXISTS "SpiritualMentorMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mentorshipNeeds" JSONB NOT NULL,
    "currentChallenges" TEXT[] NOT NULL,
    "growthGoals" TEXT[] NOT NULL,
    "recommendedMentors" JSONB NOT NULL,
    "matchingCriteria" JSONB NOT NULL,
    "connectionSteps" JSONB NOT NULL,
    "expectations" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "connectedMentorId" TEXT,
    "connectionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "SpiritualMentorMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SpiritualMentorMatch_connectedMentorId_fkey" FOREIGN KEY ("connectedMentorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Spiritual Growth Analytics Table
CREATE TABLE IF NOT EXISTS "SpiritualGrowthAnalytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "overallGrowth" DOUBLE PRECISION NOT NULL,
    "growthRate" DOUBLE PRECISION NOT NULL,
    "consistencyScore" DOUBLE PRECISION NOT NULL,
    "categoryScores" JSONB NOT NULL,
    "trends" JSONB NOT NULL,
    "patterns" JSONB NOT NULL,
    "achievements" JSONB NOT NULL,
    "breakthroughs" JSONB NOT NULL,
    "persistentChallenges" JSONB NOT NULL,
    "newChallenges" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "peerComparison" JSONB,
    "historicalComparison" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "SpiritualGrowthAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS "PropheticCheckIn_userId_idx" ON "PropheticCheckIn"("userId");
CREATE INDEX IF NOT EXISTS "PropheticCheckIn_timestamp_idx" ON "PropheticCheckIn"("timestamp");
CREATE INDEX IF NOT EXISTS "SpiritualGrowthTracking_userId_idx" ON "SpiritualGrowthTracking"("userId");
CREATE INDEX IF NOT EXISTS "SpiritualGrowthTracking_checkInId_idx" ON "SpiritualGrowthTracking"("checkInId");
CREATE INDEX IF NOT EXISTS "PropheticGuidance_userId_idx" ON "PropheticGuidance"("userId");
CREATE INDEX IF NOT EXISTS "PropheticGuidance_checkInId_idx" ON "PropheticGuidance"("checkInId");
CREATE INDEX IF NOT EXISTS "PropheticGuidance_requiresHumanReview_idx" ON "PropheticGuidance"("requiresHumanReview");
CREATE INDEX IF NOT EXISTS "SpiritualGiftIdentification_userId_idx" ON "SpiritualGiftIdentification"("userId");
CREATE INDEX IF NOT EXISTS "CallingDiscernment_userId_idx" ON "CallingDiscernment"("userId");
CREATE INDEX IF NOT EXISTS "SpiritualMentorMatch_userId_idx" ON "SpiritualMentorMatch"("userId");
CREATE INDEX IF NOT EXISTS "SpiritualMentorMatch_status_idx" ON "SpiritualMentorMatch"("status");
CREATE INDEX IF NOT EXISTS "SpiritualGrowthAnalytics_userId_idx" ON "SpiritualGrowthAnalytics"("userId");
CREATE INDEX IF NOT EXISTS "SpiritualGrowthAnalytics_periodStart_idx" ON "SpiritualGrowthAnalytics"("periodStart");
CREATE INDEX IF NOT EXISTS "SpiritualGrowthAnalytics_periodEnd_idx" ON "SpiritualGrowthAnalytics"("periodEnd");

-- Add Comments for Documentation
COMMENT ON TABLE "PropheticCheckIn" IS 'Stores prophetic check-in responses for spiritual growth tracking';
COMMENT ON TABLE "SpiritualGrowthTracking" IS 'Tracks spiritual growth metrics and progress indicators';
COMMENT ON TABLE "PropheticGuidance" IS 'AI-generated prophetic guidance and insights';
COMMENT ON TABLE "SpiritualGiftIdentification" IS 'Spiritual gift identification and development plans';
COMMENT ON TABLE "CallingDiscernment" IS 'Calling discernment and clarification tracking';
COMMENT ON TABLE "SpiritualMentorMatch" IS 'Spiritual mentor matching and connection management';
COMMENT ON TABLE "SpiritualGrowthAnalytics" IS 'Comprehensive spiritual growth analytics and reports';
