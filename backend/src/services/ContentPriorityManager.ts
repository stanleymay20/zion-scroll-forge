/**
 * Content Priority Manager
 * "Let wisdom guide the order, that first things may be first"
 * 
 * Manages content creation priorities based on curriculum planning,
 * enrollment data, and strategic goals. Ensures critical content
 * is created first and resources are allocated efficiently.
 * 
 * Requirements: 10.1, 10.2
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface PriorityScore {
  courseId: string;
  courseTitle: string;
  score: number;
  factors: {
    enrollmentDemand: number;
    strategicImportance: number;
    contentCompleteness: number;
    facultyAvailability: number;
    deadline: number;
  };
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
}

export interface PriorityQueue {
  critical: PriorityScore[];
  high: PriorityScore[];
  medium: PriorityScore[];
  low: PriorityScore[];
  totalItems: number;
}

export interface ResourceAllocation {
  courseId: string;
  contentType: string;
  estimatedHours: number;
  estimatedCost: number;
  assignedTeam: string[];
  startDate: Date;
  targetCompletionDate: Date;
  dependencies: string[];
}

export default class ContentPriorityManager {
  /**
   * Calculate priority score for a course
   */
  async calculatePriorityScore(courseId: string): Promise<PriorityScore> {
    try {
      logger.info('Calculating priority score', { courseId });

      const course = await prisma.courseProject.findUnique({
        where: { id: courseId },
        include: {
          CourseModule: true,
          PilotProgram: {
            include: {
              PilotStudent: true
            }
          }
        }
      });

      if (!course) {
        throw new Error('Course not found');
      }

      // Calculate enrollment demand (0-100)
      const enrollmentCount = course.PilotProgram.reduce((sum, pilot) => sum + pilot.PilotStudent.length, 0);
      const enrollmentDemand = Math.min(100, enrollmentCount * 5);

      // Calculate strategic importance (0-100)
      const strategicImportance = this.calculateStrategicImportance(course);

      // Calculate content completeness (0-100)
      const contentCompleteness = this.calculateContentCompleteness(course);

      // Calculate faculty availability (0-100)
      const facultyAvailability = 80; // Simplified - would check faculty schedule

      // Calculate deadline urgency (0-100)
      const deadline = course.targetLaunchDate
        ? Math.max(0, 100 - Math.floor((Date.now() - course.targetLaunchDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 50;

      // Calculate weighted score
      const score =
        enrollmentDemand * 0.3 +
        strategicImportance * 0.25 +
        (100 - contentCompleteness) * 0.25 + // Inverse - less complete = higher priority
        facultyAvailability * 0.1 +
        deadline * 0.1;

      // Determine priority level
      let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      if (score >= 80) priority = 'CRITICAL';
      else if (score >= 60) priority = 'HIGH';
      else if (score >= 40) priority = 'MEDIUM';
      else priority = 'LOW';

      // Generate recommendation
      const recommendedAction = this.generateRecommendation(priority, contentCompleteness);

      logger.info('Priority score calculated', {
        courseId,
        score: score.toFixed(2),
        priority
      });

      return {
        courseId,
        courseTitle: course.title,
        score,
        factors: {
          enrollmentDemand,
          strategicImportance,
          contentCompleteness,
          facultyAvailability,
          deadline
        },
        priority,
        recommendedAction
      };
    } catch (error) {
      logger.error('Error calculating priority score:', error);
      throw new Error(`Failed to calculate priority: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get priority queue for all courses
   */
  async getPriorityQueue(): Promise<PriorityQueue> {
    try {
      logger.info('Building priority queue');

      const courses = await prisma.courseProject.findMany({
        where: { status: 'ACTIVE' }
      });

      const scores: PriorityScore[] = [];
      for (const course of courses) {
        const score = await this.calculatePriorityScore(course.id);
        scores.push(score);
      }

      // Sort by score descending
      scores.sort((a, b) => b.score - a.score);

      // Categorize by priority
      const queue: PriorityQueue = {
        critical: scores.filter(s => s.priority === 'CRITICAL'),
        high: scores.filter(s => s.priority === 'HIGH'),
        medium: scores.filter(s => s.priority === 'MEDIUM'),
        low: scores.filter(s => s.priority === 'LOW'),
        totalItems: scores.length
      };

      logger.info('Priority queue built', {
        critical: queue.critical.length,
        high: queue.high.length,
        medium: queue.medium.length,
        low: queue.low.length
      });

      return queue;
    } catch (error) {
      logger.error('Error building priority queue:', error);
      throw new Error(`Failed to build queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Allocate resources for content creation
   */
  async allocateResources(courseId: string, contentType: string): Promise<ResourceAllocation> {
    try {
      logger.info('Allocating resources', { courseId, contentType });

      const priorityScore = await this.calculatePriorityScore(courseId);

      // Estimate hours based on content type and priority
      const baseHours = {
        LECTURE: 8,
        READING: 4,
        EXERCISE: 3,
        ASSESSMENT: 6,
        MULTIMEDIA: 12,
        INTERACTIVE: 16
      };

      const estimatedHours = baseHours[contentType as keyof typeof baseHours] || 8;

      // Adjust based on priority
      const priorityMultiplier = {
        CRITICAL: 1.5, // More resources for critical items
        HIGH: 1.2,
        MEDIUM: 1.0,
        LOW: 0.8
      };

      const adjustedHours = estimatedHours * priorityMultiplier[priorityScore.priority];

      // Estimate cost ($100/hour average)
      const estimatedCost = adjustedHours * 100;

      // Assign team based on priority
      const assignedTeam = this.assignTeam(priorityScore.priority, contentType);

      // Calculate timeline
      const startDate = new Date();
      const targetCompletionDate = new Date(Date.now() + adjustedHours * 24 * 60 * 60 * 1000);

      // Identify dependencies
      const course = await prisma.courseProject.findUnique({
        where: { id: courseId }
      });

      const dependencies = course?.prerequisites || [];

      logger.info('Resources allocated', {
        courseId,
        estimatedHours: adjustedHours,
        estimatedCost
      });

      return {
        courseId,
        contentType,
        estimatedHours: adjustedHours,
        estimatedCost,
        assignedTeam,
        startDate,
        targetCompletionDate,
        dependencies
      };
    } catch (error) {
      logger.error('Error allocating resources:', error);
      throw new Error(`Failed to allocate resources: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reorder priorities based on new data
   */
  async reorderPriorities(factors: {
    enrollmentChanges?: boolean;
    deadlineChanges?: boolean;
    facultyChanges?: boolean;
  }): Promise<PriorityQueue> {
    try {
      logger.info('Reordering priorities', { factors });

      // Recalculate all priorities
      const queue = await this.getPriorityQueue();

      logger.info('Priorities reordered', {
        totalItems: queue.totalItems
      });

      return queue;
    } catch (error) {
      logger.error('Error reordering priorities:', error);
      throw new Error(`Failed to reorder priorities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get next content to create
   */
  async getNextContentToCreate(): Promise<PriorityScore | null> {
    try {
      logger.info('Getting next content to create');

      const queue = await this.getPriorityQueue();

      // Return highest priority item
      if (queue.critical.length > 0) {
        return queue.critical[0];
      } else if (queue.high.length > 0) {
        return queue.high[0];
      } else if (queue.medium.length > 0) {
        return queue.medium[0];
      } else if (queue.low.length > 0) {
        return queue.low[0];
      }

      return null;
    } catch (error) {
      logger.error('Error getting next content:', error);
      throw new Error(`Failed to get next content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private calculateStrategicImportance(course: any): number {
    // Factors that determine strategic importance:
    // - Core curriculum courses: higher importance
    // - Foundation courses: higher importance
    // - Advanced specialization: medium importance

    let importance = 50; // Base score

    // Check if it's a foundation course (no prerequisites)
    if (!course.prerequisites || course.prerequisites.length === 0) {
      importance += 20;
    }

    // Check level
    if (course.level === 'UNDERGRADUATE') {
      importance += 15; // Foundation courses are strategic
    } else if (course.level === 'GRADUATE' || course.level === 'DOCTORAL') {
      importance += 10; // Advanced courses are also important
    }

    // Check if it's active (active courses are more strategic)
    if (course.status === 'ACTIVE') {
      importance += 15;
    }

    return Math.min(100, importance);
  }

  private calculateContentCompleteness(course: any): number {
    let completeness = 0;
    const weights = {
      modules: 40,
      description: 20,
      prerequisites: 10,
      timeline: 15,
      budget: 15
    };

    if (course.CourseModule && course.CourseModule.length > 0) {
      const completeModules = course.CourseModule.filter((m: any) => m.status === 'PUBLISHED').length;
      const moduleCompleteness = (completeModules / course.CourseModule.length) * weights.modules;
      completeness += moduleCompleteness;
    }
    if (course.description && course.description.length > 100) completeness += weights.description;
    if (course.prerequisites) completeness += weights.prerequisites;
    if (course.targetLaunchDate) completeness += weights.timeline;
    if (course.Budget && course.Budget.length > 0) completeness += weights.budget;

    return completeness;
  }

  private generateRecommendation(
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    contentCompleteness: number
  ): string {
    if (priority === 'CRITICAL') {
      return 'Immediate action required - allocate maximum resources';
    } else if (priority === 'HIGH') {
      if (contentCompleteness < 50) {
        return 'High priority - focus on completing core content first';
      }
      return 'High priority - schedule for next sprint';
    } else if (priority === 'MEDIUM') {
      return 'Medium priority - include in quarterly planning';
    } else {
      return 'Low priority - defer to future planning cycle';
    }
  }

  private assignTeam(
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    contentType: string
  ): string[] {
    const team: string[] = [];

    // Always include content creator
    team.push('content-creator');

    // Add specialists based on content type
    if (contentType === 'MULTIMEDIA' || contentType === 'INTERACTIVE') {
      team.push('multimedia-specialist');
    }

    if (contentType === 'ASSESSMENT') {
      team.push('assessment-designer');
    }

    // Add reviewers based on priority
    if (priority === 'CRITICAL' || priority === 'HIGH') {
      team.push('senior-reviewer');
      team.push('spiritual-alignment-validator');
    }

    // Add faculty for all content
    team.push('faculty-expert');

    return team;
  }
}
