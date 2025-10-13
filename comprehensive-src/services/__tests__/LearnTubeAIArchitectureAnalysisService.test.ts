import { LearnTubeAIArchitectureAnalysisService } from '../LearnTubeAIArchitectureAnalysisService';
import { SpiritualAlignmentValidator } from '../SpiritualAlignmentValidator';

// Mock the SpiritualAlignmentValidator
jest.mock('../SpiritualAlignmentValidator');

describe('LearnTubeAIArchitectureAnalysisService', () => {
  let service: LearnTubeAIArchitectureAnalysisService;
  let mockSpiritualValidator: jest.Mocked<SpiritualAlignmentValidator>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock SpiritualAlignmentValidator
    mockSpiritualValidator = {
      validateContent: jest.fn().mockResolvedValue(true),
      validateSpiritualAlignment: jest.fn().mockResolvedValue(true),
      checkKingdomPurpose: jest.fn().mockResolvedValue(true)
    } as any;

    (SpiritualAlignmentValidator as jest.MockedClass<typeof SpiritualAlignmentValidator>).mockImplementation(() => mockSpiritualValidator);

    service = new LearnTubeAIArchitectureAnalysisService();
  });

  describe('analyzeLearnTubeAIArchitecture', () => {
    it('should analyze LearnTube.ai technical architecture comprehensively', async () => {
      const result = await service.analyzeLearnTubeAIArchitecture();

      expect(result).toBeDefined();
      expect(result.platformName).toBe('LearnTube.ai');
      expect(result.architectureType).toBe('traditional_cloud_saas');

      // Verify foundation analysis
      expect(result.foundationAnalysis.storageType).toContain('Traditional Database');
      expect(result.foundationAnalysis.spiritualIntegration).toBe('None - Secular platform focus');
      expect(result.foundationAnalysis.blockchainIntegration).toBe('No blockchain implementation');
      expect(result.foundationAnalysis.limitations).toContain('No spiritual or values-based validation');

      // Verify cloud infrastructure analysis
      expect(result.cloudInfrastructure.provider).toContain('AWS/Google Cloud');
      expect(result.cloudInfrastructure.regions).toContain('US-East');
      expect(result.cloudInfrastructure.limitations).toContain('Internet dependency for all functionality');

      // Verify AI capabilities analysis
      expect(result.aiCapabilities.primaryAI.type).toBe('Standard Machine Learning');
      expect(result.aiCapabilities.primaryAI.spiritualIntegration).toBe(false);
      expect(result.aiCapabilities.primaryAI.limitations).toContain('No spiritual discernment capabilities');

      // Verify API ecosystem analysis
      expect(result.apiEcosystem.totalAPIs).toBe(12);
      expect(result.apiEcosystem.capabilities).toContain('User authentication and management');
      expect(result.apiEcosystem.limitations).toContain('No spiritual formation APIs');

      // Verify competitive weaknesses
      expect(result.competitiveWeaknesses).toContain('No spiritual or values-based education approach');
      expect(result.competitiveWeaknesses).toContain('No blockchain integration or immutable credentials');

      // Verify spiritual alignment validation was called
      expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
        expect.any(String),
        'competitor_analysis'
      );
    });

    it('should handle spiritual alignment validation warnings gracefully', async () => {
      mockSpiritualValidator.validateContent.mockResolvedValue(false);

      const result = await service.analyzeLearnTubeAIArchitecture();

      expect(result).toBeDefined();
      expect(result.platformName).toBe('LearnTube.ai');
      // Should continue with analysis despite spiritual alignment warning
    });

    it('should collect and store research data', async () => {
      await service.analyzeLearnTubeAIArchitecture();
      
      const researchData = service.getResearchData();
      expect(researchData).toBeDefined();
      expect(researchData.length).toBeGreaterThan(0);
      
      // Verify research data structure
      const firstResearch = researchData[0];
      expect(firstResearch.platform).toBe('learntube_ai');
      expect(firstResearch.source).toBeDefined();
      expect(firstResearch.dataType).toBeDefined();
      expect(firstResearch.reliability).toBeGreaterThan(0);
    });
  });

  describe('analyzeCloudInfrastructureAndAPIs', () => {
    it('should analyze cloud infrastructure and API capabilities', async () => {
      const result = await service.analyzeCloudInfrastructureAndAPIs();

      expect(result).toBeDefined();

      // Verify cloud architecture analysis
      expect(result.cloudArchitecture.type).toBe('Multi-tier web application');
      expect(result.cloudArchitecture.deployment).toContain('Container-based');
      expect(result.cloudArchitecture.limitations).toContain('No decentralized architecture');

      // Verify database architecture analysis
      expect(result.databaseArchitecture.primary).toContain('PostgreSQL');
      expect(result.databaseArchitecture.limitations).toContain('Mutable data without blockchain immutability');

      // Verify API capabilities analysis
      expect(result.apiCapabilities.restAPIs.count).toBe(8);
      expect(result.apiCapabilities.restAPIs.authentication).toContain('JWT tokens');
      expect(result.apiCapabilities.thirdPartyIntegrations.count).toBe(6);
      expect(result.apiCapabilities.thirdPartyIntegrations.partners).toContain('Zoom API for video conferencing');

      // Verify performance metrics
      expect(result.performanceMetrics.uptime).toBe('99.5% SLA (industry standard)');
      expect(result.performanceMetrics.limitations).toContain('No offline performance capabilities');

      // Verify security infrastructure
      expect(result.securityInfrastructure.dataSecurity).toContain('Encryption at rest and in transit');
      expect(result.securityInfrastructure.limitations).toContain('No blockchain-level security');

      // Verify spiritual alignment validation was called
      expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
        expect.any(String),
        'infrastructure_analysis'
      );
    });

    it('should handle infrastructure analysis validation warnings', async () => {
      mockSpiritualValidator.validateContent.mockResolvedValue(false);

      const result = await service.analyzeCloudInfrastructureAndAPIs();

      expect(result).toBeDefined();
      // Should continue with analysis despite validation warning
    });
  });

  describe('createComparativeTechnicalAssessment', () => {
    it('should create comprehensive comparative technical assessment', async () => {
      const result = await service.createComparativeTechnicalAssessment();

      expect(result).toBeDefined();
      expect(result.assessmentId).toMatch(/^learntube-assessment-\d+$/);
      expect(result.generatedAt).toBeInstanceOf(Date);

      // Verify comparison categories
      expect(result.comparisonCategories.foundationArchitecture).toBeDefined();
      expect(result.comparisonCategories.foundationArchitecture.scrollUniversityScore).toBe(95);
      expect(result.comparisonCategories.foundationArchitecture.learnTubeAIScore).toBe(60);
      expect(result.comparisonCategories.foundationArchitecture.advantage).toBe('scrolluniversity');

      expect(result.comparisonCategories.aiAndIntelligence).toBeDefined();
      expect(result.comparisonCategories.aiAndIntelligence.scrollUniversityScore).toBe(98);
      expect(result.comparisonCategories.aiAndIntelligence.learnTubeAIScore).toBe(45);

      expect(result.comparisonCategories.globalAccessibility).toBeDefined();
      expect(result.comparisonCategories.globalAccessibility.scrollUniversityScore).toBe(100);
      expect(result.comparisonCategories.globalAccessibility.learnTubeAIScore).toBe(30);

      expect(result.comparisonCategories.integrationEcosystem).toBeDefined();
      expect(result.comparisonCategories.integrationEcosystem.scrollUniversityScore).toBe(92);
      expect(result.comparisonCategories.integrationEcosystem.learnTubeAIScore).toBe(55);

      // Verify overall assessment
      expect(result.overallAssessment.scrollUniversityTotalScore).toBe(96.25);
      expect(result.overallAssessment.learnTubeAITotalScore).toBe(47.5);
      expect(result.overallAssessment.competitiveAdvantage).toBe('scrolluniversity');
      expect(result.overallAssessment.advantageMagnitude).toBe('overwhelming');

      // Verify key findings
      expect(result.overallAssessment.keyFindings).toContain(
        'ScrollUniversity demonstrates overwhelming technical superiority across all categories'
      );
      expect(result.overallAssessment.keyFindings).toContain(
        'Blockchain-integrated architecture provides fundamental advantages over traditional systems'
      );

      // Verify strategic implications
      expect(result.overallAssessment.strategicImplications).toContain(
        'ScrollUniversity has first-mover advantage in spiritually-integrated AI education'
      );

      // Verify recommended actions
      expect(result.recommendedActions).toHaveLength(3);
      expect(result.recommendedActions[0].category).toBe('market_positioning');
      expect(result.recommendedActions[0].priority).toBe('high');

      // Verify spiritual alignment validation was called
      expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
        expect.any(String),
        'competitive_assessment'
      );
    });

    it('should throw error if spiritual alignment validation fails', async () => {
      mockSpiritualValidator.validateContent.mockResolvedValue(false);

      await expect(service.createComparativeTechnicalAssessment()).rejects.toThrow(
        'Comparative technical assessment failed spiritual alignment validation'
      );
    });
  });

  describe('generateLearnTubeAIPlatformProfile', () => {
    it('should generate comprehensive LearnTube.ai platform profile', async () => {
      const result = await service.generateLearnTubeAIPlatformProfile();

      expect(result).toBeDefined();
      expect(result.name).toBe('LearnTube.ai');
      expect(result.architecture.type).toBe('cloud-based');
      expect(result.architecture.offlineSupport).toBe(false);

      // Verify AI capabilities
      expect(result.architecture.aiCapabilities).toHaveLength(2);
      const standardML = result.architecture.aiCapabilities.find(ai => ai.name === 'Standard Machine Learning');
      expect(standardML).toBeDefined();
      expect(standardML?.type).toBe('machine-learning');
      expect(standardML?.spiritualIntegration).toBe(false);

      // Verify scalability features
      expect(result.architecture.scalabilityFeatures).toHaveLength(1);
      const cloudScaling = result.architecture.scalabilityFeatures[0];
      expect(cloudScaling.name).toBe('Cloud Auto-scaling');
      expect(cloudScaling.offlineCapability).toBe(false);
      expect(cloudScaling.meshNetworking).toBe(false);

      // Verify integration capabilities
      expect(result.architecture.integrationCapabilities).toHaveLength(1);
      expect(result.architecture.integrationCapabilities[0].apiCount).toBe(12);
      expect(result.architecture.integrationCapabilities[0].blockchainIntegration).toBe(false);

      // Verify security features
      expect(result.architecture.securityFeatures).toHaveLength(1);
      const security = result.architecture.securityFeatures[0];
      expect(security.blockchainVerification).toBe(false);
      expect(security.spiritualDiscernment).toBe(false);
      expect(security.immutableRecords).toBe(false);

      // Verify target market
      expect(result.targetMarket.spiritualOrientation).toBe(false);
      expect(result.targetMarket.valuesAlignment).toBe(false);
      expect(result.targetMarket.size).toBe(500000000);

      // Verify pricing model
      expect(result.pricingModel.model).toBe('subscription');
      expect(result.pricingModel.scrollCoinIntegration).toBe(false);
      expect(result.pricingModel.spiritualEconomyAlignment).toBe(false);

      // Verify weaknesses include key limitations
      expect(result.weaknesses).toContain('No spiritual or values-based education approach');
      expect(result.weaknesses).toContain('Internet dependency excludes global populations');
      expect(result.weaknesses).toContain('No blockchain integration or immutable credentials');

      // Verify spiritual alignment validation was called
      expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
        expect.any(String),
        'competitor_platform_profile'
      );
    });

    it('should handle spiritual alignment validation warnings for platform profile', async () => {
      mockSpiritualValidator.validateContent.mockResolvedValue(false);

      const result = await service.generateLearnTubeAIPlatformProfile();

      expect(result).toBeDefined();
      expect(result.name).toBe('LearnTube.ai');
      // Should continue with analysis despite spiritual alignment warning
    });
  });

  describe('error handling', () => {
    it('should handle unknown errors gracefully in architecture analysis', async () => {
      mockSpiritualValidator.validateContent.mockRejectedValue('Unknown error');

      await expect(service.analyzeLearnTubeAIArchitecture()).rejects.toThrow(
        'Failed to analyze LearnTube.ai architecture: Unknown error occurred'
      );
    });

    it('should handle Error instances properly in infrastructure analysis', async () => {
      const testError = new Error('Test infrastructure error');
      mockSpiritualValidator.validateContent.mockRejectedValue(testError);

      await expect(service.analyzeCloudInfrastructureAndAPIs()).rejects.toThrow(
        'Failed to analyze cloud infrastructure: Test infrastructure error'
      );
    });

    it('should handle errors in comparative assessment creation', async () => {
      const testError = new Error('Assessment creation error');
      mockSpiritualValidator.validateContent.mockRejectedValue(testError);

      await expect(service.createComparativeTechnicalAssessment()).rejects.toThrow(
        'Failed to create comparative assessment: Assessment creation error'
      );
    });

    it('should handle errors in platform profile generation', async () => {
      const testError = new Error('Profile generation error');
      mockSpiritualValidator.validateContent.mockRejectedValue(testError);

      await expect(service.generateLearnTubeAIPlatformProfile()).rejects.toThrow(
        'Failed to generate LearnTube.ai platform profile: Profile generation error'
      );
    });
  });

  describe('research data collection', () => {
    it('should collect research data during architecture analysis', async () => {
      await service.analyzeLearnTubeAIArchitecture();
      
      const researchData = service.getResearchData();
      expect(researchData).toHaveLength(4);

      // Verify research data contains expected information
      const techResearch = researchData.find(r => r.content.includes('PostgreSQL database'));
      expect(techResearch).toBeDefined();
      expect(techResearch?.platform).toBe('learntube_ai');
      expect(techResearch?.dataType).toBe('technology');
      expect(techResearch?.reliability).toBe(0.8);

      const aiResearch = researchData.find(r => r.content.includes('AI-powered course recommendations'));
      expect(aiResearch).toBeDefined();
      expect(aiResearch?.dataType).toBe('feature');
      expect(aiResearch?.reliability).toBe(0.9);

      const marketResearch = researchData.find(r => r.content.includes('professional skill development'));
      expect(marketResearch).toBeDefined();
      expect(marketResearch?.source).toBe('market_research');
      expect(marketResearch?.dataType).toBe('market_position');

      const limitationsResearch = researchData.find(r => r.content.includes('No blockchain integration'));
      expect(limitationsResearch).toBeDefined();
      expect(limitationsResearch?.spiritualAlignment).toBe(true);
    });

    it('should return empty array initially before research collection', () => {
      const newService = new LearnTubeAIArchitectureAnalysisService();
      const researchData = newService.getResearchData();
      expect(researchData).toEqual([]);
    });
  });
});