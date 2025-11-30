/**
 * Content Engagement Tracker Service
 * "The wise store up knowledge" - Proverbs 10:14
 * 
 * Tracks detailed engagement metrics for all content types including
 * lectures, assessments, readings, videos, and interactive elements
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface ContentEngagementMetrics {
  contentId: string;
  contentType: 'lecture' | 'assessment' | 'reading' | 'video' | 'interactive' | 'exercise';
  totalViews: number;
  uniqueUsers: number;
  averageTimeSpent: number;
  completionRate: number;
  interactionRate: number;
  dropOffRate: number;
  engagementScore: number;
  timeDistribution: {
    '0-25%': number;
    '25-50%': number;
    '50-75%': number;
    '75-100%': number;
  };
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  peakEngagementTimes: Array<{ hour: number; count: number }>;
  lastUpdated: Date;
}

export interface ContentInteractionEvent {
  contentId: string;
  userId: string;
  eventType: 'view' | 'start' | 'progress' | 'complete' | 'pause' | 'resume' | 'interact' | 'submit';
  timestamp: Date;
  metadata?: {
    progress?: number;
    timeSpent?: number;
    deviceType?: string;
    score?: number;
    [key: string]: any;
  };
}

export interface EngagementTrend {
  contentId: string;
  period: 'daily' | 'weekly' | 'monthly';
  dataPoints: Array<{
    date: Date;
    views: number;
    completions: number;
    averageEngagement: number;
  }>;
  trend: 'increasing' | 'stable' | 'declining';
  changePercentage: number;
}

export interface ContentComparison {
  contentIds: string[];
  metrics: {
    [contentId: string]: ContentEngagementMetrics;
  };
  rankings: {
    byEngagement: string[];
    byCompletion: string[];
    byTimeSpent: string[];
  };
  insights: string[];
}

export class ContentEngagementTracker {
  /**
   * Track a content interaction event
   */
  async trackInteraction(event: ContentInteractionEvent): Promise<void> {
    try {
      logger.info('Tracking content interaction', {
        contentId: event.contentId,
        userId: event.userId,
        eventType: event.eventType
      });

      // Store the interaction event
      await prisma.contentInteraction.create({
        data: {
          contentId: event.contentId,
          userId: event.userId,
          eventType: event.eventType,
          timestamp: event.timestamp,
          metadata: event.metadata || {},
        },
      });

      // Update aggregated metrics asynchronously
      this.updateAggregatedMetrics(event.contentId).catch(error => {
        logger.error('Error updating aggregated metrics', { error, contentId: event.contentId });
      });
    } catch (error) {
      logger.error('Error tracking content interaction', { error, event });
      throw new Error(`Failed to track interaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get engagement metrics for specific content
   */
  async getContentEngagement(contentId: string): Promise<ContentEngagementMetrics> {
    try {
      logger.info('Fetching content engagement metrics', { contentId });

      // Get all interactions for this content
      const interactions = await prisma.contentInteraction.findMany({
        where: { contentId },
        orderBy: { timestamp: 'asc' },
      });

      if (interactions.length === 0) {
        return this.getEmptyMetrics(contentId);
      }

      // Calculate metrics
      const totalViews = interactions.filter(i => i.eventType === 'view' || i.eventType === 'start').length;
      const uniqueUsers = new Set(interactions.map(i => i.userId)).size;
      
      // Calculate average time spent
      const timeSpentData = interactions
        .filter(i => i.metadata && typeof i.metadata === 'object' && 'timeSpent' in i.metadata)
        .map(i => (i.metadata as any).timeSpent || 0);
      const averageTimeSpent = timeSpentData.length > 0
        ? timeSpentData.reduce((sum, t) => sum + t, 0) / timeSpentData.length
        : 0;

      // Calculate completion rate
      const completions = interactions.filter(i => i.eventType === 'complete').length;
      const completionRate = totalViews > 0 ? (completions / totalViews) * 100 : 0;

      // Calculate interaction rate (users who interacted beyond just viewing)
      const interactedUsers = new Set(
        interactions
          .filter(i => i.eventType !== 'view' && i.eventType !== 'start')
          .map(i => i.userId)
      );
      const interactionRate = uniqueUsers > 0 ? (interactedUsers.size / uniqueUsers) * 100 : 0;

      // Calculate drop-off rate
      const started = interactions.filter(i => i.eventType === 'start').length;
      const dropOffRate = started > 0 ? ((started - completions) / started) * 100 : 0;

      // Calculate engagement score (composite metric)
      const engagementScore = this.calculateEngagementScore({
        completionRate,
        interactionRate,
        averageTimeSpent,
        dropOffRate,
      });

      // Calculate time distribution
      const timeDistribution = this.calculateTimeDistribution(interactions);

      // Calculate device breakdown
      const deviceBreakdown = this.calculateDeviceBreakdown(interactions);

      // Calculate peak engagement times
      const peakEngagementTimes = this.calculatePeakTimes(interactions);

      // Determine content type
      const contentType = await this.determineContentType(contentId);

      return {
        contentId,
        contentType,
        totalViews,
        uniqueUsers,
        averageTimeSpent,
        completionRate,
        interactionRate,
        dropOffRate,
        engagementScore,
        timeDistribution,
        deviceBreakdown,
        peakEngagementTimes,
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.error('Error fetching content engagement', { error, contentId });
      throw new Error(`Failed to fetch engagement metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get engagement trends over time
   */
  async getEngagementTrend(
    contentId: string,
    period: 'daily' | 'weekly' | 'monthly',
    startDate: Date,
    endDate: Date
  ): Promise<EngagementTrend> {
    try {
      logger.info('Fetching engagement trend', { contentId, period });

      const interactions = await prisma.contentInteraction.findMany({
        where: {
          contentId,
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { timestamp: 'asc' },
      });

      // Group interactions by period
      const groupedData = this.groupByPeriod(interactions, period);

      // Calculate metrics for each period
      const dataPoints = groupedData.map(group => {
        const views = group.interactions.filter(i => i.eventType === 'view' || i.eventType === 'start').length;
        const completions = group.interactions.filter(i => i.eventType === 'complete').length;
        
        // Calculate average engagement for the period
        const interactionCount = group.interactions.filter(i => 
          i.eventType !== 'view' && i.eventType !== 'start'
        ).length;
        const averageEngagement = views > 0 ? (interactionCount / views) * 100 : 0;

        return {
          date: group.date,
          views,
          completions,
          averageEngagement,
        };
      });

      // Determine trend
      const { trend, changePercentage } = this.analyzeTrend(dataPoints);

      return {
        contentId,
        period,
        dataPoints,
        trend,
        changePercentage,
      };
    } catch (error) {
      logger.error('Error fetching engagement trend', { error, contentId });
      throw new Error(`Failed to fetch engagement trend: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Compare engagement across multiple content items
   */
  async compareContent(contentIds: string[]): Promise<ContentComparison> {
    try {
      logger.info('Comparing content engagement', { contentIds });

      // Get metrics for all content items
      const metricsPromises = contentIds.map(id => this.getContentEngagement(id));
      const metricsArray = await Promise.all(metricsPromises);

      const metrics: { [contentId: string]: ContentEngagementMetrics } = {};
      metricsArray.forEach(m => {
        metrics[m.contentId] = m;
      });

      // Rank by different criteria
      const byEngagement = [...contentIds].sort((a, b) => 
        metrics[b].engagementScore - metrics[a].engagementScore
      );

      const byCompletion = [...contentIds].sort((a, b) => 
        metrics[b].completionRate - metrics[a].completionRate
      );

      const byTimeSpent = [...contentIds].sort((a, b) => 
        metrics[b].averageTimeSpent - metrics[a].averageTimeSpent
      );

      // Generate insights
      const insights = this.generateComparisonInsights(metrics, {
        byEngagement,
        byCompletion,
        byTimeSpent,
      });

      return {
        contentIds,
        metrics,
        rankings: {
          byEngagement,
          byCompletion,
          byTimeSpent,
        },
        insights,
      };
    } catch (error) {
      logger.error('Error comparing content', { error, contentIds });
      throw new Error(`Failed to compare content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get global content performance analysis
   */
  async getGlobalPerformance(filters?: {
    contentType?: string;
    courseId?: string;
    language?: string;
    culture?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalContent: number;
    averageEngagement: number;
    topPerformers: Array<{ contentId: string; score: number }>;
    poorPerformers: Array<{ contentId: string; score: number }>;
    culturalComparison: Array<{
      culture: string;
      averageEngagement: number;
      completionRate: number;
    }>;
    formatComparison: Array<{
      format: string;
      averageEngagement: number;
      completionRate: number;
    }>;
  }> {
    try {
      logger.info('Fetching global content performance', { filters });

      // Build where clause
      const where: any = {};
      if (filters?.startDate || filters?.endDate) {
        where.timestamp = {};
        if (filters.startDate) where.timestamp.gte = filters.startDate;
        if (filters.endDate) where.timestamp.lte = filters.endDate;
      }

      // Get all content interactions
      const interactions = await prisma.contentInteraction.findMany({
        where,
        include: {
          content: true,
        },
      });

      // Group by content
      const contentGroups = new Map<string, any[]>();
      interactions.forEach(interaction => {
        const contentId = interaction.contentId;
        if (!contentGroups.has(contentId)) {
          contentGroups.set(contentId, []);
        }
        contentGroups.get(contentId)!.push(interaction);
      });

      // Calculate metrics for each content
      const contentMetrics: Array<{ contentId: string; score: number; metrics: any }> = [];
      
      for (const [contentId, contentInteractions] of contentGroups.entries()) {
        const views = contentInteractions.filter(i => i.eventType === 'view' || i.eventType === 'start').length;
        const completions = contentInteractions.filter(i => i.eventType === 'complete').length;
        const completionRate = views > 0 ? (completions / views) * 100 : 0;
        
        const interactionCount = contentInteractions.filter(i => 
          i.eventType !== 'view' && i.eventType !== 'start'
        ).length;
        const interactionRate = views > 0 ? (interactionCount / views) * 100 : 0;

        const score = (completionRate * 0.5) + (interactionRate * 0.5);

        contentMetrics.push({
          contentId,
          score,
          metrics: { completionRate, interactionRate, views },
        });
      }

      // Sort and get top/poor performers
      contentMetrics.sort((a, b) => b.score - a.score);
      const topPerformers = contentMetrics.slice(0, 10).map(c => ({
        contentId: c.contentId,
        score: c.score,
      }));
      const poorPerformers = contentMetrics.slice(-10).map(c => ({
        contentId: c.contentId,
        score: c.score,
      }));

      // Calculate average engagement
      const averageEngagement = contentMetrics.length > 0
        ? contentMetrics.reduce((sum, c) => sum + c.score, 0) / contentMetrics.length
        : 0;

      // Cultural comparison (simplified - would need actual cultural data)
      const culturalComparison: Array<{
        culture: string;
        averageEngagement: number;
        completionRate: number;
      }> = [];

      // Format comparison (simplified - would need actual format data)
      const formatComparison: Array<{
        format: string;
        averageEngagement: number;
        completionRate: number;
      }> = [];

      return {
        totalContent: contentGroups.size,
        averageEngagement,
        topPerformers,
        poorPerformers,
        culturalComparison,
        formatComparison,
      };
    } catch (error) {
      logger.error('Error fetching global performance', { error });
      throw new Error(`Failed to fetch global performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update aggregated metrics for content
   */
  private async updateAggregatedMetrics(contentId: string): Promise<void> {
    try {
      const metrics = await this.getContentEngagement(contentId);

      // Store or update aggregated metrics
      await prisma.contentMetrics.upsert({
        where: { contentId },
        create: {
          contentId,
          totalViews: metrics.totalViews,
          uniqueUsers: metrics.uniqueUsers,
          averageTimeSpent: metrics.averageTimeSpent,
          completionRate: metrics.completionRate,
          engagementScore: metrics.engagementScore,
          lastUpdated: new Date(),
        },
        update: {
          totalViews: metrics.totalViews,
          uniqueUsers: metrics.uniqueUsers,
          averageTimeSpent: metrics.averageTimeSpent,
          completionRate: metrics.completionRate,
          engagementScore: metrics.engagementScore,
          lastUpdated: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error updating aggregated metrics', { error, contentId });
      // Don't throw - this is a background operation
    }
  }

  /**
   * Calculate engagement score
   */
  private calculateEngagementScore(data: {
    completionRate: number;
    interactionRate: number;
    averageTimeSpent: number;
    dropOffRate: number;
  }): number {
    // Weighted composite score
    const completionWeight = 0.35;
    const interactionWeight = 0.30;
    const timeWeight = 0.20;
    const dropOffWeight = 0.15;

    // Normalize time spent (assume 30 minutes is optimal)
    const normalizedTime = Math.min(100, (data.averageTimeSpent / 30) * 100);

    const score =
      data.completionRate * completionWeight +
      data.interactionRate * interactionWeight +
      normalizedTime * timeWeight +
      (100 - data.dropOffRate) * dropOffWeight;

    return Math.round(score);
  }

  /**
   * Calculate time distribution
   */
  private calculateTimeDistribution(interactions: any[]): {
    '0-25%': number;
    '25-50%': number;
    '50-75%': number;
    '75-100%': number;
  } {
    const progressData = interactions
      .filter(i => i.metadata && typeof i.metadata === 'object' && 'progress' in i.metadata)
      .map(i => (i.metadata as any).progress || 0);

    const distribution = {
      '0-25%': 0,
      '25-50%': 0,
      '50-75%': 0,
      '75-100%': 0,
    };

    progressData.forEach(progress => {
      if (progress <= 25) distribution['0-25%']++;
      else if (progress <= 50) distribution['25-50%']++;
      else if (progress <= 75) distribution['50-75%']++;
      else distribution['75-100%']++;
    });

    return distribution;
  }

  /**
   * Calculate device breakdown
   */
  private calculateDeviceBreakdown(interactions: any[]): {
    desktop: number;
    mobile: number;
    tablet: number;
  } {
    const breakdown = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    };

    interactions.forEach(i => {
      if (i.metadata && typeof i.metadata === 'object' && 'deviceType' in i.metadata) {
        const device = (i.metadata as any).deviceType;
        if (device === 'desktop') breakdown.desktop++;
        else if (device === 'mobile') breakdown.mobile++;
        else if (device === 'tablet') breakdown.tablet++;
      }
    });

    return breakdown;
  }

  /**
   * Calculate peak engagement times
   */
  private calculatePeakTimes(interactions: any[]): Array<{ hour: number; count: number }> {
    const hourCounts = new Map<number, number>();

    interactions.forEach(i => {
      const hour = i.timestamp.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    return Array.from(hourCounts.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Group interactions by period
   */
  private groupByPeriod(
    interactions: any[],
    period: 'daily' | 'weekly' | 'monthly'
  ): Array<{ date: Date; interactions: any[] }> {
    const groups = new Map<string, any[]>();

    interactions.forEach(interaction => {
      const date = new Date(interaction.timestamp);
      let key: string;

      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(interaction);
    });

    return Array.from(groups.entries())
      .map(([dateStr, interactions]) => ({
        date: new Date(dateStr),
        interactions,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Analyze trend
   */
  private analyzeTrend(dataPoints: Array<{ date: Date; views: number; completions: number; averageEngagement: number }>): {
    trend: 'increasing' | 'stable' | 'declining';
    changePercentage: number;
  } {
    if (dataPoints.length < 2) {
      return { trend: 'stable', changePercentage: 0 };
    }

    const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
    const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.averageEngagement, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.averageEngagement, 0) / secondHalf.length;

    const changePercentage = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    let trend: 'increasing' | 'stable' | 'declining';
    if (changePercentage > 10) trend = 'increasing';
    else if (changePercentage < -10) trend = 'declining';
    else trend = 'stable';

    return { trend, changePercentage };
  }

  /**
   * Generate comparison insights
   */
  private generateComparisonInsights(
    metrics: { [contentId: string]: ContentEngagementMetrics },
    rankings: {
      byEngagement: string[];
      byCompletion: string[];
      byTimeSpent: string[];
    }
  ): string[] {
    const insights: string[] = [];

    // Best performer
    const topContent = rankings.byEngagement[0];
    if (topContent) {
      insights.push(
        `Content ${topContent} has the highest engagement score (${metrics[topContent].engagementScore})`
      );
    }

    // Completion rate insights
    const avgCompletion = Object.values(metrics).reduce((sum, m) => sum + m.completionRate, 0) / Object.keys(metrics).length;
    insights.push(`Average completion rate across all content: ${avgCompletion.toFixed(1)}%`);

    // Time spent insights
    const avgTime = Object.values(metrics).reduce((sum, m) => sum + m.averageTimeSpent, 0) / Object.keys(metrics).length;
    insights.push(`Average time spent per content: ${avgTime.toFixed(1)} minutes`);

    // Drop-off insights
    const highDropOff = Object.entries(metrics).filter(([_, m]) => m.dropOffRate > 50);
    if (highDropOff.length > 0) {
      insights.push(`${highDropOff.length} content items have high drop-off rates (>50%)`);
    }

    return insights;
  }

  /**
   * Determine content type
   */
  private async determineContentType(contentId: string): Promise<'lecture' | 'assessment' | 'reading' | 'video' | 'interactive' | 'exercise'> {
    // Try to determine from database
    // This is simplified - in production, would check actual content tables
    return 'lecture';
  }

  /**
   * Get empty metrics
   */
  private getEmptyMetrics(contentId: string): ContentEngagementMetrics {
    return {
      contentId,
      contentType: 'lecture',
      totalViews: 0,
      uniqueUsers: 0,
      averageTimeSpent: 0,
      completionRate: 0,
      interactionRate: 0,
      dropOffRate: 0,
      engagementScore: 0,
      timeDistribution: {
        '0-25%': 0,
        '25-50%': 0,
        '50-75%': 0,
        '75-100%': 0,
      },
      deviceBreakdown: {
        desktop: 0,
        mobile: 0,
        tablet: 0,
      },
      peakEngagementTimes: [],
      lastUpdated: new Date(),
    };
  }
}

export default ContentEngagementTracker;
