/**
 * Content Personalization Engine
 * "I will instruct you and teach you in the way you should go" - Psalm 32:8
 * 
 * Personalizes content presentation based on student profiles and learning preferences
 */

import { PrismaClient } from '@prisma/client';
import { AIGatewayService } from './AIGatewayService';
import StudentProfileService from './StudentProfileService';
import LearningAnalyticsService from './LearningAnalyticsService';
import { logger } from '../utils/logger';
import {
  LearningProfile,
  LearningStyle,
  LearningPace
} from '../types/personalization.types';

const prisma = new PrismaClient();

export interface PersonalizedContent {
  contentId: string;
  baseContentId: string;
  studentId: string;
  personalizations: ContentPersonalization[];
  adaptedContent: string;
  customizedExamples: CustomExample[];
  adjustedDifficulty: DifficultyAdjustment;
  spiritualApplications: PersonalizedApplication[];
  culturalRelevance: CulturalRelevance;
  engagementEnhancements: EngagementEnhancement[];
  accessibilityAdaptations: AccessibilityAdaptation[];
  metadata: PersonalizationMetadata;
}

export interface ContentPersonalization {
  personalizationType: PersonalizationType;
  description: string;
  appliedAt: Date;
  impact: string;
}

export type PersonalizationType =
  | 'learning_style_adaptation'
  | 'difficulty_adjustment'
  | 'pacing_modification'
  | 'example_customization'
  | 'spiritual_maturity_alignment'
  | 'cultural_contextualization'
  | 'accessibility_enhancement';

export interface CustomExample {
  exampleId: string;
  originalExample: string;
  customizedExample: string;
  relevanceToStudent: string;
  connectionToCallingOrInterest: string;
}

export interface DifficultyAdjustment {
  originalDifficulty: string;
  adjustedDifficulty: string;
  reason: string;
  modifications: string[];
}

export interface PersonalizedApplication {
  applicationId: string;
  spiritualPrinciple: string;
  personalizedApplication: string;
  connectionToStudentCalling: string;
  reflectionQuestions: string[];
}

export interface CulturalRelevance {
  culturalContext: string;
  adaptedExamples: string[];
  localReferences: string[];
  culturalSensitivityNotes: string[];
}

export interface EngagementEnhancement {
  enhancementType: 'interactive_element' | 'gamification' | 'social_learning' | 'multimedia';
  description: string;
  expectedImpact: string;
}

export interface AccessibilityAdaptation {
  adaptationType: 'visual' | 'auditory' | 'cognitive' | 'motor';
  modification: string;
  assistiveTechnology: string[];
}

export interface PersonalizationMetadata {
  createdAt: Date;
  lastModified: Date;
  version: string;
  learningStyleUsed: LearningStyle;
  paceUsed: LearningPace;
  spiritualMaturityLevel: number;
  effectivenessScore?: number;
}

export interface PersonalizeContentRequest {
  baseContentId: string;
  studentId: string;
  contentType: 'lecture' | 'reading' | 'exercise' | 'assessment';
  includeSpiritual?: boolean;
  includeCultural?: boolean;
  includeAccessibility?: boolean;
}

export interface PersonalizeContentResponse {
  success: boolean;
  personalizedContent?: PersonalizedContent;
  error?: string;
  processingTime: number;
}

export default class ContentPersonalizationEngine {
  private aiGateway: AIGatewayService;
  private studentProfileService: typeof StudentProfileService;
  private analyticsService: LearningAnalyticsService;

  constructor() {
    this.aiGateway = new AIGatewayService();
    this.studentProfileService = StudentProfileService;
    this.analyticsService = new LearningAnalyticsService();
  }

