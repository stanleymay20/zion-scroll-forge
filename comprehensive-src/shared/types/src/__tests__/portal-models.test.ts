/**
 * Unit Tests for ScrollUniversity Portal Data Models
 * 
 * This module tests the TypeScript interfaces and validation schemas.
 * "We test these models not in the wisdom of Babylon, but by the breath of the Spirit"
 */

import { describe, it, expect } from 'vitest';
import {
  validateData,
  safeValidateData,
  ScrollUserSchema,
  PortalCourseSchema,
  PortalEnrollmentSchema,
  AITutorSessionSchema,
  XRClassroomSchema,
  ScrollNodeSchema,
  ScholarshipSchema,
  ScholarshipApplicationSchema,
  PortalAnalyticsSchema,
  UserPreferencesSchema,
  NotificationSettingsSchema,
  PrivacySettingsSchema,
  LearningPreferencesSchema,
  AccessibilitySettingsSchema
} from '../portal-validation';

import {
  transformAPIUserToScrollUser,
  transformScrollUserToAPI,
  transformAPICourseToPortalCourse,
  transformPortalCourseToAPI,
  transformAPIEnrollmentToPortalEnrollment,
  transformAPIAITutorSessionToAITutorSession,
  transformAPIXRClassroomToXRClassroom,
  transformAPIScrollNodeToScrollNode,
  transformAPIScholarshipToScholarship,
  transformAPIScholarshipApplicationToScholarshipApplication,
  transformKeysToSnakeCase,
  transformKeysToCamelCase,
  camelToSnake,
  snakeToCamel
} from '../portal-transformers';

import type {
  ScrollUser,
  PortalCourse,
  PortalEnrollment,
  AITutorSession,
  XRClassroom,
  ScrollNode,
  Scholarship,
  ScholarshipApplication,
  APIScrollUser,
  APIPortalCourse,
  APIPortalEnrollment,
  APIAITutorSession,
  APIXRClassroom,
  APIScrollNode,
  APIScholarship,
  APIScholarshipApplication
} from '../portal-transformers';

