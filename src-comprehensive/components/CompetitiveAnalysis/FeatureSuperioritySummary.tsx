/**
 * Feature Superiority Summary Component
 * Part of task 4.3: Build interactive feature comparison matrix
 * Generates comprehensive feature superiority reports
 */

import React, { useMemo } from 'react';
import { FeatureComparison, CompetitiveScore, FeatureCategory } from '../../types/competitive-analysis';

interface FeatureSuperioritySummaryProps {
  features: FeatureComparison[];
  overallScore: CompetitiveScore;
}

interface SuperiorityAnalysis {
  totalFeatures: number;
  scrollUniversityAdvantages: {
    significant: FeatureComparison[];
    moderate: FeatureComparison[];
    slight: FeatureComparison[];
  };
  learnTubeAdvantages: {
    significant: FeatureComparison[];
    moderate: FeatureComparison[];
    slight: FeatureComparison[];
  };
  neutralFeatures: FeatureComparison[];
  categoryBreakdown: Record<FeatureCategory, {
    scrollAdvantage: number;
    learntubeAdvantage: number;
    neutral: number;
    total: number;
  }>;
  spiritualFeatures: FeatureComparison[];
  kingdomImpactFeatures: FeatureComparison[];
  uniqueScrollFeatures: FeatureComparison[];
  competitiveGaps: FeatureComparison[];
  strategicRecommendations: {
    highPriority: FeatureComparison[];
    mediumPriority: FeatureComparison[];
    lowPriority: FeatureComparison[];
  };
}

