/**
 * Jest Test Setup for ScrollUniversity Backend
 * Global test configuration and mocks
 */

import { PrismaClient } from '@prisma/client';

// Mock Prisma Client globally
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
    // Add other Prisma methods as needed
  }))
}));

// Mock logger globally
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock AI Gateway Service
jest.mock('../services/AIGatewayService', () => ({
  AIGatewayService: jest.fn().mockImplementation(() => ({
    generateContent: jest.fn().mockResolvedValue({
      content: 'Mock AI generated content',
      usage: { totalTokens: 100 }
    })
  }))
}));

// Global test timeout for property-based tests
jest.setTimeout(60000);

// Setup environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/scrolluniversity_test';
process.env.OPENAI_API_KEY = 'test-key';
process.env.CLAUDE_API_KEY = 'test-key';

// Global test utilities
global.testUtils = {
  // Helper to create mock course outline
  createMockCourseOutline: (overrides = {}) => ({
    title: 'Test Course',
    subject: 'Theology',
    level: 'intermediate' as const,
    chapters: [
      {
        title: 'Test Chapter',
        orderIndex: 1,
        topics: ['Test Topic'],
        learningObjectives: ['Test Objective']
      }
    ],
    ...overrides
  }),

  // Helper to create mock book input
  createMockBookInput: (overrides = {}) => ({
    title: 'Test Book',
    subject: 'Theology',
    level: 'intermediate' as const,
    ...overrides
  }),

  // Helper to create mock search query
  createMockSearchQuery: (overrides = {}) => ({
    query: 'test query',
    type: 'semantic' as const,
    limit: 10,
    ...overrides
  })
};

// Extend Jest matchers for property-based testing
expect.extend({
  toBeValidScrollContent(received: string) {
    const hasScrollTone = received.includes('kingdom') || 
                         received.includes('calling') || 
                         received.includes('Lord') ||
                         received.includes('Biblical');
    
    const hasStructure = received.includes('#') || // Headers
                        received.includes('##') ||
                        received.includes('###');
    
    const pass = hasScrollTone && hasStructure;
    
    if (pass) {
      return {
        message: () => `Expected content not to have scroll tone and structure`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected content to have scroll tone (kingdom/calling/Lord/Biblical) and markdown structure`,
        pass: false
      };
    }
  },

  toHaveValidBookStructure(received: any) {
    const requiredFields = ['id', 'title', 'subject', 'level', 'metadata', 'createdAt', 'updatedAt'];
    const missingFields = requiredFields.filter(field => !(field in received));
    
    const pass = missingFields.length === 0;
    
    if (pass) {
      return {
        message: () => `Expected book not to have valid structure`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected book to have valid structure. Missing fields: ${missingFields.join(', ')}`,
        pass: false
      };
    }
  }
});

// Declare global types for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidScrollContent(): R;
      toHaveValidBookStructure(): R;
    }
  }

  var testUtils: {
    createMockCourseOutline: (overrides?: any) => any;
    createMockBookInput: (overrides?: any) => any;
    createMockSearchQuery: (overrides?: any) => any;
  };
}

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global error handler for unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export {};