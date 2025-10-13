/**
 * ScrollBadge System Tests
 * Comprehensive tests for the ScrollBadge NFT Certification System
 */

import { 
  ScrollBadgeSystem, 
  createScrollBadgeSystem 
} from '../ScrollBadgeSystem';
import { 
  BadgeMintRequest, 
  BadgeType, 
  SkillLevel 
} from '../../types/scrollbadge';

// Mock the services
jest.mock('../ScrollBadgeNFTService');
jest.mock('../BadgeMintingService');
jest.mock('../BadgeVerificationService');
jest.mock('../PublicBadgeDisplayService');

describe('ScrollBadgeSystem', () => {
  let badgeSystem: ScrollBadgeSystem;

  beforeEach(() => {
    badgeSystem = createScrollBadgeSystem({
      enableBlockchain: true,
      enableIPFS: true,
      enablePublicDisplay: true,
      verificationCacheTTL: 300000
    });
  });

  describe('Badge Minting', () => {
    const mockMintRequest: BadgeMintRequest = {
      studentId: 'student-123',
      courseId: 'course-456',
      achievementData: {
        completionDate: new Date('2024-01-15'),
        finalGrade: 85,
        skillsAcquired: [
          {
            skillId: 'skill-1',
            name: 'Prophetic Discernment',
            level: SkillLevel.PRACTITIONER,
            verifiedAt: new Date(),
            verifiedBy: 'ai-dean-1'
          }
        ],
        spiritualGrowth: {
          spiritualGrowth: 75,
          kingdomAlignment: 80,
          propheticSensitivity: 70,
          characterDevelopment: 85,
          callingClarity: 78
        },
        projectsCompleted: ['project-1', 'project-2'],
        assessmentScores: [
          {
            assessmentId: 'assessment-1',
            score: 85,
            maxScore: 100,
            completedAt: new Date()
          }
        ]
      },
      verificationProof: {
        courseCompletionHash: 'hash-123',
        facultySignature: 'signature-456',
        aiDeanVerification: 'verification-789'
      }
    };

    it('should mint a course completion badge successfully', async () => {
      const badge = await badgeSystem.mintCourseCompletionBadge(mockMintRequest);
      
      expect(badge).toBeDefined();
      expect(badge.studentId).toBe(mockMintRequest.studentId);
      expect(badge.courseId).toBe(mockMintRequest.courseId);
      expect(badge.competencies).toHaveLength(1);
      expect(badge.competencies[0].name).toBe('Prophetic Discernment');
    });

    it('should mint special achievement badges', async () => {
      const badge = await badgeSystem.mintSpecialAchievementBadge(
        'student-123',
        BadgeType.PROPHETIC_ACHIEVEMENT,
        { specialAchievement: 'Prophetic Vision Accuracy' }
      );
      
      expect(badge).toBeDefined();
      expect(badge.badgeType).toBe(BadgeType.PROPHETIC_ACHIEVEMENT);
      expect(badge.studentId).toBe('student-123');
    });

    it('should batch mint badges for multiple students', async () => {
      const requests = [mockMintRequest, { ...mockMintRequest, studentId: 'student-456' }];
      
      const badges = await badgeSystem.batchMintBadges(requests);
      
      expect(badges).toHaveLength(2);
      expect(badges[0].studentId).toBe('student-123');
      expect(badges[1].studentId).toBe('student-456');
    });

    it('should handle minting errors gracefully', async () => {
      const invalidRequest = {
        ...mockMintRequest,
        achievementData: {
          ...mockMintRequest.achievementData,
          finalGrade: 50 // Below minimum threshold
        }
      };

      await expect(badgeSystem.mintCourseCompletionBadge(invalidRequest))
        .rejects.toThrow('Minimum grade of 70% required');
    });
  });

  describe('Badge Verification', () => {
    it('should verify a badge by token ID', async () => {
      const tokenId = 'token-123';
      
      const result = await badgeSystem.verifyBadge(tokenId);
      
      expect(result).toBeDefined();
      expect(result.isValid).toBeDefined();
      expect(result.verificationDetails).toBeDefined();
    });

    it('should verify a badge by verification hash', async () => {
      const hash = 'verification-hash-123';
      
      const result = await badgeSystem.verifyBadgeByHash(hash);
      
      expect(result).toBeDefined();
      expect(result.isValid).toBeDefined();
    });

    it('should verify all badges for a student', async () => {
      const studentId = 'student-123';
      
      const results = await badgeSystem.verifyStudentBadges(studentId);
      
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle verification errors', async () => {
      const invalidTokenId = 'invalid-token';
      
      const result = await badgeSystem.verifyBadge(invalidTokenId);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('Public Display', () => {
    const mockBadge = {
      tokenId: 'token-123',
      courseId: 'course-456',
      studentId: 'student-123',
      badgeType: BadgeType.COURSE_COMPLETION,
      competencies: [
        {
          skillId: 'skill-1',
          name: 'Prophetic Discernment',
          level: SkillLevel.PRACTITIONER,
          verifiedAt: new Date(),
          verifiedBy: 'ai-dean-1'
        }
      ],
      spiritualGrowth: {
        spiritualGrowth: 75,
        kingdomAlignment: 80,
        propheticSensitivity: 70,
        characterDevelopment: 85,
        callingClarity: 78
      },
      timestamp: new Date(),
      verificationHash: 'hash-123'
    };

    it('should create public badge display', async () => {
      const display = await badgeSystem.createPublicBadgeDisplay(mockBadge);
      
      expect(display).toBeDefined();
      expect(display.badgeId).toBe(mockBadge.tokenId);
      expect(display.skills).toContain('Prophetic Discernment');
    });

    it('should get student badge collection', async () => {
      const studentId = 'student-123';
      
      const collection = await badgeSystem.getStudentBadgeCollection(studentId);
      
      expect(collection).toBeDefined();
      expect(collection.studentId).toBe(studentId);
      expect(collection.badges).toBeDefined();
      expect(collection.publicProfile).toBeDefined();
    });

    it('should create shareable profile', async () => {
      const studentId = 'student-123';
      
      const profile = await badgeSystem.createShareableProfile(studentId, true);
      
      expect(profile).toBeDefined();
      expect(profile.profileId).toBeDefined();
      expect(profile.shareUrl).toBeDefined();
      expect(profile.isPublic).toBe(true);
    });

    it('should generate embeddable widget', async () => {
      const badgeId = 'badge-123';
      
      const widget = await badgeSystem.generateEmbeddableWidget(badgeId);
      
      expect(widget).toBeDefined();
      expect(typeof widget).toBe('string');
      expect(widget).toContain('scrollbadge-widget');
    });

    it('should respect public display settings', async () => {
      const systemWithoutPublicDisplay = createScrollBadgeSystem({
        enablePublicDisplay: false
      });

      await expect(systemWithoutPublicDisplay.createPublicBadgeDisplay(mockBadge))
        .rejects.toThrow('Public display is disabled');
    });
  });

  describe('System Management', () => {
    it('should get system status', async () => {
      const status = await badgeSystem.getSystemStatus();
      
      expect(status).toBeDefined();
      expect(status.blockchain).toBeDefined();
      expect(status.ipfs).toBeDefined();
      expect(status.publicDisplay).toBeDefined();
      expect(status.statistics).toBeDefined();
    });

    it('should revoke a badge', async () => {
      const tokenId = 'token-123';
      const reason = 'Academic misconduct';
      
      const revoked = await badgeSystem.revokeBadge(tokenId, reason);
      
      expect(revoked).toBe(true);
    });

    it('should handle revocation errors', async () => {
      const invalidTokenId = 'invalid-token';
      const reason = 'Test reason';
      
      await expect(badgeSystem.revokeBadge(invalidTokenId, reason))
        .rejects.toThrow();
    });
  });

  describe('Configuration', () => {
    it('should create system with default configuration', () => {
      const defaultSystem = createScrollBadgeSystem();
      
      expect(defaultSystem).toBeDefined();
    });

    it('should create system with custom configuration', () => {
      const customSystem = createScrollBadgeSystem({
        enableBlockchain: false,
        enableIPFS: false,
        enablePublicDisplay: false,
        verificationCacheTTL: 600000
      });
      
      expect(customSystem).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle service initialization errors', () => {
      // Test error handling during service initialization
      expect(() => createScrollBadgeSystem()).not.toThrow();
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      const tokenId = 'network-error-token';
      
      const result = await badgeSystem.verifyBadge(tokenId);
      
      // Should return failed verification instead of throwing
      expect(result.isValid).toBe(false);
    });

    it('should handle invalid input data', async () => {
      const invalidRequest = {
        studentId: '',
        courseId: '',
        achievementData: null,
        verificationProof: null
      } as any;

      await expect(badgeSystem.mintCourseCompletionBadge(invalidRequest))
        .rejects.toThrow();
    });
  });

  describe('Integration', () => {
    it('should integrate all services correctly', async () => {
      // Test full workflow: mint -> verify -> display
      const badge = await badgeSystem.mintCourseCompletionBadge(mockMintRequest);
      const verification = await badgeSystem.verifyBadge(badge.tokenId);
      const display = await badgeSystem.createPublicBadgeDisplay(badge);
      
      expect(badge).toBeDefined();
      expect(verification.isValid).toBe(true);
      expect(display.badgeId).toBe(badge.tokenId);
    });

    it('should maintain data consistency across operations', async () => {
      const studentId = 'student-consistency-test';
      const request = { ...mockMintRequest, studentId };
      
      const badge = await badgeSystem.mintCourseCompletionBadge(request);
      const collection = await badgeSystem.getStudentBadgeCollection(studentId);
      
      expect(collection.badges.some(b => b.tokenId === badge.tokenId)).toBe(true);
    });
  });
});

describe('ScrollBadge Factory Functions', () => {
  it('should create ScrollBadgeSystem with factory function', () => {
    const system = createScrollBadgeSystem();
    expect(system).toBeInstanceOf(ScrollBadgeSystem);
  });

  it('should apply custom configuration correctly', () => {
    const config = {
      enableBlockchain: false,
      enableIPFS: true,
      enablePublicDisplay: false,
      verificationCacheTTL: 120000
    };
    
    const system = createScrollBadgeSystem(config);
    expect(system).toBeInstanceOf(ScrollBadgeSystem);
  });
});