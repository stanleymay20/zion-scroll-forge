# ScrollUniversity Billing Implementation Guide
## Simple in Money, Rich in Grace

This guide provides everything needed to implement the ScrollUniversity billing system with **Stripe + Supabase + ScrollGold**.

## Quick Start

### 1. Set Up Environment Variables

```bash
# .env
STRIPE_SECRET_KEY=sk_test_...  # Get from Stripe Dashboard
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Get after creating webhook endpoint

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Product Pricing (in cents)
PRICE_ALL_ACCESS_MONTHLY=4900  # €49
PRICE_ALL_ACCESS_YEARLY=45000  # €450
PRICE_ELITE_LEADERSHIP=25000   # €250

# ScrollGold Configuration
SCROLLGOLD_EARN_MODULE_COMPLETION=50
SCROLLGOLD_EARN_DAILY_STREAK=10
SCROLLGOLD_DISCOUNT_RATE=0.05  # 100 ScrollGold = €5 discount
```

### 2. Run Database Migration

```bash
# Create Supabase migration
cd supabase
supabase migration new billing_system

# Copy the schema from .kiro/specs/scroll-billing-agent/design.md
# into the migration file, then run:
supabase db push
```

### 3. Create Stripe Products

```bash
# Run the setup script
npm run setup:stripe-products
```

Or manually in Stripe Dashboard:
- Create product "All-Access Monthly" → €49/month
- Create product "All-Access Yearly" → €450/year  
- Create product "Elite Leadership" → €250/month
- Add metadata: `tier`, `ai_minutes`, `features`

### 4. Set Up Stripe Webhooks

In Stripe Dashboard → Developers → Webhooks:
- Add endpoint: `https://your-api.com/webhooks/stripe`
- Select events:
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Copy webhook secret to `STRIPE_WEBHOOK_SECRET`


## Core Implementation

### Backend Service Structure

```
backend/src/
├── services/
│   ├── BillingService.ts           # Main billing logic
│   ├── StripeWebhookHandler.ts     # Webhook processing
│   ├── ScrollGoldService.ts        # ScrollGold economy
│   └── SubscriptionManager.ts      # Access control
├── routes/
│   ├── billing.ts                  # Billing API endpoints
│   ├── webhooks.ts                 # Stripe webhook endpoint
│   └── scrollgold.ts               # ScrollGold API
├── config/
│   ├── billing.config.ts           # Product configurations
│   └── scrollgold.config.ts        # Earning rules
└── types/
    └── billing.types.ts            # TypeScript definitions
```

### Key Implementation Files

#### 1. BillingService.ts

```typescript
import Stripe from 'stripe';
import { supabase } from '../config/supabase';
import { PRODUCT_CONFIGS } from '../config/billing.config';

export class BillingService {
  private stripe: Stripe;
  
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });
  }
  
  async createCheckoutSession(data: {
    userId: string;
    tier: string;
    scrollgoldDiscount?: number;
    successUrl: string;
    cancelUrl: string;
  }) {
    const config = PRODUCT_CONFIGS[data.tier];
    let finalAmount = config.amountCents;
    
    // Apply ScrollGold discount
    if (data.scrollgoldDiscount) {
      const discountCents = data.scrollgoldDiscount * 
        parseFloat(process.env.SCROLLGOLD_DISCOUNT_RATE!);
      finalAmount = Math.max(0, finalAmount - discountCents);
    }
    
    const session = await this.stripe.checkout.sessions.create({
      mode: config.interval === 'one_time' ? 'payment' : 'subscription',
      line_items: [{
        price_data: {
          currency: config.currency.toLowerCase(),
          product_data: {
            name: config.name,
            description: config.description
          },
          unit_amount: finalAmount,
          recurring: config.interval !== 'one_time' ? {
            interval: config.interval as 'month' | 'year'
          } : undefined
        },
        quantity: 1
      }],
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: {
        userId: data.userId,
        tier: data.tier,
        scrollgoldApplied: data.scrollgoldDiscount || 0
      }
    });
    
    return session;
  }
  
  async createSubscription(data: {
    userId: string;
    stripeCustomerId: string;
    tier: string;
  }) {
    const config = PRODUCT_CONFIGS[data.tier];
    
    // Insert into database
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: data.userId,
        stripe_customer_id: data.stripeCustomerId,
        tier: data.tier,
        status: 'active',
        amount_cents: config.amountCents,
        currency: config.currency,
        interval: config.interval,
        ai_tutor_minutes: config.features.aiTutorMinutes,
        course_access_type: config.features.courseAccessType,
        has_certificates: config.features.hasCertificates,
        has_lab_access: config.features.hasLabAccess,
        has_community_access: config.features.hasCommunityAccess
      })
      .select()
      .single();
    
    if (error) throw error;
    return subscription;
  }
}
```

#### 2. StripeWebhookHandler.ts

