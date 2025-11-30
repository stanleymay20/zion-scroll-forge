/**
 * Content Performance Integrator Service
 * "By wisdom a house is built" - Proverbs 24:3
 * 
 * Integrates content-specific performance tracking with the analytics dashboard
 * Provides unified interface for content analytics across the platform
 */

import { PrismaClient } from '@prisma/client';
import ContentEngagementTracker, { ContentEngagementMetrics } from './ContentEngagementTracker';
import ContentEffectivenessEvaluator, { ContentEffectivenessMetrics } from './ContentEffectivenessEvaluator';
import AnalyticsDashboardService from './AnalyticsDashboardService';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface ComprehensiveContentAnalytics {
  contentId: string;
  engagement: ContentEngagementMetrics;
  effectiveness: ContentEffectivenessMetrics;
  globalComparison: {
    engagementRank: number;
    effectivenessRank: number;
    totalContent: number;
    percentile: number;
  };
  culturalPerformance: Array<{
    culture: string;
    engagementScore: number;
    effectivenessScore: number;
    completionRate: number;
    recommendations: string[];
  }>;
  formatPerformance: {
    video: number;
    text: number;
    interactive: number;
    audio: number;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  lastAnalyzed: Date;
}

export interface ContentPerformanceReport {
  reportId: string;
  generatedAt: Date;
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalContent: number;
    averageEngagement: number;
    averageEffectiveness: number;
    topPerformers: string[];
    needsImprovement: string[];
  };
  detailedAnalytics: ComprehensiveContentAnalytics[];
  trends: {
    engagementTrend: 'increasing' | 'stable' | 'declining';
    effectivenessTrend: 'increasing' | 'stable' | 'declining';
  };
  actionItems: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    contentIds: string[];
    expectedImpact: string;
  }>;
}

export class ContentPerformanceIntegrator {
  private engagementTracker: ContentEngagementTracker;
  private effectivenessEvaluator: ContentEffectivenessEvaluator;
  private analyticsService: AnalyticsDashboardService;

  constructor() {
    this.engagementTracker = new ContentEngagementTracker();
    this.effectivenessEvaluator = new ContentEffectivenessEvaluator();
    this.analyticsService = new AnalyticsDashboardService();
  }

