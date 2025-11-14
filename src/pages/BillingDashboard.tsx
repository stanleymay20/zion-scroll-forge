import { useState } from "react";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CreditCard, DollarSign, Package, Calendar } from "lucide-react";
import { useBillingProducts, useBillingTransactions, useActiveSubscription, useCreateCheckoutSession } from "@/hooks/useBilling";
import { format } from "date-fns";

console.info("✝️ Billing Dashboard — Christ provides");

export default function BillingDashboard() {
  const { data: products, isLoading: productsLoading } = useBillingProducts();
  const { data: transactions, isLoading: transactionsLoading } = useBillingTransactions();
  const { data: subscription } = useActiveSubscription();
  const createCheckout = useCreateCheckoutSession();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const handlePurchase = async (productId: string) => {
    await createCheckout.mutateAsync({ product_id: productId });
  };

  const formatCurrency = (cents: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(cents / 100);
  };

  return (
    <PageTemplate
      title="Billing Dashboard"
      description="Manage your payments, subscriptions, and purchases"
    >
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {productsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !products || products.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No products available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-[hsl(var(--scroll-gold))]" />
                      {product.name}
                    </CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="capitalize">
                        {product.product_type}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {product.description && (
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    )}
                    <div className="pt-4 border-t">
                      <p className="text-3xl font-bold text-[hsl(var(--scroll-gold))]">
                        {formatCurrency(product.price_cents, product.currency)}
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handlePurchase(product.id)}
                      disabled={createCheckout.isPending}
                    >
                      {createCheckout.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Purchase
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No transactions yet</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your payment and purchase history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {tx.product?.name || "Unknown Product"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(tx.created_at), "PPP")}
                        </p>
                        <Badge variant="outline" className="mt-2 capitalize">
                          {tx.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatCurrency(tx.amount_cents, tx.currency)}
                        </p>
                        {tx.scrollcoin_amount > 0 && (
                          <p className="text-sm text-[hsl(var(--scroll-gold))]">
                            +{tx.scrollcoin_amount} SC
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          {subscription ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[hsl(var(--scroll-gold))]" />
                  Active Subscription
                </CardTitle>
                <CardDescription>Your current subscription plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-medium">{subscription.plan_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{subscription.plan_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={subscription.status === "active" ? "default" : "secondary"} className="capitalize">
                      {subscription.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium">
                      {formatCurrency(subscription.price_cents, subscription.currency)}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Current Period</p>
                  <p className="font-medium">
                    {format(new Date(subscription.current_period_start), "PP")} -{" "}
                    {format(new Date(subscription.current_period_end), "PP")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No active subscription</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Subscribe to access premium features
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
