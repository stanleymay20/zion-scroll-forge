/**
 * Spiritual Formation Hub Page
 * Main page for spiritual formation features
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Heart, Brain, TrendingUp, Users, Flame, Calendar, CheckCircle2, Plus } from 'lucide-react';

export default function SpiritualFormation(): JSX.Element {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Fetch spiritual formation data directly from Supabase
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['spiritual-formation', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Fetch today's devotion
      const today = new Date().toISOString().split('T')[0];
      const { data: devotion } = await supabase
        .from('devotionals')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      // Fetch devotion completions
      const { data: completions } = await supabase
        .from('devotional_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(30);

      // Calculate devotion streak
      let currentStreak = 0;
      let longestStreak = 0;
      if (completions && completions.length > 0) {
        const completionDates = completions.map(c => new Date(c.completed_at).toDateString());
        const uniqueDates = [...new Set(completionDates)];
        
        // Simple streak calculation
        currentStreak = uniqueDates.length > 0 ? Math.min(uniqueDates.length, 7) : 0;
        longestStreak = Math.max(currentStreak, uniqueDates.length);
      }

      // Fetch prayer journal entries
      const { data: prayers } = await supabase
        .from('prayer_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch scripture memory
      const { data: scriptures } = await supabase
        .from('scripture_memory')
        .select('*')
        .eq('user_id', user.id)
        .order('memorized_at', { ascending: false });

      // Fetch spiritual metrics
      const { data: metrics } = await supabase
        .from('spiritual_metrics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Fetch prophetic check-ins
      const { data: checkIns } = await supabase
        .from('prophetic_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      return {
        todaysDevotion: devotion,
        devotionStreak: { currentStreak, longestStreak },
        prayers: prayers || [],
        scriptures: scriptures || [],
        metrics,
        lastCheckIn: checkIns?.[0] || null,
      };
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Please log in to access spiritual formation features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading spiritual formation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error instanceof Error ? error.message : 'An error occurred'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const answeredPrayers = data?.prayers?.filter((p: any) => p.answered) || [];
  const versesMastered = data?.scriptures?.filter((s: any) => s.mastery_level >= 3) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Spiritual Formation</h1>
        <p className="text-muted-foreground">
          Grow in faith, deepen your relationship with God, and discover your calling
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="devotion" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Devotion</span>
          </TabsTrigger>
          <TabsTrigger value="prayer" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Prayer</span>
          </TabsTrigger>
          <TabsTrigger value="scripture" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Scripture</span>
          </TabsTrigger>
          <TabsTrigger value="mentor" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Mentor</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Welcome Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to Your Spiritual Journey</CardTitle>
              <CardDescription>
                "But grow in the grace and knowledge of our Lord and Savior Jesus Christ" - 2 Peter 3:18
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Devotion Streak */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Devotion Streak</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.devotionStreak.currentStreak || 0} days</div>
                <p className="text-xs text-muted-foreground">
                  Longest: {data?.devotionStreak.longestStreak || 0} days
                </p>
                <Button
                  variant="link"
                  className="px-0 mt-2"
                  onClick={() => setActiveTab('devotion')}
                >
                  Read Today's Devotion →
                </Button>
              </CardContent>
            </Card>

            {/* Prayer Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prayer Life</CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.prayers?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {answeredPrayers.length} answered prayers
                </p>
                <Button
                  variant="link"
                  className="px-0 mt-2"
                  onClick={() => setActiveTab('prayer')}
                >
                  Open Prayer Journal →
                </Button>
              </CardContent>
            </Card>

            {/* Scripture Memory */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scripture Memory</CardTitle>
                <Brain className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{versesMastered.length}</div>
                <p className="text-xs text-muted-foreground">
                  {(data?.scriptures?.length || 0) - versesMastered.length} in progress
                </p>
                <Button
                  variant="link"
                  className="px-0 mt-2"
                  onClick={() => setActiveTab('scripture')}
                >
                  Practice Verses →
                </Button>
              </CardContent>
            </Card>

            {/* Growth Score */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Divine Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.metrics?.divine_score || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Ministry readiness: {data?.metrics?.ministry_readiness || 0}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Devotion Preview */}
          {data?.todaysDevotion && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Devotion</CardTitle>
                    <CardDescription>{data.todaysDevotion.scripture_reference}</CardDescription>
                  </div>
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h4 className="font-semibold">{data.todaysDevotion.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {data.todaysDevotion.content}
                  </p>
                  <Button onClick={() => setActiveTab('devotion')}>
                    Read Full Devotion
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!data?.todaysDevotion && (
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No devotion available for today</p>
                <p className="text-sm text-muted-foreground">Check back tomorrow for your daily devotion</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Devotion Tab */}
        <TabsContent value="devotion" className="space-y-6">
          {data?.todaysDevotion ? (
            <Card>
              <CardHeader>
                <CardTitle>{data.todaysDevotion.title}</CardTitle>
                <CardDescription>{data.todaysDevotion.scripture_reference}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  {data.todaysDevotion.content}
                </div>
                <Button>Mark as Complete</Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No devotion available for today</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Prayer Tab */}
        <TabsContent value="prayer" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Prayer Journal</CardTitle>
                  <CardDescription>Your prayer requests and answered prayers</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Prayer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {data?.prayers && data.prayers.length > 0 ? (
                <div className="space-y-3">
                  {data.prayers.map((prayer: any) => (
                    <div
                      key={prayer.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{prayer.title || 'Prayer Request'}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {prayer.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(prayer.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {prayer.answered && (
                        <Badge className="ml-2 bg-green-500 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Answered
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No prayer entries yet</p>
                  <p className="text-sm text-muted-foreground">Start your prayer journal today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scripture Tab */}
        <TabsContent value="scripture" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scripture Memory</CardTitle>
                  <CardDescription>Hide God's Word in your heart</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Verse
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {data?.scriptures && data.scriptures.length > 0 ? (
                <div className="space-y-3">
                  {data.scriptures.map((scripture: any) => (
                    <div
                      key={scripture.id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{scripture.verse_reference}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {scripture.verse_text}
                          </p>
                        </div>
                        <Badge variant={scripture.mastery_level >= 3 ? 'default' : 'outline'}>
                          Level {scripture.mastery_level}
                        </Badge>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline">Practice</Button>
                        <Button size="sm" variant="outline">Review</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No scripture verses added yet</p>
                  <p className="text-sm text-muted-foreground">Add verses to start memorizing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mentor Tab */}
        <TabsContent value="mentor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spiritual Mentorship</CardTitle>
              <CardDescription>Connect with a mentor for guidance on your spiritual journey</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Find a mentor to guide your spiritual growth</p>
              <Button>Request a Mentor</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
