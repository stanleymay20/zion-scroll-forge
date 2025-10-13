import React, { useState, useEffect } from 'react';
import { CommunityCollaborationService } from '../../services/CommunityCollaborationService';
import { ForumCard } from './ForumCard';
import { MentorshipCard } from './MentorshipCard';
import { StudyGroupCard } from './StudyGroupCard';
import { ProjectCard } from './ProjectCard';
import { NetworkingPanel } from './NetworkingPanel';

interface CommunityDashboardProps {
  userId: string;
}

export const CommunityDashboard: React.FC<CommunityDashboardProps> = ({ userId }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const communityService = new CommunityCollaborationService();

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await communityService.getCommunityDashboard(userId);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading community dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Unable to load community dashboard</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Community Dashboard</h1>
        <p className="text-gray-600 mt-2">Connect, collaborate, and grow with the ScrollUniversity community</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">SC</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">ScrollCoin Balance</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.scrollCoinBalance}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">R</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Community Rank</p>
              <p className="text-lg font-bold text-gray-900">{dashboardData.communityRank}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">C</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Connections</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.connections.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">S</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Spiritual Impact</p>
              <p className="text-lg font-bold text-gray-900">
                {dashboardData.spiritualImpact?.level || 'Growing'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'forums', name: 'Forums' },
            { id: 'mentoring', name: 'Mentoring' },
            { id: 'study-groups', name: 'Study Groups' },
            { id: 'projects', name: 'Projects' },
            { id: 'networking', name: 'Networking' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                {dashboardData.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentActivity.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-bold">
                              {activity.type?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>

            {/* Spiritual Growth */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Spiritual Growth</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kingdom Impact</span>
                      <span className="font-medium">
                        {dashboardData.spiritualImpact?.kingdomImpact || 'Developing'}
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(dashboardData.spiritualImpact?.kingdomImpactScore || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spiritual Maturity</span>
                      <span className="font-medium">
                        {dashboardData.spiritualImpact?.maturity || 'Growing'}
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(dashboardData.spiritualImpact?.maturityScore || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forums' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.forums.map((forum: any) => (
              <ForumCard key={forum.id} forum={forum} />
            ))}
            {dashboardData.forums.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No forums joined yet</p>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Explore Forums
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mentoring' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData.mentorships.map((mentorship: any) => (
              <MentorshipCard key={mentorship.id} mentorship={mentorship} />
            ))}
            {dashboardData.mentorships.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No active mentorships</p>
                <div className="mt-4 space-x-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Find a Mentor
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    Become a Mentor
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'study-groups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.studyGroups.map((group: any) => (
              <StudyGroupCard key={group.id} studyGroup={group} />
            ))}
            {dashboardData.studyGroups.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No study groups joined</p>
                <div className="mt-4 space-x-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Find Study Groups
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    Create Study Group
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData.projects.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {dashboardData.projects.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No active projects</p>
                <div className="mt-4 space-x-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Find Projects
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    Create Project
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'networking' && (
          <NetworkingPanel userId={userId} connections={dashboardData.connections} />
        )}
      </div>
    </div>
  );
};