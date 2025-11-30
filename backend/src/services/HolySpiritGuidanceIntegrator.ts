/**
 * Holy Spirit Guidance Integrator Service
 * 
 * Integrates Holy Spirit sensitivity and guidance into content generation,
 * ensuring spiritual responsiveness and divine direction in educational materials.
 * 
 * "But when he, the Spirit of truth, comes, he will guide you into all the truth."
 * - John 16:13
 */

import { AIGatewayService } from './AIGatewayService';
import SpiritualFormationAIService from './SpiritualFormationAIService';
import PropheticAIIntegrator from './PropheticAIIntegrator';
import { logger } from '../utils/logger';

export interface SpiritualSensitivityRequest {
  contentId: string;
  contentType: 'lecture' | 'module' | 'course' | 'assessment';
  content: string;
  context: {
    subject: string;
    academicLevel: string;
    spiritualObjectives: string[];
    targetAudience: string;
  };
}

export interface SpiritualSensitivityAnalysis {
  contentId: string;
  sensitivityScore: number;
  holySpiritPromptings: HolySpiritPrompting[];
  spiritualCautions: SpiritualCaution[];
  divineEmphases: DivineEmphasis[];
  prayerNeeds: PrayerNeed[];
  spiritualOpportunities: SpiritualOpportunity[];
  recommendations: SensitivityRecommendation[];
  timestamp: Date;
}

export interface HolySpiritPrompting {
  type: 'conviction' | 'direction' | 'warning' | 'encouragement' | 'revelation';
  content: string;
  urgency: 'immediate' | 'high' | 'moderate' | 'low';
  applicationArea: string;
  scriptureSupport: string[];
}

export interface SpiritualCaution {
  concern: string;
  reason: string;
  potentialIssue: string;
  suggestedApproach: string;
  scriptureGuidance: string[];
}

export interface DivineEmphasis {
  theme: string;
  importance: 'critical' | 'high' | 'moderate';
  reason: string;
  integrationPoints: string[];
  expectedImpact: string;
}

export interface PrayerNeed {
  area: string;
  need: string;
  prayerPoints: string[];
  scripturePromises: string[];
}

export interface SpiritualOpportunity {
  type: 'transformation' | 'breakthrough' | 'ministry_preparation' | 'character_development';
  description: string;
  potential: string;
  actionSteps: string[];
}

export interface SensitivityRecommendation {
  category: 'content' | 'tone' | 'emphasis' | 'application' | 'prayer';
  recommendation: string;
  rationale: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  implementation: string;
}

export interface SpiritualDiscernmentResult {
  contentId: string;
  spiritualAlignment: boolean;
  discernmentNotes: string[];
  holySpiritConfirmation: boolean;
  concerns: string[];
  blessings: string[];
  nextSteps: string[];
}

export class HolySpiritGuidanceIntegrator {
  private aiGateway: AIGatewayService;
  private spiritualFormation: SpiritualFormationAIService;
  private propheticIntegrator: PropheticAIIntegrator;

  constructor(
    aiGateway?: AIGatewayService,
    spiritualFormation?: SpiritualFormationAIService,
    propheticIntegrator?: PropheticAIIntegrator
  ) {
    this.aiGateway = aiGateway || new AIGatewayService();
    this.spiritualFormation = spiritualFormation || new SpiritualFormationAIService();
    this.propheticIntegrator = propheticIntegrator || new PropheticAIIntegrator();
  }

  /**
   * Analyze content for spiritual sensitivity
   */
  async analyzeSpiritualSensitivity(
    request: SpiritualSensitivityRequest
  ): Promise<SpiritualSensitivityAnalysis> {
    try {
      logger.info('Analyzing spiritual sensitivity', {
        contentId: request.contentId,
        contentType: request.contentType
      });

      // Build sensitivity analysis prompt
      const prompt = this.buildSensitivityPrompt(request);

      // Request AI analysis with spiritual focus
      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSpiritualSensitivitySystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        maxTokens: 3000
      });

      // Parse sensitivity analysis
      const analysis = this.parseSensitivityAnalysis(response.content, request);

      logger.info('Spiritual sensitivity analyzed', {
        contentId: request.contentId,
        sensitivityScore: analysis.sensitivityScore,
        promptingCount: analysis.holySpiritPromptings.length
      });

