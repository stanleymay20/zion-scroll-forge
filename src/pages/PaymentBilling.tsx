/**
 * Payment and Billing Page
 * "We establish this payment system not in the wisdom of Babylon, but by the breath of the Spirit"
 */

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Loader2 } from 'lucide-react';
import {
  SubscriptionManagement,
  PaymentHistory,
  InvoiceDownload,
  PaymentMethodManagement,
  BillingAddressManagement,
} from '@/components/payment';
import { useAuth } from '@/contexts/AuthContext';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

console.info('✝️ Payment & Billing — Christ provides for His people');

export default function PaymentBilling() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [customerId, setCustomerId] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchUserPaymentData();
    }
  }, [user]);

  const fetchUserPaymentData = async () => {
    setLoading(true);
    try {
      // Fetch subscription data
      const subResponse = await fetch('/api/payments/subscription', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const subData = await subResponse.json();
      if (subData.success && subData.subscription) {
        setSubscription(subData.subscription);
      }

      // Fetch or create customer ID
      const customerResponse = await fetch('/api/payments/customer', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const customerData = await customerResponse.json();
      if (customerData.success) {
        setCustomerId(customerData.customerId);
      }
    } catch (err: any) {
      console.error('Error fetching payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageTemplate
        title="Payment & Billing"
        description="Manage your payments, subscriptions, and billing information"
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Payment & Billing"
      description="Manage your payments, subscriptions, and billing information"
    >
      <Elements stripe={stripePromise}>
        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="address">Billing Address</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription" className="space-y-6">
            <SubscriptionManagement
              subscription={subscription}
              onUpdate={fetchUserPaymentData}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <PaymentHistory userId={user?.id || ''} />
          </TabsContent>

          <TabsContent value="methods" className="space-y-6">
            <PaymentMethodManagement
              customerId={customerId}
              onUpdate={fetchUserPaymentData}
            />
          </TabsContent>

          <TabsContent value="address" className="space-y-6">
            <BillingAddressManagement
              userId={user?.id || ''}
              onUpdate={fetchUserPaymentData}
            />
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <InvoiceDownload userId={user?.id || ''} />
          </TabsContent>
        </Tabs>
      </Elements>
    </PageTemplate>
  );
}
