/**
 * Badge Achievement Progress Component
 * "By the Spirit of Excellence, we track our journey"
 * 
 * Component for displaying badge achievement progress and milestones
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp, Award, Lock, CheckCircle } from 'lucide-react';
import { BadgeAchievementProgress as AchievementProgress } from '@/types/scrollbadge';

interface BadgeAchievementProgressProps {
  userId: string;
}

export const BadgeAchievementProgress: React.FC<BadgeAchievementProgressProps> = ({ userId }) => {
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      
      // Mock data - in production, this would come from the API
      const mockAchievements: AchievementProgress[] = [
        {
          achievementType: 'COURSE_COMPLETION',
          name: 'Course Collector',
          description: 'Complete 10 courses',
          currentCount: 7,
          targetCount: 10,
          progress: 70,
          isCompleted: false,
          reward: '500 ScrollCoin'
        },
        {
          achievementType: 'HIGH_ACHIEVER',
          name: 'High Achiever',
          description: 'Earn 5 badges with 90% or higher',
          currentCount: 3,
          targetCount: 5,
          progress: 60,
          isCompleted: false,
          reward: 'Special Achievement Badge'
        },
        {
          achievementType: 'SKILL_MASTER',
          name: 'Skill Master',
          description: 'Earn 3 Skill Mastery badges',
          currentCount: 1,
          targetCount: 3,
          progress: 33,
          isCompleted: false,
          reward: '1000 ScrollCoin'
        },
        {
          achievementType: 'PERFECT_SCORE',
          name: 'Perfect Score',
          description: 'Earn a badge with 100% grade',
          currentCount: 1,
          targetCount: 1,
          progress: 100,
          isCompleted: true,
          reward: 'Perfect Score Badge'
        },
        {
          achievementType: 'DEGREE_SEEKER',
          name: 'Degree Seeker',
          description: 'Complete a full degree program',
          currentCount: 0,
          targetCount: 1,
          progress: 0,
          isCompleted: false,
          reward: 'Degree Completion Badge + 5000 ScrollCoin'
        }
      ];

      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'COURSE_COMPLETION':
        return Award;
      case 'HIGH_ACHIEVER':
        return TrendingUp;
      case 'SKILL_MASTER':
        return Target;
      case 'PERFECT_SCORE':
        return Trophy;
      case 'DEGREE_SEEKER':
        return Trophy;
      default:
        return Award;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Trophy className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading achievements...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Achievement Progress
          </h2>
          <p className="text-muted-foreground mt-1">
            Track your progress towards earning special achievements
          </p>
        </div>
      </div>

      {/* Achievement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement, index) => {
          const Icon = getAchievementIcon(achievement.achievementType);
          
          return (
            <Card
              key={index}
              className={achievement.isCompleted ? 'border-green-500 bg-green-50/50' : ''}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      achievement.isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{achievement.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  {achievement.isCompleted && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      {achievement.currentCount} / {achievement.targetCount}
                    </span>
                  </div>
                  <Progress value={achievement.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {achievement.progress}% complete
                  </p>
                </div>

                {/* Reward */}
                {achievement.reward && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Reward:</span>
                    <Badge variant="outline" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      {achievement.reward}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">
                {achievements.filter(a => a.isCompleted).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Completed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600">
                {achievements.filter(a => !a.isCompleted && a.progress > 0).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">In Progress</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-600">
                {achievements.filter(a => a.progress === 0).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Not Started</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
