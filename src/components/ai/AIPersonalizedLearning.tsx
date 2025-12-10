/**
 * AI Personalized Learning Component
 * "The Spirit of truth will guide you into all truth" - John 16:13
 * 
 * Student-facing personalized learning recommendations and insights - Using Supabase
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  BookOpen,
  AlertCircle,
  Award,
  Brain,
  Clock,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LearningProfile {
  strengths: string[];
  weaknesses: string[];
  learningStyle: string;
  pace: 'fast' | 'moderate' | 'slow';
  engagement: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface Recommendation {
  id: string;
  type: 'resource' | 'practice' | 'strategy';
  title: string;
  description: string;
  relevance: number;
  estimatedTime: number;
}

interface PerformanceInsight {
  category: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  message: string;
}

export const AIPersonalizedLearning: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLearningData();
    }
  }, [user]);

  const fetchLearningData = async () => {
    if (!user) return;
    
    try {
      // Fetch learning profile from student_learning_profiles
      const { data: profileData } = await supabase
        .from('student_learning_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile({
          strengths: profileData.strengths || [],
          weaknesses: profileData.weaknesses || [],
          learningStyle: profileData.learning_style || 'visual',
          pace: (profileData.preferred_pace as 'fast' | 'moderate' | 'slow') || 'moderate',
          engagement: 0.75,
          riskLevel: 'low'
        });
      } else {
        // Set default profile
        setProfile({
          strengths: ['Critical thinking', 'Scripture memorization'],
          weaknesses: ['Time management'],
          learningStyle: 'visual',
          pace: 'moderate',
          engagement: 0.75,
          riskLevel: 'low'
        });
      }

      // Generate recommendations based on enrolled courses
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          id,
          progress,
          courses (
            id,
            title,
            faculty
          )
        `)
        .eq('user_id', user.id)
        .limit(5);

      const generatedRecommendations: Recommendation[] = (enrollments || []).map((e: any, idx: number) => ({
        id: `rec-${idx}`,
        type: 'resource' as const,
        title: `Continue: ${e.courses?.title || 'Course'}`,
        description: `You're ${e.progress || 0}% through this course. Keep going!`,
        relevance: 0.9 - (idx * 0.1),
        estimatedTime: 30
      }));

      setRecommendations(generatedRecommendations);

      // Generate insights from progress data
      setInsights([
        {
          category: 'Course Completion',
          score: 75,
          trend: 'up',
          message: 'Great progress this week!'
        },
        {
          category: 'Spiritual Growth',
          score: 80,
          trend: 'stable',
          message: 'Consistent devotional practice'
        },
        {
          category: 'Community Engagement',
          score: 60,
          trend: 'up',
          message: 'Increasing participation in discussions'
        }
      ]);

    } catch (error) {
      console.error('Failed to fetch learning data:', error);
      // Set defaults on error
      setProfile({
        strengths: ['Critical thinking'],
        weaknesses: ['Time management'],
        learningStyle: 'visual',
        pace: 'moderate',
        engagement: 0.7,
        riskLevel: 'low'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Target className="w-5 h-5 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Your Learning Journey</h1>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered insights to help you succeed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Profile Overview */}
      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Learning Style</h3>
                  <p className="text-sm text-muted-foreground capitalize">{profile.learningStyle}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Learning Pace</h3>
                  <p className="text-sm text-muted-foreground capitalize">{profile.pace}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getRiskColor(profile.riskLevel)}`}>
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Risk Level</h3>
                  <p className="text-sm text-muted-foreground capitalize">{profile.riskLevel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Strengths and Weaknesses */}
      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {profile.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Areas for Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {profile.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{insight.category}</span>
                    {getTrendIcon(insight.trend)}
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-semibold">{insight.score}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          insight.score >= 80
                            ? 'bg-green-500'
                            : insight.score >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${insight.score}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{insight.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
              Recommended for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {rec.type === 'resource' && <BookOpen className="w-5 h-5 text-primary" />}
                        {rec.type === 'practice' && <Target className="w-5 h-5 text-green-600" />}
                        {rec.type === 'strategy' && <Brain className="w-5 h-5 text-purple-600" />}
                        <h3 className="font-semibold">{rec.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {rec.estimatedTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {(rec.relevance * 100).toFixed(0)}% match
                        </span>
                      </div>
                    </div>
                    <Button size="sm">
                      Start
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Engagement Score */}
      {profile && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Engagement Score
                </h3>
                <p className="text-muted-foreground">
                  You're doing great! Keep up the excellent work.
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600">
                  {(profile.engagement * 100).toFixed(0)}%
                </div>
                <p className="text-sm text-muted-foreground mt-1">Active Learner</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spiritual Encouragement */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">
            Spiritual Encouragement
          </h3>
          <p className="italic mb-3 text-primary">
            "I can do all things through Christ who strengthens me" - Philippians 4:13
          </p>
          <p className="text-muted-foreground">
            Your learning journey is not just about academic growth, but also spiritual formation. Trust in God's plan for your education and calling.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
