/**
 * ScrollCourseSpec TypeScript interfaces
 * These interfaces match the YAML schema structure defined in the design document
 */

export enum ScrollField {
  ScrollMedicine = 'ScrollMedicine',
  ScrollAI = 'ScrollAI',
  ScrollLaw = 'ScrollLaw',
  ScrollBusiness = 'ScrollBusiness',
  ScrollEngineering = 'ScrollEngineering'
}

export enum CourseLevel {
  Introductory = 'Introductory',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced'
}

export enum LessonStatus {
  Draft = 'draft',
  Published = 'published',
  Completed = 'completed'
}

export enum CourseStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived'
}

export enum XPAwardType {
  LessonCompletion = 'lesson_completion',
  CourseCompletion = 'course_completion',
  AssessmentBonus = 'assessment_bonus'
}

export interface LessonSpec {
  lesson_id: string; // UUID
  title: string;
  video_url: string;
  transcript_md: string;
  status: LessonStatus;
  quiz_id: string; // UUID
  order_index?: number;
  duration_minutes?: number;
}

export interface GuardrailConfig {
  scroll_oath_enforcer: boolean;
  drift_detection: boolean;
  mentor_signoff_required: boolean;
}

export interface HookConfig {
  onCourseCreate: boolean;
  onLessonComplete: boolean;
  onCourseComplete: boolean;
  onAssessmentTrigger: boolean;
}

export interface ScrollCourseSpec {
  // Primary Course Metadata
  course_id: string; // UUID
  title: string;
  description: string; // Markdown
  scroll_field: ScrollField;
  level: CourseLevel;
  creator_id: string; // UUID
  
  // Learning Configuration
  gpt_mentor_enabled: boolean;
  xp_per_lesson: number;
  
  // Lesson Structure
  lessons: LessonSpec[];
  
  // Integration Points
  hooks: HookConfig;
  
  // Guardrail Configuration
  guardrails: GuardrailConfig;
  
  // Optional metadata
  status?: CourseStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  code: string;
}

export interface XPAward {
  award_id: string; // UUID
  student_id: string; // UUID
  lesson_id: string; // UUID
  course_id: string; // UUID
  xp_amount: number;
  scroll_coins: number;
  awarded_at: string; // ISO timestamp
  award_type: XPAwardType;
}

// Re-export multilingual types
export * from './multilingual';

// Re-export ScrollBadge types
export * from './scrollbadge';

// Re-export XR types
export * from './xr';

// Re-export Degree types
export * from './degree';

// Re-export Community types
export * from './community';

// Re-export Curriculum Grid types
export * from './curriculum-grid';

// Re-export AI Avatar Lecturers types
export * from './ai-avatar-lecturers';

// Re-export ScrollUniversity Architecture Documentation types
export * from './scroll-architecture-documentation';

// Re-export Educational Philosophy types
export * from './educational-philosophy';