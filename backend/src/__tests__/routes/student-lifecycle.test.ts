/**
 * Student Lifecycle API Unit Tests
 * "Test everything; hold fast what is good" - 1 Thessalonians 5:21
 * 
 * Task 13.1: Write integration tests for student lifecycle API
 * Tests admission workflow, registration with prerequisites, and graduation evaluation
 * Requirements: 2.1, 2.2, 2.3, 2.5
 */

import request from 'supertest';
import express from 'express';
import studentLifecycleRoutes from '../../routes/student-lifecycle';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/student-lifecycle', studentLifecycleRoutes);

describe('Student Lifecycle API Tests', () => {
  describe('Admission Workflow', () => {
    /**
     * Test admission application processing
     * Requirements: 2.1
     */
    it('should process admission application successfully', async () => {
      const response = await request(app)
        .post('/api/student-lifecycle/admissions/applications')
        .send({
          applicationId: 'test_app_001'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      
      if (response.body.success) {
        expect(response.body.data).toHaveProperty('decision');
        expect(response.body.data).toHaveProperty('decisionDate');
        expect(response.body.data).toHaveProperty('reasons');
      }
    });

    it('should return 400 when application ID is missing', async () => {
      const response = await request(app)
        .post('/api/student-lifecycle/admissions/applications')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Application ID is required');
    });

    it('should fetch admission application by ID', async () => {
      const response = await request(app)
        .get('/api/student-lifecycle/admissions/applications/test_app_001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('status');
    });
  });

  describe('Registration with Prerequisites', () => {
    /**
     * Test course registration with prerequisite validation
     * Requirements: 2.2, 2.3
     */
    it('should validate registration eligibility', async () => {
      const response = await request(app)
        .get('/api/student-lifecycle/registration/validation')
        .query({
          studentId: 'student_001',
          courseId: 'course_001',
          semesterId: 'semester_001'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('eligible');
      expect(response.body.data).toHaveProperty('missingPrerequisites');
      expect(response.body.data).toHaveProperty('capacityAvailable');
    });

    it('should return 400 when validation parameters are missing', async () => {
      const response = await request(app)
        .get('/api/student-lifecycle/registration/validation')
        .query({
          studentId: 'student_001'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should register student for courses', async () => {
      const response = await request(app)
        .post('/api/student-lifecycle/registration/enroll')
        .send({
          studentId: 'student_001',
          courseIds: ['course_001', 'course_002'],
          semesterId: 'semester_001'
        });

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(300);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 400 when enrollment parameters are missing', async () => {
      const response = await request(app)
        .post('/api/student-lifecycle/registration/enroll')
        .send({
          studentId: 'student_001'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Graduation Evaluation', () => {
    /**
     * Test graduation eligibility evaluation
     * Requirements: 2.5
     */
    it('should generate degree audit for student', async () => {
      const response = await request(app)
        .get('/api/student-lifecycle/students/student_001/degree-audit');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('studentId');
      expect(response.body.data).toHaveProperty('totalCreditsRequired');
      expect(response.body.data).toHaveProperty('totalCreditsEarned');
    });

    it('should evaluate graduation eligibility', async () => {
      const response = await request(app)
        .post('/api/student-lifecycle/graduation/evaluate')
        .send({
          studentId: 'student_001'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('studentId');
      expect(response.body.data).toHaveProperty('isEligible');
      expect(response.body.data).toHaveProperty('requirements');
    });

    it('should return 400 when student ID is missing', async () => {
      const response = await request(app)
        .post('/api/student-lifecycle/graduation/evaluate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
