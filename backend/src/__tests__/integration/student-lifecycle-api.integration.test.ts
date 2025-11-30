/**
 * Student Lifecycle API Integration Tests
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

describe('Student Lifecycle API Integration Tests', () => {
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

    it('should add spiritual evaluation to application', async () => {
      const response = await request(app)
        .post('/api/student-lifecycle/admissions/spiritual-evaluation')
        .send({
          applicationId: 'test_app_001',
          evaluation: {
            evaluatorId: 'evaluator_001',
            spiritualMaturity: 85,
            callingClarity: 90,
            ministryExperience: 75,
            biblicalKnowledge: 88,
            characterAssessment: 'Strong spiritual foundation',
            recommendations: 'Highly recommended for admission'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fetch admission statistics', async () => {
      const response = await request(app)
        .get('/api/student-lifecycle/admissions/statistics');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalApplications');
      expect(response.body.data).toHaveProperty('acceptanceRate');
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
      expect(response.body.data).toHaveProperty('hasFinancialHold');
    });

    it('should return 400 when validation parameters are missing', async () => {
      const response = await request(app)
        .get('/api/student-lifecycle/registration/validation')
        .query({
          studentId: 'student_001'
          // Missing courseId and semesterId
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
      
      // Check that each registration result has required fields
      response.body.data.forEach((result: any) => {
        expect(result).toHaveProperty('registrationId');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('nextSteps');
      });
    });

    it('should return 400 when enrollment parameters are missing', async () => {
      const response = await request(app)
        .post('/api/student-lifecycle/registration/enroll')
        .send({
          studentId: 'student_001'
          // Missing courseIds and semesterId
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when courseIds is not an array', async () => {
      const response = await request(app)
        .post('/api/student-lifecycle/registration/enroll')
        .send({
          studentId: 'student_001',
          courseIds: 'not_an_array',
          semesterId: 'semester_001'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('array');
    });

    it('should fetch course capacity information', async () => {
      const response = await request(app)
        .get('/api/student-lifecycle/registration/capacity')
        .query({
          courseId: 'course_001',
          semesterId: 'semester_001'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('maxCapacity');
      expect(response.body.data).toHaveProperty('currentEnrollment');
      expect(response.body.data).toHaveProperty('availableSpots');
      expect(response.body.data).toHaveProperty('waitlistCount');
    });

    it('should fetch waitlist information', async () => {
      const response = await request(app)
        .get('/api/student-lifecycle/registration/waitlist')
        .query({
          studentId: 'student_001',
          courseId: 'course_001',
          semesterId: 'semester_001'
        });

      // Can be 200 (found) or 404 (not on waitlist)
      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('position');
        expect(response.body.data).toHaveProperty('addedAt');
      } else {
        expect(response.body.success).toBe(false);
      }
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
      expect(response.body.data).toHaveProperty('totalCreditsRemaining');
      expect(response.body.data).toHaveProperty('currentGPA');
      expect(response.body.data).toHaveProperty('requirementsFulfilled');
      expect(response.body.data).toHaveProperty('requirementsRemaining');
      expect(response.body.data).toHaveProperty('overallCompletionPercentage');
      expect(response.body.data).toHaveProperty('isEligibleForGraduation');
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
      expect(response.body.data).toHaveProperty('blockers');
      expect(response.body.data).toHaveProperty('requirements');
      expect(response.body.data).toHaveProperty('recommendedActions');
      expect(response.body.data).toHaveProperty('evaluationDate');
      
      // Check requirements structure
      expect(response.body.data.requirements).toHaveProperty('creditsCompleted');
      expect(response.body.data.requirements).toHaveProperty('gpaRequirementMet');
      expect(response.body.data.requirements).toHaveProperty('allRequirementsFulfilled');
      expect(response.body.data.requirements).toHaveProperty('noFinancialHolds');
      expect(response.body.data.requirements).toHaveProperty('noAcademicHolds');
      expect(response.body.data.requirements).toHaveProperty('noDisciplinaryHolds');
    });

    it('should return 400 when student ID is missing for graduation evaluation', async () => {
      const response = await request(app)
        .post('/api/student-lifecycle/graduation/evaluate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Student ID is required');
    });

    it('should fetch graduation timeline', async () => {
      const response = await request(app)
        .get('/api/student-lifecycle/graduation/timeline/student_001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('studentId');
      expect(response.body.data).toHaveProperty('remainingCredits');
      expect(response.body.data).toHaveProperty('estimatedSemesters');
      expect(response.body.data).toHaveProperty('estimatedGraduationDate');
      expect(response.body.data).toHaveProperty('milestones');
      expect(response.body.data).toHaveProperty('assumptions');
      
      // Check milestones structure
      expect(Array.isArray(response.body.data.milestones)).toBe(true);
      if (response.body.data.milestones.length > 0) {
        const milestone = response.body.data.milestones[0];
        expect(milestone).toHaveProperty('semesterName');
        expect(milestone).toHaveProperty('plannedCredits');
        expect(milestone).toHaveProperty('cumulativeCredits');
        expect(milestone).toHaveProperty('completionPercentage');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid student ID gracefully', async () => {
      const response = await request(app)
        .get('/api/student-lifecycle/students/invalid_id/degree-audit');

      // Should return 500 with error message
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle missing query parameters', async () => {
      const response = await request(app)
        .get('/api/student-lifecycle/registration/capacity');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle empty course IDs array', async () => {
      const response = await request(app)
        .post('/api/student-lifecycle/registration/enroll')
        .send({
          studentId: 'student_001',
          courseIds: [],
          semesterId: 'semester_001'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('non-empty');
    });
  });

  describe('Complete Student Lifecycle Flow', () => {
    /**
     * Test complete flow from admission to graduation
     * Requirements: 2.1, 2.2, 2.3, 2.5
     */
    it('should complete full student lifecycle', async () => {
      // Step 1: Process admission
      const admissionResponse = await request(app)
        .post('/api/student-lifecycle/admissions/applications')
        .send({
          applicationId: 'lifecycle_test_001'
        });

      expect(admissionResponse.status).toBe(200);

      // Step 2: Validate registration eligibility
      const validationResponse = await request(app)
        .get('/api/student-lifecycle/registration/validation')
        .query({
          studentId: 'student_lifecycle_001',
          courseId: 'course_001',
          semesterId: 'semester_001'
        });

      expect(validationResponse.status).toBe(200);

      // Step 3: Register for courses
      const registrationResponse = await request(app)
        .post('/api/student-lifecycle/registration/enroll')
        .send({
          studentId: 'student_lifecycle_001',
          courseIds: ['course_001'],
          semesterId: 'semester_001'
        });

      expect(registrationResponse.status).toBeGreaterThanOrEqual(200);
      expect(registrationResponse.status).toBeLessThan(300);

      // Step 4: Check degree audit
      const auditResponse = await request(app)
        .get('/api/student-lifecycle/students/student_lifecycle_001/degree-audit');

      expect(auditResponse.status).toBe(200);

      // Step 5: Evaluate graduation eligibility
      const graduationResponse = await request(app)
        .post('/api/student-lifecycle/graduation/evaluate')
        .send({
          studentId: 'student_lifecycle_001'
        });

      expect(graduationResponse.status).toBe(200);
      expect(graduationResponse.body.data).toHaveProperty('isEligible');
    });
  });
});
