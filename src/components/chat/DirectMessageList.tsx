/**
 * Direct Message List Component
 * Displays list of direct message conversations
 */

import React, { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MessageCircle } from 'lucide-react';
import type { DirectMessage } from '@/types/chat';
import { cn } from '@/lib/utils';

interface DirectMessageListProps {
  conversations: DirectMessage[];
  currentUserId: string;
  onSelectConversation: (userId: string) => void;
}

interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: DirectMessage;
  unreadCount: number;
}

const DirectMessageList: React.FC<DirectMessageListProps> = ({
  conversations,
  currentUserId,
  onSelectConversation
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Group messages into conversations
  const groupedConversations = useMemo(() => {
    const conversationMap = new Map<string, Conversation>();

    conversations.forEach((message) => {
      const otherUserId = message.senderId === currentUserId
        ? message.recipientId
        : message.senderId;
      
      const otherUser = message.senderId === currentUserId
        ? message.recipient
        : message.sender;

      const existing = conversationMap.get(otherUserId);
      
      if (!existing || new Date(message.createdAt) > new Date(existing.lastMessage.createdAt)) {
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          userName: otherUser?.name || 'Unknown User',
          userAvatar: otherUser?.avatarUrl,
          lastMessage: message,
          unreadCount: existing?.unreadCount || 0
        });
      }

      // Count unread messages
      if (message.recipientId === currentUserId && !message.isRead) {
        const conv = conversationMap.get(otherUserId)!;
        conv.unreadCount++;
      }
    });

    return Array.from(conversationMap.values()).sort((a, b) =>
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }, [conversations, currentUserId]);

  // Filter conversations
  const filteredConversations = groupedConversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {searchQuery ? 'No conversations found' : 'No direct messages yet'}
              </p>
              <p className="text-xs mt-1">
                Start a conversation with someone!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => {
                const isOwnMessage = conversation.lastMessage.senderId === currentUserId;

                return (
                  <button
                    key={conversation.userId}
                    onClick={() => onSelectConversation(conversation.userId)}
                    className="w-full p-3 rounded-lg text-left transition-colors hover:bg-accent"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.userAvatar} />
                          <AvatarFallback>
                            {conversation.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online Status Indicator */}
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                      </div>

                      {/* Conversation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={cn(
                            'font-medium truncate',
                            conversation.unreadCount > 0 && 'font-semibold'
                          )}>
                            {conversation.userName}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className={cn(
                            'text-sm truncate',
                            conversation.unreadCount > 0
                              ? 'text-foreground font-medium'
                              : 'text-muted-foreground'
                          )}>
                            {isOwnMessage && (
                              <span className="mr-1">You:</span>
                            )}
                            {conversation.lastMessage.content || 'Sent an attachment'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="h-5 min-w-5 px-1.5">
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DirectMessageList;
