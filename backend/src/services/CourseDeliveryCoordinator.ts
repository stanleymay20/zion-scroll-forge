/**
 * Course Delivery Coordinator
 * "Let content flow to students like streams in the desert"
 * 
 * Coordinates course delivery and content synchronization between
 * the Content Creation Engine and Course Management System.
 * Ensures timely content delivery and maintains consistency.
 * 
 * Requirements: 10.2
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import CourseService from './CourseService';

const prisma = new PrismaClient();

export interface DeliverySchedule {
  courseId: string;
  contentItems: DeliveryItem[];
  startDate: Date;
  endDate: Date;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  progress: number;
}

export interface DeliveryItem {
  id: string;
  contentType: 'LECTURE' | 'READING' | 'EXERCISE' | 'ASSESSMENT' | 'MULTIMEDIA';
  title: string;
  scheduledDate: Date;
  deliveredDate?: Date;
  status: 'PENDING' | 'READY' | 'DELIVERED' | 'FAILED';
  dependencies: string[];
  metadata: Record<string, any>;
}

export interface ContentSyncStatus {
  courseId: string;
  lastSyncDate: Date;
  itemsSynced: number;
  itemsPending: number;
  syncErrors: string[];
  nextSyncDate: Date;
}

export interface DeliveryMetrics {
  totalScheduled: number;
  delivered: number;
  pending: number;
  delayed: number;
  onTimeDeliveryRate: number;
  averageDeliveryTime: number;
}

export class CourseDeliveryCoordinator {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  /**
   * Create delivery schedule for a course
   */
  async createDeliverySchedule(
    courseId: string,
    contentItems: Omit<DeliveryItem, 'id' | 'status'>[],
    startDate: Date
  ): Promise<DeliverySchedule> {
    try {
      logger.info('Creating delivery schedule', { courseId, itemCount: contentItems.length });

      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });

      if (!course) {
        throw new Error('Course not found');
      }

      // Create delivery items with IDs and status
      const items: DeliveryItem[] = contentItems.map((item, index) => ({
        ...item,
        id: `${courseId}-item-${index}`,
        status: 'PENDING'
      }));

      // Sort by dependencies and scheduled date
      const sortedItems = this.sortByDependencies(items);

      // Calculate end date based on last item
      const endDate = sortedItems.length > 0
        ? new Date(Math.max(...sortedItems.map(item => item.scheduledDate.getTime())))
        : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      const schedule: DeliverySchedule = {
        courseId,
        contentItems: sortedItems,
        startDate,
        endDate,
        status: 'SCHEDULED',
        progress: 0
      };

      logger.info('Delivery schedule created', {
        courseId,
        itemCount: sortedItems.length,
        endDate
      });

      return schedule;
    } catch (error) {
      logger.error('Error creating delivery schedule:', error);
      throw new Error(`Failed to create schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deliver content item to course
   */
  async deliverContentItem(courseId: string, itemId: string, content: any): Promise<void> {
    try {
      logger.info('Delivering content item', { courseId, itemId });

      const course = await prisma.courseProject.findUnique({
        where: { id: courseId }
      });

      if (!course) {
        throw new Error('Course not found');
      }

      // Update course with new content based on type
      // Content delivery is tracked through the CourseModule status
      if (content.type === 'LECTURE' && content.moduleId) {
        await prisma.courseModule.update({
          where: { id: content.moduleId },
          data: { status: 'PUBLISHED' }
        });
      }

      logger.info('Content item delivered', { courseId, itemId });
    } catch (error) {
      logger.error('Error delivering content item:', error);
      throw new Error(`Failed to deliver content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Synchronize content between systems
   */
  async synchronizeContent(courseId: string): Promise<ContentSyncStatus> {
    try {
      logger.info('Synchronizing content', { courseId });

      const course = await prisma.courseProject.findUnique({
        where: { id: courseId },
        include: {
          CourseModule: true
        }
      });

      if (!course) {
        throw new Error('Course not found');
      }

      const syncErrors: string[] = [];
      let itemsSynced = 0;
      let itemsPending = 0;

      // Check modules
      if (course.CourseModule && course.CourseModule.length > 0) {
        const publishedModules = course.CourseModule.filter(m => m.status === 'PUBLISHED');
        itemsSynced += publishedModules.length;
        itemsPending += course.CourseModule.length - publishedModules.length;
      } else {
        itemsPending++;
        syncErrors.push('No modules defined');
      }

      // Check description
      if (course.description && course.description.length > 100) {
        itemsSynced++;
      } else {
        itemsPending++;
        syncErrors.push('Course description insufficient');
      }

      const lastSyncDate = new Date();
      const nextSyncDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Next day

      logger.info('Content synchronized', {
        courseId,
        itemsSynced,
        itemsPending,
        errors: syncErrors.length
      });

      return {
        courseId,
        lastSyncDate,
        itemsSynced,
        itemsPending,
        syncErrors,
        nextSyncDate
      };
    } catch (error) {
      logger.error('Error synchronizing content:', error);
      throw new Error(`Failed to synchronize: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get delivery status for a course
   */
  async getDeliveryStatus(courseId: string): Promise<DeliverySchedule | null> {
    try {
      logger.info('Getting delivery status', { courseId });

      const course = await prisma.courseProject.findUnique({
        where: { id: courseId },
        include: {
          CourseModule: true
        }
      });

      if (!course) {
        throw new Error('Course not found');
      }

      // Build current delivery status from course data
      const contentItems: DeliveryItem[] = [];

      if (course.CourseModule) {
        course.CourseModule.forEach((module: any, index: number) => {
          contentItems.push({
            id: `${courseId}-module-${index}`,
            contentType: 'LECTURE',
            title: module.title,
            scheduledDate: module.created_at,
            deliveredDate: module.status === 'PUBLISHED' ? module.updated_at : undefined,
            status: module.status === 'PUBLISHED' ? 'DELIVERED' : 'PENDING',
            dependencies: [],
            metadata: { moduleId: module.id, weekNumber: module.week_number }
          });
        });
      }

      const deliveredCount = contentItems.filter(item => item.status === 'DELIVERED').length;
      const progress = contentItems.length > 0 ? (deliveredCount / contentItems.length) * 100 : 0;

      const schedule: DeliverySchedule = {
        courseId,
        contentItems,
        startDate: course.createdAt,
        endDate: course.actualLaunchDate || course.targetLaunchDate || new Date(),
        status: progress === 100 ? 'COMPLETED' : 'IN_PROGRESS',
        progress
      };

      logger.info('Delivery status retrieved', {
        courseId,
        progress: progress.toFixed(2)
      });

      return schedule;
    } catch (error) {
      logger.error('Error getting delivery status:', error);
      throw new Error(`Failed to get status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update delivery schedule
   */
  async updateDeliverySchedule(
    courseId: string,
    updates: Partial<DeliverySchedule>
  ): Promise<DeliverySchedule> {
    try {
      logger.info('Updating delivery schedule', { courseId });

      const currentSchedule = await this.getDeliveryStatus(courseId);

      if (!currentSchedule) {
        throw new Error('No delivery schedule found');
      }

      const updatedSchedule: DeliverySchedule = {
        ...currentSchedule,
        ...updates
      };

      logger.info('Delivery schedule updated', { courseId });

      return updatedSchedule;
    } catch (error) {
      logger.error('Error updating delivery schedule:', error);
      throw new Error(`Failed to update schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get delivery metrics
   */
  async getDeliveryMetrics(): Promise<DeliveryMetrics> {
    try {
      logger.info('Calculating delivery metrics');

      const courses = await prisma.courseProject.findMany({
        where: { status: 'ACTIVE' }
      });

      let totalScheduled = 0;
      let delivered = 0;
      let pending = 0;
      let delayed = 0;
      let totalDeliveryTime = 0;
      let deliveryCount = 0;

      for (const course of courses) {
        const schedule = await this.getDeliveryStatus(course.id);
        if (schedule) {
          totalScheduled += schedule.contentItems.length;
          delivered += schedule.contentItems.filter(item => item.status === 'DELIVERED').length;
          pending += schedule.contentItems.filter(item => item.status === 'PENDING').length;

          // Calculate delivery time for completed items
          schedule.contentItems
            .filter(item => item.status === 'DELIVERED' && item.deliveredDate)
            .forEach(item => {
              const deliveryTime = item.deliveredDate!.getTime() - item.scheduledDate.getTime();
              totalDeliveryTime += deliveryTime;
              deliveryCount++;

              // Check if delayed
              if (deliveryTime > 7 * 24 * 60 * 60 * 1000) { // More than 7 days
                delayed++;
              }
            });
        }
      }

      const onTimeDeliveryRate = totalScheduled > 0
        ? ((delivered - delayed) / totalScheduled) * 100
        : 0;

      const averageDeliveryTime = deliveryCount > 0
        ? totalDeliveryTime / deliveryCount / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      logger.info('Delivery metrics calculated', {
        totalScheduled,
        delivered,
        onTimeRate: onTimeDeliveryRate.toFixed(2)
      });

      return {
        totalScheduled,
        delivered,
        pending,
        delayed,
        onTimeDeliveryRate,
        averageDeliveryTime
      };
    } catch (error) {
      logger.error('Error calculating delivery metrics:', error);
      throw new Error(`Failed to calculate metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Schedule automated content delivery
   */
  async scheduleAutomatedDelivery(
    courseId: string,
    deliveryRules: {
      frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
      startDate: Date;
      endDate?: Date;
      contentTypes: string[];
    }
  ): Promise<void> {
    try {
      logger.info('Scheduling automated delivery', { courseId, frequency: deliveryRules.frequency });

      // In a full implementation, this would set up cron jobs or scheduled tasks
      // For now, we log the scheduling
      logger.info('Automated delivery scheduled', {
        courseId,
        frequency: deliveryRules.frequency,
        startDate: deliveryRules.startDate
      });
    } catch (error) {
      logger.error('Error scheduling automated delivery:', error);
      throw new Error(`Failed to schedule delivery: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private sortByDependencies(items: DeliveryItem[]): DeliveryItem[] {
    const sorted: DeliveryItem[] = [];
    const remaining = [...items];
    const processed = new Set<string>();

    while (remaining.length > 0) {
      const canProcess = remaining.filter(item =>
        item.dependencies.every(dep => processed.has(dep))
      );

      if (canProcess.length === 0) {
        // No items can be processed - circular dependency or missing dependency
        // Add remaining items anyway
        sorted.push(...remaining);
        break;
      }

      // Sort by scheduled date
      canProcess.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

      // Add to sorted list
      sorted.push(...canProcess);

      // Mark as processed
      canProcess.forEach(item => {
        processed.add(item.id);
        const index = remaining.indexOf(item);
        if (index > -1) {
          remaining.splice(index, 1);
        }
      });
    }

    return sorted;
  }
}

export default CourseDeliveryCoordinator;
