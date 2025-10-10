import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Book, Users, Trophy, Coins, Heart, Brain, 
  TrendingUp, Calendar, Bell, Star 
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboard } from "@/hooks/useDashboard";
import { useUserEnrollments } from "@/hooks/useCourses";
import { useAcknowledgeLordship } from "@/hooks/useSpiritual";

// All data now comes from live hooks - no hardcoded values

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useDashboard();
  const { data: enrollments } = useUserEnrollments();
  const acknowledgeLordship = useAcknowledgeLordship();

  if (isLoading || !dashboardData) {
    return (
      <PageTemplate title="Loading..." description="">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scroll-primary mx-auto"></div>
        </div>
      </PageTemplate>
    );
  }

  const quickStats = [
    { label: "Courses Enrolled", value: String(dashboardData.courses_enrolled), change: `${enrollments?.length ?? 0} active`, icon: Book },
    { label: "ScrollCoins Balance", value: String(Math.round(dashboardData.balance)), change: "Live balance", icon: Coins },
    { label: "Prayer Requests", value: String(dashboardData.total_prayers), change: `${dashboardData.prayers_answered} answered`, icon: Heart },
    { label: "Avg Progress", value: `${Math.round(dashboardData.avg_progress ?? 0)}%`, change: "Across all courses", icon: TrendingUp },
  ];

  return (
    <PageTemplate 
      title="Welcome back, Faithful Scholar"
      description="Continue your transformative journey in Christ-centered education"
      actions={
        <div className="flex space-x-2">
          <Link to="/spiritual-formation">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule
            </Button>
          </Link>
          <Link to="/spiritual-formation">
            <Button>
              <Heart className="h-4 w-4 mr-2" />
              Submit Prayer Request
            </Button>
          </Link>
        </div>
      }
    >
      {/* Christ Lordship Acknowledgment */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-primary" />
            <span>Daily Acknowledgment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-serif italic text-primary">
            "Jesus Christ is Lord over my studies, my calling, and my future. 
            All knowledge and wisdom flow from Him."
          </p>
          <Button 
            size="sm" 
            className="mt-3"
            onClick={() => acknowledgeLordship.mutate(undefined)}
            disabled={acknowledgeLordship.isPending}
          >
            {acknowledgeLordship.isPending ? 'Acknowledging...' : '✓ Acknowledge Christ as Lord'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Progress */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Learning Progress</CardTitle>
              <CardDescription>
                Your journey through the 12 Supreme Scroll Faculties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollments && enrollments.length > 0 ? (
                <>
                  {enrollments.slice(0, 3).map((enrollment: any) => (
                    <div key={enrollment.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{enrollment.courses.title}</span>
                        <span className="text-sm text-muted-foreground">{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>
                  ))}
                  <div className="pt-4">
                    <Link to="/courses">
                      <Button className="w-full">
                        Continue Learning
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet</p>
                  <Link to="/courses">
                    <Button>
                      Explore Courses
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments && enrollments.length > 0 ? (
                <div className="space-y-4">
                  {enrollments.slice(0, 4).map((enrollment: any) => (
                    <div key={enrollment.id} className="flex items-start space-x-3">
                      <Book className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium">{enrollment.courses.title}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{enrollment.courses.faculty}</p>
                          <Badge variant="secondary">{enrollment.progress}%</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No enrollments yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Spiritual Formation */}
          <Card>
            <CardHeader>
              <CardTitle>Spiritual Formation</CardTitle>
              <CardDescription>Your growth in Christ-likeness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Prayer Requests</span>
                <Badge variant="secondary">{dashboardData.total_prayers}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Prayers Answered</span>
                <Badge variant="outline">{dashboardData.prayers_answered}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Course Progress</span>
                <Badge>{Math.round(dashboardData.avg_progress ?? 0)}%</Badge>
              </div>
              <Link to="/spiritual-formation">
                <Button variant="outline" size="sm" className="w-full">
                  View Full Scorecard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/courses">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Book className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
              <Link to="/ai-tutors">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Brain className="h-4 w-4 mr-2" />
                  Start AI Session
                </Button>
              </Link>
              <Link to="/prayer-requests">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Submit Prayer
                </Button>
              </Link>
              <Link to="/wallet">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Coins className="h-4 w-4 mr-2" />
                  View Wallet
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Tutor Quick Access */}
          <Card>
            <CardHeader>
              <CardTitle>ScrollMentor AI</CardTitle>
              <CardDescription>Your personal AI tutor is ready</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm">Online & Ready</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ask questions about your courses, get study guidance, or request spiritual insights.
                </p>
                <Link to="/ai-tutors">
                  <Button size="sm" className="w-full">
                    Start AI Session
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}
