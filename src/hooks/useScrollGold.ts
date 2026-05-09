import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { earnScrollGold, spendScrollGold } from '@/services/scrollgold';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyError } from "@/lib/errors";

console.info('✝️ ScrollGold Hooks — Christ governs all rewards');

export const useWallet = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      console.info('✝️ Jesus Christ is Lord over this operation');
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (walletError) throw walletError;

      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (txError) throw txError;

      return { wallet, transactions: transactions || [] };
    },
    enabled: !!user,
  });
};

export const useEarnScrollGold = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount, description }: { amount: number; description: string }) =>
      earnScrollGold(user!.id, amount, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'ScrollGold earned!',
        description: 'Your balance has been updated.',
      });
    },
  });
};

export const useSpendScrollGold = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount, description }: { amount: number; description: string }) =>
      spendScrollGold(user!.id, amount, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'ScrollGold spent',
        description: 'Your balance has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Transaction failed',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
    },
  });
};

// Re-export with legacy names for backwards compatibility
export const useEarnScrollCoin = useEarnScrollGold;
export const useSpendScrollCoin = useSpendScrollGold;
