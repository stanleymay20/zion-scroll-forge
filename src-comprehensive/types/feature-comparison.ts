/**
 * ScrollUniversity Feature Comparison Matrix Types
 * Comprehensive type definitions for competitive analysis feature comparison
 */

export interface FeatureInventorySystem {
  id: string;
  name: string;
  version: string;
  lastUpdated: Date;
  features: ScrollUniversityFeature[];
  categories: FeatureCategory[];
  scoringSystem: FeatureScoringSystem;
  uniqueDifferentiators: UniqueDifferentiator[];
}

export interface ScrollUniversityFeature {
  id: string;
  name: string;
  description: string;
  category: FeatureCategoryType;
  subcategory?: string;
  status: FeatureStatus;
  maturityLevel: FeatureMaturityLevel;
  spiritualAlignment: SpiritualAlignmentLevel;
  technicalComplexity: TechnicalComplexityLevel;
  competitiveAdvantage: CompetitiveAdvantageLevel;
  userImpact: UserImpactLevel;
  implementationDetails: ImplementationDetails;
  requirements: string[];
  dependencies: string[];
  metrics: FeatureMetrics;
  tags: string[];
}

export interface FeatureCategory {
  id: string;
  name: string;
  type: FeatureCategoryType;
  description: string;
  weight: number;
  subcategories: FeatureSubcategory[];
  scoringCriteria: ScoringCriteria[];
}

export interface FeatureSubcategory {
  id: string;
  name: string;
  description: string;
  weight: number;
  parentCategory: FeatureCategoryType;
}

export interface FeatureScoringSystem {
  version: string;
  criteria: ScoringCriteria[];
  weights: CategoryWeights;
  methodology: ScoringMethodology;
  benchmarks: CompetitiveBenchmarks;
}

export interface ScoringCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  scale: ScoringScale;
  evaluationMethod: EvaluationMethod;
}

export interface UniqueDifferentiator {
  id: string;
  name: string;
  description: string;
  category: DifferentiatorCategory;
  competitiveGap: CompetitiveGapLevel;
  marketImpact: MarketImpactLevel;
  spiritualSignificance: SpiritualSignificanceLevel;
  technicalInnovation: TechnicalInnovationLevel;
  evidence: DifferentiatorEvidence[];
  relatedFeatures: string[];
}

export interface ImplementationDetails {
  services: string[];
  components: string[];
  apis: string[];
  databases: string[];
  integrations: string[];
  technologies: string[];
  architecture: ArchitecturePattern[];
}

export interface FeatureMetrics {
  userAdoption: number;
  performanceScore: number;
  reliabilityScore: number;
  satisfactionScore: number;
  spiritualImpactScore: number;
  competitiveScore: number;
  lastMeasured: Date;
}

export interface DifferentiatorEvidence {
  type: EvidenceType;
  description: string;
  source: string;
  reliability: ReliabilityLevel;
  lastVerified: Date;
}

export interface CategoryWeights {
  coreEducation: number;
  aiCapabilities: number;
  spiritualFormation: number;
  globalAccessibility: number;
  communityCollaboration: number;
  blockchainIntegration: number;
  xrImmersion: number;
  culturalFluency: number;
  assessmentEvaluation: number;
  credentialVerification: number;
}

export interface ScoringMethodology {
  approach: 'weighted_average' | 'hierarchical' | 'matrix_based';
  normalization: 'linear' | 'logarithmic' | 'exponential';
  aggregation: 'sum' | 'product' | 'geometric_mean';
  benchmarking: 'absolute' | 'relative' | 'competitive';
}

export interface CompetitiveBenchmarks {
  industry: IndustryBenchmark[];
  competitors: CompetitorBenchmark[];
  standards: StandardBenchmark[];
}

export interface IndustryBenchmark {
  metric: string;
  value: number;
  source: string;
  date: Date;
}

export interface CompetitorBenchmark {
  competitor: string;
  metric: string;
  value: number;
  confidence: ConfidenceLevel;
  source: string;
  date: Date;
}

export interface StandardBenchmark {
  standard: string;
  requirement: string;
  compliance: ComplianceLevel;
  certification: string;
  date: Date;
}

// Enums and Union Types

export type FeatureCategoryType = 
  | 'core_education'
  | 'ai_capabilities'
  | 'spiritual_formation'
  | 'global_accessibility'
  | 'community_collaboration'
  | 'blockchain_integration'
  | 'xr_immersion'
  | 'cultural_fluency'
  | 'assessment_evaluation'
  | 'credential_verification'
  | 'content_creation'
  | 'user_experience'
  | 'mobile_platform'
  | 'security_privacy'
  | 'analytics_insights';

export type FeatureStatus = 
  | 'production'
  | 'beta'
  | 'alpha'
  | 'development'
  | 'planned'
  | 'research'
  | 'deprecated';

export type FeatureMaturityLevel = 
  | 'experimental'
  | 'emerging'
  | 'developing'
  | 'mature'
  | 'advanced'
  | 'revolutionary';

export type SpiritualAlignmentLevel = 
  | 'foundational'
  | 'integrated'
  | 'enhanced'
  | 'prophetic'
  | 'transformational';

export type TechnicalComplexityLevel = 
  | 'basic'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'cutting_edge';

export type CompetitiveAdvantageLevel = 
  | 'parity'
  | 'slight_advantage'
  | 'significant_advantage'
  | 'major_advantage'
  | 'revolutionary_advantage';

