/**
 * Course Analytics Component
 * Analytics dashboard for instructors
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Clock,
  BookOpen,
  MessageSquare,
  Heart,
  AlertCircle,
} from 'lucide-react';
import facultyService from '@/services/facultyService';
import type { InstructorCourseAnalytics } from '@/types/faculty';

interface CourseAnalyticsProps {
  courseId: string;
}

const CourseAnalytics: React.FC<CourseAnalyticsProps> = ({ courseId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<InstructorCourseAnalytics | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [courseId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await facultyService.getCourseAnalytics(courseId);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || 'No analytics data available'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollment</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.enrollment.total}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {analytics.enrollment.trend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              {Math.abs(analytics.enrollment.trend)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.performance.averageGrade.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Pass rate: {analytics.performance.passRate.toFixed(0)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analytics.engagement.averageTimeSpent / 60)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Avg time spent per student
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.engagement.videoCompletionRate.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Video completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Student performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Grade Distribution */}
            <div>
              <h3 className="text-sm font-medium mb-3">Grade Distribution</h3>
              <div className="space-y-2">
                {Object.entries(analytics.performance.gradeDistribution).map(
                  ([grade, count]) => (
                    <div key={grade} className="flex items-center gap-3">
                      <div className="w-12 text-sm font-medium">{grade}</div>
                      <div className="flex-1 bg-secondary rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-primary h-full flex items-center justify-end px-2 text-xs text-primary-foreground"
                          style={{
                            width: `${(count / analytics.enrollment.total) * 100}%`,
                          }}
                        >
                          {count > 0 && count}
                        </div>
                      </div>
                      <div className="w-16 text-sm text-muted-foreground text-right">
                        {((count / analytics.enrollment.total) * 100).toFixed(0)}%
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Top Performers */}
            <div>
              <h3 className="text-sm font-medium mb-3">Top Performers</h3>
              <div className="space-y-2">
                {analytics.performance.topPerformers.slice(0, 5).map((student) => (
                  <div
                    key={student.studentId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{student.studentName}</div>
                      <div className="text-sm text-muted-foreground">
                        Progress: {student.progress}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {student.grade.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Engagement: {student.engagement}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Struggling Students */}
            {analytics.performance.strugglingStudents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Students Needing Support
                </h3>
                <div className="space-y-2">
                  {analytics.performance.strugglingStudents.map((student) => (
                    <div
                      key={student.studentId}
                      className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50"
                    >
                      <div>
                        <div className="font-medium">{student.studentName}</div>
                        <div className="text-sm text-muted-foreground">
                          Progress: {student.progress}%
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">{student.riskLevel} risk</Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          Grade: {student.grade.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Content Engagement</CardTitle>
          <CardDescription>Module and lecture performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Most Engaging Modules */}
            <div>
              <h3 className="text-sm font-medium mb-3">Most Engaging Content</h3>
              <div className="space-y-2">
                {analytics.content.mostEngagingModules.map((module) => (
                  <div
                    key={module.moduleId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{module.moduleTitle}</div>
                      <div className="text-sm text-muted-foreground">
                        Completion: {module.completionRate.toFixed(0)}% • Avg time:{' '}
                        {Math.round(module.averageTimeSpent / 60)}min
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {module.engagementScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Engagement Score
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drop-off Points */}
            {analytics.content.dropOffPoints.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  Content Needing Improvement
                </h3>
                <div className="space-y-2">
                  {analytics.content.dropOffPoints.map((point) => (
                    <div
                      key={point.moduleId}
                      className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50"
                    >
                      <div>
                        <div className="font-medium">{point.moduleTitle}</div>
                        {point.lectureTitle && (
                          <div className="text-sm text-muted-foreground">
                            {point.lectureTitle}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-600">
                          {point.dropOffRate.toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Drop-off rate
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Spiritual Formation */}
      <Card>
        <CardHeader>
          <CardTitle>Spiritual Formation</CardTitle>
          <CardDescription>Spiritual growth metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Heart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {analytics.spiritual.devotionCompletionRate.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Devotion Completion</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {analytics.spiritual.prayerJournalActivity.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Prayer Journal</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {analytics.spiritual.scriptureMemoryProgress.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Scripture Memory</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Award className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {analytics.spiritual.overallSpiritualGrowth.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Growth</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseAnalytics;
