/**
 * Integration Dashboard Component for ScrollUniversity Cross-System Monitoring
 * 
 * This component provides a real-time dashboard for monitoring the health and
 * performance of all ScrollUniversity system integrations.
 */

import React, { useState, useEffect } from 'react';
import { integrationFramework, IntegrationAlert, AlertSeverity } from './IntegrationFramework';
import { SystemName } from './SystemInterfaces';
import { HealthStatus, IntegrationHealth } from './SharedDataModels';

interface DashboardData {
  systemHealth: Record<SystemName, IntegrationHealth>;
  metrics: Record<SystemName, any>;
  activeAlerts: IntegrationAlert[];
  eventQueueSize: number;
  totalSystems: number;
  healthySystems: number;
}

export const IntegrationDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<SystemName | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    const updateDashboard = () => {
      const data = integrationFramework.getIntegrationDashboard();
      setDashboardData(data);
    };

    // Initial load
    updateDashboard();

    // Update every 5 seconds
    const interval = setInterval(updateDashboard, 5000);

    // Subscribe to alerts
    integrationFramework.subscribeToAlerts((alert) => {
      updateDashboard(); // Refresh dashboard when alerts come in
    });

    return () => clearInterval(interval);
  }, []);

  const runIntegrationTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await integrationFramework.runIntegrationTests();
      setTestResults(results);
    } catch (error) {
      console.error('Integration tests failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    await integrationFramework.resolveAlert(alertId);
  };

  const getHealthStatusColor = (status: HealthStatus): string => {
    switch (status) {
      case HealthStatus.HEALTHY: return 'text-green-600';
      case HealthStatus.DEGRADED: return 'text-yellow-600';
      case HealthStatus.UNHEALTHY: return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
      case AlertSeverity.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case AlertSeverity.MEDIUM: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading integration dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ScrollUniversity Integration Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor cross-system health, performance, and integration status
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Systems</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.totalSystems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Healthy Systems</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.healthySystems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.activeAlerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Event Queue</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.eventQueueSize}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {dashboardData.activeAlerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Alerts</h2>
          <div className="space-y-3">
            {dashboardData.activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{alert.systemName}</span>
                      <span className="text-sm opacity-75">{alert.type}</span>
                    </div>
                    <p className="mt-1">{alert.message}</p>
                    <p className="text-sm opacity-75 mt-1">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-3 py-1 bg-white bg-opacity-50 rounded text-sm hover:bg-opacity-75 transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Health Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
          <button
            onClick={runIntegrationTests}
            disabled={isRunningTests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunningTests ? 'Running Tests...' : 'Run Integration Tests'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(dashboardData.systemHealth).map(([systemName, health]) => (
            <div
              key={systemName}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedSystem(systemName as SystemName)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{systemName}</h3>
                <span className={`text-sm font-medium ${getHealthStatusColor(health.status)}`}>
                  {health.status}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>Last Check: {health.lastCheck.toLocaleTimeString()}</div>
                <div>Response Time: {health.responseTime}ms</div>
                <div>Dependencies: {health.dependencies.length}</div>
              </div>

              {health.dependencies.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Dependencies:</div>
                  <div className="flex flex-wrap gap-1">
                    {health.dependencies.map((dep) => (
                      <span
                        key={dep.name}
                        className={`px-2 py-1 rounded text-xs ${getHealthStatusColor(dep.status)} bg-gray-100`}
                      >
                        {dep.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Integration Test Results</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-6 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testResults.passed}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testResults.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {testResults.results.map((result: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded border-l-4 ${
                    result.passed 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-red-50 border-red-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.testName}</span>
                    <span className={`text-sm ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  {result.issues.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="font-medium">Issues:</div>
                      <ul className="list-disc list-inside">
                        {result.issues.map((issue: string, i: number) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Details Modal */}
      {selectedSystem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedSystem} Details</h3>
                <button
                  onClick={() => setSelectedSystem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Health Status</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <pre className="text-sm">
                      {JSON.stringify(dashboardData.systemHealth[selectedSystem], null, 2)}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Metrics</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <pre className="text-sm">
                      {JSON.stringify(dashboardData.metrics[selectedSystem], null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationDashboard;