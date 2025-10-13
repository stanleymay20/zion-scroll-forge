// Global Accessibility Dashboard Component
// Displays status and controls for global accessibility infrastructure
// Requirements: 2.1, 2.2, 2.3, 2.5

import React, { useState, useEffect } from 'react';
import { GlobalAccessibilityService, AccessibilityStatus, AccessibilityConfiguration } from '../../services/GlobalAccessibilityService';

interface GlobalAccessibilityDashboardProps {
  accessibilityService: GlobalAccessibilityService;
}

export const GlobalAccessibilityDashboard: React.FC<GlobalAccessibilityDashboardProps> = ({
  accessibilityService
}) => {
  const [status, setStatus] = useState<AccessibilityStatus | null>(null);
  const [config, setConfig] = useState<AccessibilityConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccessibilityData();
    setupEventListeners();

    const interval = setInterval(loadAccessibilityData, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadAccessibilityData = async () => {
    try {
      setIsLoading(true);
      const [currentStatus, currentConfig] = await Promise.all([
        accessibilityService.getAccessibilityStatus(),
        Promise.resolve(accessibilityService.getConfiguration())
      ]);
      
      setStatus(currentStatus);
      setConfig(currentConfig);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accessibility data');
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    const handleStatusUpdate = (event: any) => {
      setStatus(event.detail.status);
    };

    const handleMaintenanceAlert = (event: any) => {
      console.log('Maintenance alert:', event.detail);
      // Handle maintenance notifications
    };

    window.addEventListener('accessibility-status-update', handleStatusUpdate);
    window.addEventListener('accessibility-maintenance', handleMaintenanceAlert);

    return () => {
      window.removeEventListener('accessibility-status-update', handleStatusUpdate);
      window.removeEventListener('accessibility-maintenance', handleMaintenanceAlert);
    };
  };

  const handleConfigUpdate = (updates: Partial<AccessibilityConfiguration>) => {
    if (config) {
      const newConfig = { ...config, ...updates };
      setConfig(newConfig);
      accessibilityService.updateConfiguration(updates);
    }
  };

  const getConnectivityColor = (connectivity: string) => {
    switch (connectivity) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'poor': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600';
    if (level > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading accessibility status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Accessibility Data</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={loadAccessibilityData}
              className="mt-2 text-sm text-red-800 underline hover:text-red-900"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!status || !config) {
    return <div>No accessibility data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Global Accessibility Infrastructure</h2>
        <p className="text-gray-600">
          Monitor and manage ScrollUniversity's global accessibility features including mesh networking, 
          solar power integration, offline capabilities, and content synchronization.
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Mesh Network Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Mesh Network</h3>
              <p className={`text-sm font-semibold ${getConnectivityColor(status.meshNetwork.connectivity)}`}>
                {status.meshNetwork.connectivity.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {status.meshNetwork.isActive ? 'Active' : 'Inactive'} • {status.meshNetwork.nodeCount} nodes
            </p>
          </div>
        </div>

        {/* Solar Power Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Solar Power</h3>
              <p className={`text-sm font-semibold ${getBatteryColor(status.solarPower.batteryLevel)}`}>
                {status.solarPower.batteryLevel}% Battery
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {status.solarPower.isCharging ? 'Charging' : 'Discharging'} • {status.solarPower.estimatedRuntime}h runtime
            </p>
          </div>
        </div>

        {/* PWA Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Offline Ready</h3>
              <p className={`text-sm font-semibold ${status.progressiveWebApp.isOfflineReady ? 'text-green-600' : 'text-red-600'}`}>
                {status.progressiveWebApp.isOfflineReady ? 'Ready' : 'Not Ready'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {status.progressiveWebApp.isLowBandwidthMode ? 'Low Bandwidth' : 'Normal'} • {status.progressiveWebApp.cacheUsage}% cache
            </p>
          </div>
        </div>

        {/* Content Sync Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Content Sync</h3>
              <p className="text-sm font-semibold text-purple-600">
                {status.contentSync.activeSyncs} Active
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {status.contentSync.syncQueueSize} queued • {status.contentSync.offlineContentAvailable ? 'Content available' : 'No offline content'}
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature Toggles */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-700">Features</h4>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mesh Networking</span>
              <button
                onClick={() => handleConfigUpdate({ enableMeshNetworking: !config.enableMeshNetworking })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.enableMeshNetworking ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.enableMeshNetworking ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Solar Integration</span>
              <button
                onClick={() => handleConfigUpdate({ enableSolarIntegration: !config.enableSolarIntegration })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.enableSolarIntegration ? 'bg-yellow-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.enableSolarIntegration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Offline Mode</span>
              <button
                onClick={() => handleConfigUpdate({ enableOfflineMode: !config.enableOfflineMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.enableOfflineMode ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.enableOfflineMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Content Pre-caching</span>
              <button
                onClick={() => handleConfigUpdate({ enableContentPrecaching: !config.enableContentPrecaching })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.enableContentPrecaching ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.enableContentPrecaching ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-700">Settings</h4>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max Cache Size (MB)</label>
              <input
                type="number"
                value={config.maxCacheSize}
                onChange={(e) => handleConfigUpdate({ maxCacheSize: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="512"
                max="8192"
                step="512"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Sync Interval (minutes)</label>
              <input
                type="number"
                value={config.syncInterval}
                onChange={(e) => handleConfigUpdate({ syncInterval: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="5"
                max="120"
                step="5"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Power Optimization</label>
              <select
                value={config.powerOptimizationLevel}
                onChange={(e) => handleConfigUpdate({ powerOptimizationLevel: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="conservative">Conservative</option>
                <option value="balanced">Balanced</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="lowBandwidthOptimization"
                checked={config.lowBandwidthOptimization}
                onChange={(e) => handleConfigUpdate({ lowBandwidthOptimization: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="lowBandwidthOptimization" className="ml-2 text-sm text-gray-600">
                Low Bandwidth Optimization
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => accessibilityService.precacheEssentialContent(['course-1', 'course-2'])}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Pre-cache Essential Content
          </button>
          
          <button
            onClick={loadAccessibilityData}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Refresh Status
          </button>
          
          <button
            onClick={() => {
              // Trigger manual sync
              window.dispatchEvent(new CustomEvent('manual-sync-requested'));
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Force Sync
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalAccessibilityDashboard;