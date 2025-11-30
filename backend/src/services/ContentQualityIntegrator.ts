/**
 * Content Quality Integrator Service
 * Integrates all quality assurance checks for comprehensive content validation
 * "Test everything; hold fast what is good" - 1 Thessalonians 5:21
 */

import FactualAccuracyChecker, {
  FactCheckRequest,
  FactCheckResult,
} from './FactualAccuracyChecker';
import ContentConsistencyChecker, {
  ConsistencyCheckRequest,
  ConsistencyCheckResult,
} from './ContentConsistencyChecker';
import SourceAttributionManager, {
  AttributionCheckRequest,
  AttributionCheckResult,
} from './SourceAttributionManager';
import QualityMetricsService from './QualityMetricsService';
import TheologicalAlignmentService from './TheologicalAlignmentService';
import { AIServiceType } from '../types/qa.types';
import { logger } from '../utils/productionLogger';

export interface ComprehensiveQualityCheck {
  contentId: string;
  overallScore: number;
  passed: boolean;
  factualAccuracy: FactCheckResult;
  consistency: ConsistencyCheckResult;
  attribution: AttributionCheckResult;
  theologicalAlignment?: {
    score: number;
    approved: boolean;
    concerns: any[];
  };
  recommendations: string[];
  requiresReview: boolean;
  checkedAt: Date;
}

export interface QualityCheckRequest {
  contentId: string;
  content: string;
  contentType: 'lecture' | 'assessment' | 'reading' | 'module' | 'textbook';
  courseId: string;
  moduleId?: string;
  subject: string;
  academicLevel: string;
  citationFormat?: 'APA' | 'MLA' | 'Chicago' | 'Turabian';
  requireSources?: boolean;
  checkTheology?: boolean;
  relatedContentIds?: string[];
}

export class ContentQualityIntegrator {
  private factChecker: FactualAccuracyChecker;
  private consistencyChecker: ContentConsistencyChecker;
  private attributionManager: SourceAttributionManager;
  private qualityMetrics: QualityMetricsService;
  private theologicalAlignment: TheologicalAlignmentService;

  private qualityThreshold: number = 0.85;

  constructor() {
    this.factChecker = new FactualAccuracyChecker();
    this.consistencyChecker = new ContentConsistencyChecker();
    this.attributionManager = new SourceAttributionManager();
    this.qualityMetrics = new QualityMetricsService();
    this.theologicalAlignment = new TheologicalAlignmentService();
  }

  /**
   * Perform comprehensive quality check
   */
  async performComprehensiveCheck(
    request: QualityCheckRequest
  ): Promise<ComprehensiveQualityCheck> {
    try {
      logger.info('Starting comprehensive quality check', {
        contentId: request.contentId,
        contentType: request.contentType,
        courseId: request.courseId,
      });

      // Run all checks in parallel
      const [factualAccuracy, consistency, attribution, theologicalCheck] =
        await Promise.all([
          // Factual accuracy check
          this.factChecker.checkAccuracy({
            contentId: request.contentId,
            content: request.content,
            contentType: request.contentType,
            subject: request.subject,
            academicLevel: request.academicLevel,
            requireSources: request.requireSources,
          }),

          // Consistency check
          this.consistencyChecker.checkConsistency({
            contentId: request.contentId,
            content: request.content,
            contentType: request.contentType,
            courseId: request.courseId,
            moduleId: request.moduleId,
            relatedContentIds: request.relatedContentIds,
          }),

          // Attribution check
          this.attributionManager.checkAttribution({
            contentId: request.contentId,
            content: request.content,
            contentType: request.contentType,
            citationFormat: request.citationFormat,
            requireAttribution: request.requireSources,
          }),

          // Theological alignment check (if requested)
          request.checkTheology
            ? this.theologicalAlignment.checkAlignment(
                request.content,
                'content_creation' as AIServiceType,
                {
                  topic: request.subject,
                  audience: request.academicLevel,
                  purpose: request.contentType,
                }
              )
            : Promise.resolve(null),
        ]);

      // Calculate overall score
      const overallScore = this.calculateOverallScore(
        factualAccuracy,
        consistency,
        attribution,
        theologicalCheck
      );

      // Aggregate recommendations
      const recommendations = this.aggregateRecommendations(
        factualAccuracy,
        consistency,
        attribution,
        theologicalCheck
      );

      // Determine if passed
      const passed =
        overallScore >= this.qualityThreshold &&
        factualAccuracy.verified &&
        consistency.approved &&
        attribution.compliant &&
        (!theologicalCheck || theologicalCheck.approved);

      // Determine if requires review
      const requiresReview =
        !passed ||
        factualAccuracy.claims.some(c => c.needsReview) ||
        consistency.contradictions.some(c => c.severity === 'critical') ||
        attribution.ipIssues.some(i => i.requiresLegalReview) ||
        (theologicalCheck &&
          theologicalCheck.concerns.some((c: any) => c.severity === 'critical'));

      const result: ComprehensiveQualityCheck = {
        contentId: request.contentId,
        overallScore,
        passed,
        factualAccuracy,
        consistency,
        attribution,
        theologicalAlignment: theologicalCheck
          ? {
              score: theologicalCheck.score,
              approved: theologicalCheck.approved,
              concerns: theologicalCheck.concerns,
            }
          : undefined,
        recommendations,
        requiresReview,
        checkedAt: new Date(),
      };

      // Store comprehensive check result
      await this.storeComprehensiveCheck(result);

      // Update quality metrics
      await this.updateQualityMetrics(request, result);

      logger.info('Comprehensive quality check completed', {
        contentId: request.contentId,
        overallScore,
        passed,
        requiresReview,
      });

      return result;
    } catch (error) {
      logger.error('Error performing comprehensive quality check', {
        error,
        contentId: request.contentId,
      });
      throw error;
    }
  }

