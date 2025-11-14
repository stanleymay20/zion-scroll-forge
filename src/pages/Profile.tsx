import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { useScrollCoinBalance } from '@/hooks/useScrollCoinTransactions';
import { usePrayerStreak } from '@/hooks/usePrayerJournal';
import { useCommunityPosts } from '@/hooks/useCommunity';
import { Loader2, GraduationCap, BookOpen, Coins, Heart, Users } from 'lucide-react';

console.info('✝️ Profile loaded—Christ is Lord over identity');

export default function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: scrollCoinBalance } = useScrollCoinBalance();
  const { data: prayerStreak } = usePrayerStreak();
  const { data: communityPosts } = useCommunityPosts();

  const isLoading = profileLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const completedCourses = 0;
  const activeCourses = 0;

  return (
    <PageTemplate title="My Profile" description="Your ScrollUniversity identity">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">
                    {profile?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{profile?.email}</CardTitle>
                  <CardDescription className="capitalize">{profile?.role || 'Student'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">{new Date(profile?.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-[hsl(var(--scroll-gold))]" />
                ScrollCoins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[hsl(var(--scroll-gold))]">
                {scrollCoinBalance ?? profile?.scrollcoins ?? 0} SC
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Spiritual Formation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Prayer Streak</p>
                <p className="text-2xl font-bold">{prayerStreak || 0} days</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="h-5 w-5" />
                  Completed Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{completedCourses}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-5 w-5" />
                  Active Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{activeCourses}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-5 w-5" />
                  Community Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{communityPosts?.length || 0}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Academic Overview</CardTitle>
              <CardDescription>Your learning progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Course enrollment data will be displayed here
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}
