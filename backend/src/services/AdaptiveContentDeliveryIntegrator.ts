/**
 * Adaptive Content Delivery Integrator
 * "The Lord will guide you always" - Isaiah 58:11
 * 
 * Integrates all personalization services to deliver adaptive content
 * Coordinates with PathOptimizationService and ContentCreationService
 */

import ContentPersonalizationEngine, {
  PersonalizeContentRequest,
  PersonalizedContent
} from './ContentPersonalizationEngine';
import DifficultyAdaptationService from './DifficultyAdaptationService';
import EnrichmentContentGenerator from './EnrichmentContentGenerator';
import PathOptimizationService from './PathOptimizationService';
import ContentCreationService from './ContentCreationService';
import { logger } from '../utils/logger';

export interface AdaptiveDeliveryRequest {
  studentId: string;
  courseId: string;
  moduleId?: string;
  lectureId?: string;
  includeEnrichment?: boolean;
  includePathOptimization?: boolean;
}

export interface AdaptiveDeliveryResponse {
  success: boolean;
  personalizedContent?: PersonalizedContent;
  enrichmentContent?: any;
  pathRecommendations?: any;
  adaptationsSummary: AdaptationSummary;
  error?: string;
}

export interface AdaptationSummary {
  totalAdaptations: number;
  adaptationTypes: string[];
  difficultyAdjusted: boolean;
  enrichmentProvided: boolean;
  pathOptimized: boolean;
  estimatedImpact: string;
}

export class AdaptiveContentDeliveryIntegrator {
  private personalizationEngine: ContentPersonalizationEngine;
  private difficultyService: DifficultyAdaptationService;
  private enrichmentGenerator: EnrichmentContentGenerator;
  private pathOptimizer: PathOptimizationService;
  private contentCreation: ContentCreationService;

  constructor() {
    this.personalizationEngine = new ContentPersonalizationEngine();
    this.difficultyService = new DifficultyAdaptationService();
    this.enrichmentGenerator = new EnrichmentContentGenerator();
    this.pathOptimizer = new PathOptimizationService();
    this.contentCreation = new ContentCreationService();
  }

