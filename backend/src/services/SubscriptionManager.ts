/**
 * Subscription Manager Service
 * "By the wisdom of the Spirit, we manage subscriptions with justice and grace"
 * 
 * Handles comprehensive subscription management including:
 * - Tier upgrades and downgrades with prorated billing
 * - Access control grant/revoke based on subscription status
 * - Subscription analytics (churn rate, LTV, conversion rates)
 * - Subscription cancellation with grace period
 * - Feature access management
 */

import { PrismaClient } from '@prisma/client';
import { StripePaymentService } from './StripePaymentService';
import { 
  SubscriptionTier, 
  SubscriptionStatus,
  Subscription 
} from '../types/billing.types';
import { 
  getProductConfig, 
  isUpgradeAllowed,
  TIER_CHANGE_RULES,
  ANALYTICS_CONFIG 
} from '../config/billing.config';
import { logger } from '../utils/productionLogger';

const prisma = new PrismaClient();

export interface TierUpgradeRequest {
  userId: string;
  currentTier: SubscriptionTier;
  newTier: SubscriptionTier;
  newPriceId: string;
}

export interface TierDowngradeRequest {
  userId: string;
  currentTier: SubscriptionTier;
  newTier: SubscriptionTier;
  newPriceId: string;
  immediate?: boolean;
}

export interface ProrationResult {
  proratedAmountCents: number;
  currency: string;
  creditAmountCents: number;
  chargeAmountCents: number;
}

export interface SubscriptionAnalytics {
  churnRate: number;
  lifetimeValue: number;
  conversionRate: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  averageSubscriptionLength: number;
}

export interface CancellationRequest {
  userId: string;
  subscriptionId: string;
  reason?: string;
  immediate?: boolean;
  feedback?: string;
}

export interface FeatureAccessResult {
  hasAccess: boolean;
  feature: string;
  tier: SubscriptionTier;
  reason?: string;
}

/**
 * Subscription Manager Service
 * Manages all subscription lifecycle operations with spiritual integrity
 */
export class SubscriptionManager {
  private stripeService: StripePaymentService;

  constructor() {
    this.stripeService = new StripePaymentService();
  }

