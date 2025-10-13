/**
 * Feature Comparison Cards Component
 * Part of task 4.3: Build interactive feature comparison matrix
 * Provides card-based view of feature comparisons
 */

import React from 'react';
import { FeatureComparison } from '../../types/competitive-analysis';

interface FeatureComparisonCardsProps {
  features: FeatureComparison[];
  onFeatureClick: (feature: FeatureComparison) => void;
  selectedFeature: FeatureComparison | null;
}

const ADVANTAGE_COLORS = {
  scrolluniversity: 'border-green-500 bg-green-50',
  learntube: 'border-red-500 bg-red-50',
  neutral: 'border-gray-500 bg-gray-50'
};

const QUALITY_COLORS = {
  excellent: 'text-green-800 bg-green-100',
  good: 'text-blue-800 bg-blue-100',
  fair: 'text-yellow-800 bg-yellow-100',
  poor: 'text-red-800 bg-red-100',
  unavailable: 'text-gray-800 bg-gray-100'
};

const STRATEGIC_IMPORTANCE_COLORS = {
  high: 'bg-purple-500',
  medium: 'bg-blue-500',
  low: 'bg-gray-500'
};

export const FeatureComparisonCards: React.FC<FeatureComparisonCardsProps> = ({
  features,
  onFeatureClick,
  selectedFeature
}) => {
  const renderPlatformComparison = (
    platform: 'scrolluniversity' | 'learntube',
    data: { available: boolean; quality: string; uniqueAspects: string[]; limitations: string[] },
    platformName: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-gray-900">{platformName}</h4>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
            data.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {data.available ? '✓' : '✗'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            QUALITY_COLORS[data.quality as keyof typeof QUALITY_COLORS]
          }`}>
            {data.quality.charAt(0).toUpperCase() + data.quality.slice(1)}
          </span>
        </div>
      </div>

      {data.uniqueAspects.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-700">Unique Aspects:</div>
          {data.uniqueAspects.slice(0, 3).map((aspect, index) => (
            <div key={index} className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded">
              {aspect}
            </div>
          ))}
          {data.uniqueAspects.length > 3 && (
            <div className="text-xs text-gray-500">+{data.uniqueAspects.length - 3} more unique aspects</div>
          )}
        </div>
      )}

      {data.limitations.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-700">Limitations:</div>
          {data.limitations.slice(0, 2).map((limitation, index) => (
            <div key={index} className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded">
              {limitation}
            </div>
          ))}
          {data.limitations.length > 2 && (
            <div className="text-xs text-gray-500">+{data.limitations.length - 2} more limitations</div>
          )}
        </div>
      )}
    </div>
  );

  const renderAdvantageHeader = (feature: FeatureComparison) => {
    const { platform, magnitude } = feature.competitiveAdvantage;
    
    const advantageText = {
      scrolluniversity: 'ScrollUniversity Advantage',
      learntube: 'LearnTube Advantage',
      neutral: 'Neutral Feature'
    };

    const magnitudeIcons = {
      significant: '●●●',
      moderate: '●●○',
      slight: '●○○'
    };

    const advantageColors = {
      scrolluniversity: 'text-green-700 bg-green-100',
      learntube: 'text-red-700 bg-red-100',
      neutral: 'text-gray-700 bg-gray-100'
    };

    return (
      <div className={`flex items-center justify-between p-2 rounded-t-lg ${advantageColors[platform]}`}>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{advantageText[platform]}</span>
          <span className="text-xs">{magnitudeIcons[magnitude]}</span>
        </div>
        <div className="flex space-x-1">
          {feature.competitiveAdvantage.spiritualDimension && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Spiritual
            </span>
          )}
          {feature.competitiveAdvantage.kingdomImpact && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Kingdom
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <div
          key={`${feature.featureName}-${index}`}
          className={`bg-white rounded-lg shadow-md border-2 cursor-pointer transition-all hover:shadow-lg ${
            ADVANTAGE_COLORS[feature.competitiveAdvantage.platform]
          } ${selectedFeature?.featureName === feature.featureName ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => onFeatureClick(feature)}
        >
          {/* Advantage Header */}
          {renderAdvantageHeader(feature)}

          {/* Card Content */}
          <div className="p-4 space-y-4">
            {/* Feature Title and Category */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                  {feature.featureName}
                </h3>
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full ${STRATEGIC_IMPORTANCE_COLORS[feature.strategicImportance]}`}></div>
                  <span className="text-xs text-gray-600 capitalize">{feature.strategicImportance}</span>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {feature.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>

            {/* Competitive Reasoning */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs font-medium text-gray-700 mb-1">Competitive Analysis:</div>
              <div className="text-sm text-gray-800 leading-relaxed">
                {feature.competitiveAdvantage.reasoning}
              </div>
            </div>

            {/* Platform Comparisons */}
            <div className="grid grid-cols-1 gap-4">
              {renderPlatformComparison(
                'scrolluniversity',
                feature.scrollUniversity,
                'ScrollUniversity'
              )}
              
              <div className="border-t border-gray-200 pt-3">
                {renderPlatformComparison(
                  'learntube',
                  feature.learnTubeAI,
                  'LearnTube.ai'
                )}
              </div>
            </div>

            {/* Impact Indicators */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
              {feature.competitiveAdvantage.spiritualDimension && (
                <div className="flex items-center text-xs text-purple-600">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
                  Spiritual Formation Impact
                </div>
              )}
              {feature.competitiveAdvantage.kingdomImpact && (
                <div className="flex items-center text-xs text-yellow-600">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                  Kingdom Building Impact
                </div>
              )}
              {!feature.competitiveAdvantage.spiritualDimension && !feature.competitiveAdvantage.kingdomImpact && (
                <div className="flex items-center text-xs text-gray-500">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                  Technical Feature Only
                </div>
              )}
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Strategic Priority: {feature.strategicImportance.toUpperCase()}</span>
              <span>
                {feature.competitiveAdvantage.magnitude.charAt(0).toUpperCase() + 
                 feature.competitiveAdvantage.magnitude.slice(1)} Advantage
              </span>
            </div>
          </div>
        </div>
      ))}

      {features.length === 0 && (
        <div className="col-span-full text-center py-12">
          <div className="text-gray-500 text-lg">No features match the current filters</div>
          <div className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</div>
        </div>
      )}
    </div>
  );
};