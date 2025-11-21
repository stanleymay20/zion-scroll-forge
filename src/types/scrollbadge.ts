/**
 * ScrollBadge NFT Frontend Types
 * "By the Spirit of Excellence, we establish verifiable credentials"
 */

export interface ScrollBadge {
  id: string;
  tokenId: number;
  userId: string;
  courseId: string;
  courseName: string;
  studentName: string;
  completionDate: string;
  grade: number;
  credentialType: BadgeCredentialType;
  ipfsHash: string;
  metadataUri: string;
  blockchainTxHash?: string;
  blockNumber?: number;
  isRevoked: boolean;
  revokedReason?: string;
  revokedAt?: string;
  isPublic: boolean;
  ownerAddress: string;
  createdAt: string;
  updatedAt: string;
}

export enum BadgeCredentialType {
  COURSE_COMPLETION = 'COURSE_COMPLETION',
  SKILL_MASTERY = 'SKILL_MASTERY',
  DEGREE_COMPLETION = 'DEGREE_COMPLETION',
  CERTIFICATE = 'CERTIFICATE',
  SPECIALIZATION = 'SPECIALIZATION',
  ACHIEVEMENT = 'ACHIEVEMENT'
}

export interface BadgeMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: BadgeAttribute[];
  properties: BadgeProperties;
}

export interface BadgeAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface BadgeProperties {
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  completionDate: string;
  grade: number;
  credentialType: string;
  institution: string;
  issuer: string;
  issuedAt: string;
}

export interface BadgeVerificationResult {
  isValid: boolean;
  badge: ScrollBadge;
  blockchainData?: BlockchainBadgeData;
  verifiedAt: string;
  verifier?: string;
  discrepancies?: string[];
}

export interface BlockchainBadgeData {
  tokenId: number;
  owner: string;
  tokenURI: string;
  isRevoked: boolean;
  metadata: {
    courseId: string;
    courseName: string;
    studentId: string;
    studentName: string;
    completionDate: number;
    grade: number;
    credentialType: string;
    ipfsHash: string;
  };
}

export interface BadgeShareRequest {
  tokenId: number;
  platform: SharePlatform;
  message?: string;
}

export enum SharePlatform {
  LINKEDIN = 'LINKEDIN',
  TWITTER = 'TWITTER',
  FACEBOOK = 'FACEBOOK',
  EMAIL = 'EMAIL',
  CUSTOM = 'CUSTOM'
}

export interface BadgeShareResult {
  shareUrl: string;
  platform: SharePlatform;
  sharedAt: string;
}

export interface BadgeProfileData {
  userId: string;
  userName: string;
  badges: ScrollBadge[];
  totalBadges: number;
  publicBadges: number;
  achievements: BadgeAchievement[];
  profileUrl: string;
}

export interface BadgeAchievement {
  type: string;
  name: string;
  description: string;
  earnedAt: string;
  badgeCount: number;
}

export interface BadgeQueryOptions {
  userId?: string;
  courseId?: string;
  credentialType?: BadgeCredentialType;
  isRevoked?: boolean;
  isPublic?: boolean;
  minGrade?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'completionDate' | 'grade' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface BadgeQueryResult {
  badges: ScrollBadge[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BadgeStatistics {
  totalBadges: number;
  badgesByType: Record<BadgeCredentialType, number>;
  badgesByCourse: Record<string, number>;
  averageGrade: number;
  recentBadges: ScrollBadge[];
  topCourses: Array<{
    courseId: string;
    courseName: string;
    badgeCount: number;
  }>;
}

export interface BadgeFilter {
  credentialType?: BadgeCredentialType;
  courseId?: string;
  minGrade?: number;
  searchQuery?: string;
}

export interface BadgeAchievementProgress {
  achievementType: string;
  name: string;
  description: string;
  currentCount: number;
  targetCount: number;
  progress: number;
  isCompleted: boolean;
  reward?: string;
}
