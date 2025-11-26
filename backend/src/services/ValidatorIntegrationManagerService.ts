/**
 * Validator Integration Manager Service
 * 
 * Enforces SpiritualAlignmentValidator at all critical content generation points.
 * Manages validation integration points and configures appropriate strictness profiles
 * for different content types.
 * 
 * Integration Points:
 * - Course generation (after each module)
 * - Module generation (after each lesson)
 * - AI tutor scripts (before storing/deploying)
 * - System messages (long-lived prompts)
 * - Spiritual content blocks (devotionals, prayers, exercises)
 */

import SpiritualAlignmentValidatorService from './SpiritualAlignmentValidatorService';
import { logger } from '../utils/logger';
import {
  ValidationResult,
  StrictnessProfile,
  ContentType
} from '../types/course-content.types';

class ValidatorIntegrationManagerService {
  private spiritualValidator: SpiritualAlignmentValidatorService;

  constructor(spiritualValidator?: SpiritualAlignmentValidatorService) {
    this.spiritualValidator = spiritualValidator || new SpiritualAlignmentValidatorService();
  }

  /**
   * Validate course generation
   * Invoked after each full lesson or module is generated and before finalizing any course
   * 
   * @param courseId - ID of course to validate
   * @returns ValidationResult with validation status
   */
  async validateCourseGeneration(courseId: string): Promise<ValidationResult> {
    try {
      logger.info('Validating course generation', { courseId });

      // Determine strictness profile based on course content type
      const strictnessProfile = await this.configureStrictnessProfile(ContentType.COURSE);

      // Validate course content through spiritual alignment validator
      const result = await this.spiritualValidator.validateContent(
        courseId,
        strictnessProfile
      );

      logger.info('Course generation validation complete', {
        courseId,
        passed: result.passed,
        errorCount: result.errors.length
      });

      return result;
    } catch (error) {
      logger.error('Error validating course generation', { error, courseId });
      throw error;
    }
  }

  /**
   * Validate module generation
   * Invoked after each lesson is finalized within a module
   * 
   * @param moduleId - ID of module to validate
   * @returns ValidationResult with validation status
   */
  async validateModuleGeneration(moduleId: string): Promise<ValidationResult> {
    try {
      logger.info('Validating module generation', { moduleId });

      // Determine strictness profile based on module content type
      const strictnessProfile = await this.configureStrictnessProfile(ContentType.MODULE);

      // Validate module content through spiritual alignment validator
      const result = await this.spiritualValidator.validateContent(
        moduleId,
        strictnessProfile
      );

      logger.info('Module generation validation complete', {
        moduleId,
        passed: result.passed,
        errorCount: result.errors.length
      });

      return result;
    } catch (error) {
      logger.error('Error validating module generation', { error, moduleId });
      throw error;
    }
  }

  /**
   * Validate AI tutor script
   * Validates all scripts before storing or deploying to live tutors
   * 
   * @param scriptId - ID of AI tutor script to validate
   * @returns ValidationResult with validation status
   */
  async validateAITutorScript(scriptId: string): Promise<ValidationResult> {
    try {
      logger.info('Validating AI tutor script', { scriptId });

      // AI tutor scripts require balanced validation
      const strictnessProfile = await this.configureStrictnessProfile(
        ContentType.AI_TUTOR_SCRIPT
      );

      // Validate script content through spiritual alignment validator
      const result = await this.spiritualValidator.validateContent(
        scriptId,
        strictnessProfile
      );

      logger.info('AI tutor script validation complete', {
        scriptId,
        passed: result.passed,
        errorCount: result.errors.length
      });

      return result;
    } catch (error) {
      logger.error('Error validating AI tutor script', { error, scriptId });
      throw error;
    }
  }

  /**
   * Validate system message
   * Validates long-lived prompts that influence many outputs
   * 
   * @param messageId - ID of system message to validate
   * @returns ValidationResult with validation status
   */
  async validateSystemMessage(messageId: string): Promise<ValidationResult> {
    try {
      logger.info('Validating system message', { messageId });

      // System messages require balanced validation
      const strictnessProfile = await this.configureStrictnessProfile(
        ContentType.SYSTEM_MESSAGE
      );

      // Validate message content through spiritual alignment validator
      const result = await this.spiritualValidator.validateContent(
        messageId,
        strictnessProfile
      );

      logger.info('System message validation complete', {
        messageId,
        passed: result.passed,
        errorCount: result.errors.length
      });

      return result;
    } catch (error) {
      logger.error('Error validating system message', { error, messageId });
      throw error;
    }
  }

