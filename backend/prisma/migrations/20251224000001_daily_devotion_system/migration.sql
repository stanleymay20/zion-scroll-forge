-- Daily Devotion System Migration
-- Creates tables for daily devotions, completions, streaks, preferences, and discussions

-- Daily Devotions table
CREATE TABLE IF NOT EXISTS "DailyDevotion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "scriptureReference" TEXT NOT NULL,
    "scriptureText" TEXT NOT NULL,
    "scriptureTranslation" TEXT NOT NULL DEFAULT 'NIV',
    "scriptureAudioUrl" TEXT,
    "reflection" TEXT NOT NULL,
    "prayerPrompt" TEXT NOT NULL,
    "actionStep" TEXT NOT NULL,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "author" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT DEFAULT 'intermediate',
    "estimatedReadTime" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create index on date for efficient lookups
CREATE INDEX IF NOT EXISTS "DailyDevotion_date_idx" ON "DailyDevotion"("date");
CREATE INDEX IF NOT EXISTS "DailyDevotion_tags_idx" ON "DailyDevotion" USING GIN("tags");
CREATE INDEX IF NOT EXISTS "DailyDevotion_theme_idx" ON "DailyDevotion"("theme");

-- Devotion Completions table
CREATE TABLE IF NOT EXISTS "DevotionCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "devotionId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "rating" INTEGER,
    "timeSpent" INTEGER,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DevotionCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DevotionCompletion_devotionId_fkey" FOREIGN KEY ("devotionId") REFERENCES "DailyDevotion"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for completions
CREATE INDEX IF NOT EXISTS "DevotionCompletion_userId_idx" ON "DevotionCompletion"("userId");
CREATE INDEX IF NOT EXISTS "DevotionCompletion_devotionId_idx" ON "DevotionCompletion"("devotionId");
CREATE INDEX IF NOT EXISTS "DevotionCompletion_completedAt_idx" ON "DevotionCompletion"("completedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "DevotionCompletion_userId_devotionId_key" ON "DevotionCompletion"("userId", "devotionId");

-- Devotion Streaks table
CREATE TABLE IF NOT EXISTS "DevotionStreak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalCompletions" INTEGER NOT NULL DEFAULT 0,
    "lastCompletionDate" TIMESTAMP(3),
    "streakStartDate" TIMESTAMP(3),
    "milestones" JSONB DEFAULT '[]'::JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DevotionStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index on userId
CREATE INDEX IF NOT EXISTS "DevotionStreak_userId_idx" ON "DevotionStreak"("userId");

-- Devotion Preferences table
CREATE TABLE IF NOT EXISTS "DevotionPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "preferredTranslation" TEXT NOT NULL DEFAULT 'NIV',
    "preferredTime" TEXT NOT NULL DEFAULT '07:00',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT DEFAULT 'intermediate',
    "audioEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reminderTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DevotionPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index on userId
CREATE INDEX IF NOT EXISTS "DevotionPreferences_userId_idx" ON "DevotionPreferences"("userId");

-- Devotion Discussions table
CREATE TABLE IF NOT EXISTS "DevotionDiscussion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "devotionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DevotionDiscussion_devotionId_fkey" FOREIGN KEY ("devotionId") REFERENCES "DailyDevotion"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DevotionDiscussion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DevotionDiscussion_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DevotionDiscussion"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for discussions
CREATE INDEX IF NOT EXISTS "DevotionDiscussion_devotionId_idx" ON "DevotionDiscussion"("devotionId");
CREATE INDEX IF NOT EXISTS "DevotionDiscussion_userId_idx" ON "DevotionDiscussion"("userId");
CREATE INDEX IF NOT EXISTS "DevotionDiscussion_parentId_idx" ON "DevotionDiscussion"("parentId");
CREATE INDEX IF NOT EXISTS "DevotionDiscussion_createdAt_idx" ON "DevotionDiscussion"("createdAt");

-- Devotion Shares table (for tracking sharing analytics)
CREATE TABLE IF NOT EXISTS "DevotionShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "devotionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DevotionShare_devotionId_fkey" FOREIGN KEY ("devotionId") REFERENCES "DailyDevotion"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DevotionShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for shares
CREATE INDEX IF NOT EXISTS "DevotionShare_devotionId_idx" ON "DevotionShare"("devotionId");
CREATE INDEX IF NOT EXISTS "DevotionShare_userId_idx" ON "DevotionShare"("userId");
CREATE INDEX IF NOT EXISTS "DevotionShare_sharedAt_idx" ON "DevotionShare"("sharedAt");

-- Devotion Delivery Schedule table (for timezone-aware delivery)
CREATE TABLE IF NOT EXISTS "DevotionDeliverySchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "devotionId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMP(3),
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DevotionDeliverySchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DevotionDeliverySchedule_devotionId_fkey" FOREIGN KEY ("devotionId") REFERENCES "DailyDevotion"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for delivery schedule
CREATE INDEX IF NOT EXISTS "DevotionDeliverySchedule_userId_idx" ON "DevotionDeliverySchedule"("userId");
CREATE INDEX IF NOT EXISTS "DevotionDeliverySchedule_devotionId_idx" ON "DevotionDeliverySchedule"("devotionId");
CREATE INDEX IF NOT EXISTS "DevotionDeliverySchedule_scheduledFor_idx" ON "DevotionDeliverySchedule"("scheduledFor");
CREATE INDEX IF NOT EXISTS "DevotionDeliverySchedule_delivered_idx" ON "DevotionDeliverySchedule"("delivered");

-- Add comments for documentation
COMMENT ON TABLE "DailyDevotion" IS 'Daily devotional content with scripture, reflection, prayer, and action steps';
COMMENT ON TABLE "DevotionCompletion" IS 'Tracks user completion of daily devotions';
COMMENT ON TABLE "DevotionStreak" IS 'Tracks user devotion streaks and milestones';
COMMENT ON TABLE "DevotionPreferences" IS 'User preferences for devotion delivery and content';
COMMENT ON TABLE "DevotionDiscussion" IS 'Community discussions on daily devotions';
COMMENT ON TABLE "DevotionShare" IS 'Tracks devotion sharing for analytics';
COMMENT ON TABLE "DevotionDeliverySchedule" IS 'Schedules devotion delivery based on user timezone';
