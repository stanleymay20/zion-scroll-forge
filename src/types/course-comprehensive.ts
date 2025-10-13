/**
 * Comprehensive Course Types for ScrollUniversity
 * Implements all mandatory course components as per steering rules:
 * - Modules, lectures, notes, videos, assessments
 * - Spiritual formation integration
 * - ScrollCoin rewards and XP tracking
 * - AI tutoring and mentorship
 */

export type ScrollField = 
  | 'ScrollMedicine' 
  | 'ScrollAI' 
  | 'ScrollGovernance' 
  | 'ScrollBusiness' 
  | 'ScrollEngineering'
  | 'ScrollTheology'
  | 'ScrollEconomy'
  | 'PropheticLaw'
  | 'EdenicScience'
  | 'GeoPropheticIntelligence';

export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'dropped';
export type AssessmentType = 'quiz' | 'project' | 'peer_review' | 'practical' | 'spiritual_reflection';

export interface CourseModule {
  module_id: string;
  title: string;
  description: string;
  order: number;
  lectures: Lecture[];
  assessments: Assessment[];
  spiritual_formation_component: SpiritualFormationComponent;
  estimated_hours: number;
  xp_reward: number;
  prerequisites?: string[];
}

export interface Lecture {
  lecture_id: string;
  module_id: string;
  title: string;
  description: string;
  video_url?: string;
  video_duration?: number; // in minutes
  transcript_md: string;
  lecture_notes: LectureNotes;
  resources: CourseResource[];
  interactive_elements: InteractiveElement[];
  xp_reward: number;
  order: number;
  spiritual_integration: SpiritualIntegration;
  ai_tutor_context: string;
}

export interface LectureNotes {
  notes_id: string;
  lecture_id: string;
  content_md: string;
  key_concepts: string[];
  scripture_references?: ScriptureReference[];
  practical_applications: string[];
  reflection_questions: string[];
  downloadable_pdf_url?: string;
}

export interface CourseResource {
  resource_id: string;
  title: string;
  type: 'reading' | 'video' | 'audio' | 'interactive' | 'scripture' | 'prayer_guide';
  url?: string;
  content?: string;
  estimated_time: number; // in minutes
  required: boolean;
  spiritual_focus?: string;
}

export interface InteractiveElement {
  element_id: string;
  type: 'knowledge_check' | 'reflection' | 'discussion' | 'prayer_moment' | 'practical_exercise';
  title: string;
  content: string;
  xp_reward: number;
  required: boolean;
}

export interface Assessment {
  assessment_id: string;
  module_id?: string;
  course_id: string;
  type: AssessmentType;
  title: string;
  description: string;
  instructions_md: string;
  rubric: AssessmentRubric;
  passing_score: number;
  max_attempts: number;
  xp_reward: number;
  scrollcoin_reward: number;
  time_limit?: number; // in minutes
  required: boolean;
  spiritual_component?: SpiritualAssessmentComponent;
  ai_grading_enabled: boolean;
  peer_review_required: boolean;
}

export interface AssessmentRubric {
  criteria: RubricCriterion[];
  total_points: number;
  grading_scale: GradingScale;
}

export interface RubricCriterion {
  criterion_id: string;
  name: string;
  description: string;
  points: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  level: string;
  description: string;
  points: number;
}

export interface GradingScale {
  A: { min: number; max: number };
  B: { min: number; max: number };
  C: { min: number; max: number };
  D: { min: number; max: number };
  F: { min: number; max: number };
}

export interface SpiritualFormationComponent {
  component_id: string;
  title: string;
  description: string;
  scripture_focus?: ScriptureReference[];
  prayer_points: string[];
  character_development_focus: string[];
  ministry_application: string;
  prophetic_elements?: PropheticElement[];
}

export interface SpiritualIntegration {
  biblical_foundation: string;
  kingdom_principles: string[];
  character_formation_focus: string;
  ministry_application: string;
  prayer_focus: string;
}

