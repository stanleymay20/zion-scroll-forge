/**
 * Kingdom Impact Measurer Service
 * Tracks and measures transformation impact of content on kingdom advancement
 * 
 * This service measures how content contributes to:
 * - Spiritual transformation
 * - Ministry effectiveness
 * - Kingdom advancement
 * - Character formation
 * - Global missions impact
 */

import { PrismaClient } from '@prisma/client';
import AIGatewayService from './AIGatewayService';
import SpiritualGrowthAnalyticsService from './SpiritualGrowthAnalyticsService';

const prisma = new PrismaClient();

interface KingdomImpactMetrics {
  contentId: string;
  courseId: string;
  spiritualTransformation: TransformationMetrics;
  ministryEffectiveness: MinistryMetrics;
  kingdomAdvancement: AdvancementMetrics;
  characterFormation: CharacterMetrics;
  globalMissionsImpact: MissionsMetrics;
  overallImpactScore: number;
  timestamp: Date;
}

interface TransformationMetrics {
  salvationDecisions: number;
  baptisms: number;
  spiritualBreakthroughs: number;
  faithDeepening: number;
  obedienceIncrease: number;
  transformationScore: number;
}

interface MinistryMetrics {
  ministryLaunches: number;
  leadershipDevelopment: number;
  serviceActivation: number;
  giftDiscovery: number;
  callingClarification: number;
  effectivenessScore: number;
}

interface AdvancementMetrics {
  gospelSharing: number;
  discipleshipInitiated: number;
  churchPlanting: number;
  communityTransformation: number;
  kingdomExpansion: number;
  advancementScore: number;
}

interface CharacterMetrics {
  christlikenessGrowth: number;
  fruitOfSpiritDevelopment: number;
  integrityStrengthening: number;
  humilityIncrease: number;
  loveExpression: number;
  characterScore: number;
}

interface MissionsMetrics {
  crossCulturalEngagement: number;
  missionaryPreparation: number;
  globalAwareness: number;
  unreachedPeoplesFocus: number;
  missionaryDeployment: number;
  missionsScore: number;
}

interface ImpactAnalysisRequest {
  contentId: string;
  courseId: string;
  timeframe: 'week' | 'month' | 'quarter' | 'year' | 'all-time';
  includeQualitative: boolean;
}

interface ImpactAnalysisResponse {
  success: boolean;
  metrics?: KingdomImpactMetrics;
  qualitativeInsights?: QualitativeInsights;
  recommendations?: string[];
  error?: string;
}

interface QualitativeInsights {
  testimonies: Testimony[];
  transformationStories: TransformationStory[];
  ministryReports: MinistryReport[];
  spiritualBreakthroughs: BreakthroughReport[];
}

interface Testimony {
  userId: string;
  contentId: string;
  testimony: string;
  impactArea: string;
  timestamp: Date;
}

interface TransformationStory {
  userId: string;
  before: string;
  after: string;
  contentInfluence: string;
  kingdomImpact: string;
}

interface MinistryReport {
  userId: string;
  ministryType: string;
  description: string;
  peopleReached: number;
  contentConnection: string;
}

interface BreakthroughReport {
  userId: string;
  breakthroughType: string;
  description: string;
  spiritualSignificance: string;
  contentRole: string;
}

export default class KingdomImpactMeasurer {
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
   * Measure kingdom impact of content
   */
  async measureImpact(request: ImpactAnalysisRequest): Promise<ImpactAnalysisResponse> {
    try {
      // Gather quantitative metrics
      const quantitativeMetrics = await this.gatherQuantitativeMetrics(
        request.contentId,
        request.courseId,
        request.timeframe
      );

      // Calculate impact scores
      const metrics = this.calculateImpactScores(quantitativeMetrics);

      // Gather qualitative insights if requested
      let qualitativeInsights: QualitativeInsights | undefined;
      if (request.includeQualitative) {
        qualitativeInsights = await this.gatherQualitativeInsights(
          request.contentId,
          request.courseId,
          request.timeframe
        );
      }

      // Generate AI-powered recommendations
      const recommendations = await this.generateImpactRecommendations(
        metrics,
        qualitativeInsights
      );

      // Save impact metrics
      await this.saveImpactMetrics(metrics);

      return {
        success: true,
        metrics,
        qualitativeInsights,
        recommendations
      };
    } catch (error) {
      console.error('Error measuring kingdom impact:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to measure kingdom impact'
      };
    }
  }