  /**
   * Batch perform quality checks
   */
  async batchPerformChecks(
    requests: QualityCheckRequest[]
  ): Promise<ComprehensiveQualityCheck[]> {
    try {
      logger.info('Starting batch quality checks', { count: requests.length });

      const results = await Promise.all(
        requests.map(request => this.performComprehensiveCheck(request))
      );

      return results;
    } catch (error) {
      logger.error('Error in batch quality checks', { error });
      throw error;
    }
  }

  /**
   * Get quality check history
   */
  async getQualityCheckHistory(
    contentId: string
  ): Promise<ComprehensiveQualityCheck[]> {
    try {
      logger.info('Retrieving quality check history', { contentId });
      // In production, this would query from database
      return [];
    } catch (error) {
      logger.error('Error retrieving quality check history', { error, contentId });
      throw error;
    }
  }

  /**
   * Get quality metrics for course
   */
  async getCourseQualityMetrics(courseId: string): Promise<{
    averageScore: number;
    passRate: number;
    commonIssues: Array<{ issue: string; count: number }>;
    improvementTrend: 'improving' | 'declining' | 'stable';
  }> {
    try {
      logger.info('Calculating course quality metrics', { courseId });

      // In production, this would aggregate from database
      // For now, return placeholder data
      return {
        averageScore: 0.92,
        passRate: 0.88,
        commonIssues: [
          { issue: 'Missing citations', count: 15 },
          { issue: 'Terminology inconsistency', count: 8 },
          { issue: 'Unverified claims', count: 5 },
        ],
        improvementTrend: 'improving',
      };
    } catch (error) {
      logger.error('Error calculating course quality metrics', { error, courseId });
      throw error;
    }
  }

  // Private helper methods

  /**
   * Calculate overall quality score
   */
  private calculateOverallScore(
    factualAccuracy: FactCheckResult,
    consistency: ConsistencyCheckResult,
    attribution: AttributionCheckResult,
    theologicalCheck: any | null
  ): number {
    const weights = {
      factual: 0.30,
      consistency: 0.25,
      attribution: 0.25,
      theological: 0.20,
    };

    let score =
      factualAccuracy.overallAccuracy * weights.factual +
      consistency.consistencyScore * weights.consistency +
      attribution.attributionScore * weights.attribution;

    if (theologicalCheck) {
      score += theologicalCheck.score * weights.theological;
    } else {
      // Redistribute theological weight if not checked
      const redistributedWeight = weights.theological / 3;
      score +=
        factualAccuracy.overallAccuracy * redistributedWeight +
        consistency.consistencyScore * redistributedWeight +
        attribution.attributionScore * redistributedWeight;
    }

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Aggregate recommendations from all checks
   */
  private aggregateRecommendations(
    factualAccuracy: FactCheckResult,
    consistency: ConsistencyCheckResult,
    attribution: AttributionCheckResult,
    theologicalCheck: any | null
  ): string[] {
    const recommendations: string[] = [];

    // Add factual accuracy recommendations
    if (factualAccuracy.recommendations.length > 0) {
      recommendations.push('FACTUAL ACCURACY:');
      recommendations.push(...factualAccuracy.recommendations);
    }

    // Add consistency recommendations
    if (consistency.recommendations.length > 0) {
      recommendations.push('CONSISTENCY:');
      recommendations.push(...consistency.recommendations);
    }

    // Add attribution recommendations
    if (attribution.recommendations.length > 0) {
      recommendations.push('ATTRIBUTION:');
      recommendations.push(...attribution.recommendations);
    }

    // Add theological recommendations
    if (theologicalCheck && theologicalCheck.concerns.length > 0) {
      recommendations.push('THEOLOGICAL ALIGNMENT:');
      recommendations.push(
        ...theologicalCheck.concerns.map(
          (c: any) => `${c.severity.toUpperCase()}: ${c.description}`
        )
      );
    }

    return recommendations;
  }

  /**
   * Store comprehensive check result
   */
  private async storeComprehensiveCheck(
    result: ComprehensiveQualityCheck
  ): Promise<void> {
    try {
      // In production, this would store in database
      logger.debug('Storing comprehensive quality check result', {
        contentId: result.contentId,
        overallScore: result.overallScore,
        passed: result.passed,
      });
    } catch (error) {
      logger.error('Error storing comprehensive check result', { error });
    }
  }

  /**
   * Update quality metrics
   */
  private async updateQualityMetrics(
    request: QualityCheckRequest,
    result: ComprehensiveQualityCheck
  ): Promise<void> {
    try {
      // In production, this would update metrics in database
      logger.debug('Updating quality metrics', {
        contentId: request.contentId,
        overallScore: result.overallScore,
      });
    } catch (error) {
      logger.error('Error updating quality metrics', { error });
    }
  }
}

export default ContentQualityIntegrator;
