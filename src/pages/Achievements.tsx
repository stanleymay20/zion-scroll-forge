import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trophy, TrendingUp, Users, Star } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export default function Achievements() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['achievements-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Fetch all achievements
      const { data: allAchievements, error: achievError } = await supabase
        .from('achievements')
        .select('*')
        .order('category');

      if (achievError) throw achievError;

      // Fetch user's earned achievements
      const { data: earned, error: earnedError } = await supabase
        .from('user_achievements')
        .select('achievement_id, earned_at')
        .eq('user_id', user.id);

      if (earnedError) throw earnedError;

      const earnedIds = new Set(earned?.map((e: any) => e.achievement_id) || []);

      // Fetch leaderboard
      const { data: leaderboard, error: leaderError } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(10);

      if (leaderError) throw leaderError;

      // Fetch user stats
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (statsError && statsError.code !== 'PGRST116') throw statsError;

      return {
        achievements: allAchievements || [],
        earnedIds,
        leaderboard: leaderboard || [],
        userStats: stats,
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <PageTemplate title="Achievements" description="Your progress and badges">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTemplate>
    );
  }

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || Trophy;
    return Icon;
  };

  return (
    <PageTemplate
      title="Achievements & Leaderboard"
      description="Track your progress and compete with other learners"
    >
      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList>
          <TabsTrigger value="achievements">
            <Trophy className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <TrendingUp className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Star className="h-4 w-4 mr-2" />
            My Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.achievements.map((achievement: any) => {
              const isEarned = data.earnedIds.has(achievement.id);
              const Icon = getIcon(achievement.icon);

              return (
                <Card
                  key={achievement.id}
                  className={`${
                    isEarned ? 'border-primary bg-primary/5' : 'opacity-60'
                  } transition-all hover:shadow-lg`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Icon className={`h-5 w-5 ${isEarned ? 'text-primary' : ''}`} />
                          {achievement.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {achievement.description}
                        </CardDescription>
                      </div>
                      {isEarned && (
                        <Badge variant="default" className="ml-2">
                          Earned
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>+{achievement.scrollcoin_reward} ScrollCoins</span>
                      <span>+{achievement.xp_reward} XP</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Top Learners</CardTitle>
              <CardDescription>The most dedicated students at ScrollUniversity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.leaderboard.map((entry: any, index: number) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      entry.user_id === user?.id ? 'bg-primary/10 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          index === 0
                            ? 'bg-yellow-500 text-white'
                            : index === 1
                            ? 'bg-gray-400 text-white'
                            : index === 2
                            ? 'bg-orange-600 text-white'
                            : 'bg-muted'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">
                          {entry.email?.split('@')[0] || 'Anonymous'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.courses_completed || 0} courses completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{entry.total_xp || 0} XP</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.badges_earned || 0} badges
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total XP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data?.userStats?.total_xp || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Courses Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data?.userStats?.courses_completed || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data?.userStats?.current_streak || 0} days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Longest Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data?.userStats?.longest_streak || 0} days</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
