import { z } from 'zod';

// User and Authentication Types
export interface ScrollUser {
  user_id: string;
  email: string;
  scroll_coin_wallet: string;
  preferred_language: string;
  role: UserRole;
  profile: UserProfile;
  enrollments: Enrollment[];
  achievements: Achievement[];
  created_at: string;
  updated_at: string;
}

export type UserRole = 'student' | 'faculty' | 'ai_dean' | 'admin' | 'global_ambassador';

export interface UserProfile {
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  time_zone: string;
  scroll_node_id?: string;
  degree_programs: DegreeProgram[];
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  course_updates: boolean;
  assignment_reminders: boolean;
  ai_tutor_availability: boolean;
  xr_session_reminders: boolean;
}

export interface AccessibilityPreferences {
  high_contrast: boolean;
  large_text: boolean;
  screen_reader: boolean;
  keyboard_navigation: boolean;
  reduced_motion: boolean;
}

export interface PrivacyPreferences {
  profile_visibility: 'public' | 'private' | 'friends';
  progress_sharing: boolean;
  analytics_opt_in: boolean;
}

// Authentication Types
export interface LoginCredentials {
  email?: string;
  scroll_coin_wallet?: string;
  password?: string;
  wallet_signature?: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  preferred_language: string;
  location?: string;
  time_zone: string;
}

export interface AuthResponse {
  user: ScrollUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Dashboard Types
export interface DashboardData {
  user: ScrollUser;
  current_courses: PortalCourse[];
  progress_summary: ProgressSummary;
  recent_activities: Activity[];
  notifications: Notification[];
  scroll_coin_balance: number;
  upcoming_sessions: UpcomingSession[];
}

export interface ProgressSummary {
  total_xp: number;
  courses_completed: number;
  courses_in_progress: number;
  achievements_earned: number;
  study_streak: number;
  weekly_progress: WeeklyProgress[];
}

export interface WeeklyProgress {
  week: string;
  xp_earned: number;
  hours_studied: number;
  assignments_completed: number;
}

export interface Activity {
  activity_id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export type ActivityType = 
  | 'course_enrollment'
  | 'assignment_submission'
  | 'achievement_earned'
  | 'ai_tutor_session'
  | 'xr_session_attended'
  | 'scroll_coin_earned';

export interface Notification {
  notification_id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
}

export type NotificationType = 
  | 'course_update'
  | 'assignment_due'
  | 'grade_available'
  | 'ai_tutor_available'
  | 'xr_session_starting'
  | 'system_announcement';

export interface UpcomingSession {
  session_id: string;
  type: 'xr_classroom' | 'ai_tutor' | 'live_lecture' | 'study_group';
  title: string;
  start_time: string;
  duration_minutes: number;
  course_id?: string;
}

// Validation Schemas
export const ScrollUserSchema = z.object({
  user_id: z.string().uuid(),
  email: z.string().email(),
  scroll_coin_wallet: z.string(),
  preferred_language: z.string().length(2),
  role: z.enum(['student', 'faculty', 'ai_dean', 'admin', 'global_ambassador']),
  profile: z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    avatar_url: z.string().url().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
    time_zone: z.string(),
    scroll_node_id: z.string().uuid().optional()
  }),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const LoginCredentialsSchema = z.object({
  email: z.string().email().optional(),
  scroll_coin_wallet: z.string().optional(),
  password: z.string().optional(),
  wallet_signature: z.string().optional()
}).refine(data => 
  (data.email && data.password) || (data.scroll_coin_wallet && data.wallet_signature),
  { message: "Either email/password or wallet/signature must be provided" }
);

export const RegistrationDataSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  preferred_language: z.string().length(2),
  location: z.string().optional(),
  time_zone: z.string()
});