import { useAuth } from '@/contexts/AuthContext';
import {
  useLearningProfile,
  useCourseRecommendations,
  useLearningGoals,
  useUserModuleProgress,
  useSkillsAssessment,
} from '@/hooks/usePersonalization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Target,
  BookOpen,
  TrendingUp,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PersonalizedDashboard() {
  const { user } = useAuth();
  const { data: profile } = useLearningProfile();
  const { data: recommendations } = useCourseRecommendations();
  const { data: goals } = useLearningGoals();
  const { data: progress } = useUserModuleProgress();
  const { data: skills } = useSkillsAssessment();

  const activeGoals = goals?.filter(g => g.status === 'active') || [];
  const recentProgress = progress?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground">
            "For I know the plans I have for you," declares the Lord - Jeremiah 29:11
          </p>
        </div>

        {/* Learning Profile Summary */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Your Learning Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-6">
              <div>
                <div className="text-sm text-muted-foreground">Learning Style</div>
                <div className="font-semibold capitalize">{profile.learning_style.replace('_', '/')}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Preferred Pace</div>
                <div className="font-semibold capitalize">{profile.preferred_pace}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Best Study Times</div>
                <div className="flex gap-1">
                  {Object.entries(profile.study_time_preference)
                    .filter(([_, value]) => value)
                    .map(([time]) => (
                      <Badge key={time} variant="secondary" className="capitalize">
                        {time}
                      </Badge>
                    ))}
                </div>
              </div>
              <Button variant="outline" size="sm" className="ml-auto" asChild>
                <Link to="/learning-profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Goals */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Active Learning Goals
              </CardTitle>
              <CardDescription>Track your progress toward personal objectives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeGoals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No active goals yet</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link to="/learning-goals">Set Your First Goal</Link>
                  </Button>
                </div>
              ) : (
                activeGoals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold capitalize">
                        {goal.goal_type.replace('_', ' ')}
                      </div>
                      <Badge variant="outline">
                        {goal.current_value} / {goal.target_value}
                      </Badge>
                    </div>
                    <Progress value={(goal.current_value / goal.target_value) * 100} />
                    {goal.deadline && (
                      <div className="text-sm text-muted-foreground">
                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Skills Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Skills Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {skills ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold mb-2">Top Strengths</div>
                    <div className="space-y-1">
                      {skills.strengths?.slice(0, 3).map((strength: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-sm">{strength.topic}</span>
                          <Badge variant="secondary" className="ml-auto">
                            {strength.mastery}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/skills-assessment">
                      View Full Assessment
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Complete modules to see your skills</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Course Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Recommended for You
            </CardTitle>
            <CardDescription>Courses tailored to your learning profile and goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations?.slice(0, 3).map((rec) => (
                <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{rec.course?.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {rec.course?.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Relevance</span>
                        <Badge variant="secondary">{rec.relevance_score}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground italic">{rec.reason}</p>
                      <Button className="w-full" size="sm" asChild>
                        <Link to={`/courses/${rec.course_id}`}>View Course</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProgress.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-semibold">{item.course_modules?.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.course_modules?.courses?.title}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                      {item.mastery_level}% Mastery
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.time_spent} mins
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
