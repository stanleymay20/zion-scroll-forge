# ScrollCoin Wallet Components

This directory contains all frontend components for the ScrollCoin wallet system, implementing the kingdom economy features of ScrollUniversity.

## Components Overview

### WalletDashboard
Main dashboard displaying wallet balance, statistics, and quick actions.

**Features:**
- Current balance display with USD conversion
- Total earned, spent, and net rewards
- Weekly and monthly statistics
- Transaction analytics
- Quick action buttons
- Kingdom economy messaging

**Props:**
- `wallet`: ScrollCoinWallet object
- `onRefresh`: Callback to refresh wallet data

### TransactionHistory
Comprehensive transaction history with filtering and blockchain verification.

**Features:**
- Paginated transaction list
- Filter by type, status, date range
- Search functionality
- Transaction status badges
- Blockchain explorer links
- CSV export functionality

**Props:**
- None (fetches data internally)

### SendReceiveInterface
Interface for sending and receiving ScrollCoin between users.

**Features:**
- Send tab with amount, recipient, and reason fields
- Balance validation
- Transaction limits checking
- Receive tab with wallet address display
- QR code generation (coming soon)
- Copy address functionality

**Props:**
- `wallet`: ScrollCoinWallet object
- `onTransactionComplete`: Callback after successful transaction

### EarningOpportunities
Showcase of ways to earn ScrollCoin through various activities.

**Features:**
- Grid of earning opportunities
- Filter by category and difficulty
- Search functionality
- Reward amount display
- Requirements and estimated time
- Direct links to earning activities

**Props:**
- `currentBalance`: Current wallet balance

**Categories:**
- COURSE: Complete courses
- ASSESSMENT: Submit assignments and ace tests
- COMMUNITY: Help peers and join study groups
- SPIRITUAL: Daily devotions and scripture memory
- REFERRAL: Invite friends

### SpendingMarketplace
Marketplace for purchasing items and services with ScrollCoin.

**Features:**
- Grid of spending options
- Filter by category
- Search functionality
- Balance checking
- Discount badges
- Purchase buttons with affordability checks

**Props:**
- `currentBalance`: Current wallet balance

**Categories:**
- COURSE: Premium courses
- RESOURCE: Study materials
- CERTIFICATION: Official certifications
- PREMIUM: Premium features
- DONATION: Support missionaries and scholarships

### WalletSecurity
Security settings and transaction verification interface.

**Features:**
- Transaction limit configuration
- Two-factor authentication toggle
- Notification preferences
- Wallet status display (whitelist/blacklist)
- Transaction verification by hash
- Blockchain explorer integration
- Security best practices

**Props:**
- `walletAddress`: User's wallet address

## API Integration

All components integrate with the ScrollCoin backend API:

### Endpoints Used:
- `GET /api/scrollcoin/wallet` - Get wallet balance and info
- `GET /api/scrollcoin/transactions` - Get transaction history
- `POST /api/scrollcoin/transfer` - Transfer ScrollCoin
- `POST /api/scrollcoin/blockchain/verify` - Verify transaction
- `GET /api/scrollcoin/exchange-rate` - Get current exchange rate

## Types

All TypeScript types are defined in `src/types/scrollcoin.ts`:

- `ScrollCoinWallet` - Wallet data structure
- `ScrollCoinTransaction` - Transaction data
- `TransactionType` - Enum for transaction types
- `TransactionStatus` - Enum for transaction statuses
- `EarningOpportunity` - Earning opportunity structure
- `SpendingOption` - Spending option structure
- `WalletSecuritySettings` - Security settings structure

## Usage Example

```tsx
import ScrollCoinWallet from '@/pages/ScrollCoinWallet';

// In your router
<Route path="/wallet" element={<ScrollCoinWallet />} />
```

## Kingdom Economy Principles

The ScrollCoin system embodies kingdom economy principles:

1. **Reward Learning**: Students earn ScrollCoin for educational achievements
2. **Encourage Service**: Community engagement and helping others is rewarded
3. **Spiritual Growth**: Devotions and spiritual activities earn rewards
4. **Transparent Economy**: All transactions are blockchain-verified
5. **Kingdom Investment**: Spending options support ministry and education

## Future Enhancements

- Real QR code generation for receiving
- Advanced analytics and charts
- Recurring rewards and subscriptions
- Multi-currency support
- Mobile wallet app integration
- Smart contract interaction UI
- Reward prediction algorithms
- Social features (leaderboards, challenges)

## Testing

Components should be tested with:
- Unit tests for individual component logic
- Integration tests for API interactions
- E2E tests for complete user flows
- Mock data for development

## Accessibility

All components follow WCAG 2.1 AA standards:
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus indicators
- ARIA labels where needed

## Performance

Optimizations implemented:
- Lazy loading of transaction history
- Debounced search inputs
- Pagination for large datasets
- Memoized calculations
- Optimistic UI updates
