/**
 * Student Profile and Transcript Types
 * Comprehensive type definitions for student profile management
 */

export interface StudentProfile {
  id: string;
  userId: string;
  
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  
  // Profile Media
  avatarUrl?: string;
  coverImageUrl?: string;
  
  // Academic Information
  studentId: string;
  enrollmentDate: Date;
  expectedGraduationDate?: Date;
  academicStatus: AcademicStatus;
  gpa: number;
  
  // Program Information
  degreeProgram?: DegreeProgram;
  major?: string;
  minor?: string;
  concentration?: string;
  
  // Contact Information
  address?: Address;
  emergencyContact?: EmergencyContact;
  
  // Preferences
  bio?: string;
  interests: string[];
  spiritualGifts: string[];
  ministryInterests: string[];
  
  // Privacy Settings
  profileVisibility: ProfileVisibility;
  showGPA: boolean;
  showCourseHistory: boolean;
  showAchievements: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export type AcademicStatus = 
  | 'active'
  | 'on_leave'
  | 'probation'
  | 'suspended'
  | 'graduated'
  | 'withdrawn';

export type ProfileVisibility = 'public' | 'private' | 'connections_only';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface DegreeProgram {
  id: string;
  name: string;
  type: 'associate' | 'bachelor' | 'master' | 'doctoral' | 'certificate';
  faculty: string;
  totalCredits: number;
}

// Academic Transcript
export interface AcademicTranscript {
  studentId: string;
  studentName: string;
  degreeProgram: string;
  
  // Academic Summary
  overallGPA: number;
  totalCreditsEarned: number;
  totalCreditsAttempted: number;
  
  // Course History
  courseHistory: TranscriptCourse[];
  
  // Academic Standing
  academicStanding: AcademicStanding[];
  
  // Degrees and Certificates
  degreesAwarded: DegreeAwarded[];
  certificatesAwarded: CertificateAwarded[];
  
  // Metadata
  generatedAt: Date;
  isOfficial: boolean;
  transcriptId: string;
}

export interface TranscriptCourse {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  gradePoints: number;
  term: string;
  year: number;
  status: CourseStatus;
  instructor: string;
}

export type CourseStatus = 'completed' | 'in_progress' | 'withdrawn' | 'failed' | 'incomplete';

export interface AcademicStanding {
  term: string;
  year: number;
  gpa: number;
  standing: 'good_standing' | 'probation' | 'suspension' | 'honors' | 'deans_list';
}

export interface DegreeAwarded {
  degreeType: string;
  degreeName: string;
  major: string;
  minor?: string;
  dateAwarded: Date;
  honors?: string;
  gpa: number;
}

export interface CertificateAwarded {
  certificateName: string;
  dateAwarded: Date;
  credentialId: string;
}

// Degree Audit
export interface DegreeAudit {
  studentId: string;
  degreeProgram: DegreeProgram;
  
  // Overall Progress
  overallProgress: number; // percentage
  creditsCompleted: number;
  creditsRequired: number;
  
  // Requirements
  requirements: DegreeRequirement[];
  
  // Projected Completion
  projectedGraduationDate?: Date;
  remainingTerms: number;
  
  // Status
  isEligibleForGraduation: boolean;
  outstandingRequirements: string[];
  
  // Metadata
  lastUpdated: Date;
}

export interface DegreeRequirement {
  id: string;
  category: RequirementCategory;
  name: string;
  description: string;
  
  // Credits
  creditsRequired: number;
  creditsCompleted: number;
  
  // Courses
  requiredCourses: CourseRequirement[];
  completedCourses: TranscriptCourse[];
  
  // Status
  isComplete: boolean;
  progress: number; // percentage
}

export type RequirementCategory = 
  | 'core'
  | 'major'
  | 'minor'
  | 'elective'
  | 'general_education'
  | 'spiritual_formation'
  | 'capstone';

export interface CourseRequirement {
  courseId?: string;
  courseCode?: string;
  courseName: string;
  credits: number;
  isRequired: boolean;
  alternatives?: string[]; // Alternative course IDs
}

// Course History
export interface CourseHistoryEntry {
  courseId: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  term: string;
  year: number;
  
