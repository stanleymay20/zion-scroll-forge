export interface StudentProgressMetrics {
  studentId: string;
  academicProgress: AcademicProgressMetrics;
  spiritualGrowth: SpiritualGrowthMetrics;
  careerPathway: CareerPathwayMetrics;
  interventionAlerts: InterventionAlert[];
  lastUpdated: Date;
}

export interface AcademicProgressMetrics {
  overallGPA: number;
  courseCompletionRate: number;
  scrollBadgesEarned: number;
  assessmentScores: AssessmentScore[];
  learningVelocity: number;
  strugglingSubjects: string[];
  excelling: string[];
}

export interface SpiritualGrowthMetrics {
  divineScorecard: {
    purpose: number;
    skills: number;
    scrollAlignment: number;
  };
  propheticCheckins: PropheticCheckinMetrics;
  prayerEngagement: number;
  scriptureKnowledge: number;
  characterDevelopment: CharacterMetrics;
  kingdomImpact: number;
}

export interface CareerPathwayMetrics {
  selectedTrack: CareerTrack;
  progressPercentage: number;
  competenciesAchieved: string[];
  practicalProjects: ProjectMetrics[];
  mentorshipHours: number;
  industryReadiness: number;
}

export interface FacultyPerformanceMetrics {
  facultyId: string;
  facultyType: 'human' | 'ai' | 'prophetic' | 'angelic';
  studentEngagement: EngagementMetrics;
  teachingEffectiveness: number;
  spiritualImpartation: number;
  responseTime: number;
  studentSatisfaction: number;
  coursesManaged: number;
  interventionsTriggered: number;
}

export interface GlobalImpactMetrics {
  totalStudents: number;
  globalReach: GeographicDistribution;
  careerPathwayDistribution: CareerPathwayDistribution;
  scrollCoinEconomy: ScrollCoinMetrics;
  kingdomImpact: KingdomImpactMetrics;
  partnershipMetrics: PartnershipMetrics;
  accessibilityMetrics: AccessibilityMetrics;
}

export interface InterventionAlert {
  id: string;
  studentId: string;
  type: 'academic' | 'spiritual' | 'engagement' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedActions: string[];
  assignedTo?: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface AnalyticsDashboardData {
  overview: OverviewMetrics;
  studentProgress: StudentProgressMetrics[];
  facultyPerformance: FacultyPerformanceMetrics[];
  globalImpact: GlobalImpactMetrics;
  interventionAlerts: InterventionAlert[];
  trends: TrendAnalysis;
}

export interface OverviewMetrics {
  totalActiveStudents: number;
  totalFaculty: number;
  coursesOffered: number;
  scrollBadgesIssued: number;
  graduationRate: number;
  globalReachCountries: number;
  averageSpiritualGrowth: number;
  scrollCoinCirculation: number;
}

export interface TrendAnalysis {
  enrollmentTrends: TimeSeries[];
  completionTrends: TimeSeries[];
  spiritualGrowthTrends: TimeSeries[];
  careerPathwayTrends: CareerPathwayTrend[];
  globalExpansionTrends: GeographicTrend[];
}

export interface TimeSeries {
  date: Date;
  value: number;
  label?: string;
}

export interface CareerPathwayTrend {
  pathway: CareerTrack;
  enrollmentCount: number;
  completionRate: number;
  employmentRate: number;
  impactScore: number;
}

export interface GeographicTrend {
  region: string;
  country: string;
  studentCount: number;
  growthRate: number;
  accessibilityScore: number;
}

export type CareerTrack = 
  | 'ScrollFounder'
  | 'ScrollAmbassador' 
  | 'ScrollPriest'
  | 'ScrollScribe'
  | 'ScrollEngineer'
  | 'ScrollScholar'
  | 'ScrollBuilder';

export interface AssessmentScore {
  courseId: string;
  courseName: string;
  score: number;
  maxScore: number;
  completedAt: Date;
}

export interface PropheticCheckinMetrics {
  frequency: number;
  visionBoardUpdates: number;
  intercessionPrompts: number;
  propheticAccuracy: number;
}

export interface CharacterMetrics {
  integrity: number;
  humility: number;
  faithfulness: number;
  wisdom: number;
  love: number;
}

export interface ProjectMetrics {
  projectId: string;
  projectName: string;
  completionStatus: number;
  impactScore: number;
  skillsApplied: string[];
}

export interface EngagementMetrics {
  averageSessionDuration: number;
  responseRate: number;
  studentInteractions: number;
  feedbackScore: number;
}

export interface GeographicDistribution {
  [country: string]: {
    studentCount: number;
    activeUsers: number;
    completionRate: number;
  };
}

export interface CareerPathwayDistribution {
  [pathway in CareerTrack]: {
    enrolled: number;
    completed: number;
    employed: number;
    impactScore: number;
  };
}

export interface ScrollCoinMetrics {
  totalCirculation: number;
  dailyTransactions: number;
  rewardDistribution: RewardDistribution;
  economicHealth: number;
}

export interface RewardDistribution {
  courseCompletion: number;
  peerAssistance: number;
  sacredTechnology: number;
  communityBuilding: number;
}

export interface KingdomImpactMetrics {
  graduatesInMinistry: number;
  businessesLaunched: number;
  nationsServed: number;
  livesTransformed: number;
  socialImpactProjects: number;
}

export interface PartnershipMetrics {
  activePartners: number;
  credentialsRecognized: number;
  guestLectures: number;
  collaborativeProjects: number;
}

export interface AccessibilityMetrics {
  offlineUsers: number;
  meshNetworkNodes: number;
  solarMicrohubsConnected: number;
  multilingualUsers: LanguageDistribution;
}

export interface LanguageDistribution {
  [language: string]: number;
}

export interface AnalyticsFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  region?: string;
  careerPathway?: CareerTrack;
  facultyType?: string;
  studentCohort?: string;
}

export interface ReportConfiguration {
  id: string;
  name: string;
  type: 'student_progress' | 'faculty_performance' | 'global_impact' | 'intervention_summary';
  filters: AnalyticsFilters;
  metrics: string[];
  schedule?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
}