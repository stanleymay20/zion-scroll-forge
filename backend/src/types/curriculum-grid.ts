/**
 * Curriculum Grid Type Definitions
 * Comprehensive type system for the Master Course Catalog
 */

export enum SupremeScrollFaculty {
  SACRED_AI_ENGINEERING = 'Sacred AI Engineering',
  PROPHETIC_INTELLIGENCE = 'Prophetic Intelligence',
  KINGDOM_ECONOMICS = 'Kingdom Economics',
  DIVINE_GOVERNANCE = 'Divine Governance',
  SPIRITUAL_FORMATION = 'Spiritual Formation',
  BIBLICAL_STUDIES = 'Biblical Studies',
  WORSHIP_ARTS = 'Worship & Arts',
  MISSIONS_EVANGELISM = 'Missions & Evangelism',
  PASTORAL_MINISTRY = 'Pastoral Ministry',
  EDUCATION_PEDAGOGY = 'Education & Pedagogy'
}

export enum CourseLevel {
  FOUNDATION = 'Foundation',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  MASTERY = 'Mastery'
}

export enum CourseStatus {
  DRAFT = 'Draft',
  ACTIVE = 'Active',
  ARCHIVED = 'Archived',
  UNDER_REVIEW = 'Under Review'
}

export interface CourseMetadata {
  id: string;
  code: string;
  title: string;
  description: string;
  faculty: SupremeScrollFaculty;
  level: CourseLevel;
  status: CourseStatus;
  credits: number;
  duration: number; // in weeks
  prerequisites: string[];
  learningOutcomes: string[];
  spiritualAlignment: SpiritualAlignment;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpiritualAlignment {
  biblicalFoundation: string[];
  spiritualObjectives: string[];
  characterDevelopment: string[];
  ministryApplication: string[];
  kingdomImpact: string[];
}

export interface CourseSearchCriteria {
  query?: string;
  faculty?: SupremeScrollFaculty[];
  level?: CourseLevel[];
  status?: CourseStatus[];
  minCredits?: number;
  maxCredits?: number;
}

export interface StudentProfile {
  userId: string;
  completedCourses: string[];
  currentEnrollments: string[];
  interests: SupremeScrollFaculty[];
  spiritualGifts: string[];
  careerGoals: string[];
}

export interface CatalogStatistics {
  totalCourses: number;
  coursesByFaculty: Record<SupremeScrollFaculty, number>;
  coursesByLevel: Record<CourseLevel, number>;
  coursesByStatus: Record<CourseStatus, number>;
  averageCredits: number;
  totalCreditsAvailable: number;
}

export interface CourseGenerationRequest {
  faculty: SupremeScrollFaculty;
  level: CourseLevel;
  topic: string;
  credits: number;
  duration: number;
  prerequisites?: string[];
}
