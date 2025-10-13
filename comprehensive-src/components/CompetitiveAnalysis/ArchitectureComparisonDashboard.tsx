/**
 * Architecture Comparison Dashboard Component
 * Task 2.3: Build architecture comparison visualization system
 * Requirements: 1.3, 1.4 - Create side-by-side displays and technical superiority reports
 */

import React, { useState, useEffect } from 'react';
import {
  ArchitectureVisualization,
  ArchitectureMetrics,
  ScalabilityComparison,
  IntegrationComparison,
  TechnicalSuperiorityReport
} from '../../types/competitive-analysis';
import { ArchitectureComparisonVisualizationService } from '../../services/ArchitectureComparisonVisualizationService';
import { CompetitiveAnalysisEngine } from '../../services/CompetitiveAnalysisEngine';

interface ArchitectureComparisonDashboardProps {
  analysisId?: string;
  comparisonType?: 'side-by-side' | 'overlay' | 'matrix';
  includeSpiritual?: boolean;
  focusAreas?: string[];
}

export const ArchitectureComparisonDashboard: React.FC<ArchitectureComparisonDashboardProps> = ({
  analysisId,
  comparisonType = 'side-by-side',
  includeSpiritual = true,
  focusAreas = []
}) => {
  const [visualization, setVisualization] = useState<ArchitectureVisualization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'scalability' | 'integration' | 'superiority'>('overview');
  const [selectedFilter, setSelectedFilter] = useState<string>('All Categories');

  const visualizationService = new ArchitectureComparisonVisualizationService();
  const analysisEngine = new CompetitiveAnalysisEngine();

  useEffect(() => {
    loadVisualization();
  }, [analysisId, comparisonType, includeSpiritual, focusAreas]);

  const loadVisualization = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Get or generate competitive analysis
      let analysis;
      if (analysisId) {
        analysis = await analysisEngine.getAnalysis(analysisId);
      } else {
        analysis = await analysisEngine.generateCompetitiveAnalysis();
      }

      if (!analysis) {
        throw new Error('Failed to load competitive analysis');
      }

      // Generate architecture visualization
      const viz = await visualizationService.generateArchitectureVisualization(analysis, {
        comparisonType,
        includeSpiritual,
        focusAreas
      });

      setVisualization(viz);
    } catch (err) {
      console.error('Error loading architecture visualization:', err);
      setError(err instanceof Error ? err.message : 'Failed to load visualization');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter: string): void => {
    setSelectedFilter(filter);
    // Filter logic would be implemented here
  };

  const handleExport = async (format: 'json' | 'png' | 'svg' | 'pdf'): Promise<void> => {
    if (!visualization) return;

    try {
      const exportData = await visualizationService.exportVisualization(visualization.id, format);
      
      // Create download link
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `architecture-comparison.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Loading architecture comparison...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Visualization</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadVisualization}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!visualization) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No visualization data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Architecture Comparison Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              ScrollUniversity vs LearnTube.ai Technical Architecture Analysis
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('json')}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex space-x-4">
          <select
            value={selectedFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {visualization.visualizationData.interactiveElements
              .find(el => el.type === 'filter')?.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
          </select>
          <div className="text-sm text-gray-500 flex items-center">
            Generated: {visualization.generatedAt.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'scalability', label: 'Scalability', icon: '🌐' },
              { id: 'integration', label: 'Integration', icon: '🔗' },
              { id: 'superiority', label: 'Technical Report', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab visualization={visualization} />
          )}
          {activeTab === 'scalability' && (
            <ScalabilityTab comparison={visualization.scalabilityComparison} />
          )}
          {activeTab === 'integration' && (
            <IntegrationTab comparison={visualization.integrationComparison} />
          )}
          {activeTab === 'superiority' && (
            <SuperiorityReportTab report={visualization.technicalSuperiorityReport} />
          )}
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ visualization: ArchitectureVisualization }> = ({ visualization }) => {
  const { scrollUniversity, learnTubeAI } = visualization.platforms;

  return (
    <div className="space-y-6">
      {/* Platform Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlatformCard
          platform={scrollUniversity}
          title="ScrollUniversity"
          color="blue"
          isWinner={true}
        />
        <PlatformCard
          platform={learnTubeAI}
          title="LearnTube.ai"
          color="red"
          isWinner={false}
        />
      </div>

      {/* Architecture Radar Chart */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Architecture Capabilities Radar</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-500">
            📊 Radar Chart Visualization
            <br />
            <small>(Chart.js integration would render here)</small>
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">Technical Feature Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visualization.visualizationData.matrices[0]?.data.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {visualization.visualizationData.matrices[0]?.rows[index]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      row[0]?.toString().includes('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {row[0]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      row[1]?.toString().includes('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {row[1]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {row[2]}
                    </span>
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

// Platform Card Component
const PlatformCard: React.FC<{
  platform: ArchitectureMetrics;
  title: string;
  color: 'blue' | 'red';
  isWinner: boolean;
}> = ({ platform, title, color, isWinner }) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    red: 'border-red-200 bg-red-50'
  };

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color]} ${isWinner ? 'ring-2 ring-yellow-400' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {isWinner && <span className="text-yellow-600">👑 Winner</span>}
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-600">Overall Score</div>
          <div className="text-2xl font-bold">{platform.overallScore.toFixed(1)}/100</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-600">Architecture Type</div>
          <div className="font-medium">{platform.architectureType}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(platform.categoryScores).map(([category, score]) => (
            <div key={category} className="flex justify-between">
              <span className="capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}:</span>
              <span className="font-medium">{score.toFixed(0)}</span>
            </div>
          ))}
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-2">Key Advantages</div>
          <div className="space-y-1">
            {platform.uniqueAdvantages.slice(0, 3).map((advantage, index) => (
              <div key={index} className="text-xs bg-white rounded px-2 py-1">
                ✓ {advantage}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Scalability Tab Component
const ScalabilityTab: React.FC<{ comparison: ScalabilityComparison }> = ({ comparison }) => {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-green-600 text-xl mr-2">🏆</span>
          <div>
            <h3 className="font-semibold text-green-800">Scalability Winner: ScrollUniversity</h3>
            <p className="text-green-700 text-sm">Revolutionary mesh networking and offline-first architecture</p>
          </div>
        </div>
      </div>

      {/* Scalability Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(comparison.metrics).map(([metricName, metric]) => (
          <div key={metricName} className="bg-white border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 capitalize">
              {metricName.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600">ScrollUniversity</span>
                <span className="font-semibold">{metric.scrollUniversity.score}/100</span>
              </div>
              <div className="text-xs text-gray-600">{metric.scrollUniversity.description}</div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600">LearnTube.ai</span>
                <span className="font-semibold">{metric.learnTubeAI.score}/100</span>
              </div>
              <div className="text-xs text-gray-600">{metric.learnTubeAI.description}</div>
              
              <div className={`text-xs font-medium ${
                metric.winner === 'scrolluniversity' ? 'text-green-600' : 
                metric.winner === 'learntube' ? 'text-red-600' : 'text-gray-600'
              }`}>
                Winner: {metric.winner === 'scrolluniversity' ? 'ScrollUniversity' : 
                        metric.winner === 'learntube' ? 'LearnTube.ai' : 'Tie'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Differentiators */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Key Scalability Differentiators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comparison.keyDifferentiators.map((differentiator, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm">{differentiator}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-800 mb-4">ScrollUniversity Technical Details</h4>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Architecture:</span> {comparison.technicalDetails.scrollUniversity.architecture}
            </div>
            <div>
              <span className="font-medium">Global Infrastructure:</span>
              <ul className="mt-1 ml-4 list-disc">
                {comparison.technicalDetails.scrollUniversity.globalInfrastructure.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-medium">Performance Metrics:</span>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {Object.entries(comparison.technicalDetails.scrollUniversity.performanceMetrics).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    {key}: {value}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h4 className="font-semibold text-red-800 mb-4">LearnTube.ai Technical Details</h4>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Architecture:</span> {comparison.technicalDetails.learnTubeAI.architecture}
            </div>
            <div>
              <span className="font-medium">Global Infrastructure:</span>
              <ul className="mt-1 ml-4 list-disc">
                {comparison.technicalDetails.learnTubeAI.globalInfrastructure.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-medium">Performance Metrics:</span>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {Object.entries(comparison.technicalDetails.learnTubeAI.performanceMetrics).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    {key}: {value}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Integration Tab Component
const IntegrationTab: React.FC<{ comparison: IntegrationComparison }> = ({ comparison }) => {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-green-600 text-xl mr-2">🔗</span>
          <div>
            <h3 className="font-semibold text-green-800">Integration Winner: ScrollUniversity</h3>
            <p className="text-green-700 text-sm">31+ integrated systems with blockchain foundation</p>
          </div>
        </div>
      </div>

      {/* Integration Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(comparison.metrics).map(([metricName, metric]) => (
          <div key={metricName} className="bg-white border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 capitalize">
              {metricName.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600">ScrollUniversity</span>
                <span className="font-semibold">{metric.scrollUniversity.score}/100</span>
              </div>
              <div className="text-xs text-gray-600">{metric.scrollUniversity.description}</div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600">LearnTube.ai</span>
                <span className="font-semibold">{metric.learnTubeAI.score}/100</span>
              </div>
              <div className="text-xs text-gray-600">{metric.learnTubeAI.description}</div>
              
              <div className={`text-xs font-medium ${
                metric.winner === 'scrolluniversity' ? 'text-green-600' : 
                metric.winner === 'learntube' ? 'text-red-600' : 'text-gray-600'
              }`}>
                Winner: {metric.winner === 'scrolluniversity' ? 'ScrollUniversity' : 
                        metric.winner === 'learntube' ? 'LearnTube.ai' : 'Tie'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Architecture Diagram */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Integration Architecture</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-gray-500 text-center">
            🏗️ Integration Architecture Diagram
            <br />
            <small>(Mermaid diagram would render here)</small>
          </div>
        </div>
      </div>

      {/* Technical Integration Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-800 mb-4">ScrollUniversity Integrations</h4>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">API Count:</span> {comparison.technicalDetails.scrollUniversity.apiCount}
            </div>
            <div>
              <span className="font-medium">System Integrations:</span>
              <div className="mt-1 max-h-32 overflow-y-auto">
                {comparison.technicalDetails.scrollUniversity.systemIntegrations.map((integration, index) => (
                  <div key={index} className="text-xs py-1">• {integration}</div>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium">Blockchain Features:</span>
              <div className="mt-1">
                {comparison.technicalDetails.scrollUniversity.blockchainFeatures.map((feature, index) => (
                  <div key={index} className="text-xs py-1">✓ {feature}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h4 className="font-semibold text-red-800 mb-4">LearnTube.ai Integrations</h4>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">API Count:</span> {comparison.technicalDetails.learnTubeAI.apiCount}
            </div>
            <div>
              <span className="font-medium">System Integrations:</span>
              <div className="mt-1">
                {comparison.technicalDetails.learnTubeAI.systemIntegrations.map((integration, index) => (
                  <div key={index} className="text-xs py-1">• {integration}</div>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium">Blockchain Features:</span>
              <div className="mt-1 text-xs text-gray-500">
                No blockchain integration available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Technical Superiority Report Tab Component
const SuperiorityReportTab: React.FC<{ report: TechnicalSuperiorityReport }> = ({ report }) => {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Executive Summary</h3>
        <p className="text-gray-700 leading-relaxed">{report.executiveSummary}</p>
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🏆</span>
            <span className="font-semibold">Winner: ScrollUniversity</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600">Confidence: {(report.confidenceLevel * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Category Winners */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Category Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(report.categoryWinners).map(([category, winner]) => (
            <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900 mb-1">{category}</div>
              <div className={`text-xs font-semibold ${
                winner === 'scrolluniversity' ? 'text-green-600' : 
                winner === 'learntube' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {winner === 'scrolluniversity' ? '✓ ScrollUniversity' : 
                 winner === 'learntube' ? '✓ LearnTube.ai' : 'Tie'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Findings */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Key Technical Findings</h3>
        <div className="space-y-4">
          {report.keyFindings.map((finding, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{finding.category}</h4>
                  <p className="text-gray-700 mt-1">{finding.finding}</p>
                  <div className="mt-2 space-y-1">
                    {finding.evidence.map((evidence, evidenceIndex) => (
                      <div key={evidenceIndex} className="text-sm text-gray-600">
                        • {evidence}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    finding.impact === 'high' ? 'bg-red-100 text-red-800' :
                    finding.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {finding.impact} impact
                  </span>
                  {finding.spiritualAlignment && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                      Spiritual ✨
                    </span>
                  )}
                  {finding.kingdomPurpose && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                      Kingdom 👑
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Advantages */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Strategic Advantages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.strategicAdvantages.map((advantage, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{advantage.name}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  advantage.competitiveValue === 'unique' ? 'bg-gold-100 text-gold-800' :
                  advantage.competitiveValue === 'superior' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {advantage.competitiveValue}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{advantage.description}</p>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-500">Category: {advantage.category}</span>
                {advantage.spiritualDimension && (
                  <span className="text-purple-600">✨ Spiritual</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recommended Actions</h3>
        <div className="space-y-4">
          {report.recommendedActions.map((action, index) => (
            <div key={index} className={`border-l-4 pl-4 ${
              action.priority === 'high' ? 'border-red-500' :
              action.priority === 'medium' ? 'border-yellow-500' :
              'border-green-500'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900">{action.action}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      action.priority === 'high' ? 'bg-red-100 text-red-800' :
                      action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {action.priority} priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{action.rationale}</p>
                  <div className="text-xs text-gray-500">
                    Timeline: {action.timeline} | Expected: {action.expectedOutcome}
                  </div>
                  {action.spiritualConsiderations.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-purple-700 mb-1">Spiritual Considerations:</div>
                      {action.spiritualConsiderations.map((consideration, considIndex) => (
                        <div key={considIndex} className="text-xs text-purple-600">
                          • {consideration}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArchitectureComparisonDashboard;