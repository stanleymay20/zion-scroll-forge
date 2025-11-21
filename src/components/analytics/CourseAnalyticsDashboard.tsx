/**
 * Course Analytics Dashboard Component
 * Detailed analytics for individual courses
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, TrendingUp, Clock, Star, AlertTriangle } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { EngagementChart } from './EngagementChart';
import analyticsService from '@/services/analyticsService';
import type { CourseAnalytics, TimeRange, ChartData } from '@/types/analytics';
import { useToast } from '@/hooks/use-toast';

interface CourseAnalyticsDashboardProps {
  courseId: string;
}

export const CourseAnalyticsDashboard: React.FC<CourseAnalyticsDashboardProps> = ({ courseId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [engagementData, setEngagementData] = useState<ChartData | null>(null);
  const [performanceData, setPerformanceData] = useState<ChartData | null>(null);

  useEffect(() => {
    fetchCourseAnalytics();
  }, [courseId, timeRange]);

  const fetchCourseAnalytics = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getCourseAnalytics(courseId, timeRange);
      setAnalytics(data);
      
      // Generate chart data
      generateEngagementData(data);
      generatePerformanceData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load course analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateEngagementData = (data: CourseAnalytics) => {
    // Mock data - replace with actual data transformation
    setEngagementData({
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Video Watch Time (hours)',
          data: [120, 145, 138, 162],
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f6',
        },
        {
          label: 'Forum Activity',
          data: [45, 52, 48, 61],
          borderColor: '#10b981',
          backgroundColor: '#10b981',
        },
      ],
    });
  };

  const generatePerformanceData = (data: CourseAnalytics) => {
    // Mock data - replace with actual data transformation
    setPerformanceData({
      labels: ['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5'],
      datasets: [
        {
          label: 'Average Score',
          data: [85, 78, 82, 88, 91],
          borderColor: '#8b5cf6',
          backgroundColor: '#8b5cf6',
        },
      ],
    });
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Analytics</h2>
          <p className="text-muted-foreground">
            Detailed performance and engagement metrics
          </p>
        </div>
        <Select defaultValue="30">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          metric={{
            name: 'Total Enrollments',
            value: analytics.enrollmentMetrics.totalEnrollments,
            change: 12.5,
            trend: 'up',
            unit: '',
            timestamp: new Date(),
          }}
        />
        <MetricCard
          metric={{
            name: 'Completion Rate',
            value: analytics.enrollmentMetrics.completionRate,
            change: 5.2,
            trend: 'up',
            unit: '%',
            timestamp: new Date(),
          }}
        />
        <MetricCard
          metric={{
            name: 'Average Grade',
            value: analytics.performanceMetrics.averageGrade,
            change: 3.1,
            trend: 'up',
            unit: '%',
            timestamp: new Date(),
          }}
        />
        <MetricCard
          metric={{
            name: 'Student Rating',
            value: analytics.satisfactionMetrics.averageRating,
            change: 0.3,
            trend: 'up',
            unit: '/5',
            timestamp: new Date(),
          }}
        />
      </div>

      {/* Engagement Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {engagementData && (
          <EngagementChart
            title="Engagement Trends"
            description="Video watch time and forum activity"
            data={engagementData}
            type="line"
          />
        )}
        {performanceData && (
          <EngagementChart
            title="Performance by Module"
            description="Average scores across course modules"
            data={performanceData}
            type="bar"
          />
        )}
      </div>

      {/* Content Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Content Performance</CardTitle>
          <CardDescription>
            Most and least engaging content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Most Viewed Lectures
            </h4>
            <div className="space-y-2">
              {analytics.contentMetrics.mostViewedLectures.map((lecture, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{lecture.title || `Lecture ${lecture.lectureId}`}</span>
                  <Badge variant="secondary">{lecture.views} views</Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Drop-off Points
            </h4>
            <div className="space-y-2">
              {analytics.contentMetrics.dropOffPoints.map((point, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{point.title || `Module ${point.moduleId}`}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={point.dropOffRate} className="w-24" />
                    <span className="text-sm text-muted-foreground">
                      {point.dropOffRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Student Feedback</CardTitle>
          <CardDescription>
            Recent reviews and ratings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.satisfactionMetrics.studentFeedback.slice(0, 5).map((feedback, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < feedback.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(feedback.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{feedback.comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
