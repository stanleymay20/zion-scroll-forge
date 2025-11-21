/**
 * Payment Method Management Component
 * "We establish this payment method system not in the wisdom of Babylon, but by the breath of the Spirit"
 */

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, CreditCard, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

interface PaymentMethodManagementProps {
  customerId: string;
  onUpdate?: () => void;
}

export function PaymentMethodManagement({ customerId, onUpdate }: PaymentMethodManagementProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/payment-methods', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch payment methods');
      }

      setPaymentMethods(data.paymentMethods);
    } catch (err: any) {
      toast({
        title: 'Error Loading Payment Methods',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchPaymentMethods();
  });

  const handleAddPaymentMethod = async () => {
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Attach payment method to customer
      const response = await fetch('/api/payments/attach-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod?.id,
          customerId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to add payment method');
      }

      toast({
        title: '✝️ Payment Method Added',
        description: 'Your payment method has been added successfully.',
      });

      setShowAddDialog(false);
      fetchPaymentMethods();
      onUpdate?.();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add payment method';
      setError(errorMessage);
      toast({
        title: 'Error Adding Payment Method',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeletePaymentMethod = async () => {
    if (!selectedMethod) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/payments/payment-methods/${selectedMethod.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete payment method');
      }

      toast({
        title: '✝️ Payment Method Deleted',
        description: 'Your payment method has been removed successfully.',
      });

      setShowDeleteDialog(false);
      setSelectedMethod(null);
      fetchPaymentMethods();
      onUpdate?.();
    } catch (err: any) {
      toast({
        title: 'Error Deleting Payment Method',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/payments/payment-methods/${paymentMethodId}/set-default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to set default payment method');
      }

      toast({
        title: '✝️ Default Payment Method Updated',
        description: 'Your default payment method has been updated.',
      });

      fetchPaymentMethods();
      onUpdate?.();
    } catch (err: any) {
      toast({
        title: 'Error Setting Default',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getCardBrandIcon = (brand: string) => {
    // You can add actual card brand icons here
    return brand.toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading payment methods...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[hsl(var(--scroll-gold))]" />
                Payment Methods
              </CardTitle>
              <CardDescription>Manage your saved payment methods</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">No payment methods saved</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Payment Method
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {method.card ? getCardBrandIcon(method.card.brand) : method.type}
                        </p>
                        {method.isDefault && (
                          <Badge variant="default">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      {method.card && (
                        <p className="text-sm text-muted-foreground">
                          •••• •••• •••• {method.card.last4} - Expires {method.card.expMonth}/
                          {method.card.expYear}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                        disabled={processing}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedMethod(method);
                        setShowDeleteDialog(true);
                      }}
                      disabled={processing}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new credit or debit card to your account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button onClick={handleAddPaymentMethod} disabled={!stripe || processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Payment Method'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedMethod(null);
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePaymentMethod}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Payment Method'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
