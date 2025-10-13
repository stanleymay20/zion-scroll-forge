import React, { useState } from 'react';
import { AnalyticsFilters, CareerTrack } from '../../types/analytics';

interface FiltersPanelProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ filters, onFiltersChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: new Date(value)
      }
    });
  };

  const handleFilterChange = (field: keyof AnalyticsFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        end: new Date()
      }
    });
  };

  const setQuickDateRange = (days: number) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    });
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* Basic Filters - Always Visible */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Date Range */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Date Range:</label>
                <input
                  type="date"
                  value={formatDateForInput(filters.dateRange.start)}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={formatDateForInput(filters.dateRange.end)}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Quick Date Buttons */}
              <div className="flex space-x-2">
                {[
                  { label: '7D', days: 7 },
                  { label: '30D', days: 30 },
                  { label: '90D', days: 90 },
                  { label: '1Y', days: 365 }
                ].map((period) => (
                  <button
                    key={period.days}
                    onClick={() => setQuickDateRange(period.days)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
              >
                <span className="mr-1">{isExpanded ? '▼' : '▶'}</span>
                Advanced Filters
              </button>
              
              <button
                onClick={resetFilters}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Advanced Filters - Collapsible */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Region Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <select
                    value={filters.region || ''}
                    onChange={(e) => handleFilterChange('region', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Regions</option>
                    <option value="Africa">Africa</option>
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="Latin America">Latin America</option>
                    <option value="Middle East">Middle East</option>
                    <option value="North America">North America</option>
                    <option value="Oceania">Oceania</option>
                  </select>
                </div>

                {/* Career Pathway Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Career Pathway
                  </label>
                  <select
                    value={filters.careerPathway || ''}
                    onChange={(e) => handleFilterChange('careerPathway', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Pathways</option>
                    <option value="ScrollFounder">ScrollFounder</option>
                    <option value="ScrollAmbassador">ScrollAmbassador</option>
                    <option value="ScrollPriest">ScrollPriest</option>
                    <option value="ScrollScribe">ScrollScribe</option>
                    <option value="ScrollEngineer">ScrollEngineer</option>
                    <option value="ScrollScholar">ScrollScholar</option>
                    <option value="ScrollBuilder">ScrollBuilder</option>
                  </select>
                </div>

                {/* Faculty Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faculty Type
                  </label>
                  <select
                    value={filters.facultyType || ''}
                    onChange={(e) => handleFilterChange('facultyType', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Faculty Types</option>
                    <option value="human">Human Faculty</option>
                    <option value="ai">AI Faculty</option>
                    <option value="prophetic">Prophetic Faculty</option>
                    <option value="angelic">Angelic Faculty</option>
                  </select>
                </div>

                {/* Student Cohort Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Cohort
                  </label>
                  <select
                    value={filters.studentCohort || ''}
                    onChange={(e) => handleFilterChange('studentCohort', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Cohorts</option>
                    <option value="2024-Q1">2024 Q1</option>
                    <option value="2024-Q2">2024 Q2</option>
                    <option value="2024-Q3">2024 Q3</option>
                    <option value="2024-Q4">2024 Q4</option>
                    <option value="2025-Q1">2025 Q1</option>
                  </select>
                </div>
              </div>

              {/* Filter Summary */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                
                {filters.region && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Region: {filters.region}
                    <button
                      onClick={() => handleFilterChange('region', '')}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {filters.careerPathway && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Pathway: {filters.careerPathway}
                    <button
                      onClick={() => handleFilterChange('careerPathway', '')}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {filters.facultyType && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Faculty: {filters.facultyType}
                    <button
                      onClick={() => handleFilterChange('facultyType', '')}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {filters.studentCohort && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Cohort: {filters.studentCohort}
                    <button
                      onClick={() => handleFilterChange('studentCohort', '')}
                      className="ml-1 text-yellow-600 hover:text-yellow-800"
                    >
                      ×
                    </button>
                  </span>
                )}

                {!filters.region && !filters.careerPathway && !filters.facultyType && !filters.studentCohort && (
                  <span className="text-sm text-gray-400">None</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FiltersPanel;