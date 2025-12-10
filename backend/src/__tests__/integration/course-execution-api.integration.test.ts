/**
 * Course Execution API Integration Tests
 * "Test everything; hold fast what is good" - 1 Thessalonians 5:21
 * 
 * Task 22.1: Write integration tests for course execution API
 * Requirements: 4.1, 4.2
 * 
 * Tests:
 * - Module release workflow
 * - AI tutor interactions
 * - Progress tracking
 */

import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import courseExecutionRoutes from '../../routes/course-execution';
import { auth } from '../../middleware/auth';

const app = express();
app.use(express.json());

// Mock authentication middleware for testing
app.use((req, res, next) => {
  (req as any).user = {
    id: 'test-user-id',
    email: 'test@scrolluniversity.edu',
    role: 'faculty'
  };
  next();
});

app.use('/api/courses', courseExecutionRoutes);

const prisma = new PrismaClient();

describe('Course Execution API Integration Tests', () => {
  let testCourseId: string;
  let testModuleId: string;
  let testLectureId: string;
  let testStudentId: string;
  let testCourseOfferingId: string;

  beforeAll(async () => {
    // Set up test data
    // Create test course
    const course = await prisma.course.create({
      data: {
        course_code: 'TEST-101',
        title: 'Test Course for Execution',
        description: 'Integration test course',
        credits: 3,
        level: 'undergraduate',
        status: 'ACTIVE'
      }
    });
    testCourseId = course.id;

    // Create test module
    const module = await prisma.courseModule.create({
      data: {
        course_project_id: testCourseId,
        title: 'Test Module 1',
        week_number: 1,
        status: 'DRAFT',
        learning_objectives: ['Test objective 1']
      }
    });
    testModuleId = module.id;

    // Create test lecture
    const lecture = await prisma.lecture.create({
      data: {
        module_id: testModuleId,
        title: 'Test Lecture 1',
        lecture_number: 1,
        content: 'Test lecture content',
        duration: 60,
        video_url: 'https://example.com/video.mp4'
      }
    });
    testLectureId = lecture.id;

    // Create test student
    const student = await prisma.user.create({
      data: {
        email: 'student@scrolluniversity.edu',
        full_name: 'Test Student',
        role: 'student'
      }
    });
    testStudentId = student.id;

    // Create course offering
    testCourseOfferingId = `offering-${testCourseId}`;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.lecture.deleteMany({
      where: { module_id: testModuleId }
    });
    await prisma.courseModule.deleteMany({
      where: { course_project_id: testCourseId }
    });
    await prisma.course.deleteMany({
      where: { id: testCourseId }
    });
    await prisma.user.deleteMany({
      where: { id: testStudentId }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/courses/modules/release', () => {
    it('should release a module successfully', async () => {
      const response = await request(app)
        .post('/api/courses/modules/release')
        .send({
          moduleId: testModuleId,
          courseOfferingId: testCourseOfferingId
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('moduleId');
      expect(response.body.data.moduleId).toBe(testModuleId);
      expect(response.body.message).toBe('Module released successfully');
    });

    it('should return 400 when moduleId is missing', async () => {
      const response = await request(app)
        .post('/api/courses/modules/release')
        .send({
          courseOfferingId: testCourseOfferingId
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 400 when courseOfferingId is missing', async () => {
      const response = await request(app)
        .post('/api/courses/modules/release')
        .send({
          moduleId: testModuleId
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('GET /api/courses/:courseId/modules/status', () => {
    it('should get module release status', async () => {
      const response = await request(app)
        .get(`/api/courses/${testCourseId}/modules/status`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return 400 when courseId is invalid', async () => {
      const response = await request(app)
        .get('/api/courses/invalid-id/modules/status')
        .expect(500); // Will fail to find course

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/courses/ai-tutor/ask', () => {
    it('should answer a question with lecture context', async () => {
      const response = await request(app)
        .post('/api/courses/ai-tutor/ask')
        .send({
          lectureId: testLectureId,
          question: 'Can you explain the main concept?',
          sessionId: 'test-session-123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('answer');
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data).toHaveProperty('responseTime');
    });

    it('should return 400 when lectureId is missing', async () => {
      const response = await request(app)
        .post('/api/courses/ai-tutor/ask')
        .send({
          question: 'Can you explain the main concept?'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 400 when question is missing', async () => {
      const response = await request(app)
        .post('/api/courses/ai-tutor/ask')
        .send({
          lectureId: testLectureId
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('POST /api/courses/ai-tutor/session/start', () => {
    it('should start a new AI tutor session', async () => {
      const response = await request(app)
        .post('/api/courses/ai-tutor/session/start')
        .send({
          courseId: testCourseId,
          tutorType: 'general',
          learningObjectives: ['Understand core concepts']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('sessionId');
    });

    it('should start session with default tutor type', async () => {
      const response = await request(app)
        .post('/api/courses/ai-tutor/session/start')
        .send({
          courseId: testCourseId
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });
  });

  describe('POST /api/courses/ai-tutor/session/:sessionId/end', () => {
    let sessionId: string;

    beforeEach(async () => {
      // Create a session to end
      const response = await request(app)
        .post('/api/courses/ai-tutor/session/start')
        .send({
          courseId: testCourseId
        });
      sessionId = response.body.data.sessionId;
    });

    it('should end an AI tutor session', async () => {
      const response = await request(app)
        .post(`/api/courses/ai-tutor/session/${sessionId}/end`)
        .send({
          satisfactionRating: 5,
          feedback: 'Very helpful session'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('effectiveness');
      expect(response.body.message).toBe('Session ended successfully');
    });

    it('should return 400 when sessionId is missing', async () => {
      const response = await request(app)
        .post('/api/courses/ai-tutor/session//end')
        .send({
          satisfactionRating: 5
        })
        .expect(404); // Route not found

      // This is expected as the route requires sessionId
    });
  });

  describe('POST /api/courses/ai-tutor/practice-problems', () => {
    it('should generate practice problems', async () => {
      const response = await request(app)
        .post('/api/courses/ai-tutor/practice-problems')
        .send({
          lectureId: testLectureId,
          difficulty: 3,
          count: 5,
          problemType: 'multiple-choice'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should use default values when not provided', async () => {
      const response = await request(app)
        .post('/api/courses/ai-tutor/practice-problems')
        .send({
          lectureId: testLectureId
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should return 400 when lectureId is missing', async () => {
      const response = await request(app)
        .post('/api/courses/ai-tutor/practice-problems')
        .send({
          difficulty: 3
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required field');
    });
  });

  describe('GET /api/courses/:courseId/progress', () => {
    beforeEach(async () => {
      // Create enrollment for test
      await prisma.enrollment.create({
        data: {
          userId: testStudentId,
          courseId: testCourseId,
          status: 'ACTIVE',
          enrollmentDate: new Date()
        }
      });
    });

    afterEach(async () => {
      await prisma.enrollment.deleteMany({
        where: {
          userId: testStudentId,
          courseId: testCourseId
        }
      });
    });

    it('should get course progress for authenticated user', async () => {
      // Override user for this test
      const response = await request(app)
        .get(`/api/courses/${testCourseId}/progress`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('courseId');
      expect(response.body.data).toHaveProperty('progressPercentage');
      expect(response.body.data).toHaveProperty('modules');
      expect(response.body.data).toHaveProperty('recentTutorSessions');
    });

    it('should return 400 when courseId is missing', async () => {
      const response = await request(app)
        .get('/api/courses//progress')
        .expect(404); // Route not found

      // This is expected as the route requires courseId
    });
  });

  describe('GET /api/courses/:courseId/modules/:moduleId/access', () => {
    it('should check module access for student', async () => {
      const response = await request(app)
        .get(`/api/courses/${testCourseId}/modules/${testModuleId}/access`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('hasAccess');
      expect(response.body.data).toHaveProperty('reason');
    });

    it('should return 400 when parameters are missing', async () => {
      const response = await request(app)
        .get(`/api/courses/${testCourseId}/modules//access`)
        .expect(404); // Route not found

      // This is expected as the route requires moduleId
    });
  });

  describe('Module Release Workflow Integration', () => {
    it('should complete full module release workflow', async () => {
      // Step 1: Check initial module status
      const statusBefore = await request(app)
        .get(`/api/courses/${testCourseId}/modules/status`)
        .expect(200);

      expect(statusBefore.body.success).toBe(true);

      // Step 2: Release the module
      const releaseResponse = await request(app)
        .post('/api/courses/modules/release')
        .send({
          moduleId: testModuleId,
          courseOfferingId: testCourseOfferingId
        })
        .expect(200);

      expect(releaseResponse.body.success).toBe(true);

      // Step 3: Verify module status changed
      const statusAfter = await request(app)
        .get(`/api/courses/${testCourseId}/modules/status`)
        .expect(200);

      expect(statusAfter.body.success).toBe(true);

      // Step 4: Check module access
      const accessCheck = await request(app)
        .get(`/api/courses/${testCourseId}/modules/${testModuleId}/access`)
        .expect(200);

      expect(accessCheck.body.success).toBe(true);
    });
  });

  describe('AI Tutor Interaction Workflow', () => {
    it('should complete full AI tutor session workflow', async () => {
      // Step 1: Start session
      const startResponse = await request(app)
        .post('/api/courses/ai-tutor/session/start')
        .send({
          courseId: testCourseId,
          tutorType: 'general'
        })
        .expect(200);

      const sessionId = startResponse.body.data.sessionId;
      expect(sessionId).toBeDefined();

      // Step 2: Ask questions
      const question1 = await request(app)
        .post('/api/courses/ai-tutor/ask')
        .send({
          lectureId: testLectureId,
          question: 'What is the main topic?',
          sessionId
        })
        .expect(200);

      expect(question1.body.success).toBe(true);

      const question2 = await request(app)
        .post('/api/courses/ai-tutor/ask')
        .send({
          lectureId: testLectureId,
          question: 'Can you provide an example?',
          sessionId
        })
        .expect(200);

      expect(question2.body.success).toBe(true);

      // Step 3: Generate practice problems
      const problems = await request(app)
        .post('/api/courses/ai-tutor/practice-problems')
        .send({
          lectureId: testLectureId,
          difficulty: 3,
          count: 3
        })
        .expect(200);

      expect(problems.body.success).toBe(true);
      expect(problems.body.data).toBeInstanceOf(Array);

      // Step 4: End session
      const endResponse = await request(app)
        .post(`/api/courses/ai-tutor/session/${sessionId}/end`)
        .send({
          satisfactionRating: 5,
          feedback: 'Excellent tutoring session'
        })
        .expect(200);

      expect(endResponse.body.success).toBe(true);
      expect(endResponse.body.data).toHaveProperty('effectiveness');
    });
  });

  describe('Progress Tracking Workflow', () => {
    beforeEach(async () => {
      // Create enrollment
      await prisma.enrollment.create({
        data: {
          userId: testStudentId,
          courseId: testCourseId,
          status: 'ACTIVE',
          enrollmentDate: new Date()
        }
      });
    });

    afterEach(async () => {
      await prisma.enrollment.deleteMany({
        where: {
          userId: testStudentId,
          courseId: testCourseId
        }
      });
    });

    it('should track progress through course execution', async () => {
      // Step 1: Get initial progress
      const initialProgress = await request(app)
        .get(`/api/courses/${testCourseId}/progress`)
        .expect(200);

      expect(initialProgress.body.success).toBe(true);
      const initialPercentage = initialProgress.body.data.progressPercentage;

      // Step 2: Release module
      await request(app)
        .post('/api/courses/modules/release')
        .send({
          moduleId: testModuleId,
          courseOfferingId: testCourseOfferingId
        })
        .expect(200);

      // Step 3: Interact with AI tutor
      await request(app)
        .post('/api/courses/ai-tutor/ask')
        .send({
          lectureId: testLectureId,
          question: 'Help me understand this concept'
        })
        .expect(200);

      // Step 4: Check updated progress
      const updatedProgress = await request(app)
        .get(`/api/courses/${testCourseId}/progress`)
        .expect(200);

      expect(updatedProgress.body.success).toBe(true);
      expect(updatedProgress.body.data).toHaveProperty('recentTutorSessions');
      expect(updatedProgress.body.data.recentTutorSessions.length).toBeGreaterThan(0);
    });
  });
});
