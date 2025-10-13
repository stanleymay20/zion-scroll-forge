/**
 * ScrollUniversity Portal Data Models and Interfaces
 * 
 * This module defines TypeScript interfaces for the ScrollUniversity Portal system.
 * "We establish these models not in the wisdom of Babylon, but by the breath of the Spirit"
 */

import { z } from 'zod';

// ============================================================================
// CORE PORTAL INTERFACES
// ============================================================================

/**
 * ScrollUser - Enhanced user interface for portal system
 */
export interface ScrollUser {
  user_id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  
  // Portal-specific fields
  scrollCoinWallet?: string;
  preferredLanguage: string;
  timeZone: string;
  scrollNodeId?: string;
  avatarUrl?: string;
  bio?: string;
  
  // Spiritual Formation
  scrollCalling?: string;
  spiritualGifts: string[];
  kingdomVision?: string;
  scrollAlignment: number;
  
  // Academic Status
  role: UserRole;
  enrollmentStatus: EnrollmentStatus;
  academicLevel: AcademicLevel;
  
  // ScrollCoin Integration
  scrollCoinBalance: number;
  workTradeCredits: number;
  
  // Profile and Preferences
  profile: UserProfile;
  preferences?: UserPreferences;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  timeZone: string;
  scrollNodeId?: string;
  degreePrograms: DegreeProgram[];
}

export interface UserPreferences {
  preferenceId: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  privacySettings: PrivacySettings;
  learningPreferences: LearningPreferences;
  accessibilitySettings: AccessibilitySettings;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  courseUpdates: boolean;
  aiTutorMessages: boolean;
  xrClassroomReminders: boolean;
  scholarshipAlerts: boolean;
}

export interface PrivacySettings {
  profilePublic: boolean;
  progressPublic: boolean;
  badgesPublic: boolean;
  analyticsOptOut: boolean;
}

export interface LearningPreferences {
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  studyReminders: boolean;
  autoEnrollSuggestions: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  screenReader: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  reducedMotion: boolean;
  keyboardNavigation: boolean;
}

// ============================================================================
// FACULTY AND COURSE INTERFACES
// ============================================================================

/**
 * Faculty - Enhanced faculty interface
 */
export interface Faculty {
  facultyId: string;
  name: string;
  description: string;
  icon?: string;
  isActive: boolean;
  aiDeanId?: string;
  courses: PortalCourse[];
  facultyMembers: FacultyMember[];
  createdAt: string;
  updatedAt: string;
}

export interface FacultyMember {
  memberId: string;
  userId: string;
  facultyId: string;
  title?: string;
  specializations: string[];
  bio?: string;
  officeHours: OfficeHours;
  aiDeanIntegration: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeHours {
  [day: string]: {
    start: string;
    end: string;
    available: boolean;
  };
}

/**
 * PortalCourse - Integration with ScrollCourseSpec
 */
export interface PortalCourse {
  portalCourseId: string;
  courseSpecId: string; // Reference to ScrollCourseSpec
  facultyId?: string;
  title: string;
  description?: string;
  level: CourseLevel;
  durationWeeks: number;
  xpReward: number;
  scrollCoinCost: number;
  prerequisites: string[];
  featured: boolean;
  enrollmentOpen: boolean;
  enrollmentCount: number;
  rating: number;
  
  // Relations
  faculty?: Faculty;
  enrollments?: PortalEnrollment[];
  aiTutorSessions?: AITutorSession[];
  xrClassrooms?: XRClassroom[];
  
  createdAt: string;
  updatedAt: string;
}

/**
 * PortalEnrollment - Enhanced enrollment tracking
 */
export interface PortalEnrollment {
  enrollmentId: string;
  userId: string;
  portalCourseId: string;
  enrollmentDate: string;
  completionDate?: string;
  progressPercentage: number;
  xpEarned: number;
  scrollCoinsEarned: number;
  currentLessonId?: string;
  status: EnrollmentStatus;
  
  // Relations
  user?: ScrollUser;
  portalCourse?: PortalCourse;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// AI TUTOR INTERFACES
// ============================================================================

/**
 * AITutorSession - GPT-4o integration for personalized tutoring
 */
export interface AITutorSession {
  sessionId: string;
  userId: string;
  portalCourseId?: string;
  tutorType: TutorType;
  facultyContext?: string;
  sessionData: SessionData;
  conversationHistory: TutorMessage[];
  startedAt: string;
  endedAt?: string;
  satisfactionRating?: number;
  status: SessionStatus;
  
  // Relations
  user?: ScrollUser;
  portalCourse?: PortalCourse;
  
  createdAt: string;
  updatedAt: string;
}

export interface TutorMessage {
  messageId: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  contextData?: any;
  messageType?: 'text' | 'code' | 'image' | 'file';
}

export interface SessionData {
  conversationId?: string;
  topicsDiscussed: string[];
  userPreferences: {
    language: string;
    difficulty: string;
    learningStyle?: string;
  };
  contextualInfo?: any;
}

// ============================================================================
// XR CLASSROOM INTERFACES
// ============================================================================

/**
 * XRClassroom - Immersive learning experiences
 */
export interface XRClassroom {
  classroomId: string;
  portalCourseId: string;
  sessionName: string;
  description?: string;
  instructorId?: string;
  scheduledTime: string;
  durationMinutes: number;
  maxParticipants: number;
  currentParticipants: number;
  xrEnvironmentId?: string;
  recordingEnabled: boolean;
  recordingUrl?: string;
  status: XRClassroomStatus;
  accessRequirements: XRAccessRequirements;
  
