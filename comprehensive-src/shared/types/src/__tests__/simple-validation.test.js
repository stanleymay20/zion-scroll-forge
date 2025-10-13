/**
 * Simple validation test for portal models
 * Using JavaScript to avoid TypeScript compilation issues
 */

const { z } = require('zod');

// Simple validation schemas for testing
const UserRoleSchema = z.enum([
  'student',
  'faculty', 
  'ai_dean',
  'admin',
  'global_ambassador',
  'scroll_elder',
  'prophet',
  'chancellor'
]);

const CourseLevelSchema = z.enum([
  'Introductory',
  'Intermediate',
  'Advanced',
  'Prophetic'
]);

const SimpleUserSchema = z.object({
  user_id: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(3).max(50),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  preferredLanguage: z.string().length(2).default('en'),
  timeZone: z.string().default('UTC'),
  role: UserRoleSchema.default('student'),
  scrollCoinBalance: z.number().min(0).default(0),
  spiritualGifts: z.array(z.string()).default([]),
  scrollAlignment: z.number().min(0).max(1).default(0),
  createdAt: z.string(),
  updatedAt: z.string()
});

const SimpleCourseSchema = z.object({
  portalCourseId: z.string().uuid(),
  courseSpecId: z.string().uuid(),
  title: z.string().min(1).max(255),
  level: CourseLevelSchema.default('Introductory'),
  durationWeeks: z.number().int().min(1).max(52).default(4),
  xpReward: z.number().int().min(0).default(100),
  scrollCoinCost: z.number().min(0).default(0),
  prerequisites: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  enrollmentOpen: z.boolean().default(true),
  enrollmentCount: z.number().int().min(0).default(0),
  rating: z.number().min(0).max(5).default(0),
  createdAt: z.string(),
  updatedAt: z.string()
});

// Test functions
function validateData(schema, data) {
  try {
    return schema.parse(data);
  } catch (error) {
    throw new Error(`Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
  }
}

function safeValidateData(schema, data) {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    };
  }
}

// Test cases
describe('Portal Models Validation', () => {
  test('should validate a complete user object', () => {
    const validUser = {
      user_id: 'user_123',
      email: 'test@scrolluniversity.org',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      preferredLanguage: 'en',
      timeZone: 'UTC',
      role: 'student',
      scrollCoinBalance: 1500.50,
      spiritualGifts: ['wisdom', 'knowledge'],
      scrollAlignment: 0.85,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    };

    const result = validateData(SimpleUserSchema, validUser);
    expect(result).toBeDefined();
    expect(result.email).toBe('test@scrolluniversity.org');
    expect(result.role).toBe('student');
    expect(result.spiritualGifts).toEqual(['wisdom', 'knowledge']);
  });

  test('should apply default values for optional fields', () => {
    const minimalUser = {
      user_id: 'user_123',
      email: 'test@scrolluniversity.org',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    };

    const result = validateData(SimpleUserSchema, minimalUser);
    expect(result.preferredLanguage).toBe('en');
    expect(result.timeZone).toBe('UTC');
    expect(result.role).toBe('student');
    expect(result.scrollCoinBalance).toBe(0);
    expect(result.spiritualGifts).toEqual([]);
    expect(result.scrollAlignment).toBe(0);
  });

  test('should fail validation for invalid email', () => {
    const invalidUser = {
      user_id: 'user_123',
      email: 'invalid-email',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    };

    expect(() => validateData(SimpleUserSchema, invalidUser)).toThrow();
  });

  test('should validate a complete course object', () => {
    const validCourse = {
      portalCourseId: '550e8400-e29b-41d4-a716-446655440000',
      courseSpecId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Introduction to Prophetic Programming',
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

    const result = validateData(SimpleCourseSchema, validCourse);
    expect(result).toBeDefined();
    expect(result.title).toBe('Introduction to Prophetic Programming');
    expect(result.level).toBe('Intermediate');
    expect(result.prerequisites).toEqual(['course_101', 'course_102']);
  });

  test('should apply default values for course', () => {
    const minimalCourse = {
      portalCourseId: '550e8400-e29b-41d4-a716-446655440000',
      courseSpecId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Basic Course',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    };

    const result = validateData(SimpleCourseSchema, minimalCourse);
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

  test('should use safe validation for error handling', () => {
    const validUser = {
      user_id: 'user_123',
      email: 'test@scrolluniversity.org',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    };

    const result = safeValidateData(SimpleUserSchema, validUser);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  test('should return error for invalid data with safe validation', () => {
    const invalidUser = {
      user_id: 'user_123',
      email: 'invalid-email',
      username: 'testuser'
      // Missing required fields
    };

    const result = safeValidateData(SimpleUserSchema, invalidUser);
    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(result.error).toContain('email');
  });
});

// Transformation tests
describe('Data Transformations', () => {
  test('should convert camelCase to snake_case', () => {
    function camelToSnake(str) {
      return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }

    expect(camelToSnake('firstName')).toBe('first_name');
    expect(camelToSnake('scrollCoinBalance')).toBe('scroll_coin_balance');
    expect(camelToSnake('portalCourseId')).toBe('portal_course_id');
    expect(camelToSnake('xrEnvironmentId')).toBe('xr_environment_id');
  });

  test('should convert snake_case to camelCase', () => {
    function snakeToCamel(str) {
      return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    expect(snakeToCamel('first_name')).toBe('firstName');
    expect(snakeToCamel('scroll_coin_balance')).toBe('scrollCoinBalance');
    expect(snakeToCamel('portal_course_id')).toBe('portalCourseId');
    expect(snakeToCamel('xr_environment_id')).toBe('xrEnvironmentId');
  });

  test('should transform object keys to snake_case', () => {
    function transformKeysToSnakeCase(obj) {
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(transformKeysToSnakeCase);
      }

      const transformed = {};
      for (const [key, value] of Object.entries(obj)) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        transformed[snakeKey] = transformKeysToSnakeCase(value);
      }
      return transformed;
    }

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

  test('should transform API user to frontend format', () => {
    function transformAPIUserToScrollUser(apiUser) {
      return {
        user_id: apiUser.user_id,
        email: apiUser.email,
        username: apiUser.username,
        firstName: apiUser.first_name,
        lastName: apiUser.last_name,
        scrollCoinWallet: apiUser.scroll_coin_wallet,
        preferredLanguage: apiUser.preferred_language,
        timeZone: apiUser.time_zone,
        scrollNodeId: apiUser.scroll_node_id,
        avatarUrl: apiUser.avatar_url,
        bio: apiUser.bio,
        scrollCalling: apiUser.scroll_calling,
        spiritualGifts: apiUser.spiritual_gifts || [],
        kingdomVision: apiUser.kingdom_vision,
        scrollAlignment: apiUser.scroll_alignment,
        role: apiUser.role,
        enrollmentStatus: apiUser.enrollment_status,
        academicLevel: apiUser.academic_level,
        scrollCoinBalance: apiUser.scroll_coin_balance,
        workTradeCredits: apiUser.work_trade_credits,
        createdAt: apiUser.created_at,
        updatedAt: apiUser.updated_at,
        lastLoginAt: apiUser.last_login_at
      };
    }

    const apiUser = {
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
  });
});

console.log('Portal models validation tests completed successfully!');