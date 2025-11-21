/**
 * Spiritual Formation Frontend Types
 * Types for spiritual formation components and features
 */

import type {
  DailyDevotion,
  DevotionCompletion,
  DevotionStreak,
  ScripturePassage
} from './devotion';

import type {
  PrayerEntry,
  PrayerRequest,
  PrayerCategory,
  PrayerAnalytics,
  AnsweredPrayer
} from './prayer';

import type {
  MemoryVerse,
  VerseProgress,
  MemoryStatistics,
  MemorizationChallenge
} from './scripture-memory';

import type {
  PropheticCheckIn,
  SpiritualGrowthTracking,
  PropheticGuidance,
  SpiritualGiftIdentification,
  CallingDiscernment
} from './prophetic-checkin';

// Re-export types for convenience
export type {
  DailyDevotion,
  DevotionCompletion,
  DevotionStreak,
  ScripturePassage,
  PrayerEntry,
  PrayerRequest,
  PrayerCategory,
  PrayerAnalytics,
  AnsweredPrayer,
  MemoryVerse,
  VerseProgress,
  MemoryStatistics,
  MemorizationChallenge,
  PropheticCheckIn,
  SpiritualGrowthTracking,
  PropheticGuidance,
  SpiritualGiftIdentification,
  CallingDiscernment
};

/**
 * Spiritual Formation Dashboard Data
 */
export interface SpiritualFormationDashboard {
  todaysDevotion: DailyDevotion | null;
  devotionStreak: DevotionStreak;
  recentPrayers: PrayerEntry[];
  prayerAnalytics: PrayerAnalytics;
  scriptureMemory: MemoryStatistics;
  recentCheckIn: PropheticCheckIn | null;
  growthTracking: SpiritualGrowthTracking | null;
  upcomingReminders: SpiritualReminder[];
}

/**
 * Spiritual Reminder
 */
export interface SpiritualReminder {
  id: string;
  type: 'devotion' | 'prayer' | 'scripture' | 'check-in';
  title: string;
  description: string;
  scheduledFor: Date;
  completed: boolean;
}

/**
 * Spiritual Mentor Connection
 */
export interface SpiritualMentor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  specialties: string[];
  bio: string;
  availability: string;
  matchScore: number;
}

/**
 * Growth Visualization Data
 */
export interface GrowthVisualization {
  type: 'line' | 'radar' | 'bar' | 'gauge';
  title: string;
  data: GrowthDataPoint[];
  categories?: string[];
}

export interface GrowthDataPoint {
  label: string;
  value: number;
  date?: Date;
  category?: string;
}

/**
 * Component Props Types
 */
export interface SpiritualFormationHubProps {
  userId: string;
}

export interface DevotionReaderProps {
  devotion: DailyDevotion;
  completion?: DevotionCompletion;
  onComplete: (notes?: string, rating?: number) => Promise<void>;
  onShare: () => void;
}

export interface PrayerJournalProps {
  userId: string;
  entries: PrayerEntry[];
  onCreateEntry: (entry: Partial<PrayerEntry>) => Promise<void>;
  onUpdateEntry: (id: string, updates: Partial<PrayerEntry>) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
}

export interface ScriptureMemoryProps {
  userId: string;
  verses: MemoryVerse[];
  progress: VerseProgress[];
  statistics: MemoryStatistics;
  onPractice: (verseId: string) => void;
  onReview: (verseId: string, correct: boolean) => Promise<void>;
}

export interface PropheticCheckInProps {
  userId: string;
  lastCheckIn?: PropheticCheckIn;
  onSubmit: (checkIn: Partial<PropheticCheckIn>) => Promise<void>;
}

export interface GrowthVisualizationProps {
  tracking: SpiritualGrowthTracking;
  timeRange: 'week' | 'month' | 'quarter' | 'year';
}

export interface MentorConnectionProps {
  userId: string;
  mentors: SpiritualMentor[];
  onConnect: (mentorId: string) => Promise<void>;
  onMessage: (mentorId: string) => void;
}
