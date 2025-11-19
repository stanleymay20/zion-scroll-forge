/**
 * Message List Component
 * Displays chat messages with reactions, replies, and attachments
 */

import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Reply,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  File
} from 'lucide-react';
import type { ChatMessage, TypingIndicator, MessageAttachment } from '@/types/chat';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  typingUsers?: TypingIndicator[];
  onReply?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  typingUsers = [],
  onReply,
  onEdit,
  onDelete,
  onReact,
  isLoading = false
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format message time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date separator
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Get attachment icon
  const getAttachmentIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (mimetype.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (mimetype.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Group messages by date
  const groupedMessages = messages.reduce((acc, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, ChatMessage[]>);

  // Render attachment
  const renderAttachment = (attachment: MessageAttachment) => {
    const isImage = attachment.mimetype.startsWith('image/');

    if (isImage) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden max-w-sm">
          <img
            src={attachment.url}
            alt={attachment.filename}
            className="w-full h-auto"
          />
        </div>
      );
    }

    return (
      <div className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-accent max-w-sm">
        <div className="flex-shrink-0 text-muted-foreground">
          {getAttachmentIcon(attachment.mimetype)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.filename}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(attachment.size)}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => window.open(attachment.url, '_blank')}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full max-w-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-6">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="px-3 py-1 rounded-full bg-accent text-xs font-medium text-muted-foreground">
                {formatDate(dateMessages[0].createdAt)}
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4">
              {dateMessages.map((message, index) => {
                const isOwnMessage = message.senderId === currentUserId;
                const showAvatar = index === 0 || dateMessages[index - 1].senderId !== message.senderId;

                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3 group',
                      isOwnMessage && 'flex-row-reverse'
                    )}
                  >
                    {/* Avatar */}
                    {showAvatar ? (
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={message.sender?.avatarUrl} />
                        <AvatarFallback>
                          {message.sender?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10 flex-shrink-0" />
                    )}

                    {/* Message Content */}
                    <div className={cn(
                      'flex-1 max-w-2xl',
                      isOwnMessage && 'flex flex-col items-end'
                    )}>
                      {/* Sender Name & Time */}
                      {showAvatar && (
                        <div className={cn(
                          'flex items-center gap-2 mb-1',
                          isOwnMessage && 'flex-row-reverse'
                        )}>
                          <span className="text-sm font-semibold">
                            {isOwnMessage ? 'You' : message.sender?.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.createdAt)}
                          </span>
                          {message.isEdited && (
                            <span className="text-xs text-muted-foreground italic">
                              (edited)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Reply To */}
                      {message.replyTo && (
                        <div className={cn(
                          'mb-2 p-2 rounded-lg bg-accent/50 border-l-2 border-primary text-sm',
                          isOwnMessage && 'self-end'
                        )}>
                          <p className="text-xs text-muted-foreground mb-1">
                            Replying to {message.replyTo.sender?.name}
                          </p>
                          <p className="text-sm truncate">{message.replyTo.content}</p>
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div className={cn(
                        'relative group/message',
                        isOwnMessage && 'flex flex-col items-end'
                      )}>
                        <div className={cn(
                          'rounded-lg px-4 py-2',
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-accent',
                          message.isDeleted && 'italic opacity-60'
                        )}>
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>

                          {/* Attachments */}
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id}>
                              {renderAttachment(attachment)}
                            </div>
                          ))}
                        </div>

                        {/* Message Actions */}
                        {!message.isDeleted && (
                          <div className={cn(
                            'absolute top-0 opacity-0 group-hover/message:opacity-100 transition-opacity',
                            isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
                          )}>
                            <div className="flex items-center gap-1 px-2">
                              {onReply && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => onReply(message)}
                                >
                                  <Reply className="h-4 w-4" />
                                </Button>
                              )}
                              {isOwnMessage && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {onEdit && (
                                      <DropdownMenuItem onClick={() => onEdit(message)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                    )}
                                    {onDelete && (
                                      <DropdownMenuItem
                                        onClick={() => onDelete(message.id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Reactions */}
                        {message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.reactions.reduce((acc, reaction) => {
                              const existing = acc.find(r => r.emoji === reaction.emoji);
                              if (existing) {
                                existing.count++;
                                existing.userIds.push(reaction.userId);
                              } else {
                                acc.push({
                                  emoji: reaction.emoji,
                                  count: 1,
                                  userIds: [reaction.userId]
                                });
                              }
                              return acc;
                            }, [] as Array<{ emoji: string; count: number; userIds: string[] }>).map((reaction) => (
                              <button
                                key={reaction.emoji}
                                onClick={() => onReact?.(message.id, reaction.emoji)}
                                className={cn(
                                  'px-2 py-0.5 rounded-full text-xs flex items-center gap-1',
                                  'bg-accent hover:bg-accent/80 transition-colors',
                                  reaction.userIds.includes(currentUserId) && 'ring-1 ring-primary'
                                )}
                              >
                                <span>{reaction.emoji}</span>
                                <span className="text-muted-foreground">{reaction.count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex gap-3 items-center">
            <div className="w-10" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
              </div>
              <span>
                {typingUsers.length === 1
                  ? `${typingUsers[0].userName} is typing`
                  : `${typingUsers.length} people are typing`}
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList;
