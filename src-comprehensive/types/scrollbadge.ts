/**
 * ScrollBadge NFT Certification System Types
 * Implements blockchain-based course completion badges with verification
 */

export interface ScrollBadge {
  tokenId: string;
  courseId: string;
  studentId: string;
  badgeType: BadgeType;
  competencies: Skill[];
  spiritualGrowth: FormationMetrics;
  timestamp: Date;
  verificationHash: string;
  blockchainTxHash?: string;
  ipfsMetadataHash?: string;
}

export interface ScrollBadgeMetadata {
  name: string;
  description: string;
  image: string;
  attributes: BadgeAttribute[];
  external_url: string;
  animation_url?: string;
}

export interface BadgeAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'boost_number' | 'boost_percentage' | 'number' | 'date';
}

export enum BadgeType {
  COURSE_COMPLETION = 'course_completion',
  SKILL_MASTERY = 'skill_mastery',
  SPIRITUAL_MILESTONE = 'spiritual_milestone',
  PROPHETIC_ACHIEVEMENT = 'prophetic_achievement',
  KINGDOM_IMPACT = 'kingdom_impact',
  SCROLL_CERTIFICATION = 'scroll_certification'
}

export interface Skill {
  skillId: string;
  name: string;
  level: SkillLevel;
  verifiedAt: Date;
  verifiedBy: string; // AI Dean or Human Faculty ID
}

export enum SkillLevel {
  NOVICE = 'novice',
  APPRENTICE = 'apprentice',
  PRACTITIONER = 'practitioner',
  EXPERT = 'expert',
  MASTER = 'master'
}

export interface FormationMetrics {
  spiritualGrowth: number; // 0-100
  kingdomAlignment: number; // 0-100
  propheticSensitivity: number; // 0-100
  characterDevelopment: number; // 0-100
  callingClarity: number; // 0-100
}

export interface BadgeMintRequest {
  studentId: string;
  courseId: string;
  achievementData: AchievementData;
  verificationProof: VerificationProof;
}

export interface AchievementData {
  completionDate: Date;
  finalGrade: number;
  skillsAcquired: Skill[];
  spiritualGrowth: FormationMetrics;
  projectsCompleted: string[];
  assessmentScores: AssessmentScore[];
}

export interface AssessmentScore {
  assessmentId: string;
  score: number;
  maxScore: number;
  completedAt: Date;
}

export interface VerificationProof {
  courseCompletionHash: string;
  facultySignature: string;
  aiDeanVerification: string;
  blockchainProof?: string;
}

export interface BadgeVerificationResult {
  isValid: boolean;
  verificationDetails: VerificationDetails;
  errors?: string[];
}

export interface VerificationDetails {
  badgeExists: boolean;
  ownershipVerified: boolean;
  courseCompleted: boolean;
  skillsValidated: boolean;
  blockchainConfirmed: boolean;
  lastVerifiedAt: Date;
}

export interface PublicBadgeDisplay {
  badgeId: string;
  studentName: string;
  courseName: string;
  issueDate: Date;
  skills: string[];
  verificationUrl: string;
  shareableLink: string;
  qrCode: string;
}

export interface BadgeCollection {
  studentId: string;
  badges: ScrollBadge[];
  totalBadges: number;
  skillsAcquired: Skill[];
  spiritualProgress: FormationMetrics;
  publicProfile: PublicBadgeDisplay[];
}

// Smart Contract Interfaces
export interface ScrollBadgeContract {
  mintBadge(to: string, tokenURI: string, metadata: ScrollBadgeMetadata): Promise<string>;
  verifyBadge(tokenId: string): Promise<BadgeVerificationResult>;
  getBadgeMetadata(tokenId: string): Promise<ScrollBadgeMetadata>;
  transferBadge(from: string, to: string, tokenId: string): Promise<boolean>;
  burnBadge(tokenId: string): Promise<boolean>;
}

export interface BlockchainConfig {
  networkName: string;
  rpcUrl: string;
  contractAddress: string;
  privateKey: string;
  gasLimit: number;
  gasPrice: string;
}