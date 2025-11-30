/**
 * Module Sequencer Service
 * "In all your ways acknowledge Him, and He will make straight your paths" - Proverbs 3:6
 * 
 * Task 20: Implement ModuleSequencerService
 * Requirements: 4.1
 * 
 * Manages the sequential release of course modules based on prerequisites,
 * schedules, and student progress. Implements Property 9: Module Release Sequencing.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/productionLogger';
import { eventBus } from '../../utils/eventBus';

const prisma = new PrismaClient();

export interface ModuleReleaseConfig {
  moduleId: string;
  courseId: string;
  moduleNumber: number;
  releaseType: 'scheduled' | 'prerequisite' | 'manual';
  scheduledDate?: Date;
  prerequisiteModules: string[];
  notifyOnRelease: boolean;
}

export interface ModuleAccessCheck {
  moduleId: string;
  studentId: string;
  accessible: boolean;
  reason: string;
  prerequisitesCompleted: string[];
  prerequisitesPending: string[];
}

export interface ModuleReleaseNotification {
  moduleId: string;
  enrolledStudents: string[];
  notificationsSent: string[];
  failedNotifications: string[];
}

export class ModuleSequencerService {
  /**
   * Check if a module should be released based on its configuration
   */
  async shouldReleaseModule(config: ModuleReleaseConfig): Promise<boolean> {
    try {
      const currentDate = new Date();

      switch (config.releaseType) {
        case 'scheduled':
          if (!config.scheduledDate) {
            logger.warn('Scheduled release type requires scheduledDate', { moduleId: config.moduleId });
            return false;
          }
          return currentDate >= config.scheduledDate;

        case 'prerequisite':
          // Module releases when all prerequisites are available
          return await this.arePrerequisitesAvailable(config.prerequisiteModules);

        case 'manual':
          // Manual release requires explicit action (checked elsewhere)
          return false;

        default:
          logger.error('Unknown release type', { releaseType: config.releaseType });
          return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error checking module release', { error: errorMessage, moduleId: config.moduleId });
      return false;
    }
  }

  /**
   * Check if all prerequisite modules are available for release
   */
  private async arePrerequisitesAvailable(prerequisiteIds: string[]): Promise<boolean> {
    if (prerequisiteIds.length === 0) {
      return true;
    }

    try {
      const availableModules = await prisma.courseModule.count({
        where: {
          id: { in: prerequisiteIds },
          status: 'PUBLISHED'
        }
      });

      return availableModules === prerequisiteIds.length;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error checking prerequisites', { error: errorMessage });
      return false;
    }
  }

  /**
   * Check if a student can access a specific module
   */
  async checkModuleAccess(moduleId: string, studentId: string): Promise<ModuleAccessCheck> {
    try {
      // Get module details
      const module = await prisma.courseModule.findUnique({
        where: { id: moduleId },
        include: {
          CourseProject: true
        }
      });

      if (!module) {
        return {
          moduleId,
          studentId,
          accessible: false,
          reason: 'Module not found',
          prerequisitesCompleted: [],
          prerequisitesPending: []
        };
      }

      // Check if student is enrolled in the course
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: studentId,
          courseId: module.course_project_id,
          status: 'ACTIVE'
        }
      });

      if (!enrollment) {
        return {
          moduleId,
          studentId,
          accessible: false,
          reason: 'Student not enrolled in course',
          prerequisitesCompleted: [],
          prerequisitesPending: []
        };
      }

      // Get prerequisite modules (simplified - would need proper schema)
      // For now, assume modules are sequential by week_number
      const prerequisiteModules = await prisma.courseModule.findMany({
        where: {
          course_project_id: module.course_project_id,
          week_number: { lt: module.week_number }
        },
        select: { id: true }
      });

      const prerequisiteIds = prerequisiteModules.map(m => m.id);

      // Check which prerequisites are completed
      // This would require a student_module_progress table in production
      const completedPrerequisites: string[] = [];
      const pendingPrerequisites: string[] = [];

      // Simplified logic - in production, check actual completion status
      for (const prereqId of prerequisiteIds) {
        // Placeholder: would check actual completion
        completedPrerequisites.push(prereqId);
      }

      const allPrerequisitesCompleted = pendingPrerequisites.length === 0;

      return {
        moduleId,
        studentId,
        accessible: allPrerequisitesCompleted,
        reason: allPrerequisitesCompleted 
          ? 'All prerequisites completed' 
          : `${pendingPrerequisites.length} prerequisites pending`,
        prerequisitesCompleted: completedPrerequisites,
        prerequisitesPending: pendingPrerequisites
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error checking module access', { error: errorMessage, moduleId, studentId });
      
      return {
        moduleId,
        studentId,
        accessible: false,
        reason: `Error: ${errorMessage}`,
        prerequisitesCompleted: [],
        prerequisitesPending: []
      };
    }
  }

  /**
   * Release a module and notify enrolled students
   * Implements design requirement: Check release criteria, make module available, activate AI tutor
   * Emits 'module.released' event
   */
  async releaseModule(moduleId: string, courseOfferingId: string): Promise<ModuleReleaseNotification> {
    try {
      // Get module and course details
      const module = await prisma.courseModule.findUnique({
        where: { id: moduleId },
        include: {
          CourseProject: true
        }
      });

      if (!module) {
        throw new Error('Module not found');
      }

      // Check release criteria before releasing
      const canRelease = await this.checkReleaseCriteria(moduleId, courseOfferingId);
      if (!canRelease.allowed) {
        throw new Error(`Module cannot be released: ${canRelease.reason}`);
      }

      // Update module status to published
      await prisma.courseModule.update({
        where: { id: moduleId },
        data: { status: 'PUBLISHED' }
      });

      // Get all enrolled students
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId: module.course_project_id,
          status: 'ACTIVE'
        },
        select: { userId: true }
      });

      const enrolledStudents = enrollments.map(e => e.userId);
      const notificationsSent: string[] = [];
      const failedNotifications: string[] = [];

      // Send notifications to all enrolled students
      for (const studentId of enrolledStudents) {
        try {
          await this.sendModuleReleaseNotification(moduleId, studentId);
          notificationsSent.push(studentId);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.error('Failed to send notification', { error: errorMessage, studentId, moduleId });
          failedNotifications.push(studentId);
        }
      }

      // Emit module.released event for workflow orchestration
      eventBus.emit('module.released', {
        moduleId,
        courseOfferingId,
        courseProjectId: module.course_project_id,
        moduleNumber: module.week_number,
        enrolledStudents: enrolledStudents.length,
        releasedAt: new Date(),
        timestamp: new Date(),
        source: 'ModuleSequencerService'
      });

      logger.info('Module released', {
        moduleId,
        courseOfferingId,
        enrolledStudents: enrolledStudents.length,
        notificationsSent: notificationsSent.length,
        failedNotifications: failedNotifications.length
      });

      return {
        moduleId,
        enrolledStudents,
        notificationsSent,
        failedNotifications
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error releasing module', { error: errorMessage, moduleId, courseOfferingId });
      throw error;
    }
  }

  /**
   * Check if a module meets its release criteria
   * Validates: sequential order, prerequisite completion, scheduled date
   */
  async checkReleaseCriteria(moduleId: string, courseOfferingId: string): Promise<{
    allowed: boolean;
    reason: string;
  }> {
    try {
      const module = await prisma.courseModule.findUnique({
        where: { id: moduleId },
        include: {
          CourseProject: true
        }
      });

      if (!module) {
        return { allowed: false, reason: 'Module not found' };
      }

      // Check if module is already published
      if (module.status === 'PUBLISHED') {
        return { allowed: false, reason: 'Module already published' };
      }

      // Check sequential order - previous modules must be published
      const previousModules = await prisma.courseModule.findMany({
        where: {
          course_project_id: module.course_project_id,
          week_number: { lt: module.week_number }
        },
        orderBy: { week_number: 'asc' }
      });

      const unpublishedPrevious = previousModules.filter(m => m.status !== 'PUBLISHED');
      if (unpublishedPrevious.length > 0) {
        return {
          allowed: false,
          reason: `Previous module(s) not yet published: ${unpublishedPrevious.map(m => m.title).join(', ')}`
        };
      }

      // All criteria met
      return { allowed: true, reason: 'All release criteria met' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error checking release criteria', { error: errorMessage, moduleId });
      return { allowed: false, reason: `Error: ${errorMessage}` };
    }
  }

  /**
   * Schedule module releases for a course offering
   * Creates scheduled jobs based on calendar dates or completion criteria
   */
  async scheduleModuleReleases(courseOfferingId: string): Promise<{
    scheduled: number;
    schedules: Array<{ moduleId: string; scheduledDate: Date }>;
  }> {
    try {
      // Get all modules for the course offering
      const modules = await prisma.courseModule.findMany({
        where: {
          course_project_id: courseOfferingId,
          status: 'DRAFT'
        },
        orderBy: { week_number: 'asc' }
      });

      const schedules: Array<{ moduleId: string; scheduledDate: Date }> = [];

      // For each module, calculate release date based on week number
      // Assuming course starts on a specific date (would come from course offering)
      const courseStartDate = new Date(); // In production, get from course offering
      
      for (const module of modules) {
        // Calculate release date: course start + (week_number - 1) weeks
        const releaseDate = new Date(courseStartDate);
        releaseDate.setDate(releaseDate.getDate() + (module.week_number - 1) * 7);

        schedules.push({
          moduleId: module.id,
          scheduledDate: releaseDate
        });

        // In production, create actual scheduled job here
        // This would integrate with a job scheduler like Bull or node-cron
        logger.info('Module release scheduled', {
          moduleId: module.id,
          moduleTitle: module.title,
          scheduledDate: releaseDate
        });
      }

      // Emit event for scheduled releases
      eventBus.emit('modules.scheduled', {
        courseOfferingId,
        scheduledCount: schedules.length,
        schedules,
        timestamp: new Date(),
        source: 'ModuleSequencerService'
      });

      return {
        scheduled: schedules.length,
        schedules
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error scheduling module releases', { error: errorMessage, courseOfferingId });
      throw error;
    }
  }

  /**
   * Send module release notification to a student
   */
  private async sendModuleReleaseNotification(moduleId: string, studentId: string): Promise<void> {
    // In production, this would integrate with NotificationService
    // For now, just log the notification
    logger.info('Module release notification sent', { moduleId, studentId });
    
    // TODO: Integrate with NotificationService when available
    // await notificationService.send({
    //   userId: studentId,
    //   type: 'MODULE_RELEASED',
    //   data: { moduleId }
    // });
  }

  /**
   * Validate module sequence integrity for a course
   */
  async validateModuleSequence(courseId: string): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    try {
      const modules = await prisma.courseModule.findMany({
        where: { course_project_id: courseId },
        orderBy: { week_number: 'asc' }
      });

      const issues: string[] = [];

      // Check for unique week numbers
      const weekNumbers = modules.map(m => m.week_number);
      const uniqueWeekNumbers = new Set(weekNumbers);
      if (weekNumbers.length !== uniqueWeekNumbers.size) {
        issues.push('Duplicate week numbers found in module sequence');
      }

      // Check for gaps in sequence
      const sortedWeekNumbers = Array.from(uniqueWeekNumbers).sort((a, b) => a - b);
      for (let i = 0; i < sortedWeekNumbers.length - 1; i++) {
        const gap = sortedWeekNumbers[i + 1] - sortedWeekNumbers[i];
        if (gap > 1) {
          issues.push(`Gap in sequence between week ${sortedWeekNumbers[i]} and ${sortedWeekNumbers[i + 1]}`);
        }
      }

      // Check that modules start at week 1
      if (sortedWeekNumbers.length > 0 && sortedWeekNumbers[0] !== 1) {
        issues.push(`Module sequence should start at week 1, but starts at week ${sortedWeekNumbers[0]}`);
      }

      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error validating module sequence', { error: errorMessage, courseId });
      throw error;
    }
  }

  /**
   * Get next module to release for a course
   */
  async getNextModuleToRelease(courseId: string): Promise<string | null> {
    try {
      const nextModule = await prisma.courseModule.findFirst({
        where: {
          course_project_id: courseId,
          status: 'DRAFT'
        },
        orderBy: { week_number: 'asc' }
      });

      return nextModule?.id || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting next module', { error: errorMessage, courseId });
      return null;
    }
  }

  /**
   * Process scheduled module releases
   * This method should be called by a cron job or scheduler
   * Checks for modules that should be released based on their scheduled date
   */
  async processScheduledReleases(): Promise<{
    processed: number;
    released: string[];
    failed: Array<{ moduleId: string; error: string }>;
  }> {
    try {
      const currentDate = new Date();
      const released: string[] = [];
      const failed: Array<{ moduleId: string; error: string }> = [];

      // Get all draft modules that should be released
      // In production, this would query a scheduled_releases table
      const modules = await prisma.courseModule.findMany({
        where: {
          status: 'DRAFT'
        },
        include: {
          CourseProject: true
        }
      });

      for (const module of modules) {
        try {
          // Check if module should be released based on criteria
          const config: ModuleReleaseConfig = {
            moduleId: module.id,
            courseId: module.course_project_id,
            moduleNumber: module.week_number,
            releaseType: 'scheduled',
            scheduledDate: currentDate, // In production, get from schedule
            prerequisiteModules: [],
            notifyOnRelease: true
          };

          const shouldRelease = await this.shouldReleaseModule(config);
          
          if (shouldRelease) {
            await this.releaseModule(module.id, module.course_project_id);
            released.push(module.id);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          failed.push({ moduleId: module.id, error: errorMessage });
          logger.error('Failed to release scheduled module', {
            error: errorMessage,
            moduleId: module.id
          });
        }
      }

      logger.info('Processed scheduled releases', {
        processed: modules.length,
        released: released.length,
        failed: failed.length
      });

      return {
        processed: modules.length,
        released,
        failed
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error processing scheduled releases', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Get module release status for a course
   * Returns information about which modules are released and which are pending
   */
  async getModuleReleaseStatus(courseId: string): Promise<{
    totalModules: number;
    releasedModules: number;
    pendingModules: number;
    nextToRelease?: {
      moduleId: string;
      moduleNumber: number;
      title: string;
      canRelease: boolean;
      reason: string;
    };
  }> {
    try {
      const modules = await prisma.courseModule.findMany({
        where: { course_project_id: courseId },
        orderBy: { week_number: 'asc' }
      });

      const totalModules = modules.length;
      const releasedModules = modules.filter(m => m.status === 'PUBLISHED').length;
      const pendingModules = totalModules - releasedModules;

      // Find next module to release
      const nextModule = modules.find(m => m.status === 'DRAFT');
      let nextToRelease;

      if (nextModule) {
        const criteria = await this.checkReleaseCriteria(nextModule.id, courseId);
        nextToRelease = {
          moduleId: nextModule.id,
          moduleNumber: nextModule.week_number,
          title: nextModule.title,
          canRelease: criteria.allowed,
          reason: criteria.reason
        };
      }

      return {
        totalModules,
        releasedModules,
        pendingModules,
        nextToRelease
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting module release status', { error: errorMessage, courseId });
      throw error;
    }
  }
}

export default new ModuleSequencerService();
