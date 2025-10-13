export interface SpiritualFormation {
  id: string;
  userId: string;
  currentLevel: FormationLevel;
  growthAreas: GrowthArea[];
  propheticGifts: PropheticGift[];
  callingClarity: CallingScore;
  characterDevelopment: CharacterMetrics;
  kingdomImpact: ImpactMeasurement;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormationLevel {
  level: number;
  name: string;
  description: string;
  requirements: string[];
  nextLevelRequirements: string[];
}

export interface GrowthArea {
  id: string;
  name: string;
  description: string;
  currentScore: number;
  targetScore: number;
  milestones: GrowthMilestone[];
  lastAssessment: Date;
}

export interface GrowthMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
  evidence?: string;
}

export interface PropheticGift {
  id: string;
  name: string;
  description: string;
  manifestationLevel: number;
  developmentActivities: string[];
  lastExercised?: Date;
  testimonies: PropheticTestimony[];
}

export interface PropheticTestimony {
  id: string;
  description: string;
  date: Date;
  verified: boolean;
  verifiedBy?: string;
}

export interface CallingScore {
  clarity: number; // 1-100
  alignment: number; // 1-100
  confidence: number; // 1-100
  lastAssessment: Date;
  callingStatement?: string;
  callingAreas: string[];
}

export interface CharacterMetrics {
  integrity: number;
  humility: number;
  faithfulness: number;
  love: number;
  wisdom: number;
  courage: number;
  perseverance: number;
  lastAssessment: Date;
}

export interface ImpactMeasurement {
  livesImpacted: number;
  kingdomProjects: KingdomProject[];
  discipleshipChain: number;
  globalReach: string[];
  testimonies: ImpactTestimony[];
}

export interface KingdomProject {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  impact: string;
  startDate: Date;
  completionDate?: Date;
}

export interface ImpactTestimony {
  id: string;
  description: string;
  category: 'personal' | 'community' | 'organizational' | 'national' | 'global';
  date: Date;
  verifiedBy?: string;
}

// Divine Scorecard Types
export interface DivineScorecard {
  id: string;
  userId: string;
  purpose: PurposeTracking;
  skills: SkillsTracking;
  alignment: AlignmentTracking;
  overallScore: number;
  lastUpdated: Date;
}

export interface PurposeTracking {
  clarity: number; // 1-100
  alignment: number; // 1-100
  progress: number; // 1-100
  milestones: PurposeMilestone[];
  callingStatement: string;
  divineAssignments: DivineAssignment[];
}

export interface PurposeMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date;
  impact: string;
}

export interface DivineAssignment {
  id: string;
  title: string;
  description: string;
  source: 'prayer' | 'prophecy' | 'scripture' | 'mentor' | 'vision';
  status: 'received' | 'confirmed' | 'active' | 'completed';
  deadline?: Date;
  progress: number;
}

export interface SkillsTracking {
  academicSkills: SkillCategory;
  spiritualSkills: SkillCategory;
  practicalSkills: SkillCategory;
  leadershipSkills: SkillCategory;
  overallProgress: number;
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
  averageLevel: number;
  targetLevel: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  currentLevel: number; // 1-10
  targetLevel: number;
  evidence: SkillEvidence[];
  developmentPlan: string[];
  lastAssessed: Date;
}

export interface SkillEvidence {
  id: string;
  type: 'project' | 'assessment' | 'testimony' | 'certification';
  title: string;
  description: string;
  date: Date;
  verifiedBy?: string;
}

export interface AlignmentTracking {
  scrollAlignment: number; // 1-100
  biblicalAlignment: number; // 1-100
  kingdomAlignment: number; // 1-100
  characterAlignment: number; // 1-100
  overallAlignment: number;
  alignmentAreas: AlignmentArea[];
}

export interface AlignmentArea {
  id: string;
  name: string;
  description: string;
  currentScore: number;
  targetScore: number;
  actionItems: string[];
  lastReview: Date;
}

// Prophetic Check-ins Types
export interface PropheticCheckin {
  id: string;
  userId: string;
  date: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  journalEntry: JournalEntry;
  visionBoard: VisionBoardEntry;
  intercessionPrompts: IntercessionPrompt[];
  spiritualTemperature: SpiritualTemperature;
  propheticWords: PropheticWord[];
  actionItems: ActionItem[];
}

