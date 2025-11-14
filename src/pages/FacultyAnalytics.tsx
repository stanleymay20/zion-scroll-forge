import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useFaculties } from '@/hooks/useFaculties';
import { EnrollmentTrendsChart } from '@/components/analytics/EnrollmentTrendsChart';
import { StudentPerformanceChart } from '@/components/analytics/StudentPerformanceChart';
import { AITutorUsageChart } from '@/components/analytics/AITutorUsageChart';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const useFacultyAnalytics = (facultyId?: string) => {
  return useQuery({
    queryKey: ['faculty-analytics', facultyId],
    queryFn: async () => {
      // Enrollment trends
      const { data: enrollments } = await (supabase as any)
        .from('enrollments')
        .select('created_at, course_id, courses(faculty_id)')
        .order('created_at', { ascending: true });

      // Student performance
      const { data: submissions } = await (supabase as any)
        .from('submissions')
        .select('score, status, assignment_id, assignments(course_id, courses(faculty_id))');

      // AI tutor usage
      const { data: tutorSessions } = await (supabase as any)
        .from('ai_tutor_sessions')
        .select('created_at, total_messages, satisfaction_rating, tutor_id, ai_tutors(faculty)');

      return {
        enrollments: enrollments || [],
        submissions: submissions || [],
        tutorSessions: tutorSessions || [],
      };
    },
    enabled: !!facultyId,
  });
};

export const FacultyAnalytics = () => {
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const { data: faculties } = useFaculties();
  const { data: analytics, isLoading } = useFacultyAnalytics(selectedFaculty === 'all' ? undefined : selectedFaculty);

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold break-words">Faculty Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 break-words">
            Enrollment trends, performance metrics, and AI tutor usage by faculty
          </p>
        </div>
        <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Select faculty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Faculties</SelectItem>
            {faculties?.map((faculty: any) => (
              <SelectItem key={faculty.id} value={faculty.id}>
                {faculty.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="enrollment" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1">
            <TabsTrigger value="enrollment" className="text-xs sm:text-sm">Enrollment Trends</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">Student Performance</TabsTrigger>
            <TabsTrigger value="ai-tutor" className="text-xs sm:text-sm">AI Tutor Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollment" className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Enrollment Trends</CardTitle>
                <CardDescription>
                  Track enrollment patterns over time by faculty
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnrollmentTrendsChart data={analytics?.enrollments || []} />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Enrollments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics?.enrollments?.length || 0}</div>
                  <p className="text-sm text-muted-foreground mt-1">Across all courses</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {new Set(analytics?.enrollments?.map((e: any) => e.course_id)).size || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">With enrollments</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Avg. per Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.round((analytics?.enrollments?.length || 0) / Math.max(1, new Set(analytics?.enrollments?.map((e: any) => e.course_id)).size))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Students per course</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Performance Metrics</CardTitle>
                <CardDescription>
                  Assignment and quiz performance by faculty
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StudentPerformanceChart data={analytics?.submissions || []} />
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics?.submissions?.length || 0}</div>
                  <p className="text-sm text-muted-foreground mt-1">Across all assignments</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.round(
                      (analytics?.submissions?.reduce((sum: number, s: any) => sum + (s.score || 0), 0) || 0) /
                        Math.max(1, analytics?.submissions?.length || 1)
                    )}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Overall performance</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.round(
                      ((analytics?.submissions?.filter((s: any) => s.status === 'graded').length || 0) /
                        Math.max(1, analytics?.submissions?.length || 1)) *
                        100
                    )}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Graded submissions</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-tutor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Tutor Usage Statistics</CardTitle>
                <CardDescription>
                  Student interactions with AI tutors by faculty
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AITutorUsageChart data={analytics?.tutorSessions || []} />
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics?.tutorSessions?.length || 0}</div>
                  <p className="text-sm text-muted-foreground mt-1">AI tutor interactions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Avg. Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.round(
                      (analytics?.tutorSessions?.reduce((sum: number, s: any) => sum + (s.total_messages || 0), 0) || 0) /
                        Math.max(1, analytics?.tutorSessions?.length || 1)
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Per session</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {(
                      (analytics?.tutorSessions
                        ?.filter((s: any) => s.satisfaction_rating)
                        .reduce((sum: number, s: any) => sum + s.satisfaction_rating, 0) || 0) /
                      Math.max(1, analytics?.tutorSessions?.filter((s: any) => s.satisfaction_rating).length || 1)
                    ).toFixed(1)}
                    /5
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Average rating</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default FacultyAnalytics;
