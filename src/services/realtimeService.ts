/**
 * Real-time Service
 * Centralized service for managing all real-time features
 * "The Lord is near to all who call on him" - Psalm 145:18
 */

import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeServiceConfig {
  enableNotifications: boolean;
  enablePresence: boolean;
  enableCourseProgress: boolean;
  enableChat: boolean;
  enableCollaboration: boolean;
}

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private config: RealtimeServiceConfig = {
    enableNotifications: true,
    enablePresence: true,
    enableCourseProgress: true,
    enableChat: true,
    enableCollaboration: true
  };

  /**
   * Initialize real-time service
   */
  initialize(config?: Partial<RealtimeServiceConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    console.log('Real-time service initialized with config:', this.config);
  }

  /**
   * Subscribe to table changes
   */
  subscribeToTable<T = any>(
    tableName: string,
    callback: (payload: any) => void,
    filter?: string
  ): () => void {
    const channelName = `table:${tableName}:${filter || 'all'}`;
    
    if (this.channels.has(channelName)) {
      console.warn(`Already subscribed to ${channelName}`);
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase.channel(channelName);

    const subscriptionConfig: any = {
      event: '*',
      schema: 'public',
      table: tableName
    };

    if (filter) {
      subscriptionConfig.filter = filter;
    }

    channel
      .on('postgres_changes', subscriptionConfig, callback)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to ${channelName}`);
        }
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * Subscribe to notifications for a user
   */
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: any) => void
  ): () => void {
    if (!this.config.enableNotifications) {
      console.warn('Notifications are disabled');
      return () => {};
    }

    return this.subscribeToTable(
      'notifications',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          onNotification(payload.new);
        }
      },
      `userId=eq.${userId}`
    );
  }

  /**
   * Subscribe to course progress updates
   */
  subscribeToCourseProgress(
    userId: string,
    courseId: string,
    onProgress: (progress: any) => void
  ): () => void {
    if (!this.config.enableCourseProgress) {
      console.warn('Course progress tracking is disabled');
      return () => {};
    }

    const unsubEnrollment = this.subscribeToTable(
      'enrollments',
      (payload) => {
        if (payload.eventType === 'UPDATE') {
          onProgress({ type: 'enrollment', data: payload.new });
        }
      },
      `userId=eq.${userId},courseId=eq.${courseId}`
    );

    const unsubLecture = this.subscribeToTable(
      'lecture_progress',
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          onProgress({ type: 'lecture', data: payload.new });
        }
      },
      `userId=eq.${userId},courseId=eq.${courseId}`
    );

    return () => {
      unsubEnrollment();
      unsubLecture();
    };
  }

  /**
   * Subscribe to chat messages
   */
  subscribeToChatRoom(
    roomId: string,
    onMessage: (message: any) => void
  ): () => void {
    if (!this.config.enableChat) {
      console.warn('Chat is disabled');
      return () => {};
    }

    return this.subscribeToTable(
      'messages',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          onMessage(payload.new);
        }
      },
      `roomId=eq.${roomId}`
    );
  }

  /**
   * Track presence in a room
   */
  trackPresence(
    roomId: string,
    userId: string,
    metadata?: any
  ): { untrack: () => void; getPresence: () => any[] } {
    if (!this.config.enablePresence) {
      console.warn('Presence tracking is disabled');
      return {
        untrack: () => {},
        getPresence: () => []
      };
    }

    const channelName = `presence:${roomId}`;
    
    if (this.channels.has(channelName)) {
      const channel = this.channels.get(channelName)!;
      return {
        untrack: () => channel.untrack(),
        getPresence: () => Object.values(channel.presenceState()).flat()
      };
    }

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId
        }
      }
    });

    let presenceState: any[] = [];

    channel
      .on('presence', { event: 'sync' }, () => {
        presenceState = Object.values(channel.presenceState()).flat();
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId,
            onlineAt: new Date().toISOString(),
            ...metadata
          });
        }
      });

    this.channels.set(channelName, channel);

    return {
      untrack: () => {
        channel.untrack();
        this.unsubscribe(channelName);
      },
      getPresence: () => presenceState
    };
  }

  /**
   * Broadcast message to channel
   */
  broadcast(channelName: string, event: string, payload: any): void {
    const channel = this.channels.get(channelName);
    
    if (!channel) {
      console.warn(`Channel ${channelName} not found`);
      return;
    }

    channel.send({
      type: 'broadcast',
      event,
      payload
    });
  }

  /**
   * Subscribe to broadcast messages
   */
  subscribeToBroadcast(
    channelName: string,
    event: string,
    callback: (payload: any) => void
  ): () => void {
    if (this.channels.has(channelName)) {
      console.warn(`Already subscribed to ${channelName}`);
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase.channel(channelName);

    channel
      .on('broadcast', { event }, callback)
      .subscribe();

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * Unsubscribe from channel
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`Unsubscribed from ${channelName}`);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
      console.log(`Unsubscribed from ${name}`);
    });
    this.channels.clear();
  }

  /**
   * Get active channels count
   */
  getActiveChannelsCount(): number {
    return this.channels.size;
  }

  /**
   * Check if subscribed to channel
   */
  isSubscribed(channelName: string): boolean {
    return this.channels.has(channelName);
  }

  /**
   * Get channel status
   */
  getChannelStatus(channelName: string): string | null {
    const channel = this.channels.get(channelName);
    return channel ? channel.state : null;
  }
}

export const realtimeService = new RealtimeService();
export default realtimeService;
