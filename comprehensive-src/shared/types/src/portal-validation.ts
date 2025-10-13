/**
 * ScrollUniversity Portal Validation Schemas
 * 
 * This module defines Zod validation schemas for runtime type checking.
 * "We establish these validations not in the wisdom of Babylon, but by the breath of the Spirit"
 */

import { z } from 'zod';

// ============================================================================
// BASIC VALIDATION SCHEMAS
// ============================================================================

export const UserRoleSchema = z.enum([
  'student',
  'faculty', 
  'ai_dean',
  'admin',
  'global_ambassador',
  'scroll_elder',
  'prophet',
  'chancellor'
]);

export const EnrollmentStatusSchema = z.enum([
  'active',
  'completed',
  'paused',
  'dropped',
  'suspended',
  'graduated',
  'withdrawn'
]);

export const AcademicLevelSchema = z.enum([
  'scroll_open',
  'scroll_starter',
  'scroll_degree',
  'scroll_doctorate',
  'scroll_scholarship'
]);

export const CourseLevelSchema = z.enum([
  'Introductory',
  'Intermediate',
  'Advanced',
  'Prophetic'
]);

export const TutorTypeSchema = z.enum([
  'ScrollMentorGPT',
  'FacultyAI',
  'GeneralAI',
  'ScrollElderAI',
  'PropheticAI'
]);

export const SessionStatusSchema = z.enum([
  'active',
  'completed',
  'paused',
  'terminated'
]);

export const XRClassroomStatusSchema = z.enum([
  'scheduled',
  'live',
  'completed',
  'cancelled'
]);

export const NodeStatusSchema = z.enum([
  'active',
  'inactive',
  'maintenance',
  'offline'
]);

export const NodeTypeSchema = z.enum([
  'standard',
  'rural',
  'urban',
  'mobile',
  'satellite'
]);

export const ConnectivityLevelSchema = z.enum([
  'high',
  'medium',
  'low',
  'offline'
]);

export const ScholarshipTypeSchema = z.enum([
  'merit',
  'need',
  'prophetic',
  'workstudy',
  'mission',
  'leadership'
]);

export const ApplicationStatusSchema = z.enum([
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'waitlisted',
  'conditional'
]);

// ============================================================================
// USER VALIDATION SCHEMAS
// ============================================================================

export const UserProfileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  timeZone: z.string().min(1),
  scrollNodeId: z.string().optional(),
  degreePrograms: z.array(z.any()).default([])
});

export const NotificationSettingsSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  sms: z.boolean().default(false),
  courseUpdates: z.boolean().default(true),
  aiTutorMessages: z.boolean().default(true),
  xrClassroomReminders: z.boolean().default(true),
  scholarshipAlerts: z.boolean().default(true)
});

export const PrivacySettingsSchema = z.object({
  profilePublic: z.boolean().default(true),
  progressPublic: z.boolean().default(false),
  badgesPublic: z.boolean().default(true),
  analyticsOptOut: z.boolean().default(false)
});

export const LearningPreferencesSchema = z.object({
  preferredDifficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'mixed']).default('mixed'),
  studyReminders: z.boolean().default(true),
  autoEnrollSuggestions: z.boolean().default(true)
});

export const AccessibilitySettingsSchema = z.object({
  highContrast: z.boolean().default(false),
  screenReader: z.boolean().default(false),
  fontSize: z.enum(['small', 'medium', 'large', 'extra-large']).default('medium'),
  reducedMotion: z.boolean().default(false),
  keyboardNavigation: z.boolean().default(false)
});

export const UserPreferencesSchema = z.object({
  preferenceId: z.string().uuid(),
  userId: z.string().min(1),
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  notifications: NotificationSettingsSchema,
  privacySettings: PrivacySettingsSchema,
  learningPreferences: LearningPreferencesSchema,
  accessibilitySettings: AccessibilitySettingsSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const ScrollUserSchema = z.object({
  user_id: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(3).max(50),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  
  // Portal-specific fields
  scrollCoinWallet: z.string().optional(),
  preferredLanguage: z.string().length(2).default('en'),
  timeZone: z.string().default('UTC'),
  scrollNodeId: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(1000).optional(),
  
  // Spiritual Formation
  scrollCalling: z.string().optional(),
  spiritualGifts: z.array(z.string()).default([]),
  kingdomVision: z.string().optional(),
  scrollAlignment: z.number().min(0).max(1).default(0),
  
  // Academic Status
  role: UserRoleSchema.default('student'),
  enrollmentStatus: EnrollmentStatusSchema.default('active'),
  academicLevel: AcademicLevelSchema.default('scroll_open'),
  
  // ScrollCoin Integration
  scrollCoinBalance: z.number().min(0).default(0),
  workTradeCredits: z.number().min(0).default(0),
  
  // Profile and Preferences
  profile: UserProfileSchema,
  preferences: UserPreferencesSchema.optional(),
  
  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().optional()
});

// ============================================================================
// COURSE VALIDATION SCHEMAS
// ============================================================================

export const OfficeHoursSchema = z.record(
  z.string(),
  z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    available: z.boolean()
  })
);

export const FacultyMemberSchema = z.object({
  memberId: z.string().uuid(),
  userId: z.string().min(1),
  facultyId: z.string().min(1),
  title: z.string().max(100).optional(),
  specializations: z.array(z.string()).default([]),
  bio: z.string().max(2000).optional(),
  officeHours: OfficeHoursSchema.default({}),
  aiDeanIntegration: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const FacultySchema = z.object({
  facultyId: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  icon: z.string().url().optional(),
  isActive: z.boolean().default(true),
  aiDeanId: z.string().optional(),
  courses: z.array(z.any()).default([]),
  facultyMembers: z.array(FacultyMemberSchema).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const PortalCourseSchema = z.object({
  portalCourseId: z.string().uuid(),
  courseSpecId: z.string().uuid(),
  facultyId: z.string().optional(),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  level: CourseLevelSchema.default('Introductory'),
  durationWeeks: z.number().int().min(1).max(52).default(4),
  xpReward: z.number().int().min(0).default(100),
  scrollCoinCost: z.number().min(0).default(0),
  prerequisites: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  enrollmentOpen: z.boolean().default(true),
  enrollmentCount: z.number().int().min(0).default(0),
  rating: z.number().min(0).max(5).default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const PortalEnrollmentSchema = z.object({
  enrollmentId: z.string().uuid(),
  userId: z.string().min(1),
  portalCourseId: z.string().uuid(),
  enrollmentDate: z.string().datetime(),
  completionDate: z.string().datetime().optional(),
  progressPercentage: z.number().min(0).max(100).default(0),
  xpEarned: z.number().int().min(0).default(0),
  scrollCoinsEarned: z.number().min(0).default(0),
  currentLessonId: z.string().optional(),
  status: EnrollmentStatusSchema.default('active'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// ============================================================================
// AI TUTOR VALIDATION SCHEMAS
// ============================================================================

export const TutorMessageSchema = z.object({
  messageId: z.string().uuid(),
  sender: z.enum(['user', 'ai']),
  content: z.string().min(1).max(10000),
  timestamp: z.string().datetime(),
  contextData: z.any().optional(),
  messageType: z.enum(['text', 'code', 'image', 'file']).default('text')
});

export const SessionDataSchema = z.object({
  conversationId: z.string().optional(),
  topicsDiscussed: z.array(z.string()).default([]),
  userPreferences: z.object({
    language: z.string().length(2),
    difficulty: z.string(),
    learningStyle: z.string().optional()
  }),
  contextualInfo: z.any().optional()
});

export const AITutorSessionSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().min(1),
  portalCourseId: z.string().uuid().optional(),
  tutorType: TutorTypeSchema,
  facultyContext: z.string().optional(),
  sessionData: SessionDataSchema,
  conversationHistory: z.array(TutorMessageSchema).default([]),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  satisfactionRating: z.number().int().min(1).max(5).optional(),
  status: SessionStatusSchema.default('active'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// ============================================================================
// XR CLASSROOM VALIDATION SCHEMAS
// ============================================================================

export const XRAccessRequirementsSchema = z.object({
  minHardware: z.array(z.string()).default([]),
  supportedPlatforms: z.array(z.string()).default([]),
  bandwidthRequirement: z.string().default('1 Mbps'),
  fallbackAvailable: z.boolean().default(true)
});

export const XRInteractionDataSchema = z.object({
  questionsAsked: z.number().int().min(0).default(0),
  timeEngaged: z.number().min(0).default(0),
  objectsInteracted: z.array(z.string()).default([]),
  collaborationScore: z.number().min(0).max(1).optional(),
  technicalIssues: z.array(z.string()).default([])
});

export const XRClassroomSchema = z.object({
  classroomId: z.string().uuid(),
  portalCourseId: z.string().uuid(),
  sessionName: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  instructorId: z.string().optional(),
  scheduledTime: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(480).default(60),
  maxParticipants: z.number().int().min(1).max(100).default(30),
  currentParticipants: z.number().int().min(0).default(0),
  xrEnvironmentId: z.string().optional(),
  recordingEnabled: z.boolean().default(true),
  recordingUrl: z.string().url().optional(),
  status: XRClassroomStatusSchema.default('scheduled'),
  accessRequirements: XRAccessRequirementsSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const XRClassroomParticipantSchema = z.object({
  participantId: z.string().uuid(),
  classroomId: z.string().uuid(),
  userId: z.string().min(1),
  joinedAt: z.string().datetime().optional(),
  leftAt: z.string().datetime().optional(),
  participationScore: z.number().min(0).max(1).optional(),
  interactionData: XRInteractionDataSchema,
  createdAt: z.string().datetime()
});

// ============================================================================
// SCROLLNODE VALIDATION SCHEMAS
// ============================================================================

export const NodeConfigurationSchema = z.object({
  hardware: z.object({
    solarPanels: z.object({
      capacity: z.string(),
      efficiency: z.number().min(0).max(1)
    }).optional(),
    battery: z.object({
      type: z.string(),
      capacity: z.string()
    }).optional(),
    connectivity: z.object({
      primary: z.string(),
      backup: z.string(),
      meshEnabled: z.boolean()
    }).optional()
  }).optional(),
  software: z.object({
    os: z.string(),
    services: z.array(z.string()),
    syncSchedule: z.string()
  }).optional(),
  location: z.object({
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    }),
    timezone: z.string(),
    elevation: z.number()
  }).optional()
}).default({});

export const ScrollNodeSchema = z.object({
  nodeId: z.string().uuid(),
  name: z.string().min(1).max(255),
  location: z.string().max(255).optional(),
  country: z.string().max(100).optional(),
  coordinatorId: z.string().optional(),
  status: NodeStatusSchema.default('active'),
  syncEnabled: z.boolean().default(true),
  nodeType: NodeTypeSchema.default('standard'),
  connectivityLevel: ConnectivityLevelSchema.default('high'),
  lastSyncAt: z.string().datetime().optional(),
  configuration: NodeConfigurationSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// ============================================================================
// SCHOLARSHIP VALIDATION SCHEMAS
// ============================================================================

export const EligibilityCriteriaSchema = z.object({
  minGpa: z.number().min(0).max(4).optional(),
  minCourses: z.number().int().min(0).optional(),
  requiredFaculties: z.array(z.string()).default([]),
  geographicRestrictions: z.array(z.string()).default([]),
  spiritualRequirements: z.array(z.string()).default([]),
  financialNeedRequired: z.boolean().default(false)
});

export const ReferenceSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  relationship: z.string().min(1).max(100),
  recommendation: z.string().max(2000).optional(),
  contactDate: z.string().datetime().optional()
});

export const ApplicationDataSchema = z.object({
  essay: z.string().max(5000).optional(),
  gpa: z.number().min(0).max(4).optional(),
  coursesCompleted: z.array(z.string()).default([]),
  financialNeed: z.object({
    householdIncome: z.number().min(0).optional(),
    dependents: z.number().int().min(0).optional(),
    specialCircumstances: z.string().max(1000).optional()
  }).optional(),
  spiritualTestimony: z.string().max(3000).optional(),
  references: z.array(ReferenceSchema).default([])
});

export const ScholarshipSchema = z.object({
  scholarshipId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  amount: z.number().min(0).optional(),
  currency: z.string().default('ScrollCoin'),
  scholarshipType: ScholarshipTypeSchema.default('merit'),
  eligibilityCriteria: EligibilityCriteriaSchema,
  applicationDeadline: z.string().datetime().optional(),
  maxRecipients: z.number().int().min(1).optional(),
  currentRecipients: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  createdBy: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const ScholarshipApplicationSchema = z.object({
  applicationId: z.string().uuid(),
  scholarshipId: z.string().uuid(),
  userId: z.string().min(1),
  applicationData: ApplicationDataSchema,
  status: ApplicationStatusSchema.default('submitted'),
  appliedAt: z.string().datetime(),
  reviewedAt: z.string().datetime().optional(),
  reviewedBy: z.string().optional(),
  decisionReason: z.string().max(1000).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// ============================================================================
// ANALYTICS VALIDATION SCHEMAS
// ============================================================================

export const AnalyticsEventDataSchema = z.record(z.any()).and(
  z.object({
    courseId: z.string().optional(),
    enrollmentMethod: z.string().optional(),
    duration: z.number().min(0).optional(),
    interactionType: z.string().optional(),
    errorCode: z.string().optional(),
    performanceMetrics: z.object({
      loadTime: z.number().min(0),
      renderTime: z.number().min(0),
      apiResponseTime: z.number().min(0)
    }).optional()
  })
);

export const PortalAnalyticsSchema = z.object({
  analyticsId: z.string().uuid(),
  userId: z.string().min(1),
  eventType: z.string().min(1).max(100),
  eventData: AnalyticsEventDataSchema,
  sessionId: z.string().optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().max(500).optional(),
  timestamp: z.string().datetime(),
  createdAt: z.string().datetime()
});

// ============================================================================
// ERROR VALIDATION SCHEMAS
// ============================================================================

export const PortalErrorSchema = z.object({
  errorId: z.string().uuid(),
  errorCode: z.string().min(1),
  message: z.string().min(1).max(1000),
  details: z.any().optional(),
  timestamp: z.string().datetime(),
  userId: z.string().optional(),
  requestId: z.string().optional()
});

// ============================================================================
// LANGUAGE VALIDATION SCHEMAS
// ============================================================================

export const LanguageConfigSchema = z.object({
  code: z.string().length(2),
  name: z.string().min(1).max(50),
  direction: z.enum(['ltr', 'rtl']),
  fallback: z.string().length(2),
  enabled: z.boolean()
});

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validates and transforms data using the provided schema
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Safely validates data and returns result with error information
 */
export function safeValidateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: string;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * Creates a partial validation schema for updates
 */
export function createUpdateSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.partial();
}

/**
 * Validates UUID format
 */
export const UUIDSchema = z.string().uuid();

/**
 * Validates email format
 */
export const EmailSchema = z.string().email();

/**
 * Validates datetime format
 */
export const DateTimeSchema = z.string().datetime();

/**
 * Validates URL format
 */
export const URLSchema = z.string().url();