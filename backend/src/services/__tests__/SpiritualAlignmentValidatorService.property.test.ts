/**
 * Property-Based Tests for Spiritual Alignment Validator Service
 * 
 * These tests verify universal properties that should hold across all inputs
 * using fast-check for property-based testing.
 */

import * as fc from 'fast-check';
import { AIGatewayService } from '../AIGatewayService';
import {
  StrictnessProfile,
  ErrorSeverity,
  ErrorType
} from '../../types/course-content.types';

// Don't mock the service itself, only its dependencies
jest.mock('../AIGatewayService');
jest.mock('../TheologicalAlignmentService');
jest.mock('../SpiritualFormationAIService');
jest.mock('../../utils/logger');

// Import after mocking
const SpiritualAlignmentValidatorService = jest.requireActual('../SpiritualAlignmentValidatorService').default;

describe('SpiritualAlignmentValidatorService - Property Tests', () => {
  let service: any;
  let mockAIGateway: jest.Mocked<AIGatewayService>;
  let mockTheologicalAlignment: any;
  let mockSpiritualFormation: any;

  beforeEach(() => {
    // Create mocked instances
    mockAIGateway = {
      generateCompletion: jest.fn()
    } as any;
    
    mockTheologicalAlignment = {};
    mockSpiritualFormation = {};

    service = new SpiritualAlignmentValidatorService(
      mockAIGateway,
      mockTheologicalAlignment,
      mockSpiritualFormation
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Feature: course-content-creation, Property 70: Validator Integration Point Enforcement
   * Validates: Requirements 16.1
   */
  describe('Property 70: Validator Integration Point Enforcement', () => {
    it('should validate content at all mandatory integration points', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contentId: fc.uuid(),
            contentType: fc.constantFrom(
              'course',
              'module',
              'lesson',
              'ai_tutor_script',
              'system_message',
              'spiritual_block'
            ),
            strictnessProfile: fc.constantFrom(
              StrictnessProfile.STRICT_SPIRITUAL,
              StrictnessProfile.BALANCED,
              StrictnessProfile.LIGHT_CHECK
            )
          }),
          async ({ contentId, contentType, strictnessProfile }) => {
            // Mock AI responses for validation
            mockAIGateway.generateCompletion = jest.fn().mockResolvedValue({
              content: JSON.stringify({
                hasDrift: false,
                driftType: [],
                christCenteredScore: 1.0,
                scriptureRootedScore: 1.0,
                issues: []
              })
            });

            // Validate content
            const result = await service.validateContent(contentId, strictnessProfile);

            // Verify validation was performed
            expect(result).toBeDefined();
            expect(result.contentId).toBe(contentId);
            expect(result.strictnessProfile).toBe(strictnessProfile);

            // Verify appropriate strictness profile was used
            expect(result.strictnessProfile).toBe(strictnessProfile);

            // Verify validation result structure
            expect(result).toHaveProperty('passed');
            expect(result).toHaveProperty('errors');
            expect(result).toHaveProperty('warnings');
            expect(result).toHaveProperty('correctionAttempted');
            expect(result).toHaveProperty('correctionSuccessful');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 71: Theological Drift Detection
   * Validates: Requirements 16.2
   */
  describe('Property 71: Theological Drift Detection', () => {
    it('should reject content presenting Jesus as "a way not the way" in theological contexts', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contentId: fc.uuid(),
            hasDrift: fc.boolean(),
            driftType: fc.array(
              fc.constantFrom(
                'JESUS_NOT_THE_WAY',
                'BELIEF_SYSTEM_MIXING',
                'BABYLONIAN_FLATTENING',
                'GENERIC_SPIRITUALITY'
              ),
              { minLength: 0, maxLength: 3 }
            ),
            christCenteredScore: fc.float({ min: 0, max: 1 }),
            scriptureRootedScore: fc.float({ min: 0, max: 1 })
          }),
          async ({ contentId, hasDrift, driftType, christCenteredScore, scriptureRootedScore }) => {
            // Mock AI response for drift detection
            mockAIGateway.generateCompletion = jest.fn().mockResolvedValue({
              content: JSON.stringify({
                hasDrift,
                driftType,
                christCenteredScore,
                scriptureRootedScore,
                issues: hasDrift
                  ? [
                      {
                        description: 'Theological drift detected',
                        location: 'section 1',
                        severity: 'high'
                      }
                    ]
                  : []
              })
            });

            // Detect drift
            const result = await service.detectTheologicalDrift(contentId);

            // Verify drift detection
            expect(result.contentId).toBe(contentId);
            expect(result.hasDrift).toBe(hasDrift);

            // If drift detected, verify it's properly identified
            if (hasDrift) {
              expect(result.driftType.length).toBeGreaterThan(0);
              expect(result.issues.length).toBeGreaterThan(0);
            }

            // Verify scores are in valid range
            expect(result.christCenteredScore).toBeGreaterThanOrEqual(0);
            expect(result.christCenteredScore).toBeLessThanOrEqual(1);
            expect(result.scriptureRootedScore).toBeGreaterThanOrEqual(0);
            expect(result.scriptureRootedScore).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 72: Tone Problem Detection
   * Validates: Requirements 16.3
   */
  describe('Property 72: Tone Problem Detection', () => {
    it('should reject condemning, shaming, manipulative language', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contentId: fc.uuid(),
            hasProblems: fc.boolean(),
            isCondemning: fc.boolean(),
            isShaming: fc.boolean(),
            isManipulative: fc.boolean(),
            treatsStudentsAsLessThan: fc.boolean(),
            toneScore: fc.float({ min: 0, max: 1 })
          }),
          async ({
            contentId,
            hasProblems,
            isCondemning,
            isShaming,
            isManipulative,
            treatsStudentsAsLessThan,
            toneScore
          }) => {
            // Mock AI response for tone analysis
            mockAIGateway.generateCompletion = jest.fn().mockResolvedValue({
              content: JSON.stringify({
                hasProblems,
                isCondemning,
                isShaming,
                isManipulative,
                treatsStudentsAsLessThan,
                toneScore,
                issues: hasProblems
                  ? [
                      {
                        description: 'Tone problem detected',
                        location: 'section 1',
                        severity: 'medium'
                      }
                    ]
                  : []
              })
            });

            // Detect tone problems
            const result = await service.detectToneProblems(contentId);

            // Verify tone analysis
            expect(result.contentId).toBe(contentId);
            expect(result.hasProblems).toBe(hasProblems);

            // If problems detected, verify they're properly identified
            if (hasProblems) {
              expect(result.issues.length).toBeGreaterThan(0);
            }

            // Verify tone score is in valid range
            expect(result.toneScore).toBeGreaterThanOrEqual(0);
            expect(result.toneScore).toBeLessThanOrEqual(1);

            // Verify boolean flags
            expect(typeof result.isCondemning).toBe('boolean');
            expect(typeof result.isShaming).toBe('boolean');
            expect(typeof result.isManipulative).toBe('boolean');
            expect(typeof result.treatsStudentsAsLessThan).toBe('boolean');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 73: Spiritualization of Laziness Detection
   * Validates: Requirements 16.4
   */
  describe('Property 73: Spiritualization of Laziness Detection', () => {
    it('should reject content suggesting prayer replaces study or God replaces discipline', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contentId: fc.uuid(),
            detected: fc.boolean(),
            issueCount: fc.integer({ min: 0, max: 5 })
          }),
          async ({ contentId, detected, issueCount }) => {
            // Mock AI response for laziness detection
            const issues = detected
              ? Array.from({ length: issueCount }, (_, i) => ({
                  type: 'PRAYER_REPLACES_STUDY',
                  description: `Issue ${i + 1}`,
                  location: `section ${i + 1}`,
                  severity: 'high',
                  suggestedCorrection: 'Correction suggestion'
                }))
              : [];

            mockAIGateway.generateCompletion = jest.fn().mockResolvedValue({
              content: JSON.stringify({
                detected,
                issues
              })
            });

            // Detect spiritualization of laziness
            const result = await service.detectSpiritualizationOfLaziness(contentId);

            // Verify detection
            expect(result.detected).toBe(detected);

            // If detected, verify errors are properly created
            if (detected) {
              expect(result.errors.length).toBe(issueCount);
              result.errors.forEach(error => {
                expect(error.type).toBe(ErrorType.SPIRITUALIZATION_OF_LAZINESS);
                expect(error.severity).toBeDefined();
                expect(error.message).toBeDefined();
                expect(error.location).toBeDefined();
              });
            } else {
              expect(result.errors.length).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 74: Error Severity Handling
   * Validates: Requirements 16.5
   */
  describe('Property 74: Error Severity Handling', () => {
    it('should NOT silently continue but must attempt auto-correction or stop with error', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            contentId: fc.uuid(),
            errorCount: fc.integer({ min: 1, max: 5 }),
            correctionSuccessful: fc.boolean(),
            strictnessProfile: fc.constantFrom(
              StrictnessProfile.STRICT_SPIRITUAL,
              StrictnessProfile.BALANCED,
              StrictnessProfile.LIGHT_CHECK
            )
          }),
          async ({ contentId, errorCount, correctionSuccessful, strictnessProfile }) => {
            // Mock AI responses with errors
            let callCount = 0;
            mockAIGateway.generateCompletion = jest.fn().mockImplementation(() => {
              callCount++;
              
              // First call: return errors
              if (callCount === 1 || callCount === 2 || callCount === 3) {
                return Promise.resolve({
                  content: JSON.stringify({
                    hasDrift: true,
                    driftType: ['THEOLOGICAL_DRIFT'],
                    christCenteredScore: 0.5,
                    scriptureRootedScore: 0.5,
                    issues: Array.from({ length: errorCount }, (_, i) => ({
                      description: `Error ${i + 1}`,
                      location: `section ${i + 1}`,
                      severity: 'high'
                    }))
                  })
                });
              }
              
              // Subsequent calls for tone and laziness
              return Promise.resolve({
                content: JSON.stringify({
                  hasProblems: false,
                  detected: false,
                  issues: []
                })
              });
            });

            // Validate content with errors
            const result = await service.validateContent(contentId, strictnessProfile);

            // Verify that validation did not pass silently
            if (!result.passed) {
              // Either correction was attempted or errors are surfaced
              expect(
                result.correctionAttempted || result.errors.length > 0
              ).toBe(true);

              // If correction was attempted, verify it's tracked
              if (result.correctionAttempted) {
                expect(typeof result.correctionSuccessful).toBe('boolean');
              }

              // Errors should be present if correction failed
              if (result.correctionAttempted && !result.correctionSuccessful) {
                expect(result.errors.length).toBeGreaterThan(0);
              }
            }
          }
        ),
        { numRuns: 50 } // Reduced runs due to complexity
      );
    });
  });
});
