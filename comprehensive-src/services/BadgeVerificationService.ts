/**
 * Badge Verification Service
 * Handles verification of ScrollBadge NFT authenticity and credential validation
 */

import { 
  ScrollBadge, 
  BadgeVerificationResult, 
  VerificationDetails,
  ScrollBadgeMetadata
} from '../types/scrollbadge';
import { ScrollBadgeNFTService } from './ScrollBadgeNFTService';
import crypto from 'crypto';

export interface VerificationRequest {
  tokenId?: string;
  verificationHash?: string;
  studentId?: string;
  courseId?: string;
}

export interface VerificationReport {
  verificationId: string;
  request: VerificationRequest;
  result: BadgeVerificationResult;
  timestamp: Date;
  verifiedBy: string;
}

export class BadgeVerificationService {
  private nftService: ScrollBadgeNFTService;
  private verificationCache: Map<string, VerificationReport> = new Map();

  constructor(nftService: ScrollBadgeNFTService) {
    this.nftService = nftService;
  }

  /**
   * Verify a ScrollBadge by token ID
   */
  async verifyBadgeByTokenId(tokenId: string): Promise<BadgeVerificationResult> {
    try {
      // Check cache first
      const cached = this.getCachedVerification(tokenId);
      if (cached && this.isCacheValid(cached)) {
        return cached.result;
      }

      // Perform comprehensive verification
      const result = await this.performComprehensiveVerification(tokenId);
      
      // Cache the result
      this.cacheVerificationResult(tokenId, { tokenId }, result);

      return result;
    } catch (error) {
      console.error('Error verifying badge by token ID:', error);
      return this.createFailedVerificationResult([error.message]);
    }
  }

  /**
   * Verify a badge by verification hash
   */
  async verifyBadgeByHash(verificationHash: string): Promise<BadgeVerificationResult> {
    try {
      // Look up token ID by verification hash
      const tokenId = await this.findTokenIdByHash(verificationHash);
      if (!tokenId) {
        return this.createFailedVerificationResult(['Badge not found for verification hash']);
      }

      return await this.verifyBadgeByTokenId(tokenId);
    } catch (error) {
      console.error('Error verifying badge by hash:', error);
      return this.createFailedVerificationResult([error.message]);
    }
  }

  /**
   * Verify all badges for a student
   */
  async verifyStudentBadges(studentId: string): Promise<BadgeVerificationResult[]> {
    try {
      const studentBadges = await this.getStudentBadges(studentId);
      const verificationResults: BadgeVerificationResult[] = [];

      for (const badge of studentBadges) {
        const result = await this.verifyBadgeByTokenId(badge.tokenId);
        verificationResults.push(result);
      }

      return verificationResults;
    } catch (error) {
      console.error('Error verifying student badges:', error);
      return [this.createFailedVerificationResult([error.message])];
    }
  }

  /**
   * Verify course completion badges
   */
  async verifyCourseBadges(courseId: string): Promise<BadgeVerificationResult[]> {
    try {
      const courseBadges = await this.getCourseBadges(courseId);
      const verificationResults: BadgeVerificationResult[] = [];

      for (const badge of courseBadges) {
        const result = await this.verifyBadgeByTokenId(badge.tokenId);
        verificationResults.push(result);
      }

      return verificationResults;
    } catch (error) {
      console.error('Error verifying course badges:', error);
      return [this.createFailedVerificationResult([error.message])];
    }
  }

  /**
   * Generate verification report
   */
  async generateVerificationReport(request: VerificationRequest): Promise<VerificationReport> {
    const verificationId = crypto.randomUUID();
    let result: BadgeVerificationResult;

    if (request.tokenId) {
      result = await this.verifyBadgeByTokenId(request.tokenId);
    } else if (request.verificationHash) {
      result = await this.verifyBadgeByHash(request.verificationHash);
    } else {
      result = this.createFailedVerificationResult(['Invalid verification request']);
    }

    const report: VerificationReport = {
      verificationId,
      request,
      result,
      timestamp: new Date(),
      verifiedBy: 'ScrollUniversity Verification System'
    };

    return report;
  }

  /**
   * Batch verify multiple badges
   */
  async batchVerifyBadges(tokenIds: string[]): Promise<Map<string, BadgeVerificationResult>> {
    const results = new Map<string, BadgeVerificationResult>();

    const verificationPromises = tokenIds.map(async (tokenId) => {
      try {
        const result = await this.verifyBadgeByTokenId(tokenId);
        results.set(tokenId, result);
      } catch (error) {
        results.set(tokenId, this.createFailedVerificationResult([error.message]));
      }
    });

    await Promise.all(verificationPromises);
    return results;
  }

