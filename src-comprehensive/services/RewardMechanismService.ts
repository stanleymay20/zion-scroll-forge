/**
 * Reward Mechanism Service
 * "Where righteousness abounds, divine rewards flow"
 * 
 * Automated service for distributing ScrollCoin rewards based on user activities,
 * course completions, peer assistance, and spiritual growth milestones.
 */

import { PrismaClient } from '@prisma/client';
import ScrollCoinService from './ScrollCoinService';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface RewardEvent {
  userId: string;
  eventType: RewardEventType;
  entityId?: string;
  metadata?: any;
  timestamp: Date;
}

export enum RewardEventType {
  COURSE_COMPLETION = 'COURSE_COMPLETION',
  ASSIGNMENT_SUBMISSION = 'ASSIGNMENT_SUBMISSION',
  PEER_ASSISTANCE = 'PEER_ASSISTANCE',
  DAILY_LOGIN = 'DAILY_LOGIN',
  LEARNING_STREAK = 'LEARNING_STREAK',
  RESEARCH_PUBLICATION = 'RESEARCH_PUBLICATION',
  MENTORING_SESSION = 'MENTORING_SESSION',
  TRANSLATION_CONTRIBUTION = 'TRANSLATION_CONTRIBUTION',
  TOOL_BUILDING = 'TOOL_BUILDING',
  MISSION_SERVICE = 'MISSION_SERVICE',
  SPIRITUAL_MILESTONE = 'SPIRITUAL_MILESTONE',
  COMMUNITY_CONTRIBUTION = 'COMMUNITY_CONTRIBUTION'
}

export interface RewardRule {
  eventType: RewardEventType;
  baseReward: number;
  multipliers?: {
    difficulty?: number;
    quality?: number;
    impact?: number;
    streak?: number;
  };
  conditions?: {
    minScore?: number;
    requiredLevel?: string;
    timeWindow?: number; // in hours
  };
}

export class RewardMechanismService {
  private static instance: RewardMechanismService;
  private scrollCoinService: ScrollCoinService;
  private rewardRules: Map<RewardEventType, RewardRule>;

  private constructor() {
    this.scrollCoinService = ScrollCoinService.getInstance();
    this.initializeRewardRules();
  }

  public static getInstance(): RewardMechanismService {
    if (!RewardMechanismService.instance) {
      RewardMechanismService.instance = new RewardMechanismService();
    }
    return RewardMechanismService.instance;
  }

