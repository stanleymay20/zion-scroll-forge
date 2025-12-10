import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, FileText, BookOpen } from 'lucide-react';
import { AutoSchedulePreview } from '@/components/AcademicYear/AutoSchedulePreview';
import { useClassSessions, useExams, useSemesters } from '@/hooks/useAcademicYear';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';

const CourseScheduling = () => {
  const navigate = useNavigate();
  const { data: semesters = [] } = useSemesters();
  const activeSemester = semesters.find((s) => s.is_active);
  const { data: classSessions = [] } = useClassSessions(undefined, activeSemester?.id);
  const { data: exams = [] } = useExams(undefined, activeSemester?.id);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/academic-year')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Course Scheduling</h1>
            <p className="text-muted-foreground">Auto-generate class schedules, assignments, and exams</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="auto-schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="auto-schedule" className="gap-2">
            <Calendar className="h-4 w-4" />
            Auto-Schedule
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Class Sessions
            {classSessions.length > 0 && (
              <Badge variant="secondary" className="ml-1">{classSessions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="exams" className="gap-2">
            <FileText className="h-4 w-4" />
            Exams
            {exams.length > 0 && (
              <Badge variant="secondary" className="ml-1">{exams.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auto-schedule">
          <AutoSchedulePreview onComplete={() => navigate('/academic-year')} />
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Class Sessions</CardTitle>
              <CardDescription>
                {activeSemester ? `Showing sessions for ${activeSemester.name}` : 'Select an active semester'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classSessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No class sessions scheduled yet</p>
                  <p className="text-sm">Use the Auto-Schedule tab to generate sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {classSessions.slice(0, 20).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(session.scheduled_date), 'EEEE, MMM d')} • {session.start_time} - {session.end_time}
                        </p>
                      </div>
                      <Badge variant={session.status === 'completed' ? 'secondary' : 'outline'}>
                        {session.status}
                      </Badge>
                    </div>
                  ))}
                  {classSessions.length > 20 && (
                    <p className="text-center text-sm text-muted-foreground">
                      And {classSessions.length - 20} more sessions...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Exams</CardTitle>
              <CardDescription>
                Midterms, finals, and other examinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exams.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No exams scheduled yet</p>
                  <p className="text-sm">Use the Auto-Schedule tab to generate exams</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exams.map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{exam.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(exam.scheduled_date), 'EEEE, MMM d, yyyy')} • {exam.duration_minutes} min • {exam.total_points} pts
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{exam.exam_type}</Badge>
                        <Badge variant={exam.is_published ? 'default' : 'secondary'}>
                          {exam.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseScheduling;