describe('Portal Data Models Validation', () => {
  describe('ScrollUser Validation', () => {
    it('should validate a complete ScrollUser object', () => {
      const validUser = {
        user_id: 'user_123',
        email: 'test@scrolluniversity.org',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        scrollCoinWallet: 'wallet_123',
        preferredLanguage: 'en',
        timeZone: 'UTC',
        scrollNodeId: 'node_123',
        avatarUrl: 'https://example.com/avatar.jpg',
        bio: 'A dedicated ScrollUniversity student',
        scrollCalling: 'Teacher',
        spiritualGifts: ['wisdom', 'knowledge'],
        kingdomVision: 'To spread the Gospel through education',
        scrollAlignment: 0.85,
        role: 'student',
        enrollmentStatus: 'active',
        academicLevel: 'scroll_degree',
        scrollCoinBalance: 1500.50,
        workTradeCredits: 250.00,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          avatarUrl: 'https://example.com/avatar.jpg',
          bio: 'A dedicated ScrollUniversity student',
          location: 'Ghana',
          timeZone: 'UTC',
          scrollNodeId: 'node_123',
          degreePrograms: []
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        lastLoginAt: '2024-01-02T12:00:00Z'
      };

      const result = validateData(ScrollUserSchema, validUser);
      expect(result).toBeDefined();
      expect(result.email).toBe('test@scrolluniversity.org');
      expect(result.role).toBe('student');
      expect(result.spiritualGifts).toEqual(['wisdom', 'knowledge']);
    });

    it('should apply default values for optional fields', () => {
      const minimalUser = {
        user_id: 'user_123',
        email: 'test@scrolluniversity.org',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          timeZone: 'UTC',
          degreePrograms: []
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      };

      const result = validateData(ScrollUserSchema, minimalUser);
      expect(result.preferredLanguage).toBe('en');
      expect(result.timeZone).toBe('UTC');
      expect(result.role).toBe('student');
      expect(result.enrollmentStatus).toBe('active');
      expect(result.academicLevel).toBe('scroll_open');
      expect(result.scrollCoinBalance).toBe(0);
      expect(result.spiritualGifts).toEqual([]);
      expect(result.scrollAlignment).toBe(0);
    });

    it('should fail validation for invalid email', () => {
      const invalidUser = {
        user_id: 'user_123',
        email: 'invalid-email',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          timeZone: 'UTC',
          degreePrograms: []
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      };

      expect(() => validateData(ScrollUserSchema, invalidUser)).toThrow();
    });
  });

  describe('PortalCourse Validation', () => {
    it('should validate a complete PortalCourse object', () => {
      const validCourse = {
        portalCourseId: '550e8400-e29b-41d4-a716-446655440000',
        courseSpecId: '550e8400-e29b-41d4-a716-446655440001',
        facultyId: 'faculty_123',
        title: 'Introduction to Prophetic Programming',
        description: 'Learn programming with divine inspiration',
        level: 'Intermediate',
        durationWeeks: 8,
        xpReward: 200,
        scrollCoinCost: 50.00,
        prerequisites: ['course_101', 'course_102'],
        featured: true,
        enrollmentOpen: true,
        enrollmentCount: 25,
        rating: 4.8,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      };

      const result = validateData(PortalCourseSchema, validCourse);
      expect(result).toBeDefined();
      expect(result.title).toBe('Introduction to Prophetic Programming');
      expect(result.level).toBe('Intermediate');
      expect(result.prerequisites).toEqual(['course_101', 'course_102']);
    });

    it('should apply default values for optional fields', () => {
      const minimalCourse = {
        portalCourseId: '550e8400-e29b-41d4-a716-446655440000',
        courseSpecId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Basic Course',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      };

      const result = validateData(PortalCourseSchema, minimalCourse);
      expect(result.level).toBe('Introductory');
      expect(result.durationWeeks).toBe(4);
      expect(result.xpReward).toBe(100);
      expect(result.scrollCoinCost).toBe(0);
      expect(result.prerequisites).toEqual([]);
      expect(result.featured).toBe(false);
      expect(result.enrollmentOpen).toBe(true);
      expect(result.enrollmentCount).toBe(0);
      expect(result.rating).toBe(0);
    });
  });

  describe('AITutorSession Validation', () => {
    it('should validate a complete AITutorSession object', () => {
      const validSession = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'user_123',
        portalCourseId: '550e8400-e29b-41d4-a716-446655440001',
        tutorType: 'ScrollMentorGPT',
        facultyContext: 'Computer Science',
        sessionData: {
          conversationId: 'conv_123',
          topicsDiscussed: ['Python', 'AI'],
          userPreferences: {
            language: 'en',
            difficulty: 'intermediate'
          }
        },
        conversationHistory: [
          {
            messageId: '550e8400-e29b-41d4-a716-446655440002',
            sender: 'user',
            content: 'Hello, I need help with Python',
            timestamp: '2024-01-01T10:00:00Z',
            messageType: 'text'
          },
          {
            messageId: '550e8400-e29b-41d4-a716-446655440003',
            sender: 'ai',
            content: 'Hello! I\'d be happy to help you with Python programming.',
            timestamp: '2024-01-01T10:00:30Z',
            messageType: 'text'
          }
        ],
        startedAt: '2024-01-01T10:00:00Z',
        endedAt: '2024-01-01T11:00:00Z',
        satisfactionRating: 5,
        status: 'completed',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T11:00:00Z'
      };

      const result = validateData(AITutorSessionSchema, validSession);
      expect(result).toBeDefined();
      expect(result.tutorType).toBe('ScrollMentorGPT');
      expect(result.conversationHistory).toHaveLength(2);
      expect(result.satisfactionRating).toBe(5);
    });

    it('should apply default values for optional fields', () => {
      const minimalSession = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'user_123',
        tutorType: 'FacultyAI',
        sessionData: {
          topicsDiscussed: [],
          userPreferences: {
            language: 'en',
            difficulty: 'beginner'
          }
        },
        startedAt: '2024-01-01T10:00:00Z',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      };

      const result = validateData(AITutorSessionSchema, minimalSession);
      expect(result.status).toBe('active');
      expect(result.conversationHistory).toEqual([]);
    });
  });

  describe('UserPreferences Validation', () => {
    it('should validate complete user preferences', () => {
      const validPreferences = {
        preferenceId: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'user_123',
        theme: 'dark',
        notifications: {
          email: true,
          push: false,
          sms: true,
          courseUpdates: true,
          aiTutorMessages: true,
          xrClassroomReminders: false,
          scholarshipAlerts: true
        },
        privacySettings: {
          profilePublic: false,
          progressPublic: true,
          badgesPublic: true,
          analyticsOptOut: false
        },
        learningPreferences: {
          preferredDifficulty: 'advanced',
          learningStyle: 'visual',
          studyReminders: false,
          autoEnrollSuggestions: true
        },
        accessibilitySettings: {
          highContrast: true,
          screenReader: false,
          fontSize: 'large',
          reducedMotion: true,
          keyboardNavigation: true
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      };

      const result = validateData(UserPreferencesSchema, validPreferences);
      expect(result).toBeDefined();
      expect(result.theme).toBe('dark');
      expect(result.learningPreferences.preferredDifficulty).toBe('advanced');
      expect(result.accessibilitySettings.highContrast).toBe(true);
    });
  });
});

