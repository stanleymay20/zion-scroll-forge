import {
  CareerProject,
  ProjectStatus,
  ProjectType,
  ImpactMeasurement,
  ProjectObjective,
  ProjectDeliverable,
  DeliverableStatus
} from '../types/career-pathways';

export interface ScrollFounderProgram {
  id: string;
  studentId: string;
  programPhase: FounderProgramPhase;
  businessConcept: BusinessConcept;
  kingdomAlignment: KingdomAlignment;
  businessPlan: BusinessPlan;
  mentorshipTeam: FounderMentorshipTeam;
  milestones: FounderMilestone[];
  resources: FounderResource[];
  networkConnections: NetworkConnection[];
  fundingStatus: FundingStatus;
  launchMetrics: LaunchMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export enum FounderProgramPhase {
  CALLING_DISCOVERY = 'Calling Discovery',
  CONCEPT_DEVELOPMENT = 'Concept Development',
  BUSINESS_PLANNING = 'Business Planning',
  PROTOTYPE_BUILDING = 'Prototype Building',
  MARKET_VALIDATION = 'Market Validation',
  FUNDING_PREPARATION = 'Funding Preparation',
  LAUNCH_EXECUTION = 'Launch Execution',
  SCALING_GROWTH = 'Scaling & Growth',
  KINGDOM_IMPACT = 'Kingdom Impact'
}

export interface BusinessConcept {
  id: string;
  name: string;
  vision: string;
  mission: string;
  problemStatement: string;
  solutionDescription: string;
  targetMarket: TargetMarket;
  valueProposition: string;
  kingdomPurpose: string;
  competitiveAdvantage: string;
  businessModel: BusinessModel;
  validated: boolean;
  validationDate?: Date;
}

export interface TargetMarket {
  primarySegment: string;
  secondarySegments: string[];
  marketSize: MarketSize;
  customerPersonas: CustomerPersona[];
  geographicFocus: string[];
  culturalConsiderations: string[];
}

export interface MarketSize {
  totalAddressableMarket: number;
  serviceableAddressableMarket: number;
  serviceableObtainableMarket: number;
  currency: string;
  timeframe: string;
  sources: string[];
}

export interface CustomerPersona {
  name: string;
  demographics: Demographics;
  psychographics: Psychographics;
  painPoints: string[];
  motivations: string[];
  buyingBehavior: BuyingBehavior;
  spiritualContext: SpiritualContext;
}

export interface Demographics {
  ageRange: string;
  gender: string;
  income: string;
  education: string;
  location: string;
  occupation: string;
}

export interface Psychographics {
  values: string[];
  interests: string[];
  lifestyle: string;
  personality: string[];
  attitudes: string[];
}

export interface BuyingBehavior {
  decisionFactors: string[];
  purchaseProcess: string[];
  pricesensitivity: string;
  channelPreferences: string[];
  influencers: string[];
}

export interface SpiritualContext {
  faithBackground: string;
  spiritualNeeds: string[];
  kingdomValues: string[];
  churchConnection: string;
  ministryInvolvement: string;
}

export interface BusinessModel {
  revenueStreams: RevenueStream[];
  costStructure: CostStructure;
  keyResources: string[];
  keyActivities: string[];
  keyPartnerships: string[];
  channels: string[];
  customerRelationships: string[];
  kingdomImpactModel: KingdomImpactModel;
}

export interface RevenueStream {
  name: string;
  type: RevenueType;
  description: string;
  pricingModel: PricingModel;
  projectedRevenue: number;
  timeframe: string;
  assumptions: string[];
}

export enum RevenueType {
  PRODUCT_SALES = 'Product Sales',
  SERVICE_FEES = 'Service Fees',
  SUBSCRIPTION = 'Subscription',
  LICENSING = 'Licensing',
  ADVERTISING = 'Advertising',
  COMMISSION = 'Commission',
  DONATION = 'Donation',
  GRANT = 'Grant'
}

export interface PricingModel {
  strategy: PricingStrategy;
  basePrice: number;
  currency: string;
  discounts: Discount[];
  bundling: BundlingOption[];
  freemiumTier?: FreemiumTier;
}

export enum PricingStrategy {
  COST_PLUS = 'Cost Plus',
  VALUE_BASED = 'Value Based',
  COMPETITIVE = 'Competitive',
  PENETRATION = 'Penetration',
  SKIMMING = 'Skimming',
  FREEMIUM = 'Freemium',
  DONATION_BASED = 'Donation Based'
}

export interface Discount {
  type: string;
  percentage: number;
  conditions: string[];
  duration: string;
}

export interface BundlingOption {
  name: string;
  components: string[];
  bundlePrice: number;
  savings: number;
}

export interface FreemiumTier {
  features: string[];
  limitations: string[];
  conversionStrategy: string;
  expectedConversionRate: number;
}

export interface CostStructure {
  fixedCosts: CostItem[];
  variableCosts: CostItem[];
  totalProjectedCosts: number;
  breakEvenPoint: BreakEvenAnalysis;
  profitabilityProjection: ProfitabilityProjection;
}

export interface CostItem {
  category: string;
  description: string;
  amount: number;
  frequency: string;
  scalability: string;
}

export interface BreakEvenAnalysis {
  unitsToBreakEven: number;
  timeToBreakEven: string;
  revenueAtBreakEven: number;
  assumptions: string[];
}

export interface ProfitabilityProjection {
  year1: number;
  year2: number;
  year3: number;
  year5: number;
  assumptions: string[];
}

export interface KingdomImpactModel {
  primaryImpact: string;
  secondaryImpacts: string[];
  beneficiaries: Beneficiary[];
  impactMetrics: ImpactMetric[];
  sustainabilityPlan: string;
  scalabilityPotential: string;
  kingdomMultiplier: number;
}

export interface Beneficiary {
  group: string;
  size: number;
  impactDescription: string;
  measurableOutcomes: string[];
}

export interface ImpactMetric {
  name: string;
  description: string;
  measurementMethod: string;
  targetValue: number;
  timeframe: string;
  currentValue?: number;
}

export interface KingdomAlignment {
  biblicalFoundation: BiblicalFoundation;
  spiritualPurpose: string;
  ethicalStandards: EthicalStandard[];
  kingdomValues: KingdomValue[];
  propheticConfirmation: PropheticConfirmation[];
  spiritualCovering: SpiritualCovering;
  accountabilityStructure: AccountabilityStructure;
}

export interface BiblicalFoundation {
  keyVerses: BibleVerse[];
  biblicalPrinciples: string[];
  theologicalAlignment: string;
  scriptureStudy: ScriptureStudy[];
}

export interface BibleVerse {
  reference: string;
  text: string;
  application: string;
  relevance: string;
}

export interface ScriptureStudy {
  topic: string;
  verses: string[];
  insights: string[];
  applications: string[];
  date: Date;
}

export interface EthicalStandard {
  principle: string;
  description: string;
  implementation: string[];
  monitoring: string;
  consequences: string;
}

export interface KingdomValue {
  name: string;
  description: string;
  businessApplication: string;
  measurableIndicators: string[];
  priority: number;
}

export interface PropheticConfirmation {
  source: string;
  date: Date;
  confirmation: string;
  context: string;
  witnesses: string[];
  fulfilled?: boolean;
  fulfillmentDate?: Date;
}

export interface SpiritualCovering {
  pastor: string;
  church: string;
  spiritualAdvisors: SpiritualAdvisor[];
  prayerTeam: PrayerTeamMember[];
  accountabilityPartners: AccountabilityPartner[];
}

export interface SpiritualAdvisor {
  name: string;
  role: string;
  expertise: string[];
  relationship: string;
  contactInfo: string;
}

export interface PrayerTeamMember {
  name: string;
  role: string;
  prayerFocus: string[];
  commitment: string;
}

export interface AccountabilityPartner {
  name: string;
  relationship: string;
  accountabilityAreas: string[];
  meetingFrequency: string;
}

export interface AccountabilityStructure {
  boardOfAdvisors: BoardMember[];
  reportingSchedule: ReportingSchedule;
  performanceMetrics: PerformanceMetric[];
  correctionMechanisms: CorrectionMechanism[];
}

export interface BoardMember {
  name: string;
  role: string;
  expertise: string[];
  spiritualMaturity: number;
  businessExperience: string;
  commitment: string;
}

export interface ReportingSchedule {
  frequency: string;
  format: string;
  recipients: string[];
  content: string[];
  reviewProcess: string;
}

export interface PerformanceMetric {
  category: string;
  metric: string;
  target: number;
  measurement: string;
  frequency: string;
  accountability: string;
}

export interface CorrectionMechanism {
  trigger: string;
  process: string[];
  authority: string;
  timeline: string;
  escalation: string;
}

export interface BusinessPlan {
  executiveSummary: ExecutiveSummary;
  companyDescription: CompanyDescription;
  marketAnalysis: MarketAnalysis;
  organizationManagement: OrganizationManagement;
  serviceProductLine: ServiceProductLine;
  marketingSales: MarketingSales;
  fundingRequest: FundingRequest;
  financialProjections: FinancialProjections;
  appendix: PlanAppendix;
  kingdomImpactPlan: KingdomImpactPlan;
}

export interface ExecutiveSummary {
  businessOverview: string;
  missionStatement: string;
  keysToSuccess: string[];
  financialSummary: FinancialSummary;
  kingdomImpactSummary: string;
}

export interface FinancialSummary {
  startupCosts: number;
  projectedRevenue: ProjectedRevenue;
  profitability: ProfitabilityTimeline;
  fundingNeeds: number;
  returnOnInvestment: number;
}

export interface ProjectedRevenue {
  year1: number;
  year2: number;
  year3: number;
  year5: number;
  assumptions: string[];
}

export interface ProfitabilityTimeline {
  breakEvenMonth: number;
  profitableMonth: number;
  sustainableProfitMonth: number;
}

// Additional interfaces for other business plan sections...
// (Keeping this concise for the implementation)

export class ScrollFounderService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = '/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  // Program enrollment and management
  async enrollInScrollFounderProgram(studentId: string): Promise<ScrollFounderProgram> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-founder/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId })
      });

      if (!response.ok) {
        throw new Error('Failed to enroll in ScrollFounder program');
      }

      return await response.json();
    } catch (error) {
      console.error('Error enrolling in ScrollFounder program:', error);
      throw error;
    }
  }

  async getFounderProgram(studentId: string): Promise<ScrollFounderProgram | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-founder/program/${studentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to get founder program');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting founder program:', error);
      throw error;
    }
  }

  async updateProgramPhase(studentId: string, phase: FounderProgramPhase): Promise<ScrollFounderProgram> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-founder/program/${studentId}/phase`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ phase })
      });

      if (!response.ok) {
        throw new Error('Failed to update program phase');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating program phase:', error);
      throw error;
    }
  }

  // Business concept development
  async createBusinessConcept(studentId: string, conceptData: Partial<BusinessConcept>): Promise<BusinessConcept> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-founder/concept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, ...conceptData })
      });

      if (!response.ok) {
        throw new Error('Failed to create business concept');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating business concept:', error);
      throw error;
    }
  }

  async validateBusinessConcept(conceptId: string): Promise<{
    validated: boolean;
    feedback: string[];
    recommendations: string[];
    nextSteps: string[];
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-founder/concept/${conceptId}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to validate business concept');
      }

      return await response.json();
    } catch (error) {
      console.error('Error validating business concept:', error);
      throw error;
    }
  }

  // Kingdom alignment assessment
  async assessKingdomAlignment(studentId: string, alignmentData: Partial<KingdomAlignment>): Promise<KingdomAlignment> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-founder/kingdom-alignment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, ...alignmentData })
      });

      if (!response.ok) {
        throw new Error('Failed to assess kingdom alignment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assessing kingdom alignment:', error);
      throw error;
    }
  }

  // Business plan development
  async generateBusinessPlanTemplate(conceptId: string): Promise<BusinessPlan> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-founder/business-plan/template/${conceptId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate business plan template');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating business plan template:', error);
      throw error;
    }
  }

  async updateBusinessPlan(studentId: string, planData: Partial<BusinessPlan>): Promise<BusinessPlan> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-founder/business-plan/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(planData)
      });

      if (!response.ok) {
        throw new Error('Failed to update business plan');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating business plan:', error);
      throw error;
    }
  }

  // Mentorship and networking
  async requestFounderMentor(studentId: string, mentorshipNeeds: string[]): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-founder/mentor/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, mentorshipNeeds })
      });

      if (!response.ok) {
        throw new Error('Failed to request founder mentor');
      }
    } catch (error) {
      console.error('Error requesting founder mentor:', error);
      throw error;
    }
  }

  async connectWithFounderNetwork(studentId: string, interests: string[]): Promise<NetworkConnection[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-founder/network/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, interests })
      });

      if (!response.ok) {
        throw new Error('Failed to connect with founder network');
      }

      return await response.json();
    } catch (error) {
      console.error('Error connecting with founder network:', error);
      throw error;
    }
  }

  // Launch preparation and execution
  async prepareLaunchPlan(studentId: string): Promise<LaunchPlan> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-founder/launch/prepare/${studentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to prepare launch plan');
      }

      return await response.json();
    } catch (error) {
      console.error('Error preparing launch plan:', error);
      throw error;
    }
  }

  async trackLaunchMetrics(studentId: string, metrics: Partial<LaunchMetrics>): Promise<LaunchMetrics> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-founder/launch/metrics/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(metrics)
      });

      if (!response.ok) {
        throw new Error('Failed to track launch metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error tracking launch metrics:', error);
      throw error;
    }
  }

  // AI-powered guidance and recommendations
  async getAIGuidance(studentId: string, context: string): Promise<{
    guidance: string;
    recommendations: string[];
    resources: string[];
    nextSteps: string[];
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/scroll-founder/ai-guidance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studentId, context })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI guidance');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting AI guidance:', error);
      throw error;
    }
  }
}

// Additional interfaces for launch planning and metrics
export interface LaunchPlan {
  id: string;
  studentId: string;
  launchDate: Date;
  prelaunchTasks: LaunchTask[];
  launchTasks: LaunchTask[];
  postlaunchTasks: LaunchTask[];
  marketingStrategy: MarketingStrategy;
  operationalPlan: OperationalPlan;
  riskMitigation: RiskMitigation[];
  successMetrics: SuccessMetric[];
}

export interface LaunchTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: Date;
  status: TaskStatus;
  dependencies: string[];
  priority: TaskPriority;
}

export enum TaskStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  BLOCKED = 'Blocked',
  CANCELLED = 'Cancelled'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface LaunchMetrics {
  customersAcquired: number;
  revenueGenerated: number;
  marketPenetration: number;
  customerSatisfaction: number;
  kingdomImpactScore: number;
  spiritualFruitfulness: number;
  teamGrowth: number;
  partnershipsDeveloped: number;
}

export interface NetworkConnection {
  id: string;
  name: string;
  role: string;
  company: string;
  expertise: string[];
  connectionType: ConnectionType;
  relationshipStrength: number;
  lastContact: Date;
  notes: string;
}

export enum ConnectionType {
  MENTOR = 'Mentor',
  PEER = 'Peer',
  INVESTOR = 'Investor',
  PARTNER = 'Partner',
  CUSTOMER = 'Customer',
  ADVISOR = 'Advisor',
  SUPPLIER = 'Supplier'
}

// Additional supporting interfaces...
export interface MarketingStrategy {
  targetAudience: string[];
  channels: MarketingChannel[];
  budget: number;
  timeline: MarketingTimeline;
  messaging: BrandMessaging;
}

export interface MarketingChannel {
  name: string;
  budget: number;
  expectedReach: number;
  expectedConversion: number;
  timeline: string;
}

export interface MarketingTimeline {
  prelaunch: MarketingActivity[];
  launch: MarketingActivity[];
  postlaunch: MarketingActivity[];
}

export interface MarketingActivity {
  activity: string;
  date: Date;
  budget: number;
  expectedOutcome: string;
}

export interface BrandMessaging {
  valueProposition: string;
  keyMessages: string[];
  brandVoice: string;
  differentiators: string[];
}

export interface OperationalPlan {
  teamStructure: TeamMember[];
  processes: BusinessProcess[];
  systems: BusinessSystem[];
  suppliers: Supplier[];
  qualityControl: QualityControl;
}

export interface TeamMember {
  name: string;
  role: string;
  responsibilities: string[];
  startDate: Date;
  compensation: CompensationPackage;
}

export interface CompensationPackage {
  salary: number;
  equity: number;
  benefits: string[];
  performanceIncentives: string[];
}

export interface BusinessProcess {
  name: string;
  description: string;
  steps: ProcessStep[];
  owner: string;
  frequency: string;
  metrics: ProcessMetric[];
}

export interface ProcessStep {
  step: string;
  description: string;
  duration: number;
  dependencies: string[];
  outputs: string[];
}

export interface ProcessMetric {
  name: string;
  target: number;
  measurement: string;
  frequency: string;
}

export interface BusinessSystem {
  name: string;
  purpose: string;
  vendor: string;
  cost: number;
  implementation: Date;
  integrations: string[];
}

export interface Supplier {
  name: string;
  products: string[];
  terms: string;
  reliability: number;
  cost: number;
  backup: string;
}

export interface QualityControl {
  standards: QualityStandard[];
  processes: QualityProcess[];
  metrics: QualityMetric[];
  improvement: ContinuousImprovement;
}

export interface QualityStandard {
  area: string;
  standard: string;
  measurement: string;
  target: number;
}

export interface QualityProcess {
  name: string;
  frequency: string;
  responsible: string;
  documentation: string;
}

export interface QualityMetric {
  name: string;
  target: number;
  current: number;
  trend: string;
}

export interface ContinuousImprovement {
  methodology: string;
  reviewFrequency: string;
  improvementGoals: string[];
  implementationPlan: string;
}

export interface RiskMitigation {
  risk: string;
  probability: number;
  impact: number;
  mitigation: string[];
  contingency: string;
  owner: string;
}

export interface SuccessMetric {
  name: string;
  target: number;
  measurement: string;
  frequency: string;
  importance: number;
}

export default ScrollFounderService;