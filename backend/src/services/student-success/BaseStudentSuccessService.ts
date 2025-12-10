/**
 * Base Student Success Service
 * 
 * Base class for all student success services providing common functionality
 * including error handling, logging, caching, and database access.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import winston from 'winston';
import studentSuccessConfig from '../../config/student-success.config';

export class BaseStudentSuccessService {
  protected supabase: SupabaseClient;
  protected redis: Redis | null = null;
  protected logger: winston.Logger;
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Initialize Redis client if enabled
    if (studentSuccessConfig.cache.enabled) {
      try {
        this.redis = new Redis({
          host: studentSuccessConfig.cache.host,
          port: studentSuccessConfig.cache.port,
          password: studentSuccessConfig.cache.password,
          db: studentSuccessConfig.cache.db,
          keyPrefix: studentSuccessConfig.cache.keyPrefix,
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        });

        this.redis.on('error', (error) => {
          this.logger.error('Redis connection error', { error, service: this.serviceName });
        });

        this.redis.on('connect', () => {
          this.logger.info('Redis connected', { service: this.serviceName });
        });
      } catch (error) {
        this.logger.warn('Redis initialization failed, continuing without cache', {
          error,
          service: this.serviceName,
        });
        this.redis = null;
      }
    }

    // Initialize Winston logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: this.serviceName,
        environment: process.env.NODE_ENV || 'development',
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        new winston.transports.File({
          filename: `logs/student-success-${serviceName}-error.log`,
          level: 'error',
        }),
        new winston.transports.File({
          filename: `logs/student-success-${serviceName}.log`,
        }),
      ],
    });
  }

  /**
   * Get data from cache or execute function and cache result
   */
  protected async cacheGet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    if (!this.redis) {
      return fetchFn();
    }

    try {
      // Try to get from cache
      const cached = await this.redis.get(key);
      if (cached) {
        this.logger.debug('Cache hit', { key, service: this.serviceName });
        return JSON.parse(cached);
      }

      // Cache miss - fetch data
      this.logger.debug('Cache miss', { key, service: this.serviceName });
      const data = await fetchFn();

      // Store in cache
      const cacheTtl = ttl || studentSuccessConfig.cache.ttl.profile;
      await this.redis.setex(key, cacheTtl, JSON.stringify(data));

      return data;
    } catch (error) {
      this.logger.error('Cache operation failed', {
        error,
        key,
        service: this.serviceName,
      });
      // Fallback to direct fetch
      return fetchFn();
    }
  }

  /**
   * Invalidate cache for a specific key or pattern
   */
  protected async cacheInvalidate(keyOrPattern: string): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      if (keyOrPattern.includes('*')) {
        // Pattern-based invalidation
        const keys = await this.redis.keys(keyOrPattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          this.logger.debug('Cache invalidated (pattern)', {
            pattern: keyOrPattern,
            count: keys.length,
            service: this.serviceName,
          });
        }
      } else {
        // Single key invalidation
        await this.redis.del(keyOrPattern);
        this.logger.debug('Cache invalidated (key)', {
          key: keyOrPattern,
          service: this.serviceName,
        });
      }
    } catch (error) {
      this.logger.error('Cache invalidation failed', {
        error,
        keyOrPattern,
        service: this.serviceName,
      });
    }
  }

  /**
   * Execute database query with error handling and logging
   */
  protected async executeQuery<T>(
    queryFn: () => Promise<T>,
    operation: string
  ): Promise<T> {
    const startTime = Date.now();

    try {
      this.logger.debug(`Executing ${operation}`, { service: this.serviceName });
      const result = await queryFn();
      const duration = Date.now() - startTime;

      this.logger.info(`${operation} completed`, {
        duration,
        service: this.serviceName,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`${operation} failed`, {
        error,
        duration,
        service: this.serviceName,
      });
      throw this.handleError(error, operation);
    }
  }

  /**
   * Handle and transform errors
   */
  protected handleError(error: any, context: string): Error {
    if (error instanceof Error) {
      // Add context to existing error
      const enhancedError = new Error(`${context}: ${error.message}`);
      enhancedError.stack = error.stack;
      return enhancedError;
    }

    // Create new error for non-Error objects
    return new Error(`${context}: ${String(error)}`);
  }

  /**
   * Validate required fields
   */
  protected validateRequired(
    data: Record<string, any>,
    requiredFields: string[]
  ): void {
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required fields: ${missingFields.join(', ')}`
      );
    }
  }

  /**
   * Batch process items with concurrency control
   */
  protected async batchProcess<T, R>(
    items: T[],
    processFn: (item: T) => Promise<R>,
    batchSize: number = studentSuccessConfig.performance.batchSize
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processFn));
      results.push(...batchResults);

      this.logger.debug('Batch processed', {
        batchNumber: Math.floor(i / batchSize) + 1,
        totalBatches: Math.ceil(items.length / batchSize),
        service: this.serviceName,
      });
    }

    return results;
  }

  /**
   * Retry operation with exponential backoff
   */
  protected async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          this.logger.warn('Operation failed, retrying', {
            attempt: attempt + 1,
            maxRetries,
            delay,
            error: lastError.message,
            service: this.serviceName,
          });
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  /**
   * Log audit event
   */
  protected async logAudit(
    action: string,
    userId: string,
    details: Record<string, any>
  ): Promise<void> {
    if (!studentSuccessConfig.privacy.auditLogging) {
      return;
    }

    try {
      await this.supabase.from('audit_logs').insert({
        service: this.serviceName,
        action,
        user_id: userId,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Audit logging failed', {
        error,
        action,
        userId,
        service: this.serviceName,
      });
    }
  }

  /**
   * Check if user has permission
   */
  protected async checkPermission(
    userId: string,
    permission: string
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', userId)
        .eq('permission', permission)
        .single();

      if (error) {
        this.logger.warn('Permission check failed', {
          error,
          userId,
          permission,
          service: this.serviceName,
        });
        return false;
      }

      return !!data;
    } catch (error) {
      this.logger.error('Permission check error', {
        error,
        userId,
        permission,
        service: this.serviceName,
      });
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.logger.info('Redis connection closed', { service: this.serviceName });
    }
  }
}

export default BaseStudentSuccessService;
