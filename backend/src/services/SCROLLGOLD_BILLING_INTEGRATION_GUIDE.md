# ScrollGold Billing Integration Guide

## Overview

The ScrollGoldBillingIntegrationService provides a comprehensive system for awarding ScrollGold to students based on their achievements, consistency, service, and faithfulness. This guide shows how to integrate the service into your application.

## Quick Start

```typescript
import ScrollGoldBillingIntegrationService from './services/ScrollGoldBillingIntegrationService';

const scrollGoldService = ScrollGoldBillingIntegrationService.getInstance();
```

## Use Cases

### 1. Award Module Completion Reward

When a student completes a module with 80%+ score:

```typescript
const transaction = await scrollGoldService.awardModuleCompletionReward({
  userId: 'user-123',
  moduleId: 'module-456',
  courseId: 'course-789',
  score: 85, // Must be >= 80
  completedAt: new Date()
});

console.log(`Awarded ${transaction.amount} ScrollGold`);
// Output: Awarded 50 ScrollGold
```

**Features:**
- Validates 80% minimum score
- Prevents duplicate rewards
- Tracks module completion stats
- Links to course and module

### 2. Award Daily Streak Bonus

When a student maintains their daily learning streak:

```typescript
const transaction = await scrollGoldService.awardDailyStreakReward({
  userId: 'user-123',
  streakDays: 7, // Current streak length
  lastActivityDate: new Date()
});

console.log(`Awarded ${transaction.amount} ScrollGold for ${streakDays} day streak`);
// Output: Awarded 20 ScrollGold for 7 day streak (10 base + 10 milestone bonus)
```

**Milestone Bonuses:**
- 7-day streak: +10 ScrollGold bonus
- 30-day streak: +20 ScrollGold bonus
- Daily cooldown prevents multiple claims

### 3. Award Community Service

When a student contributes to the community:

```typescript
const transaction = await scrollGoldService.awardCommunityServiceReward({
  userId: 'user-123',
  serviceType: 'peer_tutoring',
  hours: 2,
  description: 'Helped 3 students with calculus homework',
  verifiedBy: 'admin-456' // Optional, for verification
});

console.log(`Awarded ${transaction.amount} ScrollGold for ${hours} hours of service`);
// Output: Awarded 50 ScrollGold for 2 hours of service
```

**Service Types:**
- `peer_tutoring` - Helping fellow students
- `project_contribution` - Contributing to community projects
- `mentorship` - Mentoring newer students
- `content_creation` - Creating helpful resources

### 4. Award Faithful Payment Bonus

When a subscription payment succeeds (called from webhook handler):

```typescript
const transaction = await scrollGoldService.awardFaithfulPaymentBonus({
  userId: 'user-123',
  subscriptionId: 'sub-456',
  paymentId: 'pay-789',
  consecutivePayments: 3
});

console.log(`Awarded ${transaction.amount} ScrollGold for faithful payment`);
// Output: Awarded 20 ScrollGold for faithful payment
```

**Integration Point:**
This should be called from `StripeWebhookHandler.handleInvoicePaymentSucceeded()`

### 5. Bestow ScrollGold (Admin Only)

When an administrator wants to honor exceptional contributions:

```typescript
const transaction = await scrollGoldService.bestowScrollGold({
  userId: 'user-123',
  amount: 500,
  reason: 'Outstanding research paper on kingdom economics',
  bestowedBy: 'admin-456',
  metadata: {
    paperTitle: 'Kingdom Economics in Modern Education',
    publicationDate: '2024-01-15'
  }
});

console.log(`Bestowed ${transaction.amount} ScrollGold`);
// Output: Bestowed 500 ScrollGold
```

**Use Cases:**
- Exceptional academic work
- Outstanding service contributions
- Leadership excellence
- Spiritual growth milestones

### 6. Display Earning Opportunities

Show students how they can earn more ScrollGold:

```typescript
const opportunities = await scrollGoldService.getEarningOpportunities('user-123');

opportunities.forEach(opp => {
  console.log(`${opp.title}: Earn ${opp.potentialEarning} ScrollGold`);
  console.log(`Requirements: ${opp.requirements.join(', ')}`);
  console.log(`Action: ${opp.actionUrl}\n`);
});
```

**Output Example:**
```
Complete Course Modules: Earn 50 ScrollGold
Requirements: Complete module assignments, Score 80% or higher, Submit all required work
Action: /courses

Maintain Daily Learning Streak: Earn 10 ScrollGold
Requirements: Log in daily, Complete at least one learning activity, Maintain consecutive days
Action: /dashboard
```

## Webhook Integration

### Invoice Payment Succeeded

In `StripeWebhookHandler.ts`:

