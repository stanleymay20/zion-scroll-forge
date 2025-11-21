/**
 * Spiritual Formation Dashboard Component
 * Overview of all spiritual formation activities
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Heart,
  Brain,
  TrendingUp,
  Calendar,
  Award,
  Flame,
  CheckCircle2
} from 'lucide-react';

import type { SpiritualFormationDashboard as DashboardData } from '@/types/spiritual-formation';

interface SpiritualFormationDashboardProps {
  data: DashboardData;
  onNavigate: (tab: string) => void;
}

export function SpiritualFormationDashboard({
  data,
  onNavigate
}: SpiritualFormationDashboardProps): JSX.Element {
  const {
    todaysDevotion,
    devotionStreak,
    recentPrayers,
    prayerAnalytics,
    scriptureMemory,
    recentCheckIn,
    growthTracking,
    upcomingReminders
  } = data;

  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold">{devotionStreak.currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Longest: {devotionStreak.longestStreak} days
            </p>
            <Button
              variant="link"
              className="px-0 mt-2"
              onClick={() => onNavigate('devotion')}
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
            <div className="text-2xl font-bold">{prayerAnalytics.activePrayers}</div>
            <p className="text-xs text-muted-foreground">
              {prayerAnalytics.answeredPrayers} answered ({prayerAnalytics.answerRate}%)
            </p>
            <Button
              variant="link"
              className="px-0 mt-2"
              onClick={() => onNavigate('prayer')}
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
            <div className="text-2xl font-bold">{scriptureMemory.versesMastered}</div>
            <p className="text-xs text-muted-foreground">
              {scriptureMemory.versesInProgress} in progress
            </p>
            <Button
              variant="link"
              className="px-0 mt-2"
              onClick={() => onNavigate('scripture')}
            >
              Practice Verses →
            </Button>
          </CardContent>
        </Card>

        {/* Growth Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {growthTracking?.overallGrowthScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {growthTracking?.growthTrend || 'No data yet'}
            </p>
            <Button
              variant="link"
              className="px-0 mt-2"
              onClick={() => onNavigate('growth')}
            >
              View Growth →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Today's Devotion Preview */}
      {todaysDevotion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today's Devotion</CardTitle>
                <CardDescription>{todaysDevotion.theme}</CardDescription>
              </div>
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{todaysDevotion.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {todaysDevotion.scripture.reference} - {todaysDevotion.scripture.translation}
                </p>
              </div>
              <p className="text-sm line-clamp-3">{todaysDevotion.reflection}</p>
              <Button onClick={() => onNavigate('devotion')}>
                Read Full Devotion
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Prayers */}
      {recentPrayers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Prayers</CardTitle>
                <CardDescription>Your active prayer requests</CardDescription>
              </div>
              <Heart className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPrayers.slice(0, 3).map((prayer) => (
                <div
                  key={prayer.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{prayer.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(prayer.createdAt).toLocaleDateString()}
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
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onNavigate('prayer')}
              >
                View All Prayers
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Reminders</CardTitle>
                <CardDescription>Stay on track with your spiritual practices</CardDescription>
              </div>
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingReminders.slice(0, 5).map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <p className="text-sm font-medium">{reminder.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(reminder.scheduledFor).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">{reminder.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth Milestones */}
      {growthTracking && growthTracking.milestones.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Milestones</CardTitle>
                <CardDescription>Celebrate your spiritual victories</CardDescription>
              </div>
              <Award className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {growthTracking.milestones.slice(0, 3).map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{milestone.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {milestone.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(milestone.achievedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">{milestone.significance}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      {!recentCheckIn && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Complete Your Prophetic Check-in</CardTitle>
            <CardDescription>
              Take a moment to reflect on your spiritual journey and receive personalized guidance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => onNavigate('checkin')}>
              Start Check-in
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
