/**
 * System Interface Definitions for ScrollUniversity Cross-System Integration
 * 
 * This file defines the API interfaces and event contracts for all ScrollUniversity specs
 * to ensure consistent communication and integration between systems.
 */

import { 
  ScrollUser, 
  SpiritualProfile, 
  AcademicProfile, 
  Course, 
  ScrollCoinAccount, 
  Assessment, 
  ScrollProject, 
  PrayerRequest, 
  MentorshipRelationship,
  ScrollCertification,
  SystemEvent,
  APIResponse,
  PaginatedResponse,
  ValidationResult
} from './SharedDataModels';

// ============================================================================
// CORE PLATFORM INTERFACES
// ============================================================================

export interface ScrollUniversityPlatformInterface {
  name: 'scroll-university-platform';
  version: 'v1';
  
  endpoints: {
    // Health and Status
    health: {
      method: 'GET';
      path: '/health';
      description: 'Platform health check';
      response: APIResponse<{ status: string; uptime: number; }>;
    };
    
    // User Management
    users: {
      method: 'GET';
      path: '/api/users';
      description: 'Get users with pagination';
      response: APIResponse<PaginatedResponse<ScrollUser>>;
    };
    
    createUser: {
      method: 'POST';
      path: '/api/users';
      description: 'Create new user';
      request: Partial<ScrollUser>;
      response: APIResponse<ScrollUser>;
    };
    
    // System Integration
    registerSystem: {
      method: 'POST';
      path: '/api/integration/register';
      description: 'Register system with integration framework';
      request: { systemName: string; config: any; };
      response: APIResponse<{ registered: boolean; }>;
    };
  };
  
  events: {
    publishes: [
      'user.created',
      'user.updated', 
      'user.deleted',
      'system.started',
      'system.shutdown',
      'integration.registered'
    ];
    subscribes: [
      '*.health.check',
      'system.*.error',
      'audit.*.required'
    ];
  };
  
  dependencies: [];
}

// ============================================================================
// STUDENT PROFILE SYSTEM
// ============================================================================

export interface ScrollStudentProfileInterface {
  name: 'scroll-student-profile-spec';
  version: 'v1';
  
  endpoints: {
    getProfile: {
      method: 'GET';
      path: '/api/profile/{userId}';
      description: 'Get student profile';
      response: APIResponse<{ academic: AcademicProfile; spiritual: SpiritualProfile; }>;
    };
    
    updateSpiritual: {
      method: 'PUT';
      path: '/api/profile/{userId}/spiritual';
      description: 'Update spiritual formation data';
      request: Partial<SpiritualProfile>;
      response: APIResponse<SpiritualProfile>;
    };
    
    updateAcademic: {
      method: 'PUT';
      path: '/api/profile/{userId}/academic';
      description: 'Update academic progress';
      request: Partial<AcademicProfile>;
      response: APIResponse<AcademicProfile>;
    };
    
    getDivineScorecard: {
      method: 'GET';
      path: '/api/profile/{userId}/scorecard';
      description: 'Get divine scorecard metrics';
      response: APIResponse<{ purpose: number; skills: number; alignment: number; }>;
    };
  };
  
  events: {
    publishes: [
      'profile.created',
      'profile.updated',
      'spiritual.milestone',
      'academic.progress',
      'calling.clarified',
      'formation.advanced'
    ];
    subscribes: [
      'user.created',
      'course.completed',
      'assessment.passed',
      'project.completed',
      'mentorship.milestone',
      'prayer.answered'
    ];
  };
  
  dependencies: ['scroll-university-platform'];
}

// ============================================================================
// COURSE MANAGEMENT SYSTEM
// ============================================================================

export interface ScrollCourseInterface {
  name: 'scroll-course-spec';
  version: 'v1';
  
  endpoints: {
    getCourses: {
      method: 'GET';
      path: '/api/courses';
      description: 'Get course catalog with filters';
      response: APIResponse<PaginatedResponse<Course>>;
    };
    
    getCourse: {
      method: 'GET';
      path: '/api/courses/{courseId}';
      description: 'Get specific course details';
      response: APIResponse<Course>;
    };
    
    enrollStudent: {
      method: 'POST';
      path: '/api/courses/{courseId}/enroll';
      description: 'Enroll student in course';
      request: { userId: string; };
      response: APIResponse<{ enrolled: boolean; enrollmentId: string; }>;
    };
    
    getProgress: {
      method: 'GET';
      path: '/api/courses/{courseId}/progress/{userId}';
      description: 'Get student progress in course';
      response: APIResponse<{ progress: number; completedLessons: string[]; }>;
    };
  };
  
