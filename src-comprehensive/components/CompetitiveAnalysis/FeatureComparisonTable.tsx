/**
 * Feature Comparison Table Component
 * Part of task 4.3: Build interactive feature comparison matrix
 * Provides detailed tabular view of feature comparisons
 */

import React from 'react';
import { FeatureComparison } from '../../types/competitive-analysis';

interface FeatureComparisonTableProps {
  features: FeatureComparison[];
  onFeatureClick: (feature: FeatureComparison) => void;
  selectedFeature: FeatureComparison | null;
}

const ADVANTAGE_COLORS = {
  scrolluniversity: 'bg-green-50 border-l-4 border-green-500',
  learntube: 'bg-red-50 border-l-4 border-red-500',
  neutral: 'bg-gray-50 border-l-4 border-gray-500'
};

const QUALITY_COLORS = {
  excellent: 'text-green-800 bg-green-100',
  good: 'text-blue-800 bg-blue-100',
  fair: 'text-yellow-800 bg-yellow-100',
  poor: 'text-red-800 bg-red-100',
  unavailable: 'text-gray-800 bg-gray-100'
};

const STRATEGIC_IMPORTANCE_COLORS = {
  high: 'bg-purple-100 text-purple-800',
  medium: 'bg-blue-100 text-blue-800',
  low: 'bg-gray-100 text-gray-800'
};

export const FeatureComparisonTable: React.FC<FeatureComparisonTableProps> = ({
  features,
  onFeatureClick,
  selectedFeature
}) => {
  const renderQualityBadge = (quality: string) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${QUALITY_COLORS[quality as keyof typeof QUALITY_COLORS]}`}>
      {quality.charAt(0).toUpperCase() + quality.slice(1)}
    </span>
  );

  const renderAvailabilityIcon = (available: boolean) => (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
      available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {available ? '✓' : '✗'}
    </span>
  );

  const renderAdvantageIndicator = (advantage: string, magnitude: string) => {
    const colors = {
      scrolluniversity: 'text-green-600',
      learntube: 'text-red-600',
      neutral: 'text-gray-600'
    };

    const magnitudeIcons = {
      significant: '●●●',
      moderate: '●●○',
      slight: '●○○'
    };

    return (
      <div className={`flex items-center space-x-1 ${colors[advantage as keyof typeof colors]}`}>
        <span className="text-xs font-medium">
          {advantage === 'scrolluniversity' ? 'ScrollU' : 
           advantage === 'learntube' ? 'LearnTube' : 'Neutral'}
        </span>
        <span className="text-xs">{magnitudeIcons[magnitude as keyof typeof magnitudeIcons]}</span>
      </div>
    );
  };

  const renderUniqueAspects = (aspects: string[]) => (
    <div className="space-y-1">
      {aspects.slice(0, 2).map((aspect, index) => (
        <div key={index} className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded">
          {aspect}
        </div>
      ))}
      {aspects.length > 2 && (
        <div className="text-xs text-gray-500">+{aspects.length - 2} more</div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feature
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ScrollUniversity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LearnTube.ai
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Advantage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Impact
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {features.map((feature, index) => (
              <tr
                key={`${feature.featureName}-${index}`}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedFeature?.featureName === feature.featureName ? 'bg-blue-50' : ''
                } ${ADVANTAGE_COLORS[feature.competitiveAdvantage.platform]}`}
                onClick={() => onFeatureClick(feature)}
              >
                {/* Feature Name */}
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {feature.featureName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 max-w-xs">
                    {feature.competitiveAdvantage.reasoning.substring(0, 100)}
                    {feature.competitiveAdvantage.reasoning.length > 100 && '...'}
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {feature.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </td>

                {/* ScrollUniversity */}
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {renderAvailabilityIcon(feature.scrollUniversity.available)}
                      {renderQualityBadge(feature.scrollUniversity.quality)}
                    </div>
                    {feature.scrollUniversity.uniqueAspects.length > 0 && (
                      <div className="max-w-xs">
                        {renderUniqueAspects(feature.scrollUniversity.uniqueAspects)}
                      </div>
                    )}
                    {feature.scrollUniversity.limitations.length > 0 && (
                      <div className="text-xs text-red-600">
                        {feature.scrollUniversity.limitations[0]}
                        {feature.scrollUniversity.limitations.length > 1 && ` +${feature.scrollUniversity.limitations.length - 1}`}
                      </div>
                    )}
                  </div>
                </td>

                {/* LearnTube.ai */}
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {renderAvailabilityIcon(feature.learnTubeAI.available)}
                      {renderQualityBadge(feature.learnTubeAI.quality)}
                    </div>
                    {feature.learnTubeAI.uniqueAspects.length > 0 && (
                      <div className="max-w-xs">
                        {renderUniqueAspects(feature.learnTubeAI.uniqueAspects)}
                      </div>
                    )}
                    {feature.learnTubeAI.limitations.length > 0 && (
                      <div className="text-xs text-red-600">
                        {feature.learnTubeAI.limitations[0]}
                        {feature.learnTubeAI.limitations.length > 1 && ` +${feature.learnTubeAI.limitations.length - 1}`}
                      </div>
                    )}
                  </div>
                </td>

                {/* Competitive Advantage */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {renderAdvantageIndicator(
                      feature.competitiveAdvantage.platform,
                      feature.competitiveAdvantage.magnitude
                    )}
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
                </td>

                {/* Strategic Importance */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    STRATEGIC_IMPORTANCE_COLORS[feature.strategicImportance]
                  }`}>
                    {feature.strategicImportance.charAt(0).toUpperCase() + feature.strategicImportance.slice(1)}
                  </span>
                </td>

                {/* Impact Indicators */}
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    {feature.competitiveAdvantage.spiritualDimension && (
                      <div className="text-xs text-purple-600 flex items-center">
                        <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
                        Spiritual Formation
                      </div>
                    )}
                    {feature.competitiveAdvantage.kingdomImpact && (
                      <div className="text-xs text-yellow-600 flex items-center">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                        Kingdom Building
                      </div>
                    )}
                    {!feature.competitiveAdvantage.spiritualDimension && !feature.competitiveAdvantage.kingdomImpact && (
                      <div className="text-xs text-gray-500">
                        Technical Only
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {features.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No features match the current filters</div>
          <div className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</div>
        </div>
      )}
    </div>
  );
};