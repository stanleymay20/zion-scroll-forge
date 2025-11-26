import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  MessageCircle, 
  Award, 
  Sparkles,
  Video,
  Heart,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist';

interface WelcomeDashboardProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const WelcomeDashboard: React.FC<WelcomeDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false);

  const handleStepClick = (stepId: string) => {
    setCurrentStep(stepId);

    // Navigate to appropriate page based on step
    const stepRoutes: Record<string, string> = {
      'welcome': '/onboarding/welcome',
      'profile_setup': '/profile/edit',
      'spiritual_assessment': '/spiritual-formation/assessment',
      'platform_tour': '/onboarding/tour',
      'course_selection': '/courses',
      'advisor_introduction': '/advisor',
      'community_introduction': '/community',
      'scrollcoin_tutorial': '/scrollcoin/tutorial',
      'spiritual_formation_setup': '/spiritual-formation/setup',
      'completion': '/dashboard'
    };

    const route = stepRoutes[stepId];
    if (route) {
      navigate(route);
    }
  };

  const handleOnboardingComplete = () => {
    // Show celebration and redirect to main dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const quickActions = [
    {
      icon: BookOpen,
      title: 'Browse Courses',
      description: 'Explore our comprehensive course catalog',
      action: () => navigate('/courses'),
      color: 'blue'
    },
    {
      icon: Users,
      title: 'Join Community',
      description: 'Connect with fellow students',
      action: () => navigate('/community'),
      color: 'green'
    },
    {
      icon: MessageCircle,
      title: 'AI Tutor',
      description: 'Get personalized learning assistance',
      action: () => navigate('/ai-tutor'),
      color: 'purple'
    },
    {
      icon: Heart,
      title: 'Spiritual Formation',
      description: 'Begin your spiritual growth journey',
      action: () => navigate('/spiritual-formation'),
      color: 'pink'
    }
  ];

  const platformFeatures = [
    {
      icon: Video,
      title: 'Video Lectures',
      description: 'High-quality recorded content with AI avatars'
    },
    {
      icon: Award,
      title: 'ScrollCoin Rewards',
      description: 'Earn rewards for your achievements'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey'
    },
    {
      icon: Users,
      title: 'Study Groups',
      description: 'Collaborate with peers'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome, {user.firstName}!
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            We're thrilled to have you join ScrollUniversity. Let's get you started on your 
            kingdom-focused education journey.
          </p>
        </div>

        {/* Welcome Alert */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>New to ScrollUniversity?</strong> Complete the onboarding checklist below 
            to unlock all features and earn 100 ScrollCoins!
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Onboarding Checklist */}
          <div className="lg:col-span-2">
            <OnboardingChecklist 
              onStepClick={handleStepClick}
              onComplete={handleOnboardingComplete}
            />

            {/* Platform Features */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>What You'll Experience</CardTitle>
                <CardDescription>
                  Discover the powerful features that make ScrollUniversity unique
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platformFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <feature.icon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Jump right in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    onClick={action.action}
                  >
                    <action.icon className={`h-5 w-5 mr-3 text-${action.color}-600`} />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Getting Started Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Getting Started</CardTitle>
                <CardDescription>Helpful resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => window.open('/resources/student-handbook', '_blank')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Student Handbook
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => window.open('/resources/tutorials', '_blank')}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video Tutorials
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/help')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Help Center
                </Button>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Our support team is here to help you succeed.
                </p>
                <Button 
                  className="w-full" 
                  variant="default"
                  onClick={() => navigate('/support')}
                >
                  Contact Support
                </Button>
                <p className="text-xs text-gray-600 mt-3 text-center">
                  support@scrolluniversity.com
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <Card className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to Begin?</h2>
            <p className="text-blue-100 mb-6">
              Start with our welcome video to learn about ScrollUniversity's mission and vision
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setShowWelcomeVideo(true)}
            >
              <Video className="h-5 w-5 mr-2" />
              Watch Welcome Video
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WelcomeDashboard;
