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

const recentActivity = [
  { type: "course", title: "Completed: Prophetic Intelligence Module 3", time: "2 hours ago", icon: Book },
  { type: "prayer", title: "Prayer request answered: Wisdom for studies", time: "1 day ago", icon: Heart },
  { type: "achievement", title: "Earned ScrollBadge: Faithful Scholar", time: "2 days ago", icon: Trophy },
  { type: "community", title: "Joined study group: Advanced Theology", time: "3 days ago", icon: Users },
];

const upcomingEvents = [
  { title: "AI Tutor Session: GeoProphetic Intelligence", time: "Today, 3:00 PM", type: "ai-session" },
  { title: "Community Prayer Meeting", time: "Tomorrow, 7:00 AM", type: "prayer" },
  { title: "XR Classroom: Ancient Jerusalem Tour", time: "Wednesday, 2:00 PM", type: "xr" },
  { title: "ScrollCoin Rewards Distribution", time: "Friday, 12:00 PM", type: "reward" },
];

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
    { label: "Courses Enrolled", value: String(dashboardData.courses_enrolled), change: "+2 this month", icon: Book },
    { label: "ScrollCoins Earned", value: String(Math.round(dashboardData.balance)), change: "+89 this week", icon: Coins },
    { label: "Prayer Requests", value: String(dashboardData.total_prayers), change: `${dashboardData.prayers_answered} answered`, icon: Heart },
    { label: "Community Rank", value: "#127", change: "↑ 15 positions", icon: Trophy },
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

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <activity.icon className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
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
                <span className="text-sm">Divine Scorecard</span>
                <Badge variant="secondary">92%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Prayer Consistency</span>
                <Badge variant="outline">21 days</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Scripture Study</span>
                <Badge>Daily</Badge>
              </div>
              <Link to="/spiritual-formation">
                <Button variant="outline" size="sm" className="w-full">
                  View Full Scorecard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                ))}
              </div>
              <Link to="/spiritual-formation">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Full Calendar
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