  // Performance
  grade: string;
  gradePoints: number;
  credits: number;
  
  // Engagement
  attendanceRate: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  
  // Spiritual Growth
  spiritualGrowthScore?: number;
  
  // Status
  status: CourseStatus;
  enrollmentDate: Date;
  completionDate?: Date;
}

// Achievements
export interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  
  // Details
  dateEarned: Date;
  category: string;
  
  // Verification
  verificationUrl?: string;
  credentialId?: string;
  
  // Display
  isPublic: boolean;
  isPinned: boolean;
}

export type AchievementType = 
  | 'academic'
  | 'spiritual'
  | 'leadership'
  | 'service'
  | 'research'
  | 'scrollbadge'
  | 'scrollcoin';

// Skill Endorsements
export interface SkillEndorsement {
  id: string;
  skillName: string;
  category: SkillCategory;
  
  // Endorsements
  endorsements: Endorsement[];
  endorsementCount: number;
  
  // Proficiency
  proficiencyLevel: ProficiencyLevel;
  
  // Verification
  isVerified: boolean;
  verificationSource?: string;
}

export type SkillCategory = 
  | 'technical'
  | 'ministry'
  | 'leadership'
  | 'communication'
  | 'research'
  | 'creative';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Endorsement {
  id: string;
  endorserId: string;
  endorserName: string;
  endorserRole: string;
  comment?: string;
  dateEndorsed: Date;
}

// Resume/CV Data
export interface ResumeData {
  // Personal Information
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
    website?: string;
  };
  
  // Professional Summary
  summary: string;
  
  // Education
  education: EducationEntry[];
  
  // Experience
  experience: ExperienceEntry[];
  
  // Skills
  skills: SkillEntry[];
  
  // Achievements
  achievements: string[];
  
  // Certifications
  certifications: CertificationEntry[];
  
  // Ministry Experience
  ministryExperience: MinistryEntry[];
  
  // References
  references: Reference[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  major: string;
  minor?: string;
  gpa: number;
  startDate: Date;
  endDate?: Date;
  honors?: string;
  relevantCourses: string[];
}

export interface ExperienceEntry {
  title: string;
  organization: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description: string;
  achievements: string[];
}

export interface SkillEntry {
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  endorsements: number;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  dateIssued: Date;
  expirationDate?: Date;
  credentialId?: string;
  verificationUrl?: string;
}

export interface MinistryEntry {
  role: string;
  ministry: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description: string;
  impact: string[];
}

export interface Reference {
  name: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  relationship: string;
}

// Avatar Upload
export interface AvatarUploadOptions {
  maxSizeBytes: number;
  allowedFormats: string[];
  aspectRatio?: number;
}

export interface AvatarUploadResult {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number;
}

// Profile Update
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  interests?: string[];
  spiritualGifts?: string[];
  ministryInterests?: string[];
  address?: Address;
  emergencyContact?: EmergencyContact;
  profileVisibility?: ProfileVisibility;
  showGPA?: boolean;
  showCourseHistory?: boolean;
  showAchievements?: boolean;
}

// API Response Types
export interface ProfileResponse {
  success: boolean;
  data?: StudentProfile;
  error?: string;
}

export interface TranscriptResponse {
  success: boolean;
  data?: AcademicTranscript;
  error?: string;
}

export interface DegreeAuditResponse {
  success: boolean;
  data?: DegreeAudit;
  error?: string;
}

export interface AchievementsResponse {
  success: boolean;
  data?: Achievement[];
  error?: string;
}

export interface SkillsResponse {
  success: boolean;
  data?: SkillEndorsement[];
  error?: string;
}

export interface ResumeResponse {
  success: boolean;
  data?: ResumeData;
  downloadUrl?: string;
  error?: string;
}