export type UserImpactLevel = 
  | 'minimal'
  | 'moderate'
  | 'significant'
  | 'transformational'
  | 'life_changing';

export type DifferentiatorCategory = 
  | 'spiritual_integration'
  | 'prophetic_ai'
  | 'blockchain_economy'
  | 'global_accessibility'
  | 'holistic_development'
  | 'kingdom_purpose'
  | 'cultural_fluency'
  | 'immersive_learning';

export type CompetitiveGapLevel = 
  | 'no_gap'
  | 'small_gap'
  | 'moderate_gap'
  | 'large_gap'
  | 'revolutionary_gap';

export type MarketImpactLevel = 
  | 'niche'
  | 'segment'
  | 'market'
  | 'industry'
  | 'global';

export type SpiritualSignificanceLevel = 
  | 'supportive'
  | 'important'
  | 'significant'
  | 'foundational'
  | 'transformational';

export type TechnicalInnovationLevel = 
  | 'incremental'
  | 'notable'
  | 'significant'
  | 'breakthrough'
  | 'revolutionary';

export type EvidenceType = 
  | 'user_feedback'
  | 'market_research'
  | 'technical_analysis'
  | 'competitive_intelligence'
  | 'spiritual_discernment'
  | 'performance_metrics';

export type ReliabilityLevel = 
  | 'low'
  | 'medium'
  | 'high'
  | 'verified'
  | 'authoritative';

export type ConfidenceLevel = 
  | 'low'
  | 'medium'
  | 'high'
  | 'very_high'
  | 'certain';

export type ComplianceLevel = 
  | 'non_compliant'
  | 'partially_compliant'
  | 'compliant'
  | 'exceeds_requirements'
  | 'sets_standard';

export type ScoringScale = 
  | 'binary'
  | 'three_point'
  | 'five_point'
  | 'ten_point'
  | 'percentage';

export type EvaluationMethod = 
  | 'objective_measurement'
  | 'expert_assessment'
  | 'user_survey'
  | 'competitive_analysis'
  | 'spiritual_discernment';

export type ArchitecturePattern = 
  | 'microservices'
  | 'event_driven'
  | 'blockchain_integrated'
  | 'ai_powered'
  | 'offline_first'
  | 'mesh_network'
  | 'spiritual_aligned';

// Feature Comparison Interfaces

export interface FeatureComparison {
  featureId: string;
  scrollUniversity: PlatformFeatureProfile;
  learnTubeAI: PlatformFeatureProfile;
  comparisonScore: ComparisonScore;
  analysis: ComparisonAnalysis;
  recommendations: FeatureRecommendation[];
}

export interface PlatformFeatureProfile {
  platform: 'scrolluniversity' | 'learntube_ai';
  hasFeature: boolean;
  implementation: ImplementationQuality;
  maturity: FeatureMaturityLevel;
  userExperience: UserExperienceQuality;
  technicalQuality: TechnicalQuality;
  marketPosition: MarketPositionStrength;
  evidence: FeatureEvidence[];
}

export interface ComparisonScore {
  overall: number;
  categories: CategoryScores;
  advantage: CompetitiveAdvantageLevel;
  confidence: ConfidenceLevel;
}

export interface CategoryScores {
  functionality: number;
  usability: number;
  performance: number;
  innovation: number;
  spiritualAlignment: number;
  marketFit: number;
}

export interface ComparisonAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  keyDifferentiators: string[];
  competitiveGaps: string[];
}

export interface FeatureRecommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  description: string;
  rationale: string;
  expectedImpact: string;
  timeline: string;
  resources: string[];
}

export interface ImplementationQuality {
  completeness: number;
  reliability: number;
  performance: number;
  scalability: number;
  maintainability: number;
}

export interface UserExperienceQuality {
  usability: number;
  accessibility: number;
  satisfaction: number;
  adoption: number;
  retention: number;
}

export interface TechnicalQuality {
  architecture: number;
  security: number;
  performance: number;
  scalability: number;
  innovation: number;
}

export interface MarketPositionStrength {
  differentiation: number;
  competitiveness: number;
  marketFit: number;
  adoption: number;
  growth: number;
}

export interface FeatureEvidence {
  type: EvidenceType;
  description: string;
  source: string;
  reliability: ReliabilityLevel;
  date: Date;
  url?: string;
}

export type RecommendationType = 
  | 'enhance_existing'
  | 'develop_new'
  | 'improve_integration'
  | 'optimize_performance'
  | 'expand_capability'
  | 'spiritual_enhancement';

export type RecommendationPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'strategic';

// API Response Types

export interface FeatureInventoryResponse {
  success: boolean;
  data?: FeatureInventorySystem;
  error?: string;
  metadata?: {
    totalFeatures: number;
    categoriesCount: number;
    lastUpdated: Date;
    version: string;
  };
}

export interface FeatureComparisonResponse {
  success: boolean;
  data?: FeatureComparison[];
  error?: string;
  metadata?: {
    totalComparisons: number;
    overallAdvantage: CompetitiveAdvantageLevel;
    confidenceScore: number;
    analysisDate: Date;
  };
}

export interface FeatureScoringResponse {
  success: boolean;
  data?: {
    overallScore: number;
    categoryScores: CategoryScores;
    competitivePosition: CompetitiveAdvantageLevel;
    recommendations: FeatureRecommendation[];
  };
  error?: string;
}