/**
 * Property-Based Tests for CourseImprovementService
 * 
 * Tests continuous improvement system properties using fast-check
 */

import * as fc from 'fast-check';
import { PrismaClient } from '@prisma/client';
import CourseImprovementService from '../CourseImprovementService';

// Mock logger
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    course: {
      findUnique: jest.fn(),
      create: jest.fn()
    },
    user: {
      create: jest.fn()
    },
    enrollment: {
      findMany: jest.fn(),
      create: jest.fn()
    },
    courseReview: {
      findMany: jest.fn(),
      create: jest.fn()
    },
    module: {
      findMany: jest.fn(),
      findUnique: jest.fn()
    },
    lectureProgress: {
      findMany: jest.fn()
    },
    assignment: {
      findMany: jest.fn()
    },
    discussion: {
      findMany: jest.fn()
    },
    courseImprovementTask: {
      create: jest.fn(),
      findUnique: jest.fn()
    },
    contentFlag: {
      create: jest.fn(),
      findUnique: jest.fn()
    },
    notification: {
      create: jest.fn(),
      findUnique: jest.fn()
    },
    $connect: jest.fn(),
    $disconnect: jest.fn()
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

const prisma = new PrismaClient() as any;

// Test generators
const courseIdGenerator = () => fc.uuid();
const studentIdGenerator = () => fc.uuid();
const moduleIdGenerator = () => fc.uuid();
const lectureIdGenerator = () => fc.uuid();
const contentIdGenerator = () => fc.uuid();

const ratingGenerator = () => fc.integer({ min: 1, max: 5 });

const feedbackCommentGenerator = () => fc.oneof(
  fc.constant('This lecture is unclear and confusing'),
  fc.constant('Great content, very helpful'),
  fc.constant('The video has a bug and won\'t play'),
  fc.constant('This material seems outdated'),
  fc.constant('Excellent explanation of the concepts'),
  fc.constant('I don\'t understand this topic'),
  fc.constant('The assignment is broken'),
  fc.constant('Not relevant to my work'),
  fc.constant('Perfect, no issues'),
  fc.constant('')
);

const issueTypeGenerator = () => fc.constantFrom(
  'content' as const,
  'technical' as const,
  'clarity' as const,
  'relevance' as const,
  'other' as const
);

const contentTypeGenerator = () => fc.constantFrom(
  'lecture' as const,
  'notes' as const,
  'assessment' as const,
  'resource' as const
);

const flagReasonGenerator = () => fc.constantFrom(
  'age' as const,
  'external_change' as const,
  'feedback' as const,
  'technology_update' as const
);

const impactTypeGenerator = () => fc.constantFrom(
  'critical' as const,
  'high' as const,
  'medium' as const,
  'low' as const
);

const improvementGenerator = () => fc.record({
  title: fc.string({ minLength: 10, maxLength: 100 }),
  description: fc.string({ minLength: 20, maxLength: 500 }),
  affectedStudents: fc.integer({ min: 1, max: 1000 }),
  impactType: impactTypeGenerator(),
  moduleId: fc.option(moduleIdGenerator(), { nil: undefined }),
  lectureId: fc.option(lectureIdGenerator(), { nil: undefined })
});

const updateDetailsGenerator = () => fc.record({
  moduleId: fc.option(moduleIdGenerator(), { nil: undefined }),
  lectureId: fc.option(lectureIdGenerator(), { nil: undefined }),
  changeDescription: fc.string({ minLength: 20, maxLength: 200 }),
  improvementType: fc.constantFrom(
    'content_update',
    'bug_fix',
    'enhancement',
    'new_material'
  )
});

