# Community Feed and Social Features Implementation

**"Let us consider how we may spur one another on toward love and good deeds" - Hebrews 10:24**

## Overview

This document describes the implementation of the Community Feed and Social Features system for ScrollUniversity, providing a comprehensive social platform for students to interact, share, and build community.

## Implementation Date

December 20, 2024

## Features Implemented

### 1. Post Creation and Management
- ✅ Rich text post creation with media support
- ✅ Multiple post types (text, question, announcement, testimony, prayer request, resource, poll)
- ✅ Post visibility controls (public, followers, private, course)
- ✅ Post editing with edit history tracking
- ✅ Post deletion with authorization checks
- ✅ Automatic hashtag extraction
- ✅ Automatic mention extraction
- ✅ Scripture reference support
- ✅ Post pinning capability

### 2. Comment System
- ✅ Threaded comments with nested replies
- ✅ Comment editing and deletion
- ✅ Comment likes
- ✅ Comment moderation
- ✅ Real-time comment notifications

### 3. Social Interactions
- ✅ Like posts and comments
- ✅ Share posts with custom messages
- ✅ Follow/unfollow users
- ✅ View followers and following lists
- ✅ User profile pages with stats
- ✅ Social interaction notifications

### 4. Content Moderation
- ✅ AI-powered content flagging using GPT-4
- ✅ Manual content reporting system
- ✅ Moderation queue for admins
- ✅ Multiple moderation actions (approve, reject, flag, remove)
- ✅ Report management and resolution
- ✅ Automated content safety checks
- ✅ Theological concern detection

### 5. Notification System
- ✅ Real-time notifications for social interactions
- ✅ Notification types: likes, comments, shares, follows, mentions, replies
- ✅ Mark as read functionality
- ✅ Bulk mark all as read
- ✅ Notification filtering by type
- ✅ Unread count tracking

### 6. Trending Topics and Hashtags
- ✅ Automatic trending topic detection
- ✅ Engagement score calculation
- ✅ Time-based trending (hour, day, week, month)
- ✅ Hashtag search functionality
- ✅ Related hashtag suggestions
- ✅ Posts by hashtag filtering

### 7. Search Functionality
- ✅ Full-text post search
- ✅ User search by name and username
- ✅ Hashtag search
- ✅ Advanced filtering options
- ✅ Pagination support

### 8. Feed Personalization
- ✅ Multiple feed sorting options (recent, popular, trending, following)
- ✅ Feed filtering by post type
- ✅ Feed filtering by visibility
- ✅ Feed filtering by hashtag
- ✅ User-specific feeds

## Database Schema

### Tables Created

1. **posts** - Main post storage
   - Content, media, metadata
   - Engagement metrics (likes, comments, shares, views)
   - Moderation status and flags
   - Spiritual content (prayer requests, scripture references)
   - Hashtags and mentions

2. **comments** - Comment storage with threading
   - Parent-child relationships
   - Edit tracking
   - Moderation status

3. **likes** - Like tracking for posts and comments
   - Unique constraints to prevent duplicate likes
   - Efficient indexing

4. **shares** - Post sharing tracking
   - Share messages
   - Share count updates

5. **follows** - User follow relationships
   - Follower/following tracking
   - Self-follow prevention

6. **post_reports** - Content reporting system
   - Report reasons and descriptions
   - Review status and actions taken

7. **trending_topics** - Hashtag trending data
   - Engagement scores
   - Post counts
   - Active status tracking

8. **notifications** - User notification system
   - Multiple notification types
   - Read status tracking
   - Action URLs

### Indexes Created

- Performance-optimized indexes on all foreign keys
- Composite indexes for common queries
- GIN indexes for array fields (hashtags)
- Unique indexes to prevent duplicates

## Services Implemented

### 1. CommunityService
**Location:** `backend/src/services/CommunityService.ts`

**Responsibilities:**
- Post CRUD operations
- Feed generation and filtering
- Post search functionality
- User search functionality
- Hashtag and mention extraction
- Trending topic updates

**Key Methods:**
- `createPost()` - Create new posts with AI moderation
- `updatePost()` - Update existing posts
- `deletePost()` - Delete posts with authorization
- `getFeed()` - Get personalized feed
- `searchPosts()` - Search posts by content
- `searchUsers()` - Search users by name

