import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Users, 
  Video,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { format, parseISO, isPast, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface FacultyTask {
  id: string;
  type: 'grading' | 'lecture_approval' | 'office_hours' | 'content_review' | 'attendance';
  title: string;
  description: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  courseName?: string;
  count?: number;
  completed?: boolean;
}

interface FacultyTaskListProps {
  tasks?: FacultyTask[];
  onTaskClick?: (task: FacultyTask) => void;
  onMarkComplete?: (taskId: string) => void;
}

const defaultTasks: FacultyTask[] = [
  {
    id: '1',
    type: 'grading',
    title: 'Grade Midterm Exams',
    description: 'Review and grade midterm submissions',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    courseName: 'Introduction to Theology',
    count: 45,
  },
  {
    id: '2',
    type: 'lecture_approval',
    title: 'Approve Lecture Release',
    description: 'Review and approve next week\'s lecture materials',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    courseName: 'Biblical Studies 101',
    count: 3,
  },
  {
    id: '3',
    type: 'office_hours',
    title: 'Upcoming Office Hours',
    description: 'Students have scheduled appointments',
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    count: 5,
  },
  {
    id: '4',
    type: 'content_review',
    title: 'Review AI-Generated Content',
    description: 'Verify accuracy of AI-generated study materials',
    priority: 'medium',
    courseName: 'Prophetic Ministry',
    count: 8,
  },
  {
    id: '5',
    type: 'attendance',
    title: 'Mark Attendance',
    description: 'Submit attendance for yesterday\'s lecture',
    dueDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    priority: 'low',
    courseName: 'Church History',
    completed: true,
  },
];

export const FacultyTaskList = ({ 
  tasks = defaultTasks, 
  onTaskClick, 
  onMarkComplete 
}: FacultyTaskListProps) => {
  const getTypeIcon = (type: FacultyTask['type']) => {
    switch (type) {
      case 'grading':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'lecture_approval':
        return <Video className="h-4 w-4 text-purple-500" />;
      case 'office_hours':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'content_review':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'attendance':
        return <CheckCircle className="h-4 w-4 text-teal-500" />;
    }
  };

  const getPriorityBadge = (priority: FacultyTask['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getUrgency = (dueDate?: string) => {
    if (!dueDate) return null;
    const date = parseISO(dueDate);
    if (isPast(date)) return 'overdue';
    const daysUntil = differenceInDays(date, new Date());
    if (daysUntil <= 1) return 'urgent';
    if (daysUntil <= 3) return 'soon';
    return 'normal';
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Faculty Tasks
          </CardTitle>
          <Badge variant="outline">
            {pendingTasks.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {pendingTasks.map((task) => {
              const urgency = getUrgency(task.dueDate);
              const isOverdue = urgency === 'overdue';

              return (
                <div
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className={cn(
                    'p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md',
                    isOverdue ? 'bg-red-500/5 border-red-500/20' : 'bg-muted/30 hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      isOverdue ? 'bg-red-500/10' : 'bg-muted'
                    )}>
                      {getTypeIcon(task.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{task.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {task.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getPriorityBadge(task.priority)}
                          {isOverdue && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        {task.courseName && (
                          <span className="truncate">{task.courseName}</span>
                        )}
                        {task.count && (
                          <Badge variant="outline" className="text-xs">
                            {task.count} items
                          </Badge>
                        )}
                        {task.dueDate && (
                          <span className={cn(
                            'flex items-center gap-1',
                            isOverdue && 'text-red-500'
                          )}>
                            <Clock className="h-3 w-3" />
                            {isOverdue ? 'Overdue' : format(parseISO(task.dueDate), 'MMM d, h:mm a')}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              );
            })}

            {completedTasks.length > 0 && (
              <>
                <div className="flex items-center gap-2 py-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">Completed</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg bg-muted/20 opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-through truncate">{task.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {task.courseName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm text-muted-foreground">No pending tasks</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
