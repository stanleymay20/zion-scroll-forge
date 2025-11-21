/**
 * Prayer Journal Types
 * Frontend types for prayer journal and requests
 */

export interface PrayerEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: PrayerCategory;
  isPrivate: boolean;
  tags: string[];
  answered: boolean;
  answeredDate?: Date;
  testimony?: string;
  prayerPartners: string[];
  prayerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum PrayerCategory {
  PERSONAL = 'personal',
  FAMILY = 'family',
  MINISTRY = 'ministry',
  HEALING = 'healing',
  GUIDANCE = 'guidance',
  PROVISION = 'provision',
  SALVATION = 'salvation',
  THANKSGIVING = 'thanksgiving',
  INTERCESSION = 'intercession',
  REPENTANCE = 'repentance',
  SPIRITUAL_WARFARE = 'spiritual_warfare',
  KINGDOM_ADVANCEMENT = 'kingdom_advancement'
}

export interface PrayerRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: PrayerCategory;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  isAnonymous: boolean;
  prayerCount: number;
  intercessors: string[];
  status: 'active' | 'answered' | 'closed' | 'archived';
  answered: boolean;
  answeredDate?: Date;
  testimony?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnsweredPrayer {
  id: string;
  prayerEntryId?: string;
  prayerRequestId?: string;
  userId: string;
  title: string;
  originalRequest: string;
  testimony: string;
  answeredDate: Date;
  timeToAnswer: number;
  category: PrayerCategory;
  isPublic: boolean;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrayerAnalytics {
  userId: string;
  totalPrayers: number;
  activePrayers: number;
  answeredPrayers: number;
  answerRate: number;
  averageTimeToAnswer: number;
  prayersByCategory: Record<PrayerCategory, number>;
  currentStreak: number;
  longestStreak: number;
}
