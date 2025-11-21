/**
 * ScrollBadge Gallery Page
 * "By the Spirit of Excellence, we display our credentials"
 * 
 * Main page for viewing and managing user's badge collection
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Trophy, Share2 } from 'lucide-react';
import { BadgeGallery } from '@/components/scrollbadge/BadgeGallery';
import { BadgeAchievementProgress } from '@/components/scrollbadge/BadgeAchievementProgress';
import { useAuth } from '@/contexts/AuthContext';

export const ScrollBadgeGallery: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('gallery');

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground">
            Please sign in to view your badge collection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Award className="h-10 w-10 text-primary" />
          My ScrollBadge Collection
        </h1>
        <p className="text-muted-foreground text-lg">
          View and manage your verified credentials and achievements
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="gallery" className="gap-2">
            <Award className="h-4 w-4" />
            Badge Gallery
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Trophy className="h-4 w-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-6">
          <BadgeGallery userId={user.id} isOwnProfile={true} />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <BadgeAchievementProgress userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
