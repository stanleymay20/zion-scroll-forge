# Payment and Billing Components

"We establish these payment components not in the wisdom of Babylon, but by the breath of the Spirit"

## Overview

This directory contains comprehensive payment and billing components for ScrollUniversity, integrating with Stripe for secure payment processing. All components follow kingdom-focused design principles and provide a seamless user experience.

## Components

### PaymentForm

A complete payment form with Stripe Elements integration for secure credit card processing.

**Features:**
- Stripe Elements card input
- Billing details collection
- Real-time validation
- Error handling
- Success confirmation
- Secure payment processing

**Usage:**
```tsx
import { PaymentForm } from '@/components/payment';

<PaymentForm
  amount={5000} // Amount in cents
  currency="usd"
  description="Course Enrollment"
  courseId="course-123"
  onSuccess={(paymentIntentId) => console.log('Payment successful:', paymentIntentId)}
  onError={(error) => console.error('Payment failed:', error)}
/>
```

### SubscriptionManagement

Manage recurring subscriptions with cancel and reactivate functionality.

**Features:**
- View active subscription details
- Cancel subscription (immediate or at period end)
- Reactivate cancelled subscriptions
- Billing cycle information
- Status badges

**Usage:**
```tsx
import { SubscriptionManagement } from '@/components/payment';

<SubscriptionManagement
  subscription={subscriptionData}
  onUpdate={() => refetchSubscription()}
/>
```

### PaymentHistory

Display and filter payment transaction history.

**Features:**
- Paginated payment list
- Search by description or ID
- Filter by status
- Download receipts
- Refund information
- Responsive table layout

**Usage:**
```tsx
import { PaymentHistory } from '@/components/payment';

<PaymentHistory userId={user.id} />
```

### InvoiceDownload

View and download invoices for payments.

**Features:**
- Invoice list with details
- PDF download
- View online
- Status tracking
- Due date information

**Usage:**
```tsx
import { InvoiceDownload } from '@/components/payment';

<InvoiceDownload userId={user.id} />
```

### PaymentMethodManagement

Manage saved payment methods (credit/debit cards).

**Features:**
- Add new payment methods
- Delete saved methods
- Set default payment method
- Card brand display
- Secure card storage via Stripe

**Usage:**
```tsx
import { PaymentMethodManagement } from '@/components/payment';

<PaymentMethodManagement
  customerId={stripeCustomerId}
  onUpdate={() => refetchPaymentMethods()}
/>
```

### BillingAddressManagement

Manage billing address information.

**Features:**
- Edit billing address
- Country selection
- Address validation
- Save and cancel functionality
- Auto-save on update

**Usage:**
```tsx
import { BillingAddressManagement } from '@/components/payment';

<BillingAddressManagement
  userId={user.id}
  onUpdate={() => refetchAddress()}
/>
```

### RefundRequest

Submit refund requests for payments.

**Features:**
- Refund reason selection
- Detailed explanation field
- Request submission
- Status tracking
- Admin review workflow

**Usage:**
```tsx
import { RefundRequest } from '@/components/payment';

<RefundRequest
  paymentIntentId="pi_123"
  amount={5000}
  currency="usd"
  description="Course Enrollment"
  onSuccess={() => refetchPayments()}
/>
```

## Integration Requirements

### Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Backend API Endpoints

The components expect these backend endpoints:

- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/create-subscription` - Create subscription
- `PUT /api/payments/subscription/:id` - Update subscription
- `DELETE /api/payments/subscription/:id` - Cancel subscription
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/receipt/:id` - Get payment receipt
- `GET /api/payments/invoices` - Get invoices
- `GET /api/payments/payment-methods` - Get payment methods
- `POST /api/payments/attach-payment-method` - Add payment method
- `DELETE /api/payments/payment-methods/:id` - Delete payment method
- `POST /api/payments/payment-methods/:id/set-default` - Set default method
- `GET /api/payments/billing-address` - Get billing address
- `PUT /api/payments/billing-address` - Update billing address
- `POST /api/payments/refund-request` - Submit refund request

### Stripe Setup

1. Install Stripe dependencies:
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

2. Wrap your app with Stripe Elements provider:
```tsx
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY);

<Elements stripe={stripePromise}>
  <App />
</Elements>
```

## Security Considerations

- All payment processing is handled by Stripe
- Card details never touch our servers
- PCI compliance maintained through Stripe
- Secure token-based authentication
- HTTPS required for all payment operations

## Styling

Components use Shadcn UI components and Tailwind CSS for consistent styling with the rest of the application. The ScrollUniversity gold color (`hsl(var(--scroll-gold))`) is used for accents.

## Testing

Test payment flows using Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

## Support

For issues or questions about payment components, contact the development team or refer to the Stripe documentation at https://stripe.com/docs

---

**"For where your treasure is, there your heart will be also." - Matthew 6:21**
