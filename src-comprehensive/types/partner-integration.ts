/**
 * Partner Institution Integration Types
 * Supporting Requirements 5.2 and 6.3 for ScrollUniversity Platform
 */

export interface PartnerInstitution {
  id: string;
  name: string;
  type: PartnerType;
  country: string;
  apiEndpoint: string;
  apiKey: string;
  status: PartnerStatus;
  integrationLevel: IntegrationLevel;
  supportedServices: PartnerService[];
  contactInfo: PartnerContact;
  credentials: PartnerCredentials;
  createdAt: Date;
  updatedAt: Date;
}

export enum PartnerType {
  ACADEMIC_INSTITUTION = 'academic_institution',
  RESEARCH_CENTER = 'research_center',
  TECH_ALLIANCE = 'tech_alliance',
  KINGDOM_ORGANIZATION = 'kingdom_organization',
  NGO = 'ngo',
  STARTUP_INCUBATOR = 'startup_incubator'
}

export enum PartnerStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive'
}

export enum IntegrationLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  FULL_INTEGRATION = 'full_integration'
}

export enum PartnerService {
  GUEST_LECTURING = 'guest_lecturing',
  CREDENTIAL_RECOGNITION = 'credential_recognition',
  RESEARCH_COLLABORATION = 'research_collaboration',
  STUDENT_EXCHANGE = 'student_exchange',
  FACULTY_EXCHANGE = 'faculty_exchange',
  JOINT_PROGRAMS = 'joint_programs',
  CAREER_PLACEMENT = 'career_placement'
}

export interface PartnerContact {
  primaryContact: string;
  email: string;
  phone: string;
  department: string;
  timezone: string;
}

export interface PartnerCredentials {
  authType: 'api_key' | 'oauth' | 'jwt' | 'custom';
  credentials: Record<string, any>;
  lastVerified: Date;
  expiresAt?: Date;
}

export interface GuestLecturer {
  id: string;
  partnerId: string;
  name: string;
  title: string;
  expertise: string[];
  bio: string;
  availability: LecturerAvailability;
  rates: LecturerRates;
  spiritualAlignment: SpiritualAlignment;
  status: LecturerStatus;
}

export interface LecturerAvailability {
  timezone: string;
  availableSlots: TimeSlot[];
  blackoutDates: Date[];
  preferredFormats: LectureFormat[];
}

export interface TimeSlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export enum LectureFormat {
  LIVE_VIRTUAL = 'live_virtual',
  RECORDED = 'recorded',
  HYBRID = 'hybrid',
  IN_PERSON = 'in_person',
  XR_IMMERSIVE = 'xr_immersive'
}

export interface LecturerRates {
  currency: string;
  hourlyRate: number;
  sessionRate: number;
  travelExpenses: boolean;
  paymentTerms: string;
}

export interface SpiritualAlignment {
  christianWorldview: boolean;
  scrollPrinciplesAlignment: number; // 1-10 scale
  kingdomFocus: boolean;
  propheticGifting: boolean;
  verifiedBy: string;
  verificationDate: Date;
}

export enum LecturerStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  UNAVAILABLE = 'unavailable',
  PENDING_APPROVAL = 'pending_approval'
}

export interface LectureSession {
  id: string;
  lecturerId: string;
  courseId: string;
  title: string;
  description: string;
  scheduledDate: Date;
  duration: number; // minutes
  format: LectureFormat;
  maxAttendees: number;
  registeredStudents: string[];
  status: SessionStatus;
  recordingUrl?: string;
  materials: LectureMaterial[];
}

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled'
}

export interface LectureMaterial {
  id: string;
  type: MaterialType;
  title: string;
  url: string;
  description: string;
  uploadedAt: Date;
}

export enum MaterialType {
  SLIDES = 'slides',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  INTERACTIVE = 'interactive',
  XR_CONTENT = 'xr_content'
}

export interface CredentialRecognition {
  id: string;
  partnerId: string;
  scrollCredentialId: string;
  partnerCredentialType: string;
  recognitionLevel: RecognitionLevel;
  equivalentCredits: number;
  validityPeriod: number; // months
  requirements: RecognitionRequirement[];
  status: RecognitionStatus;
  approvedBy: string;
  approvedAt: Date;
}

export enum RecognitionLevel {
  FULL_RECOGNITION = 'full_recognition',
  PARTIAL_RECOGNITION = 'partial_recognition',
  CONDITIONAL_RECOGNITION = 'conditional_recognition',
  NOT_RECOGNIZED = 'not_recognized'
}

export interface RecognitionRequirement {
  type: RequirementType;
  description: string;
  completed: boolean;
  completedAt?: Date;
}

export enum RequirementType {
  ADDITIONAL_COURSEWORK = 'additional_coursework',
  EXAMINATION = 'examination',
  PORTFOLIO_REVIEW = 'portfolio_review',
  INTERVIEW = 'interview',
  SPIRITUAL_ASSESSMENT = 'spiritual_assessment'
}

export enum RecognitionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONDITIONAL = 'conditional',
  EXPIRED = 'expired'
}

export interface PartnershipMetrics {
  partnerId: string;
  totalLectures: number;
  totalStudentsReached: number;
  credentialsRecognized: number;
  satisfactionRating: number;
  collaborationProjects: number;
  lastActivity: Date;
  performanceScore: number;
}

export interface APIIntegrationConfig {
  partnerId: string;
  baseUrl: string;
  apiVersion: string;
  authConfig: AuthConfig;
  endpoints: APIEndpoint[];
  rateLimits: RateLimit;
  dataMapping: DataMapping;
}

export interface AuthConfig {
  type: 'api_key' | 'oauth2' | 'jwt' | 'basic';
  credentials: Record<string, string>;
  refreshToken?: string;
  tokenExpiry?: Date;
}

export interface APIEndpoint {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requestSchema?: any;
  responseSchema?: any;
}

export interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

export interface DataMapping {
  inbound: Record<string, string>;
  outbound: Record<string, string>;
  transformations: DataTransformation[];
}

export interface DataTransformation {
  field: string;
  type: 'format' | 'calculate' | 'lookup' | 'validate';
  rule: string;
  fallback?: any;
}