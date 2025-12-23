import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, GraduationCap, BookOpen, Heart, User, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentProfile } from '@/hooks/useStudents';

const onboardingSteps = [
  { 
    id: 1, 
    name: 'Create Profile', 
    description: 'Set up your student profile',
    icon: User,
    path: '/apply',
    action: 'Complete Application'
  },
  { 
    id: 2, 
    name: 'Choose Your Path', 
    description: 'Select a degree program',
    icon: GraduationCap,
    path: '/degrees',
    action: 'Browse Degrees'
  },
  { 
    id: 3, 
    name: 'Enroll in Courses', 
    description: 'Start your learning journey',
    icon: BookOpen,
    path: '/courses',
    action: 'Explore Courses'
  },
  { 
    id: 4, 
    name: 'Spiritual Formation', 
    description: 'Begin your spiritual growth',
    icon: Heart,
    path: '/spiritual-formation',
    action: 'Start Formation'
  },
];

interface StudentOnboardingProps {
  onDismiss?: () => void;
  enrollmentCount?: number;
  hasDegreeEnrollment?: boolean;
}

export const StudentOnboarding = ({ onDismiss, enrollmentCount = 0, hasDegreeEnrollment = false }: StudentOnboardingProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading } = useStudentProfile();
  
  // Calculate completed steps based on user data
  const getCompletedSteps = () => {
    const completed: number[] = [];
    
    if (profile?.application_status === 'accepted' || profile?.application_status === 'submitted') {
      completed.push(1);
    }
    
    // Check if user has enrolled in any degree
    if (hasDegreeEnrollment) {
      completed.push(2);
    }
    
    // Check if user has any enrollments
    if (enrollmentCount > 0) {
      completed.push(3);
    }
    
    return completed;
  };

  const completedSteps = getCompletedSteps();
  const currentStep = completedSteps.length + 1;
  const progress = (completedSteps.length / onboardingSteps.length) * 100;

  if (isLoading) {
    return null;
  }

  // Don't show if all steps are complete
  if (completedSteps.length >= onboardingSteps.length) {
    return null;
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Welcome to ScrollUniversity</CardTitle>
              <CardDescription>Complete your onboarding to begin your journey</CardDescription>
            </div>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Progress</span>
            <span className="font-medium">{completedSteps.length} of {onboardingSteps.length} steps</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid gap-3">
          {onboardingSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  isCompleted
                    ? 'bg-green-500/10 border-green-500/30'
                    : isCurrent
                    ? 'bg-primary/10 border-primary/30 shadow-sm'
                    : 'bg-muted/30 border-muted'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  isCompleted 
                    ? 'bg-green-500/20' 
                    : isCurrent 
                    ? 'bg-primary/20' 
                    : 'bg-muted'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <StepIcon className={`h-5 w-5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${isCompleted ? 'text-green-600' : ''}`}>
                      {step.name}
                    </h4>
                    {isCompleted && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                        Complete
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge variant="default">Current</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>

                {isCurrent && (
                  <Button size="sm" onClick={() => navigate(step.path)}>
                    {step.action}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-center text-muted-foreground">
            ✝️ "The fear of the Lord is the beginning of wisdom" — Proverbs 9:10
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentOnboarding;