  events: {
    publishes: [
      'course.created',
      'course.updated',
      'course.enrolled',
      'course.progress',
      'course.completed',
      'lesson.completed'
    ];
    subscribes: [
      'user.created',
      'payment.completed',
      'scrollcoin.earned',
      'assessment.passed',
      'spiritual.milestone'
    ];
  };
  
  dependencies: ['scroll-university-platform', 'scroll-student-profile-spec'];
}

// ============================================================================
// SCROLLCOIN ECONOMY SYSTEM
// ============================================================================

export interface ScrollCoinMeterInterface {
  name: 'scroll-scrollcoin-meter';
  version: 'v1';
  
  endpoints: {
    getBalance: {
      method: 'GET';
      path: '/api/scrollcoin/{userId}/balance';
      description: 'Get user ScrollCoin balance';
      response: APIResponse<ScrollCoinAccount>;
    };
    
    transfer: {
      method: 'POST';
      path: '/api/scrollcoin/transfer';
      description: 'Transfer ScrollCoin between users';
      request: { fromUserId: string; toUserId: string; amount: number; reason: string; };
      response: APIResponse<{ transactionId: string; success: boolean; }>;
    };
    
    earn: {
      method: 'POST';
      path: '/api/scrollcoin/earn';
      description: 'Award ScrollCoin for achievements';
      request: { userId: string; amount: number; category: string; metadata: any; };
      response: APIResponse<{ transactionId: string; newBalance: number; }>;
    };
    
    getTransactions: {
      method: 'GET';
      path: '/api/scrollcoin/{userId}/transactions';
      description: 'Get transaction history';
      response: APIResponse<PaginatedResponse<any>>;
    };
  };
  
  events: {
    publishes: [
      'scrollcoin.earned',
      'scrollcoin.spent',
      'scrollcoin.transferred',
      'wallet.created',
      'transaction.completed',
      'fraud.detected'
    ];
    subscribes: [
      'course.completed',
      'assessment.passed',
      'project.submitted',
      'mentorship.milestone',
      'prayer.answered',
      'ministry.impact'
    ];
  };
  
  dependencies: ['scroll-university-platform', 'scroll-audit-trail-spec'];
}

// ============================================================================
// AI FACULTY SYSTEM
// ============================================================================

export interface ScrollFacultyAIInterface {
  name: 'scroll-faculty-ai';
  version: 'v1';
  
  endpoints: {
    chat: {
      method: 'POST';
      path: '/api/ai/chat';
      description: 'Chat with AI tutor';
      request: { userId: string; message: string; context: any; };
      response: APIResponse<{ response: string; tutorId: string; sessionId: string; }>;
    };
    
    getFeedback: {
      method: 'POST';
      path: '/api/ai/feedback';
      description: 'Get AI feedback on work';
      request: { userId: string; workId: string; type: string; content: any; };
      response: APIResponse<{ feedback: string; score: number; suggestions: string[]; }>;
    };
    
    getTutors: {
      method: 'GET';
      path: '/api/ai/tutors';
      description: 'Get available AI tutors';
      response: APIResponse<any[]>;
    };
    
    validateResponse: {
      method: 'POST';
      path: '/api/ai/validate';
      description: 'Validate AI response for drift';
      request: { response: string; context: any; };
      response: APIResponse<ValidationResult>;
    };
  };
  
  events: {
    publishes: [
      'ai.response',
      'ai.feedback',
      'ai.tutoring.session',
      'ai.drift.detected',
      'ai.validation.failed'
    ];
    subscribes: [
      'course.progress',
      'assessment.submitted',
      'student.question',
      'spiritual.guidance.needed',
      'drift.alert'
    ];
  };
  
  dependencies: ['scroll-university-platform', 'scroll-drift-detection-spec', 'scroll-oath-enforcer'];
}

// ============================================================================
// ASSESSMENT ENGINE
// ============================================================================

export interface ScrollAssessmentEngineInterface {
  name: 'scroll-assessment-engine';
  version: 'v1';
  
  endpoints: {
    submitAssessment: {
      method: 'POST';
      path: '/api/assessments/submit';
      description: 'Submit assessment for grading';
      request: { userId: string; assessmentId: string; answers: any; };
      response: APIResponse<{ submissionId: string; status: string; }>;
    };
    
    getResults: {
      method: 'GET';
      path: '/api/assessments/{submissionId}/results';
      description: 'Get assessment results';
      response: APIResponse<{ score: number; feedback: string; passed: boolean; }>;
    };
    
    createAssessment: {
      method: 'POST';
      path: '/api/assessments';
      description: 'Create new assessment';
      request: Assessment;
      response: APIResponse<Assessment>;
    };
  };
  
  events: {
    publishes: [
      'assessment.created',
      'assessment.submitted',
      'assessment.graded',
      'assessment.passed',
      'assessment.failed'
    ];
    subscribes: [
      'course.progress',
      'ai.feedback',
      'spiritual.validation',
      'project.completed'
    ];
  };
  
  dependencies: ['scroll-course-spec', 'scroll-faculty-ai', 'scroll-gpt-verifier'];
}

// ============================================================================
// PROJECT MANAGEMENT SYSTEM
// ============================================================================

export interface ScrollProjectsInterface {
  name: 'scroll-projects-spec';
  version: 'v1';
  
  endpoints: {
    createProject: {
      method: 'POST';
      path: '/api/projects';
      description: 'Create new project';
      request: Partial<ScrollProject>;
      response: APIResponse<ScrollProject>;
    };
    
    getProject: {
      method: 'GET';
      path: '/api/projects/{projectId}';
      description: 'Get project details';
      response: APIResponse<ScrollProject>;
    };
    
    updateProgress: {
      method: 'PUT';
      path: '/api/projects/{projectId}/progress';
      description: 'Update project progress';
      request: { milestoneId: string; status: string; notes: string; };
      response: APIResponse<{ updated: boolean; }>;
    };
    
    submitDeliverable: {
      method: 'POST';
      path: '/api/projects/{projectId}/deliverables';
      description: 'Submit project deliverable';
      request: { deliverableId: string; content: any; };
      response: APIResponse<{ submitted: boolean; }>;
    };
  };
  
  events: {
    publishes: [
      'project.created',
      'project.updated',
      'project.milestone',
      'project.completed',
      'deliverable.submitted'
    ];
    subscribes: [
      'course.enrolled',
      'mentor.assigned',
      'assessment.passed',
      'scrollcoin.earned'
    ];
  };
  
  dependencies: ['scroll-university-platform', 'scroll-student-profile-spec'];
}

// ============================================================================
// PRAYER INTEGRATION SYSTEM
// ============================================================================

export interface ScrollPrayerIntegrationInterface {
  name: 'scroll-prayer-integration-spec';
  version: 'v1';
  
  endpoints: {
    submitRequest: {
      method: 'POST';
      path: '/api/prayer/request';
      description: 'Submit prayer request';
      request: Partial<PrayerRequest>;
      response: APIResponse<PrayerRequest>;
    };
    
    getIntercession: {
      method: 'GET';
      path: '/api/prayer/intercession/{userId}';
      description: 'Get prayer assignments for intercessor';
      response: APIResponse<PrayerRequest[]>;
    };
    
    updateRequest: {
      method: 'PUT';
      path: '/api/prayer/{requestId}';
      description: 'Update prayer request status';
      request: { status: string; update: string; };
      response: APIResponse<PrayerRequest>;
    };
    
    getPrayerCoverage: {
      method: 'GET';
      path: '/api/prayer/coverage/{userId}';
      description: 'Get prayer coverage for user';
      response: APIResponse<{ covered: boolean; intercessors: string[]; }>;
    };
  };
  
  events: {
    publishes: [
      'prayer.requested',
      'prayer.answered',
      'intercession.assigned',
      'spiritual.breakthrough',
      'warfare.alert'
    ];
    subscribes: [
      'user.created',
      'spiritual.crisis',
      'course.struggle',
      'assessment.anxiety',
      'project.challenge'
    ];
  };
  
  dependencies: ['scroll-university-platform', 'scroll-student-profile-spec'];
}

// ============================================================================
// MENTORSHIP NETWORK
// ============================================================================

export interface ScrollMentorshipNetworkInterface {
  name: 'scroll-mentorship-network-spec';
  version: 'v1';
  
  endpoints: {
    findMentor: {
      method: 'POST';
      path: '/api/mentorship/match';
      description: 'Find mentor match for student';
      request: { userId: string; preferences: any; };
      response: APIResponse<{ mentorId: string; matchScore: number; }>;
    };
    
    scheduleSession: {
      method: 'POST';
      path: '/api/mentorship/session';
      description: 'Schedule mentorship session';
      request: { mentorId: string; menteeId: string; datetime: Date; topic: string; };
      response: APIResponse<{ sessionId: string; scheduled: boolean; }>;
    };
    
    getRelationships: {
      method: 'GET';
      path: '/api/mentorship/{userId}/relationships';
      description: 'Get mentorship relationships';
      response: APIResponse<MentorshipRelationship[]>;
    };
  };
  
  events: {
    publishes: [
      'mentor.matched',
      'mentorship.session',
      'mentorship.milestone',
      'discipleship.advanced',
      'ministry.calling'
    ];
    subscribes: [
      'user.created',
      'spiritual.growth',
      'course.completed',
      'project.milestone',
      'prayer.breakthrough'
    ];
  };
  
