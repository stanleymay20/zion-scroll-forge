/**
 * Prophetic Check-in Types
 * Frontend types for prophetic check-ins and spiritual growth tracking
 */

export interface PropheticCheckIn {
  id: string;
  userId: string;
  timestamp: Date;
  questionnaire: QuestionnaireResponse[];
  spiritualTemperature: number;
  mood: string;
  lifeCircumstances: string;
  prayerFocus: string[];
  scriptureHighlights: string[];
  godsVoice: string;
  obedienceLevel: number;
  communityEngagement: number;
  ministryActivity: string;
  challengesFaced: string[];
  victoriesExperienced: string[];
}

export interface QuestionnaireResponse {
  questionId: string;
  question: string;
  answer: string;
  category: QuestionCategory;
  importance: 'low' | 'medium' | 'high';
}

export type QuestionCategory =
  | 'spiritual-health'
  | 'prayer-life'
  | 'scripture-engagement'
  | 'worship'
  | 'service'
  | 'fellowship'
  | 'character-development'
  | 'calling-clarity'
  | 'prophetic-sensitivity'
  | 'kingdom-impact';

export interface SpiritualGrowthTracking {
  id: string;
  userId: string;
  checkInId: string;
  timestamp: Date;
  overallGrowthScore: number;
  growthTrend: 'accelerating' | 'steady' | 'plateaued' | 'declining';
  growthAreas: GrowthMetric[];
  progressIndicators: ProgressIndicator[];
  milestones: Milestone[];
  comparedToLastMonth: number;
  comparedToLastQuarter: number;
  comparedToLastYear: number;
  insights: string[];
  recommendations: string[];
}

export interface GrowthMetric {
  area: string;
  category: QuestionCategory;
  currentScore: number;
  previousScore: number;
  change: number;
  trend: 'improving' | 'stable' | 'declining';
  evidence: string[];
  nextSteps: string[];
}

export interface ProgressIndicator {
  type: 'gauge' | 'bar' | 'line' | 'radar' | 'tree';
  title: string;
  description: string;
  data: ProgressData;
}

export interface ProgressData {
  current: number;
  target: number;
  history: HistoricalDataPoint[];
  benchmarks: Benchmark[];
}

export interface HistoricalDataPoint {
  date: Date;
  value: number;
  context?: string;
}

export interface Benchmark {
  label: string;
  value: number;
  description: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  category: QuestionCategory;
  achievedDate: Date;
  significance: 'minor' | 'moderate' | 'major' | 'transformational';
  celebration: string;
  scriptureReference?: string;
  nextMilestone?: string;
}

export interface PropheticGuidance {
  id: string;
  userId: string;
  checkInId: string;
  timestamp: Date;
  guidance: GuidanceMessage[];
  scriptureReferences: ScriptureReference[];
  propheticInsights: PropheticInsight[];
  callingClarification: CallingClarification;
  nextSteps: ActionStep[];
  warnings: Warning[];
  encouragements: Encouragement[];
  confidence: number;
  requiresHumanReview: boolean;
}

export interface GuidanceMessage {
  type: 'instruction' | 'encouragement' | 'correction' | 'revelation' | 'confirmation';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scriptureSupport: ScriptureReference[];
  actionable: boolean;
}

export interface ScriptureReference {
  reference: string;
  text: string;
  translation: string;
  context: string;
  application: string;
  propheticSignificance?: string;
}

export interface PropheticInsight {
  type: 'word-of-knowledge' | 'word-of-wisdom' | 'discernment' | 'vision' | 'impression';
  insight: string;
  confidence: number;
  requiresConfirmation: boolean;
  timing: 'immediate' | 'soon' | 'season' | 'future';
  application: string;
}

export interface CallingClarification {
  currentCalling: string;
  callingConfidence: number;
  giftActivation: GiftActivation[];
  ministryOpportunities: MinistryOpportunity[];
  preparationNeeded: PreparationArea[];
  timingGuidance: string;
}

export interface GiftActivation {
  gift: SpiritualGift;
  activationLevel: number;
  evidences: string[];
  developmentPath: string[];
  ministryApplications: string[];
}

export interface SpiritualGift {
  name: string;
  category: 'motivational' | 'ministry' | 'manifestation';
  description: string;
  scriptureReference: string;
}

export interface MinistryOpportunity {
  title: string;
  description: string;
  alignment: number;
  requirements: string[];
  timeline: string;
  prayerPoints: string[];
}

export interface PreparationArea {
  area: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  resources: Resource[];
  mentorshipNeeded: boolean;
  estimatedTime: string;
}

