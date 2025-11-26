import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface ScrollCoinTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend' | 'transfer';
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ScrollCoinBalance {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  pendingTransactions: number;
}

export interface EarningOpportunity {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  available: boolean;
}

/**
 * Custom hook for managing ScrollCoin wallet and transactions
 * Provides access to balance, transaction history, and earning/spending operations
 */
export function useScrollCoin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch ScrollCoin balance
  const {
    data: balanceData,
    isLoading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['scrollcoin-balance', user?.id],
    queryFn: async (): Promise<ScrollCoinBalance> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('scrollcoin_wallets')
        .select('balance, lifetime_earned, lifetime_spent, pending_transactions')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If wallet doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: newWallet, error: createError } = await supabase
            .from('scrollcoin_wallets')
            .insert({
              user_id: user.id,
              balance: 0,
              lifetime_earned: 0,
              lifetime_spent: 0,
              pending_transactions: 0,
            })
            .select()
            .single();

          if (createError) throw createError;

          return {
            balance: newWallet.balance,
            lifetimeEarned: newWallet.lifetime_earned,
            lifetimeSpent: newWallet.lifetime_spent,
            pendingTransactions: newWallet.pending_transactions,
          };
        }
        throw error;
      }

      return {
        balance: data.balance,
        lifetimeEarned: data.lifetime_earned,
        lifetimeSpent: data.lifetime_spent,
        pendingTransactions: data.pending_transactions,
      };
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
  });

  // Fetch transaction history
  const {
    data: transactions,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ['scrollcoin-transactions', user?.id],
    queryFn: async (): Promise<ScrollCoinTransaction[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('scrollcoin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data.map((tx) => ({
        id: tx.id,
        userId: tx.user_id,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        metadata: tx.metadata,
        createdAt: new Date(tx.created_at),
      }));
    },
    enabled: !!user?.id,
  });

  // Fetch earning opportunities
  const { data: earningOpportunities } = useQuery({
    queryKey: ['scrollcoin-opportunities', user?.id],
    queryFn: async (): Promise<EarningOpportunity[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('scrollcoin_earning_opportunities')
        .select('*')
        .eq('available', true)
        .order('amount', { ascending: false });

      if (error) throw error;

      return data.map((opp) => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        amount: opp.amount,
        category: opp.category,
        available: opp.available,
      }));
    },
    enabled: !!user?.id,
  });

  // Earn ScrollCoins mutation
  const earnScrollCoin = useMutation({
    mutationFn: async ({
      amount,
      reason,
      metadata,
    }: {
      amount: number;
      reason: string;
      metadata?: Record<string, any>;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('earn_scrollcoin', {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: reason,
        p_metadata: metadata || {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scrollcoin-balance', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['scrollcoin-transactions', user?.id] });
      
      toast({
        title: '🪙 ScrollCoins Earned!',
        description: `You earned ${variables.amount} ScrollCoins for ${variables.reason}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Earning ScrollCoins',
        description: error instanceof Error ? error.message : 'Failed to earn ScrollCoins',
        variant: 'destructive',
      });
    },
  });

  // Spend ScrollCoins mutation
  const spendScrollCoin = useMutation({
    mutationFn: async ({
      amount,
      reason,
      metadata,
    }: {
      amount: number;
      reason: string;
      metadata?: Record<string, any>;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('spend_scrollcoin', {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: reason,
        p_metadata: metadata || {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scrollcoin-balance', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['scrollcoin-transactions', user?.id] });
      
      toast({
        title: '🪙 ScrollCoins Spent',
        description: `You spent ${variables.amount} ScrollCoins on ${variables.reason}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Spending ScrollCoins',
        description: error instanceof Error ? error.message : 'Failed to spend ScrollCoins',
        variant: 'destructive',
      });
    },
  });

  // Transfer ScrollCoins mutation
  const transferScrollCoin = useMutation({
    mutationFn: async ({
      recipientId,
      amount,
      message,
    }: {
      recipientId: string;
      amount: number;
      message?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('transfer_scrollcoin', {
        p_sender_id: user.id,
        p_recipient_id: recipientId,
        p_amount: amount,
        p_message: message || '',
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scrollcoin-balance', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['scrollcoin-transactions', user?.id] });
      
      toast({
        title: '🪙 ScrollCoins Transferred',
        description: `You sent ${variables.amount} ScrollCoins`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Transfer Failed',
        description: error instanceof Error ? error.message : 'Failed to transfer ScrollCoins',
        variant: 'destructive',
      });
    },
  });

  // Initialize wallet on mount
  useEffect(() => {
    if (user?.id && !isInitialized) {
      refetchBalance();
      setIsInitialized(true);
    }
  }, [user?.id, isInitialized, refetchBalance]);

  // Refresh data callback
  const refresh = useCallback(() => {
    refetchBalance();
    refetchTransactions();
  }, [refetchBalance, refetchTransactions]);

  return {
    // Balance data
    balance: balanceData?.balance ?? 0,
    lifetimeEarned: balanceData?.lifetimeEarned ?? 0,
    lifetimeSpent: balanceData?.lifetimeSpent ?? 0,
    pendingTransactions: balanceData?.pendingTransactions ?? 0,

    // Transaction history
    transactions: transactions ?? [],

    // Earning opportunities
    earningOpportunities: earningOpportunities ?? [],

    // Loading states
    isLoading: balanceLoading || transactionsLoading,
    balanceLoading,
    transactionsLoading,

    // Error states
    error: balanceError,

    // Mutations
    earnScrollCoin: earnScrollCoin.mutate,
    spendScrollCoin: spendScrollCoin.mutate,
    transferScrollCoin: transferScrollCoin.mutate,

    // Mutation states
    isEarning: earnScrollCoin.isPending,
    isSpending: spendScrollCoin.isPending,
    isTransferring: transferScrollCoin.isPending,

    // Utility functions
    refresh,
    refetchBalance,
    refetchTransactions,

    // Computed values
    hasBalance: (balanceData?.balance ?? 0) > 0,
    canSpend: (amount: number) => (balanceData?.balance ?? 0) >= amount,
  };
}


/**
 * Hook for fetching wallet data only
 */
export function useWallet() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['scrollcoin-wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('scrollcoin_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

/**
 * Hook for earning ScrollCoins
 */
export function useEarnScrollCoin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      reason,
      metadata,
    }: {
      amount: number;
      reason: string;
      metadata?: Record<string, any>;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('earn_scrollcoin', {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: reason,
        p_metadata: metadata || {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrollcoin-wallet', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['scrollcoin-balance', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['scrollcoin-transactions', user?.id] });
    },
  });
}

/**
 * Hook for spending ScrollCoins
 */
export function useSpendScrollCoin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      reason,
      metadata,
    }: {
      amount: number;
      reason: string;
      metadata?: Record<string, any>;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('spend_scrollcoin', {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: reason,
        p_metadata: metadata || {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrollcoin-wallet', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['scrollcoin-balance', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['scrollcoin-transactions', user?.id] });
    },
  });
}
