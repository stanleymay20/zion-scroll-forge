-- Community Feed and Social Features Migration
-- "Let us consider how we may spur one another on toward love and good deeds" - Hebrews 10:24

-- Posts Table
CREATE TABLE IF NOT EXISTS "posts" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "author_id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'text',
  "media" JSONB DEFAULT '[]',
  "visibility" TEXT NOT NULL DEFAULT 'public',
  "is_pinned" BOOLEAN NOT NULL DEFAULT false,
  "is_edited" BOOLEAN NOT NULL DEFAULT false,
  "edited_at" TIMESTAMP(3),
  "likes_count" INTEGER NOT NULL DEFAULT 0,
  "comments_count" INTEGER NOT NULL DEFAULT 0,
  "shares_count" INTEGER NOT NULL DEFAULT 0,
  "views_count" INTEGER NOT NULL DEFAULT 0,
  "flagged" BOOLEAN NOT NULL DEFAULT false,
  "moderation_status" TEXT NOT NULL DEFAULT 'approved',
  "moderation_notes" TEXT,
  "moderated_at" TIMESTAMP(3),
  "moderated_by" TEXT,
  "is_prayer_request" BOOLEAN NOT NULL DEFAULT false,
  "scripture_references" JSONB DEFAULT '[]',
  "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "posts_moderated_by_fkey" FOREIGN KEY ("moderated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Comments Table
CREATE TABLE IF NOT EXISTS "comments" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "post_id" TEXT NOT NULL,
  "author_id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "parent_comment_id" TEXT,
  "is_edited" BOOLEAN NOT NULL DEFAULT false,
  "edited_at" TIMESTAMP(3),
  "likes_count" INTEGER NOT NULL DEFAULT 0,
  "flagged" BOOLEAN NOT NULL DEFAULT false,
  "moderation_status" TEXT NOT NULL DEFAULT 'approved',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Likes Table
CREATE TABLE IF NOT EXISTS "likes" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "post_id" TEXT,
  "comment_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "likes_check" CHECK (("post_id" IS NOT NULL AND "comment_id" IS NULL) OR ("post_id" IS NULL AND "comment_id" IS NOT NULL))
);

-- Shares Table
CREATE TABLE IF NOT EXISTS "shares" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "post_id" TEXT NOT NULL,
  "share_message" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "shares_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Follows Table
CREATE TABLE IF NOT EXISTS "follows" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "follower_id" TEXT NOT NULL,
  "following_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "follows_check" CHECK ("follower_id" != "following_id")
);

-- Post Reports Table
CREATE TABLE IF NOT EXISTS "post_reports" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "post_id" TEXT NOT NULL,
  "reporter_id" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "reviewed_by" TEXT,
  "reviewed_at" TIMESTAMP(3),
  "action_taken" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "post_reports_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "post_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "post_reports_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Trending Topics Table
CREATE TABLE IF NOT EXISTS "trending_topics" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "hashtag" TEXT NOT NULL UNIQUE,
  "post_count" INTEGER NOT NULL DEFAULT 0,
  "engagement_score" FLOAT NOT NULL DEFAULT 0,
  "trending_since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "data" JSONB DEFAULT '{}',
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "read_at" TIMESTAMP(3),
  "action_url" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS "posts_author_id_idx" ON "posts"("author_id");
CREATE INDEX IF NOT EXISTS "posts_created_at_idx" ON "posts"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "posts_moderation_status_idx" ON "posts"("moderation_status");
CREATE INDEX IF NOT EXISTS "posts_hashtags_idx" ON "posts" USING GIN("hashtags");
CREATE INDEX IF NOT EXISTS "posts_type_idx" ON "posts"("type");

CREATE INDEX IF NOT EXISTS "comments_post_id_idx" ON "comments"("post_id");
CREATE INDEX IF NOT EXISTS "comments_author_id_idx" ON "comments"("author_id");
CREATE INDEX IF NOT EXISTS "comments_parent_comment_id_idx" ON "comments"("parent_comment_id");
CREATE INDEX IF NOT EXISTS "comments_created_at_idx" ON "comments"("created_at" DESC);

CREATE INDEX IF NOT EXISTS "likes_user_id_idx" ON "likes"("user_id");
CREATE INDEX IF NOT EXISTS "likes_post_id_idx" ON "likes"("post_id");
CREATE INDEX IF NOT EXISTS "likes_comment_id_idx" ON "likes"("comment_id");
CREATE UNIQUE INDEX IF NOT EXISTS "likes_user_post_unique" ON "likes"("user_id", "post_id") WHERE "post_id" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "likes_user_comment_unique" ON "likes"("user_id", "comment_id") WHERE "comment_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "shares_user_id_idx" ON "shares"("user_id");
CREATE INDEX IF NOT EXISTS "shares_post_id_idx" ON "shares"("post_id");
CREATE INDEX IF NOT EXISTS "shares_created_at_idx" ON "shares"("created_at" DESC);

CREATE INDEX IF NOT EXISTS "follows_follower_id_idx" ON "follows"("follower_id");
CREATE INDEX IF NOT EXISTS "follows_following_id_idx" ON "follows"("following_id");
CREATE UNIQUE INDEX IF NOT EXISTS "follows_unique" ON "follows"("follower_id", "following_id");

CREATE INDEX IF NOT EXISTS "post_reports_post_id_idx" ON "post_reports"("post_id");
CREATE INDEX IF NOT EXISTS "post_reports_reporter_id_idx" ON "post_reports"("reporter_id");
CREATE INDEX IF NOT EXISTS "post_reports_status_idx" ON "post_reports"("status");

CREATE INDEX IF NOT EXISTS "trending_topics_hashtag_idx" ON "trending_topics"("hashtag");
CREATE INDEX IF NOT EXISTS "trending_topics_engagement_score_idx" ON "trending_topics"("engagement_score" DESC);
CREATE INDEX IF NOT EXISTS "trending_topics_is_active_idx" ON "trending_topics"("is_active");

CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications"("is_read");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications"("type");