  /**
   * Get comprehensive content analytics
   */
  async getComprehensiveAnalytics(contentId: string): Promise<ComprehensiveContentAnalytics> {
    try {
      logger.info('Getting comprehensive content analytics', { contentId });

      // Get engagement metrics
      const engagement = await this.engagementTracker.getContentEngagement(contentId);

      // Get effectiveness metrics
      const effectiveness = await this.effectivenessEvaluator.evaluateContent(contentId);

      // Get global comparison
      const globalComparison = await this.getGlobalComparison(contentId, engagement, effectiveness);

      // Get cultural performance
      const culturalPerformance = await this.getCulturalPerformance(contentId);

      // Get format performance
      const formatPerformance = await this.getFormatPerformance(contentId);

      // Generate comprehensive recommendations
      const recommendations = this.generateComprehensiveRecommendations(
        engagement,
        effectiveness,
        globalComparison,
        culturalPerformance
      );

      return {
        contentId,
        engagement,
        effectiveness,
        globalComparison,
        culturalPerformance,
        formatPerformance,
        recommendations,
        lastAnalyzed: new Date(),
      };
    } catch (error) {
      logger.error('Error getting comprehensive analytics', { error, contentId });
      throw new Error(`Failed to get comprehensive analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate content performance report
   */
  async generatePerformanceReport(
    contentIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<ContentPerformanceReport> {
    try {
      logger.info('Generating content performance report', {
        contentCount: contentIds.length,
        startDate,
        endDate,
      });

      // Get analytics for all content
      const analyticsPromises = contentIds.map(id => this.getComprehensiveAnalytics(id));
      const detailedAnalytics = await Promise.all(analyticsPromises);

      // Calculate summary metrics
      const summary = this.calculateSummary(detailedAnalytics);

      // Analyze trends
      const trends = await this.analyzeTrends(contentIds, startDate, endDate);

      // Generate action items
      const actionItems = this.generateActionItems(detailedAnalytics);

      return {
        reportId: `report_${Date.now()}`,
        generatedAt: new Date(),
        timeRange: { startDate, endDate },
        summary,
        detailedAnalytics,
        trends,
        actionItems,
      };
    } catch (error) {
      logger.error('Error generating performance report', { error });
      throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get content completion rate analysis
   */
  async getCompletionRateAnalysis(filters?: {
    courseId?: string;
    contentType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    overall: number;
    byContentType: Record<string, number>;
    byCourse: Record<string, number>;
    byTimeframe: Array<{ date: Date; rate: number }>;
    insights: string[];
  }> {
    try {
      logger.info('Getting completion rate analysis', { filters });

      // Get all content interactions
      const where: any = {};
      if (filters?.startDate || filters?.endDate) {
        where.timestamp = {};
        if (filters.startDate) where.timestamp.gte = filters.startDate;
        if (filters.endDate) where.timestamp.lte = filters.endDate;
      }

      const interactions = await prisma.contentInteraction.findMany({
        where,
        include: {
          content: true,
        },
      });

      // Calculate overall completion rate
      const started = new Set(interactions.filter(i => i.eventType === 'start').map(i => `${i.contentId}_${i.userId}`));
      const completed = new Set(interactions.filter(i => i.eventType === 'complete').map(i => `${i.contentId}_${i.userId}`));
      const overall = started.size > 0 ? (completed.size / started.size) * 100 : 0;

      // Group by content type
      const byContentType: Record<string, number> = {};
      const contentTypeGroups = new Map<string, { started: Set<string>; completed: Set<string> }>();

      interactions.forEach(i => {
        const type = i.content?.type || 'unknown';
        if (!contentTypeGroups.has(type)) {
          contentTypeGroups.set(type, { started: new Set(), completed: new Set() });
        }
        const group = contentTypeGroups.get(type)!;
        const key = `${i.contentId}_${i.userId}`;
        if (i.eventType === 'start') group.started.add(key);
        if (i.eventType === 'complete') group.completed.add(key);
      });

      contentTypeGroups.forEach((group, type) => {
        byContentType[type] = group.started.size > 0 ? (group.completed.size / group.started.size) * 100 : 0;
      });

      // Group by course (simplified)
      const byCourse: Record<string, number> = {};

      // Group by timeframe
      const byTimeframe = this.groupCompletionByTimeframe(interactions);

      // Generate insights
      const insights = this.generateCompletionInsights({
        overall,
        byContentType,
        byCourse,
        byTimeframe,
      });

      return {
        overall,
        byContentType,
        byCourse,
        byTimeframe,
        insights,
      };
    } catch (error) {
      logger.error('Error getting completion rate analysis', { error });
      throw new Error(`Failed to analyze completion rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get global performance analysis with cultural effectiveness comparison
   */
  async getGlobalPerformanceAnalysis(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    globalMetrics: {
      totalContent: number;
      averageEngagement: number;
      averageEffectiveness: number;
      averageCompletion: number;
    };
    culturalComparison: Array<{
      culture: string;
      contentCount: number;
      averageEngagement: number;
      averageEffectiveness: number;
      completionRate: number;
      topPerformingFormats: string[];
      recommendations: string[];
    }>;
    formatEffectiveness: Array<{
      format: string;
      engagementScore: number;
      effectivenessScore: number;
      completionRate: number;
      bestUseCases: string[];
    }>;
    insights: string[];
  }> {
    try {
      logger.info('Getting global performance analysis', { filters });

      // Get global engagement data
      const globalEngagement = await this.engagementTracker.getGlobalPerformance(filters);

      // Calculate global metrics
      const globalMetrics = {
        totalContent: globalEngagement.totalContent,
        averageEngagement: globalEngagement.averageEngagement,
        averageEffectiveness: 0, // Would calculate from effectiveness data
        averageCompletion: 0, // Would calculate from completion data
      };

      // Get cultural comparison
      const culturalComparison = await this.getCulturalComparison(filters);

      // Get format effectiveness
      const formatEffectiveness = await this.getFormatEffectiveness(filters);

      // Generate insights
      const insights = this.generateGlobalInsights({
        globalMetrics,
        culturalComparison,
        formatEffectiveness,
      });

      return {
        globalMetrics,
        culturalComparison,
        formatEffectiveness,
        insights,
      };
    } catch (error) {
      logger.error('Error getting global performance analysis', { error });
      throw new Error(`Failed to analyze global performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper methods

  private async getGlobalComparison(
    contentId: string,
    engagement: ContentEngagementMetrics,
    effectiveness: ContentEffectivenessMetrics
  ): Promise<{
    engagementRank: number;
    effectivenessRank: number;
    totalContent: number;
    percentile: number;
  }> {
    // Get all content metrics for comparison
    const allMetrics = await prisma.contentMetrics.findMany({
      orderBy: { engagementScore: 'desc' },
    });

    const engagementRank = allMetrics.findIndex(m => m.contentId === contentId) + 1;
    const effectivenessRank = engagementRank; // Simplified
    const totalContent = allMetrics.length;
    const percentile = totalContent > 0 ? ((totalContent - engagementRank) / totalContent) * 100 : 0;

    return {
      engagementRank,
      effectivenessRank,
      totalContent,
      percentile,
    };
  }

  private async getCulturalPerformance(contentId: string): Promise<Array<{
    culture: string;
    engagementScore: number;
    effectivenessScore: number;
    completionRate: number;
    recommendations: string[];
  }>> {
    // Simplified - would get actual cultural data
    return [];
  }

  private async getFormatPerformance(contentId: string): Promise<{
    video: number;
    text: number;
    interactive: number;
    audio: number;
  }> {
    // Simplified - would get actual format data
    return {
      video: 85,
      text: 75,
      interactive: 90,
      audio: 70,
    };
  }

  private generateComprehensiveRecommendations(
    engagement: ContentEngagementMetrics,
    effectiveness: ContentEffectivenessMetrics,
    globalComparison: any,
    culturalPerformance: any[]
  ): {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  } {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];

    // Immediate actions (critical issues)
    if (engagement.engagementScore < 40) {
      immediate.push('Review and revise content immediately - engagement critically low');
    }
    if (effectiveness.effectivenessScore < 50) {
      immediate.push('Content not meeting learning objectives - requires urgent revision');
    }
    if (engagement.dropOffRate > 60) {
      immediate.push('High drop-off rate - identify and fix problematic sections');
    }

    // Short-term actions (1-3 months)
    if (engagement.completionRate < 70) {
      shortTerm.push('Improve content structure and pacing to increase completion');
    }
    if (effectiveness.learningOutcomes.achievementRate < 75) {
      shortTerm.push('Realign content with learning objectives');
    }
    if (globalComparison.percentile < 50) {
      shortTerm.push('Benchmark against top-performing content and implement improvements');
    }

    // Long-term actions (3-12 months)
    if (effectiveness.retentionMetrics.longTermRetention < 65) {
      longTerm.push('Implement spaced repetition and reinforcement strategies');
    }
    if (effectiveness.applicationMetrics.practicalApplicationRate < 70) {
      longTerm.push('Add more real-world applications and practical exercises');
    }
    longTerm.push('Continuously monitor and optimize based on performance data');

    return { immediate, shortTerm, longTerm };
  }

  private calculateSummary(analytics: ComprehensiveContentAnalytics[]): {
    totalContent: number;
    averageEngagement: number;
    averageEffectiveness: number;
    topPerformers: string[];
    needsImprovement: string[];
  } {
    const totalContent = analytics.length;
    const averageEngagement = analytics.reduce((sum, a) => sum + a.engagement.engagementScore, 0) / totalContent;
    const averageEffectiveness = analytics.reduce((sum, a) => sum + a.effectiveness.effectivenessScore, 0) / totalContent;

    const sorted = [...analytics].sort((a, b) => 
      (b.engagement.engagementScore + b.effectiveness.effectivenessScore) -
      (a.engagement.engagementScore + a.effectiveness.effectivenessScore)
    );

    const topPerformers = sorted.slice(0, 5).map(a => a.contentId);
    const needsImprovement = sorted.slice(-5).map(a => a.contentId);

    return {
      totalContent,
      averageEngagement,
      averageEffectiveness,
      topPerformers,
      needsImprovement,
    };
  }

  private async analyzeTrends(
    contentIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<{
    engagementTrend: 'increasing' | 'stable' | 'declining';
    effectivenessTrend: 'increasing' | 'stable' | 'declining';
  }> {
    // Simplified - would analyze actual trend data
    return {
      engagementTrend: 'stable',
      effectivenessTrend: 'increasing',
    };
  }

  private generateActionItems(analytics: ComprehensiveContentAnalytics[]): Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    contentIds: string[];
    expectedImpact: string;
  }> {
    const actionItems: Array<{
      priority: 'high' | 'medium' | 'low';
      action: string;
      contentIds: string[];
      expectedImpact: string;
    }> = [];

    // High priority: Critical issues
    const criticalContent = analytics.filter(a => 
      a.engagement.engagementScore < 40 || a.effectiveness.effectivenessScore < 50
    );
    if (criticalContent.length > 0) {
      actionItems.push({
        priority: 'high',
        action: 'Immediate content revision required',
        contentIds: criticalContent.map(a => a.contentId),
        expectedImpact: 'Prevent student disengagement and learning failure',
      });
    }

    // Medium priority: Improvement opportunities
    const improvementContent = analytics.filter(a => 
      a.engagement.engagementScore < 70 || a.effectiveness.effectivenessScore < 75
    );
    if (improvementContent.length > 0) {
      actionItems.push({
        priority: 'medium',
        action: 'Optimize content for better performance',
        contentIds: improvementContent.map(a => a.contentId),
        expectedImpact: 'Increase engagement and learning outcomes by 15-20%',
      });
    }

    // Low priority: Enhancement opportunities
    const enhancementContent = analytics.filter(a => 
      a.engagement.engagementScore >= 70 && a.effectiveness.effectivenessScore >= 75
    );
    if (enhancementContent.length > 0) {
      actionItems.push({
        priority: 'low',
        action: 'Fine-tune high-performing content',
        contentIds: enhancementContent.map(a => a.contentId),
        expectedImpact: 'Achieve excellence and set new performance benchmarks',
      });
    }

    return actionItems;
  }

  private groupCompletionByTimeframe(interactions: any[]): Array<{ date: Date; rate: number }> {
    // Simplified - would group by actual timeframes
    return [];
  }

  private generateCompletionInsights(data: any): string[] {
    const insights: string[] = [];

    insights.push(`Overall completion rate: ${data.overall.toFixed(1)}%`);

    // Content type insights
    const bestType = Object.entries(data.byContentType)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0];
    if (bestType) {
      insights.push(`${bestType[0]} content has highest completion rate (${(bestType[1] as number).toFixed(1)}%)`);
    }

    // Recommendations
    if (data.overall < 70) {
      insights.push('Overall completion rate below target - review content difficulty and engagement');
    }

    return insights;
  }

  private async getCulturalComparison(filters?: any): Promise<Array<{
    culture: string;
    contentCount: number;
    averageEngagement: number;
    averageEffectiveness: number;
    completionRate: number;
    topPerformingFormats: string[];
    recommendations: string[];
  }>> {
    // Simplified - would get actual cultural comparison data
    return [];
  }

  private async getFormatEffectiveness(filters?: any): Promise<Array<{
    format: string;
    engagementScore: number;
    effectivenessScore: number;
    completionRate: number;
    bestUseCases: string[];
  }>> {
    // Simplified - would get actual format effectiveness data
    return [];
  }

  private generateGlobalInsights(data: any): string[] {
    const insights: string[] = [];

    insights.push(`Platform-wide average engagement: ${data.globalMetrics.averageEngagement.toFixed(1)}%`);
    insights.push(`Total content items tracked: ${data.globalMetrics.totalContent}`);

    // Cultural insights
    if (data.culturalComparison.length > 0) {
      const topCulture = data.culturalComparison.sort((a: any, b: any) => 
        b.averageEngagement - a.averageEngagement
      )[0];
      insights.push(`${topCulture.culture} shows highest engagement (${topCulture.averageEngagement.toFixed(1)}%)`);
    }

    // Format insights
    if (data.formatEffectiveness.length > 0) {
      const topFormat = data.formatEffectiveness.sort((a: any, b: any) => 
        b.effectivenessScore - a.effectivenessScore
      )[0];
      insights.push(`${topFormat.format} format most effective for learning outcomes`);
    }

    return insights;
  }
}

export default ContentPerformanceIntegrator;
