import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  Award,
  Clock,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { useStudentAcademicStanding, useActiveSemester, useSemesters } from '@/hooks/useAcademicYear';
import { useUpcomingAssignments, useStudentBilling } from '@/hooks/useAcademicScheduling';
import { DeadlineList } from '@/components/AcademicYear/DeadlineList';
import { AcademicCalendar } from '@/components/AcademicYear/AcademicCalendar';
import { format, parseISO } from 'date-fns';

const StudentAcademicTimeline = () => {
  const navigate = useNavigate();
  const { data: standing, isLoading: standingLoading } = useStudentAcademicStanding();
  const { data: activeSemester } = useActiveSemester();
  const { data: assignments = [] } = useUpcomingAssignments(5);
  const { data: billing = [] } = useStudentBilling();

  const getStandingColor = (status?: string) => {
    switch (status) {
      case 'good':
        return 'text-green-500 bg-green-500/10';
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'probation':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getGpaColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-green-500';
    if (gpa >= 3.0) return 'text-blue-500';
    if (gpa >= 2.5) return 'text-yellow-500';
    if (gpa >= 2.0) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/academic-year')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">My Academic Timeline</h1>
          <p className="text-muted-foreground">
            Track your progress through {activeSemester?.name || 'the academic year'}
          </p>
        </div>
      </div>

      {/* Academic Standing Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Academic Standing</CardTitle>
                <CardDescription>Your current academic status</CardDescription>
              </div>
            </div>
            {standing && (
              <Badge className={getStandingColor(standing.standing)}>
                {standing.standing.charAt(0).toUpperCase() + standing.standing.slice(1)} Standing
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className={`text-3xl font-bold ${getGpaColor(standing?.gpa || 0)}`}>
                {standing?.gpa?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-muted-foreground">Current GPA</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className={`text-3xl font-bold ${getGpaColor(standing?.cumulative_gpa || 0)}`}>
                {standing?.cumulative_gpa?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-muted-foreground">Cumulative GPA</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold">{standing?.credits_earned || 0}</p>
              <p className="text-sm text-muted-foreground">Credits Earned</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold">{standing?.credits_attempted || 0}</p>
              <p className="text-sm text-muted-foreground">Credits Attempted</p>
            </div>
          </div>

          {/* Progress toward graduation */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress Toward Graduation</span>
              <span className="font-medium">{Math.round(((standing?.credits_earned || 0) / 120) * 100)}%</span>
            </div>
            <Progress value={((standing?.credits_earned || 0) / 120) * 100} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {standing?.credits_earned || 0} of 120 credits required for graduation
            </p>
          </div>

          {standing?.dean_list && (
            <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
              <Award className="h-6 w-6 text-amber-500" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">Dean's List</p>
                <p className="text-sm text-muted-foreground">Congratulations on your academic excellence!</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <DeadlineList limit={5} />

        {/* Financial Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Financial Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {billing.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p className="font-medium">All Clear!</p>
                <p className="text-sm">No outstanding balances</p>
              </div>
            ) : (
              <div className="space-y-3">
                {billing.slice(0, 3).map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{(bill as any).semesters?.name || 'Tuition'}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {format(parseISO(bill.due_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${(bill.amount_due - bill.amount_paid).toFixed(2)}</p>
                      <Badge variant={bill.status === 'paid' ? 'secondary' : bill.status === 'overdue' ? 'destructive' : 'outline'}>
                        {bill.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Academic Calendar */}
      <AcademicCalendar />
    </div>
  );
};

export default StudentAcademicTimeline;
