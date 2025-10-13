import React, { useState, useEffect } from 'react';

interface PerformanceOptimizationDashboardProps {
  cdnService: any;
  autoScalingService: any;
  performanceMonitoringService: any;
  aiOptimizationService: any;
}

const PerformanceOptimizationDashboard: React.FC<PerformanceOptimizationDashboardProps> = ({
  cdnService,
  autoScalingService,
  performanceMonitoringService,
  aiOptimizationService
}) => {
  const [cdnMetrics, setCdnMetrics] = useState<any[]>([]);
  const [scalingMetrics, setScalingMetrics] = useState<any>({});
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [aiMetrics, setAiMetrics] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [aiInstances, setAiInstances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load CDN metrics
      const cdnData = cdnService.getMetrics();
      setCdnMetrics(cdnData.slice(-20)); // Last 20 data points

      // Load auto-scaling data
      const scalingData = {
        currentMetrics: autoScalingService.getCurrentMetrics(),
        instances: autoScalingService.getInstances(),
        history: autoScalingService.getScalingHistory()
      };
      setScalingMetrics(scalingData);
      setInstances(scalingData.instances);

      // Load performance monitoring data
      const perfData = performanceMonitoringService.getMetrics();
      setPerformanceMetrics(perfData.slice(-20));
      
      const alerts = performanceMonitoringService.getActiveAlerts();
      setActiveAlerts(alerts);

      // Load AI optimization data
      const aiData = aiOptimizationService.getPerformanceMetrics();
      setAiMetrics(aiData.slice(-20));
      
      const aiInstanceData = aiOptimizationService.getModelInstances();
      setAiInstances(aiInstanceData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceScale = async (targetInstances: number) => {
    try {
      await autoScalingService.forceScale(targetInstances);
      loadDashboardData();
    } catch (error) {
      console.error('Error scaling instances:', error);
    }
  };

  const handlePurgeCache = async () => {
    try {
      await cdnService.purgeCache();
      loadDashboardData();
    } catch (error) {
      console.error('Error purging cache:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="ml-2">Loading performance optimization data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Optimization Dashboard</h1>
          <p className="text-gray-600">Monitor and optimize ScrollUniversity platform performance</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={loadDashboardData} className="btn btn-outline">
            Refresh
          </button>
          <button onClick={handlePurgeCache} className="btn btn-outline">
            Purge Cache
          </button>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="alert alert-warning">
          <div className="space-y-2">
            <strong>Active Alerts ({activeAlerts.length})</strong>
            {activeAlerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className={`badge ${alert.severity}`}>
                  {alert.severity}
                </span>
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-header">
            <h3>Response Time</h3>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold">
              {performanceMetrics.length > 0 
                ? `${performanceMetrics[performanceMetrics.length - 1]?.application?.averageResponseTime?.toFixed(0)}ms`
                : '0ms'
              }
            </div>
            <p className="text-sm text-gray-500">Average response time</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Active Instances</h3>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold">
              {instances.filter(i => i.status === 'running').length}
            </div>
            <p className="text-sm text-gray-500">Running instances</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>CDN Hit Ratio</h3>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold">
              {cdnMetrics.length > 0 
                ? `${cdnMetrics[cdnMetrics.length - 1]?.hitRatio?.toFixed(1)}%`
                : '0%'
              }
            </div>
            <p className="text-sm text-gray-500">Cache hit ratio</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>AI Performance</h3>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold">
              {aiMetrics.length > 0 
                ? `${aiMetrics[aiMetrics.length - 1]?.spiritualAlignmentScore?.toFixed(1)}%`
                : '0%'
              }
            </div>
            <p className="text-sm text-gray-500">Spiritual alignment</p>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3>Performance Trends</h3>
          </div>
          <div className="card-content">
            <div className="chart-container">
              {/* Chart would go here */}
              <p>Performance metrics chart for response time and requests/sec</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>System Resources</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span>
                    {performanceMetrics.length > 0 
                      ? `${performanceMetrics[performanceMetrics.length - 1]?.system?.cpuUsage?.toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{
                      width: `${performanceMetrics.length > 0 
                        ? performanceMetrics[performanceMetrics.length - 1]?.system?.cpuUsage || 0
                        : 0
                      }%`
                    }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span>
                    {performanceMetrics.length > 0 
                      ? `${performanceMetrics[performanceMetrics.length - 1]?.system?.memoryUsage?.toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{
                      width: `${performanceMetrics.length > 0 
                        ? performanceMetrics[performanceMetrics.length - 1]?.system?.memoryUsage || 0
                        : 0
                      }%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span>Spiritual Alignment</span>
                  <span>
                    {performanceMetrics.length > 0 
                      ? `${performanceMetrics[performanceMetrics.length - 1]?.spiritual?.contentAlignment?.toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill spiritual" 
                    style={{
                      width: `${performanceMetrics.length > 0 
                        ? performanceMetrics[performanceMetrics.length - 1]?.spiritual?.contentAlignment || 0
                        : 0
                      }%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3>Instance Status</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {instances.map((instance, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full status-${instance.status}`} />
                    <div>
                      <p className="font-medium">{instance.id}</p>
                      <p className="text-sm text-gray-500">{instance.region}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{instance.status}</p>
                    <p className="text-xs text-gray-500">
                      Load: {((instance.currentLoad / instance.maxCapacity) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => handleForceScale(instances.length + 1)}
                className="btn btn-primary btn-sm"
              >
                Scale Up
              </button>
              <button 
                onClick={() => handleForceScale(Math.max(1, instances.length - 1))}
                className="btn btn-secondary btn-sm"
              >
                Scale Down
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>AI Model Instances</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {aiInstances.map((instance, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full status-${instance.status}`} />
                    <div>
                      <p className="font-medium">{instance.id}</p>
                      <p className="text-sm text-gray-500">{instance.modelType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {((instance.currentLoad / instance.maxCapacity) * 100).toFixed(1)}% load
                    </p>
                    <p className="text-xs text-gray-500">
                      Spiritual: {instance.spiritualAlignment?.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceOptimizationDashboard;