import React, { useState } from 'react';
import { GlobalImpactMetrics, CareerTrack } from '../../types/analytics';

interface GlobalImpactPanelProps {
  globalImpact: GlobalImpactMetrics;
  onExport: (format: 'csv' | 'xlsx') => void;
}

const GlobalImpactPanel: React.FC<GlobalImpactPanelProps> = ({ 
  globalImpact, 
  onExport 
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'geographic' | 'pathways' | 'economy' | 'kingdom'>('overview');

  const careerPathwayColors: Record<CareerTrack, string> = {
    ScrollFounder: 'bg-blue-500',
    ScrollAmbassador: 'bg-green-500',
    ScrollPriest: 'bg-purple-500',
    ScrollScribe: 'bg-indigo-500',
    ScrollEngineer: 'bg-yellow-500',
    ScrollScholar: 'bg-pink-500',
    ScrollBuilder: 'bg-teal-500'
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTopCountries = () => {
    return Object.entries(globalImpact.globalReach)
      .sort(([, a], [, b]) => b.studentCount - a.studentCount)
      .slice(0, 10);
  };

  const getCareerPathwayData = () => {
    return Object.entries(globalImpact.careerPathwayDistribution)
      .map(([pathway, data]) => ({
        pathway: pathway as CareerTrack,
        ...data,
        completionRate: data.enrolled > 0 ? (data.completed / data.enrolled) * 100 : 0,
        employmentRate: data.completed > 0 ? (data.employed / data.completed) * 100 : 0
      }))
      .sort((a, b) => b.enrolled - a.enrolled);
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'geographic', label: 'Geographic', icon: '🌍' },
              { id: 'pathways', label: 'Career Pathways', icon: '🛤️' },
              { id: 'economy', label: 'ScrollCoin Economy', icon: '🪙' },
              { id: 'kingdom', label: 'Kingdom Impact', icon: '👑' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                  selectedView === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onExport('csv')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Export CSV
            </button>
            <button
              onClick={() => onExport('xlsx')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Overview */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-lg p-3 mr-4">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(globalImpact.totalStudents)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-green-500 rounded-lg p-3 mr-4">
                <span className="text-2xl">🌍</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Countries Served</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(globalImpact.globalReach).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-purple-500 rounded-lg p-3 mr-4">
                <span className="text-2xl">🤝</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Partners</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalImpact.partnershipMetrics.activePartners}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-yellow-500 rounded-lg p-3 mr-4">
                <span className="text-2xl">🪙</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">ScrollCoin Circulation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(globalImpact.scrollCoinEconomy.totalCirculation)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Geographic Distribution */}
      {selectedView === 'geographic' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Countries by Student Count</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Market Share
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getTopCountries().map(([country, data]) => {
                    const marketShare = (data.studentCount / globalImpact.totalStudents) * 100;
                    return (
                      <tr key={country} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{country}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatNumber(data.studentCount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatNumber(data.activeUsers)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{(data.completionRate * 100).toFixed(1)}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${marketShare}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{marketShare.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Accessibility Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Offline Access</h4>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatNumber(globalImpact.accessibilityMetrics.offlineUsers)}
              </div>
              <p className="text-sm text-gray-600">Students using offline mode</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Mesh Network</h4>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {globalImpact.accessibilityMetrics.meshNetworkNodes}
              </div>
              <p className="text-sm text-gray-600">Active mesh network nodes</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Solar Power</h4>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {globalImpact.accessibilityMetrics.solarMicrohubsConnected}
              </div>
              <p className="text-sm text-gray-600">Solar microhubs connected</p>
            </div>
          </div>
        </div>
      )}

      {/* Career Pathways */}
      {selectedView === 'pathways' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Career Pathway Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Career Pathway
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrolled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impact Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCareerPathwayData().map((pathway) => (
                  <tr key={pathway.pathway} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full ${careerPathwayColors[pathway.pathway]} mr-3`}></div>
                        <div className="text-sm font-medium text-gray-900">{pathway.pathway}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatNumber(pathway.enrolled)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatNumber(pathway.completed)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatNumber(pathway.employed)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{pathway.impactScore.toFixed(1)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${pathway.employmentRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{pathway.employmentRate.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ScrollCoin Economy */}
      {selectedView === 'economy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Total Circulation</h4>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {formatNumber(globalImpact.scrollCoinEconomy.totalCirculation)}
              </div>
              <p className="text-sm text-gray-600">ScrollCoins in circulation</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Daily Transactions</h4>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatNumber(globalImpact.scrollCoinEconomy.dailyTransactions)}
              </div>
              <p className="text-sm text-gray-600">Transactions per day</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Economic Health</h4>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {(globalImpact.scrollCoinEconomy.economicHealth * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Overall health score</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Reward Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Course Completion</span>
                  <span className="text-sm font-medium">{globalImpact.scrollCoinEconomy.rewardDistribution.courseCompletion}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Peer Assistance</span>
                  <span className="text-sm font-medium">{globalImpact.scrollCoinEconomy.rewardDistribution.peerAssistance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sacred Technology</span>
                  <span className="text-sm font-medium">{globalImpact.scrollCoinEconomy.rewardDistribution.sacredTechnology}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Community Building</span>
                  <span className="text-sm font-medium">{globalImpact.scrollCoinEconomy.rewardDistribution.communityBuilding}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kingdom Impact */}
      {selectedView === 'kingdom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-purple-500 rounded-lg p-3 mr-4">
                <span className="text-2xl">⛪</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Graduates in Ministry</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(globalImpact.kingdomImpact.graduatesInMinistry)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-lg p-3 mr-4">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Businesses Launched</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(globalImpact.kingdomImpact.businessesLaunched)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-green-500 rounded-lg p-3 mr-4">
                <span className="text-2xl">🌍</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Nations Served</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalImpact.kingdomImpact.nationsServed}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-yellow-500 rounded-lg p-3 mr-4">
                <span className="text-2xl">❤️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Lives Transformed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(globalImpact.kingdomImpact.livesTransformed)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="bg-teal-500 rounded-lg p-3 mr-4">
                <span className="text-2xl">🤝</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Social Impact Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(globalImpact.kingdomImpact.socialImpactProjects)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalImpactPanel;