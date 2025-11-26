// ScrollPedagogy Validator Service
// "The Spirit of truth will guide you into all truth" - John 16:13
// Enforces the 6-step pedagogical flow for all ScrollUniversity content

import { logger } from '../utils/logger';

/**
 * 6-Step Pedagogical Flow Components
 */
export interface PedagogicalFlow {
  ignition: IgnitionComponent;
  download: DownloadComponent;
  demonstration: DemonstrationComponent;
  activation: ActivationComponent;
  reflection: ReflectionComponent;
  commission: CommissionComponent;
}

export interface IgnitionComponent {
  hook: string; // Story, question, scripture, or scenario
  revelationTrigger: string; // Element that awakens mind and spirit
  engagementQuestions?: string[]; // Optional questions to engage students
  estimatedDuration: number; // Minutes
}

export interface DownloadComponent {
  concepts: ConceptTeaching[];
  examples: string[]; // Examples and analogies
  diagrams?: string[]; // Visual aids descriptions
  stepByStepWalkthroughs?: string[]; // For technical content
  estimatedDuration: number; // Minutes
}

export interface ConceptTeaching {
  conceptName: string;
  explanation: string;
  keyTerms: string[];
  practicalApplication: string;
}

export interface DemonstrationComponent {
  workedExamples: WorkedExample[];
  estimatedDuration: number; // Minutes
}

export interface WorkedExample {
  title: string;
  scenario: string;
  stepByStepSolution: string[];
  keyLearningPoints: string[];
  type: 'coding' | 'equation' | 'business_case' | 'theological_exegesis' | 'other';
}

export interface ActivationComponent {
  practiceActivities: PracticeActivity[];
  estimatedDuration: number; // Minutes
}

export interface PracticeActivity {
  title: string;
  description: string;
  instructions: string[];
  expectedOutcome: string;
  type: 'problem_solving' | 'design' | 'reflection' | 'prayer' | 'project' | 'other';
}

export interface ReflectionComponent {
  identityQuestions: string[]; // Questions connecting learning to identity
  callingQuestions: string[]; // Questions about calling and transformation
  spiritualIntegration: string; // How this connects to spiritual growth
  estimatedDuration: number; // Minutes
}

export interface CommissionComponent {
  nextSteps: string[]; // Clear action items
  assignments: Assignment[];
  applicationChallenges: string[]; // Real-world application opportunities
  estimatedDuration: number; // Minutes
}

export interface Assignment {
  title: string;
  description: string;
  dueDate?: string;
  type: 'quiz' | 'project' | 'reflection' | 'practical_application' | 'prayer_assignment';
}

/**
 * Validation Results
 */
export interface PedagogyValidationResult {
  isValid: boolean;
  overallScore: number; // 0-100
  componentScores: {
    ignition: number;
    download: number;
    demonstration: number;
    activation: number;
    reflection: number;
    commission: number;
  };
  violations: PedagogyViolation[];
  recommendations: string[];
  totalEstimatedDuration: number; // Minutes
}

export interface PedagogyViolation {
  component: keyof PedagogicalFlow;
  severity: 'critical' | 'major' | 'minor';
  issue: string;
  recommendation: string;
}

/**
 * Progression Levels
 */
export enum ProgressionLevel {
  AWARENESS_VOCABULARY = 1,
  UNDERSTANDING_ANALYSIS = 2,
  APPLICATION_PROBLEM_SOLVING = 3,
  SYSTEM_DESIGN_GOVERNANCE = 4,
  MULTIPLICATION_TEACHING = 5
}

export interface ProgressionLevelMapping {
  level: ProgressionLevel;
  description: string;
  requiredComponents: string[];
  assessmentTypes: string[];
}

/**
 * ScrollPedagogy Validator Service
 * Validates content against the 6-step pedagogical flow
 */
export default class ScrollPedagogyValidator {
  private readonly MINIMUM_COMPONENT_SCORE = 70;
  private readonly MINIMUM_OVERALL_SCORE = 75;