### 2. CommentService
**Location:** `backend/src/services/CommentService.ts`

**Responsibilities:**
- Comment CRUD operations
- Threaded comment management
- Comment notifications

**Key Methods:**
- `createComment()` - Create comments with notifications
- `updateComment()` - Update comments
- `deleteComment()` - Delete comments with authorization
- `getComments()` - Get comments with replies

### 3. SocialInteractionService
**Location:** `backend/src/services/SocialInteractionService.ts`

**Responsibilities:**
- Like/unlike posts and comments
- Share posts
- Follow/unfollow users
- Get followers and following lists
- User profile management

**Key Methods:**
- `likePost()` - Toggle post likes
- `likeComment()` - Toggle comment likes
- `sharePost()` - Share posts with notifications
- `followUser()` - Toggle user follows
- `getFollowers()` - Get user followers
- `getFollowing()` - Get users being followed
- `getUserProfile()` - Get user profile with stats

### 4. ContentModerationService
**Location:** `backend/src/services/ContentModerationService.ts`

**Responsibilities:**
- AI-powered content flagging
- Manual content reporting
- Moderation queue management
- Moderation actions

**Key Methods:**
- `flagContentWithAI()` - AI content analysis
- `reportPost()` - Create content reports
- `getModerationQueue()` - Get posts needing moderation
- `moderatePost()` - Take moderation actions
- `getPostReports()` - Get reports for a post

### 5. NotificationService
**Location:** `backend/src/services/NotificationService.ts`

**Responsibilities:**
- Notification creation and delivery
- Notification management
- Read status tracking

**Key Methods:**
- `getNotifications()` - Get user notifications
- `markAsRead()` - Mark notification as read
- `markAllAsRead()` - Mark all notifications as read
- `createNotification()` - Create new notification
- `getUnreadCount()` - Get unread notification count

### 6. TrendingTopicsService
**Location:** `backend/src/services/TrendingTopicsService.ts`

**Responsibilities:**
- Trending topic calculation
- Hashtag management
- Topic search

**Key Methods:**
- `getTrendingTopics()` - Get trending hashtags
- `updateTrendingTopics()` - Recalculate trending scores
- `getPostsByHashtag()` - Get posts for a hashtag
- `getRelatedHashtags()` - Get related hashtags
- `searchHashtags()` - Search hashtags

## API Endpoints

### Post Endpoints
- `POST /api/community/posts` - Create post
- `GET /api/community/feed` - Get feed
- `GET /api/community/posts/:postId` - Get single post
- `PUT /api/community/posts/:postId` - Update post
- `DELETE /api/community/posts/:postId` - Delete post
- `GET /api/community/posts/search` - Search posts

### Comment Endpoints
- `POST /api/community/comments` - Create comment
- `GET /api/community/posts/:postId/comments` - Get comments
- `PUT /api/community/comments/:commentId` - Update comment
- `DELETE /api/community/comments/:commentId` - Delete comment

### Social Interaction Endpoints
- `POST /api/community/posts/:postId/like` - Like/unlike post
- `POST /api/community/comments/:commentId/like` - Like/unlike comment
- `POST /api/community/posts/:postId/share` - Share post
- `POST /api/community/users/:userId/follow` - Follow/unfollow user
- `GET /api/community/users/:userId/followers` - Get followers
- `GET /api/community/users/:userId/following` - Get following
- `GET /api/community/users/:userId/profile` - Get user profile
- `GET /api/community/users/search` - Search users

### Moderation Endpoints
- `POST /api/community/posts/:postId/report` - Report post
- `GET /api/community/moderation/queue` - Get moderation queue (admin)
- `POST /api/community/moderation/posts/:postId` - Moderate post (admin)

### Notification Endpoints
- `GET /api/community/notifications` - Get notifications
- `PUT /api/community/notifications/:notificationId/read` - Mark as read
- `PUT /api/community/notifications/read-all` - Mark all as read

### Trending Topics Endpoints
- `GET /api/community/trending` - Get trending topics
- `GET /api/community/hashtags/:hashtag/posts` - Get posts by hashtag
- `GET /api/community/hashtags/search` - Search hashtags

