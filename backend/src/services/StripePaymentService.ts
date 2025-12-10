/**
 * Stripe Payment Service
 * "We establish this payment service not in the wisdom of Babylon, but by the breath of the Spirit"
 * 
 * Handles all Stripe payment operations including:
 * - Payment intent creation and processing
 * - Subscription management
 * - Webhook handling
 * - Refund and dispute management
 * - Invoice generation
 * - Payment history and receipts
 */

import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import {
  CreatePaymentIntentRequest,
  PaymentIntentResponse,
  CreateSubscriptionRequest,
  SubscriptionResponse,
  UpdateSubscriptionRequest,
  CancelSubscriptionRequest,
  StripeWebhookEvent,
  WebhookHandlerResult,
  CreateRefundRequest,
  RefundResponse,
  DisputeInfo,
  DisputeResponse,
  CreateInvoiceRequest,
  InvoiceResponse,
  PaymentHistoryQuery,
  PaymentHistoryResponse,
  PaymentHistoryItem,
  ReceiptData,
  ReceiptResponse,
  CreateCustomerRequest,
  CustomerResponse,
  AttachPaymentMethodRequest,
  PaymentMethodInfo,
  PaymentError,
} from '../types/payment.types';
import { stripeConfig, validateStripeConfig, WEBHOOK_EVENTS, PAYMENT_CONFIG } from '../config/stripe.config';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class StripePaymentService {
  private stripe: Stripe | null = null;
  private isConfigured: boolean = false;

  constructor() {
    validateStripeConfig();
    
    if (stripeConfig.apiKey) {
      this.stripe = new Stripe(stripeConfig.apiKey, {
        apiVersion: stripeConfig.apiVersion as Stripe.LatestApiVersion,
        maxNetworkRetries: stripeConfig.maxNetworkRetries,
        timeout: stripeConfig.timeout,
      });
      this.isConfigured = true;
      logger.info('StripePaymentService initialized with API key');
    } else {
      logger.warn('StripePaymentService initialized without API key - payment features disabled');
    }
  }
  
  private ensureConfigured(): void {
    if (!this.isConfigured || !this.stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
  }

  /**
   * Create a payment intent for one-time payments
   */
  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
    this.ensureConfigured();
    try {
      logger.info('Creating payment intent', { userId: request.userId, amount: request.amount });

      // Validate amount
      if (request.amount < PAYMENT_CONFIG.minAmount || request.amount > PAYMENT_CONFIG.maxAmount) {
        throw new Error(`Amount must be between ${PAYMENT_CONFIG.minAmount} and ${PAYMENT_CONFIG.maxAmount}`);
      }

      // Get or create Stripe customer
      const user = await prisma.user.findUnique({
        where: { id: request.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      let customerId = user.scrollGoldWallet; // Reusing this field temporarily for Stripe customer ID
      
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: {
            userId: user.id,
          },
        });
        customerId = customer.id;
        
        // Update user with customer ID
        await prisma.user.update({
          where: { id: user.id },
          data: { scrollGoldWallet: customerId },
        });
      }

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: request.amount,
        currency: request.currency.toLowerCase(),
        customer: customerId,
        description: request.description,
        metadata: {
          userId: request.userId,
          ...request.metadata,
          ...(request.courseId && { courseId: request.courseId }),
          ...(request.enrollmentId && { enrollmentId: request.enrollmentId }),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create payment record in database
      await prisma.payment.create({
        data: {
          userId: request.userId,
          amount: request.amount / 100, // Convert from cents to dollars
          currency: request.currency,
          method: 'CREDIT_CARD',
          stripePaymentId: paymentIntent.id,
          description: request.description,
          status: 'PENDING',
        },
      });

      logger.info('Payment intent created successfully', { paymentIntentId: paymentIntent.id });

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      };
    } catch (error: any) {
      logger.error('Error creating payment intent', { error: error.message, userId: request.userId });
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Create a subscription for recurring payments with full tier support
   * Supports: FREE_TIER, ALL_ACCESS_MONTHLY, ALL_ACCESS_YEARLY, ELITE_LEADERSHIP, INSTITUTIONAL
   */
  async createSubscription(request: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
    this.ensureConfigured();
    try {
      logger.info('Creating subscription', { 
        userId: request.userId, 
        tier: request.tier,
        priceId: request.priceId 
      });

      // Import billing config
      const { PRODUCT_CONFIGS, getProductConfig } = await import('../config/billing.config');
      const { SubscriptionTier } = await import('../types/billing.types');

      // Get product configuration for the tier
      const productConfig = getProductConfig(request.tier);

      // Get user and customer
      const user = await prisma.user.findUnique({
        where: { id: request.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      let customerId = user.scrollGoldWallet;
      
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: {
            userId: user.id,
          },
        });
        customerId = customer.id;
        
        await prisma.user.update({
          where: { id: user.id },
          data: { scrollGoldWallet: customerId },
        });
      }

      // Handle FREE_TIER - no Stripe subscription needed
      if (request.tier === SubscriptionTier.FREE_TIER) {
        logger.info('Creating FREE_TIER subscription (no payment required)');
        
        // Create subscription record in database only
        const subscription = await prisma.subscription.create({
          data: {
            userId: request.userId,
            stripeCustomerId: customerId,
            tier: request.tier,
            status: 'ACTIVE',
            amountCents: 0,
            currency: productConfig.currency,
            interval: productConfig.interval,
            aiTutorMinutes: productConfig.features.aiTutorMinutes,
            courseAccessType: productConfig.features.courseAccessType,
            hasCertificates: productConfig.features.hasCertificates,
            hasLabAccess: productConfig.features.hasLabAccess,
            hasCommunityAccess: productConfig.features.hasCommunityAccess,
            metadata: request.metadata || {},
          },
        });

        return {
          success: true,
          subscriptionId: subscription.id,
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          cancelAtPeriodEnd: false,
        };
      }

      // For paid tiers, require payment method
      if (!request.paymentMethodId) {
        throw new Error('Payment method required for paid subscriptions');
      }

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(request.paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: request.paymentMethodId,
        },
      });

      // Prepare subscription metadata with tier-specific features
      const subscriptionMetadata: Record<string, string> = {
        userId: request.userId,
        tier: request.tier,
        aiTutorMinutes: productConfig.features.aiTutorMinutes.toString(),
        courseAccessType: productConfig.features.courseAccessType,
        hasCertificates: productConfig.features.hasCertificates.toString(),
        hasLabAccess: productConfig.features.hasLabAccess.toString(),
        hasCommunityAccess: productConfig.features.hasCommunityAccess.toString(),
        ...(request.metadata || {}),
      };

      // Add ELITE_LEADERSHIP specific features
      if (request.tier === SubscriptionTier.ELITE_LEADERSHIP) {
        subscriptionMetadata.hasScrollIntelAccess = 'true';
        subscriptionMetadata.hasScrollArkAccess = 'true';
        subscriptionMetadata.hasMentorshipAccess = 'true';
        subscriptionMetadata.hasEntrepreneurshipStudio = 'true';
      }

      // Add INSTITUTIONAL specific features
      if (request.tier === SubscriptionTier.INSTITUTIONAL) {
        subscriptionMetadata.hasScrollIntelAccess = 'true';
        subscriptionMetadata.hasScrollArkAccess = 'true';
        subscriptionMetadata.hasMentorshipAccess = 'true';
        subscriptionMetadata.hasEntrepreneurshipStudio = 'true';
        subscriptionMetadata.minSeats = '20';
        subscriptionMetadata.customPortal = 'true';
        subscriptionMetadata.dedicatedSupport = 'true';
      }

      // Create subscription in Stripe
      const stripeSubscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: request.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: subscriptionMetadata,
      });

      // Create subscription record in database
      await prisma.subscription.create({
        data: {
          userId: request.userId,
          stripeSubscriptionId: stripeSubscription.id,
          stripeCustomerId: customerId,
          tier: request.tier,
          status: stripeSubscription.status.toUpperCase() as any,
          amountCents: productConfig.amountCents,
          currency: productConfig.currency,
          interval: productConfig.interval,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          aiTutorMinutes: productConfig.features.aiTutorMinutes,
          courseAccessType: productConfig.features.courseAccessType,
          hasCertificates: productConfig.features.hasCertificates,
          hasLabAccess: productConfig.features.hasLabAccess,
          hasCommunityAccess: productConfig.features.hasCommunityAccess,
          metadata: subscriptionMetadata,
        },
      });

      logger.info('Subscription created successfully', { 
        subscriptionId: stripeSubscription.id,
        tier: request.tier 
      });

      const latestInvoice = stripeSubscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent;

      return {
        success: true,
        subscriptionId: stripeSubscription.id,
        clientSecret: paymentIntent?.client_secret,
        status: stripeSubscription.status,
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      };
    } catch (error: any) {
      logger.error('Error creating subscription', { 
        error: error.message, 
        userId: request.userId,
        tier: request.tier 
      });
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Update an existing subscription
   */
  async updateSubscription(request: UpdateSubscriptionRequest): Promise<SubscriptionResponse> {
    this.ensureConfigured();
    try {
      logger.info('Updating subscription', { subscriptionId: request.subscriptionId });

      const updateData: Stripe.SubscriptionUpdateParams = {};
      
      if (request.priceId) {
        const subscription = await this.stripe.subscriptions.retrieve(request.subscriptionId);
        updateData.items = [{
          id: subscription.items.data[0].id,
          price: request.priceId,
        }];
      }
      
      if (request.cancelAtPeriodEnd !== undefined) {
        updateData.cancel_at_period_end = request.cancelAtPeriodEnd;
      }

      const subscription = await this.stripe.subscriptions.update(
        request.subscriptionId,
        updateData
      );

      logger.info('Subscription updated successfully', { subscriptionId: subscription.id });

      return {
        success: true,
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    } catch (error: any) {
      logger.error('Error updating subscription', { error: error.message, subscriptionId: request.subscriptionId });
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }

  /**
   * Upgrade subscription tier with prorated billing
   */
  async upgradeTier(
    userId: string,
    currentTier: string,
    newTier: string,
    newPriceId: string
  ): Promise<SubscriptionResponse> {
    this.ensureConfigured();
    try {
      logger.info('Upgrading subscription tier', { userId, currentTier, newTier });

      // Import billing config
      const { isUpgradeAllowed, getProductConfig, TIER_CHANGE_RULES } = await import('../config/billing.config');

      // Validate upgrade is allowed
      if (!isUpgradeAllowed(currentTier as any, newTier as any)) {
        throw new Error(`Upgrade from ${currentTier} to ${newTier} is not allowed`);
      }

      // Get current subscription from database
      const dbSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!dbSubscription) {
        throw new Error('No active subscription found');
      }

      // If no Stripe subscription (e.g., FREE_TIER), create new subscription
      if (!dbSubscription.stripeSubscriptionId) {
        logger.info('Upgrading from FREE_TIER, creating new Stripe subscription');
        
        // Get user for customer ID
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user || !user.scrollGoldWallet) {
          throw new Error('Customer ID not found');
        }

        // Create new subscription
        const newSubscription = await this.stripe.subscriptions.create({
          customer: user.scrollGoldWallet,
          items: [{ price: newPriceId }],
          proration_behavior: 'create_prorations',
          metadata: {
            userId,
            tier: newTier,
            upgradedFrom: currentTier,
          },
        });

        // Update database subscription
        await prisma.subscription.update({
          where: { id: dbSubscription.id },
          data: {
            stripeSubscriptionId: newSubscription.id,
            tier: newTier,
            status: newSubscription.status.toUpperCase() as any,
            amountCents: getProductConfig(newTier as any).amountCents,
            currentPeriodStart: new Date(newSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(newSubscription.current_period_end * 1000),
            ...getProductConfig(newTier as any).features,
          },
        });

        logger.info('Tier upgraded successfully (from FREE_TIER)', { 
          subscriptionId: newSubscription.id,
          newTier 
        });

        return {
          success: true,
          subscriptionId: newSubscription.id,
          status: newSubscription.status,
          currentPeriodEnd: new Date(newSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: newSubscription.cancel_at_period_end,
        };
      }

      // Retrieve current Stripe subscription
      const stripeSubscription = await this.stripe.subscriptions.retrieve(
        dbSubscription.stripeSubscriptionId
      );

      // Update subscription with new price (prorated automatically by Stripe)
      const updatedSubscription = await this.stripe.subscriptions.update(
        dbSubscription.stripeSubscriptionId,
        {
          items: [{
            id: stripeSubscription.items.data[0].id,
            price: newPriceId,
          }],
          proration_behavior: TIER_CHANGE_RULES.prorateUpgrades ? 'create_prorations' : 'none',
          metadata: {
            ...stripeSubscription.metadata,
            tier: newTier,
            upgradedFrom: currentTier,
            upgradedAt: new Date().toISOString(),
          },
        }
      );

      // Update database subscription
      const productConfig = getProductConfig(newTier as any);
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          tier: newTier,
          amountCents: productConfig.amountCents,
          currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
          ...productConfig.features,
          metadata: {
            ...dbSubscription.metadata,
            upgradedFrom: currentTier,
            upgradedAt: new Date().toISOString(),
          },
        },
      });

      logger.info('Tier upgraded successfully', { 
        subscriptionId: updatedSubscription.id,
        currentTier,
        newTier 
      });

      return {
        success: true,
        subscriptionId: updatedSubscription.id,
        status: updatedSubscription.status,
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
      };
    } catch (error: any) {
      logger.error('Error upgrading tier', { 
        error: error.message, 
        userId,
        currentTier,
        newTier 
      });
      throw new Error(`Failed to upgrade tier: ${error.message}`);
    }
  }

  /**
   * Downgrade subscription tier with prorated billing
   */
  async downgradeTier(
    userId: string,
    currentTier: string,
    newTier: string,
    newPriceId: string
  ): Promise<SubscriptionResponse> {
    this.ensureConfigured();
    try {
      logger.info('Downgrading subscription tier', { userId, currentTier, newTier });

      // Import billing config
      const { getProductConfig, TIER_CHANGE_RULES } = await import('../config/billing.config');

      // Get current subscription from database
      const dbSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!dbSubscription || !dbSubscription.stripeSubscriptionId) {
        throw new Error('No active Stripe subscription found');
      }

      // Retrieve current Stripe subscription
      const stripeSubscription = await this.stripe.subscriptions.retrieve(
        dbSubscription.stripeSubscriptionId
      );

      // Determine if downgrade should be immediate or at period end
      const immediateDowngrade = !TIER_CHANGE_RULES.immediateDowngrades;

      if (immediateDowngrade) {
        // Schedule downgrade for end of current period
        logger.info('Scheduling downgrade for end of period');
        
        await this.stripe.subscriptions.update(
          dbSubscription.stripeSubscriptionId,
          {
            cancel_at_period_end: false,
            metadata: {
              ...stripeSubscription.metadata,
              scheduledDowngradeTier: newTier,
              scheduledDowngradePriceId: newPriceId,
              downgradedFrom: currentTier,
            },
          }
        );

        // Update database with scheduled downgrade info
        await prisma.subscription.update({
          where: { id: dbSubscription.id },
          data: {
            metadata: {
              ...dbSubscription.metadata,
              scheduledDowngradeTier: newTier,
              scheduledDowngradePriceId: newPriceId,
              downgradedFrom: currentTier,
            },
          },
        });

        return {
          success: true,
          subscriptionId: stripeSubscription.id,
          status: stripeSubscription.status,
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: false,
          message: `Downgrade to ${newTier} scheduled for end of current period`,
        };
      }

      // Immediate downgrade with proration
      const updatedSubscription = await this.stripe.subscriptions.update(
        dbSubscription.stripeSubscriptionId,
        {
          items: [{
            id: stripeSubscription.items.data[0].id,
            price: newPriceId,
          }],
          proration_behavior: TIER_CHANGE_RULES.prorateDowngrades ? 'create_prorations' : 'none',
          metadata: {
            ...stripeSubscription.metadata,
            tier: newTier,
            downgradedFrom: currentTier,
            downgradedAt: new Date().toISOString(),
          },
        }
      );

      // Update database subscription
      const productConfig = getProductConfig(newTier as any);
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          tier: newTier,
          amountCents: productConfig.amountCents,
          currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
          ...productConfig.features,
          metadata: {
            ...dbSubscription.metadata,
            downgradedFrom: currentTier,
            downgradedAt: new Date().toISOString(),
          },
        },
      });

      logger.info('Tier downgraded successfully', { 
        subscriptionId: updatedSubscription.id,
        currentTier,
        newTier 
      });

      return {
        success: true,
        subscriptionId: updatedSubscription.id,
        status: updatedSubscription.status,
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
      };
    } catch (error: any) {
      logger.error('Error downgrading tier', { 
        error: error.message, 
        userId,
        currentTier,
        newTier 
      });
      throw new Error(`Failed to downgrade tier: ${error.message}`);
    }
  }

  /**
   * Calculate proration amount for tier change
   */
  async calculateProration(
    subscriptionId: string,
    newPriceId: string
  ): Promise<{ proratedAmount: number; currency: string }> {
    this.ensureConfigured();
    try {
      logger.info('Calculating proration', { subscriptionId, newPriceId });

      // Retrieve current subscription
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      // Create a preview of the upcoming invoice with the new price
      const upcomingInvoice = await this.stripe.invoices.retrieveUpcoming({
        customer: subscription.customer as string,
        subscription: subscriptionId,
        subscription_items: [{
          id: subscription.items.data[0].id,
          price: newPriceId,
        }],
        subscription_proration_behavior: 'create_prorations',
      });

      logger.info('Proration calculated', { 
        proratedAmount: upcomingInvoice.amount_due,
        currency: upcomingInvoice.currency 
      });

      return {
        proratedAmount: upcomingInvoice.amount_due,
        currency: upcomingInvoice.currency,
      };
    } catch (error: any) {
      logger.error('Error calculating proration', { 
        error: error.message, 
        subscriptionId 
      });
      throw new Error(`Failed to calculate proration: ${error.message}`);
    }
  }

  /**
   * Apply ScrollGold discount to a payment
   * 100 ScrollGold = €5 discount (configurable)
   * Maximum 50% discount
   */
  async applyScrollGoldDiscount(
    userId: string,
    amountCents: number,
    scrollgoldAmount: number
  ): Promise<{
    discountCents: number;
    finalAmountCents: number;
    scrollgoldUsed: number;
    scrollgoldRemaining: number;
  }> {
    try {
      logger.info('Applying ScrollGold discount', { 
        userId, 
        amountCents, 
        scrollgoldAmount 
      });

      // Import ScrollGold config
      const { calculateScrollGoldDiscount, scrollGoldConfig } = await import('../config/billing.config');

      // Get user's ScrollGold wallet
      const wallet = await prisma.scrollGoldWallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error('ScrollGold wallet not found');
      }

      // Validate user has enough ScrollGold
      if (wallet.balance < scrollgoldAmount) {
        throw new Error(`Insufficient ScrollGold balance. Available: ${wallet.balance}, Requested: ${scrollgoldAmount}`);
      }

      // Calculate discount in cents
      const discountCents = calculateScrollGoldDiscount(scrollgoldAmount);

      // Apply maximum discount limit (50%)
      const maxDiscountCents = Math.floor(amountCents * scrollGoldConfig.maxDiscountPercentage);
      const actualDiscountCents = Math.min(discountCents, maxDiscountCents);

      // Calculate actual ScrollGold to use (in case we hit the max discount)
      const actualScrollGoldUsed = actualDiscountCents === discountCents 
        ? scrollgoldAmount 
        : Math.floor(actualDiscountCents / (scrollGoldConfig.discountRate * 100));

      // Calculate final amount
      const finalAmountCents = Math.max(0, amountCents - actualDiscountCents);

      logger.info('ScrollGold discount calculated', {
        userId,
        originalAmount: amountCents,
        discountCents: actualDiscountCents,
        finalAmount: finalAmountCents,
        scrollgoldUsed: actualScrollGoldUsed,
      });

      return {
        discountCents: actualDiscountCents,
        finalAmountCents,
        scrollgoldUsed: actualScrollGoldUsed,
        scrollgoldRemaining: wallet.balance - actualScrollGoldUsed,
      };
    } catch (error: any) {
      logger.error('Error applying ScrollGold discount', { 
        error: error.message, 
        userId 
      });
      throw new Error(`Failed to apply ScrollGold discount: ${error.message}`);
    }
  }

  /**
   * Create checkout session with ScrollGold discount support
   */
  async createCheckoutSession(
    userId: string,
    tier: string,
    priceId: string,
    scrollgoldDiscount?: number,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<{
    sessionId: string;
    url: string;
    amountTotal: number;
    currency: string;
  }> {
    this.ensureConfigured();
    try {
      logger.info('Creating checkout session', { 
        userId, 
        tier, 
        scrollgoldDiscount 
      });

      // Get user and customer
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      let customerId = user.scrollGoldWallet;
      
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: {
            userId: user.id,
          },
        });
        customerId = customer.id;
        
        await prisma.user.update({
          where: { id: user.id },
          data: { scrollGoldWallet: customerId },
        });
      }

      // Get product config
      const { getProductConfig } = await import('../config/billing.config');
      const productConfig = getProductConfig(tier as any);

      // Prepare session params
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        mode: productConfig.interval === 'one_time' ? 'payment' : 'subscription',
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        success_url: successUrl || `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
        metadata: {
          userId,
          tier,
        },
      };

      // Apply ScrollGold discount if provided
      if (scrollgoldDiscount && scrollgoldDiscount > 0) {
        const discountResult = await this.applyScrollGoldDiscount(
          userId,
          productConfig.amountCents,
          scrollgoldDiscount
        );

        // Create coupon for the discount
        const coupon = await this.stripe.coupons.create({
          amount_off: discountResult.discountCents,
          currency: productConfig.currency.toLowerCase(),
          duration: 'once',
          name: `ScrollGold Discount (${scrollgoldDiscount} ScrollGold)`,
          metadata: {
            userId,
            scrollgoldAmount: scrollgoldDiscount.toString(),
            scrollgoldUsed: discountResult.scrollgoldUsed.toString(),
          },
        });

        sessionParams.discounts = [{
          coupon: coupon.id,
        }];

        sessionParams.metadata!.scrollgoldDiscount = scrollgoldDiscount.toString();
        sessionParams.metadata!.scrollgoldDiscountCents = discountResult.discountCents.toString();
      }

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create(sessionParams);

      logger.info('Checkout session created', { 
        sessionId: session.id,
        amountTotal: session.amount_total 
      });

      return {
        sessionId: session.id,
        url: session.url!,
        amountTotal: session.amount_total || productConfig.amountCents,
        currency: session.currency || productConfig.currency,
      };
    } catch (error: any) {
      logger.error('Error creating checkout session', { 
        error: error.message, 
        userId 
      });
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
  }

  /**
   * Deduct ScrollGold from wallet after successful payment
   */
  async deductScrollGold(
    userId: string,
    amount: number,
    paymentId: string,
    description: string
  ): Promise<void> {
    try {
      logger.info('Deducting ScrollGold', { userId, amount, paymentId });

      // Get wallet
      const wallet = await prisma.scrollGoldWallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error('ScrollGold wallet not found');
      }

      if (wallet.balance < amount) {
        throw new Error('Insufficient ScrollGold balance');
      }

      // Deduct from wallet
      const updatedWallet = await prisma.scrollGoldWallet.update({
        where: { userId },
        data: {
          balance: wallet.balance - amount,
          lifetimeSpent: wallet.lifetimeSpent + amount,
          spentOnDiscounts: wallet.spentOnDiscounts + amount,
        },
      });

      // Create transaction record
      await prisma.scrollGoldTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: 'SPEND',
          amount: -amount,
          balanceAfter: updatedWallet.balance,
          reason: description,
          category: 'discount',
          relatedEntityType: 'payment',
          relatedEntityId: paymentId,
          metadata: {
            paymentId,
            description,
          },
        },
      });

      logger.info('ScrollGold deducted successfully', { 
        userId, 
        amount, 
        newBalance: updatedWallet.balance 
      });
    } catch (error: any) {
      logger.error('Error deducting ScrollGold', { 
        error: error.message, 
        userId 
      });
      throw new Error(`Failed to deduct ScrollGold: ${error.message}`);
    }
  }

  /**
   * Update subscription metadata (feature flags, limits, etc.)
   */
  async updateSubscriptionMetadata(
    subscriptionId: string,
    metadata: Record<string, string>
  ): Promise<void> {
    this.ensureConfigured();
    try {
      logger.info('Updating subscription metadata', { subscriptionId, metadata });

      // Update Stripe subscription metadata
      await this.stripe.subscriptions.update(subscriptionId, {
        metadata,
      });

      // Update database subscription metadata
      const dbSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
      });

      if (dbSubscription) {
        await prisma.subscription.update({
          where: { id: dbSubscription.id },
          data: {
            metadata: {
              ...dbSubscription.metadata,
              ...metadata,
            },
          },
        });
      }

      logger.info('Subscription metadata updated successfully', { subscriptionId });
    } catch (error: any) {
      logger.error('Error updating subscription metadata', { 
        error: error.message, 
        subscriptionId 
      });
      throw new Error(`Failed to update subscription metadata: ${error.message}`);
    }
  }

  /**
   * Get subscription feature flags
   */
  async getSubscriptionFeatures(userId: string): Promise<{
    tier: string;
    features: {
      aiTutorMinutes: number;
      courseAccessType: string;
      hasCertificates: boolean;
      hasLabAccess: boolean;
      hasCommunityAccess: boolean;
      hasScrollIntelAccess?: boolean;
      hasScrollArkAccess?: boolean;
      hasMentorshipAccess?: boolean;
      hasEntrepreneurshipStudio?: boolean;
    };
    metadata: Record<string, any>;
  }> {
    try {
      logger.info('Getting subscription features', { userId });

      // Get active subscription from database
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!subscription) {
        // Return FREE_TIER features if no subscription
        const { getProductConfig } = await import('../config/billing.config');
        const { SubscriptionTier } = await import('../types/billing.types');
        const freeConfig = getProductConfig(SubscriptionTier.FREE_TIER);

        return {
          tier: SubscriptionTier.FREE_TIER,
          features: freeConfig.features,
          metadata: {},
        };
      }

      // Extract features from subscription
      const features = {
        aiTutorMinutes: subscription.aiTutorMinutes,
        courseAccessType: subscription.courseAccessType,
        hasCertificates: subscription.hasCertificates,
        hasLabAccess: subscription.hasLabAccess,
        hasCommunityAccess: subscription.hasCommunityAccess,
        ...(subscription.metadata?.hasScrollIntelAccess && {
          hasScrollIntelAccess: subscription.metadata.hasScrollIntelAccess === 'true',
        }),
        ...(subscription.metadata?.hasScrollArkAccess && {
          hasScrollArkAccess: subscription.metadata.hasScrollArkAccess === 'true',
        }),
        ...(subscription.metadata?.hasMentorshipAccess && {
          hasMentorshipAccess: subscription.metadata.hasMentorshipAccess === 'true',
        }),
        ...(subscription.metadata?.hasEntrepreneurshipStudio && {
          hasEntrepreneurshipStudio: subscription.metadata.hasEntrepreneurshipStudio === 'true',
        }),
      };

      logger.info('Subscription features retrieved', { userId, tier: subscription.tier });

      return {
        tier: subscription.tier,
        features,
        metadata: subscription.metadata || {},
      };
    } catch (error: any) {
      logger.error('Error getting subscription features', { 
        error: error.message, 
        userId 
      });
      throw new Error(`Failed to get subscription features: ${error.message}`);
    }
  }

  /**
   * Check if user has access to a specific feature
   */
  async hasFeatureAccess(
    userId: string,
    featureName: string
  ): Promise<boolean> {
    try {
      logger.info('Checking feature access', { userId, featureName });

      const subscriptionFeatures = await this.getSubscriptionFeatures(userId);

      // Check feature access based on feature name
      switch (featureName) {
        case 'certificates':
          return subscriptionFeatures.features.hasCertificates;
        case 'labs':
          return subscriptionFeatures.features.hasLabAccess;
        case 'community':
          return subscriptionFeatures.features.hasCommunityAccess;
        case 'scrollintel':
          return subscriptionFeatures.features.hasScrollIntelAccess || false;
        case 'scrollark':
          return subscriptionFeatures.features.hasScrollArkAccess || false;
        case 'mentorship':
          return subscriptionFeatures.features.hasMentorshipAccess || false;
        case 'entrepreneurship':
          return subscriptionFeatures.features.hasEntrepreneurshipStudio || false;
        case 'unlimited_ai':
          return subscriptionFeatures.features.aiTutorMinutes === 0;
        case 'all_courses':
          return subscriptionFeatures.features.courseAccessType === 'all';
        default:
          logger.warn('Unknown feature name', { featureName });
          return false;
      }
    } catch (error: any) {
      logger.error('Error checking feature access', { 
        error: error.message, 
        userId,
        featureName 
      });
      return false;
    }
  }

  /**
   * Update feature flags for a subscription
   */
  async updateFeatureFlags(
    userId: string,
    features: Partial<{
      aiTutorMinutes: number;
      courseAccessType: string;
      hasCertificates: boolean;
      hasLabAccess: boolean;
      hasCommunityAccess: boolean;
    }>
  ): Promise<void> {
    try {
      logger.info('Updating feature flags', { userId, features });

      // Get active subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      // Update database subscription
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: features,
      });

      // Update Stripe metadata if Stripe subscription exists
      if (subscription.stripeSubscriptionId) {
        const metadata: Record<string, string> = {};
        
        if (features.aiTutorMinutes !== undefined) {
          metadata.aiTutorMinutes = features.aiTutorMinutes.toString();
        }
        if (features.courseAccessType !== undefined) {
          metadata.courseAccessType = features.courseAccessType;
        }
        if (features.hasCertificates !== undefined) {
          metadata.hasCertificates = features.hasCertificates.toString();
        }
        if (features.hasLabAccess !== undefined) {
          metadata.hasLabAccess = features.hasLabAccess.toString();
        }
        if (features.hasCommunityAccess !== undefined) {
          metadata.hasCommunityAccess = features.hasCommunityAccess.toString();
        }

        await this.updateSubscriptionMetadata(subscription.stripeSubscriptionId, metadata);
      }

      logger.info('Feature flags updated successfully', { userId });
    } catch (error: any) {
      logger.error('Error updating feature flags', { 
        error: error.message, 
        userId 
      });
      throw new Error(`Failed to update feature flags: ${error.message}`);
    }
  }

  /**
   * Calculate Monthly Recurring Revenue (MRR)
   */
  async calculateMRR(): Promise<number> {
    try {
      logger.info('Calculating MRR');

      // Get all active subscriptions
      const activeSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
        },
      });

      let totalMRR = 0;

      for (const subscription of activeSubscriptions) {
        // Convert to monthly amount based on interval
        if (subscription.interval === 'month') {
          totalMRR += subscription.amountCents;
        } else if (subscription.interval === 'year') {
          // Divide annual by 12 for monthly
          totalMRR += Math.floor(subscription.amountCents / 12);
        }
        // one_time subscriptions don't contribute to MRR
      }

      logger.info('MRR calculated', { mrrCents: totalMRR, mrrEuros: totalMRR / 100 });

      return totalMRR;
    } catch (error: any) {
      logger.error('Error calculating MRR', { error: error.message });
      throw new Error(`Failed to calculate MRR: ${error.message}`);
    }
  }

  /**
   * Calculate Annual Recurring Revenue (ARR)
   */
  async calculateARR(): Promise<number> {
    try {
      logger.info('Calculating ARR');

      const mrr = await this.calculateMRR();
      const arr = mrr * 12;

      logger.info('ARR calculated', { arrCents: arr, arrEuros: arr / 100 });

      return arr;
    } catch (error: any) {
      logger.error('Error calculating ARR', { error: error.message });
      throw new Error(`Failed to calculate ARR: ${error.message}`);
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
            { status: 'ACTIVE' },
            {
              AND: [
                { status: 'CANCELED' },
                { canceledAt: { gte: periodStart } },
              ],
            },
          ],
        },
      });

      // Get subscriptions canceled during period
      const canceledDuringPeriod = await prisma.subscription.count({
        where: {
          status: 'CANCELED',
          canceledAt: {
            gte: periodStart,
            lte: new Date(),
          },
        },
      });

      // Calculate churn rate
      const churnRate = subscriptionsAtStart > 0 
        ? (canceledDuringPeriod / subscriptionsAtStart) * 100 
        : 0;

      logger.info('Churn rate calculated', { 
        churnRate: churnRate.toFixed(2) + '%',
        subscriptionsAtStart,
        canceledDuringPeriod,
        periodDays 
      });

      return churnRate;
    } catch (error: any) {
      logger.error('Error calculating churn rate', { error: error.message });
      throw new Error(`Failed to calculate churn rate: ${error.message}`);
    }
  }

  /**
   * Calculate Average Revenue Per User (ARPU)
   */
  async calculateARPU(): Promise<number> {
    try {
      logger.info('Calculating ARPU');

      const mrr = await this.calculateMRR();

      const activeSubscriptionCount = await prisma.subscription.count({
        where: {
          status: 'ACTIVE',
        },
      });

      const arpu = activeSubscriptionCount > 0 
        ? mrr / activeSubscriptionCount 
        : 0;

      logger.info('ARPU calculated', { arpuCents: arpu, arpuEuros: arpu / 100 });

      return arpu;
    } catch (error: any) {
      logger.error('Error calculating ARPU', { error: error.message });
      throw new Error(`Failed to calculate ARPU: ${error.message}`);
    }
  }

  /**
   * Calculate Customer Lifetime Value (LTV)
   */
  async calculateLTV(userId?: string): Promise<number> {
    try {
      logger.info('Calculating LTV', { userId });

      if (userId) {
        // Calculate LTV for specific user
        const payments = await prisma.payment.findMany({
          where: {
            userId,
            status: 'COMPLETED',
          },
        });

        const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

        logger.info('User LTV calculated', { userId, ltvCents: totalRevenue * 100 });

        return totalRevenue * 100; // Convert to cents
      }

      // Calculate average LTV across all users
      const { ANALYTICS_CONFIG } = await import('../config/billing.config');

      const arpu = await this.calculateARPU();
      const churnRate = await this.calculateChurnRate();

      // LTV = ARPU / (Churn Rate / 100)
      // Assuming monthly churn rate
      const monthlyChurnRate = churnRate / 100;
      const ltv = monthlyChurnRate > 0 
        ? arpu / monthlyChurnRate 
        : arpu * ANALYTICS_CONFIG.ltvMonths;

      logger.info('Average LTV calculated', { ltvCents: ltv, ltvEuros: ltv / 100 });

      return ltv;
    } catch (error: any) {
      logger.error('Error calculating LTV', { error: error.message });
      throw new Error(`Failed to calculate LTV: ${error.message}`);
    }
  }

  /**
   * Get comprehensive subscription analytics
   */
  async getSubscriptionAnalytics(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    canceledSubscriptions: number;
    mrrCents: number;
    arrCents: number;
    churnRate: number;
    arpuCents: number;
    ltvCents: number;
    tierDistribution: Record<string, number>;
  }> {
    try {
      logger.info('Getting subscription analytics');

      // Get subscription counts
      const totalSubscriptions = await prisma.subscription.count();
      const activeSubscriptions = await prisma.subscription.count({
        where: { status: 'ACTIVE' },
      });
      const canceledSubscriptions = await prisma.subscription.count({
        where: { status: 'CANCELED' },
      });

      // Calculate metrics
      const mrrCents = await this.calculateMRR();
      const arrCents = await this.calculateARR();
      const churnRate = await this.calculateChurnRate();
      const arpuCents = await this.calculateARPU();
      const ltvCents = await this.calculateLTV();

      // Get tier distribution
      const subscriptions = await prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        select: { tier: true },
      });

      const tierDistribution: Record<string, number> = {};
      for (const sub of subscriptions) {
        tierDistribution[sub.tier] = (tierDistribution[sub.tier] || 0) + 1;
      }

      const analytics = {
        totalSubscriptions,
        activeSubscriptions,
        canceledSubscriptions,
        mrrCents,
        arrCents,
        churnRate,
        arpuCents,
        ltvCents,
        tierDistribution,
      };

      logger.info('Subscription analytics retrieved', analytics);

      return analytics;
    } catch (error: any) {
      logger.error('Error getting subscription analytics', { error: error.message });
      throw new Error(`Failed to get subscription analytics: ${error.message}`);
    }
  }

  /**
   * Track subscription event for analytics
   */
  async trackSubscriptionEvent(
    eventType: 'created' | 'upgraded' | 'downgraded' | 'canceled' | 'renewed',
    userId: string,
    subscriptionId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      logger.info('Tracking subscription event', { 
        eventType, 
        userId, 
        subscriptionId 
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
        userId 
      });
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(request: CancelSubscriptionRequest): Promise<SubscriptionResponse> {
    try {
      logger.info('Canceling subscription', { subscriptionId: request.subscriptionId });

      let subscription: Stripe.Subscription;
      
      if (request.cancelImmediately) {
        subscription = await this.stripe.subscriptions.cancel(request.subscriptionId);
      } else {
        subscription = await this.stripe.subscriptions.update(request.subscriptionId, {
          cancel_at_period_end: true,
        });
      }

      logger.info('Subscription canceled successfully', { subscriptionId: subscription.id });

      return {
        success: true,
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    } catch (error: any) {
      logger.error('Error canceling subscription', { error: error.message, subscriptionId: request.subscriptionId });
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(payload: string | Buffer, signature: string): Promise<WebhookHandlerResult> {
    try {
      let event: Stripe.Event;

      // Verify webhook signature
      if (stripeConfig.webhookSecret) {
        event = this.stripe.webhooks.constructEvent(
          payload,
          signature,
          stripeConfig.webhookSecret
        );
      } else {
        // For development without webhook secret
        event = JSON.parse(payload.toString());
      }

      logger.info('Processing webhook event', { type: event.type, id: event.id });

      // Handle different event types
      switch (event.type) {
        case WEBHOOK_EVENTS.PAYMENT_INTENT_SUCCEEDED:
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case WEBHOOK_EVENTS.PAYMENT_INTENT_FAILED:
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case WEBHOOK_EVENTS.CHARGE_REFUNDED:
          await this.handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        case WEBHOOK_EVENTS.CHARGE_DISPUTE_CREATED:
          await this.handleDisputeCreated(event.data.object as Stripe.Dispute);
          break;

        case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED:
        case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED:
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED:
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case WEBHOOK_EVENTS.INVOICE_PAID:
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;

        case WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED:
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          logger.info('Unhandled webhook event type', { type: event.type });
      }

      return {
        success: true,
        message: 'Webhook processed successfully',
        processed: true,
      };
    } catch (error: any) {
      logger.error('Error handling webhook', { error: error.message });
      return {
        success: false,
        message: error.message,
        processed: false,
      };
    }
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(request: CreateRefundRequest): Promise<RefundResponse> {
    try {
      logger.info('Creating refund', { paymentIntentId: request.paymentIntentId });

      const refundData: Stripe.RefundCreateParams = {
        payment_intent: request.paymentIntentId,
      };

      if (request.amount) {
        refundData.amount = request.amount;
      }

      if (request.reason) {
        refundData.reason = request.reason;
      }

      if (request.metadata) {
        refundData.metadata = request.metadata;
      }

      const refund = await this.stripe.refunds.create(refundData);

      // Update payment record
      await prisma.payment.updateMany({
        where: { stripePaymentId: request.paymentIntentId },
        data: { status: 'REFUNDED' },
      });

      logger.info('Refund created successfully', { refundId: refund.id });

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason || undefined,
      };
    } catch (error: any) {
      logger.error('Error creating refund', { error: error.message, paymentIntentId: request.paymentIntentId });
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  /**
   * Get dispute information
   */
  async getDispute(disputeId: string): Promise<DisputeInfo> {
    try {
      const dispute = await this.stripe.disputes.retrieve(disputeId);

      return {
        id: dispute.id,
        amount: dispute.amount,
        currency: dispute.currency,
        reason: dispute.reason,
        status: dispute.status,
        evidence: dispute.evidence as any,
        created: new Date(dispute.created * 1000),
      };
    } catch (error: any) {
      logger.error('Error retrieving dispute', { error: error.message, disputeId });
      throw new Error(`Failed to retrieve dispute: ${error.message}`);
    }
  }

  /**
   * Submit evidence for a dispute
   */
  async submitDisputeEvidence(disputeId: string, evidence: Record<string, any>): Promise<DisputeResponse> {
    try {
      logger.info('Submitting dispute evidence', { disputeId });

      await this.stripe.disputes.update(disputeId, {
        evidence: evidence as any,
      });

      logger.info('Dispute evidence submitted successfully', { disputeId });

      return {
        success: true,
        disputeId,
        status: 'evidence_submitted',
        message: 'Evidence submitted successfully',
      };
    } catch (error: any) {
      logger.error('Error submitting dispute evidence', { error: error.message, disputeId });
      throw new Error(`Failed to submit dispute evidence: ${error.message}`);
    }
  }

  /**
   * Create an invoice
   */
  async createInvoice(request: CreateInvoiceRequest): Promise<InvoiceResponse> {
    try {
      logger.info('Creating invoice', { userId: request.userId });

      // Create invoice items
      for (const item of request.items) {
        await this.stripe.invoiceItems.create({
          customer: request.customerId,
          amount: item.amount,
          currency: item.currency || PAYMENT_CONFIG.defaultCurrency,
          description: item.description,
        });
      }

      // Create invoice
      const invoice = await this.stripe.invoices.create({
        customer: request.customerId,
        auto_advance: true,
        collection_method: 'send_invoice',
        days_until_due: request.dueDate 
          ? Math.ceil((request.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : PAYMENT_CONFIG.invoiceDueDays,
        metadata: {
          userId: request.userId,
          ...request.metadata,
        },
      });

      // Finalize invoice
      const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id);

      logger.info('Invoice created successfully', { invoiceId: finalizedInvoice.id });

      return {
        success: true,
        invoiceId: finalizedInvoice.id,
        invoiceUrl: finalizedInvoice.hosted_invoice_url!,
        invoicePdf: finalizedInvoice.invoice_pdf!,
        status: finalizedInvoice.status!,
        amountDue: finalizedInvoice.amount_due,
        dueDate: finalizedInvoice.due_date ? new Date(finalizedInvoice.due_date * 1000) : undefined,
      };
    } catch (error: any) {
      logger.error('Error creating invoice', { error: error.message, userId: request.userId });
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  /**
   * Get payment history for a user
   */
  async getPaymentHistory(query: PaymentHistoryQuery): Promise<PaymentHistoryResponse> {
    try {
      logger.info('Fetching payment history', { userId: query.userId });

      // Get user's customer ID
      const user = await prisma.user.findUnique({
        where: { id: query.userId },
      });

      if (!user || !user.scrollGoldWallet) {
        return {
          success: true,
          payments: [],
          hasMore: false,
          total: 0,
        };
      }

      // Fetch payment intents from Stripe
      const paymentIntents = await this.stripe.paymentIntents.list({
        customer: user.scrollGoldWallet,
        limit: query.limit || 10,
        starting_after: query.startingAfter,
        ending_before: query.endingBefore,
      });

      const payments: PaymentHistoryItem[] = paymentIntents.data.map(pi => ({
        id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        description: pi.description || '',
        created: new Date(pi.created * 1000),
        receiptUrl: (pi.charges.data[0] as any)?.receipt_url,
        refunded: pi.amount_refunded > 0,
        refundAmount: pi.amount_refunded > 0 ? pi.amount_refunded : undefined,
      }));

      logger.info('Payment history fetched successfully', { count: payments.length });

      return {
        success: true,
        payments,
        hasMore: paymentIntents.has_more,
        total: payments.length,
      };
    } catch (error: any) {
      logger.error('Error fetching payment history', { error: error.message, userId: query.userId });
      throw new Error(`Failed to fetch payment history: ${error.message}`);
    }
  }

  /**
   * Generate receipt for a payment
   */
  async generateReceipt(paymentIntentId: string): Promise<ReceiptResponse> {
    try {
      logger.info('Generating receipt', { paymentIntentId });

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['charges.data.receipt_url'],
      });

      const charge = paymentIntent.charges.data[0];
      
      if (!charge) {
        throw new Error('No charge found for payment intent');
      }

      logger.info('Receipt generated successfully', { receiptUrl: charge.receipt_url });

      return {
        success: true,
        receiptUrl: charge.receipt_url!,
        receiptNumber: charge.receipt_number!,
      };
    } catch (error: any) {
      logger.error('Error generating receipt', { error: error.message, paymentIntentId });
      throw new Error(`Failed to generate receipt: ${error.message}`);
    }
  }

  // Private helper methods for webhook handlers

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    logger.info('Payment intent succeeded', { paymentIntentId: paymentIntent.id });

    await prisma.payment.updateMany({
      where: { stripePaymentId: paymentIntent.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    // TODO: Send payment success email
    // TODO: Grant course access if applicable
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    logger.info('Payment intent failed', { paymentIntentId: paymentIntent.id });

    await prisma.payment.updateMany({
      where: { stripePaymentId: paymentIntent.id },
      data: { status: 'FAILED' },
    });

    // TODO: Send payment failed email
  }

  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    logger.info('Charge refunded', { chargeId: charge.id });

    await prisma.payment.updateMany({
      where: { stripePaymentId: charge.payment_intent as string },
      data: { status: 'REFUNDED' },
    });

    // TODO: Send refund confirmation email
  }

  private async handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
    logger.warn('Dispute created', { disputeId: dispute.id, reason: dispute.reason });

    // TODO: Notify admin about dispute
    // TODO: Prepare evidence automatically if possible
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Subscription updated', { subscriptionId: subscription.id });

    // TODO: Update subscription record in database
    // TODO: Send subscription update email
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Subscription deleted', { subscriptionId: subscription.id });

    // TODO: Update subscription record in database
    // TODO: Send subscription cancellation email
    // TODO: Revoke access if applicable
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    logger.info('Invoice paid', { invoiceId: invoice.id });

    // TODO: Send invoice paid confirmation email
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    logger.warn('Invoice payment failed', { invoiceId: invoice.id });

    // TODO: Send payment failed email
    // TODO: Retry payment or suspend service
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(request: CreateCustomerRequest): Promise<CustomerResponse> {
    try {
      const customer = await this.stripe.customers.create({
        email: request.email,
        name: request.name,
        phone: request.phone,
        metadata: {
          userId: request.userId,
          ...request.metadata,
        },
      });

      // Update user with customer ID
      await prisma.user.update({
        where: { id: request.userId },
        data: { scrollGoldWallet: customer.id },
      });

      return {
        success: true,
        customerId: customer.id,
        email: customer.email!,
        name: customer.name!,
      };
    } catch (error: any) {
      logger.error('Error creating customer', { error: error.message });
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(request: AttachPaymentMethodRequest): Promise<PaymentMethodInfo> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(
        request.paymentMethodId,
        { customer: request.customerId }
      );

      return {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card ? {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year,
        } : undefined,
        billingDetails: paymentMethod.billing_details as any,
      };
    } catch (error: any) {
      logger.error('Error attaching payment method', { error: error.message });
      throw new Error(`Failed to attach payment method: ${error.message}`);
    }
  }
}

export default StripePaymentService;
