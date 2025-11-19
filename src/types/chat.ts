/**
 * Real-time Chat and Messaging Types
 * Frontend type definitions for chat features
 * "Let your conversation be always full of grace" - Colossians 4:6
 */

// ============================================================================
// Core Types
// ============================================================================

export interface ChatRoom {
  id: string;
  name: string;
  type: ChatRoomType;
  description?: string;
  courseId?: string;
  createdBy: string;
  isPrivate: boolean;
  maxMembers?: number;
  unreadCount?: number;
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
}

export enum ChatRoomType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  COURSE = 'COURSE',
  STUDY_GROUP = 'STUDY_GROUP',
  DIRECT_MESSAGE = 'DIRECT_MESSAGE'
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  sender?: MessageSender;
  content: string;
  type: MessageType;
  attachments: MessageAttachment[];
  replyToId?: string;
  replyTo?: ChatMessage;
  isEdited: boolean;
  isDeleted: boolean;
  reactions: MessageReaction[];
  createdAt: string;
  updatedAt: string;
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  SYSTEM = 'SYSTEM'
}

export interface MessageSender {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  scanStatus: ScanStatus;
  uploadedAt: string;
}

export enum ScanStatus {
  PENDING = 'PENDING',
  CLEAN = 'CLEAN',
  INFECTED = 'INFECTED',
  ERROR = 'ERROR'
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  createdAt: string;
}

export interface ChatMember {
  id: string;
  roomId: string;
  userId: string;
  user?: UserInfo;
  role: MemberRole;
  joinedAt: string;
  lastReadAt?: string;
  isMuted: boolean;
  isBlocked: boolean;
}

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER'
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status?: UserStatus;
  lastSeen?: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  sender?: MessageSender;
  recipientId: string;
  recipient?: MessageSender;
  content: string;
  attachments: MessageAttachment[];
  isEncrypted: boolean;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TypingIndicator {
  roomId: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface ReadReceipt {
  messageId: string;
  userId: string;
  readAt: string;
}

export interface OnlineStatus {
  userId: string;
  status: UserStatus;
  lastSeen: string;
}

export enum UserStatus {
  ONLINE = 'ONLINE',
  AWAY = 'AWAY',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE'
}

// ============================================================================
// UI State Types
// ============================================================================

export interface ChatState {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  messages: Record<string, ChatMessage[]>;
  directMessages: Record<string, DirectMessage[]>;
  typingUsers: Record<string, TypingIndicator[]>;
  onlineUsers: Record<string, UserStatus>;
  unreadCounts: Record<string, number>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ChatSettings {
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    mentions: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showReadReceipts: boolean;
    allowDirectMessages: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
  };
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateRoomRequest {
  name: string;
  type: ChatRoomType;
  description?: string;
  courseId?: string;
  isPrivate: boolean;
  maxMembers?: number;
  memberIds?: string[];
}

export interface SendMessageRequest {
  roomId: string;
  content: string;
  type?: MessageType;
  replyToId?: string;
  attachments?: File[];
}

export interface SendDirectMessageRequest {
  recipientId: string;
  content: string;
  attachments?: File[];
  encrypt?: boolean;
}

export interface SearchMessagesRequest {
  query: string;
  roomId?: string;
  senderId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface SearchMessagesResponse {
  messages: ChatMessage[];
  total: number;
}

// ============================================================================
// WebSocket Event Types
// ============================================================================

export interface SocketEvents {
  // Client -> Server
  join_room: { roomId: string };
  leave_room: { roomId: string };
  send_message: {
    roomId: string;
    content: string;
    type?: MessageType;
    replyToId?: string;
  };
  typing: { roomId: string; isTyping: boolean };
  mark_as_read: { roomId?: string; messageId?: string };
  update_status: { status: UserStatus };

  // Server -> Client
  room_joined: {
    room: ChatRoom;
    member: ChatMember;
    recentMessages: ChatMessage[];
  };
  room_left: { roomId: string };
  message_received: {
    message: ChatMessage;
    sender: MessageSender;
  };
  direct_message_received: {
    message: DirectMessage;
    sender: MessageSender;
  };
  user_joined: {
    roomId: string;
    user: { id: string; name: string; avatarUrl?: string };
  };
  user_left: {
    roomId: string;
    userId: string;
  };
  typing_indicator: {
    roomId: string;
    user: { id: string; name: string };
    isTyping: boolean;
  };
  read_receipt: {
    messageId: string;
    userId: string;
    readAt: string;
  };
  status_updated: {
    userId: string;
    status: UserStatus;
    lastSeen: string;
  };
  error: { message: string };
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ChatInterfaceProps {
  userId: string;
  initialRoomId?: string;
}

export interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

export interface MessageInputProps {
  roomId: string;
  onSend: (content: string, attachments?: File[]) => void;
  replyTo?: ChatMessage;
  onCancelReply?: () => void;
  disabled?: boolean;
}

export interface ChannelSidebarProps {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onCreateRoom: () => void;
  unreadCounts: Record<string, number>;
}

export interface DirectMessageListProps {
  conversations: DirectMessage[];
  currentUserId: string;
  onSelectConversation: (userId: string) => void;
}

export interface TypingIndicatorProps {
  typingUsers: TypingIndicator[];
}

export interface OnlineStatusIndicatorProps {
  userId: string;
  status: UserStatus;
  showLabel?: boolean;
}

export interface FileAttachmentProps {
  attachment: MessageAttachment;
  onDownload?: () => void;
  onPreview?: () => void;
}

export interface ChatSettingsProps {
  settings: ChatSettings;
  onUpdate: (settings: Partial<ChatSettings>) => void;
}

export interface MessageSearchProps {
  onSearch: (query: string, filters?: Partial<SearchMessagesRequest>) => void;
  results?: SearchMessagesResponse;
  isSearching?: boolean;
}