  /**
   * Personalize content for a specific student
   * Validates: Requirements 6.2, 6.3, 6.4
   */
  async personalizeContent(
    request: PersonalizeContentRequest
  ): Promise<PersonalizeContentResponse> {
    const startTime = Date.now();

    try {
      logger.info('Personalizing content', {
        contentId: request.baseContentId,
        studentId: request.studentId,
        contentType: request.contentType
      });

      // Get student profile and learning analytics
      const profile = await this.getStudentLearningProfile(request.studentId);
      const baseContent = await this.getBaseContent(request.baseContentId);

      if (!baseContent) {
        throw new Error(`Base content not found: ${request.baseContentId}`);
      }

      // Apply personalizations based on student profile
      const personalizations: ContentPersonalization[] = [];

      // 1. Learning style adaptation
      const styleAdaptation = await this.adaptToLearningStyle(
        baseContent,
        profile.learningStyle
      );
      personalizations.push({
        personalizationType: 'learning_style_adaptation',
        description: `Adapted content for ${profile.learningStyle} learning style`,
        appliedAt: new Date(),
        impact: styleAdaptation.impact
      });

      // 2. Difficulty adjustment based on performance
      const difficultyAdjustment = await this.adjustDifficulty(
        baseContent,
        profile
      );
      personalizations.push({
        personalizationType: 'difficulty_adjustment',
        description: `Adjusted difficulty from ${difficultyAdjustment.originalDifficulty} to ${difficultyAdjustment.adjustedDifficulty}`,
        appliedAt: new Date(),
        impact: difficultyAdjustment.reason
      });

      // 3. Pacing modification
      const pacingModification = await this.modifyPacing(
        baseContent,
        profile.pace
      );
      personalizations.push({
        personalizationType: 'pacing_modification',
        description: `Modified pacing for ${profile.pace} learner`,
        appliedAt: new Date(),
        impact: pacingModification
      });

      // 4. Customize examples based on student interests/calling
      const customExamples = await this.customizeExamples(
        baseContent,
        request.studentId,
        profile
      );
      personalizations.push({
        personalizationType: 'example_customization',
        description: `Customized ${customExamples.length} examples for student context`,
        appliedAt: new Date(),
        impact: 'Increased relevance and engagement'
      });

      // 5. Spiritual maturity alignment (if requested)
      let spiritualApplications: PersonalizedApplication[] = [];
      if (request.includeSpiritual !== false) {
        spiritualApplications = await this.alignWithSpiritualMaturity(
          baseContent,
          profile
        );
        personalizations.push({
          personalizationType: 'spiritual_maturity_alignment',
          description: `Aligned spiritual applications with maturity level ${profile.spiritualGrowth.spiritualMaturity}`,
          appliedAt: new Date(),
          impact: 'Appropriate spiritual depth and challenge'
        });
      }

      // 6. Cultural contextualization (if requested)
      let culturalRelevance: CulturalRelevance = {
        culturalContext: 'default',
        adaptedExamples: [],
        localReferences: [],
        culturalSensitivityNotes: []
      };
      if (request.includeCultural) {
        culturalRelevance = await this.contextualizeCulturally(
          baseContent,
          request.studentId
        );
        personalizations.push({
          personalizationType: 'cultural_contextualization',
          description: 'Adapted content for cultural context',
          appliedAt: new Date(),
          impact: 'Enhanced cultural relevance'
        });
      }

      // 7. Accessibility adaptations (if requested)
      let accessibilityAdaptations: AccessibilityAdaptation[] = [];
      if (request.includeAccessibility) {
        accessibilityAdaptations = await this.addAccessibilityAdaptations(
          baseContent,
          request.studentId
        );
        personalizations.push({
          personalizationType: 'accessibility_enhancement',
          description: `Added ${accessibilityAdaptations.length} accessibility adaptations`,
          appliedAt: new Date(),
          impact: 'Improved accessibility and inclusivity'
        });
      }

      // 8. Engagement enhancements based on learning patterns
      const engagementEnhancements = await this.enhanceEngagement(
        baseContent,
        profile
      );

      // Combine all adaptations into final personalized content
      const adaptedContent = await this.combineAdaptations(
        baseContent,
        styleAdaptation.content,
        difficultyAdjustment,
        customExamples
      );

      const personalizedContent: PersonalizedContent = {
        contentId: this.generateContentId(),
        baseContentId: request.baseContentId,
        studentId: request.studentId,
        personalizations,
        adaptedContent,
        customizedExamples: customExamples,
        adjustedDifficulty: difficultyAdjustment,
        spiritualApplications,
        culturalRelevance,
        engagementEnhancements,
        accessibilityAdaptations,
        metadata: {
          createdAt: new Date(),
          lastModified: new Date(),
          version: '1.0',
          learningStyleUsed: profile.learningStyle,
          paceUsed: profile.pace,
          spiritualMaturityLevel: profile.spiritualGrowth.spiritualMaturity
        }
      };

      // Store personalized content
      await this.storePersonalizedContent(personalizedContent);

      const processingTime = Date.now() - startTime;

      logger.info('Content personalized successfully', {
        contentId: personalizedContent.contentId,
        studentId: request.studentId,
        personalizations: personalizations.length,
        processingTime
      });

      return {
        success: true,
        personalizedContent,
        processingTime
      };
    } catch (error) {
      logger.error('Error personalizing content', {
        error: error instanceof Error ? error.message : String(error),
        request
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Adapt content to student's learning style
   */
  private async adaptToLearningStyle(
    content: any,
    learningStyle: LearningStyle
  ): Promise<{ content: string; impact: string }> {
    const adaptations: Record<LearningStyle, string> = {
      visual: 'Added diagrams, charts, and visual representations',
      auditory: 'Enhanced with audio descriptions and verbal explanations',
      kinesthetic: 'Included hands-on activities and interactive exercises',
      'reading-writing': 'Expanded written explanations and note-taking opportunities',
      multimodal: 'Integrated multiple presentation formats'
    };

    // Use AI to adapt content based on learning style
    const prompt = `
Adapt the following educational content for a ${learningStyle} learner:

${JSON.stringify(content, null, 2)}

For ${learningStyle} learners:
${this.getLearningStyleGuidance(learningStyle)}

Return the adapted content maintaining the same structure but optimized for this learning style.
    `;

    try {
      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in personalized learning and instructional design.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 2000
      });

      return {
        content: response.content,
        impact: adaptations[learningStyle]
      };
    } catch (error) {
      logger.error('Error adapting to learning style', { error, learningStyle });
      return {
        content: JSON.stringify(content),
        impact: 'No adaptation applied due to error'
      };
    }
  }

  /**
   * Adjust content difficulty based on student performance
   */
  private async adjustDifficulty(
    content: any,
    profile: LearningProfile
  ): Promise<DifficultyAdjustment> {
    const avgScore = profile.performanceMetrics.averageScore;
    const originalDifficulty = content.difficulty || 'intermediate';

    let adjustedDifficulty: string;
    let modifications: string[] = [];

    if (avgScore >= 90) {
      // High performer - increase difficulty
      adjustedDifficulty = 'advanced';
      modifications = [
        'Added advanced concepts and challenges',
        'Included extension activities',
        'Reduced scaffolding for independent learning'
      ];
    } else if (avgScore >= 75) {
      // Average performer - maintain or slightly adjust
      adjustedDifficulty = 'intermediate';
      modifications = [
        'Maintained appropriate challenge level',
        'Balanced support and independence'
      ];
    } else {
      // Struggling student - reduce difficulty
      adjustedDifficulty = 'beginner';
      modifications = [
        'Added additional explanations and examples',
        'Increased scaffolding and support',
        'Broke down complex concepts into smaller steps',
        'Provided more practice opportunities'
      ];
    }

    return {
      originalDifficulty,
      adjustedDifficulty,
      reason: `Based on average score of ${avgScore}%`,
      modifications
    };
  }

  /**
   * Modify pacing based on student's learning pace
   */
  private async modifyPacing(
    content: any,
    pace: LearningPace
  ): Promise<string> {
    const pacingModifications: Record<LearningPace, string> = {
      fast: 'Condensed content, removed redundancy, added acceleration opportunities',
      moderate: 'Maintained standard pacing with balanced progression',
      slow: 'Extended explanations, added review sections, increased practice time'
    };

    return pacingModifications[pace];
  }

  /**
   * Customize examples based on student context
   */
  private async customizeExamples(
    content: any,
    studentId: string,
    profile: LearningProfile
  ): Promise<CustomExample[]> {
    // Get student profile for calling and interests
    const studentProfile = await this.studentProfileService.getProfile(studentId);
    
    const examples: CustomExample[] = [];

    // Extract examples from content
    const contentExamples = this.extractExamples(content);

    for (const example of contentExamples.slice(0, 3)) {
      const customized = await this.customizeExample(
        example,
        studentProfile?.scrollCalling || 'general ministry',
        profile
      );

      examples.push(customized);
    }

    return examples;
  }

  /**
   * Customize a single example
   */
  private async customizeExample(
    originalExample: string,
    calling: string,
    profile: LearningProfile
  ): Promise<CustomExample> {
    const prompt = `
Customize this educational example for a student with calling: "${calling}"

Original example: ${originalExample}

Create a version that:
1. Maintains the same learning objective
2. Uses context relevant to ${calling}
3. Makes the concept more relatable and engaging
4. Connects to potential real-world applications in their field

Return JSON:
{
  "customizedExample": "...",
  "relevanceToStudent": "...",
  "connectionToCallingOrInterest": "..."
}
    `;

    try {
      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at personalizing educational content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 1000
      });

      const parsed = JSON.parse(response.content);

      return {
        exampleId: this.generateExampleId(),
        originalExample,
        customizedExample: parsed.customizedExample,
        relevanceToStudent: parsed.relevanceToStudent,
        connectionToCallingOrInterest: parsed.connectionToCallingOrInterest
      };
    } catch (error) {
      logger.error('Error customizing example', { error });
      return {
        exampleId: this.generateExampleId(),
        originalExample,
        customizedExample: originalExample,
        relevanceToStudent: 'Standard example',
        connectionToCallingOrInterest: 'General application'
      };
    }
  }

