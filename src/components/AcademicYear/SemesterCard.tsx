import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, BookOpen, FileCheck, GraduationCap } from 'lucide-react';
import { format, parseISO, differenceInDays, isAfter, isBefore } from 'date-fns';
import { Semester } from '@/hooks/useAcademicYear';
import { cn } from '@/lib/utils';

interface SemesterCardProps {
  semester: Semester;
  showDetails?: boolean;
}

export const SemesterCard = ({ semester, showDetails = true }: SemesterCardProps) => {
  const startDate = parseISO(semester.start_date);
  const endDate = parseISO(semester.end_date);
  const today = new Date();

  const totalDays = differenceInDays(endDate, startDate);
  const daysPassed = Math.max(0, differenceInDays(today, startDate));
  const progressPercent = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

  const getStatus = () => {
    if (isBefore(today, startDate)) return 'upcoming';
    if (isAfter(today, endDate)) return 'completed';
    return 'active';
  };

  const status = semester.is_active ? 'active' : getStatus();

  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
    }
  };

  const milestones = [
    {
      label: 'Registration',
      date: semester.registration_start,
      endDate: semester.registration_end,
      icon: FileCheck,
      color: 'text-blue-500',
    },
    {
      label: 'Add/Drop Deadline',
      date: semester.add_drop_deadline,
      icon: Clock,
      color: 'text-orange-500',
    },
    {
      label: 'Withdrawal Deadline',
      date: semester.withdrawal_deadline,
      icon: Calendar,
      color: 'text-red-500',
    },
    {
      label: 'Finals Period',
      date: semester.finals_start,
      endDate: semester.finals_end,
      icon: GraduationCap,
      color: 'text-purple-500',
    },
  ].filter((m) => m.date);

  return (
    <Card className={cn(
      'transition-all duration-200',
      status === 'active' && 'border-primary/50 shadow-md'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {semester.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Semester Progress</span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{daysPassed} days elapsed</span>
            <span>{Math.max(0, totalDays - daysPassed)} days remaining</span>
          </div>
        </div>

        {/* Milestones */}
        {showDetails && milestones.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Key Dates</p>
            <div className="grid gap-2">
              {milestones.map((milestone, index) => {
                const isPast = milestone.date && isAfter(today, parseISO(milestone.date));
                const Icon = milestone.icon;

                return (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg bg-muted/50',
                      isPast && 'opacity-60'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', milestone.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{milestone.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {milestone.date && format(parseISO(milestone.date), 'MMM d')}
                        {milestone.endDate && ` - ${format(parseISO(milestone.endDate), 'MMM d')}`}
                      </p>
                    </div>
                    {isPast && (
                      <Badge variant="outline" className="text-xs">Passed</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{totalDays}</p>
            <p className="text-xs text-muted-foreground">Total Days</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{semester.semester_order}</p>
            <p className="text-xs text-muted-foreground">Term #{semester.semester_order}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
