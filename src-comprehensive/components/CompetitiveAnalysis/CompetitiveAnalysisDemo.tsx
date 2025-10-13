/**
 * Competitive Analysis Demo Component
 * Demonstrates task 4.3: Build interactive feature comparison matrix
 * Shows the complete interactive feature comparison system
 */

import React, { useState, useEffect } from 'react';
import { InteractiveFeatureMatrix } from './InteractiveFeatureMatrix';
import { CompetitiveAnalysisMatrixService } from '../../services/CompetitiveAnalysisMatrixService';
import { FeatureComparisonMatrix, FeatureComparison, FeatureCategory } from '../../types/competitive-analysis';

export const CompetitiveAnalysisDemo: React.FC = () => {
  const [comparisonMatrix, setComparisonMatrix] = useState<FeatureComparisonMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<FeatureComparison | null>(null);
  const [filteredCategories, setFilteredCategories] = useState<FeatureCategory[]>([]);
  const [advantageFilter, setAdvantageFilter] = useState<'scrolluniversity' | 'learntube' | 'neutral' | 'all'>('all');

  const matrixService = new CompetitiveAnalysisMatrixService();

  useEffect(() => {
    // Simulate loading competitive analysis data
    const loadData = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would fetch from an API
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        const matrix = matrixService.generateFeatureComparisonMatrix();
        setComparisonMatrix(matrix);
      } catch (error) {
        console.error('Error loading competitive analysis data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFeatureSelect = (feature: FeatureComparison) => {
    setSelectedFeature(feature);
    console.log('Selected feature:', feature.featureName);
  };

  const handleCategoryFilter = (categories: FeatureCategory[]) => {
    setFilteredCategories(categories);
    console.log('Filtered categories:', categories);
  };

  const handleAdvantageFilter = (advantage: 'scrolluniversity' | 'learntube' | 'neutral' | 'all') => {
    setAdvantageFilter(advantage);
    console.log('Advantage filter:', advantage);
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Competitive Analysis</h2>
        <p className="text-gray-600">Generating comprehensive feature comparison matrix...</p>
      </div>
    </div>
  );

  const renderHeader = () => (
    <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            ScrollUniversity vs LearnTube.ai
          </h1>
          <p className="text-xl opacity-90 mb-6">
            Interactive Feature Comparison Matrix
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl font-bold">
                {comparisonMatrix?.detailedComparisons.length || 0}
              </div>
              <div className="text-sm opacity-90">Features Analyzed</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl font-bold">
                {comparisonMatrix?.categories.length || 0}
              </div>
              <div className="text-sm opacity-90">Feature Categories</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl font-bold">
                {comparisonMatrix?.overallScore.scrollUniversityTotal || 0} - {comparisonMatrix?.overallScore.learnTubeAITotal || 0}
              </div>
              <div className="text-sm opacity-90">Overall Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKeyInsights = () => {
    if (!comparisonMatrix) return null;

    const scrollAdvantages = comparisonMatrix.detailedComparisons.filter(f => 
      f.competitiveAdvantage.platform === 'scrolluniversity'
    ).length;
    
    const spiritualFeatures = comparisonMatrix.detailedComparisons.filter(f => 
      f.competitiveAdvantage.spiritualDimension
    ).length;
    
    const kingdomFeatures = comparisonMatrix.detailedComparisons.filter(f => 
      f.competitiveAdvantage.kingdomImpact
    ).length;

    return (
      <div className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Key Competitive Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">{scrollAdvantages}</div>
              <div className="text-sm text-green-800 font-medium">ScrollUniversity Advantages</div>
              <div className="text-xs text-green-600 mt-1">
                Out of {comparisonMatrix.detailedComparisons.length} features
              </div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">{spiritualFeatures}</div>
              <div className="text-sm text-purple-800 font-medium">Spiritual Formation Features</div>
              <div className="text-xs text-purple-600 mt-1">
                Unique to ScrollUniversity
              </div>
            </div>
            <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{kingdomFeatures}</div>
              <div className="text-sm text-yellow-800 font-medium">Kingdom Impact Features</div>
              <div className="text-xs text-yellow-600 mt-1">
                Global transformation focus
              </div>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round((comparisonMatrix.overallScore.confidenceLevel || 0) * 100)}%
              </div>
              <div className="text-sm text-blue-800 font-medium">Analysis Confidence</div>
              <div className="text-xs text-blue-600 mt-1">
                Based on comprehensive research
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFooter = () => (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ScrollUniversity: The Clear Leader in AI-Powered Education
          </h3>
          <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
            This comprehensive analysis demonstrates ScrollUniversity's revolutionary approach to education, 
            combining cutting-edge technology with spiritual formation to create leaders who will transform nations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm border">
              <span className="text-sm font-medium text-gray-900">✓ Prophetic AI Integration</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm border">
              <span className="text-sm font-medium text-gray-900">✓ Blockchain Credentials</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm border">
              <span className="text-sm font-medium text-gray-900">✓ Global Accessibility</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm border">
              <span className="text-sm font-medium text-gray-900">✓ Kingdom Economy</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm border">
              <span className="text-sm font-medium text-gray-900">✓ Spiritual Formation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return renderLoadingState();
  }

  if (!comparisonMatrix) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">Unable to load competitive analysis data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      {renderKeyInsights()}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <InteractiveFeatureMatrix
          comparisonMatrix={comparisonMatrix}
          onFeatureSelect={handleFeatureSelect}
          onCategoryFilter={handleCategoryFilter}
          onAdvantageFilter={handleAdvantageFilter}
        />
      </div>

      {renderFooter()}
    </div>
  );
};