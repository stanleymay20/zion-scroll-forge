/**
 * User Profile Service
 * "For we are God's handiwork, created in Christ Jesus" - Ephesians 2:10
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/productionLogger';
import {
  UserProfile,
  ProfileUpdateRequest,
  ProfileCompletionStatus,
  ProfileValidationResult,
  ValidationError,
  ValidationWarning,
  ProfileActivityLog
} from '../types/profile.types';

const prisma = new PrismaClient();

export class ProfileService {
  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          bio: true,
          avatarUrl: true,
          dateOfBirth: true,
          phoneNumber: true,
          location: true,
          role: true,
          academicLevel: true,
          enrollmentStatus: true,
          scrollCalling: true,
          spiritualGifts: true,
          kingdomVision: true,
          scrollAlignment: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      logger.info('Profile retrieved', { userId });

      return user as UserProfile;
    } catch (error) {
      logger.error('Failed to get profile', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: ProfileUpdateRequest): Promise<UserProfile> {
    try {
      // Validate updates
      const validation = await this.validateProfileUpdate(updates);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Update profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...updates,
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          bio: true,
          avatarUrl: true,
          dateOfBirth: true,
          phoneNumber: true,
          location: true,
          role: true,
          academicLevel: true,
          enrollmentStatus: true,
          scrollCalling: true,
          spiritualGifts: true,
          kingdomVision: true,
          scrollAlignment: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true
        }
      });

      // Log activity
      await this.logProfileActivity(userId, 'profile_updated', 'User updated their profile', {
        updatedFields: Object.keys(updates)
      });

      logger.info('Profile updated successfully', { userId, updatedFields: Object.keys(updates) });

      return updatedUser as UserProfile;
    } catch (error) {
      logger.error('Failed to update profile', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Get profile completion status
   */
  async getCompletionStatus(userId: string): Promise<ProfileCompletionStatus> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const missingFields: string[] = [];
      const sections = {
        basicInfo: true,
        contactInfo: true,
        academicInfo: true,
        spiritualFormation: true,
        preferences: true,
        security: true
      };

      // Check basic info
      if (!user.firstName || !user.lastName) {
        missingFields.push('firstName', 'lastName');
        sections.basicInfo = false;
      }
      if (!user.bio) missingFields.push('bio');
      if (!user.avatarUrl) missingFields.push('avatarUrl');

      // Check contact info
      if (!user.phoneNumber) {
        missingFields.push('phoneNumber');
        sections.contactInfo = false;
      }
      if (!user.location) missingFields.push('location');
      if (!user.dateOfBirth) missingFields.push('dateOfBirth');

      // Check spiritual formation
      if (!user.scrollCalling) {
        missingFields.push('scrollCalling');
        sections.spiritualFormation = false;
      }
      if (!user.spiritualGifts || user.spiritualGifts.length === 0) {
        missingFields.push('spiritualGifts');
      }
      if (!user.kingdomVision) missingFields.push('kingdomVision');

      const totalFields = 11; // Total important fields
      const completedFields = totalFields - missingFields.length;
      const completionPercentage = Math.round((completedFields / totalFields) * 100);

      const recommendations: string[] = [];
      if (missingFields.includes('avatarUrl')) {
        recommendations.push('Upload a profile picture to personalize your account');
      }
      if (missingFields.includes('scrollCalling')) {
        recommendations.push('Share your divine calling to connect with like-minded believers');
      }
      if (missingFields.includes('spiritualGifts')) {
        recommendations.push('Identify your spiritual gifts for better course recommendations');
      }

      return {
        userId,
        completionPercentage,
        missingFields,
        recommendations,
        sections
      };
    } catch (error) {
      logger.error('Failed to get completion status', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Validate profile update
   */
  private async validateProfileUpdate(updates: ProfileUpdateRequest): Promise<ProfileValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate firstName
    if (updates.firstName !== undefined) {
      if (updates.firstName.length < 2) {
        errors.push({
          field: 'firstName',
          message: 'First name must be at least 2 characters',
          code: 'MIN_LENGTH'
        });
      }
      if (updates.firstName.length > 50) {
        errors.push({
          field: 'firstName',
          message: 'First name must not exceed 50 characters',
          code: 'MAX_LENGTH'
        });
      }
    }

    // Validate lastName
    if (updates.lastName !== undefined) {
      if (updates.lastName.length < 2) {
        errors.push({
          field: 'lastName',
          message: 'Last name must be at least 2 characters',
          code: 'MIN_LENGTH'
        });
      }
      if (updates.lastName.length > 50) {
        errors.push({
          field: 'lastName',
          message: 'Last name must not exceed 50 characters',
          code: 'MAX_LENGTH'
        });
      }
    }

    // Validate bio
    if (updates.bio !== undefined && updates.bio.length > 500) {
      errors.push({
        field: 'bio',
        message: 'Bio must not exceed 500 characters',
        code: 'MAX_LENGTH'
      });
    }

    // Validate phoneNumber
    if (updates.phoneNumber !== undefined) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(updates.phoneNumber)) {
        errors.push({
          field: 'phoneNumber',
          message: 'Invalid phone number format',
          code: 'INVALID_FORMAT'
        });
      }
    }

    // Validate dateOfBirth
    if (updates.dateOfBirth !== undefined) {
      const age = this.calculateAge(updates.dateOfBirth);
      if (age < 13) {
        errors.push({
          field: 'dateOfBirth',
          message: 'User must be at least 13 years old',
          code: 'AGE_RESTRICTION'
        });
      }
      if (age > 120) {
        warnings.push({
          field: 'dateOfBirth',
          message: 'Date of birth seems unusual',
          suggestion: 'Please verify the date is correct'
        });
      }
    }

    // Validate scrollCalling
    if (updates.scrollCalling !== undefined && updates.scrollCalling.length > 500) {
      errors.push({
        field: 'scrollCalling',
        message: 'Scroll calling must not exceed 500 characters',
        code: 'MAX_LENGTH'
      });
    }

    // Validate kingdomVision
    if (updates.kingdomVision !== undefined && updates.kingdomVision.length > 1000) {
      errors.push({
        field: 'kingdomVision',
        message: 'Kingdom vision must not exceed 1000 characters',
        code: 'MAX_LENGTH'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Log profile activity
   */
  private async logProfileActivity(
    userId: string,
    action: string,
    description: string,
    metadata?: any
  ): Promise<void> {
    try {
      // In a production system, this would be stored in a dedicated audit log table
      logger.info('Profile activity', {
        userId,
        action,
        description,
        metadata,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Failed to log profile activity', { error: error.message, userId });
      // Don't throw - logging failure shouldn't break the main operation
    }
  }

  /**
   * Search profiles (for admin or public directory)
   */
  async searchProfiles(query: string, limit: number = 20): Promise<UserProfile[]> {
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { username: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ],
          enrollmentStatus: 'ACTIVE'
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          bio: true,
          avatarUrl: true,
          dateOfBirth: true,
          phoneNumber: true,
          location: true,
          role: true,
          academicLevel: true,
          enrollmentStatus: true,
          scrollCalling: true,
          spiritualGifts: true,
          kingdomVision: true,
          scrollAlignment: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true
        },
        take: limit
      });

      logger.info('Profiles searched', { query, resultsCount: users.length });

      return users as UserProfile[];
    } catch (error) {
      logger.error('Failed to search profiles', { error: error.message, query });
      throw error;
    }
  }

  /**
   * Get public profile (limited information)
   */
  async getPublicProfile(userId: string): Promise<Partial<UserProfile>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          bio: true,
          avatarUrl: true,
          location: true,
          scrollCalling: true,
          spiritualGifts: true,
          scrollAlignment: true,
          createdAt: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      logger.info('Public profile retrieved', { userId });

      return user;
    } catch (error) {
      logger.error('Failed to get public profile', { error: error.message, userId });
      throw error;
    }
  }
}

export const profileService = new ProfileService();
