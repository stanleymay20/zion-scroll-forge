import LearnTubeFeatureAnalysisService from '../LearnTubeFeatureAnalysisService';
import { CompetitiveDataCollectionService } from '../CompetitiveDataCollectionService';
import { CompetitiveAnalysisEngine } from '../CompetitiveAnalysisEngine';
import { 
  LearnTubeFeatureProfile, 
  FeatureComparisonScore, 
  GapAnalysisResult,
  CompetitiveFeature
} from '../../types/competitive-analysis';

// Mock dependencies
jest.mock('../CompetitiveDataCollectionService');
jest.mock('../CompetitiveAnalysisEngine');

describe('LearnTubeFeatureAnalysisService', () => {
  let service: LearnTubeFeatureAnalysisService;
  let mockDataCollectionService: jest.Mocked<CompetitiveDataCollectionService>;
  let mockAnalysisEngine: jest.Mocked<CompetitiveAnalysisEngine>;

  beforeEach(() => {
    // Create service with mocked dependencies
    service = new LearnTubeFeatureAnalysisService();
    
    // Mock the data collection service methods
    (service as any).dataCollectionService = {
      collectPublicPlatformData: jest.fn(),
      collectMarketResearchData: jest.fn(),
      collectUserFeedbackData: jest.fn()
    };
    
    // Mock the analysis engine
    (service as any).analysisEngine = {
      analyze: jest.fn()
    };
  });

  describe('catalogLearnTubeFeatures', () => {
    it('should successfully catalog LearnTube.ai features', async () => {
      // Mock data collection responses
      const mockPublicData = { features: ['AI Tutor', 'Video Learning'] };
      const mockMarketResearch = { capabilities: ['Personalization'] };
      const mockUserFeedback = { reviews: ['Good AI assistance'] };

      (service as any).dataCollectionService.collectPublicPlatformData = jest.fn().mockResolvedValue(mockPublicData);
      (service as any).dataCollectionService.collectMarketResearchData = jest.fn().mockResolvedValue(mockMarketResearch);
      (service as any).dataCollectionService.collectUserFeedbackData = jest.fn().mockResolvedValue(mockUserFeedback);

      const result = await service.catalogLearnTubeFeatures();

      expect(result).toBeDefined();
      expect(result.platformName).toBe('LearnTube.ai');
      expect(result.categories).toBeDefined();
      expect(result.categories.coreEducation).toBeInstanceOf(Array);
      expect(result.categories.aiCapabilities).toBeInstanceOf(Array);
      expect(result.categories.communityFeatures).toBeInstanceOf(Array);
      expect(result.categories.technicalCapabilities).toBeInstanceOf(Array);
      expect(result.overallFeatureCount).toBeGreaterThan(0);
      expect(result.dataSourceReliability).toBeGreaterThan(0);
    });

    it('should handle data collection errors gracefully', async () => {
      (service as any).dataCollectionService.collectPublicPlatformData = jest.fn().mockRejectedValue(new Error('Data collection failed'));

      await expect(service.catalogLearnTubeFeatures()).rejects.toThrow('Failed to catalog LearnTube.ai features');
    });

    it('should catalog core education features correctly', async () => {
      const mockData = { features: [] };
      (service as any).dataCollectionService.collectPublicPlatformData = jest.fn().mockResolvedValue(mockData);
      (service as any).dataCollectionService.collectMarketResearchData = jest.fn().mockResolvedValue(mockData);
      (service as any).dataCollectionService.collectUserFeedbackData = jest.fn().mockResolvedValue(mockData);

      const result = await service.catalogLearnTubeFeatures();

      const coreFeatures = result.categories.coreEducation;
      expect(coreFeatures).toContainEqual(
        expect.objectContaining({
          name: 'AI-Powered Video Learning',
          category: 'core_education',
          availability: 'available',
          scrollUniversityEquivalent: 'AI Avatar Lecturers with Prophetic Intelligence'
        })
      );
    });

    it('should catalog AI capabilities correctly', async () => {
      const mockData = { features: [] };
      (service as any).dataCollectionService.collectPublicPlatformData = jest.fn().mockResolvedValue(mockData);
      (service as any).dataCollectionService.collectMarketResearchData = jest.fn().mockResolvedValue(mockData);
      (service as any).dataCollectionService.collectUserFeedbackData = jest.fn().mockResolvedValue(mockData);

      const result = await service.catalogLearnTubeFeatures();

      const aiFeatures = result.categories.aiCapabilities;
      expect(aiFeatures).toContainEqual(
        expect.objectContaining({
          name: 'AI Tutor Chat',
          category: 'ai_capabilities',
          scrollUniversityEquivalent: 'ScrollGPT with Prophetic Intelligence and Spiritual Discernment'
        })
      );
    });
  });

  describe('createComparisonScoringMethodology', () => {
    it('should create comprehensive scoring methodology', () => {
      const result = service.createComparisonScoringMethodology();

      expect(result.scoringCriteria).toBeDefined();
      expect(result.scoringCriteria.functionality).toBeDefined();
      expect(result.scoringCriteria.functionality.weight).toBe(0.25);
      expect(result.scoringCriteria.userExperience.weight).toBe(0.20);
      expect(result.scoringCriteria.innovation.weight).toBe(0.20);
      expect(result.scoringCriteria.scalability.weight).toBe(0.15);
      expect(result.scoringCriteria.integration.weight).toBe(0.10);
      expect(result.scoringCriteria.accessibility.weight).toBe(0.10);

      // Verify weights sum to 1.0
      const totalWeight = Object.values(result.scoringCriteria)
        .reduce((sum, criterion) => sum + criterion.weight, 0);
      expect(totalWeight).toBe(1.0);
    });

    it('should include comparison matrix structure', () => {
      const result = service.createComparisonScoringMethodology();

      expect(result.comparisonMatrix).toBeDefined();
      expect(result.comparisonMatrix.categories).toContain('Core Education Features');
      expect(result.comparisonMatrix.categories).toContain('AI Capabilities');
      expect(result.comparisonMatrix.comparisonAreas).toContain('Feature Availability');
      expect(result.comparisonMatrix.comparisonAreas).toContain('Innovation Level');
    });
  });

  describe('performGapAnalysis', () => {
    it('should perform comprehensive gap analysis', async () => {
      const mockScrollFeatures: CompetitiveFeature[] = [
        {
          name: 'Prophetic AI',
          category: 'ai_capabilities',
          description: 'AI with spiritual discernment',
          availability: 'available',
          quality: 10,
          uniqueness: 10,
          scrollUniversityEquivalent: 'Native feature'
        }
      ];

      const mockLearnTubeFeatures: CompetitiveFeature[] = [
        {
          name: 'Basic AI Chat',
          category: 'ai_capabilities',
          description: 'Standard AI assistance',
          availability: 'available',
          quality: 6,
          uniqueness: 2,
          scrollUniversityEquivalent: 'ScrollGPT with Prophetic Intelligence'
        }
      ];

      const result = await service.performGapAnalysis(mockScrollFeatures, mockLearnTubeFeatures);

      expect(result).toBeDefined();
      expect(result.analysisDate).toBeInstanceOf(Date);
      expect(result.scrollUniversityAdvantages).toBeInstanceOf(Array);
      expect(result.potentialGaps).toBeInstanceOf(Array);
      expect(result.learnTubeUniqueFeatures).toBeInstanceOf(Array);
      expect(result.strategicRecommendations).toBeInstanceOf(Array);
      expect(result.overallCompetitivePosition).toBeDefined();
      expect(result.confidenceLevel).toBeGreaterThan(0);
    });

    it('should identify ScrollUniversity advantages correctly', async () => {
      const mockScrollFeatures: CompetitiveFeature[] = [];
      const mockLearnTubeFeatures: CompetitiveFeature[] = [];

      const result = await service.performGapAnalysis(mockScrollFeatures, mockLearnTubeFeatures);

      const advantages = result.scrollUniversityAdvantages;
      expect(advantages).toContainEqual(
        expect.objectContaining({
          category: 'Spiritual Integration',
          advantage: 'First and only platform combining AI education with spiritual formation',
          impact: 'high',
          uniqueness: 'exclusive'
        })
      );

      expect(advantages).toContainEqual(
        expect.objectContaining({
          category: 'Prophetic AI',
          advantage: 'AI systems integrated with spiritual discernment and divine guidance',
          impact: 'high',
          uniqueness: 'exclusive'
        })
      );
    });

    it('should generate strategic recommendations', async () => {
      const mockScrollFeatures: CompetitiveFeature[] = [];
      const mockLearnTubeFeatures: CompetitiveFeature[] = [];

      const result = await service.performGapAnalysis(mockScrollFeatures, mockLearnTubeFeatures);

      const recommendations = result.strategicRecommendations;
      expect(recommendations).toContainEqual(
        expect.objectContaining({
          category: 'Market Positioning',
          recommendation: 'Emphasize ScrollUniversity\'s comprehensive spiritual integration advantage',
          priority: 'high',
          timeline: 'immediate'
        })
      );
    });

    it('should calculate overall competitive position correctly', async () => {
      const mockScrollFeatures: CompetitiveFeature[] = [];
      const mockLearnTubeFeatures: CompetitiveFeature[] = [];

      const result = await service.performGapAnalysis(mockScrollFeatures, mockLearnTubeFeatures);

      expect(['dominant_advantage', 'strong_advantage', 'competitive_advantage', 'needs_improvement'])
        .toContain(result.overallCompetitivePosition);
      
      // Given ScrollUniversity's advantages, should be dominant
      expect(result.overallCompetitivePosition).toBe('dominant_advantage');
    });

    it('should handle analysis errors gracefully', async () => {
      // Mock a method that will cause an error
      const originalMethod = (service as any).identifyScrollUniversityAdvantages;
      (service as any).identifyScrollUniversityAdvantages = jest.fn().mockImplementation(() => {
        throw new Error('Analysis failed');
      });

      const validFeatures: CompetitiveFeature[] = [];
      await expect(service.performGapAnalysis(validFeatures, [])).rejects.toThrow('Failed to perform gap analysis');
      
      // Restore original method
      (service as any).identifyScrollUniversityAdvantages = originalMethod;
    });
  });

  describe('Feature Cataloging Methods', () => {
    it('should catalog technical capabilities with correct ScrollUniversity equivalents', () => {
      const mockData = {};
      const service = new LearnTubeFeatureAnalysisService();
      
      // Access private method through any casting for testing
      const features = (service as any).catalogTechnicalCapabilities(mockData);

      expect(features).toContainEqual(
        expect.objectContaining({
          name: 'Web Platform',
          scrollUniversityEquivalent: 'Multi-platform with Web, Mobile, and XR Integration'
        })
      );

      expect(features).toContainEqual(
        expect.objectContaining({
          name: 'Mobile App',
          scrollUniversityEquivalent: 'Offline-first Mobile App with Mesh Networking'
        })
      );

      expect(features).toContainEqual(
        expect.objectContaining({
          name: 'Cloud Storage',
          scrollUniversityEquivalent: 'Blockchain-based Immutable Storage with IPFS'
        })
      );
    });

    it('should assign appropriate quality and uniqueness scores', () => {
      const mockData = {};
      const service = new LearnTubeFeatureAnalysisService();
      
      const coreFeatures = (service as any).catalogCoreEducationFeatures(mockData);
      
      coreFeatures.forEach((feature: CompetitiveFeature) => {
        expect(feature.quality).toBeGreaterThanOrEqual(1);
        expect(feature.quality).toBeLessThanOrEqual(10);
        expect(feature.uniqueness).toBeGreaterThanOrEqual(1);
        expect(feature.uniqueness).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('Data Reliability and Confidence', () => {
    it('should calculate data reliability correctly', () => {
      const service = new LearnTubeFeatureAnalysisService();
      const reliability = (service as any).calculateDataReliability({}, {}, {});
      
      expect(reliability).toBeGreaterThan(0);
      expect(reliability).toBeLessThanOrEqual(1);
      expect(reliability).toBe(0.85); // Expected value based on implementation
    });

    it('should calculate analysis confidence correctly', () => {
      const service = new LearnTubeFeatureAnalysisService();
      const confidence = (service as any).calculateAnalysisConfidence();
      
      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
      expect(confidence).toBe(0.88); // Expected value based on implementation
    });
  });
});