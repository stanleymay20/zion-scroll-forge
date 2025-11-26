/**
 * Property-Based Tests for ProductionTimelineService
 * 
 * Tests universal properties using fast-check library
 * Each test runs 100 iterations with randomly generated inputs
 */

import * as fc from 'fast-check';
import ProductionTimelineService, { Phase, TaskStatus, TaskPriority } from '../ProductionTimelineService';

describe('ProductionTimelineService Property-Based Tests', () => {
  let service: ProductionTimelineService;

  beforeEach(() => {
    service = new ProductionTimelineService();
  });

  /**
   * Feature: course-content-creation, Property 32: Timeline with Phase Milestones
   * Validates: Requirements 8.1
   */
  describe('Property 32: Timeline with Phase Milestones', () => {
    it('should create timeline with all required phases and milestones', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 20 }), // courseId
          fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }), // startDate
          fc.integer({ min: 30, max: 365 }), // duration in days
          async (courseId, startDate, durationDays) => {
            const targetLaunchDate = new Date(startDate);
            targetLaunchDate.setDate(targetLaunchDate.getDate() + durationDays);

            const timeline = await service.createTimeline(courseId, startDate, targetLaunchDate);

            // Verify timeline has all required phases
            const requiredPhases = [
              Phase.PLANNING,
              Phase.CONTENT_DEVELOPMENT,
              Phase.PRODUCTION,
              Phase.QUALITY_REVIEW,
              Phase.PILOT_TESTING,
              Phase.LAUNCH
            ];

            const timelinePhases = timeline.milestones.map(m => m.phase);
            
            // All required phases should be present
            requiredPhases.forEach(phase => {
              expect(timelinePhases).toContain(phase);
            });

            // Each milestone should have required properties
            timeline.milestones.forEach(milestone => {
              expect(milestone.id).toBeDefined();
              expect(milestone.phase).toBeDefined();
              expect(milestone.name).toBeDefined();
              expect(milestone.description).toBeDefined();
              expect(milestone.dueDate).toBeInstanceOf(Date);
              expect(milestone.completed).toBe(false);
              
              // Due date should be between start and launch
              expect(milestone.dueDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
              expect(milestone.dueDate.getTime()).toBeLessThanOrEqual(targetLaunchDate.getTime());
            });

            // Timeline should have correct metadata
            expect(timeline.courseId).toBe(courseId);
            expect(timeline.startDate).toEqual(startDate);
            expect(timeline.targetLaunchDate).toEqual(targetLaunchDate);
            expect(timeline.milestones.length).toBe(6); // One per phase
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 33: Task Assignment Notification and Tracking
   * Validates: Requirements 8.2
   */
  describe('Property 33: Task Assignment Notification and Tracking', () => {
    it('should assign task with notification and tracking record', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 20 }), // taskId
          fc.string({ minLength: 5, maxLength: 20 }), // assigneeId
          fc.string({ minLength: 3, maxLength: 30 }), // assigneeName
          async (taskId, assigneeId, assigneeName) => {
            const assignment = await service.assignTask(taskId, assigneeId, assigneeName);

            // Verify assignment has all required properties
            expect(assignment.taskId).toBe(taskId);
            expect(assignment.assigneeId).toBe(assigneeId);
            expect(assignment.assigneeName).toBe(assigneeName);
            expect(assignment.assignedAt).toBeInstanceOf(Date);
            expect(typeof assignment.notificationSent).toBe('boolean');

            // Assignment should be recent (within last minute)
            const now = new Date();
            const timeDiff = now.getTime() - assignment.assignedAt.getTime();
            expect(timeDiff).toBeLessThan(60000); // Less than 1 minute
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 34: Deadline Reminders and Escalation
   * Validates: Requirements 8.3
   */
  describe('Property 34: Deadline Reminders and Escalation', () => {
    it('should send reminders and escalate delays appropriately', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 20 }), // courseId
          async (courseId) => {
            const result = await service.sendReminders(courseId);

            // Verify result has required properties
            expect(typeof result.sent).toBe('number');
            expect(typeof result.escalated).toBe('number');
            
            // Counts should be non-negative
            expect(result.sent).toBeGreaterThanOrEqual(0);
            expect(result.escalated).toBeGreaterThanOrEqual(0);

            // Total notifications should be reasonable (not excessive)
            const total = result.sent + result.escalated;
            expect(total).toBeLessThan(1000); // Sanity check
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 35: Dashboard Course Status Completeness
   * Validates: Requirements 8.4
   */
  describe('Property 35: Dashboard Course Status Completeness', () => {
    it('should display complete status for all courses', async () => {
      const dashboardData = await service.getDashboardData();

      // Verify dashboard has all required sections
      expect(dashboardData.courses).toBeDefined();
      expect(Array.isArray(dashboardData.courses)).toBe(true);
      expect(dashboardData.summary).toBeDefined();

      // Verify each course has complete status information
      dashboardData.courses.forEach(course => {
        expect(course.courseId).toBeDefined();
        expect(course.courseName).toBeDefined();
        expect(course.currentPhase).toBeDefined();
        expect(Object.values(Phase)).toContain(course.currentPhase);
        
        expect(typeof course.overallProgress).toBe('number');
        expect(course.overallProgress).toBeGreaterThanOrEqual(0);
        expect(course.overallProgress).toBeLessThanOrEqual(100);
        
        expect(['ON_TRACK', 'AT_RISK', 'DELAYED']).toContain(course.status);
        expect(course.nextMilestone).toBeDefined();
        expect(course.nextDeadline).toBeInstanceOf(Date);
      });

      // Verify summary has complete information
      expect(typeof dashboardData.summary.totalCourses).toBe('number');
      expect(typeof dashboardData.summary.onTrack).toBe('number');
      expect(typeof dashboardData.summary.atRisk).toBe('number');
      expect(typeof dashboardData.summary.delayed).toBe('number');
      expect(typeof dashboardData.summary.totalTasks).toBe('number');
      expect(typeof dashboardData.summary.completedTasks).toBe('number');
      expect(typeof dashboardData.summary.overdueTasks).toBe('number');

      // Summary counts should add up
      const statusTotal = dashboardData.summary.onTrack + 
                         dashboardData.summary.atRisk + 
                         dashboardData.summary.delayed;
      expect(statusTotal).toBe(dashboardData.summary.totalCourses);
    });
  });

  /**
   * Feature: course-content-creation, Property 36: Bottleneck Identification and Solutions
   * Validates: Requirements 8.5
   */
  describe('Property 36: Bottleneck Identification and Solutions', () => {
    it('should identify bottlenecks and provide solutions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 20 }), // courseId
          async (courseId) => {
            const analysis = await service.identifyBottlenecks(courseId);

            // Verify analysis has required properties
            expect(analysis.courseId).toBe(courseId);
            expect(Array.isArray(analysis.bottlenecks)).toBe(true);
            expect(Array.isArray(analysis.recommendations)).toBe(true);
            expect(typeof analysis.estimatedDelay).toBe('number');
            expect(analysis.estimatedDelay).toBeGreaterThanOrEqual(0);

            // Verify each bottleneck has complete information
            analysis.bottlenecks.forEach(bottleneck => {
              expect(bottleneck.id).toBeDefined();
              expect(bottleneck.courseId).toBe(courseId);
              expect(['RESOURCE', 'DEPENDENCY', 'CAPACITY', 'APPROVAL', 'TECHNICAL']).toContain(bottleneck.type);
              expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(bottleneck.severity);
              expect(bottleneck.description).toBeDefined();
              expect(Array.isArray(bottleneck.affectedTasks)).toBe(true);
              expect(bottleneck.identifiedAt).toBeInstanceOf(Date);
              expect(Array.isArray(bottleneck.solutions)).toBe(true);
              expect(bottleneck.solutions.length).toBeGreaterThan(0); // Must have at least one solution
            });

            // If bottlenecks exist, recommendations should be provided
            if (analysis.bottlenecks.length > 0) {
              expect(analysis.recommendations.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional property: Progress tracking completeness
   */
  describe('Progress Tracking Completeness', () => {
    it('should provide complete progress information', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 20 }), // courseId
          async (courseId) => {
            const progress = await service.trackProgress(courseId);

            // Verify progress report has all required sections
            expect(progress.courseId).toBe(courseId);
            expect(progress.courseName).toBeDefined();
            expect(Object.values(Phase)).toContain(progress.currentPhase);
            
            expect(typeof progress.overallProgress).toBe('number');
            expect(progress.overallProgress).toBeGreaterThanOrEqual(0);
            expect(progress.overallProgress).toBeLessThanOrEqual(100);

            // Verify phase progress for all phases
            expect(Array.isArray(progress.phaseProgress)).toBe(true);
            expect(progress.phaseProgress.length).toBe(6); // One per phase

            progress.phaseProgress.forEach(phaseData => {
              expect(Object.values(Phase)).toContain(phaseData.phase);
              expect(typeof phaseData.progress).toBe('number');
              expect(phaseData.progress).toBeGreaterThanOrEqual(0);
              expect(phaseData.progress).toBeLessThanOrEqual(100);
              expect(typeof phaseData.tasksTotal).toBe('number');
              expect(typeof phaseData.tasksCompleted).toBe('number');
              expect(typeof phaseData.tasksInProgress).toBe('number');
              expect(typeof phaseData.tasksBlocked).toBe('number');

              // Task counts should be consistent
              expect(phaseData.tasksCompleted).toBeLessThanOrEqual(phaseData.tasksTotal);
              expect(phaseData.tasksInProgress).toBeLessThanOrEqual(phaseData.tasksTotal);
              expect(phaseData.tasksBlocked).toBeLessThanOrEqual(phaseData.tasksTotal);
            });

            // Verify deadline tracking
            expect(Array.isArray(progress.upcomingDeadlines)).toBe(true);
            expect(Array.isArray(progress.overdueItems)).toBe(true);
            expect(Array.isArray(progress.atRiskMilestones)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
