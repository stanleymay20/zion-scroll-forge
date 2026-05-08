/**
 * ScrollGold Wallet Page
 * "By the Spirit of Wisdom, we establish a kingdom economy"
 * 
 * Main wallet interface for managing ScrollGold balance, transactions,
 * earning opportunities, and spending options.
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, TrendingUp, ShoppingBag, History, Coins, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollGoldWallet as WalletType } from '@/types/scrollgold';
import { toast } from "sonner";

const ScrollGoldWallet: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch wallet data directly from Supabase
  const { data: walletData, isLoading, error, refetch } = useQuery({
    queryKey: ['scrollgold-wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (walletError) throw walletError;

      // Get transactions
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (txError) throw txError;

      // Calculate statistics from transactions
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const allTx = transactions || [];
      const weeklyTx = allTx.filter(tx => new Date(tx.created_at) >= weekAgo);
      const monthlyTx = allTx.filter(tx => new Date(tx.created_at) >= monthAgo);

      const weeklyEarnings = weeklyTx.filter(tx => Number(tx.amount) > 0).reduce((sum, tx) => sum + Number(tx.amount), 0);
      const weeklySpending = Math.abs(weeklyTx.filter(tx => Number(tx.amount) < 0).reduce((sum, tx) => sum + Number(tx.amount), 0));
      const monthlyEarnings = monthlyTx.filter(tx => Number(tx.amount) > 0).reduce((sum, tx) => sum + Number(tx.amount), 0);
      const monthlySpending = Math.abs(monthlyTx.filter(tx => Number(tx.amount) < 0).reduce((sum, tx) => sum + Number(tx.amount), 0));

      const totalEarned = allTx.filter(tx => Number(tx.amount) > 0).reduce((sum, tx) => sum + Number(tx.amount), 0);
      const totalSpent = Math.abs(allTx.filter(tx => Number(tx.amount) < 0).reduce((sum, tx) => sum + Number(tx.amount), 0));

      const walletResult: WalletType = {
        address: wallet?.eth_address || `scroll-${user.id.slice(0, 8)}`,
        balance: wallet?.balance || 0,
        totalEarned,
        totalSpent,
        netRewards: totalEarned - totalSpent,
        statistics: {
          weeklyEarnings,
          monthlyEarnings,
          weeklySpending,
          monthlySpending,
          averageTransactionAmount: allTx.length > 0 ? allTx.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0) / allTx.length : 0,
          totalTransactions: allTx.length,
          largestTransaction: allTx.length > 0 ? Math.max(...allTx.map(tx => Math.abs(Number(tx.amount)))) : 0,
          mostCommonTransactionType: 'REWARD'
        }
      };

      return {
        wallet: walletResult,
        transactions: allTx
      };
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Please log in to access your ScrollGold wallet.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your ScrollGold wallet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error instanceof Error ? error.message : 'Failed to load wallet'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const wallet = walletData?.wallet;
  const transactions = walletData?.transactions || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Wallet className="h-10 w-10 text-primary" />
          ScrollGold Wallet
        </h1>
        <p className="text-muted-foreground">
          Manage your kingdom economy rewards and transactions
        </p>
      </div>

      {/* Wallet Balance Card */}
      <Card className="mb-8 p-6 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
            <p className="text-3xl font-bold text-amber-600">{(wallet?.balance || 0).toFixed(2)} SG</p>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ ${((wallet?.balance || 0) * 0.1).toFixed(2)} USD
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
            <p className="text-2xl font-semibold text-green-600">{(wallet?.totalEarned || 0).toFixed(2)} SG</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
            <p className="text-2xl font-semibold text-orange-600">{(wallet?.totalSpent || 0).toFixed(2)} SG</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Net Rewards</p>
            <p className="text-2xl font-semibold text-blue-600">{(wallet?.netRewards || 0).toFixed(2)} SG</p>
          </div>
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="earn" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Earn</span>
          </TabsTrigger>
          <TabsTrigger value="spend" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Spend</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quick Actions</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex-col gap-2 bg-amber-600 hover:bg-amber-700" onClick={() => toast.info("This action is launching with the next release.")}>
                    <ArrowUpRight className="h-6 w-6" />
                    Send SG
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => toast.info("This action is launching with the next release.")}>
                    <ArrowDownRight className="h-6 w-6" />
                    Receive SG
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('earn')}>
                    <TrendingUp className="h-6 w-6" />
                    Earn More
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('spend')}>
                    <ShoppingBag className="h-6 w-6" />
                    Spend SG
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Grid */}
            {wallet?.statistics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Weekly Earnings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      +{wallet.statistics.weeklyEarnings.toFixed(2)} SG
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Weekly Spending</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-orange-600">
                      -{wallet.statistics.weeklySpending.toFixed(2)} SG
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{wallet.statistics.totalTransactions}</p>
                    <p className="text-xs text-muted-foreground mt-1">All time</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Average Transaction</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {wallet.statistics.averageTransactionAmount.toFixed(2)} SG
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Kingdom Economy Message */}
            <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-500/20 rounded-full">
                    <Coins className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Kingdom Economy Principles</h3>
                    <p className="text-sm text-muted-foreground">
                      ScrollGold represents a divine economy where learning, service, and spiritual growth 
                      are rewarded. Every transaction reflects kingdom values and contributes to building 
                      Zion's academic government on Earth.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent ScrollGold transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Complete courses and activities to earn ScrollGold!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${Number(tx.amount) > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {Number(tx.amount) > 0 ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{tx.description || tx.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className={`font-bold ${Number(tx.amount) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(tx.amount) > 0 ? '+' : ''}{Number(tx.amount).toFixed(2)} SG
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earn">
          <Card>
            <CardHeader>
              <CardTitle>Earning Opportunities</CardTitle>
              <CardDescription>Ways to earn more ScrollGold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { title: 'Complete a Course Module', reward: '+10 SG', description: 'Finish any course module', icon: '📚' },
                  { title: 'Pass a Quiz', reward: '+5 SG', description: 'Score 70% or higher on a quiz', icon: '✅' },
                  { title: 'Daily Study Streak', reward: '+1 SG/day', description: 'Study every day to earn bonus gold', icon: '🔥' },
                  { title: 'Help a Fellow Student', reward: '+15 SG', description: 'Answer questions in the community', icon: '🤝' },
                  { title: 'Complete Daily Devotion', reward: '+3 SG', description: 'Read and reflect on daily devotions', icon: '🙏' },
                  { title: 'Scripture Memory', reward: '+5 SG', description: 'Memorize a new scripture verse', icon: '📖' },
                ].map((opportunity, idx) => (
                  <Card key={idx} className="border-2 hover:border-amber-500 transition-colors cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{opportunity.icon}</span>
                          <div>
                            <h4 className="font-semibold">{opportunity.title}</h4>
                            <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                          </div>
                        </div>
                        <span className="text-amber-600 font-bold">{opportunity.reward}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spend">
          <Card>
            <CardHeader>
              <CardTitle>Spending Marketplace</CardTitle>
              <CardDescription>Use your ScrollGold for these benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { title: 'Premium Course Access', cost: '100 SG', description: 'Unlock a premium course', icon: '🎓' },
                  { title: 'Extended AI Tutoring', cost: '50 SG', description: '1 hour of extra AI tutor time', icon: '🤖' },
                  { title: 'Certificate Upgrade', cost: '200 SG', description: 'Add blockchain verification to your certificate', icon: '📜' },
                  { title: 'Mentorship Session', cost: '75 SG', description: 'Book a 1-on-1 mentorship session', icon: '👨‍🏫' },
                  { title: 'Study Resources Pack', cost: '25 SG', description: 'Download premium study materials', icon: '📁' },
                  { title: 'Donate to Scholarship', cost: 'Any amount', description: 'Help another student access education', icon: '❤️' },
                ].map((option, idx) => (
                  <Card key={idx} className="border-2 hover:border-amber-500 transition-colors cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{option.icon}</span>
                          <div>
                            <h4 className="font-semibold">{option.title}</h4>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                        <span className="text-amber-600 font-bold">{option.cost}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScrollGoldWallet;