  /**
   * Initialize default reward rules
   */
  private initializeRewardRules(): void {
    this.rewardRules = new Map([
      [RewardEventType.COURSE_COMPLETION, {
        eventType: RewardEventType.COURSE_COMPLETION,
        baseReward: 100,
        multipliers: {
          difficulty: 1.5, // Advanced courses get 1.5x
          quality: 1.2     // High-quality completion gets 1.2x
        },
        conditions: {
          minScore: 70 // Minimum 70% to earn reward
        }
      }],
      [RewardEventType.ASSIGNMENT_SUBMISSION, {
        eventType: RewardEventType.ASSIGNMENT_SUBMISSION,
        baseReward: 25,
        multipliers: {
          quality: 2.0 // Excellent submissions get 2x
        },
        conditions: {
          minScore: 60
        }
      }],
      [RewardEventType.PEER_ASSISTANCE, {
        eventType: RewardEventType.PEER_ASSISTANCE,
        baseReward: 30,
        multipliers: {
          impact: 1.5 // High-impact help gets 1.5x
        }
      }],
      [RewardEventType.DAILY_LOGIN, {
        eventType: RewardEventType.DAILY_LOGIN,
        baseReward: 5,
        conditions: {
          timeWindow: 24 // Once per 24 hours
        }
      }],
      [RewardEventType.LEARNING_STREAK, {
        eventType: RewardEventType.LEARNING_STREAK,
        baseReward: 10,
        multipliers: {
          streak: 1.1 // 10% bonus per streak day
        }
      }],
      [RewardEventType.RESEARCH_PUBLICATION, {
        eventType: RewardEventType.RESEARCH_PUBLICATION,
        baseReward: 500,
        multipliers: {
          quality: 2.0,
          impact: 1.8
        },
        conditions: {
          minScore: 80
        }
      }],
      [RewardEventType.MENTORING_SESSION, {
        eventType: RewardEventType.MENTORING_SESSION,
        baseReward: 50,
        multipliers: {
          impact: 1.3
        }
      }],
      [RewardEventType.TRANSLATION_CONTRIBUTION, {
        eventType: RewardEventType.TRANSLATION_CONTRIBUTION,
        baseReward: 75,
        multipliers: {
          quality: 1.5
        }
      }],
      [RewardEventType.TOOL_BUILDING, {
        eventType: RewardEventType.TOOL_BUILDING,
        baseReward: 200,
        multipliers: {
          impact: 2.0,
          quality: 1.5
        }
      }],
      [RewardEventType.MISSION_SERVICE, {
        eventType: RewardEventType.MISSION_SERVICE,
        baseReward: 300,
        multipliers: {
          impact: 2.5
        }
      }],
      [RewardEventType.SPIRITUAL_MILESTONE, {
        eventType: RewardEventType.SPIRITUAL_MILESTONE,
        baseReward: 150,
        multipliers: {
          impact: 1.8
        }
      }],
      [RewardEventType.COMMUNITY_CONTRIBUTION, {
        eventType: RewardEventType.COMMUNITY_CONTRIBUTION,
        baseReward: 40,
        multipliers: {
          impact: 1.4
        }
      }]
    ]);
  }

  /**
   * Process a reward event and distribute ScrollCoin
   */
  async processRewardEvent(event: RewardEvent): Promise<{
    awarded: boolean;
    amount: number;
    reason: string;
    transactionId?: string;
  }> {
    try {
      const rule = this.rewardRules.get(event.eventType);
      if (!rule) {
        logger.warn(`No reward rule found for event type: ${event.eventType}`);
        return {
          awarded: false,
          amount: 0,
          reason: 'No reward rule configured'
        };
      }

      // Check conditions
      const conditionCheck = await this.checkConditions(event, rule);
      if (!conditionCheck.passed) {
        return {
          awarded: false,
          amount: 0,
          reason: conditionCheck.reason
        };
      }

      // Calculate reward amount
      const amount = await this.calculateRewardAmount(event, rule);
      
      // Award the ScrollCoin
      const transaction = await this.awardScrollCoin(event, amount);

      logger.info(`Reward awarded: ${amount} ScrollCoin to user ${event.userId} for ${event.eventType}`);

      return {
        awarded: true,
        amount,
        reason: `Reward for ${event.eventType}`,
        transactionId: transaction.id
      };
    } catch (error) {
      logger.error('Error processing reward event:', error);
      return {
        awarded: false,
        amount: 0,
        reason: 'Error processing reward'
      };
    }
  }

  /**
   * Check if conditions are met for reward
   */
  private async checkConditions(event: RewardEvent, rule: RewardRule): Promise<{
    passed: boolean;
    reason: string;
  }> {
    try {
      // Check minimum score requirement
      if (rule.conditions?.minScore && event.metadata?.score < rule.conditions.minScore) {
        return {
          passed: false,
          reason: `Score ${event.metadata.score} below minimum ${rule.conditions.minScore}`
        };
      }

      // Check time window for duplicate prevention
      if (rule.conditions?.timeWindow) {
        const recentReward = await this.checkRecentReward(
          event.userId,
          event.eventType,
          rule.conditions.timeWindow
        );
        
        if (recentReward) {
          return {
            passed: false,
            reason: `Reward already given within ${rule.conditions.timeWindow} hours`
          };
        }
      }

      // Check required level
      if (rule.conditions?.requiredLevel) {
        const userLevel = await this.getUserLevel(event.userId);
        if (userLevel !== rule.conditions.requiredLevel) {
          return {
            passed: false,
            reason: `User level ${userLevel} does not meet requirement ${rule.conditions.requiredLevel}`
          };
        }
      }

      return { passed: true, reason: 'All conditions met' };
    } catch (error) {
      logger.error('Error checking reward conditions:', error);
      return { passed: false, reason: 'Error checking conditions' };
    }
  }

