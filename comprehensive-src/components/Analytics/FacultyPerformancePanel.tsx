import React, { useState } from 'react';
import { FacultyPerformanceMetrics } from '../../types/analytics';

interface FacultyPerformancePanelProps {
  facultyPerformance: FacultyPerformanceMetrics[];
  onExport: (format: 'csv' | 'xlsx') => void;
}

const FacultyPerformancePanel: React.FC<FacultyPerformancePanelProps> = ({ 
  facultyPerformance, 
  onExport 
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'effectiveness' | 'engagement' | 'satisfaction'>('effectiveness');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'human' | 'ai' | 'prophetic' | 'angelic'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getPerformanceColor = (value: number) => {
    if (value >= 0.8) return 'text-green-600';
    if (value >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBackground = (value: number) => {
    if (value >= 0.8) return 'bg-green-100';
    if (value >= 0.6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getFacultyTypeIcon = (type: string) => {
    switch (type) {
      case 'human': return '👨‍🏫';
      case 'ai': return '🤖';
      case 'prophetic': return '✨';
      case 'angelic': return '👼';
      default: return '👤';
    }
  };

  const getFacultyTypeBadge = (type: string) => {
    const colors = {
      human: 'bg-blue-100 text-blue-800',
      ai: 'bg-purple-100 text-purple-800',
      prophetic: 'bg-yellow-100 text-yellow-800',
      angelic: 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredAndSortedFaculty = facultyPerformance
    .filter(faculty => {
      if (searchTerm && !faculty.facultyId.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      if (filterBy !== 'all' && faculty.facultyType !== filterBy) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'effectiveness':
          aValue = a.teachingEffectiveness;
          bValue = b.teachingEffectiveness;
          break;
        case 'engagement':
          aValue = a.studentEngagement.averageSessionDuration;
          bValue = b.studentEngagement.averageSessionDuration;
          break;
        case 'satisfaction':
          aValue = a.studentSatisfaction;
          bValue = b.studentSatisfaction;
          break;
        default:
          return a.facultyId.localeCompare(b.facultyId);
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const averageMetrics = {
    effectiveness: facultyPerformance.reduce((sum, f) => sum + f.teachingEffectiveness, 0) / facultyPerformance.length,
    satisfaction: facultyPerformance.reduce((sum, f) => sum + f.studentSatisfaction, 0) / facultyPerformance.length,
    responseTime: facultyPerformance.reduce((sum, f) => sum + f.responseTime, 0) / facultyPerformance.length,
    spiritualImpartation: facultyPerformance.reduce((sum, f) => sum + f.spiritualImpartation, 0) / facultyPerformance.length
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3 mr-4">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Teaching Effectiveness</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(averageMetrics.effectiveness)}`}>
                {(averageMetrics.effectiveness * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3 mr-4">
              <span className="text-2xl">😊</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Student Satisfaction</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(averageMetrics.satisfaction)}`}>
                {(averageMetrics.satisfaction * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-yellow-500 rounded-lg p-3 mr-4">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageMetrics.responseTime.toFixed(1)}h
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3 mr-4">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Spiritual Impartation</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(averageMetrics.spiritualImpartation)}`}>
                {(averageMetrics.spiritualImpartation * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Faculty Types</option>
              <option value="human">Human Faculty</option>
              <option value="ai">AI Faculty</option>
              <option value="prophetic">Prophetic Faculty</option>
              <option value="angelic">Angelic Faculty</option>
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="effectiveness-desc">Teaching Effectiveness (High to Low)</option>
              <option value="effectiveness-asc">Teaching Effectiveness (Low to High)</option>
              <option value="satisfaction-desc">Student Satisfaction (High to Low)</option>
              <option value="satisfaction-asc">Student Satisfaction (Low to High)</option>
              <option value="engagement-desc">Engagement (High to Low)</option>
              <option value="engagement-asc">Engagement (Low to High)</option>
              <option value="name-asc">Name (A to Z)</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onExport('csv')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Export CSV
            </button>
            <button
              onClick={() => onExport('xlsx')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Faculty Performance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Faculty Performance Metrics ({filteredAndSortedFaculty.length} faculty members)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faculty Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teaching Metrics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spiritual Impact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workload
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedFaculty.map((faculty) => (
                <tr key={faculty.facultyId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getFacultyTypeIcon(faculty.facultyType)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {faculty.facultyId}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFacultyTypeBadge(faculty.facultyType)}`}>
                          {faculty.facultyType}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium w-20">Effectiveness:</span>
                        <div className={`px-2 py-1 rounded text-sm font-bold ${getPerformanceBackground(faculty.teachingEffectiveness)} ${getPerformanceColor(faculty.teachingEffectiveness)}`}>
                          {(faculty.teachingEffectiveness * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium w-20">Satisfaction:</span>
                        <div className={`px-2 py-1 rounded text-sm font-bold ${getPerformanceBackground(faculty.studentSatisfaction)} ${getPerformanceColor(faculty.studentSatisfaction)}`}>
                          {(faculty.studentSatisfaction * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Response: {faculty.responseTime.toFixed(1)}h avg
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Session Duration:</span>
                        <span className="ml-2">{faculty.studentEngagement.averageSessionDuration.toFixed(1)}min</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Response Rate:</span>
                        <span className="ml-2">{(faculty.studentEngagement.responseRate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Interactions:</span>
                        <span className="ml-2">{faculty.studentEngagement.studentInteractions}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Feedback:</span>
                        <span className="ml-2">{faculty.studentEngagement.feedbackScore.toFixed(1)}/5</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`px-3 py-2 rounded-lg ${getPerformanceBackground(faculty.spiritualImpartation)}`}>
                        <div className={`text-lg font-bold ${getPerformanceColor(faculty.spiritualImpartation)}`}>
                          {(faculty.spiritualImpartation * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">Impartation Score</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Courses:</span>
                        <span className="ml-2">{faculty.coursesManaged}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Interventions:</span>
                        <span className="ml-2">{faculty.interventionsTriggered}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      View Profile
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      Message
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacultyPerformancePanel;