import React, { useState, useEffect } from 'react';
import {
  AnalyticsDashboardData,
  AnalyticsFilters,
  InterventionAlert,
  CareerTrack
} from '../../types/analytics';
import AnalyticsService from '../../services/AnalyticsService';
import OverviewCards from './OverviewCards';
import StudentProgressPanel from './StudentProgressPanel';
import FacultyPerformancePanel from './FacultyPerformancePanel';
import GlobalImpactPanel from './GlobalImpactPanel';
import InterventionAlertsPanel from './InterventionAlertsPanel';
import TrendsPanel from './TrendsPanel';
import FiltersPanel from './FiltersPanel';

interface AnalyticsDashboardProps {
  userRole: 'admin' | 'faculty' | 'regional_admin';
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userRole }) => {
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    }
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'faculty' | 'global' | 'alerts' | 'trends'>('overview');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const analyticsService = new AnalyticsService();

  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboardData(filters);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
  };

  const handleInterventionUpdate = async (alertId: string, updates: Partial<InterventionAlert>) => {
    try {
      await analyticsService.updateInterventionAlert(alertId, updates);
      // Refresh dashboard data to reflect changes
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to update intervention alert:', err);
    }
  };

  const exportData = async (dataType: 'student_progress' | 'faculty_performance' | 'global_impact', format: 'csv' | 'xlsx') => {
    try {
      const blob = await analyticsService.exportData(dataType, format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataType}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error Loading Dashboard</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ScrollUniversity Analytics</h1>
              <p className="text-gray-600">Comprehensive platform insights and reporting</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardData}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <FiltersPanel filters={filters} onFiltersChange={handleFilterChange} />

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'students', label: 'Student Progress', icon: '👥' },
              { id: 'faculty', label: 'Faculty Performance', icon: '👨‍🏫' },
              { id: 'global', label: 'Global Impact', icon: '🌍' },
              { id: 'alerts', label: 'Intervention Alerts', icon: '⚠️' },
              { id: 'trends', label: 'Trends', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dashboardData && (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <OverviewCards overview={dashboardData.overview} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Recent Intervention Alerts</h3>
                    <InterventionAlertsPanel
                      alerts={dashboardData.interventionAlerts.slice(0, 5)}
                      onUpdateAlert={handleInterventionUpdate}
                      compact={true}
                    />
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Enrollment Trends</h3>
                    <TrendsPanel trends={dashboardData.trends} compact={true} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <StudentProgressPanel
                studentProgress={dashboardData.studentProgress}
                onExport={(format) => exportData('student_progress', format)}
              />
            )}

            {activeTab === 'faculty' && (
              <FacultyPerformancePanel
                facultyPerformance={dashboardData.facultyPerformance}
                onExport={(format) => exportData('faculty_performance', format)}
              />
            )}

            {activeTab === 'global' && (
              <GlobalImpactPanel
                globalImpact={dashboardData.globalImpact}
                onExport={(format) => exportData('global_impact', format)}
              />
            )}

            {activeTab === 'alerts' && (
              <InterventionAlertsPanel
                alerts={dashboardData.interventionAlerts}
                onUpdateAlert={handleInterventionUpdate}
              />
            )}

            {activeTab === 'trends' && (
              <TrendsPanel trends={dashboardData.trends} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;