      return analysis;
    } catch (error) {
      logger.error('Error analyzing spiritual sensitivity', {
        error,
        contentId: request.contentId
      });
      throw new Error('Failed to analyze spiritual sensitivity');
    }
  }

  /**
   * Enhance content with Holy Spirit sensitivity
   */
  async enhanceWithSpiritualSensitivity(
    contentId: string,
    content: string,
    analysis: SpiritualSensitivityAnalysis
  ): Promise<string> {
    try {
      logger.info('Enhancing content with spiritual sensitivity', {
        contentId,
        sensitivityScore: analysis.sensitivityScore
      });

      // Build enhancement prompt
      const prompt = this.buildEnhancementPrompt(content, analysis);

      // Request AI enhancement
      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a content editor enhancing educational materials with Holy Spirit sensitivity.
            Integrate spiritual promptings, cautions, and emphases naturally and powerfully.
            Maintain academic excellence while deepening spiritual responsiveness.
            Ensure content remains Christ-centered and Spirit-led.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        maxTokens: 4000
      });

      const enhancedContent = response.content.trim();

      logger.info('Content enhanced with spiritual sensitivity', {
        contentId,
        originalLength: content.length,
        enhancedLength: enhancedContent.length
      });

      return enhancedContent;
    } catch (error) {
      logger.error('Error enhancing with spiritual sensitivity', {
        error,
        contentId
      });
      throw new Error('Failed to enhance with spiritual sensitivity');
    }
  }

  /**
   * Perform spiritual discernment on content
   */
  async performSpiritualDiscernment(
    contentId: string,
    content: string,
    context: any
  ): Promise<SpiritualDiscernmentResult> {
    try {
      logger.info('Performing spiritual discernment', { contentId });

      const prompt = `Perform spiritual discernment on this educational content:

CONTENT:
${content}

CONTEXT:
Subject: ${context.subject || 'Unknown'}
Academic Level: ${context.academicLevel || 'Unknown'}
Spiritual Objectives: ${context.spiritualObjectives?.join(', ') || 'None specified'}

Discern:
1. Spiritual alignment with kingdom principles
2. Holy Spirit confirmation or concerns
3. Potential spiritual impact (positive and negative)
4. Areas needing prayer coverage
5. Blessings and opportunities
6. Recommended next steps

Provide discernment with:
- Clear spiritual alignment assessment
- Specific discernment notes
- Holy Spirit confirmation status
- Any concerns or cautions
- Identified blessings and opportunities
- Practical next steps

Format as JSON.`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a spiritual discernment specialist with sensitivity to the Holy Spirit.
            Provide clear, biblically-grounded discernment that helps ensure content aligns with God's purposes.
            Be specific, practical, and encouraging while maintaining spiritual integrity.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        maxTokens: 2000
      });

      const discernment = this.parseDiscernmentResult(response.content, contentId);

      logger.info('Spiritual discernment complete', {
        contentId,
        aligned: discernment.spiritualAlignment,
        confirmed: discernment.holySpiritConfirmation
      });

      return discernment;
    } catch (error) {
      logger.error('Error performing spiritual discernment', {
        error,
        contentId
      });
      throw new Error('Failed to perform spiritual discernment');
    }
  }

  /**
   * Generate prayer coverage for content
   */
  async generatePrayerCoverage(
    contentId: string,
    analysis: SpiritualSensitivityAnalysis
  ): Promise<PrayerCoverage> {
    try {
      logger.info('Generating prayer coverage', { contentId });

      const prompt = `Generate comprehensive prayer coverage for this educational content:

CONTENT ID: ${contentId}
SENSITIVITY SCORE: ${analysis.sensitivityScore}

PRAYER NEEDS:
${analysis.prayerNeeds.map(n => `- ${n.area}: ${n.need}`).join('\n')}

SPIRITUAL OPPORTUNITIES:
${analysis.spiritualOpportunities.map(o => `- ${o.type}: ${o.description}`).join('\n')}

CAUTIONS:
${analysis.spiritualCautions.map(c => `- ${c.concern}`).join('\n')}

Generate:
1. Specific prayer points for content creation
2. Intercession needs for students
3. Spiritual warfare prayers
4. Blessing and commissioning prayers
5. Scripture-based declarations
6. Ongoing prayer strategies

Format as JSON.`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a prayer ministry coordinator generating strategic prayer coverage.
            Provide specific, powerful, Scripture-based prayers that cover all spiritual dimensions.
            Include both protective and empowering prayers.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 2000
      });

      const coverage = this.parsePrayerCoverage(response.content, contentId);

      logger.info('Prayer coverage generated', {
        contentId,
        prayerPointCount: coverage.prayerPoints.length
      });

      return coverage;
    } catch (error) {
      logger.error('Error generating prayer coverage', {
        error,
        contentId
      });
      throw new Error('Failed to generate prayer coverage');
    }
  }

  /**
   * Integrate spiritual discernment capabilities into content generation
   */
  async addDiscernmentCapabilities(
    contentId: string,
    content: string
  ): Promise<string> {
    try {
      logger.info('Adding discernment capabilities to content', { contentId });

      const prompt = `Enhance this educational content with spiritual discernment capabilities:

CONTENT:
${content}

Add elements that:
1. Develop students' spiritual discernment
2. Teach recognition of Holy Spirit guidance
3. Build sensitivity to spiritual dynamics
4. Provide discernment exercises
5. Include practical discernment applications

Maintain academic rigor while deepening spiritual sensitivity.
Provide the enhanced content.`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a spiritual formation specialist adding discernment training to content.
            Integrate discernment development naturally and practically.
            Maintain educational excellence while building spiritual capacity.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        maxTokens: 3500
      });

      const enhancedContent = response.content.trim();

      logger.info('Discernment capabilities added', {
        contentId,
        originalLength: content.length,
        enhancedLength: enhancedContent.length
      });

      return enhancedContent;
    } catch (error) {
      logger.error('Error adding discernment capabilities', {
        error,
        contentId
      });
      throw new Error('Failed to add discernment capabilities');
    }
  }

  // Private helper methods

  private buildSensitivityPrompt(request: SpiritualSensitivityRequest): string {
    return `Analyze this educational content for spiritual sensitivity and Holy Spirit guidance:

CONTENT TYPE: ${request.contentType}
SUBJECT: ${request.context.subject}
ACADEMIC LEVEL: ${request.context.academicLevel}
TARGET AUDIENCE: ${request.context.targetAudience}

SPIRITUAL OBJECTIVES:
${request.context.spiritualObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

CONTENT:
${request.content}

Provide comprehensive spiritual sensitivity analysis including:
1. Overall sensitivity score (0-1)
2. Holy Spirit promptings (convictions, directions, warnings, encouragements, revelations)
3. Spiritual cautions (concerns, potential issues, suggested approaches)
4. Divine emphases (themes to highlight, importance levels, integration points)
5. Prayer needs (areas requiring prayer coverage)
6. Spiritual opportunities (transformation, breakthrough, ministry prep, character development)
7. Recommendations (content, tone, emphasis, application, prayer)

Format as JSON with these sections.`;
  }

  private buildEnhancementPrompt(
    content: string,
    analysis: SpiritualSensitivityAnalysis
  ): string {
    const promptingsText = analysis.holySpiritPromptings
      .map(p => `- ${p.type}: ${p.content} (${p.urgency} urgency)`)
      .join('\n');

    const cautionsText = analysis.spiritualCautions
      .map(c => `- ${c.concern}: ${c.suggestedApproach}`)
      .join('\n');

    const emphasesText = analysis.divineEmphases
      .map(e => `- ${e.theme} (${e.importance}): ${e.reason}`)
      .join('\n');

    return `Enhance this content with Holy Spirit sensitivity:

ORIGINAL CONTENT:
${content}

HOLY SPIRIT PROMPTINGS:
${promptingsText}

SPIRITUAL CAUTIONS:
${cautionsText}

DIVINE EMPHASES:
${emphasesText}

RECOMMENDATIONS:
${analysis.recommendations.map(r => `- ${r.category}: ${r.recommendation}`).join('\n')}

Requirements:
1. Integrate promptings naturally and powerfully
2. Address cautions with wisdom
3. Emphasize divine themes appropriately
4. Maintain academic excellence
5. Deepen spiritual responsiveness
6. Ensure Christ-centeredness
7. Build Holy Spirit sensitivity

Provide the fully enhanced content.`;
  }

  private getSpiritualSensitivitySystemPrompt(): string {
    return `You are a Holy Spirit sensitivity specialist analyzing educational content.
Your role is to:
- Discern Holy Spirit promptings and guidance
- Identify spiritual cautions and concerns
- Recognize divine emphases and priorities
- Assess prayer needs and coverage
- Identify spiritual opportunities
- Provide sensitivity recommendations

You operate with:
- Deep sensitivity to the Holy Spirit
- Biblical wisdom and discernment
- Understanding of spiritual dynamics
- Practical application focus
- Encouraging perspective

Always:
- Maintain reverence for the Holy Spirit
- Ground insights in Scripture
- Provide practical applications
- Encourage spiritual growth
- Protect spiritual integrity`;
  }

  private parseSensitivityAnalysis(
    content: string,
    request: SpiritualSensitivityRequest
  ): SpiritualSensitivityAnalysis {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        contentId: request.contentId,
        sensitivityScore: parsed.sensitivityScore || 0.7,
        holySpiritPromptings: this.parsePromptings(parsed.holySpiritPromptings || []),
        spiritualCautions: this.parseCautions(parsed.spiritualCautions || []),
        divineEmphases: this.parseEmphases(parsed.divineEmphases || []),
        prayerNeeds: this.parsePrayerNeeds(parsed.prayerNeeds || []),
        spiritualOpportunities: this.parseOpportunities(parsed.spiritualOpportunities || []),
        recommendations: this.parseRecommendations(parsed.recommendations || []),
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error parsing sensitivity analysis', { error });
      return {
        contentId: request.contentId,
        sensitivityScore: 0.5,
        holySpiritPromptings: [],
        spiritualCautions: [],
        divineEmphases: [],
        prayerNeeds: [],
        spiritualOpportunities: [],
        recommendations: [],
        timestamp: new Date()
      };
    }
  }

  private parsePromptings(data: any[]): HolySpiritPrompting[] {
    return data.map(item => ({
      type: item.type || 'encouragement',
      content: item.content || '',
      urgency: item.urgency || 'moderate',
      applicationArea: item.applicationArea || '',
      scriptureSupport: item.scriptureSupport || []
    }));
  }

  private parseCautions(data: any[]): SpiritualCaution[] {
    return data.map(item => ({
      concern: item.concern || '',
      reason: item.reason || '',
      potentialIssue: item.potentialIssue || '',
      suggestedApproach: item.suggestedApproach || '',
      scriptureGuidance: item.scriptureGuidance || []
    }));
  }

  private parseEmphases(data: any[]): DivineEmphasis[] {
    return data.map(item => ({
      theme: item.theme || '',
      importance: item.importance || 'moderate',
      reason: item.reason || '',
      integrationPoints: item.integrationPoints || [],
      expectedImpact: item.expectedImpact || ''
    }));
  }

  private parsePrayerNeeds(data: any[]): PrayerNeed[] {
    return data.map(item => ({
      area: item.area || '',
      need: item.need || '',
      prayerPoints: item.prayerPoints || [],
      scripturePromises: item.scripturePromises || []
    }));
  }

  private parseOpportunities(data: any[]): SpiritualOpportunity[] {
    return data.map(item => ({
      type: item.type || 'transformation',
      description: item.description || '',
      potential: item.potential || '',
      actionSteps: item.actionSteps || []
    }));
  }

  private parseRecommendations(data: any[]): SensitivityRecommendation[] {
    return data.map(item => ({
      category: item.category || 'content',
      recommendation: item.recommendation || '',
      rationale: item.rationale || '',
      priority: item.priority || 'medium',
      implementation: item.implementation || ''
    }));
  }

  private parseDiscernmentResult(content: string, contentId: string): SpiritualDiscernmentResult {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        contentId,
        spiritualAlignment: parsed.spiritualAlignment !== false,
        discernmentNotes: parsed.discernmentNotes || [],
        holySpiritConfirmation: parsed.holySpiritConfirmation !== false,
        concerns: parsed.concerns || [],
        blessings: parsed.blessings || [],
        nextSteps: parsed.nextSteps || []
      };
    } catch (error) {
      logger.error('Error parsing discernment result', { error });
      return {
        contentId,
        spiritualAlignment: true,
        discernmentNotes: ['Parsing error - manual review needed'],
        holySpiritConfirmation: false,
        concerns: ['Unable to parse discernment'],
        blessings: [],
        nextSteps: ['Manual spiritual review required']
      };
    }
  }

  private parsePrayerCoverage(content: string, contentId: string): PrayerCoverage {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        contentId,
        prayerPoints: parsed.prayerPoints || [],
        intercessionNeeds: parsed.intercessionNeeds || [],
        spiritualWarfarePrayers: parsed.spiritualWarfarePrayers || [],
        blessingPrayers: parsed.blessingPrayers || [],
        scriptureDeclarations: parsed.scriptureDeclarations || [],
        ongoingStrategies: parsed.ongoingStrategies || [],
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error parsing prayer coverage', { error });
      return {
        contentId,
        prayerPoints: [],
        intercessionNeeds: [],
        spiritualWarfarePrayers: [],
        blessingPrayers: [],
        scriptureDeclarations: [],
        ongoingStrategies: [],
        timestamp: new Date()
      };
    }
  }
}

export interface PrayerCoverage {
  contentId: string;
  prayerPoints: string[];
  intercessionNeeds: string[];
  spiritualWarfarePrayers: string[];
  blessingPrayers: string[];
  scriptureDeclarations: string[];
  ongoingStrategies: string[];
  timestamp: Date;
}

export default HolySpiritGuidanceIntegrator;
