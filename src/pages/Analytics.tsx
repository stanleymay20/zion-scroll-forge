import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, Users, BookOpen, Brain, Target, Award,
  AlertCircle, CheckCircle, Clock, Zap
} from "lucide-react";
import { useStudentAnalytics, useFacultyAnalytics, useInterventionAlerts, useSpiritualAssessments } from "@/hooks/useScrollIntel";

export default function Analytics() {
  const { data: studentAnalytics, isLoading: loadingStudent } = useStudentAnalytics();
  const { data: facultyAnalytics, isLoading: loadingFaculty } = useFacultyAnalytics();
  const { data: alerts, isLoading: loadingAlerts } = useInterventionAlerts();
  const { data: spiritualAssessments, isLoading: loadingSpiritualAssessments } = useSpiritualAssessments();

  const latestAssessment = spiritualAssessments && spiritualAssessments.length > 0 ? spiritualAssessments[0] : null;

  return (
    <PageTemplate
      title="Learning Analytics"
      description="Your personalized insights and growth metrics powered by ScrollIntel-G6"
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{studentAnalytics?.enrolled_courses || 0}</p>
                <p className="text-sm text-muted-foreground">Enrolled Courses</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {studentAnalytics?.avg_progress ? Math.round(studentAnalytics.avg_progress) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{studentAnalytics?.ai_interactions || 0}</p>
                <p className="text-sm text-muted-foreground">AI Interactions</p>
              </div>
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {studentAnalytics?.engagement_score 
                    ? Math.round(studentAnalytics.engagement_score * 100)
                    : 50}%
                </p>
                <p className="text-sm text-muted-foreground">Engagement</p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intervention Alerts */}
      {alerts && alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Active Alerts & Recommendations
            </CardTitle>
            <CardDescription>
              AI-generated insights to optimize your learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-4 p-4 bg-background rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                        {alert.alert_type}
                      </Badge>
                      <Badge variant="outline">{alert.severity}</Badge>
                    </div>
                    <p className="text-sm mb-2">{alert.message}</p>
                    {alert.recommendations && alert.recommendations.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Recommendations:</p>
                        {alert.recommendations.map((rec: string, idx: number) => (
                          <p key={idx} className="text-xs text-muted-foreground">• {rec}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spiritual Growth Metrics */}
      {latestAssessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✝️ Spiritual Growth Profile
            </CardTitle>
            <CardDescription>
              Your spiritual development and Kingdom calling insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Spiritual Gifts */}
              {latestAssessment.spiritual_gifts && latestAssessment.spiritual_gifts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Spiritual Gifts</h4>
                  <div className="flex flex-wrap gap-2">
                    {latestAssessment.spiritual_gifts.map((gift: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        <Award className="h-3 w-3 mr-1" />
                        {gift}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Calling Insights */}
              {latestAssessment.calling_insights && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Calling Insights</h4>
                  <div className="space-y-2">
                    {Object.entries(latestAssessment.calling_insights).map(([key, value], idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium">{key}: </span>
                        <span className="text-muted-foreground">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Assessment Confidence</h4>
                  <span className="text-sm font-medium">
                    {Math.round((latestAssessment.confidence_score || 0) * 100)}%
                  </span>
                </div>
                <Progress value={(latestAssessment.confidence_score || 0) * 100} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Faculty Performance */}
      {facultyAnalytics && facultyAnalytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Faculty Performance Overview</CardTitle>
            <CardDescription>
              Institutional excellence across all Scroll faculties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {facultyAnalytics.map((faculty: any) => (
                <div key={faculty.faculty} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{faculty.faculty}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{faculty.total_courses} courses</span>
                        <span>{faculty.total_students} students</span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {faculty.avg_engagement ? 
                            Math.round(faculty.avg_engagement * 100) : 0}% engagement
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {faculty.avg_completion ? Math.round(faculty.avg_completion) : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">completion</p>
                    </div>
                  </div>
                  <Progress value={faculty.avg_completion || 0} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            ScrollIntel-G6 Insights
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Strong Foundation</p>
                <p className="text-sm text-muted-foreground">
                  Your consistent engagement and prayer practice demonstrate spiritual maturity. 
                  Continue building on this foundation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Target className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Growth Opportunity</p>
                <p className="text-sm text-muted-foreground">
                  Consider exploring courses in faculties aligned with your spiritual gifts. 
                  The AI council recommends focusing on practical application.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Optimal Learning Time</p>
                <p className="text-sm text-muted-foreground">
                  Based on your engagement patterns, your peak learning times are mornings 
                  and early evenings. Schedule intensive study during these windows.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
