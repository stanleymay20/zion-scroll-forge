/**
 * Competitive Analysis Data Models
 * Supporting requirements 1.1, 1.2, 1.3, 1.4 for platform architecture comparison
 */

export interface CompetitiveAnalysis {
  id: string;
  analysisDate: Date;
  platforms: {
    scrollUniversity: PlatformProfile;
    learnTubeAI: PlatformProfile;
  };
  comparisonMatrix: FeatureComparisonMatrix;
  marketAnalysis: MarketPositioning;
  strategicRecommendations: StrategyRecommendation[];
  lastUpdated: Date;
  version: string;
}

export interface PlatformProfile {
  name: string;
  architecture: TechnicalArchitecture;
  features: Feature[];
  targetMarket: MarketSegment;
  valueProposition: string;
  pricingModel: PricingStructure;
  strengths: string[];
  weaknesses: string[];
  marketShare?: number;
  userBase?: number;
}

export interface TechnicalArchitecture {
  type: 'blockchain-integrated' | 'cloud-based' | 'hybrid';
  aiCapabilities: AICapability[];
  scalabilityFeatures: ScalabilityFeature[];
  integrationCapabilities: IntegrationCapability[];
  offlineSupport: boolean;
  globalAccessibility: GlobalAccessibilityFeature[];
  securityFeatures: SecurityFeature[];
}

export interface AICapability {
  name: string;
  type: 'prophetic-ai' | 'standard-ai' | 'machine-learning' | 'conversational-ai';
  description: string;
  spiritualIntegration: boolean;
  culturalFluency: boolean;
  personalizedLearning: boolean;
}

export interface ScalabilityFeature {
  name: string;
  description: string;
  globalReach: boolean;
  offlineCapability: boolean;
  meshNetworking: boolean;
}

export interface IntegrationCapability {
  name: string;
  apiCount: number;
  systemIntegrations: string[];
  partnerEcosystem: boolean;
  blockchainIntegration: boolean;
}

export interface GlobalAccessibilityFeature {
  name: string;
  offlineFirst: boolean;
  meshNetworking: boolean;
  multilingualSupport: boolean;
  culturalAdaptation: boolean;
  lowBandwidthOptimization: boolean;
}

export interface SecurityFeature {
  name: string;
  blockchainVerification: boolean;
  spiritualDiscernment: boolean;
  dataPrivacy: boolean;
  immutableRecords: boolean;
}

export interface Feature {
  id: string;
  name: string;
  category: FeatureCategory;
  description: string;
  availability: 'available' | 'limited' | 'unavailable';
  uniqueness: 'unique' | 'competitive' | 'standard';
  spiritualAlignment: boolean;
  kingdomPurpose: boolean;
}

export type FeatureCategory = 
  | 'core-education'
  | 'ai-capabilities'
  | 'community-features'
  | 'spiritual-formation'
  | 'blockchain-integration'
  | 'global-accessibility'
  | 'assessment-evaluation'
  | 'credentialing'
  | 'economic-model'
  | 'xr-integration';

export interface FeatureComparisonMatrix {
  categories: FeatureCategoryComparison[];
  overallScore: CompetitiveScore;
  detailedComparisons: FeatureComparison[];
}

export interface FeatureCategoryComparison {
  category: FeatureCategory;
  scrollUniversityScore: number;
  learnTubeAIScore: number;
  advantage: 'scrolluniversity' | 'learntube' | 'neutral';
  keyDifferentiators: string[];
}

export interface FeatureComparison {
  featureName: string;
  category: FeatureCategory;
  scrollUniversity: FeatureAvailability;
  learnTubeAI: FeatureAvailability;
  competitiveAdvantage: CompetitiveAdvantage;
  strategicImportance: 'high' | 'medium' | 'low';
}

export interface FeatureAvailability {
  available: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'unavailable';
  uniqueAspects: string[];
  limitations: string[];
}

export interface CompetitiveAdvantage {
  platform: 'scrolluniversity' | 'learntube' | 'neutral';
  magnitude: 'significant' | 'moderate' | 'slight';
  reasoning: string;
  spiritualDimension: boolean;
  kingdomImpact: boolean;
}

export interface CompetitiveScore {
  scrollUniversityTotal: number;
  learnTubeAITotal: number;
  categoryBreakdown: Record<FeatureCategory, CategoryScore>;
  overallAdvantage: 'scrolluniversity' | 'learntube' | 'neutral';
  confidenceLevel: number;
}

export interface CategoryScore {
  scrollUniversity: number;
  learnTubeAI: number;
  weight: number;
  advantage: 'scrolluniversity' | 'learntube' | 'neutral';
}

export interface MarketSegment {
  name: string;
  size: number;
  growthRate: number;
  characteristics: string[];
  spiritualOrientation: boolean;
  valuesAlignment: boolean;
}

export interface MarketPositioning {
  scrollUniversity: MarketPosition;
  learnTubeAI: MarketPosition;
  competitiveGaps: MarketGap[];
  opportunities: MarketOpportunity[];
}

export interface MarketPosition {
  targetSegments: MarketSegment[];
  valueProposition: string;
  differentiators: string[];
  messaging: string[];
  spiritualFocus: boolean;
  kingdomPurpose: boolean;
}

export interface MarketGap {
  description: string;
  size: 'large' | 'medium' | 'small';
  difficulty: 'easy' | 'moderate' | 'difficult';
  strategicValue: 'high' | 'medium' | 'low';
  spiritualOpportunity: boolean;
}

export interface MarketOpportunity {
  name: string;
  description: string;
  marketSize: number;
  timeline: string;
  requiredCapabilities: string[];
  spiritualAlignment: boolean;
  kingdomImpact: boolean;
}