export interface JournalEntry {
  id: string;
  content: string;
  mood: string;
  spiritualInsights: string[];
  challenges: string[];
  victories: string[];
  gratitude: string[];
  prayerRequests: string[];
  date: Date;
}

export interface VisionBoardEntry {
  id: string;
  title: string;
  description: string;
  images: VisionImage[];
  scriptures: VisionScripture[];
  goals: VisionGoal[];
  deadline?: Date;
  status: 'active' | 'achieved' | 'revised' | 'archived';
}

export interface VisionImage {
  id: string;
  url: string;
  caption: string;
  category: string;
  addedDate: Date;
}

export interface VisionScripture {
  id: string;
  reference: string;
  text: string;
  application: string;
  addedDate: Date;
}

export interface VisionGoal {
  id: string;
  title: string;
  description: string;
  category: 'spiritual' | 'academic' | 'career' | 'ministry' | 'personal';
  targetDate: Date;
  progress: number;
  milestones: string[];
}

export interface SpiritualTemperature {
  overall: number; // 1-10
  prayerLife: number;
  wordStudy: number;
  worship: number;
  fellowship: number;
  service: number;
  evangelism: number;
  discipleship: number;
  notes: string;
}

export interface PropheticWord {
  id: string;
  source: string;
  content: string;
  date: Date;
  category: 'personal' | 'ministry' | 'calling' | 'warning' | 'encouragement';
  status: 'received' | 'confirmed' | 'fulfilled' | 'pending';
  fulfillmentNotes?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: 'spiritual' | 'academic' | 'practical' | 'relational';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: Date;
  completed: boolean;
  completedAt?: Date;
}

// Intercession and Prayer Types
export interface IntercessionPrompt {
  id: string;
  title: string;
  description: string;
  category: 'personal' | 'family' | 'church' | 'community' | 'nation' | 'global';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  scriptureReference?: string;
  prayerPoints: string[];
  duration: number; // minutes
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  createdAt: Date;
  expiresAt?: Date;
}

export interface PrayerRequest {
  id: string;
  userId: string;
  requesterId?: string;
  title: string;
  description: string;
  category: 'healing' | 'provision' | 'guidance' | 'protection' | 'salvation' | 'breakthrough' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  isPublic: boolean;
  isAnonymous: boolean;
  status: 'active' | 'answered' | 'ongoing' | 'closed';
  prayerCount: number;
  testimonies: PrayerTestimony[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PrayerTestimony {
  id: string;
  prayerRequestId: string;
  userId: string;
  testimony: string;
  category: 'partial_answer' | 'full_answer' | 'miracle' | 'breakthrough';
  date: Date;
  verified: boolean;
}

export interface IntercessionSession {
  id: string;
  userId: string;
  prompts: IntercessionPrompt[];
  prayerRequests: PrayerRequest[];
  duration: number;
  startTime: Date;
  endTime?: Date;
  notes: string;
  spiritualInsights: string[];
  propheticWords: PropheticWord[];
}

// Spiritual Growth Measurement Types
export interface SpiritualGrowthReport {
  id: string;
  userId: string;
  reportType: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: SpiritualMetrics;
  achievements: SpiritualAchievement[];
  challenges: SpiritualChallenge[];
  recommendations: GrowthRecommendation[];
  nextSteps: string[];
  generatedAt: Date;
}

export interface SpiritualMetrics {
  overallGrowth: number; // 1-100
  prayerConsistency: number;
  scriptureEngagement: number;
  serviceParticipation: number;
  discipleshipActivity: number;
  characterDevelopment: number;
  propheticSensitivity: number;
  kingdomImpact: number;
  trends: MetricTrend[];
}

export interface MetricTrend {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
  timeframe: string;
}

export interface SpiritualAchievement {
  id: string;
  title: string;
  description: string;
  category: string;
  date: Date;
  impact: string;
  evidence: string[];
}

export interface SpiritualChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  resources: string[];
}

export interface GrowthRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'prayer' | 'study' | 'service' | 'fellowship' | 'discipleship';
  priority: 'low' | 'medium' | 'high';
  timeframe: string;
  resources: string[];
  expectedOutcome: string;
}