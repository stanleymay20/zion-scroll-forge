-- Notification System Migration
-- Multi-channel notification delivery with preferences, templates, and analytics

-- Notification Templates
CREATE TABLE IF NOT EXISTS "NotificationTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "category" TEXT NOT NULL,
    "channels" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "subject" TEXT,
    "emailTemplate" TEXT,
    "smsTemplate" TEXT,
    "pushTemplate" TEXT,
    "inAppTemplate" TEXT,
    "variables" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS "NotificationPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "email" JSONB NOT NULL DEFAULT '{"enabled": true, "academic": true, "spiritual": true, "social": true, "administrative": true, "payment": true, "system": true, "marketing": false}'::jsonb,
    "push" JSONB NOT NULL DEFAULT '{"enabled": true, "academic": true, "spiritual": true, "social": true, "administrative": true, "payment": true, "system": true, "marketing": false}'::jsonb,
    "sms" JSONB NOT NULL DEFAULT '{"enabled": false, "academic": false, "spiritual": false, "social": false, "administrative": true, "payment": true, "system": true, "marketing": false}'::jsonb,
    "inApp" JSONB NOT NULL DEFAULT '{"enabled": true, "academic": true, "spiritual": true, "social": true, "administrative": true, "payment": true, "system": true, "marketing": true}'::jsonb,
    "quietHours" JSONB NOT NULL DEFAULT '{"enabled": false, "startTime": "22:00", "endTime": "08:00", "timezone": "UTC"}'::jsonb,
    "batchingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "batchInterval" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "templateId" TEXT,
    "batchId" TEXT,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "channels" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "data" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "NotificationTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Notification Deliveries
CREATE TABLE IF NOT EXISTS "NotificationDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notificationId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "recipient" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NotificationDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Notification Batches
CREATE TABLE IF NOT EXISTS "NotificationBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NotificationBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Notification Engagement
CREATE TABLE IF NOT EXISTS "NotificationEngagement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotificationEngagement_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NotificationEngagement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add foreign key for batch relationship
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_batchId_fkey" 
    FOREIGN KEY ("batchId") REFERENCES "NotificationBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "NotificationTemplate_category_idx" ON "NotificationTemplate"("category");
CREATE INDEX IF NOT EXISTS "NotificationTemplate_isActive_idx" ON "NotificationTemplate"("isActive");

CREATE INDEX IF NOT EXISTS "NotificationPreferences_userId_idx" ON "NotificationPreferences"("userId");

CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_templateId_idx" ON "Notification"("templateId");
CREATE INDEX IF NOT EXISTS "Notification_batchId_idx" ON "Notification"("batchId");
CREATE INDEX IF NOT EXISTS "Notification_category_idx" ON "Notification"("category");
CREATE INDEX IF NOT EXISTS "Notification_status_idx" ON "Notification"("status");
CREATE INDEX IF NOT EXISTS "Notification_priority_idx" ON "Notification"("priority");
CREATE INDEX IF NOT EXISTS "Notification_scheduledFor_idx" ON "Notification"("scheduledFor");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE INDEX IF NOT EXISTS "Notification_userId_status_idx" ON "Notification"("userId", "status");
CREATE INDEX IF NOT EXISTS "Notification_userId_category_idx" ON "Notification"("userId", "category");

CREATE INDEX IF NOT EXISTS "NotificationDelivery_notificationId_idx" ON "NotificationDelivery"("notificationId");
CREATE INDEX IF NOT EXISTS "NotificationDelivery_channel_idx" ON "NotificationDelivery"("channel");
CREATE INDEX IF NOT EXISTS "NotificationDelivery_status_idx" ON "NotificationDelivery"("status");

CREATE INDEX IF NOT EXISTS "NotificationBatch_userId_idx" ON "NotificationBatch"("userId");
CREATE INDEX IF NOT EXISTS "NotificationBatch_scheduledFor_idx" ON "NotificationBatch"("scheduledFor");
CREATE INDEX IF NOT EXISTS "NotificationBatch_status_idx" ON "NotificationBatch"("status");

CREATE INDEX IF NOT EXISTS "NotificationEngagement_notificationId_idx" ON "NotificationEngagement"("notificationId");
CREATE INDEX IF NOT EXISTS "NotificationEngagement_userId_idx" ON "NotificationEngagement"("userId");
CREATE INDEX IF NOT EXISTS "NotificationEngagement_action_idx" ON "NotificationEngagement"("action");
CREATE INDEX IF NOT EXISTS "NotificationEngagement_timestamp_idx" ON "NotificationEngagement"("timestamp");

-- Comments for documentation
COMMENT ON TABLE "NotificationTemplate" IS 'Reusable notification templates for different event types';
COMMENT ON TABLE "NotificationPreferences" IS 'User notification preferences and opt-out settings';
COMMENT ON TABLE "Notification" IS 'Individual notification records';
COMMENT ON TABLE "NotificationDelivery" IS 'Delivery tracking for each notification channel';
COMMENT ON TABLE "NotificationBatch" IS 'Batched notifications to prevent spam';
COMMENT ON TABLE "NotificationEngagement" IS 'User engagement tracking for notifications';