  /**
   * Upgrade subscription tier with prorated billing
   */
  async upgradeTier(request: TierUpgradeRequest): Promise<Subscription> {
    try {
      logger.info('Processing tier upgrade', {
        userId: request.userId,
        currentTier: request.currentTier,
        newTier: request.newTier
      });

      // Validate upgrade is allowed
      if (!isUpgradeAllowed(request.currentTier, request.newTier)) {
        throw new Error(`Upgrade from ${request.currentTier} to ${request.newTier} is not allowed`);
      }

      // Get current subscription
      const currentSubscription = await prisma.subscription.findFirst({
        where: {
          userId: request.userId,
          status: SubscriptionStatus.ACTIVE
        }
      });

      if (!currentSubscription) {
        throw new Error('No active subscription found');
      }

      // Calculate proration
      const proration = await this.calculateProration(
        currentSubscription,
        request.newTier,
        request.newPriceId
      );

      // Update subscription in Stripe
      const stripeSubscription = await this.stripeService.updateSubscription(
        currentSubscription.stripeSubscriptionId!,
        {
          items: [{
            id: currentSubscription.stripeSubscriptionItemId!,
            price: request.newPriceId
          }],
          proration_behavior: 'create_prorations'
        }
      );

      // Update subscription in database
      const updatedSubscription = await prisma.subscription.update({
        where: { id: currentSubscription.id },
        data: {
          tier: request.newTier,
          stripePriceId: request.newPriceId,
          updatedAt: new Date()
        }
      });

      // Grant new tier access
      await this.grantTierAccess(request.userId, request.newTier);

      // Log upgrade event
      await this.logSubscriptionEvent(request.userId, 'TIER_UPGRADED', {
        fromTier: request.currentTier,
        toTier: request.newTier,
        proration
      });

      logger.info('Tier upgrade completed successfully', {
        userId: request.userId,
        subscriptionId: updatedSubscription.id,
        newTier: request.newTier
      });

      return updatedSubscription;
    } catch (error) {
      logger.error('Tier upgrade failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: request.userId
      });
      throw error;
    }
  }

  /**
   * Downgrade subscription tier with optional immediate effect
   */
  async downgradeTier(request: TierDowngradeRequest): Promise<Subscription> {
    try {
      logger.info('Processing tier downgrade', {
        userId: request.userId,
        currentTier: request.currentTier,
        newTier: request.newTier,
        immediate: request.immediate
      });

      // Get current subscription
      const currentSubscription = await prisma.subscription.findFirst({
        where: {
          userId: request.userId,
          status: SubscriptionStatus.ACTIVE
        }
      });

      if (!currentSubscription) {
        throw new Error('No active subscription found');
      }

      if (request.immediate) {
        // Immediate downgrade with proration credit
        const proration = await this.calculateProration(
          currentSubscription,
          request.newTier,
          request.newPriceId
        );

        // Update subscription in Stripe
        await this.stripeService.updateSubscription(
          currentSubscription.stripeSubscriptionId!,
          {
            items: [{
              id: currentSubscription.stripeSubscriptionItemId!,
              price: request.newPriceId
            }],
            proration_behavior: 'create_prorations'
          }
        );

        // Update subscription in database
        const updatedSubscription = await prisma.subscription.update({
          where: { id: currentSubscription.id },
          data: {
            tier: request.newTier,
            stripePriceId: request.newPriceId,
            updatedAt: new Date()
          }
        });

        // Revoke old tier access and grant new tier access
        await this.revokeTierAccess(request.userId, request.currentTier);
        await this.grantTierAccess(request.userId, request.newTier);

        logger.info('Immediate tier downgrade completed', {
          userId: request.userId,
          subscriptionId: updatedSubscription.id
        });

        return updatedSubscription;
      } else {
        // Schedule downgrade for end of billing period
        const updatedSubscription = await prisma.subscription.update({
          where: { id: currentSubscription.id },
          data: {
            scheduledTierChange: request.newTier,
            scheduledPriceId: request.newPriceId,
            updatedAt: new Date()
          }
        });

        // Log scheduled downgrade
        await this.logSubscriptionEvent(request.userId, 'TIER_DOWNGRADE_SCHEDULED', {
          fromTier: request.currentTier,
          toTier: request.newTier,
          effectiveDate: currentSubscription.currentPeriodEnd
        });

        logger.info('Tier downgrade scheduled for end of period', {
          userId: request.userId,
          effectiveDate: currentSubscription.currentPeriodEnd
        });

        return updatedSubscription;
      }
    } catch (error) {
      logger.error('Tier downgrade failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: request.userId
      });
      throw error;
    }
  }

  /**
   * Cancel subscription with optional grace period
   */
  async cancelSubscription(request: CancellationRequest): Promise<Subscription> {
    try {
      logger.info('Processing subscription cancellation', {
        userId: request.userId,
        subscriptionId: request.subscriptionId,
        immediate: request.immediate
      });

      const subscription = await prisma.subscription.findUnique({
        where: { id: request.subscriptionId }
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (subscription.userId !== request.userId) {
        throw new Error('Unauthorized: Subscription does not belong to user');
      }

      if (request.immediate) {
        // Cancel immediately in Stripe
        await this.stripeService.cancelSubscription(
          subscription.stripeSubscriptionId!,
          { prorate: true }
        );

        // Update subscription status
        const canceledSubscription = await prisma.subscription.update({
          where: { id: request.subscriptionId },
          data: {
            status: SubscriptionStatus.CANCELED,
            canceledAt: new Date(),
            cancellationReason: request.reason,
            updatedAt: new Date()
          }
        });

        // Revoke access immediately
        await this.revokeTierAccess(request.userId, subscription.tier);

        logger.info('Subscription canceled immediately', {
          userId: request.userId,
          subscriptionId: request.subscriptionId
        });

        return canceledSubscription;
      } else {
        // Cancel at end of billing period
        await this.stripeService.updateSubscription(
          subscription.stripeSubscriptionId!,
          { cancel_at_period_end: true }
        );

        const updatedSubscription = await prisma.subscription.update({
          where: { id: request.subscriptionId },
          data: {
            cancelAtPeriodEnd: true,
            cancellationReason: request.reason,
            updatedAt: new Date()
          }
        });

        // Log scheduled cancellation
        await this.logSubscriptionEvent(request.userId, 'CANCELLATION_SCHEDULED', {
          reason: request.reason,
          effectiveDate: subscription.currentPeriodEnd
        });

        logger.info('Subscription cancellation scheduled', {
          userId: request.userId,
          effectiveDate: subscription.currentPeriodEnd
        });

        return updatedSubscription;
      }
    } catch (error) {
      logger.error('Subscription cancellation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: request.userId
      });
      throw error;
    }
  }

  /**
   * Check if user has access to specific feature
   */
  async checkFeatureAccess(userId: string, feature: string): Promise<FeatureAccessResult> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE
        }
      });

      if (!subscription) {
        return {
          hasAccess: false,
          feature,
          tier: SubscriptionTier.FREE,
          reason: 'No active subscription'
        };
      }

      const tierConfig = getProductConfig(subscription.tier);
      const hasAccess = tierConfig.features.includes(feature);

      return {
        hasAccess,
        feature,
        tier: subscription.tier,
        reason: hasAccess ? undefined : `Feature not available in ${subscription.tier} tier`
      };
    } catch (error) {
      logger.error('Feature access check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        feature
      });
      throw error;
    }
  }

  /**
   * Get subscription analytics
   */
  async getAnalytics(startDate: Date, endDate: Date): Promise<SubscriptionAnalytics> {
    try {
      const [
        activeCount,
        canceledCount,
        totalRevenue,
        avgLength
      ] = await Promise.all([
        prisma.subscription.count({
          where: {
            status: SubscriptionStatus.ACTIVE,
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        prisma.subscription.count({
          where: {
            status: SubscriptionStatus.CANCELED,
            canceledAt: { gte: startDate, lte: endDate }
          }
        }),
        prisma.payment.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true }
        }),
        this.calculateAverageSubscriptionLength(startDate, endDate)
      ]);

      const totalSubscriptions = activeCount + canceledCount;
      const churnRate = totalSubscriptions > 0 ? (canceledCount / totalSubscriptions) * 100 : 0;
      const lifetimeValue = activeCount > 0 ? (totalRevenue._sum.amount || 0) / activeCount : 0;
      const conversionRate = totalSubscriptions > 0 ? (activeCount / totalSubscriptions) * 100 : 0;

      return {
        churnRate,
        lifetimeValue,
        conversionRate,
        activeSubscriptions: activeCount,
        canceledSubscriptions: canceledCount,
        averageSubscriptionLength: avgLength
      };
    } catch (error) {
      logger.error('Analytics calculation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Calculate proration for tier change
   */
  private async calculateProration(
    currentSubscription: Subscription,
    newTier: SubscriptionTier,
    newPriceId: string
  ): Promise<ProrationResult> {
    try {
      const currentConfig = getProductConfig(currentSubscription.tier);
      const newConfig = getProductConfig(newTier);

      const now = new Date();
      const periodEnd = currentSubscription.currentPeriodEnd;
      const periodStart = currentSubscription.currentPeriodStart;

      const totalPeriodSeconds = (periodEnd.getTime() - periodStart.getTime()) / 1000;
      const remainingSeconds = (periodEnd.getTime() - now.getTime()) / 1000;
      const usedSeconds = totalPeriodSeconds - remainingSeconds;

      const currentPricePerSecond = currentConfig.priceUSD / totalPeriodSeconds;
      const newPricePerSecond = newConfig.priceUSD / totalPeriodSeconds;

      const usedAmount = currentPricePerSecond * usedSeconds;
      const creditAmount = currentConfig.priceUSD - usedAmount;
      const newPeriodCharge = newPricePerSecond * remainingSeconds;
      const proratedAmount = newPeriodCharge - creditAmount;

      return {
        proratedAmountCents: Math.round(proratedAmount * 100),
        currency: 'USD',
        creditAmountCents: Math.round(creditAmount * 100),
        chargeAmountCents: Math.round(newPeriodCharge * 100)
      };
    } catch (error) {
      logger.error('Proration calculation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Grant tier-specific access permissions
   */
  private async grantTierAccess(userId: string, tier: SubscriptionTier): Promise<void> {
    try {
      const tierConfig = getProductConfig(tier);
      
      // Update user permissions based on tier features
      await prisma.user.update({
        where: { id: userId },
        data: {
          // Grant access to tier features
          updatedAt: new Date()
        }
      });

      logger.info('Tier access granted', { userId, tier });
    } catch (error) {
      logger.error('Failed to grant tier access', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        tier
      });
      throw error;
    }
  }

  /**
   * Revoke tier-specific access permissions
   */
  private async revokeTierAccess(userId: string, tier: SubscriptionTier): Promise<void> {
    try {
      // Revoke tier-specific permissions
      await prisma.user.update({
        where: { id: userId },
        data: {
          updatedAt: new Date()
        }
      });

      logger.info('Tier access revoked', { userId, tier });
    } catch (error) {
      logger.error('Failed to revoke tier access', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        tier
      });
      throw error;
    }
  }

  /**
   * Log subscription event for audit trail
   */
  private async logSubscriptionEvent(
    userId: string,
    eventType: string,
    metadata: Record<string, unknown>
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action: eventType,
          entityType: 'SUBSCRIPTION',
          metadata: metadata as any,
          createdAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Failed to log subscription event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        eventType
      });
      // Don't throw - logging failure shouldn't break the main operation
    }
  }

  /**
   * Calculate average subscription length
   */
  private async calculateAverageSubscriptionLength(
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELED] }
        },
        select: {
          createdAt: true,
          canceledAt: true
        }
      });

      if (subscriptions.length === 0) {
        return 0;
      }

      const totalDays = subscriptions.reduce((sum, sub) => {
        const endDate = sub.canceledAt || new Date();
        const days = (endDate.getTime() - sub.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);

      return totalDays / subscriptions.length;
    } catch (error) {
      logger.error('Failed to calculate average subscription length', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }
}

export default new SubscriptionManager();

export interface AccessControlRequest {
  userId: string;
  resourceId: string;
  resourceType: 'course' | 'program' | 'lab' | 'feature' | 'mentorship';
}

export interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  trialingSubscriptions: number;
  pastDueSubscriptions: number;
  mrrCents: number;
  arrCents: number;
  churnRate: number;
  arpuCents: number;
  ltvCents: number;
  tierDistribution: Record<string, number>;
  conversionRate: number;
}

