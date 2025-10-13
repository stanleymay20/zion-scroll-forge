import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Users, 
  BookOpen, 
  Globe, 
  TrendingUp, 
  Heart, 
  Award,
  Calendar,
  Target,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { LaunchCoursesService, LaunchCourse } from '../../services/LaunchCoursesService';
import { MarketingOutreachService, MarketingCampaign, MarketingReport } from '../../services/MarketingOutreachService';

interface LaunchMetrics {
  totalEnrollments: number;
  coursesLaunched: number;
  globalReach: number;
  partnershipsActive: number;
  scrollCoinsAwarded: number;
  nationsImpacted: number;
}

interface LaunchStatus {
  landingPage: 'completed' | 'in_progress' | 'pending';
  courses: 'completed' | 'in_progress' | 'pending';
  onboarding: 'completed' | 'in_progress' | 'pending';
  marketing: 'completed' | 'in_progress' | 'pending';
}

export const LaunchDashboard: React.FC = () => {
  const [launchCourses, setLaunchCourses] = useState<LaunchCourse[]>([]);
  const [marketingCampaigns, setMarketingCampaigns] = useState<MarketingCampaign[]>([]);
  const [marketingReport, setMarketingReport] = useState<MarketingReport | null>(null);
  const [launchMetrics, setLaunchMetrics] = useState<LaunchMetrics>({
    totalEnrollments: 0,
    coursesLaunched: 3,
    globalReach: 0,
    partnershipsActive: 0,
    scrollCoinsAwarded: 0,
    nationsImpacted: 0
  });
  const [launchStatus, setLaunchStatus] = useState<LaunchStatus>({
    landingPage: 'completed',
    courses: 'completed',
    onboarding: 'completed',
    marketing: 'in_progress'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeLaunchData();
  }, []);

  const initializeLaunchData = async () => {
    try {
      const coursesService = LaunchCoursesService.getInstance();
      const marketingService = MarketingOutreachService.getInstance();

      const courses = coursesService.getLaunchCourses();
      const campaigns = marketingService.getCampaigns();
      const report = await marketingService.generateMarketingReport();

      setLaunchCourses(courses);
      setMarketingCampaigns(campaigns);
      setMarketingReport(report);

      // Update metrics based on real data
      setLaunchMetrics(prev => ({
        ...prev,
        globalReach: report.summary.totalReach,
        partnershipsActive: report.partnerships.totalPartnerships,
        totalEnrollments: report.summary.totalConversions,
        nationsImpacted: report.kingdomImpact.nationsImpacted
      }));

      setLoading(false);
    } catch (error) {
      console.error('Error initializing launch data:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'in_progress':
        return 'text-yellow-400';
      case 'pending':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          <p className="text-white mt-4">Loading Launch Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Rocket className="w-12 h-12 text-yellow-400 mr-4" />
            <h1 className="text-4xl font-bold text-white">ScrollUniversity Launch Dashboard</h1>
          </div>
          <p className="text-xl text-gray-300">
            Monitoring the global launch of education that transforms nations
          </p>
        </div>

        {/* Launch Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">Landing Page</h3>
              {getStatusIcon(launchStatus.landingPage)}
            </div>
            <p className={`text-sm ${getStatusColor(launchStatus.landingPage)}`}>
              {launchStatus.landingPage === 'completed' ? 'Live at scrolluniversity.org' : 'In Development'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">Launch Courses</h3>
              {getStatusIcon(launchStatus.courses)}
            </div>
            <p className={`text-sm ${getStatusColor(launchStatus.courses)}`}>
              {launchCourses.length} courses ready
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">Onboarding Flow</h3>
              {getStatusIcon(launchStatus.onboarding)}
            </div>
            <p className={`text-sm ${getStatusColor(launchStatus.onboarding)}`}>
              {launchStatus.onboarding === 'completed' ? 'Student flow active' : 'In Development'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">Marketing Campaign</h3>
              {getStatusIcon(launchStatus.marketing)}
            </div>
            <p className={`text-sm ${getStatusColor(launchStatus.marketing)}`}>
              {marketingCampaigns.filter(c => c.status === 'active').length} active campaigns
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center mb-2">
              <Users className="w-8 h-8 text-blue-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{launchMetrics.totalEnrollments.toLocaleString()}</p>
                <p className="text-sm text-gray-300">Total Enrollments</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center mb-2">
              <BookOpen className="w-8 h-8 text-green-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{launchMetrics.coursesLaunched}</p>
                <p className="text-sm text-gray-300">Courses Launched</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center mb-2">
              <Globe className="w-8 h-8 text-purple-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{(launchMetrics.globalReach / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-gray-300">Global Reach</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-xl p-6 border border-yellow-500/30">
            <div className="flex items-center mb-2">
              <Target className="w-8 h-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{launchMetrics.partnershipsActive}</p>
                <p className="text-sm text-gray-300">Active Partnerships</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 rounded-xl p-6 border border-orange-500/30">
            <div className="flex items-center mb-2">
              <Zap className="w-8 h-8 text-orange-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{launchMetrics.scrollCoinsAwarded.toLocaleString()}</p>
                <p className="text-sm text-gray-300">ScrollCoins Awarded</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-900/50 to-pink-900/50 rounded-xl p-6 border border-red-500/30">
            <div className="flex items-center mb-2">
              <Heart className="w-8 h-8 text-red-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{launchMetrics.nationsImpacted}</p>
                <p className="text-sm text-gray-300">Nations Impacted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Launch Courses Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Launch Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {launchCourses.map((course) => (
              <div key={course.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{course.title}</h3>
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-sm font-semibold">
                    {course.scrollCoins} ScrollCoins
                  </span>
                </div>
                <p className="text-gray-300 mb-4">{course.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                  <span>Level: {course.level}</span>
                  <span>Duration: {course.duration}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Modules:</span>
                    <span className="text-white">{course.modules.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">XR Experiences:</span>
                    <span className="text-white">{course.xrExperiences.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Assessments:</span>
                    <span className="text-white">{course.assessments.length}</span>
                  </div>
                </div>
                <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300">
                  View Course Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Marketing Campaign Status */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Marketing Campaigns</h2>
          <div className="space-y-4">
            {marketingCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
                    <p className="text-gray-300">{campaign.content.messaging.primaryMessage}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    campaign.status === 'active' ? 'bg-green-500 text-white' :
                    campaign.status === 'planning' ? 'bg-yellow-500 text-black' :
                    'bg-gray-500 text-white'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{(campaign.metrics.reach / 1000).toFixed(0)}K</p>
                    <p className="text-sm text-gray-300">Reach</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{campaign.metrics.engagement.toLocaleString()}</p>
                    <p className="text-sm text-gray-300">Engagement</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{campaign.metrics.conversions.toLocaleString()}</p>
                    <p className="text-sm text-gray-300">Conversions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">${campaign.budget.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-300">Budget</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-4 text-sm text-gray-300">
                    <span>Channels: {campaign.channels.length}</span>
                    <span>Languages: {campaign.content.localization.languages.length}</span>
                    <span>Timeline: {campaign.timeline.phases.length} phases</span>
                  </div>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kingdom Impact Metrics */}
        {marketingReport && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Kingdom Impact Report</h2>
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {marketingReport.kingdomImpact.totalSoulsReached.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-300">Souls Reached</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {marketingReport.kingdomImpact.totalLivesTransformed.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-300">Lives Transformed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {marketingReport.kingdomImpact.totalLeadersEquipped.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-300">Leaders Equipped</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {marketingReport.kingdomImpact.nationsImpacted}
                  </div>
                  <div className="text-sm text-gray-300">Nations Impacted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {marketingReport.kingdomImpact.propheticConfirmations}
                  </div>
                  <div className="text-sm text-gray-300">Prophetic Confirmations</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Items */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Launch Action Items</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-white">ScrollUniversity landing page deployed and live</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-white">Three launch courses fully implemented and ready</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-white">Student onboarding flow completed and tested</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-white">Global marketing campaign in active phase</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-white">Partnership network expansion ongoing</span>
            </div>
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              <span className="text-white">Monitor first cohort enrollment and engagement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};