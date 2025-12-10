# ScrollGold Wallet API Integration Guide

## Quick Start

The ScrollGold Wallet API is already integrated into the backend server and ready to use.

### API Base URL
```
http://localhost:3000/api/scrollgold
```

### Authentication
All endpoints require JWT authentication:
```typescript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

---

## Frontend Integration Examples

### 1. Fetch Wallet Balance

```typescript
// React Hook Example
import { useState, useEffect } from 'react';

export const useScrollGoldWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/scrollgold/wallet', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch wallet');
        }

        const { data } = await response.json();
        setWallet(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  return { wallet, loading, error };
};

// Usage in Component
function WalletDisplay() {
  const { wallet, loading, error } = useScrollGoldWallet();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="wallet-card">
      <h2>ScrollGold Wallet</h2>
      <div className="balance">
        <span className="amount">{wallet.currentBalance}</span>
        <span className="label">ScrollGold</span>
      </div>
      <div className="stats">
        <div>Lifetime Earned: {wallet.lifetimeEarned}</div>
        <div>Lifetime Spent: {wallet.lifetimeSpent}</div>
        <div>Module Completions: {wallet.totalModuleCompletions}</div>
        <div>Streak Days: {wallet.totalStreakDays}</div>
      </div>
    </div>
  );
}
```

---

### 2. Apply Discount at Checkout

```typescript
// Discount Application Service
export const applyScrollGoldDiscount = async (
  invoiceAmountCents: number,
  scrollGoldToSpend: number
) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('/api/scrollgold/apply-discount', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      invoiceAmountCents,
      scrollGoldToSpend
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to apply discount');
  }

  return response.json();
};

// Checkout Component
function CheckoutForm({ coursePrice }) {
  const [scrollGoldAmount, setScrollGoldAmount] = useState(0);
  const [discount, setDiscount] = useState(null);
  const { wallet } = useScrollGoldWallet();

  const handleApplyDiscount = async () => {
    try {
      const result = await applyScrollGoldDiscount(
        coursePrice * 100, // Convert to cents
        scrollGoldAmount
      );
      
      setDiscount(result.data);
      
      // Show success message
      toast.success(
        `Applied ${result.data.scrollGoldAmount} ScrollGold for €${result.data.discountValueCents / 100} discount!`
      );
    } catch (error) {
      toast.error(error.message);
    }
  };

  const finalPrice = discount 
    ? (coursePrice * 100 - discount.discountValueCents) / 100
    : coursePrice;

  return (
    <div className="checkout-form">
      <div className="price-summary">
        <div>Original Price: €{coursePrice}</div>
        {discount && (
          <div className="discount">
            Discount: -€{discount.discountValueCents / 100}
          </div>
        )}
        <div className="final-price">
          Final Price: €{finalPrice.toFixed(2)}
        </div>
      </div>

      <div className="scrollgold-section">
        <label>Use ScrollGold (Balance: {wallet?.currentBalance || 0})</label>
        <input
          type="number"
          value={scrollGoldAmount}
          onChange={(e) => setScrollGoldAmount(parseInt(e.target.value) || 0)}
          max={wallet?.currentBalance || 0}
          min={0}
        />
        <button onClick={handleApplyDiscount}>Apply Discount</button>
        <small>100 ScrollGold = €5 discount (max 50% off)</small>
      </div>

      <button className="checkout-button">
        Complete Purchase - €{finalPrice.toFixed(2)}
      </button>
    </div>
  );
}
```

---

### 3. Transaction History

```typescript
// Transaction History Hook
export const useTransactionHistory = (limit = 50) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchTransactions = async (newOffset = 0) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `/api/scrollgold/transactions?limit=${limit}&offset=${newOffset}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const { data } = await response.json();
      
      if (newOffset === 0) {
        setTransactions(data.transactions);
      } else {
        setTransactions(prev => [...prev, ...data.transactions]);
      }
      
      setHasMore(data.pagination.hasMore);
      setOffset(newOffset);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(0);
  }, []);

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchTransactions(offset + limit);
    }
  };

  return { transactions, loading, hasMore, loadMore };
};

// Transaction History Component
function TransactionHistory() {
  const { transactions, loading, hasMore, loadMore } = useTransactionHistory();

  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>
      
      {loading && transactions.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="transactions-list">
            {transactions.map(tx => (
              <div key={tx.id} className="transaction-item">
                <div className="transaction-type">
                  {tx.transactionType === 'EARNED' ? '↑' : '↓'}
                </div>
                <div className="transaction-details">
                  <div className="description">{tx.description}</div>
                  <div className="date">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className={`amount ${tx.transactionType.toLowerCase()}`}>
                  {tx.transactionType === 'EARNED' ? '+' : '-'}
                  {tx.amount}
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button onClick={loadMore} disabled={loading}>
              {loading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
```

---

### 4. Earning Opportunities Display

```typescript
// Earning Opportunities Hook
export const useEarningOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/scrollgold/earning-opportunities', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const { data } = await response.json();
        setOpportunities(data.opportunities);
      } catch (error) {
        console.error('Failed to fetch opportunities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  return { opportunities, loading };
};

// Earning Opportunities Component
function EarningOpportunities() {
  const { opportunities, loading } = useEarningOpportunities();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="earning-opportunities">
      <h2>Ways to Earn ScrollGold</h2>
      
      <div className="opportunities-grid">
        {opportunities.map(opp => (
          <div key={opp.id} className="opportunity-card">
            <div className="opportunity-header">
              <h3>{opp.ruleName}</h3>
              <span className="amount">+{opp.baseAmount} ScrollGold</span>
            </div>
            
            <p className="description">{opp.description}</p>
            
            {opp.minThreshold && (
              <div className="requirement">
                Minimum: {opp.minThreshold}%
              </div>
            )}
            
            {opp.scriptureReference && (
              <div className="scripture">
                📖 {opp.scriptureReference}
              </div>
            )}
            
            {opp.kingdomPrinciple && (
              <div className="principle">
                ✨ {opp.kingdomPrinciple}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 5. Premium Feature Unlocking

```typescript
// Premium Feature Service
export const unlockPremiumFeature = async (
  featureType: 'AI_LAB_HOURS' | 'MENTORSHIP_CIRCLE',
  quantity: number
) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('/api/scrollgold/unlock-premium-feature', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      featureType,
      quantity
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to unlock feature');
  }

  return response.json();
};

// Premium Features Component
function PremiumFeatures() {
  const { wallet } = useScrollGoldWallet();
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = async (featureType, quantity, cost) => {
    if (wallet.currentBalance < cost) {
      toast.error('Insufficient ScrollGold balance');
      return;
    }

    setUnlocking(true);
    try {
      const result = await unlockPremiumFeature(featureType, quantity);
      toast.success(result.data.message);
      
      // Refresh wallet balance
      window.location.reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="premium-features">
      <h2>Premium Features</h2>
      
      <div className="feature-card">
        <h3>Premium AI Lab Hours</h3>
        <p>Access advanced AI tools and unlimited compute time</p>
        <div className="pricing">100 ScrollGold per hour</div>
        <button 
          onClick={() => handleUnlock('AI_LAB_HOURS', 5, 500)}
          disabled={unlocking || wallet.currentBalance < 500}
        >
          Unlock 5 Hours (500 ScrollGold)
        </button>
      </div>

      <div className="feature-card">
        <h3>Mentorship Circle</h3>
        <p>Join exclusive mentorship groups with industry leaders</p>
        <div className="pricing">500 ScrollGold per month</div>
        <button 
          onClick={() => handleUnlock('MENTORSHIP_CIRCLE', 1, 500)}
          disabled={unlocking || wallet.currentBalance < 500}
        >
          Unlock 1 Month (500 ScrollGold)
        </button>
      </div>
    </div>
  );
}
```

---

## Admin Integration Examples

### 1. Bestow ScrollGold

```typescript
// Admin Service
export const bestowScrollGold = async (
  userId: string,
  amount: number,
  reason: string
) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('/api/scrollgold/bestow', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId,
      amount,
      reason
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to bestow ScrollGold');
  }

  return response.json();
};