describe('Portal Data Transformers', () => {
  describe('User Transformations', () => {
    it('should transform API user to ScrollUser', () => {
      const apiUser: APIScrollUser = {
        user_id: 'user_123',
        email: 'test@scrolluniversity.org',
        username: 'testuser',
        first_name: 'John',
        last_name: 'Doe',
        scroll_coin_wallet: 'wallet_123',
        preferred_language: 'en',
        time_zone: 'UTC',
        scroll_node_id: 'node_123',
        avatar_url: 'https://example.com/avatar.jpg',
        bio: 'A dedicated student',
        scroll_calling: 'Teacher',
        spiritual_gifts: ['wisdom', 'knowledge'],
        kingdom_vision: 'Spread the Gospel',
        scroll_alignment: 0.85,
        role: 'student',
        enrollment_status: 'active',
        academic_level: 'scroll_degree',
        scroll_coin_balance: 1500.50,
        work_trade_credits: 250.00,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        last_login_at: '2024-01-02T12:00:00Z'
      };

      const result = transformAPIUserToScrollUser(apiUser);
      
      expect(result.user_id).toBe('user_123');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.scrollCoinWallet).toBe('wallet_123');
      expect(result.preferredLanguage).toBe('en');
      expect(result.spiritualGifts).toEqual(['wisdom', 'knowledge']);
      expect(result.profile.firstName).toBe('John');
      expect(result.profile.lastName).toBe('Doe');
    });

    it('should transform ScrollUser to API format', () => {
      const scrollUser: Partial<ScrollUser> = {
        user_id: 'user_123',
        email: 'test@scrolluniversity.org',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        scrollCoinWallet: 'wallet_123',
        preferredLanguage: 'en',
        timeZone: 'UTC',
        scrollNodeId: 'node_123',
        avatarUrl: 'https://example.com/avatar.jpg',
        bio: 'A dedicated student',
        scrollCalling: 'Teacher',
        spiritualGifts: ['wisdom', 'knowledge'],
        kingdomVision: 'Spread the Gospel',
        scrollAlignment: 0.85,
        role: 'student',
        enrollmentStatus: 'active',
        academicLevel: 'scroll_degree',
        scrollCoinBalance: 1500.50,
        workTradeCredits: 250.00
      };

      const result = transformScrollUserToAPI(scrollUser);
      
      expect(result.user_id).toBe('user_123');
      expect(result.first_name).toBe('John');
      expect(result.last_name).toBe('Doe');
      expect(result.scroll_coin_wallet).toBe('wallet_123');
      expect(result.preferred_language).toBe('en');
      expect(result.spiritual_gifts).toEqual(['wisdom', 'knowledge']);
    });
  });

  describe('Course Transformations', () => {
    it('should transform API course to PortalCourse', () => {
      const apiCourse: APIPortalCourse = {
        portal_course_id: '550e8400-e29b-41d4-a716-446655440000',
        course_spec_id: '550e8400-e29b-41d4-a716-446655440001',
        faculty_id: 'faculty_123',
        title: 'Introduction to Prophetic Programming',
        description: 'Learn programming with divine inspiration',
        level: 'Intermediate',
        duration_weeks: 8,
        xp_reward: 200,
        scroll_coin_cost: 50.00,
        prerequisites: ['course_101', 'course_102'],
        featured: true,
        enrollment_open: true,
        enrollment_count: 25,
        rating: 4.8,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      };

      const result = transformAPICourseToPortalCourse(apiCourse);
      
      expect(result.portalCourseId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.courseSpecId).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(result.title).toBe('Introduction to Prophetic Programming');
      expect(result.durationWeeks).toBe(8);
      expect(result.xpReward).toBe(200);
      expect(result.scrollCoinCost).toBe(50.00);
      expect(result.prerequisites).toEqual(['course_101', 'course_102']);
    });

    it('should transform PortalCourse to API format', () => {
      const portalCourse: Partial<PortalCourse> = {
        portalCourseId: '550e8400-e29b-41d4-a716-446655440000',
        courseSpecId: '550e8400-e29b-41d4-a716-446655440001',
        facultyId: 'faculty_123',
        title: 'Introduction to Prophetic Programming',
        description: 'Learn programming with divine inspiration',
        level: 'Intermediate',
        durationWeeks: 8,
        xpReward: 200,
        scrollCoinCost: 50.00,
        prerequisites: ['course_101', 'course_102'],
        featured: true,
        enrollmentOpen: true,
        enrollmentCount: 25,
        rating: 4.8
      };

      const result = transformPortalCourseToAPI(portalCourse);
      
      expect(result.portal_course_id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.course_spec_id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(result.title).toBe('Introduction to Prophetic Programming');
      expect(result.duration_weeks).toBe(8);
      expect(result.xp_reward).toBe(200);
      expect(result.scroll_coin_cost).toBe(50.00);
      expect(result.prerequisites).toEqual(['course_101', 'course_102']);
    });
  });

  describe('Key Transformation Utilities', () => {
    it('should convert camelCase to snake_case', () => {
      expect(camelToSnake('firstName')).toBe('first_name');
      expect(camelToSnake('scrollCoinBalance')).toBe('scroll_coin_balance');
      expect(camelToSnake('portalCourseId')).toBe('portal_course_id');
      expect(camelToSnake('xrEnvironmentId')).toBe('xr_environment_id');
    });

    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel('first_name')).toBe('firstName');
      expect(snakeToCamel('scroll_coin_balance')).toBe('scrollCoinBalance');
      expect(snakeToCamel('portal_course_id')).toBe('portalCourseId');
      expect(snakeToCamel('xr_environment_id')).toBe('xrEnvironmentId');
    });

    it('should transform object keys to snake_case', () => {
      const camelCaseObj = {
        firstName: 'John',
        lastName: 'Doe',
        scrollCoinBalance: 1500,
        userPreferences: {
          preferredLanguage: 'en',
          timeZone: 'UTC'
        }
      };

      const result = transformKeysToSnakeCase(camelCaseObj);
      
      expect(result.first_name).toBe('John');
      expect(result.last_name).toBe('Doe');
      expect(result.scroll_coin_balance).toBe(1500);
      expect(result.user_preferences.preferred_language).toBe('en');
      expect(result.user_preferences.time_zone).toBe('UTC');
    });

    it('should transform object keys to camelCase', () => {
      const snakeCaseObj = {
        first_name: 'John',
        last_name: 'Doe',
        scroll_coin_balance: 1500,
        user_preferences: {
          preferred_language: 'en',
          time_zone: 'UTC'
        }
      };

      const result = transformKeysToCamelCase(snakeCaseObj);
      
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.scrollCoinBalance).toBe(1500);
      expect(result.userPreferences.preferredLanguage).toBe('en');
      expect(result.userPreferences.timeZone).toBe('UTC');
    });
  });
});

describe('Safe Validation', () => {
  it('should return success for valid data', () => {
    const validUser = {
      user_id: 'user_123',
      email: 'test@scrolluniversity.org',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        timeZone: 'UTC',
        degreePrograms: []
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    };

    const result = safeValidateData(ScrollUserSchema, validUser);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('should return error for invalid data', () => {
    const invalidUser = {
      user_id: 'user_123',
      email: 'invalid-email',
      username: 'testuser'
      // Missing required fields
    };

    const result = safeValidateData(ScrollUserSchema, invalidUser);
    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(result.error).toContain('email');
  });
});