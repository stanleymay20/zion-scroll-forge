-- Profile and Settings Management System Migration
-- "I praise you because I am fearfully and wonderfully made" - Psalm 139:14

-- User Preferences Table
CREATE TABLE IF NOT EXISTS "UserPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "theme" TEXT NOT NULL DEFAULT 'auto',
    "colorScheme" TEXT,
    "fontSize" TEXT NOT NULL DEFAULT 'medium',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timeZone" TEXT NOT NULL DEFAULT 'UTC',
    "dateFormat" TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '12h',
    "emailNotifications" JSONB NOT NULL DEFAULT '{}',
    "pushNotifications" JSONB NOT NULL DEFAULT '{}',
    "smsNotifications" JSONB NOT NULL DEFAULT '{}',
    "profileVisibility" TEXT NOT NULL DEFAULT 'public',
    "showEmail" BOOLEAN NOT NULL DEFAULT false,
    "showPhoneNumber" BOOLEAN NOT NULL DEFAULT false,
    "showLocation" BOOLEAN NOT NULL DEFAULT true,
    "allowMessagesFrom" TEXT NOT NULL DEFAULT 'everyone',
    "autoPlayVideos" BOOLEAN NOT NULL DEFAULT true,
    "videoQuality" TEXT NOT NULL DEFAULT 'auto',
    "closedCaptionsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "preferredLearningStyle" TEXT,
    "screenReaderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "highContrastMode" BOOLEAN NOT NULL DEFAULT false,
    "keyboardNavigationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Privacy Settings Table
CREATE TABLE IF NOT EXISTS "PrivacySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "profileVisibility" TEXT NOT NULL DEFAULT 'public',
    "showEmail" BOOLEAN NOT NULL DEFAULT false,
    "showPhoneNumber" BOOLEAN NOT NULL DEFAULT false,
    "showLocation" BOOLEAN NOT NULL DEFAULT true,
    "showDateOfBirth" BOOLEAN NOT NULL DEFAULT false,
    "showCourseProgress" BOOLEAN NOT NULL DEFAULT true,
    "showAchievements" BOOLEAN NOT NULL DEFAULT true,
    "showScrollCoinBalance" BOOLEAN NOT NULL DEFAULT false,
    "showSpiritualGrowth" BOOLEAN NOT NULL DEFAULT true,
    "allowMessagesFrom" TEXT NOT NULL DEFAULT 'everyone',
    "allowFriendRequests" BOOLEAN NOT NULL DEFAULT true,
    "allowStudyGroupInvites" BOOLEAN NOT NULL DEFAULT true,
    "allowDataAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "allowPersonalization" BOOLEAN NOT NULL DEFAULT true,
    "allowThirdPartySharing" BOOLEAN NOT NULL DEFAULT false,
    "appearInSearch" BOOLEAN NOT NULL DEFAULT true,
    "showInLeaderboards" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrivacySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Security Settings Table
CREATE TABLE IF NOT EXISTS "SecuritySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorMethod" TEXT,
    "twoFactorSecret" TEXT,
    "twoFactorBackupCodes" TEXT[],
    "maxConcurrentSessions" INTEGER NOT NULL DEFAULT 5,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 60,
    "passwordLastChanged" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passwordExpiryDays" INTEGER NOT NULL DEFAULT 90,
    "requirePasswordChange" BOOLEAN NOT NULL DEFAULT false,
    "accountLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockReason" TEXT,
    "suspiciousActivityDetected" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SecuritySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Login History Table
CREATE TABLE IF NOT EXISTS "LoginHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT NOT NULL,
    "location" TEXT,
    "deviceInfo" JSONB NOT NULL,
    "success" BOOLEAN NOT NULL,
    "failureReason" TEXT,
    "suspicious" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- User Consent Table
CREATE TABLE IF NOT EXISTS "UserConsent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "grantedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "required" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Data Export Table
CREATE TABLE IF NOT EXISTS "DataExport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "downloadUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "fileSize" INTEGER,
    "includePersonalInfo" BOOLEAN NOT NULL DEFAULT true,
    "includeAcademicRecords" BOOLEAN NOT NULL DEFAULT true,
    "includeSpiritualFormation" BOOLEAN NOT NULL DEFAULT true,
    "includeCommunityActivity" BOOLEAN NOT NULL DEFAULT true,
    "includeFinancialData" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DataExport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Account Deletion Request Table
CREATE TABLE IF NOT EXISTS "AccountDeletionRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "feedback" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "cancelBy" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccountDeletionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "UserPreferences_userId_idx" ON "UserPreferences"("userId");
CREATE INDEX IF NOT EXISTS "PrivacySettings_userId_idx" ON "PrivacySettings"("userId");
CREATE INDEX IF NOT EXISTS "SecuritySettings_userId_idx" ON "SecuritySettings"("userId");
CREATE INDEX IF NOT EXISTS "LoginHistory_userId_idx" ON "LoginHistory"("userId");
CREATE INDEX IF NOT EXISTS "LoginHistory_timestamp_idx" ON "LoginHistory"("timestamp" DESC);
CREATE INDEX IF NOT EXISTS "UserConsent_userId_idx" ON "UserConsent"("userId");
CREATE INDEX IF NOT EXISTS "UserConsent_consentType_idx" ON "UserConsent"("consentType");
CREATE INDEX IF NOT EXISTS "DataExport_userId_idx" ON "DataExport"("userId");
CREATE INDEX IF NOT EXISTS "DataExport_status_idx" ON "DataExport"("status");
CREATE INDEX IF NOT EXISTS "AccountDeletionRequest_userId_idx" ON "AccountDeletionRequest"("userId");
CREATE INDEX IF NOT EXISTS "AccountDeletionRequest_status_idx" ON "AccountDeletionRequest"("status");
CREATE INDEX IF NOT EXISTS "AccountDeletionRequest_scheduledFor_idx" ON "AccountDeletionRequest"("scheduledFor");

-- Add unique constraint for user consent type combination
CREATE UNIQUE INDEX IF NOT EXISTS "UserConsent_userId_consentType_key" ON "UserConsent"("userId", "consentType");
