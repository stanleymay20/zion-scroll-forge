/**
 * Architecture Comparison Visualization Service Tests
 * Task 2.3: Build architecture comparison visualization system
 * Requirements: 1.3, 1.4 - Test scalability metrics and technical reports
 */

import { ArchitectureComparisonVisualizationService } from '../ArchitectureComparisonVisualizationService';
import { CompetitiveAnalysisEngine } from '../CompetitiveAnalysisEngine';
import {
  CompetitiveAnalysis,
  PlatformProfile,
  TechnicalArchitecture,
  ArchitectureVisualization
} from '../../types/competitive-analysis';

// Mock the CompetitiveAnalysisEngine
jest.mock('../CompetitiveAnalysisEngine');

describe('ArchitectureComparisonVisualizationService', () => {
  let service: ArchitectureComparisonVisualizationService;
  let mockAnalysisEngine: jest.Mocked<CompetitiveAnalysisEngine>;
  let mockAnalysis: CompetitiveAnalysis;

  beforeEach(() => {
    service = new ArchitectureComparisonVisualizationService();
    mockAnalysisEngine = new CompetitiveAnalysisEngine() as jest.Mocked<CompetitiveAnalysisEngine>;
    
    // Create mock analysis data
    mockAnalysis = createMockAnalysis();
  });

  afterEach(() => {
    service.clearCache();
    jest.clearAllMocks();
  });

  describe('generateArchitectureVisualization', () => {
    it('should generate comprehensive architecture visualization', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);

      expect(visualization).toBeDefined();
      expect(visualization.id).toMatch(/^arch_viz_\d+$/);
      expect(visualization.comparisonType).toBe('side-by-side');
      expect(visualization.platforms.scrollUniversity).toBeDefined();
      expect(visualization.platforms.learnTubeAI).toBeDefined();
      expect(visualization.scalabilityComparison).toBeDefined();
      expect(visualization.integrationComparison).toBeDefined();
      expect(visualization.technicalSuperiorityReport).toBeDefined();
      expect(visualization.visualizationData).toBeDefined();
    });

    it('should handle different comparison types', async () => {
      const overlayVisualization = await service.generateArchitectureVisualization(mockAnalysis, {
        comparisonType: 'overlay'
      });

      expect(overlayVisualization.comparisonType).toBe('overlay');

      const matrixVisualization = await service.generateArchitectureVisualization(mockAnalysis, {
        comparisonType: 'matrix'
      });

      expect(matrixVisualization.comparisonType).toBe('matrix');
    });

    it('should include spiritual alignment when requested', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis, {
        includeSpiritual: true
      });

      expect(visualization.platforms.scrollUniversity.categoryScores.spiritualAlignment).toBeGreaterThan(0);
      expect(visualization.technicalSuperiorityReport.keyFindings.some(f => f.spiritualAlignment)).toBe(true);
    });

    it('should handle focus areas filtering', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis, {
        focusAreas: ['scalability', 'integration']
      });

      expect(visualization).toBeDefined();
      // Focus areas would affect the visualization data structure
      expect(visualization.visualizationData.interactiveElements.length).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      const invalidAnalysis = {} as CompetitiveAnalysis;

      await expect(service.generateArchitectureVisualization(invalidAnalysis))
        .rejects.toThrow('Failed to generate architecture visualization');
    });
  });

  describe('scalability comparison', () => {
    it('should correctly identify ScrollUniversity scalability advantages', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      const scalability = visualization.scalabilityComparison;

      expect(scalability.overallWinner).toBe('scrolluniversity');
      expect(scalability.metrics.meshNetworking.winner).toBe('scrolluniversity');
      expect(scalability.metrics.offlineCapability.winner).toBe('scrolluniversity');
      expect(scalability.keyDifferentiators).toContain('Revolutionary mesh networking technology');
    });

    it('should provide detailed technical metrics', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      const scalability = visualization.scalabilityComparison;

      expect(scalability.technicalDetails.scrollUniversity.performanceMetrics).toBeDefined();
      expect(scalability.technicalDetails.scrollUniversity.performanceMetrics.globalCoverage).toBeGreaterThan(90);
      expect(scalability.technicalDetails.scrollUniversity.performanceMetrics.meshEfficiency).toBeGreaterThan(90);
    });

    it('should highlight spiritual dimensions in scalability', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      const scalability = visualization.scalabilityComparison;

      expect(scalability.keyDifferentiators.some(d => 
        d.includes('global accessibility') || d.includes('ministry')
      )).toBe(true);
    });
  });

  describe('integration comparison', () => {
    it('should correctly identify ScrollUniversity integration advantages', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      const integration = visualization.integrationComparison;

      expect(integration.overallWinner).toBe('scrolluniversity');
      expect(integration.metrics.blockchainIntegration.winner).toBe('scrolluniversity');
      expect(integration.metrics.apiEcosystem.winner).toBe('scrolluniversity');
      expect(integration.keyDifferentiators).toContain('Native blockchain integration with HeavenLedger');
    });

    it('should show comprehensive API ecosystem', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      const integration = visualization.integrationComparison;

      expect(integration.technicalDetails.scrollUniversity.apiCount).toBe(31);
      expect(integration.technicalDetails.scrollUniversity.systemIntegrations.length).toBeGreaterThan(10);
      expect(integration.technicalDetails.scrollUniversity.blockchainFeatures.length).toBeGreaterThan(0);
    });

    it('should highlight spiritual integration features', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      const integration = visualization.integrationComparison;

      expect(integration.keyDifferentiators.some(d => 
        d.includes('spiritual') || d.includes('alignment')
      )).toBe(true);
    });
  });

  describe('technical superiority report', () => {
    it('should generate comprehensive superiority report', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      const report = visualization.technicalSuperiorityReport;

      expect(report.overallWinner).toBe('scrolluniversity');
      expect(report.confidenceLevel).toBeGreaterThan(0.9);
      expect(report.keyFindings.length).toBeGreaterThan(0);
      expect(report.strategicAdvantages.length).toBeGreaterThan(0);
      expect(report.recommendedActions.length).toBeGreaterThan(0);
      expect(report.executiveSummary).toContain('ScrollUniversity');
    });

    it('should identify unique spiritual advantages', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      const report = visualization.technicalSuperiorityReport;

      const spiritualAdvantages = report.strategicAdvantages.filter(a => a.spiritualDimension);
      expect(spiritualAdvantages.length).toBeGreaterThan(0);

      const spiritualFindings = report.keyFindings.filter(f => f.spiritualAlignment);
      expect(spiritualFindings.length).toBeGreaterThan(0);
    });

    it('should provide actionable recommendations', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      const report = visualization.technicalSuperiorityReport;

      const highPriorityActions = report.recommendedActions.filter(a => a.priority === 'high');
      expect(highPriorityActions.length).toBeGreaterThan(0);

      report.recommendedActions.forEach(action => {
        expect(action.action).toBeDefined();
        expect(action.rationale).toBeDefined();
        expect(action.timeline).toBeDefined();
        expect(action.expectedOutcome).toBeDefined();
      });
    });
  });

  describe('visualization data generation', () => {
    it('should generate comprehensive visualization data', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      const vizData = visualization.visualizationData;

      expect(vizData.charts.length).toBeGreaterThan(0);
      expect(vizData.diagrams.length).toBeGreaterThan(0);
      expect(vizData.matrices.length).toBeGreaterThan(0);
      expect(vizData.interactiveElements.length).toBeGreaterThan(0);
    });

    it('should include radar chart for architecture comparison', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      const charts = visualization.visualizationData.charts;

      const radarChart = charts.find(c => c.type === 'radar');
      expect(radarChart).toBeDefined();
      expect(radarChart?.title).toContain('Architecture Capabilities');
      expect(radarChart?.spiritualHighlights.length).toBeGreaterThan(0);
    });

    it('should include mermaid diagrams for architecture flow', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      const diagrams = visualization.visualizationData.diagrams;

      const archDiagram = diagrams.find(d => d.type === 'architecture');
      expect(archDiagram).toBeDefined();
      expect(archDiagram?.mermaidCode).toContain('graph');
      expect(archDiagram?.keyElements).toContain('Blockchain Foundation');
    });

    it('should include interactive filter elements', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      const interactive = visualization.visualizationData.interactiveElements;

      const filterElement = interactive.find(e => e.type === 'filter');
      expect(filterElement).toBeDefined();
      expect(filterElement?.options.length).toBeGreaterThan(0);
    });
  });

  describe('caching and performance', () => {
    it('should cache generated visualizations', async () => {
      const visualization1 = await service.generateArchitectureVisualization(mockAnalysis);
      const visualization2 = await service.getVisualization(visualization1.id);

      expect(visualization2).toEqual(visualization1);
    });

    it('should handle cache misses gracefully', async () => {
      const result = await service.getVisualization('nonexistent-id');
      expect(result).toBeNull();
    });

    it('should clear cache when requested', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      service.clearCache();
      
      const cachedResult = await service.getVisualization(visualization.id);
      expect(cachedResult).toBeNull();
    });
  });

  describe('export functionality', () => {
    it('should export visualization as JSON', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      const exported = await service.exportVisualization(visualization.id, 'json');

      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported);
      expect(parsed.id).toBe(visualization.id);
    });

    it('should handle export format validation', async () => {
      const visualization = await service.generateArchitectureVisualization(mockAnalysis);
      
      await expect(service.exportVisualization(visualization.id, 'invalid' as any))
        .rejects.toThrow('Unsupported export format');
    });

    it('should handle missing visualization for export', async () => {
      await expect(service.exportVisualization('nonexistent-id', 'json'))
        .rejects.toThrow('Visualization nonexistent-id not found');
    });
  });
});

