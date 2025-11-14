import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Coins, TrendingUp, TrendingDown } from "lucide-react";
import { useScrollCoinBalance, useScrollCoinTransactions } from "@/hooks/useScrollCoinTransactions";
import { format } from "date-fns";

console.info("✝️ ScrollCoin Wallet — Christ rewards faithfulness");

export default function ScrollCoinWallet() {
  const { data: balance, isLoading: balanceLoading } = useScrollCoinBalance();
  const { data: transactions, isLoading: txLoading } = useScrollCoinTransactions();

  const earned = transactions?.filter((tx) => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0) || 0;
  const spent = Math.abs(transactions?.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0) || 0);

  if (balanceLoading || txLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTemplate
      title="ScrollCoin Wallet"
      description="Your divine economy balance and transaction history"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-[hsl(var(--scroll-gold))]" />
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[hsl(var(--scroll-gold))]">
              {balance || 0} SC
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">
              +{earned} SC
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">
              -{spent} SC
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your ScrollCoin earning and spending activity</CardDescription>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start earning ScrollCoins by completing activities
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {tx.amount > 0 ? (
                      <div className="p-2 bg-green-500/10 rounded-full">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                    ) : (
                      <div className="p-2 bg-red-500/10 rounded-full">
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{tx.source}</p>
                      {tx.description && (
                        <p className="text-sm text-muted-foreground">{tx.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(tx.created_at), "PPp")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount} SC
                    </p>
                    <Badge variant="outline" className="capitalize">
                      {tx.transaction_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
