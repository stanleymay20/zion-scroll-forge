/**
 * Teaching Load Manager Component
 * Displays faculty teaching load analysis and course assignments
 * Requirements: 3.1, 3.2
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { facultyDashboardService } from '@/services/facultyDashboardService';
import type { TeachingLoadAnalysis, CourseAssignment } from '@/types/faculty-dashboard';
import { AlertCircle, BookOpen, Users, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TeachingLoadManager() {
  const [loadAnalysis, setLoadAnalysis] = useState<TeachingLoadAnalysis | null>(null);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock faculty ID - in production, get from auth context
  const facultyId = 'current-faculty-id';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [loadResult, assignmentsResult] = await Promise.all([
        facultyDashboardService.getTeachingLoad(facultyId),
        facultyDashboardService.getCourseAssignments(facultyId)
      ]);

      if (loadResult.success && loadResult.data) {
        setLoadAnalysis(loadResult.data);
      }

      if (assignmentsResult.success && assignmentsResult.data) {
        setAssignments(assignmentsResult.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load teaching load data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBadge = (utilization: number) => {
    if (utilization >= 90) return <Badge variant="destructive">High</Badge>;
    if (utilization >= 70) return <Badge variant="default">Optimal</Badge>;
    return <Badge variant="secondary">Low</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading teaching load data...</p>
        </div>
      </div>
    );
  }

  if (!loadAnalysis) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No teaching load data available. Please contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Load Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadAnalysis.currentLoad.courses} / {loadAnalysis.capacity.maxCourses}
            </div>
            <Progress 
              value={loadAnalysis.utilization.courseUtilization} 
              className="mt-2"
            />
            <p className={`text-xs mt-2 ${getUtilizationColor(loadAnalysis.utilization.courseUtilization)}`}>
              {loadAnalysis.utilization.courseUtilization.toFixed(1)}% utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadAnalysis.currentLoad.students} / {loadAnalysis.capacity.maxStudents}
            </div>
            <Progress 
              value={loadAnalysis.utilization.studentUtilization} 
              className="mt-2"
            />
            <p className={`text-xs mt-2 ${getUtilizationColor(loadAnalysis.utilization.studentUtilization)}`}>
              {loadAnalysis.utilization.studentUtilization.toFixed(1)}% utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadAnalysis.currentLoad.credits} / {loadAnalysis.capacity.maxCredits}
            </div>
            <Progress 
              value={loadAnalysis.utilization.creditUtilization} 
              className="mt-2"
            />
            <p className={`text-xs mt-2 ${getUtilizationColor(loadAnalysis.utilization.creditUtilization)}`}>
              {loadAnalysis.utilization.creditUtilization.toFixed(1)}% utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workload Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadAnalysis.currentLoad.workloadHours.toFixed(1)} / {loadAnalysis.capacity.maxWorkloadHours}
            </div>
            <Progress 
              value={loadAnalysis.utilization.workloadUtilization} 
              className="mt-2"
            />
            <p className={`text-xs mt-2 ${getUtilizationColor(loadAnalysis.utilization.workloadUtilization)}`}>
              {loadAnalysis.utilization.workloadUtilization.toFixed(1)}% utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Status Alert */}
      {loadAnalysis.utilization.workloadUtilization >= 90 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your workload is at {loadAnalysis.utilization.workloadUtilization.toFixed(1)}% capacity. 
            Consider discussing load redistribution with your department chair.
          </AlertDescription>
        </Alert>
      )}

      {/* Course Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Current Course Assignments</CardTitle>
          <CardDescription>
            Your teaching assignments for the current semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No course assignments found
            </p>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.assignmentId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{assignment.courseName}</h4>
                      <Badge variant="outline">{assignment.courseCode}</Badge>
                      <Badge>{assignment.role.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {assignment.estimatedStudents} students
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {assignment.credits} credits
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {assignment.workloadHours.toFixed(1)} hours/week
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Availability</CardTitle>
          <CardDescription>
            Your teaching schedule and available hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Available Hours</span>
              <span className="text-2xl font-bold">{loadAnalysis.availability.totalHours}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Scheduled Hours</span>
              <span className="text-2xl font-bold">{loadAnalysis.availability.scheduledHours}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Available Hours</span>
              <span className="text-2xl font-bold text-green-600">
                {loadAnalysis.availability.availableHours}
              </span>
            </div>
            <Progress 
              value={(loadAnalysis.availability.scheduledHours / loadAnalysis.availability.totalHours) * 100} 
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
