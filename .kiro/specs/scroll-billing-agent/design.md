# ScrollBillingAgent Design Document

## Overview

The ScrollBillingAgent implements a three-layer billing architecture that is **simple in money, rich in grace**. Built on Stripe + Supabase infrastructure, it provides production-ready payment processing while adding ScrollGold as a motivational and spiritual overlay.

**Core Philosophy:**
- **Fiat First**: Stripe handles all real money (cards, SEPA, PayPal) - simple, compliant, production-ready
- **ScrollGold as Blessing**: Internal loyalty system (like Google Play credits) - NOT cryptocurrency, just database records
- **Kingdom Economics**: Access → Transformation → Stewardship

**Architecture Layers:**
1. **Access Layer**: What students pay for (courses, AI tutors, labs, certificates)
2. **Payment Layer**: How they pay (Stripe for fiat, simple database for ScrollGold)
3. **Kingdom Token Layer**: ScrollGold rewards for achievement, service, faithfulness

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  - Payment UI Components                                     │
│  - ScrollGold Wallet Interface                               │
│  - Subscription Management                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend Services (Node.js)                    │
│  - BillingService                                            │
│  - StripeWebhookHandler                                      │
│  - ScrollGoldService                                         │
│  - SubscriptionManager                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌──────────────────────┐    ┌──────────────────────┐
│   Stripe API         │    │   Supabase DB        │
│  - Products          │    │  - subscriptions     │
│  - Prices            │    │  - payments          │
│  - Customers         │    │  - invoices          │
│  - Subscriptions     │    │  - scrollgold_*      │
│  - Webhooks          │    │  - enrollments       │
└──────────────────────┘    └──────────────────────┘
```

### Data Flow

**Purchase Flow:**
1. Student selects product (course/subscription)
2. Frontend creates Stripe Checkout Session
3. Student completes payment on Stripe
4. Stripe fires `checkout.session.completed` webhook
5. Backend grants access + initializes ScrollGold wallet
6. Student receives confirmation email

**Subscription Flow:**
1. Student subscribes to All-Access Monthly
2. Stripe creates recurring subscription
3. Each billing cycle: `invoice.payment_succeeded` webhook
4. Backend extends access + awards loyalty ScrollGold
5. If payment fails: grace period → retry → eventual suspension

**ScrollGold Flow:**
1. Student completes module with 80%+ score
2. Backend awards ScrollGold to wallet
3. Student accumulates ScrollGold over time
4. Student applies ScrollGold discount at checkout
5. Stripe processes reduced amount
6. Backend records ScrollGold transaction


## Components and Interfaces

### Core Services

#### BillingService
```typescript
class BillingService {
  // Stripe Product Management
  async createProduct(productData: ProductInput): Promise<StripeProduct>
  async updateProduct(productId: string, updates: ProductUpdate): Promise<StripeProduct>
  async listProducts(filters?: ProductFilters): Promise<StripeProduct[]>
  
  // Checkout & Payment
  async createCheckoutSession(sessionData: CheckoutSessionInput): Promise<CheckoutSession>
  async createPaymentIntent(intentData: PaymentIntentInput): Promise<PaymentIntent>
  async processRefund(paymentId: string, amount?: number): Promise<Refund>
  
  // Subscription Management
  async createSubscription(subscriptionData: SubscriptionInput): Promise<Subscription>
  async updateSubscription(subscriptionId: string, updates: SubscriptionUpdate): Promise<Subscription>
  async cancelSubscription(subscriptionId: string, options?: CancelOptions): Promise<Subscription>
  
  // Invoice Management
  async generateInvoice(invoiceData: InvoiceInput): Promise<Invoice>
  async sendInvoice(invoiceId: string): Promise<void>
  async recordPayment(paymentData: PaymentRecord): Promise<Payment>
}
```

#### StripeWebhookHandler
```typescript
class StripeWebhookHandler {
  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void>
  async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void>
  async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void>
  async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void>
  async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void>
  async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void>
  async handleCustomerUpdated(customer: Stripe.Customer): Promise<void>
  
