/**
 * ScrollGold Billing Integration Service
 * "Store up for yourselves treasures in heaven" (Matthew 6:20)
 * 
 * Comprehensive ScrollGold economy service with billing integration including:
 * - Configurable earning rules for various activities
 * - Spending options for discounts and premium features
 * - Fraud detection and prevention
 * - Wallet management with audit trails
 * - Kingdom economics principles
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ScrollGoldEarningRule {
  id: string;
  ruleName: string;
  ruleType: 'MODULE_COMPLETION' | 'DAILY_STREAK' | 'COMMUNITY_SERVICE' | 'FAITHFUL_PAYMENT' | 'ADMIN_BESTOW';
  description: string;
  baseAmount: number;
  multiplierField?: string;
  minThreshold?: number;
  maxAmount?: number;
  isActive: boolean;
  scriptureReference?: string;
  kingdomPrinciple?: string;
}

export interface ScrollGoldSpendingOption {
  id: string;
  optionName: string;
  optionType: 'BILLING_DISCOUNT' | 'PREMIUM_FEATURE' | 'GOVERNANCE_VOTE' | 'SPECIAL_ACCESS';
  description: string;
  costAmount: number;
  discountValueCents?: number;
  maxDiscountPercentage?: number;
  conversionRate?: number;
  featureCode?: string;
  durationDays?: number;
  isAvailable: boolean;
}

export interface WalletBalance {
  userId: string;
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  totalModuleCompletions: number;
  totalStreakDays: number;
  totalCommunityServiceHours: number;
  totalFaithfulPayments: number;
  isFrozen: boolean;
}

export interface EarningEvent {
  userId: string;
  eventType: string;
  earningRuleId: string;
  amountEarned: number;
  courseId?: string;
  moduleId?: string;
  scorePercentage?: number;
  streakDays?: number;
  requiresVerification: boolean;
}

export interface SpendingRequest {
  userId: string;
  spendingOptionId: string;
  amount: number;
  subscriptionId?: string;
  invoiceId?: string;
}

export interface DiscountApplication {
  scrollGoldAmount: number;
  discountValueCents: number;
  remainingBalance: number;
  maxDiscountReached: boolean;
}

// ============================================================================
// SCROLLGOLD BILLING SERVICE
// ============================================================================

export class ScrollGoldBillingService {
  /**
   * Get user's wallet balance with comprehensive stats
   */
  async getWalletBalance(userId: string): Promise<WalletBalance> {
    try {
      const wallet = await prisma.$queryRaw<WalletBalance[]>`
        SELECT 
          user_id as "userId",
          current_balance as "currentBalance",
          lifetime_earned as "lifetimeEarned",
          lifetime_spent as "lifetimeSpent",
          total_module_completions as "totalModuleCompletions",
          total_streak_days as "totalStreakDays",
          total_community_service_hours as "totalCommunityServiceHours",
          total_faithful_payments as "totalFaithfulPayments",
          is_frozen as "isFrozen"
        FROM scrollgold_wallet_balances
        WHERE user_id = ${userId}::uuid
      `;

      if (!wallet || wallet.length === 0) {
        // Initialize wallet if it doesn't exist
        await this.initializeWallet(userId);
        return this.getWalletBalance(userId);
      }

      return wallet[0];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get wallet balance', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Initialize wallet for new user
   */
  private async initializeWallet(userId: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO scrollgold_wallet_balances (user_id)
        VALUES (${userId}::uuid)
        ON CONFLICT (user_id) DO NOTHING
      `;

      logger.info('Initialized ScrollGold wallet', { userId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to initialize wallet', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Award ScrollGold for module completion (80%+ score = 50 ScrollGold)
   */
  async awardModuleCompletion(
    userId: string,
    moduleId: string,
    courseId: string,
    scorePercentage: number
  ): Promise<{ success: boolean; amountEarned: number; message: string }> {
    try {
      // Get earning rule
      const rule = await prisma.$queryRaw<ScrollGoldEarningRule[]>`
        SELECT * FROM scrollgold_earning_rules
        WHERE rule_type = 'MODULE_COMPLETION' AND is_active = true
        LIMIT 1
      `;

      if (!rule || rule.length === 0) {
        return { success: false, amountEarned: 0, message: 'Earning rule not configured' };
      }

      const earningRule = rule[0];

      // Check if score meets threshold
      if (scorePercentage < (earningRule.minThreshold || 80)) {
        return {
          success: false,
          amountEarned: 0,
          message: `Score must be ${earningRule.minThreshold}% or higher to earn ScrollGold`
        };
      }

      // Calculate amount (base amount for meeting threshold)
      const amountEarned = earningRule.baseAmount;

      // Create earning event
      const eventId = await this.createEarningEvent({
        userId,
        eventType: 'MODULE_COMPLETION',
        earningRuleId: earningRule.id,
        amountEarned,
        courseId,
        moduleId,
        scorePercentage,
        requiresVerification: false
      });

      // Update wallet stats
      await prisma.$executeRaw`
        UPDATE scrollgold_wallet_balances
        SET total_module_completions = total_module_completions + 1
        WHERE user_id = ${userId}::uuid
      `;

      logger.info('Awarded ScrollGold for module completion', {
        userId,
        moduleId,
        scorePercentage,
        amountEarned
      });

      return {
        success: true,
        amountEarned,
        message: `Congratulations! You earned ${amountEarned} ScrollGold for completing this module with ${scorePercentage}% score.`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to award module completion', { userId, moduleId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Award ScrollGold for daily streak
   */
  async awardDailyStreak(
    userId: string,
    streakDays: number
  ): Promise<{ success: boolean; amountEarned: number }> {
    try {
      const rule = await prisma.$queryRaw<ScrollGoldEarningRule[]>`
        SELECT * FROM scrollgold_earning_rules
        WHERE rule_type = 'DAILY_STREAK' AND is_active = true
        LIMIT 1
      `;

      if (!rule || rule.length === 0) {
        return { success: false, amountEarned: 0 };
      }

      const earningRule = rule[0];
      const amountEarned = Math.min(
        earningRule.baseAmount * streakDays,
        earningRule.maxAmount || 50
      );

      await this.createEarningEvent({
        userId,
        eventType: 'DAILY_STREAK',
        earningRuleId: earningRule.id,
        amountEarned,
        streakDays,
        requiresVerification: false
      });

      await prisma.$executeRaw`
        UPDATE scrollgold_wallet_balances
        SET total_streak_days = ${streakDays}
        WHERE user_id = ${userId}::uuid
      `;

      logger.info('Awarded ScrollGold for daily streak', { userId, streakDays, amountEarned });

      return { success: true, amountEarned };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to award daily streak', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Award ScrollGold for faithful payment (20 ScrollGold per recurring payment)
   */
  async awardFaithfulPayment(
    userId: string,
    subscriptionId: string,
    paymentId: string
  ): Promise<{ success: boolean; amountEarned: number }> {
    try {
      const rule = await prisma.$queryRaw<ScrollGoldEarningRule[]>`
        SELECT * FROM scrollgold_earning_rules
        WHERE rule_type = 'FAITHFUL_PAYMENT' AND is_active = true
        LIMIT 1
      `;

      if (!rule || rule.length === 0) {
        return { success: false, amountEarned: 0 };
      }

      const earningRule = rule[0];
      const amountEarned = earningRule.baseAmount;

      // Create earning event
      await this.createEarningEvent({
        userId,
        eventType: 'FAITHFUL_PAYMENT',
        earningRuleId: earningRule.id,
        amountEarned,
        requiresVerification: false
      });

      // Create transaction linked to payment
      await prisma.$executeRaw`
        INSERT INTO scrollgold_transactions (
          user_id, transaction_type, amount, description,
          earning_rule_id, billing_related, subscription_id, payment_id
        )
        VALUES (
          ${userId}::uuid, 'EARNED', ${amountEarned},
          'Faithful payment bonus',
          ${earningRule.id}::uuid, true, ${subscriptionId}::uuid, ${paymentId}::uuid
        )
      `;

      // Update wallet stats
      await prisma.$executeRaw`
        UPDATE scrollgold_wallet_balances
        SET total_faithful_payments = total_faithful_payments + 1
        WHERE user_id = ${userId}::uuid
      `;

      logger.info('Awarded ScrollGold for faithful payment', {
        userId,
        subscriptionId,
        amountEarned
      });

      return { success: true, amountEarned };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to award faithful payment', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Bestow ScrollGold (admin honor-based awards)
   */
  async bestowScrollGold(
    userId: string,
    amount: number,
    reason: string,
    adminId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validate amount
      if (amount <= 0 || amount > 1000) {
        return {
          success: false,
          message: 'Amount must be between 1 and 1000 ScrollGold'
        };
      }

      const rule = await prisma.$queryRaw<ScrollGoldEarningRule[]>`
        SELECT * FROM scrollgold_earning_rules
        WHERE rule_type = 'ADMIN_BESTOW' AND is_active = true
        LIMIT 1
      `;

      if (!rule || rule.length === 0) {
        return { success: false, message: 'Admin bestowment not configured' };
      }

      const earningRule = rule[0];

      // Create earning event with manual verification
      await prisma.$executeRaw`
        INSERT INTO scrollgold_earning_events (
          user_id, event_type, earning_rule_id, amount_earned,
          requires_verification, verification_status, verified_by, verified_at
        )
        VALUES (
          ${userId}::uuid, 'ADMIN_BESTOW', ${earningRule.id}::uuid, ${amount},
          true, 'MANUAL_APPROVED', ${adminId}::uuid, NOW()
        )
      `;

      // Create transaction
      await prisma.$executeRaw`
        INSERT INTO scrollgold_transactions (
          user_id, transaction_type, amount, description,
          earning_rule_id, verified_by
        )
        VALUES (
          ${userId}::uuid, 'EARNED', ${amount}, ${reason},
          ${earningRule.id}::uuid, ${adminId}::uuid
        )
      `;

      logger.info('Bestowed ScrollGold', { userId, amount, reason, adminId });

      return {
        success: true,
        message: `Successfully bestowed ${amount} ScrollGold to user`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to bestow ScrollGold', { userId, amount, error: errorMessage });
      throw error;
    }
  }

  /**
   * Apply ScrollGold discount to billing (100 ScrollGold = €5, max 50%)
   * Validates: Requirements 11.4
   */
  async applyScrollGoldDiscount(
    userId: string,
    invoiceAmountCents: number,
    scrollGoldToSpend: number
  ): Promise<DiscountApplication> {
    try {
      // Validate inputs
      if (invoiceAmountCents <= 0) {
        throw new Error('Invoice amount must be greater than 0');
      }

      if (scrollGoldToSpend <= 0) {
        throw new Error('ScrollGold amount must be greater than 0');
      }

      // Get wallet balance
      const wallet = await this.getWalletBalance(userId);

      if (wallet.isFrozen) {
        throw new Error('Wallet is frozen due to suspicious activity');
      }

      if (wallet.currentBalance < scrollGoldToSpend) {
        throw new Error(`Insufficient ScrollGold balance. Available: ${wallet.currentBalance}, Requested: ${scrollGoldToSpend}`);
      }

      // Get spending option configuration
      const option = await prisma.$queryRaw<ScrollGoldSpendingOption[]>`
        SELECT * FROM scrollgold_spending_options
        WHERE option_type = 'BILLING_DISCOUNT' AND is_available = true
        LIMIT 1
      `;

      if (!option || option.length === 0) {
        throw new Error('Billing discount not configured');
      }

      const spendingOption = option[0];
      const conversionRate = spendingOption.conversionRate || 100; // 100 ScrollGold = 500 cents (€5)
      const discountValuePerUnit = spendingOption.discountValueCents || 500; // €5.00 per 100 ScrollGold

      // Calculate maximum allowed discount (50% of invoice)
      const maxDiscountPercentage = spendingOption.maxDiscountPercentage || 50;
      const maxDiscountCents = Math.floor((invoiceAmountCents * maxDiscountPercentage) / 100);

      // Calculate requested discount based on ScrollGold amount
      const requestedDiscountCents = Math.floor(
        (scrollGoldToSpend / conversionRate) * discountValuePerUnit
      );

      // Apply the lower of requested or maximum allowed
      const actualDiscountCents = Math.min(requestedDiscountCents, maxDiscountCents);

      // Calculate actual ScrollGold to be spent (may be less if max discount reached)
      const actualScrollGoldSpent = Math.floor(
        (actualDiscountCents / discountValuePerUnit) * conversionRate
      );

      const maxDiscountReached = actualDiscountCents < requestedDiscountCents;

      // Log the discount calculation
      logger.info('ScrollGold discount calculated', {
        userId,
        invoiceAmountCents,
        scrollGoldToSpend,
        actualScrollGoldSpent,
        actualDiscountCents,
        maxDiscountReached,
        remainingBalance: wallet.currentBalance - actualScrollGoldSpent
      });

      return {
        scrollGoldAmount: actualScrollGoldSpent,
        discountValueCents: actualDiscountCents,
        remainingBalance: wallet.currentBalance - actualScrollGoldSpent,
        maxDiscountReached
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to apply ScrollGold discount', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Calculate maximum ScrollGold discount for an invoice
   * Helper function to show users how much they can save
   */
  async calculateMaxScrollGoldDiscount(
    userId: string,
    invoiceAmountCents: number
  ): Promise<{
    maxScrollGoldUsable: number;
    maxDiscountCents: number;
    userBalance: number;
    canAfford: boolean;
  }> {
    try {
      const wallet = await this.getWalletBalance(userId);

      const option = await prisma.$queryRaw<ScrollGoldSpendingOption[]>`
        SELECT * FROM scrollgold_spending_options
        WHERE option_type = 'BILLING_DISCOUNT' AND is_available = true
        LIMIT 1
      `;

      if (!option || option.length === 0) {
        return {
          maxScrollGoldUsable: 0,
          maxDiscountCents: 0,
          userBalance: wallet.currentBalance,
          canAfford: false
        };
      }

      const spendingOption = option[0];
      const conversionRate = spendingOption.conversionRate || 100;
      const discountValuePerUnit = spendingOption.discountValueCents || 500;
      const maxDiscountPercentage = spendingOption.maxDiscountPercentage || 50;

      // Calculate max discount allowed (50% of invoice)
      const maxDiscountCents = Math.floor((invoiceAmountCents * maxDiscountPercentage) / 100);

      // Calculate ScrollGold needed for max discount
      const maxScrollGoldUsable = Math.floor(
        (maxDiscountCents / discountValuePerUnit) * conversionRate
      );

      // Check if user can afford it
      const canAfford = wallet.currentBalance >= maxScrollGoldUsable;

      return {
        maxScrollGoldUsable,
        maxDiscountCents,
        userBalance: wallet.currentBalance,
        canAfford
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to calculate max ScrollGold discount', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Process ScrollGold spending
   */
  async spendScrollGold(request: SpendingRequest): Promise<{ success: boolean; message: string }> {
    try {
      const { userId, spendingOptionId, amount, subscriptionId, invoiceId } = request;

      // Verify balance
      const wallet = await this.getWalletBalance(userId);
      if (wallet.currentBalance < amount) {
        return { success: false, message: 'Insufficient ScrollGold balance' };
      }

      // Get spending option
      const option = await prisma.$queryRaw<ScrollGoldSpendingOption[]>`
        SELECT * FROM scrollgold_spending_options
        WHERE id = ${spendingOptionId}::uuid AND is_available = true
      `;

      if (!option || option.length === 0) {
        return { success: false, message: 'Spending option not available' };
      }

      // Create transaction
      await prisma.$executeRaw`
        INSERT INTO scrollgold_transactions (
          user_id, transaction_type, amount, description,
          spending_option_id, billing_related, subscription_id, invoice_id
        )
        VALUES (
          ${userId}::uuid, 'SPENT', ${amount}, ${option[0].description},
          ${spendingOptionId}::uuid, true, ${subscriptionId}::uuid, ${invoiceId}::uuid
        )
      `;

      // Record usage history
      await prisma.$executeRaw`
        INSERT INTO scrollgold_usage_history (
          user_id, usage_type, amount_spent, spending_option_id,
          subscription_id, invoice_id
        )
        VALUES (
          ${userId}::uuid, ${option[0].optionType}, ${amount}, ${spendingOptionId}::uuid,
          ${subscriptionId}::uuid, ${invoiceId}::uuid
        )
      `;

      logger.info('ScrollGold spent successfully', { userId, amount, spendingOptionId });

      return { success: true, message: 'ScrollGold spent successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to spend ScrollGold', { userId: request.userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Unlock premium AI lab hours with ScrollGold (100 ScrollGold = 1 hour)
   * Validates: Requirements 11.4
   */
  async unlockPremiumAILabHours(
    userId: string,
    hours: number
  ): Promise<{ success: boolean; message: string; expiresAt?: Date }> {
    try {
      if (hours <= 0 || hours > 100) {
        return { success: false, message: 'Hours must be between 1 and 100' };
      }

      // Get spending option for AI lab hours
      const option = await prisma.$queryRaw<ScrollGoldSpendingOption[]>`
        SELECT * FROM scrollgold_spending_options
        WHERE option_type = 'PREMIUM_FEATURE' 
          AND feature_code = 'AI_LAB_HOURS'
          AND is_available = true
        LIMIT 1
      `;

      if (!option || option.length === 0) {
        return { success: false, message: 'AI lab hours feature not available' };
      }

      const spendingOption = option[0];
      const costPerHour = spendingOption.costAmount; // 100 ScrollGold per hour
      const totalCost = costPerHour * hours;

      // Check balance
      const wallet = await this.getWalletBalance(userId);
      if (wallet.currentBalance < totalCost) {
        return {
          success: false,
          message: `Insufficient ScrollGold. Need ${totalCost}, have ${wallet.currentBalance}`
        };
      }

      // Calculate expiration (default 30 days)
      const durationDays = spendingOption.durationDays || 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      // Create transaction
      await prisma.$executeRaw`
        INSERT INTO scrollgold_transactions (
          user_id, transaction_type, amount, description,
          spending_option_id
        )
        VALUES (
          ${userId}::uuid, 'SPENT', ${totalCost},
          'Unlocked ${hours} premium AI lab hours',
          ${spendingOption.id}::uuid
        )
      `;

      // Grant feature access
      await prisma.$executeRaw`
        INSERT INTO scrollgold_feature_access (
          user_id, feature_code, hours_granted, expires_at
        )
        VALUES (
          ${userId}::uuid, 'AI_LAB_HOURS', ${hours}, ${expiresAt}
        )
        ON CONFLICT (user_id, feature_code)
        DO UPDATE SET
          hours_granted = scrollgold_feature_access.hours_granted + ${hours},
          expires_at = GREATEST(scrollgold_feature_access.expires_at, ${expiresAt}),
          updated_at = NOW()
      `;

      logger.info('Unlocked premium AI lab hours', { userId, hours, totalCost, expiresAt });

      return {
        success: true,
        message: `Successfully unlocked ${hours} premium AI lab hours`,
        expiresAt
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to unlock AI lab hours', { userId, hours, error: errorMessage });
      throw error;
    }
  }

  /**
   * Unlock mentorship circle access with ScrollGold (500 ScrollGold per month)
   * Validates: Requirements 11.4
   */
  async unlockMentorshipCircle(
    userId: string,
    months: number = 1
  ): Promise<{ success: boolean; message: string; expiresAt?: Date }> {
    try {
      if (months <= 0 || months > 12) {
        return { success: false, message: 'Months must be between 1 and 12' };
      }

      // Get spending option for mentorship circles
      const option = await prisma.$queryRaw<ScrollGoldSpendingOption[]>`
        SELECT * FROM scrollgold_spending_options
        WHERE option_type = 'PREMIUM_FEATURE' 
          AND feature_code = 'MENTORSHIP_CIRCLE'
          AND is_available = true
        LIMIT 1
      `;

      if (!option || option.length === 0) {
        return { success: false, message: 'Mentorship circle feature not available' };
      }

      const spendingOption = option[0];
      const costPerMonth = spendingOption.costAmount; // 500 ScrollGold per month
      const totalCost = costPerMonth * months;

      // Check balance
      const wallet = await this.getWalletBalance(userId);
      if (wallet.currentBalance < totalCost) {
        return {
          success: false,
          message: `Insufficient ScrollGold. Need ${totalCost}, have ${wallet.currentBalance}`
        };
      }

      // Calculate expiration
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);

      // Create transaction
      await prisma.$executeRaw`
        INSERT INTO scrollgold_transactions (
          user_id, transaction_type, amount, description,
          spending_option_id
        )
        VALUES (
          ${userId}::uuid, 'SPENT', ${totalCost},
          'Unlocked mentorship circle access for ${months} month(s)',
          ${spendingOption.id}::uuid
        )
      `;

      // Grant feature access
      await prisma.$executeRaw`
        INSERT INTO scrollgold_feature_access (
          user_id, feature_code, expires_at
        )
        VALUES (
          ${userId}::uuid, 'MENTORSHIP_CIRCLE', ${expiresAt}
        )
        ON CONFLICT (user_id, feature_code)
        DO UPDATE SET
          expires_at = GREATEST(scrollgold_feature_access.expires_at, ${expiresAt}),
          updated_at = NOW()
      `;

      logger.info('Unlocked mentorship circle', { userId, months, totalCost, expiresAt });

      return {
        success: true,
        message: `Successfully unlocked mentorship circle access for ${months} month(s)`,
        expiresAt
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to unlock mentorship circle', { userId, months, error: errorMessage });
      throw error;
    }
  }

  /**
   * Check if user has access to a premium feature
   */
  async checkFeatureAccess(
    userId: string,
    featureCode: string
  ): Promise<{ hasAccess: boolean; expiresAt?: Date; hoursRemaining?: number }> {
    try {
      const access = await prisma.$queryRaw<any[]>`
        SELECT 
          expires_at as "expiresAt",
          hours_granted as "hoursGranted",
          hours_used as "hoursUsed"
        FROM scrollgold_feature_access
        WHERE user_id = ${userId}::uuid
          AND feature_code = ${featureCode}
          AND (expires_at IS NULL OR expires_at > NOW())
        LIMIT 1
      `;

      if (!access || access.length === 0) {
        return { hasAccess: false };
      }

      const feature = access[0];
      const hoursRemaining = feature.hoursGranted 
        ? feature.hoursGranted - (feature.hoursUsed || 0)
        : undefined;

      return {
        hasAccess: true,
        expiresAt: feature.expiresAt,
        hoursRemaining
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to check feature access', { userId, featureCode, error: errorMessage });
      throw error;
    }
  }

  /**
   * Use premium feature hours (for AI lab hours tracking)
   */
  async useFeatureHours(
    userId: string,
    featureCode: string,
    hoursUsed: number
  ): Promise<{ success: boolean; hoursRemaining: number }> {
    try {
      const access = await this.checkFeatureAccess(userId, featureCode);

      if (!access.hasAccess) {
        throw new Error('No access to this feature');
      }

      if (access.hoursRemaining !== undefined && access.hoursRemaining < hoursUsed) {
        throw new Error(`Insufficient hours. Available: ${access.hoursRemaining}, Requested: ${hoursUsed}`);
      }

      // Update hours used
      await prisma.$executeRaw`
        UPDATE scrollgold_feature_access
        SET hours_used = hours_used + ${hoursUsed},
            updated_at = NOW()
        WHERE user_id = ${userId}::uuid
          AND feature_code = ${featureCode}
      `;

      const newRemaining = (access.hoursRemaining || 0) - hoursUsed;

      logger.info('Used feature hours', { userId, featureCode, hoursUsed, hoursRemaining: newRemaining });

      return { success: true, hoursRemaining: newRemaining };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to use feature hours', { userId, featureCode, error: errorMessage });
      throw error;
    }
  }

  /**
   * Purchase governance vote weight with ScrollGold (50 ScrollGold per vote)
   * Validates: Requirements 11.4
   */
  async purchaseGovernanceVotes(
    userId: string,
    voteCount: number,
    proposalId?: string
  ): Promise<{ success: boolean; message: string; totalVotes: number }> {
    try {
      if (voteCount <= 0 || voteCount > 100) {
        return { success: false, message: 'Vote count must be between 1 and 100', totalVotes: 0 };
      }

      // Get spending option for governance votes
      const option = await prisma.$queryRaw<ScrollGoldSpendingOption[]>`
        SELECT * FROM scrollgold_spending_options
        WHERE option_type = 'GOVERNANCE_VOTE' 
          AND is_available = true
        LIMIT 1
      `;

      if (!option || option.length === 0) {
        return { success: false, message: 'Governance voting not available', totalVotes: 0 };
      }

      const spendingOption = option[0];
      const costPerVote = spendingOption.costAmount; // 50 ScrollGold per vote
      const totalCost = costPerVote * voteCount;

      // Check balance
      const wallet = await this.getWalletBalance(userId);
      if (wallet.currentBalance < totalCost) {
        return {
          success: false,
          message: `Insufficient ScrollGold. Need ${totalCost}, have ${wallet.currentBalance}`,
          totalVotes: 0
        };
      }

      // Create transaction
      await prisma.$executeRaw`
        INSERT INTO scrollgold_transactions (
          user_id, transaction_type, amount, description,
          spending_option_id
        )
        VALUES (
          ${userId}::uuid, 'SPENT', ${totalCost},
          'Purchased ${voteCount} governance vote(s)',
          ${spendingOption.id}::uuid
        )
      `;

      // Grant governance votes
      await prisma.$executeRaw`
        INSERT INTO scrollgold_governance_votes (
          user_id, votes_purchased, votes_remaining, proposal_id
        )
        VALUES (
          ${userId}::uuid, ${voteCount}, ${voteCount}, ${proposalId}::uuid
        )
        ON CONFLICT (user_id, proposal_id)
        DO UPDATE SET
          votes_purchased = scrollgold_governance_votes.votes_purchased + ${voteCount},
          votes_remaining = scrollgold_governance_votes.votes_remaining + ${voteCount},
          updated_at = NOW()
      `;

      // Get total votes
      const totalVotesResult = await prisma.$queryRaw<{ total: number }[]>`
        SELECT COALESCE(SUM(votes_remaining), 0) as total
        FROM scrollgold_governance_votes
        WHERE user_id = ${userId}::uuid
      `;

      const totalVotes = totalVotesResult[0]?.total || voteCount;

      logger.info('Purchased governance votes', { userId, voteCount, totalCost, proposalId });

      return {
        success: true,
        message: `Successfully purchased ${voteCount} governance vote(s)`,
        totalVotes
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to purchase governance votes', { userId, voteCount, error: errorMessage });
      throw error;
    }
  }

  /**
   * Cast governance vote (consumes purchased votes)
   */
  async castGovernanceVote(
    userId: string,
    proposalId: string,
    voteWeight: number,
    voteChoice: 'FOR' | 'AGAINST' | 'ABSTAIN'
  ): Promise<{ success: boolean; message: string; votesRemaining: number }> {
    try {
      if (voteWeight <= 0) {
        return { success: false, message: 'Vote weight must be greater than 0', votesRemaining: 0 };
      }

      // Check available votes
      const votesResult = await prisma.$queryRaw<{ votesRemaining: number }[]>`
        SELECT votes_remaining as "votesRemaining"
        FROM scrollgold_governance_votes
        WHERE user_id = ${userId}::uuid
          AND (proposal_id = ${proposalId}::uuid OR proposal_id IS NULL)
        ORDER BY proposal_id NULLS LAST
        LIMIT 1
      `;

      if (!votesResult || votesResult.length === 0) {
        return {
          success: false,
          message: 'No governance votes available. Purchase votes with ScrollGold first.',
          votesRemaining: 0
        };
      }

      const availableVotes = votesResult[0].votesRemaining;

      if (availableVotes < voteWeight) {
        return {
          success: false,
          message: `Insufficient votes. Available: ${availableVotes}, Requested: ${voteWeight}`,
          votesRemaining: availableVotes
        };
      }

      // Deduct votes
      await prisma.$executeRaw`
        UPDATE scrollgold_governance_votes
        SET votes_remaining = votes_remaining - ${voteWeight},
            votes_used = votes_used + ${voteWeight},
            updated_at = NOW()
        WHERE user_id = ${userId}::uuid
          AND (proposal_id = ${proposalId}::uuid OR proposal_id IS NULL)
      `;

      // Record the vote
      await prisma.$executeRaw`
        INSERT INTO governance_vote_records (
          user_id, proposal_id, vote_weight, vote_choice
        )
        VALUES (
          ${userId}::uuid, ${proposalId}::uuid, ${voteWeight}, ${voteChoice}
        )
      `;

      const newRemaining = availableVotes - voteWeight;

      logger.info('Cast governance vote', { userId, proposalId, voteWeight, voteChoice, votesRemaining: newRemaining });

      return {
        success: true,
        message: `Successfully cast ${voteWeight} vote(s) ${voteChoice}`,
        votesRemaining: newRemaining
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to cast governance vote', { userId, proposalId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Get user's governance voting power
   */
  async getGovernanceVotingPower(
    userId: string,
    proposalId?: string
  ): Promise<{
    totalVotesPurchased: number;
    votesRemaining: number;
    votesUsed: number;
    canVote: boolean;
  }> {
    try {
      const result = await prisma.$queryRaw<any[]>`
        SELECT 
          COALESCE(SUM(votes_purchased), 0) as "totalVotesPurchased",
          COALESCE(SUM(votes_remaining), 0) as "votesRemaining",
          COALESCE(SUM(votes_used), 0) as "votesUsed"
        FROM scrollgold_governance_votes
        WHERE user_id = ${userId}::uuid
          AND (${proposalId}::uuid IS NULL OR proposal_id = ${proposalId}::uuid OR proposal_id IS NULL)
      `;

      const votingPower = result[0] || {
        totalVotesPurchased: 0,
        votesRemaining: 0,
        votesUsed: 0
      };

      return {
        ...votingPower,
        canVote: votingPower.votesRemaining > 0
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get governance voting power', { userId, proposalId, error: errorMessage });
      throw error;
    }
  }

  // ============================================================================
  // TRANSACTION VALIDATION AND FRAUD PREVENTION
  // Validates: Requirements 11.5, 18.4
  // ============================================================================

  /**
   * Validate transaction before processing
   */
  async validateTransaction(
    userId: string,
    transactionType: 'EARN' | 'SPEND',
    amount: number,
    context: {
      eventType?: string;
      spendingOptionId?: string;
      moduleId?: string;
      courseId?: string;
    }
  ): Promise<{ valid: boolean; reason?: string; riskScore: number }> {
    try {
      // Basic validation
      if (amount <= 0) {
        return { valid: false, reason: 'Amount must be greater than 0', riskScore: 0 };
      }

      if (amount > 10000) {
        return { valid: false, reason: 'Amount exceeds maximum allowed (10,000)', riskScore: 100 };
      }

      // Check if wallet is frozen
      const wallet = await this.getWalletBalance(userId);
      if (wallet.isFrozen) {
        return { valid: false, reason: 'Wallet is frozen due to suspicious activity', riskScore: 100 };
      }

      // Calculate risk score
      const riskScore = await this.calculateTransactionRiskScore(userId, transactionType, amount, context);

      // High risk threshold
      if (riskScore >= 80) {
        // Flag for manual review
        await this.flagTransactionForReview(userId, transactionType, amount, riskScore, context);
        return { valid: false, reason: 'Transaction flagged for manual review', riskScore };
      }

      // Medium risk - allow but log
      if (riskScore >= 50) {
        logger.warn('Medium risk transaction', { userId, transactionType, amount, riskScore, context });
      }

      return { valid: true, riskScore };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to validate transaction', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Calculate transaction risk score (0-100)
   */
  private async calculateTransactionRiskScore(
    userId: string,
    transactionType: 'EARN' | 'SPEND',
    amount: number,
    context: any
  ): Promise<number> {
    let riskScore = 0;

    try {
      // Check transaction velocity (transactions in last hour)
      const recentTransactions = await prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*) as count
        FROM scrollgold_transactions
        WHERE user_id = ${userId}::uuid
          AND created_at > NOW() - INTERVAL '1 hour'
      `;

      const transactionCount = recentTransactions[0]?.count || 0;

      // High velocity risk
      if (transactionCount > 20) {
        riskScore += 40;
      } else if (transactionCount > 10) {
        riskScore += 20;
      }

      // Check amount anomaly (compared to user's average)
      const avgTransaction = await prisma.$queryRaw<{ avg: number }[]>`
        SELECT AVG(amount) as avg
        FROM scrollgold_transactions
        WHERE user_id = ${userId}::uuid
          AND transaction_type = ${transactionType}
      `;

      const avgAmount = avgTransaction[0]?.avg || 0;

      if (avgAmount > 0 && amount > avgAmount * 5) {
        riskScore += 30; // Amount is 5x higher than average
      } else if (avgAmount > 0 && amount > avgAmount * 3) {
        riskScore += 15;
      }

      // Check for duplicate earning events (same module within 1 hour)
      if (transactionType === 'EARN' && context.moduleId) {
        const duplicateCheck = await prisma.$queryRaw<{ count: number }[]>`
          SELECT COUNT(*) as count
          FROM scrollgold_earning_events
          WHERE user_id = ${userId}::uuid
            AND module_id = ${context.moduleId}::uuid
            AND created_at > NOW() - INTERVAL '1 hour'
        `;

        if (duplicateCheck[0]?.count > 0) {
          riskScore += 50; // Likely duplicate submission
        }
      }

      // Check account age (new accounts are higher risk)
      const accountAge = await prisma.$queryRaw<{ days: number }[]>`
        SELECT EXTRACT(DAY FROM NOW() - created_at) as days
        FROM scrollgold_wallet_balances
        WHERE user_id = ${userId}::uuid
      `;

      const accountDays = accountAge[0]?.days || 0;

      if (accountDays < 1) {
        riskScore += 20; // Very new account
      } else if (accountDays < 7) {
        riskScore += 10; // New account
      }

      // Cap at 100
      return Math.min(riskScore, 100);
    } catch (error) {
      logger.error('Failed to calculate risk score', { userId, error });
      return 50; // Default medium risk on error
    }
  }

  /**
   * Flag transaction for manual review
   */
  private async flagTransactionForReview(
    userId: string,
    transactionType: string,
    amount: number,
    riskScore: number,
    context: any
  ): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO scrollgold_fraud_alerts (
          user_id, alert_type, risk_score, transaction_type,
          amount, context, status
        )
        VALUES (
          ${userId}::uuid, 'HIGH_RISK_TRANSACTION', ${riskScore},
          ${transactionType}, ${amount}, ${JSON.stringify(context)}::jsonb,
          'PENDING_REVIEW'
        )
      `;

      logger.warn('Transaction flagged for review', { userId, transactionType, amount, riskScore });
    } catch (error) {
      logger.error('Failed to flag transaction', { userId, error });
    }
  }

  /**
   * Check for suspicious patterns
   */
  async detectSuspiciousActivity(userId: string): Promise<{
    isSuspicious: boolean;
    patterns: string[];
    recommendFreeze: boolean;
  }> {
    try {
      const patterns: string[] = [];
      let suspicionScore = 0;

      // Pattern 1: Rapid earning and immediate spending
      const rapidCycle = await prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*) as count
        FROM (
          SELECT 
            user_id,
            LAG(transaction_type) OVER (ORDER BY created_at) as prev_type,
            transaction_type,
            created_at - LAG(created_at) OVER (ORDER BY created_at) as time_diff
          FROM scrollgold_transactions
          WHERE user_id = ${userId}::uuid
            AND created_at > NOW() - INTERVAL '24 hours'
        ) t
        WHERE prev_type = 'EARNED' 
          AND transaction_type = 'SPENT'
          AND time_diff < INTERVAL '5 minutes'
      `;

      if (rapidCycle[0]?.count > 5) {
        patterns.push('Rapid earn-spend cycle detected');
        suspicionScore += 30;
      }

      // Pattern 2: Unusual earning rate
      const earningRate = await prisma.$queryRaw<{ total: number; count: number }[]>`
        SELECT 
          COALESCE(SUM(amount), 0) as total,
          COUNT(*) as count
        FROM scrollgold_transactions
        WHERE user_id = ${userId}::uuid
          AND transaction_type = 'EARNED'
          AND created_at > NOW() - INTERVAL '24 hours'
      `;

      const dailyEarnings = earningRate[0]?.total || 0;
      const earningCount = earningRate[0]?.count || 0;

      if (dailyEarnings > 5000) {
        patterns.push('Unusually high daily earnings');
        suspicionScore += 40;
      }

      if (earningCount > 50) {
        patterns.push('Excessive earning events');
        suspicionScore += 30;
      }

      // Pattern 3: Balance manipulation attempts
      const negativeAttempts = await prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*) as count
        FROM scrollgold_fraud_alerts
        WHERE user_id = ${userId}::uuid
          AND alert_type IN ('NEGATIVE_BALANCE_ATTEMPT', 'INVALID_TRANSACTION')
          AND created_at > NOW() - INTERVAL '7 days'
      `;

      if (negativeAttempts[0]?.count > 0) {
        patterns.push('Balance manipulation attempts detected');
        suspicionScore += 50;
      }

      const isSuspicious = suspicionScore >= 50;
      const recommendFreeze = suspicionScore >= 80;

      if (isSuspicious) {
        logger.warn('Suspicious activity detected', { userId, patterns, suspicionScore });

        // Create alert
        await prisma.$executeRaw`
          INSERT INTO scrollgold_fraud_alerts (
            user_id, alert_type, risk_score, context, status
          )
          VALUES (
            ${userId}::uuid, 'SUSPICIOUS_PATTERN', ${suspicionScore},
            ${JSON.stringify({ patterns })}::jsonb, 'PENDING_REVIEW'
          )
        `;
      }

      return { isSuspicious, patterns, recommendFreeze };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to detect suspicious activity', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Freeze wallet due to suspicious activity
   */
  async freezeWallet(
    userId: string,
    reason: string,
    adminId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.$executeRaw`
        UPDATE scrollgold_wallet_balances
        SET is_frozen = true,
            freeze_reason = ${reason},
            frozen_at = NOW(),
            frozen_by = ${adminId}::uuid
        WHERE user_id = ${userId}::uuid
      `;

      // Create alert
      await prisma.$executeRaw`
        INSERT INTO scrollgold_fraud_alerts (
          user_id, alert_type, context, status, reviewed_by
        )
        VALUES (
          ${userId}::uuid, 'WALLET_FROZEN',
          ${JSON.stringify({ reason })}::jsonb, 'RESOLVED', ${adminId}::uuid
        )
      `;

      logger.warn('Wallet frozen', { userId, reason, adminId });

      return { success: true, message: 'Wallet frozen successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to freeze wallet', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Unfreeze wallet after review
   */
  async unfreezeWallet(
    userId: string,
    adminId: string,
    notes: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.$executeRaw`
        UPDATE scrollgold_wallet_balances
        SET is_frozen = false,
            freeze_reason = NULL,
            frozen_at = NULL,
            frozen_by = NULL,
            unfrozen_at = NOW(),
            unfrozen_by = ${adminId}::uuid
        WHERE user_id = ${userId}::uuid
      `;

      // Log the unfreeze
      await prisma.$executeRaw`
        INSERT INTO scrollgold_fraud_alerts (
          user_id, alert_type, context, status, reviewed_by
        )
        VALUES (
          ${userId}::uuid, 'WALLET_UNFROZEN',
          ${JSON.stringify({ notes })}::jsonb, 'RESOLVED', ${adminId}::uuid
        )
      `;

      logger.info('Wallet unfrozen', { userId, adminId, notes });

      return { success: true, message: 'Wallet unfrozen successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to unfreeze wallet', { userId, error: errorMessage });
      throw error;
    }
  }

  // ============================================================================
  // BALANCE MANIPULATION DETECTION
  // Validates: Requirements 11.5, 18.4
  // ============================================================================

  /**
   * Verify wallet balance integrity
   * Ensures balance matches sum of transactions
   */
  async verifyBalanceIntegrity(userId: string): Promise<{
    isValid: boolean;
    currentBalance: number;
    calculatedBalance: number;
    discrepancy: number;
    requiresCorrection: boolean;
  }> {
    try {
      // Get current balance
      const wallet = await this.getWalletBalance(userId);

      // Calculate balance from transactions
      const calculatedResult = await prisma.$queryRaw<{ balance: number }[]>`
        SELECT 
          COALESCE(
            SUM(CASE WHEN transaction_type = 'EARNED' THEN amount ELSE -amount END),
            0
          ) as balance
        FROM scrollgold_transactions
        WHERE user_id = ${userId}::uuid
      `;

      const calculatedBalance = calculatedResult[0]?.balance || 0;
      const discrepancy = wallet.currentBalance - calculatedBalance;
      const isValid = Math.abs(discrepancy) < 1; // Allow for rounding errors
      const requiresCorrection = Math.abs(discrepancy) >= 10; // Significant discrepancy

      if (!isValid) {
        logger.warn('Balance integrity issue detected', {
          userId,
          currentBalance: wallet.currentBalance,
          calculatedBalance,
          discrepancy
        });

        // Create fraud alert
        await prisma.$executeRaw`
          INSERT INTO scrollgold_fraud_alerts (
            user_id, alert_type, risk_score, context, status
          )
          VALUES (
            ${userId}::uuid, 'BALANCE_DISCREPANCY', ${Math.min(Math.abs(discrepancy), 100)},
            ${JSON.stringify({ currentBalance: wallet.currentBalance, calculatedBalance, discrepancy })}::jsonb,
            'PENDING_REVIEW'
          )
        `;
      }

      return {
        isValid,
        currentBalance: wallet.currentBalance,
        calculatedBalance,
        discrepancy,
        requiresCorrection
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to verify balance integrity', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Correct balance discrepancies (admin only)
   */
  async correctBalanceDiscrepancy(
    userId: string,
    adminId: string,
    reason: string
  ): Promise<{ success: boolean; message: string; correctedAmount: number }> {
    try {
      // Verify integrity first
      const integrity = await this.verifyBalanceIntegrity(userId);

      if (integrity.isValid) {
        return {
          success: false,
          message: 'No correction needed - balance is valid',
          correctedAmount: 0
        };
      }

      // Correct the balance
      await prisma.$executeRaw`
        UPDATE scrollgold_wallet_balances
        SET current_balance = ${integrity.calculatedBalance},
            last_balance_correction = NOW(),
            last_correction_by = ${adminId}::uuid
        WHERE user_id = ${userId}::uuid
      `;

      // Log the correction
      await prisma.$executeRaw`
        INSERT INTO scrollgold_transactions (
          user_id, transaction_type, amount, description, verified_by
        )
        VALUES (
          ${userId}::uuid, 
          ${integrity.discrepancy > 0 ? 'SPENT' : 'EARNED'},
          ${Math.abs(integrity.discrepancy)},
          'Balance correction: ${reason}',
          ${adminId}::uuid
        )
      `;

      logger.info('Balance corrected', {
        userId,
        adminId,
        discrepancy: integrity.discrepancy,
        reason
      });

      return {
        success: true,
        message: 'Balance corrected successfully',
        correctedAmount: integrity.discrepancy
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to correct balance', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Detect negative balance attempts
   */
  async detectNegativeBalanceAttempts(userId: string): Promise<{
    hasAttempts: boolean;
    attemptCount: number;
    lastAttempt?: Date;
  }> {
    try {
      // Check for transactions that would result in negative balance
      const attempts = await prisma.$queryRaw<any[]>`
        WITH balance_timeline AS (
          SELECT 
            created_at,
            transaction_type,
            amount,
            SUM(CASE WHEN transaction_type = 'EARNED' THEN amount ELSE -amount END) 
              OVER (ORDER BY created_at) as running_balance
          FROM scrollgold_transactions
          WHERE user_id = ${userId}::uuid
        )
        SELECT 
          COUNT(*) as "attemptCount",
          MAX(created_at) as "lastAttempt"
        FROM balance_timeline
        WHERE running_balance < 0
      `;

      const result = attempts[0] || { attemptCount: 0, lastAttempt: null };
      const hasAttempts = result.attemptCount > 0;

      if (hasAttempts) {
        logger.warn('Negative balance attempts detected', {
          userId,
          attemptCount: result.attemptCount,
          lastAttempt: result.lastAttempt
        });

        // Create fraud alert
        await prisma.$executeRaw`
          INSERT INTO scrollgold_fraud_alerts (
            user_id, alert_type, risk_score, context, status
          )
          VALUES (
            ${userId}::uuid, 'NEGATIVE_BALANCE_ATTEMPT', 80,
            ${JSON.stringify({ attemptCount: result.attemptCount })}::jsonb,
            'PENDING_REVIEW'
          )
        `;
      }

      return {
        hasAttempts,
        attemptCount: result.attemptCount,
        lastAttempt: result.lastAttempt
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to detect negative balance attempts', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Detect duplicate transaction attempts
   */
  async detectDuplicateTransactions(userId: string): Promise<{
    hasDuplicates: boolean;
    duplicateCount: number;
    duplicateGroups: any[];
  }> {
    try {
      // Find transactions with same amount, type, and close timestamps
      const duplicates = await prisma.$queryRaw<any[]>`
        WITH duplicate_candidates AS (
          SELECT 
            t1.id as id1,
            t2.id as id2,
            t1.amount,
            t1.transaction_type as "transactionType",
            t1.created_at as "createdAt1",
            t2.created_at as "createdAt2",
            EXTRACT(EPOCH FROM (t2.created_at - t1.created_at)) as "timeDiffSeconds"
          FROM scrollgold_transactions t1
          JOIN scrollgold_transactions t2 
            ON t1.user_id = t2.user_id
            AND t1.amount = t2.amount
            AND t1.transaction_type = t2.transaction_type
            AND t1.id < t2.id
            AND t2.created_at - t1.created_at < INTERVAL '5 minutes'
          WHERE t1.user_id = ${userId}::uuid
            AND t1.created_at > NOW() - INTERVAL '30 days'
        )
        SELECT 
          COUNT(*) as "duplicateCount",
          json_agg(json_build_object(
            'amount', amount,
            'type', "transactionType",
            'timeDiff', "timeDiffSeconds"
          )) as "duplicateGroups"
        FROM duplicate_candidates
      `;

      const result = duplicates[0] || { duplicateCount: 0, duplicateGroups: [] };
      const hasDuplicates = result.duplicateCount > 0;

      if (hasDuplicates) {
        logger.warn('Duplicate transactions detected', {
          userId,
          duplicateCount: result.duplicateCount
        });

        // Create fraud alert
        await prisma.$executeRaw`
          INSERT INTO scrollgold_fraud_alerts (
            user_id, alert_type, risk_score, context, status
          )
          VALUES (
            ${userId}::uuid, 'DUPLICATE_TRANSACTIONS', 60,
            ${JSON.stringify({ duplicateCount: result.duplicateCount })}::jsonb,
            'PENDING_REVIEW'
          )
        `;
      }

      return {
        hasDuplicates,
        duplicateCount: result.duplicateCount,
        duplicateGroups: result.duplicateGroups || []
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to detect duplicate transactions', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Run comprehensive balance manipulation check
   */
  async runBalanceManipulationCheck(userId: string): Promise<{
    isClean: boolean;
    issues: string[];
    riskScore: number;
    recommendedAction: 'NONE' | 'MONITOR' | 'REVIEW' | 'FREEZE';
  }> {
    try {
      const issues: string[] = [];
      let riskScore = 0;

      // Check 1: Balance integrity
      const integrity = await this.verifyBalanceIntegrity(userId);
      if (!integrity.isValid) {
        issues.push(`Balance discrepancy: ${integrity.discrepancy} ScrollGold`);
        riskScore += Math.min(Math.abs(integrity.discrepancy), 40);
      }

      // Check 2: Negative balance attempts
      const negativeAttempts = await this.detectNegativeBalanceAttempts(userId);
      if (negativeAttempts.hasAttempts) {
        issues.push(`${negativeAttempts.attemptCount} negative balance attempt(s)`);
        riskScore += 30;
      }

      // Check 3: Duplicate transactions
      const duplicates = await this.detectDuplicateTransactions(userId);
      if (duplicates.hasDuplicates) {
        issues.push(`${duplicates.duplicateCount} duplicate transaction(s)`);
        riskScore += 20;
      }

      // Check 4: Suspicious activity patterns
      const suspicious = await this.detectSuspiciousActivity(userId);
      if (suspicious.isSuspicious) {
        issues.push(...suspicious.patterns);
        riskScore += 30;
      }

      // Determine recommended action
      let recommendedAction: 'NONE' | 'MONITOR' | 'REVIEW' | 'FREEZE' = 'NONE';
      if (riskScore >= 80 || suspicious.recommendFreeze) {
        recommendedAction = 'FREEZE';
      } else if (riskScore >= 60) {
        recommendedAction = 'REVIEW';
      } else if (riskScore >= 30) {
        recommendedAction = 'MONITOR';
      }

      const isClean = issues.length === 0;

      if (!isClean) {
        logger.warn('Balance manipulation check failed', {
          userId,
          issues,
          riskScore,
          recommendedAction
        });
      }

      return {
        isClean,
        issues,
        riskScore,
        recommendedAction
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to run balance manipulation check', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Get fraud alerts for admin review
   */
  async getFraudAlerts(
    status: 'PENDING_REVIEW' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'FALSE_POSITIVE' = 'PENDING_REVIEW',
    limit: number = 50
  ): Promise<any[]> {
    try {
      const alerts = await prisma.$queryRaw`
        SELECT 
          fa.id,
          fa.user_id as "userId",
          fa.alert_type as "alertType",
          fa.risk_score as "riskScore",
          fa.context,
          fa.status,
          fa.created_at as "createdAt",
          u.email as "userEmail",
          wb.current_balance as "currentBalance",
          wb.is_frozen as "isFrozen"
        FROM scrollgold_fraud_alerts fa
        JOIN users u ON fa.user_id = u.id
        JOIN scrollgold_wallet_balances wb ON fa.user_id = wb.user_id
        WHERE fa.status = ${status}
        ORDER BY fa.risk_score DESC, fa.created_at DESC
        LIMIT ${limit}
      ` as any[];

      return alerts;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get fraud alerts', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Resolve fraud alert
   */
  async resolveFraudAlert(
    alertId: string,
    adminId: string,
    resolution: 'RESOLVED' | 'FALSE_POSITIVE',
    notes: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.$executeRaw`
        UPDATE scrollgold_fraud_alerts
        SET status = ${resolution},
            reviewed_by = ${adminId}::uuid,
            reviewed_at = NOW(),
            resolution_notes = ${notes}
        WHERE id = ${alertId}::uuid
      `;

      logger.info('Fraud alert resolved', { alertId, adminId, resolution });

      return { success: true, message: 'Alert resolved successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to resolve fraud alert', { alertId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Get earning opportunities for student motivation
   */
  async getEarningOpportunities(userId: string): Promise<ScrollGoldEarningRule[]> {
    try {
      const rules = await prisma.$queryRaw<ScrollGoldEarningRule[]>`
        SELECT 
          id, rule_name as "ruleName", rule_type as "ruleType",
          description, base_amount as "baseAmount",
          multiplier_field as "multiplierField", min_threshold as "minThreshold",
          max_amount as "maxAmount", is_active as "isActive",
          scripture_reference as "scriptureReference",
          kingdom_principle as "kingdomPrinciple"
        FROM scrollgold_earning_rules
        WHERE is_active = true
        ORDER BY priority DESC, base_amount DESC
      `;

      return rules;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get earning opportunities', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Get spending options
   */
  async getSpendingOptions(userId: string): Promise<ScrollGoldSpendingOption[]> {
    try {
      const options = await prisma.$queryRaw<ScrollGoldSpendingOption[]>`
        SELECT 
          id, option_name as "optionName", option_type as "optionType",
          description, cost_amount as "costAmount",
          discount_value_cents as "discountValueCents",
          max_discount_percentage as "maxDiscountPercentage",
          conversion_rate as "conversionRate",
          feature_code as "featureCode", duration_days as "durationDays",
          is_available as "isAvailable"
        FROM scrollgold_spending_options
        WHERE is_available = true
        ORDER BY display_order ASC, cost_amount ASC
      `;

      return options;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get spending options', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Create earning event
   */
  private async createEarningEvent(event: EarningEvent): Promise<string> {
    try {
      // Generate duplicate check hash
      const hashData = `${event.userId}-${event.eventType}-${event.moduleId || ''}-${Date.now()}`;
      const duplicateCheckHash = crypto
        .createHash('sha256')
        .update(hashData)
        .digest('hex');

      const result = await prisma.$queryRaw<{ id: string }[]>`
        INSERT INTO scrollgold_earning_events (
          user_id, event_type, earning_rule_id, amount_earned,
          course_id, module_id, score_percentage, streak_days,
          requires_verification, duplicate_check_hash
        )
        VALUES (
          ${event.userId}::uuid, ${event.eventType}, ${event.earningRuleId}::uuid,
          ${event.amountEarned}, ${event.courseId}::uuid, ${event.moduleId}::uuid,
          ${event.scorePercentage}, ${event.streakDays},
          ${event.requiresVerification}, ${duplicateCheckHash}
        )
        RETURNING id
      `;

      // If auto-approved, create transaction immediately
      if (!event.requiresVerification) {
        await prisma.$executeRaw`
          INSERT INTO scrollgold_transactions (
            user_id, transaction_type, amount, description, earning_rule_id
          )
          VALUES (
            ${event.userId}::uuid, 'EARNED', ${event.amountEarned},
            ${event.eventType}, ${event.earningRuleId}::uuid
          )
        `;
      }

      return result[0].id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to create earning event', { event, error: errorMessage });
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      const transactions = await prisma.$queryRaw`
        SELECT 
          t.id, t.transaction_type as "transactionType", t.amount,
          t.description, t.created_at as "createdAt",
          t.billing_related as "billingRelated",
          er.rule_name as "earningRuleName",
          so.option_name as "spendingOptionName"
        FROM scrollgold_transactions t
        LEFT JOIN scrollgold_earning_rules er ON t.earning_rule_id = er.id
        LEFT JOIN scrollgold_spending_options so ON t.spending_option_id = so.id
        WHERE t.user_id = ${userId}::uuid
        ORDER BY t.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      ` as any[];

      return transactions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to get transaction history', { userId, error: errorMessage });
      throw error;
    }
  }
}

export default new ScrollGoldBillingService();
