/**
 * Scroll Pedagogy Enforcer Service
 * "The Spirit of truth will guide you into all truth" - John 16:13
 * 
 * Ensures all lessons follow the Scroll Pedagogy 6-step flow and Revelation Learning Model.
 * This service enforces pedagogical integrity as a non-negotiable standard.
 * 
 * Priority Hierarchy (when conflicts arise):
 * 1. Spiritual alignment
 * 2. Pedagogical integrity (this service)
 * 3. Content depth
 * 4. Technical correctness
 * 5. Delivery speed
 */

import {
  FlowValidation,
  ToneValidation,
  AssessmentDistribution,
  ProgressionMapping,
  ProgressionLevel,
  PriorityDecision,
  Conflict
} from '../types/course-content.types';
import { logger } from '../utils/logger';

export class ScrollPedagogyEnforcerService {
  /**
   * Validates that a lesson follows the 6-step lesson flow
   * Property 80: Six-Step Lesson Flow Enforcement
   * 
   * Required steps:
   * 1. Ignition (Hook + Revelation Trigger)
   * 2. Download (Concept Teaching)
   * 3. Demonstration (Worked Examples)
   * 4. Activation (Student Practice)
   * 5. Reflection (Identity & Integration)
   * 6. Commission (Next Steps)
   * 
   * @param lessonId - Lesson identifier
   * @returns Validation result with all steps checked
   */
  async validateLessonFlow(lessonId: string): Promise<FlowValidation> {
    try {
      logger.info('Validating lesson flow', { lessonId });

      // Retrieve lesson content
      const lesson = await this.getLessonContent(lessonId);

      // Check for each required step
      const hasIgnition = this.checkForIgnition(lesson);
      const hasDownload = this.checkForDownload(lesson);
      const hasDemonstration = this.checkForDemonstration(lesson);
      const hasActivation = this.checkForActivation(lesson);
      const hasReflection = this.checkForReflection(lesson);
      const hasCommission = this.checkForCommission(lesson);

      // Determine missing steps
      const missingSteps: string[] = [];
      if (!hasIgnition) missingSteps.push('Ignition');
      if (!hasDownload) missingSteps.push('Download');
      if (!hasDemonstration) missingSteps.push('Demonstration');
      if (!hasActivation) missingSteps.push('Activation');
      if (!hasReflection) missingSteps.push('Reflection');
      if (!hasCommission) missingSteps.push('Commission');

      // Calculate flow quality score
      const presentSteps = 6 - missingSteps.length;
      const flowQuality = presentSteps / 6;

      const allStepsPresent = missingSteps.length === 0;

      const validation: FlowValidation = {
        lessonId,
        hasIgnition,
        hasDownload,
        hasDemonstration,
        hasActivation,
        hasReflection,
        hasCommission,
        allStepsPresent,
        flowQuality,
        missingSteps
      };

      if (!allStepsPresent) {
        logger.warn('Lesson missing required pedagogical steps', {
          lessonId,
          missingSteps,
          flowQuality
        });
      } else {
        logger.info('Lesson flow validation passed', { lessonId, flowQuality });
      }

      return validation;
    } catch (error) {
      logger.error('Error validating lesson flow', {
        error: error instanceof Error ? error.message : String(error),
        lessonId
      });
      throw new Error(`Failed to validate lesson flow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validates AI tutor tone and dual-explanation pattern
   * Property 81: AI Tutor Dual-Explanation Pattern
   * 
   * Requirements:
   * - Dual-explanation pattern (conceptual + practical)
   * - Warm, wise, prophetic-but-grounded tone
   * - Never condescending or treating students as "less than"
   * 
   * @param tutorResponseId - Tutor response identifier
   * @returns Tone validation result
   */
  async validateAITutorTone(tutorResponseId: string): Promise<ToneValidation> {
    try {
      logger.info('Validating AI tutor tone', { tutorResponseId });

      // Retrieve tutor response
      const response = await this.getTutorResponse(tutorResponseId);

      // Check tone characteristics
      const isWarm = this.checkWarmTone(response);
      const isWise = this.checkWiseTone(response);
      const isPropheticButGrounded = this.checkPropheticGroundedTone(response);
      const hasDualExplanation = this.checkDualExplanation(response);

      // Identify tone issues
      const issues: string[] = [];
      if (!isWarm) issues.push('Lacks warm, welcoming tone');
      if (!isWise) issues.push('Lacks wisdom and depth');
      if (!isPropheticButGrounded) issues.push('Not prophetic-but-grounded (either too mystical or too dry)');
      if (!hasDualExplanation) issues.push('Missing dual-explanation pattern (conceptual + practical)');

      // Check for negative patterns
      if (this.isCondescending(response)) {
        issues.push('Condescending tone detected');
      }
      if (this.treatStudentsAsLessThan(response)) {
        issues.push('Treats students as "less than" rather than kings/queens in training');
      }

      // Calculate tone score
      const positiveChecks = [isWarm, isWise, isPropheticButGrounded, hasDualExplanation].filter(Boolean).length;
      const toneScore = positiveChecks / 4;

      const validation: ToneValidation = {
        tutorResponseId,
        isWarm,
        isWise,
        isPropheticButGrounded,
        hasDualExplanation,
        toneScore,
        issues
      };

      if (issues.length > 0) {
        logger.warn('AI tutor tone validation issues detected', {
          tutorResponseId,
          issues,
          toneScore
        });
      } else {
        logger.info('AI tutor tone validation passed', { tutorResponseId, toneScore });
      }

      return validation;
    } catch (error) {
      logger.error('Error validating AI tutor tone', {
        error: error instanceof Error ? error.message : String(error),
        tutorResponseId
      });
      throw new Error(`Failed to validate AI tutor tone: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validates assessment distribution across formative, summative, and reflective types
   * Property 82: Assessment Type Inclusion
   * 
   * Requirements:
   * - Formative assessments (ongoing feedback)
   * - Summative assessments (mastery certification)
   * - Reflective assessments (spiritual/identity integration)
   * - Distributed across the course, not just at the end
   * 
   * @param courseId - Course identifier
   * @returns Assessment distribution analysis
   */
  async validateAssessmentDistribution(courseId: string): Promise<AssessmentDistribution> {
    try {
      logger.info('Validating assessment distribution', { courseId });

      // Retrieve all assessments for the course
      const assessments = await this.getCourseAssessments(courseId);

      // Count assessment types
      const formativeCount = assessments.filter(a => a.type === 'formative').length;
      const summativeCount = assessments.filter(a => a.type === 'summative').length;
      const reflectiveCount = assessments.filter(a => a.type === 'reflective').length;

      // Check distribution balance
      const totalAssessments = assessments.length;
      const hasFormative = formativeCount > 0;
      const hasSummative = summativeCount > 0;
      const hasReflective = reflectiveCount > 0;

      const distributionBalanced = hasFormative && hasSummative && hasReflective;

      // Generate recommendations
      const recommendations: string[] = [];
      if (!hasFormative) {
        recommendations.push('Add formative assessments for ongoing feedback and learning adjustment');
      }
      if (!hasSummative) {
        recommendations.push('Add summative assessments to certify mastery of learning objectives');
      }
      if (!hasReflective) {
        recommendations.push('Add reflective assessments to connect learning to identity, calling, and spiritual formation');
      }

      // Check temporal distribution
      if (assessments.length > 0) {
        const assessmentsByModule = this.groupAssessmentsByModule(assessments);
        const modulesWithoutAssessments = this.findModulesWithoutAssessments(courseId, assessmentsByModule);
        
        if (modulesWithoutAssessments.length > 0) {
          recommendations.push(`Distribute assessments more evenly - ${modulesWithoutAssessments.length} modules lack assessments`);
        }
      }

      const distribution: AssessmentDistribution = {
        courseId,
        formativeCount,
        summativeCount,
        reflectiveCount,
        distributionBalanced,
        recommendations
      };

      if (!distributionBalanced) {
        logger.warn('Assessment distribution imbalanced', {
          courseId,
          formativeCount,
          summativeCount,
          reflectiveCount
        });
      } else {
        logger.info('Assessment distribution validation passed', { courseId, distribution });
      }

      return distribution;
    } catch (error) {
      logger.error('Error validating assessment distribution', {
        error: error instanceof Error ? error.message : String(error),
        courseId
      });
      throw new Error(`Failed to validate assessment distribution: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Maps course content to the 5-level Revelation Learning Model
   * Property 83: Progression Level Mapping
   * 
   * Levels:
   * 1. Awareness & Vocabulary
   * 2. Understanding & Analysis
   * 3. Application & Problem Solving
   * 4. System Design & Governance
   * 5. Multiplication & Teaching Others
   * 
   * @param courseId - Course identifier
   * @returns Progression mapping analysis
   */
  async mapToProgressionLevel(courseId: string): Promise<ProgressionMapping> {
    try {
      logger.info('Mapping course to progression levels', { courseId });

      // Retrieve course details
      const course = await this.getCourseDetails(courseId);

      // Determine target level from course metadata
      const targetLevel = this.determineTargetLevel(course);

      // Validate content mapping
      const contentMappedToLevel = this.validateContentMapping(course, targetLevel);
      const assessmentsMappedToLevel = this.validateAssessmentMapping(course, targetLevel);

      // Check if level is appropriate
      const levelAppropriate = contentMappedToLevel && assessmentsMappedToLevel;

      // Identify gaps
      const gaps: string[] = [];
      if (!contentMappedToLevel) {
        gaps.push(`Content does not consistently match ${targetLevel} level expectations`);
      }
      if (!assessmentsMappedToLevel) {
        gaps.push(`Assessments do not align with ${targetLevel} level requirements`);
      }

      const mapping: ProgressionMapping = {
        courseId,
        targetLevel,
        contentMappedToLevel,
        assessmentsMappedToLevel,
        levelAppropriate,
        gaps
      };

      if (!levelAppropriate) {
        logger.warn('Course progression level mapping has gaps', {
          courseId,
          targetLevel,
          gaps
        });
      } else {
        logger.info('Course progression level mapping validated', { courseId, targetLevel });
      }

      return mapping;
    } catch (error) {
      logger.error('Error mapping course to progression level', {
        error: error instanceof Error ? error.message : String(error),
        courseId
      });
      throw new Error(`Failed to map course to progression level: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Enforces pedagogical priority when conflicts arise
   * Property 84: Pedagogical Priority Enforcement
   * 
   * Priority order:
   * 1. Spiritual alignment
   * 2. Pedagogical integrity
   * 3. Content depth
   * 4. Technical correctness
   * 5. Delivery speed
   * 
   * @param conflictScenario - Description of the conflict
   * @returns Priority decision with rationale
   */
  async enforcePedagogicalPriority(conflictScenario: Conflict): Promise<PriorityDecision> {
    try {
      logger.info('Enforcing pedagogical priority', { conflictScenario });

      const { type, options, context } = conflictScenario;

      // Determine priority based on conflict type
      let chosenOption: string;
      let rationale: string;
      let priorityLevel: number;

      switch (type) {
        case 'spiritual_vs_pedagogy':
          chosenOption = options[0]; // Spiritual alignment wins
          rationale = 'Spiritual alignment is the highest priority. Pedagogical methods must serve spiritual formation.';
          priorityLevel = 1;
          break;

        case 'pedagogy_vs_depth':
          chosenOption = options[0]; // Pedagogy wins
          rationale = 'Pedagogical integrity ensures effective learning. Content depth must be delivered through proper pedagogy.';
          priorityLevel = 2;
          break;

        case 'pedagogy_vs_technical':
          chosenOption = options[0]; // Pedagogy wins
          rationale = 'Pedagogical structure ensures comprehension. Technical correctness must be presented through effective teaching methods.';
          priorityLevel = 2;
          break;

        case 'pedagogy_vs_speed':
          chosenOption = options[0]; // Pedagogy wins
          rationale = 'Pedagogical integrity is non-negotiable. Never sacrifice teaching quality for delivery speed.';
          priorityLevel = 2;
          break;

        case 'depth_vs_speed':
          chosenOption = options[0]; // Depth wins
          rationale = 'Content depth ensures elite standards. Speed must not compromise academic rigor.';
          priorityLevel = 3;
          break;

        case 'technical_vs_speed':
          chosenOption = options[0]; // Technical wins
          rationale = 'Technical correctness ensures accuracy. Speed must not compromise factual integrity.';
          priorityLevel = 4;
          break;

        default:
          chosenOption = options[0];
          rationale = 'Default to first option when conflict type is unclear. Manual review recommended.';
          priorityLevel = 5;
      }

      const decision: PriorityDecision = {
        conflictType: type,
        chosenOption,
        rationale,
        priorityLevel,
        requiresManualReview: priorityLevel === 5,
        decidedAt: new Date()
      };

      logger.info('Pedagogical priority decision made', {
        conflictType: type,
        chosenOption,
        priorityLevel
      });

      return decision;
    } catch (error) {
      logger.error('Error enforcing pedagogical priority', {
        error: error instanceof Error ? error.message : String(error),
        conflictScenario
      });
      throw new Error(`Failed to enforce pedagogical priority: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Private helper methods

  private async getLessonContent(lessonId: string): Promise<any> {
    // In production, this would query the database
    // For now, return mock data for testing
    return {
      id: lessonId,
      title: 'Sample Lesson',
      content: {
        ignition: 'Hook and revelation trigger',
        download: 'Concept teaching',
        demonstration: 'Worked examples',
        activation: 'Student practice',
        reflection: 'Identity integration',
        commission: 'Next steps'
      }
    };
  }

  private checkForIgnition(lesson: any): boolean {
    return !!(lesson.content?.ignition || lesson.content?.hook || lesson.content?.introduction);
  }

  private checkForDownload(lesson: any): boolean {
    return !!(lesson.content?.download || lesson.content?.teaching || lesson.content?.concepts);
  }

  private checkForDemonstration(lesson: any): boolean {
    return !!(lesson.content?.demonstration || lesson.content?.examples || lesson.content?.workedExamples);
  }

  private checkForActivation(lesson: any): boolean {
    return !!(lesson.content?.activation || lesson.content?.practice || lesson.content?.exercises);
  }

  private checkForReflection(lesson: any): boolean {
    return !!(lesson.content?.reflection || lesson.content?.integration || lesson.content?.spiritualApplication);
  }

  private checkForCommission(lesson: any): boolean {
    return !!(lesson.content?.commission || lesson.content?.nextSteps || lesson.content?.assignment);
  }

  private async getTutorResponse(tutorResponseId: string): Promise<any> {
    // In production, this would query the database
    return {
      id: tutorResponseId,
      content: 'Sample tutor response with conceptual and practical explanations',
      tone: 'warm and wise'
    };
  }

  private checkWarmTone(response: any): boolean {
    const warmIndicators = ['welcome', 'glad', 'excited', 'wonderful', 'great question'];
    const content = response.content?.toLowerCase() || '';
    return warmIndicators.some(indicator => content.includes(indicator));
  }

  private checkWiseTone(response: any): boolean {
    const wiseIndicators = ['consider', 'reflect', 'wisdom', 'insight', 'understanding'];
    const content = response.content?.toLowerCase() || '';
    return wiseIndicators.some(indicator => content.includes(indicator));
  }

  private checkPropheticGroundedTone(response: any): boolean {
    const propheticIndicators = ['calling', 'purpose', 'kingdom', 'destiny'];
    const groundedIndicators = ['practical', 'specific', 'example', 'application'];
    const content = response.content?.toLowerCase() || '';
    
    const hasProphetic = propheticIndicators.some(indicator => content.includes(indicator));
    const hasGrounded = groundedIndicators.some(indicator => content.includes(indicator));
    
    return hasProphetic && hasGrounded;
  }

  private checkDualExplanation(response: any): boolean {
    const conceptualIndicators = ['concept', 'theory', 'principle', 'idea'];
    const practicalIndicators = ['practice', 'example', 'application', 'use case'];
    const content = response.content?.toLowerCase() || '';
    
    const hasConceptual = conceptualIndicators.some(indicator => content.includes(indicator));
    const hasPractical = practicalIndicators.some(indicator => content.includes(indicator));
    
    return hasConceptual && hasPractical;
  }

  private isCondescending(response: any): boolean {
    const condescendingPatterns = ['obviously', 'clearly', 'simple', 'just', 'merely'];
    const content = response.content?.toLowerCase() || '';
    return condescendingPatterns.some(pattern => content.includes(pattern));
  }

  private treatStudentsAsLessThan(response: any): boolean {
    const negativePatterns = ['you should know', 'you must', 'you failed', 'wrong'];
    const content = response.content?.toLowerCase() || '';
    return negativePatterns.some(pattern => content.includes(pattern));
  }

  private async getCourseAssessments(courseId: string): Promise<any[]> {
    // In production, this would query the database
    return [
      { id: 'a1', type: 'formative', moduleId: 'm1' },
      { id: 'a2', type: 'summative', moduleId: 'm2' },
      { id: 'a3', type: 'reflective', moduleId: 'm3' }
    ];
  }

  private groupAssessmentsByModule(assessments: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = Object.create(null); // Use null prototype to avoid __proto__ issues
    
    for (const assessment of assessments) {
      const moduleId = assessment.moduleId || 'unknown';
      if (!grouped[moduleId]) {
        grouped[moduleId] = [];
      }
      grouped[moduleId].push(assessment);
    }
    
    return grouped;
  }

  private findModulesWithoutAssessments(courseId: string, assessmentsByModule: Record<string, any[]>): string[] {
    // In production, this would query all modules and check which lack assessments
    return [];
  }

  private async getCourseDetails(courseId: string): Promise<any> {
    // In production, this would query the database
    return {
      id: courseId,
      title: 'Sample Course',
      level: 'intermediate',
      modules: []
    };
  }

  private determineTargetLevel(course: any): ProgressionLevel {
    // Map course level to progression level
    const levelMap: Record<string, ProgressionLevel> = {
      'beginner': ProgressionLevel.AWARENESS_VOCABULARY,
      'intermediate': ProgressionLevel.APPLICATION_PROBLEM_SOLVING,
      'advanced': ProgressionLevel.SYSTEM_DESIGN_GOVERNANCE,
      'strategic': ProgressionLevel.MULTIPLICATION_TEACHING
    };

    return levelMap[course.level] || ProgressionLevel.UNDERSTANDING_ANALYSIS;
  }

  private validateContentMapping(course: any, targetLevel: ProgressionLevel): boolean {
    // In production, this would analyze content depth and complexity
    // For now, return true for testing
    return true;
  }

  private validateAssessmentMapping(course: any, targetLevel: ProgressionLevel): boolean {
    // In production, this would analyze assessment rigor and type
    // For now, return true for testing
    return true;
  }
}

export default ScrollPedagogyEnforcerService;