  // Webhook Verification
  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean>
}
```

#### ScrollGoldService
```typescript
class ScrollGoldService {
  // Wallet Management
  async createWallet(userId: string): Promise<ScrollGoldWallet>
  async getWallet(userId: string): Promise<ScrollGoldWallet>
  async getBalance(userId: string): Promise<number>
  
  // Earning ScrollGold
  async awardScrollGold(userId: string, amount: number, reason: string, metadata?: object): Promise<Transaction>
  async awardModuleCompletion(userId: string, moduleId: string, score: number): Promise<Transaction>
  async awardDailyStreak(userId: string, streakDays: number): Promise<Transaction>
  async awardCommunityService(userId: string, serviceType: string): Promise<Transaction>
  async bestowHonorScrollGold(userId: string, amount: number, reason: string): Promise<Transaction>
  
  // Spending ScrollGold
  async applyDiscount(userId: string, amount: number, purchaseId: string): Promise<Transaction>
  async purchasePremiumFeature(userId: string, featureId: string, cost: number): Promise<Transaction>
  async unlockMentorship(userId: string, mentorshipId: string): Promise<Transaction>
  
  // Transaction History
  async getTransactionHistory(userId: string, filters?: TransactionFilters): Promise<Transaction[]>
  async getEarningOpportunities(userId: string): Promise<EarningOpportunity[]>
}
```

#### SubscriptionManager
```typescript
class SubscriptionManager {
  // Tier Management
  async upgradeTier(userId: string, newTier: SubscriptionTier): Promise<Subscription>
  async downgradeTier(userId: string, newTier: SubscriptionTier): Promise<Subscription>
  async calculateProration(currentTier: SubscriptionTier, newTier: SubscriptionTier): Promise<ProrationAmount>
  
  // Access Control
  async grantAccess(userId: string, resourceId: string, resourceType: string): Promise<void>
  async revokeAccess(userId: string, resourceId: string, resourceType: string): Promise<void>
  async checkAccess(userId: string, resourceId: string): Promise<boolean>
  
  // Subscription Analytics
  async getSubscriptionMetrics(): Promise<SubscriptionMetrics>
  async getChurnRate(period: DateRange): Promise<number>
  async getLifetimeValue(userId: string): Promise<number>
}
```


## Data Models

### Supabase Database Schema

#### Core Billing Tables

```sql
-- Subscriptions Table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  
  -- Subscription Details
  tier TEXT NOT NULL CHECK (tier IN ('FREE_TIER', 'SINGLE_COURSE', 'ALL_ACCESS_MONTHLY', 'ALL_ACCESS_YEARLY', 'PROGRAM_TRACK', 'ELITE_LEADERSHIP', 'INSTITUTIONAL')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete')),
  
  -- Pricing
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  interval TEXT CHECK (interval IN ('month', 'year', 'one_time')),
  
  -- Dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Features & Limits
  ai_tutor_minutes INTEGER DEFAULT 0, -- 0 = unlimited
  course_access_type TEXT DEFAULT 'all', -- 'all', 'single', 'program'
  has_certificates BOOLEAN DEFAULT false,
  has_lab_access BOOLEAN DEFAULT false,
  has_community_access BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);

-- Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Stripe Details
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_invoice_id TEXT,
  
  -- Payment Details
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'canceled')),
  payment_method TEXT, -- 'card', 'sepa', 'paypal', etc.
  
  -- ScrollGold Integration
  scrollgold_applied INTEGER DEFAULT 0,
  scrollgold_discount_cents INTEGER DEFAULT 0,
  
  -- Metadata
  description TEXT,
  receipt_url TEXT,
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Invoices Table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Stripe Details
  stripe_invoice_id TEXT UNIQUE,
  
  -- Invoice Details
  invoice_number TEXT UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL,
  amount_due_cents INTEGER NOT NULL,
  amount_paid_cents INTEGER DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  
  -- Dates
  due_date DATE,
  paid_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  
  -- Line Items
  line_items JSONB DEFAULT '[]',
  
  -- Files
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);


