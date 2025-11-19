/**
 * AI Features Hub Component
 * "The Spirit of truth will guide you into all truth" - John 16:13
 * 
 * Central hub for accessing all AI-powered features
 */

import React, { useState } from 'react';
import {
  Bot,
  BookOpen,
  Brain,
  Search,
  Star,
  FileText,
  Award,
  Settings,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { AIChatInterface } from './AIChatInterface';
import { AIGradingFeedback } from './AIGradingFeedback';
import { AIContentCreator } from './AIContentCreator';
import { AIPersonalizedLearning } from './AIPersonalizedLearning';
import { AIResearchAssistant } from './AIResearchAssistant';
import { AICourseRecommendations } from './AICourseRecommendations';
import { AIAdminDashboard } from './AIAdminDashboard';

type FeatureType =
  | 'chat'
  | 'grading'
  | 'content'
  | 'learning'
  | 'research'
  | 'courses'
  | 'admin'
  | 'home';

interface Feature {
  id: FeatureType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  roles: ('student' | 'faculty' | 'admin')[];
}

const features: Feature[] = [
  {
    id: 'chat',
    title: 'AI Support Assistant',
    description: '24/7 instant answers to your questions about courses, policies, and more',
    icon: <MessageSquare className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    roles: ['student', 'faculty', 'admin']
  },
  {
    id: 'learning',
    title: 'Personalized Learning',
    description: 'Get AI-powered insights and recommendations tailored to your learning style',
    icon: <Brain className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    roles: ['student']
  },
  {
    id: 'courses',
    title: 'Course Recommendations',
    description: 'Smart course selection and degree planning aligned with your goals',
    icon: <Star className="w-6 h-6" />,
    color: 'from-yellow-500 to-yellow-600',
    roles: ['student']
  },
  {
    id: 'research',
    title: 'Research Assistant',
    description: 'Accelerate your research with AI-powered literature review and citations',
    icon: <Search className="w-6 h-6" />,
    color: 'from-green-500 to-green-600',
    roles: ['student', 'faculty']
  },
  {
    id: 'grading',
    title: 'AI Grading Feedback',
    description: 'View detailed AI-generated feedback on your assignments',
    icon: <Award className="w-6 h-6" />,
    color: 'from-red-500 to-red-600',
    roles: ['student']
  },
  {
    id: 'content',
    title: 'Content Creator',
    description: 'Generate world-class course content with AI assistance',
    icon: <FileText className="w-6 h-6" />,
    color: 'from-indigo-500 to-indigo-600',
    roles: ['faculty']
  },
  {
    id: 'admin',
    title: 'Admin Dashboard',
    description: 'Monitor and manage all AI services and performance metrics',
    icon: <Settings className="w-6 h-6" />,
    color: 'from-gray-500 to-gray-600',
    roles: ['admin']
  }
];

interface AIFeaturesHubProps {
  userRole?: 'student' | 'faculty' | 'admin';
  initialFeature?: FeatureType;
}

export const AIFeaturesHub: React.FC<AIFeaturesHubProps> = ({
  userRole = 'student',
  initialFeature = 'home'
}) => {
  const [activeFeature, setActiveFeature] = useState<FeatureType>(initialFeature);

  const availableFeatures = features.filter(f => f.roles.includes(userRole));

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'chat':
        return <AIChatInterface />;
      case 'grading':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 mb-4">
              Select an assignment to view AI grading feedback
            </p>
            {/* This would typically show a list of graded assignments */}
          </div>
        );
      case 'content':
        return <AIContentCreator />;
      case 'learning':
        return <AIPersonalizedLearning />;
      case 'research':
        return <AIResearchAssistant />;
      case 'courses':
        return <AICourseRecommendations />;
      case 'admin':
        return <AIAdminDashboard />;
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
              <div className="flex items-center gap-4 mb-4">
                <Bot className="w-12 h-12" />
                <div>
                  <h1 className="text-4xl font-bold">AI-Powered Learning</h1>
                  <p className="text-lg opacity-90 mt-2">
                    Enhance your education with cutting-edge AI technology
                  </p>
                </div>
              </div>
              <p className="text-sm opacity-80 italic">
                "The Spirit of truth will guide you into all truth" - John 16:13
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableFeatures.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className="text-left bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-gray-900">AI Accuracy</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">95%</p>
                <p className="text-sm text-gray-600 mt-1">
                  Average confidence across all services
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">24/7 Support</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">&lt;2s</p>
                <p className="text-sm text-gray-600 mt-1">
                  Average response time for AI assistant
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-6 h-6 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">World-Class</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600">100%</p>
                <p className="text-sm text-gray-600 mt-1">
                  Commitment to academic excellence
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">How AI Enhances Your Learning</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">For Students</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Get instant answers to questions 24/7</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Receive personalized learning recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Access detailed feedback on assignments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Accelerate research with AI assistance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Optimize your course selection and degree plan</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">For Faculty</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Generate world-class course content efficiently</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Automate grading with detailed feedback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Answer student questions automatically</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Focus on mentoring and complex evaluations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Maintain world-class academic standards</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Spiritual Integration */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold mb-2 text-purple-900">
                AI with Kingdom Purpose
              </h3>
              <p className="text-purple-800 italic mb-3">
                "Whatever you do, work at it with all your heart, as working for the Lord" - Colossians 3:23
              </p>
              <p className="text-purple-700">
                Our AI systems are designed to enhance education while maintaining spiritual alignment and biblical values. Every feature is built to serve God's kingdom and advance His purposes through education.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      {activeFeature !== 'home' && (
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4 overflow-x-auto">
              <button
                onClick={() => setActiveFeature('home')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                <Bot className="w-5 h-5" />
                <span className="font-medium">AI Hub</span>
              </button>
              <span className="text-gray-400">/</span>
              {availableFeatures.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    activeFeature === feature.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {feature.icon}
                  <span className="font-medium">{feature.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {renderFeatureContent()}
      </div>
    </div>
  );
};
