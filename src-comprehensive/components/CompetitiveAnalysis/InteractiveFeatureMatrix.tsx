/**
 * Interactive Feature Comparison Matrix Component
 * Implements task 4.3: Build interactive feature comparison matrix
 * Requirements: 3.2, 3.4 - Feature comparison and competitive advantage highlighting
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  FeatureComparisonMatrix, 
  FeatureComparison, 
  FeatureCategory, 
  CompetitiveAdvantage,
  FeatureCategoryComparison 
} from '../../types/competitive-analysis';

interface InteractiveFeatureMatrixProps {
  comparisonMatrix: FeatureComparisonMatrix;
  onFeatureSelect?: (feature: FeatureComparison) => void;
  onCategoryFilter?: (categories: FeatureCategory[]) => void;
  onAdvantageFilter?: (advantage: 'scrolluniversity' | 'learntube' | 'neutral' | 'all') => void;
}

interface FilterState {
  categories: FeatureCategory[];
  advantage: 'scrolluniversity' | 'learntube' | 'neutral' | 'all';
  searchTerm: string;
  strategicImportance: 'high' | 'medium' | 'low' | 'all';
  showOnlyUnique: boolean;
}

const CATEGORY_LABELS: Record<FeatureCategory, string> = {
  'core-education': 'Core Education',
  'ai-capabilities': 'AI Capabilities',
  'community-features': 'Community Features',
  'spiritual-formation': 'Spiritual Formation',
  'blockchain-integration': 'Blockchain Integration',
  'global-accessibility': 'Global Accessibility',
  'assessment-evaluation': 'Assessment & Evaluation',
  'credentialing': 'Credentialing',
  'economic-model': 'Economic Model',
  'xr-integration': 'XR Integration'
};

const ADVANTAGE_COLORS = {
  scrolluniversity: 'bg-green-100 border-green-500 text-green-800',
  learntube: 'bg-red-100 border-red-500 text-red-800',
  neutral: 'bg-gray-100 border-gray-500 text-gray-800'
};

const STRATEGIC_IMPORTANCE_COLORS = {
  high: 'bg-purple-100 text-purple-800',
  medium: 'bg-blue-100 text-blue-800',
  low: 'bg-gray-100 text-gray-800'
};

import { FeatureComparisonTable } from './FeatureComparisonTable';
import { FeatureComparisonCards } from './FeatureComparisonCards';
import { FeatureSuperioritySummary } from './FeatureSuperioritySummary';
import { FeatureDetailModal } from './FeatureDetailModal';

export const InteractiveFeatureMatrix: React.FC<InteractiveFeatureMatrixProps> = ({
  comparisonMatrix,
  onFeatureSelect,
  onCategoryFilter,
  onAdvantageFilter
}) => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    advantage: 'all',
    searchTerm: '',
    strategicImportance: 'all',
    showOnlyUnique: false
  });

  const [selectedFeature, setSelectedFeature] = useState<FeatureComparison | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'summary'>('table');

  // Filter and sort features based on current filters
  const filteredFeatures = useMemo(() => {
    let filtered = comparisonMatrix.detailedComparisons;

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(feature => filters.categories.includes(feature.category));
    }

    // Advantage filter
    if (filters.advantage !== 'all') {
      filtered = filtered.filter(feature => feature.competitiveAdvantage.platform === filters.advantage);
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(feature => 
        feature.featureName.toLowerCase().includes(searchLower) ||
        feature.competitiveAdvantage.reasoning.toLowerCase().includes(searchLower)
      );
    }

    // Strategic importance filter
    if (filters.strategicImportance !== 'all') {
      filtered = filtered.filter(feature => feature.strategicImportance === filters.strategicImportance);
    }

    // Show only unique features
    if (filters.showOnlyUnique) {
      filtered = filtered.filter(feature => 
        feature.scrollUniversity.uniqueAspects.length > 0 || 
        feature.learnTubeAI.uniqueAspects.length > 0
      );
    }

    return filtered.sort((a, b) => {
      // Sort by strategic importance first, then by advantage magnitude
      const importanceOrder = { high: 3, medium: 2, low: 1 };
      const magnitudeOrder = { significant: 3, moderate: 2, slight: 1 };
      
      if (a.strategicImportance !== b.strategicImportance) {
        return importanceOrder[b.strategicImportance] - importanceOrder[a.strategicImportance];
      }
      
      return magnitudeOrder[b.competitiveAdvantage.magnitude] - magnitudeOrder[a.competitiveAdvantage.magnitude];
    });
  }, [comparisonMatrix.detailedComparisons, filters]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredFeatures.length;
    const scrollAdvantage = filteredFeatures.filter(f => f.competitiveAdvantage.platform === 'scrolluniversity').length;
    const learntubeAdvantage = filteredFeatures.filter(f => f.competitiveAdvantage.platform === 'learntube').length;
    const neutral = filteredFeatures.filter(f => f.competitiveAdvantage.platform === 'neutral').length;
    const highImportance = filteredFeatures.filter(f => f.strategicImportance === 'high').length;
    const spiritualFeatures = filteredFeatures.filter(f => f.competitiveAdvantage.spiritualDimension).length;
    const kingdomImpact = filteredFeatures.filter(f => f.competitiveAdvantage.kingdomImpact).length;

    return {
      total,
      scrollAdvantage,
      learntubeAdvantage,
      neutral,
      highImportance,
      spiritualFeatures,
      kingdomImpact,
      scrollAdvantagePercent: total > 0 ? Math.round((scrollAdvantage / total) * 100) : 0,
      learntubeAdvantagePercent: total > 0 ? Math.round((learntubeAdvantage / total) * 100) : 0
    };
  }, [filteredFeatures]);

  const handleCategoryToggle = useCallback((category: FeatureCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    setFilters(prev => ({ ...prev, categories: newCategories }));
    onCategoryFilter?.(newCategories);
  }, [filters.categories, onCategoryFilter]);

  const handleAdvantageFilter = useCallback((advantage: 'scrolluniversity' | 'learntube' | 'neutral' | 'all') => {
    setFilters(prev => ({ ...prev, advantage }));
    onAdvantageFilter?.(advantage);
  }, [onAdvantageFilter]);

  const handleFeatureClick = useCallback((feature: FeatureComparison) => {
    setSelectedFeature(feature);
    onFeatureSelect?.(feature);
  }, [onFeatureSelect]);

  const renderCategoryOverview = () => (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {comparisonMatrix.categories.map((category) => (
        <div
          key={category.category}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            filters.categories.length === 0 || filters.categories.includes(category.category)
              ? ADVANTAGE_COLORS[category.advantage]
              : 'bg-gray-50 border-gray-200 opacity-50'
          }`}
          onClick={() => handleCategoryToggle(category.category)}
        >
          <h3 className="font-semibold text-sm mb-2">{CATEGORY_LABELS[category.category]}</h3>
          <div className="flex justify-between text-xs">
            <span>ScrollU: {category.scrollUniversityScore}</span>
            <span>LearnTube: {category.learnTubeAIScore}</span>
          </div>
          <div className="mt-2">
            <div className="text-xs font-medium">
              {category.advantage === 'scrolluniversity' ? '✓ ScrollUniversity Advantage' :
               category.advantage === 'learntube' ? '⚠ LearnTube Advantage' :
               '≈ Neutral'}
            </div>
            {category.keyDifferentiators.length > 0 && (
              <div className="mt-1 text-xs opacity-75">
                {category.keyDifferentiators[0]}
                {category.keyDifferentiators.length > 1 && ` +${category.keyDifferentiators.length - 1} more`}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderFilterControls = () => (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Features</label>
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            placeholder="Search features..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        {/* Advantage Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Competitive Advantage</label>
          <select
            value={filters.advantage}
            onChange={(e) => handleAdvantageFilter(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Features</option>
            <option value="scrolluniversity">ScrollUniversity Advantage</option>
            <option value="learntube">LearnTube Advantage</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>

        {/* Strategic Importance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Strategic Importance</label>
          <select
            value={filters.strategicImportance}
            onChange={(e) => setFilters(prev => ({ ...prev, strategicImportance: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Levels</option>
            <option value="high">High Importance</option>
            <option value="medium">Medium Importance</option>
            <option value="low">Low Importance</option>
          </select>
        </div>

        {/* View Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
          <div className="flex space-x-2">
            {(['table', 'cards', 'summary'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 text-xs rounded ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.showOnlyUnique}
            onChange={(e) => setFilters(prev => ({ ...prev, showOnlyUnique: e.target.checked }))}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Show only unique features</span>
        </label>
        
        <button
          onClick={() => setFilters({
            categories: [],
            advantage: 'all',
            searchTerm: '',
            strategicImportance: 'all',
            showOnlyUnique: false
          })}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );

  const renderSummaryStats = () => (
    <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      <div className="bg-white p-3 rounded-lg border text-center">
        <div className="text-2xl font-bold text-gray-900">{summaryStats.total}</div>
        <div className="text-xs text-gray-600">Total Features</div>
      </div>
      <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
        <div className="text-2xl font-bold text-green-800">{summaryStats.scrollAdvantage}</div>
        <div className="text-xs text-green-600">ScrollU Advantage</div>
        <div className="text-xs text-green-500">{summaryStats.scrollAdvantagePercent}%</div>
      </div>
      <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
        <div className="text-2xl font-bold text-red-800">{summaryStats.learntubeAdvantage}</div>
        <div className="text-xs text-red-600">LearnTube Advantage</div>
        <div className="text-xs text-red-500">{summaryStats.learntubeAdvantagePercent}%</div>
      </div>
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-gray-800">{summaryStats.neutral}</div>
        <div className="text-xs text-gray-600">Neutral</div>
      </div>
      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
        <div className="text-2xl font-bold text-purple-800">{summaryStats.highImportance}</div>
        <div className="text-xs text-purple-600">High Priority</div>
      </div>
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
        <div className="text-2xl font-bold text-blue-800">{summaryStats.spiritualFeatures}</div>
        <div className="text-xs text-blue-600">Spiritual Features</div>
      </div>
      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center">
        <div className="text-2xl font-bold text-yellow-800">{summaryStats.kingdomImpact}</div>
        <div className="text-xs text-yellow-600">Kingdom Impact</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Interactive Feature Comparison Matrix</h2>
        <div className="text-sm text-gray-600">
          Overall Score: ScrollUniversity {comparisonMatrix.overallScore.scrollUniversityTotal} - 
          LearnTube {comparisonMatrix.overallScore.learnTubeAITotal}
        </div>
      </div>

      {/* Category Overview */}
      {renderCategoryOverview()}

      {/* Filter Controls */}
      {renderFilterControls()}

      {/* Summary Statistics */}
      {renderSummaryStats()}

      {/* Main Content */}
      {viewMode === 'summary' ? (
        <FeatureSuperioritySummary 
          features={filteredFeatures} 
          overallScore={comparisonMatrix.overallScore}
        />
      ) : viewMode === 'cards' ? (
        <FeatureComparisonCards 
          features={filteredFeatures}
          onFeatureClick={handleFeatureClick}
          selectedFeature={selectedFeature}
        />
      ) : (
        <FeatureComparisonTable 
          features={filteredFeatures}
          onFeatureClick={handleFeatureClick}
          selectedFeature={selectedFeature}
        />
      )}

      {/* Feature Detail Modal */}
      {selectedFeature && (
        <FeatureDetailModal
          feature={selectedFeature}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </div>
  );
};