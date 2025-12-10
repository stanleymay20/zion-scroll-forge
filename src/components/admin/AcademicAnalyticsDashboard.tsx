/**
 * Academic Analytics Dashboard
 * Analytics and reporting for Academic Year Automation System
 * Requirements: 5.1, 5.2, 5.3 - System monitoring and analytics
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface AcademicAnalytics {
  enrollmentTrends: Array<{ month: string; enrollments: number; completions: number }>;
  coursePerformance: Array<{ course: string; avgGrade: number; completionRate: number }>;
  studentProgress: Array<{ status: string; count: number }>;
  workflowMetrics: Array<{ workflow: string; avgDuration: number; successRate: number }>;
  notificationMetrics: Array<{ type: string; sent: number; delivered: number }>;
  systemHealth: {
    uptime: number;
    avgResponseTime: number;
    errorRate: number;
    activeUsers: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AcademicAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AcademicAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      // TODO: Replace with actual API call
      const mockAnalytics: AcademicAnalytics = {
        enrollmentTrends: [
          { month: 'Jan', enrollments: 450, completions: 380 },
          { month: 'Feb', enrollments: 520, completions: 420 },
          { month: 'Mar', enrollments: 580, completions: 490 },
          { month: 'Apr', enrollments: 610, completions: 520 },
          { month: 'May', enrollments: 680, completions: 580 },
          { month: 'Jun', enrollments: 720, completions: 620 },
        ],
        coursePerformance: [
          { course: 'Sacred AI Engineering', avgGrade: 87, completionRate: 92 },
          { course: 'Biblical Studies', avgGrade: 91, completionRate: 95 },
          { course: 'Theology & Technology', avgGrade: 85, completionRate: 88 },
          { course: 'Ministry Leadership', avgGrade: 89, completionRate: 90 },
          { course: 'Spiritual Formation', avgGrade: 93, completionRate: 97 },
        ],
        studentProgress: [
          { status: 'On Track', count: 850 },
          { status: 'At Risk', count: 120 },
          { status: 'Probation', count: 30 },
          { status: 'Graduated', count: 450 },
        ],
        workflowMetrics: [
          { workflow: 'Admission', avgDuration: 45, successRate: 95 },
          { workflow: 'Registration', avgDuration: 12, successRate: 98 },
          { workflow: 'Grading', avgDuration: 30, successRate: 92 },
          { workflow: 'Graduation', avgDuration: 60, successRate: 97 },
        ],
        notificationMetrics: [
          { type: 'Deadline Reminders', sent: 1200, delivered: 1150 },
          { type: 'Grade Notifications', sent: 850, delivered: 820 },
          { type: 'Admission Updates', sent: 450, delivered: 440 },
          { type: 'System Alerts', sent: 120, delivered: 115 },
        ],
        systemHealth: {
          uptime: 99.8,
          avgResponseTime: 145,
          errorRate: 0.2,
          activeUsers: 1250,
        },
      };

      setAnalytics(mockAnalytics);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Academic Analytics
          </h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive analytics for academic operations
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.systemHealth.uptime}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.systemHealth.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">API performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.systemHealth.errorRate}%</div>
            <p className="text-xs text-muted-foreground">System errors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.systemHealth.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="enrollment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="enrollment">
            <Users className="h-4 w-4 mr-2" />
            Enrollment
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="students">
            <GraduationCap className="h-4 w-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Activity className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Calendar className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Enrollment Trends */}
        <TabsContent value="enrollment">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Trends</CardTitle>
              <CardDescription>Monthly enrollment and completion statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.enrollmentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Enrollments"
                  />
                  <Line
                    type="monotone"
                    dataKey="completions"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="Completions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Course Performance */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>Average grades and completion rates by course</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.coursePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgGrade" fill="#8884d8" name="Avg Grade" />
                  <Bar dataKey="completionRate" fill="#82ca9d" name="Completion Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Progress */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Student Progress Distribution</CardTitle>
              <CardDescription>Current academic standing of all students</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={analytics.studentProgress}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.studentProgress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Metrics */}
        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Performance</CardTitle>
              <CardDescription>Average duration and success rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.workflowMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="workflow" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="avgDuration"
                    fill="#8884d8"
                    name="Avg Duration (min)"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="successRate"
                    fill="#82ca9d"
                    name="Success Rate %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Metrics */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Delivery</CardTitle>
              <CardDescription>Sent vs delivered notifications by type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.notificationMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#8884d8" name="Sent" />
                  <Bar dataKey="delivered" fill="#82ca9d" name="Delivered" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AcademicAnalyticsDashboard;
