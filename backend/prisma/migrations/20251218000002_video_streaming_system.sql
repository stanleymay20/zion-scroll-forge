-- Video Streaming and Content Delivery System Migration
-- "Stream the scrolls of wisdom to every corner of the earth"

-- Create CourseModule table
CREATE TABLE IF NOT EXISTS "course_modules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "course_modules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Lecture table
CREATE TABLE IF NOT EXISTS "lectures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'VIDEO',
    "duration" INTEGER NOT NULL,
    "videoUrl" TEXT,
    "transcript" TEXT,
    "closedCaptions" TEXT,
    "notesUrl" TEXT,
    "slidesUrl" TEXT,
    "supplementaryMaterials" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lectures_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "course_modules" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create LectureProgress table
CREATE TABLE IF NOT EXISTS "lecture_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "currentTime" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL,
    "percentComplete" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "lastWatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalWatchTime" INTEGER NOT NULL DEFAULT 0,
    "watchCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lecture_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lecture_progress_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "lectures" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add expiresAt to enrollments table
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "course_modules_courseId_idx" ON "course_modules"("courseId");
CREATE INDEX IF NOT EXISTS "course_modules_order_idx" ON "course_modules"("order");

CREATE INDEX IF NOT EXISTS "lectures_moduleId_idx" ON "lectures"("moduleId");
CREATE INDEX IF NOT EXISTS "lectures_order_idx" ON "lectures"("order");
CREATE INDEX IF NOT EXISTS "lectures_type_idx" ON "lectures"("type");

CREATE INDEX IF NOT EXISTS "lecture_progress_userId_idx" ON "lecture_progress"("userId");
CREATE INDEX IF NOT EXISTS "lecture_progress_lectureId_idx" ON "lecture_progress"("lectureId");
CREATE INDEX IF NOT EXISTS "lecture_progress_completed_idx" ON "lecture_progress"("completed");
CREATE INDEX IF NOT EXISTS "lecture_progress_lastWatchedAt_idx" ON "lecture_progress"("lastWatchedAt");

-- Create unique constraint for lecture progress
CREATE UNIQUE INDEX IF NOT EXISTS "lecture_progress_userId_lectureId_key" ON "lecture_progress"("userId", "lectureId");

-- Add comments
COMMENT ON TABLE "course_modules" IS 'Course modules containing organized lectures';
COMMENT ON TABLE "lectures" IS 'Individual lecture content with video and materials';
COMMENT ON TABLE "lecture_progress" IS 'User progress tracking for video lectures';