#### ScrollGold Tables

```sql
-- ScrollGold Wallets Table
CREATE TABLE scrollgold_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Balance
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  
  -- Earning Stats
  earned_from_modules INTEGER DEFAULT 0,
  earned_from_streaks INTEGER DEFAULT 0,
  earned_from_service INTEGER DEFAULT 0,
  earned_from_bestowed INTEGER DEFAULT 0,
  
  -- Spending Stats
  spent_on_discounts INTEGER DEFAULT 0,
  spent_on_features INTEGER DEFAULT 0,
  spent_on_mentorship INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scrollgold_wallets_user_id ON scrollgold_wallets(user_id);
CREATE INDEX idx_scrollgold_wallets_balance ON scrollgold_wallets(balance DESC);

-- ScrollGold Transactions Table
CREATE TABLE scrollgold_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES scrollgold_wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Transaction Details
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'bestow', 'refund', 'adjustment')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  
  -- Reason & Context
  reason TEXT NOT NULL,
  category TEXT, -- 'module_completion', 'daily_streak', 'community_service', 'discount', 'premium_feature', etc.
  
  -- Related Entities
  related_entity_type TEXT, -- 'module', 'course', 'payment', 'feature', etc.
  related_entity_id UUID,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scrollgold_transactions_wallet_id ON scrollgold_transactions(wallet_id);
CREATE INDEX idx_scrollgold_transactions_user_id ON scrollgold_transactions(user_id);
CREATE INDEX idx_scrollgold_transactions_type ON scrollgold_transactions(type);
CREATE INDEX idx_scrollgold_transactions_created_at ON scrollgold_transactions(created_at DESC);

-- ScrollGold Earning Rules Table
CREATE TABLE scrollgold_earning_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Rule Details
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  
  -- Conditions
  conditions JSONB DEFAULT '{}', -- e.g., {"min_score": 80, "module_type": "core"}
  
  -- Limits
  max_per_day INTEGER,
  max_per_week INTEGER,
  max_per_user INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scrollgold_earning_rules_category ON scrollgold_earning_rules(category);
CREATE INDEX idx_scrollgold_earning_rules_is_active ON scrollgold_earning_rules(is_active);


#### Supporting Tables

```sql
-- Stripe Products Configuration Table
CREATE TABLE stripe_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Stripe Details
  stripe_product_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT UNIQUE NOT NULL,
  
  -- Product Details
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT NOT NULL,
  
  -- Pricing
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  interval TEXT, -- 'month', 'year', 'one_time'
  
  -- Features
  features JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stripe_products_stripe_product_id ON stripe_products(stripe_product_id);
CREATE INDEX idx_stripe_products_tier ON stripe_products(tier);
CREATE INDEX idx_stripe_products_is_active ON stripe_products(is_active);

-- Enrollment Access Control Table (links subscriptions to courses)
CREATE TABLE enrollment_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  
  -- Access Details
  resource_type TEXT NOT NULL CHECK (resource_type IN ('course', 'program', 'lab', 'feature', 'mentorship')),
  resource_id UUID NOT NULL,
  
  -- Access Period
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enrollment_access_user_id ON enrollment_access(user_id);
CREATE INDEX idx_enrollment_access_subscription_id ON enrollment_access(subscription_id);
CREATE INDEX idx_enrollment_access_resource ON enrollment_access(resource_type, resource_id);
CREATE INDEX idx_enrollment_access_is_active ON enrollment_access(is_active);

-- Webhook Events Log Table
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Stripe Details
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  
  -- Processing
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'succeeded', 'failed')),
  attempts INTEGER DEFAULT 0,
  
  -- Data
  payload JSONB NOT NULL,
  error_message TEXT,
  
  -- Timestamps
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at DESC);


### TypeScript Type Definitions

