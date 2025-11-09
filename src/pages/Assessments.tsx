import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, CheckCircle, Clock, TrendingUp, Award, AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Assessments() {
  const { user } = useAuth();

  const { data: submissions } = useQuery({
    queryKey: ['my-submissions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, assignments(*), grades(*)')
        .eq('user_id', user!.id)
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: upcomingAssignments } = useQuery({
    queryKey: ['upcoming-assignments', user?.id],
    queryFn: async () => {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user!.id);
      
      if (!enrollments) return [];
      
      const courseIds = enrollments.map(e => e.course_id);
      const { data, error } = await supabase
        .from('assignments')
        .select('*, courses(title)')
        .in('course_id', courseIds)
        .eq('published', true)
        .gt('due_at', new Date().toISOString())
        .order('due_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  console.info('✝️ Assessments loaded — Christ is Lord over evaluation');

  const gradedSubmissions = submissions?.filter(s => s.grades && s.grades.length > 0) || [];
  const averageScore = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.grades[0]?.score || 0), 0) / gradedSubmissions.length)
    : 0;

  return (
    <PageTemplate
      title="My Assessments"
      description="Track your academic progress and performance"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradedSubmissions.length}</div>
            <p className="text-xs text-muted-foreground">Completed assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAssignments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Due soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Assignments</CardTitle>
          <CardDescription>Complete these before the deadline</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAssignments && upcomingAssignments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAssignments.map((assignment: any) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{assignment.title}</h4>
                    <p className="text-sm text-muted-foreground">{assignment.courses?.title}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Due: {new Date(assignment.due_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge>{assignment.total_points} points</Badge>
                    <Link to={`/assignments/${assignment.id}`}>
                      <Button size="sm">Start</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming assignments</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Your latest assessment results</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions && submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.slice(0, 10).map((submission: any) => {
                const grade = submission.grades?.[0];
                return (
                  <div key={submission.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-medium">{submission.assignments?.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                        {grade?.feedback && (
                          <p className="text-sm mt-2">{grade.feedback}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {grade ? (
                          <>
                            <div className="text-2xl font-bold text-primary">
                              {grade.score}/{submission.assignments?.total_points}
                            </div>
                            <Badge variant="secondary">
                              {Math.round((grade.score / submission.assignments?.total_points) * 100)}%
                            </Badge>
                          </>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No submissions yet</p>
              <Link to="/courses">
                <Button className="mt-4">Browse Courses</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
