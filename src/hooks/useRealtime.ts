import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeSubscriptions = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.info('✝️ Jesus Christ is Lord - Initializing realtime subscriptions');

    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'enrollments' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['enrollments'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['wallet'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wallets' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['wallet'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_conversations' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'learning_patterns' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['learning-pattern'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prayer_journal' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['prayers'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'intervention_alerts' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['intervention-alerts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
