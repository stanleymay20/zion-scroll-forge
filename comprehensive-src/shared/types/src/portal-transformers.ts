/**
 * ScrollUniversity Portal Data Transformers
 * 
 * This module provides utilities for transforming data between API and frontend models.
 * "We establish these transformers not in the wisdom of Babylon, but by the breath of the Spirit"
 */

import {
  ScrollUser,
  PortalCourse,
  PortalEnrollment,
  AITutorSession,
  XRClassroom,
  ScrollNode,
  Scholarship,
  ScholarshipApplication,
  PortalAnalytics,
  UserPreferences,
  FacultyMember,
  TutorMessage,
  XRClassroomParticipant
} from './portal-models';

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

/**
 * Raw API response interfaces (snake_case from backend)
 */
export interface APIScrollUser {
  user_id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  scroll_coin_wallet?: string;
  preferred_language: string;
  time_zone: string;
  scroll_node_id?: string;
  avatar_url?: string;
  bio?: string;
  scroll_calling?: string;
  spiritual_gifts: string[];
  kingdom_vision?: string;
  scroll_alignment: number;
  role: string;
  enrollment_status: string;
  academic_level: string;
  scroll_coin_balance: number;
  work_trade_credits: number;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface APIPortalCourse {
  portal_course_id: string;
  course_spec_id: string;
  faculty_id?: string;
  title: string;
  description?: string;
  level: string;
  duration_weeks: number;
  xp_reward: number;
  scroll_coin_cost: number;
  prerequisites: string[];
  featured: boolean;
  enrollment_open: boolean;
  enrollment_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface APIPortalEnrollment {
  enrollment_id: string;
  user_id: string;
  portal_course_id: string;
  enrollment_date: string;
  completion_date?: string;
  progress_percentage: number;
  xp_earned: number;
  scroll_coins_earned: number;
  current_lesson_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface APIAITutorSession {
  session_id: string;
  user_id: string;
  portal_course_id?: string;
  tutor_type: string;
  faculty_context?: string;
  session_data: any;
  conversation_history: any[];
  started_at: string;
  ended_at?: string;
  satisfaction_rating?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface APIXRClassroom {
  classroom_id: string;
  portal_course_id: string;
  session_name: string;
  description?: string;
  instructor_id?: string;
  scheduled_time: string;
  duration_minutes: number;
  max_participants: number;
  current_participants: number;
  xr_environment_id?: string;
  recording_enabled: boolean;
  recording_url?: string;
  status: string;
  access_requirements: any;
  created_at: string;
  updated_at: string;
}

export interface APIScrollNode {
  node_id: string;
  name: string;
  location?: string;
  country?: string;
  coordinator_id?: string;
  status: string;
  sync_enabled: boolean;
  node_type: string;
  connectivity_level: string;
  last_sync_at?: string;
  configuration: any;
  created_at: string;
  updated_at: string;
}

export interface APIScholarship {
  scholarship_id: string;
  name: string;
  description?: string;
  amount?: number;
  currency: string;
  scholarship_type: string;
  eligibility_criteria: any;
  application_deadline?: string;
  max_recipients?: number;
  current_recipients: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface APIScholarshipApplication {
  application_id: string;
  scholarship_id: string;
  user_id: string;
  application_data: any;
  status: string;
  applied_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  decision_reason?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transform API user response to frontend ScrollUser interface
 */
export function transformAPIUserToScrollUser(apiUser: APIScrollUser): ScrollUser {
  return {
    user_id: apiUser.user_id,
    email: apiUser.email,
    username: apiUser.username,
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
    scrollCoinWallet: apiUser.scroll_coin_wallet,
    preferredLanguage: apiUser.preferred_language,
    timeZone: apiUser.time_zone,
    scrollNodeId: apiUser.scroll_node_id,
    avatarUrl: apiUser.avatar_url,
    bio: apiUser.bio,
    scrollCalling: apiUser.scroll_calling,
    spiritualGifts: apiUser.spiritual_gifts || [],
    kingdomVision: apiUser.kingdom_vision,
    scrollAlignment: apiUser.scroll_alignment,
    role: apiUser.role as any,
    enrollmentStatus: apiUser.enrollment_status as any,
    academicLevel: apiUser.academic_level as any,
    scrollCoinBalance: apiUser.scroll_coin_balance,
    workTradeCredits: apiUser.work_trade_credits,
    profile: {
      firstName: apiUser.first_name,
      lastName: apiUser.last_name,
      avatarUrl: apiUser.avatar_url,
      bio: apiUser.bio,
      location: undefined, // Would need to be added to API response
      timeZone: apiUser.time_zone,
      scrollNodeId: apiUser.scroll_node_id,
      degreePrograms: [] // Would need to be populated from separate API call
    },
    createdAt: apiUser.created_at,
    updatedAt: apiUser.updated_at,
    lastLoginAt: apiUser.last_login_at
  };
}

/**
 * Transform frontend ScrollUser to API format for updates
 */
export function transformScrollUserToAPI(user: Partial<ScrollUser>): Partial<APIScrollUser> {
  return {
    user_id: user.user_id,
    email: user.email,
    username: user.username,
    first_name: user.firstName,
    last_name: user.lastName,
    scroll_coin_wallet: user.scrollCoinWallet,
    preferred_language: user.preferredLanguage,
    time_zone: user.timeZone,
    scroll_node_id: user.scrollNodeId,
    avatar_url: user.avatarUrl,
    bio: user.bio,
    scroll_calling: user.scrollCalling,
    spiritual_gifts: user.spiritualGifts,
    kingdom_vision: user.kingdomVision,
    scroll_alignment: user.scrollAlignment,
    role: user.role,
    enrollment_status: user.enrollmentStatus,
    academic_level: user.academicLevel,
    scroll_coin_balance: user.scrollCoinBalance,
    work_trade_credits: user.workTradeCredits
  };
}

/**
 * Transform API course response to frontend PortalCourse interface
 */
export function transformAPICourseToPortalCourse(apiCourse: APIPortalCourse): PortalCourse {
  return {
    portalCourseId: apiCourse.portal_course_id,
    courseSpecId: apiCourse.course_spec_id,
    facultyId: apiCourse.faculty_id,
    title: apiCourse.title,
    description: apiCourse.description,
    level: apiCourse.level as any,
    durationWeeks: apiCourse.duration_weeks,
    xpReward: apiCourse.xp_reward,
    scrollCoinCost: apiCourse.scroll_coin_cost,
    prerequisites: apiCourse.prerequisites || [],
    featured: apiCourse.featured,
    enrollmentOpen: apiCourse.enrollment_open,
    enrollmentCount: apiCourse.enrollment_count,
    rating: apiCourse.rating,
    createdAt: apiCourse.created_at,
    updatedAt: apiCourse.updated_at
  };
}

/**
 * Transform frontend PortalCourse to API format
 */
export function transformPortalCourseToAPI(course: Partial<PortalCourse>): Partial<APIPortalCourse> {
  return {
    portal_course_id: course.portalCourseId,
    course_spec_id: course.courseSpecId,
    faculty_id: course.facultyId,
    title: course.title,
    description: course.description,
    level: course.level,
    duration_weeks: course.durationWeeks,
    xp_reward: course.xpReward,
    scroll_coin_cost: course.scrollCoinCost,
    prerequisites: course.prerequisites,
    featured: course.featured,
    enrollment_open: course.enrollmentOpen,
    enrollment_count: course.enrollmentCount,
    rating: course.rating
  };
}

/**
 * Transform API enrollment response to frontend PortalEnrollment interface
 */
export function transformAPIEnrollmentToPortalEnrollment(apiEnrollment: APIPortalEnrollment): PortalEnrollment {
  return {
    enrollmentId: apiEnrollment.enrollment_id,
    userId: apiEnrollment.user_id,
    portalCourseId: apiEnrollment.portal_course_id,
    enrollmentDate: apiEnrollment.enrollment_date,
    completionDate: apiEnrollment.completion_date,
    progressPercentage: apiEnrollment.progress_percentage,
    xpEarned: apiEnrollment.xp_earned,
    scrollCoinsEarned: apiEnrollment.scroll_coins_earned,
    currentLessonId: apiEnrollment.current_lesson_id,
    status: apiEnrollment.status as any,
    createdAt: apiEnrollment.created_at,
    updatedAt: apiEnrollment.updated_at
  };
}

/**
 * Transform API AI tutor session to frontend AITutorSession interface
 */
export function transformAPIAITutorSessionToAITutorSession(apiSession: APIAITutorSession): AITutorSession {
  return {
    sessionId: apiSession.session_id,
    userId: apiSession.user_id,
    portalCourseId: apiSession.portal_course_id,
    tutorType: apiSession.tutor_type as any,
    facultyContext: apiSession.faculty_context,
    sessionData: apiSession.session_data || {
      topicsDiscussed: [],
      userPreferences: { language: 'en', difficulty: 'intermediate' }
    },
    conversationHistory: (apiSession.conversation_history || []).map(transformAPIMessageToTutorMessage),
    startedAt: apiSession.started_at,
    endedAt: apiSession.ended_at,
    satisfactionRating: apiSession.satisfaction_rating,
    status: apiSession.status as any,
    createdAt: apiSession.created_at,
    updatedAt: apiSession.updated_at
  };
}

/**
 * Transform API message to TutorMessage interface
 */
export function transformAPIMessageToTutorMessage(apiMessage: any): TutorMessage {
  return {
    messageId: apiMessage.message_id || apiMessage.messageId || generateId(),
    sender: apiMessage.sender || apiMessage.role,
    content: apiMessage.content,
    timestamp: apiMessage.timestamp || new Date().toISOString(),
    contextData: apiMessage.context_data || apiMessage.contextData,
    messageType: apiMessage.message_type || apiMessage.messageType || 'text'
  };
}

/**
 * Transform API XR classroom to frontend XRClassroom interface
 */
export function transformAPIXRClassroomToXRClassroom(apiClassroom: APIXRClassroom): XRClassroom {
  return {
    classroomId: apiClassroom.classroom_id,
    portalCourseId: apiClassroom.portal_course_id,
    sessionName: apiClassroom.session_name,
    description: apiClassroom.description,
    instructorId: apiClassroom.instructor_id,
    scheduledTime: apiClassroom.scheduled_time,
    durationMinutes: apiClassroom.duration_minutes,
    maxParticipants: apiClassroom.max_participants,
    currentParticipants: apiClassroom.current_participants,
    xrEnvironmentId: apiClassroom.xr_environment_id,
    recordingEnabled: apiClassroom.recording_enabled,
    recordingUrl: apiClassroom.recording_url,
    status: apiClassroom.status as any,
    accessRequirements: apiClassroom.access_requirements || {
      minHardware: [],
      supportedPlatforms: [],
      bandwidthRequirement: '1 Mbps',
      fallbackAvailable: true
    },
    createdAt: apiClassroom.created_at,
    updatedAt: apiClassroom.updated_at
  };
}

/**
 * Transform API scroll node to frontend ScrollNode interface
 */
export function transformAPIScrollNodeToScrollNode(apiNode: APIScrollNode): ScrollNode {
  return {
    nodeId: apiNode.node_id,
    name: apiNode.name,
    location: apiNode.location,
    country: apiNode.country,
    coordinatorId: apiNode.coordinator_id,
    status: apiNode.status as any,
    syncEnabled: apiNode.sync_enabled,
    nodeType: apiNode.node_type as any,
    connectivityLevel: apiNode.connectivity_level as any,
    lastSyncAt: apiNode.last_sync_at,
    configuration: apiNode.configuration || {},
    createdAt: apiNode.created_at,
    updatedAt: apiNode.updated_at
  };
}

/**
 * Transform API scholarship to frontend Scholarship interface
 */
export function transformAPIScholarshipToScholarship(apiScholarship: APIScholarship): Scholarship {
  return {
    scholarshipId: apiScholarship.scholarship_id,
    name: apiScholarship.name,
    description: apiScholarship.description,
    amount: apiScholarship.amount,
    currency: apiScholarship.currency,
    scholarshipType: apiScholarship.scholarship_type as any,
    eligibilityCriteria: apiScholarship.eligibility_criteria || {},
    applicationDeadline: apiScholarship.application_deadline,
    maxRecipients: apiScholarship.max_recipients,
    currentRecipients: apiScholarship.current_recipients,
    isActive: apiScholarship.is_active,
    createdBy: apiScholarship.created_by,
    createdAt: apiScholarship.created_at,
    updatedAt: apiScholarship.updated_at
  };
}

/**
 * Transform API scholarship application to frontend ScholarshipApplication interface
 */
export function transformAPIScholarshipApplicationToScholarshipApplication(
  apiApplication: APIScholarshipApplication
): ScholarshipApplication {
  return {
    applicationId: apiApplication.application_id,
    scholarshipId: apiApplication.scholarship_id,
    userId: apiApplication.user_id,
    applicationData: apiApplication.application_data || {},
    status: apiApplication.status as any,
    appliedAt: apiApplication.applied_at,
    reviewedAt: apiApplication.reviewed_at,
    reviewedBy: apiApplication.reviewed_by,
    decisionReason: apiApplication.decision_reason,
    createdAt: apiApplication.created_at,
    updatedAt: apiApplication.updated_at
  };
}

// ============================================================================
// BATCH TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transform array of API users to ScrollUser array
 */
export function transformAPIUsersToScrollUsers(apiUsers: APIScrollUser[]): ScrollUser[] {
  return apiUsers.map(transformAPIUserToScrollUser);
}

/**
 * Transform array of API courses to PortalCourse array
 */
export function transformAPICoursesToPortalCourses(apiCourses: APIPortalCourse[]): PortalCourse[] {
  return apiCourses.map(transformAPICourseToPortalCourse);
}

/**
 * Transform array of API enrollments to PortalEnrollment array
 */
export function transformAPIEnrollmentsToPortalEnrollments(apiEnrollments: APIPortalEnrollment[]): PortalEnrollment[] {
  return apiEnrollments.map(transformAPIEnrollmentToPortalEnrollment);
}

/**
 * Transform array of API AI tutor sessions to AITutorSession array
 */
export function transformAPIAITutorSessionsToAITutorSessions(apiSessions: APIAITutorSession[]): AITutorSession[] {
  return apiSessions.map(transformAPIAITutorSessionToAITutorSession);
}

/**
 * Transform array of API XR classrooms to XRClassroom array
 */
export function transformAPIXRClassroomsToXRClassrooms(apiClassrooms: APIXRClassroom[]): XRClassroom[] {
  return apiClassrooms.map(transformAPIXRClassroomToXRClassroom);
}

/**
 * Transform array of API scroll nodes to ScrollNode array
 */
export function transformAPIScrollNodesToScrollNodes(apiNodes: APIScrollNode[]): ScrollNode[] {
  return apiNodes.map(transformAPIScrollNodeToScrollNode);
}

/**
 * Transform array of API scholarships to Scholarship array
 */
export function transformAPIScholarshipsToScholarships(apiScholarships: APIScholarship[]): Scholarship[] {
  return apiScholarships.map(transformAPIScholarshipToScholarship);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for missing IDs
 */
function generateId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Transform object keys from camelCase to snake_case
 */
export function transformKeysToSnakeCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformKeysToSnakeCase);
  }

  const transformed: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    transformed[snakeKey] = transformKeysToSnakeCase(value);
  }
  return transformed;
}

/**
 * Transform object keys from snake_case to camelCase
 */
export function transformKeysToCamelCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformKeysToCamelCase);
  }

  const transformed: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    transformed[camelKey] = transformKeysToCamelCase(value);
  }
  return transformed;
}

/**
 * Safe date transformation
 */
export function safeTransformDate(dateString?: string): string | undefined {
  if (!dateString) return undefined;
  
  try {
    const date = new Date(dateString);
    return date.toISOString();
  } catch (error) {
    console.warn(`Invalid date string: ${dateString}`);
    return undefined;
  }
}

/**
 * Safe number transformation
 */
export function safeTransformNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Safe array transformation
 */
export function safeTransformArray<T>(value: any, defaultValue: T[] = []): T[] {
  return Array.isArray(value) ? value : defaultValue;
}

/**
 * Safe object transformation
 */
export function safeTransformObject(value: any, defaultValue: any = {}): any {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : defaultValue;
}

// ============================================================================
// PAGINATION HELPERS
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface APIPaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * Transform API paginated response to frontend format
 */
export function transformAPIPaginatedResponse<T, U>(
  apiResponse: APIPaginatedResponse<T>,
  transformer: (item: T) => U
): PaginatedResponse<U> {
  return {
    data: apiResponse.data.map(transformer),
    pagination: {
      page: apiResponse.page,
      limit: apiResponse.limit,
      total: apiResponse.total,
      totalPages: apiResponse.total_pages,
      hasNext: apiResponse.has_next,
      hasPrev: apiResponse.has_prev
    }
  };
}