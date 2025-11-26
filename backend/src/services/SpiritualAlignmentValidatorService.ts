/**
 * Spiritual Alignment Validator Service
 * 
 * Validates all course content through SpiritualAlignmentValidator at multiple integration points
 * to protect ScrollUniversity from theological drift, Babylonian flattening, and ensure
 * Christ-centered content without compromising academic rigor.
 * 
 * Integration Points:
 * - Course generation
 * - Module generation
 * - Lesson finalization
 * - AI tutor scripts
 * - System messages
 * - Spiritual content blocks
 */

import { AIGatewayService } from './AIGatewayService';
import TheologicalAlignmentService from './TheologicalAlignmentService';
import SpiritualFormationAIService from './SpiritualFormationAIService';
import { logger } from '../utils/logger';
import {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  DriftDetection,
  ToneAnalysis,
  StrictnessProfile,
  ErrorType,
  ErrorSeverity,
  DriftType,
  ContentLocation
} from '../types/course-content.types';

class SpiritualAlignmentValidatorService {
  private aiGateway: AIGatewayService;
  private theologicalAlignment: TheologicalAlignmentService;
  private spiritualFormation: SpiritualFormationAIService;

  constructor(
    aiGateway?: AIGatewayService,
    theologicalAlignment?: TheologicalAlignmentService,
    spiritualFormation?: SpiritualFormationAIService
  ) {
    this.aiGateway = aiGateway || new AIGatewayService();
    this.theologicalAlignment = theologicalAlignment || new TheologicalAlignmentService();
    this.spiritualFormation = spiritualFormation || new SpiritualFormationAIService();
  }

  /**
   * Validate content with strictness profile support
   * 
   * @param contentId - ID of content to validate
   * @param strictnessProfile - Validation intensity level
   * @returns ValidationResult with errors, warnings, and correction status
   */
  async validateContent(
    contentId: string,
    strictnessProfile: StrictnessProfile
  ): Promise<ValidationResult> {
    try {
      logger.info('Validating content with spiritual alignment validator', {
        contentId,
        strictnessProfile
      });

      // Retrieve content from database
      const content = await this.getContentById(contentId);
      if (!content) {
        throw new Error(`Content not found: ${contentId}`);
      }

      // Run validation checks based on strictness profile
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // Check for theological drift
      const driftDetection = await this.detectTheologicalDrift(contentId);
      if (driftDetection.hasDrift) {
        errors.push(...this.convertDriftToErrors(driftDetection));
      }

      // Check for tone problems
      const toneAnalysis = await this.detectToneProblems(contentId);
      if (toneAnalysis.hasProblems) {
        errors.push(...this.convertToneToErrors(toneAnalysis));
      }

      // Check for spiritualization of laziness
      const lazynessDetection = await this.detectSpiritualizationOfLaziness(contentId);
      if (lazynessDetection.detected) {
        errors.push(...lazynessDetection.errors);
      }

      // Apply strictness profile filtering
      const filteredErrors = this.applyStrictnessProfile(errors, strictnessProfile);
      const filteredWarnings = warnings; // Warnings don't have severity, so no filtering needed

      // Determine if validation passed
      const passed = filteredErrors.length === 0;

      // Attempt auto-correction if errors found
      let correctionAttempted = false;
      let correctionSuccessful = false;

      if (!passed) {
        const correctionResult = await this.attemptAutoCorrection(contentId, filteredErrors);
        correctionAttempted = true;
        correctionSuccessful = correctionResult.successful;

        // If correction successful, re-validate
        if (correctionSuccessful) {
          return await this.validateContent(contentId, strictnessProfile);
        }
      }

      const result: ValidationResult = {
        contentId,
        passed,
        strictnessProfile,
        errors: filteredErrors,
        warnings: filteredWarnings,
        correctionAttempted,
        correctionSuccessful
      };

      logger.info('Content validation complete', {
        contentId,
        passed,
        errorCount: filteredErrors.length,
        warningCount: filteredWarnings.length
      });

      return result;
    } catch (error) {
      logger.error('Error validating content', { error, contentId });
      throw error;
    }
  }

