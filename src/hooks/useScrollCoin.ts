import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { earnScrollCoin, spendScrollCoin } from '@/services/scrollcoin';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

export const useEarnScrollCoin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount, description }: { amount: number; description: string }) =>
      earnScrollCoin(user!.id, amount, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'ScrollCoin earned!',
        description: 'Your balance has been updated.',
      });
    },
  });
};

export const useSpendScrollCoin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount, description }: { amount: number; description: string }) =>
      spendScrollCoin(user!.id, amount, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'ScrollCoin spent',
        description: 'Your balance has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Transaction failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