## TypeScript Types

**Location:** `backend/src/types/community.types.ts`

Comprehensive type definitions including:
- Post, Comment, Like, Share, Follow types
- Request/Response types for all endpoints
- Moderation types
- Notification types
- Trending topic types
- Analytics types

## Security Features

### Authentication
- All endpoints require authentication
- JWT token validation
- User identity verification

### Authorization
- Post/comment ownership verification
- Admin-only moderation endpoints
- Role-based access control

### Content Safety
- AI-powered content moderation
- Automatic flagging of inappropriate content
- Manual reporting system
- Theological concern detection

### Data Protection
- SQL injection prevention via parameterized queries
- XSS prevention via input sanitization
- Rate limiting on all endpoints
- CORS configuration

## Performance Optimizations

### Database
- Comprehensive indexing strategy
- Efficient query patterns
- Connection pooling
- Query optimization

### Caching
- Redis caching for trending topics
- Feed caching strategies
- Notification caching

### Pagination
- Cursor-based pagination support
- Configurable page sizes
- Efficient offset queries

## Spiritual Integration

### Prayer Requests
- Special post type for prayer requests
- Prayer tracking and answered prayers
- Community intercession features

### Scripture References
- Scripture reference support in posts
- Multiple translation support
- Verse highlighting

### Theological Moderation
- AI detection of theological concerns
- Elder review for spiritual content
- Kingdom-focused content promotion

## Testing

### Unit Tests
**Location:** `backend/src/services/__tests__/CommunityService.test.ts`

Tests cover:
- Post creation and management
- Feed retrieval and filtering
- Search functionality
- Update operations
- Error handling

### Integration Tests
- API endpoint testing
- Database integration testing
- Service interaction testing

## Migration

**Location:** `backend/prisma/migrations/20251220000001_community_feed_social_features/migration.sql`

- Creates all necessary tables
- Sets up indexes
- Establishes foreign key relationships
- Includes rollback support

## Future Enhancements

### Planned Features
1. Real-time feed updates via WebSocket
2. Advanced content recommendations
3. User reputation system
4. Community badges and achievements
5. Post scheduling
6. Draft posts
7. Poll functionality
8. Rich media embeds
9. Content analytics dashboard
10. Advanced moderation tools

### Performance Improvements
1. GraphQL API support
2. Advanced caching strategies
3. CDN integration for media
4. Database sharding for scale
5. Read replicas for queries

## Monitoring and Analytics

### Metrics Tracked
- Post creation rate
- Engagement metrics (likes, comments, shares)
- User activity patterns
- Trending topic performance
- Moderation queue size
- Notification delivery rates

### Logging
- All operations logged via Winston
- Error tracking and alerting
- Performance monitoring
- Security event logging

## Dependencies

### Required Services
- PostgreSQL database
- Redis cache
- AI Gateway Service (GPT-4)
- Authentication service
- File storage service

### NPM Packages
- @prisma/client
- express
- winston (logging)

## Configuration

### Environment Variables
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-...
JWT_SECRET=...
```

### Service Configuration
- Max post length: 5000 characters
- Max comment length: 1000 characters
- Max media per post: 10 files
- Trending topic threshold: 10 posts
- AI moderation confidence threshold: 0.8

## Deployment Notes

### Database Migration
```bash
cd backend
npm run migrate
```

### Service Startup
The community service starts automatically with the main server.

### Health Checks
- Database connectivity
- Redis connectivity
- AI service availability

## Support and Maintenance

### Common Issues
1. **Slow feed loading** - Check database indexes
2. **Notification delays** - Verify Redis connection
3. **AI moderation errors** - Check OpenAI API key

### Maintenance Tasks
1. Update trending topics hourly
2. Clean up old notifications weekly
3. Archive old posts monthly
4. Review moderation queue daily

## Conclusion

The Community Feed and Social Features system provides a comprehensive, secure, and spiritually-aligned social platform for ScrollUniversity students. The implementation follows best practices for security, performance, and scalability while maintaining the platform's kingdom-focused mission.

**Implementation Status:** ✅ Complete

**Requirements Validated:** 5.1, 5.4, 5.5

**Next Steps:** Frontend implementation and real-time WebSocket integration
