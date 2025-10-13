/**
 * ScrollCoin Wallet Component
 * "Your divine currency balance reflects your kingdom contributions"
 * 
 * React component for displaying and managing ScrollCoin wallet functionality
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  TrendingUp, 
  Send, 
  History, 
  Award,
  Sparkles,
  Crown,
  Gift
} from 'lucide-react';

interface ScrollCoinWallet {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastActivity: Date;
}

interface ScrollCoinTransaction {
  id: string;
  amount: number;
  type: 'EARNED' | 'SPENT' | 'TRANSFERRED' | 'BONUS';
  description: string;
  activityType?: string;
  createdAt: Date;
  blockchainTxId?: string;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  balance: number;
  totalEarned: number;
}

export const ScrollCoinWallet: React.FC = () => {
  const [wallet, setWallet] = useState<ScrollCoinWallet | null>(null);
  const [transactions, setTransactions] = useState<ScrollCoinTransaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferDescription, setTransferDescription] = useState('');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      
      // Load wallet balance
      const walletResponse = await fetch('/api/scrollcoin/balance');
      const walletData = await walletResponse.json();
      
      if (walletData.success) {
        setWallet(walletData.wallet);
      }

      // Load transaction history
      const transactionsResponse = await fetch('/api/scrollcoin/transactions?limit=20');
      const transactionsData = await transactionsResponse.json();
      
      if (transactionsData.success) {
        setTransactions(transactionsData.transactions);
      }

      // Load leaderboard
      const leaderboardResponse = await fetch('/api/scrollcoin/leaderboard?limit=10');
      const leaderboardData = await leaderboardResponse.json();
      
      if (leaderboardData.success) {
        setLeaderboard(leaderboardData.leaderboard);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    try {
      const amount = parseFloat(transferAmount);
      if (!amount || amount <= 0 || !transferRecipient) {
        alert('Please enter valid transfer details');
        return;
      }

      const response = await fetch('/api/scrollcoin/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toUserId: transferRecipient,
          amount,
          description: transferDescription || 'ScrollCoin transfer'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Successfully transferred ${amount} ScrollCoin!`);
        setTransferAmount('');
        setTransferRecipient('');
        setTransferDescription('');
        loadWalletData(); // Refresh data
      } else {
        alert(`Transfer failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Transfer failed. Please try again.');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'EARNED':
      case 'BONUS':
        return <Award className="h-4 w-4 text-green-500" />;
      case 'SPENT':
        return <Send className="h-4 w-4 text-red-500" />;
      case 'TRANSFERRED':
        return <Send className="h-4 w-4 text-blue-500" />;
      default:
        return <Coins className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (type === 'EARNED' || type === 'BONUS' || (type === 'TRANSFERRED' && amount > 0)) {
      return 'text-green-600';
    }
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading your divine treasury...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ScrollCoin Balance</CardTitle>
            <Coins className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              {wallet?.balance?.toLocaleString() || 0} SC
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              Your divine currency balance
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {wallet?.totalEarned?.toLocaleString() || 0} SC
            </div>
            <p className="text-xs text-green-600 mt-1">
              Lifetime kingdom contributions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <Gift className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {wallet?.totalSpent?.toLocaleString() || 0} SC
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Invested in kingdom advancement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">
            <History className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="transfer">
            <Send className="h-4 w-4 mr-2" />
            Transfer
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Crown className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Transaction History */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No transactions yet. Start earning ScrollCoin by completing courses!
                  </p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(tx.type)}
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(tx.createdAt)}
                            {tx.activityType && (
                              <Badge variant="secondary" className="ml-2">
                                {tx.activityType.replace('_', ' ')}
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getTransactionColor(tx.type, tx.amount)}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount} SC
                        </p>
                        {tx.blockchainTxId && (
                          <p className="text-xs text-gray-400">
                            {tx.blockchainTxId.substring(0, 16)}...
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfer ScrollCoin */}
        <TabsContent value="transfer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                Transfer ScrollCoin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Recipient User ID
                </label>
                <Input
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  placeholder="Enter recipient's user ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount (SC)
                </label>
                <Input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Enter amount to transfer"
                  min="1"
                  max={wallet?.balance || 0}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <Input
                  value={transferDescription}
                  onChange={(e) => setTransferDescription(e.target.value)}
                  placeholder="Enter transfer description"
                />
              </div>
              
              <Button 
                onClick={handleTransfer}
                className="w-full"
                disabled={!transferAmount || !transferRecipient}
              >
                <Send className="h-4 w-4 mr-2" />
                Transfer ScrollCoin
              </Button>
              
              <p className="text-sm text-gray-500 text-center">
                Available balance: {wallet?.balance?.toLocaleString() || 0} SC
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="h-5 w-5 mr-2" />
                ScrollCoin Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div key={entry.userId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{entry.username}</p>
                        <p className="text-sm text-gray-500">
                          Total earned: {entry.totalEarned.toLocaleString()} SC
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-600">
                        {entry.balance.toLocaleString()} SC
                      </p>
                      {index === 0 && <Sparkles className="h-4 w-4 text-yellow-500 inline ml-1" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScrollCoinWallet;