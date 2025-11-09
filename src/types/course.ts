// Comprehensive Course System Types
// Following ScrollUniversity standards for complete course structure

export interface Course {
  id: string;
  title: string;
  description: string | null;
  faculty: string | null;
  faculty_id?: string;
  instructor?: string;
  level: string | null;
  price: number;
  price_cents?: number;
  rating: number;
  students: number;
  students_count?: number;
  duration: string | null;
  tags: string[];
  xr_enabled: boolean;
  spiritual_alignment?: SpiritualAlignment;
  learning_objectives?: string[];
  prerequisites?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface SpiritualAlignment {
  kingdom_focus: string;
  biblical_foundation: string[];
  character_development: string[];
  ministry_application: string;
  prophetic_elements?: string[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  content?: {
    summary?: string;
    duration_minutes?: number;
    learning_objectives?: string[];
    has_quiz?: boolean;
    has_pdf?: boolean;
    video_url?: string;
    materials?: Array<{ title: string; type: string; url?: string }>;
    quiz?: {
      questions: Array<{
        question: string;
        options: string[];
        correct: string;
        explanation?: string;
      }>;
    };
  };
  learning_objectives?: string[];
  spiritual_alignment?: SpiritualAlignment;
  estimated_duration?: number; // in minutes
  prerequisites?: string[];
  lectures?: Lecture[];
  assessments?: Assessment[];
  assignments?: Assignment[];
  discussion_forums?: DiscussionForum[];
  resources?: CourseResource[];
  created_at?: string;
  updated_at?: string;
}

export interface Lecture {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  order_index: number;
  video_url?: string;
  video_duration?: number; // in seconds
  transcript?: string;
  closed_captions_url?: string;
  spiritual_elements: SpiritualElements;
  scripture_references: ScriptureReference[];
  prayer_moments: PrayerMoment[];
  interactive_elements: InteractiveElement[];
  notes?: LectureNote[];
  created_at: string;
  updated_at: string;
}

export interface SpiritualElements {
  prayer_integration: boolean;
  scripture_study: boolean;
  character_focus: string[];
  ministry_application: string;
  prophetic_insights?: string[];
}

export interface ScriptureReference {
  book: string;
  chapter: number;
  verse: string;
  version: string;
  context: string;
}

export interface PrayerMoment {
  timestamp: number; // seconds into video
  type: 'opening' | 'reflection' | 'intercession' | 'closing';
  prompt: string;
  duration: number; // seconds
}

export interface InteractiveElement {
  timestamp: number;
  type: 'quiz' | 'reflection' | 'discussion' | 'prayer' | 'knowledge_check';
  content: any;
  required: boolean;
}

export interface LectureNote {
  id: string;
  lecture_id: string;
  title: string;
  content: string;
  note_type: 'main' | 'supplementary' | 'reflection';
  downloadable_pdf_url?: string;
  study_questions: string[];
  reflection_prompts: string[];
  scripture_study: ScriptureStudy;
  created_at: string;
}

export interface ScriptureStudy {
  passages: ScriptureReference[];
  study_questions: string[];
  application_points: string[];
  cross_references: string[];
}

export interface Assessment {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  assessment_type: 'quiz' | 'essay' | 'project' | 'peer_review' | 'practical';
  questions: AssessmentQuestion[];
  rubric: AssessmentRubric;
  max_score: number;
  passing_score: number;
  time_limit?: number; // in minutes
  attempts_allowed: number;
  spiritual_reflection: SpiritualReflection;
  created_at: string;
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'practical' | 'spiritual_reflection';
  question: string;
  options?: string[]; // for multiple choice
  correct_answer?: string | string[];
  points: number;
  explanation?: string;
  scripture_basis?: ScriptureReference[];
}

export interface AssessmentRubric {
  criteria: RubricCriterion[];
  spiritual_dimensions: SpiritualDimension[];
  ministry_application: MinistryApplication;
}

export interface RubricCriterion {
  name: string;
  description: string;
  levels: RubricLevel[];
  weight: number; // percentage
}

export interface RubricLevel {
  name: string;
  description: string;
  points: number;
}

export interface SpiritualDimension {
  aspect: string;
  description: string;
  evaluation_criteria: string[];
}

export interface MinistryApplication {
  practical_skills: string[];
  character_qualities: string[];
  spiritual_maturity: string[];
  leadership_readiness: string[];
}

export interface SpiritualReflection {
  prompts: string[];
  scripture_meditation: ScriptureReference[];
  prayer_focus: string[];
  character_development: string[];
}

export interface Assignment {
  id: string;
  module_id: string;
  title: string;
  description: string;
  assignment_type: 'practical' | 'portfolio' | 'ministry' | 'community_service';
  instructions: AssignmentInstructions;
  deliverables: Deliverable[];
  evaluation_criteria: EvaluationCriteria;
  due_date?: string;
  ministry_application: MinistryApplication;
  community_impact: CommunityImpact;
  created_at: string;
}

export interface AssignmentInstructions {
  overview: string;
  steps: string[];
  resources: string[];
  spiritual_preparation: string[];
  submission_format: string;
}

export interface Deliverable {
  name: string;
  description: string;
  format: string;
  required: boolean;
  spiritual_component: boolean;
}

export interface EvaluationCriteria {
  academic_excellence: number; // percentage weight
  spiritual_integration: number;
  practical_application: number;
  character_demonstration: number;
  ministry_readiness: number;
}

export interface CommunityImpact {
  target_audience: string;
  expected_outcomes: string[];
  measurement_methods: string[];
  kingdom_advancement: string;
}

export interface DiscussionForum {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  forum_type: 'general' | 'reflection' | 'prayer' | 'ministry';
  moderated: boolean;
  posts?: ForumPost[];
  created_at: string;
}

export interface ForumPost {
  id: string;
  forum_id: string;
  user_id: string;
  parent_post_id?: string;
  title?: string;
  content: string;
  post_type: 'discussion' | 'prayer_request' | 'testimony' | 'question';
  spiritual_insights: SpiritualInsights;
  likes_count: number;
  replies?: ForumPost[];
  created_at: string;
}

export interface SpiritualInsights {
  revelations: string[];
  scripture_connections: ScriptureReference[];
  prayer_points: string[];
  prophetic_elements?: string[];
}

export interface CourseResource {
  id: string;
  course_id: string;
  module_id?: string;
  title: string;
  description?: string;
  resource_type: 'reading' | 'video' | 'audio' | 'document' | 'link' | 'scripture';
  resource_url?: string;
  file_size?: number;
  download_count: number;
  tags: string[];
  spiritual_category?: string;
  created_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  module_id?: string;
  lecture_id?: string;
  progress_type: 'lecture_viewed' | 'assessment_completed' | 'assignment_submitted';
  completion_percentage: number;
  time_spent: number; // in seconds
  spiritual_growth_notes?: string;
  created_at: string;
}

export interface StudentSubmission {
  id: string;
  user_id: string;
  assessment_id?: string;
  assignment_id?: string;
  submission_data: any;
  score?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  spiritual_reflection?: string;
  ministry_application?: string;
  submitted_at: string;
}

export interface AIGradingResult {
  id: string;
  submission_id: string;
  ai_score: number;
  ai_feedback: string;
  spiritual_insights: string;
  improvement_suggestions: string[];
  confidence_level: number;
  human_review_required: boolean;
  created_at: string;
}

export interface PeerEvaluation {
  id: string;
  evaluator_id: string;
  submission_id: string;
  evaluation_criteria: any;
  scores: any;
  feedback: string;
  spiritual_encouragement: string;
  created_at: string;
}

export interface CourseCompletion {
  id: string;
  user_id: string;
  course_id: string;
  completion_date: string;
  final_score: number;
  certificate_url?: string;
  scroll_badge_nft_id?: string;
  spiritual_growth_summary: string;
  ministry_readiness_score: number;
  created_at: string;
}

// Enrollment interface
export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  course?: Course;
}

// Analytics interfaces
export interface CourseAnalytics {
  course_id: string;
  course_title: string;
  faculty: string;
  total_modules: number;
  total_lectures: number;
  total_assessments: number;
  total_assignments: number;
  enrolled_students: number;
  avg_progress: number;
  completions: number;
  completion_rate: number;
  avg_final_score: number;
  forum_posts: number;
  avg_time_spent: number;
}

export interface StudentLearningAnalytics {
  user_id: string;
  email: string;
  enrolled_courses: number;
  completed_courses: number;
  avg_progress: number;
  total_study_time: number;
  total_submissions: number;
  avg_score: number;
  forum_participation: number;
  avg_final_score: number;
  ministry_ready_courses: number;
}

// API Response types
export interface CourseListResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
}

export interface CourseDetailResponse {
  course: Course;
  modules: CourseModule[];
  enrollment?: Enrollment;
  progress?: CourseProgress[];
  analytics?: CourseAnalytics;
}

export interface ModuleContentResponse {
  module: CourseModule;
  lectures: Lecture[];
  assessments: Assessment[];
  assignments: Assignment[];
  forums: DiscussionForum[];
  resources: CourseResource[];
  progress?: CourseProgress[];
}

// Filter and search types
export interface CourseFilters {
  search?: string;
  faculty?: string;
  level?: string;
  tags?: string[];
  xr_enabled?: boolean;
  price_range?: [number, number];
  rating_min?: number;
}

export interface CourseSortOptions {
  field: 'title' | 'rating' | 'students' | 'price' | 'created_at';
  direction: 'asc' | 'desc';
}