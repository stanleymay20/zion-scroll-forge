/**
 * ScrollGold Billing Integration Service
 * "Store up for yourselves treasures in heaven" (Matthew 6:20)
 * 
 * Handles ScrollGold earning and spending integrated with the billing system.
 * Implements kingdom economics: Access → Transformation → Stewardship
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ============================================================================
// TYPES
// ============================================================================

export interface ModuleCompletionReward {
  userId: string;
  moduleId: string;
  courseId: string;
  score: number;
  completedAt: Date;
}

export interface DailyStreakReward {
  userId: string;
  streakDays: number;
  lastActivityDate: Date;
}

export interface CommunityServiceReward {
  userId: string;
  serviceType: string;
  hours: number;
  description: string;
  verifiedBy?: string;
}

export interface FaithfulPaymentBonus {
  userId: string;
  subscriptionId: string;
  paymentId: string;
  consecutivePayments: number;
}

export interface BestowScrollGoldRequest {
  userId: string;
  amount: number;
  reason: string;
  bestowedBy: string;
  metadata?: Record<string, any>;
}

export interface EarningOpportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  potentialEarning: number;
  requirements: string[];
  actionUrl?: string;
  isAvailable: boolean;
}

export interface ScrollGoldWalletInfo {
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  earnedFromModules: number;
  earnedFromStreaks: number;
  earnedFromService: number;
  earnedFromBestowed: number;
  spentOnDiscounts: number;
  spentOnFeatures: number;
  spentOnMentorship: number;
  isFrozen: boolean;
  frozenReason?: string;
}

export interface ScrollGoldTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend' | 'bestow' | 'refund' | 'adjustment';
  reason: string;
  category?: string;
  balanceAfter: number;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class ScrollGoldBillingIntegrationService {
  private static instance: ScrollGoldBillingIntegrationService;

  private constructor() {}

  public static getInstance(): ScrollGoldBillingIntegrationService {
    if (!ScrollGoldBillingIntegrationService.instance) {
      ScrollGoldBillingIntegrationService.instance = new ScrollGoldBillingIntegrationService();
    }
    return ScrollGoldBillingIntegrationService.instance;
  }

  // ==========================================================================
  // SUBTASK 6.1: MODULE COMPLETION REWARD LOGIC
  // ==========================================================================

  /**
   * Award ScrollGold for module completion with 80%+ score
   * Requirement 11.2: WHEN ScrollGold is earned THEN the system SHALL award credits for excellent grades
   * Requirement 18.2: WHEN students complete modules with 80%+ THEN the system SHALL award ScrollGold credits
   */
  async awardModuleCompletionReward(
    request: ModuleCompletionReward
  ): Promise<ScrollGoldTransaction> {
    try {
      logger.info('Processing module completion reward', { request });

      // Validate score threshold (80%+)
      if (request.score < 80) {
        logger.info('Score below threshold for reward', {
          userId: request.userId,
          moduleId: request.moduleId,
          score: request.score
        });
        throw new Error('Score must be 80% or higher to earn ScrollGold reward');
      }

      // Get earning rule for module completion
      const earningRule = await prisma.scrollGoldEarningRule.findFirst({
        where: {
          ruleType: 'MODULE_COMPLETION',
          isActive: true
        }
      });

      if (!earningRule) {
        throw new Error('Module completion earning rule not found');
      }

      // Check for duplicate reward (prevent gaming the system)
      const duplicateCheckHash = this.generateDuplicateCheckHash(
        request.userId,
        'MODULE_COMPLETION',
        request.moduleId
      );

      const existingEvent = await prisma.scrollGoldEarningEvent.findFirst({
        where: {
          userId: request.userId,
          duplicateCheckHash: duplicateCheckHash,
          verificationStatus: { in: ['AUTO_APPROVED', 'MANUAL_APPROVED'] }
        }
      });

      if (existingEvent) {
        throw new Error('Reward already claimed for this module');
      }

      // Calculate reward amount (base 50 ScrollGold)
      const rewardAmount = earningRule.baseAmount;

      // Create earning event
      const earningEvent = await prisma.scrollGoldEarningEvent.create({
        data: {
          userId: request.userId,
          eventType: 'MODULE_COMPLETION',
          earningRuleId: earningRule.id,
          amountEarned: rewardAmount,
          courseId: request.courseId,
          moduleId: request.moduleId,
          scorePercentage: request.score,
          verificationStatus: 'AUTO_APPROVED',
          processed_at: new Date(),
          duplicateCheckHash: duplicateCheckHash
        }
      });

      // Create transaction and update wallet
      const transaction = await this.createEarningTransaction({
        userId: request.userId,
        amount: rewardAmount,
        reason: `Module completion reward (${request.score}% score)`,
        category: 'module_completion',
        earningRuleId: earningRule.id,
        relatedEntityType: 'module',
        relatedEntityId: request.moduleId,
        metadata: {
          courseId: request.courseId,
          score: request.score,
          completedAt: request.completedAt
        }
      });

      // Update wallet stats
      await prisma.scrollGoldWalletBalance.update({
        where: { userId: request.userId },
        data: {
          totalModuleCompletions: { increment: 1 }
        }
      });

      // Link transaction to earning event
      await prisma.scrollGoldEarningEvent.update({
        where: { id: earningEvent.id },
        data: { transaction_id: transaction.id }
      });

      logger.info('Module completion reward awarded successfully', {
        userId: request.userId,
        moduleId: request.moduleId,
        amount: rewardAmount,
        transactionId: transaction.id
      });

      return transaction;
    } catch (error) {
      logger.error('Error awarding module completion reward', { error, request });
      throw error;
    }
  }

  // ==========================================================================
  // SUBTASK 6.2: DAILY STREAK REWARD SYSTEM
  // ==========================================================================

  /**
   * Award ScrollGold for maintaining daily study streaks
   * Requirement 18.2: WHEN students maintain daily study streaks THEN the system SHALL award bonus ScrollGold
   */
  async awardDailyStreakReward(
    request: DailyStreakReward
  ): Promise<ScrollGoldTransaction> {
    try {
      logger.info('Processing daily streak reward', { request });

      // Validate streak days
      if (request.streakDays < 1) {
        throw new Error('Streak days must be at least 1');
      }

      // Get earning rule for daily streak
      const earningRule = await prisma.scrollGoldEarningRule.findFirst({
        where: {
          ruleType: 'DAILY_STREAK',
          isActive: true
        }
      });

      if (!earningRule) {
        throw new Error('Daily streak earning rule not found');
      }

      // Check cooldown (prevent multiple claims per day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const recentEvent = await prisma.scrollGoldEarningEvent.findFirst({
        where: {
          userId: request.userId,
          eventType: 'DAILY_STREAK',
          created_at: { gte: today }
        }
      });

      if (recentEvent) {
        throw new Error('Daily streak reward already claimed today');
      }

      // Calculate reward amount (base 10 ScrollGold, bonus for longer streaks)
      let rewardAmount = earningRule.baseAmount;
      
      // Bonus for milestone streaks
      if (request.streakDays >= 30) {
        rewardAmount += 20; // 30-day milestone
      } else if (request.streakDays >= 7) {
        rewardAmount += 10; // 7-day milestone
      }

      // Cap at max amount
      if (earningRule.maxAmount && rewardAmount > earningRule.maxAmount) {
        rewardAmount = earningRule.maxAmount;
      }

      // Create earning event
      const earningEvent = await prisma.scrollGoldEarningEvent.create({
        data: {
          userId: request.userId,
          eventType: 'DAILY_STREAK',
          earningRuleId: earningRule.id,
          amountEarned: rewardAmount,
          streakDays: request.streakDays,
          verificationStatus: 'AUTO_APPROVED',
          processed_at: new Date()
        }
      });

      // Create transaction and update wallet
      const transaction = await this.createEarningTransaction({
        userId: request.userId,
        amount: rewardAmount,
        reason: `Daily streak reward (${request.streakDays} days)`,
        category: 'daily_streak',
        earningRuleId: earningRule.id,
        metadata: {
          streakDays: request.streakDays,
          lastActivityDate: request.lastActivityDate
        }
      });

      // Update wallet stats
      await prisma.scrollGoldWalletBalance.update({
        where: { userId: request.userId },
        data: {
          total_streakDays: request.streakDays
        }
      });

      // Link transaction to earning event
      await prisma.scrollGoldEarningEvent.update({
        where: { id: earningEvent.id },
        data: { transaction_id: transaction.id }
      });

      logger.info('Daily streak reward awarded successfully', {
        userId: request.userId,
        streakDays: request.streakDays,
        amount: rewardAmount,
        transactionId: transaction.id
      });

      return transaction;
    } catch (error) {
      logger.error('Error awarding daily streak reward', { error, request });
      throw error;
    }
  }

  // ==========================================================================
  // SUBTASK 6.3: COMMUNITY SERVICE REWARD TRACKING
  // ==========================================================================

  /**
   * Award ScrollGold for community service contributions
   * Requirement 18.3: WHEN students contribute projects or help peers THEN the system SHALL award ScrollGold
   */
  async awardCommunityServiceReward(
    request: CommunityServiceReward
  ): Promise<ScrollGoldTransaction> {
    try {
      logger.info('Processing community service reward', { request });

      // Validate hours
      if (request.hours <= 0) {
        throw new Error('Service hours must be greater than zero');
      }

      // Get earning rule for community service
      const earningRule = await prisma.scrollGoldEarningRule.findFirst({
        where: {
          ruleType: 'COMMUNITY_SERVICE',
          isActive: true
        }
      });

      if (!earningRule) {
        throw new Error('Community service earning rule not found');
      }

      // Calculate reward amount (25 ScrollGold per hour, capped at max)
      let rewardAmount = earningRule.baseAmount * request.hours;
      
      if (earningRule.maxAmount && rewardAmount > earningRule.maxAmount) {
        rewardAmount = earningRule.maxAmount;
      }

      // Determine verification status
      const verificationStatus = earningRule.requires_verification
        ? 'PENDING'
        : 'AUTO_APPROVED';

      // Create earning event
      const earningEvent = await prisma.scrollGoldEarningEvent.create({
        data: {
          userId: request.userId,
          eventType: 'COMMUNITY_SERVICE',
          earningRuleId: earningRule.id,
          amountEarned: rewardAmount,
          verificationStatus: verificationStatus,
          verified_by: request.verifiedBy,
          verified_at: request.verifiedBy ? new Date() : null,
          processed_at: verificationStatus === 'AUTO_APPROVED' ? new Date() : null
        }
      });

      // Only create transaction if auto-approved
      if (verificationStatus === 'AUTO_APPROVED') {
        const transaction = await this.createEarningTransaction({
          userId: request.userId,
          amount: rewardAmount,
          reason: `Community service reward (${request.hours} hours)`,
          category: 'community_service',
          earningRuleId: earningRule.id,
          metadata: {
            serviceType: request.serviceType,
            hours: request.hours,
            description: request.description,
            verifiedBy: request.verifiedBy
          }
        });

        // Update wallet stats
        await prisma.scrollGoldWalletBalance.update({
          where: { userId: request.userId },
          data: {
            total_community_service_hours: { increment: request.hours }
          }
        });

        // Link transaction to earning event
        await prisma.scrollGoldEarningEvent.update({
          where: { id: earningEvent.id },
          data: { transaction_id: transaction.id }
        });

        logger.info('Community service reward awarded successfully', {
          userId: request.userId,
          hours: request.hours,
          amount: rewardAmount,
          transactionId: transaction.id
        });

        return transaction;
      } else {
        logger.info('Community service reward pending verification', {
          userId: request.userId,
          hours: request.hours,
          amount: rewardAmount,
          eventId: earningEvent.id
        });

        // Return pending transaction info
        return {
          id: earningEvent.id,
          userId: request.userId,
          amount: rewardAmount,
          type: 'earn',
          reason: `Community service reward pending verification (${request.hours} hours)`,
          category: 'community_service',
          balanceAfter: 0, // Not yet applied
          createdAt: new Date()
        } as ScrollGoldTransaction;
      }
    } catch (error) {
      logger.error('Error awarding community service reward', { error, request });
      throw error;
    }
  }

  // ==========================================================================
  // SUBTASK 6.4: FAITHFUL PAYMENT BONUS
  // ==========================================================================

  /**
   * Award ScrollGold for faithful recurring payments
   * Requirement 18.2: WHEN students maintain daily study streaks THEN the system SHALL award bonus ScrollGold
   * Requirement 11.2: WHEN ScrollGold is earned THEN the system SHALL award credits for faithful payment
   */
  async awardFaithfulPaymentBonus(
    request: FaithfulPaymentBonus
  ): Promise<ScrollGoldTransaction> {
    try {
      logger.info('Processing faithful payment bonus', { request });

      // Get earning rule for faithful payment
      const earningRule = await prisma.scrollGoldEarningRule.findFirst({
        where: {
          ruleType: 'FAITHFUL_PAYMENT',
          isActive: true
        }
      });

      if (!earningRule) {
        throw new Error('Faithful payment earning rule not found');
      }

      // Award 20 ScrollGold per recurring payment
      const rewardAmount = earningRule.baseAmount;

      // Create earning event
      const earningEvent = await prisma.scrollGoldEarningEvent.create({
        data: {
          userId: request.userId,
          eventType: 'FAITHFUL_PAYMENT',
          earningRuleId: earningRule.id,
          amountEarned: rewardAmount,
          verificationStatus: 'AUTO_APPROVED',
          processed_at: new Date()
        }
      });

      // Create transaction and update wallet
      const transaction = await this.createEarningTransaction({
        userId: request.userId,
        amount: rewardAmount,
        reason: `Faithful payment bonus (${request.consecutivePayments} consecutive payments)`,
        category: 'faithful_payment',
        earningRuleId: earningRule.id,
        relatedEntityType: 'payment',
        relatedEntityId: request.paymentId,
        metadata: {
          subscriptionId: request.subscriptionId,
          paymentId: request.paymentId,
          consecutivePayments: request.consecutivePayments
        }
      });

      // Update wallet stats
      await prisma.scrollGoldWalletBalance.update({
        where: { userId: request.userId },
        data: {
          total_faithful_payments: { increment: 1 }
        }
      });

      // Link transaction to earning event and payment
      await prisma.scrollGoldEarningEvent.update({
        where: { id: earningEvent.id },
        data: { transaction_id: transaction.id }
      });

      // Link transaction to subscription and payment
      await prisma.scrollGoldTransaction.update({
        where: { id: transaction.id },
        data: {
          subscription_id: request.subscriptionId,
          payment_id: request.paymentId,
          billingRelated: true
        }
      });

      logger.info('Faithful payment bonus awarded successfully', {
        userId: request.userId,
        consecutivePayments: request.consecutivePayments,
        amount: rewardAmount,
        transactionId: transaction.id
      });

      return transaction;
    } catch (error) {
      logger.error('Error awarding faithful payment bonus', { error, request });
      throw error;
    }
  }

  // ==========================================================================
  // SUBTASK 6.5: BESTOW SCROLLGOLD (ADMIN HONOR-BASED AWARDS)
  // ==========================================================================

  /**
   * Bestow ScrollGold for exceptional contributions (admin only)
   * Requirement 18.5: WHEN ScrollGold is bestowed THEN the system SHALL allow administrators to grant honor-based ScrollGold
   */
  async bestowScrollGold(
    request: BestowScrollGoldRequest
  ): Promise<ScrollGoldTransaction> {
    try {
      logger.info('Processing ScrollGold bestowment', { request });

      // Validate amount
      if (request.amount <= 0) {
        throw new Error('Bestowment amount must be greater than zero');
      }

      // Get earning rule for admin bestowment
      const earningRule = await prisma.scrollGoldEarningRule.findFirst({
        where: {
          ruleType: 'ADMIN_BESTOW',
          isActive: true
        }
      });

      if (!earningRule) {
        throw new Error('Admin bestowment earning rule not found');
      }

      // Cap at max amount if specified
      let bestowAmount = request.amount;
      if (earningRule.maxAmount && bestowAmount > earningRule.maxAmount) {
        bestowAmount = earningRule.maxAmount;
      }

      // Create earning event
      const earningEvent = await prisma.scrollGoldEarningEvent.create({
        data: {
          userId: request.userId,
          eventType: 'ADMIN_BESTOW',
          earningRuleId: earningRule.id,
          amountEarned: bestowAmount,
          verificationStatus: 'MANUAL_APPROVED',
          verified_by: request.bestowedBy,
          verified_at: new Date(),
          processed_at: new Date()
        }
      });

      // Create transaction and update wallet
      const transaction = await this.createEarningTransaction({
        userId: request.userId,
        amount: bestowAmount,
        reason: request.reason,
        category: 'admin_bestow',
        earningRuleId: earningRule.id,
        metadata: {
          bestowedBy: request.bestowedBy,
          ...request.metadata
        }
      });

      // Update wallet stats
      await prisma.scrollGoldWalletBalance.update({
        where: { userId: request.userId },
        data: {
          // Track bestowed amounts separately
          updated_at: new Date()
        }
      });

      // Link transaction to earning event
      await prisma.scrollGoldEarningEvent.update({
        where: { id: earningEvent.id },
        data: { transaction_id: transaction.id }
      });

      logger.info('ScrollGold bestowed successfully', {
        userId: request.userId,
        amount: bestowAmount,
        bestowedBy: request.bestowedBy,
        transactionId: transaction.id
      });

      return transaction;
    } catch (error) {
      logger.error('Error bestowing ScrollGold', { error, request });
      throw error;
    }
  }

  // ==========================================================================
  // SUBTASK 6.6: GET EARNING OPPORTUNITIES
  // ==========================================================================

  /**
   * Get available earning opportunities for student motivation
   * Requirement 11.6: WHEN earning opportunities are presented THEN the system SHALL highlight ways students can earn coins
   */
  async getEarningOpportunities(userId: string): Promise<EarningOpportunity[]> {
    try {
      logger.info('Fetching earning opportunities', { userId });

      const opportunities: EarningOpportunity[] = [];

      // Get all active earning rules
      const earningRules = await prisma.scrollGoldEarningRule.findMany({
        where: { isActive: true },
        orderBy: { priority: 'desc' }
      });

      // Get user's wallet and stats
      const wallet = await this.getWalletInfo(userId);

      // Module Completion Opportunities
      const moduleRule = earningRules.find(r => r.ruleType === 'MODULE_COMPLETION');
      if (moduleRule) {
        opportunities.push({
          id: 'module-completion',
          title: 'Complete Course Modules',
          description: `Earn ${moduleRule.baseAmount} ScrollGold for each module completed with 80%+ score`,
          category: 'achievement',
          potentialEarning: moduleRule.baseAmount,
          requirements: [
            'Complete module assignments',
            'Score 80% or higher on assessments',
            'Submit all required work'
          ],
          actionUrl: '/courses',
          isAvailable: true
        });
      }

      // Daily Streak Opportunities
      const streakRule = earningRules.find(r => r.ruleType === 'DAILY_STREAK');
      if (streakRule) {
        opportunities.push({
          id: 'daily-streak',
          title: 'Maintain Daily Learning Streak',
          description: `Earn ${streakRule.baseAmount} ScrollGold daily for consistent study habits`,
          category: 'consistency',
          potentialEarning: streakRule.baseAmount,
          requirements: [
            'Log in daily',
            'Complete at least one learning activity',
            'Maintain consecutive days'
          ],
          actionUrl: '/dashboard',
          isAvailable: true
        });
      }

      // Community Service Opportunities
      const serviceRule = earningRules.find(r => r.ruleType === 'COMMUNITY_SERVICE');
      if (serviceRule) {
        opportunities.push({
          id: 'community-service',
          title: 'Contribute to Community',
          description: `Earn ${serviceRule.baseAmount} ScrollGold per hour of verified service`,
          category: 'service',
          potentialEarning: serviceRule.baseAmount,
          requirements: [
            'Help fellow students',
            'Contribute to projects',
            'Mentor others',
            'Verification may be required'
          ],
          actionUrl: '/community',
          isAvailable: true
        });
      }

      // Faithful Payment Opportunities
      const paymentRule = earningRules.find(r => r.ruleType === 'FAITHFUL_PAYMENT');
      if (paymentRule) {
        opportunities.push({
          id: 'faithful-payment',
          title: 'Faithful Payment Bonus',
          description: `Earn ${paymentRule.baseAmount} ScrollGold for each on-time subscription payment`,
          category: 'faithfulness',
          potentialEarning: paymentRule.baseAmount,
          requirements: [
            'Active subscription',
            'On-time payments',
            'Automatic bonus on payment success'
          ],
          actionUrl: '/billing',
          isAvailable: true
        });
      }

      logger.info('Earning opportunities fetched successfully', {
        userId,
        opportunityCount: opportunities.length
      });

      return opportunities;
    } catch (error) {
      logger.error('Error fetching earning opportunities', { error, userId });
      throw error;
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Get wallet information for a user
   */
  async getWalletInfo(userId: string): Promise<ScrollGoldWalletInfo> {
    try {
      // Get or create wallet
      let wallet = await prisma.scrollGoldWalletBalance.findUnique({
        where: { userId: userId }
      });

      if (!wallet) {
        // Initialize wallet for new user
        wallet = await prisma.scrollGoldWalletBalance.create({
          data: { userId: userId }
        });
      }

      return {
        userId: wallet.userId,
        balance: wallet.currentBalance,
        lifetimeEarned: wallet.lifetimeEarned,
        lifetimeSpent: wallet.lifetimeSpent,
        earnedFromModules: wallet.totalModuleCompletions * 50, // Approximate
        earnedFromStreaks: wallet.total_streakDays * 10, // Approximate
        earnedFromService: Number(wallet.total_community_service_hours) * 25, // Approximate
        earnedFromBestowed: 0, // Would need separate tracking
        spentOnDiscounts: wallet.total_discounts_applied_cents / 5, // 100 ScrollGold = €5
        spentOnFeatures: wallet.total_features_unlocked * 200, // Approximate
        spentOnMentorship: 0, // Would need separate tracking
        isFrozen: wallet.is_frozen,
        frozenReason: wallet.frozen_reason || undefined
      };
    } catch (error) {
      logger.error('Error getting wallet info', { error, userId });
      throw error;
    }
  }

  /**
   * Create an earning transaction and update wallet balance
   */
  private async createEarningTransaction(params: {
    userId: string;
    amount: number;
    reason: string;
    category: string;
    earningRuleId: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    metadata?: Record<string, any>;
  }): Promise<ScrollGoldTransaction> {
    try {
      // Get current wallet balance
      const wallet = await prisma.scrollGoldWalletBalance.findUnique({
        where: { userId: params.userId }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const newBalance = wallet.currentBalance + params.amount;

      // Create transaction
      const transaction = await prisma.scrollGoldTransaction.create({
        data: {
          userId: params.userId,
          amount: params.amount,
          transactionType: 'EARNED',
          reason: params.reason,
          category: params.category,
          balanceAfter: newBalance,
          earningRuleId: params.earningRuleId,
          related_entity_type: params.relatedEntityType,
          related_entity_id: params.relatedEntityId,
          metadata: params.metadata || {},
          verificationStatus: 'VERIFIED',
          fraudCheckPassed: true
        }
      });

      // Update wallet balance (trigger will handle this, but we do it explicitly for consistency)
      await prisma.scrollGoldWalletBalance.update({
        where: { userId: params.userId },
        data: {
          currentBalance: newBalance,
          lifetimeEarned: { increment: params.amount },
          last_transaction_at: new Date(),
          updated_at: new Date()
        }
      });

      return {
        id: transaction.id,
        userId: transaction.userId,
        amount: transaction.amount,
        type: 'earn',
        reason: transaction.reason,
        category: transaction.category || undefined,
        balanceAfter: transaction.balanceAfter,
        relatedEntityType: transaction.related_entity_type || undefined,
        relatedEntityId: transaction.related_entity_id || undefined,
        metadata: transaction.metadata as Record<string, any>,
        createdAt: transaction.created_at
      };
    } catch (error) {
      logger.error('Error creating earning transaction', { error, params });
      throw error;
    }
  }

  /**
   * Generate duplicate check hash to prevent duplicate rewards
   */
  private generateDuplicateCheckHash(
    userId: string,
    eventType: string,
    entityId: string
  ): string {
    const crypto = require('crypto');
    const data = `${userId}-${eventType}-${entityId}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

export default ScrollGoldBillingIntegrationService.getInstance();
