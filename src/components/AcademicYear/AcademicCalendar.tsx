import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, BookOpen, GraduationCap, Clock, AlertTriangle } from 'lucide-react';
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { useAcademicEvents, useAcademicBreaks, useSemesters, AcademicEvent, AcademicBreak } from '@/hooks/useAcademicYear';
import { cn } from '@/lib/utils';

interface AcademicCalendarProps {
  academicYearId?: string;
  selectedMonth?: Date;
}

export const AcademicCalendar = ({ academicYearId, selectedMonth = new Date() }: AcademicCalendarProps) => {
  const { data: events = [] } = useAcademicEvents(academicYearId);
  const { data: breaks = [] } = useAcademicBreaks(academicYearId);
  const { data: semesters = [] } = useSemesters(academicYearId);

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'orientation':
        return <BookOpen className="h-3 w-3" />;
      case 'ceremony':
      case 'convocation':
        return <GraduationCap className="h-3 w-3" />;
      case 'deadline':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'orientation':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ceremony':
      case 'convocation':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'deadline':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'registration':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const eventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventDate = parseISO(event.event_date);
      return format(eventDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    });
  };

  const isBreakDay = (day: Date) => {
    return breaks.some((breakPeriod) => {
      return isWithinInterval(day, {
        start: parseISO(breakPeriod.start_date),
        end: parseISO(breakPeriod.end_date),
      });
    });
  };

  const activeSemester = semesters.find((s) => s.is_active);

  return (
    <div className="space-y-6">
      {/* Active Semester Info */}
      {activeSemester && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{activeSemester.name}</p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(activeSemester.start_date), 'MMM d')} - {format(parseISO(activeSemester.end_date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {format(selectedMonth, 'MMMM yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day) => {
              const dayEvents = eventsForDay(day);
              const isBreak = isBreakDay(day);
              const today = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[80px] p-1 border rounded-md',
                    !isSameMonth(day, selectedMonth) && 'opacity-50',
                    isBreak && 'bg-muted/50',
                    today && 'ring-2 ring-primary'
                  )}
                >
                  <div className={cn(
                    'text-sm font-medium mb-1',
                    today && 'text-primary'
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          'text-xs px-1 py-0.5 rounded truncate flex items-center gap-1 border',
                          getEventColor(event.event_type)
                        )}
                        title={event.title}
                      >
                        {getEventIcon(event.event_type)}
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events
              .filter((e) => new Date(e.event_date) >= new Date())
              .slice(0, 5)
              .map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={cn('p-2 rounded-lg', getEventColor(event.event_type))}>
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(event.event_date), 'PPP')}
                    </p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className={getEventColor(event.event_type)}>
                    {event.event_type}
                  </Badge>
                </div>
              ))}
            {events.filter((e) => new Date(e.event_date) >= new Date()).length === 0 && (
              <p className="text-muted-foreground text-center py-4">No upcoming events</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Academic Breaks */}
      {breaks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Academic Breaks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {breaks.map((breakPeriod) => (
                <div key={breakPeriod.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{breakPeriod.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(breakPeriod.start_date), 'MMM d')} - {format(parseISO(breakPeriod.end_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge variant="secondary">{breakPeriod.break_type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
