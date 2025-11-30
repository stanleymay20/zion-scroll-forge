/**
 * Character Formation Integrator Service
 * Integrates character formation and spiritual growth measurement into content
 * 
 * This service ensures content develops:
 * - Christlikeness and spiritual maturity
 * - Fruit of the Spirit
 * - Biblical virtues and character
 * - Integrity and holiness
 * - Servant leadership
 * - Humility and love
 */

import { PrismaClient } from '@prisma/client';
import { AIGatewayService } from './AIGatewayService';
import SpiritualGrowthAnalyticsService from './SpiritualGrowthAnalyticsService';

const prisma = new PrismaClient();

interface CharacterFormationGoals {
  christlikeness: ChristlikenessGoal[];
  fruitOfSpirit: FruitOfSpiritGoal[];
  biblicalVirtues: VirtueGoal[];
  integrity: IntegrityGoal[];
  servantLeadership: LeadershipGoal[];
  humilityAndLove: RelationalGoal[];
}

interface ChristlikenessGoal {
  aspect: string;
  description: string;
  biblicalBasis: string[];
  developmentActivities: string[];
  assessmentCriteria: string[];
}

interface FruitOfSpiritGoal {
  fruit: 'love' | 'joy' | 'peace' | 'patience' | 'kindness' | 'goodness' | 'faithfulness' | 'gentleness' | 'self-control';
  currentLevel: number;
  targetLevel: number;
  developmentPlan: string[];
  practicalExpressions: string[];
}

interface VirtueGoal {
  virtue: string;
  definition: string;
  biblicalExamples: string[];
  practiceOpportunities: string[];
  growthIndicators: string[];
}

interface IntegrityGoal {
  area: string;
  description: string;
  challenges: string[];
  strengtheningPractices: string[];
  accountabilityMeasures: string[];
}

interface LeadershipGoal {
  competency: string;
  servantLeadershipPrinciple: string;
  developmentActivities: string[];
  practiceScenarios: string[];
  mentorshipNeeds: string[];
}

interface RelationalGoal {
  aspect: string;
  description: string;
  biblicalFoundation: string[];
  practicalApplications: string[];
  relationshipContexts: string[];
}

interface CharacterIntegrationRequest {
  contentId: string;
  userId?: string;
  formationGoals: CharacterFormationGoals;
  integrationDepth: 'light' | 'moderate' | 'deep' | 'transformational';
}

interface IntegratedContent {
  originalContentId: string;
  integratedContent: string;
  characterFormationElements: FormationElement[];
  reflectionExercises: ReflectionExercise[];
  practiceActivities: PracticeActivity[];
  assessmentTools: AssessmentTool[];
  accountabilityStructures: AccountabilityStructure[];
  growthMilestones: GrowthMilestone[];
}

interface FormationElement {
  type: 'teaching' | 'example' | 'practice' | 'reflection' | 'accountability';
  characterArea: string;
  content: string;
  placement: string;
  expectedImpact: string;
}

interface ReflectionExercise {
  title: string;
  characterFocus: string[];
  questions: string[];
  scriptureReferences: string[];
  journalPrompts: string[];
  prayerPoints: string[];
}

interface PracticeActivity {
  activity: string;
  characterDevelopment: string[];
  instructions: string[];
  duration: string;
  frequency: string;
  successIndicators: string[];
}

interface AssessmentTool {
  toolName: string;
  characterAreas: string[];
  assessmentQuestions: AssessmentQuestion[];
  scoringGuidance: string;
  interpretationGuide: string;
}

interface AssessmentQuestion {
  question: string;
  characterArea: string;
  responseType: 'scale' | 'multiple-choice' | 'open-ended';
  options?: string[];
  scoringWeight: number;
}

interface AccountabilityStructure {
  structure: string;
  characterFocus: string[];
  participants: string[];
  frequency: string;
  checkInQuestions: string[];
  supportMechanisms: string[];
}

