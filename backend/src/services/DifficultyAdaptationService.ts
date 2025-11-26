/**
 * Difficulty Adaptation Service
 * "To him who is able to do immeasurably more than all we ask or imagine" - Ephesians 3:20
 * 
 * Dynamically adjusts learning difficulty based on student performance and progress
 */

import { PrismaClient } from '@prisma/client';
import { AIGatewayService } from './AIGatewayService';
import LearningAnalyticsService from './LearningAnalyticsService';
import { logger } from '../utils/logger';
import {
  LearningProfile,
  PerformanceMetrics
} from '../types/personalization.types';

const prisma = new PrismaClient();

export interface DifficultyLevel {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  score: number; // 1-10
  description: string;
}

export interface AdaptationRecommendation {
  currentDifficulty: DifficultyLevel;
  recommendedDifficulty: DifficultyLevel;
  reason: string;
  confidence: number; // 0-100
  supportingEvidence: string[];
  adaptationStrategies: AdaptationStrategy[];
}

export interface AdaptationStrategy {
  strategyType: StrategyType;
  description: string;
  implementation: string;
  expectedImpact: string;
}

export type StrategyType =
  | 'add_scaffolding'
  | 'remove_scaffolding'
  | 'increase_complexity'
  | 'simplify_concepts'
  | 'add_examples'
  | 'add_challenges'
  | 'adjust_pacing'
  | 'modify_assessment';

export interface AdaptDifficultyRequest {
  studentId: string;
  contentId: string;
  currentDifficulty: string;
  contentType: 'lecture' | 'reading' | 'exercise' | 'assessment';
}

export interface AdaptDifficultyResponse {
  success: boolean;
  recommendation?: AdaptationRecommendation;
  adaptedContent?: any;
  error?: string;
}

export default class DifficultyAdaptationService {
  private aiGateway: AIGatewayService;
  private analyticsService: LearningAnalyticsService;

  constructor() {
    this.aiGateway = new AIGatewayService();
    this.analyticsService = new LearningAnalyticsService();
  }