  /**
   * Calculate the final reward amount with multipliers
   */
  private async calculateRewardAmount(event: RewardEvent, rule: RewardRule): Promise<number> {
    let amount = rule.baseReward;

    if (rule.multipliers) {
      // Apply difficulty multiplier
      if (rule.multipliers.difficulty && event.metadata?.difficulty === 'ADVANCED') {
        amount *= rule.multipliers.difficulty;
      }

      // Apply quality multiplier
      if (rule.multipliers.quality && event.metadata?.quality === 'EXCELLENT') {
        amount *= rule.multipliers.quality;
      }

      // Apply impact multiplier
      if (rule.multipliers.impact && event.metadata?.impact === 'HIGH') {
        amount *= rule.multipliers.impact;
      }

      // Apply streak multiplier
      if (rule.multipliers.streak && event.metadata?.streakDays) {
        const streakMultiplier = Math.pow(rule.multipliers.streak, event.metadata.streakDays);
        amount *= Math.min(streakMultiplier, 3.0); // Cap at 3x multiplier
      }
    }

    return Math.floor(amount);
  }

  /**
   * Award ScrollCoin to user
   */
  private async awardScrollCoin(event: RewardEvent, amount: number) {
    const description = this.generateRewardDescription(event);
    
    return await this.scrollCoinService.mintScrollCoin(
      event.userId,
      this.mapEventTypeToActivity(event.eventType),
      description,
      event.entityId
    );
  }

  /**
   * Generate human-readable reward description
   */
  private generateRewardDescription(event: RewardEvent): string {
    const descriptions = {
      [RewardEventType.COURSE_COMPLETION]: 'Course completion reward',
      [RewardEventType.ASSIGNMENT_SUBMISSION]: 'Assignment submission reward',
      [RewardEventType.PEER_ASSISTANCE]: 'Peer assistance reward',
      [RewardEventType.DAILY_LOGIN]: 'Daily login bonus',
      [RewardEventType.LEARNING_STREAK]: 'Learning streak bonus',
      [RewardEventType.RESEARCH_PUBLICATION]: 'Research publication reward',
      [RewardEventType.MENTORING_SESSION]: 'Mentoring session reward',
      [RewardEventType.TRANSLATION_CONTRIBUTION]: 'Translation contribution reward',
      [RewardEventType.TOOL_BUILDING]: 'Tool building reward',
      [RewardEventType.MISSION_SERVICE]: 'Mission service reward',
      [RewardEventType.SPIRITUAL_MILESTONE]: 'Spiritual milestone reward',
      [RewardEventType.COMMUNITY_CONTRIBUTION]: 'Community contribution reward'
    };

    return descriptions[event.eventType] || 'Activity reward';
  }

  /**
   * Map event type to ScrollCoin activity type
   */
  private mapEventTypeToActivity(eventType: RewardEventType): keyof import('./ScrollCoinService').RewardConfiguration {
    const mapping = {
      [RewardEventType.COURSE_COMPLETION]: 'courseCompletion' as const,
      [RewardEventType.PEER_ASSISTANCE]: 'peerAssistance' as const,
      [RewardEventType.DAILY_LOGIN]: 'dailyStreak' as const,
      [RewardEventType.LEARNING_STREAK]: 'dailyStreak' as const,
      [RewardEventType.RESEARCH_PUBLICATION]: 'researchPublication' as const,
      [RewardEventType.MENTORING_SESSION]: 'mentoring' as const,
      [RewardEventType.TRANSLATION_CONTRIBUTION]: 'translation' as const,
      [RewardEventType.TOOL_BUILDING]: 'toolBuilding' as const,
      [RewardEventType.MISSION_SERVICE]: 'missionService' as const
    };

    return mapping[eventType] || 'courseCompletion';
  }