```typescript
// Subscription Types
export enum SubscriptionTier {
  FREE_TIER = 'FREE_TIER',
  SINGLE_COURSE = 'SINGLE_COURSE',
  ALL_ACCESS_MONTHLY = 'ALL_ACCESS_MONTHLY',
  ALL_ACCESS_YEARLY = 'ALL_ACCESS_YEARLY',
  PROGRAM_TRACK = 'PROGRAM_TRACK',
  ELITE_LEADERSHIP = 'ELITE_LEADERSHIP',
  INSTITUTIONAL = 'INSTITUTIONAL'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  TRIALING = 'trialing',
  INCOMPLETE = 'incomplete'
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId?: string;
  stripeCustomerId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  amountCents: number;
  currency: string;
  interval?: 'month' | 'year' | 'one_time';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  endedAt?: Date;
  aiTutorMinutes: number;
  courseAccessType: string;
  hasCertificates: boolean;
  hasLabAccess: boolean;
  hasCommunityAccess: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELED = 'canceled'
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeInvoiceId?: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  scrollgoldApplied: number;
  scrollgoldDiscountCents: number;
  description?: string;
  receiptUrl?: string;
  failureReason?: string;
  metadata: Record<string, any>;
  paidAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ScrollGold Types
export enum ScrollGoldTransactionType {
  EARN = 'earn',
  SPEND = 'spend',
  BESTOW = 'bestow',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment'
}

export interface ScrollGoldWallet {
  id: string;
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
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScrollGoldTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: ScrollGoldTransactionType;
  amount: number;
  balanceAfter: number;
  reason: string;
  category?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

// Product Configuration Types
export interface ProductConfig {
  tier: SubscriptionTier;
  name: string;
  description: string;
  amountCents: number;
  currency: string;
  interval?: 'month' | 'year' | 'one_time';
  features: {
    aiTutorMinutes: number;
    courseAccessType: string;
    hasCertificates: boolean;
    hasLabAccess: boolean;
    hasCommunityAccess: boolean;
  };
  metadata?: Record<string, any>;
}


## Error Handling

### Error Categories

1. **Payment Errors**
   - Card declined
   - Insufficient funds
   - Payment method expired
   - Fraud detection triggered

2. **Subscription Errors**
   - Invalid tier upgrade/downgrade
   - Subscription already exists
   - Subscription not found
   - Proration calculation failed

3. **ScrollGold Errors**
   - Insufficient balance
   - Invalid transaction amount
   - Wallet not found
   - Earning rule violation

4. **Webhook Errors**
   - Invalid signature
   - Duplicate event
   - Processing timeout
   - Database transaction failed

### Error Handling Strategy

```typescript
class BillingError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'BillingError';
  }
}

// Error Codes
export enum BillingErrorCode {
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INSUFFICIENT_SCROLLGOLD = 'INSUFFICIENT_SCROLLGOLD',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  INVALID_TIER_CHANGE = 'INVALID_TIER_CHANGE',
  WEBHOOK_VERIFICATION_FAILED = 'WEBHOOK_VERIFICATION_FAILED',
  STRIPE_API_ERROR = 'STRIPE_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR'
}

// Error Handler
async function handleBillingError(error: Error): Promise<void> {
  if (error instanceof BillingError) {
    // Log structured error
    logger.error('Billing error occurred', {
      code: error.code,
      message: error.message,
      details: error.details
    });
    
    // Send alert if critical
    if (error.statusCode >= 500) {
      await alertService.sendCriticalAlert(error);
    }
    
    // Record in monitoring
    await monitoringService.recordError(error);
  }
  
  throw error;
}
```

### Retry Logic

```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('BillingService', () => {
  describe('createCheckoutSession', () => {
    it('should create checkout session with correct product', async () => {
      const session = await billingService.createCheckoutSession({
        userId: 'user-123',
        tier: SubscriptionTier.ALL_ACCESS_MONTHLY,
        successUrl: 'https://app.scrolluniversity.com/success',
        cancelUrl: 'https://app.scrolluniversity.com/cancel'
      });
      
      expect(session.url).toBeDefined();
      expect(session.metadata.userId).toBe('user-123');
    });
    
    it('should apply ScrollGold discount when provided', async () => {
      const session = await billingService.createCheckoutSession({
        userId: 'user-123',
        tier: SubscriptionTier.ALL_ACCESS_MONTHLY,
        scrollgoldDiscount: 100,
        successUrl: 'https://app.scrolluniversity.com/success',
        cancelUrl: 'https://app.scrolluniversity.com/cancel'
      });
      
      expect(session.amount_total).toBeLessThan(4900); // €49 - discount
    });
  });
});

