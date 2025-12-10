/**
 * Deadline Tracking Visualization Component
 * Visual interface for tracking and managing deadlines
 * 
 * Requirements: 1.3, 1.4
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { format, differenceInDays, isPast, isFuture } from 'date-fns';
import academicCalendarService from '@/services/academicCalendarService';
import type { AcademicYear, Semester } from '@/types/academic-calendar';

interface DeadlineTrackingVisualizationProps {
  academicYear: AcademicYear;
}

interface DeadlineItem {
  id: string;
  title: string;
  date: Date;
  type: string;
  semesterName?: string;
  description?: string;
}

export const DeadlineTrackingVisualization: React.FC<DeadlineTrackingVisualizationProps> = ({
  academicYear,
}) => {
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeadlines();
  }, [academicYear.id]);

  const loadDeadlines = async () => {
    try {
      setLoading(true);
      
      // Load semesters to extract deadlines
      const semesters = await academicCalendarService.getSemestersByAcademicYear(academicYear.id);
      
      // Extract all deadlines from semesters
      const allDeadlines: DeadlineItem[] = [];
      
      semesters.forEach((semester) => {
        // Registration deadlines
        allDeadlines.push({
          id: `${semester.id}-reg-start`,
          title: 'Registration Opens',
          date: new Date(semester.registrationStart),
          type: 'registration',
          semesterName: semester.name,
          description: 'Course registration begins',
        });
        
        allDeadlines.push({
          id: `${semester.id}-reg-end`,
          title: 'Registration Closes',
          date: new Date(semester.registrationEnd),
          type: 'registration',
          semesterName: semester.name,
          description: 'Last day to register for courses',
        });
        
        // Add/Drop deadline
        allDeadlines.push({
          id: `${semester.id}-add-drop`,
          title: 'Add/Drop Deadline',
          date: new Date(semester.addDropDeadline),
          type: 'academic',
          semesterName: semester.name,
          description: 'Last day to add or drop courses',
        });
        
        // Withdrawal deadline
        allDeadlines.push({
          id: `${semester.id}-withdrawal`,
          title: 'Withdrawal Deadline',
          date: new Date(semester.withdrawalDeadline),
          type: 'academic',
          semesterName: semester.name,
          description: 'Last day to withdraw from courses',
        });
        
        // Final exams
        allDeadlines.push({
          id: `${semester.id}-exams-start`,
          title: 'Final Exams Begin',
          date: new Date(semester.finalExamsStart),
          type: 'exam',
          semesterName: semester.name,
          description: 'Final examination period starts',
        });
        
        // Grades due
        allDeadlines.push({
          id: `${semester.id}-grades-due`,
          title: 'Grades Due',
          date: new Date(semester.gradesDue),
          type: 'grading',
          semesterName: semester.name,
          description: 'Faculty must submit final grades',
        });
      });
      
      // Sort by date
      allDeadlines.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      setDeadlines(allDeadlines);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deadlines');
    } finally {
      setLoading(false);
    }
  };

  const getDeadlineStatus = (date: Date): 'past' | 'upcoming' | 'soon' | 'today' => {
    const daysUntil = differenceInDays(date, new Date());
    
    if (isPast(date)) return 'past';
    if (daysUntil === 0) return 'today';
    if (daysUntil <= 7) return 'soon';
    return 'upcoming';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'past':
        return 'bg-gray-100 text-gray-800';
      case 'today':
        return 'bg-red-100 text-red-800';
      case 'soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'past':
        return <CheckCircle className="h-4 w-4" />;
      case 'today':
      case 'soon':
        return <AlertTriangle className="h-4 w-4" />;
      case 'upcoming':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      registration: 'bg-blue-100 text-blue-800',
      academic: 'bg-purple-100 text-purple-800',
      exam: 'bg-orange-100 text-orange-800',
      grading: 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const upcomingDeadlines = deadlines.filter(d => isFuture(d.date));
  const pastDeadlines = deadlines.filter(d => isPast(d.date));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Deadline Tracking</CardTitle>
          <CardDescription>
            Monitor all important deadlines for {academicYear.name}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{upcomingDeadlines.length}</div>
            <p className="text-sm text-muted-foreground">Upcoming Deadlines</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {upcomingDeadlines.filter(d => getDeadlineStatus(d.date) === 'soon').length}
            </div>
            <p className="text-sm text-muted-foreground">Due Within 7 Days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pastDeadlines.length}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDeadlines.map((deadline) => {
              const status = getDeadlineStatus(deadline.date);
              const daysUntil = differenceInDays(deadline.date, new Date());
              
              return (
                <div key={deadline.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{deadline.title}</h4>
                      <Badge className={getTypeColor(deadline.type)}>
                        {deadline.type}
                      </Badge>
                      <Badge className={getStatusColor(status)}>
                        {getStatusIcon(status)}
                        <span className="ml-1">
                          {status === 'today' ? 'Today' : `${daysUntil} days`}
                        </span>
                      </Badge>
                    </div>
                    
                    {deadline.semesterName && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {deadline.semesterName}
                      </p>
                    )}
                    
                    {deadline.description && (
                      <p className="text-sm text-muted-foreground">
                        {deadline.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      {format(deadline.date, 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Timeline Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Year Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {format(new Date(academicYear.startDate), 'MMM d, yyyy')}
              </span>
              <span>
                {format(new Date(academicYear.endDate), 'MMM d, yyyy')}
              </span>
            </div>
            <Progress 
              value={
                ((new Date().getTime() - new Date(academicYear.startDate).getTime()) /
                (new Date(academicYear.endDate).getTime() - new Date(academicYear.startDate).getTime())) * 100
              }
            />
            <p className="text-sm text-muted-foreground text-center">
              {differenceInDays(new Date(academicYear.endDate), new Date())} days remaining
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Past Deadlines */}
      {pastDeadlines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Completed Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pastDeadlines.slice(-10).reverse().map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">{deadline.title}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {format(deadline.date, 'MMM d, yyyy')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
