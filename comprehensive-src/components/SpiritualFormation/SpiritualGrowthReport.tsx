import React, { useState, useEffect } from 'react';
import { SpiritualGrowthReport, SpiritualMetrics, SpiritualAchievement, SpiritualChallenge, GrowthRecommendation } from '../../types/spiritual-formation';
import { spiritualGrowthService } from '../../services/SpiritualGrowthService';

interface SpiritualGrowthReportProps {
  userId: string;
}

export const SpiritualGrowthReportComponent: React.FC<SpiritualGrowthReportProps> = ({ userId }) => {
  const [reports, setReports] = useState<SpiritualGrowthReport[]>([]);
  const [currentReport, setCurrentReport] = useState<SpiritualGrowthReport | null>(null);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'achievements' | 'challenges' | 'recommendations'>('overview');
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'quarterly' | 'annual'>('monthly');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const [userReports, growthTrends] = await Promise.all([
        spiritualGrowthService.getUserGrowthReports(userId, 5),
        spiritualGrowthService.getGrowthTrends(userId, 6)
      ]);
      
      setReports(userReports);
      setTrends(growthTrends);
      
      if (userReports.length > 0) {
        setCurrentReport(userReports[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const newReport = await spiritualGrowthService.generateSpiritualGrowthReport(userId, reportType);
      setReports([newReport, ...reports]);
      setCurrentReport(newReport);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <span className="text-green-600">↗️</span>;
      case 'decreasing':
        return <span className="text-red-600">↘️</span>;
      default:
        return <span className="text-gray-600">➡️</span>;
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'low': 'bg-yellow-100 text-yellow-800',
      'medium': 'bg-orange-100 text-orange-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-blue-100 text-blue-800',
      'high': 'bg-purple-100 text-purple-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !currentReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Spiritual Growth Report</h1>
            <p className="text-gray-600">Track your spiritual development and growth over time</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="p-2 border rounded"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Report Selection */}
        {reports.length > 0 && (
          <div className="flex space-x-2 overflow-x-auto">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setCurrentReport(report)}
                className={`px-4 py-2 rounded whitespace-nowrap ${
                  currentReport?.id === report.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {report.reportType} - {report.period.endDate.toLocaleDateString()}
              </button>
            ))}
          </div>
        )}
      </div>

      {!currentReport ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Available</h3>
          <p className="text-gray-600 mb-4">Generate your first spiritual growth report to track your progress</p>
          <button
            onClick={handleGenerateReport}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Generate First Report
          </button>
        </div>
      ) : (
        <>
          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6 overflow-x-auto">
            {(['overview', 'metrics', 'achievements', 'challenges', 'recommendations'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Report Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentReport.reportType.charAt(0).toUpperCase() + currentReport.reportType.slice(1)} Report
                    </h2>
                    <p className="text-gray-600">
                      {currentReport.period.startDate.toLocaleDateString()} - {currentReport.period.endDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getScoreColor(currentReport.metrics.overallGrowth)}`}>
                      {currentReport.metrics.overallGrowth}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Growth</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${getProgressBarColor(currentReport.metrics.overallGrowth)}`}
                    style={{ width: `${currentReport.metrics.overallGrowth}%` }}
                  ></div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Prayer Consistency', value: currentReport.metrics.prayerConsistency },
                  { label: 'Scripture Engagement', value: currentReport.metrics.scriptureEngagement },
                  { label: 'Service Participation', value: currentReport.metrics.serviceParticipation },
                  { label: 'Character Development', value: currentReport.metrics.characterDevelopment }
                ].map((metric) => (
                  <div key={metric.label} className="bg-white border rounded-lg p-4">
                    <div className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
                      {metric.value}%
                    </div>
                    <div className="text-sm text-gray-600">{metric.label}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressBarColor(metric.value)}`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Achievements</h3>
                  <div className="text-2xl font-bold text-green-600">{currentReport.achievements.length}</div>
                  <div className="text-sm text-green-800">New achievements this period</div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">Challenges</h3>
                  <div className="text-2xl font-bold text-orange-600">{currentReport.challenges.length}</div>
                  <div className="text-sm text-orange-800">Areas needing attention</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Recommendations</h3>
                  <div className="text-2xl font-bold text-blue-600">{currentReport.recommendations.length}</div>
                  <div className="text-sm text-blue-800">Growth recommendations</div>
                </div>
              </div>

              {/* Growth Trends */}
              {trends && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4">Growth Trends (Last 6 Months)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Overall Growth Trend</h4>
                      <div className="flex items-center space-x-2">
                        {trends.overallGrowth.map((score: number, index: number) => (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className={`w-4 ${getProgressBarColor(score)} rounded-t`}
                              style={{ height: `${Math.max(score / 2, 10)}px` }}
                            ></div>
                            <div className="text-xs text-gray-500 mt-1">{score}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Prayer Consistency Trend</h4>
                      <div className="flex items-center space-x-2">
                        {trends.prayerConsistency.map((score: number, index: number) => (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className={`w-4 ${getProgressBarColor(score)} rounded-t`}
                              style={{ height: `${Math.max(score / 2, 10)}px` }}
                            ></div>
                            <div className="text-xs text-gray-500 mt-1">{score}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Detailed Metrics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'prayerConsistency', label: 'Prayer Consistency', description: 'Regular prayer and intercession practice' },
                  { key: 'scriptureEngagement', label: 'Scripture Engagement', description: 'Bible study and meditation consistency' },
                  { key: 'serviceParticipation', label: 'Service Participation', description: 'Active involvement in ministry and service' },
                  { key: 'discipleshipActivity', label: 'Discipleship Activity', description: 'Mentoring and being mentored' },
                  { key: 'characterDevelopment', label: 'Character Development', description: 'Growth in Christ-like character' },
                  { key: 'propheticSensitivity', label: 'Prophetic Sensitivity', description: 'Ability to hear and discern God\'s voice' },
                  { key: 'kingdomImpact', label: 'Kingdom Impact', description: 'Influence and impact for God\'s kingdom' }
                ].map((metric) => {
                  const value = currentReport.metrics[metric.key as keyof SpiritualMetrics] as number;
                  return (
                    <div key={metric.key} className="bg-white border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{metric.label}</h3>
                          <p className="text-sm text-gray-600">{metric.description}</p>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
                          {value}%
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div 
                          className={`h-3 rounded-full ${getProgressBarColor(value)}`}
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                      
                      {/* Find corresponding trend */}
                      {currentReport.metrics.trends.find(t => t.metric.toLowerCase().includes(metric.key.toLowerCase())) && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Trend:</span>
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(currentReport.metrics.trends.find(t => t.metric.toLowerCase().includes(metric.key.toLowerCase()))?.direction || 'stable')}
                            <span className={
                              currentReport.metrics.trends.find(t => t.metric.toLowerCase().includes(metric.key.toLowerCase()))?.direction === 'increasing' ? 'text-green-600' :
                              currentReport.metrics.trends.find(t => t.metric.toLowerCase().includes(metric.key.toLowerCase()))?.direction === 'decreasing' ? 'text-red-600' :
                              'text-gray-600'
                            }>
                              {currentReport.metrics.trends.find(t => t.metric.toLowerCase().includes(metric.key.toLowerCase()))?.changePercentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Spiritual Achievements</h2>
              
              {currentReport.achievements.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">🏆</div>
                  <p className="text-gray-600">No achievements recorded for this period</p>
                  <p className="text-sm text-gray-500">Keep growing spiritually to unlock achievements!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentReport.achievements.map((achievement) => (
                    <div key={achievement.id} className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🏆</div>
                          <div>
                            <h3 className="font-semibold text-green-900">{achievement.title}</h3>
                            <p className="text-sm text-green-700">{achievement.category}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {achievement.date.toLocaleDateString()}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{achievement.description}</p>
                      
                      <div className="mb-3">
                        <h4 className="font-medium text-sm mb-1">Impact:</h4>
                        <p className="text-sm text-gray-600">{achievement.impact}</p>
                      </div>
                      
                      {achievement.evidence.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Evidence:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {achievement.evidence.map((evidence, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-2 h-2 bg-green-600 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                                {evidence}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Spiritual Challenges</h2>
              
              {currentReport.challenges.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">✨</div>
                  <p className="text-gray-600">No significant challenges identified</p>
                  <p className="text-sm text-gray-500">Great job maintaining spiritual growth!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentReport.challenges.map((challenge) => (
                    <div key={challenge.id} className="bg-white border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{challenge.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(challenge.severity)}`}>
                              {challenge.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{challenge.category}</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{challenge.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {challenge.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {challenge.resources.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Resources:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {challenge.resources.map((resource, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-2 h-2 bg-purple-600 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                                {resource}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Growth Recommendations</h2>
              
              {currentReport.recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">🎯</div>
                  <p className="text-gray-600">No specific recommendations at this time</p>
                  <p className="text-sm text-gray-500">Continue your current spiritual practices!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentReport.recommendations.map((recommendation) => (
                    <div key={recommendation.id} className="bg-white border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{recommendation.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(recommendation.priority)}`}>
                              {recommendation.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 capitalize">{recommendation.category}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {recommendation.timeframe}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{recommendation.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-1">Expected Outcome:</h4>
                        <p className="text-sm text-gray-600">{recommendation.expectedOutcome}</p>
                      </div>
                      
                      {recommendation.resources.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Resources:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {recommendation.resources.map((resource, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                                {resource}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Next Steps */}
              {currentReport.nextSteps.length > 0 && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3">Next Steps</h3>
                  <ul className="space-y-2">
                    {currentReport.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start text-blue-800">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};