  dependencies: ['scroll-university-platform', 'scroll-student-profile-spec', 'scroll-prayer-integration-spec'];
}

// ============================================================================
// CERTIFICATION SYSTEM
// ============================================================================

export interface ScrollSealCertificationInterface {
  name: 'scroll-seal-certification';
  version: 'v1';
  
  endpoints: {
    issueCertificate: {
      method: 'POST';
      path: '/api/certification/issue';
      description: 'Issue ScrollSeal certificate';
      request: { userId: string; type: string; metadata: any; };
      response: APIResponse<ScrollCertification>;
    };
    
    verifyCertificate: {
      method: 'GET';
      path: '/api/certification/verify/{certificateId}';
      description: 'Verify certificate authenticity';
      response: APIResponse<{ valid: boolean; details: any; }>;
    };
    
    getCertificates: {
      method: 'GET';
      path: '/api/certification/{userId}';
      description: 'Get user certificates';
      response: APIResponse<ScrollCertification[]>;
    };
  };
  
  events: {
    publishes: [
      'certificate.issued',
      'certificate.verified',
      'badge.earned',
      'degree.conferred',
      'credential.updated'
    ];
    subscribes: [
      'course.completed',
      'degree.requirements.met',
      'project.completed',
      'spiritual.milestone',
      'assessment.passed'
    ];
  };
  
  dependencies: ['scroll-university-platform', 'scroll-student-profile-spec', 'scroll-degree-engine'];
}

// ============================================================================
// CONTENT CREATION ENGINE
// ============================================================================

export interface ScrollContentCreationEngineInterface {
  name: 'scroll-content-creation-engine';
  version: 'v1';
  
  endpoints: {
    generateContent: {
      method: 'POST';
      path: '/api/content/generate';
      description: 'Generate educational content';
      request: { type: string; topic: string; parameters: any; };
      response: APIResponse<{ contentId: string; content: any; }>;
    };
    
    validateContent: {
      method: 'POST';
      path: '/api/content/validate';
      description: 'Validate content for scroll alignment';
      request: { contentId: string; content: any; };
      response: APIResponse<ValidationResult>;
    };
    
    publishContent: {
      method: 'POST';
      path: '/api/content/publish';
      description: 'Publish validated content';
      request: { contentId: string; };
      response: APIResponse<{ published: boolean; url: string; }>;
    };
  };
  
  events: {
    publishes: [
      'content.generated',
      'content.validated',
      'content.published',
      'content.rejected',
      'localization.completed'
    ];
    subscribes: [
      'course.created',
      'curriculum.updated',
      'spiritual.validation.required',
      'translation.requested'
    ];
  };
  
  dependencies: ['scroll-university-platform', 'scroll-faculty-ai', 'scroll-oath-enforcer'];
}

// ============================================================================
// SYSTEM REGISTRY
// ============================================================================

export const SCROLL_UNIVERSITY_SYSTEM_INTERFACES = {
  'scroll-university-platform': {} as ScrollUniversityPlatformInterface,
  'scroll-student-profile-spec': {} as ScrollStudentProfileInterface,
  'scroll-course-spec': {} as ScrollCourseInterface,
  'scroll-scrollcoin-meter': {} as ScrollCoinMeterInterface,
  'scroll-faculty-ai': {} as ScrollFacultyAIInterface,
  'scroll-assessment-engine': {} as ScrollAssessmentEngineInterface,
  'scroll-projects-spec': {} as ScrollProjectsInterface,
  'scroll-prayer-integration-spec': {} as ScrollPrayerIntegrationInterface,
  'scroll-mentorship-network-spec': {} as ScrollMentorshipNetworkInterface,
  'scroll-seal-certification': {} as ScrollSealCertificationInterface,
  'scroll-content-creation-engine': {} as ScrollContentCreationEngineInterface,
} as const;

export type SystemName = keyof typeof SCROLL_UNIVERSITY_SYSTEM_INTERFACES;

// ============================================================================
// INTEGRATION UTILITIES
// ============================================================================

export interface SystemIntegrationConfig {
  name: SystemName;
  version: string;
  dependencies: SystemName[];
  eventSubscriptions: string[];
  eventPublications: string[];
  healthCheckEndpoint: string;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
    exponentialBackoff: boolean;
  };
}

export interface CrossSystemEvent extends SystemEvent {
  targetSystems?: SystemName[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  expiresAt?: Date;
}

export interface IntegrationMetrics {
  systemName: SystemName;
  eventsPublished: number;
  eventsReceived: number;
  averageResponseTime: number;
  errorRate: number;
  lastHealthCheck: Date;
  dependencyStatus: Record<SystemName, 'healthy' | 'degraded' | 'unhealthy'>;
}