```typescript
import Stripe from 'stripe';
import { supabase } from '../config/supabase';
import { ScrollGoldService } from './ScrollGoldService';

export class StripeWebhookHandler {
  private stripe: Stripe;
  private scrollGoldService: ScrollGoldService;
  
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });
    this.scrollGoldService = new ScrollGoldService();
  }
  
  async verifyWebhook(payload: string, signature: string): Promise<Stripe.Event> {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  }
  
  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier;
    
    if (!userId || !tier) {
      throw new Error('Missing metadata in checkout session');
    }
    
    // Create subscription in database
    await supabase.from('subscriptions').insert({
      user_id: userId,
      stripe_subscription_id: session.subscription as string,
      stripe_customer_id: session.customer as string,
      tier,
      status: 'active',
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    
    // Initialize ScrollGold wallet if doesn't exist
    await this.scrollGoldService.createWallet(userId);
    
    // Grant access to courses
    await this.grantCourseAccess(userId, tier);
  }
  
  async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;
    
    // Update subscription period
    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })
      .eq('stripe_subscription_id', subscriptionId);
    
    // Award loyalty ScrollGold
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();
    
    if (subscription) {
      await this.scrollGoldService.awardScrollGold(
        subscription.user_id,
        20,
        'Faithful recurring payment'
      );
    }
  }
  
  private async grantCourseAccess(userId: string, tier: string) {
    // Implementation depends on your course access model
    // For ALL_ACCESS tiers, grant access to all courses
    if (tier.includes('ALL_ACCESS')) {
      await supabase.from('enrollment_access').insert({
        user_id: userId,
        resource_type: 'course',
        resource_id: '*', // Wildcard for all courses
        is_active: true
      });
    }
  }
}
```


#### 3. ScrollGoldService.ts

```typescript
import { supabase } from '../config/supabase';

export class ScrollGoldService {
  async createWallet(userId: string) {
    const { data, error } = await supabase
      .from('scrollgold_wallets')
      .insert({ user_id: userId, balance: 0 })
      .select()
      .single();
    
    if (error && error.code !== '23505') throw error; // Ignore duplicate
    return data;
  }
  
  async getWallet(userId: string) {
    const { data, error } = await supabase
      .from('scrollgold_wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async awardScrollGold(
    userId: string,
    amount: number,
    reason: string,
    metadata?: object
  ) {
    // Get current wallet
    const wallet = await this.getWallet(userId);
    const newBalance = wallet.balance + amount;
    
    // Update wallet balance
    await supabase
      .from('scrollgold_wallets')
      .update({
        balance: newBalance,
        lifetime_earned: wallet.lifetime_earned + amount
      })
      .eq('user_id', userId);
    
    // Record transaction
    const { data: transaction } = await supabase
      .from('scrollgold_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: userId,
        type: 'earn',
        amount,
        balance_after: newBalance,
        reason,
        metadata
      })
      .select()
      .single();
    
    return transaction;
  }
  
  async applyDiscount(userId: string, scrollgoldAmount: number, purchaseId: string) {
    const wallet = await this.getWallet(userId);
    
    if (wallet.balance < scrollgoldAmount) {
      throw new Error('Insufficient ScrollGold balance');
    }
    
    const newBalance = wallet.balance - scrollgoldAmount;
    
    // Update wallet
    await supabase
      .from('scrollgold_wallets')
      .update({
        balance: newBalance,
        lifetime_spent: wallet.lifetime_spent + scrollgoldAmount,
        spent_on_discounts: wallet.spent_on_discounts + scrollgoldAmount
      })
      .eq('user_id', userId);
    
    // Record transaction
    await supabase
      .from('scrollgold_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: userId,
        type: 'spend',
        amount: -scrollgoldAmount,
        balance_after: newBalance,
        reason: 'Course discount applied',
        category: 'discount',
        related_entity_type: 'payment',
        related_entity_id: purchaseId
      });
    
    return newBalance;
  }
}
```

#### 4. API Routes

```typescript
// backend/src/routes/billing.ts
import express from 'express';
import { BillingService } from '../services/BillingService';
import { requireAuth } from '../middleware/auth';

const router = express.Router();
const billingService = new BillingService();

router.post('/checkout', requireAuth, async (req, res) => {
  try {
    const session = await billingService.createCheckoutSession({
      userId: req.user.id,
      tier: req.body.tier,
      scrollgoldDiscount: req.body.scrollgoldDiscount,
      successUrl: `${process.env.FRONTEND_URL}/billing/success`,
      cancelUrl: `${process.env.FRONTEND_URL}/billing/cancel`
    });
    
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/subscriptions', requireAuth, async (req, res) => {
  try {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

```typescript
// backend/src/routes/webhooks.ts
import express from 'express';
import { StripeWebhookHandler } from '../services/StripeWebhookHandler';

