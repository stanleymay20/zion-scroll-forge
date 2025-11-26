/**
 * Divine Inspiration Recognizer Service
 * 
 * Recognizes and documents spiritual breakthroughs, divine insights, and moments
 * of revelation in content creation and student learning experiences.
 * 
 * "Call to me and I will answer you, and will tell you great and hidden things
 * that you have not known." - Jeremiah 33:3
 */

import { AIGatewayService } from './AIGatewayService';
import SpiritualFormationAIService from './SpiritualFormationAIService';
import { logger } from '../utils/logger';

export interface InspirationRecognitionRequest {
  contentId: string;
  contentType: 'lecture' | 'discussion' | 'journal' | 'prayer' | 'reflection';
  content: string;
  context: {
    userId?: string;
    courseId?: string;
    subject?: string;
    spiritualContext?: string;
  };
  previousInspirations?: DivineInspiration[];
}

export interface DivineInspiration {
  id: string;
  type: InspirationTypeType;
  content: string;
  source: InspirationSource;
  significance: 'breakthrough' | 'major' | 'moderate' | 'minor';
  spiritualThemes: string[];
  scriptureConnections: ScriptureConnection[];
  characterDevelopment: CharacterDevelopment;
  ministryApplication: MinistryApplication;
  timestamp: Date;
  confidence: number;
}

export type InspirationTypeType =
  | 'revelation'
  | 'prophetic_word'
  | 'wisdom'
  | 'understanding'
  | 'discernment'
  | 'conviction'
  | 'calling_clarity'
  | 'spiritual_breakthrough';

export interface InspirationSource {
  origin: 'scripture' | 'prayer' | 'teaching' | 'experience' | 'reflection' | 'worship';
  trigger: string;
  context: string;
}

export interface ScriptureConnection {
  reference: string;
  text: string;
  relevance: string;
  illumination: string;
}

export interface CharacterDevelopment {
  virtue: string;
  growth: string;
  transformation: string;
  practicalSteps: string[];
}

export interface MinistryApplication {
  area: string;
  application: string;
  impact: string;
  nextSteps: string[];
}

export interface InspirationPattern {
  userId: string;
  patterns: {
    frequentThemes: string[];
    spiritualGifts: string[];
    callingIndicators: string[];
    growthTrajectory: string;
  };
  recommendations: string[];
}

export default class DivineInspirationRecognizer {
  private aiGateway: AIGatewayService;
  private spiritualFormation: SpiritualFormationAIService;

  constructor(
    aiGateway?: AIGatewayService,
    spiritualFormation?: SpiritualFormationAIService
  ) {
    this.aiGateway = aiGateway || new AIGatewayService();
    this.spiritualFormation = spiritualFormation || new SpiritualFormationAIService();
  }

  /**
   * Recognize divine inspiration in content
   */
  async recognizeInspiration(
    request: InspirationRecognitionRequest
  ): Promise<DivineInspiration[]> {
    try {
      logger.info('Recognizing divine inspiration', {
        contentId: request.contentId,
        contentType: request.contentType
      });

      // Build recognition prompt
      const prompt = this.buildRecognitionPrompt(request);

      // Request AI analysis
      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getRecognitionSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        maxTokens: 2500
      });

      // Parse inspirations
      const inspirations = this.parseInspirations(response.content, request);

      // Filter by confidence threshold
      const significantInspirations = inspirations.filter(i => i.confidence >= 0.7);

      logger.info('Divine inspirations recognized', {
        contentId: request.contentId,
        totalFound: inspirations.length,
        significant: significantInspirations.length
      });

      return significantInspirations;
    } catch (error) {
      logger.error('Error recognizing divine inspiration', {
        error,
        contentId: request.contentId
      });
      throw new Error('Failed to recognize divine inspiration');
    }
  }

  /**
   * Document spiritual breakthrough
   */
  async documentBreakthrough(
    inspiration: DivineInspiration,
    additionalContext?: string
  ): Promise<BreakthroughDocumentation> {
    try {
      logger.info('Documenting spiritual breakthrough', {
        inspirationId: inspiration.id,
        type: inspiration.type
      });

      const prompt = `Document this spiritual breakthrough in detail:

INSPIRATION TYPE: ${inspiration.type}
CONTENT: ${inspiration.content}
SIGNIFICANCE: ${inspiration.significance}

SPIRITUAL THEMES: ${inspiration.spiritualThemes.join(', ')}

${additionalContext ? `ADDITIONAL CONTEXT:\n${additionalContext}\n` : ''}

Provide comprehensive documentation including:
1. Detailed description of the breakthrough
2. Spiritual significance and implications
3. Character transformation potential
4. Ministry preparation value
5. Practical next steps
6. Prayer points for continued growth
7. Scripture for meditation and application

Format as JSON.`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a spiritual director documenting divine breakthroughs.
            Provide thorough, encouraging, and practically applicable documentation.
            Maintain spiritual depth while being concrete and actionable.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 2000
      });

      const documentation = this.parseBreakthroughDocumentation(
        response.content,
        inspiration
      );

      logger.info('Breakthrough documented successfully', {
        inspirationId: inspiration.id
      });

      return documentation;
    } catch (error) {
      logger.error('Error documenting breakthrough', {
        error,
        inspirationId: inspiration.id
      });
      throw new Error('Failed to document spiritual breakthrough');
    }
  }

  /**
   * Analyze inspiration patterns over time
   */
  async analyzeInspirationPatterns(
    userId: string,
    inspirations: DivineInspiration[]
  ): Promise<InspirationPattern> {
    try {
      logger.info('Analyzing inspiration patterns', {
        userId,
        inspirationCount: inspirations.length
      });

      if (inspirations.length < 3) {
        logger.warn('Insufficient inspirations for pattern analysis', {
          userId,
          count: inspirations.length
        });
        return {
          userId,
          patterns: {
            frequentThemes: [],
            spiritualGifts: [],
            callingIndicators: [],
            growthTrajectory: 'Insufficient data for analysis'
          },
          recommendations: ['Continue documenting spiritual insights and breakthroughs']
        };
      }

      const prompt = this.buildPatternAnalysisPrompt(userId, inspirations);

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a spiritual formation analyst identifying patterns in divine inspirations.
            Look for recurring themes, spiritual gifts, calling indicators, and growth trajectories.
            Provide encouraging, insightful, and practically applicable recommendations.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        maxTokens: 2000
      });

      const patterns = this.parseInspirationPatterns(response.content, userId);

      logger.info('Inspiration patterns analyzed', {
        userId,
        themeCount: patterns.patterns.frequentThemes.length
      });

      return patterns;
    } catch (error) {
      logger.error('Error analyzing inspiration patterns', {
        error,
        userId
      });
      throw new Error('Failed to analyze inspiration patterns');
    }
  }

  /**
   * Generate inspiration cultivation recommendations
   */
  async generateCultivationRecommendations(
    userId: string,
    patterns: InspirationPattern
  ): Promise<CultivationRecommendations> {
    try {
      logger.info('Generating cultivation recommendations', { userId });

      const prompt = `Based on these spiritual inspiration patterns, provide recommendations for cultivating deeper divine inspiration:

FREQUENT THEMES: ${patterns.patterns.frequentThemes.join(', ')}
SPIRITUAL GIFTS: ${patterns.patterns.spiritualGifts.join(', ')}
CALLING INDICATORS: ${patterns.patterns.callingIndicators.join(', ')}
GROWTH TRAJECTORY: ${patterns.patterns.growthTrajectory}

Provide:
1. Spiritual practices to deepen inspiration
2. Scripture reading plans aligned with themes
3. Prayer strategies for breakthrough
4. Ministry opportunities for application
5. Mentorship recommendations
6. Resources for continued growth

Format as JSON.`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a spiritual formation coach providing personalized recommendations.
            Focus on practical, sustainable practices that cultivate divine inspiration.
            Maintain balance between spiritual depth and practical application.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 2000
      });

      const recommendations = this.parseCultivationRecommendations(response.content, userId);

      logger.info('Cultivation recommendations generated', { userId });

      return recommendations;
    } catch (error) {
      logger.error('Error generating cultivation recommendations', {
        error,
        userId
      });
      throw new Error('Failed to generate cultivation recommendations');
    }
  }

  // Private helper methods

  private buildRecognitionPrompt(request: InspirationRecognitionRequest): string {
    return `Analyze this content for divine inspiration, spiritual breakthroughs, and moments of revelation:

CONTENT TYPE: ${request.contentType}
${request.context.subject ? `SUBJECT: ${request.context.subject}` : ''}
${request.context.spiritualContext ? `SPIRITUAL CONTEXT: ${request.context.spiritualContext}` : ''}

CONTENT:
${request.content}

${request.previousInspirations && request.previousInspirations.length > 0 ? `
PREVIOUS INSPIRATIONS (for context):
${request.previousInspirations.map(i => `- ${i.type}: ${i.content.substring(0, 100)}...`).join('\n')}
` : ''}

Identify:
1. Divine inspirations - revelations, prophetic words, wisdom, understanding
2. Spiritual breakthroughs - significant moments of transformation
3. Scripture connections - how God's Word illuminates the content
4. Character development opportunities
5. Ministry application potential

For each inspiration found, provide:
- Type (revelation, prophetic_word, wisdom, understanding, discernment, conviction, calling_clarity, spiritual_breakthrough)
- Content (the actual inspiration)
- Source (origin and trigger)
- Significance (breakthrough, major, moderate, minor)
- Spiritual themes
- Scripture connections
- Character development implications
- Ministry applications
- Confidence level (0-1)

Format as JSON array of inspirations.`;
  }

  private buildPatternAnalysisPrompt(userId: string, inspirations: DivineInspiration[]): string {
    const inspirationSummaries = inspirations.map(i => ({
      type: i.type,
      themes: i.spiritualThemes,
      significance: i.significance,
      date: i.timestamp
    }));

    return `Analyze these divine inspirations for patterns:

USER ID: ${userId}
INSPIRATION COUNT: ${inspirations.length}

INSPIRATIONS:
${JSON.stringify(inspirationSummaries, null, 2)}

Identify:
1. Frequent spiritual themes
2. Spiritual gifts being manifested
3. Calling indicators and direction
4. Growth trajectory over time
5. Recommendations for continued development

Format as JSON with sections: frequentThemes, spiritualGifts, callingIndicators, growthTrajectory, recommendations`;
  }

  private getRecognitionSystemPrompt(): string {
    return `You are a spiritual discernment specialist recognizing divine inspiration.
Your role is to identify genuine moments of:
- Divine revelation and insight
- Prophetic words and guidance
- Spiritual wisdom and understanding
- Holy Spirit conviction and direction
- Calling clarity and confirmation
- Spiritual breakthroughs and transformation

You operate with:
- Spiritual sensitivity and discernment
- Deep biblical knowledge
- Understanding of spiritual formation
- Practical wisdom
- Encouraging perspective

Always:
- Distinguish genuine inspiration from human reasoning
- Connect insights to Scripture
- Identify practical applications
- Encourage spiritual growth
- Maintain humility and reverence`;
  }

  private parseInspirations(
    content: string,
    request: InspirationRecognitionRequest
  ): DivineInspiration[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      return parsed.map((item: any, index: number) => ({
        id: `${request.contentId}-inspiration-${index}`,
        type: item.type || 'wisdom',
        content: item.content || '',
        source: {
          origin: item.source?.origin || 'reflection',
          trigger: item.source?.trigger || '',
          context: item.source?.context || ''
        },
        significance: item.significance || 'moderate',
        spiritualThemes: item.spiritualThemes || [],
        scriptureConnections: (item.scriptureConnections || []).map((sc: any) => ({
          reference: sc.reference || '',
          text: sc.text || '',
          relevance: sc.relevance || '',
          illumination: sc.illumination || ''
        })),
        characterDevelopment: {
          virtue: item.characterDevelopment?.virtue || '',
          growth: item.characterDevelopment?.growth || '',
          transformation: item.characterDevelopment?.transformation || '',
          practicalSteps: item.characterDevelopment?.practicalSteps || []
        },
        ministryApplication: {
          area: item.ministryApplication?.area || '',
          application: item.ministryApplication?.application || '',
          impact: item.ministryApplication?.impact || '',
          nextSteps: item.ministryApplication?.nextSteps || []
        },
        timestamp: new Date(),
        confidence: item.confidence || 0.8
      }));
    } catch (error) {
      logger.error('Error parsing inspirations', { error });
      return [];
    }
  }

  private parseBreakthroughDocumentation(
    content: string,
    inspiration: DivineInspiration
  ): BreakthroughDocumentation {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        inspirationId: inspiration.id,
        description: parsed.description || '',
        spiritualSignificance: parsed.spiritualSignificance || '',
        characterTransformation: parsed.characterTransformation || '',
        ministryPreparation: parsed.ministryPreparation || '',
        practicalNextSteps: parsed.practicalNextSteps || [],
        prayerPoints: parsed.prayerPoints || [],
        scriptureForMeditation: parsed.scriptureForMeditation || [],
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error parsing breakthrough documentation', { error });
      return {
        inspirationId: inspiration.id,
        description: 'Documentation parsing failed',
        spiritualSignificance: '',
        characterTransformation: '',
        ministryPreparation: '',
        practicalNextSteps: [],
        prayerPoints: [],
        scriptureForMeditation: [],
        timestamp: new Date()
      };
    }
  }

  private parseInspirationPatterns(content: string, userId: string): InspirationPattern {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        userId,
        patterns: {
          frequentThemes: parsed.frequentThemes || [],
          spiritualGifts: parsed.spiritualGifts || [],
          callingIndicators: parsed.callingIndicators || [],
          growthTrajectory: parsed.growthTrajectory || ''
        },
        recommendations: parsed.recommendations || []
      };
    } catch (error) {
      logger.error('Error parsing inspiration patterns', { error });
      return {
        userId,
        patterns: {
          frequentThemes: [],
          spiritualGifts: [],
          callingIndicators: [],
          growthTrajectory: 'Analysis failed'
        },
        recommendations: []
      };
    }
  }

  private parseCultivationRecommendations(
    content: string,
    userId: string
  ): CultivationRecommendations {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        userId,
        spiritualPractices: parsed.spiritualPractices || [],
        scriptureReadingPlans: parsed.scriptureReadingPlans || [],
        prayerStrategies: parsed.prayerStrategies || [],
        ministryOpportunities: parsed.ministryOpportunities || [],
        mentorshipRecommendations: parsed.mentorshipRecommendations || [],
        resources: parsed.resources || [],
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error parsing cultivation recommendations', { error });
      return {
        userId,
        spiritualPractices: [],
        scriptureReadingPlans: [],
        prayerStrategies: [],
        ministryOpportunities: [],
        mentorshipRecommendations: [],
        resources: [],
        timestamp: new Date()
      };
    }
  }
}

export interface BreakthroughDocumentation {
  inspirationId: string;
  description: string;
  spiritualSignificance: string;
  characterTransformation: string;
  ministryPreparation: string;
  practicalNextSteps: string[];
  prayerPoints: string[];
  scriptureForMeditation: string[];
  timestamp: Date;
}

export interface CultivationRecommendations {
  userId: string;
  spiritualPractices: string[];
  scriptureReadingPlans: string[];
  prayerStrategies: string[];
  ministryOpportunities: string[];
  mentorshipRecommendations: string[];
  resources: string[];
  timestamp: Date;
}