export interface SpiritualAssessmentComponent {
  spiritual_reflection_required: boolean;
  character_assessment: string[];
  ministry_application_required: boolean;
  prayer_component: string;
  prophetic_discernment?: string;
}

export interface ScriptureReference {
  book: string;
  chapter: number;
  verse_start: number;
  verse_end?: number;
  version: string;
  context: string;
}

export interface PropheticElement {
  element_id: string;
  type: 'prophetic_word' | 'vision' | 'dream' | 'intercession_focus';
  content: string;
  application: string;
  discernment_notes: string;
}

export interface ComprehensiveCourse {
  course_id: string;
  title: string;
  description: string;
  scroll_field: ScrollField;
  difficulty_level: DifficultyLevel;
  xp_multiplier: number;
  scrollcoin_multiplier: number;
  
  // Course Structure
  modules: CourseModule[];
  prerequisites: string[];
  learning_objectives: string[];
  spiritual_objectives: string[];
  
  // Content Requirements
  estimated_hours: number;
  total_lectures: number;
  total_assessments: number;
  final_project_required: boolean;
  
  // AI and Tutoring
  gpt_tutor_enabled: boolean;
  ai_avatar_lecturer?: string;
  mentorship_required: boolean;
  
  // Spiritual Formation
  spiritual_formation_track: SpiritualFormationTrack;
  calling_discernment_integration: boolean;
  ministry_preparation_focus?: string;
  
  // Progress and Rewards
  milestone_rewards: MilestoneReward[];
  completion_certificate: CompletionCertificate;
  scrollbadge_eligibility?: string[];
  
  // Metadata
  status: CourseStatus;
  created_by: string;
  faculty_id?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  
  // Integration Points
  transcript_integration: boolean;
  project_spec_integration: boolean;
  audit_trail_enabled: boolean;
}

export interface SpiritualFormationTrack {
  track_id: string;
  name: string;
  description: string;
  divine_scorecard_integration: boolean;
  prophetic_checkins_required: boolean;
  intercession_prayer_component: boolean;
  character_development_milestones: string[];
  ministry_readiness_indicators: string[];
}

export interface MilestoneReward {
  milestone_id: string;
  percentage: number; // 25, 50, 75, 100
  xp_reward: number;
  scrollcoin_reward: number;
  badge_unlock?: string;
  special_recognition?: string;
  spiritual_milestone?: string;
}

export interface CompletionCertificate {
  certificate_id: string;
  template_type: 'basic' | 'verified' | 'scroll_certified';
  blockchain_verification: boolean;
  nft_badge_creation: boolean;
  ministry_endorsement?: boolean;
  accreditation_value: number;
}

export interface StudentEnrollment {
  enrollment_id: string;
  course_id: string;
  student_id: string;
  enrollment_date: string;
  status: EnrollmentStatus;
  
  // Progress Tracking
  progress_percentage: number;
  current_module: string;
  current_lecture: string;
  completed_modules: string[];
  completed_lectures: string[];
  completed_assessments: AssessmentCompletion[];
  
  // XP and Rewards
  total_xp_earned: number;
  total_scrollcoin_earned: number;
  milestones_achieved: string[];
  badges_earned: string[];
  
  // Spiritual Formation Progress
  spiritual_growth_metrics: SpiritualGrowthMetrics;
  divine_scorecard_updates: DivineScoreCardUpdate[];
  prophetic_checkins: PropheticCheckin[];
  
  // AI Tutoring and Support
  tutoring_sessions: TutoringSession[];
  mentor_assignments: MentorAssignment[];
  support_interventions: SupportIntervention[];
  
  // Activity and Engagement
  last_activity: string;
  total_study_time: number; // in minutes
  engagement_score: number;
  completion_date?: string;
  
  // Alerts and Notifications
  mentor_alerts: MentorAlert[];
  system_notifications: SystemNotification[];
}

export interface AssessmentCompletion {
  assessment_id: string;
  score: number;
  grade: string;
  completed_at: string;
  attempts: number;
  feedback: string;
  ai_feedback?: string;
  peer_reviews?: PeerReview[];
  spiritual_reflection?: string;
}

