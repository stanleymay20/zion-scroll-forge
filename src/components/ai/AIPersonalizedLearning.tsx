/**
 * AI Personalized Learning Component
 * "The Spirit of truth will guide you into all truth" - John 16:13
 * 
 * Student-facing personalized learning recommendations and insights
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
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    try {
      const [profileRes, recommendationsRes, insightsRes] = await Promise.all([
        fetch('/api/ai-unified/personalization/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('/api/ai-unified/personalization/recommendations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('/api/ai-unified/personalization/insights', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      const profileData = await profileRes.json();
      const recommendationsData = await recommendationsRes.json();
      const insightsData = await insightsRes.json();

      if (profileData.success) {
        setProfile(profileData.data);
      }

      if (recommendationsData.success) {
        setRecommendations(recommendationsData.data.recommendations);
      }

      if (insightsData.success) {
        setInsights(insightsData.data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch learning data:', error);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Your Learning Journey</h1>
            <p className="text-sm opacity-90 mt-1">
              AI-powered insights to help you succeed
            </p>
          </div>
        </div>
      </div>

      {/* Learning Profile Overview */}
      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Learning Style</h3>
                <p className="text-sm text-gray-600 capitalize">{profile.learningStyle}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Learning Pace</h3>
                <p className="text-sm text-gray-600 capitalize">{profile.pace}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getRiskColor(profile.riskLevel)}`}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Risk Level</h3>
                <p className="text-sm text-gray-600 capitalize">{profile.riskLevel}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strengths and Weaknesses */}
      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Your Strengths
            </h3>
            <ul className="space-y-2">
              {profile.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Areas for Growth
            </h3>
            <ul className="space-y-2">
              {profile.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Performance Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, idx) => (
              <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{insight.category}</span>
                  {getTrendIcon(insight.trend)}
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Score</span>
                    <span className="font-semibold">{insight.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
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
                <p className="text-xs text-gray-600">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            Recommended for You
          </h2>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {rec.type === 'resource' && <BookOpen className="w-5 h-5 text-blue-600" />}
                      {rec.type === 'practice' && <Target className="w-5 h-5 text-green-600" />}
                      {rec.type === 'strategy' && <Brain className="w-5 h-5 text-purple-600" />}
                      <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
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
                  <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Score */}
      {profile && (
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Engagement Score
              </h3>
              <p className="text-green-800">
                You're doing great! Keep up the excellent work.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600">
                {(profile.engagement * 100).toFixed(0)}%
              </div>
              <p className="text-sm text-green-700 mt-1">Active Learner</p>
            </div>
          </div>
        </div>
      )}

      {/* Spiritual Encouragement */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 border border-purple-200">
        <h3 className="text-lg font-semibold mb-2 text-purple-900">
          Spiritual Encouragement
        </h3>
        <p className="text-purple-800 italic mb-3">
          "I can do all things through Christ who strengthens me" - Philippians 4:13
        </p>
        <p className="text-purple-700">
          Your learning journey is not just about academic growth, but also spiritual formation. Trust in God's plan for your education and calling.
        </p>
      </div>
    </div>
  );
};
