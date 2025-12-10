# ScrollGold Wallet API Documentation

"Store up for yourselves treasures in heaven" (Matthew 6:20)

## Overview

The ScrollGold Wallet API provides comprehensive endpoints for managing ScrollGold - ScrollUniversity's internal loyalty/honor points system. ScrollGold is NOT cryptocurrency - it's a simple database-backed credit system similar to Google Play credits or AWS credits.

**Base URL**: `/api/scrollgold`

**Authentication**: All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

**Validates**: Requirements 11.4, 11.6

---

## Public Endpoints (Authenticated Users)

### GET /wallet

Get user's wallet balance and comprehensive statistics.

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "currentBalance": 250,
    "lifetimeEarned": 500,
    "lifetimeSpent": 250,
    "totalModuleCompletions": 10,
    "totalStreakDays": 15,
    "totalCommunityServiceHours": 5,
    "totalFaithfulPayments": 3,
    "isFrozen": false
  }
}
```

---

### GET /transactions

Get user's transaction history with pagination.

**Query Parameters**:
- `limit` (number, optional): Number of transactions to return (default: 50, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)

**Response**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "transactionType": "EARNED",
        "amount": 50,
        "description": "Module completion",
        "createdAt": "2025-01-15T10:30:00Z",
        "billingRelated": false,
        "earningRuleName": "Module Completion"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

---

### GET /earning-opportunities

Get available earning opportunities for student motivation.

**Response**:
```json
{
  "success": true,
  "data": {
    "opportunities": [
      {
        "id": "uuid",
        "ruleName": "Module Completion",
        "ruleType": "MODULE_COMPLETION",
        "description": "Complete a module with 80%+ score",
        "baseAmount": 50,
        "minThreshold": 80,
        "maxAmount": 50,
        "scriptureReference": "Proverbs 16:3",
        "kingdomPrinciple": "Excellence in learning"
      }
    ]
  }
}
```

---

### GET /spending-options

Get available spending options.

**Response**:
```json
{
  "success": true,
  "data": {
    "options": [
      {
        "id": "uuid",
        "optionName": "Course Discount",
        "optionType": "BILLING_DISCOUNT",
        "description": "Apply discount to course purchases",
        "costAmount": 100,
        "discountValueCents": 500,
        "maxDiscountPercentage": 50
      }
    ]
  }
}
```

---

### POST /apply-discount

Apply ScrollGold discount to a purchase (100 ScrollGold = €5, max 50% discount).

**Request Body**:
```json
{
  "invoiceAmountCents": 4900,
  "scrollGoldToSpend": 200
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "scrollGoldAmount": 200,
    "discountValueCents": 1000,
    "remainingBalance": 50,
    "maxDiscountReached": false
  }
}
```

**Validation Rules**:
- 100 ScrollGold = €5 discount (500 cents)
- Maximum 50% discount on any purchase
- User must have sufficient balance

---

### GET /calculate-max-discount

Calculate maximum possible ScrollGold discount for an invoice.

**Query Parameters**:
- `invoiceAmountCents` (number, required): Invoice amount in cents

**Response**:
```json
{
  "success": true,
  "data": {
    "maxScrollGoldUsable": 490,
    "maxDiscountCents": 2450,
    "userBalance": 500,
    "canAfford": true
  }
}
```

---

### POST /unlock-premium-feature

Unlock premium features with ScrollGold.

**Request Body**:
```json
{
  "featureType": "AI_LAB_HOURS",
  "quantity": 5
}
```

**Feature Types**:
- `AI_LAB_HOURS`: Premium AI lab hours (100 ScrollGold per hour)
- `MENTORSHIP_CIRCLE`: Mentorship circle access (500 ScrollGold per month)

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Successfully unlocked 5 premium AI lab hours",
    "expiresAt": "2025-02-15T10:30:00Z"
  }
}
```

---

### GET /feature-access/:featureCode

Check if user has access to a premium feature.

**Path Parameters**:
- `featureCode` (string): Feature code (e.g., "AI_LAB_HOURS", "MENTORSHIP_CIRCLE")

**Response**:
```json
{
  "success": true,
  "data": {
    "hasAccess": true,
    "expiresAt": "2025-02-15T10:30:00Z",
    "hoursRemaining": 3
  }
}
```

---

### POST /purchase-governance-votes

Purchase governance votes with ScrollGold (50 ScrollGold per vote).

**Request Body**:
```json
{
  "voteCount": 10,
  "proposalId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Successfully purchased 10 governance vote(s)",
    "totalVotes": 15
  }
}
```

---

### GET /governance-voting-power

Get user's governance voting power.

**Query Parameters**:
- `proposalId` (string, optional): Specific proposal ID

**Response**:
```json
{
  "success": true,
  "data": {
    "totalVotesPurchased": 15,
    "votesRemaining": 10,
    "votesUsed": 5,
    "canVote": true
  }
}
```

---

## Admin Endpoints (Admin/Finance Role Required)

### POST /bestow

Bestow ScrollGold to a user (admin honor-based awards).

**Request Body**:
```json
{
  "userId": "uuid",
  "amount": 100,
  "reason": "Outstanding service to the community"
}
```

