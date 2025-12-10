# Webhook-Driven Access Control System
## ScrollUniversity Billing Agent - Task 10 Implementation

"Give to Caesar what is Caesar's, and to God what is God's" (Matthew 22:21)

## Overview

The webhook-driven access control system automatically manages student access to courses, features, and resources based on their subscription status and payment events. This system ensures that:

1. **Access is granted immediately** upon successful payment
2. **Access is revoked appropriately** when subscriptions are canceled
3. **Grace periods are honored** for failed payments
4. **All operations are audited** for compliance and accountability

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Stripe Webhooks                           │
│  - checkout.session.completed                                │
│  - invoice.payment_succeeded                                 │
│  - invoice.payment_failed                                    │
│  - customer.subscription.deleted                             │
│  - customer.subscription.updated                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              StripeWebhookHandler                            │
│  - Verify webhook signatures                                 │
│  - Check idempotency                                         │
│  - Process events in transactions                            │
│  - Log all operations                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌──────────────────────┐    ┌──────────────────────┐
│  Access Control      │    │  Audit Logging       │
│  - Grant access      │    │  - Log all events    │
│  - Revoke access     │    │  - Compliance        │
│  - Extend periods    │    │  - Reporting         │
└──────────────────────┘    └──────────────────────┘
```

## Key Components

### 1. StripeWebhookHandler

Located: `backend/src/services/StripeWebhookHandler.ts`

Handles all Stripe webhook events and orchestrates access control operations.

**Key Methods:**
- `handleCheckoutCompleted()` - Grant access on payment success
- `handleInvoicePaymentSucceeded()` - Extend access on recurring payment
- `handleInvoicePaymentFailed()` - Implement grace period
- `handleSubscriptionDeleted()` - Revoke access on cancellation
- `handleSubscriptionUpdated()` - Handle tier changes

### 2. AccessAuditLogger

Located: `backend/src/services/AccessAuditLogger.ts`

Provides comprehensive audit logging for all access control operations.

**Key Methods:**
- `logAccessGranted()` - Log when access is granted
- `logAccessRevoked()` - Log when access is revoked
- `logAccessExtended()` - Log when access period is extended
- `logGracePeriodStarted()` - Log grace period initiation
- `getUserAuditLogs()` - Query audit logs for a user
- `generateComplianceReport()` - Generate compliance reports

### 3. Database Tables

**subscriptions** - Stores subscription records
**enrollment_access** - Stores access control records
**webhook_events** - Logs webhook processing for idempotency
**access_audit_logs** - Immutable audit trail

## Webhook Event Flows

### Flow 1: Successful Checkout (Task 10.1)

```
1. Student completes checkout on Stripe
2. Stripe sends checkout.session.completed webhook
3. StripeWebhookHandler receives webhook
4. Verify webhook signature
5. Check idempotency (prevent duplicate processing)
6. Start database transaction:
   a. Initialize ScrollGold wallet (if not exists)
   b. Create subscription record
   c. Record payment
   d. Grant access based on tier
   e. Award welcome ScrollGold bonus
   f. Log all operations to audit trail
7. Commit transaction
8. Mark webhook as processed
```

**Access Granting Logic:**
- **FREE_TIER**: Access to free courses only
- **SINGLE_COURSE**: Access to specific purchased course
- **ALL_ACCESS_MONTHLY/YEARLY**: Access to all courses + labs
- **ELITE_LEADERSHIP**: Access to everything + premium features
- **INSTITUTIONAL**: Full access with institutional features

### Flow 2: Recurring Payment Success

```
1. Stripe processes recurring payment
2. Stripe sends invoice.payment_succeeded webhook
3. StripeWebhookHandler receives webhook
4. Start database transaction:
   a. Extend subscription period
   b. Extend all enrollment access records
   c. Record payment
   d. Award loyalty ScrollGold bonus
   e. Log operations to audit trail
5. Commit transaction
```

### Flow 3: Payment Failure with Grace Period (Task 10.3)

```
1. Stripe payment fails
2. Stripe sends invoice.payment_failed webhook
3. StripeWebhookHandler receives webhook
4. Start database transaction:
   a. Update subscription status to PAST_DUE
   b. Record failed payment
   c. Implement grace period (7 days default)
   d. Update access records with grace period expiry
   e. Log grace period start to audit trail
5. Commit transaction
6. Send payment failure notification to student
```

**Grace Period Behavior:**
- Default: 7 days (configurable via PAYMENT_CONFIG.GRACE_PERIOD_DAYS)
- Access remains active during grace period
- Student receives notification with retry instructions
- Stripe automatically retries payment (3, 7, 14 days)
- If payment succeeds during grace period, access continues normally
- If grace period expires, access is revoked

### Flow 4: Subscription Cancellation (Task 10.2)

```
1. Student cancels subscription or Stripe cancels due to failed payments
2. Stripe sends customer.subscription.deleted webhook
3. StripeWebhookHandler receives webhook
4. Start database transaction:
   a. Update subscription status to CANCELED
   b. For each enrollment access record:
      - If course is COMPLETED: Maintain lifetime access
      - If course is INCOMPLETE: Revoke access
      - If resource is non-course (lab, feature): Revoke access
   c. Log all revocations to audit trail
5. Commit transaction
```

**Access Revocation Rules:**
- **Completed courses**: Lifetime access maintained (kingdom grace)
- **Incomplete courses**: Access revoked immediately
- **Labs and features**: Access revoked immediately
- **Premium features**: Access revoked immediately

### Flow 5: Tier Change

```
1. Student upgrades or downgrades tier
2. Stripe sends customer.subscription.updated webhook
3. StripeWebhookHandler receives webhook
4. Start database transaction:
   a. Update subscription tier
   b. Revoke old tier access
   c. Grant new tier access
   d. Log tier change to audit trail
5. Commit transaction
```

## Audit Logging (Task 10.4)

All access control operations are logged to the `access_audit_logs` table for compliance and accountability.

### Audit Event Types

- `ACCESS_GRANTED` - Access granted to a resource
- `ACCESS_REVOKED` - Access revoked from a resource
- `ACCESS_EXTENDED` - Access period extended
- `SUBSCRIPTION_CREATED` - New subscription created
- `SUBSCRIPTION_CANCELED` - Subscription canceled
- `PAYMENT_SUCCEEDED` - Payment processed successfully
- `PAYMENT_FAILED` - Payment failed
- `GRACE_PERIOD_STARTED` - Grace period initiated
- `TIER_UPGRADED` - Subscription tier upgraded
- `TIER_DOWNGRADED` - Subscription tier downgraded

### Audit Log Structure

```typescript
{
  eventType: 'ACCESS_GRANTED',
  userId: 'uuid',
  entityType: 'enrollment_access',
  entityId: 'resource-uuid',
  action: 'grant_access',
  details: {
    resourceType: 'course',
    resourceId: 'course-uuid',
    subscriptionId: 'sub-uuid',
    tier: 'ALL_ACCESS_MONTHLY'
  },
  timestamp: '2025-12-28T10:00:00Z'
}
```

### Compliance Reporting

The system provides several compliance reporting functions:

1. **User Audit Summary**: Get summary of all events for a user
2. **Compliance Report**: Get metrics for a date range
3. **Subscription Timeline**: Get chronological history of a subscription

Example queries:

```sql
-- Get user audit summary for last 30 days
SELECT * FROM get_user_audit_summary('user-uuid');

-- Get compliance report for December 2025
SELECT * FROM get_compliance_report(
  '2025-12-01'::timestamptz,
  '2025-12-31'::timestamptz
);

-- Get subscription timeline
SELECT * FROM get_subscription_timeline('sub-uuid');
```

## Security Considerations

### Webhook Security

1. **Signature Verification**: All webhooks verified using Stripe webhook secret
2. **Idempotency**: Duplicate events are detected and ignored
3. **HTTPS Only**: Webhooks only accepted over HTTPS
4. **Rate Limiting**: Webhook endpoints are rate-limited

### Access Control Security

1. **Row-Level Security (RLS)**: Supabase RLS policies enforce access control
2. **Service Role**: Webhook handler uses service role for admin operations
3. **Immutable Audit Trail**: Audit logs cannot be updated or deleted
4. **Transaction Safety**: All operations in database transactions

### Data Protection

1. **PCI Compliance**: No card data stored directly
2. **GDPR Compliance**: Audit logs retained for 7 years, then archived
3. **Encryption**: All data encrypted at rest and in transit

## Configuration

### Environment Variables

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Payment Configuration
PAYMENT_CONFIG_GRACE_PERIOD_DAYS=7
PAYMENT_CONFIG_RETRY_ATTEMPTS=3

# ScrollGold Configuration
SCROLLGOLD_FAITHFUL_PAYMENT_BONUS=20
```

### Webhook Endpoint

Register this endpoint in Stripe Dashboard:
```
https://api.scrolluniversity.com/webhooks/stripe
```

Events to subscribe to:
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Testing

### Test Webhook Events

Use Stripe CLI to test webhook events locally:

```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:3000/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted
```

### Test Access Control

```typescript
// Test access grant
const result = await stripeWebhookHandler.handleCheckoutCompleted(mockSession);

// Verify access was granted
const access = await supabase
  .from('enrollment_access')
  .select('*')
  .eq('user_id', userId)
  .eq('is_active', true);

// Verify audit log was created
const auditLogs = await accessAuditLogger.getUserAuditLogs(userId);
```

## Monitoring

### Key Metrics to Monitor

1. **Webhook Processing Success Rate**: Should be > 99%
2. **Access Grant Latency**: Should be < 2 seconds
3. **Audit Log Completeness**: All operations should be logged
4. **Grace Period Conversions**: Track payment recovery rate

### Alerts

Set up alerts for:
- Webhook processing failures
- High payment failure rates
- Grace period expirations
- Audit log gaps

## Troubleshooting

### Common Issues

**Issue**: Webhook signature verification fails
**Solution**: Verify STRIPE_WEBHOOK_SECRET is correct

**Issue**: Duplicate access grants
**Solution**: Check idempotency logic in webhook handler

**Issue**: Access not revoked on cancellation
**Solution**: Verify subscription.deleted webhook is being received

**Issue**: Audit logs missing
**Solution**: Check Supabase service role permissions

## Kingdom Economics Principles

This system embodies kingdom economics principles:

1. **Grace**: Completed courses maintain lifetime access even after cancellation
2. **Faithfulness**: Loyal students receive ScrollGold bonuses
3. **Transparency**: All operations are audited and visible
4. **Stewardship**: Resources are managed efficiently and fairly
5. **Accountability**: Immutable audit trail ensures integrity

## References

- Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
- Design Document: `.kiro/specs/scroll-billing-agent/design.md`
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security

