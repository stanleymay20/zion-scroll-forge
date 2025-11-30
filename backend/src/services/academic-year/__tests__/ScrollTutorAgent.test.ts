/**
 * ScrollTutor Agent Tests
 * Tests for personalized tutoring, adaptive learning, and progress tracking
 */

import { ScrollTutorAgent } from '../ScrollTutorAgent';
import { AIGatewayService } from '../../AIGatewayService';

// Mock AIGatewayService
jest.mock('../../AIGatewayService');

// Mock Prisma with proper setup - use factory function to avoid hoisting issues
jest.mock('@prisma/client', () => {
  const mockFindUnique = jest.fn().mockResolvedValue({
    id: 'lecture-456',
    title: 'Test Lecture',
    transcript: 'Test content',
    CourseModule: {
      week_number: 1,
      course_project_id: 'course-789',
      LearningObjective: [{ description: 'Learn basics' }],
      SpiritualIntegration: [{ worldview_perspective: 'Faith and learning' }]
    },
    LectureNotes: [{ content: 'Lecture notes content' }]
  });
  
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      lecture: {
        findUnique: mockFindUnique
      }
    }))
  };
});

describe('ScrollTutorAgent', () => {
  let agent: ScrollTutorAgent;
  let mockAIGateway: jest.Mocked<AIGatewayService>;

  beforeEach(() => {
    mockAIGateway = new AIGatewayService() as jest.Mocked<AIGatewayService>;
    agent = new ScrollTutorAgent(mockAIGateway);
  });

  describe('provideTutoring', () => {
    it('should provide personalized tutoring response', async () => {
      // Mock AI response
      mockAIGateway.generateContent = jest.fn().mockResolvedValue({
        content: JSON.stringify({
          answer: 'This is a helpful explanation...',
          conceptsCovered: ['concept1', 'concept2'],
          suggestedFollowUp: ['What about...?'],
          needsClarification: false
        }),
        usage: { totalTokens: 500 }
      });

      const result = await agent.provideTutoring(
        'student-123',
        'lecture-456',
        'Can you explain this concept?'
      );

      // If the test fails, log the error for debugging
      if (!result.success) {
        console.log('Test failed with error:', result.error);
      }

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data?.answer).toContain('explanation');
        expect(result.data?.conceptsCovered).toHaveLength(2);
      }
    });

    it('should handle errors gracefully', async () => {
      mockAIGateway.generateContent = jest.fn().mockRejectedValue(
        new Error('AI service unavailable')
      );

      const result = await agent.provideTutoring(
        'student-123',
        'lecture-456',
        'Test question'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('generateAdaptiveLearningPath', () => {
    it('should generate personalized learning path', async () => {
      mockAIGateway.generateContent = jest.fn().mockResolvedValue({
        content: JSON.stringify({
          recommendedTopics: [
            {
              topicId: 'topic1',
              topicName: 'Advanced Concepts',
              priority: 'high',
              reason: 'Build on current knowledge'
            }
          ],
          nextSteps: [
            {
              stepNumber: 1,
              action: 'review',
              description: 'Review fundamentals'
            }
          ]
        }),
        usage: { totalTokens: 600 }
      });

      const result = await agent.generateAdaptiveLearningPath(
        'student-123',
        'course-789'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.recommendedTopics).toBeDefined();
      expect(result.data?.nextSteps).toBeDefined();
    });
  });

  describe('answerQuestionWithContext', () => {
    it('should answer question using lecture context', async () => {
      mockAIGateway.generateContent = jest.fn().mockResolvedValue({
        content: JSON.stringify({
          answer: 'Based on the lecture...',
          conceptsCovered: ['context-concept'],
          confidence: 0.9
        }),
        usage: { totalTokens: 400 }
      });

      const contextualQuestion = {
        question: 'What does this mean?',
        lectureContext: {
          lectureId: 'lec-1',
          title: 'Introduction',
          moduleNumber: 1,
          courseId: 'course-1',
          content: 'Lecture content here...',
          learningObjectives: ['Understand basics'],
          spiritualFocus: 'Faith and learning',
          keyTerms: ['term1'],
          examples: ['example1']
        },
        studentContext: {
          studentId: 'student-123',
          priorKnowledge: ['basic-concept'],
          currentProgress: 0.5,
          strugglingAreas: [],
          learningStyle: {
            studentId: 'student-123',
            primaryStyle: 'visual' as const,
            preferences: { visual: 0.8, auditory: 0.3, kinesthetic: 0.4, reading: 0.5 },
            pacePreference: 'moderate' as const,
            detailLevel: 'moderate' as const,
            examplePreference: 'balanced' as const,
            lastUpdated: new Date()
          },
          recentQuestions: []
        },
        difficulty: 3
      };

      const result = await agent.answerQuestionWithContext(contextualQuestion);

      expect(result.success).toBe(true);
      expect(result.data?.answer).toContain('lecture');
    });
  });

  describe('trackStudentProgress', () => {
    it('should track and aggregate progress metrics', async () => {
      // First create a session with some activity
      await agent.provideTutoring(
        'student-123',
        'lecture-456',
        'Question 1'
      );

      const result = await agent.trackStudentProgress(
        'student-123',
        'lecture-456'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.questionsAsked).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generatePracticeProblems', () => {
    it('should generate practice problems aligned with lecture', async () => {
      mockAIGateway.generateContent = jest.fn().mockResolvedValue({
        content: JSON.stringify([
          {
            problem: 'Solve this problem...',
            hint: 'Think about...',
            solution: 'The answer is...',
            learningObjective: 'Apply concepts',
            estimatedTime: 15
          }
        ]),
        usage: { totalTokens: 800 }
      });

      const result = await agent.generatePracticeProblems(
        'lecture-456',
        3,
        5
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