  /**
   * Adapt content difficulty based on student performance
   * Validates: Requirements 6.2
   */
  async adaptDifficulty(
    request: AdaptDifficultyRequest
  ): Promise<AdaptDifficultyResponse> {
    try {
      logger.info('Adapting content difficulty', {
        studentId: request.studentId,
        contentId: request.contentId,
        currentDifficulty: request.currentDifficulty
      });

      // Get student performance profile
      const profile = await this.getStudentProfile(request.studentId);

      // Analyze if difficulty adjustment is needed
      const recommendation = await this.analyzeDifficultyNeeds(
        profile,
        request.currentDifficulty,
        request.contentType
      );

      // If no change needed, return current difficulty
      if (recommendation.currentDifficulty.level === recommendation.recommendedDifficulty.level) {
        logger.info('No difficulty adjustment needed', {
          studentId: request.studentId,
          currentLevel: recommendation.currentDifficulty.level
        });

        return {
          success: true,
          recommendation
        };
      }

      // Apply difficulty adaptation
      const adaptedContent = await this.applyDifficultyAdaptation(
        request.contentId,
        recommendation
      );

      logger.info('Difficulty adapted successfully', {
        studentId: request.studentId,
        from: recommendation.currentDifficulty.level,
        to: recommendation.recommendedDifficulty.level
      });

      return {
        success: true,
        recommendation,
        adaptedContent
      };
    } catch (error) {
      logger.error('Error adapting difficulty', {
        error: error instanceof Error ? error.message : String(error),
        request
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Analyze if difficulty adjustment is needed
   */
  private async analyzeDifficultyNeeds(
    profile: LearningProfile,
    currentDifficulty: string,
    contentType: string
  ): Promise<AdaptationRecommendation> {
    const metrics = profile.performanceMetrics;
    const currentLevel = this.parseDifficultyLevel(currentDifficulty);

    // Determine recommended difficulty based on performance
    const recommendedLevel = this.calculateRecommendedDifficulty(metrics, currentLevel);

    // Build recommendation
    const recommendation: AdaptationRecommendation = {
      currentDifficulty: currentLevel,
      recommendedDifficulty: recommendedLevel,
      reason: this.generateRecommendationReason(metrics, currentLevel, recommendedLevel),
      confidence: this.calculateConfidence(metrics),
      supportingEvidence: this.gatherSupportingEvidence(metrics, profile),
      adaptationStrategies: this.generateAdaptationStrategies(
        currentLevel,
        recommendedLevel,
        contentType
      )
    };

    return recommendation;
  }

  /**
   * Calculate recommended difficulty level
   */
  private calculateRecommendedDifficulty(
    metrics: PerformanceMetrics,
    currentLevel: DifficultyLevel
  ): DifficultyLevel {
    const avgScore = metrics.averageScore;
    const completionRate = metrics.completionRate;
    const trend = metrics.improvementTrend;

    // High performance - increase difficulty
    if (avgScore >= 90 && completionRate >= 90 && trend === 'improving') {
      return this.increaseDifficulty(currentLevel, 2);
    }

    if (avgScore >= 85 && completionRate >= 85) {
      return this.increaseDifficulty(currentLevel, 1);
    }

    // Struggling - decrease difficulty
    if (avgScore < 60 || completionRate < 60 || trend === 'declining') {
      return this.decreaseDifficulty(currentLevel, 2);
    }

    if (avgScore < 70 || completionRate < 70) {
      return this.decreaseDifficulty(currentLevel, 1);
    }

    // Maintain current level
    return currentLevel;
  }

  /**
   * Increase difficulty level
   */
  private increaseDifficulty(current: DifficultyLevel, steps: number): DifficultyLevel {
    const levels: Array<DifficultyLevel['level']> = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentIndex = levels.indexOf(current.level);
    const newIndex = Math.min(currentIndex + steps, levels.length - 1);

    return this.createDifficultyLevel(levels[newIndex]);
  }

  /**
   * Decrease difficulty level
   */
  private decreaseDifficulty(current: DifficultyLevel, steps: number): DifficultyLevel {
    const levels: Array<DifficultyLevel['level']> = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentIndex = levels.indexOf(current.level);
    const newIndex = Math.max(currentIndex - steps, 0);

    return this.createDifficultyLevel(levels[newIndex]);
  }

  /**
   * Generate adaptation strategies
   */
  private generateAdaptationStrategies(
    currentLevel: DifficultyLevel,
    recommendedLevel: DifficultyLevel,
    contentType: string
  ): AdaptationStrategy[] {
    const strategies: AdaptationStrategy[] = [];

    const isIncreasing = recommendedLevel.score > currentLevel.score;

    if (isIncreasing) {
      // Strategies for increasing difficulty
      strategies.push({
        strategyType: 'remove_scaffolding',
        description: 'Reduce guided support and hints',
        implementation: 'Remove step-by-step instructions, expect more independent problem-solving',
        expectedImpact: 'Develops critical thinking and self-reliance'
      });

      strategies.push({
        strategyType: 'increase_complexity',
        description: 'Add more complex concepts and multi-step problems',
        implementation: 'Introduce advanced topics, require synthesis of multiple concepts',
        expectedImpact: 'Challenges student to think at higher cognitive levels'
      });

      strategies.push({
        strategyType: 'add_challenges',
        description: 'Include extension activities and advanced applications',
        implementation: 'Add optional challenge problems, real-world complex scenarios',
        expectedImpact: 'Provides opportunities for excellence and deeper mastery'
      });
    } else {
      // Strategies for decreasing difficulty
      strategies.push({
        strategyType: 'add_scaffolding',
        description: 'Provide more guided support and structure',
        implementation: 'Add step-by-step instructions, hints, and worked examples',
        expectedImpact: 'Builds confidence and ensures foundational understanding'
      });

      strategies.push({
        strategyType: 'simplify_concepts',
        description: 'Break down complex ideas into smaller, manageable pieces',
        implementation: 'Chunk content, use simpler language, add more explanations',
        expectedImpact: 'Reduces cognitive load and improves comprehension'
      });

      strategies.push({
        strategyType: 'add_examples',
        description: 'Provide more worked examples and practice opportunities',
        implementation: 'Add 2-3 additional examples with detailed explanations',
        expectedImpact: 'Reinforces learning through repetition and varied contexts'
      });

      strategies.push({
        strategyType: 'adjust_pacing',
        description: 'Slow down progression and add review sections',
        implementation: 'Add review activities, reduce content per session',
        expectedImpact: 'Allows more time for mastery before moving forward'
      });
    }

    // Content-type specific strategies
    if (contentType === 'assessment') {
      strategies.push({
        strategyType: 'modify_assessment',
        description: isIncreasing 
          ? 'Add more challenging question types and open-ended problems'
          : 'Simplify questions and add more multiple choice options',
        implementation: isIncreasing
          ? 'Include essay questions, case analyses, and synthesis tasks'
          : 'Use more recognition-based questions, provide word banks',
        expectedImpact: isIncreasing
          ? 'Assesses higher-order thinking skills'
          : 'Reduces test anxiety and assesses core understanding'
      });
    }

    return strategies;
  }

  /**
   * Apply difficulty adaptation to content
   */
  private async applyDifficultyAdaptation(
    contentId: string,
    recommendation: AdaptationRecommendation
  ): Promise<any> {
    // Get original content
    const content = await this.getContent(contentId);

    // Use AI to adapt content based on strategies
    const prompt = `
Adapt the following educational content from ${recommendation.currentDifficulty.level} to ${recommendation.recommendedDifficulty.level} level.

Original Content:
${JSON.stringify(content, null, 2)}

Adaptation Strategies to Apply:
${recommendation.adaptationStrategies.map(s => `- ${s.strategyType}: ${s.description}`).join('\n')}

Requirements:
1. Maintain the same learning objectives
2. Preserve spiritual integration and scroll alignment
3. Apply all specified adaptation strategies
4. Ensure content is appropriate for ${recommendation.recommendedDifficulty.level} level
5. Keep the same overall structure

Return the adapted content in the same JSON format.
    `;

    try {
      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert instructional designer specializing in adaptive learning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 3000
      });

      const adaptedContent = JSON.parse(response.content);

      // Store adapted version
      await this.storeAdaptedContent(contentId, adaptedContent, recommendation);

      return adaptedContent;
    } catch (error) {
      logger.error('Error applying difficulty adaptation', { error, contentId });
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private async getStudentProfile(studentId: string): Promise<LearningProfile> {
    const analysis = await this.analyticsService.analyzePerformance({
      studentId,
      includeSpiritual: true
    });

    return analysis.profile;
  }

  private parseDifficultyLevel(difficulty: string): DifficultyLevel {
    const normalized = difficulty.toLowerCase();

    if (normalized.includes('beginner') || normalized.includes('easy')) {
      return this.createDifficultyLevel('beginner');
    }
    if (normalized.includes('advanced')) {
      return this.createDifficultyLevel('advanced');
    }
    if (normalized.includes('expert') || normalized.includes('master')) {
      return this.createDifficultyLevel('expert');
    }

    return this.createDifficultyLevel('intermediate');
  }

  private createDifficultyLevel(level: DifficultyLevel['level']): DifficultyLevel {
    const descriptions: Record<DifficultyLevel['level'], { score: number; description: string }> = {
      beginner: {
        score: 3,
        description: 'Foundational concepts with extensive support and scaffolding'
      },
      intermediate: {
        score: 5,
        description: 'Standard difficulty with balanced support and independence'
      },
      advanced: {
        score: 7,
        description: 'Complex concepts requiring synthesis and critical thinking'
      },
      expert: {
        score: 9,
        description: 'Mastery-level content with minimal scaffolding and high complexity'
      }
    };

    return {
      level,
      ...descriptions[level]
    };
  }

  private generateRecommendationReason(
    metrics: PerformanceMetrics,
    current: DifficultyLevel,
    recommended: DifficultyLevel
  ): string {
    if (current.level === recommended.level) {
      return `Current difficulty level (${current.level}) is appropriate based on performance metrics.`;
    }

    if (recommended.score > current.score) {
      return `Student is excelling (${metrics.averageScore}% average, ${metrics.completionRate}% completion rate). ` +
             `Increasing difficulty from ${current.level} to ${recommended.level} to maintain engagement and challenge.`;
    }

    return `Student is struggling (${metrics.averageScore}% average, ${metrics.completionRate}% completion rate). ` +
           `Decreasing difficulty from ${current.level} to ${recommended.level} to build confidence and ensure mastery.`;
  }

  private calculateConfidence(metrics: PerformanceMetrics): number {
    // Higher confidence with more data points and consistent trends
    let confidence = 70; // Base confidence

    // Adjust based on completion rate (more completed work = more confidence)
    if (metrics.completionRate >= 80) {
      confidence += 15;
    } else if (metrics.completionRate < 50) {
      confidence -= 15;
    }

    // Adjust based on trend consistency
    if (metrics.improvementTrend === 'improving' || metrics.improvementTrend === 'declining') {
      confidence += 10; // Clear trend increases confidence
    }

    return Math.min(Math.max(confidence, 0), 100);
  }

  private gatherSupportingEvidence(
    metrics: PerformanceMetrics,
    profile: LearningProfile
  ): string[] {
    const evidence: string[] = [];

    evidence.push(`Average score: ${metrics.averageScore}%`);
    evidence.push(`Completion rate: ${metrics.completionRate}%`);
    evidence.push(`Assignment submission rate: ${metrics.assignmentSubmissionRate}%`);
    evidence.push(`Quiz performance: ${metrics.quizPerformance}%`);
    evidence.push(`Performance trend: ${metrics.improvementTrend}`);
    evidence.push(`Engagement level: ${profile.engagement}/100`);

    if (profile.strengths.length > 0) {
      evidence.push(`Strengths: ${profile.strengths.slice(0, 3).join(', ')}`);
    }

    if (profile.weaknesses.length > 0) {
      evidence.push(`Areas for improvement: ${profile.weaknesses.slice(0, 3).join(', ')}`);
    }

    return evidence;
  }

  private async getContent(contentId: string): Promise<any> {
    // Retrieve content from database
    return {
      id: contentId,
      title: 'Sample Content',
      content: 'Content to be adapted',
      difficulty: 'intermediate'
    };
  }

  private async storeAdaptedContent(
    contentId: string,
    adaptedContent: any,
    recommendation: AdaptationRecommendation
  ): Promise<void> {
    logger.info('Storing adapted content', {
      contentId,
      from: recommendation.currentDifficulty.level,
      to: recommendation.recommendedDifficulty.level
    });

    // Store in database with adaptation metadata
  }
}