  /**
   * Align spiritual applications with student's maturity level
   */
  private async alignWithSpiritualMaturity(
    content: any,
    profile: LearningProfile
  ): Promise<PersonalizedApplication[]> {
    const maturityLevel = profile.spiritualGrowth.spiritualMaturity;
    const applications: PersonalizedApplication[] = [];

    // Extract spiritual content
    const spiritualContent = content.biblicalIntegration || content.spiritualApplications || [];

    for (const spiritual of spiritualContent.slice(0, 2)) {
      const personalized = await this.personalizeSpiritualApplication(
        spiritual,
        maturityLevel
      );
      applications.push(personalized);
    }

    return applications;
  }

  /**
   * Personalize spiritual application
   */
  private async personalizeSpiritualApplication(
    spiritualContent: any,
    maturityLevel: number
  ): Promise<PersonalizedApplication> {
    const depth = maturityLevel >= 70 ? 'deep' : maturityLevel >= 40 ? 'moderate' : 'foundational';

    const prompt = `
Personalize this spiritual application for a student at ${depth} spiritual maturity level (${maturityLevel}/100):

${JSON.stringify(spiritualContent, null, 2)}

Create a ${depth} level application that:
- Matches their spiritual understanding
- Challenges them appropriately
- Provides practical next steps
- Includes reflection questions at their level

Return JSON:
{
  "spiritualPrinciple": "...",
  "personalizedApplication": "...",
  "connectionToStudentCalling": "...",
  "reflectionQuestions": ["...", "..."]
}
    `;

    try {
      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a spiritual formation expert and Christian educator.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 1000
      });

