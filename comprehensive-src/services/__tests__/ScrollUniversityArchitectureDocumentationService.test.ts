import { ScrollUniversityArchitectureDocumentationService } from '../ScrollUniversityArchitectureDocumentationService';
import { SpiritualAlignmentValidator } from '../SpiritualAlignmentValidator';

// Mock the SpiritualAlignmentValidator
jest.mock('../SpiritualAlignmentValidator');

describe('ScrollUniversityArchitectureDocumentationService', () => {
  let service: ScrollUniversityArchitectureDocumentationService;
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

    service = new ScrollUniversityArchitectureDocumentationService();
  });

  describe('documentBlockchainFoundation', () => {
    it('should document ScrollUniversity blockchain-integrated foundation', async () => {
      const result = await service.documentBlockchainFoundation();

      expect(result).toBeDefined();
      expect(result.foundationType).toBe('blockchain_integrated');
      expect(result.ledgerSystem.name).toBe('HeavenLedger');
      expect(result.ledgerSystem.type).toBe('spiritual_blockchain');
      expect(result.ledgerSystem.features).toContain('Immutable credential verification');
      expect(result.ledgerSystem.features).toContain('Divine scorecard integration');
      expect(result.ledgerSystem.features).toContain('Prophetic validation consensus');
      expect(result.smartContracts.credentialVerification).toBe('ScrollCredentialVerification.sol');
      expect(result.scalabilityMetrics.transactionsPerSecond).toBe(10000);
      expect(result.scalabilityMetrics.globalNodes).toBe(200);
      expect(result.scalabilityMetrics.offlineCapability).toBe(true);
      expect(result.scalabilityMetrics.meshNetworkSupport).toBe(true);

      // Verify spiritual alignment validation was called
      expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
        expect.any(String),
        'architecture_documentation'
      );
    });

    it('should throw error if spiritual alignment validation fails', async () => {
      mockSpiritualValidator.validateContent.mockResolvedValue(false);

      await expect(service.documentBlockchainFoundation()).rejects.toThrow(
        'Blockchain architecture documentation failed spiritual alignment validation'
      );
    });
  });

  describe('mapIntegratedSystems', () => {
    it('should map ScrollUniversity 31+ integrated systems', async () => {
      const result = await service.mapIntegratedSystems();

      expect(result).toBeDefined();
      expect(result.totalSystems).toBe(31);
      expect(result.coreEducationalSystems).toBeDefined();
      expect(result.spiritualFormationSystems).toBeDefined();
      expect(result.blockchainSystems).toBeDefined();
      expect(result.globalAccessibilitySystems).toBeDefined();
      expect(result.xrImmersiveSystems).toBeDefined();
      expect(result.communityCollaborationSystems).toBeDefined();
      expect(result.analyticsIntelligenceSystems).toBeDefined();

      // Verify core educational systems
      expect(result.coreEducationalSystems.courseManagement).toBeDefined();
      expect(result.coreEducationalSystems.courseManagement.name).toBe('Course Management System');
      expect(result.coreEducationalSystems.courseManagement.capabilities).toContain('AI-powered content');
      expect(result.coreEducationalSystems.courseManagement.capabilities).toContain('Spiritual alignment validation');

      // Verify spiritual formation systems
      expect(result.spiritualFormationSystems.divineScorecard).toBeDefined();
      expect(result.spiritualFormationSystems.divineScorecard.name).toBe('Divine Scorecard Service');
      expect(result.spiritualFormationSystems.propheticCheckins).toBeDefined();
      expect(result.spiritualFormationSystems.propheticCheckins.name).toBe('Prophetic Check-ins Service');

      // Verify blockchain systems
      expect(result.blockchainSystems.scrollCoinEconomy).toBeDefined();
      expect(result.blockchainSystems.credentialVerification).toBeDefined();

      // Verify integration capabilities
      expect(result.integrationCapabilities.apiGateway.centralizedRouting).toBe(true);
      expect(result.integrationCapabilities.apiGateway.spiritualValidation).toBe(true);
      expect(result.integrationCapabilities.dataSync.spiritualIntegrity).toBe(true);

      // Verify spiritual alignment validation was called
      expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
        expect.any(String),
        'systems_architecture'
      );
    });

    it('should throw error if spiritual alignment validation fails', async () => {
      mockSpiritualValidator.validateContent.mockResolvedValue(false);

      await expect(service.mapIntegratedSystems()).rejects.toThrow(
        'Integrated systems map failed spiritual alignment validation'
      );
    });
  });

  describe('createTechnicalComparisonFramework', () => {
    it('should create technical specifications comparison framework', async () => {
      const result = await service.createTechnicalComparisonFramework();

      expect(result).toBeDefined();
      expect(result.architecturalCategories).toBeDefined();
      expect(result.scoringMethodology).toBeDefined();
      expect(result.reportingFramework).toBeDefined();

      // Verify architectural categories
      expect(result.architecturalCategories.foundationArchitecture).toBeDefined();
      expect(result.architecturalCategories.foundationArchitecture.scrollUniversitySpecs.storage_type).toBe('Blockchain + IPFS');
      expect(result.architecturalCategories.foundationArchitecture.scrollUniversitySpecs.spiritual_integration).toBe('Native Prophetic AI Integration');
      expect(result.architecturalCategories.foundationArchitecture.competitorSpecs.storage_type).toBe('Traditional Database');
      expect(result.architecturalCategories.foundationArchitecture.competitorSpecs.spiritual_integration).toBe('None');

      // Verify AI integration architecture
      expect(result.architecturalCategories.aiIntegrationArchitecture).toBeDefined();
      expect(result.architecturalCategories.aiIntegrationArchitecture.scrollUniversitySpecs.prophetic_intelligence).toBe('Divine Guidance + Spiritual Validation');
      expect(result.architecturalCategories.aiIntegrationArchitecture.competitorSpecs.prophetic_intelligence).toBe('None');

      // Verify scoring methodology
      expect(result.scoringMethodology.technicalSuperiorityScore.weights.foundationArchitecture).toBe(0.3);
      expect(result.scoringMethodology.technicalSuperiorityScore.weights.scalabilityArchitecture).toBe(0.25);

      // Verify reporting framework
      expect(result.reportingFramework.executiveSummary.keyDifferentiators).toContain('Blockchain-integrated foundation vs traditional databases');
      expect(result.reportingFramework.executiveSummary.keyDifferentiators).toContain('Prophetic AI vs standard machine learning');

      // Verify spiritual alignment validation was called
      expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
        expect.any(String),
        'technical_comparison'
      );
    });

    it('should throw error if spiritual alignment validation fails', async () => {
      mockSpiritualValidator.validateContent.mockResolvedValue(false);

      await expect(service.createTechnicalComparisonFramework()).rejects.toThrow(
        'Technical comparison framework failed spiritual alignment validation'
      );
    });
  });

  describe('generateScrollUniversityPlatformProfile', () => {
    it('should generate comprehensive ScrollUniversity platform profile for competitive analysis', async () => {
      const result = await service.generateScrollUniversityPlatformProfile();

      expect(result).toBeDefined();
      expect(result.name).toBe('ScrollUniversity');
      expect(result.architecture.type).toBe('blockchain-integrated');
      expect(result.architecture.offlineSupport).toBe(true);

      // Verify AI capabilities
      expect(result.architecture.aiCapabilities).toHaveLength(3);
      const propheticAI = result.architecture.aiCapabilities.find(ai => ai.name === 'Prophetic Intelligence');
      expect(propheticAI).toBeDefined();
      expect(propheticAI?.type).toBe('prophetic-ai');
      expect(propheticAI?.spiritualIntegration).toBe(true);

      // Verify scalability features
      expect(result.architecture.scalabilityFeatures).toHaveLength(3);
      const meshNetwork = result.architecture.scalabilityFeatures.find(sf => sf.name === 'ScrollMesh Network');
      expect(meshNetwork).toBeDefined();
      expect(meshNetwork?.meshNetworking).toBe(true);

      // Verify integration capabilities
      expect(result.architecture.integrationCapabilities).toHaveLength(1);
      expect(result.architecture.integrationCapabilities[0].apiCount).toBe(31);
      expect(result.architecture.integrationCapabilities[0].blockchainIntegration).toBe(true);

      // Verify security features
      expect(result.architecture.securityFeatures).toHaveLength(2);
      const heavenLedger = result.architecture.securityFeatures.find(sf => sf.name === 'HeavenLedger Blockchain');
      expect(heavenLedger).toBeDefined();
      expect(heavenLedger?.spiritualDiscernment).toBe(true);

      // Verify target market
      expect(result.targetMarket.spiritualOrientation).toBe(true);
      expect(result.targetMarket.valuesAlignment).toBe(true);
      expect(result.targetMarket.size).toBe(2000000000);

      // Verify pricing model
      expect(result.pricingModel.model).toBe('revolutionary-tuition');
      expect(result.pricingModel.scrollCoinIntegration).toBe(true);
      expect(result.pricingModel.spiritualEconomyAlignment).toBe(true);

      // Verify strengths include key differentiators
      expect(result.strengths).toContain('First spiritually-integrated AI education platform');
      expect(result.strengths).toContain('Blockchain-verified immutable credentials');
      expect(result.strengths).toContain('Prophetic AI with spiritual discernment');

      // Verify spiritual alignment validation was called
      expect(mockSpiritualValidator.validateContent).toHaveBeenCalledWith(
        expect.any(String),
        'platform_profile'
      );
    });

    it('should throw error if spiritual alignment validation fails', async () => {
      mockSpiritualValidator.validateContent.mockResolvedValue(false);

      await expect(service.generateScrollUniversityPlatformProfile()).rejects.toThrow(
        'ScrollUniversity platform profile failed spiritual alignment validation'
      );
    });
  });

  describe('generateArchitectureReport', () => {
    it('should generate comprehensive architecture documentation report', async () => {
      const result = await service.generateArchitectureReport();

      expect(result).toBeDefined();
      expect(result.reportId).toMatch(/^arch-doc-\d+$/);
      expect(result.generatedAt).toBeInstanceOf(Date);
      expect(result.blockchainFoundation).toBeDefined();
      expect(result.integratedSystems).toBeDefined();
      expect(result.technicalComparison).toBeDefined();
      expect(result.executiveSummary).toBeDefined();

      // Verify executive summary
      expect(result.executiveSummary.platformOverview).toContain('revolutionary leap in educational technology');
      expect(result.executiveSummary.keyArchitecturalAdvantages).toContain('Blockchain-integrated foundation with HeavenLedger provides immutable, globally-recognized credentials');
      expect(result.executiveSummary.competitiveDifferentiation).toContain('Only platform combining AI education with spiritual formation');
      expect(result.executiveSummary.strategicImplications).toContain('First-mover advantage in spiritually-integrated AI education market');

      // Verify spiritual alignment validation was called multiple times
      expect(mockSpiritualValidator.validateContent).toHaveBeenCalledTimes(4); // blockchain, systems, comparison, final report
    });

    it('should throw error if final spiritual alignment validation fails', async () => {
      // Mock to pass first 3 validations but fail the final one
      mockSpiritualValidator.validateContent
        .mockResolvedValueOnce(true)  // blockchain
        .mockResolvedValueOnce(true)  // systems
        .mockResolvedValueOnce(true)  // comparison
        .mockResolvedValueOnce(false); // final report

      await expect(service.generateArchitectureReport()).rejects.toThrow(
        'Architecture documentation report failed spiritual alignment validation'
      );
    });
  });

  describe('error handling', () => {
    it('should handle unknown errors gracefully', async () => {
      mockSpiritualValidator.validateContent.mockRejectedValue('Unknown error');

      await expect(service.documentBlockchainFoundation()).rejects.toThrow(
        'Failed to document blockchain foundation: Unknown error occurred'
      );
    });

    it('should handle Error instances properly', async () => {
      const testError = new Error('Test error message');
      mockSpiritualValidator.validateContent.mockRejectedValue(testError);

      await expect(service.mapIntegratedSystems()).rejects.toThrow(
        'Failed to map integrated systems: Test error message'
      );
    });
  });
});