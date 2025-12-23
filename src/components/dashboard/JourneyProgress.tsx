import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, Award, ArrowRight, 
  Trophy, Star, CheckCircle2 
} from 'lucide-react';

interface JourneyProgressProps {
  coursesCompleted: number;
  totalXP: number;
  currentDegree?: string;
  nextMilestone?: {
    name: string;
    coursesRequired: number;
    xpRequired: number;
  };
}

export const JourneyProgress = ({ 
  coursesCompleted = 0, 
  totalXP = 0,
  currentDegree,
  nextMilestone
}: JourneyProgressProps) => {
  // Calculate progress towards next degree
  const degreeProgression = [
    { level: 'ScrollCertificate', courses: 3, xp: 500, icon: '📜' },
    { level: 'ScrollDiploma', courses: 6, xp: 1500, icon: '📋' },
    { level: 'ScrollBachelor', courses: 12, xp: 5000, icon: '🎓' },
    { level: 'ScrollMaster', courses: 18, xp: 10000, icon: '👨‍🎓' },
    { level: 'ScrollDoctorate', courses: 24, xp: 20000, icon: '📚' },
    { level: 'ScrollExousia', courses: 36, xp: 50000, icon: '👑' },
  ];

  // Find current and next degree level
  const currentLevelIndex = degreeProgression.findIndex(
    d => coursesCompleted < d.courses || totalXP < d.xp
  );
  
  const currentTarget = degreeProgression[currentLevelIndex] || degreeProgression[degreeProgression.length - 1];
  const previousLevel = currentLevelIndex > 0 ? degreeProgression[currentLevelIndex - 1] : null;
  
  const courseProgress = Math.min((coursesCompleted / currentTarget.courses) * 100, 100);
  const xpProgress = Math.min((totalXP / currentTarget.xp) * 100, 100);
  const overallProgress = (courseProgress + xpProgress) / 2;

  const achievedDegrees = degreeProgression.filter(
    d => coursesCompleted >= d.courses && totalXP >= d.xp
  );

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Degree Progress
            </CardTitle>
            <CardDescription>
              Your journey towards {currentTarget.level.replace('Scroll', 'Scroll ')}
            </CardDescription>
          </div>
          {achievedDegrees.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {achievedDegrees.length} Achieved
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Progress */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{currentTarget.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{currentTarget.level.replace('Scroll', 'Scroll ')}</h4>
                <span className="text-sm text-muted-foreground">
                  {Math.round(overallProgress)}% complete
                </span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BookOpen className="h-4 w-4" />
                Courses
              </div>
              <p className="font-semibold">
                {coursesCompleted} / {currentTarget.courses}
              </p>
              <Progress value={courseProgress} className="h-1.5 mt-2" />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Star className="h-4 w-4" />
                Experience Points
              </div>
              <p className="font-semibold">
                {totalXP.toLocaleString()} / {currentTarget.xp.toLocaleString()}
              </p>
              <Progress value={xpProgress} className="h-1.5 mt-2" />
            </div>
          </div>
        </div>

        {/* Achievement Timeline */}
        {achievedDegrees.length > 0 && (
          <div className="pt-4 border-t">
            <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Achieved Degrees
            </h5>
            <div className="flex flex-wrap gap-2">
              {achievedDegrees.map((degree) => (
                <Badge key={degree.level} variant="outline" className="bg-green-500/10 border-green-500/30">
                  <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                  {degree.level.replace('Scroll', '')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link to="/graduation" className="flex-1">
            <Button variant="outline" className="w-full">
              <Award className="h-4 w-4 mr-2" />
              Graduation Center
            </Button>
          </Link>
          <Link to="/courses" className="flex-1">
            <Button className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              Continue Learning
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default JourneyProgress;
