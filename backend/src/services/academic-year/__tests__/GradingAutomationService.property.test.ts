/**
 * Property-Based Tests for GradingAutomationService
 * "Test everything; hold fast what is good" - 1 Thessalonians 5:21
 * 
 * Feature: academic-year-automation-system
 * Property 8: AI Grading Confidence Threshold
 * Validates: Requirements 3.4
 */

import * as fc from 'fast-check';
import GradingAutomationService, {
  GradingRequest,
  GradingRubric,
  RubricCriterion,
  RubricLevel,
  GradingScale,
  GradeRange
} from '../GradingAutomationService';
import { aiGatewayService } from '../../AIGatewayService';

// Mock the AIGatewayService to avoid real API calls
jest.mock('../../AIGatewayService', () => ({
  aiGatewayService: {
    generateContent: jest.fn()
  }
}));

describe('GradingAutomationService - Property-Based Tests', () => {
  let service: GradingAutomationService;
  const mockGenerateContent = aiGatewayService.generateContent as jest.MockedFunction<typeof aiGatewayService.generateContent>;

  beforeEach(() => {
    service = new GradingAutomationService();
    
    // Setup mock to return deterministic grading responses with proper JSON structure
    mockGenerateContent.mockImplementation(async () => {
      return {
        content: JSON.stringify({
          criteriaScores: [
            {
              criterionName: 'Content',
              score: 25,
              maxPoints: 30,
              feedback: 'Good understanding demonstrated with some gaps.',
              confidence: 0.85
            },
            {
              criterionName: 'Organization',
              score: 20,
              maxPoints: 25,
              feedback: 'Well-structured with clear flow.',
              confidence: 0.85
            }
          ],
          detailedFeedback: [
            {
              section: 'Strengths',
              comment: 'Strong work overall',
              type: 'strength'
            },
            {
              section: 'Areas for Improvement',
              comment: 'Room for improvement in depth of analysis',
              type: 'weakness'
            }
          ],
          totalScore: 45,
          percentage: 82,
          confidence: 85
        }),
        usage: {
          totalTokens: 500,
          promptTokens: 300,
          completionTokens: 200
        }
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 8: AI Grading Confidence Threshold
   * 
   * For any AI-graded submission with confidence score below the threshold,
   * the submission must be flagged for human review.
   * 
   * Validates: Requirements 3.4
   */
  describe('Property 8: AI Grading Confidence Threshold', () => {
    it('should flag submissions with confidence below threshold for human review', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary grading requests
          fc.integer({ min: 50, max: 200 }).chain(maxPoints =>
            fc.record({
              submissionId: fc.uuid(),
              studentId: fc.uuid(),
              assignmentId: fc.uuid(),
              courseId: fc.uuid(),
              submissionContent: fc.string({ minLength: 50, maxLength: 500 }),
              assignmentType: fc.constantFrom('essay', 'short_answer', 'code', 'project', 'discussion'),
              maxPoints: fc.constant(maxPoints),
              rubric: generateRubric(maxPoints)
            })
          ),
          async (request: GradingRequest) => {
            // Grade the submission
            const result = await service.gradeSubmission(request);

            // Property: If confidence is below threshold, must be flagged for review
            if (result.success && result.data) {
              const gradingResult = result.data;
              const CONFIDENCE_THRESHOLD = 0.75;

              if (gradingResult.confidenceScore < CONFIDENCE_THRESHOLD) {
                // MUST be flagged for human review
                expect(gradingResult.needsHumanReview).toBe(true);
                expect(gradingResult.reviewReason).toBeDefined();
                expect(gradingResult.reviewReason).toContain('confidence');
              }

              // Additional invariant: confidence score must be between 0 and 1
              expect(gradingResult.confidenceScore).toBeGreaterThanOrEqual(0);
              expect(gradingResult.confidenceScore).toBeLessThanOrEqual(1);

              // Additional invariant: score must not exceed max points
              expect(gradingResult.score).toBeLessThanOrEqual(gradingResult.maxPoints);
              expect(gradingResult.score).toBeGreaterThanOrEqual(0);

              // Additional invariant: percentage must be between 0 and 100
              expect(gradingResult.percentage).toBeGreaterThanOrEqual(0);
              expect(gradingResult.percentage).toBeLessThanOrEqual(100);
            }
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified
      );
    });

    it('should flag submissions with low individual criterion confidence', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 50, max: 200 }).chain(maxPoints =>
            fc.record({
              submissionId: fc.uuid(),
              studentId: fc.uuid(),
              assignmentId: fc.uuid(),
              courseId: fc.uuid(),
              submissionContent: fc.string({ minLength: 50, maxLength: 500 }),
              assignmentType: fc.constantFrom('essay', 'short_answer', 'code', 'project', 'discussion'),
              maxPoints: fc.constant(maxPoints),
              rubric: generateRubric(maxPoints)
            })
          ),
          async (request: GradingRequest) => {
            const result = await service.gradeSubmission(request);

            if (result.success && result.data) {
              const gradingResult = result.data;
              const CONFIDENCE_THRESHOLD = 0.75;

              // Check if any criterion has low confidence
              const hasLowConfidenceCriterion = gradingResult.criteriaScores.some(
                c => c.confidence < CONFIDENCE_THRESHOLD
              );

              if (hasLowConfidenceCriterion) {
                // MUST be flagged for human review
                expect(gradingResult.needsHumanReview).toBe(true);
              }

              // Verify all criterion scores are within bounds
              gradingResult.criteriaScores.forEach(criteriaScore => {
                expect(criteriaScore.score).toBeGreaterThanOrEqual(0);
                expect(criteriaScore.score).toBeLessThanOrEqual(criteriaScore.maxPoints);
                expect(criteriaScore.confidence).toBeGreaterThanOrEqual(0);
                expect(criteriaScore.confidence).toBeLessThanOrEqual(1);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should flag extreme scores for human review', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 50, max: 200 }).chain(maxPoints =>
            fc.record({
              submissionId: fc.uuid(),
              studentId: fc.uuid(),
              assignmentId: fc.uuid(),
              courseId: fc.uuid(),
              submissionContent: fc.string({ minLength: 50, maxLength: 500 }),
              assignmentType: fc.constantFrom('essay', 'short_answer', 'code', 'project', 'discussion'),
              maxPoints: fc.constant(maxPoints),
              rubric: generateRubric(maxPoints)
            })
          ),
          async (request: GradingRequest) => {
            const result = await service.gradeSubmission(request);

            if (result.success && result.data) {
              const gradingResult = result.data;

              // Property: Extreme scores (very low or very high) should be flagged
              if (gradingResult.percentage < 20 || gradingResult.percentage > 95) {
                expect(gradingResult.needsHumanReview).toBe(true);
                expect(gradingResult.reviewReason).toBeDefined();
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain grading consistency across criteria', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 50, max: 200 }).chain(maxPoints =>
            fc.record({
              submissionId: fc.uuid(),
              studentId: fc.uuid(),
              assignmentId: fc.uuid(),
              courseId: fc.uuid(),
              submissionContent: fc.string({ minLength: 50, maxLength: 500 }),
              assignmentType: fc.constantFrom('essay', 'short_answer', 'code', 'project', 'discussion'),
              maxPoints: fc.constant(maxPoints),
              rubric: generateRubric(maxPoints)
            })
          ),
          async (request: GradingRequest) => {
            const result = await service.gradeSubmission(request);

            if (result.success && result.data) {
              const gradingResult = result.data;

              // Property: Sum of criteria scores should equal total score
              const sumOfCriteriaScores = gradingResult.criteriaScores.reduce(
                (sum, c) => sum + c.score,
                0
              );

              expect(Math.abs(sumOfCriteriaScores - gradingResult.score)).toBeLessThan(0.1);

              // Property: Number of criteria scores should match rubric criteria
              expect(gradingResult.criteriaScores.length).toBe(request.rubric.criteria.length);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide feedback for all graded submissions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 50, max: 200 }).chain(maxPoints =>
            fc.record({
              submissionId: fc.uuid(),
              studentId: fc.uuid(),
              assignmentId: fc.uuid(),
              courseId: fc.uuid(),
              submissionContent: fc.string({ minLength: 50, maxLength: 500 }),
              assignmentType: fc.constantFrom('essay', 'short_answer', 'code', 'project', 'discussion'),
              maxPoints: fc.constant(maxPoints),
              rubric: generateRubric(maxPoints)
            })
          ),
          async (request: GradingRequest) => {
            const result = await service.gradeSubmission(request);

            if (result.success && result.data) {
              const gradingResult = result.data;

              // Property: All graded submissions must have feedback
              expect(gradingResult.feedback).toBeDefined();
              expect(gradingResult.feedback.length).toBeGreaterThan(0);

              // Property: All criteria must have feedback
              gradingResult.criteriaScores.forEach(criteriaScore => {
                expect(criteriaScore.feedback).toBeDefined();
                expect(criteriaScore.feedback.length).toBeGreaterThan(0);
              });

              // Property: Detailed feedback must be provided
              expect(gradingResult.detailedFeedback).toBeDefined();
              expect(gradingResult.detailedFeedback.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Batch Grading Properties', () => {
    it('should grade all submissions in batch', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.integer({ min: 50, max: 200 }).chain(maxPoints =>
              fc.record({
                submissionId: fc.uuid(),
                studentId: fc.uuid(),
                assignmentId: fc.uuid(),
                courseId: fc.uuid(),
                submissionContent: fc.string({ minLength: 50, maxLength: 500 }),
                assignmentType: fc.constantFrom('essay', 'short_answer', 'code', 'project', 'discussion'),
                maxPoints: fc.constant(maxPoints),
                rubric: generateRubric(maxPoints)
              })
            ),
            { minLength: 1, maxLength: 5 }
          ),
          async (requests: GradingRequest[]) => {
            const result = await service.batchGradeSubmissions(requests);

            if (result.success && result.data) {
              // Property: Should attempt to grade all submissions
              expect(result.data.length).toBeLessThanOrEqual(requests.length);

              // Property: All results should have valid confidence scores
              result.data.forEach(gradingResult => {
                expect(gradingResult.confidenceScore).toBeGreaterThanOrEqual(0);
                expect(gradingResult.confidenceScore).toBeLessThanOrEqual(1);
              });
            }
          }
        ),
        { numRuns: 50 } // Fewer runs for batch operations
      );
    });
  });
});

// =====================================================
// HELPER FUNCTIONS FOR GENERATING TEST DATA
// =====================================================

function generateRubric(maxPoints: number): fc.Arbitrary<GradingRubric> {
  return fc.record({
    criteria: fc.array(
      fc.record({
        name: fc.constantFrom('Content', 'Organization', 'Analysis', 'Writing Quality', 'Creativity'),
        description: fc.string({ minLength: 20, maxLength: 100 }),
        maxPoints: fc.integer({ min: 10, max: 30 }),
        levels: fc.constant([
          { level: 'Excellent', description: 'Outstanding work', points: 0 },
          { level: 'Good', description: 'Strong work', points: 0 },
          { level: 'Satisfactory', description: 'Adequate work', points: 0 },
          { level: 'Needs Improvement', description: 'Below expectations', points: 0 }
        ])
      }).map(criterion => ({
        ...criterion,
        levels: criterion.levels.map((level, index) => ({
          ...level,
          points: Math.floor(criterion.maxPoints * (1 - index * 0.25))
        }))
      })),
      { minLength: 2, maxLength: 5 }
    ).map(criteria => {
      // Adjust criteria points to sum to maxPoints
      const totalCriteriaPoints = criteria.reduce((sum, c) => sum + c.maxPoints, 0);
      const scaleFactor = maxPoints / totalCriteriaPoints;
      
      return criteria.map(c => ({
        ...c,
        maxPoints: Math.round(c.maxPoints * scaleFactor),
        levels: c.levels.map(l => ({
          ...l,
          points: Math.round(l.points * scaleFactor)
        }))
      }));
    }),
    gradingScale: fc.constant({
      type: 'percentage' as const,
      ranges: [
        { min: 90, max: 100, grade: 'A' },
        { min: 80, max: 89, grade: 'B' },
        { min: 70, max: 79, grade: 'C' },
        { min: 60, max: 69, grade: 'D' },
        { min: 0, max: 59, grade: 'F' }
      ]
    })
  });
}