describe('ScrollGoldService', () => {
  describe('awardScrollGold', () => {
    it('should increase wallet balance', async () => {
      const transaction = await scrollGoldService.awardScrollGold(
        'user-123',
        50,
        'Module completion'
      );
      
      expect(transaction.amount).toBe(50);
      expect(transaction.type).toBe(ScrollGoldTransactionType.EARN);
      
      const wallet = await scrollGoldService.getWallet('user-123');
      expect(wallet.balance).toBeGreaterThanOrEqual(50);
    });
  });
  
  describe('applyDiscount', () => {
    it('should throw error if insufficient balance', async () => {
      await expect(
        scrollGoldService.applyDiscount('user-123', 1000, 'purchase-456')
      ).rejects.toThrow('Insufficient ScrollGold balance');
    });
  });
});
```

### Integration Tests

```typescript
describe('Stripe Webhook Integration', () => {
  it('should grant access on checkout.session.completed', async () => {
    const event = createMockStripeEvent('checkout.session.completed', {
      customer: 'cus_123',
      subscription: 'sub_123',
      metadata: { userId: 'user-123', tier: 'ALL_ACCESS_MONTHLY' }
    });
    
    await webhookHandler.handleCheckoutCompleted(event.data.object);
    
    const subscription = await db.subscriptions.findOne({ userId: 'user-123' });
    expect(subscription.status).toBe('active');
    
    const access = await db.enrollment_access.findMany({ userId: 'user-123' });
    expect(access.length).toBeGreaterThan(0);
  });
});
```


## Configuration Management

### Environment Variables

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ScrollGold Configuration
SCROLLGOLD_EARN_MODULE_COMPLETION=50
SCROLLGOLD_EARN_DAILY_STREAK=10
SCROLLGOLD_EARN_COMMUNITY_SERVICE=25
SCROLLGOLD_DISCOUNT_RATE=0.05  # 100 ScrollGold = €5 discount

# Product Pricing (in cents)
PRICE_ALL_ACCESS_MONTHLY=4900  # €49
PRICE_ALL_ACCESS_YEARLY=45000  # €450 (€37.50/month)
PRICE_ELITE_LEADERSHIP=25000   # €250/month

# Feature Flags
ENABLE_SCROLLGOLD=true
ENABLE_INSTITUTIONAL_LICENSING=true
ENABLE_MULTI_CURRENCY=false  # Phase 2
```

### Product Configuration

```typescript
// backend/src/config/billing.config.ts
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
      hasCommunityAccess: true
    },
    metadata: {
      hasScrollIntelAccess: true,
      hasScrollArkAccess: true,
      hasMentorshipAccess: true,
      hasEntrepreneurshipStudio: true
    }
  }
};
```

### ScrollGold Earning Rules Configuration

