/**
 * Test Setup and Teardown Configuration
 * "Test all things; hold fast what is good" - 1 Thessalonians 5:21
 * 
 * Provides comprehensive test infrastructure setup including:
 * - Database connection and migration management
 * - Redis cache setup with mock fallback
 * - Global test lifecycle management
 * - Cleanup and teardown procedures
 */

import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}. Please check .env.test file.`);
  }
}

// Global test instances
let prisma: PrismaClient | null = null;
let redis: Redis | MockRedis | null = null;

// Configuration from environment with fallbacks
const TEST_CONFIG = {
  database: {
    url: process.env.DATABASE_URL || '',
    logQueries: process.env.TEST_LOG_QUERIES === 'true',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6380', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
  },
};

/**
 * Mock Redis interface for testing when real Redis is unavailable
 */
interface MockRedis {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: unknown[]): Promise<string>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
  ping(): Promise<string>;
  quit(): Promise<string>;
  disconnect(): Promise<void>;
  flushall(): Promise<string>;
}

/**
 * Setup test database with migrations
 */
export const setupTestDatabase = async (): Promise<PrismaClient> => {
  if (prisma) {
    return prisma;
  }

  try {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: TEST_CONFIG.database.url,
        },
      },
      log: TEST_CONFIG.database.logQueries 
        ? ['query', 'info', 'warn', 'error'] 
        : ['error'],
    });

    // Connect to database
    await prisma.$connect();
    logger.info('Test database connected successfully');

    // Run migrations
    try {
      execSync('npx prisma migrate deploy', { 
        stdio: 'pipe',
        env: { ...process.env, DATABASE_URL: TEST_CONFIG.database.url }
      });
      logger.info('Database migrations applied successfully');
    } catch (migrationError) {
      logger.warn('Migration failed, attempting to push schema', { 
        error: migrationError instanceof Error ? migrationError.message : String(migrationError) 
      });
      
      try {
        execSync('npx prisma db push --force-reset', { 
          stdio: 'pipe',
          env: { ...process.env, DATABASE_URL: TEST_CONFIG.database.url }
        });
        logger.info('Database schema pushed successfully');
      } catch (pushError) {
        logger.error('Schema push failed', { 
          error: pushError instanceof Error ? pushError.message : String(pushError) 
        });
        throw new Error('Failed to setup test database schema');
      }
    }

    return prisma;
  } catch (error) {
    logger.error('Failed to setup test database', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
};

/**
 * Setup test Redis with mock fallback
 */
export const setupTestRedis = async (): Promise<Redis | MockRedis> => {
  if (redis) {
    return redis;
  }

  try {
    const redisClient = new Redis({
      host: TEST_CONFIG.redis.host,
      port: TEST_CONFIG.redis.port,
      password: TEST_CONFIG.redis.password,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: TEST_CONFIG.redis.maxRetries,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    // Test connection
    try {
      await redisClient.ping();
      redis = redisClient;
      logger.info('Test Redis connected successfully');
      return redis;
    } catch (connectionError) {
      logger.warn('Redis connection failed, using mock Redis for tests', {
        error: connectionError instanceof Error ? connectionError.message : String(connectionError)
      });
      
      // Disconnect failed client
      await redisClient.quit().catch(() => {
        // Ignore quit errors
      });
      
      // Create mock Redis
      redis = createMockRedis();
      return redis;
    }
  } catch (error) {
    logger.warn('Failed to create Redis client, using mock Redis', {
      error: error instanceof Error ? error.message : String(error)
    });
    redis = createMockRedis();
    return redis;
  }
};

/**
 * Create mock Redis implementation for testing
 */
const createMockRedis = (): MockRedis => {
  const store = new Map<string, string>();
  const ttls = new Map<string, number>();

  const mockRedis: MockRedis = {
    get: jest.fn((key: string): Promise<string | null> => {
      return Promise.resolve(store.get(key) || null);
    }),
    
    set: jest.fn((key: string, value: string, ...args: unknown[]): Promise<string> => {
      store.set(key, value);
      
      // Handle EX (expiration in seconds) option
      const exIndex = args.findIndex(arg => arg === 'EX');
      if (exIndex !== -1 && args[exIndex + 1]) {
        const seconds = Number(args[exIndex + 1]);
        ttls.set(key, Date.now() + seconds * 1000);
      }
      
      return Promise.resolve('OK');
    }),
    
    del: jest.fn((key: string): Promise<number> => {
      const existed = store.has(key);
      store.delete(key);
      ttls.delete(key);
      return Promise.resolve(existed ? 1 : 0);
    }),
    
    exists: jest.fn((key: string): Promise<number> => {
      return Promise.resolve(store.has(key) ? 1 : 0);
    }),
    
    expire: jest.fn((key: string, seconds: number): Promise<number> => {
      if (store.has(key)) {
        ttls.set(key, Date.now() + seconds * 1000);
        return Promise.resolve(1);
      }
      return Promise.resolve(0);
    }),
    
    ttl: jest.fn((key: string): Promise<number> => {
      const expiry = ttls.get(key);
      if (!expiry) return Promise.resolve(-1);
      
      const remaining = Math.ceil((expiry - Date.now()) / 1000);
      return Promise.resolve(remaining > 0 ? remaining : -2);
    }),
    
    ping: jest.fn((): Promise<string> => {
      return Promise.resolve('PONG');
    }),
    
    quit: jest.fn((): Promise<string> => {
      store.clear();
      ttls.clear();
      return Promise.resolve('OK');
    }),
    
    disconnect: jest.fn((): Promise<void> => {
      store.clear();
      ttls.clear();
      return Promise.resolve();
    }),
    
    flushall: jest.fn((): Promise<string> => {
      store.clear();
      ttls.clear();
      return Promise.resolve('OK');
    }),
  };

  return mockRedis;
};

/**
 * Clean up test database by truncating all tables
 */
export const cleanupTestDatabase = async (): Promise<void> => {
  if (!prisma) {
    return;
  }

  try {
    // Get all table names
    const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    // Truncate all tables except migrations
    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        try {
          await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
        } catch (error) {
          logger.warn(`Failed to truncate table ${tablename}`, {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }
    
    logger.debug('Test database cleaned successfully');
  } catch (error) {
    logger.error('Failed to cleanup test database', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
};

/**
 * Clean up test Redis cache
 */
export const cleanupTestRedis = async (): Promise<void> => {
  if (!redis) {
    return;
  }

  try {
    await redis.flushall();
    logger.debug('Test Redis cache flushed successfully');
  } catch (error) {
    logger.warn('Failed to flush Redis cache', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Teardown test infrastructure
 */
export const teardownTests = async (): Promise<void> => {
  const errors: Error[] = [];

  // Disconnect Prisma
  if (prisma) {
    try {
      await prisma.$disconnect();
      logger.info('Test database disconnected');
      prisma = null;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errors.push(err);
      logger.error('Failed to disconnect Prisma', { error: err.message });
    }
  }

  // Disconnect Redis
  if (redis) {
    try {
      await redis.quit();
      logger.info('Test Redis disconnected');
      redis = null;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errors.push(err);
      logger.error('Failed to disconnect Redis', { error: err.message });
    }
  }

  // Throw if there were errors
  if (errors.length > 0) {
    throw new Error(`Teardown failed with ${errors.length} error(s): ${errors.map(e => e.message).join(', ')}`);
  }
};

/**
 * Get Prisma client instance (for use in tests)
 */
export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    throw new Error('Prisma client not initialized. Call setupTestDatabase() first.');
  }
  return prisma;
};

/**
 * Get Redis client instance (for use in tests)
 */
export const getRedisClient = (): Redis | MockRedis => {
  if (!redis) {
    throw new Error('Redis client not initialized. Call setupTestRedis() first.');
  }
  return redis;
};

/**
 * Check if using mock Redis
 */
export const isUsingMockRedis = (): boolean => {
  return redis !== null && !(redis instanceof Redis);
};

// Global test setup
beforeAll(async () => {
  logger.info('Starting test suite setup');
  
  try {
    await setupTestDatabase();
    await setupTestRedis();
    logger.info('Test suite setup complete');
  } catch (error) {
    logger.error('Test suite setup failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}, 30000); // 30 second timeout for setup

// Clean up between tests
beforeEach(async () => {
  try {
    await cleanupTestDatabase();
    await cleanupTestRedis();
  } catch (error) {
    logger.error('Test cleanup failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}, 10000); // 10 second timeout for cleanup

// Global test teardown
afterAll(async () => {
  logger.info('Starting test suite teardown');
  
  try {
    await teardownTests();
    logger.info('Test suite teardown complete');
  } catch (error) {
    logger.error('Test suite teardown failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}, 10000); // 10 second timeout for teardown

// Export for backward compatibility
export { prisma, redis };