interface GrowthMilestone {
  milestone: string;
  characterAreas: string[];
  criteria: string[];
  celebrationSuggestions: string[];
  nextSteps: string[];
}

interface CharacterGrowthMeasurement {
  userId: string;
  contentId: string;
  measurementDate: Date;
  christlikenessScore: number;
  fruitOfSpiritScores: Map<string, number>;
  virtueScores: Map<string, number>;
  integrityScore: number;
  servantLeadershipScore: number;
  humilityAndLoveScore: number;
  overallCharacterScore: number;
  growthTrend: 'declining' | 'stable' | 'growing' | 'accelerating';
  observations: string[];
  recommendations: string[];
}

export class CharacterFormationIntegrator {
  private aiGateway: AIGatewayService;
  private spiritualAnalytics: SpiritualGrowthAnalyticsService;

  constructor(
    aiGateway?: AIGatewayService,
    spiritualAnalytics?: SpiritualGrowthAnalyticsService
  ) {
    this.aiGateway = aiGateway || new AIGatewayService();
    this.spiritualAnalytics = spiritualAnalytics || new SpiritualGrowthAnalyticsService();
  }

  /**
   * Integrate character formation into content
   */
  async integrateCharacterFormation(
    request: CharacterIntegrationRequest
  ): Promise<IntegratedContent> {
    try {
      // Get original content
      const originalContent = await this.getOriginalContent(request.contentId);

      // Build integration prompt
      const prompt = this.buildIntegrationPrompt(
        originalContent,
        request.formationGoals,
        request.integrationDepth
      );

      // Get AI integration
      const response = await this.aiGateway.chat({
        messages: [
          {
            role: 'system',
            content: `You are a character formation specialist integrating spiritual development into educational content.
            Weave character formation naturally throughout the content without being preachy.
            Include practical exercises, reflection questions, and accountability structures.
            Focus on transformation, not just information.
            Ground everything in Scripture and biblical examples.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 4500
      });

      // Parse integrated content
      const integrated = this.parseIntegratedContent(
        response.content,
        request.contentId
      );

      // Save integrated content
      await this.saveIntegratedContent(integrated);

      return integrated;
    } catch (error) {
      console.error('Error integrating character formation:', error);
      throw new Error('Failed to integrate character formation');
    }
  }

  /**
   * Measure character growth
   */
  async measureCharacterGrowth(
    userId: string,
    contentId: string
  ): Promise<CharacterGrowthMeasurement> {
    try {
      // Get user's character formation history
      const history = await this.getCharacterFormationHistory(userId);

      // Get recent spiritual check-ins
      const checkIns = await this.getRecentCheckIns(userId);

      // Build measurement prompt
      const prompt = this.buildMeasurementPrompt(userId, contentId, history, checkIns);

      // Get AI analysis
      const response = await this.aiGateway.chat({
        messages: [
          {
            role: 'system',
            content: `You are a character formation assessor measuring spiritual growth and character development.
            Analyze patterns in spiritual check-ins, formation activities, and behavioral indicators.
            Provide honest, encouraging assessment with specific observations.
            Identify growth areas and areas needing attention.
            Format response as JSON.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        maxTokens: 2500
      });

      // Parse measurement
      const measurement = this.parseMeasurement(response.content, userId, contentId);

      // Save measurement
      await this.saveMeasurement(measurement);

      return measurement;
    } catch (error) {
      console.error('Error measuring character growth:', error);
      throw new Error('Failed to measure character growth');
    }
  }

  /**
   * Generate character formation plan
   */
  async generateFormationPlan(
    userId: string,
    focusAreas: string[]
  ): Promise<CharacterFormationGoals> {
    try {
      // Get user's current character profile
      const profile = await this.getCharacterProfile(userId);

      // Build plan generation prompt
      const prompt = `Generate a comprehensive character formation plan:

User ID: ${userId}
Focus Areas: ${focusAreas.join(', ')}

Current Character Profile:
${JSON.stringify(profile, null, 2)}

Provide detailed goals for:
1. Christlikeness development
2. Fruit of the Spirit cultivation
3. Biblical virtues formation
4. Integrity strengthening
5. Servant leadership development
6. Humility and love expression

Each goal should include:
- Specific aspects to develop
- Biblical basis
- Development activities
- Assessment criteria
- Practical expressions

Format as JSON.`;

      const response = await this.aiGateway.chat({
        messages: [
          {
            role: 'system',
            content: `You are a spiritual formation director creating personalized character development plans.
            Design comprehensive, biblical, and practical plans for spiritual growth.
            Balance challenge with encouragement, truth with grace.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 3500
      });

      return this.parseFormationGoals(response.content);
    } catch (error) {
      console.error('Error generating formation plan:', error);
      throw new Error('Failed to generate character formation plan');
    }
  }

  /**
   * Track character formation progress
   */
  async trackFormationProgress(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CharacterGrowthMeasurement[]> {
    try {
      const measurements = await prisma.characterGrowthMeasurement.findMany({
        where: {
          userId,
          measurementDate: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { measurementDate: 'asc' }
      });

      return measurements.map(this.mapMeasurementFromDb);
    } catch (error) {
      console.error('Error tracking formation progress:', error);
      throw new Error('Failed to track character formation progress');
    }
  }

  // Private helper methods

  private async getOriginalContent(contentId: string): Promise<any> {
    try {
      const content = await prisma.generatedContent.findUnique({
        where: { id: contentId },
        select: {
          id: true,
          title: true,
          content: true,
          contentType: true,
          learningObjectives: true,
          spiritualApplications: true
        }
      });

      if (!content) {
        throw new Error('Content not found');
      }

      return content;
    } catch (error) {
      console.error('Error fetching original content:', error);
      throw new Error('Failed to fetch original content');
    }
  }

  private buildIntegrationPrompt(
    content: any,
    goals: CharacterFormationGoals,
    depth: string
  ): string {
    return `Integrate character formation into this educational content:

ORIGINAL CONTENT:
Title: ${content.title}
Type: ${content.contentType}
Content: ${content.content}

CHARACTER FORMATION GOALS:
Christlikeness: ${goals.christlikeness.map(g => g.aspect).join(', ')}
Fruit of Spirit: ${goals.fruitOfSpirit.map(g => g.fruit).join(', ')}
Biblical Virtues: ${goals.biblicalVirtues.map(g => g.virtue).join(', ')}
Integrity: ${goals.integrity.map(g => g.area).join(', ')}
Servant Leadership: ${goals.servantLeadership.map(g => g.competency).join(', ')}
Humility & Love: ${goals.humilityAndLove.map(g => g.aspect).join(', ')}

INTEGRATION DEPTH: ${depth}

Provide:
1. Integrated content with character formation woven throughout
2. Character formation elements (5-8) embedded in the content
3. Reflection exercises (3-5) for character development
4. Practice activities (3-5) for character formation
5. Assessment tools (2-3) for measuring growth
6. Accountability structures (2-3) for sustained growth
7. Growth milestones (3-5) to celebrate progress

Make character formation natural, practical, and transformational.
Format as JSON.`;
  }

  private buildMeasurementPrompt(
    userId: string,
    contentId: string,
    history: any[],
    checkIns: any[]
  ): string {
    return `Measure character growth for this student:

User ID: ${userId}
Content ID: ${contentId}

Character Formation History:
${JSON.stringify(history.slice(0, 5), null, 2)}

Recent Spiritual Check-ins:
${JSON.stringify(checkIns.slice(0, 3), null, 2)}

Assess and provide scores (0-100) for:
1. Christlikeness (overall conformity to Christ's character)
2. Fruit of the Spirit (each fruit individually)
3. Biblical Virtues (key virtues being developed)
4. Integrity (consistency between beliefs and actions)
5. Servant Leadership (serving others with humility)
6. Humility and Love (relational character)

Also provide:
- Overall character score
- Growth trend (declining, stable, growing, accelerating)
- Specific observations
- Recommendations for continued growth

Format as JSON.`;
  }

  private parseIntegratedContent(content: string, contentId: string): IntegratedContent {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        originalContentId: contentId,
        integratedContent: parsed.integratedContent || '',
        characterFormationElements: parsed.characterFormationElements || [],
        reflectionExercises: parsed.reflectionExercises || [],
        practiceActivities: parsed.practiceActivities || [],
        assessmentTools: parsed.assessmentTools || [],
        accountabilityStructures: parsed.accountabilityStructures || [],
        growthMilestones: parsed.growthMilestones || []
      };
    } catch (error) {
      console.error('Error parsing integrated content:', error);
      throw new Error('Failed to parse integrated content');
    }
  }

  private parseMeasurement(
    content: string,
    userId: string,
    contentId: string
  ): CharacterGrowthMeasurement {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      const fruitScores = new Map<string, number>();
      if (parsed.fruitOfSpiritScores) {
        Object.entries(parsed.fruitOfSpiritScores).forEach(([fruit, score]) => {
          fruitScores.set(fruit, score as number);
        });
      }

      const virtueScores = new Map<string, number>();
      if (parsed.virtueScores) {
        Object.entries(parsed.virtueScores).forEach(([virtue, score]) => {
          virtueScores.set(virtue, score as number);
        });
      }

      return {
        userId,
        contentId,
        measurementDate: new Date(),
        christlikenessScore: parsed.christlikenessScore || 50,
        fruitOfSpiritScores: fruitScores,
        virtueScores: virtueScores,
        integrityScore: parsed.integrityScore || 50,
        servantLeadershipScore: parsed.servantLeadershipScore || 50,
        humilityAndLoveScore: parsed.humilityAndLoveScore || 50,
        overallCharacterScore: parsed.overallCharacterScore || 50,
        growthTrend: parsed.growthTrend || 'stable',
        observations: parsed.observations || [],
        recommendations: parsed.recommendations || []
      };
    } catch (error) {
      console.error('Error parsing measurement:', error);
      return {
        userId,
        contentId,
        measurementDate: new Date(),
        christlikenessScore: 50,
        fruitOfSpiritScores: new Map(),
        virtueScores: new Map(),
        integrityScore: 50,
        servantLeadershipScore: 50,
        humilityAndLoveScore: 50,
        overallCharacterScore: 50,
        growthTrend: 'stable',
        observations: ['Measurement parsing failed'],
        recommendations: ['Manual review needed']
      };
    }
  }

  private parseFormationGoals(content: string): CharacterFormationGoals {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        christlikeness: parsed.christlikeness || [],
        fruitOfSpirit: parsed.fruitOfSpirit || [],
        biblicalVirtues: parsed.biblicalVirtues || [],
        integrity: parsed.integrity || [],
        servantLeadership: parsed.servantLeadership || [],
        humilityAndLove: parsed.humilityAndLove || []
      };
    } catch (error) {
      console.error('Error parsing formation goals:', error);
      return {
        christlikeness: [],
        fruitOfSpirit: [],
        biblicalVirtues: [],
        integrity: [],
        servantLeadership: [],
        humilityAndLove: []
      };
    }
  }

  private async getCharacterFormationHistory(userId: string): Promise<any[]> {
    try {
      return await prisma.characterFormationEvent.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 20
      });
    } catch (error) {
      console.error('Error fetching character formation history:', error);
      return [];
    }
  }

  private async getRecentCheckIns(userId: string): Promise<any[]> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return await prisma.propheticCheckIn.findMany({
        where: {
          userId,
          timestamp: { gte: thirtyDaysAgo }
        },
        orderBy: { timestamp: 'desc' },
        take: 10
      });
    } catch (error) {
      console.error('Error fetching recent check-ins:', error);
      return [];
    }
  }

  private async getCharacterProfile(userId: string): Promise<any> {
    try {
      const latestMeasurement = await prisma.characterGrowthMeasurement.findFirst({
        where: { userId },
        orderBy: { measurementDate: 'desc' }
      });

      return latestMeasurement || {
        christlikenessScore: 50,
        integrityScore: 50,
        servantLeadershipScore: 50,
        humilityAndLoveScore: 50,
        overallCharacterScore: 50
      };
    } catch (error) {
      console.error('Error fetching character profile:', error);
      return {
        christlikenessScore: 50,
        integrityScore: 50,
        servantLeadershipScore: 50,
        humilityAndLoveScore: 50,
        overallCharacterScore: 50
      };
    }
  }

  private async saveIntegratedContent(integrated: IntegratedContent): Promise<void> {
    try {
      await prisma.characterIntegratedContent.create({
        data: {
          originalContentId: integrated.originalContentId,
          integratedContent: integrated.integratedContent,
          characterFormationElements: integrated.characterFormationElements as any,
          reflectionExercises: integrated.reflectionExercises as any,
          practiceActivities: integrated.practiceActivities as any,
          assessmentTools: integrated.assessmentTools as any,
          accountabilityStructures: integrated.accountabilityStructures as any,
          growthMilestones: integrated.growthMilestones as any,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Error saving integrated content:', error);
      throw new Error('Failed to save integrated content');
    }
  }

  private async saveMeasurement(measurement: CharacterGrowthMeasurement): Promise<void> {
    try {
      await prisma.characterGrowthMeasurement.create({
        data: {
          userId: measurement.userId,
          contentId: measurement.contentId,
          measurementDate: measurement.measurementDate,
          christlikenessScore: measurement.christlikenessScore,
          fruitOfSpiritScores: Object.fromEntries(measurement.fruitOfSpiritScores) as any,
          virtueScores: Object.fromEntries(measurement.virtueScores) as any,
          integrityScore: measurement.integrityScore,
          servantLeadershipScore: measurement.servantLeadershipScore,
          humilityAndLoveScore: measurement.humilityAndLoveScore,
          overallCharacterScore: measurement.overallCharacterScore,
          growthTrend: measurement.growthTrend,
          observations: measurement.observations as any,
          recommendations: measurement.recommendations as any
        }
      });
    } catch (error) {
      console.error('Error saving measurement:', error);
      throw new Error('Failed to save character growth measurement');
    }
  }

  private mapMeasurementFromDb(dbMeasurement: any): CharacterGrowthMeasurement {
    const fruitScores = new Map<string, number>();
    if (dbMeasurement.fruitOfSpiritScores) {
      Object.entries(dbMeasurement.fruitOfSpiritScores).forEach(([fruit, score]) => {
        fruitScores.set(fruit, score as number);
      });
    }

    const virtueScores = new Map<string, number>();
    if (dbMeasurement.virtueScores) {
      Object.entries(dbMeasurement.virtueScores).forEach(([virtue, score]) => {
        virtueScores.set(virtue, score as number);
      });
    }

    return {
      userId: dbMeasurement.userId,
      contentId: dbMeasurement.contentId,
      measurementDate: dbMeasurement.measurementDate,
      christlikenessScore: dbMeasurement.christlikenessScore,
      fruitOfSpiritScores: fruitScores,
      virtueScores: virtueScores,
      integrityScore: dbMeasurement.integrityScore,
      servantLeadershipScore: dbMeasurement.servantLeadershipScore,
      humilityAndLoveScore: dbMeasurement.humilityAndLoveScore,
      overallCharacterScore: dbMeasurement.overallCharacterScore,
      growthTrend: dbMeasurement.growthTrend,
      observations: dbMeasurement.observations,
      recommendations: dbMeasurement.recommendations
    };
  }
}

export default CharacterFormationIntegrator;
