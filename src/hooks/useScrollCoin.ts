import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWallet, earnScrollCoin, spendScrollCoin } from '@/services/scrollcoin';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useWallet = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: () => getWallet(user!.id),
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