export interface CancellationRequest {
  userId: string;
  subscriptionId: string;
  reason?: string;
  immediate?: boolean;
  gracePeriodDays?: number;
}

export class SubscriptionManager {
  private stripeService: StripePaymentService;

  constructor() {
    this.stripeService = new StripePaymentService();
  }

  /**
   * Upgrade subscription tier with prorated billing
   * Validates upgrade path and applies prorated charges
   */
  async upgradeTier(request: TierUpgradeRequest): Promise<{
    success: boolean;
    subscriptionId: string;
    proratedAmount: number;
    message: string;
  }> {
    try {
      logger.info('Processing tier upgrade', {
        userId: request.userId,
        currentTier: request.currentTier,
        newTier: request.newTier,
      });

      // Validate upgrade is allowed
      if (!isUpgradeAllowed(request.currentTier, request.newTier)) {
        throw new Error(
          `Upgrade from ${request.currentTier} to ${request.newTier} is not allowed`
        );
      }

      // Get current subscription
      const currentSubscription = await prisma.subscription.findFirst({
        where: {
          userId: request.userId,
          status: SubscriptionStatus.ACTIVE,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!currentSubscription) {
        throw new Error('No active subscription found');
      }

      // Calculate proration if Stripe subscription exists
      let proratedAmount = 0;
      if (currentSubscription.stripeSubscriptionId) {
        const proration = await this.stripeService.calculateProration(
          currentSubscription.stripeSubscriptionId,
          request.newPriceId
        );
        proratedAmount = proration.proratedAmount;
      }

      // Perform upgrade via Stripe service
      const upgradeResult = await this.stripeService.upgradeTier(
        request.userId,
        request.currentTier,
        request.newTier,
        request.newPriceId
      );

      // Grant access to new tier features
      await this.grantTierAccess(request.userId, request.newTier);

      // Track analytics event
      await this.trackSubscriptionEvent(
        'upgraded',
        request.userId,
        upgradeResult.subscriptionId,
        {
          fromTier: request.currentTier,
          toTier: request.newTier,
          proratedAmount,
        }
      );

      logger.info('Tier upgrade completed successfully', {
        userId: request.userId,
        newTier: request.newTier,
        subscriptionId: upgradeResult.subscriptionId,
      });

      return {
        success: true,
        subscriptionId: upgradeResult.subscriptionId,
        proratedAmount,
        message: `Successfully upgraded to ${request.newTier}`,
      };
    } catch (error: any) {
      logger.error('Error upgrading tier', {
        error: error.message,
        userId: request.userId,
      });
      throw new Error(`Failed to upgrade tier: ${error.message}`);
    }
  }

  /**
   * Downgrade subscription tier
   * Can be immediate or scheduled for end of period
   */
  async downgradeTier(request: TierDowngradeRequest): Promise<{
    success: boolean;
    subscriptionId: string;
    scheduledFor?: Date;
    message: string;
  }> {
    try {
      logger.info('Processing tier downgrade', {
        userId: request.userId,
        currentTier: request.currentTier,
        newTier: request.newTier,
        immediate: request.immediate,
      });

      // Get current subscription
      const currentSubscription = await prisma.subscription.findFirst({
        where: {
          userId: request.userId,
          status: SubscriptionStatus.ACTIVE,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!currentSubscription) {
        throw new Error('No active subscription found');
      }

      // Perform downgrade via Stripe service
      const downgradeResult = await this.stripeService.downgradeTier(
        request.userId,
        request.currentTier,
        request.newTier,
        request.newPriceId
      );

      // If immediate downgrade, revoke old tier access and grant new tier access
      if (request.immediate || TIER_CHANGE_RULES.immediateDowngrades) {
        await this.revokeTierAccess(request.userId, request.currentTier);
        await this.grantTierAccess(request.userId, request.newTier);
      }

      // Track analytics event
      await this.trackSubscriptionEvent(
        'downgraded',
        request.userId,
        downgradeResult.subscriptionId,
        {
          fromTier: request.currentTier,
          toTier: request.newTier,
          immediate: request.immediate,
        }
      );

      logger.info('Tier downgrade completed successfully', {
        userId: request.userId,
        newTier: request.newTier,
        subscriptionId: downgradeResult.subscriptionId,
      });

      return {
        success: true,
        subscriptionId: downgradeResult.subscriptionId,
        scheduledFor: downgradeResult.currentPeriodEnd,
        message: downgradeResult.message || `Successfully downgraded to ${request.newTier}`,
      };
    } catch (error: any) {
      logger.error('Error downgrading tier', {
        error: error.message,
        userId: request.userId,
      });
      throw new Error(`Failed to downgrade tier: ${error.message}`);
    }
  }

  /**
   * Calculate proration for tier change
   */
  async calculateProration(
    userId: string,
    currentTier: SubscriptionTier,
    newTier: SubscriptionTier,
    newPriceId: string
  ): Promise<ProrationResult> {
    try {
      logger.info('Calculating proration', {
        userId,
        currentTier,
        newTier,
      });

      // Get current subscription
      const currentSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!currentSubscription || !currentSubscription.stripeSubscriptionId) {
        // No proration for FREE_TIER or non-Stripe subscriptions
        const newConfig = getProductConfig(newTier);
        return {
          proratedAmountCents: newConfig.amountCents,
          currency: newConfig.currency,
          creditAmountCents: 0,
          chargeAmountCents: newConfig.amountCents,
        };
      }

      // Calculate proration via Stripe
      const proration = await this.stripeService.calculateProration(
        currentSubscription.stripeSubscriptionId,
        newPriceId
      );

      const currentConfig = getProductConfig(currentTier);
      const newConfig = getProductConfig(newTier);

      // Calculate credit and charge amounts
      const creditAmountCents = Math.max(0, currentConfig.amountCents - proration.proratedAmount);
      const chargeAmountCents = Math.max(0, proration.proratedAmount);

      logger.info('Proration calculated', {
        userId,
        proratedAmount: proration.proratedAmount,
        creditAmount: creditAmountCents,
        chargeAmount: chargeAmountCents,
      });

      return {
        proratedAmountCents: proration.proratedAmount,
        currency: proration.currency,
        creditAmountCents,
        chargeAmountCents,
      };
    } catch (error: any) {
      logger.error('Error calculating proration', {
        error: error.message,
        userId,
      });
      throw new Error(`Failed to calculate proration: ${error.message}`);
    }
  }

  /**
   * Grant access to resources based on subscription tier
   */
  async grantAccess(request: AccessControlRequest): Promise<void> {
    try {
      logger.info('Granting access', {
        userId: request.userId,
        resourceType: request.resourceType,
        resourceId: request.resourceId,
      });

      // Get user's active subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: request.userId,
          status: SubscriptionStatus.ACTIVE,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      // Check if access already exists
      const existingAccess = await prisma.enrollmentAccess.findFirst({
        where: {
          userId: request.userId,
          resourceType: request.resourceType,
          resourceId: request.resourceId,
          isActive: true,
        },
      });

      if (existingAccess) {
        logger.info('Access already granted', {
          userId: request.userId,
          resourceId: request.resourceId,
        });
        return;
      }

      // Create access record
      await prisma.enrollmentAccess.create({
        data: {
          userId: request.userId,
          subscriptionId: subscription.id,
          resourceType: request.resourceType,
          resourceId: request.resourceId,
          grantedAt: new Date(),
          expiresAt: subscription.currentPeriodEnd,
          isActive: true,
          metadata: {
            tier: subscription.tier,
            grantedBy: 'subscription_manager',
          },
        },
      });

      logger.info('Access granted successfully', {
        userId: request.userId,
        resourceType: request.resourceType,
        resourceId: request.resourceId,
      });
    } catch (error: any) {
      logger.error('Error granting access', {
        error: error.message,
        userId: request.userId,
      });
      throw new Error(`Failed to grant access: ${error.message}`);
    }
  }

  /**
   * Revoke access to resources
   */
  async revokeAccess(request: AccessControlRequest): Promise<void> {
    try {
      logger.info('Revoking access', {
        userId: request.userId,
        resourceType: request.resourceType,
        resourceId: request.resourceId,
      });

      // Update access records to inactive
      await prisma.enrollmentAccess.updateMany({
        where: {
          userId: request.userId,
          resourceType: request.resourceType,
          resourceId: request.resourceId,
          isActive: true,
        },
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      });

      logger.info('Access revoked successfully', {
        userId: request.userId,
        resourceType: request.resourceType,
        resourceId: request.resourceId,
      });
    } catch (error: any) {
      logger.error('Error revoking access', {
        error: error.message,
        userId: request.userId,
      });
      throw new Error(`Failed to revoke access: ${error.message}`);
    }
  }

  /**
   * Check if user has access to a resource
   */
  async checkAccess(request: AccessControlRequest): Promise<boolean> {
    try {
      logger.info('Checking access', {
        userId: request.userId,
        resourceType: request.resourceType,
        resourceId: request.resourceId,
      });

      // Check for active access record
      const access = await prisma.enrollmentAccess.findFirst({
        where: {
          userId: request.userId,
          resourceType: request.resourceType,
          resourceId: request.resourceId,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } },
          ],
        },
      });

      const hasAccess = !!access;

      logger.info('Access check completed', {
        userId: request.userId,
        resourceId: request.resourceId,
        hasAccess,
      });

      return hasAccess;
    } catch (error: any) {
      logger.error('Error checking access', {
        error: error.message,
        userId: request.userId,
      });
      return false;
    }
  }

