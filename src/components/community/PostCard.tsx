/**
 * Post Card Component
 * Individual post display with interactions
 */

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PostWithAuthor, PostType } from '@/types/community';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { CommentSection } from './CommentSection';
import { PostMediaGallery } from './PostMediaGallery';
import { ScriptureReferences } from './ScriptureReferences';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Pin,
  Eye,
  Bookmark
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: PostWithAuthor;
  onUpdate: (post: PostWithAuthor) => void;
  onDelete: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [isFollowing, setIsFollowing] = useState(post.isFollowing || false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const isOwnPost = user?.id === post.authorId;

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/community/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to like post');

      const data = await response.json();
      setIsLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/community/posts/${post.id}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to share post');

      // Show success message
      alert('Post shared successfully!');
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/community/users/${post.authorId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to follow user');

      const data = await response.json();
      setIsFollowing(data.following);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/community/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete post');

      onDelete(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const getPostTypeColor = (type: PostType) => {
    switch (type) {
      case PostType.QUESTION:
        return 'bg-blue-100 text-blue-800';
      case PostType.ANNOUNCEMENT:
        return 'bg-purple-100 text-purple-800';
      case PostType.TESTIMONY:
        return 'bg-green-100 text-green-800';
      case PostType.PRAYER_REQUEST:
        return 'bg-yellow-100 text-yellow-800';
      case PostType.RESOURCE:
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    let content = post.content;

    // Highlight hashtags
    content = content.replace(/#(\w+)/g, '<span class="text-blue-600 font-medium cursor-pointer hover:underline">#$1</span>');

    // Highlight mentions
    content = content.replace(/@(\w+)/g, '<span class="text-blue-600 font-medium cursor-pointer hover:underline">@$1</span>');

    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <Avatar className="w-12 h-12">
            <AvatarImage src={post.author.avatarUrl} />
            <AvatarFallback>
              {post.author.firstName[0]}{post.author.lastName[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {post.author.firstName} {post.author.lastName}
              </h3>
              <span className="text-gray-500 text-sm">@{post.author.username}</span>
              {!isOwnPost && !isFollowing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFollow}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Follow
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-500 text-sm">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
              {post.isEdited && (
                <span className="text-gray-400 text-xs">(edited)</span>
              )}
              {post.isPinned && (
                <Badge variant="secondary" className="text-xs">
                  <Pin className="w-3 h-3 mr-1" />
                  Pinned
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwnPost ? (
              <>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                  <Flag className="w-4 h-4 mr-2" />
                  Report Post
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save Post
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post Type Badge */}
      {post.type !== PostType.TEXT && (
        <Badge className={`mb-3 ${getPostTypeColor(post.type)}`}>
          {post.type.replace('_', ' ').toUpperCase()}
        </Badge>
      )}

      {/* Content */}
      <div className="mb-4 text-gray-800 whitespace-pre-wrap">
        {renderContent()}
      </div>

      {/* Scripture References */}
      {post.scriptureReferences && post.scriptureReferences.length > 0 && (
        <ScriptureReferences references={post.scriptureReferences} />
      )}

      {/* Media Gallery */}
      {post.media && post.media.length > 0 && (
        <PostMediaGallery media={post.media} />
      )}

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {post.hashtags.map((tag) => (
            <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-blue-50">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          {post.viewsCount} views
        </span>
        <span>{likesCount} likes</span>
        <span>{commentsCount} comments</span>
        <span>{post.sharesCount} shares</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
        <Button
          variant={isLiked ? "default" : "ghost"}
          size="sm"
          onClick={handleLike}
          className="flex-1"
        >
          <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
          {isLiked ? 'Liked' : 'Like'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="flex-1"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Comment
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="flex-1"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-6 pt-6 border-t">
          <CommentSection
            postId={post.id}
            onCommentAdded={() => setCommentsCount(prev => prev + 1)}
          />
        </div>
      )}
    </Card>
  );
};
