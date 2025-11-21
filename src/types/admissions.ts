/**
 * ScrollUniversity Admissions Application Types
 * Frontend type definitions for the admissions system
 */

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  DECISION_PENDING = 'DECISION_PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WAITLISTED = 'WAITLISTED',
  WITHDRAWN = 'WITHDRAWN',
  DEFERRED = 'DEFERRED'
}

export enum ProgramType {
  UNDERGRADUATE = 'UNDERGRADUATE',
  GRADUATE = 'GRADUATE',
  DOCTORAL = 'DOCTORAL',
  CERTIFICATE = 'CERTIFICATE',
  DIPLOMA = 'DIPLOMA'
}

export enum DocumentType {
  TRANSCRIPT = 'TRANSCRIPT',
  RECOMMENDATION_LETTER = 'RECOMMENDATION_LETTER',
  PERSONAL_STATEMENT = 'PERSONAL_STATEMENT',
  SPIRITUAL_TESTIMONY = 'SPIRITUAL_TESTIMONY',
  RESUME = 'RESUME',
  IDENTIFICATION = 'IDENTIFICATION',
  PROOF_OF_MINISTRY = 'PROOF_OF_MINISTRY',
  LANGUAGE_PROFICIENCY = 'LANGUAGE_PROFICIENCY',
  OTHER = 'OTHER'
}

export enum AdmissionDecisionType {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WAITLISTED = 'WAITLISTED',
  CONDITIONAL_ACCEPTANCE = 'CONDITIONAL_ACCEPTANCE',
  DEFERRED = 'DEFERRED'
}

export enum InterviewType {
  INITIAL_SCREENING = 'INITIAL_SCREENING',
  SPIRITUAL_ASSESSMENT = 'SPIRITUAL_ASSESSMENT',
  ACADEMIC_EVALUATION = 'ACADEMIC_EVALUATION',
  FINAL_INTERVIEW = 'FINAL_INTERVIEW'
}

export enum InterviewFormat {
  VIDEO = 'VIDEO',
  PHONE = 'PHONE',
  IN_PERSON = 'IN_PERSON'
}

export interface Application {
  id: string;
  applicantId: string;
  programApplied: ProgramType;
  status: ApplicationStatus;
  submissionDate?: Date;
  intendedStartDate: Date;
  formData?: Record<string, any>;
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormField {
  id: string;
  fieldType: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'file' | 'checkbox' | 'radio' | 'number' | 'email' | 'phone';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: FieldValidation;
  options?: string[];
  helpText?: string;
  order: number;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  fileTypes?: string[];
  maxFileSize?: number;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  order: number;
}

export interface FormTemplate {
  id: string;
  name: string;
  programType: ProgramType;
  sections: FormSection[];
  isActive: boolean;
  version: string;
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  documentType: DocumentType;
  documentUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface Interview {
  id: string;
  applicationId: string;
  interviewType: InterviewType;
  format: InterviewFormat;
  scheduledDate: Date;
  duration: number;
  platform?: string;
  meetingUrl?: string;
  interviewerName?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  preparationMaterials?: string[];
}

export interface Decision {
  id: string;
  applicationId: string;
  decision: AdmissionDecisionType;
  decisionDate: Date;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  overallAssessment: string;
  admissionConditions?: string[];
  enrollmentDeadline?: Date;
  nextSteps: string[];
  appealEligible: boolean;
  appealDeadline?: Date;
}

export interface TimelineEvent {
  eventId: string;
  eventType: string;
  eventDate: Date;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  details?: string;
}

export interface DocumentRequirement {
  documentType: DocumentType;
  required: boolean;
  uploaded: boolean;
  verified: boolean;
  deadline?: Date;
  instructions: string;
}

export interface ApplicantDashboard {
  applicationId: string;
  applicantId: string;
  applicationStatus: ApplicationStatus;
  programApplied: ProgramType;
  submissionDate?: Date;
  timeline: TimelineEvent[];
  completionPercentage: number;
  nextSteps: string[];
  requiredDocuments: DocumentRequirement[];
  upcomingInterviews: Interview[];
  decision?: Decision;
}

export interface Appeal {
  id: string;
  applicationId: string;
  reason: string;
  additionalEvidence: string;
  submittedDate: Date;
  status: 'pending' | 'under_review' | 'approved' | 'denied';
  reviewNotes?: string;
  decisionDate?: Date;
}
