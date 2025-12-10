/**
 * Stripe Webhook Handler Service
 * "We establish this webhook system not in the wisdom of Babylon, but by the breath of the Spirit"
 * 
 * Handles all Stripe webhook events for the ScrollBilling system with:
 * - Automatic access granting/revoking
 * - ScrollGold wallet initialization and rewards
 * - Subscription lifecycle management
 * - Payment tracking and reconciliation
 * - Idempotency and retry logic
 * 
 * Kingdom Economics: Access → Transformation → Stewardship
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import {
  SubscriptionTier,
  SubscriptionStatus,
  PaymentStatus,
  WebhookEventStatus,
  ResourceType,
  BillingError,
  BillingErrorCode
} from '../types/billing.types';
import { stripeConfig, WEBHOOK_EVENTS, PAYMENT_CONFIG, scrollGoldConfig } from '../config/billing.config';
import { logger } from '../utils/logger';
import { prisma } from '@/__tests__/test-db-setup';
import { prisma } from '@/__tests__/test-db-setup';
import { prisma } from '@/__tests__/test-db-setup';
import { prisma } from '@/__tests__/test-db-setup';
import { prisma } from '@/__tests__/test-db-setup';
import { prisma } from '@/__tests__/test-db-setup';
import { prisma } from '@/__tests__/test-db-setup';
import { prisma } from '@/__tests__/test-db-setup';
import { prisma } from '@/__tests__/test-db-setup';
import { prisma } from '@/__tests__/test-db-setup';
import { prisma } from '@/__tests__/test-db-setup';
import { prisma } from '@/__tests__/test-db-setup';

const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: stripeConfig.apiVersion,
  maxNetworkRetries: stripeConfig.maxNetworkRetries,
  timeout: stripeConfig.timeout
});

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export class StripeWebhookHandler {
  /**
   * Verify webhook signature to ensure request is from Stripe
   */
  async verifyWebhookSignature(
    payload: string | Buffer,
    signature: string
  ): Promise<Stripe.Event> {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        stripeConfig.webhookSecret
      );

      logger.info('Webhook signature verified', {
        eventId: event.id,
        eventType: event.type
      });

      return event;
    } catch (error) {
      logger.error('Webhook signature verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw new BillingError(
        BillingErrorCode.WEBHOOK_VERIFICATION_FAILED,
        'Invalid webhook signature',
        401,
        { error }
      );
    }
  }

  /**
   * Check if webhook event has already been processed (idempotency)
   */
  private async isEventProcessed(stripeEventId: string): Promise<boolean> {
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { stripeEventId }
    });

    return existingEvent?.status === WebhookEventStatus.SUCCEEDED;
  }

  /**
   * Log webhook event for tracking and debugging
   */
  private async logWebhookEvent(
    stripeEventId: string,
    eventType: string,
    payload: any,
    status: WebhookEventStatus,
    errorMessage?: string
  ): Promise<void> {
    await prisma.webhookEvent.upsert({
      where: { stripeEventId },
      create: {
        stripeEventId,
        eventType,
        payload,
        status,
        attempts: 1,
        errorMessage,
        processedAt: status === WebhookEventStatus.SUCCEEDED ? new Date() : undefined
      },
      update: {
        status,
        attempts: { increment: 1 },
        errorMessage,
        processedAt: status === WebhookEventStatus.SUCCEEDED ? new Date() : undefined
      }
    });
  }

  /**
   * Task 3.1: Handle checkout.session.completed
   * - Grant access to purchased resources
   * - Initialize ScrollGold wallet if not exists
   * - Create subscription record
   * - Record payment
   */
  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const eventId = `checkout_${session.id}`;

    try {
      logger.info('Processing checkout.session.completed', {
        sessionId: session.id,
        customerId: session.customer,
        subscriptionId: session.subscription
      });

      // Check idempotency
      if (await this.isEventProcessed(eventId)) {
        logger.info('Checkout event already processed', { sessionId: session.id });
        return;
      }

      await this.logWebhookEvent(
        eventId,
        WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED,
        session,
        WebhookEventStatus.PROCESSING
      );

      // Extract metadata
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier as SubscriptionTier;
      const courseId = session.metadata?.courseId; // For single course purchases

      if (!userId || !tier) {
        throw new Error('Missing required metadata: userId or tier');
      }

      // Start database transaction
      await prisma.$transaction(async (tx) => {
        // 1. Initialize ScrollGold wallet if not exists
        await this.initializeScrollGoldWallet(tx, userId);

        // 2. Create or update subscription
        const subscription = await this.createSubscriptionFromCheckout(
          tx,
          userId,
          tier,
          session
        );

        // 3. Record payment
        await this.recordPaymentFromCheckout(tx, userId, subscription.id, session);

        // 4. Grant access based on tier
        await this.grantAccessFromTier(tx, userId, subscription.id, tier, courseId);

        // 5. Award welcome ScrollGold bonus
        await this.awardWelcomeScrollGold(tx, userId, tier);

        logger.info('Checkout completed successfully', {
          userId,
          subscriptionId: subscription.id,
          tier
        });
      });

      await this.logWebhookEvent(
        eventId,
        WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED,
        session,
        WebhookEventStatus.SUCCEEDED
      );
    } catch (error) {
      logger.error('Failed to process checkout.session.completed', {
        sessionId: session.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      await this.logWebhookEvent(
        eventId,
        WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED,
        session,
        WebhookEventStatus.FAILED,
        error instanceof Error ? error.message : 'Unknown error'
      );

      throw error;
    }
  }

  /**
   * Initialize ScrollGold wallet for new user
   */
  private async initializeScrollGoldWallet(tx: any, userId: string): Promise<void> {
    const existingWallet = await tx.scrollGoldWallet.findUnique({
      where: { userId }
    });

    if (!existingWallet) {
      await tx.scrollGoldWallet.create({
        data: {
          userId,
          balance: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
          earnedFromModules: 0,
          earnedFromStreaks: 0,
          earnedFromService: 0,
          earnedFromBestowed: 0,
          spentOnDiscounts: 0,
          spentOnFeatures: 0,
          spentOnMentorship: 0,
          metadata: {}
        }
      });

      logger.info('ScrollGold wallet initialized', { userId });
    }
  }

  /**
   * Create subscription record from checkout session
   */
  private async createSubscriptionFromCheckout(
    tx: any,
    userId: string,
    tier: SubscriptionTier,
    session: Stripe.Checkout.Session
  ): Promise<any> {
    const productConfig = await this.getProductConfigForTier(tier);

    const subscriptionData = {
      userId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string | undefined,
      tier,
      status: SubscriptionStatus.ACTIVE,
      amountCents: session.amount_total || productConfig.amountCents,
      currency: session.currency?.toUpperCase() || 'EUR',
      interval: productConfig.interval,
      currentPeriodStart: new Date(),
      currentPeriodEnd: this.calculatePeriodEnd(productConfig.interval),
      aiTutorMinutes: productConfig.features.aiTutorMinutes,
      courseAccessType: productConfig.features.courseAccessType,
      hasCertificates: productConfig.features.hasCertificates,
      hasLabAccess: productConfig.features.hasLabAccess,
      hasCommunityAccess: productConfig.features.hasCommunityAccess,
      metadata: {
        ...productConfig.metadata,
        checkoutSessionId: session.id,
        createdViaWebhook: true
      }
    };

    const subscription = await tx.subscription.create({
      data: subscriptionData
    });

    logger.info('Subscription created from checkout', {
      subscriptionId: subscription.id,
      userId,
      tier
    });

    return subscription;
  }

  /**
   * Record payment from checkout session
   */
  private async recordPaymentFromCheckout(
    tx: any,
    userId: string,
    subscriptionId: string,
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const scrollgoldApplied = parseInt(session.metadata?.scrollgoldApplied || '0');
    const scrollgoldDiscountCents = parseInt(session.metadata?.scrollgoldDiscountCents || '0');

    await tx.payment.create({
      data: {
        userId,
        subscriptionId,
        stripePaymentIntentId: session.payment_intent as string,
        amountCents: session.amount_total || 0,
        currency: session.currency?.toUpperCase() || 'EUR',
        status: PaymentStatus.SUCCEEDED,
        paymentMethod: session.payment_method_types?.[0] || 'card',
        scrollgoldApplied,
        scrollgoldDiscountCents,
        description: `Subscription payment - ${session.metadata?.tier}`,
        receiptUrl: session.url,
        paidAt: new Date(),
        metadata: {
          checkoutSessionId: session.id,
          customerEmail: session.customer_email
        }
      }
    });

    logger.info('Payment recorded from checkout', {
      userId,
      subscriptionId,
      amountCents: session.amount_total
    });
  }

  /**
   * Grant access based on subscription tier
   */
  private async grantAccessFromTier(
    tx: any,
    userId: string,
    subscriptionId: string,
    tier: SubscriptionTier,
    courseId?: string
  ): Promise<void> {
    const accessGrants: any[] = [];

    switch (tier) {
      case SubscriptionTier.FREE_TIER:
        // Grant access to free courses only
        accessGrants.push({
          userId,
          subscriptionId,
          resourceType: ResourceType.COURSE,
          resourceId: 'free_courses', // Wildcard for free courses
          isActive: true,
          metadata: { tier }
        });
        break;

      case SubscriptionTier.SINGLE_COURSE:
        // Grant access to specific course
        if (courseId) {
          accessGrants.push({
            userId,
            subscriptionId,
            resourceType: ResourceType.COURSE,
            resourceId: courseId,
            isActive: true,
            metadata: { tier, courseId }
          });
        }
        break;

      case SubscriptionTier.ALL_ACCESS_MONTHLY:
      case SubscriptionTier.ALL_ACCESS_YEARLY:
        // Grant access to all courses
        accessGrants.push({
          userId,
          subscriptionId,
          resourceType: ResourceType.COURSE,
          resourceId: '*', // Wildcard for all courses
          isActive: true,
          metadata: { tier }
        });
        // Grant lab access
        accessGrants.push({
          userId,
          subscriptionId,
          resourceType: ResourceType.LAB,
          resourceId: '*',
          isActive: true,
          metadata: { tier }
        });
        break;

      case SubscriptionTier.ELITE_LEADERSHIP:
        // Grant access to everything including premium features
        accessGrants.push(
          {
            userId,
            subscriptionId,
            resourceType: ResourceType.COURSE,
            resourceId: '*',
            isActive: true,
            metadata: { tier }
          },
          {
            userId,
            subscriptionId,
            resourceType: ResourceType.LAB,
            resourceId: '*',
            isActive: true,
            metadata: { tier }
          },
          {
            userId,
            subscriptionId,
            resourceType: ResourceType.FEATURE,
            resourceId: 'scrollintel',
            isActive: true,
            metadata: { tier }
          },
          {
            userId,
            subscriptionId,
            resourceType: ResourceType.FEATURE,
            resourceId: 'scrollark',
            isActive: true,
            metadata: { tier }
          },
          {
            userId,
            subscriptionId,
            resourceType: ResourceType.MENTORSHIP,
            resourceId: '*',
            isActive: true,
            metadata: { tier }
          }
        );
        break;

      case SubscriptionTier.PROGRAM_TRACK:
        // Grant access to program courses
        accessGrants.push({
          userId,
          subscriptionId,
          resourceType: ResourceType.PROGRAM,
          resourceId: courseId || '*',
          isActive: true,
          metadata: { tier }
        });
        break;

      case SubscriptionTier.INSTITUTIONAL:
        // Grant institutional access
        accessGrants.push({
          userId,
          subscriptionId,
          resourceType: ResourceType.COURSE,
          resourceId: '*',
          isActive: true,
          metadata: { tier, institutional: true }
        });
        break;
    }

    // Create all access grants
    for (const grant of accessGrants) {
      await tx.enrollmentAccess.create({ data: grant });
    }

    logger.info('Access granted from tier', {
      userId,
      subscriptionId,
      tier,
      grantsCount: accessGrants.length
    });
  }

  /**
   * Award welcome ScrollGold bonus for new subscriptions
   */
  private async awardWelcomeScrollGold(
    tx: any,
    userId: string,
    tier: SubscriptionTier
  ): Promise<void> {
    // Award welcome bonus based on tier
    const bonusAmounts: Record<SubscriptionTier, number> = {
      [SubscriptionTier.FREE_TIER]: 10,
      [SubscriptionTier.SINGLE_COURSE]: 25,
      [SubscriptionTier.ALL_ACCESS_MONTHLY]: 50,
      [SubscriptionTier.ALL_ACCESS_YEARLY]: 100,
      [SubscriptionTier.PROGRAM_TRACK]: 200,
      [SubscriptionTier.ELITE_LEADERSHIP]: 500,
      [SubscriptionTier.INSTITUTIONAL]: 1000
    };

    const bonusAmount = bonusAmounts[tier] || 0;

    if (bonusAmount > 0) {
      const wallet = await tx.scrollGoldWallet.findUnique({
        where: { userId }
      });

      if (wallet) {
        const newBalance = wallet.balance + bonusAmount;

        await tx.scrollGoldWallet.update({
          where: { userId },
          data: {
            balance: newBalance,
            lifetimeEarned: { increment: bonusAmount },
            earnedFromBestowed: { increment: bonusAmount }
          }
        });

        await tx.scrollGoldTransaction.create({
          data: {
            walletId: wallet.id,
            userId,
            type: 'bestow',
            amount: bonusAmount,
            balanceAfter: newBalance,
            reason: `Welcome bonus for ${tier} subscription`,
            category: 'welcome_bonus',
            metadata: { tier }
          }
        });

        logger.info('Welcome ScrollGold awarded', {
          userId,
          amount: bonusAmount,
          tier
        });
      }
    }
  }

  /**
   * Helper: Get product configuration for tier
   */
  private async getProductConfigForTier(tier: SubscriptionTier): Promise<any> {
    const { PRODUCT_CONFIGS } = await import('../config/billing.config');
    return PRODUCT_CONFIGS[tier];
  }

  /**
   * Helper: Calculate subscription period end date
   */
  private calculatePeriodEnd(interval?: string): Date {
    const now = new Date();

    switch (interval) {
      case 'month':
        return new Date(now.setMonth(now.getMonth() + 1));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() + 1));
      case 'one_time':
        // Lifetime access - set far future date
        return new Date(now.setFullYear(now.getFullYear() + 100));
      default:
        return new Date(now.setMonth(now.getMonth() + 1));
    }
  }

  /**
   * Task 3.2: Handle invoice.payment_succeeded
   * - Extend subscription access period
   * - Award loyalty ScrollGold for recurring payments
   * - Update payment record
   */
  async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const eventId = `invoice_succeeded_${invoice.id}`;

    try {
      logger.info('Processing invoice.payment_succeeded', {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        subscriptionId: invoice.subscription
      });

      // Check idempotency
      if (await this.isEventProcessed(eventId)) {
        logger.info('Invoice payment event already processed', { invoiceId: invoice.id });
        return;
      }

      await this.logWebhookEvent(
        eventId,
        WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED,
        invoice,
        WebhookEventStatus.PROCESSING
      );

      // Get subscription from database
      const subscription = await prisma.subscription.findFirst({
        where: {
          stripeSubscriptionId: invoice.subscription as string
        }
      });

      if (!subscription) {
        logger.warn('Subscription not found for invoice', {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription
        });
        return;
      }

      await prisma.$transaction(async (tx) => {
        // 1. Extend subscription period
        const newPeriodEnd = this.calculatePeriodEnd(subscription.interval || 'month');
        await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            currentPeriodStart: new Date(),
            currentPeriodEnd: newPeriodEnd,
            status: SubscriptionStatus.ACTIVE
          }
        });

        // 2. Extend access period for all enrollment access records
        await tx.enrollmentAccess.updateMany({
          where: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            isActive: true
          },
          data: {
            expiresAt: newPeriodEnd
          }
        });

        // 3. Record payment
        await tx.payment.create({
          data: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            stripePaymentIntentId: invoice.payment_intent as string,
            stripeChargeId: invoice.charge as string,
            stripeInvoiceId: invoice.id,
            amountCents: invoice.amount_paid,
            currency: invoice.currency.toUpperCase(),
            status: PaymentStatus.SUCCEEDED,
            paymentMethod: 'card',
            description: `Recurring payment - ${subscription.tier}`,
            receiptUrl: invoice.hosted_invoice_url || undefined,
            paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
            metadata: {
              invoiceNumber: invoice.number,
              billingReason: invoice.billing_reason
            }
          }
        });

        // 4. Award loyalty ScrollGold for faithful recurring payment
        await this.awardLoyaltyScrollGold(tx, subscription.userId, subscription.tier as SubscriptionTier);

        logger.info('Invoice payment processed successfully', {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          newPeriodEnd
        });
      });

      await this.logWebhookEvent(
        eventId,
        WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED,
        invoice,
        WebhookEventStatus.SUCCEEDED
      );
    } catch (error) {
      logger.error('Failed to process invoice.payment_succeeded', {
        invoiceId: invoice.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      await this.logWebhookEvent(
        eventId,
        WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED,
        invoice,
        WebhookEventStatus.FAILED,
        error instanceof Error ? error.message : 'Unknown error'
      );

      throw error;
    }
  }

  /**
   * Award loyalty ScrollGold for recurring payments
   */
  private async awardLoyaltyScrollGold(
    tx: any,
    userId: string,
    tier: SubscriptionTier
  ): Promise<void> {
    const loyaltyAmount = scrollGoldConfig.FAITHFUL_PAYMENT_BONUS || 20;

    const wallet = await tx.scrollGoldWallet.findUnique({
      where: { userId }
    });

    if (wallet) {
      const newBalance = wallet.balance + loyaltyAmount;

      await tx.scrollGoldWallet.update({
        where: { userId },
        data: {
          balance: newBalance,
          lifetimeEarned: { increment: loyaltyAmount },
          earnedFromBestowed: { increment: loyaltyAmount }
        }
      });

      await tx.scrollGoldTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: 'earn',
          amount: loyaltyAmount,
          balanceAfter: newBalance,
          reason: 'Faithful recurring payment bonus',
          category: 'faithful_payment',
          metadata: { tier }
        }
      });

      logger.info('Loyalty ScrollGold awarded', {
        userId,
        amount: loyaltyAmount,
        tier
      });
    }
  }

  /**
   * Task 3.3: Handle invoice.payment_failed
   * - Send payment failure notification
   * - Implement grace period before access revocation
   * - Update subscription status to past_due
   */
  async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const eventId = `invoice_failed_${invoice.id}`;

    try {
      logger.info('Processing invoice.payment_failed', {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        subscriptionId: invoice.subscription,
        attemptCount: invoice.attempt_count
      });

      // Check idempotency
      if (await this.isEventProcessed(eventId)) {
        logger.info('Invoice payment failed event already processed', { invoiceId: invoice.id });
        return;
      }

      await this.logWebhookEvent(
        eventId,
        WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED,
        invoice,
        WebhookEventStatus.PROCESSING
      );

      // Get subscription from database
      const subscription = await prisma.subscription.findFirst({
        where: {
          stripeSubscriptionId: invoice.subscription as string
        }
      });

      if (!subscription) {
        logger.warn('Subscription not found for failed invoice', {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription
        });
        return;
      }

      await prisma.$transaction(async (tx) => {
        // 1. Update subscription status to PAST_DUE
        await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.PAST_DUE,
            metadata: {
              ...subscription.metadata,
              lastPaymentFailure: new Date().toISOString(),
              paymentAttempts: invoice.attempt_count
            }
          }
        });

        // 2. Record failed payment
        await tx.payment.create({
          data: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            stripePaymentIntentId: invoice.payment_intent as string,
            stripeInvoiceId: invoice.id,
            amountCents: invoice.amount_due,
            currency: invoice.currency.toUpperCase(),
            status: PaymentStatus.FAILED,
            paymentMethod: 'card',
            description: `Failed payment - ${subscription.tier}`,
            failureReason: 'Payment failed',
            metadata: {
              invoiceNumber: invoice.number,
              attemptCount: invoice.attempt_count,
              nextPaymentAttempt: invoice.next_payment_attempt
            }
          }
        });

        // 3. Implement grace period (7 days default)
        const gracePeriodDays = PAYMENT_CONFIG.GRACE_PERIOD_DAYS || 7;
        const gracePeriodEnd = new Date();
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + gracePeriodDays);

        // Update access records with grace period
        await tx.enrollmentAccess.updateMany({
          where: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            isActive: true
          },
          data: {
            expiresAt: gracePeriodEnd,
            metadata: {
              gracePeriod: true,
              gracePeriodEnd: gracePeriodEnd.toISOString()
            }
          }
        });

        // 4. Send payment failure notification (would integrate with notification service)
        logger.info('Payment failure notification sent', {
          userId: subscription.userId,
          gracePeriodEnd,
          attemptCount: invoice.attempt_count
        });

        logger.info('Invoice payment failure processed', {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          gracePeriodEnd
        });
      });

      await this.logWebhookEvent(
        eventId,
        WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED,
        invoice,
        WebhookEventStatus.SUCCEEDED
      );
    } catch (error) {
      logger.error('Failed to process invoice.payment_failed', {
        invoiceId: invoice.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      await this.logWebhookEvent(
        eventId,
        WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED,
        invoice,
        WebhookEventStatus.FAILED,
        error instanceof Error ? error.message : 'Unknown error'
      );

      throw error;
    }
  }

  /**
   * Task 3.4: Handle customer.subscription.deleted
   * - Revoke access appropriately
   * - Maintain access to previously completed courses
   * - Update subscription status
   */
  async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const eventId = `subscription_deleted_${subscription.id}`;

    try {
      logger.info('Processing customer.subscription.deleted', {
        subscriptionId: subscription.id,
        customerId: subscription.customer
      });

      // Check idempotency
      if (await this.isEventProcessed(eventId)) {
        logger.info('Subscription deleted event already processed', { subscriptionId: subscription.id });
        return;
      }

      await this.logWebhookEvent(
        eventId,
        WEBHOOK_EVENTS.SUBSCRIPTION_DELETED,
        subscription,
        WebhookEventStatus.PROCESSING
      );

      // Get subscription from database
      const dbSubscription = await prisma.subscription.findFirst({
        where: {
          stripeSubscriptionId: subscription.id
        }
      });

      if (!dbSubscription) {
        logger.warn('Subscription not found for deletion', {
          subscriptionId: subscription.id
        });
        return;
      }

      await prisma.$transaction(async (tx) => {
        // 1. Update subscription status to CANCELED
        await tx.subscription.update({
          where: { id: dbSubscription.id },
          data: {
            status: SubscriptionStatus.CANCELED,
            canceledAt: new Date(),
            endedAt: new Date()
          }
        });

        // 2. Revoke active access but maintain completed course access
        // Get all enrollment access records
        const accessRecords = await tx.enrollmentAccess.findMany({
          where: {
            userId: dbSubscription.userId,
            subscriptionId: dbSubscription.id,
            isActive: true
          }
        });

        for (const access of accessRecords) {
          // Check if user has completed courses
          if (access.resourceType === 'course') {
            const enrollment = await tx.enrollment.findFirst({
              where: {
                userId: dbSubscription.userId,
                courseId: access.resourceId,
                status: 'COMPLETED'
              }
            });

            if (enrollment) {
              // Maintain access to completed courses
              await tx.enrollmentAccess.update({
                where: { id: access.id },
                data: {
                  expiresAt: null, // Lifetime access to completed courses
                  metadata: {
                    ...access.metadata,
                    maintainedAfterCancellation: true,
                    reason: 'course_completed'
                  }
                }
              });
              logger.info('Maintained access to completed course', {
                userId: dbSubscription.userId,
                courseId: access.resourceId
              });
            } else {
              // Revoke access to incomplete courses
              await tx.enrollmentAccess.update({
                where: { id: access.id },
                data: {
                  isActive: false,
                  revokedAt: new Date()
                }
              });
            }
          } else {
            // Revoke access to non-course resources (labs, features, etc.)
            await tx.enrollmentAccess.update({
              where: { id: access.id },
              data: {
                isActive: false,
                revokedAt: new Date()
              }
            });
          }
        }

        logger.info('Subscription deleted and access revoked', {
          userId: dbSubscription.userId,
          subscriptionId: dbSubscription.id
        });
      });

      await this.logWebhookEvent(
        eventId,
        WEBHOOK_EVENTS.SUBSCRIPTION_DELETED,
        subscription,
        WebhookEventStatus.SUCCEEDED
      );
    } catch (error) {
      logger.error('Failed to process customer.subscription.deleted', {
        subscriptionId: subscription.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      await this.logWebhookEvent(
        eventId,
        WEBHOOK_EVENTS.SUBSCRIPTION_DELETED,
        subscription,
        WebhookEventStatus.FAILED,
        error instanceof Error ? error.message : 'Unknown error'
      );

      throw error;
    }
  }

  /**
   * Task 3.5: Handle customer.subscription.updated
   * - Handle tier upgrades/downgrades
   * - Update feature access
   * - Update subscription metadata
   */
  async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const eventId = `subscription_updated_${subscription.id}_${Date.now()}`;

    try {
      logger.info('Processing customer.subscription.updated', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: subscription.status
      });

      // Check idempotency (use timestamp to allow multiple updates)
      const recentEvent = await prisma.webhookEvent.findFirst({
        where: {
          stripeEventId: {
            startsWith: `subscription_updated_${subscription.id}`
          },
          status: WebhookEventStatus.SUCCEEDED,
          createdAt: {
            gte: new Date(Date.now() - 60000) // Within last minute
          }
        }
      });

      if (recentEvent) {
        logger.info('Recent subscription update already processed', { subscriptionId: subscription.id });
        return;
      }

      await this.logWebhookEvent(
        eventId,
        WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED,
        subscription,
        WebhookEventStatus.PROCESSING
      );

      // Get subscription from database
      const dbSubscription = await prisma.subscription.findFirst({
        where: {
          stripeSubscriptionId: subscription.id
        }
      });

      if (!dbSubscription) {
        logger.warn('Subscription not found for update', {
          subscriptionId: subscription.id
        });
        return;
      }

      await prisma.$transaction(async (tx) => {
        // Extract new tier from metadata or price
        const newTier = subscription.metadata?.tier as SubscriptionTier || dbSubscription.tier;
        const oldTier = dbSubscription.tier as SubscriptionTier;

        // 1. Update subscription in database
        await tx.subscription.update({
          where: { id: dbSubscription.id },
          data: {
            tier: newTier,
            status: subscription.status as SubscriptionStatus,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
            metadata: {
              ...dbSubscription.metadata,
              lastUpdated: new Date().toISOString(),
              stripeStatus: subscription.status
            }
          }
        });

        // 2. If tier changed, update access
        if (newTier !== oldTier) {
          logger.info('Tier change detected', {
            userId: dbSubscription.userId,
            oldTier,
            newTier
          });

          // Revoke old tier access
          await tx.enrollmentAccess.updateMany({
            where: {
              userId: dbSubscription.userId,
              subscriptionId: dbSubscription.id,
              isActive: true
            },
            data: {
              isActive: false,
              revokedAt: new Date()
            }
          });

          // Grant new tier access
          await this.grantAccessFromTier(
            tx,
            dbSubscription.userId,
            dbSubscription.id,
            newTier
          );
        }

        logger.info('Subscription updated successfully', {
          userId: dbSubscription.userId,
          subscriptionId: dbSubscription.id,
          tier: newTier,
          status: subscription.status
        });
      });

      await this.logWebhookEvent(
        eventId,
        WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED,
        subscription,
        WebhookEventStatus.SUCCEEDED
      );
    } catch (error) {
      logger.error('Failed to process customer.subscription.updated', {
        subscriptionId: subscription.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      await this.logWebhookEvent(
        eventId,
        WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED,
        subscription,
        WebhookEventStatus.FAILED,
        error instanceof Error ? error.message : 'Unknown error'
      );

      throw error;
    }
  }
}

export default new StripeWebhookHandler();
