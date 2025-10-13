/**
 * ScrollUniversity Test Setup
 * "Test all things; hold fast what is good" - 1 Thessalonians 5:21
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { randomBytes } from 'crypto';

// Global test configuration
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.BCRYPT_ROUNDS = '4'; // Faster for tests

// Create unique test database
const testDatabaseName = `scrolluniversity_test_${randomBytes(8).toString('hex')}`;
process.env.DATABASE_URL = `postgresql://postgres:testpassword@localhost:5432/${testDatabaseName}`;
process.env.REDIS_URL = 'redis://localhost:6379/15'; // Use test database

// Global test variables
let prisma: PrismaClient;

// Setup before all tests
beforeAll(async () => {
  // Create test database
  try {
    execSync(`createdb ${testDatabaseName}`, { stdio: 'ignore' });
  } catch (error) {
    // Database might already exist
  }

  // Initialize Prisma
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  // Run migrations
  try {
    execSync('npx prisma migrate deploy', { 
      stdio: 'ignore',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
  } catch (error) {
    console.error('Failed to run migrations:', error);
  }

  // Connect to database
  await prisma.$connect();
}, 60000);

// Cleanup after all tests
afterAll(async () => {
  // Disconnect from database
  await prisma.$disconnect();

  // Drop test database
  try {
    execSync(`dropdb ${testDatabaseName}`, { stdio: 'ignore' });
  } catch (error) {
    // Database might not exist
  }
}, 30000);

// Clean database between tests
beforeEach(async () => {
  // Clean all tables in reverse dependency order
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter(name => name !== '_prisma_migrations')
    .map(name => `"public"."${name}"`)
    .join(', ');

  if (tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
    } catch (error) {
      console.error('Failed to truncate tables:', error);
    }
  }
});

// Mock external services
jest.mock('../services/CacheService', () => ({
  cacheService: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
    delete: jest.fn().mockResolvedValue(true),
    exists: jest.fn().mockResolvedValue(false),
    getOrSet: jest.fn().mockImplementation(async (key, fn) => await fn()),
    increment: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(true),
    mget: jest.fn().mockResolvedValue([]),
    mset: jest.fn().mockResolvedValue(true),
    invalidateByTags: jest.fn().mockResolvedValue(0),
    clear: jest.fn().mockResolvedValue(true),
    getStats: jest.fn().mockResolvedValue({}),
    healthCheck: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(undefined)
  }
}));

jest.mock('../utils/productionLogger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  },
  PerformanceMonitor: {
    start: jest.fn(),
    end: jest.fn(),
    measure: jest.fn().mockImplementation(async (name, fn) => await fn())
  },
  SecurityLogger: {
    logAuthAttempt: jest.fn(),
    logSuspiciousActivity: jest.fn(),
    logDataAccess: jest.fn(),
    logSecurityViolation: jest.fn()
  },
  MetricsLogger: {
    logUserAction: jest.fn(),
    logSystemMetric: jest.fn(),
    logBusinessEvent: jest.fn()
  },
  ErrorTracker: {
    trackError: jest.fn(),
    trackDatabaseError: jest.fn(),
    trackAPIError: jest.fn()
  }
}));

// Mock monitoring service
jest.mock('../services/MonitoringService', () => ({
  monitoringService: {
    recordMetric: jest.fn(),
    getMetrics: jest.fn().mockReturnValue([]),
    getAggregatedMetrics: jest.fn().mockReturnValue(0),
    addAlertRule: jest.fn(),
    removeAlertRule: jest.fn(),
    getActiveAlerts: jest.fn().mockReturnValue([]),
    acknowledgeAlert: jest.fn(),
    resolveAlert: jest.fn(),
    recordEvent: jest.fn(),
    recordError: jest.fn(),
    recordPerformance: jest.fn(),
    recordSecurityEvent: jest.fn(),
    getSystemHealth: jest.fn().mockResolvedValue({ status: 'healthy' }),
    getDashboardMetrics: jest.fn().mockReturnValue({}),
    shutdown: jest.fn()
  }
}));

// Mock email service
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

// Mock blockchain services
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      JsonRpcProvider: jest.fn().mockImplementation(() => ({
        getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
        getBalance: jest.fn().mockResolvedValue('1000000000000000000')
      }))
    },
    Wallet: jest.fn().mockImplementation(() => ({
      address: '0x1234567890123456789012345678901234567890',
      connect: jest.fn().mockReturnThis()
    })),
    Contract: jest.fn().mockImplementation(() => ({
      mint: jest.fn().mockResolvedValue({ hash: '0xtest' }),
      balanceOf: jest.fn().mockResolvedValue('100')
    }))
  }
}));

// Test utilities
export const testUtils = {
  // Create test user
  createTestUser: async (overrides = {}) => {
    return await prisma.user.create({
      data: {
        email: 'test@scrolluniversity.edu',
        username: 'testuser',
        passwordHash: '$2b$04$test.hash.for.testing.purposes.only',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT',
        academicLevel: 'SCROLL_OPEN',
        ...overrides
      }
    });
  },

  // Create test course
  createTestCourse: async (overrides = {}) => {
    const faculty = await prisma.faculty.create({
      data: {
        name: 'Test Faculty',
        description: 'Test faculty for testing'
      }
    });

    return await prisma.course.create({
      data: {
        title: 'Test Course',
        description: 'Test course for testing',
        difficulty: 'BEGINNER',
        duration: 60,
        scrollXPReward: 100,
        scrollCoinCost: 0,
        facultyId: faculty.id,
        ...overrides
      }
    });
  },

  // Create test application
  createTestApplication: async (userId: string, overrides = {}) => {
    return await prisma.application.create({
      data: {
        applicantId: userId,
        programApplied: 'SCROLL_DEGREE',
        intendedStartDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        personalStatement: 'Test personal statement',
        spiritualTestimony: 'Test spiritual testimony',
        academicHistory: [],
        characterReferences: [],
        documents: [],
        applicationTimeline: [],
        ...overrides
      }
    });
  },

  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate test JWT token
  generateTestToken: (userId: string) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, role: 'STUDENT' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },

  // Clean specific table
  cleanTable: async (tableName: string) => {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`);
  }
};

// Global test data
export const testData = {
  validUser: {
    email: 'valid@scrolluniversity.edu',
    username: 'validuser',
    password: 'ValidPassword123!',
    firstName: 'Valid',
    lastName: 'User'
  },
  
  validCourse: {
    title: 'Introduction to Scroll Theology',
    description: 'A foundational course in scroll-aligned theology',
    difficulty: 'BEGINNER' as const,
    duration: 120,
    scrollXPReward: 200,
    scrollCoinCost: 0
  },

  validApplication: {
    programApplied: 'SCROLL_DEGREE' as const,
    personalStatement: 'I am called to serve in scroll-aligned education and ministry.',
    spiritualTestimony: 'My testimony of faith and transformation through Christ.',
    academicHistory: [
      {
        institutionName: 'Previous University',
        degree: 'Bachelor of Arts',
        fieldOfStudy: 'Theology',
        startDate: '2020-09-01',
        endDate: '2024-05-15',
        gpa: 3.7,
        creditsEarned: 120,
        transcriptVerified: true,
        documents: ['transcript.pdf']
      }
    ],
    characterReferences: [
      {
        name: 'Pastor John Smith',
        relationship: 'Pastor',
        contact: 'pastor@church.org',
        recommendation: 'Strong character and spiritual maturity'
      }
    ]
  }
};

// Export prisma instance for tests
export { prisma };