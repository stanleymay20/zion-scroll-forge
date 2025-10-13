import { z } from 'zod';

// ScrollCoin Integration Types
export interface ScrollCoinWallet {
  wallet_id: string;
  user_id: string;
  address: string;
  balance: number;
  locked_balance: number;
  available_balance: number;
  created_at: string;
  last_updated: string;
}

export interface Transaction {
  transaction_id: string;
  from_wallet: string;
  to_wallet: string;
  amount: number;
  transaction_type: TransactionType;
  status: TransactionStatus;
  description: string;
  metadata: TransactionMetadata;
  created_at: string;
  confirmed_at?: string;
  block_hash?: string;
}

export type TransactionType = 
  | 'tuition_payment'
  | 'course_enrollment'
  | 'reward_earned'
  | 'scholarship_disbursement'
  | 'workstudy_payment'
  | 'mission_reward'
  | 'peer_transfer'
  | 'refund'
  | 'fee_payment';

export type TransactionStatus = 
  | 'pending'
  | 'confirmed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface TransactionMetadata {
  course_id?: string;
  assignment_id?: string;
  mission_id?: string;
  scholarship_id?: string;
  workstudy_id?: string;
  reference_number?: string;
  exchange_rate?: number;
  gas_fee?: number;
}

// Scholarship and Financial Aid Types
export interface Scholarship {
  scholarship_id: string;
  name: string;
  description: string;
  amount: number;
  currency: 'ScrollCoin' | 'USD' | 'EUR';
  eligibility_criteria: EligibilityCriteria;
  application_deadline: string;
  award_date: string;
  renewable: boolean;
  renewal_criteria?: string[];
  sponsor: ScholarshipSponsor;
  status: ScholarshipStatus;
  created_at: string;
}

export type ScholarshipStatus = 'active' | 'closed' | 'suspended' | 'draft';

export interface EligibilityCriteria {
  min_age?: number;
  max_age?: number;
  countries: string[];
  languages: string[];
  academic_requirements: AcademicRequirement[];
  spiritual_requirements: SpiritualRequirement[];
  financial_need: boolean;
  ministry_experience_years?: number;
}

export interface AcademicRequirement {
  type: 'gpa' | 'degree' | 'certification' | 'test_score';
  value: string | number;
  description: string;
}

export interface SpiritualRequirement {
  type: 'testimony' | 'baptism' | 'ministry_experience' | 'recommendation';
  description: string;
  required: boolean;
}

export interface ScholarshipSponsor {
  sponsor_id: string;
  name: string;
  type: 'individual' | 'organization' | 'church' | 'foundation';
  contact_info: ContactInfo;
  logo_url?: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  website?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface ScholarshipApplication {
  application_id: string;
  scholarship_id: string;
  applicant_id: string;
  submitted_at: string;
  status: ApplicationStatus;
  documents: ApplicationDocument[];
  responses: ApplicationResponse[];
  review_notes?: ReviewNote[];
  decision_date?: string;
  award_amount?: number;
}

export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'waitlisted'
  | 'awarded';

export interface ApplicationDocument {
  document_id: string;
  type: DocumentType;
  name: string;
  url: string;
  uploaded_at: string;
  verified: boolean;
}

export type DocumentType = 
  | 'transcript'
  | 'recommendation_letter'
  | 'essay'
  | 'financial_statement'
  | 'testimony'
  | 'ministry_certificate'
  | 'identification';

export interface ApplicationResponse {
  question_id: string;
  question: string;
  response: string;
  word_count?: number;
}

export interface ReviewNote {
  reviewer_id: string;
  note: string;
  rating?: number;
  created_at: string;
}

export interface Application {
  application_id: string;
  scholarship_id: string;
  applicant: ScrollUser;
  status: ApplicationStatus;
  submitted_at: string;
  documents: ApplicationDocument[];
  review_progress: ReviewProgress;
}

export interface ReviewProgress {
  total_reviewers: number;
  completed_reviews: number;
  average_score?: number;
  recommendation: 'approve' | 'reject' | 'waitlist' | 'pending';
}

// Workstudy and Mission Types
export interface WorkstudyProgram {
  program_id: string;
  name: string;
  description: string;
  type: WorkstudyType;
  hourly_rate_scrollcoin: number;
  max_hours_per_week: number;
  duration_weeks: number;
  requirements: WorkstudyRequirement[];
  responsibilities: string[];
  supervisor_id: string;
  available_positions: number;
  filled_positions: number;
  status: 'active' | 'closed' | 'suspended';
}

export type WorkstudyType = 
  | 'prophetic_research'
  | 'content_creation'
  | 'tutoring_assistance'
  | 'administrative_support'
  | 'technical_support'
  | 'community_outreach'
  | 'prayer_ministry';

export interface WorkstudyRequirement {
  type: 'skill' | 'experience' | 'availability' | 'spiritual_maturity';
  description: string;
  required: boolean;
}

export interface WorkstudyApplication {
  application_id: string;
  program_id: string;
  applicant_id: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  start_date?: string;
  end_date?: string;
  hours_worked: number;
  earnings_scrollcoin: number;
}

export interface ScrollCoinMission {
  mission_id: string;
  title: string;
  description: string;
  type: MissionType;
  difficulty: MissionDifficulty;
  reward_scrollcoin: number;
  bonus_xp: number;
  requirements: MissionRequirement[];
  steps: MissionStep[];
  deadline?: string;
  completion_criteria: CompletionCriteria;
  status: 'active' | 'completed' | 'expired' | 'suspended';
}

export type MissionType = 
  | 'evangelism'
  | 'community_service'
  | 'content_creation'
  | 'peer_mentoring'
  | 'prayer_intercession'
  | 'scripture_memorization'
  | 'skill_development'
  | 'global_outreach';

export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface MissionRequirement {
  type: 'course_completion' | 'skill_level' | 'spiritual_maturity' | 'time_commitment';
  description: string;
  value?: string | number;
}

export interface MissionStep {
  step_number: number;
  title: string;
  description: string;
  verification_method: VerificationMethod;
  reward_percentage: number; // percentage of total mission reward
}

export type VerificationMethod = 
  | 'self_report'
  | 'peer_verification'
  | 'mentor_approval'
  | 'automated_check'
  | 'photo_evidence'
  | 'video_testimony';

export interface CompletionCriteria {
  all_steps_required: boolean;
  minimum_steps: number;
  time_limit_hours?: number;
  quality_threshold?: number;
}

export interface MissionProgress {
  mission_id: string;
  user_id: string;
  started_at: string;
  completed_steps: CompletedStep[];
  current_step: number;
  completion_percentage: number;
  estimated_completion: string;
}

export interface CompletedStep {
  step_number: number;
  completed_at: string;
  verification_data: VerificationData;
  approved: boolean;
  reviewer_id?: string;
}

export interface VerificationData {
  method: VerificationMethod;
  evidence_url?: string;
  description: string;
  metadata: Record<string, any>;
}

// Payment and Billing Types
export interface PaymentMethod {
  method_id: string;
  user_id: string;
  type: PaymentMethodType;
  details: PaymentMethodDetails;
  is_default: boolean;
  verified: boolean;
  created_at: string;
}

export type PaymentMethodType = 
  | 'scrollcoin_wallet'
  | 'credit_card'
  | 'bank_transfer'
  | 'paypal'
  | 'cryptocurrency'
  | 'mobile_money';

export interface PaymentMethodDetails {
  // For ScrollCoin
  wallet_address?: string;
  