export interface SpiritualGrowthMetrics {
  character_development_score: number;
  ministry_readiness_level: number;
  prophetic_sensitivity_growth: number;
  intercession_engagement: number;
  scripture_knowledge_growth: number;
  practical_application_score: number;
}

export interface DivineScoreCardUpdate {
  update_id: string;
  date: string;
  category: string;
  score_change: number;
  reason: string;
  course_related: boolean;
}

export interface PropheticCheckin {
  checkin_id: string;
  date: string;
  prophetic_word?: string;
  spiritual_insights: string[];
  prayer_requests: string[];
  ministry_direction?: string;
  course_application: string;
}

export interface TutoringSession {
  session_id: string;
  date: string;
  tutor_type: 'ai' | 'human' | 'avatar_lecturer';
  tutor_id: string;
  duration: number; // in minutes
  topics_covered: string[];
  questions_asked: string[];
  resources_provided: string[];
  follow_up_required: boolean;
  effectiveness_rating?: number;
}

export interface MentorAssignment {
  assignment_id: string;
  mentor_id: string;
  assigned_date: string;
  focus_areas: string[];
  meeting_frequency: string;
  spiritual_guidance_included: boolean;
  active: boolean;
}

export interface SupportIntervention {
  intervention_id: string;
  trigger: string;
  type: 'academic' | 'spiritual' | 'technical' | 'motivational';
  description: string;
  actions_taken: string[];
  outcome: string;
  date: string;
}

export interface MentorAlert {
  alert_id: string;
  type: 'progress_concern' | 'spiritual_need' | 'academic_struggle' | 'engagement_drop';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  resolved: boolean;
  resolution_notes?: string;
}

export interface SystemNotification {
  notification_id: string;
  type: 'milestone' | 'reminder' | 'encouragement' | 'spiritual_prompt' | 'assignment_due';
  title: string;
  message: string;
  action_required: boolean;
  read: boolean;
  created_at: string;
}

export interface PeerReview {
  review_id: string;
  reviewer_id: string;
  score: number;
  feedback: string;
  spiritual_encouragement?: string;
  submitted_at: string;
}

// API Response Types
export interface CourseListResponse {
  courses: ComprehensiveCourse[];
  total: number;
  page: number;
  limit: number;
  filters_applied: CourseFilters;
}

export interface CourseFilters {
  scroll_field?: ScrollField[];
  difficulty_level?: DifficultyLevel[];
  status?: CourseStatus[];
  has_ai_tutor?: boolean;
  spiritual_formation_required?: boolean;
  estimated_hours_min?: number;
  estimated_hours_max?: number;
}

export interface EnrollmentResponse {
  enrollment: StudentEnrollment;
  course: ComprehensiveCourse;
  next_steps: string[];
  mentor_assignment?: MentorAssignment;
  spiritual_formation_plan: SpiritualFormationTrack;
}

export interface ProgressUpdateResponse {
  success: boolean;
  new_progress_percentage: number;
  xp_awarded: number;
  scrollcoin_awarded: number;
  milestones_achieved: string[];
  badges_unlocked: string[];
  spiritual_growth_update?: SpiritualGrowthMetrics;
  next_recommended_action: string;
}

// Service Integration Types
export interface CourseIntegrationConfig {
  transcript_generator_enabled: boolean;
  project_spec_integration: boolean;
  xp_tracker_sync: boolean;
  audit_trail_logging: boolean;
  scrollcoin_rewards_enabled: boolean;
  ai_tutoring_enabled: boolean;
  spiritual_formation_tracking: boolean;
  mentor_assignment_automation: boolean;
}

export interface AITutoringConfig {
  gpt_model: string;
  max_session_length: number;
  escalation_triggers: string[];
  spiritual_guidance_enabled: boolean;
  course_context_depth: number;
  response_style: 'academic' | 'conversational' | 'spiritual_mentor';
}