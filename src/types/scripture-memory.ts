/**
 * Scripture Memory Types
 * Frontend types for scripture memorization system
 */

export interface MemoryVerse {
  id: string;
  reference: string;
  text: string;
  translation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerseProgress {
  id: string;
  userId: string;
  verseId: string;
  nextReviewDate: Date;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  masteryLevel: number;
  masteryStatus: 'beginner' | 'learning' | 'familiar' | 'proficient' | 'mastered';
  lastReviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryStatistics {
  totalVerses: number;
  versesInProgress: number;
  versesMastered: number;
  currentStreak: number;
  longestStreak: number;
  totalReviews: number;
  averageAccuracy: number;
  scrollCoinEarned: number;
  challengesCompleted: number;
  rank?: number;
}

export interface MemorizationChallenge {
  id: string;
  title: string;
  description: string;
  verseIds: string[];
  startDate: Date;
  endDate: Date;
  participantCount: number;
  scrollCoinReward: number;
  badgeReward?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  verseId: string;
  format: 'fill_in_blank' | 'multiple_choice' | 'recitation' | 'typing';
  question: string;
  correctAnswer: string;
  options?: string[];
  hints?: string[];
}
