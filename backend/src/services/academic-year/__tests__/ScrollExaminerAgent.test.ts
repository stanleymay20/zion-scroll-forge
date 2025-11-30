/**
 * ScrollExaminer Agent Tests
 * "Test everything; hold fast what is good" - 1 Thessalonians 5:21
 * 
 * Tests for ScrollExaminer agent integration
 */

import { ScrollExaminerAgent } from '../ScrollExaminerAgent';
import type {
  ExamGenerationRequest,
  AutomatedGradingRequest,
  RubricGenerationRequest,
  FeedbackGenerationRequest
} from '../ScrollExaminerAgent';

// Mock AIGatewayService
jest.mock('../../AIGatewayService', () => ({
  AIGatewayService: jest.fn().mockImplementation(() => ({
    generateContent: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        instructions: 'Complete all questions',
        questions: [
          {
            questionNumber: 1,
            type: 'multiple_choice',
            question: 'What is 2+2?',
            points: 10,
            difficulty: 'easy',
            learningObjective: 'Basic arithmetic',
            bloomLevel: 'remember',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4'
          }
        ],
        totalPoints: 10,
        estimatedDuration: 30
      }),
      usage: { totalTokens: 500 }
    })
  }))
}));

describe('ScrollExaminerAgent', () => {
  let agent: ScrollExaminerAgent;

  beforeEach(() => {
    agent = new ScrollExaminerAgent();
  });

  describe('generateExam', () => {
    it('should generate an exam successfully', async () => {
      const request: ExamGenerationRequest = {
        courseId: 'course-123',
        examType: 'midterm',
        difficulty: 'moderate',
        questionCount: 10,
        learningObjectives: [
          'Understand basic concepts',
          'Apply knowledge to problems'
        ],
        topicsCovered: ['Topic 1', 'Topic 2'],
        timeLimit: 90,
        includeSpiritual: true
      };

      const response = await agent.generateExam(request);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.questions).toHaveLength(1);
      expect(response.data?.totalPoints).toBeGreaterThan(0);
      expect(response.confidence).toBeGreaterThan(0);
    });

    it('should handle exam generation errors', async () => {
      const mockAgent = new ScrollExaminerAgent();
      (mockAgent as any).aiGateway.generateContent = jest.fn().mockRejectedValue(
        new Error('AI service unavailable')
      );

      const request: ExamGenerationRequest = {
        courseId: 'course-123',
        examType: 'quiz',
        difficulty: 'easy',
        questionCount: 5,
        learningObjectives: ['Test objective'],
        topicsCovered: ['Test topic']
      };

      const response = await mockAgent.generateExam(request);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.confidence).toBe(0);
    });
  });

  describe('gradeSubmission', () => {
    it('should grade a submission successfully', async () => {
      const mockAgent = new ScrollExaminerAgent();
      (mockAgent as any).aiGateway.generateContent = jest.fn().mockResolvedValue({
        content: JSON.stringify({
          questionGrades: [
            {
              questionId: 'q1',
              questionNumber: 1,
              score: 8,
              maxPoints: 10,
              feedback: 'Good answer',
              confidence: 0.9
            }
          ],
          overallFeedback: 'Well done overall',
          detailedFeedback: [
            {
              section: 'Strengths',
              comment: 'Clear understanding',
              type: 'strength'
            }
          ],
          confidenceScore: 0.88
        }),
        usage: { totalTokens: 600 }
      });

      const request: AutomatedGradingRequest = {
        submissionId: 'sub-123',
        studentId: 'student-456',
        examId: 'exam-789',
        answers: [
          {
            questionId: 'q1',
            answer: 'Sample answer'
          }
        ],
        rubric: {
          criteria: [
            {
              name: 'Content',
              description: 'Quality of content',
              maxPoints: 10,
              levels: [
                {
                  level: 'Excellent',
                  description: 'Outstanding work',
                  points: 10
                }
              ]
            }
          ],
          gradingScale: {
            type: 'percentage',
            ranges: [
              { min: 90, max: 100, grade: 'A' }
            ]
          },
          totalPoints: 10
        }
      };

      const response = await mockAgent.gradeSubmission(request);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.score).toBeGreaterThanOrEqual(0);
      expect(response.data?.confidenceScore).toBeGreaterThan(0);
    });

    it('should flag low confidence submissions for human review', async () => {
      const mockAgent = new ScrollExaminerAgent();
      (mockAgent as any).aiGateway.generateContent = jest.fn().mockResolvedValue({
        content: JSON.stringify({
          questionGrades: [
            {
              questionId: 'q1',
              questionNumber: 1,
              score: 5,
              maxPoints: 10,
              feedback: 'Uncertain grading',
              confidence: 0.6 // Below threshold
            }
          ],
          overallFeedback: 'Needs review',
          detailedFeedback: [],
          confidenceScore: 0.6
        }),
        usage: { totalTokens: 400 }
      });

      const request: AutomatedGradingRequest = {
        submissionId: 'sub-123',
        studentId: 'student-456',
        examId: 'exam-789',
        answers: [
          {
            questionId: 'q1',
            answer: 'Ambiguous answer'
          }
        ],
        rubric: {
          criteria: [],
          gradingScale: {
            type: 'percentage',
            ranges: []
          },
          totalPoints: 10
        }
      };

      const response = await mockAgent.gradeSubmission(request);

      expect(response.success).toBe(true);
      expect(response.data?.needsHumanReview).toBe(true);
      expect(response.data?.reviewReason).toBeDefined();
    });
  });

  describe('generateRubric', () => {
    it('should generate a rubric successfully', async () => {
      const mockAgent = new ScrollExaminerAgent();
      (mockAgent as any).aiGateway.generateContent = jest.fn().mockResolvedValue({
        content: JSON.stringify({
          criteria: [
            {
              name: 'Content Quality',
              description: 'Quality and depth of content',
              maxPoints: 40,
              levels: [
                {
                  level: 'Excellent',
                  description: 'Outstanding depth and quality',
                  points: 40
                },
                {
                  level: 'Good',
                  description: 'Good depth and quality',
                  points: 30
                }
              ]
            }
          ],
          gradingScale: {
            type: 'percentage',
            ranges: [
              { min: 90, max: 100, grade: 'A' },
              { min: 80, max: 89, grade: 'B' }
            ]
          },
          totalPoints: 100
        }),
        usage: { totalTokens: 700 }
      });

      const request: RubricGenerationRequest = {
        assessmentType: 'essay',
        learningObjectives: [
          'Demonstrate critical thinking',
          'Apply concepts effectively'
        ],
        maxPoints: 100,
        criteriaCount: 4,
        includeSpiritual: true
      };

      const response = await mockAgent.generateRubric(request);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.criteria).toBeDefined();
      expect(response.data?.totalPoints).toBe(100);
      expect(response.confidence).toBeGreaterThan(0);
    });
  });

  describe('generateFeedback', () => {
    it('should generate feedback successfully', async () => {
      const mockAgent = new ScrollExaminerAgent();
      (mockAgent as any).aiGateway.generateContent = jest.fn().mockResolvedValue({
        content: 'Excellent work! You demonstrated strong understanding...',
        usage: { totalTokens: 300 }
      });

      const request: FeedbackGenerationRequest = {
        studentId: 'student-123',
        submissionContent: 'Student submission content here',
        gradingResult: {
          submissionId: 'sub-123',
          studentId: 'student-123',
          examId: 'exam-456',
          score: 85,
          maxPoints: 100,
          percentage: 85,
          letterGrade: 'B',
          confidenceScore: 0.9,
          needsHumanReview: false,
          questionGrades: [],
          overallFeedback: 'Good work',
          detailedFeedback: [],
          gradedAt: new Date(),
          gradedBy: 'ScrollExaminer-AI'
        },
        includeSpiritual: true,
        tone: 'encouraging'
      };

      const response = await mockAgent.generateFeedback(request);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(typeof response.data).toBe('string');
      expect(response.confidence).toBeGreaterThan(0);
    });
  });
});
