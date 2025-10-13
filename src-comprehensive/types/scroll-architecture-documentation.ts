/**
 * TypeScript type definitions for ScrollUniversity Architecture Documentation System
 * 
 * Supports competitive analysis requirements 1.1 and 1.2 for platform architecture comparison
 */

export interface BlockchainArchitectureProfile {
  foundationType: string;
  ledgerSystem: string;
  credentialVerification: {
    immutable: boolean;
    globallyRecognized: boolean;
    blockchainVerified: boolean;
    spirituallyValidated: boolean;
  };
  smartContracts: {
    scrollCoinEconomy: {
      enabled: boolean;
      rewardMechanisms: string[];
      fraudPrevention: boolean;
      transparentCalculation: boolean;
    };
    credentialIssuance: {
      automated: boolean;
      multiSignatureValidation: boolean;
      spiritualOversight: boolean;
    };
    academicRecords: {
      immutableTranscripts: boolean;
      comprehensiveTracking: boolean;
      globalAccessibility: boolean;
    };
  };
  advantages: string[];
  differentiators: {
    vsTraditionalSystems: string[];
  };
}

export interface SystemProfile {
  name: string;
  capabilities: string[];
  apiEndpoints: string[];
}

export interface IntegratedSystemsMap {
  totalSystems: number;
  coreEducationalSystems: Record<string, SystemProfile>;
  spiritualFormationSystems: Record<string, SystemProfile>;
  blockchainSystems: Record<string, SystemProfile>;
  globalAccessibilitySystems: Record<string, SystemProfile>;
  xrImmersiveSystems: Record<string, SystemProfile>;
  communityCollaborationSystems: Record<string, SystemProfile>;
  analyticsIntelligenceSystems: Record<string, SystemProfile>;
  integrationCapabilities: {
    apiGateway: {
      centralizedRouting: boolean;
      authenticationLayer: boolean;
      rateLimiting: boolean;
      spiritualValidation: boolean;
    };
    serviceDiscovery: {
      dynamicRegistration: boolean;
      healthChecking: boolean;
      loadBalancing: boolean;
    };
    dataSync: {
      realTimeSync: boolean;
      offlineCapability: boolean;
      conflictResolution: boolean;
      spiritualIntegrity: boolean;
    };
  };
}

export interface ArchitecturalCategory {
  metrics: string[];
  scrollUniversitySpecs: Record<string, string>;
  competitorSpecs: Record<string, string>;
}

export interface TechnicalComparisonFramework {
  architecturalCategories: Record<string, ArchitecturalCategory>;
  scoringMethodology: {
    technicalSuperiorityScore: {
      calculation: string;
      weights: Record<string, number>;
    };
    competitiveAdvantageMetrics: Record<string, string>;
  };
  reportingFramework: {
    executiveSummary: {
      keyDifferentiators: string[];
      competitiveAdvantages: string[];
    };
    technicalSuperiority: {
      architecturalAdvantages: string;
      innovationLeadership: string;
      scalabilitySuperiority: string;
    };
  };
}

export interface ArchitectureDocumentationReport {
  reportId: string;
  generatedAt: Date;
  blockchainFoundation: BlockchainArchitectureProfile;
  integratedSystems: IntegratedSystemsMap;
  technicalComparison: TechnicalComparisonFramework;
  executiveSummary: {
    platformOverview: string;
    keyArchitecturalAdvantages: string[];
    competitiveDifferentiation: string[];
    strategicImplications: string[];
  };
}

export interface ArchitectureComparisonMetrics {
  technicalSuperiorityScore: number;
  uniqueFeatureCount: number;
  integrationCapabilityScore: number;
  spiritualAlignmentScore: number;
  globalAccessibilityScore: number;
}

export interface CompetitiveArchitectureAnalysis {
  scrollUniversity: {
    profile: BlockchainArchitectureProfile;
    systemsMap: IntegratedSystemsMap;
    metrics: ArchitectureComparisonMetrics;
  };
  competitor: {
    name: string;
    architectureType: string;
    limitations: string[];
    metrics: ArchitectureComparisonMetrics;
  };
  comparison: {
    overallAdvantage: 'scrolluniversity' | 'competitor' | 'neutral';
    keyDifferentiators: string[];
    competitiveGaps: string[];
    strategicRecommendations: string[];
  };
}

// API Response Types
export interface ArchitectureDocumentationResponse {
  success: boolean;
  data?: ArchitectureDocumentationReport;
  error?: string;
  metadata?: {
    generationTime: number;
    systemsAnalyzed: number;
    spiritualAlignmentValidated: boolean;
  };
}

export interface SystemsMapResponse {
  success: boolean;
  data?: IntegratedSystemsMap;
  error?: string;
  metadata?: {
    totalSystemsDocumented: number;
    apiEndpointsCount: number;
    lastUpdated: Date;
  };
}

export interface TechnicalComparisonResponse {
  success: boolean;
  data?: TechnicalComparisonFramework;
  error?: string;
  metadata?: {
    categoriesAnalyzed: number;
    metricsCalculated: number;
    competitiveAdvantageScore: number;
  };
}

// Service Configuration Types
export interface ArchitectureDocumentationConfig {
  enableSpiritualValidation: boolean;
  includeDetailedMetrics: boolean;
  generateExecutiveSummary: boolean;
  validateSystemIntegration: boolean;
  outputFormat: 'json' | 'markdown' | 'pdf';
}

export interface SystemDiscoveryConfig {
  scanAllServices: boolean;
  includeApiDocumentation: boolean;
  validateEndpoints: boolean;
  checkSpiritualAlignment: boolean;
  generateSystemMap: boolean;
}

// Error Types
export interface ArchitectureDocumentationError extends Error {
  code: 'SPIRITUAL_VALIDATION_FAILED' | 'SYSTEM_DISCOVERY_ERROR' | 'COMPARISON_GENERATION_ERROR';
  details: {
    component: string;
    validationErrors?: string[];
    systemErrors?: string[];
  };
}