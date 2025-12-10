import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, FileText, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import { format, parseISO, differenceInDays, isPast } from 'date-fns';
import { useUpcomingAssignments } from '@/hooks/useAcademicScheduling';
import { useExams } from '@/hooks/useAcademicYear';
import { cn } from '@/lib/utils';

interface DeadlineListProps {
  semesterId?: string;
  limit?: number;
  showCompleted?: boolean;
}

export const DeadlineList = ({ semesterId, limit = 10, showCompleted = false }: DeadlineListProps) => {
  const { data: assignments = [], isLoading: assignmentsLoading } = useUpcomingAssignments(limit);
  const { data: exams = [], isLoading: examsLoading } = useExams(undefined, semesterId);

  // Combine and sort all deadlines
  const allDeadlines = [
    ...assignments.map((a) => ({
      id: a.id,
      title: a.title,
      type: 'assignment' as const,
      dueDate: a.due_at,
      courseTitle: (a as any).courses?.title || 'Unknown Course',
      points: a.total_points,
      completed: false,
    })),
    ...exams
      .filter((e) => e.is_published)
      .map((e) => ({
        id: e.id,
        title: e.title,
        type: 'exam' as const,
        dueDate: e.scheduled_date,
        courseTitle: (e as any).courses?.title || 'Unknown Course',
        points: e.total_points,
        completed: false,
        examType: e.exam_type,
      })),
  ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const getUrgencyBadge = (dueDate: string) => {
    const daysUntil = differenceInDays(parseISO(dueDate), new Date());

    if (isPast(parseISO(dueDate))) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (daysUntil <= 1) {
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Due Today</Badge>;
    }
    if (daysUntil <= 3) {
      return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Due Soon</Badge>;
    }
    if (daysUntil <= 7) {
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">This Week</Badge>;
    }
    return <Badge variant="secondary">{daysUntil} days</Badge>;
  };

  const getTypeIcon = (type: 'assignment' | 'exam', examType?: string) => {
    if (type === 'exam') {
      return <BookOpen className="h-4 w-4 text-purple-500" />;
    }
    return <FileText className="h-4 w-4 text-blue-500" />;
  };

  const isLoading = assignmentsLoading || examsLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading deadlines...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Upcoming Deadlines
          {allDeadlines.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {allDeadlines.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allDeadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {allDeadlines.map((deadline) => {
                const isOverdue = isPast(parseISO(deadline.dueDate));

                return (
                  <div
                    key={`${deadline.type}-${deadline.id}`}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                      isOverdue ? 'bg-red-500/5 border-red-500/20' : 'bg-muted/50 hover:bg-muted'
                    )}
                  >
                    <div className={cn(
                      'p-2 rounded-lg',
                      deadline.type === 'exam' ? 'bg-purple-500/10' : 'bg-blue-500/10'
                    )}>
                      {getTypeIcon(deadline.type, (deadline as any).examType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{deadline.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {deadline.courseTitle}
                          </p>
                        </div>
                        {getUrgencyBadge(deadline.dueDate)}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(deadline.dueDate), 'MMM d, h:mm a')}
                        </span>
                        <span className="flex items-center gap-1">
                          {deadline.points} pts
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {deadline.type === 'exam' ? (deadline as any).examType || 'Exam' : 'Assignment'}
                        </Badge>
                      </div>
                    </div>
                    {isOverdue && (
                      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
