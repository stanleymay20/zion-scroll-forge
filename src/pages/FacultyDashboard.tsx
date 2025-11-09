import { Link } from 'react-router-dom';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTeachingCourses, useGradingQueue } from '@/hooks/useFaculty';
import { GraduationCap, ClipboardCheck, BookOpen, Plus } from 'lucide-react';

export default function FacultyDashboard() {
  const { data: courses } = useTeachingCourses();
  const { data: queue } = useGradingQueue();

  console.info('✝️ ScrollUniversity: Faculty dashboard loaded — Christ is Lord over teaching');

  return (
    <PageTemplate
      title="Faculty Dashboard"
      description="Manage your courses and student assessments"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Courses Teaching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{courses?.length || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Grading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{queue?.length || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">
                {courses?.reduce((sum, c: any) => sum + (c.courses?.students || 0), 0) || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Courses you're currently teaching</CardDescription>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <div className="space-y-3">
                {courses.map((assignment: any) => (
                  <div
                    key={assignment.course_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{assignment.courses?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {assignment.courses?.faculty} • {assignment.courses?.students} students
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/faculty/gradebook/${assignment.course_id}`}>
                        Gradebook
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No courses assigned yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Grading Queue</CardTitle>
                <CardDescription>Submissions awaiting your review</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link to="/faculty/grading-queue">
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {queue && queue.length > 0 ? (
              <div className="space-y-3">
                {queue.slice(0, 5).map((item: any) => (
                  <div
                    key={item.submission_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold text-sm">{item.assignment_title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Grade
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No submissions to grade
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
