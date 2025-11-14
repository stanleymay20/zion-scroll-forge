import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalyticsOverview } from '@/hooks/useAnalytics';
import { checkUserRole } from '@/lib/scrollGovernance';
import { TrendingUp, Users, MessageSquare, UserPlus, Heart, Coins } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const { data: analytics, isLoading } = useAnalyticsOverview();

  useEffect(() => {
    checkUserRole('faculty').then(setHasAccess);
  }, []);

  if (hasAccess === null) {
    return <PageTemplate title="Analytics Dashboard" description="Loading...">
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Checking access...</p>
      </div>
    </PageTemplate>;
  }

  if (hasAccess === false) {
    return <PageTemplate title="Analytics Dashboard" description="Access Restricted">
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            You do not have access to this analytics dashboard. Faculty and admin access required.
          </p>
        </CardContent>
      </Card>
    </PageTemplate>;
  }

  if (isLoading) {
    return <PageTemplate title="Analytics Dashboard" description="Kingdom Impact Metrics">
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    </PageTemplate>;
  }

  const latestSystem = analytics?.system[0] || {};
  const latestSpiritual = analytics?.spiritual[0] || {};
  const latestScrollCoin = analytics?.scrollcoin[0] || {};

  const last7DaysSystem = analytics?.system.slice(0, 7) || [];
  const avgActiveUsers = last7DaysSystem.reduce((sum, day) => sum + (day.active_users || 0), 0) / Math.max(last7DaysSystem.length, 1);

  return (
    <PageTemplate
      title="Analytics Dashboard"
      description="✝️ Kingdom Impact Metrics — Christ-Centered Learning Analytics"
    >
      <div className="space-y-6">
        {/* System Overview */}
        <div>
          <h2 className="text-2xl font-bold mb-4">System Overview</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestSystem.active_users || 0}</div>
                <p className="text-xs text-muted-foreground">
                  7-day avg: {Math.round(avgActiveUsers)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Tutor Sessions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestSystem.ai_tutor_sessions || 0}</div>
                <p className="text-xs text-muted-foreground">Last day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Enrollments</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestSystem.new_enrollments || 0}</div>
                <p className="text-xs text-muted-foreground">Last day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Messages</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestSystem.ai_messages || 0}</div>
                <p className="text-xs text-muted-foreground">Last day</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ScrollCoin Overview */}
        <div>
          <h2 className="text-2xl font-bold mb-4">ScrollCoin Economy</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                <Coins className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {parseFloat(latestScrollCoin.total_earned || '0').toFixed(0)} SC
                </div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {parseFloat(latestScrollCoin.total_spent || '0').toFixed(0)} SC
                </div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Change</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {parseFloat(latestScrollCoin.net_change || '0').toFixed(0)} SC
                </div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Spiritual Formation Overview */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Spiritual Formation</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prayer Users</CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestSpiritual.unique_prayer_users || 0}</div>
                <p className="text-xs text-muted-foreground">Last day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Prayers</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestSpiritual.total_prayers || 0}</div>
                <p className="text-xs text-muted-foreground">Last day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Answered Prayers</CardTitle>
                <Heart className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestSpiritual.answered_prayers || 0}</div>
                <p className="text-xs text-muted-foreground">Last day</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}