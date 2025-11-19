-- Prayer Journal and Requests System Migration
-- "The prayer of a righteous person is powerful and effective" - James 5:16

-- Prayer Categories Enum
CREATE TYPE "PrayerCategory" AS ENUM (
  'personal',
  'family',
  'ministry',
  'healing',
  'guidance',
  'provision',
  'salvation',
  'thanksgiving',
  'intercession',
  'repentance',
  'spiritual_warfare',
  'kingdom_advancement'
);

-- Prayer Urgency Enum
CREATE TYPE "PrayerUrgency" AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Prayer Request Status Enum
CREATE TYPE "PrayerRequestStatus" AS ENUM (
  'active',
  'answered',
  'closed',
  'archived'
);

-- Partner Status Enum
CREATE TYPE "PartnerStatus" AS ENUM (
  'pending',
  'active',
  'inactive',
  'blocked'
);

-- Reminder Frequency Enum
CREATE TYPE "ReminderFrequency" AS ENUM (
  'once',
  'daily',
  'weekly',
  'custom'
);

-- Wall Type Enum
CREATE TYPE "WallType" AS ENUM (
  'global',
  'course',
  'faculty',
  'ministry',
  'private_group'
);

-- Prayer Entries Table
CREATE TABLE "prayer_entries" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" "PrayerCategory" NOT NULL DEFAULT 'personal',
  "is_private" BOOLEAN NOT NULL DEFAULT true,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Tracking
  "answered" BOOLEAN NOT NULL DEFAULT false,
  "answered_date" TIMESTAMP,
  "testimony" TEXT,
  
  -- Community
  "prayer_partners" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "prayer_count" INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Prayer Requests Table
CREATE TABLE "prayer_requests" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" "PrayerCategory" NOT NULL DEFAULT 'personal',
  "urgency" "PrayerUrgency" NOT NULL DEFAULT 'medium',
  "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
  
  -- Community Engagement
  "prayer_count" INTEGER NOT NULL DEFAULT 0,
  "intercessors" TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Status
  "status" "PrayerRequestStatus" NOT NULL DEFAULT 'active',
  "answered" BOOLEAN NOT NULL DEFAULT false,
  "answered_date" TIMESTAMP,
  "testimony" TEXT,
  
  -- Timestamps
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMP
);

-- Prayer Updates Table
CREATE TABLE "prayer_updates" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "prayer_request_id" TEXT NOT NULL REFERENCES "prayer_requests"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "update_type" TEXT NOT NULL DEFAULT 'general',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "prayer_updates_update_type_check" CHECK ("update_type" IN ('progress', 'testimony', 'answered', 'general'))
);

-- Prayer Partners Table
CREATE TABLE "prayer_partners" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "partner_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" "PartnerStatus" NOT NULL DEFAULT 'pending',
  "matched_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_prayed_together" TIMESTAMP,
  "shared_prayers" INTEGER NOT NULL DEFAULT 0,
  "compatibility" INTEGER NOT NULL DEFAULT 0,
  
  CONSTRAINT "prayer_partners_unique" UNIQUE ("user_id", "partner_id"),
  CONSTRAINT "prayer_partners_no_self" CHECK ("user_id" != "partner_id")
);

-- Answered Prayers Table
CREATE TABLE "answered_prayers" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "prayer_entry_id" TEXT REFERENCES "prayer_entries"("id") ON DELETE SET NULL,
  "prayer_request_id" TEXT REFERENCES "prayer_requests"("id") ON DELETE SET NULL,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "original_request" TEXT NOT NULL,
  "testimony" TEXT NOT NULL,
  "answered_date" TIMESTAMP NOT NULL,
  "time_to_answer" INTEGER NOT NULL, -- days
  "category" "PrayerCategory" NOT NULL,
  "is_public" BOOLEAN NOT NULL DEFAULT true,
  "likes" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Testimony Comments Table
CREATE TABLE "testimony_comments" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "answered_prayer_id" TEXT NOT NULL REFERENCES "answered_prayers"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Prayer Reminders Table
CREATE TABLE "prayer_reminders" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "prayer_entry_id" TEXT REFERENCES "prayer_entries"("id") ON DELETE CASCADE,
  "prayer_request_id" TEXT REFERENCES "prayer_requests"("id") ON DELETE CASCADE,
  "reminder_time" TEXT NOT NULL, -- HH:MM format
  "frequency" "ReminderFrequency" NOT NULL DEFAULT 'daily',
  "days_of_week" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "last_sent" TIMESTAMP,
  "next_scheduled" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Prayer Walls Table
CREATE TABLE "prayer_walls" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" "WallType" NOT NULL DEFAULT 'global',
  "is_public" BOOLEAN NOT NULL DEFAULT true,
  "moderators" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "member_count" INTEGER NOT NULL DEFAULT 0,
  "total_prayers" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Prayer Wall Requests Junction Table
CREATE TABLE "prayer_wall_requests" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "prayer_wall_id" TEXT NOT NULL REFERENCES "prayer_walls"("id") ON DELETE CASCADE,
  "prayer_request_id" TEXT NOT NULL REFERENCES "prayer_requests"("id") ON DELETE CASCADE,
  "added_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "prayer_wall_requests_unique" UNIQUE ("prayer_wall_id", "prayer_request_id")
);

-- Prayer Partner Preferences Table
CREATE TABLE "prayer_partner_preferences" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "user_id" TEXT NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "prayer_interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "availability" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "preferred_communication" TEXT NOT NULL DEFAULT 'chat',
  "max_partners" INTEGER NOT NULL DEFAULT 5,
  "auto_match" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "prayer_partner_preferences_communication_check" CHECK ("preferred_communication" IN ('chat', 'video', 'both'))
);