**Validation**:
- Amount must be between 1 and 1000 ScrollGold
- Reason is required

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Successfully bestowed 100 ScrollGold to user"
  }
}
```

---

### GET /admin/fraud-alerts

Get fraud alerts for admin review.

**Query Parameters**:
- `status` (string, optional): Alert status (default: "PENDING_REVIEW")
  - Options: "PENDING_REVIEW", "UNDER_INVESTIGATION", "RESOLVED", "FALSE_POSITIVE"
- `limit` (number, optional): Number of alerts (default: 50, max: 100)

**Response**:
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "uuid",
        "userId": "uuid",
        "alertType": "HIGH_RISK_TRANSACTION",
        "riskScore": 85,
        "context": {},
        "status": "PENDING_REVIEW",
        "createdAt": "2025-01-15T10:30:00Z",
        "userEmail": "user@example.com",
        "currentBalance": 250,
        "isFrozen": false
      }
    ]
  }
}
```

---

### POST /admin/resolve-fraud-alert

Resolve a fraud alert.

**Request Body**:
```json
{
  "alertId": "uuid",
  "resolution": "RESOLVED",
  "notes": "Verified legitimate activity"
}
```

**Resolution Options**:
- `RESOLVED`: Alert resolved, activity was legitimate
- `FALSE_POSITIVE`: Alert was incorrect

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Alert resolved successfully"
  }
}
```

---

### POST /admin/freeze-wallet

Freeze a user's wallet due to suspicious activity.

**Request Body**:
```json
{
  "userId": "uuid",
  "reason": "Suspicious transaction patterns detected"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Wallet frozen successfully"
  }
}
```

---

### POST /admin/unfreeze-wallet

Unfreeze a user's wallet after review.

**Request Body**:
```json
{
  "userId": "uuid",
  "notes": "Investigation complete, no fraud detected"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Wallet unfrozen successfully"
  }
}
```

---

### GET /admin/balance-integrity/:userId

Check balance integrity for a user.

**Path Parameters**:
- `userId` (string): User ID to check

**Response**:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "currentBalance": 250,
    "calculatedBalance": 250,
    "discrepancy": 0,
    "requiresCorrection": false
  }
}
```

---

### POST /admin/correct-balance

Correct balance discrepancies (admin only).

**Request Body**:
```json
{
  "userId": "uuid",
  "reason": "Database migration correction"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Balance corrected successfully",
    "correctedAmount": 10
  }
}
```

---

### GET /admin/manipulation-check/:userId

Run comprehensive balance manipulation check.

**Path Parameters**:
- `userId` (string): User ID to check

**Response**:
```json
{
  "success": true,
  "data": {
    "isClean": true,
    "issues": [],
    "riskScore": 0,
    "recommendedAction": "NONE"
  }
}
```

**Recommended Actions**:
- `NONE`: No action needed
- `MONITOR`: Monitor user activity
- `REVIEW`: Manual review recommended
- `FREEZE`: Freeze wallet immediately

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes**:
- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `500`: Internal Server Error

---

## ScrollGold Economy Rules

### Earning Rules

1. **Module Completion**: 50 ScrollGold for completing a module with 80%+ score
2. **Daily Streak**: 10 ScrollGold per day of consecutive study
3. **Community Service**: 25 ScrollGold for community contributions
4. **Faithful Payment**: 20 ScrollGold per recurring subscription payment
5. **Admin Bestowment**: Variable amount for honor-based awards

### Spending Options

1. **Course Discount**: 100 ScrollGold = €5 discount (max 50% off)
2. **Premium AI Lab Hours**: 100 ScrollGold per hour
3. **Mentorship Circle**: 500 ScrollGold per month
4. **Governance Votes**: 50 ScrollGold per vote

### Fraud Prevention

The system includes comprehensive fraud detection:
- Transaction velocity monitoring
- Balance integrity verification
- Duplicate transaction detection
- Suspicious pattern recognition
- Automatic wallet freezing for high-risk activity

---

## Integration Example

```typescript
// Fetch wallet balance
const response = await fetch('/api/scrollgold/wallet', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const { data } = await response.json();
console.log(`Current balance: ${data.currentBalance} ScrollGold`);

// Apply discount at checkout
const discountResponse = await fetch('/api/scrollgold/apply-discount', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    invoiceAmountCents: 4900, // €49.00
    scrollGoldToSpend: 200
  })
});

const { data: discount } = await discountResponse.json();
console.log(`Discount applied: €${discount.discountValueCents / 100}`);
```

---

## Kingdom Economics Principles

The ScrollGold system embodies kingdom economics:

1. **Reward Excellence**: Students earn through achievement and faithfulness
2. **Enable Access**: ScrollGold reduces financial barriers to education
3. **Honor Service**: Community contributions are recognized and rewarded
4. **Transparent Value**: Clear conversion rates and spending options
5. **Fraud Prevention**: Protects the integrity of the economy
6. **Grace-Based**: Admin bestowment allows for honor-based recognition

"Whatever you do, work heartily, as for the Lord and not for men" (Colossians 3:23)
