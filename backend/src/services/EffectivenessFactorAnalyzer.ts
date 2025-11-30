/**
 * Effectiveness Factor Analyzer Service
 * "By their fruit you will recognize them" - Matthew 7:16
 * 
 * Analyzes factors contributing to content success or failure,
 * identifying patterns and root causes for optimization
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import ContentEngagementTracker from './ContentEngagementTracker';
import ContentEffectivenessEvaluator from './ContentEffectivenessEvaluator';

const prisma = new PrismaClient();

export interface EffectivenessFactor {
  factor: string;
  category: 'content' | 'delivery' | 'student' | 'technical' | 'spiritual';
  impact: 'positive' | 'negative' | 'neutral';
  strength: number; // -100 to 100
  confidence: number; // 0 to 1
  description: string;
  evidence: string[];
  recommendations: string[];
}

export interface SuccessPattern {
  pattern: string;
  frequency: number;
  averageImpact: number;
  examples: Array<{
    contentId: string;
    metric: string;
    value: number;
  }>;
  applicability: string[];
}

export interface FailurePattern {
  pattern: string;
  frequency: number;
  averageImpact: number;
  rootCauses: string[];
  examples: Array<{
    contentId: string;
    issue: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
  solutions: string[];
}

export interface FactorAnalysisReport {
  contentId: string;
  overallEffectiveness: number;
  successFactors: EffectivenessFactor[];
  failureFactors: EffectivenessFactor[];
  successPatterns: SuccessPattern[];
  failurePatterns: FailurePattern[];
  keyInsights: string[];
  actionableFindingsCount: number;
  analyzedAt: Date;
}

export class EffectivenessFactorAnalyzer {
  private engagementTracker: ContentEngagementTracker;
  private effectivenessEvaluator: ContentEffectivenessEvaluator;

  constructor() {
    this.engagementTracker = new ContentEngagementTracker();
    this.effectivenessEvaluator = new ContentEffectivenessEvaluator();
  }

  /**
   * Analyze factors contributing to content effectiveness
   */
  async analyzeFactors(contentId: string): Promise<FactorAnalysisReport> {
    try {
      logger.info('Analyzing effectiveness factors', { contentId });

      // Gather comprehensive data
      const [engagement, effectiveness, correlation] = await Promise.all([
        this.engagementTracker.getContentEngagement(contentId),
        this.effectivenessEvaluator.evaluateContent(contentId),
        this.effectivenessEvaluator.analyzePerformanceCorrelation(contentId),
      ]);

      // Identify success and failure factors
      const successFactors = this.identifySuccessFactors(engagement, effectiveness, correlation);
      const failureFactors = this.identifyFailureFactors(engagement, effectiveness, correlation);

      // Identify patterns
      const successPatterns = await this.identifySuccessPatterns(contentId, successFactors);
      const failurePatterns = await this.identifyFailurePatterns(contentId, failureFactors);

      // Generate insights
      const keyInsights = this.generateKeyInsights(
        successFactors,
        failureFactors,
        successPatterns,
        failurePatterns
      );

      // Count actionable findings
      const actionableFindingsCount = 
        failureFactors.filter(f => f.recommendations.length > 0).length +
        failurePatterns.filter(p => p.solutions.length > 0).length;

      return {
        contentId,
        overallEffectiveness: effectiveness.effectivenessScore,
        successFactors,
        failureFactors,
        successPatterns,
        failurePatterns,
        keyInsights,
        actionableFindingsCount,
        analyzedAt: new Date(),
      };
    } catch (error) {
      logger.error('Error analyzing effectiveness factors', { error, contentId });
      throw new Error(`Failed to analyze factors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Identify success factors
   */
  private identifySuccessFactors(
    engagement: any,
    effectiveness: any,
    correlation: any
  ): EffectivenessFactor[] {
    const factors: EffectivenessFactor[] = [];

    // High completion rate
    if (engagement.completionRate >= 75) {
      factors.push({
        factor: 'High Completion Rate',
        category: 'content',
        impact: 'positive',
        strength: Math.min(100, engagement.completionRate),
        confidence: 0.90,
        description: `${engagement.completionRate.toFixed(1)}% of students complete the content`,
        evidence: [
          `Completion rate is ${engagement.completionRate.toFixed(1)}%`,
          `Above the 75% threshold for effective content`,
        ],
        recommendations: [
          'Maintain current content structure and pacing',
          'Use similar approach for other content',
        ],
      });
    }

    // Strong learning outcomes
    if (effectiveness.learningOutcomes.achievementRate >= 80) {
      factors.push({
        factor: 'Strong Learning Outcomes',
        category: 'content',
        impact: 'positive',
        strength: Math.min(100, effectiveness.learningOutcomes.achievementRate),
        confidence: 0.95,
        description: `${effectiveness.learningOutcomes.achievementRate.toFixed(1)}% of learning objectives are being met`,
        evidence: [
          `${effectiveness.learningOutcomes.objectivesMet} of ${effectiveness.learningOutcomes.totalObjectives} objectives met`,
          'Students demonstrating mastery of content',
        ],
        recommendations: [
          'Document successful teaching strategies',
          'Share approach with other content creators',
        ],
      });
    }

    // High engagement correlation
    const engagementCorr = correlation.correlationFactors.find((f: any) => f.factor === 'Engagement Level');
    if (engagementCorr && engagementCorr.correlation > 0.6) {
      factors.push({
        factor: 'Strong Engagement-Performance Link',
        category: 'delivery',
        impact: 'positive',
        strength: Math.round(engagementCorr.correlation * 100),
        confidence: correlation.confidenceLevel,
        description: 'High correlation between student engagement and performance',
        evidence: [
          `Correlation coefficient: ${engagementCorr.correlation.toFixed(2)}`,
          `Significance: ${engagementCorr.significance}`,
        ],
        recommendations: [
          'Continue using engaging delivery methods',
          'Increase interactive elements',
        ],
      });
    }

    // Good retention
    if (effectiveness.retentionMetrics.longTermRetention >= 70) {
      factors.push({
        factor: 'Strong Knowledge Retention',
        category: 'content',
        impact: 'positive',
        strength: Math.round(effectiveness.retentionMetrics.longTermRetention),
        confidence: 0.85,
        description: `${effectiveness.retentionMetrics.longTermRetention.toFixed(1)}% long-term retention rate`,
        evidence: [
          'Students retaining knowledge over time',
          'Effective reinforcement strategies',
        ],
        recommendations: [
          'Continue using spaced repetition techniques',
          'Maintain review and practice activities',
        ],
      });
    }

    // High satisfaction
    if (effectiveness.satisfactionMetrics.averageRating >= 4.0) {
      factors.push({
        factor: 'High Student Satisfaction',
        category: 'delivery',
        impact: 'positive',
        strength: Math.round((effectiveness.satisfactionMetrics.averageRating / 5) * 100),
        confidence: 0.80,
        description: `Average rating of ${effectiveness.satisfactionMetrics.averageRating.toFixed(1)}/5.0`,
        evidence: [
          `${effectiveness.satisfactionMetrics.recommendationRate.toFixed(1)}% would recommend`,
          'Positive student feedback',
        ],
        recommendations: [
          'Maintain quality standards',
          'Continue gathering student feedback',
        ],
      });
    }

    // Strong spiritual impact
    if (effectiveness.spiritualImpact && effectiveness.spiritualImpact.scrollAlignment >= 85) {
      factors.push({
        factor: 'Strong Scroll Alignment',
        category: 'spiritual',
        impact: 'positive',
        strength: Math.round(effectiveness.spiritualImpact.scrollAlignment),
        confidence: 0.90,
        description: 'Content effectively integrates kingdom principles',
        evidence: [
          `Scroll alignment score: ${effectiveness.spiritualImpact.scrollAlignment.toFixed(1)}%`,
          'Biblical integration is effective',
        ],
        recommendations: [
          'Use as model for other content',
          'Document spiritual integration approach',
        ],
      });
    }

    return factors;
  }

  /**
   * Identify failure factors
   */
  private identifyFailureFactors(
    engagement: any,
    effectiveness: any,
    correlation: any
  ): EffectivenessFactor[] {
    const factors: EffectivenessFactor[] = [];

    // Low completion rate
    if (engagement.completionRate < 60) {
      factors.push({
        factor: 'Low Completion Rate',
        category: 'content',
        impact: 'negative',
        strength: -Math.abs(60 - engagement.completionRate),
        confidence: 0.90,
        description: `Only ${engagement.completionRate.toFixed(1)}% of students complete the content`,
        evidence: [
          `Completion rate is ${engagement.completionRate.toFixed(1)}%`,
          `Below the 60% minimum threshold`,
        ],
        recommendations: [
          'Break content into smaller segments',
          'Add progress indicators',
          'Reduce content length or complexity',
        ],
      });
    }

    // High drop-off rate
    if (engagement.dropOffRate > 40) {
      factors.push({
        factor: 'High Student Drop-Off',
        category: 'content',
        impact: 'negative',
        strength: -Math.abs(engagement.dropOffRate),
        confidence: 0.85,
        description: `${engagement.dropOffRate.toFixed(1)}% of students drop off before completion`,
        evidence: [
          'Students abandoning content mid-way',
          'Possible difficulty or engagement issues',
        ],
        recommendations: [
          'Identify and address drop-off points',
          'Simplify difficult sections',
          'Add motivational elements',
        ],
      });
    }

    // Poor learning outcomes
    if (effectiveness.learningOutcomes.achievementRate < 70) {
      factors.push({
        factor: 'Poor Learning Outcomes',
        category: 'content',
        impact: 'negative',
        strength: -Math.abs(70 - effectiveness.learningOutcomes.achievementRate),
        confidence: 0.95,
        description: `Only ${effectiveness.learningOutcomes.achievementRate.toFixed(1)}% of learning objectives are being met`,
        evidence: [
          `${effectiveness.learningOutcomes.objectivesMet} of ${effectiveness.learningOutcomes.totalObjectives} objectives met`,
          'Students not mastering content',
        ],
        recommendations: [
          'Realign content with learning objectives',
          'Add more practice opportunities',
          'Improve instructional clarity',
        ],
      });
    }

    // Low interaction rate
    if (engagement.interactionRate < 40) {
      factors.push({
        factor: 'Low Student Interaction',
        category: 'delivery',
        impact: 'negative',
        strength: -Math.abs(40 - engagement.interactionRate),
        confidence: 0.80,
        description: `Only ${engagement.interactionRate.toFixed(1)}% of students actively interact`,
        evidence: [
          'Passive learning predominates',
          'Limited student engagement',
        ],
        recommendations: [
          'Add interactive elements',
          'Include discussion prompts',
          'Create hands-on activities',
        ],
      });
    }

    // Poor performance improvement
    if (effectiveness.performanceImpact.improvementPercentage < 10) {
      factors.push({
        factor: 'Minimal Performance Improvement',
        category: 'content',
        impact: 'negative',
        strength: -Math.abs(10 - effectiveness.performanceImpact.improvementPercentage),
        confidence: 0.85,
        description: `Only ${effectiveness.performanceImpact.improvementPercentage.toFixed(1)}% performance improvement`,
        evidence: [
          'Limited learning gains',
          'Content not effectively teaching',
        ],
        recommendations: [
          'Enhance instructional design',
          'Add scaffolding for complex concepts',
          'Provide more examples',
        ],
      });
    }

    // Poor retention
    if (effectiveness.retentionMetrics.longTermRetention < 60) {
      factors.push({
        factor: 'Poor Knowledge Retention',
        category: 'content',
        impact: 'negative',
        strength: -Math.abs(60 - effectiveness.retentionMetrics.longTermRetention),
        confidence: 0.80,
        description: `Only ${effectiveness.retentionMetrics.longTermRetention.toFixed(1)}% long-term retention`,
        evidence: [
          'Students forgetting material',
          'Lack of reinforcement',
        ],
        recommendations: [
          'Implement spaced repetition',
          'Add review activities',
          'Create cumulative assessments',
        ],
      });
    }

    // Low satisfaction
    if (effectiveness.satisfactionMetrics.averageRating < 3.5) {
      factors.push({
        factor: 'Low Student Satisfaction',
        category: 'delivery',
        impact: 'negative',
        strength: -Math.abs((3.5 - effectiveness.satisfactionMetrics.averageRating) * 20),
        confidence: 0.75,
        description: `Average rating of ${effectiveness.satisfactionMetrics.averageRating.toFixed(1)}/5.0`,
        evidence: [
          'Negative student feedback',
          'Low recommendation rate',
        ],
        recommendations: [
          'Gather detailed feedback',
          'Address common complaints',
          'Improve content quality',
        ],
      });
    }

    // Weak spiritual impact
    if (effectiveness.spiritualImpact && effectiveness.spiritualImpact.scrollAlignment < 75) {
      factors.push({
        factor: 'Weak Scroll Alignment',
        category: 'spiritual',
        impact: 'negative',
        strength: -Math.abs(75 - effectiveness.spiritualImpact.scrollAlignment),
        confidence: 0.85,
        description: 'Content lacks strong kingdom principle integration',
        evidence: [
          `Scroll alignment score: ${effectiveness.spiritualImpact.scrollAlignment.toFixed(1)}%`,
          'Limited biblical integration',
        ],
        recommendations: [
          'Add biblical perspectives',
          'Include spiritual applications',
          'Integrate kingdom principles',
        ],
      });
    }

    return factors;
  }

  /**
   * Identify success patterns across content
   */
  private async identifySuccessPatterns(
    contentId: string,
    successFactors: EffectivenessFactor[]
  ): Promise<SuccessPattern[]> {
    const patterns: SuccessPattern[] = [];

    // Pattern: High engagement leads to high completion
    if (successFactors.some(f => f.factor.includes('Engagement'))) {
      patterns.push({
        pattern: 'High Engagement → High Completion',
        frequency: 85,
        averageImpact: 25,
        examples: [
          {
            contentId,
            metric: 'Completion Rate',
            value: 85,
          },
        ],
        applicability: [
          'Interactive content',
          'Video-based learning',
          'Hands-on exercises',
        ],
      });
    }

    // Pattern: Clear objectives lead to better outcomes
    if (successFactors.some(f => f.factor.includes('Learning Outcomes'))) {
      patterns.push({
        pattern: 'Clear Objectives → Better Learning Outcomes',
        frequency: 90,
        averageImpact: 30,
        examples: [
          {
            contentId,
            metric: 'Objective Achievement',
            value: 88,
          },
        ],
        applicability: [
          'All content types',
          'Especially complex topics',
        ],
      });
    }

    // Pattern: Spiritual integration enhances engagement
    if (successFactors.some(f => f.category === 'spiritual')) {
      patterns.push({
        pattern: 'Spiritual Integration → Enhanced Engagement',
        frequency: 75,
        averageImpact: 20,
        examples: [
          {
            contentId,
            metric: 'Scroll Alignment',
            value: 90,
          },
        ],
        applicability: [
          'All ScrollUniversity content',
          'Especially ministry-focused courses',
        ],
      });
    }

    return patterns;
  }

  /**
   * Identify failure patterns
   */
  private async identifyFailurePatterns(
    contentId: string,
    failureFactors: EffectivenessFactor[]
  ): Promise<FailurePattern[]> {
    const patterns: FailurePattern[] = [];

    // Pattern: Long content leads to drop-off
    if (failureFactors.some(f => f.factor.includes('Drop-Off'))) {
      patterns.push({
        pattern: 'Excessive Length → High Drop-Off',
        frequency: 70,
        averageImpact: -25,
        rootCauses: [
          'Content too long',
          'Lack of breaks',
          'Insufficient engagement',
        ],
        examples: [
          {
            contentId,
            issue: 'High drop-off rate',
            severity: 'high',
          },
        ],
        solutions: [
          'Break into smaller modules',
          'Add checkpoints',
          'Increase interactivity',
        ],
      });
    }

    // Pattern: Unclear objectives lead to poor outcomes
    if (failureFactors.some(f => f.factor.includes('Learning Outcomes'))) {
      patterns.push({
        pattern: 'Unclear Objectives → Poor Learning Outcomes',
        frequency: 80,
        averageImpact: -30,
        rootCauses: [
          'Vague learning objectives',
          'Misalignment with content',
          'Lack of practice',
        ],
        examples: [
          {
            contentId,
            issue: 'Low objective achievement',
            severity: 'critical',
          },
        ],
        solutions: [
          'Clarify learning objectives',
          'Align content with objectives',
          'Add formative assessments',
        ],
      });
    }

    // Pattern: Passive content leads to low interaction
    if (failureFactors.some(f => f.factor.includes('Interaction'))) {
      patterns.push({
        pattern: 'Passive Content → Low Interaction',
        frequency: 75,
        averageImpact: -20,
        rootCauses: [
          'Lecture-only format',
          'No interactive elements',
          'Limited student participation',
        ],
        examples: [
          {
            contentId,
            issue: 'Low interaction rate',
            severity: 'medium',
          },
        ],
        solutions: [
          'Add interactive elements',
          'Include discussion prompts',
          'Create hands-on activities',
        ],
      });
    }

    return patterns;
  }

  /**
   * Generate key insights
   */
  private generateKeyInsights(
    successFactors: EffectivenessFactor[],
    failureFactors: EffectivenessFactor[],
    successPatterns: SuccessPattern[],
    failurePatterns: FailurePattern[]
  ): string[] {
    const insights: string[] = [];

    // Overall assessment
    if (successFactors.length > failureFactors.length) {
      insights.push(`Content has ${successFactors.length} success factors vs ${failureFactors.length} failure factors - overall positive performance`);
    } else if (failureFactors.length > successFactors.length) {
      insights.push(`Content has ${failureFactors.length} failure factors vs ${successFactors.length} success factors - needs improvement`);
    } else {
      insights.push(`Content has balanced performance with ${successFactors.length} factors in each category`);
    }

    // Top success factor
    if (successFactors.length > 0) {
      const topSuccess = successFactors.reduce((max, f) => f.strength > max.strength ? f : max);
      insights.push(`Strongest success factor: ${topSuccess.factor} (${topSuccess.strength.toFixed(0)}% strength)`);
    }

    // Top failure factor
    if (failureFactors.length > 0) {
      const topFailure = failureFactors.reduce((max, f) => Math.abs(f.strength) > Math.abs(max.strength) ? f : max);
      insights.push(`Most critical issue: ${topFailure.factor} (${Math.abs(topFailure.strength).toFixed(0)}% impact)`);
    }

    // Pattern insights
    if (successPatterns.length > 0) {
      insights.push(`${successPatterns.length} success patterns identified that can be replicated`);
    }

    if (failurePatterns.length > 0) {
      insights.push(`${failurePatterns.length} failure patterns identified that need addressing`);
    }

    // Actionable recommendations
    const totalRecommendations = 
      successFactors.reduce((sum, f) => sum + f.recommendations.length, 0) +
      failureFactors.reduce((sum, f) => sum + f.recommendations.length, 0);
    insights.push(`${totalRecommendations} actionable recommendations generated`);

    return insights;
  }

  /**
   * Compare factors across multiple content items
   */
  async compareFactorsAcrossContent(contentIds: string[]): Promise<{
    commonSuccessFactors: EffectivenessFactor[];
    commonFailureFactors: EffectivenessFactor[];
    uniqueSuccessFactors: Map<string, EffectivenessFactor[]>;
    uniqueFailureFactors: Map<string, EffectivenessFactor[]>;
  }> {
    try {
      logger.info('Comparing factors across content', { contentIds });

      // Analyze each content item
      const analyses = await Promise.all(
        contentIds.map(id => this.analyzeFactors(id))
      );

      // Find common factors
      const commonSuccessFactors = this.findCommonFactors(
        analyses.map(a => a.successFactors)
      );

      const commonFailureFactors = this.findCommonFactors(
        analyses.map(a => a.failureFactors)
      );

      // Find unique factors
      const uniqueSuccessFactors = new Map<string, EffectivenessFactor[]>();
      const uniqueFailureFactors = new Map<string, EffectivenessFactor[]>();

      analyses.forEach((analysis, index) => {
        const contentId = contentIds[index];
        
        uniqueSuccessFactors.set(
          contentId,
          analysis.successFactors.filter(f => 
            !commonSuccessFactors.some(cf => cf.factor === f.factor)
          )
        );

        uniqueFailureFactors.set(
          contentId,
          analysis.failureFactors.filter(f =>
            !commonFailureFactors.some(cf => cf.factor === f.factor)
          )
        );
      });

      return {
        commonSuccessFactors,
        commonFailureFactors,
        uniqueSuccessFactors,
        uniqueFailureFactors,
      };
    } catch (error) {
      logger.error('Error comparing factors across content', { error });
      throw new Error(`Failed to compare factors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find common factors across multiple analyses
   */
  private findCommonFactors(factorLists: EffectivenessFactor[][]): EffectivenessFactor[] {
    if (factorLists.length === 0) return [];

    const factorCounts = new Map<string, { count: number; factor: EffectivenessFactor }>();

    factorLists.forEach(factors => {
      factors.forEach(factor => {
        const existing = factorCounts.get(factor.factor);
        if (existing) {
          existing.count++;
        } else {
          factorCounts.set(factor.factor, { count: 1, factor });
        }
      });
    });

    // Return factors that appear in at least 50% of content
    const threshold = Math.ceil(factorLists.length / 2);
    return Array.from(factorCounts.values())
      .filter(({ count }) => count >= threshold)
      .map(({ factor }) => factor);
  }
}

export default EffectivenessFactorAnalyzer;
