/**
 * Prophetic AI Integrator Service
 * 
 * Integrates prophetic guidance and spiritual sensitivity into content generation.
 * This service enables spiritually-guided content creation that maintains both
 * academic excellence and prophetic alignment with God's purposes.
 * 
 * "But the Helper, the Holy Spirit, whom the Father will send in my name,
 * he will teach you all things and bring to your remembrance all that I have said to you."
 * - John 14:26
 */

import { AIGatewayService } from './AIGatewayService';
import SpiritualFormationAIService from './SpiritualFormationAIService';
import SpiritualAlignmentValidatorService from './SpiritualAlignmentValidatorService';
import { logger } from '../utils/logger';

export interface PropheticGuidanceRequest {
  contentId: string;
  contentType: 'lecture' | 'module' | 'course' | 'assessment' | 'exercise';
  subject: string;
  academicLevel: string;
  currentContent?: string;
  learningObjectives: string[];
  spiritualContext: {
    kingdomPrinciples: string[];
    targetAudience: string;
    ministryContext?: string;
  };
}

export interface PropheticGuidanceResponse {
  contentId: string;
  propheticInsights: PropheticInsight[];
  spiritualApplications: SpiritualApplication[];
  kingdomPerspectives: KingdomPerspective[];
  holySpiritGuidance: HolySpiritGuidance;
  integrationRecommendations: IntegrationRecommendation[];
  confidence: number;
  timestamp: Date;
}

export interface PropheticInsight {
  type: 'revelation' | 'wisdom' | 'discernment' | 'prophetic_word';
  content: string;
  scriptureReference?: string;
  applicationArea: string;
  priority: 'high' | 'medium' | 'low';
  integrationPoint: string;
}

export interface SpiritualApplication {
  principle: string;
  practicalApplication: string;
  scriptureFoundation: string[];
  characterDevelopment: string;
  ministryPreparation: string;
  realWorldImpact: string;
}

export interface KingdomPerspective {
  worldlyView: string;
  kingdomView: string;
  transformation: string;
  scriptureSupport: string[];
  practicalImplications: string[];
}

export interface HolySpiritGuidance {
  promptings: string[];
  cautions: string[];
  emphases: string[];
  spiritualSensitivity: string[];
  prayerPoints: string[];
}

export interface IntegrationRecommendation {
  location: string;
  type: 'insert' | 'modify' | 'enhance' | 'reframe';
  content: string;
  rationale: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export default class PropheticAIIntegrator {
  private aiGateway: AIGatewayService;
  private spiritualFormation: SpiritualFormationAIService;
  private spiritualValidator: SpiritualAlignmentValidatorService;

  constructor(
    aiGateway?: AIGatewayService,
    spiritualFormation?: SpiritualFormationAIService,
    spiritualValidator?: SpiritualAlignmentValidatorService
  ) {
    this.aiGateway = aiGateway || new AIGatewayService();
    this.spiritualFormation = spiritualFormation || new SpiritualFormationAIService();
    this.spiritualValidator = spiritualValidator || new SpiritualAlignmentValidatorService();
  }

  /**
   * Generate prophetic guidance for content creation
   */
  async generatePropheticGuidance(
    request: PropheticGuidanceRequest
  ): Promise<PropheticGuidanceResponse> {
    try {
      logger.info('Generating prophetic guidance for content', {
        contentId: request.contentId,
        contentType: request.contentType,
        subject: request.subject
      });

      // Build comprehensive prompt for prophetic guidance
      const prompt = this.buildPropheticGuidancePrompt(request);

      // Request AI guidance with spiritual sensitivity
      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getPropheticSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 3000
      });

      // Parse prophetic guidance response
      const guidance = this.parsePropheticGuidance(response.content, request);

      // Validate spiritual alignment
      const validation = await this.validatePropheticGuidance(guidance);
      if (!validation.aligned) {
        logger.warn('Prophetic guidance alignment concerns detected', {
          contentId: request.contentId,
          concerns: validation.concerns
        });
      }

      logger.info('Prophetic guidance generated successfully', {
        contentId: request.contentId,
        insightCount: guidance.propheticInsights.length,
        confidence: guidance.confidence
      });

      return guidance;
    } catch (error) {
      logger.error('Error generating prophetic guidance', {
        error,
        contentId: request.contentId
      });
      throw new Error('Failed to generate prophetic guidance');
    }
  }

  /**
   * Integrate prophetic guidance into content
   */
  async integrateGuidanceIntoContent(
    contentId: string,
    currentContent: string,
    guidance: PropheticGuidanceResponse
  ): Promise<string> {
    try {
      logger.info('Integrating prophetic guidance into content', {
        contentId,
        recommendationCount: guidance.integrationRecommendations.length
      });

      // Sort recommendations by priority
      const sortedRecommendations = guidance.integrationRecommendations.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      // Build integration prompt
      const prompt = this.buildIntegrationPrompt(
        currentContent,
        guidance,
        sortedRecommendations
      );

      // Request AI to integrate guidance
      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a content editor integrating prophetic spiritual guidance into educational content.
            Maintain academic excellence while weaving in spiritual insights naturally and powerfully.
            Ensure the content remains Christ-centered, Scripture-rooted, and practically applicable.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        maxTokens: 4000
      });

      const integratedContent = response.content.trim();

      // Validate integrated content
      const validation = await this.spiritualValidator.validateContent(
        contentId,
        'BALANCED'
      );

      if (!validation.passed) {
        logger.warn('Integrated content failed spiritual validation', {
          contentId,
          errorCount: validation.errors.length
        });
      }

      logger.info('Prophetic guidance integrated successfully', {
        contentId,
        originalLength: currentContent.length,
        integratedLength: integratedContent.length
      });

      return integratedContent;
    } catch (error) {
      logger.error('Error integrating prophetic guidance', {
        error,
        contentId
      });
      throw new Error('Failed to integrate prophetic guidance');
    }
  }

  /**
   * Generate spiritually-sensitive content enhancements
   */
  async generateSpiritualEnhancements(
    contentId: string,
    content: string,
    focusAreas: string[]
  ): Promise<{
    enhancements: SpiritualEnhancement[];
    prayerPoints: string[];
    scriptureReferences: string[];
  }> {
    try {
      logger.info('Generating spiritual enhancements', {
        contentId,
        focusAreas
      });

      const prompt = `Analyze this educational content and suggest spiritual enhancements:

CONTENT:
${content}

FOCUS AREAS:
${focusAreas.join(', ')}

Provide:
1. Spiritual enhancements that deepen kingdom perspective
2. Prayer points for students engaging with this content
3. Relevant Scripture references that illuminate the material
4. Character development opportunities
5. Ministry preparation applications

Format as JSON with sections: enhancements, prayerPoints, scriptureReferences`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSpiritualEnhancementSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 2000
      });

      const parsed = this.parseSpiritualEnhancements(response.content);

      logger.info('Spiritual enhancements generated', {
        contentId,
        enhancementCount: parsed.enhancements.length
      });

      return parsed;
    } catch (error) {
      logger.error('Error generating spiritual enhancements', {
        error,
        contentId
      });
      throw new Error('Failed to generate spiritual enhancements');
    }
  }

  // Private helper methods

  private buildPropheticGuidancePrompt(request: PropheticGuidanceRequest): string {
    return `Generate prophetic guidance for educational content creation:

CONTENT TYPE: ${request.contentType}
SUBJECT: ${request.subject}
ACADEMIC LEVEL: ${request.academicLevel}

LEARNING OBJECTIVES:
${request.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

SPIRITUAL CONTEXT:
- Kingdom Principles: ${request.spiritualContext.kingdomPrinciples.join(', ')}
- Target Audience: ${request.spiritualContext.targetAudience}
${request.spiritualContext.ministryContext ? `- Ministry Context: ${request.spiritualContext.ministryContext}` : ''}

${request.currentContent ? `CURRENT CONTENT:\n${request.currentContent}\n` : ''}

Provide prophetic guidance including:
1. Prophetic insights - revelations, wisdom, discernment for this content
2. Spiritual applications - how to apply kingdom principles practically
3. Kingdom perspectives - contrasting worldly vs kingdom views
4. Holy Spirit guidance - promptings, cautions, emphases
5. Integration recommendations - specific ways to weave guidance into content

Format as JSON with these sections.`;
  }

  private buildIntegrationPrompt(
    content: string,
    guidance: PropheticGuidanceResponse,
    recommendations: IntegrationRecommendation[]
  ): string {
    const recommendationsText = recommendations
      .map(r => `- ${r.type.toUpperCase()} at ${r.location}: ${r.content}\n  Rationale: ${r.rationale}`)
      .join('\n\n');

    return `Integrate prophetic spiritual guidance into this educational content:

ORIGINAL CONTENT:
${content}

PROPHETIC INSIGHTS:
${guidance.propheticInsights.map(i => `- ${i.content} (${i.type})`).join('\n')}

INTEGRATION RECOMMENDATIONS:
${recommendationsText}

HOLY SPIRIT GUIDANCE:
Promptings: ${guidance.holySpiritGuidance.promptings.join('; ')}
Emphases: ${guidance.holySpiritGuidance.emphases.join('; ')}

Requirements:
1. Maintain academic excellence and rigor
2. Integrate spiritual insights naturally, not forced
3. Keep Christ-centered and Scripture-rooted
4. Ensure practical applicability
5. Preserve original learning objectives
6. Enhance without overwhelming

Provide the fully integrated content.`;
  }

  private getPropheticSystemPrompt(): string {
    return `You are a prophetic spiritual advisor with deep theological knowledge and sensitivity to the Holy Spirit.
Your role is to provide prophetic guidance for educational content that:
- Maintains Christ-centered, Scripture-rooted foundation
- Integrates kingdom principles naturally
- Develops character and prepares for ministry
- Transforms worldly perspectives to kingdom perspectives
- Remains academically excellent and rigorous

You operate with:
- Prophetic sensitivity to God's purposes
- Deep biblical knowledge
- Understanding of kingdom theology
- Practical wisdom for application
- Discernment of spiritual dynamics

Always ensure guidance is:
- Biblically sound
- Practically applicable
- Academically rigorous
- Spiritually transformative
- Christ-exalting`;
  }

  private getSpiritualEnhancementSystemPrompt(): string {
    return `You are a spiritual formation specialist enhancing educational content with kingdom perspective.
Your enhancements should:
- Deepen spiritual understanding
- Connect academic learning to spiritual formation
- Develop Christ-like character
- Prepare students for kingdom ministry
- Transform worldly thinking to kingdom thinking

Maintain:
- Academic excellence
- Practical applicability
- Biblical foundation
- Spiritual depth
- Natural integration`;
  }

  private parsePropheticGuidance(
    content: string,
    request: PropheticGuidanceRequest
  ): PropheticGuidanceResponse {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        contentId: request.contentId,
        propheticInsights: this.parsePropheticInsights(parsed.propheticInsights || []),
        spiritualApplications: this.parseSpiritualApplications(parsed.spiritualApplications || []),
        kingdomPerspectives: this.parseKingdomPerspectives(parsed.kingdomPerspectives || []),
        holySpiritGuidance: this.parseHolySpiritGuidance(parsed.holySpiritGuidance || {}),
        integrationRecommendations: this.parseIntegrationRecommendations(
          parsed.integrationRecommendations || []
        ),
        confidence: parsed.confidence || 0.85,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error parsing prophetic guidance', { error });
      // Return minimal guidance on parse error
      return {
        contentId: request.contentId,
        propheticInsights: [],
        spiritualApplications: [],
        kingdomPerspectives: [],
        holySpiritGuidance: {
          promptings: [],
          cautions: [],
          emphases: [],
          spiritualSensitivity: [],
          prayerPoints: []
        },
        integrationRecommendations: [],
        confidence: 0.3,
        timestamp: new Date()
      };
    }
  }

  private parsePropheticInsights(data: any[]): PropheticInsight[] {
    return data.map(item => ({
      type: item.type || 'wisdom',
      content: item.content || '',
      scriptureReference: item.scriptureReference,
      applicationArea: item.applicationArea || '',
      priority: item.priority || 'medium',
      integrationPoint: item.integrationPoint || ''
    }));
  }

  private parseSpiritualApplications(data: any[]): SpiritualApplication[] {
    return data.map(item => ({
      principle: item.principle || '',
      practicalApplication: item.practicalApplication || '',
      scriptureFoundation: item.scriptureFoundation || [],
      characterDevelopment: item.characterDevelopment || '',
      ministryPreparation: item.ministryPreparation || '',
      realWorldImpact: item.realWorldImpact || ''
    }));
  }

  private parseKingdomPerspectives(data: any[]): KingdomPerspective[] {
    return data.map(item => ({
      worldlyView: item.worldlyView || '',
      kingdomView: item.kingdomView || '',
      transformation: item.transformation || '',
      scriptureSupport: item.scriptureSupport || [],
      practicalImplications: item.practicalImplications || []
    }));
  }

  private parseHolySpiritGuidance(data: any): HolySpiritGuidance {
    return {
      promptings: data.promptings || [],
      cautions: data.cautions || [],
      emphases: data.emphases || [],
      spiritualSensitivity: data.spiritualSensitivity || [],
      prayerPoints: data.prayerPoints || []
    };
  }

  private parseIntegrationRecommendations(data: any[]): IntegrationRecommendation[] {
    return data.map(item => ({
      location: item.location || '',
      type: item.type || 'enhance',
      content: item.content || '',
      rationale: item.rationale || '',
      priority: item.priority || 'medium'
    }));
  }

  private parseSpiritualEnhancements(content: string): {
    enhancements: SpiritualEnhancement[];
    prayerPoints: string[];
    scriptureReferences: string[];
  } {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        enhancements: (parsed.enhancements || []).map((e: any) => ({
          type: e.type || 'insight',
          content: e.content || '',
          location: e.location || '',
          impact: e.impact || 'medium'
        })),
        prayerPoints: parsed.prayerPoints || [],
        scriptureReferences: parsed.scriptureReferences || []
      };
    } catch (error) {
      logger.error('Error parsing spiritual enhancements', { error });
      return {
        enhancements: [],
        prayerPoints: [],
        scriptureReferences: []
      };
    }
  }

  private async validatePropheticGuidance(
    guidance: PropheticGuidanceResponse
  ): Promise<{ aligned: boolean; concerns: string[] }> {
    // Validate that prophetic guidance aligns with Scripture and kingdom principles
    const concerns: string[] = [];

    // Check for sufficient Scripture foundation
    const scriptureCount = guidance.propheticInsights.filter(i => i.scriptureReference).length;
    if (scriptureCount < guidance.propheticInsights.length * 0.5) {
      concerns.push('Insufficient Scripture foundation for prophetic insights');
    }

    // Check for balance between spiritual and practical
    const practicalApplications = guidance.spiritualApplications.filter(
      a => a.practicalApplication && a.practicalApplication.length > 0
    );
    if (practicalApplications.length < guidance.spiritualApplications.length * 0.8) {
      concerns.push('Insufficient practical application of spiritual principles');
    }

    // Check confidence level
    if (guidance.confidence < 0.7) {
      concerns.push('Low confidence in prophetic guidance');
    }

    return {
      aligned: concerns.length === 0,
      concerns
    };
  }
}

export interface SpiritualEnhancement {
  type: 'insight' | 'application' | 'perspective' | 'practice';
  content: string;
  location: string;
  impact: 'high' | 'medium' | 'low';
}
