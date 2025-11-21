/**
 * Wallet Dashboard Component
 * Displays wallet balance, statistics, and recent activity
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { ScrollCoinWallet } from '@/types/scrollcoin';

interface WalletDashboardProps {
  wallet: ScrollCoinWallet;
  onRefresh: () => void;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ wallet, onRefresh }) => {
  const statistics = wallet.statistics;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quick Actions</CardTitle>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col gap-2">
              <ArrowUpRight className="h-6 w-6" />
              Send SC
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <ArrowDownRight className="h-6 w-6" />
              Receive SC
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              Earn More
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              Spend SC
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Weekly Earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    +{statistics.weeklyEarnings.toFixed(2)} SC
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last 7 days
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Weekly Spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    -{statistics.weeklySpending.toFixed(2)} SC
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last 7 days
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{statistics.totalTransactions}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All time
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Average Transaction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {statistics.averageTransactionAmount.toFixed(2)} SC
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per transaction
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wallet Information */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Information</CardTitle>
          <CardDescription>Your ScrollCoin wallet details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Wallet Address</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                {wallet.address}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(wallet.address)}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Earnings</p>
              <p className="text-lg font-semibold text-green-600">
                +{statistics?.monthlyEarnings.toFixed(2) || '0.00'} SC
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Spending</p>
              <p className="text-lg font-semibold text-orange-600">
                -{statistics?.monthlySpending.toFixed(2) || '0.00'} SC
              </p>
            </div>
          </div>

          {statistics && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Largest Transaction</p>
              <p className="text-lg font-semibold">{statistics.largestTransaction.toFixed(2)} SC</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kingdom Economy Message */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Kingdom Economy Principles</h3>
              <p className="text-sm text-muted-foreground">
                ScrollCoin represents a divine economy where learning, service, and spiritual growth 
                are rewarded. Every transaction reflects kingdom values and contributes to building 
                Zion's academic government on Earth.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletDashboard;
