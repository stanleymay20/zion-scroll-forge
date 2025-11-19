# Real-time Chat Components

This directory contains all components for the real-time chat and messaging system.

## Components

### ChatInterface
Main chat interface component that orchestrates all chat functionality.

**Features:**
- Channel and direct message tabs
- Real-time WebSocket connection
- Message sending and receiving
- Typing indicators
- Online status tracking
- Settings management

**Usage:**
```tsx
import { ChatInterface } from '@/components/chat';

<ChatInterface initialRoomId="room-123" />
```

### ChannelSidebar
Displays list of chat rooms with unread indicators.

**Features:**
- Room search
- Grouped by room type (Public, Private, Course, Study Group)
- Unread message badges
- Last message preview
- Room actions menu

### MessageList
Displays chat messages with reactions, replies, and attachments.

**Features:**
- Date separators
- Message grouping by sender
- Reply threading
- File attachments (images, documents)
- Message reactions
- Edit/delete actions
- Typing indicators
- Auto-scroll to bottom

### MessageInput
Text input with file attachments and emoji support.

**Features:**
- Multi-line text input
- File attachment upload
- Emoji picker
- Reply preview
- Typing indicator
- Character count
- Send on Enter (Shift+Enter for new line)

### DirectMessageList
Displays list of direct message conversations.

**Features:**
- Conversation search
- Unread message badges
- Last message preview
- Online status indicators
- Sorted by most recent

### ChatSettings
Notification preferences and chat configuration.

**Features:**
- Notification settings (sound, desktop, mentions)
- Privacy settings (online status, read receipts, DMs)
- Appearance settings (theme, font size, compact mode)

## Hooks

### useChatAPI
Manages REST API calls for chat functionality.

**Methods:**
- `fetchRooms()` - Get user's chat rooms
- `fetchMessages(roomId)` - Get messages from a room
- `sendMessage(request)` - Send a message
- `createRoom(request)` - Create a new room
- `joinRoom(roomId)` - Join a room
- `leaveRoom(roomId)` - Leave a room
- `searchMessages(request)` - Search messages

### useChatSocket
Manages real-time WebSocket connection.

**Methods:**
- `joinRoom(roomId)` - Join room for real-time updates
- `leaveRoom(roomId)` - Leave room
- `sendTyping(roomId, isTyping)` - Send typing indicator
- `markAsRead(data)` - Mark messages as read
- `updateStatus(status)` - Update online status

**Events:**
- `onMessageReceived` - New message received
- `onUserJoined` - User joined room
- `onUserLeft` - User left room
- `onTypingIndicator` - User typing
- `onStatusUpdated` - User status changed

## Types

All TypeScript types are defined in `src/types/chat.ts`:

- `ChatRoom` - Chat room data
- `ChatMessage` - Message data
- `DirectMessage` - Direct message data
- `ChatMember` - Room member data
- `MessageAttachment` - File attachment data
- `TypingIndicator` - Typing indicator data
- `UserStatus` - Online status enum
- `ChatRoomType` - Room type enum
- `MessageType` - Message type enum

## Backend Integration

The chat system integrates with the backend API:

**REST Endpoints:**
- `GET /api/chat/rooms` - Get user's rooms
- `POST /api/chat/rooms` - Create room
- `POST /api/chat/rooms/:id/join` - Join room
- `POST /api/chat/rooms/:id/leave` - Leave room
- `GET /api/chat/rooms/:id/messages` - Get messages
- `POST /api/chat/messages` - Send message
- `PUT /api/chat/messages/:id` - Update message
- `DELETE /api/chat/messages/:id` - Delete message
- `POST /api/chat/direct-messages` - Send direct message
- `GET /api/chat/direct-messages/:userId` - Get direct messages
- `GET /api/chat/messages/search` - Search messages

**WebSocket Events:**
- `join_room` - Join room for real-time updates
- `leave_room` - Leave room
- `send_message` - Send message via WebSocket
- `typing` - Send typing indicator
- `mark_as_read` - Mark messages as read
- `update_status` - Update online status

## Spiritual Integration

All chat components follow ScrollUniversity's spiritual principles:

- Grace-filled communication (Colossians 4:6)
- Edifying conversations (Ephesians 4:29)
- Content moderation for theological alignment
- Prayer request support
- Scripture reference integration

## Accessibility

All components follow WCAG 2.1 AA standards:

- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA labels and roles
- Color contrast compliance

## Performance

Optimizations implemented:

- Virtual scrolling for long message lists
- Message pagination
- Image lazy loading
- WebSocket connection pooling
- Redis caching for typing indicators
- Optimistic UI updates

## Security

Security measures:

- JWT authentication
- Message encryption for DMs
- File virus scanning
- XSS prevention
- Rate limiting
- Content moderation

## Requirements Validation

This implementation satisfies:

**Requirement 5.2:** Real-time chat with WebSocket connections
**Requirement 5.3:** Direct messaging with encryption
- ✅ Chat interface with message list and input
- ✅ Channel sidebar with unread indicators
- ✅ Direct message conversations
- ✅ Typing indicators and online status
- ✅ File attachment preview and upload
- ✅ Message search and filtering
- ✅ Chat settings and notification preferences
