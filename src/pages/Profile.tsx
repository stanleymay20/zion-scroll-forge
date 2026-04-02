import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { useProfile } from '@/hooks/useProfile';
import { useScrollCoinBalance } from '@/hooks/useScrollCoinTransactions';
import { usePrayerStreak } from '@/hooks/usePrayerJournal';
import { useCommunityPosts } from '@/hooks/useCommunity';
import { useUserEnrollments } from '@/hooks/useCourses';
import { GraduationCap, BookOpen, Coins, Heart, Users, Settings, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: scrollCoinBalance } = useScrollCoinBalance();
  const { data: prayerStreak } = usePrayerStreak();
  const { data: communityPosts } = useCommunityPosts();
  const { data: enrollments } = useUserEnrollments();

  if (profileLoading) {
    return (
      <PageTemplate title="My Profile" description="Loading your profile...">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <SkeletonCard />
          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </PageTemplate>
    );
  }

  const activeCourses = enrollments?.length ?? 0;
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Scholar';
  const initials = displayName.slice(0, 2).toUpperCase();
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : '—';

  return (
    <PageTemplate
      title="My Profile"
      description="Your ScrollUniversity identity"
      actions={
        <Link to="/settings">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      }
    >
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Left Column — Identity */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Avatar className="h-20 w-20 mx-auto mb-4 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xl font-serif bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-serif font-bold text-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <Badge variant="secondary" className="mt-2 capitalize">{profile?.role || 'Student'}</Badge>
              <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                Member since {memberSince}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-sans flex items-center gap-2">
                <Coins className="h-4 w-4 text-accent" />
                ScrollCoins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">
                {scrollCoinBalance ?? profile?.scrollcoins ?? 0}
                <span className="text-sm font-normal text-muted-foreground ml-1.5">SC</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-sans flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Spiritual Formation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {prayerStreak || 0}
                <span className="text-sm font-normal text-muted-foreground ml-1.5">day streak</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Stats & Progress */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
            {[
              { label: "Active Courses", value: activeCourses, icon: BookOpen },
              { label: "Completed", value: 0, icon: GraduationCap },
              { label: "Community Posts", value: communityPosts?.length ?? 0, icon: Users },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-sans">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Academic Overview</CardTitle>
              <CardDescription>Your learning progress across enrolled courses</CardDescription>
            </CardHeader>
            <CardContent>
              {activeCourses > 0 ? (
                <div className="space-y-4">
                  {enrollments?.slice(0, 5).map((enrollment: any) => (
                    <div key={enrollment.id} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground truncate mr-4">
                          {enrollment.courses?.title ?? 'Course'}
                        </span>
                        <span className="text-muted-foreground flex-shrink-0">
                          {Math.round(enrollment.progress ?? 0)}%
                        </span>
                      </div>
                      <Progress value={enrollment.progress ?? 0} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 space-y-3">
                  <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground">No courses enrolled yet</p>
                  <Link to="/courses">
                    <Button variant="outline" size="sm">Browse Courses</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}