// Admin Bestow Component
function BestowScrollGold() {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState(100);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    try {
      const result = await bestowScrollGold(userId, amount, reason);
      toast.success(result.data.message);
      
      // Reset form
      setUserId('');
      setAmount(100);
      setReason('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bestow-form">
      <h2>Bestow ScrollGold</h2>
      
      <div className="form-group">
        <label>User ID</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Amount (1-1000)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value))}
          min={1}
          max={1000}
          required
        />
      </div>

      <div className="form-group">
        <label>Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          placeholder="Outstanding service to the community..."
        />
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Bestowing...' : 'Bestow ScrollGold'}
      </button>
    </form>
  );
}
```

---

### 2. Fraud Alert Management

```typescript
// Fraud Alerts Hook
export const useFraudAlerts = (status = 'PENDING_REVIEW') => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `/api/scrollgold/admin/fraud-alerts?status=${status}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const { data } = await response.json();
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Failed to fetch fraud alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [status]);

  return { alerts, loading, refetch: fetchAlerts };
};

// Fraud Alerts Component
function FraudAlerts() {
  const [status, setStatus] = useState('PENDING_REVIEW');
  const { alerts, loading, refetch } = useFraudAlerts(status);

  const handleResolve = async (alertId, resolution, notes) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch('/api/scrollgold/admin/resolve-fraud-alert', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ alertId, resolution, notes })
      });

      toast.success('Alert resolved successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  return (
    <div className="fraud-alerts">
      <h2>Fraud Alerts</h2>
      
      <div className="status-filter">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="UNDER_INVESTIGATION">Under Investigation</option>
          <option value="RESOLVED">Resolved</option>
          <option value="FALSE_POSITIVE">False Positive</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="alerts-list">
          {alerts.map(alert => (
            <div key={alert.id} className="alert-card">
              <div className="alert-header">
                <span className="alert-type">{alert.alertType}</span>
                <span className={`risk-score risk-${alert.riskScore >= 80 ? 'high' : alert.riskScore >= 50 ? 'medium' : 'low'}`}>
                  Risk: {alert.riskScore}
                </span>
              </div>
              
              <div className="alert-details">
                <div>User: {alert.userEmail}</div>
                <div>Balance: {alert.currentBalance} ScrollGold</div>
                <div>Frozen: {alert.isFrozen ? 'Yes' : 'No'}</div>
                <div>Created: {new Date(alert.createdAt).toLocaleString()}</div>
              </div>

              <div className="alert-actions">
                <button onClick={() => handleResolve(alert.id, 'RESOLVED', 'Verified legitimate activity')}>
                  Resolve
                </button>
                <button onClick={() => handleResolve(alert.id, 'FALSE_POSITIVE', 'False alarm')}>
                  Mark False Positive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Testing the API

### Using cURL

```bash
# Get wallet balance
curl -X GET http://localhost:3000/api/scrollgold/wallet \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Apply discount
curl -X POST http://localhost:3000/api/scrollgold/apply-discount \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceAmountCents": 4900,
    "scrollGoldToSpend": 200
  }'

# Bestow ScrollGold (admin only)
curl -X POST http://localhost:3000/api/scrollgold/bestow \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "amount": 100,
    "reason": "Outstanding community service"
  }'
```

### Using Postman

1. Import the API collection from `SCROLLGOLD_API_DOCUMENTATION.md`
2. Set up environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `authToken`: Your JWT token
3. Test each endpoint with sample data

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Handle errors in your frontend:

```typescript
try {
  const response = await fetch('/api/scrollgold/wallet', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  const { data } = await response.json();
  // Handle success
} catch (error) {
  // Handle error
  console.error('API Error:', error.message);
  toast.error(error.message);
}
```

---

## Next Steps

1. **Create React Components**: Build the UI components shown in the examples above
2. **Add State Management**: Consider using Redux or Zustand for global ScrollGold state
3. **Implement Real-time Updates**: Use WebSockets for live balance updates
4. **Add Animations**: Enhance UX with smooth transitions for balance changes
5. **Mobile Optimization**: Ensure responsive design for mobile devices

---

## Support

For questions or issues:
- Check the API documentation: `SCROLLGOLD_API_DOCUMENTATION.md`
- Review the service implementation: `backend/src/services/ScrollGoldBillingService.ts`
- Contact the development team

**Kingdom Economics**: "Store up for yourselves treasures in heaven" (Matthew 6:20)