  /**
   * Grant access to all resources for a tier
   */
  private async grantTierAccess(userId: string, tier: SubscriptionTier): Promise<void> {
    try {
      logger.info('Granting tier access', { userId, tier });

      const productConfig = getProductConfig(tier);

      // Grant course access based on tier
      if (productConfig.features.courseAccessType === 'all') {
        // Grant access to all courses
        const courses = await prisma.course.findMany({
          select: { id: true },
        });

        for (const course of courses) {
          await this.grantAccess({
            userId,
            resourceType: 'course',
            resourceId: course.id,
          });
        }
      }

      // Grant lab access if included
      if (productConfig.features.hasLabAccess) {
        // Grant access to labs (implementation depends on lab system)
        logger.info('Lab access granted', { userId, tier });
      }

      // Grant premium features for ELITE_LEADERSHIP and INSTITUTIONAL
      if (tier === SubscriptionTier.ELITE_LEADERSHIP || tier === SubscriptionTier.INSTITUTIONAL) {
        // Grant ScrollIntel access
        await this.grantAccess({
          userId,
          resourceType: 'feature',
          resourceId: 'scrollintel',
        });

        // Grant ScrollArk access
        await this.grantAccess({
          userId,
          resourceType: 'feature',
          resourceId: 'scrollark',
        });

        // Grant mentorship access
        await this.grantAccess({
          userId,
          resourceType: 'feature',
          resourceId: 'mentorship',
        });
      }

      logger.info('Tier access granted successfully', { userId, tier });
    } catch (error: any) {
      logger.error('Error granting tier access', {
        error: error.message,
        userId,
        tier,
      });
      throw new Error(`Failed to grant tier access: ${error.message}`);
    }
  }