  /**
   * Check if user received reward recently
   */
  private async checkRecentReward(
    userId: string,
    eventType: RewardEventType,
    timeWindowHours: number
  ): Promise<boolean> {
    const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    
    const recentTransaction = await prisma.scrollCoinTransaction.findFirst({
      where: {
        userId,
        activityType: eventType,
        createdAt: {
          gte: cutoffTime
        }
      }
    });

    return !!recentTransaction;
  }

  /**
   * Get user's current level
   */
  private async getUserLevel(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { academicLevel: true }
    });

    return user?.academicLevel || 'SCROLL_OPEN';
  }

  /**
   * Process course completion reward
   */
  async processCourseCompletion(
    userId: string,
    courseId: string,
    score: number,
    difficulty: string
  ): Promise<any> {
    const event: RewardEvent = {
      userId,
      eventType: RewardEventType.COURSE_COMPLETION,
      entityId: courseId,
      metadata: {
        score,
        difficulty: difficulty.toUpperCase(),
        quality: score >= 90 ? 'EXCELLENT' : score >= 80 ? 'GOOD' : 'AVERAGE'
      },
      timestamp: new Date()
    };

    return await this.processRewardEvent(event);
  }

  /**
   * Process peer assistance reward
   */
  async processPeerAssistance(
    helperId: string,
    helpedUserId: string,
    impact: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
  ): Promise<any> {
    const event: RewardEvent = {
      userId: helperId,
      eventType: RewardEventType.PEER_ASSISTANCE,
      entityId: helpedUserId,
      metadata: { impact },
      timestamp: new Date()
    };

    return await this.processRewardEvent(event);
  }

  /**
   * Process daily login reward
   */
  async processDailyLogin(userId: string): Promise<any> {
    const event: RewardEvent = {
      userId,
      eventType: RewardEventType.DAILY_LOGIN,
      timestamp: new Date()
    };

    return await this.processRewardEvent(event);
  }

  /**
   * Process learning streak reward
   */
  async processLearningStreak(userId: string, streakDays: number): Promise<any> {
    const event: RewardEvent = {
      userId,
      eventType: RewardEventType.LEARNING_STREAK,
      metadata: { streakDays },
      timestamp: new Date()
    };

    return await this.processRewardEvent(event);
  }

  /**
   * Update reward rule
   */
  updateRewardRule(eventType: RewardEventType, rule: RewardRule): void {
    this.rewardRules.set(eventType, rule);
    logger.info(`Reward rule updated for ${eventType}:`, rule);
  }

  /**
   * Get all reward rules
   */
  getRewardRules(): Map<RewardEventType, RewardRule> {
    return new Map(this.rewardRules);
  }

  /**
   * Get reward statistics for a user
   */
  async getUserRewardStats(userId: string): Promise<{
    totalEarned: number;
    rewardsByType: Record<string, number>;
    recentRewards: any[];
  }> {
    try {
      const transactions = await prisma.scrollCoinTransaction.findMany({
        where: {
          userId,
          type: { in: ['EARNED', 'BONUS'] }
        },
        orderBy: { createdAt: 'desc' }
      });

      const totalEarned = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      
      const rewardsByType: Record<string, number> = {};
      transactions.forEach(tx => {
        if (tx.activityType) {
          rewardsByType[tx.activityType] = (rewardsByType[tx.activityType] || 0) + tx.amount;
        }
      });

      const recentRewards = transactions.slice(0, 10).map(tx => ({
        amount: tx.amount,
        description: tx.description,
        activityType: tx.activityType,
        createdAt: tx.createdAt
      }));

      return {
        totalEarned,
        rewardsByType,
        recentRewards
      };
    } catch (error) {
      logger.error('Error getting user reward stats:', error);
      throw error;
    }
  }
}

export default RewardMechanismService;