  /**
   * Validate spiritual content block
   * Validates devotionals, guided prayers, spiritual exercises with strict_spiritual profile
   * 
   * @param contentId - ID of spiritual content block to validate
   * @returns ValidationResult with validation status
   */
  async validateSpiritualContent(contentId: string): Promise<ValidationResult> {
    try {
      logger.info('Validating spiritual content block', { contentId });

      // Spiritual content requires strict validation
      const strictnessProfile = await this.configureStrictnessProfile(
        ContentType.SPIRITUAL_CONTENT
      );

      // Validate spiritual content through spiritual alignment validator
      const result = await this.spiritualValidator.validateContent(
        contentId,
        strictnessProfile
      );

      logger.info('Spiritual content validation complete', {
        contentId,
        passed: result.passed,
        errorCount: result.errors.length
      });

      return result;
    } catch (error) {
      logger.error('Error validating spiritual content', { error, contentId });
      throw error;
    }
  }

  /**
   * Configure strictness profile based on content type
   * Enforces appropriate profile but SHALL NOT allow complete validator disabling
   * 
   * @param contentType - Type of content being validated
   * @returns StrictnessProfile appropriate for the content type
   */
  async configureStrictnessProfile(contentType: ContentType): Promise<StrictnessProfile> {
    try {
      logger.info('Configuring strictness profile', { contentType });

      let profile: StrictnessProfile;

      switch (contentType) {
        case ContentType.SPIRITUAL_CONTENT:
          // Spiritual content requires strict validation
          profile = StrictnessProfile.STRICT_SPIRITUAL;
          break;

        case ContentType.COURSE:
        case ContentType.MODULE:
        case ContentType.LESSON:
          // Course content requires balanced validation
          // (technical with spiritual integration)
          profile = StrictnessProfile.BALANCED;
          break;

        case ContentType.AI_TUTOR_SCRIPT:
        case ContentType.SYSTEM_MESSAGE:
          // AI-generated content requires balanced validation
          profile = StrictnessProfile.BALANCED;
          break;

        default:
          // Default to balanced for unknown content types
          profile = StrictnessProfile.BALANCED;
          logger.warn('Unknown content type, defaulting to BALANCED profile', {
            contentType
          });
      }

      logger.info('Strictness profile configured', { contentType, profile });

      return profile;
    } catch (error) {
      logger.error('Error configuring strictness profile', { error, contentType });
      throw error;
    }
  }

  /**
   * Validate content at generic integration point
   * Determines content type and applies appropriate validation
   * 
   * @param contentId - ID of content to validate
   * @param contentType - Type of content being validated
   * @returns ValidationResult with validation status
   */
  async validateContent(
    contentId: string,
    contentType: ContentType
  ): Promise<ValidationResult> {
    try {
      logger.info('Validating content at integration point', { contentId, contentType });

      // Route to appropriate validation method based on content type
      switch (contentType) {
        case ContentType.COURSE:
          return await this.validateCourseGeneration(contentId);

        case ContentType.MODULE:
          return await this.validateModuleGeneration(contentId);

        case ContentType.AI_TUTOR_SCRIPT:
          return await this.validateAITutorScript(contentId);

        case ContentType.SYSTEM_MESSAGE:
          return await this.validateSystemMessage(contentId);

        case ContentType.SPIRITUAL_CONTENT:
          return await this.validateSpiritualContent(contentId);

        case ContentType.LESSON:
          // Lessons are validated as part of module validation
          return await this.validateModuleGeneration(contentId);

        default:
          throw new Error(`Unsupported content type: ${contentType}`);
      }
    } catch (error) {
      logger.error('Error validating content', { error, contentId, contentType });
      throw error;
    }
  }
}

export default ValidatorIntegrationManagerService;
