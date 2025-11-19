/**
 * Channel Sidebar Component
 * Displays list of chat rooms with unread indicators
 */

import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Search,
  Hash,
  Lock,
  Users,
  BookOpen,
  MessageCircle,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { ChatRoom, ChatRoomType } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChannelSidebarProps {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onCreateRoom: () => void;
  unreadCounts: Record<string, number>;
  isLoading?: boolean;
}

const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  rooms,
  activeRoomId,
  onSelectRoom,
  onCreateRoom,
  unreadCounts,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group rooms by type
  const groupedRooms = filteredRooms.reduce((acc, room) => {
    if (!acc[room.type]) {
      acc[room.type] = [];
    }
    acc[room.type].push(room);
    return acc;
  }, {} as Record<ChatRoomType, ChatRoom[]>);

  // Get icon for room type
  const getRoomIcon = (type: ChatRoomType) => {
    switch (type) {
      case 'PUBLIC':
        return <Hash className="h-4 w-4" />;
      case 'PRIVATE':
        return <Lock className="h-4 w-4" />;
      case 'COURSE':
        return <BookOpen className="h-4 w-4" />;
      case 'STUDY_GROUP':
        return <Users className="h-4 w-4" />;
      case 'DIRECT_MESSAGE':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  // Get room type label
  const getRoomTypeLabel = (type: ChatRoomType) => {
    switch (type) {
      case 'PUBLIC':
        return 'Public Channels';
      case 'PRIVATE':
        return 'Private Channels';
      case 'COURSE':
        return 'Course Channels';
      case 'STUDY_GROUP':
        return 'Study Groups';
      case 'DIRECT_MESSAGE':
        return 'Direct Messages';
      default:
        return 'Channels';
    }
  };

  // Format last message time
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
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Channels</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCreateRoom}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Room List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">
                {searchQuery ? 'No channels found' : 'No channels yet'}
              </p>
              {!searchQuery && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={onCreateRoom}
                  className="mt-2"
                >
                  Create your first channel
                </Button>
              )}
            </div>
          ) : (
            // Grouped room list
            Object.entries(groupedRooms).map(([type, typeRooms]) => (
              <div key={type} className="mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  {getRoomTypeLabel(type as ChatRoomType)}
                </h3>
                <div className="space-y-1">
                  {typeRooms.map((room) => {
                    const unreadCount = unreadCounts[room.id] || 0;
                    const isActive = room.id === activeRoomId;

                    return (
                      <button
                        key={room.id}
                        onClick={() => onSelectRoom(room.id)}
                        className={cn(
                          'w-full p-3 rounded-lg text-left transition-colors',
                          'hover:bg-accent',
                          isActive && 'bg-accent'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Room Icon */}
                          <div className={cn(
                            'mt-1 flex-shrink-0',
                            isActive ? 'text-primary' : 'text-muted-foreground'
                          )}>
                            {getRoomIcon(room.type)}
                          </div>

                          {/* Room Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={cn(
                                'font-medium truncate',
                                unreadCount > 0 && 'font-semibold'
                              )}>
                                {room.name}
                              </span>
                              {unreadCount > 0 && (
                                <Badge variant="default" className="h-5 min-w-5 px-1.5">
                                  {unreadCount > 99 ? '99+' : unreadCount}
                                </Badge>
                              )}
                            </div>

                            {/* Last Message */}
                            {room.lastMessage && (
                              <div className="flex items-center justify-between gap-2">
                                <p className={cn(
                                  'text-sm truncate',
                                  unreadCount > 0
                                    ? 'text-foreground font-medium'
                                    : 'text-muted-foreground'
                                )}>
                                  {room.lastMessage.content}
                                </p>
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {formatTime(room.lastMessage.createdAt)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Room Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Info</DropdownMenuItem>
                              <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                              <DropdownMenuItem>Mark as Read</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Leave Channel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChannelSidebar;
