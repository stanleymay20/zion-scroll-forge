# SubscriptionManager Quick Reference

## Import

```typescript
import { SubscriptionManager } from './services/SubscriptionManager';
import { SubscriptionTier } from './types/billing.types';

const manager = new SubscriptionManager();
```

## Core Methods

### Tier Management

```typescript
// Upgrade
await manager.upgradeTier({
  userId, currentTier, newTier, newPriceId
});

// Downgrade
await manager.downgradeTier({
  userId, currentTier, newTier, newPriceId, immediate: false
});

// Calculate proration
await manager.calculateProration(userId, currentTier, newTier, newPriceId);
```

### Access Control

```typescript
// Grant access
await manager.grantAccess({ userId, resourceType, resourceId });

// Revoke access
await manager.revokeAccess({ userId, resourceType, resourceId });

// Check access
const hasAccess = await manager.checkAccess({ userId, resourceType, resourceId });
```

### Analytics

```typescript
// Get all metrics
const metrics = await manager.getSubscriptionMetrics();

// Specific metrics
const churnRate = await manager.calculateChurnRate(30); // 30 days
const ltv = await manager.getLifetimeValue(userId);
```

### Cancellation

```typescript
// Cancel with grace period
await manager.cancelSubscription({
  userId, subscriptionId, reason, immediate: false, gracePeriodDays: 30
});

// Reactivate
await manager.reactivateSubscription(userId, subscriptionId);
```

### Helpers

```typescript
// Get active subscription
const sub = await manager.getActiveSubscription(userId);

// Check if has active subscription
const hasActive = await manager.hasActiveSubscription(userId);

// Get user's tier
const tier = await manager.getUserTier(userId);

// Get subscription history
const history = await manager.getSubscriptionHistory(userId);
```

## Resource Types

- `'course'` - Individual courses
- `'program'` - Degree programs
- `'lab'` - Lab access
- `'feature'` - Premium features (scrollintel, scrollark, mentorship)
- `'mentorship'` - Mentorship circles

## Subscription Tiers

```typescript
SubscriptionTier.FREE_TIER
SubscriptionTier.SINGLE_COURSE
SubscriptionTier.ALL_ACCESS_MONTHLY
SubscriptionTier.ALL_ACCESS_YEARLY
SubscriptionTier.PROGRAM_TRACK
SubscriptionTier.ELITE_LEADERSHIP
SubscriptionTier.INSTITUTIONAL
```

## Common Patterns

### Check Access Middleware

```typescript
async function checkAccess(req, res, next) {
  const hasAccess = await manager.checkAccess({
    userId: req.user.id,
    resourceType: 'course',
    resourceId: req.params.courseId,
  });
  
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}
```

### Upgrade Endpoint

```typescript
app.post('/api/subscriptions/upgrade', async (req, res) => {
  const { newTier, newPriceId } = req.body;
  const sub = await manager.getActiveSubscription(req.user.id);
  
  const result = await manager.upgradeTier({
    userId: req.user.id,
    currentTier: sub.tier,
    newTier,
    newPriceId,
  });
  
  res.json(result);
});
```

### Analytics Dashboard

```typescript
app.get('/api/admin/metrics', async (req, res) => {
  const metrics = await manager.getSubscriptionMetrics();
  res.json({
    mrr: metrics.mrrCents / 100,
    arr: metrics.arrCents / 100,
    churnRate: metrics.churnRate,
    activeUsers: metrics.activeSubscriptions,
  });
});
```

## Return Types

### upgradeTier / downgradeTier

```typescript
{
  success: boolean;
  subscriptionId: string;
  proratedAmount?: number;
  scheduledFor?: Date;
  message: string;
}
```

### calculateProration

```typescript
{
  proratedAmountCents: number;
  currency: string;
  creditAmountCents: number;
  chargeAmountCents: number;
}
```

### getSubscriptionMetrics

```typescript
{
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
```

### cancelSubscription

```typescript
{
  success: boolean;
  subscriptionId: string;
  canceledAt: Date;
  accessUntil: Date;
  message: string;
}
```

## Error Handling

All methods throw errors with descriptive messages:

```typescript
try {
  await manager.upgradeTier({ ... });
} catch (error) {
  console.error(error.message);
  // "Upgrade from FREE_TIER to INSTITUTIONAL is not allowed"
  // "No active subscription found"
  // "Unauthorized: Subscription does not belong to user"
}
```

## Logging

All operations are logged:

```typescript
logger.info('Processing tier upgrade', { userId, currentTier, newTier });
logger.info('Access granted', { userId, resourceType, resourceId });
logger.error('Error upgrading tier', { error, userId });
```

## Configuration

Uses configuration from:
- `billing.config.ts` - Product configs, tier rules
- `stripe.config.ts` - Stripe settings
- Environment variables - Stripe keys

## Dependencies

- `StripePaymentService` - For Stripe operations
- `PrismaClient` - For database operations
- `logger` - For structured logging

## Database Tables

- `subscriptions` - Subscription records
- `enrollment_access` - Access control
- `analytics_event` - Event tracking
- `payments` - Payment history

## Notes

- FREE_TIER subscriptions don't have Stripe IDs
- Proration only applies to paid tiers
- Grace periods default to end of current period
- All tier changes are tracked for analytics
- Access is automatically managed on tier changes