  /**
   * Deliver fully adaptive content to student
   * Integrates: ContentPersonalizationEngine, DifficultyAdaptationService, 
   *             EnrichmentContentGenerator, PathOptimizationService, ContentCreationService
   * Validates: Requirements 6.2, 6.3, 6.4
   */
  async deliverAdaptiveContent(
    request: AdaptiveDeliveryRequest
  ): Promise<AdaptiveDeliveryResponse> {
    try {
      logger.info('Delivering adaptive content', {
        studentId: request.studentId,
        courseId: request.courseId,
        moduleId: request.moduleId
      });

      const adaptationsSummary: AdaptationSummary = {
        totalAdaptations: 0,
        adaptationTypes: [],
        difficultyAdjusted: false,
        enrichmentProvided: false,
        pathOptimized: false,
        estimatedImpact: ''
      };

      // 1. Get base content from ContentCreationService
      const baseContent = await this.getBaseContent(
        request.courseId,
        request.moduleId,
        request.lectureId
      );

      if (!baseContent) {
        throw new Error('Base content not found');
      }

      // 2. Personalize content using ContentPersonalizationEngine
      const personalizationRequest: PersonalizeContentRequest = {
        baseContentId: baseContent.id,
        studentId: request.studentId,
        contentType: 'lecture',
        includeSpiritual: true,
        includeCultural: true,
        includeAccessibility: true
      };

      const personalizationResult = await this.personalizationEngine.personalizeContent(
        personalizationRequest
      );

      if (!personalizationResult.success || !personalizationResult.personalizedContent) {
        throw new Error('Content personalization failed');
      }

      const personalizedContent = personalizationResult.personalizedContent;
      adaptationsSummary.totalAdaptations += personalizedContent.personalizations.length;
      adaptationsSummary.adaptationTypes.push(...personalizedContent.personalizations.map(p => p.personalizationType));

      // 3. Apply difficulty adaptation if needed
      const difficultyResult = await this.difficultyService.adaptDifficulty({
        studentId: request.studentId,
        contentId: baseContent.id,
        currentDifficulty: baseContent.difficulty || 'intermediate',
        contentType: 'lecture'
      });

      if (difficultyResult.success && difficultyResult.recommendation) {
        const rec = difficultyResult.recommendation;
        if (rec.currentDifficulty.level !== rec.recommendedDifficulty.level) {
          adaptationsSummary.difficultyAdjusted = true;
          adaptationsSummary.totalAdaptations++;
          adaptationsSummary.adaptationTypes.push('difficulty_adjustment');

          // Update personalized content with difficulty adaptation
          if (difficultyResult.adaptedContent) {
            personalizedContent.adaptedContent = JSON.stringify(difficultyResult.adaptedContent);
            personalizedContent.adjustedDifficulty = {
              originalDifficulty: rec.currentDifficulty.level,
              adjustedDifficulty: rec.recommendedDifficulty.level,
              reason: rec.reason,
              modifications: rec.adaptationStrategies.map(s => s.description)
            };
          }
        }
      }

      // 4. Generate enrichment content for high performers (if requested)
      let enrichmentContent = null;
      if (request.includeEnrichment) {
        const enrichmentResult = await this.enrichmentGenerator.generateEnrichment({
          baseContentId: baseContent.id,
          studentId: request.studentId,
          topic: baseContent.title || 'Course Topic',
          enrichmentTypes: ['advanced_concepts', 'research_project'],
          includeResearch: true,
          includeRealWorld: true
        });

        if (enrichmentResult.success && enrichmentResult.enrichmentContent) {
          enrichmentContent = enrichmentResult.enrichmentContent;
          adaptationsSummary.enrichmentProvided = true;
          adaptationsSummary.totalAdaptations++;
          adaptationsSummary.adaptationTypes.push('enrichment_content');
        }
      }

      // 5. Optimize learning path (if requested)
      let pathRecommendations = null;
      if (request.includePathOptimization) {
        const pathResult = await this.pathOptimizer.optimizePath({
          studentId: request.studentId,
          goals: {
            goalType: 'degree',
            targetSkills: [],
            careerAlignment: 'ministry'
          }
        });

        if (pathResult.success && pathResult.learningPath) {
          pathRecommendations = {
            currentPath: pathResult.learningPath,
            alternativePaths: pathResult.alternativePaths,
            nextRecommendedCourses: pathResult.learningPath.recommendedCourses.slice(0, 3)
          };
          adaptationsSummary.pathOptimized = true;
          adaptationsSummary.totalAdaptations++;
          adaptationsSummary.adaptationTypes.push('path_optimization');
        }
      }

      // 6. Calculate estimated impact
      adaptationsSummary.estimatedImpact = this.calculateEstimatedImpact(adaptationsSummary);

      logger.info('Adaptive content delivered successfully', {
        studentId: request.studentId,
        totalAdaptations: adaptationsSummary.totalAdaptations,
        types: adaptationsSummary.adaptationTypes
      });

      return {
        success: true,
        personalizedContent,
        enrichmentContent,
        pathRecommendations,
        adaptationsSummary
      };
    } catch (error) {
      logger.error('Error delivering adaptive content', {
        error: error instanceof Error ? error.message : String(error),
        request
      });

      return {
        success: false,
        adaptationsSummary: {
          totalAdaptations: 0,
          adaptationTypes: [],
          difficultyAdjusted: false,
          enrichmentProvided: false,
          pathOptimized: false,
          estimatedImpact: 'No adaptations applied due to error'
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get base content from ContentCreationService
   */
  private async getBaseContent(
    courseId: string,
    moduleId?: string,
    lectureId?: string
  ): Promise<any> {
    // This would integrate with ContentCreationService to retrieve content
    // For now, return mock content
    return {
      id: lectureId || `lecture_${Date.now()}`,
      courseId,
      moduleId,
      title: 'Sample Lecture',
      content: 'Base lecture content',
      difficulty: 'intermediate',
      examples: ['Example 1', 'Example 2'],
      biblicalIntegration: {
        scriptureReferences: [],
        spiritualApplication: 'Spiritual application'
      }
    };
  }

  /**
   * Calculate estimated impact of adaptations
   */
  private calculateEstimatedImpact(summary: AdaptationSummary): string {
    const impacts: string[] = [];

    if (summary.totalAdaptations === 0) {
      return 'No adaptations applied - content delivered as standard';
    }

    if (summary.adaptationTypes.includes('learning_style_adaptation')) {
      impacts.push('Better alignment with learning preferences');
    }

    if (summary.difficultyAdjusted) {
      impacts.push('Appropriate challenge level for current performance');
    }

    if (summary.enrichmentProvided) {
      impacts.push('Advanced opportunities for excellence and growth');
    }

    if (summary.adaptationTypes.includes('spiritual_maturity_alignment')) {
      impacts.push('Spiritually appropriate depth and application');
    }

    if (summary.adaptationTypes.includes('cultural_contextualization')) {
      impacts.push('Enhanced cultural relevance and engagement');
    }

    if (summary.pathOptimized) {
      impacts.push('Optimized learning path toward goals');
    }

    if (impacts.length === 0) {
      return 'General content improvements applied';
    }

    return impacts.join('; ');
  }

  /**
   * Batch deliver adaptive content for multiple students
   */
  async batchDeliverAdaptiveContent(
    requests: AdaptiveDeliveryRequest[]
  ): Promise<AdaptiveDeliveryResponse[]> {
    logger.info('Batch delivering adaptive content', {
      count: requests.length
    });

    const results: AdaptiveDeliveryResponse[] = [];

    for (const request of requests) {
      const result = await this.deliverAdaptiveContent(request);
      results.push(result);
    }

    logger.info('Batch delivery complete', {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });

    return results;
  }

  /**
   * Get adaptation history for student
   */
  async getAdaptationHistory(
    studentId: string,
    limit: number = 10
  ): Promise<any[]> {
    logger.info('Retrieving adaptation history', { studentId, limit });

    // This would query database for historical adaptations
    return [];
  }

  /**
   * Analyze adaptation effectiveness
   */
  async analyzeAdaptationEffectiveness(
    studentId: string,
    timeframe: { startDate: Date; endDate: Date }
  ): Promise<any> {
    logger.info('Analyzing adaptation effectiveness', { studentId, timeframe });

    // This would analyze how adaptations have impacted student performance
    return {
      overallEffectiveness: 85,
      mostEffectiveAdaptations: ['difficulty_adjustment', 'learning_style_adaptation'],
      leastEffectiveAdaptations: [],
      recommendations: ['Continue current adaptation strategy']
    };
  }
}

export default AdaptiveContentDeliveryIntegrator;
