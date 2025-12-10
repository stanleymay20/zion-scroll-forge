import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface ScrollGoldTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend' | 'transfer';
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ScrollGoldBalance {
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
 * Custom hook for managing ScrollGold wallet and transactions
 * Provides access to balance, transaction history, and earning/spending operations
 */
export function useScrollGold() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch ScrollGold balance
  const {
    data: balanceData,
    isLoading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['ScrollGold-balance', user?.id],
    queryFn: async (): Promise<ScrollGoldBalance> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ScrollGold_wallets')
        .select('balance, lifetime_earned, lifetime_spent, pending_transactions')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If wallet doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: newWallet, error: createError } = await supabase
            .from('ScrollGold_wallets')
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
    queryKey: ['ScrollGold-transactions', user?.id],
    queryFn: async (): Promise<ScrollGoldTransaction[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ScrollGold_transactions')
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
    queryKey: ['ScrollGold-opportunities', user?.id],
    queryFn: async (): Promise<EarningOpportunity[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ScrollGold_earning_opportunities')
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

  // Earn ScrollGolds mutation
  const earnScrollGold = useMutation({
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

      const { data, error } = await supabase.rpc('earn_ScrollGold', {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: reason,
        p_metadata: metadata || {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ScrollGold-balance', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['ScrollGold-transactions', user?.id] });
      
      toast({
        title: '🪙 ScrollGolds Earned!',
        description: `You earned ${variables.amount} ScrollGolds for ${variables.reason}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Earning ScrollGolds',
        description: error instanceof Error ? error.message : 'Failed to earn ScrollGolds',
        variant: 'destructive',
      });
    },
  });

  // Spend ScrollGolds mutation
  const spendScrollGold = useMutation({
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

      const { data, error } = await supabase.rpc('spend_ScrollGold', {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: reason,
        p_metadata: metadata || {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ScrollGold-balance', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['ScrollGold-transactions', user?.id] });
      
      toast({
        title: '🪙 ScrollGolds Spent',
        description: `You spent ${variables.amount} ScrollGolds on ${variables.reason}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Spending ScrollGolds',
        description: error instanceof Error ? error.message : 'Failed to spend ScrollGolds',
        variant: 'destructive',
      });
    },
  });

  // Transfer ScrollGolds mutation
  const transferScrollGold = useMutation({
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

      const { data, error } = await supabase.rpc('transfer_ScrollGold', {
        p_sender_id: user.id,
        p_recipient_id: recipientId,
        p_amount: amount,
        p_message: message || '',
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ScrollGold-balance', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['ScrollGold-transactions', user?.id] });
      
      toast({
        title: '🪙 ScrollGolds Transferred',
        description: `You sent ${variables.amount} ScrollGolds`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Transfer Failed',
        description: error instanceof Error ? error.message : 'Failed to transfer ScrollGolds',
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
    earnScrollGold: earnScrollGold.mutate,
    spendScrollGold: spendScrollGold.mutate,
    transferScrollGold: transferScrollGold.mutate,

    // Mutation states
    isEarning: earnScrollGold.isPending,
    isSpending: spendScrollGold.isPending,
    isTransferring: transferScrollGold.isPending,

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
    queryKey: ['ScrollGold-wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ScrollGold_wallets')
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
 * Hook for earning ScrollGolds
 */
export function useEarnScrollGold() {
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

      const { data, error } = await supabase.rpc('earn_ScrollGold', {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: reason,
        p_metadata: metadata || {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ScrollGold-wallet', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['ScrollGold-balance', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['ScrollGold-transactions', user?.id] });
    },
  });
}

/**
 * Hook for spending ScrollGolds
 */
export function useSpendScrollGold() {
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

      const { data, error } = await supabase.rpc('spend_ScrollGold', {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: reason,
        p_metadata: metadata || {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ScrollGold-wallet', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['ScrollGold-balance', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['ScrollGold-transactions', user?.id] });
    },
  });
}
