import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, ChevronRight, Award, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface OnboardingStep {
  stepId: string;
  title: string;
  description: string;
  order: number;
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  content: {
    type: string;
    [key: string]: any;
  };
}

interface OnboardingProgress {
  userId: string;
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  completionPercentage: number;
  steps: OnboardingStep[];
  startedAt: Date;
  completedAt?: Date;
}

interface OnboardingChecklistProps {
  onStepClick: (stepId: string) => void;
  onComplete?: () => void;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  onStepClick,
  onComplete
}) => {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnboardingProgress();
  }, []);

  const fetchOnboardingProgress = async () => {
    try {
      const response = await fetch('/api/enrollment/onboarding/progress', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data);
        
        if (data.completedAt && onComplete) {
          onComplete();
        }
      }
    } catch (error) {
      console.error('Failed to fetch onboarding progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = async (step: OnboardingStep) => {
    if (step.isCompleted) {
      return; // Already completed
    }

    onStepClick(step.stepId);
  };

  const handleSkipStep = async (stepId: string) => {
    try {
      const response = await fetch(`/api/enrollment/onboarding/step/${stepId}/skip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchOnboardingProgress();
      }
    } catch (error) {
      console.error('Failed to skip step:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No onboarding progress found.</p>
        </CardContent>
      </Card>
    );
  }

  const isComplete = progress.completedAt !== undefined;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isComplete ? (
                <>
                  <Award className="h-6 w-6 text-yellow-500" />
                  Onboarding Complete!
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6 text-blue-500" />
                  Welcome to ScrollUniversity
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isComplete
                ? 'You\'re all set! Start your learning journey.'
                : 'Complete these steps to get started'}
            </CardDescription>
          </div>
          <Badge variant={isComplete ? 'default' : 'secondary'} className="text-lg px-4 py-2">
            {progress.completionPercentage}%
          </Badge>
        </div>
        <Progress value={progress.completionPercentage} className="mt-4" />
        <p className="text-sm text-gray-600 mt-2">
          {progress.completedSteps} of {progress.totalSteps} steps completed
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {progress.steps.map((step) => (
          <div
            key={step.stepId}
            className={`
              flex items-start gap-4 p-4 rounded-lg border transition-all
              ${step.isCompleted
                ? 'bg-green-50 border-green-200'
                : step.order === progress.currentStep
                ? 'bg-blue-50 border-blue-300 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300'
              }
              ${!step.isCompleted && 'cursor-pointer'}
            `}
            onClick={() => !step.isCompleted && handleStepClick(step)}
          >
            <div className="flex-shrink-0 mt-1">
              {step.isCompleted ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Circle className="h-6 w-6 text-gray-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-medium ${step.isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                  {step.title}
                </h4>
                {step.isRequired && !step.isCompleted && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
                {step.isCompleted && step.completedAt && (
                  <span className="text-xs text-gray-500">
                    ✓ {new Date(step.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{step.description}</p>

              {!step.isCompleted && !step.isRequired && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSkipStep(step.stepId);
                  }}
                >
                  Skip this step
                </Button>
              )}
            </div>

            {!step.isCompleted && (
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
            )}
          </div>
        ))}

        {isComplete && (
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <h3 className="font-semibold text-lg">Congratulations!</h3>
                <p className="text-sm text-gray-600">You've earned 100 ScrollGolds</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              You're now ready to begin your kingdom-focused education journey. 
              Explore courses, connect with the community, and grow in your calling!
            </p>
            <Button className="w-full" onClick={() => window.location.href = '/courses'}>
              Browse Courses
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnboardingChecklist;