  /**
   * Get impact trends over time
   */
  async getImpactTrends(
    contentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<KingdomImpactMetrics[]> {
    try {
      const metrics = await prisma.kingdomImpactMetrics.findMany({
        where: {
          contentId,
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { timestamp: 'asc' }
      });

      return metrics.map(this.mapMetricsFromDb);
    } catch (error) {
      console.error('Error fetching impact trends:', error);
      throw new Error('Failed to fetch impact trends');
    }
  }

  /**
   * Compare impact across content
   */
  async compareContentImpact(
    contentIds: string[],
    timeframe: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<Map<string, KingdomImpactMetrics>> {
    const impactMap = new Map<string, KingdomImpactMetrics>();

    for (const contentId of contentIds) {
      const metrics = await this.getLatestImpactMetrics(contentId, timeframe);
      if (metrics) {
        impactMap.set(contentId, metrics);
      }
    }

    return impactMap;
  }

  // Private helper methods

  private async gatherQuantitativeMetrics(
    contentId: string,
    courseId: string,
    timeframe: string
  ): Promise<any> {
    const timeframeDate = this.getTimeframeDate(timeframe);

    // Gather metrics from various sources
    const [
      spiritualGrowth,
      ministryActivity,
      kingdomActivity,
      characterGrowth,
      missionsActivity
    ] = await Promise.all([
      this.getSpiritualTransformationMetrics(contentId, timeframeDate),
      this.getMinistryEffectivenessMetrics(contentId, timeframeDate),
      this.getKingdomAdvancementMetrics(contentId, timeframeDate),
      this.getCharacterFormationMetrics(contentId, timeframeDate),
      this.getGlobalMissionsMetrics(contentId, timeframeDate)
    ]);

    return {
      contentId,
      courseId,
      spiritualGrowth,
      ministryActivity,
      kingdomActivity,
      characterGrowth,
      missionsActivity,
      timestamp: new Date()
    };
  }

  private async getSpiritualTransformationMetrics(
    contentId: string,
    since: Date
  ): Promise<TransformationMetrics> {
    // Query database for transformation indicators
    const transformationData = await prisma.spiritualTransformationEvent.findMany({
      where: {
        contentId,
        timestamp: { gte: since }
      }
    });

    return {
      salvationDecisions: transformationData.filter(e => e.eventType === 'salvation').length,
      baptisms: transformationData.filter(e => e.eventType === 'baptism').length,
      spiritualBreakthroughs: transformationData.filter(e => e.eventType === 'breakthrough').length,
      faithDeepening: transformationData.filter(e => e.eventType === 'faith_deepening').length,
      obedienceIncrease: transformationData.filter(e => e.eventType === 'obedience_increase').length,
      transformationScore: 0 // Calculated later
    };
  }

  private async getMinistryEffectivenessMetrics(
    contentId: string,
    since: Date
  ): Promise<MinistryMetrics> {
    const ministryData = await prisma.ministryActivityEvent.findMany({
      where: {
        contentId,
        timestamp: { gte: since }
      }
    });

    return {
      ministryLaunches: ministryData.filter(e => e.activityType === 'ministry_launch').length,
      leadershipDevelopment: ministryData.filter(e => e.activityType === 'leadership_development').length,
      serviceActivation: ministryData.filter(e => e.activityType === 'service_activation').length,
      giftDiscovery: ministryData.filter(e => e.activityType === 'gift_discovery').length,
      callingClarification: ministryData.filter(e => e.activityType === 'calling_clarification').length,
      effectivenessScore: 0 // Calculated later
    };
  }

  private async getKingdomAdvancementMetrics(
    contentId: string,
    since: Date
  ): Promise<AdvancementMetrics> {
    const kingdomData = await prisma.kingdomAdvancementEvent.findMany({
      where: {
        contentId,
        timestamp: { gte: since }
      }
    });

    return {
      gospelSharing: kingdomData.filter(e => e.eventType === 'gospel_sharing').length,
      discipleshipInitiated: kingdomData.filter(e => e.eventType === 'discipleship_initiated').length,
      churchPlanting: kingdomData.filter(e => e.eventType === 'church_planting').length,
      communityTransformation: kingdomData.filter(e => e.eventType === 'community_transformation').length,
      kingdomExpansion: kingdomData.filter(e => e.eventType === 'kingdom_expansion').length,
      advancementScore: 0 // Calculated later
    };
  }

  private async getCharacterFormationMetrics(
    contentId: string,
    since: Date
  ): Promise<CharacterMetrics> {
    const characterData = await prisma.characterFormationEvent.findMany({
      where: {
        contentId,
        timestamp: { gte: since }
      }
    });

    return {
      christlikenessGrowth: characterData.filter(e => e.formationType === 'christlikeness').length,
      fruitOfSpiritDevelopment: characterData.filter(e => e.formationType === 'fruit_of_spirit').length,
      integrityStrengthening: characterData.filter(e => e.formationType === 'integrity').length,
      humilityIncrease: characterData.filter(e => e.formationType === 'humility').length,
      loveExpression: characterData.filter(e => e.formationType === 'love').length,
      characterScore: 0 // Calculated later
    };
  }

  private async getGlobalMissionsMetrics(
    contentId: string,
    since: Date
  ): Promise<MissionsMetrics> {
    const missionsData = await prisma.missionsImpactEvent.findMany({
      where: {
        contentId,
        timestamp: { gte: since }
      }
    });

    return {
      crossCulturalEngagement: missionsData.filter(e => e.impactType === 'cross_cultural').length,
      missionaryPreparation: missionsData.filter(e => e.impactType === 'missionary_prep').length,
      globalAwareness: missionsData.filter(e => e.impactType === 'global_awareness').length,
      unreachedPeoplesFocus: missionsData.filter(e => e.impactType === 'unreached_focus').length,
      missionaryDeployment: missionsData.filter(e => e.impactType === 'missionary_deployment').length,
      missionsScore: 0 // Calculated later
    };
  }

  private calculateImpactScores(data: any): KingdomImpactMetrics {
    const spiritual = data.spiritualGrowth;
    const ministry = data.ministryActivity;
    const kingdom = data.kingdomActivity;
    const character = data.characterGrowth;
    const missions = data.missionsActivity;

    // Calculate weighted scores (0-100 scale)
    spiritual.transformationScore = this.calculateWeightedScore({
      salvationDecisions: spiritual.salvationDecisions * 20,
      baptisms: spiritual.baptisms * 15,
      spiritualBreakthroughs: spiritual.spiritualBreakthroughs * 10,
      faithDeepening: spiritual.faithDeepening * 5,
      obedienceIncrease: spiritual.obedienceIncrease * 5
    });

    ministry.effectivenessScore = this.calculateWeightedScore({
      ministryLaunches: ministry.ministryLaunches * 20,
      leadershipDevelopment: ministry.leadershipDevelopment * 15,
      serviceActivation: ministry.serviceActivation * 10,
      giftDiscovery: ministry.giftDiscovery * 10,
      callingClarification: ministry.callingClarification * 10
    });

    kingdom.advancementScore = this.calculateWeightedScore({
      gospelSharing: kingdom.gospelSharing * 10,
      discipleshipInitiated: kingdom.discipleshipInitiated * 15,
      churchPlanting: kingdom.churchPlanting * 25,
      communityTransformation: kingdom.communityTransformation * 20,
      kingdomExpansion: kingdom.kingdomExpansion * 15
    });

    character.characterScore = this.calculateWeightedScore({
      christlikenessGrowth: character.christlikenessGrowth * 15,
      fruitOfSpiritDevelopment: character.fruitOfSpiritDevelopment * 15,
      integrityStrengthening: character.integrityStrengthening * 10,
      humilityIncrease: character.humilityIncrease * 10,
      loveExpression: character.loveExpression * 10
    });

    missions.missionsScore = this.calculateWeightedScore({
      crossCulturalEngagement: missions.crossCulturalEngagement * 10,
      missionaryPreparation: missions.missionaryPreparation * 20,
      globalAwareness: missions.globalAwareness * 5,
      unreachedPeoplesFocus: missions.unreachedPeoplesFocus * 15,
      missionaryDeployment: missions.missionaryDeployment * 25
    });

    // Calculate overall impact score (weighted average)
    const overallImpactScore = (
      spiritual.transformationScore * 0.30 +
      ministry.effectivenessScore * 0.25 +
      kingdom.advancementScore * 0.25 +
      character.characterScore * 0.10 +
      missions.missionsScore * 0.10
    );

    return {
      contentId: data.contentId,
      courseId: data.courseId,
      spiritualTransformation: spiritual,
      ministryEffectiveness: ministry,
      kingdomAdvancement: kingdom,
      characterFormation: character,
      globalMissionsImpact: missions,
      overallImpactScore: Math.min(100, overallImpactScore),
      timestamp: data.timestamp
    };
  }

  private calculateWeightedScore(weights: Record<string, number>): number {
    const total = Object.values(weights).reduce((sum, val) => sum + val, 0);
    return Math.min(100, total);
  }

  private async gatherQualitativeInsights(
    contentId: string,
    courseId: string,
    timeframe: string
  ): Promise<QualitativeInsights> {
    const timeframeDate = this.getTimeframeDate(timeframe);

    const [testimonies, stories, reports, breakthroughs] = await Promise.all([
      this.getTestimonies(contentId, timeframeDate),
      this.getTransformationStories(contentId, timeframeDate),
      this.getMinistryReports(contentId, timeframeDate),
      this.getBreakthroughReports(contentId, timeframeDate)
    ]);

    return {
      testimonies,
      transformationStories: stories,
      ministryReports: reports,
      spiritualBreakthroughs: breakthroughs
    };
  }

  private async getTestimonies(contentId: string, since: Date): Promise<Testimony[]> {
    const testimonies = await prisma.contentTestimony.findMany({
      where: {
        contentId,
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    return testimonies.map(t => ({
      userId: t.userId,
      contentId: t.contentId,
      testimony: t.testimony,
      impactArea: t.impactArea,
      timestamp: t.timestamp
    }));
  }

  private async getTransformationStories(contentId: string, since: Date): Promise<TransformationStory[]> {
    const stories = await prisma.transformationStory.findMany({
      where: {
        contentId,
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    return stories.map(s => ({
      userId: s.userId,
      before: s.before,
      after: s.after,
      contentInfluence: s.contentInfluence,
      kingdomImpact: s.kingdomImpact
    }));
  }

  private async getMinistryReports(contentId: string, since: Date): Promise<MinistryReport[]> {
    const reports = await prisma.ministryImpactReport.findMany({
      where: {
        contentId,
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'desc' },
      take: 30
    });

    return reports.map(r => ({
      userId: r.userId,
      ministryType: r.ministryType,
      description: r.description,
      peopleReached: r.peopleReached,
      contentConnection: r.contentConnection
    }));
  }

  private async getBreakthroughReports(contentId: string, since: Date): Promise<BreakthroughReport[]> {
    const breakthroughs = await prisma.spiritualBreakthroughReport.findMany({
      where: {
        contentId,
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'desc' },
      take: 40
    });

    return breakthroughs.map(b => ({
      userId: b.userId,
      breakthroughType: b.breakthroughType,
      description: b.description,
      spiritualSignificance: b.spiritualSignificance,
      contentRole: b.contentRole
    }));
  }

  private async generateImpactRecommendations(
    metrics: KingdomImpactMetrics,
    qualitativeInsights?: QualitativeInsights
  ): Promise<string[]> {
    try {
      const prompt = this.buildRecommendationsPrompt(metrics, qualitativeInsights);

      const response = await this.aiGateway.chat({
        messages: [
          {
            role: 'system',
            content: `You are a kingdom impact analyst providing recommendations to maximize spiritual transformation and kingdom advancement through educational content.
            Analyze impact metrics and provide specific, actionable recommendations.
            Focus on increasing spiritual transformation, ministry effectiveness, and global missions impact.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 1500
      });

      return this.parseRecommendations(response.content);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return ['Continue monitoring impact metrics', 'Gather more qualitative feedback'];
    }
  }

  private buildRecommendationsPrompt(
    metrics: KingdomImpactMetrics,
    qualitativeInsights?: QualitativeInsights
  ): string {
    return `Analyze this kingdom impact data and provide recommendations:

Overall Impact Score: ${metrics.overallImpactScore.toFixed(1)}/100

Spiritual Transformation Score: ${metrics.spiritualTransformation.transformationScore.toFixed(1)}/100
- Salvation Decisions: ${metrics.spiritualTransformation.salvationDecisions}
- Baptisms: ${metrics.spiritualTransformation.baptisms}
- Spiritual Breakthroughs: ${metrics.spiritualTransformation.spiritualBreakthroughs}

Ministry Effectiveness Score: ${metrics.ministryEffectiveness.effectivenessScore.toFixed(1)}/100
- Ministry Launches: ${metrics.ministryEffectiveness.ministryLaunches}
- Leadership Development: ${metrics.ministryEffectiveness.leadershipDevelopment}
- Service Activation: ${metrics.ministryEffectiveness.serviceActivation}

Kingdom Advancement Score: ${metrics.kingdomAdvancement.advancementScore.toFixed(1)}/100
- Gospel Sharing: ${metrics.kingdomAdvancement.gospelSharing}
- Discipleship Initiated: ${metrics.kingdomAdvancement.discipleshipInitiated}
- Church Planting: ${metrics.kingdomAdvancement.churchPlanting}

Character Formation Score: ${metrics.characterFormation.characterScore.toFixed(1)}/100
Missions Impact Score: ${metrics.globalMissionsImpact.missionsScore.toFixed(1)}/100

${qualitativeInsights ? `
Testimonies: ${qualitativeInsights.testimonies.length}
Transformation Stories: ${qualitativeInsights.transformationStories.length}
Ministry Reports: ${qualitativeInsights.ministryReports.length}
` : ''}

Provide 5-7 specific recommendations to increase kingdom impact.
Format as a JSON array of strings.`;
  }

  private parseRecommendations(content: string): string[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      // Fallback: split by newlines and filter
      return content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 7);
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      return [];
    }
  }

  private async saveImpactMetrics(metrics: KingdomImpactMetrics): Promise<void> {
    try {
      await prisma.kingdomImpactMetrics.create({
        data: {
          contentId: metrics.contentId,
          courseId: metrics.courseId,
          spiritualTransformation: metrics.spiritualTransformation as any,
          ministryEffectiveness: metrics.ministryEffectiveness as any,
          kingdomAdvancement: metrics.kingdomAdvancement as any,
          characterFormation: metrics.characterFormation as any,
          globalMissionsImpact: metrics.globalMissionsImpact as any,
          overallImpactScore: metrics.overallImpactScore,
          timestamp: metrics.timestamp
        }
      });
    } catch (error) {
      console.error('Error saving impact metrics:', error);
      throw new Error('Failed to save impact metrics');
    }
  }

  private async getLatestImpactMetrics(
    contentId: string,
    timeframe: string
  ): Promise<KingdomImpactMetrics | null> {
    try {
      const timeframeDate = this.getTimeframeDate(timeframe);

      const metrics = await prisma.kingdomImpactMetrics.findFirst({
        where: {
          contentId,
          timestamp: { gte: timeframeDate }
        },
        orderBy: { timestamp: 'desc' }
      });

      return metrics ? this.mapMetricsFromDb(metrics) : null;
    } catch (error) {
      console.error('Error fetching latest impact metrics:', error);
      return null;
    }
  }

  private mapMetricsFromDb(dbMetrics: any): KingdomImpactMetrics {
    return {
      contentId: dbMetrics.contentId,
      courseId: dbMetrics.courseId,
      spiritualTransformation: dbMetrics.spiritualTransformation,
      ministryEffectiveness: dbMetrics.ministryEffectiveness,
      kingdomAdvancement: dbMetrics.kingdomAdvancement,
      characterFormation: dbMetrics.characterFormation,
      globalMissionsImpact: dbMetrics.globalMissionsImpact,
      overallImpactScore: dbMetrics.overallImpactScore,
      timestamp: dbMetrics.timestamp
    };
  }

  private getTimeframeDate(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'quarter':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      case 'all-time':
        return new Date(0);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }
}
