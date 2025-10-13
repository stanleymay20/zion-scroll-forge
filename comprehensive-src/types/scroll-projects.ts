/**
 * ScrollProjectsSpec TypeScript Interfaces
 * Core data models for the ScrollUniversity project management system
 */

// Enumerations
export enum ProjectStatus {
  PROPOSAL = 'proposal',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  SUBMITTED = 'submitted',
  LISTED = 'listed',
  ARCHIVED = 'archived'
}

export enum MilestoneStage {
  PROPOSAL = 'Proposal',
  PROTOTYPE = 'Prototype',
  TESTING = 'Testing',
  FINAL = 'Final'
}

export enum ScrollField {
  SCROLL_MEDICINE = 'ScrollMedicine',
  SCROLL_AI = 'ScrollAI',
  SCROLL_GOVERNANCE = 'ScrollGovernance',
  SCROLL_ECONOMY = 'ScrollEconomy',
  SCROLL_THEOLOGY = 'ScrollTheology',
  SCROLL_LAW = 'ScrollLaw',
  SCROLL_ENGINEERING = 'ScrollEngineering',
  SCROLL_ARTS = 'ScrollArts',
  SCROLL_HEALTH = 'ScrollHealth',
  SCROLL_EDUCATION = 'ScrollEducation'
}

export enum FeedbackType {
  APPROVAL = 'approval',
  REVISION_REQUIRED = 'revision_required',
  REJECTION = 'rejection',
  GUIDANCE = 'guidance'
}

// Core Interfaces
export interface ScrollProjectSpec {
  project_id: string;
  student_id: string;
  title: string;
  description: string;
  scroll_field: ScrollField;
  mentor_id: string;
  status: ProjectStatus;
  milestones: MilestoneSpec[];
  gpt_summary: string;
  scrollcoin_earned: number;
  published: boolean;
  created_at: Date;
  updated_at: Date;
  integrity_seal?: IntegritySeal;
  metadata?: ProjectMetadata;
}

export interface MilestoneSpec {
  milestone_id: string;
  project_id: string;
  stage: MilestoneStage;
  title: string;
  description: string;
  completed: boolean;
  submitted_at?: Date;
  approved_at?: Date;
  feedback: MentorFeedback[];
  required_deliverables: string[];
  validation_criteria: ValidationCriteria[];
  completion_percentage: number;
}

export interface MentorFeedback {
  feedback_id: string;
  mentor_id: string;
  mentor_type: 'human' | 'ai';
  feedback_type: FeedbackType;
  content: string;
  provided_at: Date;
  milestone_id: string;
  actionable_items?: string[];
  approval_status?: boolean;
}

export interface ValidationCriteria {
  criteria_id: string;
  name: string;
  description: string;
  required: boolean;
  validation_method: 'manual' | 'automated' | 'hybrid';
  scroll_alignment_weight: number;
  met: boolean;
  evidence?: string;
}

export interface IntegritySeal {
  seal_id: string;
  applied_by: string;
  applied_at: Date;
  seal_type: 'scroll_oath' | 'drift_verified' | 'mentor_approved';
  verification_hash: string;
  expiry_date?: Date;
}

export interface ProjectMetadata {
  tags: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_weeks: number;
  real_world_impact_score: number;
  collaboration_allowed: boolean;
  public_visibility: boolean;
  marketplace_category?: string;
}

// Request/Response Interfaces
export interface CreateProjectRequest {
  title: string;
  description: string;
  scroll_field: ScrollField;
  estimated_duration_weeks?: number;
  collaboration_allowed?: boolean;
  tags?: string[];
}

export interface MilestoneSubmission {
  milestone_id: string;
  deliverables: ProjectDeliverable[];
  submission_notes: string;
  evidence_links: string[];
  self_assessment: SelfAssessment;
}

export interface ProjectDeliverable {
  deliverable_id: string;
  name: string;
  type: 'document' | 'code' | 'demo' | 'presentation' | 'data' | 'other';
  url: string;
  description: string;
  file_size?: number;
  mime_type?: string;
}

export interface SelfAssessment {
  completion_percentage: number;
  challenges_faced: string[];
  lessons_learned: string[];
  next_steps: string[];
  scroll_alignment_confidence: number; // 1-10 scale
}

// Validation and Error Interfaces
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  scroll_alignment_score: number;
}

export interface ValidationError {
  field: string;
  message: string;
  error_code: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

// Service Response Interfaces
export interface ProjectCreationResponse {
  project: ScrollProjectSpec;
  assigned_mentor: MentorProfile;
  initial_milestones: MilestoneSpec[];
  success: boolean;
  message: string;
}

export interface MilestoneProgressResponse {
  milestone: MilestoneSpec;
  next_milestone?: MilestoneSpec;
  overall_progress: number;
  gpt_summary: string;
  mentor_notification_sent: boolean;
}

export interface RewardCalculation {
  base_scrollcoin: number;
  impact_bonus: number;
  mentor_bonus: number;
  total_scrollcoin: number;
  xp_awarded: number;
  calculation_details: RewardBreakdown[];
}

export interface RewardBreakdown {
  category: string;
  amount: number;
  reason: string;
  multiplier?: number;
}

// External Integration Interfaces
export interface MentorProfile {
  mentor_id: string;
  name: string;
  type: 'human' | 'ai';
  scroll_fields: ScrollField[];
  expertise_level: number;
  availability_status: 'available' | 'busy' | 'unavailable';
  response_time_hours: number;
}

export interface MarketplaceListingData {
  project_id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  demo_url?: string;
  documentation_url?: string;
  pricing_model: 'free' | 'freemium' | 'paid' | 'donation';
  usage_metrics: UsageMetrics;
}

export interface UsageMetrics {
  total_users: number;
  active_users_30d: number;
  total_sessions: number;
  average_session_duration: number;
  user_satisfaction_score: number;
  revenue_generated?: number;
}

// Agent Hook Interfaces
export interface HookConfiguration {
  hook_name: string;
  trigger_events: string[];
  target_services: string[];
  execution_order: number;
  retry_policy: RetryPolicy;
  error_handling: ErrorHandlingStrategy;
  enabled: boolean;
}

export interface RetryPolicy {
  max_attempts: number;
  initial_delay_ms: number;
  backoff_multiplier: number;
  max_delay_ms: number;
}

export interface ErrorHandlingStrategy {
  strategy: 'fail_fast' | 'retry' | 'fallback' | 'ignore';
  fallback_action?: string;
  notification_required: boolean;
  escalation_threshold: number;
}

// Event Interfaces for Agent Hooks
export interface ProjectEvent {
  event_id: string;
  event_type: string;
  project_id: string;
  student_id: string;
  timestamp: Date;
  payload: Record<string, any>;
  source: string;
}

export interface HookExecutionResult {
  hook_name: string;
  execution_id: string;
  success: boolean;
  execution_time_ms: number;
  result_data?: Record<string, any>;
  error_message?: string;
  retry_count: number;
}

// Configuration Interfaces
export interface ScrollProjectsConfig {
  validation: {
    require_mentor_approval: boolean;
    min_milestones: number;
    max_project_duration_weeks: number;
    scroll_alignment_threshold: number;
  };
  rewards: {
    base_scrollcoin_per_project: number;
    milestone_completion_bonus: number;
    marketplace_listing_bonus: number;
    real_world_impact_multiplier: number;
  };
  integrations: {
    gpt_service_url: string;
    marketplace_api_url: string;
    xp_tracker_url: string;
    transcript_service_url: string;
  };
  governance: {
    drift_detection_enabled: boolean;
    integrity_seal_required: boolean;
    audit_trail_enabled: boolean;
    oath_enforcer_enabled: boolean;
  };
}

// Type Guards
export function isValidProjectStatus(status: string): status is ProjectStatus {
  return Object.values(ProjectStatus).includes(status as ProjectStatus);
}

export function isValidMilestoneStage(stage: string): stage is MilestoneStage {
  return Object.values(MilestoneStage).includes(stage as MilestoneStage);
}

export function isValidScrollField(field: string): field is ScrollField {
  return Object.values(ScrollField).includes(field as ScrollField);
}

// Utility Types
export type ProjectStatusTransition = {
  from: ProjectStatus;
  to: ProjectStatus;
  allowed: boolean;
  requires_approval: boolean;
  conditions?: string[];
};

export type MilestoneRequirement = {
  stage: MilestoneStage;
  required_deliverables: string[];
  minimum_criteria: number;
  estimated_duration_days: number;
};

export type ScrollAlignmentMetrics = {
  theological_alignment: number;
  practical_application: number;
  kingdom_impact_potential: number;
  innovation_factor: number;
  overall_score: number;
};