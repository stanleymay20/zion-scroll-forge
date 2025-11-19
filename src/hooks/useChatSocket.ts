/**
 * Chat WebSocket Hook
 * Manages real-time WebSocket connection for chat
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { supabase } from '@/integrations/supabase/client';
import type {
  ChatMessage,
  DirectMessage,
  TypingIndicator,
  UserStatus,
  SocketEvents
} from '@/types/chat';

interface UseChatSocketOptions {
  userId: string;
  onMessageReceived?: (message: ChatMessage) => void;
  onDirectMessageReceived?: (message: DirectMessage) => void;
  onUserJoined?: (data: { roomId: string; user: any }) => void;
  onUserLeft?: (data: { roomId: string; userId: string }) => void;
  onTypingIndicator?: (data: { roomId: string; user: any; isTyping: boolean }) => void;
  onStatusUpdated?: (data: { userId: string; status: UserStatus; lastSeen: string }) => void;
}

interface UseChatSocketReturn {
  isConnected: boolean;
  typingUsers: Record<string, TypingIndicator[]>;
  onlineUsers: Record<string, UserStatus>;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendTyping: (roomId: string, isTyping: boolean) => void;
  markAsRead: (data: { roomId?: string; messageId?: string }) => void;
  updateStatus: (status: UserStatus) => void;
}

export const useChatSocket = (options: UseChatSocketOptions): UseChatSocketReturn => {
  const {
    userId,
    onMessageReceived,
    onDirectMessageReceived,
    onUserJoined,
    onUserLeft,
    onTypingIndicator,
    onStatusUpdated
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingIndicator[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, UserStatus>>({});
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Initialize socket connection
  useEffect(() => {
    if (!userId) return;

    const initSocket = async () => {
      try {
        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.error('No auth token available');
          return;
        }

        // Connect to socket server
        const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001', {
          auth: {
            token: session.access_token
          },
          transports: ['websocket', 'polling']
        });

        socketRef.current = socket;

        // Connection events
        socket.on('connect', () => {
          console.log('Socket connected');
          setIsConnected(true);
        });

        socket.on('disconnect', () => {
          console.log('Socket disconnected');
          setIsConnected(false);
        });

        socket.on('error', (error: { message: string }) => {
          console.error('Socket error:', error);
        });

        // Message events
        socket.on('message_received', (data: SocketEvents['message_received']) => {
          console.log('Message received:', data);
          onMessageReceived?.(data.message);
        });

        socket.on('direct_message_received', (data: SocketEvents['direct_message_received']) => {
          console.log('Direct message received:', data);
          onDirectMessageReceived?.(data.message);
        });

        // Room events
        socket.on('user_joined', (data: SocketEvents['user_joined']) => {
          console.log('User joined:', data);
          onUserJoined?.(data);
        });

        socket.on('user_left', (data: SocketEvents['user_left']) => {
          console.log('User left:', data);
          onUserLeft?.(data);
        });

        // Typing indicator
        socket.on('typing_indicator', (data: SocketEvents['typing_indicator']) => {
          const { roomId, user, isTyping } = data;
          
          if (isTyping) {
            // Add typing user
            setTypingUsers(prev => ({
              ...prev,
              [roomId]: [
                ...(prev[roomId] || []).filter(u => u.userId !== user.id),
                {
                  roomId,
                  userId: user.id,
                  userName: user.name,
                  timestamp: new Date().toISOString()
                }
              ]
            }));

            // Clear existing timeout
            if (typingTimeoutsRef.current[`${roomId}-${user.id}`]) {
              clearTimeout(typingTimeoutsRef.current[`${roomId}-${user.id}`]);
            }

            // Set timeout to remove typing indicator
            typingTimeoutsRef.current[`${roomId}-${user.id}`] = setTimeout(() => {
              setTypingUsers(prev => ({
                ...prev,
                [roomId]: (prev[roomId] || []).filter(u => u.userId !== user.id)
              }));
            }, 3000);
          } else {
            // Remove typing user
            setTypingUsers(prev => ({
              ...prev,
              [roomId]: (prev[roomId] || []).filter(u => u.userId !== user.id)
            }));
          }

          onTypingIndicator?.(data);
        });

        // Status updates
        socket.on('status_updated', (data: SocketEvents['status_updated']) => {
          console.log('Status updated:', data);
          setOnlineUsers(prev => ({
            ...prev,
            [data.userId]: data.status
          }));
          onStatusUpdated?.(data);
        });

        // Read receipts
        socket.on('read_receipt', (data: SocketEvents['read_receipt']) => {
          console.log('Read receipt:', data);
        });

      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };

    initSocket();

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      // Clear all typing timeouts
      Object.values(typingTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      typingTimeoutsRef.current = {};
    };
  }, [userId, onMessageReceived, onDirectMessageReceived, onUserJoined, onUserLeft, onTypingIndicator, onStatusUpdated]);

  // Join room
  const joinRoom = useCallback((roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_room', { roomId });
    }
  }, []);

  // Leave room
  const leaveRoom = useCallback((roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_room', { roomId });
    }
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((roomId: string, isTyping: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { roomId, isTyping });
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback((data: { roomId?: string; messageId?: string }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_as_read', data);
    }
  }, []);

  // Update status
  const updateStatus = useCallback((status: UserStatus) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('update_status', { status });
    }
  }, []);

  return {
    isConnected,
    typingUsers,
    onlineUsers,
    joinRoom,
    leaveRoom,
    sendTyping,
    markAsRead,
    updateStatus
  };
};
