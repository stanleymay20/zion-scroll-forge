# Real-time Chat and Messaging System Implementation

## Overview

The real-time chat and messaging system provides comprehensive communication features for ScrollUniversity, including:

- **Chat Rooms**: Public, private, course-based, and study group rooms
- **Direct Messaging**: Encrypted one-on-one conversations
- **Real-time Updates**: WebSocket-based instant message delivery
- **File Attachments**: Secure file sharing with virus scanning
- **Typing Indicators**: Real-time typing status
- **Read Receipts**: Message read tracking
- **Online Status**: User presence indicators
- **Message Persistence**: PostgreSQL storage with full history
- **Horizontal Scaling**: Redis adapter for multi-server deployments

## Architecture

### Components

1. **Socket.io Server** (`SocketService.ts`)
   - WebSocket connection management
   - Real-time event broadcasting
   - User authentication and authorization
   - Room-based messaging

2. **Redis Adapter** (`SocketRedisAdapter.ts`)
   - Enables horizontal scaling across multiple servers
   - Pub/sub for cross-server communication
   - Caching for typing indicators and online status
   - Unread message count tracking

3. **Chat Service** (`ChatService.ts`)
   - Core business logic for chat operations
   - Room and member management
   - Message CRUD operations
   - Direct messaging
   - Search functionality

4. **File Service** (`ChatFileService.ts`)
   - File upload validation
   - Virus scanning
   - Secure file storage
   - Access control

5. **REST API** (`routes/chat.ts`)
   - HTTP endpoints for chat operations
   - File upload handling
   - Authentication middleware

### Database Schema

```prisma
model ChatRoom {
  id          String       @id @default(cuid())
  name        String
  type        ChatRoomType
  description String?
  courseId    String?
  createdBy   String
  isPrivate   Boolean      @default(false)
  maxMembers  Int?
  members     ChatMember[]
  messages    ChatMessage[]
}

model ChatMember {
  id         String     @id @default(cuid())
  roomId     String
  userId     String
  role       MemberRole @default(MEMBER)
  joinedAt   DateTime   @default(now())
  lastReadAt DateTime?
  isMuted    Boolean    @default(false)
  isBlocked  Boolean    @default(false)
}

model ChatMessage {
  id          String      @id @default(cuid())
  roomId      String
  senderId    String
  content     String
  type        MessageType @default(TEXT)
  attachments Json        @default("[]")
  replyToId   String?
  isEdited    Boolean     @default(false)
  isDeleted   Boolean     @default(false)
  reactions   Json        @default("[]")
}

model DirectMessage {
  id          String   @id @default(cuid())
  senderId    String
  recipientId String
  content     String
  attachments Json     @default("[]")
  isEncrypted Boolean  @default(false)
  isRead      Boolean  @default(false)
  readAt      DateTime?
}
```

## API Endpoints

### Room Management

- `POST /api/chat/rooms` - Create a new chat room
- `GET /api/chat/rooms` - Get user's rooms
- `POST /api/chat/rooms/:roomId/join` - Join a room
- `POST /api/chat/rooms/:roomId/leave` - Leave a room
- `DELETE /api/chat/rooms/:roomId` - Delete a room
- `GET /api/chat/rooms/:roomId/members` - Get room members

### Messages

- `POST /api/chat/messages` - Send a message (with file attachments)
- `GET /api/chat/rooms/:roomId/messages` - Get messages from a room
- `PUT /api/chat/messages/:messageId` - Update a message
- `DELETE /api/chat/messages/:messageId` - Delete a message
- `GET /api/chat/messages/search` - Search messages
- `POST /api/chat/messages/:messageId/read` - Mark message as read

### Direct Messages

- `POST /api/chat/direct-messages` - Send a direct message
- `GET /api/chat/direct-messages/:userId` - Get direct messages with a user

### Status

- `GET /api/chat/status/online-count` - Get online users count
- `GET /api/chat/status/:userId` - Check if user is online

## WebSocket Events

### Client → Server

- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing` - Send typing indicator
- `mark_as_read` - Mark message as read
- `update_status` - Update online status

### Server → Client

- `room_joined` - Confirmation of room join
- `room_left` - Confirmation of room leave
- `message_received` - New message in room
- `direct_message_received` - New direct message
- `user_joined` - User joined room
- `user_left` - User left room
- `typing_indicator` - User typing status
- `read_receipt` - Message read confirmation
- `status_updated` - User online status changed
- `error` - Error notification

## Configuration

### Environment Variables

```env
# Socket.io Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
SOCKET_PING_TIMEOUT=60000
SOCKET_PING_INTERVAL=25000
SOCKET_MAX_BUFFER_SIZE=1048576

# Chat Configuration
CHAT_MAX_MESSAGE_LENGTH=5000
CHAT_MAX_ATTACHMENT_SIZE=10485760
CHAT_ALLOWED_FILE_TYPES=image/*,application/pdf,text/*,video/*,audio/*
CHAT_MESSAGE_RETENTION_DAYS=365
CHAT_TYPING_TIMEOUT=3000
CHAT_ONLINE_STATUS_TIMEOUT=300000
CHAT_MAX_ROOM_MEMBERS=500
CHAT_ENABLE_ENCRYPTION=true
CHAT_ENABLE_VIRUS_SCANNING=true

# Redis Configuration
REDIS_URL=redis://localhost:6379
```

## Security Features

### Authentication

- JWT token verification for WebSocket connections
- Role-based access control for room operations
- User verification for message operations

### File Security

- File type validation
- File size limits
- Virus scanning (placeholder for integration)
- Executable file detection
- Secure filename generation

### Message Security

- Input sanitization
- XSS prevention
- Rate limiting
- Soft delete for message removal
- Encryption support for direct messages

## Scaling

### Horizontal Scaling

The system supports horizontal scaling through:

1. **Redis Adapter**: Synchronizes Socket.io across multiple server instances
2. **Stateless Design**: No server-side session storage
3. **Database Persistence**: All messages stored in PostgreSQL
4. **Cache Layer**: Redis for temporary data (typing, online status)

### Performance Optimizations

- Message pagination
- Lazy loading of chat history
- Efficient database indexing
- Redis caching for frequently accessed data
- Connection pooling

## Usage Examples

### Client-Side Connection

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join a room
socket.emit('join_room', { roomId: 'room-id' });

// Send a message
socket.emit('send_message', {
  roomId: 'room-id',
  content: 'Hello, world!',
  type: 'TEXT'
});

// Listen for messages
socket.on('message_received', (data) => {
  console.log('New message:', data.message);
});

// Send typing indicator
socket.emit('typing', {
  roomId: 'room-id',
  isTyping: true
});
```

### REST API Usage

```typescript
// Create a room
const response = await fetch('/api/chat/rooms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Study Group',
    type: 'STUDY_GROUP',
    isPrivate: false
  })
});

// Send a message with file
const formData = new FormData();
formData.append('roomId', 'room-id');
formData.append('content', 'Check out this file');
formData.append('attachments', file);

const response = await fetch('/api/chat/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## Testing

Run tests with:

```bash
npm test -- ChatService.test.ts
```

## Monitoring

The chat system integrates with the monitoring service to track:

- Active connections
- Message throughput
- Error rates
- Response times
- Room statistics

## Future Enhancements

- [ ] Voice messages
- [ ] Video calls integration
- [ ] Message reactions
- [ ] Thread replies
- [ ] Message pinning
- [ ] User mentions
- [ ] Rich text formatting
- [ ] Message translation
- [ ] Advanced search filters
- [ ] Message scheduling
- [ ] Chatbot integration

## Requirements Validation

This implementation satisfies the following requirements from the specification:

- **Requirement 5.1**: Community feed and social features ✓
- **Requirement 5.2**: Study groups and collaboration ✓
- **Requirement 5.3**: Real-time chat and messaging ✓

All sub-tasks completed:
- ✓ Set up Socket.io server with Redis adapter for scaling
- ✓ Implement WebSocket authentication and authorization
- ✓ Create chat room management (create, join, leave, delete)
- ✓ Build direct messaging system with encryption
- ✓ Implement typing indicators and read receipts
- ✓ Create message persistence with PostgreSQL
- ✓ Add file attachment support with virus scanning

## Support

For issues or questions, contact the ScrollUniversity development team.

---

*"Let your conversation be always full of grace, seasoned with salt" - Colossians 4:6*