const router = express.Router();
const webhookHandler = new StripeWebhookHandler();

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;
  
  try {
    const event = await webhookHandler.verifyWebhook(
      req.body.toString(),
      signature
    );
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await webhookHandler.handleCheckoutCompleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await webhookHandler.handleInvoicePaymentSucceeded(event.data.object);
        break;
      // Add other event handlers...
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

export default router;
```


## Frontend Implementation

### React Components

#### 1. Subscription Selection

```typescript
// src/components/billing/SubscriptionPlans.tsx
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

export function SubscriptionPlans() {
  const [loading, setLoading] = useState(false);
  const [scrollgoldDiscount, setScrollgoldDiscount] = useState(0);
  
  const plans = [
    {
      tier: 'ALL_ACCESS_MONTHLY',
      name: 'All-Access Monthly',
      price: 49,
      interval: 'month',
      features: ['Unlimited courses', 'Unlimited AI tutoring', 'Certificates', 'Labs']
    },
    {
      tier: 'ALL_ACCESS_YEARLY',
      name: 'All-Access Yearly',
      price: 450,
      interval: 'year',
      features: ['Unlimited courses', 'Unlimited AI tutoring', 'Certificates', 'Labs', 'Save 25%']
    }
  ];
  
  const handleSubscribe = async (tier: string) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, scrollgoldDiscount })
      });
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {plans.map(plan => (
        <div key={plan.tier} className="border rounded-lg p-6">
          <h3 className="text-2xl font-bold">{plan.name}</h3>
          <p className="text-4xl font-bold mt-4">
            €{plan.price}
            <span className="text-sm text-gray-500">/{plan.interval}</span>
          </p>
          
          <ul className="mt-6 space-y-2">
            {plan.features.map(feature => (
              <li key={feature} className="flex items-center">
                <span className="mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          
          <button
            onClick={() => handleSubscribe(plan.tier)}
            disabled={loading}
            className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg"
          >
            {loading ? 'Processing...' : 'Subscribe'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

#### 2. ScrollGold Wallet

```typescript
// src/components/billing/ScrollGoldWallet.tsx
import { useEffect, useState } from 'react';

export function ScrollGoldWallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);
  
  const fetchWallet = async () => {
    const response = await fetch('/api/scrollgold/wallet');
    const data = await response.json();
    setWallet(data);
  };
  
  const fetchTransactions = async () => {
    const response = await fetch('/api/scrollgold/transactions');
    const data = await response.json();
    setTransactions(data);
  };
  
  return (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold">ScrollGold Balance</h2>
        <p className="text-5xl font-bold mt-4">{wallet?.balance || 0}</p>
        <p className="text-sm mt-2">
          Lifetime Earned: {wallet?.lifetime_earned || 0} | 
          Lifetime Spent: {wallet?.lifetime_spent || 0}
        </p>
      </div>
      
      {/* Earning Opportunities */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Earn More ScrollGold</h3>
        <ul className="space-y-2">
          <li>✓ Complete modules with 80%+ score: +50 ScrollGold</li>
          <li>✓ Maintain daily study streak: +10 ScrollGold/day</li>
          <li>✓ Help peers in community: +25 ScrollGold</li>
          <li>✓ Mentor other students: +50 ScrollGold</li>
        </ul>
      </div>
      
      {/* Transaction History */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {transactions.map(tx => (
            <div key={tx.id} className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">{tx.reason}</p>
                <p className="text-sm text-gray-500">
                  {new Date(tx.created_at).toLocaleDateString()}
                </p>
              </div>
              <p className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Testing

### Test Stripe Integration

```bash
# Use Stripe CLI to test webhooks locally
stripe listen --forward-to localhost:3000/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
```

### Test ScrollGold System

```typescript
// Test earning ScrollGold
const response = await fetch('/api/scrollgold/award', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    amount: 50,
    reason: 'Module completion test'
  })
});

// Test applying discount
const checkoutResponse = await fetch('/api/billing/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tier: 'ALL_ACCESS_MONTHLY',
    scrollgoldDiscount: 100 // Use 100 ScrollGold
  })
});
```

## Production Checklist

- [ ] Switch Stripe to live mode
- [ ] Update webhook endpoint to production URL
- [ ] Configure production environment variables
- [ ] Enable Supabase RLS policies
- [ ] Set up monitoring (Sentry, DataDog, etc.)
- [ ] Configure backup strategy
- [ ] Test payment flows end-to-end
- [ ] Test webhook processing
- [ ] Test ScrollGold earning and spending
- [ ] Document admin procedures
- [ ] Train support team

## Common Issues & Solutions

### Issue: Webhook signature verification fails
**Solution**: Ensure you're using the correct webhook secret for your environment (test vs live)

### Issue: ScrollGold balance becomes negative
**Solution**: Add database constraint `CHECK (balance >= 0)` and implement transaction locks

### Issue: Duplicate webhook processing
**Solution**: Implement idempotency using `stripe_event_id` in webhook_events table

### Issue: Subscription not granting access
**Solution**: Check webhook processing logs and ensure enrollment_access records are created

## Support & Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Design Document**: `.kiro/specs/scroll-billing-agent/design.md`
- **Requirements**: `.kiro/specs/scroll-billing-agent/requirements.md`

---

**Remember**: Billing should be **simple in money, rich in grace**. Keep the fiat payment flow straightforward with Stripe, and add the ScrollGold blessing layer for motivation and kingdom values.