-- Prayer Notifications Table
CREATE TABLE "prayer_notifications" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "related_id" TEXT,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "prayer_notifications_type_check" CHECK ("type" IN (
    'prayer_answered',
    'partner_request',
    'partner_accepted',
    'prayer_update',
    'reminder',
    'testimony_shared',
    'urgent_request',
    'milestone_achieved'
  ))
);

-- Indexes for Performance
CREATE INDEX "idx_prayer_entries_user_id" ON "prayer_entries"("user_id");
CREATE INDEX "idx_prayer_entries_category" ON "prayer_entries"("category");
CREATE INDEX "idx_prayer_entries_answered" ON "prayer_entries"("answered");
CREATE INDEX "idx_prayer_entries_created_at" ON "prayer_entries"("created_at" DESC);

CREATE INDEX "idx_prayer_requests_user_id" ON "prayer_requests"("user_id");
CREATE INDEX "idx_prayer_requests_category" ON "prayer_requests"("category");
CREATE INDEX "idx_prayer_requests_status" ON "prayer_requests"("status");
CREATE INDEX "idx_prayer_requests_urgency" ON "prayer_requests"("urgency");
CREATE INDEX "idx_prayer_requests_created_at" ON "prayer_requests"("created_at" DESC);

CREATE INDEX "idx_prayer_updates_prayer_request_id" ON "prayer_updates"("prayer_request_id");
CREATE INDEX "idx_prayer_updates_user_id" ON "prayer_updates"("user_id");

CREATE INDEX "idx_prayer_partners_user_id" ON "prayer_partners"("user_id");
CREATE INDEX "idx_prayer_partners_partner_id" ON "prayer_partners"("partner_id");
CREATE INDEX "idx_prayer_partners_status" ON "prayer_partners"("status");

CREATE INDEX "idx_answered_prayers_user_id" ON "answered_prayers"("user_id");
CREATE INDEX "idx_answered_prayers_category" ON "answered_prayers"("category");
CREATE INDEX "idx_answered_prayers_is_public" ON "answered_prayers"("is_public");
CREATE INDEX "idx_answered_prayers_answered_date" ON "answered_prayers"("answered_date" DESC);

CREATE INDEX "idx_testimony_comments_answered_prayer_id" ON "testimony_comments"("answered_prayer_id");
CREATE INDEX "idx_testimony_comments_user_id" ON "testimony_comments"("user_id");

CREATE INDEX "idx_prayer_reminders_user_id" ON "prayer_reminders"("user_id");
CREATE INDEX "idx_prayer_reminders_is_active" ON "prayer_reminders"("is_active");
CREATE INDEX "idx_prayer_reminders_next_scheduled" ON "prayer_reminders"("next_scheduled");

CREATE INDEX "idx_prayer_walls_type" ON "prayer_walls"("type");
CREATE INDEX "idx_prayer_walls_is_public" ON "prayer_walls"("is_public");

CREATE INDEX "idx_prayer_wall_requests_prayer_wall_id" ON "prayer_wall_requests"("prayer_wall_id");
CREATE INDEX "idx_prayer_wall_requests_prayer_request_id" ON "prayer_wall_requests"("prayer_request_id");

CREATE INDEX "idx_prayer_notifications_user_id" ON "prayer_notifications"("user_id");
CREATE INDEX "idx_prayer_notifications_read" ON "prayer_notifications"("read");
CREATE INDEX "idx_prayer_notifications_created_at" ON "prayer_notifications"("created_at" DESC);

-- Triggers for Updated At
CREATE OR REPLACE FUNCTION update_prayer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prayer_entries_updated_at
  BEFORE UPDATE ON "prayer_entries"
  FOR EACH ROW
  EXECUTE FUNCTION update_prayer_updated_at();

CREATE TRIGGER prayer_requests_updated_at
  BEFORE UPDATE ON "prayer_requests"
  FOR EACH ROW
  EXECUTE FUNCTION update_prayer_updated_at();

CREATE TRIGGER answered_prayers_updated_at
  BEFORE UPDATE ON "answered_prayers"
  FOR EACH ROW
  EXECUTE FUNCTION update_prayer_updated_at();

CREATE TRIGGER prayer_reminders_updated_at
  BEFORE UPDATE ON "prayer_reminders"
  FOR EACH ROW
  EXECUTE FUNCTION update_prayer_updated_at();

CREATE TRIGGER prayer_walls_updated_at
  BEFORE UPDATE ON "prayer_walls"
  FOR EACH ROW
  EXECUTE FUNCTION update_prayer_updated_at();

CREATE TRIGGER prayer_partner_preferences_updated_at
  BEFORE UPDATE ON "prayer_partner_preferences"
  FOR EACH ROW
  EXECUTE FUNCTION update_prayer_updated_at();

-- Comments
COMMENT ON TABLE "prayer_entries" IS 'Personal prayer journal entries';
COMMENT ON TABLE "prayer_requests" IS 'Community prayer requests';
COMMENT ON TABLE "prayer_updates" IS 'Updates on prayer requests';
COMMENT ON TABLE "prayer_partners" IS 'Prayer partner relationships';
COMMENT ON TABLE "answered_prayers" IS 'Testimonies of answered prayers';
COMMENT ON TABLE "testimony_comments" IS 'Comments on answered prayer testimonies';
COMMENT ON TABLE "prayer_reminders" IS 'Prayer reminder notifications';
COMMENT ON TABLE "prayer_walls" IS 'Community prayer walls';
COMMENT ON TABLE "prayer_wall_requests" IS 'Prayer requests on prayer walls';
COMMENT ON TABLE "prayer_partner_preferences" IS 'User preferences for prayer partner matching';
COMMENT ON TABLE "prayer_notifications" IS 'Prayer-related notifications';
