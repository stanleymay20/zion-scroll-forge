import React, { useState } from 'react';
import { TrendAnalysis, TimeSeries, CareerPathwayTrend, GeographicTrend } from '../../types/analytics';

interface TrendsPanelProps {
  trends: TrendAnalysis;
  compact?: boolean;
}

const TrendsPanel: React.FC<TrendsPanelProps> = ({ trends, compact = false }) => {
  const [selectedTrend, setSelectedTrend] = useState<'enrollment' | 'completion' | 'spiritual' | 'career' | 'geographic'>('enrollment');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0) return { percentage: 0, direction: 'neutral' as const };
    const percentage = ((current - previous) / previous) * 100;
    const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';
    return { percentage: Math.abs(percentage), direction };
  };

  const renderSimpleChart = (data: TimeSeries[], color: string = 'blue') => {
    if (data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    return (
      <div className="flex items-end space-x-1 h-16">
        {data.slice(-12).map((point, index) => {
          const height = ((point.value - minValue) / range) * 100;
          return (
            <div
              key={index}
              className={`bg-${color}-500 rounded-t flex-1 min-h-1`}
              style={{ height: `${Math.max(height, 5)}%` }}
              title={`${point.label || new Date(point.date).toLocaleDateString()}: ${formatNumber(point.value)}`}
            />
          );
        })}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Enrollment Trend</h4>
            {renderSimpleChart(trends.enrollmentTrends, 'blue')}
            <div className="mt-2 text-xs text-gray-600">
              Last 12 periods
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Completion Trend</h4>
            {renderSimpleChart(trends.completionTrends, 'green')}
            <div className="mt-2 text-xs text-gray-600">
              Last 12 periods
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Top Career Pathways</h4>
          <div className="space-y-2">
            {trends.careerPathwayTrends.slice(0, 3).map((pathway) => (
              <div key={pathway.pathway} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{pathway.pathway}</span>
                <span className="text-sm font-medium text-blue-600">
                  {formatNumber(pathway.enrollmentCount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trend Navigation */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex space-x-1">
          {[
            { id: 'enrollment', label: 'Enrollment', icon: '📈' },
            { id: 'completion', label: 'Completion', icon: '✅' },
            { id: 'spiritual', label: 'Spiritual Growth', icon: '✨' },
            { id: 'career', label: 'Career Pathways', icon: '🛤️' },
            { id: 'geographic', label: 'Geographic', icon: '🌍' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTrend(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                selectedTrend === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Enrollment Trends */}
      {selectedTrend === 'enrollment' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Enrollment Trends</h3>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Monthly Enrollment</h4>
                {trends.enrollmentTrends.length >= 2 && (
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const latest = trends.enrollmentTrends[trends.enrollmentTrends.length - 1];
                      const previous = trends.enrollmentTrends[trends.enrollmentTrends.length - 2];
                      const growth = getGrowthIndicator(latest.value, previous.value);
                      return (
                        <span className={`text-sm font-medium ${
                          growth.direction === 'up' ? 'text-green-600' : 
                          growth.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {growth.direction === 'up' ? '↗' : growth.direction === 'down' ? '↘' : '→'} 
                          {growth.percentage.toFixed(1)}%
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div className="h-64 bg-gray-50 rounded-lg flex items-end p-4">
                {renderSimpleChart(trends.enrollmentTrends, 'blue')}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {trends.enrollmentTrends.length > 0 ? formatNumber(trends.enrollmentTrends[trends.enrollmentTrends.length - 1].value) : '0'}
                </div>
                <div className="text-sm text-gray-600">Current Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(trends.enrollmentTrends.reduce((sum, t) => sum + t.value, 0))}
                </div>
                <div className="text-sm text-gray-600">Total Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {trends.enrollmentTrends.length > 0 ? 
                    formatNumber(trends.enrollmentTrends.reduce((sum, t) => sum + t.value, 0) / trends.enrollmentTrends.length) : '0'}
                </div>
                <div className="text-sm text-gray-600">Monthly Average</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Trends */}
      {selectedTrend === 'completion' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Completion Trends</h3>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <div className="h-64 bg-gray-50 rounded-lg flex items-end p-4">
                {renderSimpleChart(trends.completionTrends, 'green')}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {trends.completionTrends.length > 0 ? 
                    `${(trends.completionTrends[trends.completionTrends.length - 1].value * 100).toFixed(1)}%` : '0%'}
                </div>
                <div className="text-sm text-gray-600">Current Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {trends.completionTrends.length > 0 ? 
                    `${(trends.completionTrends.reduce((sum, t) => sum + t.value, 0) / trends.completionTrends.length * 100).toFixed(1)}%` : '0%'}
                </div>
                <div className="text-sm text-gray-600">Average Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {trends.completionTrends.length > 0 ? 
                    `${(Math.max(...trends.completionTrends.map(t => t.value)) * 100).toFixed(1)}%` : '0%'}
                </div>
                <div className="text-sm text-gray-600">Peak Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spiritual Growth Trends */}
      {selectedTrend === 'spiritual' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Spiritual Growth Trends</h3>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <div className="h-64 bg-gray-50 rounded-lg flex items-end p-4">
                {renderSimpleChart(trends.spiritualGrowthTrends, 'purple')}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {trends.spiritualGrowthTrends.length > 0 ? 
                    `${(trends.spiritualGrowthTrends[trends.spiritualGrowthTrends.length - 1].value * 100).toFixed(1)}%` : '0%'}
                </div>
                <div className="text-sm text-gray-600">Current Growth</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {trends.spiritualGrowthTrends.length > 0 ? 
                    `${(trends.spiritualGrowthTrends.reduce((sum, t) => sum + t.value, 0) / trends.spiritualGrowthTrends.length * 100).toFixed(1)}%` : '0%'}
                </div>
                <div className="text-sm text-gray-600">Average Growth</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {trends.spiritualGrowthTrends.length > 1 ? 
                    (() => {
                      const latest = trends.spiritualGrowthTrends[trends.spiritualGrowthTrends.length - 1];
                      const previous = trends.spiritualGrowthTrends[trends.spiritualGrowthTrends.length - 2];
                      const growth = getGrowthIndicator(latest.value, previous.value);
                      return `${growth.direction === 'up' ? '+' : growth.direction === 'down' ? '-' : ''}${growth.percentage.toFixed(1)}%`;
                    })() : '0%'}
                </div>
                <div className="text-sm text-gray-600">Month-over-Month</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Career Pathway Trends */}
      {selectedTrend === 'career' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Career Pathway Trends</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pathway
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employment Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impact Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trends.careerPathwayTrends.map((pathway) => (
                  <tr key={pathway.pathway} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{pathway.pathway}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatNumber(pathway.enrollmentCount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{pathway.completionRate.toFixed(1)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{pathway.employmentRate.toFixed(1)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{pathway.impactScore.toFixed(1)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${Math.min(pathway.impactScore * 10, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-green-600">↗</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Geographic Trends */}
      {selectedTrend === 'geographic' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Geographic Expansion Trends</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region/Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accessibility Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trends.globalExpansionTrends.map((location) => (
                  <tr key={`${location.region}-${location.country}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{location.country}</div>
                      <div className="text-sm text-gray-500">{location.region}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatNumber(location.studentCount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        location.growthRate > 0 ? 'text-green-600' : 
                        location.growthRate < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {location.growthRate > 0 ? '+' : ''}{location.growthRate.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${location.accessibilityScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{location.accessibilityScore.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${
                        location.growthRate > 0 ? 'text-green-600' : 
                        location.growthRate < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {location.growthRate > 0 ? '↗' : location.growthRate < 0 ? '↘' : '→'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendsPanel;