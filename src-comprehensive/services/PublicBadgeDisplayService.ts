/**
 * Public Badge Display Service
 * Handles public display and sharing functionality for ScrollBadge NFTs
 */

import { 
  ScrollBadge, 
  PublicBadgeDisplay, 
  BadgeCollection,
  ScrollBadgeMetadata
} from '../types/scrollbadge';
import { ScrollBadgeNFTService } from './ScrollBadgeNFTService';
import { BadgeVerificationService } from './BadgeVerificationService';
import crypto from 'crypto';

export interface ShareableProfile {
  profileId: string;
  studentName: string;
  profileImage?: string;
  badges: PublicBadgeDisplay[];
  achievements: AchievementSummary;
  shareUrl: string;
  qrCode: string;
  isPublic: boolean;
}

export interface AchievementSummary {
  totalBadges: number;
  coursesCompleted: number;
  skillsMastered: string[];
  spiritualMilestones: number;
  propheticAchievements: number;
  kingdomImpactScore: number;
}

export interface BadgeShareOptions {
  includeSkills: boolean;
  includeSpiritualMetrics: boolean;
  includeVerificationLink: boolean;
  customMessage?: string;
}

export class PublicBadgeDisplayService {
  private nftService: ScrollBadgeNFTService;
  private verificationService: BadgeVerificationService;

  constructor(nftService: ScrollBadgeNFTService, verificationService: BadgeVerificationService) {
    this.nftService = nftService;
    this.verificationService = verificationService;
  }

  /**
   * Create public display for a single badge
   */
  async createPublicBadgeDisplay(badge: ScrollBadge): Promise<PublicBadgeDisplay> {
    try {
      const metadata = await this.nftService.getBadgeMetadata(badge.tokenId);
      const studentName = await this.getStudentName(badge.studentId);
      const courseName = await this.getCourseName(badge.courseId);

      const display: PublicBadgeDisplay = {
        badgeId: badge.tokenId,
        studentName,
        courseName,
        issueDate: badge.timestamp,
        skills: badge.competencies.map(skill => skill.name),
        verificationUrl: `https://scrolluniversity.org/verify/${badge.tokenId}`,
        shareableLink: `https://scrolluniversity.org/badges/${badge.tokenId}`,
        qrCode: await this.generateQRCode(badge.tokenId)
      };

      return display;
    } catch (error) {
      console.error('Error creating public badge display:', error);
      throw new Error(`Failed to create public display: ${error.message}`);
    }
  }

  /**
   * Create a complete badge collection for a student
   */
  async createBadgeCollection(studentId: string): Promise<BadgeCollection> {
    try {
      const badges = await this.getStudentBadges(studentId);
      const publicDisplays: PublicBadgeDisplay[] = [];

      for (const badge of badges) {
        const display = await this.createPublicBadgeDisplay(badge);
        publicDisplays.push(display);
      }

      const collection: BadgeCollection = {
        studentId,
        badges,
        totalBadges: badges.length,
        skillsAcquired: this.aggregateSkills(badges),
        spiritualProgress: this.aggregateSpiritualProgress(badges),
        publicProfile: publicDisplays
      };

      return collection;
    } catch (error) {
      console.error('Error creating badge collection:', error);
      throw new Error(`Failed to create badge collection: ${error.message}`);
    }
  }

  /**
   * Create shareable profile for a student
   */
  async createShareableProfile(
    studentId: string, 
    isPublic: boolean = true
  ): Promise<ShareableProfile> {
    try {
      const collection = await this.createBadgeCollection(studentId);
      const studentName = await this.getStudentName(studentId);
      const achievements = this.createAchievementSummary(collection);

      const profileId = crypto.randomUUID();
      const shareUrl = `https://scrolluniversity.org/profile/${profileId}`;

      const profile: ShareableProfile = {
        profileId,
        studentName,
        badges: collection.publicProfile,
        achievements,
        shareUrl,
        qrCode: await this.generateQRCode(shareUrl),
        isPublic
      };

      // Store profile for public access
      if (isPublic) {
        await this.storePublicProfile(profile);
      }

      return profile;
    } catch (error) {
      console.error('Error creating shareable profile:', error);
      throw new Error(`Failed to create shareable profile: ${error.message}`);
    }
  }

  /**
   * Generate shareable badge link with custom options
   */
  async generateShareableLink(
    badgeId: string, 
    options: BadgeShareOptions
  ): Promise<string> {
    try {
      const badge = await this.getBadgeById(badgeId);
      if (!badge) {
        throw new Error('Badge not found');
      }

      const baseUrl = 'https://scrolluniversity.org/share';
      const params = new URLSearchParams({
        badge: badgeId,
        skills: options.includeSkills.toString(),
        spiritual: options.includeSpiritualMetrics.toString(),
        verify: options.includeVerificationLink.toString()
      });

      if (options.customMessage) {
        params.append('message', encodeURIComponent(options.customMessage));
      }

      return `${baseUrl}?${params.toString()}`;
    } catch (error) {
      console.error('Error generating shareable link:', error);
      throw new Error(`Failed to generate shareable link: ${error.message}`);
    }
  }

  /**
   * Create embeddable badge widget
   */
  async createEmbeddableWidget(badgeId: string): Promise<string> {
    try {
      const badge = await this.getBadgeById(badgeId);
      if (!badge) {
        throw new Error('Badge not found');
      }

      const display = await this.createPublicBadgeDisplay(badge);
      const metadata = await this.nftService.getBadgeMetadata(badgeId);

      const widgetHtml = `
        <div class="scrollbadge-widget" data-badge-id="${badgeId}">
          <div class="badge-header">
            <img src="${metadata.image}" alt="${metadata.name}" class="badge-image" />
            <h3 class="badge-title">${metadata.name}</h3>
          </div>
          <div class="badge-details">
            <p class="student-name">Earned by: ${display.studentName}</p>
            <p class="course-name">Course: ${display.courseName}</p>
            <p class="issue-date">Issued: ${display.issueDate.toLocaleDateString()}</p>
            <div class="skills">
              <strong>Skills:</strong>
              <ul>
                ${display.skills.map(skill => `<li>${skill}</li>`).join('')}
              </ul>
            </div>
          </div>
          <div class="badge-footer">
            <a href="${display.verificationUrl}" target="_blank" class="verify-link">
              Verify Authenticity
            </a>
            <div class="powered-by">
              Powered by <a href="https://scrolluniversity.org">ScrollUniversity</a>
            </div>
          </div>
        </div>
        <style>
          .scrollbadge-widget {
            max-width: 300px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            font-family: Arial, sans-serif;
            background: white;
          }
          .badge-image {
            width: 64px;
            height: 64px;
            border-radius: 50%;
          }
          .badge-header {
            text-align: center;
            margin-bottom: 16px;
          }
          .badge-title {
            margin: 8px 0;
            color: #333;
          }
          .badge-details p {
            margin: 4px 0;
            color: #666;
          }
          .skills ul {
            margin: 8px 0;
            padding-left: 20px;
          }
          .verify-link {
            color: #007bff;
            text-decoration: none;
          }
          .powered-by {
            font-size: 12px;
            color: #999;
            margin-top: 8px;
          }
        </style>
      `;

      return widgetHtml;
    } catch (error) {
      console.error('Error creating embeddable widget:', error);
      throw new Error(`Failed to create embeddable widget: ${error.message}`);
    }
  }

  /**
   * Get public badge by verification URL
   */
  async getPublicBadgeByUrl(url: string): Promise<PublicBadgeDisplay | null> {
    try {
      const badgeId = this.extractBadgeIdFromUrl(url);
      if (!badgeId) {
        return null;
      }

      const badge = await this.getBadgeById(badgeId);
      if (!badge) {
        return null;
      }

      return await this.createPublicBadgeDisplay(badge);
    } catch (error) {
      console.error('Error getting public badge by URL:', error);
      return null;
    }
  }