  // Private helper methods

  private async performComprehensiveVerification(tokenId: string): Promise<BadgeVerificationResult> {
    try {
      // Step 1: Verify NFT exists on blockchain
      const nftResult = await this.nftService.verifyBadge(tokenId);
      if (!nftResult.isValid) {
        return nftResult;
      }

      // Step 2: Verify metadata integrity
      const metadata = await this.nftService.getBadgeMetadata(tokenId);
      const metadataValid = await this.verifyMetadataIntegrity(metadata);

      // Step 3: Verify course completion records
      const courseCompleted = await this.verifyCourseCompletion(tokenId);

      // Step 4: Verify skills and competencies
      const skillsValidated = await this.verifySkillsAndCompetencies(tokenId);

      // Step 5: Verify spiritual formation metrics
      const spiritualGrowthValid = await this.verifySpiritualFormation(tokenId);

      const isValid = nftResult.isValid && 
                     metadataValid && 
                     courseCompleted && 
                     skillsValidated && 
                     spiritualGrowthValid;

      return {
        isValid,
        verificationDetails: {
          ...nftResult.verificationDetails,
          courseCompleted,
          skillsValidated,
          lastVerifiedAt: new Date()
        }
      };

    } catch (error) {
      console.error('Error in comprehensive verification:', error);
      return this.createFailedVerificationResult([error.message]);
    }
  }

  private async verifyMetadataIntegrity(metadata: ScrollBadgeMetadata): Promise<boolean> {
    try {
      // Verify required fields are present
      if (!metadata.name || !metadata.description || !metadata.image) {
        return false;
      }

      // Verify attributes are valid
      if (!metadata.attributes || metadata.attributes.length === 0) {
        return false;
      }

      // Verify external URL is valid ScrollUniversity domain
      if (metadata.external_url && !metadata.external_url.includes('scrolluniversity.org')) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verifying metadata integrity:', error);
      return false;
    }
  }

  private async verifyCourseCompletion(tokenId: string): Promise<boolean> {
    try {
      // This would query the course completion database
      // For now, simulated as true
      return true;
    } catch (error) {
      console.error('Error verifying course completion:', error);
      return false;
    }
  }

  private async verifySkillsAndCompetencies(tokenId: string): Promise<boolean> {
    try {
      // This would verify against skill assessment records
      // For now, simulated as true
      return true;
    } catch (error) {
      console.error('Error verifying skills and competencies:', error);
      return false;
    }
  }

  private async verifySpiritualFormation(tokenId: string): Promise<boolean> {
    try {
      // This would verify spiritual formation metrics
      // For now, simulated as true
      return true;
    } catch (error) {
      console.error('Error verifying spiritual formation:', error);
      return false;
    }
  }

  private async findTokenIdByHash(verificationHash: string): Promise<string | null> {
    // This would query the database for token ID by verification hash
    // For now, simulated
    return crypto.randomUUID();
  }

  private async getStudentBadges(studentId: string): Promise<ScrollBadge[]> {
    // This would query the database for student's badges
    // For now, return empty array
    return [];
  }

  private async getCourseBadges(courseId: string): Promise<ScrollBadge[]> {
    // This would query the database for course badges
    // For now, return empty array
    return [];
  }

  private getCachedVerification(key: string): VerificationReport | undefined {
    return this.verificationCache.get(key);
  }

  private isCacheValid(report: VerificationReport): boolean {
    const cacheValidityPeriod = 5 * 60 * 1000; // 5 minutes
    return Date.now() - report.timestamp.getTime() < cacheValidityPeriod;
  }

  private cacheVerificationResult(
    key: string, 
    request: VerificationRequest, 
    result: BadgeVerificationResult
  ): void {
    const report: VerificationReport = {
      verificationId: crypto.randomUUID(),
      request,
      result,
      timestamp: new Date(),
      verifiedBy: 'ScrollUniversity Verification System'
    };

    this.verificationCache.set(key, report);
  }

  private createFailedVerificationResult(errors: string[]): BadgeVerificationResult {
    return {
      isValid: false,
      verificationDetails: {
        badgeExists: false,
        ownershipVerified: false,
        courseCompleted: false,
        skillsValidated: false,
        blockchainConfirmed: false,
        lastVerifiedAt: new Date()
      },
      errors
    };
  }
}

/**
 * Factory function to create BadgeVerificationService
 */
export function createBadgeVerificationService(nftService: ScrollBadgeNFTService): BadgeVerificationService {
  return new BadgeVerificationService(nftService);
}