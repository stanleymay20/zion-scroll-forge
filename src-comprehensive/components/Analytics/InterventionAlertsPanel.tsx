import React, { useState } from 'react';
import { InterventionAlert } from '../../types/analytics';

interface InterventionAlertsPanelProps {
  alerts: InterventionAlert[];
  onUpdateAlert: (alertId: string, updates: Partial<InterventionAlert>) => void;
  compact?: boolean;
}

const InterventionAlertsPanel: React.FC<InterventionAlertsPanelProps> = ({ 
  alerts, 
  onUpdateAlert,
  compact = false 
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [filterType, setFilterType] = useState<'all' | 'academic' | 'spiritual' | 'engagement' | 'technical'>('all');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'academic': return '📚';
      case 'spiritual': return '✨';
      case 'engagement': return '👥';
      case 'technical': return '⚙️';
      default: return '⚠️';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && alert.status !== filterStatus) return false;
    if (filterType !== 'all' && alert.type !== filterType) return false;
    return true;
  });

  const handleStatusChange = (alertId: string, newStatus: 'open' | 'in_progress' | 'resolved') => {
    const updates: Partial<InterventionAlert> = { status: newStatus };
    if (newStatus === 'resolved') {
      updates.resolvedAt = new Date();
    }
    onUpdateAlert(alertId, updates);
  };

  const handleAssignAlert = (alertId: string, assignedTo: string) => {
    onUpdateAlert(alertId, { assignedTo });
  };

  const alertStats = {
    total: alerts.length,
    open: alerts.filter(a => a.status === 'open').length,
    inProgress: alerts.filter(a => a.status === 'in_progress').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {filteredAlerts.slice(0, 5).map((alert) => (
          <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="text-lg">{getTypeIcon(alert.type)}</span>
                <div>
                  <p className="text-sm font-medium">{alert.description}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Student: {alert.studentId} • {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                {alert.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
        {alerts.length > 5 && (
          <p className="text-sm text-gray-500 text-center">
            +{alerts.length - 5} more alerts
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-gray-900">{alertStats.total}</div>
          <div className="text-sm text-gray-600">Total Alerts</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-red-600">{alertStats.open}</div>
          <div className="text-sm text-gray-600">Open</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-yellow-600">{alertStats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-green-600">{alertStats.resolved}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-red-700">{alertStats.critical}</div>
          <div className="text-sm text-gray-600">Critical</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-orange-600">{alertStats.high}</div>
          <div className="text-sm text-gray-600">High Priority</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="academic">Academic</option>
              <option value="spiritual">Spiritual</option>
              <option value="engagement">Engagement</option>
              <option value="technical">Technical</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Intervention Alerts</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {alert.type}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Student: {alert.studentId}
                    </h4>
                    
                    <p className="text-gray-700 mb-3">
                      {alert.description}
                    </p>
                    
                    {alert.suggestedActions.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-900 mb-1">Suggested Actions:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {alert.suggestedActions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created: {new Date(alert.createdAt).toLocaleDateString()}</span>
                      {alert.assignedTo && (
                        <span>Assigned to: {alert.assignedTo}</span>
                      )}
                      {alert.resolvedAt && (
                        <span>Resolved: {new Date(alert.resolvedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <select
                    value={alert.status}
                    onChange={(e) => handleStatusChange(alert.id, e.target.value as any)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Assign to..."
                    value={alert.assignedTo || ''}
                    onChange={(e) => handleAssignAlert(alert.id, e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    View Student
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredAlerts.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No alerts match the current filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default InterventionAlertsPanel;