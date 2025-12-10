/**
 * ScrollGold Token Economy Types
 * Divine academic currency system for ScrollUniversity
 */

export interface ScrollGoldWallet {
  id: string;
  userId: string;
  balance: number;
  lockedBalance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  blockchainAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScrollGoldTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  balance: number;
  category: TransactionCategory;
  source: string;
  description: string;
  metadata?: Record<string, any>;
  blockchainTxHash?: string;
  status: TransactionStatus;
  createdAt: Date;
}

export enum TransactionType {
  EARN = 'EARN',
  SPEND = 'SPEND',
  TRANSFER = 'TRANSFER',
  REWARD = 'REWARD',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum TransactionCategory {
  // Student Earning
  COURSE_COMPLETION = 'COURSE_COMPLETION',
  ASSIGNMENT_SUBMISSION = 'ASSIGNMENT_SUBMISSION',
  QUIZ_EXCELLENCE = 'QUIZ_EXCELLENCE',
  DISCUSSION_PARTICIPATION = 'DISCUSSION_PARTICIPATION',
  PEER_TUTORING = 'PEER_TUTORING',
  RESEARCH_PUBLICATION = 'RESEARCH_PUBLICATION',
  SPIRITUAL_FORMATION = 'SPIRITUAL_FORMATION',
  COMMUNITY_SERVICE = 'COMMUNITY_SERVICE',
  REFERRAL_BONUS = 'REFERRAL_BONUS',
  
  // Faculty Earning
  TEACHING_LOAD = 'TEACHING_LOAD',
  CONTENT_CREATION = 'CONTENT_CREATION',
  STUDENT_MENTORING = 'STUDENT_MENTORING',
  CURRICULUM_DEVELOPMENT = 'CURRICULUM_DEVELOPMENT',
  
  // Spending
  TUITION_PAYMENT = 'TUITION_PAYMENT',
  COURSE_ENROLLMENT = 'COURSE_ENROLLMENT',
  RESOURCE_PURCHASE = 'RESOURCE_PURCHASE',
  CERTIFICATION_FEE = 'CERTIFICATION_FEE',
  MARKETPLACE_PURCHASE = 'MARKETPLACE_PURCHASE',
  
  // System
  SCHOLARSHIP_AWARD = 'SCHOLARSHIP_AWARD',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
  SYSTEM_REWARD = 'SYSTEM_REWARD'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED'
}

export interface ScrollGoldReward {
  id: string;
  name: string;
  description: string;
  category: TransactionCategory;
  baseAmount: number;
  multiplier: number;
  conditions: RewardCondition[];
  active: boolean;
}

export interface RewardCondition {
  type: 'grade' | 'time' | 'streak' | 'quality' | 'spiritual';
  operator: 'gte' | 'lte' | 'eq' | 'between';
  value: number | string;
  multiplier?: number;
}

export interface ScrollGoldExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: Date;
  expiryDate?: Date;
}

export interface ScrollGoldTokenomics {
  totalSupply: number;
  circulatingSupply: number;
  burnedTokens: number;
  reservePool: number;
  scholarshipPool: number;
  rewardPool: number;
  lastUpdated: Date;
}

export interface StudentRewardEconomy {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalCoursesCompleted: number;
  averageGrade: number;
  spiritualGrowthScore: number;
  communityContribution: number;
  rewardMultiplier: number;
}

export interface FacultyRewardSystem {
  facultyId: string;
  coursesTeaching: number;
  studentsImpacted: number;
  contentCreated: number;
  averageStudentRating: number;
  mentoringHours: number;
  rewardMultiplier: number;
}

export interface ScrollGoldMarketplace {
  id: string;
  itemType: 'course' | 'resource' | 'certification' | 'service';
  itemId: string;
  priceScrollGold: number;
  priceUSD?: number;
  discountPercentage?: number;
  available: boolean;
}

export interface PartnershipEconomy {
  partnerId: string;
  partnerName: string;
  partnerType: 'university' | 'ministry' | 'corporation' | 'ngo';
  scrollGoldBalance: number;
  exchangeRate: number;
  benefits: string[];
  active: boolean;
}

export interface BlockchainIntegration {
  contractAddress: string;
  network: 'ethereum' | 'polygon' | 'binance' | 'custom';
  tokenSymbol: string;
  decimals: number;
  verified: boolean;
}

export interface TransactionFeeStructure {
  transactionType: TransactionType;
  feePercentage: number;
  minimumFee: number;
  maximumFee?: number;
  waiveConditions?: string[];
}

export interface WalletDesign {
  features: string[];
  security: SecurityFeature[];
  integrations: string[];
}

export interface SecurityFeature {
  name: string;
  enabled: boolean;
  description: string;
}
