import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  acknowledgeLordship,
  submitPrayer,
  getPrayerJournal,
  updatePrayerStatus,
} from '@/services/spiritual';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAcknowledgeLordship = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (note?: string) => await acknowledgeLordship(user!.id, note),
    onSuccess: () => {
      toast({
        title: '✝️ Christ is Lord',
        description: 'Your acknowledgment has been recorded.',
      });
    },
  });
};

export const useSubmitPrayer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: string) => await submitPrayer(user!.id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Prayer submitted',
        description: 'Your prayer request has been added.',
      });
    },
  });
};

export const usePrayerJournal = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['prayers', user?.id],
    queryFn: async () => await getPrayerJournal(user!.id),
    enabled: !!user,
  });
};

export const useUpdatePrayerStatus = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prayerId, status }: { prayerId: string; status: 'open' | 'answered' | 'in_progress' }) =>
      await updatePrayerStatus(prayerId, user!.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Prayer status updated',
        description: 'The status has been changed.',
      });
    },
  });
};