// Helper function to create mock analysis data
function createMockAnalysis(): CompetitiveAnalysis {
  const scrollUniversityArch: TechnicalArchitecture = {
    type: 'blockchain-integrated',
    aiCapabilities: [
      {
        name: 'Prophetic AI',
        type: 'prophetic-ai',
        description: 'AI with spiritual discernment',
        spiritualIntegration: true,
        culturalFluency: true,
        personalizedLearning: true
      }
    ],
    scalabilityFeatures: [
      {
        name: 'Global Mesh Network',
        description: 'Revolutionary mesh networking',
        globalReach: true,
        offlineCapability: true,
        meshNetworking: true
      }
    ],
    integrationCapabilities: [
      {
        name: 'Comprehensive API Ecosystem',
        apiCount: 31,
        systemIntegrations: ['HeavenLedger', 'ScrollCoin', 'Prophetic AI'],
        partnerEcosystem: true,
        blockchainIntegration: true
      }
    ],
    offlineSupport: true,
    globalAccessibility: [
      {
        name: 'Universal Access',
        offlineFirst: true,
        meshNetworking: true,
        multilingualSupport: true,
        culturalAdaptation: true,
        lowBandwidthOptimization: true
      }
    ],
    securityFeatures: [
      {
        name: 'Blockchain Security',
        blockchainVerification: true,
        spiritualDiscernment: true,
        dataPrivacy: true,
        immutableRecords: true
      }
    ]
  };

  const learnTubeArch: TechnicalArchitecture = {
    type: 'cloud-based',
    aiCapabilities: [
      {
        name: 'Standard AI',
        type: 'standard-ai',
        description: 'Basic AI assistance',
        spiritualIntegration: false,
        culturalFluency: false,
        personalizedLearning: true
      }
    ],
    scalabilityFeatures: [
      {
        name: 'Cloud Scaling',
        description: 'Traditional cloud scaling',
        globalReach: true,
        offlineCapability: false,
        meshNetworking: false
      }
    ],
    integrationCapabilities: [
      {
        name: 'Basic Integrations',
        apiCount: 8,
        systemIntegrations: ['LMS', 'Video Platform'],
        partnerEcosystem: false,
        blockchainIntegration: false
      }
    ],
    offlineSupport: false,
    globalAccessibility: [
      {
        name: 'Internet Access',
        offlineFirst: false,
        meshNetworking: false,
        multilingualSupport: true,
        culturalAdaptation: false,
        lowBandwidthOptimization: false
      }
    ],
    securityFeatures: [
      {
        name: 'Standard Security',
        blockchainVerification: false,
        spiritualDiscernment: false,
        dataPrivacy: true,
        immutableRecords: false
      }
    ]
  };

  const scrollUniversityProfile: PlatformProfile = {
    name: 'ScrollUniversity',
    architecture: scrollUniversityArch,
    features: [],
    targetMarket: {
      name: 'Faith-based learners',
      size: 1000000,
      growthRate: 0.25,
      characteristics: ['Spiritual growth', 'Kingdom purpose'],
      spiritualOrientation: true,
      valuesAlignment: true
    },
    valueProposition: 'Complete life transformation through Christ-centered education',
    pricingModel: {
      model: 'revolutionary-tuition',
      valueBasedPricing: true,
      scholarshipAvailability: true,
      scrollCoinIntegration: true,
      spiritualEconomyAlignment: true
    },
    strengths: ['Blockchain integration', 'Spiritual formation', 'Global accessibility'],
    weaknesses: ['New platform', 'Market education needed']
  };

  const learnTubeProfile: PlatformProfile = {
    name: 'LearnTube.ai',
    architecture: learnTubeArch,
    features: [],
    targetMarket: {
      name: 'Professional learners',
      size: 500000,
      growthRate: 0.15,
      characteristics: ['Skill development', 'Career advancement'],
      spiritualOrientation: false,
      valuesAlignment: false
    },
    valueProposition: 'AI-powered skill acquisition',
    pricingModel: {
      model: 'subscription',
      valueBasedPricing: false,
      scholarshipAvailability: false,
      scrollCoinIntegration: false,
      spiritualEconomyAlignment: false
    },
    strengths: ['Established platform', 'AI features'],
    weaknesses: ['Limited scope', 'No spiritual dimension']
  };

  return {
    id: 'test-analysis-1',
    analysisDate: new Date(),
    platforms: {
      scrollUniversity: scrollUniversityProfile,
      learnTubeAI: learnTubeProfile
    },
    comparisonMatrix: {
      categories: [],
      overallScore: {
        scrollUniversityTotal: 95,
        learnTubeAITotal: 65,
        categoryBreakdown: {},
        overallAdvantage: 'scrolluniversity',
        confidenceLevel: 0.95
      },
      detailedComparisons: []
    },
    marketAnalysis: {
      scrollUniversity: {
        targetSegments: [],
        valueProposition: 'Complete transformation',
        differentiators: ['Spiritual integration'],
        messaging: ['Kingdom purpose'],
        spiritualFocus: true,
        kingdomPurpose: true
      },
      learnTubeAI: {
        targetSegments: [],
        valueProposition: 'Skill development',
        differentiators: ['AI features'],
        messaging: ['Career advancement'],
        spiritualFocus: false,
        kingdomPurpose: false
      },
      competitiveGaps: [],
      opportunities: []
    },
    strategicRecommendations: [],
    lastUpdated: new Date(),
    version: '1.0.0'
  };
}