describe('CourseImprovementService Property Tests', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Feature: course-content-creation, Property 51: Live Course Feedback Collection
   * Validates: Requirements 12.1
   */
  describe('Property 51: Live Course Feedback Collection', () => {
    it('should continuously collect student feedback and analytics data for any live course', async () => {
      await fc.assert(
        fc.asyncProperty(
          courseIdGenerator(),
          fc.array(studentIdGenerator(), { minLength: 1, maxLength: 10 }),
          fc.array(ratingGenerator(), { minLength: 1, maxLength: 10 }),
          fc.array(feedbackCommentGenerator(), { minLength: 1, maxLength: 10 }),
          async (courseId, studentIds, ratings, comments) => {
            // Setup: Mock course with published status
            const mockEnrollments = studentIds.slice(0, Math.min(studentIds.length, ratings.length)).map((studentId, i) => ({
              id: `enroll_${i}`,
              studentId,
              courseId,
              status: i % 2 === 0 ? 'active' : 'completed',
              enrolledAt: new Date(),
              student: {
                id: studentId,
                email: `student${studentId}@test.com`,
                name: `Test Student ${i}`
              }
            }));

            const mockModules = [{
              id: 'module1',
              courseId,
              title: 'Test Module',
              lectures: [{
                id: 'lecture1',
                moduleId: 'module1',
                title: 'Test Lecture'
              }]
            }];

            prisma.course.findUnique.mockResolvedValue({
              id: courseId,
              code: `COURSE_${courseId.substring(0, 8)}`,
              title: 'Test Course',
              description: 'Test Description',
              status: 'published',
              credits: 3,
              level: 'intermediate',
              enrollments: mockEnrollments,
              modules: mockModules
            });

            // Mock course reviews
            const mockReviews = studentIds.slice(0, Math.min(studentIds.length, ratings.length)).map((studentId, i) => ({
              id: `review_${i}`,
              studentId,
              courseId,
              rating: ratings[i],
              comment: comments[i] || null,
              createdAt: new Date()
            }));
            prisma.courseReview.findMany.mockResolvedValue(mockReviews);

            // Mock lecture progress
            prisma.lectureProgress.findMany.mockResolvedValue([]);

            // Mock module for struggling topics
            prisma.module.findUnique.mockResolvedValue(mockModules[0]);

            // Mock assignments and discussions
            prisma.assignment.findMany.mockResolvedValue([]);
            prisma.discussion.findMany.mockResolvedValue([]);

            // Execute: Collect live feedback
            const result = await CourseImprovementService.collectLiveFeedback(courseId);

            // Verify: Feedback was collected
            expect(result.feedback).toBeDefined();
            expect(Array.isArray(result.feedback)).toBe(true);
            expect(result.feedback.length).toBeGreaterThan(0);

            // Verify: All feedback items have required fields
            result.feedback.forEach(item => {
              expect(item.courseId).toBe(courseId);
              expect(item.studentId).toBeDefined();
              expect(item.rating).toBeGreaterThanOrEqual(1);
              expect(item.rating).toBeLessThanOrEqual(5);
              expect(item.timestamp).toBeInstanceOf(Date);
              expect(['content', 'technical', 'clarity', 'relevance', 'other']).toContain(item.issueType);
            });

            // Verify: Analytics data was collected
            expect(result.analytics).toBeDefined();
            expect(result.analytics.courseId).toBe(courseId);
            expect(result.analytics.completionRate).toBeGreaterThanOrEqual(0);
            expect(result.analytics.completionRate).toBeLessThanOrEqual(100);
            expect(result.analytics.averageRating).toBeGreaterThanOrEqual(0);
            expect(result.analytics.averageRating).toBeLessThanOrEqual(5);
            expect(result.analytics.engagementMetrics).toBeDefined();
            expect(Array.isArray(result.analytics.strugglingTopics)).toBe(true);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 52: Improvement Task Creation
   * Validates: Requirements 12.2
   */
  describe('Property 52: Improvement Task Creation', () => {
    it('should create an update task with assigned priority level for any identified improvement', async () => {
      await fc.assert(
        fc.asyncProperty(
          courseIdGenerator(),
          improvementGenerator(),
          async (courseId, improvement) => {
            // Setup: Mock course
            prisma.course.findUnique.mockResolvedValue({
              id: courseId,
              code: `COURSE_${courseId.substring(0, 8)}`,
              title: 'Test Course',
              description: 'Test Description',
              status: 'published',
              credits: 3,
              level: 'intermediate'
            });

            // Mock task creation
            prisma.courseImprovementTask.create.mockImplementation(async (data) => data.data);
            prisma.courseImprovementTask.findUnique.mockImplementation(async ({ where }) => ({
              ...where,
              priority: 'high'
            }));

            // Execute: Create improvement task
            const task = await CourseImprovementService.createImprovementTask(
              courseId,
              improvement
            );

            // Verify: Task was created with all required fields
            expect(task).toBeDefined();
            expect(task.id).toBeDefined();
            expect(task.courseId).toBe(courseId);
            expect(task.title).toBe(improvement.title);
            expect(task.description).toBe(improvement.description);
            expect(task.affectedStudents).toBe(improvement.affectedStudents);
            expect(task.status).toBe('pending');
            expect(task.createdAt).toBeInstanceOf(Date);

            // Verify: Priority was assigned
            expect(['critical', 'high', 'medium', 'low']).toContain(task.priority);

            // Verify: Impact score was calculated
            expect(task.impactScore).toBeGreaterThan(0);
            expect(task.impactScore).toBe(
              improvement.affectedStudents * 
              ({ critical: 4, high: 3, medium: 2, low: 1 }[improvement.impactType])
            );

            // Verify: Due date is set for high priority tasks
            if (task.priority === 'critical' || task.priority === 'high') {
              expect(task.dueDate).toBeDefined();
              expect(task.dueDate).toBeInstanceOf(Date);
              expect(task.dueDate!.getTime()).toBeGreaterThan(Date.now());
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 53: Outdated Content Flagging
   * Validates: Requirements 12.3
   */
  describe('Property 53: Outdated Content Flagging', () => {
    it('should flag content for revision and schedule updates for any outdated content', async () => {
      await fc.assert(
        fc.asyncProperty(
          courseIdGenerator(),
          contentIdGenerator(),
          contentTypeGenerator(),
          flagReasonGenerator(),
          async (courseId, contentId, contentType, reason) => {
            // Setup: Mock course
            prisma.course.findUnique.mockResolvedValue({
              id: courseId,
              code: `COURSE_${courseId.substring(0, 8)}`,
              title: 'Test Course',
              description: 'Test Description',
              status: 'published',
              credits: 3,
              level: 'intermediate'
            });

            // Mock flag creation
            prisma.contentFlag.create.mockImplementation(async (data) => data.data);
            prisma.contentFlag.findUnique.mockImplementation(async ({ where }) => ({
              ...where,
              severity: 'urgent'
            }));

            // Execute: Flag outdated content
            const flag = await CourseImprovementService.flagOutdatedContent(
              courseId,
              contentId,
              contentType,
              reason
            );

            // Verify: Flag was created with all required fields
            expect(flag).toBeDefined();
            expect(flag.id).toBeDefined();
            expect(flag.courseId).toBe(courseId);
            expect(flag.contentId).toBe(contentId);
            expect(flag.contentType).toBe(contentType);
            expect(flag.reason).toBe(reason);
            expect(flag.flaggedAt).toBeInstanceOf(Date);

            // Verify: Severity was assigned
            expect(['urgent', 'important', 'routine']).toContain(flag.severity);

            // Verify: Update was scheduled
            expect(flag.scheduledUpdateDate).toBeDefined();
            expect(flag.scheduledUpdateDate).toBeInstanceOf(Date);
            expect(flag.scheduledUpdateDate!.getTime()).toBeGreaterThan(flag.flaggedAt.getTime());

            // Verify: Severity matches reason appropriately
            if (reason === 'external_change' || reason === 'technology_update') {
              expect(flag.severity).toBe('urgent');
            }

            // Verify: Scheduled date is appropriate for severity
            const daysDiff = Math.floor(
              (flag.scheduledUpdateDate!.getTime() - flag.flaggedAt.getTime()) / 
              (1000 * 60 * 60 * 24)
            );

            if (flag.severity === 'urgent') {
              expect(daysDiff).toBeLessThanOrEqual(7);
            } else if (flag.severity === 'important') {
              expect(daysDiff).toBeLessThanOrEqual(30);
            } else {
              expect(daysDiff).toBeLessThanOrEqual(90);
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 54: Update Notification to Students
   * Validates: Requirements 12.5
   */
  describe('Property 54: Update Notification to Students', () => {
    it('should notify all enrolled students for any content update in a live course', async () => {
      await fc.assert(
        fc.asyncProperty(
          courseIdGenerator(),
          fc.array(studentIdGenerator(), { minLength: 1, maxLength: 10 }),
          updateDetailsGenerator(),
          async (courseId, studentIds, updateDetails) => {
            // Setup: Mock enrolled students
            const mockEnrollments = studentIds.map((studentId, i) => ({
              id: `enroll_${i}`,
              studentId,
              courseId,
              status: 'active',
              enrolledAt: new Date(),
              student: {
                id: studentId,
                email: `student${studentId}@test.com`,
                name: `Test Student ${i}`
              }
            }));

            prisma.enrollment.findMany.mockResolvedValue(mockEnrollments);

            // Mock notification creation
            prisma.notification.create.mockImplementation(async (data) => data.data);
            prisma.notification.findUnique.mockImplementation(async ({ where }) => ({
              ...where,
              userId: 'test-student',
              type: 'content_update'
            }));

            // Execute: Notify students
            const notifications = await CourseImprovementService.notifyStudents(
              courseId,
              updateDetails
            );

            // Verify: Notifications were created for all enrolled students
            expect(notifications).toBeDefined();
            expect(Array.isArray(notifications)).toBe(true);
            expect(notifications.length).toBe(studentIds.length);

            // Verify: Each notification has required fields
            notifications.forEach((notification, index) => {
              expect(notification.id).toBeDefined();
              expect(studentIds).toContain(notification.studentId);
              expect(notification.courseId).toBe(courseId);
              expect(notification.notificationType).toBe('content_update');
              expect(notification.title).toBeDefined();
              expect(notification.title.length).toBeGreaterThan(0);
              expect(notification.message).toBeDefined();
              expect(notification.message.length).toBeGreaterThan(0);
              expect(notification.updateDetails).toEqual(updateDetails);
              expect(notification.sentAt).toBeInstanceOf(Date);
            });

            // Verify: All students received exactly one notification
            const uniqueStudents = new Set(notifications.map(n => n.studentId));
            expect(uniqueStudents.size).toBe(studentIds.length);
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
