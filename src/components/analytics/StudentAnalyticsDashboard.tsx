/**
 * Student Analytics Dashboard Component
 * Learning patterns and performance analytics for individual students
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Clock, TrendingUp, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { EngagementChart } from './EngagementChart';
import analyticsService from '@/services/analyticsService';
import type { StudentAnalytics, TimeRange, ChartData, StudentSuccessPrediction } from '@/types/analytics';
import { useToast } from '@/hooks/use-toast';

interface StudentAnalyticsDashboardProps {
  studentId: string;
}

export const StudentAnalyticsDashboard: React.FC<StudentAnalyticsDashboardProps> = ({ studentId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [prediction, setPrediction] = useState<StudentSuccessPrediction | null>(null);
  const [progressData, setProgressData] = useState<ChartData | null>(null);
  const [engagementData, setEngagementData] = useState<ChartData | null>(null);

  useEffect(() => {
    fetchStudentAnalytics();
    fetchPrediction();
  }, [studentId]);

  const fetchStudentAnalytics = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getStudentAnalytics(studentId);
      setAnalytics(data);
      
      // Generate chart data
      generateProgressData(data);
      generateEngagementData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load student analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async () => {
    try {
      const data = await analyticsService.getStudentSuccessPrediction(studentId);
      setPrediction(data);
    } catch (error) {
      console.error('Error fetching prediction:', error);
    }
  };

  const generateProgressData = (data: StudentAnalytics) => {
    // Mock data - replace with actual data transformation
    setProgressData({
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Course Progress',
          data: [25, 45, 62, 78],
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f6',
        },
      ],
    });
  };

  const generateEngagementData = (data: StudentAnalytics) => {
    // Mock data - replace with actual data transformation
    setEngagementData({
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Study Hours',
          data: [2.5, 3.2, 2.8, 4.1, 3.5, 1.8, 2.2],
          borderColor: '#10b981',
          backgroundColor: '#10b981',
        },
      ],
    });
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
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
      <div>
        <h2 className="text-2xl font-bold">Student Analytics</h2>
        <p className="text-muted-foreground">
          Learning patterns and performance insights
        </p>
      </div>

      {/* Risk Alert */}
      {prediction && prediction.riskLevel !== 'low' && (
        <Alert variant={prediction.riskLevel === 'high' ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Risk Level: {prediction.riskLevel.toUpperCase()}</strong>
            <p className="mt-1">
              Completion probability: {(prediction.completionProbability * 100).toFixed(1)}%
            </p>
            {prediction.recommendations.length > 0 && (
              <ul className="mt-2 list-disc list-inside">
                {prediction.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm">{rec}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          metric={{
            name: 'Overall GPA',
            value: analytics.performanceMetrics.overallGPA,
            change: 2.5,
            trend: 'up',
            unit: '/4.0',
            timestamp: new Date(),
          }}
        />
        <MetricCard
          metric={{
            name: 'Course Progress',
            value: analytics.enrollmentMetrics.averageProgress,
            change: 15.3,
            trend: 'up',
            unit: '%',
            timestamp: new Date(),
          }}
        />
        <MetricCard
          metric={{
            name: 'On-Time Submissions',
            value: (analytics.performanceMetrics.assignmentsOnTime / analytics.performanceMetrics.assignmentsCompleted) * 100,
            change: -3.2,
            trend: 'down',
            unit: '%',
            timestamp: new Date(),
          }}
        />
        <MetricCard
          metric={{
            name: 'Engagement Score',
            value: analytics.engagementMetrics.loginFrequency,
            change: 8.7,
            trend: 'up',
            unit: '/week',
            timestamp: new Date(),
          }}
        />
      </div>

      {/* Progress and Engagement Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {progressData && (
          <EngagementChart
            title="Course Progress"
            description="Progress over time"
            data={progressData}
            type="area"
          />
        )}
        {engagementData && (
          <EngagementChart
            title="Weekly Study Pattern"
            description="Study hours throughout the week"
            data={engagementData}
            type="bar"
          />
        )}
      </div>

      {/* Learning Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Learning Patterns
          </CardTitle>
          <CardDescription>
            Insights into study habits and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Preferred Study Time</h4>
              <Badge variant="secondary" className="text-base">
                {analytics.learningPatterns.preferredStudyTime}
              </Badge>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Average Study Duration</h4>
              <Badge variant="secondary" className="text-base">
                {analytics.learningPatterns.averageStudyDuration} hours
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Learning Style</h4>
            <p className="text-sm text-muted-foreground">
              {analytics.learningPatterns.learningStyle}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Strong Subjects
              </h4>
              <div className="flex flex-wrap gap-2">
                {analytics.learningPatterns.strongSubjects.map((subject, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                Areas for Improvement
              </h4>
              <div className="flex flex-wrap gap-2">
                {analytics.learningPatterns.strugglingSubjects.map((subject, index) => (
                  <Badge key={index} variant="outline" className="bg-yellow-50">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Enrollment Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold">{analytics.enrollmentMetrics.totalCourses}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Courses</p>
              <p className="text-2xl font-bold text-blue-600">
                {analytics.enrollmentMetrics.activeCourses}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Completed Courses</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.enrollmentMetrics.completedCourses}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictive Insights */}
      {prediction && (
        <Card>
          <CardHeader>
            <CardTitle>Predictive Insights</CardTitle>
            <CardDescription>
              AI-powered predictions for student success
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Expected GPA</h4>
                <p className="text-2xl font-bold">{prediction.expectedGPA.toFixed(2)}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Time to Completion</h4>
                <p className="text-2xl font-bold">{prediction.timeToCompletion} days</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Key Factors</h4>
              <div className="space-y-2">
                {prediction.factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{factor.factor}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={Math.abs(factor.impact) * 100} className="w-24" />
                      <span className={`text-sm ${factor.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {factor.impact > 0 ? '+' : ''}{(factor.impact * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
