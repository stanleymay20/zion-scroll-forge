/**
 * Property-Based Tests for Validator Integration Manager Service
 * 
 * Tests universal properties that should hold across all inputs using fast-check library.
 * Each property test runs a minimum of 100 iterations with randomly generated inputs.
 */

import * as fc from 'fast-check';
import ValidatorIntegrationManagerService from '../ValidatorIntegrationManagerService';
import SpiritualAlignmentValidatorService from '../SpiritualAlignmentValidatorService';
import {
  ValidationResult,
  StrictnessProfile,
  ContentType,
  ErrorSeverity
} from '../../types/course-content.types';

// Mock the SpiritualAlignmentValidatorService
jest.mock('../SpiritualAlignmentValidatorService');

describe('ValidatorIntegrationManagerService - Property-Based Tests', () => {
  let service: ValidatorIntegrationManagerService;
  let mockSpiritualValidator: jest.Mocked<SpiritualAlignmentValidatorService>;

  beforeEach(() => {
    // Create mock spiritual validator
    mockSpiritualValidator = new SpiritualAlignmentValidatorService() as jest.Mocked<SpiritualAlignmentValidatorService>;
    service = new ValidatorIntegrationManagerService(mockSpiritualValidator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Generators
  // ============================================================================

  /**
   * Generate random course IDs
   */
  const courseIdGenerator = (): fc.Arbitrary<string> => {
    return fc.string({ minLength: 1, maxLength: 50 }).map(s => `course-${s}`);
  };

  /**
   * Generate random module IDs
   */
  const moduleIdGenerator = (): fc.Arbitrary<string> => {
    return fc.string({ minLength: 1, maxLength: 50 }).map(s => `module-${s}`);
  };

  /**
   * Generate random script IDs
   */
  const scriptIdGenerator = (): fc.Arbitrary<string> => {
    return fc.string({ minLength: 1, maxLength: 50 }).map(s => `script-${s}`);
  };

  /**
   * Generate random message IDs
   */
  const messageIdGenerator = (): fc.Arbitrary<string> => {
    return fc.string({ minLength: 1, maxLength: 50 }).map(s => `message-${s}`);
  };

  /**
   * Generate random content IDs
   */
  const contentIdGenerator = (): fc.Arbitrary<string> => {
    return fc.string({ minLength: 1, maxLength: 50 }).map(s => `content-${s}`);
  };

  /**
   * Generate random validation results
   */
  const validationResultGenerator = (contentId: string): fc.Arbitrary<ValidationResult> => {
    return fc.record({
      contentId: fc.constant(contentId),
      passed: fc.boolean(),
      strictnessProfile: fc.constantFrom(
        StrictnessProfile.STRICT_SPIRITUAL,
        StrictnessProfile.BALANCED,
        StrictnessProfile.LIGHT_CHECK
      ),
      errors: fc.array(
        fc.record({
          type: fc.constantFrom('THEOLOGICAL_DRIFT', 'TONE_PROBLEM', 'SPIRITUALIZATION_OF_LAZINESS', 'BABYLONIAN_FLATTENING'),
          severity: fc.constantFrom(ErrorSeverity.CRITICAL, ErrorSeverity.HIGH, ErrorSeverity.MEDIUM, ErrorSeverity.LOW),
          message: fc.string({ minLength: 10, maxLength: 100 }),
          location: fc.record({
            file: fc.constant('content'),
            section: fc.string({ minLength: 5, maxLength: 20 }),
            line: fc.nat(1000),
            context: fc.string({ minLength: 10, maxLength: 50 })
          }),
          suggestedCorrection: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined })
        }),
        { maxLength: 5 }
      ),
      warnings: fc.array(
        fc.record({
          type: fc.string({ minLength: 5, maxLength: 20 }),
          message: fc.string({ minLength: 10, maxLength: 100 }),
          location: fc.record({
            file: fc.constant('content'),
            section: fc.string({ minLength: 5, maxLength: 20 }),
            line: fc.nat(1000),
            context: fc.string({ minLength: 10, maxLength: 50 })
          })
        }),
        { maxLength: 3 }
      ),
      correctionAttempted: fc.boolean(),
      correctionSuccessful: fc.boolean()
    });
  };

  // ============================================================================
  // Property 75: Course Generation Validation
  // Feature: course-content-creation, Property 75: Course Generation Validation
  // Validates: Requirements 17.1
  // ============================================================================

  describe('Property 75: Course Generation Validation', () => {
    it('should invoke SpiritualAlignmentValidator after course generation', async () => {
      await fc.assert(
        fc.asyncProperty(
          courseIdGenerator(),
          async (courseId) => {
            // Setup mock to return a validation result
            const mockResult: ValidationResult = {
              contentId: courseId,
              passed: true,
              strictnessProfile: StrictnessProfile.BALANCED,
              errors: [],
              warnings: [],
              correctionAttempted: false,
              correctionSuccessful: false
            };

            mockSpiritualValidator.validateContent = jest.fn().mockResolvedValue(mockResult);

            // Execute validation
            const result = await service.validateCourseGeneration(courseId);

            // Verify validator was called
            expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
              courseId,
              expect.any(String) // StrictnessProfile
            );

            // Verify result is defined and has correct contentId
            expect(result).toBeDefined();
            expect(result.contentId).toBe(courseId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use appropriate strictness profile for course content', async () => {
      await fc.assert(
        fc.asyncProperty(
          courseIdGenerator(),
          async (courseId) => {
            // Setup mock
            const mockResult: ValidationResult = {
              contentId: courseId,
              passed: true,
              strictnessProfile: StrictnessProfile.BALANCED,
              errors: [],
              warnings: [],
              correctionAttempted: false,
              correctionSuccessful: false
            };

            mockSpiritualValidator.validateContent = jest.fn().mockResolvedValue(mockResult);

            // Execute validation
            await service.validateCourseGeneration(courseId);

            // Verify balanced profile was used for course content
            expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
              courseId,
              StrictnessProfile.BALANCED
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ============================================================================
  // Property 76: AI Tutor Script Validation
  // Feature: course-content-creation, Property 76: AI Tutor Script Validation
  // Validates: Requirements 17.2
  // ============================================================================

  describe('Property 76: AI Tutor Script Validation', () => {
    it('should validate all AI tutor scripts before storing or deploying', async () => {
      await fc.assert(
        fc.asyncProperty(
          scriptIdGenerator(),
          async (scriptId) => {
            // Setup mock
            const mockResult: ValidationResult = {
              contentId: scriptId,
              passed: true,
              strictnessProfile: StrictnessProfile.BALANCED,
              errors: [],
              warnings: [],
              correctionAttempted: false,
              correctionSuccessful: false
            };

            mockSpiritualValidator.validateContent = jest.fn().mockResolvedValue(mockResult);

            // Execute validation
            const result = await service.validateAITutorScript(scriptId);

            // Verify validator was called
            expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
              scriptId,
              expect.any(String)
            );

            // Verify result is defined
            expect(result).toBeDefined();
            expect(result.contentId).toBe(scriptId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use balanced profile for AI tutor scripts', async () => {
      await fc.assert(
        fc.asyncProperty(
          scriptIdGenerator(),
          async (scriptId) => {
            // Setup mock
            const mockResult: ValidationResult = {
              contentId: scriptId,
              passed: true,
              strictnessProfile: StrictnessProfile.BALANCED,
              errors: [],
              warnings: [],
              correctionAttempted: false,
              correctionSuccessful: false
            };

            mockSpiritualValidator.validateContent = jest.fn().mockResolvedValue(mockResult);

            // Execute validation
            await service.validateAITutorScript(scriptId);

            // Verify balanced profile was used
            expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
              scriptId,
              StrictnessProfile.BALANCED
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ============================================================================
  // Property 77: System Message Validation
  // Feature: course-content-creation, Property 77: System Message Validation
  // Validates: Requirements 17.3
  // ============================================================================

  describe('Property 77: System Message Validation', () => {
    it('should validate long-lived prompts through SpiritualAlignmentValidator', async () => {
      await fc.assert(
        fc.asyncProperty(
          messageIdGenerator(),
          async (messageId) => {
            // Setup mock
            const mockResult: ValidationResult = {
              contentId: messageId,
              passed: true,
              strictnessProfile: StrictnessProfile.BALANCED,
              errors: [],
              warnings: [],
              correctionAttempted: false,
              correctionSuccessful: false
            };

            mockSpiritualValidator.validateContent = jest.fn().mockResolvedValue(mockResult);

            // Execute validation
            const result = await service.validateSystemMessage(messageId);

            // Verify validator was called
            expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
              messageId,
              expect.any(String)
            );

            // Verify result is defined
            expect(result).toBeDefined();
            expect(result.contentId).toBe(messageId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use balanced profile for system messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          messageIdGenerator(),
          async (messageId) => {
            // Setup mock
            const mockResult: ValidationResult = {
              contentId: messageId,
              passed: true,
              strictnessProfile: StrictnessProfile.BALANCED,
              errors: [],
              warnings: [],
              correctionAttempted: false,
              correctionSuccessful: false
            };

            mockSpiritualValidator.validateContent = jest.fn().mockResolvedValue(mockResult);

            // Execute validation
            await service.validateSystemMessage(messageId);

            // Verify balanced profile was used
            expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
              messageId,
              StrictnessProfile.BALANCED
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ============================================================================
  // Property 78: Spiritual Content Block Validation
  // Feature: course-content-creation, Property 78: Spiritual Content Block Validation
  // Validates: Requirements 17.4
  // ============================================================================

  describe('Property 78: Spiritual Content Block Validation', () => {
    it('should validate spiritual content with strict_spiritual profile', async () => {
      await fc.assert(
        fc.asyncProperty(
          contentIdGenerator(),
          async (contentId) => {
            // Setup mock
            const mockResult: ValidationResult = {
              contentId,
              passed: true,
              strictnessProfile: StrictnessProfile.STRICT_SPIRITUAL,
              errors: [],
              warnings: [],
              correctionAttempted: false,
              correctionSuccessful: false
            };

            mockSpiritualValidator.validateContent = jest.fn().mockResolvedValue(mockResult);

            // Execute validation
            const result = await service.validateSpiritualContent(contentId);

            // Verify validator was called with strict profile
            expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
              contentId,
              StrictnessProfile.STRICT_SPIRITUAL
            );

            // Verify result is defined
            expect(result).toBeDefined();
            expect(result.contentId).toBe(contentId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should enforce strict validation for devotionals, prayers, and exercises', async () => {
      await fc.assert(
        fc.asyncProperty(
          contentIdGenerator(),
          async (contentId) => {
            // Setup mock
            const mockResult: ValidationResult = {
              contentId,
              passed: true,
              strictnessProfile: StrictnessProfile.STRICT_SPIRITUAL,
              errors: [],
              warnings: [],
              correctionAttempted: false,
              correctionSuccessful: false
            };

            mockSpiritualValidator.validateContent = jest.fn().mockResolvedValue(mockResult);

            // Execute validation
            await service.validateSpiritualContent(contentId);

            // Verify strict_spiritual profile was used
            expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
              contentId,
              StrictnessProfile.STRICT_SPIRITUAL
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ============================================================================
  // Property 79: Strictness Profile Configuration
  // Feature: course-content-creation, Property 79: Strictness Profile Configuration
  // Validates: Requirements 17.5
  // ============================================================================

  describe('Property 79: Strictness Profile Configuration', () => {
    it('should enforce appropriate profile and never allow complete validator disabling', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            ContentType.COURSE,
            ContentType.MODULE,
            ContentType.LESSON,
            ContentType.AI_TUTOR_SCRIPT,
            ContentType.SYSTEM_MESSAGE,
            ContentType.SPIRITUAL_CONTENT
          ),
          async (contentType) => {
            // Execute profile configuration
            const profile = await service.configureStrictnessProfile(contentType);

            // Verify profile is one of the valid options (never null/undefined)
            expect(profile).toBeDefined();
            expect([
              StrictnessProfile.STRICT_SPIRITUAL,
              StrictnessProfile.BALANCED,
              StrictnessProfile.LIGHT_CHECK
            ]).toContain(profile);

            // Verify validator is never disabled (profile is always set)
            expect(profile).not.toBeNull();
            expect(profile).not.toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should map content types to appropriate strictness profiles', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            ContentType.COURSE,
            ContentType.MODULE,
            ContentType.LESSON,
            ContentType.AI_TUTOR_SCRIPT,
            ContentType.SYSTEM_MESSAGE,
            ContentType.SPIRITUAL_CONTENT
          ),
          async (contentType) => {
            // Execute profile configuration
            const profile = await service.configureStrictnessProfile(contentType);

            // Verify correct profile mapping
            switch (contentType) {
              case ContentType.SPIRITUAL_CONTENT:
                expect(profile).toBe(StrictnessProfile.STRICT_SPIRITUAL);
                break;

              case ContentType.COURSE:
              case ContentType.MODULE:
              case ContentType.LESSON:
              case ContentType.AI_TUTOR_SCRIPT:
              case ContentType.SYSTEM_MESSAGE:
                expect(profile).toBe(StrictnessProfile.BALANCED);
                break;

              default:
                // Should never reach here with our generator
                expect(profile).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should never return null or undefined profile', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            ContentType.COURSE,
            ContentType.MODULE,
            ContentType.LESSON,
            ContentType.AI_TUTOR_SCRIPT,
            ContentType.SYSTEM_MESSAGE,
            ContentType.SPIRITUAL_CONTENT
          ),
          async (contentType) => {
            // Execute profile configuration
            const profile = await service.configureStrictnessProfile(contentType);

            // Verify profile is never null or undefined
            expect(profile).not.toBeNull();
            expect(profile).not.toBeUndefined();
            expect(typeof profile).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ============================================================================
  // Additional Integration Tests
  // ============================================================================

  describe('Module Generation Validation', () => {
    it('should validate module generation with balanced profile', async () => {
      await fc.assert(
        fc.asyncProperty(
          moduleIdGenerator(),
          async (moduleId) => {
            // Setup mock
            const mockResult: ValidationResult = {
              contentId: moduleId,
              passed: true,
              strictnessProfile: StrictnessProfile.BALANCED,
              errors: [],
              warnings: [],
              correctionAttempted: false,
              correctionSuccessful: false
            };

            mockSpiritualValidator.validateContent = jest.fn().mockResolvedValue(mockResult);

            // Execute validation
            const result = await service.validateModuleGeneration(moduleId);

            // Verify validator was called
            expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
              moduleId,
              StrictnessProfile.BALANCED
            );

            // Verify result
            expect(result).toBeDefined();
            expect(result.contentId).toBe(moduleId);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Generic Content Validation', () => {
    it('should route to appropriate validation method based on content type', async () => {
      await fc.assert(
        fc.asyncProperty(
          contentIdGenerator(),
          fc.constantFrom(
            ContentType.COURSE,
            ContentType.MODULE,
            ContentType.AI_TUTOR_SCRIPT,
            ContentType.SYSTEM_MESSAGE,
            ContentType.SPIRITUAL_CONTENT
          ),
          async (contentId, contentType) => {
            // Setup mock
            const mockResult: ValidationResult = {
              contentId,
              passed: true,
              strictnessProfile: StrictnessProfile.BALANCED,
              errors: [],
              warnings: [],
              correctionAttempted: false,
              correctionSuccessful: false
            };

            mockSpiritualValidator.validateContent = jest.fn().mockResolvedValue(mockResult);

            // Execute validation
            const result = await service.validateContent(contentId, contentType);

            // Verify validator was called
            expect(mockSpiritualValidator.validateContent).toHaveBeenCalled();

            // Verify result
            expect(result).toBeDefined();
            expect(result.contentId).toBe(contentId);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
