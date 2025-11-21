/**
 * Faculty Dashboard Page
 * Main dashboard for faculty members with course management overview
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  Users,
  ClipboardCheck,
  Calendar,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Clock,
  FileText,
  Video,
} from 'lucide-react';
import facultyService from '@/services/facultyService';
import type { FacultyDashboardData, FacultyCourse, UpcomingDeadline } from '@/types/faculty';

const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<FacultyDashboardData | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await facultyService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading faculty dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadDashboardData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Faculty Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your courses, grade assignments, and connect with students
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.courses.length}</div>
            <p className="text-xs text-muted-foreground">
              Teaching this semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.pendingGrading}</div>
            <p className="text-xs text-muted-foreground">
              Submissions awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              From students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Office Hours Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.officeHoursToday.length}</div>
            <p className="text-xs text-muted-foreground">
              Appointments scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Courses */}
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>
                Courses you're currently teaching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onViewDetails={() => navigate(`/faculty/courses/${course.id}`)}
                    onViewGradebook={() => navigate(`/faculty/courses/${course.id}/gradebook`)}
                    onViewAnalytics={() => navigate(`/faculty/courses/${course.id}/analytics`)}
                  />
                ))}
                {dashboardData.courses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active courses</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
                {dashboardData.recentActivity.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>
                Important dates and tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.upcomingDeadlines.map((deadline, index) => (
                  <DeadlineItem key={index} deadline={deadline} />
                ))}
                {dashboardData.upcomingDeadlines.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No upcoming deadlines
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Office Hours Today */}
          <Card>
            <CardHeader>
              <CardTitle>Office Hours Today</CardTitle>
              <CardDescription>
                Scheduled appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.officeHoursToday.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border"
                  >
                    <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {appointment.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.startTime} - {appointment.endTime}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {appointment.topic}
                      </p>
                    </div>
                    <Badge variant={
                      appointment.status === 'confirmed' ? 'default' :
                      appointment.status === 'scheduled' ? 'secondary' :
                      'outline'
                    }>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
                {dashboardData.officeHoursToday.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No appointments today
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate('/faculty/office-hours')}
              >
                Manage Office Hours
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/faculty/resources')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Faculty Resources
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/faculty/courses')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                All Courses
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/faculty/analytics')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Course Card Component
interface CourseCardProps {
  course: FacultyCourse;
  onViewDetails: () => void;
  onViewGradebook: () => void;
  onViewAnalytics: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onViewDetails,
  onViewGradebook,
  onViewAnalytics,
}) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
          <p className="text-sm text-muted-foreground">{course.faculty}</p>
        </div>
        <Badge variant={course.activeStudents > 0 ? 'default' : 'secondary'}>
          {course.activeStudents} Active
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{course.enrollmentCount}</div>
          <div className="text-xs text-muted-foreground">Students</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{course.completionRate}%</div>
          <div className="text-xs text-muted-foreground">Completion</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{course.averageGrade.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">Avg Grade</div>
        </div>
      </div>

      {course.pendingSubmissions > 0 && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {course.pendingSubmissions} submission{course.pendingSubmissions !== 1 ? 's' : ''} pending review
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onViewDetails} className="flex-1">
          <BookOpen className="h-4 w-4 mr-2" />
          Details
        </Button>
        <Button variant="outline" size="sm" onClick={onViewGradebook} className="flex-1">
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Gradebook
        </Button>
        <Button variant="outline" size="sm" onClick={onViewAnalytics} className="flex-1">
          <TrendingUp className="h-4 w-4 mr-2" />
          Analytics
        </Button>
      </div>
    </div>
  );
};

// Activity Item Component
interface ActivityItemProps {
  activity: FacultyDashboardData['recentActivity'][0];
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'submission':
        return <FileText className="h-4 w-4" />;
      case 'question':
        return <MessageSquare className="h-4 w-4" />;
      case 'discussion':
        return <Users className="h-4 w-4" />;
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'grade_posted':
        return <ClipboardCheck className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg border ${!activity.read ? 'bg-accent' : ''}`}>
      <div className="mt-1">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{activity.title}</p>
        <p className="text-xs text-muted-foreground">{activity.description}</p>
        {activity.courseTitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {activity.courseTitle}
          </p>
        )}
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatTime(activity.timestamp)}
      </span>
    </div>
  );
};

// Deadline Item Component
interface DeadlineItemProps {
  deadline: UpcomingDeadline;
}

const DeadlineItem: React.FC<DeadlineItemProps> = ({ deadline }) => {
  const getPriorityColor = () => {
    switch (deadline.priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg border">
      <Clock className={`h-4 w-4 mt-1 ${getPriorityColor()}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{deadline.title}</p>
        <p className="text-xs text-muted-foreground">{deadline.courseTitle}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Due: {formatDate(deadline.dueDate)}
        </p>
      </div>
      <Badge variant={
        deadline.priority === 'high' ? 'destructive' :
        deadline.priority === 'medium' ? 'default' :
        'secondary'
      }>
        {deadline.priority}
      </Badge>
    </div>
  );
};

export default FacultyDashboard;