```typescript
async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  // ... existing code ...

  // Award faithful payment bonus
  const consecutivePayments = await this.getConsecutivePaymentCount(userId);
  
  await scrollGoldService.awardFaithfulPaymentBonus({
    userId,
    subscriptionId: subscription.id,
    paymentId: payment.id,
    consecutivePayments
  });

  logger.info('Faithful payment bonus awarded', { userId, paymentId: payment.id });
}
```

## Course System Integration

### Module Completion Handler

In your course completion logic:

```typescript
async handleModuleCompletion(userId: string, moduleId: string, score: number) {
  // ... existing completion logic ...

  // Award ScrollGold if score is 80%+
  if (score >= 80) {
    try {
      await scrollGoldService.awardModuleCompletionReward({
        userId,
        moduleId,
        courseId: module.courseId,
        score,
        completedAt: new Date()
      });
    } catch (error) {
      // Log but don't fail the completion
      logger.error('Failed to award module completion reward', { error, userId, moduleId });
    }
  }
}
```

## Error Handling

All methods throw descriptive errors that should be caught and handled:

```typescript
try {
  const transaction = await scrollGoldService.awardModuleCompletionReward(request);
  // Success
} catch (error) {
  if (error.message === 'Score must be 80% or higher to earn ScrollGold reward') {
    // Handle low score
  } else if (error.message === 'Reward already claimed for this module') {
    // Handle duplicate
  } else {
    // Handle other errors
    logger.error('Unexpected error awarding reward', { error });
  }
}
```

## Common Error Messages

- `"Score must be 80% or higher to earn ScrollGold reward"` - Score below threshold
- `"Reward already claimed for this module"` - Duplicate prevention
- `"Daily streak reward already claimed today"` - Cooldown active
- `"Wallet not found"` - User wallet not initialized
- `"Module completion earning rule not found"` - Configuration issue

## Wallet Information

Get comprehensive wallet information:

```typescript
const walletInfo = await scrollGoldService.getWalletInfo('user-123');

console.log(`Balance: ${walletInfo.balance} ScrollGold`);
console.log(`Lifetime Earned: ${walletInfo.lifetimeEarned}`);
console.log(`Lifetime Spent: ${walletInfo.lifetimeSpent}`);
console.log(`From Modules: ${walletInfo.earnedFromModules}`);
console.log(`From Streaks: ${walletInfo.earnedFromStreaks}`);
console.log(`From Service: ${walletInfo.earnedFromService}`);
```

## Testing

### Unit Test Example

```typescript
describe('ScrollGoldBillingIntegrationService', () => {
  it('should award module completion reward for 80%+ score', async () => {
    const transaction = await scrollGoldService.awardModuleCompletionReward({
      userId: 'test-user',
      moduleId: 'test-module',
      courseId: 'test-course',
      score: 85,
      completedAt: new Date()
    });

    expect(transaction.amount).toBe(50);
    expect(transaction.type).toBe('earn');
    expect(transaction.category).toBe('module_completion');
  });

  it('should reject module completion reward for score below 80%', async () => {
    await expect(
      scrollGoldService.awardModuleCompletionReward({
        userId: 'test-user',
        moduleId: 'test-module',
        courseId: 'test-course',
        score: 75,
        completedAt: new Date()
      })
    ).rejects.toThrow('Score must be 80% or higher');
  });
});
```

## Configuration

Earning rules are configured in the database (`scrollgold_earning_rules` table):

```sql
-- View current earning rules
SELECT rule_name, rule_type, base_amount, max_amount, is_active
FROM scrollgold_earning_rules
WHERE is_active = true;

-- Update module completion reward amount
UPDATE scrollgold_earning_rules
SET base_amount = 75
WHERE rule_type = 'MODULE_COMPLETION';
```

## Monitoring

Key metrics to monitor:

1. **Earning Rate** - ScrollGold awarded per day/week
2. **Category Distribution** - Which earning methods are most used
3. **Fraud Flags** - Suspicious activity detection
4. **Verification Queue** - Pending community service verifications
5. **Wallet Balances** - Average and total ScrollGold in circulation

## Best Practices

1. **Always validate input** - Check scores, hours, amounts before calling
2. **Handle errors gracefully** - Don't fail core operations if reward fails
3. **Log all operations** - Track rewards for analytics and debugging
4. **Use transactions** - Ensure atomic operations for critical paths
5. **Monitor fraud** - Watch for unusual patterns in earning
6. **Verify high-value rewards** - Use verification workflow for large amounts

## Support

For questions or issues:
- Check logs in `backend/logs/`
- Review database tables: `scrollgold_earning_events`, `scrollgold_transactions`
- Contact: ScrollUniversity Development Team

## Kingdom Economics Principles

Remember the spiritual foundation:
- **Excellence honors God** - Reward quality work
- **Consistency builds character** - Encourage daily habits
- **Service reflects Christ** - Recognize helping others
- **Faithfulness matters** - Honor financial responsibility
- **Grace abounds** - Bestow generously for exceptional contributions