export interface PricingStructure {
  model: 'revolutionary-tuition' | 'subscription' | 'course-based' | 'freemium';
  basePrice?: number;
  valueBasedPricing: boolean;
  scholarshipAvailability: boolean;
  scrollCoinIntegration: boolean;
  spiritualEconomyAlignment: boolean;
}

export interface StrategyRecommendation {
  id: string;
  category: 'feature_development' | 'market_positioning' | 'competitive_response' | 'spiritual_integration';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  timeline: string;
  expectedImpact: string;
  requiredResources: string[];
  spiritualConsiderations: string[];
  kingdomAlignment: boolean;
  successMetrics: string[];
}

export interface ResearchData {
  id: string;
  source: 'internal' | 'public' | 'market_research' | 'user_feedback' | 'competitor_analysis';
  platform: 'scrolluniversity' | 'learntube_ai' | 'market_general';
  dataType: 'feature' | 'pricing' | 'user_experience' | 'market_position' | 'technology' | 'philosophy';
  content: string;
  reliability: number; // 0-1 scale
  lastUpdated: Date;
  verificationStatus: 'verified' | 'pending' | 'disputed';
  spiritualAlignment?: boolean;
  tags: string[];
}

export interface DataCollectionInterface {
  collectPlatformData(platform: 'scrolluniversity' | 'learntube_ai'): Promise<PlatformProfile>;
  updateResearchData(data: ResearchData): Promise<void>;
  validateDataReliability(data: ResearchData): Promise<number>;
  generateComparisonMatrix(platforms: PlatformProfile[]): Promise<FeatureComparisonMatrix>;
  analyzeMarketPositioning(platforms: PlatformProfile[]): Promise<MarketPositioning>;
  generateStrategicRecommendations(analysis: CompetitiveAnalysis): Promise<StrategyRecommendation[]>;
}

export interface CompetitiveAnalysisConfig {
  updateFrequency: 'daily' | 'weekly' | 'monthly';
  dataSourcePriority: Record<string, number>;
  spiritualAlignmentWeight: number;
  kingdomPurposeWeight: number;
  featureCategoryWeights: Record<FeatureCategory, number>;
  confidenceThreshold: number;
}

// Database Schema Interfaces
export interface CompetitiveAnalysisRecord {
  id: string;
  analysis_date: Date;
  scroll_university_data: string; // JSON
  learntube_ai_data: string; // JSON
  comparison_matrix: string; // JSON
  market_analysis: string; // JSON
  strategic_recommendations: string; // JSON
  version: string;
  created_at: Date;
  updated_at: Date;
}

export interface ResearchDataRecord {
  id: string;
  source: string;
  platform: string;
  data_type: string;
  content: string;
  reliability: number;
  verification_status: string;
  spiritual_alignment: boolean;
  tags: string; // JSON array
  created_at: Date;
  updated_at: Date;
}

export interface PlatformProfileRecord {
  id: string;
  platform_name: string;
  architecture_data: string; // JSON
  features_data: string; // JSON
  market_data: string; // JSON
  strengths: string; // JSON array
  weaknesses: string; // JSON array
  last_analyzed: Date;
  created_at: Date;
  updated_at: Date;
}

// LearnTube.ai specific analysis types
export interface LearnTubeFeatureProfile {
  platformName: string;
  analysisDate: Date;
  categories: {
    coreEducation: CompetitiveFeature[];
    aiCapabilities: CompetitiveFeature[];
    communityFeatures: CompetitiveFeature[];
    technicalCapabilities: CompetitiveFeature[];
  };
  overallFeatureCount: number;
  dataSourceReliability: number;
  lastUpdated: Date;
}

export interface CompetitiveFeature {
  name: string;
  category: 'core_education' | 'ai_capabilities' | 'community' | 'technical';
  description: string;
  availability: 'available' | 'limited' | 'unavailable';
  quality: number; // 1-10 scale
  uniqueness: number; // 1-10 scale
  scrollUniversityEquivalent: string;
}

export interface FeatureComparisonScore {
  scoringCriteria: {
    functionality: ScoringCriterion;
    userExperience: ScoringCriterion;
    innovation: ScoringCriterion;
    scalability: ScoringCriterion;
    integration: ScoringCriterion;
    accessibility: ScoringCriterion;
  };
  comparisonMatrix: any;
  overallScoring: {
    scrollUniversityAdvantage: number;
    learnTubeAdvantage: number;
    neutralFeatures: number;
  };
}

export interface ScoringCriterion {
  weight: number;
  description: string;
  scoreRange: { min: number; max: number };
}

export interface GapAnalysisResult {
  analysisDate: Date;
  scrollUniversityAdvantages: CompetitiveAdvantage[];
  potentialGaps: CompetitiveGap[];
  learnTubeUniqueFeatures: UniqueFeature[];
  strategicRecommendations: StrategicRecommendation[];
  overallCompetitivePosition: 'dominant_advantage' | 'strong_advantage' | 'competitive_advantage' | 'needs_improvement';
  confidenceLevel: number;
}

export interface CompetitiveAdvantage {
  category: string;
  advantage: string;
  impact: 'high' | 'medium' | 'low';
  uniqueness: 'exclusive' | 'competitive' | 'standard';
}

export interface CompetitiveGap {
  category: string;
  gap: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface UniqueFeature {
  feature: string;
  description: string;
  evaluation: string;
  recommendation: string;
}

export interface StrategicRecommendation {
  category: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  timeline: string;
  expectedImpact: string;
}