```typescript
// backend/src/config/scrollgold.config.ts
export const SCROLLGOLD_EARNING_RULES = {
  MODULE_COMPLETION: {
    name: 'Module Completion',
    category: 'achievement',
    amount: 50,
    conditions: { minScore: 80 }
  },
  
  DAILY_STREAK: {
    name: 'Daily Study Streak',
    category: 'consistency',
    amount: 10,
    maxPerDay: 10
  },
  
  COMMUNITY_SERVICE: {
    name: 'Community Service',
    category: 'service',
    amount: 25,
    maxPerWeek: 100
  },
  
  PEER_MENTORING: {
    name: 'Peer Mentoring',
    category: 'service',
    amount: 50,
    maxPerWeek: 200
  },
  
  RESEARCH_PUBLICATION: {
    name: 'Research Publication',
    category: 'achievement',
    amount: 500
  },
  
  FAITHFUL_PAYMENT: {
    name: 'Faithful Recurring Payment',
    category: 'faithfulness',
    amount: 20,
    conditions: { consecutivePayments: 3 }
  }
};

export const SCROLLGOLD_SPENDING_OPTIONS = {
  COURSE_DISCOUNT: {
    name: 'Course Discount',
    conversionRate: 0.05, // 100 ScrollGold = €5 discount
    maxDiscount: 0.50 // Max 50% discount
  },
  
  PREMIUM_AI_HOURS: {
    name: 'Premium AI Lab Hours',
    cost: 100, // 100 ScrollGold per hour
  },
  
  MENTORSHIP_CIRCLE: {
    name: 'Mentorship Circle Access',
    cost: 500 // 500 ScrollGold per month
  },
  
  GOVERNANCE_VOTE: {
    name: 'Governance Vote Weight',
    cost: 50 // 50 ScrollGold per vote
  }
};
```


## Implementation Roadmap

### Phase 1: Core Stripe + Supabase Integration (Week 1-2)

**Goal**: Get basic payment processing working with Stripe + Supabase

1. **Database Setup**
   - Create Supabase migration with all billing tables
   - Set up indexes and foreign keys
   - Create RLS policies for security

2. **Stripe Product Configuration**
   - Create Stripe products for FREE_TIER, ALL_ACCESS_MONTHLY, ALL_ACCESS_YEARLY
   - Configure prices and metadata
   - Set up webhook endpoints

3. **Core Services**
   - Implement BillingService with Stripe SDK
   - Implement StripeWebhookHandler
   - Implement basic SubscriptionManager

4. **Webhook Integration**
   - Handle checkout.session.completed
   - Handle invoice.payment_succeeded
   - Handle subscription lifecycle events

5. **Frontend Components**
   - Payment form with Stripe Elements
   - Subscription management UI
   - Payment history display

### Phase 2: ScrollGold System (Week 3)

**Goal**: Add ScrollGold earning and spending

1. **ScrollGold Database**
   - Implement wallet and transaction tables
   - Create earning rules table
   - Set up transaction logging

2. **ScrollGold Service**
   - Implement wallet creation and management
   - Implement earning logic (modules, streaks, service)
   - Implement spending logic (discounts, features)

3. **Integration Points**
   - Award ScrollGold on module completion
   - Award ScrollGold on daily streaks
   - Apply ScrollGold discounts at checkout

4. **Frontend Components**
   - ScrollGold wallet interface
   - Transaction history
   - Earning opportunities display

### Phase 3: Advanced Features (Week 4)

**Goal**: Add institutional licensing and analytics

1. **Institutional Licensing**
   - Multi-seat subscription management
   - Custom portal configuration
   - Institutional billing and invoicing

2. **Analytics & Reporting**
   - Subscription metrics dashboard
   - Revenue analytics
   - Churn analysis
   - ScrollGold economy metrics

3. **Admin Tools**
   - Subscription management interface
   - ScrollGold bestowing tools
   - Financial reporting

### Phase 4: Optimization & Scale (Week 5+)

**Goal**: Production hardening and optimization

1. **Performance**
   - Implement caching for product configs
   - Optimize database queries
   - Add connection pooling

2. **Monitoring**
   - Set up error tracking (Sentry)
   - Add performance monitoring
   - Create alerting for failed payments

3. **Testing**
   - Comprehensive unit test coverage
   - Integration tests for webhook flows
   - Load testing for high-volume scenarios

4. **Documentation**
   - API documentation
   - Admin user guides
   - Developer integration guides


## Security Considerations

### Payment Security

1. **PCI Compliance**
   - Never store card details directly
   - Use Stripe Elements for card input
   - Use Stripe Customer objects for payment methods
   - Implement SCA (Strong Customer Authentication) for EU

2. **Webhook Security**
   - Verify webhook signatures using Stripe webhook secret
   - Implement idempotency checks to prevent duplicate processing
   - Use HTTPS for all webhook endpoints
   - Rate limit webhook endpoints

