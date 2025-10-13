import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Users, 
  Activity,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Database,
  Zap
} from 'lucide-react';

interface SecurityMetrics {
  activeThreats: number;
  resolvedThreats: number;
  activePolicies: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceRate: number;
  fraudAlerts: number;
  blockedTransactions: number;
  contentFiltered: number;
}

interface ThreatAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  status: string;
}

interface ComplianceStatus {
  gdpr: boolean;
  ccpa: boolean;
  lgpd: boolean;
  dataRetention: boolean;
  spiritualAlignment: boolean;
}

const SecurityComplianceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    activeThreats: 0,
    resolvedThreats: 0,
    activePolicies: 0,
    riskLevel: 'low',
    complianceRate: 0,
    fraudAlerts: 0,
    blockedTransactions: 0,
    contentFiltered: 0
  });

  const [threats, setThreats] = useState<ThreatAlert[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus>({
    gdpr: true,
    ccpa: true,
    lgpd: true,
    dataRetention: true,
    spiritualAlignment: true
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'threats' | 'compliance' | 'fraud' | 'content'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      // In production, these would be actual API calls
      setMetrics({
        activeThreats: 3,
        resolvedThreats: 47,
        activePolicies: 12,
        riskLevel: 'medium',
        complianceRate: 94.5,
        fraudAlerts: 8,
        blockedTransactions: 15,
        contentFiltered: 234
      });

      setThreats([
        {
          id: '1',
          type: 'Authentication',
          severity: 'high',
          description: 'Multiple failed login attempts detected',
          timestamp: new Date(Date.now() - 300000),
          status: 'investigating'
        },
        {
          id: '2',
          type: 'DDoS',
          severity: 'medium',
          description: 'Unusual traffic pattern from IP range',
          timestamp: new Date(Date.now() - 600000),
          status: 'mitigated'
        },
        {
          id: '3',
          type: 'Data Access',
          severity: 'low',
          description: 'Unusual data access pattern detected',
          timestamp: new Date(Date.now() - 900000),
          status: 'monitoring'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load security data:', error);
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Security Status</p>
              <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(metrics.riskLevel)}`}>
                {metrics.riskLevel.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Threats</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeThreats}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.complianceRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Lock className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Policies</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activePolicies}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Overview Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Metrics Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{metrics.resolvedThreats}</div>
            <div className="text-sm text-gray-600">Threats Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{metrics.blockedTransactions}</div>
            <div className="text-sm text-gray-600">Fraud Blocked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{metrics.contentFiltered}</div>
            <div className="text-sm text-gray-600">Content Filtered</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Security Activity</h3>
        <div className="space-y-3">
          {threats.slice(0, 5).map((threat) => (
            <div key={threat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className={`h-5 w-5 mr-3 ${
                  threat.severity === 'critical' ? 'text-red-500' :
                  threat.severity === 'high' ? 'text-orange-500' :
                  threat.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{threat.description}</p>
                  <p className="text-xs text-gray-500">{threat.type} • {threat.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                {threat.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderThreats = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Threat Detection & Response</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Threat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {threats.map((threat) => (
                  <tr key={threat.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{threat.description}</div>
                        <div className="text-sm text-gray-500">{threat.type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{threat.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {threat.timestamp.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Investigate</button>
                      <button className="text-green-600 hover:text-green-900">Resolve</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(compliance).map(([key, status]) => (
          <div key={key} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <p className="text-sm text-gray-600">
                  {key === 'gdpr' && 'General Data Protection Regulation'}
                  {key === 'ccpa' && 'California Consumer Privacy Act'}
                  {key === 'lgpd' && 'Lei Geral de Proteção de Dados'}
                  {key === 'dataRetention' && 'Data Retention Policies'}
                  {key === 'spiritualAlignment' && 'Spiritual Content Alignment'}
                </p>
              </div>
              {status ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            <div className="mt-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {status ? 'Compliant' : 'Non-Compliant'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Privacy Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Database className="h-12 w-12 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">1,247</div>
            <div className="text-sm text-gray-600">Data Subjects</div>
          </div>
          <div className="text-center">
            <Clock className="h-12 w-12 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">23</div>
            <div className="text-sm text-gray-600">Pending Requests</div>
          </div>
          <div className="text-center">
            <Globe className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">47</div>
            <div className="text-sm text-gray-600">Countries Covered</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFraud = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fraud Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.fraudAlerts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Blocked Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.blockedTransactions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Risk Users</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Detection Rate</p>
              <p className="text-2xl font-bold text-gray-900">97.3%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">ScrollCoin Fraud Prevention</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">High Velocity Transaction Alert</p>
                <p className="text-xs text-gray-600">User attempted 25 transactions in 10 minutes</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700">
              Block User
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Unusual Amount Pattern</p>
                <p className="text-xs text-gray-600">Large transaction amounts detected from new user</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-md hover:bg-yellow-700">
              Investigate
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Eye className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location Anomaly</p>
                <p className="text-xs text-gray-600">Transaction from unusual geographic location</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
              Monitor
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Content Approved</p>
              <p className="text-2xl font-bold text-gray-900">189</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Content Rejected</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">34</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Spiritual Content Filtering</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Biblical Alignment Check Passed</p>
                <p className="text-xs text-gray-600">Course content aligns with scriptural principles</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Score: 94%
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Prophetic Content Verification</p>
                <p className="text-xs text-gray-600">Prophetic claim requires witness verification</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-md hover:bg-yellow-700">
              Review
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Cultural Sensitivity Flag</p>
                <p className="text-xs text-gray-600">Content may not be culturally appropriate</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Security & Compliance Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor security threats, compliance status, fraud prevention, and spiritual content alignment
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: Activity },
            { id: 'threats', name: 'Threats', icon: AlertTriangle },
            { id: 'compliance', name: 'Compliance', icon: Shield },
            { id: 'fraud', name: 'Fraud Prevention', icon: Lock },
            { id: 'content', name: 'Content Filter', icon: Eye }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'threats' && renderThreats()}
      {activeTab === 'compliance' && renderCompliance()}
      {activeTab === 'fraud' && renderFraud()}
      {activeTab === 'content' && renderContent()}
    </div>
  );
};

export default SecurityComplianceDashboard;