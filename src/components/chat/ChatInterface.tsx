/**
 * Chat Interface Component
 * Main real-time chat interface with rooms and direct messages
 * "Let your conversation be always full of grace" - Colossians 4:6
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import ChannelSidebar from './ChannelSidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import DirectMessageList from './DirectMessageList';
import ChatSettings from './ChatSettings';
import { useChatSocket } from '@/hooks/useChatSocket';
import { useChatAPI } from '@/hooks/useChatAPI';
import type { ChatRoom, ChatMessage, ChatSettings as ChatSettingsType } from '@/types/chat';

interface ChatInterfaceProps {
  initialRoomId?: string;
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  initialRoomId,
  className = ''
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'channels' | 'direct' | 'settings'>('channels');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(initialRoomId || null);
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);

  // Chat API hooks
  const {
    rooms,
    messages,
    directMessages,
    unreadCounts,
    isLoading,
    error,
    fetchRooms,
    fetchMessages,
    sendMessage,
    createRoom,
    joinRoom,
    leaveRoom,
    searchMessages
  } = useChatAPI();

  // WebSocket connection
  const {
    isConnected,
    typingUsers,
    onlineUsers,
    sendTyping,
    markAsRead,
    updateStatus
  } = useChatSocket({
    userId: user?.id || '',
    onMessageReceived: (message) => {
      // Message will be added to state by the hook
      console.log('New message received:', message);
    },
    onUserJoined: (data) => {
      console.log('User joined:', data);
    },
    onUserLeft: (data) => {
      console.log('User left:', data);
    }
  });

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      fetchRooms();
    }
  }, [user?.id, fetchRooms]);

  // Load messages when room changes
  useEffect(() => {
    if (activeRoomId) {
      fetchMessages(activeRoomId);
      markAsRead({ roomId: activeRoomId });
    }
  }, [activeRoomId, fetchMessages, markAsRead]);

  // Handle room selection
  const handleSelectRoom = useCallback((roomId: string) => {
    setActiveRoomId(roomId);
    setActiveTab('channels');
  }, []);

  // Handle send message
  const handleSendMessage = useCallback(async (content: string, attachments?: File[]) => {
    if (!activeRoomId || !content.trim()) return;

    try {
      await sendMessage({
        roomId: activeRoomId,
        content: content.trim(),
        replyToId: replyToMessage?.id,
        attachments
      });
      setReplyToMessage(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [activeRoomId, replyToMessage, sendMessage]);

  // Handle create room
  const handleCreateRoom = useCallback(async () => {
    // This would open a dialog to create a new room
    // For now, we'll just log
    console.log('Create room clicked');
  }, []);

  // Handle reply
  const handleReply = useCallback((message: ChatMessage) => {
    setReplyToMessage(message);
  }, []);

  // Handle cancel reply
  const handleCancelReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);

  // Get active room
  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const activeMessages = activeRoomId ? messages[activeRoomId] || [] : [];
  const roomTypingUsers = activeRoomId ? typingUsers[activeRoomId] || [] : [];

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Please log in to access chat</p>
      </Card>
    );
  }

  return (
    <div className={`flex h-[calc(100vh-4rem)] ${className}`}>
      {/* Sidebar */}
      <div className="w-80 border-r bg-background">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="direct">Direct</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="h-[calc(100%-3rem)] mt-0">
            <ChannelSidebar
              rooms={rooms}
              activeRoomId={activeRoomId}
              onSelectRoom={handleSelectRoom}
              onCreateRoom={handleCreateRoom}
              unreadCounts={unreadCounts}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="direct" className="h-[calc(100%-3rem)] mt-0">
            <DirectMessageList
              conversations={Object.values(directMessages).flat()}
              currentUserId={user.id}
              onSelectConversation={(userId) => {
                console.log('Select conversation with:', userId);
              }}
            />
          </TabsContent>

          <TabsContent value="settings" className="h-[calc(100%-3rem)] mt-0 p-4">
            <ChatSettings
              settings={{
                notifications: {
                  enabled: true,
                  sound: true,
                  desktop: true,
                  mentions: true
                },
                privacy: {
                  showOnlineStatus: true,
                  showReadReceipts: true,
                  allowDirectMessages: true
                },
                appearance: {
                  theme: 'auto',
                  fontSize: 'medium',
                  compactMode: false
                }
              }}
              onUpdate={(settings) => {
                console.log('Update settings:', settings);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b px-6 flex items-center justify-between bg-background">
              <div>
                <h2 className="font-semibold text-lg">{activeRoom.name}</h2>
                {activeRoom.description && (
                  <p className="text-sm text-muted-foreground">{activeRoom.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isConnected && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <MessageList
                messages={activeMessages}
                currentUserId={user.id}
                typingUsers={roomTypingUsers}
                onReply={handleReply}
                onEdit={(message) => console.log('Edit:', message)}
                onDelete={(messageId) => console.log('Delete:', messageId)}
                onReact={(messageId, emoji) => console.log('React:', messageId, emoji)}
                isLoading={isLoading}
              />
            </div>

            {/* Message Input */}
            <div className="border-t bg-background">
              <MessageInput
                roomId={activeRoomId}
                onSend={handleSendMessage}
                onTyping={(isTyping) => sendTyping(activeRoomId, isTyping)}
                replyTo={replyToMessage}
                onCancelReply={handleCancelReply}
                disabled={!isConnected}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No Channel Selected</h3>
              <p className="text-muted-foreground">
                Select a channel from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