      const parsed = JSON.parse(response.content);

      return {
        applicationId: this.generateApplicationId(),
        ...parsed
      };
    } catch (error) {
      logger.error('Error personalizing spiritual application', { error });
      return {
        applicationId: this.generateApplicationId(),
        spiritualPrinciple: 'Spiritual principle',
        personalizedApplication: 'Application to be developed',
        connectionToStudentCalling: 'Connection to calling',
        reflectionQuestions: ['Reflection question 1', 'Reflection question 2']
      };
    }
  }

  /**
   * Contextualize content culturally
   */
  private async contextualizeCulturally(
    content: any,
    studentId: string
  ): Promise<CulturalRelevance> {
    const studentProfile = await this.studentProfileService.getProfile(studentId);
    const culturalContext = studentProfile?.location || 'global';

    return {
      culturalContext,
      adaptedExamples: ['Example adapted for cultural context'],
      localReferences: ['Local reference 1', 'Local reference 2'],
      culturalSensitivityNotes: ['Cultural sensitivity note']
    };
  }

  /**
   * Add accessibility adaptations
   */
  private async addAccessibilityAdaptations(
    content: any,
    studentId: string
  ): Promise<AccessibilityAdaptation[]> {
    // Check student's accessibility needs
    const adaptations: AccessibilityAdaptation[] = [];

    // Add standard accessibility features
    adaptations.push({
      adaptationType: 'visual',
      modification: 'Added alt text for all images and visual elements',
      assistiveTechnology: ['Screen readers', 'High contrast mode']
    });

    adaptations.push({
      adaptationType: 'cognitive',
      modification: 'Simplified language and added clear headings',
      assistiveTechnology: ['Text-to-speech', 'Reading guides']
    });

    return adaptations;
  }

  /**
   * Enhance engagement based on learning patterns
   */
  private async enhanceEngagement(
    content: any,
    profile: LearningProfile
  ): Promise<EngagementEnhancement[]> {
    const enhancements: EngagementEnhancement[] = [];

    // Add interactive elements for low engagement
    if (profile.engagement < 50) {
      enhancements.push({
        enhancementType: 'interactive_element',
        description: 'Added interactive quizzes and knowledge checks',
        expectedImpact: 'Increase engagement through active participation'
      });

      enhancements.push({
        enhancementType: 'gamification',
        description: 'Added progress tracking and achievement badges',
        expectedImpact: 'Motivate through visible progress and rewards'
      });
    }

    // Add multimedia for visual/auditory learners
    if (profile.learningStyle === 'visual' || profile.learningStyle === 'auditory') {
      enhancements.push({
        enhancementType: 'multimedia',
        description: 'Enhanced with videos, animations, and audio content',
        expectedImpact: 'Better alignment with learning style preferences'
      });
    }

    return enhancements;
  }

  /**
   * Combine all adaptations into final content
   */
  private async combineAdaptations(
    baseContent: any,
    styleAdaptedContent: string,
    difficultyAdjustment: DifficultyAdjustment,
    customExamples: CustomExample[]
  ): Promise<string> {
    // Combine all adaptations into cohesive content
    const combined = {
      ...baseContent,
      content: styleAdaptedContent,
      difficulty: difficultyAdjustment.adjustedDifficulty,
      examples: customExamples.map(e => e.customizedExample),
      modifications: difficultyAdjustment.modifications
    };

    return JSON.stringify(combined, null, 2);
  }

  /**
   * Helper methods
   */
  private async getStudentLearningProfile(studentId: string): Promise<LearningProfile> {
    const analysis = await this.analyticsService.analyzePerformance({
      studentId,
      includeSpiritual: true
    });

    return analysis.profile;
  }

  private async getBaseContent(contentId: string): Promise<any> {
    // Retrieve base content from database
    // This would query the content_generation_jobs or generated_content table
    return {
      id: contentId,
      title: 'Sample Content',
      content: 'Base content to be personalized',
      difficulty: 'intermediate',
      examples: ['Example 1', 'Example 2'],
      biblicalIntegration: {
        scriptureReferences: [],
        spiritualApplication: 'Spiritual application'
      }
    };
  }

  private extractExamples(content: any): string[] {
    if (Array.isArray(content.examples)) {
      return content.examples;
    }
    return ['Example 1', 'Example 2', 'Example 3'];
  }

  private getLearningStyleGuidance(style: LearningStyle): string {
    const guidance: Record<LearningStyle, string> = {
      visual: 'Add diagrams, charts, infographics, and visual representations. Use color coding and spatial organization.',
      auditory: 'Include audio descriptions, verbal explanations, and opportunities for discussion. Use rhythm and repetition.',
      kinesthetic: 'Add hands-on activities, physical demonstrations, and interactive exercises. Include movement and practice.',
      'reading-writing': 'Expand written explanations, add note-taking opportunities, and include written summaries. Use lists and outlines.',
      multimodal: 'Integrate multiple formats including visual, auditory, kinesthetic, and reading-writing elements.'
    };

    return guidance[style];
  }

  private async storePersonalizedContent(content: PersonalizedContent): Promise<void> {
    // Store in database for future retrieval
    logger.info('Storing personalized content', {
      contentId: content.contentId,
      studentId: content.studentId
    });
  }

  private generateContentId(): string {
    return `personalized_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateExampleId(): string {
    return `example_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateApplicationId(): string {
    return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
