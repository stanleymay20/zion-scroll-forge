/**
 * Curriculum Integration Service
 * "Let the curriculum flow like living water, meeting every need"
 * 
 * Integrates with the curriculum grid to identify content needs and priorities
 * for the Content Creation Engine. Coordinates between curriculum planning
 * and content generation workflows.
 * 
 * Requirements: 10.1, 10.2
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface ContentNeed {
  id: string;
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  contentType: 'LECTURE' | 'READING' | 'EXERCISE' | 'ASSESSMENT' | 'MULTIMEDIA' | 'INTERACTIVE';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  deadline: Date;
  status: 'IDENTIFIED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  requirements: {
    academicLevel: string;
    duration?: number;
    learningObjectives: string[];
    spiritualContext?: string;
    prerequisites?: string[];
  };
  metadata: Record<string, any>;
}

export interface CurriculumAnalysis {
  totalCourses: number;
  coursesNeedingContent: number;
  contentGaps: ContentNeed[];
  priorityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  estimatedWorkload: {
    totalHours: number;
    byContentType: Record<string, number>;
  };
  recommendations: string[];
}

export interface ContentSchedule {
  courseId: string;
  contentNeeds: ContentNeed[];
  suggestedStartDate: Date;
  estimatedCompletionDate: Date;
  dependencies: string[];
  resources: {
    facultyRequired: boolean;
    expertReviewRequired: boolean;
    estimatedCost: number;
  };
}

export class CurriculumIntegrationService {
  /**
   * Analyze curriculum to identify content needs
   */
  async analyzeCurriculumNeeds(): Promise<CurriculumAnalysis> {
    try {
      logger.info('Analyzing curriculum for content needs');

      // Get all active course projects
      const courses = await prisma.courseProject.findMany({
        where: { status: 'ACTIVE' },
        include: {
          CourseModule: true
        }
      });

      const contentGaps: ContentNeed[] = [];
      let critical = 0, high = 0, medium = 0, low = 0;

      // Analyze each course for content gaps
      for (const course of courses) {
        // Check for missing modules
        if (!course.CourseModule || course.CourseModule.length === 0) {
          const need: ContentNeed = {
            id: `${course.id}-modules`,
            courseId: course.id,
            courseTitle: course.title,
            contentType: 'LECTURE',
            priority: 'CRITICAL',
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
            status: 'IDENTIFIED',
            requirements: {
              academicLevel: course.level,
              learningObjectives: [],
              spiritualContext: 'Kingdom-focused education'
            },
            metadata: {
              courseCode: course.code
            }
          };
          contentGaps.push(need);
          critical++;
        }

        // Check for incomplete modules
        const incompleteModules = course.CourseModule.filter(m => m.status === 'DRAFT');
        if (incompleteModules.length > 0) {
          const need: ContentNeed = {
            id: `${course.id}-incomplete-modules`,
            courseId: course.id,
            courseTitle: course.title,
            contentType: 'MULTIMEDIA',
            priority: 'HIGH',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: 'IDENTIFIED',
            requirements: {
              academicLevel: course.level,
              learningObjectives: []
            },
            metadata: {
              courseCode: course.code,
              incompleteCount: incompleteModules.length
            }
          };
          contentGaps.push(need);
          high++;
        }

        // Check for missing description
        if (!course.description || course.description.length < 100) {
          const need: ContentNeed = {
            id: `${course.id}-description`,
            courseId: course.id,
            courseTitle: course.title,
            contentType: 'READING',
            priority: 'MEDIUM',
            deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
            status: 'IDENTIFIED',
            requirements: {
              academicLevel: course.level,
              learningObjectives: []
            },
            metadata: {
              courseCode: course.code
            }
          };
          contentGaps.push(need);
          medium++;
        }
      }

      // Calculate estimated workload
      const estimatedWorkload = {
        totalHours: contentGaps.length * 8, // Rough estimate: 8 hours per content piece
        byContentType: {
          MULTIMEDIA: contentGaps.filter(g => g.contentType === 'MULTIMEDIA').length * 12,
          READING: contentGaps.filter(g => g.contentType === 'READING').length * 6,
          EXERCISE: contentGaps.filter(g => g.contentType === 'EXERCISE').length * 4,
          ASSESSMENT: contentGaps.filter(g => g.contentType === 'ASSESSMENT').length * 8,
          INTERACTIVE: contentGaps.filter(g => g.contentType === 'INTERACTIVE').length * 16
        }
      };

      // Generate recommendations
      const recommendations: string[] = [];
      if (critical > 0) {
        recommendations.push(`${critical} critical content gaps require immediate attention`);
      }
      if (high > 10) {
        recommendations.push('Consider scaling content creation team for high-priority items');
      }
      if (estimatedWorkload.totalHours > 1000) {
        recommendations.push('Large workload detected - recommend phased approach');
      }

      logger.info('Curriculum analysis complete', {
        totalGaps: contentGaps.length,
        critical,
        high,
        medium,
        low
      });

      return {
        totalCourses: courses.length,
        coursesNeedingContent: new Set(contentGaps.map(g => g.courseId)).size,
        contentGaps,
        priorityBreakdown: { critical, high, medium, low },
        estimatedWorkload,
        recommendations
      };
    } catch (error) {
      logger.error('Error analyzing curriculum needs:', error);
      throw new Error(`Failed to analyze curriculum: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get content needs for a specific course
   */
  async getCourseContentNeeds(courseId: string): Promise<ContentNeed[]> {
    try {
      logger.info('Getting content needs for course', { courseId });

      const course = await prisma.courseProject.findUnique({
        where: { id: courseId },
        include: {
          CourseModule: true
        }
      });

      if (!course) {
        throw new Error('Course not found');
      }

      const needs: ContentNeed[] = [];

      // Identify missing content
      if (!course.CourseModule || course.CourseModule.length === 0) {
        needs.push({
          id: `${courseId}-modules`,
          courseId,
          courseTitle: course.title,
          contentType: 'LECTURE',
          priority: 'CRITICAL',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'IDENTIFIED',
          requirements: {
            academicLevel: course.level,
            learningObjectives: []
          },
          metadata: { courseCode: course.code }
        });
      }

      const incompleteModules = course.CourseModule.filter(m => m.status === 'DRAFT');
      if (incompleteModules.length > 0) {
        needs.push({
          id: `${courseId}-incomplete-modules`,
          courseId,
          courseTitle: course.title,
          contentType: 'MULTIMEDIA',
          priority: 'HIGH',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'IDENTIFIED',
          requirements: {
            academicLevel: course.level,
            learningObjectives: []
          },
          metadata: { courseCode: course.code, incompleteCount: incompleteModules.length }
        });
      }

      logger.info('Content needs identified', { courseId, needsCount: needs.length });

      return needs;
    } catch (error) {
      logger.error('Error getting course content needs:', error);
      throw new Error(`Failed to get content needs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create content schedule for a course
   */
  async createContentSchedule(courseId: string): Promise<ContentSchedule> {
    try {
      logger.info('Creating content schedule', { courseId });

      const course = await prisma.courseProject.findUnique({
        where: { id: courseId }
      });

      if (!course) {
        throw new Error('Course not found');
      }

      const contentNeeds = await this.getCourseContentNeeds(courseId);

      // Sort by priority
      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      contentNeeds.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      // Calculate timeline
      const suggestedStartDate = new Date();
      const totalDays = contentNeeds.reduce((sum, need) => {
        const daysPerType = {
          MULTIMEDIA: 7,
          READING: 3,
          EXERCISE: 2,
          ASSESSMENT: 4,
          INTERACTIVE: 10,
          LECTURE: 5
        };
        return sum + (daysPerType[need.contentType] || 5);
      }, 0);

      const estimatedCompletionDate = new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000);

      // Identify dependencies
      const dependencies: string[] = [];
      if (course.prerequisites && course.prerequisites.length > 0) {
        dependencies.push(...course.prerequisites);
      }

      // Estimate resources
      const resources = {
        facultyRequired: true,
        expertReviewRequired: contentNeeds.some(n => n.priority === 'CRITICAL'),
        estimatedCost: contentNeeds.length * 500 // $500 per content piece estimate
      };

      logger.info('Content schedule created', {
        courseId,
        contentCount: contentNeeds.length,
        estimatedDays: totalDays
      });

      return {
        courseId,
        contentNeeds,
        suggestedStartDate,
        estimatedCompletionDate,
        dependencies,
        resources
      };
    } catch (error) {
      logger.error('Error creating content schedule:', error);
      throw new Error(`Failed to create schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update content need status
   */
  async updateContentNeedStatus(
    needId: string,
    status: 'IDENTIFIED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
  ): Promise<void> {
    try {
      logger.info('Updating content need status', { needId, status });

      // In a full implementation, this would update a content_needs table
      // For now, we log the status change
      logger.info('Content need status updated', { needId, status });
    } catch (error) {
      logger.error('Error updating content need status:', error);
      throw new Error(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get priority courses needing content
   */
  async getPriorityCourses(limit: number = 10): Promise<ContentSchedule[]> {
    try {
      logger.info('Getting priority courses', { limit });

      const analysis = await this.analyzeCurriculumNeeds();

      // Get unique course IDs from critical and high priority gaps
      const priorityCourseIds = new Set<string>();
      analysis.contentGaps
        .filter(gap => gap.priority === 'CRITICAL' || gap.priority === 'HIGH')
        .forEach(gap => priorityCourseIds.add(gap.courseId));

      // Create schedules for priority courses
      const schedules: ContentSchedule[] = [];
      for (const courseId of Array.from(priorityCourseIds).slice(0, limit)) {
        const schedule = await this.createContentSchedule(courseId);
        schedules.push(schedule);
      }

      logger.info('Priority courses retrieved', { count: schedules.length });

      return schedules;
    } catch (error) {
      logger.error('Error getting priority courses:', error);
      throw new Error(`Failed to get priority courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate content against curriculum requirements
   */
  async validateContentAlignment(courseId: string, contentType: string): Promise<{
    aligned: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      logger.info('Validating content alignment', { courseId, contentType });

      const course = await prisma.courseProject.findUnique({
        where: { id: courseId },
        include: {
          CourseModule: true
        }
      });

      if (!course) {
        throw new Error('Course not found');
      }

      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check basic alignment
      if (!course.CourseModule || course.CourseModule.length === 0) {
        issues.push('No modules defined for course');
        recommendations.push('Create course modules before generating content');
      }

      if (!course.description || course.description.length < 100) {
        issues.push('Course description insufficient');
        recommendations.push('Create comprehensive course description');
      }

      const incompleteModules = course.CourseModule.filter(m => m.status === 'DRAFT');
      if (incompleteModules.length > 0) {
        issues.push(`${incompleteModules.length} modules are incomplete`);
        recommendations.push('Complete all module content before publishing');
      }

      const aligned = issues.length === 0;

      logger.info('Content alignment validated', {
        courseId,
        aligned,
        issuesCount: issues.length
      });

      return {
        aligned,
        issues,
        recommendations
      };
    } catch (error) {
      logger.error('Error validating content alignment:', error);
      throw new Error(`Failed to validate alignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default CurriculumIntegrationService;