export interface Resource {
  type: 'book' | 'course' | 'article' | 'video' | 'mentor' | 'training';
  title: string;
  author?: string;
  url?: string;
  description: string;
  relevance: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ActionStep {
  step: string;
  category: QuestionCategory;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeline: string;
  resources: Resource[];
  accountability: string[];
  measurable: boolean;
  successCriteria: string[];
}

export interface Warning {
  type: 'spiritual-danger' | 'deception' | 'distraction' | 'compromise' | 'burnout';
  warning: string;
  severity: 'caution' | 'concern' | 'urgent';
  indicators: string[];
  preventionSteps: string[];
  scriptureWarning: ScriptureReference[];
}

export interface Encouragement {
  message: string;
  scripturePromise: ScriptureReference[];
  testimony?: string;
  celebration: string;
  affirmation: string;
}

export interface SpiritualGiftIdentification {
  id: string;
  userId: string;
  timestamp: Date;
  identifiedGifts: IdentifiedGift[];
  giftMix: GiftMix;
  developmentPlan: GiftDevelopmentPlan;
  confidence: number;
  requiresConfirmation: boolean;
}

export interface IdentifiedGift {
  gift: SpiritualGift;
  strength: number;
  maturity: number;
  frequency: 'dormant' | 'emerging' | 'active' | 'mature';
  evidences: string[];
  testimonies: string[];
  fruitfulness: string[];
}

export interface GiftMix {
  primaryGifts: string[];
  secondaryGifts: string[];
  supportingGifts: string[];
  uniqueCombination: string;
  ministryFit: string[];
}

export interface GiftDevelopmentPlan {
  gifts: string[];
  developmentStages: DevelopmentStage[];
  trainingResources: Resource[];
  practiceOpportunities: PracticeOpportunity[];
  mentorshipRecommendations: MentorshipRecommendation[];
  timeline: string;
}

export interface DevelopmentStage {
  stage: string;
  description: string;
  duration: string;
  activities: string[];
  milestones: string[];
  resources: Resource[];
}

export interface PracticeOpportunity {
  gift: string;
  opportunity: string;
  setting: string;
  frequency: string;
  supervision: boolean;
  feedback: string;
}

export interface MentorshipRecommendation {
  gift: string;
  mentorType: string;
  mentorCharacteristics: string[];
  mentorshipDuration: string;
  mentorshipGoals: string[];
}

export interface CallingDiscernment {
  id: string;
  userId: string;
  timestamp: Date;
  callingStatement: string;
  callingConfidence: number;
  callingComponents: CallingComponent[];
  discernmentJourney: DiscernmentEntry[];
  confirmations: CallingConfirmation[];
  questions: CallingQuestion[];
  giftAlignment: number;
  passionAlignment: number;
  opportunityAlignment: number;
  fruitAlignment: number;
  nextSteps: CallingNextStep[];
  preparationPath: PreparationPath;
  timingGuidance: TimingGuidance;
  confidence: number;
}

export interface CallingComponent {
  component: string;
  description: string;
  strength: number;
  evidences: string[];
  development: string;
}

export interface DiscernmentEntry {
  date: Date;
  entry: string;
  insights: string[];
  questions: string[];
  confirmations: string[];
  concerns: string[];
}

export interface CallingConfirmation {
  source: 'scripture' | 'prophecy' | 'circumstances' | 'counsel' | 'peace' | 'fruit';
  confirmation: string;
  date: Date;
  significance: 'minor' | 'moderate' | 'major';
  details: string;
}

export interface CallingQuestion {
  question: string;
  category: 'clarity' | 'timing' | 'preparation' | 'confirmation' | 'obstacles';
  urgency: 'low' | 'medium' | 'high';
  explorationSteps: string[];
  resources: Resource[];
}

export interface CallingNextStep {
  step: string;
  category: QuestionCategory;
  priority: 'low' | 'medium' | 'high';
  timeline: string;
  dependencies: string[];
  resources: Resource[];
  accountability: string[];
}

export interface PreparationPath {
  currentReadiness: number;
  targetReadiness: number;
  preparationAreas: PreparationArea[];
  estimatedDuration: string;
  milestones: PreparationMilestone[];
}

export interface PreparationMilestone {
  milestone: string;
  description: string;
  targetDate: Date;
  requirements: string[];
  celebration: string;
}

export interface TimingGuidance {
  currentSeason: string;
  readiness: 'not-ready' | 'preparing' | 'ready' | 'active';
  indicators: string[];
  waitingGuidance?: string;
  activationGuidance?: string;
  prayerPoints: string[];
}
