/**
 * Public Badge Profile Page
 * "By the Spirit of Excellence, we showcase achievements publicly"
 * 
 * Public page for viewing a user's badge collection
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Award, ExternalLink, Share2, Shield, TrendingUp } from 'lucide-react';
import { BadgeProfileData } from '@/types/scrollbadge';
import { BadgeGallery } from '@/components/scrollbadge/BadgeGallery';
import { toast } from 'sonner';

export const PublicBadgeProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<BadgeProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/scrollbadge/profile/${userId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Profile not found');
        } else {
          setError('Failed to load profile');
        }
        return;
      }

      const data = await response.json();
      setProfile(data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleShareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Profile link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Award className="h-16 w-16 animate-pulse text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  {error || 'The badge profile you are looking for does not exist or is private.'}
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  Return Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <Avatar className="h-24 w-24">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.userName}`} />
                <AvatarFallback>
                  {profile.userName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{profile.userName}</h1>
                <p className="text-muted-foreground mb-4">
                  ScrollUniversity Badge Collection
                </p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{profile.totalBadges}</span>
                    <span className="text-muted-foreground">Total Badges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">{profile.publicBadges}</span>
                    <span className="text-muted-foreground">Public Badges</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleShareProfile}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        {profile.achievements && profile.achievements.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{achievement.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {achievement.badgeCount} badges
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Badge Gallery */}
        {userId && <BadgeGallery userId={userId} isOwnProfile={false} />}

        {/* Footer */}
        <Card>
          <CardContent className="py-6">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">
                All badges are verified on the blockchain and can be independently verified.
              </p>
              <Button variant="link" className="text-primary">
                <ExternalLink className="h-4 w-4 mr-2" />
                Learn more about ScrollBadge verification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
