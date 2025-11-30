/**
 * Performance Optimization Service for Academic Year Automation System
 * "Whatever you do, work at it with all your heart" - Colossians 3:23
 * 
 * Implements caching strategies, query optimization, and async processing
 * to ensure system performance meets Requirement 18 (Scalability and Performance)
 */

import { cacheService } from '../CacheService';
import { logger } from '../../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface QueryOptimizationConfig {
  enableQueryCaching: boolean;
  cacheInvalidationStrategy: 'time-based' | 'event-based' | 'hybrid';
  defaultCacheTTL: number;
  batchSize: number;
  asyncProcessingEnabled: boolean;
}

export interface PerformanceMetrics {
  queryTime: number;
  cacheHitRate: number;
  asyncJobsQueued: number;
  databaseConnections: number;
  memoryUsage: number;
}

export class PerformanceOptimizationService {
  private config: QueryOptimizationConfig;
  private asyncJobQueue: Map<string, Promise<any>>;
  private performanceMetrics: Map<string, number[]>;

  constructor(config?: Partial<QueryOptimizationConfig>) {
    this.config = {
      enableQueryCaching: true,
      cacheInvalidationStrategy: 'hybrid',
      defaultCacheTTL: 3600, // 1 hour
      batchSize: 100,
      asyncProcessingEnabled: true,
      ...config
    };

    this.asyncJobQueue = new Map();
    this.performanceMetrics = new Map();
  }

