/**
 * Partnership Management Dashboard
 * Administrative interface for managing partner institution integrations
 * Requirements 5.2 and 6.3: Partner institution integration and credential recognition
 */

import React, { useState, useEffect } from 'react';
import {
  PartnerInstitution,
  PartnerStatus,
  IntegrationLevel,
  PartnerService,
  GuestLecturer,
  LectureSession,
  CredentialRecognition,
  RecognitionStatus,
  PartnershipMetrics
} from '../../types/partner-integration';

interface PartnershipManagementDashboardProps {
  onPartnerSelect?: (partnerId: string) => void;
  onSessionSchedule?: (sessionDetails: any) => void;
  onCredentialSubmit?: (credentialDetails: any) => void;
}

const PartnershipManagementDashboard: React.FC<PartnershipManagementDashboardProps> = ({
  onPartnerSelect,
  onSessionSchedule,
  onCredentialSubmit
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'lecturers' | 'sessions' | 'credentials'>('overview');
  const [partners, setPartners] = useState<PartnerInstitution[]>([]);
  const [lecturers, setLecturers] = useState<GuestLecturer[]>([]);
  const [sessions, setSessions] = useState<LectureSession[]>([]);
  const [credentials, setCredentials] = useState<CredentialRecognition[]>([]);
  const [metrics, setMetrics] = useState<PartnershipMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // In a real implementation, these would be API calls
      await loadPartners();
      await loadLecturers();
      await loadSessions();
      await loadCredentials();
      await loadMetrics();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPartners = async () => {
    // Mock data - in real implementation, this would be an API call
    setPartners([
      {
        id: 'mit-csail',
        name: 'MIT Computer Science and Artificial Intelligence Laboratory',
        type: 'academic_institution' as any,
        country: 'United States',
        apiEndpoint: 'https://api.mit.edu/v1',
        apiKey: '***',
        status: PartnerStatus.ACTIVE,
        integrationLevel: IntegrationLevel.PREMIUM,
        supportedServices: [PartnerService.GUEST_LECTURING, PartnerService.RESEARCH_COLLABORATION],
        contactInfo: {
          primaryContact: 'Dr. Sarah Johnson',
          email: 'partnerships@csail.mit.edu',
          phone: '+1-617-253-5851',
          department: 'External Partnerships',
          timezone: 'EST'
        },
        credentials: {
          authType: 'api_key',
          credentials: {},
          lastVerified: new Date()
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: 'oxford-university',
        name: 'University of Oxford',
        type: 'academic_institution' as any,
        country: 'United Kingdom',
        apiEndpoint: 'https://api.ox.ac.uk/v2',
        apiKey: '***',
        status: PartnerStatus.ACTIVE,
        integrationLevel: IntegrationLevel.STANDARD,
        supportedServices: [PartnerService.GUEST_LECTURING, PartnerService.FACULTY_EXCHANGE],
        contactInfo: {
          primaryContact: 'Prof. Michael Chen',
          email: 'partnerships@ox.ac.uk',
          phone: '+44-1865-270000',
          department: 'International Office',
          timezone: 'GMT'
        },
        credentials: {
          authType: 'oauth',
          credentials: {},
          lastVerified: new Date()
        },
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date()
      }
    ]);
  };

  const loadLecturers = async () => {
    // Mock data
    setLecturers([
      {
        id: 'mit-prof-johnson',
        partnerId: 'mit-csail',
        name: 'Dr. Sarah Johnson',
        title: 'Professor of Artificial Intelligence',
        expertise: ['AI Ethics', 'Machine Learning', 'Sacred Technology'],
        bio: 'Leading researcher in AI ethics with spiritual focus',
        availability: {
          timezone: 'EST',
          availableSlots: [],
          blackoutDates: [],
          preferredFormats: ['live_virtual' as any]
        },
        rates: {
          currency: 'USD',
          hourlyRate: 500,
          sessionRate: 1000,
          travelExpenses: false,
          paymentTerms: 'Net 30'
        },
        spiritualAlignment: {
          christianWorldview: true,
          scrollPrinciplesAlignment: 9,
          kingdomFocus: true,
          propheticGifting: false,
          verifiedBy: 'ScrollWitness Elder Council',
          verificationDate: new Date()
        },
        status: 'available' as any
      }
    ]);
  };

  const loadSessions = async () => {
    // Mock data
    setSessions([]);
  };

  const loadCredentials = async () => {
    // Mock data
    setCredentials([]);
  };

  const loadMetrics = async () => {
    // Mock data
    setMetrics([]);
  };

  const getStatusColor = (status: PartnerStatus): string => {
    switch (status) {
      case PartnerStatus.ACTIVE: return 'text-green-600 bg-green-100';
      case PartnerStatus.PENDING: return 'text-yellow-600 bg-yellow-100';
      case PartnerStatus.SUSPENDED: return 'text-red-600 bg-red-100';
      case PartnerStatus.INACTIVE: return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIntegrationLevelColor = (level: IntegrationLevel): string => {
    switch (level) {
      case IntegrationLevel.BASIC: return 'text-blue-600 bg-blue-100';
      case IntegrationLevel.STANDARD: return 'text-purple-600 bg-purple-100';
      case IntegrationLevel.PREMIUM: return 'text-gold-600 bg-gold-100';
      case IntegrationLevel.FULL_INTEGRATION: return 'text-emerald-600 bg-emerald-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Partnership Management</h1>
        <p className="text-gray-600">Manage integrations with partner institutions and credential recognition</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'partners', label: 'Partners' },
            { id: 'lecturers', label: 'Guest Lecturers' },
            { id: 'sessions', label: 'Sessions' },
            { id: 'credentials', label: 'Credentials' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Partners</h3>
              <p className="text-3xl font-bold text-blue-600">{partners.filter(p => p.status === PartnerStatus.ACTIVE).length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Lecturers</h3>
              <p className="text-3xl font-bold text-green-600">{lecturers.filter(l => l.status === 'available').length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Scheduled Sessions</h3>
              <p className="text-3xl font-bold text-purple-600">{sessions.filter(s => s.status === 'scheduled').length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Recognized Credentials</h3>
              <p className="text-3xl font-bold text-gold-600">{credentials.filter(c => c.status === RecognitionStatus.APPROVED).length}</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">New partner integration: MIT CSAIL activated</span>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Guest lecture scheduled with Dr. Sarah Johnson</span>
                  <span className="text-xs text-gray-400">4 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Credential recognition approved for B.Sc. Sacred AI</span>
                  <span className="text-xs text-gray-400">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partners Tab */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Partner Institutions</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Add New Partner
            </button>
          </div>

          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Integration Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                        <div className="text-sm text-gray-500">{partner.country}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {partner.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(partner.status)}`}>
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getIntegrationLevelColor(partner.integrationLevel)}`}>
                        {partner.integrationLevel.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {partner.supportedServices.length} services
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onPartnerSelect?.(partner.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Suspend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guest Lecturers Tab */}
      {activeTab === 'lecturers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Guest Lecturers</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Invite Lecturer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lecturers.map((lecturer) => (
              <div key={lecturer.id} className="bg-white rounded-lg shadow border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{lecturer.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    lecturer.status === 'available' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                  }`}>
                    {lecturer.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{lecturer.title}</p>
                <p className="text-sm text-gray-500 mb-4">{lecturer.bio}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-1">
                    {lecturer.expertise.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {skill}
                      </span>
                    ))}
                    {lecturer.expertise.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        +{lecturer.expertise.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Spiritual Alignment</span>
                    <span className="font-medium text-green-600">
                      {lecturer.spiritualAlignment.scrollPrinciplesAlignment}/10
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => onSessionSchedule?.({ lecturerId: lecturer.id })}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    Schedule
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-50">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Lecture Sessions</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Schedule Session
            </button>
          </div>

          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <div className="text-center text-gray-500 py-12">
                <p>No sessions scheduled yet.</p>
                <button
                  onClick={() => onSessionSchedule?.({})}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Schedule your first session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Tab */}
      {activeTab === 'credentials' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Credential Recognition</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Submit for Recognition
            </button>
          </div>

          <div className="bg-white rounded-lg shadow border">
            <div className="p-6">
              <div className="text-center text-gray-500 py-12">
                <p>No credential recognition requests yet.</p>
                <button
                  onClick={() => onCredentialSubmit?.({})}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Submit your first credential
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnershipManagementDashboard;