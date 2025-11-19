/**
 * Community Feed Page
 * "Let us consider how we may spur one another on toward love and good deeds" - Hebrews 10:24
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityFeed } from '@/components/community/CommunityFeed';
import { PostComposer } from '@/components/community/PostComposer';
import { TrendingTopics } from '@/components/community/TrendingTopics';
import { SuggestedUsers } from '@/components/community/SuggestedUsers';
import { CommunitySearch } from '@/components/community/CommunitySearch';
import { FeedFilters } from '@/components/community/FeedFilters';
import { PostType, FeedSortOption, PostVisibility } from '@/types/community';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenSquare, Users, TrendingUp, Search } from 'lucide-react';

export const Community: React.FC = () => {
  const { user } = useAuth();
  const [showComposer, setShowComposer] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'following' | 'trending'>('feed');
  const [filters, setFilters] = useState({
    type: undefined as PostType | undefined,
    sortBy: FeedSortOption.RECENT,
    hashtag: undefined as string | undefined
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = useCallback(() => {
    setShowComposer(false);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleHashtagClick = useCallback((hashtag: string) => {
    setFilters(prev => ({ ...prev, hashtag }));
    setActiveTab('feed');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community</h1>
              <p className="text-gray-600 mt-1">
                Connect, share, and grow together in faith and learning
              </p>
            </div>
            <Button
              onClick={() => setShowComposer(true)}
              className="flex items-center gap-2"
            >
              <PenSquare className="w-4 h-4" />
              Create Post
            </Button>
          </div>

          {/* Search Bar */}
          <CommunitySearch />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Post Composer Modal */}
            {showComposer && (
              <div className="mb-6">
                <PostComposer
                  onPostCreated={handlePostCreated}
                  onCancel={() => setShowComposer(false)}
                />
              </div>
            )}

            {/* Feed Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="feed" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  All Posts
                </TabsTrigger>
                <TabsTrigger value="following" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Following
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </TabsTrigger>
              </TabsList>

              {/* Filters */}
              <div className="mt-4">
                <FeedFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>

              <TabsContent value="feed" className="mt-6">
                <CommunityFeed
                  filters={filters}
                  refreshTrigger={refreshTrigger}
                />
              </TabsContent>

              <TabsContent value="following" className="mt-6">
                <CommunityFeed
                  filters={{ ...filters, sortBy: FeedSortOption.FOLLOWING }}
                  refreshTrigger={refreshTrigger}
                />
              </TabsContent>

              <TabsContent value="trending" className="mt-6">
                <CommunityFeed
                  filters={{ ...filters, sortBy: FeedSortOption.TRENDING }}
                  refreshTrigger={refreshTrigger}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Trending Topics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Trending Topics
              </h3>
              <TrendingTopics onHashtagClick={handleHashtagClick} />
            </Card>

            {/* Suggested Users */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Suggested Connections
              </h3>
              <SuggestedUsers />
            </Card>

            {/* Community Guidelines */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold mb-2 text-blue-900">
                Community Guidelines
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Be respectful and kind to all members</li>
                <li>• Share content that edifies and encourages</li>
                <li>• Maintain theological integrity</li>
                <li>• Report inappropriate content</li>
                <li>• Pray for one another</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
