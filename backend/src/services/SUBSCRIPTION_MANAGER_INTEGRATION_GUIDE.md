# SubscriptionManager Integration Guide

## Quick Start

### 1. Import the Service

```typescript
import { SubscriptionManager } from './services/SubscriptionManager';
import { SubscriptionTier } from './types/billing.types';

const subscriptionManager = new SubscriptionManager();
```

### 2. Common Use Cases

#### Upgrade User Subscription

```typescript
// In your subscription upgrade endpoint
app.post('/api/subscriptions/upgrade', async (req, res) => {
  try {
    const { userId, newTier, newPriceId } = req.body;
    
    // Get current subscription
    const currentSubscription = await subscriptionManager.getActiveSubscription(userId);
    
    if (!currentSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }
    
    // Calculate proration to show user
    const proration = await subscriptionManager.calculateProration(
      userId,
      currentSubscription.tier as SubscriptionTier,
      newTier,
      newPriceId
    );
    
    // Show proration to user for confirmation
    // Then perform upgrade
    const result = await subscriptionManager.upgradeTier({
      userId,
      currentTier: currentSubscription.tier as SubscriptionTier,
      newTier,
      newPriceId,
    });
    
    res.json({
      success: true,
      message: result.message,
      proratedAmount: result.proratedAmount,
      subscriptionId: result.subscriptionId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### Check Course Access

```typescript
// In your course access middleware
async function checkCourseAccess(req, res, next) {
  try {
    const { userId } = req.user;
    const { courseId } = req.params;
    
    const hasAccess = await subscriptionManager.checkAccess({
      userId,
      resourceType: 'course',
      resourceId: courseId,
    });
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied. Please upgrade your subscription.' 
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Use in routes
app.get('/api/courses/:courseId/content', checkCourseAccess, getCourseContent);
```

#### Cancel Subscription

```typescript
// In your cancellation endpoint
app.post('/api/subscriptions/cancel', async (req, res) => {
  try {
    const { userId } = req.user;
    const { subscriptionId, reason, immediate } = req.body;
    
    const result = await subscriptionManager.cancelSubscription({
      userId,
      subscriptionId,
      reason,
      immediate: immediate || false,
      gracePeriodDays: 30, // 30-day grace period
    });
    
    res.json({
      success: true,
      message: result.message,
      accessUntil: result.accessUntil,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### Get Subscription Analytics

```typescript
// In your admin analytics endpoint
app.get('/api/admin/subscription-analytics', async (req, res) => {
  try {
    const metrics = await subscriptionManager.getSubscriptionMetrics();
    
    res.json({
      success: true,
      metrics: {
        mrr: metrics.mrrCents / 100,
        arr: metrics.arrCents / 100,
        arpu: metrics.arpuCents / 100,
        ltv: metrics.ltvCents / 100,
        churnRate: metrics.churnRate,
        conversionRate: metrics.conversionRate,
        activeSubscriptions: metrics.activeSubscriptions,
        tierDistribution: metrics.tierDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Integration with Webhooks

### Stripe Webhook Handler Integration

```typescript
// In your StripeWebhookHandler
import { SubscriptionManager } from './services/SubscriptionManager';

class StripeWebhookHandler {
  private subscriptionManager: SubscriptionManager;
  
  constructor() {
    this.subscriptionManager = new SubscriptionManager();
  }
  
  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    // ... existing code ...
    
    // Grant access to subscription resources
    const subscription = await getSubscriptionFromSession(session);
    await this.subscriptionManager.grantTierAccess(
      subscription.userId,
      subscription.tier
    );
  }
  
  async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    // ... existing code ...
    
    // Revoke access
    const dbSubscription = await getSubscriptionFromStripe(subscription.id);
    await this.subscriptionManager.revokeTierAccess(
      dbSubscription.userId,
      dbSubscription.tier
    );
  }
}
```

## Frontend Integration

### React Hook Example

```typescript
// useSubscription.ts
import { useState, useEffect } from 'react';

export function useSubscription(userId: string) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchSubscription() {
      const response = await fetch(`/api/subscriptions/${userId}`);
      const data = await response.json();
      setSubscription(data.subscription);
      setLoading(false);
    }
    
    fetchSubscription();
  }, [userId]);
  
  const upgradeTier = async (newTier: string, newPriceId: string) => {
    const response = await fetch('/api/subscriptions/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newTier, newPriceId }),
    });
    
    const data = await response.json();
    if (data.success) {
      setSubscription(data.subscription);
    }
    return data;
  };
  
  const cancelSubscription = async (reason: string) => {
    const response = await fetch('/api/subscriptions/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId, 
        subscriptionId: subscription.id,
        reason 
      }),
    });
    
    const data = await response.json();
    if (data.success) {
      setSubscription({ ...subscription, status: 'canceled' });
    }
    return data;
  };
  
  return {
    subscription,
    loading,
    upgradeTier,
    cancelSubscription,
  };
}
```

### Usage in Component

```typescript
function SubscriptionManagement() {
  const { user } = useAuth();
  const { subscription, upgradeTier, cancelSubscription } = useSubscription(user.id);
  
  const handleUpgrade = async () => {
    const result = await upgradeTier(
      'ELITE_LEADERSHIP',
      'price_elite_monthly'
    );
    
    if (result.success) {
      toast.success(`Upgraded! Prorated amount: €${result.proratedAmount / 100}`);
    }
  };
  
  return (
    <div>
      <h2>Current Plan: {subscription?.tier}</h2>
      <button onClick={handleUpgrade}>Upgrade to Elite</button>
    </div>
  );
}
```

## Database Schema Requirements

Ensure these tables exist in your database:

```sql
-- subscriptions table (created by migration)
-- enrollment_access table (created by migration)
-- analytics_event table (created by migration)
```

## Environment Variables

No additional environment variables required. Uses existing Stripe configuration.

## Testing

### Unit Test Example

```typescript
import { SubscriptionManager } from './SubscriptionManager';
import { SubscriptionTier } from '../types/billing.types';