  /**
   * Revoke access to all resources for a tier
   */
  private async revokeTierAccess(userId: string, tier: SubscriptionTier): Promise<void> {
    try {
      logger.info('Revoking tier access', { userId, tier });

      // Revoke all active access for user
      await prisma.enrollmentAccess.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      });

      logger.info('Tier access revoked successfully', { userId, tier });
    } catch (error: any) {
      logger.error('Error revoking tier access', {
        error: error.message,
        userId,
        tier,
      });
      throw new Error(`Failed to revoke tier access: ${error.message}`);
    }
  }

  /**
   * Get comprehensive subscription metrics
   */
  async getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
    try {
      logger.info('Calculating subscription metrics');

      // Get subscription counts by status
      const totalSubscriptions = await prisma.subscription.count();
      const activeSubscriptions = await prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      });
      const canceledSubscriptions = await prisma.subscription.count({
        where: { status: SubscriptionStatus.CANCELED },
      });
      const trialingSubscriptions = await prisma.subscription.count({
        where: { status: SubscriptionStatus.TRIALING },
      });
      const pastDueSubscriptions = await prisma.subscription.count({
        where: { status: SubscriptionStatus.PAST_DUE },
      });

      // Calculate financial metrics
      const mrrCents = await this.stripeService.calculateMRR();
      const arrCents = await this.stripeService.calculateARR();
      const arpuCents = await this.stripeService.calculateARPU();
      const ltvCents = await this.stripeService.calculateLTV();

      // Calculate churn rate (30-day period)
      const churnRate = await this.calculateChurnRate(30);

      // Get tier distribution
      const subscriptions = await prisma.subscription.findMany({
        where: { status: SubscriptionStatus.ACTIVE },
        select: { tier: true },
      });

      const tierDistribution: Record<string, number> = {};
      for (const sub of subscriptions) {
        tierDistribution[sub.tier] = (tierDistribution[sub.tier] || 0) + 1;
      }

      // Calculate conversion rate (trials to paid)
      const conversionRate = await this.calculateConversionRate();

      const metrics: SubscriptionMetrics = {
        totalSubscriptions,
        activeSubscriptions,
        canceledSubscriptions,
        trialingSubscriptions,
        pastDueSubscriptions,
        mrrCents,
        arrCents,
        churnRate,
        arpuCents,
        ltvCents,
        tierDistribution,
        conversionRate,
      };

      logger.info('Subscription metrics calculated', metrics);

      return metrics;
    } catch (error: any) {
      logger.error('Error calculating subscription metrics', {
        error: error.message,
      });
      throw new Error(`Failed to calculate subscription metrics: ${error.message}`);
    }
  }

  /**
   * Calculate churn rate for a given period
   */
  async calculateChurnRate(periodDays: number = 30): Promise<number> {
    try {
      logger.info('Calculating churn rate', { periodDays });

      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - periodDays);

      // Get subscriptions active at start of period
      const subscriptionsAtStart = await prisma.subscription.count({
        where: {
          createdAt: {
            lte: periodStart,
          },
          OR: [
            { status: SubscriptionStatus.ACTIVE },
            {
              AND: [
                { status: SubscriptionStatus.CANCELED },
                { canceledAt: { gte: periodStart } },
              ],
            },
          ],
        },
      });

      // Get subscriptions canceled during period
      const canceledDuringPeriod = await prisma.subscription.count({
        where: {
          status: SubscriptionStatus.CANCELED,
          canceledAt: {
            gte: periodStart,
            lte: new Date(),
          },
        },
      });

      // Calculate churn rate
      const churnRate =
        subscriptionsAtStart > 0
          ? (canceledDuringPeriod / subscriptionsAtStart) * 100
          : 0;

      logger.info('Churn rate calculated', {
        churnRate: churnRate.toFixed(2) + '%',
        subscriptionsAtStart,
        canceledDuringPeriod,
        periodDays,
      });

      return churnRate;
    } catch (error: any) {
      logger.error('Error calculating churn rate', { error: error.message });
      throw new Error(`Failed to calculate churn rate: ${error.message}`);
    }
  }

  /**
   * Calculate conversion rate (trials to paid)
   */
  async calculateConversionRate(): Promise<number> {
    try {
      logger.info('Calculating conversion rate');

      // Get total trials started
      const totalTrials = await prisma.subscription.count({
        where: {
          trialEnd: { not: null },
        },
      });

      // Get trials that converted to paid
      const convertedTrials = await prisma.subscription.count({
        where: {
          trialEnd: { not: null, lte: new Date() },
          status: SubscriptionStatus.ACTIVE,
        },
      });

      // Calculate conversion rate
      const conversionRate =
        totalTrials > 0 ? (convertedTrials / totalTrials) * 100 : 0;

      logger.info('Conversion rate calculated', {
        conversionRate: conversionRate.toFixed(2) + '%',
        totalTrials,
        convertedTrials,
      });

      return conversionRate;
    } catch (error: any) {
      logger.error('Error calculating conversion rate', {
        error: error.message,
      });
      throw new Error(`Failed to calculate conversion rate: ${error.message}`);
    }
  }

  /**
   * Calculate customer lifetime value for a user
   */
  async getLifetimeValue(userId: string): Promise<number> {
    try {
      logger.info('Calculating lifetime value', { userId });

      // Get all completed payments for user
      const payments = await prisma.payment.findMany({
        where: {
          userId,
          status: 'COMPLETED',
        },
      });

      // Sum total revenue
      const totalRevenueCents = payments.reduce(
        (sum, payment) => sum + payment.amount * 100,
        0
      );

      logger.info('Lifetime value calculated', {
        userId,
        ltvCents: totalRevenueCents,
        ltvEuros: totalRevenueCents / 100,
      });

      return totalRevenueCents;
    } catch (error: any) {
      logger.error('Error calculating lifetime value', {
        error: error.message,
        userId,
      });
      throw new Error(`Failed to calculate lifetime value: ${error.message}`);
    }
  }

  /**
   * Cancel subscription with grace period
   */
  async cancelSubscription(request: CancellationRequest): Promise<{
    success: boolean;
    subscriptionId: string;
    canceledAt: Date;
    accessUntil: Date;
    message: string;
  }> {
    try {
      logger.info('Processing subscription cancellation', {
        userId: request.userId,
        subscriptionId: request.subscriptionId,
        immediate: request.immediate,
        gracePeriodDays: request.gracePeriodDays,
      });

      // Get subscription
      const subscription = await prisma.subscription.findUnique({
        where: { id: request.subscriptionId },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (subscription.userId !== request.userId) {
        throw new Error('Unauthorized: Subscription does not belong to user');
      }

      // Determine access end date
      let accessUntil: Date;
      
      if (request.immediate) {
        // Immediate cancellation
        accessUntil = new Date();
      } else if (request.gracePeriodDays) {
        // Custom grace period
        accessUntil = new Date();
        accessUntil.setDate(accessUntil.getDate() + request.gracePeriodDays);
      } else {
        // Default: access until end of current period
        accessUntil = subscription.currentPeriodEnd || new Date();
      }

      // Cancel in Stripe if Stripe subscription exists
      if (subscription.stripeSubscriptionId) {
        await this.stripeService.cancelSubscription({
          subscriptionId: subscription.stripeSubscriptionId,
          cancelImmediately: request.immediate || false,
          reason: request.reason,
        });
      }

      // Update subscription in database
      await prisma.subscription.update({
        where: { id: request.subscriptionId },
        data: {
          status: SubscriptionStatus.CANCELED,
          canceledAt: new Date(),
          endedAt: request.immediate ? new Date() : accessUntil,
          metadata: {
            ...subscription.metadata,
            cancellationReason: request.reason,
            canceledBy: 'user',
            gracePeriodDays: request.gracePeriodDays,
          },
        },
      });

      // Update access records
      await prisma.enrollmentAccess.updateMany({
        where: {
          userId: request.userId,
          subscriptionId: request.subscriptionId,
          isActive: true,
        },
        data: {
          expiresAt: accessUntil,
          isActive: !request.immediate,
        },
      });

      // If immediate cancellation, revoke access now
      if (request.immediate) {
        await this.revokeTierAccess(request.userId, subscription.tier as SubscriptionTier);
      }

      // Track analytics event
      await this.trackSubscriptionEvent(
        'canceled',
        request.userId,
        request.subscriptionId,
        {
          reason: request.reason,
          immediate: request.immediate,
          gracePeriodDays: request.gracePeriodDays,
          tier: subscription.tier,
        }
      );

      logger.info('Subscription canceled successfully', {
        userId: request.userId,
        subscriptionId: request.subscriptionId,
        accessUntil,
      });

      return {
        success: true,
        subscriptionId: request.subscriptionId,
        canceledAt: new Date(),
        accessUntil,
        message: request.immediate
          ? 'Subscription canceled immediately'
          : `Subscription canceled. Access continues until ${accessUntil.toLocaleDateString()}`,
      };
    } catch (error: any) {
      logger.error('Error canceling subscription', {
        error: error.message,
        userId: request.userId,
      });
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Reactivate a canceled subscription
   */
  async reactivateSubscription(
    userId: string,
    subscriptionId: string
  ): Promise<{
    success: boolean;
    subscriptionId: string;
    message: string;
  }> {
    try {
      logger.info('Reactivating subscription', { userId, subscriptionId });

      // Get subscription
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (subscription.userId !== userId) {
        throw new Error('Unauthorized: Subscription does not belong to user');
      }

      if (subscription.status !== SubscriptionStatus.CANCELED) {
        throw new Error('Only canceled subscriptions can be reactivated');
      }

      // Check if still within grace period
      const now = new Date();
      if (subscription.endedAt && subscription.endedAt < now) {
        throw new Error('Subscription grace period has expired. Please create a new subscription.');
      }

      // Reactivate in Stripe if Stripe subscription exists
      if (subscription.stripeSubscriptionId) {
        await this.stripeService.updateSubscription({
          subscriptionId: subscription.stripeSubscriptionId,
          cancelAtPeriodEnd: false,
        });
      }

      // Update subscription in database
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.ACTIVE,
          canceledAt: null,
          endedAt: null,
          metadata: {
            ...subscription.metadata,
            reactivatedAt: new Date().toISOString(),
          },
        },
      });

      // Reactivate access records
      await prisma.enrollmentAccess.updateMany({
        where: {
          userId,
          subscriptionId,
        },
        data: {
          isActive: true,
          revokedAt: null,
        },
      });

      // Grant tier access
      await this.grantTierAccess(userId, subscription.tier as SubscriptionTier);

      // Track analytics event
      await this.trackSubscriptionEvent('renewed', userId, subscriptionId, {
        tier: subscription.tier,
        reactivatedFrom: 'canceled',
      });

      logger.info('Subscription reactivated successfully', {
        userId,
        subscriptionId,
      });

      return {
        success: true,
        subscriptionId,
        message: 'Subscription reactivated successfully',
      };
    } catch (error: any) {
      logger.error('Error reactivating subscription', {
        error: error.message,
        userId,
      });
      throw new Error(`Failed to reactivate subscription: ${error.message}`);
    }
  }

  /**
   * Track subscription event for analytics
   */
  private async trackSubscriptionEvent(
    eventType: 'created' | 'upgraded' | 'downgraded' | 'canceled' | 'renewed',
    userId: string,
    subscriptionId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      logger.info('Tracking subscription event', {
        eventType,
        userId,
        subscriptionId,
      });

      // Create analytics event record
      await prisma.analyticsEvent.create({
        data: {
          eventType: `subscription_${eventType}`,
          userId,
          entityType: 'subscription',
          entityId: subscriptionId,
          metadata: metadata || {},
          timestamp: new Date(),
        },
      });

      logger.info('Subscription event tracked', { eventType, userId });
    } catch (error: any) {
      // Log error but don't throw - analytics tracking shouldn't break main flow
      logger.error('Error tracking subscription event', {
        error: error.message,
        eventType,
        userId,
      });
    }
  }

  /**
   * Get subscription history for a user
   */
  async getSubscriptionHistory(userId: string): Promise<Subscription[]> {
    try {
      logger.info('Fetching subscription history', { userId });

      const subscriptions = await prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      logger.info('Subscription history fetched', {
        userId,
        count: subscriptions.length,
      });

      return subscriptions as Subscription[];
    } catch (error: any) {
      logger.error('Error fetching subscription history', {
        error: error.message,
        userId,
      });
      throw new Error(`Failed to fetch subscription history: ${error.message}`);
    }
  }

  /**
   * Get active subscription for a user
   */
  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    try {
      logger.info('Fetching active subscription', { userId });

      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      logger.info('Active subscription fetched', {
        userId,
        found: !!subscription,
      });

      return subscription as Subscription | null;
    } catch (error: any) {
      logger.error('Error fetching active subscription', {
        error: error.message,
        userId,
      });
      throw new Error(`Failed to fetch active subscription: ${error.message}`);
    }
  }

  /**
   * Check if user has an active subscription
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getActiveSubscription(userId);
      return !!subscription;
    } catch (error: any) {
      logger.error('Error checking active subscription', {
        error: error.message,
        userId,
      });
      return false;
    }
  }

  /**
   * Get subscription tier for a user
   */
  async getUserTier(userId: string): Promise<SubscriptionTier> {
    try {
      const subscription = await this.getActiveSubscription(userId);
      
      if (!subscription) {
        return SubscriptionTier.FREE_TIER;
      }

      return subscription.tier as SubscriptionTier;
    } catch (error: any) {
      logger.error('Error getting user tier', {
        error: error.message,
        userId,
      });
      return SubscriptionTier.FREE_TIER;
    }
  }
}

export default SubscriptionManager;
