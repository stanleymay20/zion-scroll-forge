/**
 * Supabase Real-time Hook
 * Manages Supabase real-time subscriptions for live data updates
 * "I will instruct you and teach you in the way you should go" - Psalm 32:8
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface RealtimeSubscriptionOptions<T = any> {
  table: string;
  event?: RealtimeEvent;
  filter?: string;
  schema?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
}

export interface UseSupabaseRealtimeReturn {
  isConnected: boolean;
  error: Error | null;
  unsubscribe: () => void;
}

/**
 * Hook for subscribing to Supabase real-time changes
 */
export const useSupabaseRealtime = <T = any>(
  options: RealtimeSubscriptionOptions<T>
): UseSupabaseRealtimeReturn => {
  const {
    table,
    event = '*',
    filter,
    schema = 'public',
    onInsert,
    onUpdate,
    onDelete,
    onChange
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    // Create unique channel name
    const channelName = `${table}_${event}_${filter || 'all'}_${Date.now()}`;
    
    // Create channel
    const channel = supabase.channel(channelName);

    // Build subscription config
    let subscriptionConfig: any = {
      event,
      schema,
      table
    };

    if (filter) {
      subscriptionConfig.filter = filter;
    }

    // Subscribe to changes
    channel
      .on(
        'postgres_changes',
        subscriptionConfig,
        (payload: RealtimePostgresChangesPayload<T>) => {
          try {
            // Call specific event handlers
            if (payload.eventType === 'INSERT' && onInsert) {
              onInsert(payload);
            } else if (payload.eventType === 'UPDATE' && onUpdate) {
              onUpdate(payload);
            } else if (payload.eventType === 'DELETE' && onDelete) {
              onDelete(payload);
            }

            // Call general change handler
            if (onChange) {
              onChange(payload);
            }
          } catch (err) {
            console.error('Error handling realtime event:', err);
            setError(err as Error);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setError(new Error('Channel subscription error'));
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false);
          setError(new Error('Channel subscription timed out'));
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [table, event, filter, schema, onInsert, onUpdate, onDelete, onChange, unsubscribe]);

  return {
    isConnected,
    error,
    unsubscribe
  };
};

/**
 * Hook for subscribing to multiple tables
 */
export const useSupabaseRealtimeMulti = (
  subscriptions: RealtimeSubscriptionOptions[]
): UseSupabaseRealtimeReturn[] => {
  return subscriptions.map(subscription => useSupabaseRealtime(subscription));
};

/**
 * Hook for presence tracking (who's online)
 */
export const useSupabasePresence = (roomId: string, userId: string, metadata?: any) => {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!roomId || !userId) return;

    const channel = supabase.channel(`presence:${roomId}`, {
      config: {
        presence: {
          key: userId
        }
      }
    });

    // Track presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this user's presence
          await channel.track({
            userId,
            onlineAt: new Date().toISOString(),
            ...metadata
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomId, userId, metadata]);

  return { onlineUsers };
};

/**
 * Hook for broadcast messages (real-time events)
 */
export const useSupabaseBroadcast = (channelName: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!channelName) return;

    const channel = supabase.channel(channelName);

    channel
      .on('broadcast', { event: 'message' }, (payload) => {
        setMessages(prev => [...prev, payload]);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelName]);

  const sendMessage = useCallback((event: string, payload: any) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event,
        payload
      });
    }
  }, []);

  return { messages, sendMessage };
};
