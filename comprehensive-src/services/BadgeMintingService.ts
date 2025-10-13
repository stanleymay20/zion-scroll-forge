/**
 * Badge Minting Service
 * Handles the minting of ScrollBadge NFTs tied to course achievements
 */

import { 
  ScrollBadge, 
  BadgeMintRequest, 
  AchievementData, 
  BadgeType,
  ScrollBadgeMetadata,
  BadgeAttribute,
  Skill,
  FormationMetrics
} from '../types/scrollbadge';
import { ScrollBadgeNFTService } from './ScrollBadgeNFTService';
import crypto from 'crypto';

export class BadgeMintingService {
  private nftService: ScrollBadgeNFTService;

  constructor(nftService: ScrollBadgeNFTService) {
    this.nftService = nftService;
  }

  /**
   * Process course completion and mint appropriate badge
   */
  async mintCourseCompletionBadge(request: BadgeMintRequest): Promise<ScrollBadge> {
    try {
      // Validate achievement data
      await this.validateAchievementData(request);

      // Generate badge metadata
      const metadata = await this.generateBadgeMetadata(request);

      // Create verification hash
      const verificationHash = this.createVerificationHash(request);

      // Mint NFT on blockchain
      const tokenId = await this.nftService.mintBadge(
        request.studentId,
        `https://scrolluniversity.org/metadata/${verificationHash}`,
        metadata
      );

      // Create ScrollBadge record
      const badge: ScrollBadge = {
        tokenId,
        courseId: request.courseId,
        studentId: request.studentId,
        badgeType: this.determineBadgeType(request.achievementData),
        competencies: request.achievementData.skillsAcquired,
        spiritualGrowth: request.achievementData.spiritualGrowth,
        timestamp: new Date(),
        verificationHash,
        blockchainTxHash: tokenId, // In real implementation, this would be the actual tx hash
        ipfsMetadataHash: verificationHash
      };

      console.log(`ScrollBadge minted successfully: ${tokenId} for student ${request.studentId}`);
      return badge;

    } catch (error) {
      console.error('Error minting course completion badge:', error);
      throw new Error(`Failed to mint badge: ${error.message}`);
    }
  }

  /**
   * Mint special achievement badges (spiritual milestones, prophetic achievements, etc.)
   */
  async mintSpecialAchievementBadge(
    studentId: string,
    badgeType: BadgeType,
    achievementDetails: any
  ): Promise<ScrollBadge> {
    try {
      const metadata = await this.generateSpecialBadgeMetadata(badgeType, achievementDetails);
      const verificationHash = this.createSpecialVerificationHash(studentId, badgeType, achievementDetails);

      const tokenId = await this.nftService.mintBadge(
        studentId,
        `https://scrolluniversity.org/metadata/${verificationHash}`,
        metadata
      );

      const badge: ScrollBadge = {
        tokenId,
        courseId: achievementDetails.courseId || '',
        studentId,
        badgeType,
        competencies: achievementDetails.skills || [],
        spiritualGrowth: achievementDetails.spiritualGrowth || this.getDefaultFormationMetrics(),
        timestamp: new Date(),
        verificationHash,
        blockchainTxHash: tokenId,
        ipfsMetadataHash: verificationHash
      };

      return badge;
    } catch (error) {
      console.error('Error minting special achievement badge:', error);
      throw new Error(`Failed to mint special badge: ${error.message}`);
    }
  }

