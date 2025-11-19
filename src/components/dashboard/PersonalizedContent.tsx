import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { 
  BookOpen, TrendingUp, Clock, Target, 
  Sparkles, Calendar, Bell, Award 
} from "lucide-react";

interface PersonalizedContentProps {
  enrollments?: any[];
  recommendations?: any[];
  upcomingEvents?: any[];
  recentActivity?: any[];
}

export const PersonalizedContent = ({ 
  enrollments = [], 
  recommendations = [],
  upcomingEvents = [],
  recentActivity = []
}: PersonalizedContentProps) => {
  return (
    <div className="space-y-6">
      {/* Continue Learning Section */}
      {enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Continue Learning</span>
            </CardTitle>
            <CardDescription>
              Pick up where you left off
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrollments.slice(0, 3).map((enrollment: any) => (
              <div key={enrollment.id} className="space-y-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{enrollment.courses?.title || "Course"}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {enrollment.courses?.faculty || "Faculty"}
                    </p>
                  </div>
                  <Badge variant={enrollment.progress > 75 ? "default" : "secondary"}>
                    {enrollment.progress}%
                  </Badge>
                </div>
                <Progress value={enrollment.progress} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Last accessed {new Date(enrollment.updated_at).toLocaleDateString()}
                  </span>
                  <Link to={`/courses/${enrollment.course_id}/learn`}>
                    <Button size="sm" variant="outline">
                      Continue
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommended Courses */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Recommended for You</span>
            </CardTitle>
            <CardDescription>
              Based on your learning path and interests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.slice(0, 3).map((course: any, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{course.title}</h4>
                  <p className="text-sm text-muted-foreground">{course.faculty}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {course.difficulty || "Intermediate"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {course.duration || "8 weeks"}
                    </span>
                  </div>
                </div>
                <Link to={`/courses/${course.id}`}>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming Events</span>
            </CardTitle>
            <CardDescription>
              Don't miss these important dates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.slice(0, 4).map((event: any, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="h-10 w-10 bg-accent rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold">
                    {new Date(event.date).getDate()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <Badge variant="outline">{event.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Learning Goals</span>
          </CardTitle>
          <CardDescription>
            Track your progress towards your goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Complete 3 courses this semester</span>
              <span className="text-muted-foreground">1/3</span>
            </div>
            <Progress value={33} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Earn 1000 ScrollCoins</span>
              <span className="text-muted-foreground">650/1000</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Daily devotion streak</span>
              <span className="text-muted-foreground">7 days</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
          <Link to="/learning-goals">
            <Button variant="outline" size="sm" className="w-full mt-2">
              <Target className="h-4 w-4 mr-2" />
              Manage Goals
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <span>Recent Achievements</span>
          </CardTitle>
          <CardDescription>
            Your latest accomplishments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3 p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
            <div className="h-10 w-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">First Course Completed</h4>
              <p className="text-sm text-muted-foreground">Earned 100 ScrollCoins</p>
            </div>
          </div>
          <Link to="/achievements">
            <Button variant="outline" size="sm" className="w-full">
              View All Achievements
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
