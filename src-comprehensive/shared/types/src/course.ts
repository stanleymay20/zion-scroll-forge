import { z } from 'zod';

// Course and Enrollment Types
export interface PortalCourse {
  portal_course_id: string;
  course_spec_id: string; // Reference to ScrollCourseSpec
  faculty_id: string;
  title: string;
  description: string;
  level: CourseLevel;
  duration_weeks: number;
  xp_reward: number;
  scroll_coin_cost: number;
  prerequisites: string[];
  featured: boolean;
  enrollment_open: boolean;
  enrollment_count: number;
  rating: number;
  instructor: Instructor;
  syllabus: CourseSyllabus;
  created_at: string;
}

export type CourseLevel = 'Introductory' | 'Intermediate' | 'Advanced';

export interface Instructor {
  instructor_id: string;
  name: string;
  title: string;
  bio: string;
  avatar_url?: string;
  specializations: string[];
}

export interface CourseSyllabus {
  overview: string;
  learning_objectives: string[];
  modules: CourseModule[];
  assessment_methods: string[];
  required_materials: string[];
}

export interface CourseModule {
  module_id: string;
  title: string;
  description: string;
  duration_hours: number;
  lessons: Lesson[];
  assignments: Assignment[];
}

export interface Lesson {
  lesson_id: string;
  title: string;
  type: LessonType;
  duration_minutes: number;
  content_url?: string;
  xr_enabled: boolean;
}

export type LessonType = 'video' | 'reading' | 'interactive' | 'xr_experience' | 'live_session';

export interface Assignment {
  assignment_id: string;
  title: string;
  description: string;
  type: AssignmentType;
  due_date: string;
  points: number;
  submission_format: string[];
}

export type AssignmentType = 'essay' | 'quiz' | 'project' | 'presentation' | 'practical';

// Enrollment Types
export interface Enrollment {
  enrollment_id: string;
  user_id: string;
  course_id: string;
  enrollment_date: string;
  completion_date?: string;
  progress_percentage: number;
  xp_earned: number;
  scroll_coins_earned: number;
  current_lesson_id?: string;
  status: EnrollmentStatus;
  grade?: Grade;
}

export type EnrollmentStatus = 'active' | 'completed' | 'paused' | 'dropped';

export interface Grade {
  letter_grade: string;
  percentage: number;
  points_earned: number;
  points_possible: number;
  feedback?: string;
}

// Faculty and Department Types
export interface Faculty {
  faculty_id: string;
  name: string;
  description: string;
  ai_dean_id: string;
  courses: PortalCourse[];
  faculty_members: FacultyMember[];
  created_at: string;
}

export interface FacultyMember {
  member_id: string;
  user_id: string;
  faculty_id: string;
  title: string;
  specializations: string[];
  bio: string;
  office_hours: OfficeHours[];
}

export interface OfficeHours {
  day_of_week: number; // 0-6, Sunday = 0
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  time_zone: string;
  location: string; // 'virtual' or physical location
}

// Course Filtering and Search
export interface CourseFilters {
  faculty_id?: string;
  level?: CourseLevel;
  language?: string;
  featured?: boolean;
  enrollment_open?: boolean;
  min_rating?: number;
  max_cost?: number;
  duration_weeks?: {
    min?: number;
    max?: number;
  };
  search_query?: string;
}

// Degree Program Types
export interface DegreeProgram {
  program_id: string;
  name: string;
  description: string;
  faculty_id: string;
  required_credits: number;
  duration_years: number;
  required_courses: string[];
  elective_courses: string[];
  capstone_requirements: string[];
}

export interface DegreeProgress {
  program_id: string;
  student_id: string;
  credits_earned: number;
  credits_required: number;
  gpa: number;
  completed_courses: string[];
  in_progress_courses: string[];
  remaining_requirements: string[];
  projected_graduation: string;
}

// Assessment Types
export interface Assessment {
  assessment_id: string;
  course_id: string;
  title: string;
  description: string;
  type: AssessmentType;
  questions: Question[];
  time_limit_minutes?: number;
  attempts_allowed: number;
  due_date: string;
  points_possible: number;
}

export type AssessmentType = 'quiz' | 'exam' | 'assignment' | 'project' | 'peer_review';

export interface Question {
  question_id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correct_answer?: string | string[];
  points: number;
  explanation?: string;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching';

export interface AssessmentAnswers {
  assessment_id: string;
  answers: Record<string, string | string[]>;
  time_spent_minutes: number;
}

export interface AssessmentResult {
  result_id: string;
  assessment_id: string;
  student_id: string;
  score: number;
  percentage: number;
  grade: string;
  feedback: string;
  submitted_at: string;
  graded_at?: string;
}

// Achievement Types
export interface Achievement {
  achievement_id: string;
  name: string;
  description: string;
  icon_url: string;
  category: AchievementCategory;
  xp_reward: number;
  scroll_coin_reward: number;
  earned_at?: string;
  progress?: AchievementProgress;
}

export type AchievementCategory = 
  | 'academic_excellence'
  | 'course_completion'
  | 'community_engagement'
  | 'spiritual_growth'
  | 'technical_mastery'
  | 'leadership';

export interface AchievementProgress {
  current: number;
  target: number;
  percentage: number;
}

// Validation Schemas
export const PortalCourseSchema = z.object({
  portal_course_id: z.string().uuid(),
  course_spec_id: z.string().uuid(),
  faculty_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  level: z.enum(['Introductory', 'Intermediate', 'Advanced']),
  duration_weeks: z.number().positive(),
  xp_reward: z.number().nonnegative(),
  scroll_coin_cost: z.number().nonnegative(),
  prerequisites: z.array(z.string()),
  featured: z.boolean(),
  enrollment_open: z.boolean(),
  enrollment_count: z.number().nonnegative(),
  rating: z.number().min(0).max(5),
  created_at: z.string().datetime()
});

export const EnrollmentSchema = z.object({
  enrollment_id: z.string().uuid(),
  user_id: z.string().uuid(),
  course_id: z.string().uuid(),
  enrollment_date: z.string().datetime(),
  completion_date: z.string().datetime().optional(),
  progress_percentage: z.number().min(0).max(100),
  xp_earned: z.number().nonnegative(),
  scroll_coins_earned: z.number().nonnegative(),
  current_lesson_id: z.string().uuid().optional(),
  status: z.enum(['active', 'completed', 'paused', 'dropped'])
});

export const CourseFiltersSchema = z.object({
  faculty_id: z.string().uuid().optional(),
  level: z.enum(['Introductory', 'Intermediate', 'Advanced']).optional(),
  language: z.string().length(2).optional(),
  featured: z.boolean().optional(),
  enrollment_open: z.boolean().optional(),
  min_rating: z.number().min(0).max(5).optional(),
  max_cost: z.number().nonnegative().optional(),
  duration_weeks: z.object({
    min: z.number().positive().optional(),
    max: z.number().positive().optional()
  }).optional(),
  search_query: z.string().optional()
});