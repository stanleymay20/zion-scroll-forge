/**
 * Profile Service Tests
 * "Test everything; hold fast what is good" - 1 Thessalonians 5:21
 */

import { profileService } from '../ProfileService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('ProfileService', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'profile.test@scrolluniversity.com',
        username: 'profiletest',
        passwordHash: 'test_hash',
        firstName: 'Profile',
        lastName: 'Test',
        role: 'STUDENT',
        enrollmentStatus: 'ACTIVE',
        academicLevel: 'SCROLL_OPEN'
      }
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    await prisma.$disconnect();
  });

  describe('getProfile', () => {
    it('should retrieve user profile', async () => {
      const profile = await profileService.getProfile(testUserId);

      expect(profile).toBeDefined();
      expect(profile.id).toBe(testUserId);
      expect(profile.email).toBe('profile.test@scrolluniversity.com');
      expect(profile.firstName).toBe('Profile');
      expect(profile.lastName).toBe('Test');
    });

    it('should throw error for non-existent user', async () => {
      await expect(profileService.getProfile('non-existent-id')).rejects.toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updates = {
        bio: 'Test bio for profile',
        location: 'Test City',
        scrollCalling: 'To serve in the kingdom'
      };

      const updatedProfile = await profileService.updateProfile(testUserId, updates);

      expect(updatedProfile.bio).toBe(updates.bio);
      expect(updatedProfile.location).toBe(updates.location);
      expect(updatedProfile.scrollCalling).toBe(updates.scrollCalling);
    });

    it('should validate profile updates', async () => {
      const invalidUpdates = {
        firstName: 'A' // Too short
      };

      await expect(profileService.updateProfile(testUserId, invalidUpdates)).rejects.toThrow();
    });
  });

  describe('getCompletionStatus', () => {
    it('should calculate completion percentage', async () => {
      const status = await profileService.getCompletionStatus(testUserId);

      expect(status).toBeDefined();
      expect(status.userId).toBe(testUserId);
      expect(status.completionPercentage).toBeGreaterThanOrEqual(0);
      expect(status.completionPercentage).toBeLessThanOrEqual(100);
      expect(Array.isArray(status.missingFields)).toBe(true);
      expect(Array.isArray(status.recommendations)).toBe(true);
    });
  });

  describe('searchProfiles', () => {
    it('should search profiles by query', async () => {
      const results = await profileService.searchProfiles('Profile', 10);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].firstName).toBe('Profile');
    });

    it('should return empty array for no matches', async () => {
      const results = await profileService.searchProfiles('NonExistentUser12345', 10);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('getPublicProfile', () => {
    it('should return limited profile information', async () => {
      const publicProfile = await profileService.getPublicProfile(testUserId);

      expect(publicProfile).toBeDefined();
      expect(publicProfile.id).toBe(testUserId);
      expect(publicProfile.username).toBeDefined();
      expect(publicProfile.firstName).toBeDefined();
      // Should not include sensitive information
      expect(publicProfile.email).toBeUndefined();
      expect(publicProfile.phoneNumber).toBeUndefined();
    });
  });
});
