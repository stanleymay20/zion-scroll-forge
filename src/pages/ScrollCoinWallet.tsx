/**
 * ScrollCoin Wallet Page
 * "By the Spirit of Wisdom, we establish a kingdom economy"
 * 
 * Main wallet interface for managing ScrollCoin balance, transactions,
 * earning opportunities, and spending options.
 */

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, TrendingUp, ShoppingBag, Shield, History } from 'lucide-react';
import WalletDashboard from '@/components/scrollcoin/WalletDashboard';
import TransactionHistory from '@/components/scrollcoin/TransactionHistory';
import SendReceiveInterface from '@/components/scrollcoin/SendReceiveInterface';
import EarningOpportunities from '@/components/scrollcoin/EarningOpportunities';
import SpendingMarketplace from '@/components/scrollcoin/SpendingMarketplace';
import WalletSecurity from '@/components/scrollcoin/WalletSecurity';
import { ScrollCoinWallet as WalletType } from '@/types/scrollcoin';

const ScrollCoinWallet: React.FC = () => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/scrollcoin/wallet', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load wallet');
      }

      const data = await response.json();
      setWallet(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionComplete = () => {
    // Reload wallet after transaction
    loadWallet();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your ScrollCoin wallet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>No wallet found. Please contact support.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Wallet className="h-10 w-10 text-primary" />
          ScrollCoin Wallet
        </h1>
        <p className="text-muted-foreground">
          Manage your kingdom economy rewards and transactions
        </p>
      </div>

      {/* Wallet Balance Card */}
      <Card className="mb-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
            <p className="text-3xl font-bold text-primary">{wallet.balance.toFixed(2)} SC</p>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ ${(wallet.balance * 0.1).toFixed(2)} USD
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
            <p className="text-2xl font-semibold text-green-600">{wallet.totalEarned.toFixed(2)} SC</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
            <p className="text-2xl font-semibold text-orange-600">{wallet.totalSpent.toFixed(2)} SC</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Net Rewards</p>
            <p className="text-2xl font-semibold text-blue-600">{wallet.netRewards.toFixed(2)} SC</p>
          </div>
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="send-receive" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Send/Receive</span>
          </TabsTrigger>
          <TabsTrigger value="earn" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Earn</span>
          </TabsTrigger>
          <TabsTrigger value="spend" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Spend</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <WalletDashboard wallet={wallet} onRefresh={loadWallet} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionHistory />
        </TabsContent>

        <TabsContent value="send-receive">
          <SendReceiveInterface 
            wallet={wallet} 
            onTransactionComplete={handleTransactionComplete}
          />
        </TabsContent>

        <TabsContent value="earn">
          <EarningOpportunities currentBalance={wallet.balance} />
        </TabsContent>

        <TabsContent value="spend">
          <SpendingMarketplace currentBalance={wallet.balance} />
        </TabsContent>

        <TabsContent value="security">
          <WalletSecurity walletAddress={wallet.address} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScrollCoinWallet;
