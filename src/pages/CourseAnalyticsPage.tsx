import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCourseAnalytics } from '@/hooks/useAnalytics';
import { checkUserRole } from '@/lib/scrollGovernance';
import { Loader2, TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function CourseAnalyticsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const { data: analytics, isLoading: analyticsLoading } = useCourseAnalytics(courseId!);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  useEffect(() => {
    checkUserRole('faculty').then(setHasAccess);
  }, []);

  if (hasAccess === null || courseLoading) {
    return <PageTemplate title="Course Analytics" description="Loading...">
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </PageTemplate>;
  }

  if (hasAccess === false) {
    return <PageTemplate title="Course Analytics" description="Access Restricted">
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            You do not have access to course analytics. Faculty and admin access required.
          </p>
        </CardContent>
      </Card>
    </PageTemplate>;
  }

  const totalEnrollments = analytics?.reduce((sum, day) => sum + (day.enrollments_count || 0), 0) || 0;
  const totalCompletedModules = analytics?.reduce((sum, day) => sum + (day.completed_modules_count || 0), 0) || 0;
  const totalQuizAttempts = analytics?.reduce((sum, day) => sum + (day.quiz_attempts || 0), 0) || 0;
  const avgScore = analytics?.reduce((sum, day) => sum + (parseFloat(day.avg_score) || 0), 0) / Math.max(analytics?.length || 1, 1);

  return (
    <PageTemplate
      title={`Analytics: ${course?.title || 'Course'}`}
      description="✝️ Learning progress and engagement metrics"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modules Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompletedModules}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quiz Attempts</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuizAttempts}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Quiz Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScore.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trend</CardTitle>
            <CardDescription>Daily enrollment activity over the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !analytics || analytics.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No analytics data available yet</p>
            ) : (
              <div className="space-y-2">
                {analytics.slice(0, 10).map((day: any) => (
                  <div key={day.date} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {day.enrollments_count} enrollments
                      </span>
                      <span className="text-muted-foreground">
                        {day.completed_modules_count} modules completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}