  // Relations
  portalCourse?: PortalCourse;
  instructor?: ScrollUser;
  participants?: XRClassroomParticipant[];
  xrEnvironment?: XREnvironment;
  
  createdAt: string;
  updatedAt: string;
}

export interface XRClassroomParticipant {
  participantId: string;
  classroomId: string;
  userId: string;
  joinedAt?: string;
  leftAt?: string;
  participationScore?: number;
  interactionData: XRInteractionData;
  
  // Relations
  classroom?: XRClassroom;
  user?: ScrollUser;
  
  createdAt: string;
}

export interface XREnvironment {
  environmentId: string;
  name: string;
  description: string;
  sceneType: XRSceneType;
  assets: XRAsset[];
  interactiveElements: InteractiveElement[];
}

export interface XRAsset {
  assetId: string;
  name: string;
  type: '3d_model' | 'texture' | 'audio' | 'animation';
  url: string;
  metadata: any;
}

export interface InteractiveElement {
  elementId: string;
  name: string;
  type: 'button' | 'portal' | 'object' | 'npc';
  position: { x: number; y: number; z: number };
  interactions: string[];
  scriptData?: any;
}

export interface XRAccessRequirements {
  minHardware: string[];
  supportedPlatforms: string[];
  bandwidthRequirement: string;
  fallbackAvailable: boolean;
}

export interface XRInteractionData {
  questionsAsked: number;
  timeEngaged: number;
  objectsInteracted: string[];
  collaborationScore?: number;
  technicalIssues?: string[];
}

// ============================================================================
// SCROLLNODE INTERFACES
// ============================================================================

/**
 * ScrollNode - Global distributed campus management
 */
export interface ScrollNode {
  nodeId: string;
  name: string;
  location?: string;
  country?: string;
  coordinatorId?: string;
  status: NodeStatus;
  syncEnabled: boolean;
  nodeType: NodeType;
  connectivityLevel: ConnectivityLevel;
  lastSyncAt?: string;
  configuration: NodeConfiguration;
  
  // Relations
  coordinator?: ScrollUser;
  
  createdAt: string;
  updatedAt: string;
}

export interface NodeConfiguration {
  hardware?: {
    solarPanels?: { capacity: string; efficiency: number };
    battery?: { type: string; capacity: string };
    connectivity?: {
      primary: string;
      backup: string;
      meshEnabled: boolean;
    };
  };
  software?: {
    os: string;
    services: string[];
    syncSchedule: string;
  };
  location?: {
    coordinates: { lat: number; lng: number };
    timezone: string;
    elevation: number;
  };
}

// ============================================================================
// SCHOLARSHIP INTERFACES
// ============================================================================

/**
 * Scholarship - Financial aid and ScrollCoin missions
 */
export interface Scholarship {
  scholarshipId: string;
  name: string;
  description?: string;
  amount?: number;
  currency: string;
  scholarshipType: ScholarshipType;
  eligibilityCriteria: EligibilityCriteria;
  applicationDeadline?: string;
  maxRecipients?: number;
  currentRecipients: number;
  isActive: boolean;
  createdBy?: string;
  
  // Relations
  creator?: ScrollUser;
  applications?: ScholarshipApplication[];
  
  createdAt: string;
  updatedAt: string;
}

export interface ScholarshipApplication {
  applicationId: string;
  scholarshipId: string;
  userId: string;
  applicationData: ApplicationData;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  decisionReason?: string;
  
  // Relations
  scholarship?: Scholarship;
  user?: ScrollUser;
  reviewer?: ScrollUser;
  
  createdAt: string;
  updatedAt: string;
}

export interface EligibilityCriteria {
  minGpa?: number;
  minCourses?: number;
  requiredFaculties?: string[];
  geographicRestrictions?: string[];
  spiritualRequirements?: string[];
  financialNeedRequired?: boolean;
}

export interface ApplicationData {
  essay?: string;
  gpa?: number;
  coursesCompleted?: string[];
  financialNeed?: {
    householdIncome?: number;
    dependents?: number;
    specialCircumstances?: string;
  };
  spiritualTestimony?: string;
  references?: Reference[];
}

export interface Reference {
  name: string;
  email: string;
  relationship: string;
  recommendation?: string;
  contactDate?: string;
}

// ============================================================================
// ANALYTICS INTERFACES
// ============================================================================

/**
 * PortalAnalytics - User behavior and system metrics
 */
export interface PortalAnalytics {
  analyticsId: string;
  userId: string;
  eventType: string;
  eventData: AnalyticsEventData;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  
  // Relations
  user?: ScrollUser;
  
