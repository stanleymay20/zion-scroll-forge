/**
 * Advanced AI Integration Service
 * Orchestrates all advanced AI features for ScrollUniversity Platform
 * Requirements: 1.1, 1.2, 4.2
 */

import { AdvancedConversationAI, ConversationContext, AIResponse } from './AdvancedConversationAI';
import { PropheticIntelligenceService, SpiritualGuidanceRequest } from './PropheticIntelligenceService';
import { EnhancedCulturalFluencyService, CulturalAdaptationRequest } from './EnhancedCulturalFluencyService';
import { AIXRContentGenerator, XRContentRequest } from './AIXRContentGenerator';
import { SupportedLanguage, CulturalRegion } from '../types/multilingual';

export interface AdvancedAIRequest {
  userId: string;
  sessionId: string;
  message: string;
  context: AIContext;
  features: AIFeatureFlags;
}

export interface AIContext {
  courseId?: string;
  topic: string;
  language: SupportedLanguage;
  culturalRegion: CulturalRegion;
  spiritualContext: SpiritualContextInfo;
  learningGoals: string[];
  currentProgress: number;
  emotionalState?: string;
}

export interface SpiritualContextInfo {
  maturityLevel: string;
  seekingAreas: string[];
  prayerRequests: string[];
  currentStruggles: string[];
}

export interface AIFeatureFlags {
  enablePropheticIntelligence: boolean;
  enableCulturalAdaptation: boolean;
  enableEmotionalIntelligence: boolean;
  enableXRGeneration: boolean;
  adaptationLevel: 'minimal' | 'moderate' | 'comprehensive';
}

export interface AdvancedAIResponse {
  primaryResponse: string;
  propheticInsights?: PropheticInsightResponse;
  culturalAdaptations?: CulturalAdaptationResponse;
  emotionalAnalysis?: EmotionalAnalysisResponse;
  xrContent?: XRContentResponse;
  recommendations: AIRecommendation[];
  nextSteps: string[];
  confidence: number;
  processingMetadata: ProcessingMetadata;
}

export interface PropheticInsightResponse {
  insight: string;
  scriptureReferences: string[];
  prayerPoints: string[];
  applicationSteps: string[];
  spiritualAlignment: number;
}

export interface CulturalAdaptationResponse {
  adaptedContent: string;
  adaptations: AdaptationDetail[];
  culturalAlignment: number;
  warnings: string[];
}

export interface AdaptationDetail {
  type: string;
  originalText: string;
  adaptedText: string;
  reason: string;
}

export interface EmotionalAnalysisResponse {
  detectedEmotion: string;
  intensity: number;
  supportNeeded: boolean;
  recommendedTone: string;
  followUpSuggestions: string[];
}

export interface XRContentResponse {
  sceneId: string;
  title: string;
  description: string;
  estimatedDuration: number;
  interactivityLevel: string;
  spiritualObjectives: string[];
}

export interface AIRecommendation {
  type: RecommendationType;
  priority: number;
  description: string;
  action: string;
  rationale: string;
}

export enum RecommendationType {
  Learning = 'learning',
  Spiritual = 'spiritual',
  Cultural = 'cultural',
  Emotional = 'emotional',
  Technical = 'technical'
}

export interface ProcessingMetadata {
  processingTime: number;
  featuresUsed: string[];
  tokensUsed: number;
  culturalAdaptationsApplied: number;
  spiritualAlignmentScore: number;
  qualityScore: number;
}

export class AdvancedAIIntegrationService {
  private static instance: AdvancedAIIntegrationService;
  private conversationAI: AdvancedConversationAI;
  private propheticService: PropheticIntelligenceService;
  private culturalService: EnhancedCulturalFluencyService;
  private xrGenerator: AIXRContentGenerator;
  private sessionContexts: Map<string, ConversationContext>;

  private constructor() {
    this.conversationAI = AdvancedConversationAI.getInstance();
    this.propheticService = PropheticIntelligenceService.getInstance();
    this.culturalService = EnhancedCulturalFluencyService.getInstance();
    this.xrGenerator = AIXRContentGenerator.getInstance();
    this.sessionContexts = new Map();
  }

  public static getInstance(): AdvancedAIIntegrationService {
    if (!AdvancedAIIntegrationService.instance) {
      AdvancedAIIntegrationService.instance = new AdvancedAIIntegrationService();
    }
    return AdvancedAIIntegrationService.instance;
  }

