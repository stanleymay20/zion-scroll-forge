/**
 * ScrollBadge System
 * Main orchestrator for the ScrollBadge NFT Certification System
 */

import { 
  ScrollBadge, 
  BadgeMintRequest, 
  BadgeType,
  BadgeVerificationResult,
  PublicBadgeDisplay,
  BadgeCollection,
  ShareableProfile
} from '../types/scrollbadge';

import { ScrollBadgeNFTService, createScrollBadgeNFTService } from './ScrollBadgeNFTService';
import { BadgeMintingService, createBadgeMintingService } from './BadgeMintingService';
import { BadgeVerificationService, createBadgeVerificationService } from './BadgeVerificationService';
import { PublicBadgeDisplayService, createPublicBadgeDisplayService } from './PublicBadgeDisplayService';

export interface ScrollBadgeSystemConfig {
  enableBlockchain: boolean;
  enableIPFS: boolean;
  enablePublicDisplay: boolean;
  verificationCacheTTL: number;
}

export class ScrollBadgeSystem {
  private nftService: ScrollBadgeNFTService;
  private mintingService: BadgeMintingService;
  private verificationService: BadgeVerificationService;
  private displayService: PublicBadgeDisplayService;
  private config: ScrollBadgeSystemConfig;

  constructor(config: ScrollBadgeSystemConfig) {
    this.config = config;
    this.initializeServices();
  }

  // Badge Minting Operations

  /**
   * Mint a course completion badge
   */
  async mintCourseCompletionBadge(request: BadgeMintRequest): Promise<ScrollBadge> {
    try {
      console.log(`Minting course completion badge for student ${request.studentId}, course ${request.courseId}`);
      
      const badge = await this.mintingService.mintCourseCompletionBadge(request);
      
      // Store badge record in database
      await this.storeBadgeRecord(badge);
      
      console.log(`Successfully minted badge ${badge.tokenId}`);
      return badge;
    } catch (error) {
      console.error('Error in mintCourseCompletionBadge:', error);
      throw error;
    }
  }

  /**
   * Mint special achievement badge
   */
  async mintSpecialAchievementBadge(
    studentId: string,
    badgeType: BadgeType,
    achievementDetails: any
  ): Promise<ScrollBadge> {
    try {
      console.log(`Minting special achievement badge: ${badgeType} for student ${studentId}`);
      
      const badge = await this.mintingService.mintSpecialAchievementBadge(
        studentId,
        badgeType,
        achievementDetails
      );
      
      await this.storeBadgeRecord(badge);
      
      console.log(`Successfully minted special badge ${badge.tokenId}`);
      return badge;
    } catch (error) {
      console.error('Error in mintSpecialAchievementBadge:', error);
      throw error;
    }
  }

  /**
   * Batch mint badges for multiple students
   */
  async batchMintBadges(requests: BadgeMintRequest[]): Promise<ScrollBadge[]> {
    try {
      console.log(`Batch minting ${requests.length} badges`);
      
      const badges = await this.mintingService.batchMintBadges(requests);
      
      // Store all badge records
      for (const badge of badges) {
        await this.storeBadgeRecord(badge);
      }
      
      console.log(`Successfully batch minted ${badges.length} badges`);
      return badges;
    } catch (error) {
      console.error('Error in batchMintBadges:', error);
      throw error;
    }
  }

  // Badge Verification Operations

  /**
   * Verify a badge by token ID
   */
  async verifyBadge(tokenId: string): Promise<BadgeVerificationResult> {
    try {
      return await this.verificationService.verifyBadgeByTokenId(tokenId);
    } catch (error) {
      console.error('Error in verifyBadge:', error);
      throw error;
    }
  }

  /**
   * Verify a badge by verification hash
   */
  async verifyBadgeByHash(verificationHash: string): Promise<BadgeVerificationResult> {
    try {
      return await this.verificationService.verifyBadgeByHash(verificationHash);
    } catch (error) {
      console.error('Error in verifyBadgeByHash:', error);
      throw error;
    }
  }

  /**
   * Verify all badges for a student
   */
  async verifyStudentBadges(studentId: string): Promise<BadgeVerificationResult[]> {
    try {
      return await this.verificationService.verifyStudentBadges(studentId);
    } catch (error) {
      console.error('Error in verifyStudentBadges:', error);
      throw error;
    }
  }

  // Public Display Operations

  /**
   * Create public display for a badge
   */
  async createPublicBadgeDisplay(badge: ScrollBadge): Promise<PublicBadgeDisplay> {
    try {
      if (!this.config.enablePublicDisplay) {
        throw new Error('Public display is disabled');
      }
      
      return await this.displayService.createPublicBadgeDisplay(badge);
    } catch (error) {
      console.error('Error in createPublicBadgeDisplay:', error);
      throw error;
    }
  }

  /**
   * Get badge collection for a student
   */
  async getStudentBadgeCollection(studentId: string): Promise<BadgeCollection> {
    try {
      return await this.displayService.createBadgeCollection(studentId);
    } catch (error) {
      console.error('Error in getStudentBadgeCollection:', error);
      throw error;
    }
  }

  /**
   * Create shareable profile for a student
   */
  async createShareableProfile(studentId: string, isPublic: boolean = true): Promise<ShareableProfile> {
    try {
      if (!this.config.enablePublicDisplay) {
        throw new Error('Public display is disabled');
      }
      
      return await this.displayService.createShareableProfile(studentId, isPublic);
    } catch (error) {
      console.error('Error in createShareableProfile:', error);
      throw error;
    }
  }

  /**
   * Generate embeddable widget for a badge
   */
  async generateEmbeddableWidget(badgeId: string): Promise<string> {
    try {
      if (!this.config.enablePublicDisplay) {
        throw new Error('Public display is disabled');
      }
      
      return await this.displayService.createEmbeddableWidget(badgeId);
    } catch (error) {
      console.error('Error in generateEmbeddableWidget:', error);
      throw error;
    }
  }

  // System Management Operations

  /**
   * Get system status and statistics
   */
  async getSystemStatus(): Promise<any> {
    try {
      return {
        blockchain: {
          enabled: this.config.enableBlockchain,
          status: 'connected' // Would check actual blockchain connection
        },
        ipfs: {
          enabled: this.config.enableIPFS,
          status: 'connected' // Would check actual IPFS connection
        },
        publicDisplay: {
          enabled: this.config.enablePublicDisplay
        },
        statistics: {
          totalBadgesMinted: await this.getTotalBadgesMinted(),
          totalVerifications: await this.getTotalVerifications(),
          activeStudents: await this.getActiveStudentsCount()
        }
      };
    } catch (error) {
      console.error('Error in getSystemStatus:', error);
      throw error;
    }
  }

  /**
   * Revoke a badge (for misconduct or other reasons)
   */
  async revokeBadge(tokenId: string, reason: string): Promise<boolean> {
    try {
      console.log(`Revoking badge ${tokenId}. Reason: ${reason}`);
      
      // Burn the NFT on blockchain
      const burned = await this.nftService.burnBadge(tokenId);
      
      if (burned) {
        // Update database record
        await this.markBadgeAsRevoked(tokenId, reason);
        console.log(`Successfully revoked badge ${tokenId}`);
      }
      
      return burned;
    } catch (error) {
      console.error('Error in revokeBadge:', error);
      throw error;
    }
  }

  // Private helper methods

  private initializeServices(): void {
    this.nftService = createScrollBadgeNFTService();
    this.mintingService = createBadgeMintingService(this.nftService);
    this.verificationService = createBadgeVerificationService(this.nftService);
    this.displayService = createPublicBadgeDisplayService(this.nftService, this.verificationService);
  }

  private async storeBadgeRecord(badge: ScrollBadge): Promise<void> {
    // This would store the badge record in the database
    console.log(`Storing badge record: ${badge.tokenId}`);
    // Implementation would use Prisma or other ORM
  }

  private async markBadgeAsRevoked(tokenId: string, reason: string): Promise<void> {
    // This would update the badge record in the database
    console.log(`Marking badge ${tokenId} as revoked: ${reason}`);
    // Implementation would use Prisma or other ORM
  }

  private async getTotalBadgesMinted(): Promise<number> {
    // This would query the database for total badges minted
    return 0; // Placeholder
  }

  private async getTotalVerifications(): Promise<number> {
    // This would query verification logs
    return 0; // Placeholder
  }

  private async getActiveStudentsCount(): Promise<number> {
    // This would query the database for active students with badges
    return 0; // Placeholder
  }
}

/**
 * Factory function to create ScrollBadgeSystem with default configuration
 */
export function createScrollBadgeSystem(config?: Partial<ScrollBadgeSystemConfig>): ScrollBadgeSystem {
  const defaultConfig: ScrollBadgeSystemConfig = {
    enableBlockchain: true,
    enableIPFS: true,
    enablePublicDisplay: true,
    verificationCacheTTL: 300000 // 5 minutes
  };

  const finalConfig = { ...defaultConfig, ...config };
  return new ScrollBadgeSystem(finalConfig);
}

// Export the main system instance
export const scrollBadgeSystem = createScrollBadgeSystem();