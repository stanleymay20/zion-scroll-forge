# Study Groups Components

Comprehensive study group collaboration system for ScrollUniversity.

## Overview

"As iron sharpens iron, so one person sharpens another" - Proverbs 27:17

The Study Groups feature provides a complete collaborative learning environment where students can:
- Create and join study groups
- Communicate via real-time chat
- Collaborate on documents
- Schedule and manage events
- Submit and track group assignments
- View group analytics and performance
- Manage group settings and members

## Components

### StudyGroupList
Displays available study groups with search and filtering capabilities.

**Features:**
- Search study groups by name, tags, or interests
- Filter by course, academic level, and status
- Join public groups or request to join private groups
- View group details (members, meeting schedule, tags)

### StudyGroupDetail
Main view for a study group with tabbed interface for different features.

**Tabs:**
- Chat: Real-time group messaging
- Members: Member management and roles
- Documents: Collaborative document editing
- Calendar: Event scheduling and management
- Assignments: Group assignment submission
- Analytics: Group performance metrics
- Settings: Group configuration (owner/moderator only)

### CreateStudyGroupDialog
Dialog for creating new study groups with comprehensive configuration options.

**Configuration:**
- Basic information (name, description)
- Privacy settings (public/private)
- Member limits
- Tags and interests
- Meeting schedule (frequency, day, time)

### GroupChat
Real-time chat interface with WebSocket support.

**Features:**
- Real-time message delivery
- Message history with date grouping
- File attachments
- Typing indicators
- Read receipts

### GroupMembers
Member management interface with role-based permissions.

**Features:**
- View all group members
- Update member roles (owner only)
- Remove members (owner/moderator)
- View member contribution scores
- Display role badges (Owner, Moderator, Member)

### GroupDocuments
Collaborative document editing system.

**Features:**
- Create and edit documents
- Version control
- Document locking for concurrent editing
- Document history
- Delete documents

### GroupCalendar
Event scheduling and calendar management.

**Features:**
- Create events (study sessions, video calls, assignments, etc.)
- Set event details (time, location, video URL)
- RSVP to events (Attending, Maybe, Can't Attend)
- View upcoming events
- Recurring event support

### GroupAssignments
Assignment management for group work.

**Features:**
- Create assignments (moderator/owner)
- Set due dates
- Submit assignments
- Track assignment status
- View submission history

### GroupAnalytics
Analytics dashboard showing group performance and engagement.

**Metrics:**
- Total and active members
- Message count
- Document count
- Assignment completion rate
- Average participation
- Average response time
- Top contributors
- Activity by day
- Engagement trends

### GroupSettings
Settings management for group owners and moderators.

**Settings:**
- Basic information
- Privacy settings
- Member limits
- Meeting schedule
- Group status (Active, Inactive, Archived)
- Delete group

## Usage

```tsx
import { StudyGroups } from '@/pages/StudyGroups';

// In your router
<Route path="/study-groups" element={<StudyGroups />} />
```

## API Integration

All components integrate with the backend API at `/api/study-groups/*`:

- `GET /api/study-groups` - List study groups
- `POST /api/study-groups` - Create study group
- `GET /api/study-groups/:id` - Get group details
- `PUT /api/study-groups/:id` - Update group
- `DELETE /api/study-groups/:id` - Delete group
- `POST /api/study-groups/:id/join` - Join group
- `POST /api/study-groups/:id/leave` - Leave group
- `GET /api/study-groups/:id/members` - Get members
- `GET /api/study-groups/:id/documents` - Get documents
- `GET /api/study-groups/:id/events` - Get events
- `GET /api/study-groups/:id/assignments` - Get assignments
- `GET /api/study-groups/:id/analytics` - Get analytics

## Real-time Features

The GroupChat component uses WebSocket connections for real-time messaging:

```tsx
import { useChatSocket } from '@/hooks/useChatSocket';

const { socket, connected } = useChatSocket();

// Join room
socket.emit('join-room', { roomId: `group-${groupId}` });

// Listen for messages
socket.on('new-message', (message) => {
  // Handle new message
});
```

## Video Conferencing

Groups support video conferencing integration:

```tsx
// Start video call
const response = await fetch(`/api/study-groups/${groupId}/video-conference/start`, {
  method: 'POST',
  body: JSON.stringify({ provider: 'JITSI' })
});

const { joinUrl } = await response.json();
window.open(joinUrl, '_blank');
```

## Permissions

Role-based permissions:
- **Owner**: Full control (all permissions)
- **Moderator**: Manage members, create assignments, moderate content
- **Member**: Participate in discussions, submit assignments, view content

## Spiritual Integration

Study groups incorporate spiritual formation principles:
- Biblical references in group descriptions
- Prayer request sharing
- Scripture memory challenges
- Faith-based discussion topics
- Kingdom-focused collaboration

## Requirements Validation

This implementation satisfies:
- **Requirement 5.2**: Study group creation, management, and collaboration
- **Requirement 5.3**: Real-time chat, video conferencing, and collaborative tools

## Future Enhancements

Potential improvements:
- Screen sharing during video calls
- Whiteboard collaboration
- AI-powered study recommendations
- Gamification and rewards
- Mobile app integration
- Offline document editing
- Advanced analytics and insights