  /**
   * Detect theological drift in content
   * 
   * @param contentId - ID of content to check
   * @returns DriftDetection with drift indicators
   */
  async detectTheologicalDrift(contentId: string): Promise<DriftDetection> {
    try {
      logger.info('Detecting theological drift', { contentId });

      const content = await this.getContentById(contentId);
      if (!content) {
        throw new Error(`Content not found: ${contentId}`);
      }

      // Use AI to analyze for theological drift
      const prompt = `Analyze the following content for theological drift. Specifically check for:
1. Presenting Jesus as "a way" rather than "the way" in theological contexts
2. Mixing incompatible belief systems as equivalent when teaching Christian theology
3. Reduction of Christ-centered identity to neutral secular academia (Babylonian flattening)
4. Generic spirituality replacing specific Christian doctrine

Content:
${content.text}

Respond in JSON format with:
{
  "hasDrift": boolean,
  "driftType": ["JESUS_NOT_THE_WAY" | "BELIEF_SYSTEM_MIXING" | "BABYLONIAN_FLATTENING" | "GENERIC_SPIRITUALITY"],
  "christCenteredScore": number (0-1),
  "scriptureRootedScore": number (0-1),
  "issues": [{"description": string, "location": string, "severity": "low"|"medium"|"high"|"critical"}]
}`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a theological reviewer ensuring Christ-centered, Scripture-rooted content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const analysis = JSON.parse(response.content);

      const result: DriftDetection = {
        contentId,
        hasDrift: analysis.hasDrift || false,
        driftType: analysis.driftType || [],
        christCenteredScore: analysis.christCenteredScore || 1.0,
        scriptureRootedScore: analysis.scriptureRootedScore || 1.0,
        issues: analysis.issues || []
      };

      logger.info('Theological drift detection complete', {
        contentId,
        hasDrift: result.hasDrift,
        driftTypes: result.driftType.length
      });

      return result;
    } catch (error) {
      logger.error('Error detecting theological drift', { error, contentId });
      throw error;
    }
  }

  /**
   * Detect tone problems in content
   * 
   * @param contentId - ID of content to check
   * @returns ToneAnalysis with tone issues
   */
  async detectToneProblems(contentId: string): Promise<ToneAnalysis> {
    try {
      logger.info('Detecting tone problems', { contentId });

      const content = await this.getContentById(contentId);
      if (!content) {
        throw new Error(`Content not found: ${contentId}`);
      }

      // Use AI to analyze tone
      const prompt = `Analyze the following content for tone problems. Check for:
1. Condemning or shaming language
2. Manipulative language
3. Treating students as "less than" rather than kings and queens in training
4. Harsh or judgmental tone

Content:
${content.text}

Respond in JSON format with:
{
  "hasProblems": boolean,
  "isCondemning": boolean,
  "isShaming": boolean,
  "isManipulative": boolean,
  "treatsStudentsAsLessThan": boolean,
  "toneScore": number (0-1, where 1 is excellent),
  "issues": [{"description": string, "location": string, "severity": "low"|"medium"|"high"|"critical"}]
}`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a tone analyst ensuring warm, respectful, encouraging content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const analysis = JSON.parse(response.content);

      const result: ToneAnalysis = {
        contentId,
        hasProblems: analysis.hasProblems || false,
        isCondemning: analysis.isCondemning || false,
        isShaming: analysis.isShaming || false,
        isManipulative: analysis.isManipulative || false,
        treatsStudentsAsLessThan: analysis.treatsStudentsAsLessThan || false,
        toneScore: analysis.toneScore || 1.0,
        issues: analysis.issues || []
      };

      logger.info('Tone problem detection complete', {
        contentId,
        hasProblems: result.hasProblems
      });

      return result;
    } catch (error) {
      logger.error('Error detecting tone problems', { error, contentId });
      throw error;
    }
  }

  /**
   * Detect spiritualization of laziness in content
   * 
   * @param contentId - ID of content to check
   * @returns Detection result with errors
   */
  async detectSpiritualizationOfLaziness(
    contentId: string
  ): Promise<{ detected: boolean; errors: ValidationError[] }> {
    try {
      logger.info('Detecting spiritualization of laziness', { contentId });

      const content = await this.getContentById(contentId);
      if (!content) {
        throw new Error(`Content not found: ${contentId}`);
      }

      // Use AI to analyze for spiritualization of laziness
      const prompt = `Analyze the following content for "spiritualization of laziness" - false teaching that suggests:
1. Prayer replaces study or discipline
2. God replaces personal responsibility
3. Faith without works is sufficient
4. Spiritual practices excuse lack of effort or excellence

Content:
${content.text}

Respond in JSON format with:
{
  "detected": boolean,
  "issues": [
    {
      "type": "PRAYER_REPLACES_STUDY" | "GOD_REPLACES_DISCIPLINE" | "FAITH_WITHOUT_WORKS" | "SPIRITUAL_EXCUSE",
      "description": string,
      "location": string,
      "severity": "low"|"medium"|"high"|"critical",
      "suggestedCorrection": string
    }
  ]
}`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a theological reviewer detecting false teaching about faith and works.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const analysis = JSON.parse(response.content);

      const errors: ValidationError[] = (analysis.issues || []).map((issue: any) => ({
        type: ErrorType.SPIRITUALIZATION_OF_LAZINESS,
        severity: this.mapSeverity(issue.severity),
        message: issue.description,
        location: { section: issue.location, line: 0, column: 0 },
        suggestedCorrection: issue.suggestedCorrection
      }));

      logger.info('Spiritualization of laziness detection complete', {
        contentId,
        detected: analysis.detected,
        issueCount: errors.length
      });

      return {
        detected: analysis.detected || false,
        errors
      };
    } catch (error) {
      logger.error('Error detecting spiritualization of laziness', { error, contentId });
      throw error;
    }
  }