describe('SubscriptionManager', () => {
  let manager: SubscriptionManager;
  
  beforeEach(() => {
    manager = new SubscriptionManager();
  });
  
  test('upgrades subscription tier', async () => {
    const result = await manager.upgradeTier({
      userId: 'test-user',
      currentTier: SubscriptionTier.FREE_TIER,
      newTier: SubscriptionTier.ALL_ACCESS_MONTHLY,
      newPriceId: 'price_test',
    });
    
    expect(result.success).toBe(true);
    expect(result.subscriptionId).toBeDefined();
  });
  
  test('grants access to resources', async () => {
    await manager.grantAccess({
      userId: 'test-user',
      resourceType: 'course',
      resourceId: 'course-123',
    });
    
    const hasAccess = await manager.checkAccess({
      userId: 'test-user',
      resourceType: 'course',
      resourceId: 'course-123',
    });
    
    expect(hasAccess).toBe(true);
  });
});
```

## Common Patterns

### 1. Subscription Upgrade Flow

```
User clicks "Upgrade" 
  → Calculate proration
  → Show proration to user
  → User confirms
  → Call upgradeTier()
  → Grant new tier access
  → Track analytics event
  → Show success message
```

### 2. Access Control Flow

```
User requests resource
  → Check if user has active subscription
  → Check if subscription tier includes resource
  → Check enrollment_access table
  → Grant or deny access
```

### 3. Cancellation Flow

```
User clicks "Cancel"
  → Show cancellation options (immediate vs grace period)
  → User confirms
  → Call cancelSubscription()
  → Update subscription status
  → Schedule access revocation
  → Send confirmation email
```

## Troubleshooting

### Issue: "No active subscription found"
**Solution**: User may not have a subscription. Check if they need to create one first.

### Issue: "Upgrade not allowed"
**Solution**: Check `TIER_CHANGE_RULES` in billing.config.ts for allowed upgrade paths.

### Issue: "Access denied"
**Solution**: Verify subscription is active and tier includes the requested resource.

### Issue: Proration calculation fails
**Solution**: Ensure Stripe subscription exists. FREE_TIER subscriptions don't have Stripe IDs.

## Best Practices

1. **Always calculate proration** before showing upgrade options
2. **Use grace periods** for cancellations to improve retention
3. **Track analytics events** for all subscription changes
4. **Check access** before serving protected content
5. **Handle errors gracefully** with user-friendly messages
6. **Log all operations** for debugging and audit trails

## Support

For issues or questions:
1. Check the main README: `SUBSCRIPTION_MANAGER_README.md`
2. Review the implementation: `SubscriptionManager.ts`
3. Check the completion summary: `SCROLL_BILLING_TASK_9_COMPLETE.md`