3. **Data Protection**
   - Encrypt sensitive data at rest
   - Use HTTPS for all API communications
   - Implement proper access controls (RLS in Supabase)
   - Audit log all financial transactions

### ScrollGold Security

1. **Balance Manipulation Prevention**
   - Use database transactions for all balance updates
   - Implement balance validation checks
   - Log all ScrollGold transactions with audit trail
   - Set maximum earning limits per day/week

2. **Fraud Detection**
   - Monitor unusual earning patterns
   - Flag rapid balance changes
   - Implement velocity checks
   - Alert on suspicious activity

### Access Control

1. **Role-Based Access**
   - Students: View own subscriptions and payments
   - Admins: Manage all subscriptions and bestow ScrollGold
   - Finance: Access financial reports and analytics
   - Support: View customer billing issues

2. **Row-Level Security (Supabase)**
```sql
-- Students can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Students can only see their own payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Students can only see their own ScrollGold wallet
CREATE POLICY "Users can view own wallet"
  ON scrollgold_wallets FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can bestow ScrollGold
CREATE POLICY "Admins can bestow ScrollGold"
  ON scrollgold_transactions FOR INSERT
  USING (
    auth.jwt() ->> 'role' = 'admin' 
    AND type = 'bestow'
  );
```

## Monitoring and Observability

### Key Metrics

1. **Revenue Metrics**
   - Monthly Recurring Revenue (MRR)
   - Annual Recurring Revenue (ARR)
   - Average Revenue Per User (ARPU)
   - Customer Lifetime Value (CLV)

2. **Subscription Metrics**
   - New subscriptions per day/week/month
   - Churn rate
   - Upgrade/downgrade rates
   - Trial conversion rate

3. **Payment Metrics**
   - Payment success rate
   - Failed payment recovery rate
   - Refund rate
   - Average transaction value

4. **ScrollGold Metrics**
   - Total ScrollGold in circulation
   - Average wallet balance
   - Earning rate by category
   - Spending rate by category
   - ScrollGold discount usage rate

### Logging Strategy

```typescript
// Structured logging for all billing events
logger.info('Payment processed', {
  userId: 'user-123',
  paymentId: 'pay-456',
  amountCents: 4900,
  currency: 'EUR',
  status: 'succeeded',
  scrollgoldApplied: 100,
  timestamp: new Date().toISOString()
});

logger.info('ScrollGold awarded', {
  userId: 'user-123',
  amount: 50,
  reason: 'Module completion',
  moduleId: 'mod-789',
  balanceAfter: 250,
  timestamp: new Date().toISOString()
});

logger.error('Webhook processing failed', {
  eventId: 'evt-123',
  eventType: 'invoice.payment_failed',
  error: error.message,
  attempts: 3,
  timestamp: new Date().toISOString()
});
```

### Alerting Rules

1. **Critical Alerts** (Immediate notification)
   - Webhook endpoint down
   - Payment processing failure rate > 10%
   - Database connection failures
   - Stripe API errors

2. **Warning Alerts** (Review within 1 hour)
   - Churn rate spike
   - Failed payment recovery rate drop
   - ScrollGold balance anomalies
   - Subscription cancellation spike

3. **Info Alerts** (Daily digest)
   - Daily revenue summary
   - New subscription count
   - ScrollGold economy health
   - Top earning/spending users

## Deployment Strategy

### Environment Setup

1. **Development**
   - Use Stripe test mode
   - Local Supabase instance or dev project
   - Mock webhook events for testing

2. **Staging**
   - Use Stripe test mode
   - Staging Supabase project
   - Real webhook integration testing

3. **Production**
   - Use Stripe live mode
   - Production Supabase project
   - Full monitoring and alerting
   - Backup and disaster recovery

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Stripe products created
- [ ] Stripe webhook endpoints registered
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Monitoring dashboards configured
- [ ] Alert rules configured
- [ ] Backup strategy implemented
- [ ] Documentation updated
- [ ] Team training completed