  /**
   * Batch mint badges for multiple students
   */
  async batchMintBadges(requests: BadgeMintRequest[]): Promise<ScrollBadge[]> {
    const badges: ScrollBadge[] = [];
    const errors: string[] = [];

    for (const request of requests) {
      try {
        const badge = await this.mintCourseCompletionBadge(request);
        badges.push(badge);
      } catch (error) {
        errors.push(`Failed to mint badge for student ${request.studentId}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Batch minting completed with errors:', errors);
    }

    return badges;
  }

  // Private helper methods

  private async validateAchievementData(request: BadgeMintRequest): Promise<void> {
    const { achievementData, verificationProof } = request;

    // Validate completion requirements
    if (!achievementData.completionDate) {
      throw new Error('Course completion date is required');
    }

    if (achievementData.finalGrade < 70) {
      throw new Error('Minimum grade of 70% required for badge minting');
    }

    if (!achievementData.skillsAcquired || achievementData.skillsAcquired.length === 0) {
      throw new Error('At least one skill must be acquired for badge minting');
    }

    // Validate spiritual formation requirements
    const { spiritualGrowth } = achievementData;
    if (spiritualGrowth.kingdomAlignment < 60) {
      throw new Error('Minimum kingdom alignment of 60% required');
    }

    // Validate verification proof
    if (!verificationProof.courseCompletionHash || !verificationProof.facultySignature) {
      throw new Error('Valid verification proof required');
    }
  }

  private async generateBadgeMetadata(request: BadgeMintRequest): Promise<ScrollBadgeMetadata> {
    const { studentId, courseId, achievementData } = request;
    
    // This would fetch actual course and student data
    const courseName = `Course ${courseId}`; // Placeholder
    const studentName = `Student ${studentId}`; // Placeholder

    const attributes: BadgeAttribute[] = [
      {
        trait_type: 'Course ID',
        value: courseId
      },
      {
        trait_type: 'Completion Date',
        value: achievementData.completionDate.toISOString(),
        display_type: 'date'
      },
      {
        trait_type: 'Final Grade',
        value: achievementData.finalGrade,
        display_type: 'number'
      },
      {
        trait_type: 'Skills Acquired',
        value: achievementData.skillsAcquired.length,
        display_type: 'number'
      },
      {
        trait_type: 'Spiritual Growth',
        value: achievementData.spiritualGrowth.spiritualGrowth,
        display_type: 'boost_percentage'
      },
      {
        trait_type: 'Kingdom Alignment',
        value: achievementData.spiritualGrowth.kingdomAlignment,
        display_type: 'boost_percentage'
      },
      {
        trait_type: 'Prophetic Sensitivity',
        value: achievementData.spiritualGrowth.propheticSensitivity,
        display_type: 'boost_percentage'
      }
    ];

    // Add skill-specific attributes
    achievementData.skillsAcquired.forEach((skill, index) => {
      attributes.push({
        trait_type: `Skill ${index + 1}`,
        value: `${skill.name} (${skill.level})`
      });
    });

    return {
      name: `ScrollBadge: ${courseName} Completion`,
      description: `This badge certifies that ${studentName} has successfully completed ${courseName} at ScrollUniversity, demonstrating both academic excellence and spiritual growth aligned with kingdom principles.`,
      image: `https://scrolluniversity.org/badges/${courseId}/completion.png`,
      attributes,
      external_url: `https://scrolluniversity.org/courses/${courseId}`,
      animation_url: `https://scrolluniversity.org/badges/${courseId}/animation.mp4`
    };
  }

  private async generateSpecialBadgeMetadata(
    badgeType: BadgeType, 
    achievementDetails: any
  ): Promise<ScrollBadgeMetadata> {
    const badgeTypeNames = {
      [BadgeType.SKILL_MASTERY]: 'Skill Mastery',
      [BadgeType.SPIRITUAL_MILESTONE]: 'Spiritual Milestone',
      [BadgeType.PROPHETIC_ACHIEVEMENT]: 'Prophetic Achievement',
      [BadgeType.KINGDOM_IMPACT]: 'Kingdom Impact',
      [BadgeType.SCROLL_CERTIFICATION]: 'Scroll Certification',
      [BadgeType.COURSE_COMPLETION]: 'Course Completion'
    };

    return {
      name: `ScrollBadge: ${badgeTypeNames[badgeType]}`,
      description: `Special achievement badge recognizing exceptional ${badgeTypeNames[badgeType].toLowerCase()} at ScrollUniversity.`,
      image: `https://scrolluniversity.org/badges/special/${badgeType}.png`,
      attributes: [
        {
          trait_type: 'Badge Type',
          value: badgeType
        },
        {
          trait_type: 'Achievement Date',
          value: new Date().toISOString(),
          display_type: 'date'
        }
      ],
      external_url: 'https://scrolluniversity.org/achievements'
    };
  }

  private determineBadgeType(achievementData: AchievementData): BadgeType {
    // Determine badge type based on achievement data
    if (achievementData.spiritualGrowth.propheticSensitivity >= 90) {
      return BadgeType.PROPHETIC_ACHIEVEMENT;
    }
    
    if (achievementData.spiritualGrowth.kingdomAlignment >= 95) {
      return BadgeType.KINGDOM_IMPACT;
    }

    if (achievementData.skillsAcquired.some(skill => skill.level === 'master')) {
      return BadgeType.SKILL_MASTERY;
    }

    return BadgeType.COURSE_COMPLETION;
  }

  private createVerificationHash(request: BadgeMintRequest): string {
    const hashData = {
      studentId: request.studentId,
      courseId: request.courseId,
      completionDate: request.achievementData.completionDate,
      finalGrade: request.achievementData.finalGrade,
      verificationProof: request.verificationProof.courseCompletionHash
    };

    return crypto.createHash('sha256')
      .update(JSON.stringify(hashData))
      .digest('hex');
  }

  private createSpecialVerificationHash(
    studentId: string, 
    badgeType: BadgeType, 
    achievementDetails: any
  ): string {
    const hashData = {
      studentId,
      badgeType,
      timestamp: Date.now(),
      achievementDetails
    };

    return crypto.createHash('sha256')
      .update(JSON.stringify(hashData))
      .digest('hex');
  }

  private getDefaultFormationMetrics(): FormationMetrics {
    return {
      spiritualGrowth: 0,
      kingdomAlignment: 0,
      propheticSensitivity: 0,
      characterDevelopment: 0,
      callingClarity: 0
    };
  }
}

/**
 * Factory function to create BadgeMintingService
 */
export function createBadgeMintingService(nftService: ScrollBadgeNFTService): BadgeMintingService {
  return new BadgeMintingService(nftService);
}