  /**
   * Validate pedagogical flow of content
   */
  async validatePedagogicalFlow(
    content: any,
    contentType: 'lecture' | 'module' | 'course'
  ): Promise<PedagogyValidationResult> {
    logger.info('Validating pedagogical flow', { contentType });

    const violations: PedagogyViolation[] = [];
    const componentScores = {
      ignition: 0,
      download: 0,
      demonstration: 0,
      activation: 0,
      reflection: 0,
      commission: 0
    };

    // Validate each component
    const ignitionScore = this.validateIgnition(content, violations);
    const downloadScore = this.validateDownload(content, violations);
    const demonstrationScore = this.validateDemonstration(content, violations);
    const activationScore = this.validateActivation(content, violations);
    const reflectionScore = this.validateReflection(content, violations);
    const commissionScore = this.validateCommission(content, violations);

    componentScores.ignition = ignitionScore;
    componentScores.download = downloadScore;
    componentScores.demonstration = demonstrationScore;
    componentScores.activation = activationScore;
    componentScores.reflection = reflectionScore;
    componentScores.commission = commissionScore;

    // Calculate overall score
    const overallScore = Object.values(componentScores).reduce((sum, score) => sum + score, 0) / 6;

    // Generate recommendations
    const recommendations = this.generateRecommendations(componentScores, violations);

    // Calculate total duration
    const totalEstimatedDuration = this.calculateTotalDuration(content);

    const result: PedagogyValidationResult = {
      isValid: overallScore >= this.MINIMUM_OVERALL_SCORE && violations.filter(v => v.severity === 'critical').length === 0,
      overallScore,
      componentScores,
      violations,
      recommendations,
      totalEstimatedDuration
    };

    logger.info('Pedagogical flow validation complete', {
      isValid: result.isValid,
      overallScore: result.overallScore,
      criticalViolations: violations.filter(v => v.severity === 'critical').length,
      totalDuration: totalEstimatedDuration
    });

    return result;
  }

  /**
   * Validate Ignition component (Hook + Revelation Trigger)
   */
  private validateIgnition(content: any, violations: PedagogyViolation[]): number {
    let score = 100;

    // Check for introduction/hook
    if (!content.introduction || content.introduction.length < 200) {
      violations.push({
        component: 'ignition',
        severity: 'critical',
        issue: 'Missing or insufficient ignition/hook (introduction < 200 chars)',
        recommendation: 'Add compelling story, question, scripture, or scenario to engage students (300+ words recommended)'
      });
      score -= 40;
    }

    // Check for engagement elements
    const hasEngagementQuestions = content.discussionQuestions && content.discussionQuestions.length > 0;
    const hasBiblicalIntegration = content.biblicalIntegration && content.biblicalIntegration.scriptureReferences;

    if (!hasEngagementQuestions && !hasBiblicalIntegration) {
      violations.push({
        component: 'ignition',
        severity: 'major',
        issue: 'Missing revelation trigger elements (no engagement questions or biblical integration)',
        recommendation: 'Add questions like "What would you do if...?" or "Have you ever experienced...?" and include relevant scripture'
      });
      score -= 30;
    }

    return Math.max(0, score);
  }

  /**
   * Validate Download component (Concept Teaching)
   */
  private validateDownload(content: any, violations: PedagogyViolation[]): number {
    let score = 100;

    // Check for main content sections
    if (!content.mainContent || !Array.isArray(content.mainContent) || content.mainContent.length < 3) {
      violations.push({
        component: 'download',
        severity: 'critical',
        issue: `Insufficient concept teaching sections (${content.mainContent?.length || 0} sections, need 3+)`,
        recommendation: 'Add clear explanations of key concepts with examples, analogies, and diagrams'
      });
      score -= 50;
    }

    // Check content depth
    if (content.mainContent && Array.isArray(content.mainContent)) {
      const shortSections = content.mainContent.filter((section: any) => 
        !section.content || section.content.length < 300
      );

      if (shortSections.length > 0) {
        violations.push({
          component: 'download',
          severity: 'major',
          issue: `${shortSections.length} sections lack sufficient depth (< 300 chars)`,
          recommendation: 'Each concept section should have 400+ words with detailed explanations'
        });
        score -= 20;
      }
    }

    // Check for examples and analogies
    if (!content.examples || content.examples.length < 2) {
      violations.push({
        component: 'download',
        severity: 'minor',
        issue: 'Insufficient examples to support concept teaching',
        recommendation: 'Add 3-4 practical examples with detailed explanations'
      });
      score -= 15;
    }

    return Math.max(0, score);
  }

  /**
   * Validate Demonstration component (Worked Examples)
   */
  private validateDemonstration(content: any, violations: PedagogyViolation[]): number {
    let score = 100;

    // Check for worked examples
    if (!content.examples || content.examples.length < 2) {
      violations.push({
        component: 'demonstration',
        severity: 'critical',
        issue: `Insufficient worked examples (${content.examples?.length || 0}, need 2+)`,
        recommendation: 'Add concrete worked examples: coding examples, solved equations, business cases, or theological exegesis'
      });
      score -= 50;
    }

    // Check for case studies
    if (!content.caseStudies || content.caseStudies.length < 1) {
      violations.push({
        component: 'demonstration',
        severity: 'major',
        issue: 'Missing case studies for practical demonstration',
        recommendation: 'Add 1-2 comprehensive case studies showing real-world application'
      });
      score -= 30;
    }

    // Validate example quality
    if (content.examples && Array.isArray(content.examples)) {
      const weakExamples = content.examples.filter((ex: any) => 
        !ex.explanation || ex.explanation.length < 150
      );

      if (weakExamples.length > 0) {
        violations.push({
          component: 'demonstration',
          severity: 'minor',
          issue: `${weakExamples.length} examples lack detailed step-by-step solutions`,
          recommendation: 'Each example should have detailed walkthrough with key learning points'
        });
        score -= 20;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Validate Activation component (Student Practice)
   */
  private validateActivation(content: any, violations: PedagogyViolation[]): number {
    let score = 100;

    // Check for practice activities
    const hasPracticeProblems = content.practiceProblems && content.practiceProblems.length > 0;
    const hasAssignments = content.assignments && content.assignments.length > 0;
    const hasDiscussionQuestions = content.discussionQuestions && content.discussionQuestions.length >= 3;

    if (!hasPracticeProblems && !hasAssignments && !hasDiscussionQuestions) {
      violations.push({
        component: 'activation',
        severity: 'critical',
        issue: 'No student practice activities found',
        recommendation: 'Add practice problems, assignments, or activities where students actively engage with the material'
      });
      score -= 60;
    }

    // Check for variety of practice types
    const practiceTypes = [hasPracticeProblems, hasAssignments, hasDiscussionQuestions].filter(Boolean).length;
    if (practiceTypes < 2) {
      violations.push({
        component: 'activation',
        severity: 'minor',
        issue: 'Limited variety in practice activities',
        recommendation: 'Include multiple types: problem-solving, design tasks, reflections, and practical applications'
      });
      score -= 20;
    }

    return Math.max(0, score);
  }

  /**
   * Validate Reflection component (Identity & Integration)
   */
  private validateReflection(content: any, violations: PedagogyViolation[]): number {
    let score = 100;

    // Check for reflection questions
    if (!content.discussionQuestions || content.discussionQuestions.length < 3) {
      violations.push({
        component: 'reflection',
        severity: 'major',
        issue: 'Insufficient reflection questions for identity integration',
        recommendation: 'Add 5+ questions connecting learning to identity, calling, and transformation'
      });
      score -= 40;
    }

    // Check for spiritual integration
    if (!content.biblicalIntegration || !content.biblicalIntegration.spiritualApplication) {
      violations.push({
        component: 'reflection',
        severity: 'major',
        issue: 'Missing spiritual integration and application',
        recommendation: 'Add spiritual application connecting learning to faith and calling'
      });
      score -= 40;
    }

    // Check for reflection questions quality
    if (content.biblicalIntegration && content.biblicalIntegration.reflectionQuestions) {
      if (content.biblicalIntegration.reflectionQuestions.length < 3) {
        violations.push({
          component: 'reflection',
          severity: 'minor',
          issue: 'Limited spiritual reflection questions',
          recommendation: 'Add more questions connecting faith, learning, and calling'
        });
        score -= 20;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Validate Commission component (Next Steps)
   */
  private validateCommission(content: any, violations: PedagogyViolation[]): number {
    let score = 100;

    // Check for clear next steps
    const hasKeyTakeaways = content.keyTakeaways && content.keyTakeaways.length >= 3;
    const hasAssignments = content.assignments && content.assignments.length > 0;
    const hasFurtherReading = content.furtherReading && content.furtherReading.length > 0;

    if (!hasKeyTakeaways) {
      violations.push({
        component: 'commission',
        severity: 'critical',
        issue: 'Missing key takeaways for student commission',
        recommendation: 'Add 3-5 clear takeaways summarizing what students should remember and do'
      });
      score -= 40;
    }

    if (!hasAssignments && !hasFurtherReading) {
      violations.push({
        component: 'commission',
        severity: 'major',
        issue: 'No clear next steps or assignments',
        recommendation: 'Add specific assignments or action items: complete quiz, apply in workplace, pray through specific area'
      });
      score -= 40;
    }

    // Check for actionable commission
    if (content.keyTakeaways && Array.isArray(content.keyTakeaways)) {
      const vagueTakeaways = content.keyTakeaways.filter((takeaway: string) => 
        typeof takeaway === 'string' && takeaway.length < 30
      );

      if (vagueTakeaways.length > 0) {
        violations.push({
          component: 'commission',
          severity: 'minor',
          issue: 'Some takeaways lack specificity and actionability',
          recommendation: 'Make takeaways specific and actionable with clear "go and do" instructions'
        });
        score -= 20;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(
    componentScores: Record<string, number>,
    violations: PedagogyViolation[]
  ): string[] {
    const recommendations: string[] = [];

    // Priority recommendations based on critical violations
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    if (criticalViolations.length > 0) {
      recommendations.push('CRITICAL: Address all critical violations before content approval');
      criticalViolations.forEach(v => {
        recommendations.push(`- ${v.component.toUpperCase()}: ${v.recommendation}`);
      });
    }

    // Component-specific recommendations
    Object.entries(componentScores).forEach(([component, score]) => {
      if (score < this.MINIMUM_COMPONENT_SCORE) {
        recommendations.push(`Improve ${component} component (score: ${score}/100) to meet minimum standards`);
      }
    });

    // General pedagogical recommendations
    if (componentScores.ignition < 80) {
      recommendations.push('Strengthen the ignition/hook to better engage students from the start');
    }

    if (componentScores.demonstration < 80) {
      recommendations.push('Add more worked examples with detailed step-by-step solutions');
    }

    if (componentScores.reflection < 80) {
      recommendations.push('Deepen reflection questions to better connect learning to identity and calling');
    }

    return recommendations;
  }

  /**
   * Calculate total estimated duration
   */
  private calculateTotalDuration(content: any): number {
    let duration = 0;

    // Base lecture time
    if (content.introduction) duration += 5;
    if (content.mainContent) duration += content.mainContent.length * 10;
    if (content.examples) duration += content.examples.length * 5;
    if (content.caseStudies) duration += content.caseStudies.length * 10;
    if (content.discussionQuestions) duration += 10;
    if (content.summary) duration += 5;

    return duration;
  }

  /**
   * Validate progression level mapping
   */
  async validateProgressionLevel(
    content: any,
    targetLevel: ProgressionLevel
  ): Promise<{ isValid: boolean; actualLevel: ProgressionLevel; recommendations: string[] }> {
    logger.info('Validating progression level', { targetLevel });

    const recommendations: string[] = [];
    let actualLevel = this.detectProgressionLevel(content);

    if (actualLevel !== targetLevel) {
      recommendations.push(
        `Content appears to be at Level ${actualLevel} but target is Level ${targetLevel}`
      );

      if (actualLevel < targetLevel) {
        recommendations.push('Increase complexity and depth to match target level');
        recommendations.push(this.getProgressionLevelGuidance(targetLevel));
      } else {
        recommendations.push('Simplify content or adjust target level');
      }
    }

    return {
      isValid: actualLevel === targetLevel,
      actualLevel,
      recommendations
    };
  }

  /**
   * Detect progression level from content
   */
  private detectProgressionLevel(content: any): ProgressionLevel {
    // Simple heuristic based on content complexity
    const hasBasicConcepts = content.mainContent && content.mainContent.length >= 3;
    const hasExamples = content.examples && content.examples.length >= 2;
    const hasCaseStudies = content.caseStudies && content.caseStudies.length >= 1;
    const hasPracticeProblems = content.practiceProblems && content.practiceProblems.length >= 3;
    const hasAdvancedTopics = content.mainContent && content.mainContent.some((section: any) => 
      section.title && (section.title.includes('Advanced') || section.title.includes('Design') || section.title.includes('Architecture'))
    );

    if (hasAdvancedTopics && hasCaseStudies && hasPracticeProblems) {
      return ProgressionLevel.SYSTEM_DESIGN_GOVERNANCE;
    } else if (hasCaseStudies && hasPracticeProblems) {
      return ProgressionLevel.APPLICATION_PROBLEM_SOLVING;
    } else if (hasExamples && hasBasicConcepts) {
      return ProgressionLevel.UNDERSTANDING_ANALYSIS;
    } else {
      return ProgressionLevel.AWARENESS_VOCABULARY;
    }
  }

  /**
   * Get guidance for specific progression level
   */
  private getProgressionLevelGuidance(level: ProgressionLevel): string {
    const guidance: Record<ProgressionLevel, string> = {
      [ProgressionLevel.AWARENESS_VOCABULARY]: 
        'Focus on introducing key terms and basic concepts with clear definitions',
      [ProgressionLevel.UNDERSTANDING_ANALYSIS]: 
        'Include analysis of concepts, comparisons, and deeper explanations with examples',
      [ProgressionLevel.APPLICATION_PROBLEM_SOLVING]: 
        'Add practical problems, case studies, and real-world application scenarios',
      [ProgressionLevel.SYSTEM_DESIGN_GOVERNANCE]: 
        'Include system design challenges, architectural decisions, and governance considerations',
      [ProgressionLevel.MULTIPLICATION_TEACHING]: 
        'Add teaching opportunities, mentoring scenarios, and knowledge transfer activities'
    };

    return guidance[level] || 'Adjust content complexity to match target level';
  }

  /**
   * Extract pedagogical flow from content
   */
  extractPedagogicalFlow(content: any): Partial<PedagogicalFlow> {
    return {
      ignition: {
        hook: content.introduction || '',
        revelationTrigger: content.biblicalIntegration?.scriptureReferences?.[0]?.text || '',
        engagementQuestions: content.discussionQuestions?.slice(0, 2) || [],
        estimatedDuration: 5
      },
      download: {
        concepts: (content.mainContent || []).map((section: any) => ({
          conceptName: section.title || 'Concept',
          explanation: section.content || '',
          keyTerms: [],
          practicalApplication: ''
        })),
        examples: (content.examples || []).map((ex: any) => ex.title || ''),
        estimatedDuration: (content.mainContent?.length || 0) * 10
      },
      demonstration: {
        workedExamples: (content.examples || []).map((ex: any) => ({
          title: ex.title || '',
          scenario: ex.description || '',
          stepByStepSolution: [ex.explanation || ''],
          keyLearningPoints: [],
          type: 'other' as const
        })),
        estimatedDuration: (content.examples?.length || 0) * 5
      },
      activation: {
        practiceActivities: (content.practiceProblems || []).map((problem: any) => ({
          title: problem.title || 'Practice Activity',
          description: problem.description || '',
          instructions: [],
          expectedOutcome: '',
          type: 'problem_solving' as const
        })),
        estimatedDuration: 15
      },
      reflection: {
        identityQuestions: content.discussionQuestions?.slice(0, 3) || [],
        callingQuestions: content.biblicalIntegration?.reflectionQuestions || [],
        spiritualIntegration: content.biblicalIntegration?.spiritualApplication || '',
        estimatedDuration: 10
      },
      commission: {
        nextSteps: content.keyTakeaways || [],
        assignments: content.assignments || [],
        applicationChallenges: [],
        estimatedDuration: 5
      }
    };
  }
}
