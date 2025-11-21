/**
 * Payment Form Component with Stripe Elements Integration
 * "We establish this payment form not in the wisdom of Babylon, but by the breath of the Spirit"
 */

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PaymentFormProps {
  amount: number;
  currency: string;
  description: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  courseId?: string;
  enrollmentId?: string;
}

export function PaymentForm({
  amount,
  currency,
  description,
  onSuccess,
  onError,
  courseId,
  enrollmentId,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
  });

  const formatAmount = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent on backend
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount,
          currency,
          description,
          courseId,
          enrollmentId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: billingDetails,
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        setSuccess(true);
        toast({
          title: '✝️ Payment Successful',
          description: 'Your payment has been processed successfully.',
        });
        onSuccess?.(paymentIntent.id);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Payment failed';
      setError(errorMessage);
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      onError?.(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold">Payment Successful!</h3>
            <p className="text-muted-foreground">
              Thank you for your payment. You will receive a confirmation email shortly.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[hsl(var(--scroll-gold))]" />
          Payment Details
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Display */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount to pay:</span>
              <span className="text-2xl font-bold text-[hsl(var(--scroll-gold))]">
                {formatAmount(amount)}
              </span>
            </div>
          </div>

          {/* Billing Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={billingDetails.name}
                  onChange={(e) =>
                    setBillingDetails({ ...billingDetails, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={billingDetails.email}
                  onChange={(e) =>
                    setBillingDetails({ ...billingDetails, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={billingDetails.address.line1}
                onChange={(e) =>
                  setBillingDetails({
                    ...billingDetails,
                    address: { ...billingDetails.address, line1: e.target.value },
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={billingDetails.address.city}
                  onChange={(e) =>
                    setBillingDetails({
                      ...billingDetails,
                      address: { ...billingDetails.address, city: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={billingDetails.address.state}
                  onChange={(e) =>
                    setBillingDetails({
                      ...billingDetails,
                      address: { ...billingDetails.address, state: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={billingDetails.address.postal_code}
                  onChange={(e) =>
                    setBillingDetails({
                      ...billingDetails,
                      address: { ...billingDetails.address, postal_code: e.target.value },
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Card Element */}
          <div className="space-y-2">
            <Label>Card Information</Label>
            <div className="p-4 border rounded-md">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={!stripe || processing}
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay {formatAmount(amount)}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your payment is secured by Stripe. We never store your card details.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