  /**
   * Process advanced AI request with all enabled features
   */
  public async processAdvancedRequest(request: AdvancedAIRequest): Promise<AdvancedAIResponse> {
    const startTime = Date.now();
    const featuresUsed: string[] = [];
    let tokensUsed = 0;

    try {
      // Get or create conversation context
      const conversationContext = await this.getOrCreateContext(request);
      
      // Generate primary response with emotional intelligence
      const primaryResponse = await this.generatePrimaryResponse(request, conversationContext);
      featuresUsed.push('conversation_ai', 'emotional_intelligence');
      tokensUsed += this.estimateTokens(request.message) + this.estimateTokens(primaryResponse.content);

      // Apply prophetic intelligence if enabled
      let propheticInsights: PropheticInsightResponse | undefined;
      if (request.features.enablePropheticIntelligence) {
        propheticInsights = await this.generatePropheticInsights(request, primaryResponse);
        featuresUsed.push('prophetic_intelligence');
        tokensUsed += 200; // Estimated tokens for prophetic processing
      }

      // Apply cultural adaptations if enabled
      let culturalAdaptations: CulturalAdaptationResponse | undefined;
      if (request.features.enableCulturalAdaptation) {
        culturalAdaptations = await this.applyCulturalAdaptations(request, primaryResponse);
        featuresUsed.push('cultural_adaptation');
        tokensUsed += 150; // Estimated tokens for cultural processing
      }

      // Generate emotional analysis
      const emotionalAnalysis = await this.generateEmotionalAnalysis(request, primaryResponse);
      featuresUsed.push('emotional_analysis');

      // Generate XR content if requested and appropriate
      let xrContent: XRContentResponse | undefined;
      if (request.features.enableXRGeneration && this.shouldGenerateXR(request)) {
        xrContent = await this.generateXRContent(request);
        featuresUsed.push('xr_generation');
        tokensUsed += 300; // Estimated tokens for XR generation
      }

      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        request,
        primaryResponse,
        propheticInsights,
        culturalAdaptations,
        emotionalAnalysis
      );

      // Generate next steps
      const nextSteps = await this.generateNextSteps(request, primaryResponse, recommendations);

      // Calculate confidence score
      const confidence = await this.calculateConfidence(
        primaryResponse,
        propheticInsights,
        culturalAdaptations,
        emotionalAnalysis
      );

      // Calculate quality metrics
      const spiritualAlignmentScore = propheticInsights?.spiritualAlignment || 50;
      const culturalAlignmentScore = culturalAdaptations?.culturalAlignment || 50;
      const qualityScore = await this.calculateQualityScore(
        primaryResponse,
        spiritualAlignmentScore,
        culturalAlignmentScore
      );

      const processingTime = (Date.now() - startTime) / 1000;

      // Update session context
      await this.updateSessionContext(request.sessionId, conversationContext, primaryResponse);

      return {
        primaryResponse: culturalAdaptations?.adaptedContent || primaryResponse.content,
        propheticInsights,
        culturalAdaptations,
        emotionalAnalysis,
        xrContent,
        recommendations,
        nextSteps,
        confidence,
        processingMetadata: {
          processingTime,
          featuresUsed,
          tokensUsed,
          culturalAdaptationsApplied: culturalAdaptations?.adaptations.length || 0,
          spiritualAlignmentScore,
          qualityScore
        }
      };

    } catch (error) {
      console.error('Error in advanced AI processing:', error);
      
      // Return fallback response
      return {
        primaryResponse: "I apologize, but I'm experiencing some technical difficulties. Let me provide a basic response to help you continue learning.",
        recommendations: [{
          type: RecommendationType.Technical,
          priority: 1,
          description: 'System experienced processing error',
          action: 'Retry request or contact support',
          rationale: 'Ensure continuity of learning experience'
        }],
        nextSteps: ['Please try your question again', 'Contact support if the issue persists'],
        confidence: 30,
        processingMetadata: {
          processingTime: (Date.now() - startTime) / 1000,
          featuresUsed: ['fallback'],
          tokensUsed: 50,
          culturalAdaptationsApplied: 0,
          spiritualAlignmentScore: 0,
          qualityScore: 30
        }
      };
    }
  }

  /**
   * Generate XR content based on conversation context
   */
  public async generateContextualXRContent(
    topic: string,
    context: AIContext,
    duration: number = 10
  ): Promise<XRContentResponse> {
    const xrRequest: XRContentRequest = {
      topic,
      sceneType: this.determineSceneType(topic),
      category: 'interactive_lesson' as any,
      difficulty: 'intermediate' as any,
      duration,
      language: context.language,
      culturalContext: context.culturalRegion,
      learningObjectives: context.learningGoals,
      spiritualObjectives: this.extractSpiritualObjectives(context),
      targetAudience: 'adults' as any,
      includeAngelicTutor: true,
      interactivityLevel: 'high' as any
    };

    const result = await this.xrGenerator.generateXRContent(xrRequest);
    
    return {
      sceneId: result.scene.id,
      title: result.scene.title,
      description: result.scene.description,
      estimatedDuration: result.scene.metadata.duration,
      interactivityLevel: 'high',
      spiritualObjectives: result.scene.content.spiritualObjectives
    };
  }

  /**
   * Assess spiritual alignment of AI responses
   */
  public async assessSpiritualAlignment(
    content: string,
    context: AIContext
  ): Promise<SpiritualAlignmentAssessment> {
    const spiritualRequest: SpiritualGuidanceRequest = {
      userId: 'assessment',
      context: context.topic,
      question: content,
      currentSituation: `Learning about ${context.topic}`,
      seekingArea: this.mapToSpiritualArea(context.spiritualContext.seekingAreas[0] || 'wisdom'),
      language: context.language
    };

    const propheticResponse = await this.propheticService.generatePropheticInsight(spiritualRequest);
    
    return {
      alignmentScore: propheticResponse.insight.confidence,
      spiritualThemes: this.extractSpiritualThemes(content),
      biblicalConnections: propheticResponse.scriptureForMeditation.map(s => `${s.book} ${s.chapter}:${s.verse}`),
      recommendations: propheticResponse.actionSteps,
      concerns: this.identifySpiritualConcerns(content)
    };
  }

  // Private helper methods
  private async getOrCreateContext(request: AdvancedAIRequest): Promise<ConversationContext> {
    let context = this.sessionContexts.get(request.sessionId);
    
    if (!context) {
      context = {
        userId: request.userId,
        sessionId: request.sessionId,
        courseId: request.context.courseId,
        topic: request.context.topic,
        previousMessages: [],
        emotionalHistory: [],
        learningStyle: {
          primary: 'multimodal' as any,
          pace: 'adaptive' as any,
          feedback: 'encouraging' as any,
          challenge: 'adaptive' as any,
          social: 'individual' as any
        },
        spiritualContext: {
          maturityLevel: request.context.spiritualContext.maturityLevel as any,
          primaryGifts: ['wisdom'],
          seekingAreas: request.context.spiritualContext.seekingAreas,
          prayerRequests: request.context.spiritualContext.prayerRequests,
          testimonies: [],
          currentStruggles: request.context.spiritualContext.currentStruggles
        },
        culturalContext: {
          region: request.context.culturalRegion,
          language: request.context.language,
          communicationStyle: 'respectful' as any,
          respectPatterns: [],
          timeOrientation: 'flexible' as any,
          authorityView: 'respectful' as any
        },
        currentGoals: request.context.learningGoals.map((goal, index) => ({
          id: `goal_${index}`,
          description: goal,
          type: 'academic' as any,
          priority: 'medium' as any,
          progress: request.context.currentProgress,
          milestones: []
        }))
      };
      
      this.sessionContexts.set(request.sessionId, context);
    }
    
    return context;
  }

  private async generatePrimaryResponse(
    request: AdvancedAIRequest,
    context: ConversationContext
  ): Promise<AIResponse> {
    return await this.conversationAI.processMessage(request.message, context);
  }

  private async generatePropheticInsights(
    request: AdvancedAIRequest,
    primaryResponse: AIResponse
  ): Promise<PropheticInsightResponse> {
    const spiritualRequest: SpiritualGuidanceRequest = {
      userId: request.userId,
      context: request.context.topic,
      question: request.message,
      currentSituation: primaryResponse.content,
      seekingArea: this.mapToSpiritualArea(request.context.spiritualContext.seekingAreas[0] || 'wisdom'),
      language: request.context.language
    };

    const propheticResponse = await this.propheticService.generatePropheticInsight(spiritualRequest);
    
    return {
      insight: propheticResponse.insight.insight,
      scriptureReferences: propheticResponse.scriptureForMeditation.map(s => `${s.book} ${s.chapter}:${s.verse}`),
      prayerPoints: propheticResponse.prayerPoints,
      applicationSteps: propheticResponse.actionSteps,
      spiritualAlignment: propheticResponse.insight.confidence
    };
  }

  private async applyCulturalAdaptations(
    request: AdvancedAIRequest,
    primaryResponse: AIResponse
  ): Promise<CulturalAdaptationResponse> {
    const adaptationRequest: CulturalAdaptationRequest = {
      content: primaryResponse.content,
      sourceContext: this.createDefaultCulturalContext(),
      targetContext: this.createTargetCulturalContext(request.context),
      contentType: 'educational' as any,
      adaptationLevel: request.features.adaptationLevel as any,
      preserveSpiritual: true
    };

    const result = await this.culturalService.adaptContentForCulture(adaptationRequest);
    
    return {
      adaptedContent: result.adaptedContent,
      adaptations: result.adaptations.map(a => ({
        type: a.type,
        originalText: a.originalText,
        adaptedText: a.adaptedText,
        reason: a.reason
      })),
      culturalAlignment: result.culturalAlignment,
      warnings: result.warnings.map(w => w.description)
    };
  }

  private async generateEmotionalAnalysis(
    request: AdvancedAIRequest,
    primaryResponse: AIResponse
  ): Promise<EmotionalAnalysisResponse> {
    return {
      detectedEmotion: request.context.emotionalState || 'neutral',
      intensity: 50,
      supportNeeded: primaryResponse.learningAssessment.needsSupport,
      recommendedTone: primaryResponse.emotionalTone.primary,
      followUpSuggestions: primaryResponse.followUpSuggestions
    };
  }

  private async generateXRContent(request: AdvancedAIRequest): Promise<XRContentResponse> {
    return await this.generateContextualXRContent(
      request.context.topic,
      request.context,
      10
    );
  }

  private async generateRecommendations(
    request: AdvancedAIRequest,
    primaryResponse: AIResponse,
    propheticInsights?: PropheticInsightResponse,
    culturalAdaptations?: CulturalAdaptationResponse,
    emotionalAnalysis?: EmotionalAnalysisResponse
  ): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    // Learning recommendations
    if (primaryResponse.learningAssessment.comprehension < 70) {
      recommendations.push({
        type: RecommendationType.Learning,
        priority: 1,
        description: 'Comprehension appears low',
        action: 'Provide additional examples and practice',
        rationale: 'Improve understanding before moving forward'
      });
    }

    // Spiritual recommendations
    if (propheticInsights && propheticInsights.spiritualAlignment < 60) {
      recommendations.push({
        type: RecommendationType.Spiritual,
        priority: 2,
        description: 'Spiritual alignment could be strengthened',
        action: 'Include more biblical connections and prayer',
        rationale: 'Enhance spiritual formation aspect of learning'
      });
    }

    // Cultural recommendations
    if (culturalAdaptations && culturalAdaptations.culturalAlignment < 70) {
      recommendations.push({
        type: RecommendationType.Cultural,
        priority: 2,
        description: 'Cultural adaptation needs improvement',
        action: 'Apply more culturally sensitive language and examples',
        rationale: 'Improve cultural relevance and accessibility'
      });
    }

    // Emotional recommendations
    if (emotionalAnalysis && emotionalAnalysis.supportNeeded) {
      recommendations.push({
        type: RecommendationType.Emotional,
        priority: 1,
        description: 'Student needs emotional support',
        action: 'Provide encouragement and adjust difficulty level',
        rationale: 'Maintain positive learning environment'
      });
    }

    return recommendations;
  }

  private async generateNextSteps(
    request: AdvancedAIRequest,
    primaryResponse: AIResponse,
    recommendations: AIRecommendation[]
  ): Promise<string[]> {
    const steps: string[] = [];

    // Add primary next steps from conversation AI
    steps.push(...primaryResponse.nextSteps);

    // Add steps based on recommendations
    for (const rec of recommendations.filter(r => r.priority === 1)) {
      steps.push(rec.action);
    }

    // Add spiritual next steps
    if (request.features.enablePropheticIntelligence) {
      steps.push('Take time for prayer and reflection on what you\'ve learned');
    }

    return steps.slice(0, 5); // Limit to 5 steps
  }

  private async calculateConfidence(
    primaryResponse: AIResponse,
    propheticInsights?: PropheticInsightResponse,
    culturalAdaptations?: CulturalAdaptationResponse,
    emotionalAnalysis?: EmotionalAnalysisResponse
  ): Promise<number> {
    let confidence = 70; // Base confidence

    // Factor in learning assessment
    confidence += (primaryResponse.learningAssessment.comprehension - 50) * 0.3;
    confidence += (primaryResponse.learningAssessment.engagement - 50) * 0.2;

    // Factor in spiritual alignment
    if (propheticInsights) {
      confidence += (propheticInsights.spiritualAlignment - 50) * 0.2;
    }

    // Factor in cultural alignment
    if (culturalAdaptations) {
      confidence += (culturalAdaptations.culturalAlignment - 50) * 0.2;
    }

    // Factor in emotional appropriateness
    if (emotionalAnalysis && !emotionalAnalysis.supportNeeded) {
      confidence += 10;
    }

    return Math.min(95, Math.max(30, confidence));
  }

  private async calculateQualityScore(
    primaryResponse: AIResponse,
    spiritualAlignment: number,
    culturalAlignment: number
  ): Promise<number> {
    let quality = 60; // Base quality

    // Factor in comprehension and engagement
    quality += (primaryResponse.learningAssessment.comprehension * 0.3);
    quality += (primaryResponse.learningAssessment.engagement * 0.2);

    // Factor in alignments
    quality += (spiritualAlignment * 0.25);
    quality += (culturalAlignment * 0.25);

    return Math.min(100, Math.max(0, quality));
  }

  private shouldGenerateXR(request: AdvancedAIRequest): boolean {
    // Generate XR for visual or complex topics
    const visualTopics = ['science', 'history', 'biblical', 'geography', 'anatomy'];
    return visualTopics.some(topic => 
      request.context.topic.toLowerCase().includes(topic)
    );
  }

  private determineSceneType(topic: string): any {
    if (topic.toLowerCase().includes('biblical') || topic.toLowerCase().includes('scripture')) {
      return 'biblical';
    }
    if (topic.toLowerCase().includes('science') || topic.toLowerCase().includes('physics')) {
      return 'scientific';
    }
    return 'classroom';
  }

  private extractSpiritualObjectives(context: AIContext): string[] {
    const objectives = [
      'Understand God\'s truth in this subject',
      'Apply biblical principles to learning',
      'Grow in wisdom and knowledge'
    ];

    // Add specific objectives based on spiritual context
    if (context.spiritualContext.seekingAreas.includes('calling')) {
      objectives.push('Discover how this relates to your calling');
    }

    return objectives;
  }

  private mapToSpiritualArea(area: string): any {
    const mapping: Record<string, string> = {
      'calling': 'calling',
      'wisdom': 'wisdom',
      'character': 'character',
      'purpose': 'purpose',
      'direction': 'direction'
    };
    
    return mapping[area.toLowerCase()] || 'wisdom';
  }

  private createDefaultCulturalContext(): any {
    return {
      region: 'north_america',
      language: 'en',
      communicationStyle: {
        directness: 'direct',
        formality: 'informal'
      },
      socialNorms: [],
      learningPreferences: [],
      religiousContext: {
        primaryFaith: 'christianity',
        practiceLevel: 'regular'
      },
      economicContext: {
        level: 'middle'
      },
      educationalBackground: {
        level: 'undergraduate'
      }
    };
  }

  private createTargetCulturalContext(context: AIContext): any {
    return {
      region: context.culturalRegion,
      language: context.language,
      communicationStyle: {
        directness: 'moderate',
        formality: 'respectful'
      },
      socialNorms: [],
      learningPreferences: [],
      religiousContext: {
        primaryFaith: 'christianity',
        practiceLevel: 'regular'
      },
      economicContext: {
        level: 'middle'
      },
      educationalBackground: {
        level: 'undergraduate'
      }
    };
  }

  private async updateSessionContext(
    sessionId: string,
    context: ConversationContext,
    response: AIResponse
  ): Promise<void> {
    // Update context with new interaction
    this.sessionContexts.set(sessionId, context);
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4); // Rough estimation
  }

  private extractSpiritualThemes(content: string): string[] {
    const themes: string[] = [];
    const spiritualKeywords = ['faith', 'God', 'Christ', 'prayer', 'wisdom', 'love', 'truth', 'grace'];
    
    for (const keyword of spiritualKeywords) {
      if (content.toLowerCase().includes(keyword)) {
        themes.push(keyword);
      }
    }
    
    return themes;
  }

  private identifySpiritualConcerns(content: string): string[] {
    const concerns: string[] = [];
    const concernKeywords = ['doubt', 'fear', 'confusion', 'struggle', 'difficulty'];
    
    for (const keyword of concernKeywords) {
      if (content.toLowerCase().includes(keyword)) {
        concerns.push(`Potential concern with ${keyword}`);
      }
    }
    
    return concerns;
  }
}

// Supporting interfaces
interface SpiritualAlignmentAssessment {
  alignmentScore: number;
  spiritualThemes: string[];
  biblicalConnections: string[];
  recommendations: string[];
  concerns: string[];
}