/**
 * Educational Philosophy Comparison Types
 * Defines interfaces for comparing educational philosophies between platforms
 */

export interface EducationalPhilosophy {
  id: string;
  platformName: string;
  coreApproach: PhilosophicalApproach;
  learningMethodology: LearningMethodology;
  assessmentSystem: AssessmentSystem;
  personalizationApproach: PersonalizationApproach;
  spiritualIntegration?: SpiritualIntegration;
  kingdomPurpose?: KingdomPurpose;
  characterDevelopment?: CharacterDevelopment;
  globalTransformation?: GlobalTransformation;
  lastUpdated: Date;
}

export interface PhilosophicalApproach {
  type: 'christ_centered_holistic' | 'secular_skill_focused' | 'hybrid';
  description: string;
  coreValues: string[];
  foundationalPrinciples: string[];
  worldviewAlignment: 'biblical' | 'secular' | 'mixed';
}

export interface LearningMethodology {
  primaryApproach: string;
  pedagogicalFramework: string[];
  instructionalMethods: InstructionalMethod[];
  learningOutcomes: LearningOutcome[];
  competencyFramework: CompetencyFramework;
}

export interface InstructionalMethod {
  name: string;
  description: string;
  spiritualAlignment?: boolean;
  effectiveness: 'high' | 'medium' | 'low';
  culturalSensitivity: boolean;
}

export interface LearningOutcome {
  category: 'academic' | 'spiritual' | 'character' | 'practical' | 'ministry';
  description: string;
  measurable: boolean;
  kingdomImpact?: boolean;
}

export interface CompetencyFramework {
  academicCompetencies: string[];
  spiritualCompetencies?: string[];
  characterCompetencies?: string[];
  practicalCompetencies: string[];
  leadershipCompetencies?: string[];
}

export interface AssessmentSystem {
  assessmentTypes: AssessmentType[];
  evaluationCriteria: EvaluationCriteria[];
  feedbackMechanism: FeedbackMechanism;
  spiritualAssessment?: SpiritualAssessment;
  holisticEvaluation: boolean;
}

export interface AssessmentType {
  name: string;
  description: string;
  frequency: string;
  spiritualComponent: boolean;
  characterComponent: boolean;
  academicComponent: boolean;
}

export interface EvaluationCriteria {
  dimension: string;
  weight: number;
  spiritualAlignment?: boolean;
  kingdomRelevance?: boolean;
}

export interface FeedbackMechanism {
  immediateResponse: boolean;
  personalizedGuidance: boolean;
  spiritualDirection?: boolean;
  propheticInput?: boolean;
  mentorshipIntegration: boolean;
}

export interface SpiritualAssessment {
  spiritualGrowthMetrics: string[];
  characterDevelopmentTracking: boolean;
  propheticValidation: boolean;
  ministryReadiness: boolean;
  callingDiscernment: boolean;
}

export interface PersonalizationApproach {
  adaptiveLearning: boolean;
  culturalAdaptation: boolean;
  spiritualPersonalization?: boolean;
  propheticGuidance?: boolean;
  individualCallingAlignment?: boolean;
  learningStyleAccommodation: boolean;
}

export interface SpiritualIntegration {
  biblicalFoundation: boolean;
  prayerIntegration: boolean;
  propheticElements: boolean;
  characterFormation: boolean;
  ministryPreparation: boolean;
  spiritualGiftsDevelopment: boolean;
}

export interface KingdomPurpose {
  globalTransformationFocus: boolean;
  nationBuilding: boolean;
  righteousSystemsBuilding: boolean;
  scrollSonTraining: boolean;
  propheticLeadershipDevelopment: boolean;
  kingdomEconomyIntegration: boolean;
}

export interface CharacterDevelopment {
  virtueBuilding: boolean;
  integrityFormation: boolean;
  servantLeadership: boolean;
  culturalSensitivity: boolean;
  globalMindset: boolean;
  spiritualMaturity: boolean;
}

export interface GlobalTransformation {
  socialImpactFocus: boolean;
  communityDevelopment: boolean;
  systemicChange: boolean;
  kingdomAdvancement: boolean;
  propheticInfluence: boolean;
  righteousGovernance: boolean;
}

export interface PhilosophyComparison {
  id: string;
  comparisonDate: Date;
  platforms: {
    scrollUniversity: EducationalPhilosophy;
    competitor: EducationalPhilosophy;
  };
  comparisonMatrix: PhilosophyComparisonMatrix;
  advantageAnalysis: AdvantageAnalysis;
  recommendations: PhilosophyRecommendation[];
}

export interface PhilosophyComparisonMatrix {
  categories: PhilosophyCategory[];
  scores: ComparisonScore[];
  overallAdvantage: 'scrolluniversity' | 'competitor' | 'neutral';
}

export interface PhilosophyCategory {
  name: string;
  weight: number;
  subcategories: string[];
  spiritualRelevance: boolean;
}

export interface ComparisonScore {
  category: string;
  scrollUniversityScore: number;
  competitorScore: number;
  advantage: 'scrolluniversity' | 'competitor' | 'neutral';
  reasoning: string;
  spiritualDifferentiator?: boolean;
}

export interface AdvantageAnalysis {
  uniqueStrengths: string[];
  competitiveGaps: string[];
  spiritualAdvantages: string[];
  kingdomDifferentiators: string[];
  marketOpportunities: string[];
}

export interface PhilosophyRecommendation {
  category: 'enhancement' | 'differentiation' | 'positioning' | 'development';
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  spiritualAlignment: boolean;
  kingdomImpact: boolean;
  implementationComplexity: 'low' | 'medium' | 'high';
}

export interface PhilosophyDocumentationConfig {
  includeSpiritual: boolean;
  includeKingdomPurpose: boolean;
  includeCharacterDevelopment: boolean;
  culturalSensitivity: boolean;
  propheticValidation: boolean;
}

export interface PhilosophyTrackingMetrics {
  spiritualGrowthIndicators: string[];
  characterDevelopmentMarkers: string[];
  kingdomImpactMeasures: string[];
  academicProgressMetrics: string[];
  holisticDevelopmentScores: string[];
}