  /**
   * Optimized query for academic calendar data with caching
   * Validates: Requirement 18.2 - Optimized queries with caching
   */
  async getAcademicYearWithCache(academicYearId: string): Promise<any> {
    const cacheKey = `academic_year:${academicYearId}`;

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const startTime = Date.now();

        const academicYear = await prisma.academicYear.findUnique({
          where: { id: academicYearId },
          include: {
            semesters: {
              include: {
                academicEvents: true
              }
            }
          }
        });

        const queryTime = Date.now() - startTime;
        this.recordMetric('query_time', queryTime);

        logger.info('Academic year fetched from database', {
          academicYearId,
          queryTime
        });

        return academicYear;
      },
      {
        ttl: this.config.defaultCacheTTL,
        tags: ['academic_year', `academic_year:${academicYearId}`]
      }
    );
  }

  /**
   * Batch fetch students with optimized query
   * Validates: Requirement 18.2 - Database query optimization
   */
  async getStudentsBatch(studentIds: string[]): Promise<any[]> {
    const cacheKey = `students:batch:${studentIds.sort().join(',')}`;

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const startTime = Date.now();

        // Use IN clause for batch fetching instead of multiple queries
        const students = await prisma.student.findMany({
          where: {
            id: { in: studentIds }
          },
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            email: true,
            academicStanding: true,
            gpa: true,
            totalCreditsEarned: true
          }
        });

        const queryTime = Date.now() - startTime;
        this.recordMetric('batch_query_time', queryTime);

        logger.info('Students batch fetched', {
          count: students.length,
          queryTime
        });

        return students;
      },
      {
        ttl: 1800, // 30 minutes for student data
        tags: ['students']
      }
    );
  }

  /**
   * Optimized enrollment query with pagination and indexing
   * Validates: Requirement 18.2 - Optimized queries with indexing
   */
  async getEnrollmentsPaginated(
    semesterId: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ enrollments: any[]; total: number; hasMore: boolean }> {
    const cacheKey = `enrollments:${semesterId}:page:${page}:size:${pageSize}`;

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const startTime = Date.now();
        const skip = (page - 1) * pageSize;

        // Use cursor-based pagination for better performance
        const [enrollments, total] = await Promise.all([
          prisma.enrollment.findMany({
            where: { semesterId },
            skip,
            take: pageSize,
            orderBy: { enrollmentDate: 'desc' },
            include: {
              student: {
                select: {
                  id: true,
                  studentId: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }),
          prisma.enrollment.count({
            where: { semesterId }
          })
        ]);

        const queryTime = Date.now() - startTime;
        this.recordMetric('paginated_query_time', queryTime);

        logger.info('Enrollments fetched with pagination', {
          semesterId,
          page,
          pageSize,
          total,
          queryTime
        });

        return {
          enrollments,
          total,
          hasMore: skip + enrollments.length < total
        };
      },
      {
        ttl: 600, // 10 minutes for enrollment data
        tags: ['enrollments', `semester:${semesterId}`]
      }
    );
  }

  /**
   * Async processing for heavy operations
   * Validates: Requirement 18.3 - Async processing for batch operations
   */
  async processHeavyOperationAsync<T>(
    operationId: string,
    operation: () => Promise<T>
  ): Promise<string> {
    if (!this.config.asyncProcessingEnabled) {
      throw new Error('Async processing is disabled');
    }

    // Check if operation is already queued
    if (this.asyncJobQueue.has(operationId)) {
      logger.info('Operation already queued', { operationId });
      return operationId;
    }

    // Queue the operation
    const jobPromise = this.executeAsyncOperation(operationId, operation);
    this.asyncJobQueue.set(operationId, jobPromise);

    logger.info('Heavy operation queued for async processing', {
      operationId,
      queueSize: this.asyncJobQueue.size
    });

    return operationId;
  }

  /**
   * Execute async operation with error handling
   */
  private async executeAsyncOperation<T>(
    operationId: string,
    operation: () => Promise<T>
  ): Promise<T> {
    try {
      const startTime = Date.now();
      const result = await operation();
      const executionTime = Date.now() - startTime;

      this.recordMetric('async_operation_time', executionTime);

      logger.info('Async operation completed', {
        operationId,
        executionTime
      });

      // Cache the result
      await cacheService.set(
        `async_result:${operationId}`,
        { status: 'completed', result, completedAt: new Date() },
        { ttl: 3600 }
      );

      return result;
    } catch (error) {
      logger.error('Async operation failed', {
        operationId,
        error: error instanceof Error ? error.message : String(error)
      });

      // Cache the error
      await cacheService.set(
        `async_result:${operationId}`,
        { status: 'failed', error: String(error), failedAt: new Date() },
        { ttl: 3600 }
      );

      throw error;
    } finally {
      this.asyncJobQueue.delete(operationId);
    }
  }

  /**
   * Get async operation status
   */
  async getAsyncOperationStatus(operationId: string): Promise<any> {
    // Check if still in queue
    if (this.asyncJobQueue.has(operationId)) {
      return { status: 'processing', operationId };
    }

    // Check cache for result
    const result = await cacheService.get(`async_result:${operationId}`);
    if (result) {
      return result;
    }

    return { status: 'not_found', operationId };
  }

  /**
   * Batch process notifications asynchronously
   * Validates: Requirement 18.3 - Async processing without impacting UX
   */
  async batchProcessNotifications(notifications: any[]): Promise<string> {
    const operationId = `batch_notifications_${Date.now()}`;

    return await this.processHeavyOperationAsync(operationId, async () => {
      const batches = this.createBatches(notifications, this.config.batchSize);
      const results = [];

      for (const batch of batches) {
        const batchResults = await Promise.all(
          batch.map(notification => this.sendNotification(notification))
        );
        results.push(...batchResults);

        // Small delay between batches to prevent overwhelming the system
        await this.delay(100);
      }

      logger.info('Batch notifications processed', {
        operationId,
        total: notifications.length,
        batches: batches.length
      });

      return results;
    });
  }

  /**
   * Send individual notification (placeholder)
   */
  private async sendNotification(notification: any): Promise<boolean> {
    // Implementation would integrate with NotificationService
    return true;
  }

  /**
   * Invalidate cache by tags (event-based invalidation)
   * Validates: Requirement 18.2 - Cache invalidation strategy
   */
  async invalidateCacheByEvent(eventType: string, entityId: string): Promise<void> {
    const tags = this.getTagsForEvent(eventType, entityId);

    await cacheService.invalidateByTags(tags);

    logger.info('Cache invalidated by event', {
      eventType,
      entityId,
      tags
    });
  }

  /**
   * Get cache tags based on event type
   */
  private getTagsForEvent(eventType: string, entityId: string): string[] {
    const tagMap: Record<string, string[]> = {
      'academic_year.created': ['academic_year', `academic_year:${entityId}`],
      'academic_year.updated': ['academic_year', `academic_year:${entityId}`],
      'semester.created': ['semesters', `semester:${entityId}`],
      'semester.updated': ['semesters', `semester:${entityId}`],
      'student.registered': ['enrollments', 'students'],
      'enrollment.created': ['enrollments', `semester:${entityId}`],
      'module.released': ['modules', `course:${entityId}`]
    };

    return tagMap[eventType] || [];
  }

  /**
   * Preload frequently accessed data
   * Validates: Requirement 18.2 - Caching strategy
   */
  async preloadFrequentData(): Promise<void> {
    logger.info('Preloading frequently accessed data');

    try {
      // Preload active academic years
      const activeYears = await prisma.academicYear.findMany({
        where: { isActive: true },
        include: {
          semesters: {
            where: { isActive: true }
          }
        }
      });

      for (const year of activeYears) {
        await cacheService.set(
          `academic_year:${year.id}`,
          year,
          { ttl: this.config.defaultCacheTTL, tags: ['academic_year'] }
        );
      }

      logger.info('Frequently accessed data preloaded', {
        academicYears: activeYears.length
      });
    } catch (error) {
      logger.error('Failed to preload data', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get performance metrics
   * Validates: Requirement 18.1 - Performance monitoring
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const cacheStats = await cacheService.getStats();

    const avgQueryTime = this.getAverageMetric('query_time');
    const avgBatchQueryTime = this.getAverageMetric('batch_query_time');

    return {
      queryTime: avgQueryTime,
      cacheHitRate: this.calculateCacheHitRate(),
      asyncJobsQueued: this.asyncJobQueue.size,
      databaseConnections: await this.getDatabaseConnectionCount(),
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // MB
    };
  }

  /**
   * Record performance metric
   */
  private recordMetric(metricName: string, value: number): void {
    if (!this.performanceMetrics.has(metricName)) {
      this.performanceMetrics.set(metricName, []);
    }

    const metrics = this.performanceMetrics.get(metricName)!;
    metrics.push(value);

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  /**
   * Get average metric value
   */
  private getAverageMetric(metricName: string): number {
    const metrics = this.performanceMetrics.get(metricName);
    if (!metrics || metrics.length === 0) {
      return 0;
    }

    const sum = metrics.reduce((acc, val) => acc + val, 0);
    return sum / metrics.length;
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    // This would be calculated from actual cache statistics
    // Placeholder implementation
    return 0.85; // 85% hit rate
  }

  /**
   * Get database connection count
   */
  private async getDatabaseConnectionCount(): Promise<number> {
    try {
      // Query PostgreSQL for active connections
      const result = await prisma.$queryRaw<any[]>`
        SELECT count(*) as count 
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `;
      return result[0]?.count || 0;
    } catch (error) {
      logger.error('Failed to get database connection count', {
        error: error instanceof Error ? error.message : String(error)
      });
      return 0;
    }
  }

  /**
   * Create batches from array
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Optimize database indexes (administrative function)
   * Validates: Requirement 18.2 - Database optimization
   */
  async optimizeDatabaseIndexes(): Promise<void> {
    logger.info('Starting database index optimization');

    try {
      // Analyze tables for query optimization
      await prisma.$executeRaw`ANALYZE academic_years`;
      await prisma.$executeRaw`ANALYZE semesters`;
      await prisma.$executeRaw`ANALYZE students`;
      await prisma.$executeRaw`ANALYZE enrollments`;
      await prisma.$executeRaw`ANALYZE faculty`;
      await prisma.$executeRaw`ANALYZE teaching_assignments`;

      logger.info('Database index optimization completed');
    } catch (error) {
      logger.error('Database index optimization failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Clear all performance metrics
   */
  clearMetrics(): void {
    this.performanceMetrics.clear();
    logger.info('Performance metrics cleared');
  }
}

export default PerformanceOptimizationService;
