/**
 * ScrollUniversity Billing Configuration
 * "Give to Caesar what is Caesar's, and to God what is God's" (Matthew 22:21)
 * Simple in Money, Rich in Grace
 */

import { SubscriptionTier, ProductConfig } from '../types/billing.types';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

export function validateBillingConfig(): void {
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required billing environment variables: ${missing.join(', ')}`
    );
  }
}

// ============================================================================
// STRIPE CONFIGURATION
// ============================================================================

export const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  apiVersion: '2023-10-16' as const,
  maxNetworkRetries: 3,
  timeout: 30000
};

// ============================================================================
// PRODUCT CONFIGURATIONS
// ============================================================================

export const PRODUCT_CONFIGS: Record<SubscriptionTier, ProductConfig> = {
  [SubscriptionTier.FREE_TIER]: {
    tier: SubscriptionTier.FREE_TIER,
    name: 'Free Tier',
    description: 'Access to free courses and limited AI tutoring',
    amountCents: 0,
    currency: 'EUR',
    interval: 'month',
    features: {
      aiTutorMinutes: 30,
      courseAccessType: 'free_only',
      hasCertificates: false,
      hasLabAccess: false,
      hasCommunityAccess: true
    }
  },

  [SubscriptionTier.SINGLE_COURSE]: {
    tier: SubscriptionTier.SINGLE_COURSE,
    name: 'Single Course',
    description: 'One-time purchase with lifetime access',
    amountCents: 2900, // €29 default, can be overridden per course
    currency: 'EUR',
    interval: 'one_time',
    features: {
      aiTutorMinutes: 60,
      courseAccessType: 'single',
      hasCertificates: true,
      hasLabAccess: false,
      hasCommunityAccess: true
    }
  },

  [SubscriptionTier.ALL_ACCESS_MONTHLY]: {
    tier: SubscriptionTier.ALL_ACCESS_MONTHLY,
    name: 'All-Access Monthly',
    description: 'Unlimited courses, AI tutoring, and certificates',
    amountCents: parseInt(process.env.PRICE_ALL_ACCESS_MONTHLY || '4900'),
    currency: 'EUR',
    interval: 'month',
    features: {
      aiTutorMinutes: 0, // unlimited
      courseAccessType: 'all',
      hasCertificates: true,
      hasLabAccess: true,
      hasCommunityAccess: true
    }
  },

  [SubscriptionTier.ALL_ACCESS_YEARLY]: {
    tier: SubscriptionTier.ALL_ACCESS_YEARLY,
    name: 'All-Access Yearly',
    description: 'Unlimited courses, AI tutoring, and certificates - save 25%',
    amountCents: parseInt(process.env.PRICE_ALL_ACCESS_YEARLY || '45000'),
    currency: 'EUR',
    interval: 'year',
    features: {
      aiTutorMinutes: 0, // unlimited
      courseAccessType: 'all',
      hasCertificates: true,
      hasLabAccess: true,
      hasCommunityAccess: true
    }
  },

  [SubscriptionTier.PROGRAM_TRACK]: {
    tier: SubscriptionTier.PROGRAM_TRACK,
    name: 'Program Track',
    description: 'Bundled degree program with core courses and capstone',
    amountCents: 99900, // €999 default
    currency: 'EUR',
    interval: 'one_time',
    features: {
      aiTutorMinutes: 0, // unlimited
      courseAccessType: 'program',
      hasCertificates: true,
      hasLabAccess: true,
      hasCommunityAccess: true
    }
  },

  [SubscriptionTier.ELITE_LEADERSHIP]: {
    tier: SubscriptionTier.ELITE_LEADERSHIP,
    name: 'Elite Leadership Track',
    description: 'Premium mentorship, ScrollIntel, and leadership labs',
    amountCents: parseInt(process.env.PRICE_ELITE_LEADERSHIP || '25000'),
    currency: 'EUR',
    interval: 'month',
    features: {
      aiTutorMinutes: 0, // unlimited
      courseAccessType: 'all',
      hasCertificates: true,
      hasLabAccess: true,
      hasCommunityAccess: true,
      hasScrollIntelAccess: true,
      hasScrollArkAccess: true,
      hasMentorshipAccess: true,
      hasEntrepreneurshipStudio: true
    }
  },

  [SubscriptionTier.INSTITUTIONAL]: {
    tier: SubscriptionTier.INSTITUTIONAL,
    name: 'Institutional License',
    description: 'Enterprise licensing for organizations',
    amountCents: 500000, // €5,000 base price
    currency: 'EUR',
    interval: 'year',
    features: {
      aiTutorMinutes: 0, // unlimited
      courseAccessType: 'all',
      hasCertificates: true,
      hasLabAccess: true,
      hasCommunityAccess: true,
      hasScrollIntelAccess: true,
      hasScrollArkAccess: true,
      hasMentorshipAccess: true,
      hasEntrepreneurshipStudio: true
    },
    metadata: {
      minSeats: 20,
      customPortal: true,
      dedicatedSupport: true
    }
  }
};

// ============================================================================
// SCROLLGOLD CONFIGURATION
// ============================================================================

export const scrollGoldConfig = {
  // Earning amounts
  earning: {
    moduleCompletion: parseInt(process.env.SCROLLGOLD_EARN_MODULE_COMPLETION || '50'),
    dailyStreak: parseInt(process.env.SCROLLGOLD_EARN_DAILY_STREAK || '10'),
    communityService: 25,
    peerMentoring: 50,
    researchPublication: 500,
    faithfulPayment: parseInt(process.env.SCROLLGOLD_EARN_FAITHFUL_PAYMENT || '20')
  },

  // Discount rate: 100 ScrollGold = €5 discount
  discountRate: parseFloat(process.env.SCROLLGOLD_DISCOUNT_RATE || '0.05'),

  // Maximum discount percentage
  maxDiscountPercentage: 0.50, // 50% max

  // Spending options
  spending: {
    courseDiscount: {
      name: 'Course Discount',
      conversionRate: 0.05, // 100 ScrollGold = €5
      maxDiscount: 0.50
    },
    premiumAiHours: {
      name: 'Premium AI Lab Hours',
      cost: 100 // 100 ScrollGold per hour
    },
    mentorshipCircle: {
      name: 'Mentorship Circle Access',
      cost: 500 // 500 ScrollGold per month
    },
    governanceVote: {
      name: 'Governance Vote Weight',
      cost: 50 // 50 ScrollGold per vote
    }
  }
};

// ============================================================================
// WEBHOOK EVENT TYPES
// ============================================================================

export const WEBHOOK_EVENTS = {
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  CUSTOMER_UPDATED: 'customer.updated',
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed'
} as const;

// ============================================================================
// PAYMENT CONFIGURATION
// ============================================================================

export const PAYMENT_CONFIG = {
  defaultCurrency: 'EUR',
  supportedCurrencies: ['EUR', 'USD', 'GBP'],
  
  // Retry configuration for failed payments
  retryAttempts: 3,
  retryDelayDays: [3, 7, 14], // Retry after 3, 7, and 14 days
  
  // Grace period before access revocation
  gracePeriodDays: 7,
  GRACE_PERIOD_DAYS: 7, // Alias for consistency
  
  // Invoice configuration
  invoicePrefix: 'SCROLL-',
  invoiceDueDays: 30,
  
  // Refund policy
  refundWindowDays: 30,
  
  // Minimum amounts (in cents)
  minimumPaymentAmount: 100 // €1.00
};

// ============================================================================
// TIER UPGRADE/DOWNGRADE RULES
// ============================================================================

export const TIER_CHANGE_RULES = {
  // Allowed upgrade paths
  allowedUpgrades: {
    [SubscriptionTier.FREE_TIER]: [
      SubscriptionTier.SINGLE_COURSE,
      SubscriptionTier.ALL_ACCESS_MONTHLY,
      SubscriptionTier.ALL_ACCESS_YEARLY,
      SubscriptionTier.ELITE_LEADERSHIP
    ],
    [SubscriptionTier.SINGLE_COURSE]: [
      SubscriptionTier.ALL_ACCESS_MONTHLY,
      SubscriptionTier.ALL_ACCESS_YEARLY,
      SubscriptionTier.ELITE_LEADERSHIP
    ],
    [SubscriptionTier.ALL_ACCESS_MONTHLY]: [
      SubscriptionTier.ALL_ACCESS_YEARLY,
      SubscriptionTier.ELITE_LEADERSHIP
    ],
    [SubscriptionTier.ALL_ACCESS_YEARLY]: [
      SubscriptionTier.ELITE_LEADERSHIP
    ],
    [SubscriptionTier.PROGRAM_TRACK]: [
      SubscriptionTier.ALL_ACCESS_MONTHLY,
      SubscriptionTier.ALL_ACCESS_YEARLY,
      SubscriptionTier.ELITE_LEADERSHIP
    ],
    [SubscriptionTier.ELITE_LEADERSHIP]: [],
    [SubscriptionTier.INSTITUTIONAL]: []
  },

  // Proration behavior
  prorateUpgrades: true,
  prorateDowngrades: true,

  // Immediate vs end-of-period changes
  immediateUpgrades: true,
  immediateDowngrades: false // Downgrade at period end
};

// ============================================================================
// ANALYTICS CONFIGURATION
// ============================================================================

export const ANALYTICS_CONFIG = {
  // Metrics calculation intervals
  metricsUpdateInterval: 3600000, // 1 hour in milliseconds
  
  // Churn calculation window
  churnWindowDays: 30,
  
  // LTV calculation parameters
  ltvMonths: 12,
  discountRate: 0.1, // 10% discount rate for NPV
  
  // Cohort analysis
  cohortSizeDays: 30
};

// ============================================================================
// KINGDOM ECONOMICS CONFIGURATION
// ============================================================================

export const KINGDOM_ECONOMICS_CONFIG = {
  // Pricing tiers by region
  geographicPricing: {
    tier1: {
      // Developed nations
      multiplier: 1.0,
      regions: ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'NZ', 'JP', 'KR']
    },
    tier2: {
      // Emerging nations
      multiplier: 0.3,
      regions: ['BR', 'MX', 'AR', 'CL', 'CO', 'PE', 'ZA', 'IN', 'PH', 'TH']
    },
    tier3: {
      // Low-income nations
      multiplier: 0.05,
      regions: ['NG', 'KE', 'UG', 'TZ', 'GH', 'ET', 'BD', 'PK', 'VN', 'MM']
    }
  },

  // Mission alignment metrics
  missionMetrics: {
    studentAccessPriority: true,
    transparencyRequired: true,
    stewardshipOptimization: true,
    communityBenefitTracking: true
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getProductConfig(tier: SubscriptionTier): ProductConfig {
  const config = PRODUCT_CONFIGS[tier];
  if (!config) {
    throw new Error(`Invalid subscription tier: ${tier}`);
  }
  return config;
}

export function calculateScrollGoldDiscount(scrollgoldAmount: number): number {
  return Math.floor(scrollgoldAmount * scrollGoldConfig.discountRate * 100); // in cents
}

export function isUpgradeAllowed(
  currentTier: SubscriptionTier,
  newTier: SubscriptionTier
): boolean {
  const allowedUpgrades = TIER_CHANGE_RULES.allowedUpgrades[currentTier] || [];
  return allowedUpgrades.includes(newTier);
}

export function getGeographicPricingMultiplier(countryCode: string): number {
  const { geographicPricing } = KINGDOM_ECONOMICS_CONFIG;

  if (geographicPricing.tier1.regions.includes(countryCode)) {
    return geographicPricing.tier1.multiplier;
  }
  if (geographicPricing.tier2.regions.includes(countryCode)) {
    return geographicPricing.tier2.multiplier;
  }
  if (geographicPricing.tier3.regions.includes(countryCode)) {
    return geographicPricing.tier3.multiplier;
  }

  // Default to tier 1 pricing
  return geographicPricing.tier1.multiplier;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  stripeConfig,
  PRODUCT_CONFIGS,
  scrollGoldConfig,
  WEBHOOK_EVENTS,
  PAYMENT_CONFIG,
  TIER_CHANGE_RULES,
  ANALYTICS_CONFIG,
  KINGDOM_ECONOMICS_CONFIG,
  validateBillingConfig,
  getProductConfig,
  calculateScrollGoldDiscount,
  isUpgradeAllowed,
  getGeographicPricingMultiplier
};
