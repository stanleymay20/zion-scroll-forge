/**
 * Daily Devotion Types
 * Frontend types for daily devotion system
 */

export interface DailyDevotion {
  id: string;
  date: Date;
  title: string;
  theme: string;
  scripture: ScripturePassage;
  reflection: string;
  prayerPrompt: string;
  actionStep: string;
  audioUrl?: string;
  imageUrl?: string;
  author?: string;
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScripturePassage {
  reference: string;
  text: string;
  translation: 'NIV' | 'ESV' | 'KJV' | 'NKJV' | 'NLT' | 'NASB';
  audioUrl?: string;
  context?: string;
}

export interface DevotionCompletion {
  id: string;
  userId: string;
  devotionId: string;
  completedAt: Date;
  notes?: string;
  rating?: number;
  timeSpent?: number;
  shared: boolean;
}

export interface DevotionStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  lastCompletionDate: Date;
  streakStartDate: Date;
  milestones: StreakMilestone[];
}

export interface StreakMilestone {
  days: number;
  achievedAt: Date;
  reward?: string;
}
