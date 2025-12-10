import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Calendar, Clock, GraduationCap, BookOpen, CheckCircle2, AlertCircle } from "lucide-react";
import { useAcademicTerms, useActiveTerm, getTermStatus, getTermProgress } from "@/hooks/useAcademicTerms";
import { format, differenceInDays, parseISO } from "date-fns";

console.info("✝️ Academic Calendar — Christ governs the seasons of learning");

export default function AcademicCalendar() {
  const { data: terms, isLoading: termsLoading } = useAcademicTerms();
  const { data: activeTerm, isLoading: activeLoading } = useActiveTerm();

  if (termsLoading || activeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group terms by status
  const activeTerms = terms?.filter(t => getTermStatus(t) === 'active') || [];
  const upcomingTerms = terms?.filter(t => getTermStatus(t) === 'upcoming') || [];
  const pastTerms = terms?.filter(t => getTermStatus(t) === 'past').slice(0, 4) || [];

  // Calculate days remaining in active term
  const daysRemaining = activeTerm 
    ? differenceInDays(parseISO(activeTerm.end_date), new Date())
    : 0;

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          Academic Calendar
        </h1>
        <p className="text-muted-foreground">
          View and manage academic terms, semesters, and important dates
        </p>
      </div>

      {/* Current Term Card */}
      {activeTerm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Current Term
                </CardTitle>
                <CardDescription className="text-lg font-medium text-foreground mt-1">
                  {activeTerm.name}
                </CardDescription>
              </div>
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-semibold">{format(parseISO(activeTerm.start_date), 'MMM d, yyyy')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-semibold">{format(parseISO(activeTerm.end_date), 'MMM d, yyyy')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="font-semibold text-primary">{Math.max(0, daysRemaining)} days</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="font-semibold">{getTermProgress(activeTerm)}%</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Term Progress</span>
                <span>{getTermProgress(activeTerm)}%</span>
              </div>
              <Progress value={getTermProgress(activeTerm)} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Active Term Warning */}
      {!activeTerm && terms && terms.length > 0 && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="py-6 flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="font-medium">No Active Term</p>
              <p className="text-sm text-muted-foreground">
                There is currently no active academic term. Check upcoming terms below.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Terms */}
      {upcomingTerms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Upcoming Terms
            </CardTitle>
            <CardDescription>
              Future academic terms and semesters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTerms.map((term) => {
                const daysUntilStart = differenceInDays(parseISO(term.start_date), new Date());
                return (
                  <div 
                    key={term.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{term.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(term.start_date), 'MMM d')} - {format(parseISO(term.end_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-blue-500 border-blue-500/50">
                      Starts in {daysUntilStart} days
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Terms */}
      {pastTerms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              Recent Terms
            </CardTitle>
            <CardDescription>
              Previous academic terms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastTerms.map((term) => (
                <div 
                  key={term.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg opacity-75"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{term.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(term.start_date), 'MMM d')} - {format(parseISO(term.end_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    Completed
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!terms || terms.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No academic terms configured</p>
            <p className="text-sm text-muted-foreground mt-2">
              Academic terms will appear here once they are created by administrators.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Important Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Key Academic Milestones</CardTitle>
          <CardDescription>Important dates and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Course Registration Opens", date: "2 weeks before term start", icon: BookOpen },
              { title: "Add/Drop Deadline", date: "2 weeks after term start", icon: Clock },
              { title: "Midterm Examinations", date: "Week 8 of term", icon: GraduationCap },
              { title: "Final Examinations", date: "Last 2 weeks of term", icon: CheckCircle2 },
              { title: "Grade Submission", date: "1 week after term end", icon: Calendar },
              { title: "Graduation Ceremony", date: "Following semester", icon: GraduationCap },
            ].map((milestone, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <milestone.icon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{milestone.title}</p>
                  <p className="text-xs text-muted-foreground">{milestone.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