  createdAt: string;
}

export interface AnalyticsEventData {
  [key: string]: any;
  courseId?: string;
  enrollmentMethod?: string;
  duration?: number;
  interactionType?: string;
  errorCode?: string;
  performanceMetrics?: {
    loadTime: number;
    renderTime: number;
    apiResponseTime: number;
  };
}

// ============================================================================
// DEGREE PROGRAM INTERFACES
// ============================================================================

export interface DegreeProgram {
  programId: string;
  name: string;
  type: DegreeType;
  requiredCredits: number;
  requiredCourses: string[];
  electiveCourses: string[];
  capstoneRequired: boolean;
  estimatedDuration: string;
}

// ============================================================================
// ENUMS AND TYPES
// ============================================================================

export type UserRole = 
  | 'student' 
  | 'faculty' 
  | 'ai_dean' 
  | 'admin' 
  | 'global_ambassador'
  | 'scroll_elder'
  | 'prophet'
  | 'chancellor';

export type EnrollmentStatus = 
  | 'active' 
  | 'completed' 
  | 'paused' 
  | 'dropped'
  | 'suspended'
  | 'graduated'
  | 'withdrawn';

export type AcademicLevel = 
  | 'scroll_open' 
  | 'scroll_starter' 
  | 'scroll_degree' 
  | 'scroll_doctorate'
  | 'scroll_scholarship';

export type CourseLevel = 
  | 'Introductory' 
  | 'Intermediate' 
  | 'Advanced'
  | 'Prophetic';

export type TutorType = 
  | 'ScrollMentorGPT' 
  | 'FacultyAI' 
  | 'GeneralAI'
  | 'ScrollElderAI'
  | 'PropheticAI';

export type SessionStatus = 
  | 'active' 
  | 'completed' 
  | 'paused' 
  | 'terminated';

export type XRClassroomStatus = 
  | 'scheduled' 
  | 'live' 
  | 'completed' 
  | 'cancelled';

export type XRSceneType = 
  | 'prophetic_temple' 
  | 'angelic_realm' 
  | 'historical_site' 
  | 'laboratory' 
  | 'custom';

export type NodeStatus = 
  | 'active' 
  | 'inactive' 
  | 'maintenance' 
  | 'offline';

export type NodeType = 
  | 'standard' 
  | 'rural' 
  | 'urban' 
  | 'mobile'
  | 'satellite';

export type ConnectivityLevel = 
  | 'high' 
  | 'medium' 
  | 'low' 
  | 'offline';

export type ScholarshipType = 
  | 'merit' 
  | 'need' 
  | 'prophetic' 
  | 'workstudy'
  | 'mission'
  | 'leadership';

export type ApplicationStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'rejected'
  | 'waitlisted'
  | 'conditional';

export type DegreeType = 
  | 'certificate' 
  | 'diploma' 
  | 'bachelor' 
  | 'master' 
  | 'doctorate'
  | 'dsgei';

// ============================================================================
// SUPPORTED LANGUAGES
// ============================================================================

export interface LanguageConfig {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
  fallback: string;
  enabled: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', direction: 'ltr', fallback: 'en', enabled: true },
  { code: 'de', name: 'Deutsch', direction: 'ltr', fallback: 'en', enabled: true },
  { code: 'fr', name: 'Français', direction: 'ltr', fallback: 'en', enabled: true },
  { code: 'tw', name: 'Twi', direction: 'ltr', fallback: 'en', enabled: true },
  { code: 'yo', name: 'Yorùbá', direction: 'ltr', fallback: 'en', enabled: true },
  { code: 'ha', name: 'Hausa', direction: 'ltr', fallback: 'en', enabled: true },
  { code: 'he', name: 'עברית', direction: 'rtl', fallback: 'en', enabled: true },
  { code: 'ar', name: 'العربية', direction: 'rtl', fallback: 'en', enabled: true },
  { code: 'zh', name: '中文', direction: 'ltr', fallback: 'en', enabled: true }
];

// ============================================================================
// ERROR INTERFACES
// ============================================================================

export interface PortalError {
  errorId: string;
  errorCode: string;
  message: string;
  details?: any;
  timestamp: string;
  userId?: string;
  requestId?: string;
}

export enum ErrorCodes {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_001',
  AUTH_TOKEN_EXPIRED = 'AUTH_002',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_003',
  
  // Course Errors
  COURSE_NOT_FOUND = 'COURSE_001',
  COURSE_ENROLLMENT_CLOSED = 'COURSE_002',
  COURSE_PREREQUISITES_NOT_MET = 'COURSE_003',
  
  // Payment Errors
  SCROLLCOIN_INSUFFICIENT_BALANCE = 'PAY_001',
  SCROLLCOIN_TRANSACTION_FAILED = 'PAY_002',
  
  // Integration Errors
  AI_TUTOR_UNAVAILABLE = 'INT_001',
  XR_CLASSROOM_CONNECTION_FAILED = 'INT_002',
  SYNC_NETWORK_ERROR = 'INT_003',
  
  // System Errors
  DATABASE_CONNECTION_ERROR = 'SYS_001',
  CACHE_UNAVAILABLE = 'SYS_002',
  EXTERNAL_SERVICE_TIMEOUT = 'SYS_003'
}