  /**
   * Attempt auto-correction of validation errors
   * 
   * @param contentId - ID of content to correct
   * @param errors - Validation errors to correct
   * @returns Correction result
   */
  async attemptAutoCorrection(
    contentId: string,
    errors: ValidationError[]
  ): Promise<{ successful: boolean; correctedContent?: string }> {
    try {
      logger.info('Attempting auto-correction', { contentId, errorCount: errors.length });

      const content = await this.getContentById(contentId);
      if (!content) {
        throw new Error(`Content not found: ${contentId}`);
      }

      // Build correction prompt
      const errorDescriptions = errors
        .map(e => `- ${e.type}: ${e.message} (${e.severity})`)
        .join('\n');

      const prompt = `The following content has validation errors. Please correct them while maintaining the educational value and academic rigor:

ERRORS TO FIX:
${errorDescriptions}

ORIGINAL CONTENT:
${content.text}

Provide corrected content that:
1. Fixes all theological drift issues
2. Improves tone to be warm and encouraging
3. Maintains healthy integration of faith and works
4. Preserves academic quality and depth

Respond with only the corrected content, no explanations.`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a content editor fixing theological and tone issues while maintaining academic excellence.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5
      });

      const correctedContent = response.content.trim();

      // Update content in database
      await this.updateContentById(contentId, correctedContent);

      logger.info('Auto-correction successful', { contentId });

      return {
        successful: true,
        correctedContent
      };
    } catch (error) {
      logger.error('Error during auto-correction', { error, contentId });
      return {
        successful: false
      };
    }
  }

  // Private helper methods

  private async getContentById(contentId: string): Promise<{ id: string; text: string } | null> {
    // In a real implementation, this would query the database
    // For now, return a placeholder
    return {
      id: contentId,
      text: 'Sample content for validation'
    };
  }

  private async updateContentById(contentId: string, text: string): Promise<void> {
    // In a real implementation, this would update the database
    logger.info('Content updated', { contentId, textLength: text.length });
  }

  private convertDriftToErrors(drift: DriftDetection): ValidationError[] {
    // DriftDetection.issues is string[], so we need to convert them
    return drift.issues.map((issue, index) => ({
      type: this.mapDriftTypeToErrorType(drift.driftType[0] || 'GENERIC_SPIRITUALITY'),
      severity: ErrorSeverity.HIGH,
      message: issue,
      location: {
        file: 'content',
        section: `drift-issue-${index}`,
        line: 0,
        context: issue
      },
      suggestedCorrection: undefined
    }));
  }

  private convertToneToErrors(tone: ToneAnalysis): ValidationError[] {
    // ToneAnalysis.issues is string[], so we need to convert them
    return tone.issues.map((issue, index) => ({
      type: ErrorType.TONE_PROBLEM,
      severity: ErrorSeverity.MEDIUM,
      message: issue,
      location: {
        file: 'content',
        section: `tone-issue-${index}`,
        line: 0,
        context: issue
      },
      suggestedCorrection: undefined
    }));
  }

  private mapDriftTypeToErrorType(driftType: string): ErrorType {
    const mapping: Record<string, ErrorType> = {
      JESUS_NOT_THE_WAY: ErrorType.THEOLOGICAL_DRIFT,
      BELIEF_SYSTEM_MIXING: ErrorType.THEOLOGICAL_DRIFT,
      BABYLONIAN_FLATTENING: ErrorType.BABYLONIAN_FLATTENING,
      GENERIC_SPIRITUALITY: ErrorType.THEOLOGICAL_DRIFT
    };
    return mapping[driftType] || ErrorType.THEOLOGICAL_DRIFT;
  }

  private mapSeverity(severity: string): ErrorSeverity {
    const mapping: Record<string, ErrorSeverity> = {
      low: ErrorSeverity.LOW,
      medium: ErrorSeverity.MEDIUM,
      high: ErrorSeverity.HIGH,
      critical: ErrorSeverity.CRITICAL
    };
    return mapping[severity.toLowerCase()] || ErrorSeverity.MEDIUM;
  }

  private applyStrictnessProfile<T extends { severity: ErrorSeverity }>(
    items: T[],
    profile: StrictnessProfile
  ): T[] {
    // Filter items based on strictness profile
    switch (profile) {
      case StrictnessProfile.STRICT_SPIRITUAL:
        // Include all items
        return items;
      case StrictnessProfile.BALANCED:
        // Exclude low severity items
        return items.filter(item => item.severity !== ErrorSeverity.LOW);
      case StrictnessProfile.LIGHT_CHECK:
        // Only include high and critical items
        return items.filter(
          item => item.severity === ErrorSeverity.HIGH || item.severity === ErrorSeverity.CRITICAL
        );
      default:
        return items;
    }
  }
}


export default SpiritualAlignmentValidatorService;
