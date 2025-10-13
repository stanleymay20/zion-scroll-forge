/**
 * Comprehensive Course Card Component
 * Displays course information with all mandatory components
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Award, 
  Users, 
  Brain, 
  Heart, 
  Star,
  Play,
  CheckCircle,
  Zap
} from 'lucide-react';
import { ComprehensiveCourse, StudentEnrollment } from '../../types/course-comprehensive';

interface ComprehensiveCourseCardProps {
  course: ComprehensiveCourse;
  enrollment?: StudentEnrollment;
  onEnroll?: (courseId: string) => void;
  onContinue?: (courseId: string) => void;
  onViewDetails?: (courseId: string) => void;
}

export const ComprehensiveCourseCard: React.FC<ComprehensiveCourseCardProps> = ({
  course,
  enrollment,
  onEnroll,
  onContinue,
  onViewDetails
}) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScrollFieldColor = (field: string) => {
    const colors: Record<string, string> = {
      'ScrollMedicine': 'bg-blue-100 text-blue-800',
      'ScrollAI': 'bg-purple-100 text-purple-800',
      'ScrollGovernance': 'bg-indigo-100 text-indigo-800',
      'ScrollBusiness': 'bg-orange-100 text-orange-800',
      'ScrollEngineering': 'bg-gray-100 text-gray-800',
      'ScrollTheology': 'bg-yellow-100 text-yellow-800',
      'ScrollEconomy': 'bg-green-100 text-green-800',
      'PropheticLaw': 'bg-pink-100 text-pink-800',
      'EdenicScience': 'bg-emerald-100 text-emerald-800',
      'GeoPropheticIntelligence': 'bg-cyan-100 text-cyan-800'
    };
    return colors[field] || 'bg-gray-100 text-gray-800';
  };

  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.status === 'completed';
  const progressPercentage = enrollment?.progress_percentage || 0;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <Badge className={getDifficultyColor(course.difficulty_level)}>
            {course.difficulty_level.toUpperCase()}
          </Badge>
          <Badge className={getScrollFieldColor(course.scroll_field)}>
            {course.scroll_field}
          </Badge>
        </div>
        
        <CardTitle className="text-xl font-bold line-clamp-2 mb-2">
          {course.title}
        </CardTitle>
        
        <CardDescription className="line-clamp-3 text-sm">
          {course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span>{course.modules.length} Modules</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span>{course.estimated_hours}h</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-600" />
            <span>{course.total_assessments} Assessments</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span>{course.total_lectures} Lectures</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {course.gpt_tutor_enabled && (
            <Badge variant="secondary" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              AI Tutor
            </Badge>
          )}
          {course.spiritual_formation_track && (
            <Badge variant="secondary" className="text-xs">
              <Heart className="h-3 w-3 mr-1" />
              Spiritual Formation
            </Badge>
          )}
          {course.final_project_required && (
            <Badge variant="secondary" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Final Project
            </Badge>
          )}
          {course.mentorship_required && (
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Mentorship
            </Badge>
          )}
        </div>

        {/* Progress (if enrolled) */}
        {isEnrolled && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            
            {enrollment && (
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>{enrollment.total_xp_earned} XP</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  <span>{enrollment.total_scrollcoin_earned} Coins</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Learning Objectives Preview */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Learning Objectives:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            {course.learning_objectives.slice(0, 3).map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                <span className="line-clamp-2">{objective}</span>
              </li>
            ))}
            {course.learning_objectives.length > 3 && (
              <li className="text-xs text-muted-foreground">
                +{course.learning_objectives.length - 3} more objectives
              </li>
            )}
          </ul>
        </div>

        {/* Spiritual Objectives (if applicable) */}
        {course.spiritual_objectives && course.spiritual_objectives.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-600" />
              Spiritual Formation:
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {course.spiritual_objectives.slice(0, 2).map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Heart className="h-3 w-3 mt-0.5 text-red-600 flex-shrink-0" />
                  <span className="line-clamp-2">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 space-y-2">
        {/* Action Buttons */}
        <div className="w-full space-y-2">
          {!isEnrolled ? (
            <div className="flex gap-2">
              <Button 
                onClick={() => onViewDetails?.(course.course_id)}
                variant="outline" 
                className="flex-1"
              >
                View Details
              </Button>
              <Button 
                onClick={() => onEnroll?.(course.course_id)}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Enroll Now
              </Button>
            </div>
          ) : isCompleted ? (
            <div className="flex gap-2">
              <Button 
                onClick={() => onViewDetails?.(course.course_id)}
                variant="outline" 
                className="flex-1"
              >
                View Certificate
              </Button>
              <Button 
                onClick={() => onViewDetails?.(course.course_id)}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={() => onViewDetails?.(course.course_id)}
                variant="outline" 
                className="flex-1"
              >
                View Details
              </Button>
              <Button 
                onClick={() => onContinue?.(course.course_id)}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Continue
              </Button>
            </div>
          )}
        </div>

        {/* Rewards Preview */}
        <div className="w-full pt-2 border-t">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Completion Rewards:</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {course.milestone_rewards.find(r => r.percentage === 100)?.xp_reward || 0} XP
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {course.milestone_rewards.find(r => r.percentage === 100)?.scrollcoin_reward || 0} Coins
              </span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ComprehensiveCourseCard;