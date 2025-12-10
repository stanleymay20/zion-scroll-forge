/**
 * Student Analytics View Component
 * Monitor student performance, engagement, and identify at-risk students
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { facultyDashboardService } from '@/services/facultyDashboardService';
import type { StudentAnalytics, CourseAnalytics } from '@/types/faculty-dashboard';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  MessageSquare,
  Clock,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function StudentAnalyticsView() {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics | null>(null);
  const [atRiskStudents, setAtRiskStudents] = useState<StudentAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock courses - in production, fetch from API
  const courses = [
    { id: 'course-1', name: 'Biblical Hermeneutics', code: 'THEO-101' },
    { id: 'course-2', name: 'Systematic Theology', code: 'THEO-201' },
    { id: 'course-3', name: 'Church History', code: 'HIST-101' }
  ];

  useEffect(() => {
    if (selectedCourse) {
      loadCourseAnalytics();
      loadAtRiskStudents();
    }
  }, [selectedCourse]);

  const loadCourseAnalytics = async () => {
    if (!selectedCourse) return;
    
    setLoading(true);
    try {
      const result = await facultyDashboardService.getCourseAnalytics(selectedCourse);
      if (result.success && result.data) {
        setCourseAnalytics(result.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load course analytics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAtRiskStudents = async () => {
    if (!selectedCourse) return;
    
    try {
      const result = await facultyDashboardService.getAtRiskStudents(selectedCourse);
      if (result.success && result.data) {
        setAtRiskStudents(result.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load at-risk students',
        variant: 'destructive'
      });
    }
  };

  const getRiskBadge = (level: 'low' | 'medium' | 'high') => {
    if (level === 'high') return <Badge variant="destructive">High Risk</Badge>;
    if (level === 'medium') return <Badge className="bg-yellow-600">Medium Risk</Badge>;
    return <Badge variant="secondary">Low Risk</Badge>;
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!selectedCourse) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Users className="h-16 w-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium">Select a Course</h3>
          <p className="text-sm text-muted-foreground">
            Choose a course to view student analytics and performance data
          </p>
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.code} - {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Course Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Monitor student performance and engagement
          </p>
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.code} - {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course Overview */}
      {courseAnalytics && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollment</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courseAnalytics.enrollment.total}</div>
                <p className="text-xs text-muted-foreground">
                  {courseAnalytics.enrollment.active} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getGradeColor(courseAnalytics.performance.averageGrade)}`}>
                  {courseAnalytics.performance.averageGrade.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Pass rate: {courseAnalytics.performance.passRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courseAnalytics.engagement.averageAttendance.toFixed(1)}%
                </div>
                <Progress value={courseAnalytics.engagement.averageAttendance} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">At Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {courseAnalytics.atRiskStudents}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((courseAnalytics.atRiskStudents / courseAnalytics.enrollment.total) * 100).toFixed(1)}% of class
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Grade Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
              <CardDescription>
                Current grade distribution across the class
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(courseAnalytics.performance.gradeDistribution).map(([grade, count]) => (
                  <div key={grade} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{grade}</Badge>
                      <span className="text-sm">{count} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(count / courseAnalytics.enrollment.total) * 100} 
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {((count / courseAnalytics.enrollment.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* At-Risk Students */}
      {atRiskStudents.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  At-Risk Students
                </CardTitle>
                <CardDescription>
                  Students who may need additional support or intervention
                </CardDescription>
              </div>
              <Badge variant="destructive">{atRiskStudents.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {atRiskStudents.map((student) => (
                <Card key={student.studentId} className="border-red-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{student.studentName}</CardTitle>
                        <CardDescription>
                          Student ID: {student.studentId}
                        </CardDescription>
                      </div>
                      {getRiskBadge(student.riskLevel)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Performance</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Grade:</span>
                            <span className={`font-medium ${getGradeColor(student.performance.currentGrade)}`}>
                              {student.performance.currentGrade.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Assignments:</span>
                            <span>
                              {student.performance.assignments.completed}/{student.performance.assignments.total}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Attendance</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Present:</span>
                            <span>{student.attendance.present}/{student.attendance.total}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rate:</span>
                            <span className={student.attendance.percentage < 75 ? 'text-red-600' : ''}>
                              {student.attendance.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Engagement</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Participation:</span>
                            <span>{student.engagement.participationScore}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Discussions:</span>
                            <span>{student.engagement.discussionPosts}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {student.interventionRecommended && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Intervention Recommended:</strong> This student may benefit from 
                          additional support, tutoring, or academic counseling.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Student
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        Schedule Intervention
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {atRiskStudents.length === 0 && courseAnalytics && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-green-600 mb-4" />
            <p className="text-lg font-medium">All Students On Track</p>
            <p className="text-sm text-muted-foreground">
              No students currently identified as at-risk
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
