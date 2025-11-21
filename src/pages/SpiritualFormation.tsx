/**
 * Spiritual Formation Hub Page
 * Main page for spiritual formation features
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BookOpen, Heart, Brain, TrendingUp, Users } from 'lucide-react';

// Import spiritual formation components
import { SpiritualFormationDashboard } from '@/components/spiritual-formation/SpiritualFormationDashboard';
import { DevotionReader } from '@/components/spiritual-formation/DevotionReader';
import { PrayerJournal } from '@/components/spiritual-formation/PrayerJournal';
import { ScriptureMemoryPractice } from '@/components/spiritual-formation/ScriptureMemoryPractice';
import { PropheticCheckInQuestionnaire } from '@/components/spiritual-formation/PropheticCheckInQuestionnaire';
import { SpiritualGrowthVisualization } from '@/components/spiritual-formation/SpiritualGrowthVisualization';
import { MentorConnection } from '@/components/spiritual-formation/MentorConnection';

import type { SpiritualFormationDashboard as DashboardData } from '@/types/spiritual-formation';

/**
 * Spiritual Formation Hub Component
 * Central hub for all spiritual formation features
 */
export default function SpiritualFormation(): JSX.Element {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Load dashboard data
  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/spiritual-formation/dashboard/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load spiritual formation data');
        }

        const data = await response.json();
        setDashboardData(data.data);
      } catch (err) {
        console.error('Error loading spiritual formation data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

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

  if (loading) {
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
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

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
        <TabsList className="grid w-full grid-cols-7 lg:w-auto">
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
          <TabsTrigger value="checkin" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Check-in</span>
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Growth</span>
          </TabsTrigger>
          <TabsTrigger value="mentor" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Mentor</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {dashboardData && (
            <SpiritualFormationDashboard
              data={dashboardData}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}
        </TabsContent>

        {/* Daily Devotion Tab */}
        <TabsContent value="devotion" className="space-y-6">
          {dashboardData?.todaysDevotion ? (
            <DevotionReader
              devotion={dashboardData.todaysDevotion}
              streak={dashboardData.devotionStreak}
              userId={user.id}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Devotion Available</CardTitle>
                <CardDescription>
                  Check back tomorrow for your daily devotion
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        {/* Prayer Journal Tab */}
        <TabsContent value="prayer" className="space-y-6">
          <PrayerJournal
            userId={user.id}
            initialEntries={dashboardData?.recentPrayers || []}
            analytics={dashboardData?.prayerAnalytics}
          />
        </TabsContent>

        {/* Scripture Memory Tab */}
        <TabsContent value="scripture" className="space-y-6">
          <ScriptureMemoryPractice
            userId={user.id}
            statistics={dashboardData?.scriptureMemory}
          />
        </TabsContent>

        {/* Prophetic Check-in Tab */}
        <TabsContent value="checkin" className="space-y-6">
          <PropheticCheckInQuestionnaire
            userId={user.id}
            lastCheckIn={dashboardData?.recentCheckIn}
          />
        </TabsContent>

        {/* Spiritual Growth Tab */}
        <TabsContent value="growth" className="space-y-6">
          {dashboardData?.growthTracking ? (
            <SpiritualGrowthVisualization
              tracking={dashboardData.growthTracking}
              userId={user.id}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Growth Data Available</CardTitle>
                <CardDescription>
                  Complete a prophetic check-in to start tracking your spiritual growth
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        {/* Mentor Connection Tab */}
        <TabsContent value="mentor" className="space-y-6">
          <MentorConnection userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
