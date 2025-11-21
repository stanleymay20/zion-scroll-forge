# Real-time Features Components

This directory contains components and hooks for managing real-time features in ScrollUniversity.

## Overview

The real-time system provides instant updates across all connected clients using Supabase Real-time and WebSocket connections. It includes:

- **Real-time Notifications**: Instant notification delivery
- **Live Course Progress**: Real-time progress tracking
- **Collaborative Features**: Multi-user collaboration with presence
- **Optimistic UI Updates**: Instant feedback with automatic rollback
- **Chat Integration**: Real-time messaging

## Components

### RealtimeFeaturesDemo

Comprehensive demonstration of all real-time capabilities.

```tsx
import { RealtimeFeaturesDemo } from '@/components/realtime';

<RealtimeFeaturesDemo
  userId="user-123"
  courseId="course-456"
  documentId="doc-789"
/>
```

## Hooks

### useSupabaseRealtime

Subscribe to Supabase real-time database changes.

```tsx
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';

const { isConnected, error } = useSupabaseRealtime({
  table: 'notifications',
  filter: 'userId=eq.123',
  onInsert: (payload) => console.log('New notification:', payload.new),
  onUpdate: (payload) => console.log('Updated:', payload.new),
  onDelete: (payload) => console.log('Deleted:', payload.old)
});
```

### useRealtimeNotifications

Manage real-time notifications with automatic updates.

```tsx
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead
} = useRealtimeNotifications(userId);
```

### useRealtimeCourseProgress

Track live course progress updates.

```tsx
import { useRealtimeCourseProgress } from '@/hooks/useRealtimeCourseProgress';

const {
  courseProgress,
  lectureProgress,
  updateLectureProgress,
  markLectureComplete
} = useRealtimeCourseProgress(userId, courseId);
```

### useRealtimeCollaboration

Enable real-time collaboration with presence tracking.

```tsx
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';

const {
  document,
  onlineUsers,
  cursors,
  updateContent,
  updateCursor
} = useRealtimeCollaboration(documentId, userId, userName);
```

### useOptimisticUpdates

Implement optimistic UI updates with automatic rollback.

```tsx
import { useOptimisticUpdates } from '@/hooks/useOptimisticUpdates';

const {
  data,
  pendingUpdates,
  addOptimistic,
  updateOptimistic,
  deleteOptimistic,
  rollback
} = useOptimisticUpdates(initialData);

// Add with optimistic update
await addOptimistic(
  newItem,
  async () => {
    const result = await api.create(newItem);
    return result;
  }
);
```

## Services

### realtimeService

Centralized service for managing all real-time features.

```tsx
import { realtimeService } from '@/services/realtimeService';

// Initialize
realtimeService.initialize({
  enableNotifications: true,
  enablePresence: true,
  enableCourseProgress: true
});

// Subscribe to notifications
const unsubscribe = realtimeService.subscribeToNotifications(
  userId,
  (notification) => console.log('New notification:', notification)
);

// Track presence
const { untrack, getPresence } = realtimeService.trackPresence(
  roomId,
  userId,
  { userName: 'John Doe' }
);

// Cleanup
unsubscribe();
untrack();
```

## Features

### 1. Real-time Notifications

- Instant notification delivery across all devices
- Browser notifications when permitted
- Unread count tracking
- Mark as read functionality
- Automatic UI updates

### 2. Live Course Progress

- Real-time progress percentage updates
- Lecture completion tracking
- Assignment completion tracking
- Video playback position sync
- Progress visualization

### 3. Collaborative Features

- Multi-user presence tracking
- Real-time cursor positions
- Collaborative document editing
- Online user indicators
- Broadcast messaging

### 4. Optimistic UI Updates

- Instant UI feedback
- Automatic rollback on failure
- Pending update tracking
- Confirmation handling
- Error recovery

### 5. Chat Integration

- Real-time message delivery
- Typing indicators
- Read receipts
- Online status
- Message persistence

## Architecture

### Supabase Real-time

Uses Supabase's real-time capabilities for database changes:

- **Postgres Changes**: Subscribe to INSERT, UPDATE, DELETE events
- **Presence**: Track who's online in real-time
- **Broadcast**: Send messages between clients

### WebSocket (Socket.io)

Uses Socket.io for chat and custom real-time features:

- **Room-based messaging**: Join/leave rooms
- **Direct messages**: One-to-one communication
- **Typing indicators**: Show who's typing
- **Status updates**: Online/offline/away

### Optimistic Updates

Implements optimistic UI pattern:

1. Update UI immediately
2. Send request to server
3. Confirm or rollback based on response
4. Automatic timeout handling

## Best Practices

### 1. Subscription Management

Always clean up subscriptions:

```tsx
useEffect(() => {
  const unsubscribe = realtimeService.subscribeToTable(
    'notifications',
    handleNotification
  );

  return () => unsubscribe();
}, []);
```

### 2. Error Handling

Handle connection errors gracefully:

```tsx
const { isConnected, error } = useSupabaseRealtime({
  table: 'messages',
  onChange: handleChange
});

if (error) {
  console.error('Real-time error:', error);
  // Show error UI
}
```

### 3. Optimistic Updates

Use optimistic updates for better UX:

```tsx
await updateOptimistic(
  itemId,
  { completed: true },
  async () => {
    // Actual API call
    return await api.update(itemId, { completed: true });
  }
);
```

### 4. Presence Tracking

Track presence efficiently:

```tsx
const { untrack } = realtimeService.trackPresence(
  roomId,
  userId,
  { userName, avatar }
);

// Cleanup on unmount
return () => untrack();
```

## Performance Considerations

### 1. Subscription Limits

- Limit number of active subscriptions
- Unsubscribe when components unmount
- Use filters to reduce data transfer

### 2. Debouncing

Debounce frequent updates:

```tsx
const debouncedUpdate = debounce((content) => {
  updateContent(content);
}, 500);
```

### 3. Batching

Batch multiple updates:

```tsx
const updates = [];
// Collect updates
await Promise.all(updates.map(u => updateOptimistic(u)));
```

### 4. Caching

Cache real-time data locally:

```tsx
const [cache, setCache] = useState(new Map());

useSupabaseRealtime({
  table: 'data',
  onChange: (payload) => {
    setCache(prev => new Map(prev).set(payload.new.id, payload.new));
  }
});
```

## Testing

### Unit Tests

Test hooks and services:

```tsx
import { renderHook } from '@testing-library/react-hooks';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';

test('subscribes to real-time updates', () => {
  const { result } = renderHook(() =>
    useSupabaseRealtime({
      table: 'test',
      onChange: jest.fn()
    })
  );

  expect(result.current.isConnected).toBe(true);
});
```

### Integration Tests

Test real-time flows:

```tsx
test('receives real-time notifications', async () => {
  const { result } = renderHook(() =>
    useRealtimeNotifications('user-123')
  );

  // Trigger notification
  await createNotification({ userId: 'user-123' });

  // Wait for update
  await waitFor(() => {
    expect(result.current.notifications).toHaveLength(1);
  });
});
```

## Troubleshooting

### Connection Issues

If real-time features aren't working:

1. Check Supabase connection
2. Verify authentication token
3. Check network connectivity
4. Review browser console for errors

### Performance Issues

If experiencing lag:

1. Reduce number of subscriptions
2. Add filters to subscriptions
3. Implement debouncing
4. Check network bandwidth

### Data Sync Issues

If data isn't syncing:

1. Verify RLS policies
2. Check subscription filters
3. Review error logs
4. Test with simple queries

## Related Documentation

- [Supabase Real-time Documentation](https://supabase.com/docs/guides/realtime)
- [Socket.io Documentation](https://socket.io/docs/)
- [Optimistic UI Pattern](https://www.apollographql.com/docs/react/performance/optimistic-ui/)
