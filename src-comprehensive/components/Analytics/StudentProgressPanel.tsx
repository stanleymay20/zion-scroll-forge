import React, { useState } from 'react';
import { StudentProgressMetrics, InterventionAlert } from '../../types/analytics';

interface StudentProgressPanelProps {
  studentProgress: StudentProgressMetrics[];
  onExport: (format: 'csv' | 'xlsx') => void;
}

const StudentProgressPanel: React.FC<StudentProgressPanelProps> = ({ 
  studentProgress, 
  onExport 
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'gpa' | 'completion' | 'spiritual'>('gpa');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'at_risk' | 'excelling'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 0.8) return 'text-green-600';
    if (value >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredAndSortedStudents = studentProgress
    .filter(student => {
      if (searchTerm && !student.studentId.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      switch (filterBy) {
        case 'at_risk':
          return student.academicProgress.overallGPA < 2.5 || 
                 student.interventionAlerts.some(alert => alert.severity === 'high' || alert.severity === 'critical');
        case 'excelling':
          return student.academicProgress.overallGPA >= 3.5 && 
                 student.spiritualGrowth.divineScorecard.scrollAlignment >= 0.8;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'gpa':
          aValue = a.academicProgress.overallGPA;
          bValue = b.academicProgress.overallGPA;
          break;
        case 'completion':
          aValue = a.academicProgress.courseCompletionRate;
          bValue = b.academicProgress.courseCompletionRate;
          break;
        case 'spiritual':
          aValue = a.spiritualGrowth.divineScorecard.scrollAlignment;
          bValue = b.spiritualGrowth.divineScorecard.scrollAlignment;
          break;
        default:
          return a.studentId.localeCompare(b.studentId);
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Students</option>
              <option value="at_risk">At Risk</option>
              <option value="excelling">Excelling</option>
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
              <option value="gpa-desc">GPA (High to Low)</option>
              <option value="gpa-asc">GPA (Low to High)</option>
              <option value="completion-desc">Completion (High to Low)</option>
              <option value="completion-asc">Completion (Low to High)</option>
              <option value="spiritual-desc">Spiritual Growth (High to Low)</option>
              <option value="spiritual-asc">Spiritual Growth (Low to High)</option>
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

      {/* Student Progress Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Student Progress Tracking ({filteredAndSortedStudents.length} students)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spiritual Growth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Career Pathway
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alerts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedStudents.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.studentId}
                    </div>
                    <div className="text-sm text-gray-500">
                      Last updated: {new Date(student.lastUpdated).toLocaleDateString()}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">GPA:</span>
                        <span className={`ml-2 text-sm font-bold ${getProgressColor(student.academicProgress.overallGPA / 4)}`}>
                          {student.academicProgress.overallGPA.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">Completion:</span>
                        <span className={`ml-2 text-sm ${getProgressColor(student.academicProgress.courseCompletionRate)}`}>
                          {(student.academicProgress.courseCompletionRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.academicProgress.scrollBadgesEarned} badges
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">Purpose:</span>
                        <span className={`ml-2 text-sm ${getProgressColor(student.spiritualGrowth.divineScorecard.purpose)}`}>
                          {(student.spiritualGrowth.divineScorecard.purpose * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">Alignment:</span>
                        <span className={`ml-2 text-sm ${getProgressColor(student.spiritualGrowth.divineScorecard.scrollAlignment)}`}>
                          {(student.spiritualGrowth.divineScorecard.scrollAlignment * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Kingdom Impact: {student.spiritualGrowth.kingdomImpact}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {student.careerPathway.selectedTrack}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${student.careerPathway.progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.careerPathway.progressPercentage.toFixed(1)}% complete
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {student.interventionAlerts.length === 0 ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          No alerts
                        </span>
                      ) : (
                        student.interventionAlerts.slice(0, 2).map((alert) => (
                          <div key={alert.id}>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                        ))
                      )}
                      {student.interventionAlerts.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{student.interventionAlerts.length - 2} more
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      View Details
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      Contact
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

export default StudentProgressPanel;