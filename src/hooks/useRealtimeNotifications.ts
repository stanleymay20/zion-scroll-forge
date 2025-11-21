/**
 * Real-time Notifications Hook
 * Manages real-time notification updates
 * "Let your light shine before others" - Matthew 5:16
 */

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseRealtime } from './useSupabaseRealtime';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface UseRealtimeNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useRealtimeNotifications = (userId: string): UseRealtimeNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial notifications
  useEffect(() => {
    if (!userId) return;

    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('userId', userId)
          .order('createdAt', { ascending: false })
          .limit(50);

        if (error) throw error;
        setNotifications(data || []);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [userId]);

  // Subscribe to real-time updates
  useSupabaseRealtime<Notification>({
    table: 'notifications',
    filter: `userId=eq.${userId}`,
    onInsert: (payload) => {
      setNotifications(prev => [payload.new, ...prev]);
      
      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(payload.new.title, {
          body: payload.new.message,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png'
        });
      }
    },
    onUpdate: (payload) => {
      setNotifications(prev =>
        prev.map(n => n.id === payload.new.id ? payload.new : n)
      );
    },
    onDelete: (payload) => {
      setNotifications(prev =>
        prev.filter(n => n.id !== payload.old.id)
      );
    }
  });

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('userId', userId)
        .eq('read', false);

      if (error) throw error;

      // Optimistic update
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [userId]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // Optimistic update
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('userId', userId);

      if (error) throw error;

      // Optimistic update
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [userId]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };
};
