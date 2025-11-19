/**
 * Community Feed and Social Features Types
 * Frontend type definitions for community features
 */

// ============================================================================
// Core Types
// ============================================================================

export interface Post {
  id: string;
  authorId: string;
  content: string;
  type: PostType;
  media: MediaItem[];
  visibility: PostVisibility;
  isPinned: boolean;
  isEdited: boolean;
  editedAt?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  flagged: boolean;
  moderationStatus: ModerationStatus;
  moderationNotes?: string;
  moderatedAt?: string;
  moderatedBy?: string;
  isPrayerRequest: boolean;
  scriptureReferences: ScriptureReference[];
  hashtags: string[];
  mentions: string[];
  createdAt: string;
  updatedAt: string;
}

export enum PostType {
  TEXT = 'text',
  QUESTION = 'question',
  ANNOUNCEMENT = 'announcement',
  TESTIMONY = 'testimony',
  PRAYER_REQUEST = 'prayer_request',
  RESOURCE = 'resource',
  POLL = 'poll'
}

export enum PostVisibility {
  PUBLIC = 'public',
  FOLLOWERS = 'followers',
  PRIVATE = 'private',
  COURSE = 'course'
}

export enum ModerationStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
  FLAGGED = 'flagged'
}

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  mimetype: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  uploadedAt: string;
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document'
}

export interface ScriptureReference {
  reference: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  translation?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentCommentId?: string;
  isEdited: boolean;
  editedAt?: string;
  likesCount: number;
  flagged: boolean;
  moderationStatus: ModerationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PostWithAuthor extends Post {
  author: UserProfile;
  isLiked?: boolean;
  isFollowing?: boolean;
}

export interface CommentWithAuthor extends Comment {
  author: UserProfile;
  isLiked?: boolean;
  replies?: CommentWithAuthor[];
}

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  role: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

export interface TrendingTopic {
  id: string;
  hashtag: string;
  postCount: number;
  engagementScore: number;
  trendingSince: string;
  lastUpdated: string;
  isActive: boolean;
  createdAt: string;
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  FALSE_INFORMATION = 'false_information',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  THEOLOGICAL_CONCERN = 'theological_concern',
  OTHER = 'other'
}

export enum FeedSortOption {
  RECENT = 'recent',
  POPULAR = 'popular',
  TRENDING = 'trending',
  FOLLOWING = 'following'
}

export enum TrendingTimeRange {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month'
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreatePostData {
  content: string;
  type?: PostType;
  visibility?: PostVisibility;
  isPrayerRequest?: boolean;
  scriptureReferences?: ScriptureReference[];
  hashtags?: string[];
  mentions?: string[];
  media?: File[];
}

export interface UpdatePostData {
  content?: string;
  visibility?: PostVisibility;
  isPinned?: boolean;
}

export interface FeedFilters {
  type?: PostType;
  visibility?: PostVisibility;
  hashtag?: string;
  userId?: string;
  sortBy?: FeedSortOption;
}

export interface SearchFilters {
  query: string;
  type?: PostType;
  authorId?: string;
  startDate?: string;
  endDate?: string;
}
