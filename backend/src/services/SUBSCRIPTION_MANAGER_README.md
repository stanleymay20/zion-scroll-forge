# SubscriptionManager Service

## Overview

The SubscriptionManager service provides comprehensive subscription management for ScrollUniversity's billing system. It handles tier upgrades/downgrades, access control, analytics, and subscription lifecycle management.

## Features

### 1. Tier Management
- **Upgrade Subscriptions**: Upgrade users from lower to higher tiers with automatic prorated billing
- **Downgrade Subscriptions**: Downgrade users with options for immediate or end-of-period changes
- **Proration Calculation**: Calculate exact proration amounts for tier changes

### 2. Access Control
- **Grant Access**: Automatically grant access to courses, labs, and features based on subscription tier
- **Revoke Access**: Remove access when subscriptions are canceled or downgraded
- **Check Access**: Verify if a user has access to specific resources

### 3. Analytics
- **Subscription Metrics**: Track MRR, ARR, ARPU, LTV, churn rate, and conversion rate
- **Tier Distribution**: Monitor distribution of users across subscription tiers
- **Event Tracking**: Track subscription lifecycle events for analytics

### 4. Cancellation Management
- **Grace Period**: Allow users to maintain access for a period after cancellation
- **Immediate Cancellation**: Option for immediate access revocation
- **Reactivation**: Reactivate canceled subscriptions within grace period

## Usage Examples

### Upgrade a Subscription

```typescript
import { SubscriptionManager } from './services/SubscriptionManager';
import { SubscriptionTier } from './types/billing.types';

const subscriptionManager = new SubscriptionManager();

const result = await subscriptionManager.upgradeTier({
  userId: 'user-123',
  currentTier: SubscriptionTier.ALL_ACCESS_MONTHLY,
  newTier: SubscriptionTier.ELITE_LEADERSHIP,
  newPriceId: 'price_elite_monthly',
});

console.log(result.message); // "Successfully upgraded to ELITE_LEADERSHIP"
console.log(result.proratedAmount); // Amount charged for upgrade
```

### Downgrade a Subscription

```typescript
const result = await subscriptionManager.downgradeTier({
  userId: 'user-123',
  currentTier: SubscriptionTier.ELITE_LEADERSHIP,
  newTier: SubscriptionTier.ALL_ACCESS_MONTHLY,
  newPriceId: 'price_all_access_monthly',
  immediate: false, // Schedule for end of period
});

console.log(result.scheduledFor); // Date when downgrade takes effect
```

### Grant Access to a Resource

```typescript
await subscriptionManager.grantAccess({
  userId: 'user-123',
  resourceType: 'course',
  resourceId: 'course-456',
});
```

### Check Access

```typescript
const hasAccess = await subscriptionManager.checkAccess({
  userId: 'user-123',
  resourceType: 'course',
  resourceId: 'course-456',
});

if (hasAccess) {
  // Allow user to access course
}
```

### Get Subscription Metrics

```typescript
const metrics = await subscriptionManager.getSubscriptionMetrics();

console.log(`MRR: €${metrics.mrrCents / 100}`);
console.log(`ARR: €${metrics.arrCents / 100}`);
console.log(`Churn Rate: ${metrics.churnRate.toFixed(2)}%`);
console.log(`Active Subscriptions: ${metrics.activeSubscriptions}`);
```

### Cancel Subscription with Grace Period

```typescript
const result = await subscriptionManager.cancelSubscription({
  userId: 'user-123',
  subscriptionId: 'sub-789',
  reason: 'User requested cancellation',
  immediate: false,
  gracePeriodDays: 30,
});

console.log(result.accessUntil); // Date when access ends
```

### Reactivate Subscription

```typescript
const result = await subscriptionManager.reactivateSubscription(
  'user-123',
  'sub-789'
);

console.log(result.message); // "Subscription reactivated successfully"
```

## Integration with Other Services

### StripePaymentService
The SubscriptionManager uses StripePaymentService for:
- Tier upgrades/downgrades
- Proration calculations
- Subscription cancellation
- Analytics (MRR, ARR, ARPU, LTV)

### Access Control Integration
When subscriptions change, the SubscriptionManager automatically:
1. Grants access to tier-appropriate resources
2. Revokes access when subscriptions are canceled or downgraded
3. Updates enrollment_access records in the database

### Analytics Integration
All subscription events are tracked for analytics:
- `subscription_created`
- `subscription_upgraded`
- `subscription_downgraded`
- `subscription_canceled`
- `subscription_renewed`

## Database Schema

The SubscriptionManager works with these tables:

### subscriptions
- Stores subscription details, tier, status, and features
- Links to Stripe subscription IDs
- Tracks subscription lifecycle dates

### enrollment_access
- Manages access control for resources
- Links users to courses, labs, and features
- Tracks access grant/revoke dates

### analytics_event
- Records subscription lifecycle events
- Used for analytics and reporting

## Error Handling

The service includes comprehensive error handling:
- Validates tier upgrade/downgrade paths
- Checks subscription ownership
- Handles missing subscriptions gracefully
- Logs all errors with context

## Logging

All operations are logged with structured logging:
```typescript
logger.info('Processing tier upgrade', {
  userId,
  currentTier,
  newTier,
});
```

## Configuration

The service uses configuration from:
- `billing.config.ts`: Product configs, tier rules, analytics settings
- `stripe.config.ts`: Stripe API configuration
- Environment variables: Stripe keys, admin user IDs

## Testing

To test the SubscriptionManager:

```typescript
// Mock Prisma and StripePaymentService
jest.mock('@prisma/client');
jest.mock('./StripePaymentService');

// Test tier upgrade
test('upgrades subscription tier with proration', async () => {
  const manager = new SubscriptionManager();
  const result = await manager.upgradeTier({
    userId: 'test-user',
    currentTier: SubscriptionTier.FREE_TIER,
    newTier: SubscriptionTier.ALL_ACCESS_MONTHLY,
    newPriceId: 'price_test',
  });
  
  expect(result.success).toBe(true);
  expect(result.subscriptionId).toBeDefined();
});
```

## Best Practices

1. **Always check subscription ownership** before making changes
2. **Use grace periods** for cancellations to improve user experience
3. **Track analytics events** for all subscription changes
4. **Grant/revoke access automatically** when subscriptions change
5. **Calculate proration** before showing upgrade/downgrade options to users
6. **Handle errors gracefully** and provide clear error messages

## Future Enhancements

- Subscription pause/resume functionality
- Custom billing cycles
- Volume discounts for institutional plans
- Automated dunning management
- Subscription health scoring
