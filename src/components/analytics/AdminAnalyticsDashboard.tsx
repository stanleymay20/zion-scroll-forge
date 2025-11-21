/**
 * Admin Analytics Dashboard Component
 * Comprehensive analytics dashboard for administrators
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Download, RefreshCw, TrendingUp, Users, BookOpen, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { MetricCard } from './MetricCard';
import { EngagementChart } from './EngagementChart';
import analyticsService from '@/services/analyticsService';
import type { TimeRange, RealTimeMetrics, ChartData } from '@/types/analytics';
import { useToast } from '@/hooks/use-toast';

export const AdminAnalyticsDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  });
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [enrollmentData, setEnrollmentData] = useState<ChartData | null>(null);
  const [revenueData, setRevenueData] = useState<ChartData | null>(null);
  const [engagementData, setEngagementData] = useState<ChartData | null>(null);

  // Fetch real-time metrics
  const fetchRealTimeMetrics = async () => {
    try {
      const metrics = await analyticsService.getRealTimeMetrics();
      setRealTimeMetrics(metrics);
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRealTimeMetrics(),
        fetchEnrollmentData(),
        fetchRevenueData(),
        fetchEngagementData(),
      ]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrollment data
  const fetchEnrollmentData = async () => {
    // Mock data - replace with actual API call
    setEnrollmentData({
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'New Enrollments',
          data: [45, 52, 48, 61],
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f6',
        },
        {
          label: 'Active Students',
          data: [320, 345, 358, 382],
          borderColor: '#10b981',
          backgroundColor: '#10b981',
        },
      ],
    });
  };

  // Fetch revenue data
  const fetchRevenueData = async () => {
    // Mock data - replace with actual API call
    setRevenueData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue',
          data: [12500, 15200, 14800, 18900, 21300, 23400],
          borderColor: '#8b5cf6',
          backgroundColor: '#8b5cf6',
        },
      ],
    });
  };

  // Fetch engagement data
  const fetchEngagementData = async () => {
    // Mock data - replace with actual API call
    setEngagementData({
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Active Users',
          data: [245, 289, 312, 298, 276, 198, 156],
          borderColor: '#f59e0b',
          backgroundColor: '#f59e0b',
        },
      ],
    });
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchDashboardData();

    if (autoRefresh) {
      const interval = setInterval(fetchRealTimeMetrics, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, timeRange]);

  const handleExportData = async (format: 'CSV' | 'PDF' | 'EXCEL') => {
    try {
      const result = await analyticsService.exportData({
        dataType: 'analytics',
        format,
        timeRange,
      });

      if (result.fileUrl) {
        window.open(result.fileUrl, '_blank');
        toast({
          title: 'Export Successful',
          description: `Data exported as ${format}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into platform performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={refreshInterval.toString()}
            onValueChange={(value) => setRefreshInterval(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Refresh interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Every 10 seconds</SelectItem>
              <SelectItem value="30">Every 30 seconds</SelectItem>
              <SelectItem value="60">Every minute</SelectItem>
              <SelectItem value="300">Every 5 minutes</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(timeRange.startDate, 'MMM dd')} - {format(timeRange.endDate, 'MMM dd')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{
                  from: timeRange.startDate,
                  to: timeRange.endDate,
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setTimeRange({ startDate: range.from, endDate: range.to });
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={() => handleExportData('CSV')}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      {realTimeMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            metric={{
              name: 'Active Users',
              value: realTimeMetrics.activeUsers,
              change: 12.5,
              trend: 'up',
              unit: '',
              timestamp: new Date(),
            }}
          />
          <MetricCard
            metric={{
              name: 'Active Sessions',
              value: realTimeMetrics.activeSessions,
              change: 8.2,
              trend: 'up',
              unit: '',
              timestamp: new Date(),
            }}
          />
          <MetricCard
            metric={{
              name: 'Current Enrollments',
              value: realTimeMetrics.currentEnrollments,
              change: 15.3,
              trend: 'up',
              unit: '',
              timestamp: new Date(),
            }}
          />
          <MetricCard
            metric={{
              name: 'System Load',
              value: realTimeMetrics.systemLoad.cpu,
              change: -5.1,
              trend: 'down',
              unit: '%',
              timestamp: new Date(),
            }}
          />
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {enrollmentData && (
              <EngagementChart
                title="Enrollment Trends"
                description="New enrollments and active students over time"
                data={enrollmentData}
                type="line"
              />
            )}
            {revenueData && (
              <EngagementChart
                title="Revenue Growth"
                description="Monthly revenue trends"
                data={revenueData}
                type="area"
              />
            )}
          </div>
          {engagementData && (
            <EngagementChart
              title="Weekly Engagement"
              description="Active users throughout the week"
              data={engagementData}
              type="bar"
            />
          )}
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Analytics</CardTitle>
              <CardDescription>
                Detailed insights into student performance and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Student analytics content will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Analytics</CardTitle>
              <CardDescription>
                Course effectiveness and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Course analytics content will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Analytics</CardTitle>
              <CardDescription>
                Revenue tracking and financial projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Financial analytics content will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Analytics</CardTitle>
              <CardDescription>
                User engagement and platform usage metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Engagement analytics content will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