export const FeatureSuperioritySummary: React.FC<FeatureSuperioritySummaryProps> = ({
  features,
  overallScore
}) => {
  const analysis = useMemo((): SuperiorityAnalysis => {
    const scrollUniversityAdvantages = {
      significant: features.filter(f => f.competitiveAdvantage.platform === 'scrolluniversity' && f.competitiveAdvantage.magnitude === 'significant'),
      moderate: features.filter(f => f.competitiveAdvantage.platform === 'scrolluniversity' && f.competitiveAdvantage.magnitude === 'moderate'),
      slight: features.filter(f => f.competitiveAdvantage.platform === 'scrolluniversity' && f.competitiveAdvantage.magnitude === 'slight')
    };

    const learnTubeAdvantages = {
      significant: features.filter(f => f.competitiveAdvantage.platform === 'learntube' && f.competitiveAdvantage.magnitude === 'significant'),
      moderate: features.filter(f => f.competitiveAdvantage.platform === 'learntube' && f.competitiveAdvantage.magnitude === 'moderate'),
      slight: features.filter(f => f.competitiveAdvantage.platform === 'learntube' && f.competitiveAdvantage.magnitude === 'slight')
    };

    const neutralFeatures = features.filter(f => f.competitiveAdvantage.platform === 'neutral');

    // Category breakdown
    const categoryBreakdown: Record<FeatureCategory, any> = {} as any;
    const categories = [...new Set(features.map(f => f.category))];
    
    categories.forEach(category => {
      const categoryFeatures = features.filter(f => f.category === category);
      categoryBreakdown[category] = {
        scrollAdvantage: categoryFeatures.filter(f => f.competitiveAdvantage.platform === 'scrolluniversity').length,
        learntubeAdvantage: categoryFeatures.filter(f => f.competitiveAdvantage.platform === 'learntube').length,
        neutral: categoryFeatures.filter(f => f.competitiveAdvantage.platform === 'neutral').length,
        total: categoryFeatures.length
      };
    });

    const spiritualFeatures = features.filter(f => f.competitiveAdvantage.spiritualDimension);
    const kingdomImpactFeatures = features.filter(f => f.competitiveAdvantage.kingdomImpact);
    const uniqueScrollFeatures = features.filter(f => 
      f.competitiveAdvantage.platform === 'scrolluniversity' && 
      f.scrollUniversity.uniqueAspects.length > 0 &&
      !f.learnTubeAI.available
    );
    const competitiveGaps = features.filter(f => 
      f.competitiveAdvantage.platform === 'learntube' && 
      f.strategicImportance === 'high'
    );

    const strategicRecommendations = {
      highPriority: features.filter(f => f.strategicImportance === 'high'),
      mediumPriority: features.filter(f => f.strategicImportance === 'medium'),
      lowPriority: features.filter(f => f.strategicImportance === 'low')
    };

    return {
      totalFeatures: features.length,
      scrollUniversityAdvantages,
      learnTubeAdvantages,
      neutralFeatures,
      categoryBreakdown,
      spiritualFeatures,
      kingdomImpactFeatures,
      uniqueScrollFeatures,
      competitiveGaps,
      strategicRecommendations
    };
  }, [features]);

  const renderScoreCard = () => (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Overall Competitive Score</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{overallScore.scrollUniversityTotal}</div>
          <div className="text-sm text-gray-600">ScrollUniversity Score</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600">{overallScore.learnTubeAITotal}</div>
          <div className="text-sm text-gray-600">LearnTube.ai Score</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{Math.round(overallScore.confidenceLevel * 100)}%</div>
          <div className="text-sm text-gray-600">Confidence Level</div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          overallScore.overallAdvantage === 'scrolluniversity' 
            ? 'bg-green-100 text-green-800' 
            : overallScore.overallAdvantage === 'learntube'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {overallScore.overallAdvantage === 'scrolluniversity' 
            ? '🏆 ScrollUniversity Dominance' 
            : overallScore.overallAdvantage === 'learntube'
            ? '⚠️ LearnTube Advantage'
            : '⚖️ Competitive Balance'}
        </span>
      </div>
    </div>
  );

  const renderAdvantageBreakdown = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* ScrollUniversity Advantages */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-lg font-bold text-green-800 mb-4">ScrollUniversity Advantages</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-700">Significant Advantages</span>
            <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-sm font-bold">
              {analysis.scrollUniversityAdvantages.significant.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-700">Moderate Advantages</span>
            <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-sm font-bold">
              {analysis.scrollUniversityAdvantages.moderate.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-700">Slight Advantages</span>
            <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-sm font-bold">
              {analysis.scrollUniversityAdvantages.slight.length}
            </span>
          </div>
          <div className="border-t border-green-300 pt-2 mt-3">
            <div className="flex justify-between items-center font-bold">
              <span className="text-green-800">Total Advantages</span>
              <span className="bg-green-600 text-white px-3 py-1 rounded-full">
                {analysis.scrollUniversityAdvantages.significant.length + 
                 analysis.scrollUniversityAdvantages.moderate.length + 
                 analysis.scrollUniversityAdvantages.slight.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LearnTube Advantages */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <h3 className="text-lg font-bold text-red-800 mb-4">LearnTube.ai Advantages</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-red-700">Significant Advantages</span>
            <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-sm font-bold">
              {analysis.learnTubeAdvantages.significant.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-red-700">Moderate Advantages</span>
            <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-sm font-bold">
              {analysis.learnTubeAdvantages.moderate.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-red-700">Slight Advantages</span>
            <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-sm font-bold">
              {analysis.learnTubeAdvantages.slight.length}
            </span>
          </div>
          <div className="border-t border-red-300 pt-2 mt-3">
            <div className="flex justify-between items-center font-bold">
              <span className="text-red-800">Total Advantages</span>
              <span className="bg-red-600 text-white px-3 py-1 rounded-full">
                {analysis.learnTubeAdvantages.significant.length + 
                 analysis.learnTubeAdvantages.moderate.length + 
                 analysis.learnTubeAdvantages.slight.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategoryBreakdown = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Category-wise Competitive Analysis</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ScrollU Advantage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LearnTube Advantage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Neutral
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Features
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dominance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(analysis.categoryBreakdown).map(([category, data]) => {
              const dominance = data.scrollAdvantage > data.learntubeAdvantage ? 'ScrollU' :
                              data.learntubeAdvantage > data.scrollAdvantage ? 'LearnTube' : 'Balanced';
              const dominanceColor = dominance === 'ScrollU' ? 'text-green-600' :
                                   dominance === 'LearnTube' ? 'text-red-600' : 'text-gray-600';
              
              return (
                <tr key={category}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {data.scrollAdvantage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {data.learntubeAdvantage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {data.neutral}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {data.total}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${dominanceColor}`}>
                    {dominance}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUniqueFeatures = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Spiritual & Kingdom Features */}
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
        <h3 className="text-lg font-bold text-purple-800 mb-4">Spiritual & Kingdom Impact Features</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-purple-700">Spiritual Formation Features</span>
            <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-sm font-bold">
              {analysis.spiritualFeatures.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-purple-700">Kingdom Impact Features</span>
            <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-sm font-bold">
              {analysis.kingdomImpactFeatures.length}
            </span>
          </div>
          <div className="mt-3 text-xs text-purple-600">
            These features represent ScrollUniversity's unique spiritual dimension that no competitor can match.
          </div>
        </div>
      </div>

      {/* Unique ScrollUniversity Features */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-4">Exclusive ScrollUniversity Features</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-700">Unique Features</span>
            <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-sm font-bold">
              {analysis.uniqueScrollFeatures.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-700">Competitive Gaps</span>
            <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-sm font-bold">
              {analysis.competitiveGaps.length}
            </span>
          </div>
          <div className="mt-3 text-xs text-blue-600">
            Features that only ScrollUniversity offers, giving us exclusive market positioning.
          </div>
        </div>
      </div>
    </div>
  );

  const renderStrategicRecommendations = () => (
    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mb-6">
      <h3 className="text-lg font-bold text-yellow-800 mb-4">Strategic Priority Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{analysis.strategicRecommendations.highPriority.length}</div>
          <div className="text-sm text-gray-600">High Priority Features</div>
          <div className="text-xs text-gray-500 mt-1">Immediate attention required</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{analysis.strategicRecommendations.mediumPriority.length}</div>
          <div className="text-sm text-gray-600">Medium Priority Features</div>
          <div className="text-xs text-gray-500 mt-1">Plan for next quarter</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{analysis.strategicRecommendations.lowPriority.length}</div>
          <div className="text-sm text-gray-600">Low Priority Features</div>
          <div className="text-xs text-gray-500 mt-1">Future consideration</div>
        </div>
      </div>
    </div>
  );

  const renderKeyInsights = () => {
    const totalScrollAdvantages = analysis.scrollUniversityAdvantages.significant.length + 
                                 analysis.scrollUniversityAdvantages.moderate.length + 
                                 analysis.scrollUniversityAdvantages.slight.length;
    const totalLearnTubeAdvantages = analysis.learnTubeAdvantages.significant.length + 
                                    analysis.learnTubeAdvantages.moderate.length + 
                                    analysis.learnTubeAdvantages.slight.length;
    
    const advantageRatio = totalScrollAdvantages / (totalLearnTubeAdvantages || 1);
    const spiritualAdvantage = (analysis.spiritualFeatures.length / analysis.totalFeatures) * 100;
    const uniquenessScore = (analysis.uniqueScrollFeatures.length / analysis.totalFeatures) * 100;

    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Competitive Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Competitive Dominance</h4>
              <div className="text-2xl font-bold text-green-600">{advantageRatio.toFixed(1)}:1</div>
              <div className="text-sm text-gray-600">ScrollUniversity to LearnTube advantage ratio</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Spiritual Differentiation</h4>
              <div className="text-2xl font-bold text-purple-600">{Math.round(spiritualAdvantage)}%</div>
              <div className="text-sm text-gray-600">Features with spiritual dimension</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Market Uniqueness</h4>
              <div className="text-2xl font-bold text-blue-600">{Math.round(uniquenessScore)}%</div>
              <div className="text-sm text-gray-600">Exclusive ScrollUniversity features</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Strategic Position</h4>
              <div className="text-lg font-bold text-green-600">
                {overallScore.overallAdvantage === 'scrolluniversity' ? 'DOMINANT' : 
                 overallScore.overallAdvantage === 'learntube' ? 'CHALLENGED' : 'COMPETITIVE'}
              </div>
              <div className="text-sm text-gray-600">Overall market position</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Feature Superiority Analysis Report</h2>
        <p className="text-gray-600 mt-2">Comprehensive competitive analysis of {analysis.totalFeatures} features</p>
      </div>

      {renderScoreCard()}
      {renderAdvantageBreakdown()}
      {renderCategoryBreakdown()}
      {renderUniqueFeatures()}
      {renderStrategicRecommendations()}
      {renderKeyInsights()}
    </div>
  );
};