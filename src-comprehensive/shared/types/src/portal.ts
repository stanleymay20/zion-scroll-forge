import { z } from 'zod';

// Core Portal Application Interface
export interface ScrollUniversityPortalApp {
  auth: AuthModule;
  user: UserModule;
  dashboard: DashboardModule;
  courses: CourseModule;
  degrees: DegreeModule;
  assessments: AssessmentModule;
  aiTutors: AITutorModule;
  mentorship: MentorshipModule;
  xrClassrooms: XRModule;
  virtualLabs: VirtualLabModule;
  faculty: FacultyModule;
  admin: AdminModule;
  scrollNodes: ScrollNodeModule;
  scholarships: ScholarshipModule;
  scrollCoin: ScrollCoinModule;
  credentials: CredentialModule;
}

// Module Interfaces
export interface AuthModule {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  register: (userData: RegistrationData) => Promise<AuthResponse>;
  refreshToken: () => Promise<string>;
}

export interface UserModule {
  getProfile: () => Promise<ScrollUser>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<ScrollUser>;
  getPreferences: () => Promise<UserPreferences>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}

export interface DashboardModule {
  getDashboardData: () => Promise<DashboardData>;
  getProgressSummary: () => Promise<ProgressSummary>;
  getNotifications: () => Promise<Notification[]>;
}

export interface CourseModule {
  browseCourses: (filters?: CourseFilters) => Promise<PortalCourse[]>;
  getCourseDetails: (courseId: string) => Promise<PortalCourse>;
  enrollInCourse: (courseId: string) => Promise<Enrollment>;
  getEnrollments: () => Promise<Enrollment[]>;
}

export interface DegreeModule {
  getDegreePrograms: () => Promise<DegreeProgram[]>;
  getProgress: (programId: string) => Promise<DegreeProgress>;
}

export interface AssessmentModule {
  getAssessments: (courseId: string) => Promise<Assessment[]>;
  submitAssessment: (assessmentId: string, answers: AssessmentAnswers) => Promise<AssessmentResult>;
}

export interface AITutorModule {
  startSession: (context?: TutorContext) => Promise<AITutorSession>;
  sendMessage: (sessionId: string, message: string) => Promise<TutorMessage>;
  endSession: (sessionId: string) => Promise<void>;
}

export interface MentorshipModule {
  findMentors: (criteria: MentorCriteria) => Promise<Mentor[]>;
  requestMentorship: (mentorId: string) => Promise<MentorshipRequest>;
}

export interface XRModule {
  getXRClassrooms: () => Promise<XRClassroom[]>;
  joinXRSession: (sessionId: string) => Promise<XRSessionData>;
  getXRCapabilities: () => Promise<XRCapabilities>;
}

export interface VirtualLabModule {
  getVirtualLabs: () => Promise<VirtualLab[]>;
  accessLab: (labId: string) => Promise<LabSession>;
}

export interface FacultyModule {
  getFaculties: () => Promise<Faculty[]>;
  getFacultyMembers: (facultyId: string) => Promise<FacultyMember[]>;
}

export interface AdminModule {
  getSystemStats: () => Promise<SystemStats>;
  manageUsers: () => Promise<UserManagement>;
}

export interface ScrollNodeModule {
  getNodes: () => Promise<ScrollNode[]>;
  getNodeStatus: (nodeId: string) => Promise<NodeStatus>;
}

export interface ScholarshipModule {
  getScholarships: () => Promise<Scholarship[]>;
  applyForScholarship: (scholarshipId: string, application: ScholarshipApplication) => Promise<Application>;
}

export interface ScrollCoinModule {
  getBalance: () => Promise<number>;
  getTransactions: () => Promise<Transaction[]>;
  transfer: (to: string, amount: number) => Promise<Transaction>;
}

export interface CredentialModule {
  getCredentials: () => Promise<Credential[]>;
  verifyCredential: (credentialId: string) => Promise<VerificationResult>;
}

// Validation Schemas
export const PortalConfigSchema = z.object({
  apiBaseUrl: z.string().url(),
  wsUrl: z.string().url(),
  supportedLanguages: z.array(z.string()),
  features: z.object({
    xrEnabled: z.boolean(),
    aiTutorsEnabled: z.boolean(),
    offlineMode: z.boolean(),
    scrollCoinEnabled: z.boolean()
  })
});

export type PortalConfig = z.infer<typeof PortalConfigSchema>;