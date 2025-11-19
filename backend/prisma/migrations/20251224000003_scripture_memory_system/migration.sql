-- Scripture Memory System Migration
-- Implements comprehensive scripture memorization with spaced repetition

-- Memory verses library
CREATE TABLE IF NOT EXISTS "MemoryVerse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "translation" TEXT NOT NULL DEFAULT 'NIV',
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL CHECK ("difficulty" IN ('easy', 'medium', 'hard')),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- User verse progress with spaced repetition
CREATE TABLE IF NOT EXISTS "VerseProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "verseId" TEXT NOT NULL,
    "nextReviewDate" TIMESTAMP(3) NOT NULL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "incorrectCount" INTEGER NOT NULL DEFAULT 0,
    "masteryLevel" INTEGER NOT NULL DEFAULT 0 CHECK ("masteryLevel" >= 0 AND "masteryLevel" <= 100),
    "masteryStatus" TEXT NOT NULL DEFAULT 'beginner' CHECK ("masteryStatus" IN ('beginner', 'learning', 'familiar', 'proficient', 'mastered')),
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VerseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VerseProgress_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "MemoryVerse"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Memory quizzes for different formats
CREATE TABLE IF NOT EXISTS "MemoryQuiz" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "verseId" TEXT NOT NULL,
    "format" TEXT NOT NULL CHECK ("format" IN ('fill_in_blank', 'multiple_choice', 'recitation', 'typing')),
    "question" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "blanks" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "hints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemoryQuiz_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "MemoryVerse"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Quiz attempts tracking
CREATE TABLE IF NOT EXISTS "QuizAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "verseId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizAttempt_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "MemoryVerse"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "MemoryQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Memorization challenges
CREATE TABLE IF NOT EXISTS "MemorizationChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "verseIds" TEXT[] NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "participantCount" INTEGER NOT NULL DEFAULT 0,
    "scrollCoinReward" INTEGER NOT NULL DEFAULT 0,
    "badgeReward" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemorizationChallenge_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Challenge participation tracking
CREATE TABLE IF NOT EXISTS "ChallengeParticipation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0 CHECK ("progress" >= 0 AND "progress" <= 100),
    "versesCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalVerses" INTEGER NOT NULL,
    "rank" INTEGER,
    "completedAt" TIMESTAMP(3),
    "scrollCoinEarned" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChallengeParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChallengeParticipation_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "MemorizationChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Shared verses for social features
CREATE TABLE IF NOT EXISTS "SharedVerse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "verseId" TEXT NOT NULL,
    "caption" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SharedVerse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SharedVerse_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "MemoryVerse"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS "MemoryVerse_category_idx" ON "MemoryVerse"("category");
CREATE INDEX IF NOT EXISTS "MemoryVerse_difficulty_idx" ON "MemoryVerse"("difficulty");
CREATE INDEX IF NOT EXISTS "MemoryVerse_translation_idx" ON "MemoryVerse"("translation");
CREATE INDEX IF NOT EXISTS "MemoryVerse_reference_idx" ON "MemoryVerse"("reference");

CREATE UNIQUE INDEX IF NOT EXISTS "VerseProgress_userId_verseId_key" ON "VerseProgress"("userId", "verseId");
CREATE INDEX IF NOT EXISTS "VerseProgress_userId_idx" ON "VerseProgress"("userId");
CREATE INDEX IF NOT EXISTS "VerseProgress_nextReviewDate_idx" ON "VerseProgress"("nextReviewDate");
CREATE INDEX IF NOT EXISTS "VerseProgress_masteryStatus_idx" ON "VerseProgress"("masteryStatus");

CREATE INDEX IF NOT EXISTS "MemoryQuiz_verseId_idx" ON "MemoryQuiz"("verseId");
CREATE INDEX IF NOT EXISTS "MemoryQuiz_format_idx" ON "MemoryQuiz"("format");

CREATE INDEX IF NOT EXISTS "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");
CREATE INDEX IF NOT EXISTS "QuizAttempt_verseId_idx" ON "QuizAttempt"("verseId");
CREATE INDEX IF NOT EXISTS "QuizAttempt_attemptedAt_idx" ON "QuizAttempt"("attemptedAt");

CREATE INDEX IF NOT EXISTS "MemorizationChallenge_isActive_idx" ON "MemorizationChallenge"("isActive");
CREATE INDEX IF NOT EXISTS "MemorizationChallenge_startDate_idx" ON "MemorizationChallenge"("startDate");
CREATE INDEX IF NOT EXISTS "MemorizationChallenge_endDate_idx" ON "MemorizationChallenge"("endDate");

CREATE UNIQUE INDEX IF NOT EXISTS "ChallengeParticipation_userId_challengeId_key" ON "ChallengeParticipation"("userId", "challengeId");
CREATE INDEX IF NOT EXISTS "ChallengeParticipation_challengeId_idx" ON "ChallengeParticipation"("challengeId");
CREATE INDEX IF NOT EXISTS "ChallengeParticipation_progress_idx" ON "ChallengeParticipation"("progress");

CREATE INDEX IF NOT EXISTS "SharedVerse_userId_idx" ON "SharedVerse"("userId");
CREATE INDEX IF NOT EXISTS "SharedVerse_verseId_idx" ON "SharedVerse"("verseId");
CREATE INDEX IF NOT EXISTS "SharedVerse_isPublic_idx" ON "SharedVerse"("isPublic");
CREATE INDEX IF NOT EXISTS "SharedVerse_sharedAt_idx" ON "SharedVerse"("sharedAt");

-- Comments for documentation
COMMENT ON TABLE "MemoryVerse" IS 'Library of scripture verses available for memorization';
COMMENT ON TABLE "VerseProgress" IS 'User progress tracking with spaced repetition algorithm';
COMMENT ON TABLE "MemoryQuiz" IS 'Quiz questions in various formats for verse memorization';
COMMENT ON TABLE "QuizAttempt" IS 'Historical record of user quiz attempts';
COMMENT ON TABLE "MemorizationChallenge" IS 'Community challenges for scripture memorization';
COMMENT ON TABLE "ChallengeParticipation" IS 'User participation in memorization challenges';
COMMENT ON TABLE "SharedVerse" IS 'Social sharing of memorized verses';
