/**
 * Faculty Operations API Integration Tests
 * "Test everything; hold fast what is good" - 1 Thessalonians 5:21
 * 
 * Task 18.1: Integration tests for faculty operations API
 * Tests teaching load optimization, content generation, and automated grading workflows
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import request from 'supertest';
import express from 'express';
import facultyOperationsRoutes from '../../routes/faculty-operations';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/faculty', facultyOperationsRoutes);

describe('Faculty Operations API Integration Tests', () => {
  
  // =====================================================
  // TEACHING LOAD OPTIMIZATION TESTS
  // =====================================================
  
  describe('Teaching Load Optimization', () => {
    
    it('should optimize teaching load distribution', async () => {
      const response = await request(app)
        .post('/api/faculty/teaching-load/optimize')
        .send({ semesterId: 'test-semester-123' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
      expect(response.body).toHaveProperty('message');
    });

    it('should get teaching load analysis for a faculty member', async () => {
      const facultyId = 'test-faculty-123';
      
      const response = await request(app)
        .get(`/api/faculty/teaching-load/${facultyId}`)
        .query({ semesterId: 'test-semester-123' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('facultyId', facultyId);
      expect(response.body.data).toHaveProperty('currentLoad');
      expect(response.body.data).toHaveProperty('capacity');
      expect(response.body.data).toHaveProperty('utilization');
      expect(response.body.data).toHaveProperty('availability');
    });

    it('should assign a course to a faculty member', async () => {
      const assignmentData = {
        facultyId: 'test-faculty-123',
        courseId: 'test-course-456',
        role: 'primary',
        semesterId: 'test-semester-123'
      };

      const response = await request(app)
        .post('/api/faculty/teaching-load/assign')
        .send(assignmentData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('assignmentId');
      expect(response.body.data).toHaveProperty('facultyId', assignmentData.facultyId);
      expect(response.body.data).toHaveProperty('courseId', assignmentData.courseId);
    });

    it('should return 400 when assigning course without required fields', async () => {
      const response = await request(app)
        .post('/api/faculty/teaching-load/assign')
        .send({ facultyId: 'test-faculty-123' }) // Missing courseId
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should get teaching load statistics', async () => {
      const response = await request(app)
        .get('/api/faculty/teaching-load/statistics')
        .query({ semesterId: 'test-semester-123' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('totalFaculty');
      expect(response.body.data).toHaveProperty('averageLoad');
      expect(response.body.data).toHaveProperty('utilization');
      expect(response.body.data).toHaveProperty('recommendations');
    });
  });

  // =====================================================
  // CONTENT GENERATION TESTS
  // =====================================================
  
  describe('Content Generation', () => {
    
    it('should generate a lecture plan', async () => {
      const lecturePlanRequest = {
        contentType: 'lecture-plan',
        courseId: 'test-course-123',
        moduleId: 'test-module-456',
        moduleTitle: 'Introduction to Biblical Theology',
        learningObjectives: [
          'Understand the foundations of systematic theology',
          'Apply biblical principles to modern contexts'
        ],
        targetAudience: 'Undergraduate students',
        duration: 90
      };

      const response = await request(app)
        .post('/api/faculty/content/generate')
        .send(lecturePlanRequest)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('courseId', lecturePlanRequest.courseId);
      expect(response.body.data).toHaveProperty('moduleId', lecturePlanRequest.moduleId);
      expect(response.body.data).toHaveProperty('outline');
      expect(response.body.data).toHaveProperty('spiritualFormationElements');
    });

    it('should generate an assessment', async () => {
      const assessmentRequest = {
        contentType: 'assessment',
        courseId: 'test-course-123',
        assessmentType: 'quiz',
        topics: ['Theology', 'Biblical Interpretation'],
        learningObjectives: [
          'Demonstrate understanding of theological concepts',
          'Apply hermeneutical principles'
        ],
        difficulty: 'intermediate',
        numberOfQuestions: 10,
        includeSpiritual: true
      };

      const response = await request(app)
        .post('/api/faculty/content/generate')
        .send(assessmentRequest)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('assessmentType', assessmentRequest.assessmentType);
      expect(response.body.data).toHaveProperty('questions');
      expect(response.body.data.questions.length).toBe(assessmentRequest.numberOfQuestions);
      expect(response.body.data).toHaveProperty('rubric');
    });

    it('should generate teaching materials', async () => {
      const materialsRequest = {
        contentType: 'materials',
        courseId: 'test-course-123',
        moduleId: 'test-module-456',
        materialType: 'slides'
      };

      const response = await request(app)
        .post('/api/faculty/content/generate')
        .send(materialsRequest)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(typeof response.body.data).toBe('string');
    });

    it('should return 400 when generating content without contentType', async () => {
      const response = await request(app)
        .post('/api/faculty/content/generate')
        .send({ courseId: 'test-course-123' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when generating lecture plan without required fields', async () => {
      const response = await request(app)
        .post('/api/faculty/content/generate')
        .send({
          contentType: 'lecture-plan',
          courseId: 'test-course-123'
          // Missing moduleId, moduleTitle, learningObjectives
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should use convenience endpoint for lecture plan generation', async () => {
      const lecturePlanRequest = {
        courseId: 'test-course-123',
        moduleId: 'test-module-456',
        moduleTitle: 'Introduction to Biblical Theology',
        learningObjectives: [
          'Understand the foundations of systematic theology'
        ],
        targetAudience: 'Undergraduate students',
        duration: 90
      };

      const response = await request(app)
        .post('/api/faculty/content/lecture-plan')
        .send(lecturePlanRequest)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should use convenience endpoint for assessment generation', async () => {
      const assessmentRequest = {
        courseId: 'test-course-123',
        assessmentType: 'exam',
        topics: ['Theology'],
        learningObjectives: ['Demonstrate understanding'],
        difficulty: 'advanced',
        numberOfQuestions: 5,
        includeSpiritual: true
      };

      const response = await request(app)
        .post('/api/faculty/content/assessment')
        .send(assessmentRequest)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  // =====================================================
  // AUTOMATED GRADING TESTS
  // =====================================================
  
  describe('Automated Grading Workflow', () => {
    
    it('should grade a submission with AI', async () => {
      const gradingRequest = {
        submissionId: 'test-submission-123',
        studentId: 'test-student-456',
        assignmentId: 'test-assignment-789',
        courseId: 'test-course-123',
        submissionContent: 'This is a sample essay submission discussing theological concepts...',
        rubric: {
          criteria: [
            {
              name: 'Content Understanding',
              description: 'Demonstrates understanding of key concepts',
              maxPoints: 40,
              levels: [
                { level: 'Excellent', description: 'Complete understanding', points: 40 },
                { level: 'Good', description: 'Strong understanding', points: 30 },
                { level: 'Satisfactory', description: 'Basic understanding', points: 20 },
                { level: 'Needs Improvement', description: 'Limited understanding', points: 10 }
              ]
            }
          ],
          gradingScale: {
            type: 'percentage',
            ranges: [
              { min: 90, max: 100, grade: 'A' },
              { min: 80, max: 89, grade: 'B' },
              { min: 70, max: 79, grade: 'C' },
              { min: 60, max: 69, grade: 'D' },
              { min: 0, max: 59, grade: 'F' }
            ]
          }
        },
        assignmentType: 'essay',
        maxPoints: 100
      };

      const response = await request(app)
        .post('/api/faculty/grading/automate')
        .send(gradingRequest)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('submissionId', gradingRequest.submissionId);
      expect(response.body.data).toHaveProperty('score');
      expect(response.body.data).toHaveProperty('percentage');
      expect(response.body.data).toHaveProperty('confidenceScore');
      expect(response.body.data).toHaveProperty('needsHumanReview');
      expect(response.body.data).toHaveProperty('criteriaScores');
      expect(response.body.data).toHaveProperty('feedback');
    });

    it('should flag low confidence submissions for human review', async () => {
      const gradingRequest = {
        submissionId: 'test-submission-complex',
        studentId: 'test-student-456',
        assignmentId: 'test-assignment-789',
        courseId: 'test-course-123',
        submissionContent: 'Complex philosophical argument...',
        rubric: {
          criteria: [
            {
              name: 'Critical Thinking',
              description: 'Demonstrates critical analysis',
              maxPoints: 50,
              levels: [
                { level: 'Excellent', description: 'Outstanding analysis', points: 50 }
              ]
            }
          ],
          gradingScale: {
            type: 'percentage',
            ranges: [{ min: 0, max: 100, grade: 'Pass' }]
          }
        },
        assignmentType: 'project', // More subjective, likely lower confidence
        maxPoints: 100
      };

      const response = await request(app)
        .post('/api/faculty/grading/automate')
        .send(gradingRequest)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('needsHumanReview');
      
      // Property 8: AI Grading Confidence Threshold
      // If confidence is below threshold, must be flagged for review
      if (response.body.data.confidenceScore < 0.75) {
        expect(response.body.data.needsHumanReview).toBe(true);
        expect(response.body.data).toHaveProperty('reviewReason');
      }
    });

    it('should batch grade multiple submissions', async () => {
      const batchRequest = {
        submissions: [
          {
            submissionId: 'sub-1',
            studentId: 'student-1',
            assignmentId: 'assignment-1',
            courseId: 'course-1',
            submissionContent: 'Submission 1 content',
            rubric: {
              criteria: [
                {
                  name: 'Content',
                  description: 'Content quality',
                  maxPoints: 100,
                  levels: [{ level: 'Good', description: 'Good work', points: 80 }]
                }
              ],
              gradingScale: {
                type: 'points',
                ranges: [{ min: 0, max: 100, grade: 'Pass' }]
              }
            },
            assignmentType: 'short_answer',
            maxPoints: 100
          },
          {
            submissionId: 'sub-2',
            studentId: 'student-2',
            assignmentId: 'assignment-1',
            courseId: 'course-1',
            submissionContent: 'Submission 2 content',
            rubric: {
              criteria: [
                {
                  name: 'Content',
                  description: 'Content quality',
                  maxPoints: 100,
                  levels: [{ level: 'Good', description: 'Good work', points: 80 }]
                }
              ],
              gradingScale: {
                type: 'points',
                ranges: [{ min: 0, max: 100, grade: 'Pass' }]
              }
            },
            assignmentType: 'short_answer',
            maxPoints: 100
          }
        ]
      };

      const response = await request(app)
        .post('/api/faculty/grading/batch')
        .send(batchRequest)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when grading without required fields', async () => {
      const response = await request(app)
        .post('/api/faculty/grading/automate')
        .send({
          submissionId: 'test-submission-123',
          studentId: 'test-student-456'
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when batch grading with empty array', async () => {
      const response = await request(app)
        .post('/api/faculty/grading/batch')
        .send({ submissions: [] })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should generate detailed feedback for a submission', async () => {
      const feedbackRequest = {
        submissionContent: 'Sample essay content discussing theological concepts...',
        rubric: {
          criteria: [
            {
              name: 'Content Understanding',
              description: 'Demonstrates understanding',
              maxPoints: 40,
              levels: [{ level: 'Good', description: 'Good understanding', points: 30 }]
            }
          ],
          gradingScale: {
            type: 'percentage',
            ranges: [{ min: 0, max: 100, grade: 'Pass' }]
          }
        },
        assignmentType: 'essay'
      };

      const response = await request(app)
        .post('/api/faculty/grading/feedback')
        .send(feedbackRequest)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(typeof response.body.data).toBe('string');
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 400 when generating feedback without required fields', async () => {
      const response = await request(app)
        .post('/api/faculty/grading/feedback')
        .send({ submissionContent: 'Some content' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  // =====================================================
  // HEALTH CHECK TEST
  // =====================================================
  
  describe('Health Check', () => {
    
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/faculty/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('teachingLoad');
      expect(response.body.endpoints).toHaveProperty('contentGeneration');
      expect(response.body.endpoints).toHaveProperty('grading');
    });
  });

  // =====================================================
  // ERROR HANDLING TESTS
  // =====================================================
  
  describe('Error Handling', () => {
    
    it('should handle invalid content type gracefully', async () => {
      const response = await request(app)
        .post('/api/faculty/content/generate')
        .send({
          contentType: 'invalid-type',
          courseId: 'test-course-123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle missing request body gracefully', async () => {
      const response = await request(app)
        .post('/api/faculty/teaching-load/assign')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});
