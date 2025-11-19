# Community and Social Features Components

This directory contains all frontend components for the ScrollUniversity community and social features, implementing Requirements 5.1, 5.4, and 5.5 from the Complete Production System specification.

## Overview

The community system enables students to connect, share, and grow together through posts, comments, likes, shares, following, and real-time interactions. All features are built with spiritual formation and kingdom-focused community in mind.

## Core Components

### Pages

#### `Community.tsx`
Main community page with tabbed feed interface:
- All Posts feed
- Following feed
- Trending feed
- Post composer integration
- Trending topics sidebar
- Suggested users sidebar
- Community guidelines

#### `UserProfilePage.tsx`
User profile display with activity feed:
- Profile header with avatar and bio
- Follow/unfollow functionality
- Stats (posts, followers, following)
- Activity tabs (posts, followers, following)
- Direct messaging integration

### Feed Components

#### `CommunityFeed.tsx`
Infinite scroll feed with posts:
- Lazy loading with intersection observer
- Filter support (type, sort, hashtag, user)
- Real-time updates
- Empty states and loading states
- Error handling

#### `PostCard.tsx`
Individual post display:
- Author information with avatar
- Post content with rich formatting
- Media gallery integration
- Scripture references display
- Like, comment, share interactions
- Post type badges
- Edit/delete for own posts
- Report functionality
- Hashtag and mention highlighting

#### `PostComposer.tsx`
Rich text post creation:
- Multiple post types (text, question, announcement, testimony, prayer request, resource)
- Visibility controls (public, followers, private)
- Media upload (images, videos)
- Hashtag and mention insertion
- Scripture reference support
- Character count
- Draft saving

### Interaction Components

#### `CommentSection.tsx`
Comment display and management:
- Nested replies support
- Like comments
- Edit/delete own comments
- Report comments
- Real-time updates
- Threaded conversations

#### `TrendingTopics.tsx`
Trending hashtags display:
- Top 10 trending topics
- Post count per topic
- Click to filter feed
- Real-time updates

#### `SuggestedUsers.tsx`
User recommendations:
- Suggested connections
- Quick follow/unfollow
- User stats preview
- Profile navigation

### Search and Filter

#### `CommunitySearch.tsx`
Global search functionality:
- Search posts and users
- Real-time search results
- Debounced input
- Result categorization
- Click to navigate

#### `FeedFilters.tsx`
Feed filtering controls:
- Sort options (recent, popular, trending)
- Post type filter
- Active hashtag display
- Clear filters

### Media Components

#### `PostMediaGallery.tsx`
Media attachment display:
- Image gallery with lightbox
- Video player
- Audio player
- Document download
- Grid layout (1-4+ items)
- Navigation controls

#### `ScriptureReferences.tsx`
Scripture reference display:
- Formatted references
- Translation display
- Styled card layout
- Multiple references support

### Moderation

#### `ReportDialog.tsx`
Content reporting interface:
- Report reason selection
- Detailed description
- Submit to moderation queue
- User feedback

#### `ModerationQueue.tsx`
Admin moderation interface:
- Pending, flagged, approved, rejected tabs
- Post review
- Approve/reject/flag actions
- Moderation notes
- AI flagging alerts

## Features

### Social Interactions
- ✅ Like posts and comments
- ✅ Comment with nested replies
- ✅ Share posts
- ✅ Follow/unfollow users
- ✅ Mention users with @username
- ✅ Hashtag support with #tag
- ✅ View counts

### Content Types
- ✅ Text posts
- ✅ Questions
- ✅ Announcements
- ✅ Testimonies
- ✅ Prayer requests
- ✅ Resources
- ✅ Polls (planned)

### Media Support
- ✅ Images (multiple per post)
- ✅ Videos with thumbnails
- ✅ Audio files
- ✅ Documents
- ✅ Lightbox viewer

### Discovery
- ✅ Trending topics
- ✅ Suggested users
- ✅ Global search
- ✅ Hashtag filtering
- ✅ User profiles

### Moderation
- ✅ Content reporting
- ✅ AI-powered flagging
- ✅ Admin moderation queue
- ✅ Approve/reject workflow
- ✅ Moderation notes

## API Integration

All components integrate with the backend community API:

```typescript
// Feed
GET /api/community/feed
GET /api/community/posts/:id

// Posts
POST /api/community/posts
PUT /api/community/posts/:id
DELETE /api/community/posts/:id

// Interactions
POST /api/community/posts/:id/like
POST /api/community/posts/:id/share
POST /api/community/posts/:id/comments
POST /api/community/comments/:id/like

// Users
GET /api/community/users/:id/profile
POST /api/community/users/:id/follow
GET /api/community/users/:id/followers
GET /api/community/users/:id/following

// Search
GET /api/community/search/posts
GET /api/community/search/users

// Trending
GET /api/community/trending

// Moderation
POST /api/community/posts/:id/report
GET /api/community/moderation/queue
POST /api/community/moderation/posts/:id
```

## State Management

Components use React hooks for local state:
- `useState` for component state
- `useEffect` for data fetching
- `useCallback` for memoized callbacks
- `useAuth` context for user authentication

## Styling

All components use:
- Tailwind CSS for utility styling
- Shadcn UI components for consistency
- Responsive design (mobile-first)
- Dark mode support (planned)

## Spiritual Integration

Community features include:
- Prayer request post type
- Scripture reference display
- Theological concern reporting
- Kingdom-focused guidelines
- Edifying content emphasis

## Performance Optimizations

- Infinite scroll with intersection observer
- Debounced search input
- Image lazy loading
- Virtual scrolling (planned)
- Optimistic UI updates

## Accessibility

- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management
- Color contrast compliance

## Future Enhancements

- [ ] Real-time notifications
- [ ] Live chat integration
- [ ] Video posts
- [ ] Polls and surveys
- [ ] Bookmarks/saved posts
- [ ] Post scheduling
- [ ] Analytics dashboard
- [ ] Emoji reactions
- [ ] GIF support
- [ ] Voice posts

## Usage Example

```tsx
import { Community } from '@/pages/Community';
import { UserProfilePage } from '@/components/community';

// In your router
<Route path="/community" element={<Community />} />
<Route path="/community/users/:userId" element={<UserProfilePage />} />
```

## Testing

Components should be tested for:
- Rendering with various props
- User interactions (click, type, scroll)
- API integration
- Error states
- Loading states
- Empty states

## Contributing

When adding new community features:
1. Follow existing component patterns
2. Use TypeScript interfaces from `@/types/community`
3. Integrate with backend API
4. Add proper error handling
5. Include loading states
6. Update this README

---

**"Let us consider how we may spur one another on toward love and good deeds" - Hebrews 10:24**
