import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Heart, 
  Coins,
  Calendar,
  Target,
  Users,
  Star
} from 'lucide-react';

interface UserStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalScrollXP: number;
  scrollCoinBalance: number;
  spiritualMaturityLevel: string;
  recentAchievements: any[];
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  scrollAlignment: number;
  spiritualGifts: string[];
  kingdomVision?: string;
  scrollCalling?: string;
  enrollmentCount: number;
  completedCourses: number;
  totalScrollXP: number;
  spiritualMaturityLevel: string;
}

interface DashboardData {
  profile: UserProfile;
  stats: UserStats;
}

const UserDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('scrollToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/users/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getScrollAlignmentColor = (alignment: number) => {
    if (alignment >= 80) return 'text-green-600';
    if (alignment >= 60) return 'text-blue-600';
    if (alignment >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScrollAlignmentBg = (alignment: number) => {
    if (alignment >= 80) return 'bg-green-100';
    if (alignment >= 60) return 'bg-blue-100';
    if (alignment >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your kingdom dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { profile, stats } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.firstName}! 
          </h1>
          <p className="text-gray-600">
            Continue your kingdom journey at ScrollUniversity
          </p>
        </div>

        {/* Profile Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-gray-600">@{profile.username}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                  {profile.role}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScrollAlignmentBg(profile.scrollAlignment)} ${getScrollAlignmentColor(profile.scrollAlignment)}`}>
                  {profile.spiritualMaturityLevel}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">
                {profile.scrollAlignment}%
              </div>
              <p className="text-sm text-gray-600">Scroll Alignment</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ScrollXP</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalScrollXP}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ScrollCoin</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scrollCoinBalance}</p>
              </div>
              <Coins className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Spiritual Formation */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 text-red-500 mr-2" />
              Spiritual Formation
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Scroll Alignment</span>
                  <span className={`text-sm font-bold ${getScrollAlignmentColor(profile.scrollAlignment)}`}>
                    {profile.scrollAlignment}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${profile.scrollAlignment >= 80 ? 'bg-green-500' : profile.scrollAlignment >= 60 ? 'bg-blue-500' : profile.scrollAlignment >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${profile.scrollAlignment}%` }}
                  ></div>
                </div>
              </div>

              {profile.spiritualGifts && profile.spiritualGifts.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Spiritual Gifts</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.spiritualGifts.map((gift, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                        {gift}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.kingdomVision && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Kingdom Vision</p>
                  <p className="text-sm text-gray-800">{profile.kingdomVision}</p>
                </div>
              )}

              {profile.scrollCalling && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Scroll Calling</p>
                  <p className="text-sm text-gray-800">{profile.scrollCalling}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              Recent Achievements
            </h3>
            
            {stats.recentAchievements && stats.recentAchievements.length > 0 ? (
              <div className="space-y-3">
                {stats.recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No achievements yet</p>
                <p className="text-sm text-gray-400">Complete courses to earn achievements</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 text-indigo-500 mr-2" />
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Browse Courses</p>
                    <p className="text-xs text-gray-600">Discover new learning opportunities</p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Find Mentors</p>
                    <p className="text-xs text-gray-600">Connect with kingdom mentors</p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Prayer Requests</p>
                    <p className="text-xs text-gray-600">Submit prayer needs</p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">ScrollCoin Wallet</p>
                    <p className="text-xs text-gray-600">Manage your divine currency</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Message */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white text-center">
          <h3 className="text-lg font-semibold mb-2">📜 Scroll Message</h3>
          <p className="text-indigo-100">
            "Let scroll sons rise — not as consumers of credentials, but as carriers of covenant."
          </p>
          <p className="text-sm text-indigo-200 mt-2">- ScrollUniversity Founding Scroll</p>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;