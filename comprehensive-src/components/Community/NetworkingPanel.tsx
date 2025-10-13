import React, { useState } from 'react';
import { NetworkConnection } from '../../types/community';

interface NetworkingPanelProps {
  userId: string;
  connections: NetworkConnection[];
}

export const NetworkingPanel: React.FC<NetworkingPanelProps> = ({ userId, connections }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const getConnectionTypeColor = (type: string) => {
    switch (type) {
      case 'mentor': return 'bg-blue-100 text-blue-800';
      case 'mentee': return 'bg-green-100 text-green-800';
      case 'study_partner': return 'bg-purple-100 text-purple-800';
      case 'project_collaborator': return 'bg-yellow-100 text-yellow-800';
      case 'spiritual_accountability': return 'bg-pink-100 text-pink-800';
      case 'career_network': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredConnections = connections.filter(connection => {
    if (activeFilter === 'all') return true;
    return connection.connectionType === activeFilter;
  });

  const connectionTypes = [
    { id: 'all', name: 'All Connections', count: connections.length },
    { id: 'mentor', name: 'Mentors', count: connections.filter(c => c.connectionType === 'mentor').length },
    { id: 'mentee', name: 'Mentees', count: connections.filter(c => c.connectionType === 'mentee').length },
    { id: 'study_partner', name: 'Study Partners', count: connections.filter(c => c.connectionType === 'study_partner').length },
    { id: 'project_collaborator', name: 'Collaborators', count: connections.filter(c => c.connectionType === 'project_collaborator').length },
    { id: 'spiritual_accountability', name: 'Accountability', count: connections.filter(c => c.connectionType === 'spiritual_accountability').length },
    { id: 'career_network', name: 'Career Network', count: connections.filter(c => c.connectionType === 'career_network').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Global Network</h2>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Find Connections
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Networking Events
          </button>
        </div>
      </div>

      {/* Connection Type Filters */}
      <div className="flex flex-wrap gap-2">
        {connectionTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveFilter(type.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeFilter === type.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.name} ({type.count})
          </button>
        ))}
      </div>

      {/* Networking Suggestions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Suggested Connections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((suggestion) => (
            <div key={suggestion} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">JS</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">John Smith</p>
                  <p className="text-sm text-gray-600">ScrollEngineer Track</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  AI Development
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Mentoring
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">95% compatibility • 3 mutual connections</p>
              <button className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 transition-colors">
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Connections List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {activeFilter === 'all' ? 'All Connections' : connectionTypes.find(t => t.id === activeFilter)?.name}
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredConnections.length > 0 ? (
            filteredConnections.map((connection) => (
              <div key={connection.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {connection.connectedUserId.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{connection.connectedUserId}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConnectionTypeColor(connection.connectionType)}`}>
                          {connection.connectionType.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">
                          Connected {new Date(connection.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {connection.sharedInterests.length > 0 && (
                      <div className="text-sm text-gray-500">
                        {connection.sharedInterests.length} shared interests
                      </div>
                    )}
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Profile
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Message
                    </button>
                  </div>
                </div>
                
                {connection.sharedInterests.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {connection.sharedInterests.slice(0, 3).map((interest, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {interest}
                      </span>
                    ))}
                    {connection.sharedInterests.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        +{connection.sharedInterests.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                {connection.collaborationHistory.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">{connection.collaborationHistory.length}</span> collaborations
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No connections found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeFilter === 'all' 
                  ? "Start building your network by connecting with other students."
                  : `No ${connectionTypes.find(t => t.id === activeFilter)?.name.toLowerCase()} found.`
                }
              </p>
              <div className="mt-6">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Find Connections
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Global Reach</p>
              <p className="text-2xl font-bold text-gray-900">47 Countries</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Mentorships</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Spiritual Connections</p>
              <p className="text-2xl font-bold text-gray-900">892</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};