  /**
   * Search public badges
   */
  async searchPublicBadges(query: string): Promise<PublicBadgeDisplay[]> {
    try {
      // This would implement search functionality across public badges
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error searching public badges:', error);
      return [];
    }
  }

  // Private helper methods

  private async getStudentName(studentId: string): Promise<string> {
    // This would query the user database
    // For now, return placeholder
    return `Student ${studentId.substring(0, 8)}`;
  }

  private async getCourseName(courseId: string): Promise<string> {
    // This would query the course database
    // For now, return placeholder
    return `Course ${courseId.substring(0, 8)}`;
  }

  private async getStudentBadges(studentId: string): Promise<ScrollBadge[]> {
    // This would query the badge database
    // For now, return empty array
    return [];
  }

  private async getBadgeById(badgeId: string): Promise<ScrollBadge | null> {
    // This would query the badge database
    // For now, return null
    return null;
  }

  private aggregateSkills(badges: ScrollBadge[]): any[] {
    const allSkills = badges.flatMap(badge => badge.competencies);
    const uniqueSkills = allSkills.filter((skill, index, self) => 
      index === self.findIndex(s => s.skillId === skill.skillId)
    );
    return uniqueSkills;
  }

  private aggregateSpiritualProgress(badges: ScrollBadge[]): any {
    if (badges.length === 0) {
      return {
        spiritualGrowth: 0,
        kingdomAlignment: 0,
        propheticSensitivity: 0,
        characterDevelopment: 0,
        callingClarity: 0
      };
    }

    const totals = badges.reduce((acc, badge) => {
      acc.spiritualGrowth += badge.spiritualGrowth.spiritualGrowth;
      acc.kingdomAlignment += badge.spiritualGrowth.kingdomAlignment;
      acc.propheticSensitivity += badge.spiritualGrowth.propheticSensitivity;
      acc.characterDevelopment += badge.spiritualGrowth.characterDevelopment;
      acc.callingClarity += badge.spiritualGrowth.callingClarity;
      return acc;
    }, {
      spiritualGrowth: 0,
      kingdomAlignment: 0,
      propheticSensitivity: 0,
      characterDevelopment: 0,
      callingClarity: 0
    });

    const count = badges.length;
    return {
      spiritualGrowth: totals.spiritualGrowth / count,
      kingdomAlignment: totals.kingdomAlignment / count,
      propheticSensitivity: totals.propheticSensitivity / count,
      characterDevelopment: totals.characterDevelopment / count,
      callingClarity: totals.callingClarity / count
    };
  }

  private createAchievementSummary(collection: BadgeCollection): AchievementSummary {
    return {
      totalBadges: collection.totalBadges,
      coursesCompleted: collection.badges.filter(b => b.badgeType === 'course_completion').length,
      skillsMastered: collection.skillsAcquired.map(skill => skill.name),
      spiritualMilestones: collection.badges.filter(b => b.badgeType === 'spiritual_milestone').length,
      propheticAchievements: collection.badges.filter(b => b.badgeType === 'prophetic_achievement').length,
      kingdomImpactScore: Math.round(collection.spiritualProgress.kingdomAlignment)
    };
  }

  private async generateQRCode(data: string): Promise<string> {
    // This would generate an actual QR code
    // For now, return placeholder URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
  }

  private async storePublicProfile(profile: ShareableProfile): Promise<void> {
    // This would store the profile in a database for public access
    console.log(`Storing public profile: ${profile.profileId}`);
  }

  private extractBadgeIdFromUrl(url: string): string | null {
    const match = url.match(/\/badges\/([^\/]+)/);
    return match ? match[1] : null;
  }
}

/**
 * Factory function to create PublicBadgeDisplayService
 */
export function createPublicBadgeDisplayService(
  nftService: ScrollBadgeNFTService,
  verificationService: BadgeVerificationService
): PublicBadgeDisplayService {
  return new PublicBadgeDisplayService(nftService, verificationService);
}