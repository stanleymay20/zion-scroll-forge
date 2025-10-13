import { z } from 'zod';

// AI Tutor Integration Types
export interface AITutorSession {
  session_id: string;
  user_id: string;
  course_id?: string;
  tutor_type: TutorType;
  faculty_context?: string;
  conversation_history: TutorMessage[];
  started_at: string;
  ended_at?: string;
  satisfaction_rating?: number;
  session_metadata: SessionMetadata;
}

export type TutorType = 'ScrollMentorGPT' | 'FacultyAI' | 'GeneralAI' | 'SpecializedTutor';

export interface TutorMessage {
  message_id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  message_type: MessageType;
  context_data?: MessageContext;
  attachments?: Attachment[];
}

export type MessageType = 
  | 'text'
  | 'code'
  | 'math_equation'
  | 'diagram'
  | 'audio'
  | 'video'
  | 'interactive_content';

export interface MessageContext {
  course_context?: CourseContext;
  lesson_context?: LessonContext;
  assignment_context?: AssignmentContext;
  user_progress?: ProgressContext;
}

export interface CourseContext {
  course_id: string;
  course_title: string;
  current_module: string;
  learning_objectives: string[];
}

export interface LessonContext {
  lesson_id: string;
  lesson_title: string;
  lesson_type: string;
  key_concepts: string[];
}

export interface AssignmentContext {
  assignment_id: string;
  assignment_title: string;
  due_date: string;
  requirements: string[];
}

export interface ProgressContext {
  completion_percentage: number;
  strengths: string[];
  areas_for_improvement: string[];
  recent_activities: string[];
}

export interface Attachment {
  attachment_id: string;
  type: AttachmentType;
  name: string;
  url: string;
  size_bytes: number;
  mime_type: string;
}

export type AttachmentType = 'document' | 'image' | 'audio' | 'video' | 'code' | 'dataset';

export interface SessionMetadata {
  tutor_personality: TutorPersonality;
  language_preference: string;
  difficulty_level: DifficultyLevel;
  learning_style: LearningStyle;
  session_goals: string[];
}

export interface TutorPersonality {
  name: string;
  description: string;
  expertise_areas: string[];
  teaching_style: TeachingStyle;
  personality_traits: string[];
}

export type TeachingStyle = 
  | 'socratic'
  | 'direct_instruction'
  | 'collaborative'
  | 'inquiry_based'
  | 'problem_solving'
  | 'prophetic_wisdom';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing' | 'multimodal';

// Tutor Context and Configuration
export interface TutorContext {
  course_id?: string;
  lesson_id?: string;
  assignment_id?: string;
  faculty_id?: string;
  user_preferences: UserTutorPreferences;
  session_type: SessionType;
}

export type SessionType = 
  | 'homework_help'
  | 'concept_explanation'
  | 'exam_preparation'
  | 'project_guidance'
  | 'general_discussion'
  | 'spiritual_guidance';

export interface UserTutorPreferences {
  preferred_tutor_type: TutorType;
  language: string;
  difficulty_level: DifficultyLevel;
  learning_style: LearningStyle;
  session_duration_preference: number; // minutes
  feedback_frequency: FeedbackFrequency;
}

export type FeedbackFrequency = 'immediate' | 'periodic' | 'end_of_session' | 'minimal';

// Mentorship Types
export interface Mentor {
  mentor_id: string;
  user_id: string;
  name: string;
  title: string;
  bio: string;
  expertise_areas: string[];
  languages: string[];
  availability: MentorAvailability;
  rating: number;
  total_mentees: number;
  is_ai_mentor: boolean;
}

export interface MentorAvailability {
  time_zones: string[];
  weekly_hours: WeeklyHours[];
  booking_advance_days: number;
  session_duration_options: number[]; // minutes
}

export interface WeeklyHours {
  day_of_week: number; // 0-6, Sunday = 0
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  time_zone: string;
}

export interface MentorCriteria {
  expertise_areas?: string[];
  languages?: string[];
  availability_time_zone?: string;
  rating_minimum?: number;
  is_ai_mentor?: boolean;
  faculty_id?: string;
}

export interface MentorshipRequest {
  request_id: string;
  mentee_id: string;
  mentor_id: string;
  requested_at: string;
  status: MentorshipStatus;
  message: string;
  preferred_meeting_times: string[];
  goals: string[];
}

export type MentorshipStatus = 
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'active'
  | 'completed'
  | 'cancelled';

// AI Tutor Service Configuration
export interface AITutorConfig {
  model: string; // 'gpt-4o', 'gpt-4', etc.
  temperature: number;
  max_tokens: number;
  system_prompts: Record<TutorType, string>;
  response_caching: boolean;
  conversation_memory_limit: number;
  safety_filters: SafetyFilter[];
}

export interface SafetyFilter {
  name: string;
  enabled: boolean;
  severity_threshold: number;
  action: 'warn' | 'block' | 'escalate';
}

// Validation Schemas
export const AITutorSessionSchema = z.object({
  session_id: z.string().uuid(),
  user_id: z.string().uuid(),
  course_id: z.string().uuid().optional(),
  tutor_type: z.enum(['ScrollMentorGPT', 'FacultyAI', 'GeneralAI', 'SpecializedTutor']),
  faculty_context: z.string().optional(),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().optional(),
  satisfaction_rating: z.number().min(1).max(5).optional()
});

export const TutorMessageSchema = z.object({
  message_id: z.string().uuid(),
  sender: z.enum(['user', 'ai']),
  content: z.string().min(1),
  timestamp: z.string().datetime(),
  message_type: z.enum(['text', 'code', 'math_equation', 'diagram', 'audio', 'video', 'interactive_content'])
});

export const TutorContextSchema = z.object({
  course_id: z.string().uuid().optional(),
  lesson_id: z.string().uuid().optional(),
  assignment_id: z.string().uuid().optional(),
  faculty_id: z.string().uuid().optional(),
  session_type: z.enum(['homework_help', 'concept_explanation', 'exam_preparation', 'project_guidance', 'general_discussion', 'spiritual_guidance'])
});

export const MentorCriteriaSchema = z.object({
  expertise_areas: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  availability_time_zone: z.string().optional(),
  rating_minimum: z.number().min(0).max(5).optional(),
  is_ai_mentor: z.boolean().optional(),
  faculty_id: z.string().uuid().optional()
});