/**
 * Feature Detail Modal Component
 * Part of task 4.3: Build interactive feature comparison matrix
 * Provides detailed view of individual feature comparisons
 */

import React from 'react';
import { FeatureComparison } from '../../types/competitive-analysis';

interface FeatureDetailModalProps {
  feature: FeatureComparison;
  onClose: () => void;
}

const ADVANTAGE_COLORS = {
  scrolluniversity: 'bg-green-100 border-green-500 text-green-800',
  learntube: 'bg-red-100 border-red-500 text-red-800',
  neutral: 'bg-gray-100 border-gray-500 text-gray-800'
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

export const FeatureDetailModal: React.FC<FeatureDetailModalProps> = ({
  feature,
  onClose
}) => {
  const renderPlatformDetails = (
    platformName: string,
    data: { available: boolean; quality: string; uniqueAspects: string[]; limitations: string[] },
    isPrimary: boolean = false
  ) => (
    <div className={`p-6 rounded-lg border-2 ${isPrimary ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{platformName}</h3>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
            data.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {data.available ? '✓' : '✗'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            QUALITY_COLORS[data.quality as keyof typeof QUALITY_COLORS]
          }`}>
            {data.quality.charAt(0).toUpperCase() + data.quality.slice(1)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Availability Status */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Availability Status</h4>
          <div className={`p-3 rounded-lg ${data.available ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {data.available ? 'Feature is available and functional' : 'Feature is not available or not implemented'}
          </div>
        </div>

        {/* Unique Aspects */}
        {data.uniqueAspects.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Unique Aspects & Differentiators</h4>
            <div className="space-y-2">
              {data.uniqueAspects.map((aspect, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                  <div className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm flex-1">
                    {aspect}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Limitations */}
        {data.limitations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Known Limitations</h4>
            <div className="space-y-2">
              {data.limitations.map((limitation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></span>
                  <div className="bg-red-50 text-red-800 px-3 py-2 rounded-lg text-sm flex-1">
                    {limitation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No unique aspects or limitations */}
        {data.uniqueAspects.length === 0 && data.limitations.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No specific unique aspects or limitations documented for this platform.
          </div>
        )}
      </div>
    </div>
  );

  const renderCompetitiveAnalysis = () => (
    <div className={`p-6 rounded-lg border-2 ${ADVANTAGE_COLORS[feature.competitiveAdvantage.platform]}`}>
      <h3 className="text-xl font-bold mb-4">Competitive Analysis</h3>
      
      <div className="space-y-4">
        {/* Advantage Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {feature.competitiveAdvantage.platform === 'scrolluniversity' ? 'ScrollUniversity' :
               feature.competitiveAdvantage.platform === 'learntube' ? 'LearnTube.ai' : 'Neutral'}
            </div>
            <div className="text-sm text-gray-600">Platform Advantage</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 capitalize">
              {feature.competitiveAdvantage.magnitude}
            </div>
            <div className="text-sm text-gray-600">Advantage Magnitude</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${STRATEGIC_IMPORTANCE_COLORS[feature.strategicImportance]}`}></div>
              <span className="text-lg font-bold text-gray-900 capitalize">{feature.strategicImportance}</span>
            </div>
            <div className="text-sm text-gray-600">Strategic Priority</div>
          </div>
        </div>

        {/* Detailed Reasoning */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Competitive Reasoning</h4>
          <div className="bg-gray-50 p-4 rounded-lg text-gray-800 leading-relaxed">
            {feature.competitiveAdvantage.reasoning}
          </div>
        </div>

        {/* Impact Dimensions */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Impact Dimensions</h4>
          <div className="flex flex-wrap gap-3">
            {feature.competitiveAdvantage.spiritualDimension && (
              <div className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-3 py-2 rounded-lg">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                <span className="text-sm font-medium">Spiritual Formation Impact</span>
              </div>
            )}
            {feature.competitiveAdvantage.kingdomImpact && (
              <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="text-sm font-medium">Kingdom Building Impact</span>
              </div>
            )}
            {!feature.competitiveAdvantage.spiritualDimension && !feature.competitiveAdvantage.kingdomImpact && (
              <div className="flex items-center space-x-2 bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                <span className="text-sm font-medium">Technical Feature Only</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeatureMetadata = () => (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Feature Metadata</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Category</h4>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {feature.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Strategic Importance</h4>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${STRATEGIC_IMPORTANCE_COLORS[feature.strategicImportance]}`}></div>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {feature.strategicImportance} Priority
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{feature.featureName}</h2>
            <p className="text-gray-600 mt-1">Detailed Feature Comparison Analysis</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Feature Metadata */}
          {renderFeatureMetadata()}

          {/* Competitive Analysis */}
          {renderCompetitiveAnalysis()}

          {/* Platform Comparisons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderPlatformDetails('ScrollUniversity', feature.scrollUniversity, true)}
            {renderPlatformDetails('LearnTube.ai', feature.learnTubeAI)}
          </div>

          {/* Strategic Recommendations */}
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-xl font-bold text-yellow-800 mb-4">Strategic Recommendations</h3>
            <div className="space-y-3">
              {feature.competitiveAdvantage.platform === 'scrolluniversity' && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">✓ Leverage This Advantage</h4>
                  <p className="text-green-700 text-sm">
                    This feature gives ScrollUniversity a competitive edge. Consider highlighting it in marketing 
                    materials and continue to enhance its capabilities to maintain the advantage.
                  </p>
                </div>
              )}
              
              {feature.competitiveAdvantage.platform === 'learntube' && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">⚠ Address This Gap</h4>
                  <p className="text-red-700 text-sm">
                    LearnTube.ai has an advantage in this area. Consider prioritizing improvements or 
                    alternative approaches to close this competitive gap.
                  </p>
                </div>
              )}

              {feature.competitiveAdvantage.platform === 'neutral' && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">≈ Opportunity for Differentiation</h4>
                  <p className="text-blue-700 text-sm">
                    Both platforms have similar capabilities. This presents an opportunity to create 
                    differentiation through unique implementation or additional features.
                  </p>
                </div>
              )}

              {feature.strategicImportance === 'high' && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">🎯 High Strategic Priority</h4>
                  <p className="text-purple-700 text-sm">
                    This feature is strategically important for competitive positioning. Allocate appropriate 
                    resources and attention to ensure optimal implementation and performance.
                  </p>
                </div>
              )}

              {feature.competitiveAdvantage.spiritualDimension && (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-800 mb-2">🙏 Spiritual Dimension</h4>
                  <p className="text-indigo-700 text-sm">
                    This feature has spiritual formation implications. Ensure alignment with ScrollUniversity's 
                    Christ-centered mission and consider how it contributes to holistic student development.
                  </p>
                </div>
              )}

              {feature.competitiveAdvantage.kingdomImpact && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2">👑 Kingdom Impact</h4>
                  <p className="text-amber-700 text-sm">
                    This feature contributes to kingdom building and global transformation. Emphasize its role 
                    in training scroll sons to govern nations and build righteous systems.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};