  // For Credit Card
  card_last_four?: string;
  card_brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  
  // For Bank Transfer
  bank_name?: string;
  account_last_four?: string;
  routing_number?: string;
  
  // For Cryptocurrency
  crypto_type?: string;
  crypto_address?: string;
  
  // For Mobile Money
  provider?: string;
  phone_number?: string;
}

export interface PaymentIntent {
  intent_id: string;
  user_id: string;
  amount: number;
  currency: string;
  description: string;
  payment_method_id: string;
  status: PaymentIntentStatus;
  created_at: string;
  confirmed_at?: string;
  metadata: Record<string, any>;
}

export type PaymentIntentStatus = 
  | 'created'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded';

// Validation Schemas
export const ScrollCoinWalletSchema = z.object({
  wallet_id: z.string().uuid(),
  user_id: z.string().uuid(),
  address: z.string(),
  balance: z.number().nonnegative(),
  locked_balance: z.number().nonnegative(),
  available_balance: z.number().nonnegative(),
  created_at: z.string().datetime(),
  last_updated: z.string().datetime()
});

export const TransactionSchema = z.object({
  transaction_id: z.string().uuid(),
  from_wallet: z.string(),
  to_wallet: z.string(),
  amount: z.number().positive(),
  transaction_type: z.enum(['tuition_payment', 'course_enrollment', 'reward_earned', 'scholarship_disbursement', 'workstudy_payment', 'mission_reward', 'peer_transfer', 'refund', 'fee_payment']),
  status: z.enum(['pending', 'confirmed', 'failed', 'cancelled', 'refunded']),
  description: z.string(),
  created_at: z.string().datetime(),
  confirmed_at: z.string().datetime().optional()
});

export const ScholarshipSchema = z.object({
  scholarship_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  amount: z.number().positive(),
  currency: z.enum(['ScrollCoin', 'USD', 'EUR']),
  application_deadline: z.string().datetime(),
  award_date: z.string().datetime(),
  renewable: z.boolean(),
  status: z.enum(['active', 'closed', 'suspended', 'draft']),
  created_at: z.string().datetime()
});

export const ScrollCoinMissionSchema = z.object({
  mission_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  type: z.enum(['evangelism', 'community_service', 'content_creation', 'peer_mentoring', 'prayer_intercession', 'scripture_memorization', 'skill_development', 'global_outreach']),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  reward_scrollcoin: z.number().positive(),
  bonus_xp: z.number().nonnegative(),
  deadline: z.string().datetime().optional(),
  status: z.enum(['active', 'completed', 'expired', 'suspended'])
});