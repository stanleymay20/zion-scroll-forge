/**
 * Advanced AI Features Test Suite
 * Tests all four components of the Advanced AI Features implementation
 * Requirements: 1.1, 1.2, 4.2
 */

import { AdvancedConversationAI, ConversationContext, EmotionalCategory } from '../AdvancedConversationAI';
import { PropheticIntelligenceService, SpiritualArea } from '../PropheticIntelligenceService';
import { EnhancedCulturalFluencyService } from '../EnhancedCulturalFluencyService';
import { AIXRContentGenerator, XRContentRequest } from '../AIXRContentGenerator';
import { AdvancedAIIntegrationService } from '../AdvancedAIIntegrationService';
import { SupportedLanguage, CulturalRegion } from '../../types/multilingual';

describe('Advanced AI Features', () => {
  describe('AdvancedConversationAI', () => {
    let conversationAI: AdvancedConversationAI;
    let mockContext: ConversationContext;

    beforeEach(() => {
      conversationAI = AdvancedConversationAI.getInstance();
      mockContext = {
        userId: 'test-user-123',
        sessionId: 'session-456',
        courseId: 'course-789',
        topic: 'Biblical Wisdom',
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
          maturityLevel: 'growing' as any,
          primaryGifts: ['wisdom'],
          seekingAreas: ['calling', 'character'],
          prayerRequests: ['guidance in studies'],
          testimonies: [],
          currentStruggles: ['time management']
        },
        culturalContext: {
          region: CulturalRegion.WestAfrica,
          language: SupportedLanguage.English,
          communicationStyle: 'respectful' as any,
          respectPatterns: [],
          timeOrientation: 'flexible' as any,
          authorityView: 'respectful' as any
        },
        currentGoals: [
          {
            id: 'goal-1',
            description: 'Understand biblical principles of wisdom',
            type: 'spiritual' as any,
            priority: 'high' as any,
            progress: 60,
            milestones: []
          }
        ]
      };
    });

    test('should process message with emotional intelligence', async () => {
      const message = "I'm really frustrated with this concept. It's so difficult to understand!";

      const response = await conversationAI.processMessage(message, mockContext);

      expect(response).toBeDefined();
      expect(response.content).toContain('understand');
      expect(response.emotionalTone.primary).toBe(EmotionalCategory.Frustration);
      expect(response.learningAssessment.needsSupport).toBe(true);
      expect(response.followUpSuggestions).toHaveLength(2);
      expect(response.nextSteps.length).toBeGreaterThan(0);
    });

    test('should adapt response for different emotional states', async () => {
      const excitedMessage = "This is amazing! I love learning about this topic!";

      const response = await conversationAI.processMessage(excitedMessage, mockContext);

      expect(response.emotionalTone.primary).toBe(EmotionalCategory.Excitement);
      expect(response.content).toContain('enthusiasm');
      expect(response.learningAssessment.engagement).toBeGreaterThan(70);
    });

    test('should provide culturally appropriate responses', async () => {
      const message = "Can you help me understand this better?";

      const response = await conversationAI.processMessage(message, mockContext);

      expect(response.content).not.toContain('You must');
      expect(response.content).not.toContain('You should');
      expect(response.adaptations.some(a => a.type === 'cultural')).toBe(true);
    });

    test('should integrate prophetic overlay when appropriate', async () => {
      const spiritualMessage = "How does this relate to my calling from God?";

      const response = await conversationAI.processMessage(spiritualMessage, mockContext);

      expect(response.propheticOverlay).toBeDefined();
      if (response.propheticOverlay) {
        expect(response.propheticOverlay.insight).toBeDefined();
        expect(response.propheticOverlay.prayerPoints).toHaveLength(5);
        expect(response.propheticOverlay.actionSteps).toHaveLength(5);
      }
    });
  });

  describe('PropheticIntelligenceService', () => {
    let propheticService: PropheticIntelligenceService;

    beforeEach(() => {
      propheticService = PropheticIntelligenceService.getInstance();
    });

    test('should generate prophetic insight for spiritual guidance', async () => {
      const request = {
        userId: 'test-user',
        context: 'Struggling with understanding my purpose in life',
        question: 'What is God\'s will for my life?',
        currentSituation: 'Feeling confused about career direction',
        seekingArea: SpiritualArea.Calling,
        language: SupportedLanguage.English
      };

      const response = await propheticService.generatePropheticInsight(request);

      expect(response).toBeDefined();
      expect(response.insight).toBeDefined();
      expect(response.insight.insight).toContain('calling');
      expect(response.prayerPoints).toHaveLength(5);
      expect(response.actionSteps).toHaveLength(5);
      expect(response.scriptureForMeditation).toHaveLength(3);
      expect(response.spiritualAlignment).toBeGreaterThan(50);
    });

    test('should enhance AI response with prophetic overlay', async () => {
      const originalResponse = "Learning requires dedication and practice.";
      const context = "Student asking about study habits";
      const userId = "test-user";

      const enhanced = await propheticService.enhanceAIResponse(
        originalResponse,
        context,
        userId,
        true
      );

      expect(enhanced.enhancedResponse).toContain(originalResponse);
      expect(enhanced.enhancedResponse).toContain('Spiritual Insight');
      expect(enhanced.propheticOverlay).toBeDefined();
      expect(enhanced.spiritualAlignment).toBeGreaterThan(60);
    });

    test('should provide appropriate scripture references', async () => {
      const request = {
        userId: 'test-user',
        context: 'Seeking wisdom for decision making',
        question: 'How can I make wise decisions?',
        currentSituation: 'Facing important life choices',
        seekingArea: SpiritualArea.Wisdom,
        language: SupportedLanguage.English
      };

      const response = await propheticService.generatePropheticInsight(request);

      expect(response.scriptureForMeditation).toHaveLength(3);
      expect(response.scriptureForMeditation[0]).toHaveProperty('book');
      expect(response.scriptureForMeditation[0]).toHaveProperty('chapter');
      expect(response.scriptureForMeditation[0]).toHaveProperty('verse');
      expect(response.scriptureForMeditation[0]).toHaveProperty('relevance');
    });
  });

  describe('EnhancedCulturalFluencyService', () => {
    let culturalService: EnhancedCulturalFluencyService;

    beforeEach(() => {
      culturalService = EnhancedCulturalFluencyService.getInstance();
    });

    test('should adapt content for West African culture', async () => {
      const request = {
        content: "You must complete this assignment by tomorrow. You should focus on the main points.",
        sourceContext: {
          region: CulturalRegion.NorthAmerica,
          language: SupportedLanguage.English,
          communicationStyle: {
            directness: 'direct' as any,
            formality: 'informal' as any,
            contextDependence: 'low_context' as any,
            emotionalExpression: 'moderate' as any,
            timeOrientation: 'monochronic' as any,
            spaceOrientation: 'moderate' as any
          },
          socialNorms: [],
          learningPreferences: [],
          religiousContext: {
            primaryFaith: 'christianity' as any,
            practiceLevel: 'regular' as any,
            theologicalApproach: 'moderate' as any,
            spiritualMaturity: 'growing' as any,
            culturalReligiousNorms: [],
            sensitivities: []
          },
          economicContext: {
            level: 'middle' as any,
            stability: 'stable' as any,
            priorities: [],
            constraints: [],
            opportunities: []
          },
          educationalBackground: {
            level: 'undergraduate' as any,
            quality: 'good' as any,
            type: 'traditional' as any,
            gaps: [],
            strengths: [],
            preferences: []
          }
        },
        targetContext: {
          region: CulturalRegion.WestAfrica,
          language: SupportedLanguage.English,
          communicationStyle: {
            directness: 'moderate' as any,
            formality: 'formal' as any,
            contextDependence: 'high_context' as any,
            emotionalExpression: 'expressive' as any,
            timeOrientation: 'polychronic' as any,
            spaceOrientation: 'close' as any
          },
          socialNorms: [],
          learningPreferences: [],
          religiousContext: {
            primaryFaith: 'christianity' as any,
            practiceLevel: 'regular' as any,
            theologicalApproach: 'conservative' as any,
            spiritualMaturity: 'growing' as any,
            culturalReligiousNorms: [],
            sensitivities: []
          },
          economicContext: {
            level: 'lower_middle' as any,
            stability: 'somewhat_stable' as any,
            priorities: [],
            constraints: [],
            opportunities: []
          },
          educationalBackground: {
            level: 'secondary' as any,
            quality: 'fair' as any,
            type: 'traditional' as any,
            gaps: [],
            strengths: [],
            preferences: []
          }
        },
        contentType: 'educational' as any,
        adaptationLevel: 'comprehensive' as any,
        preserveSpiritual: true
      };

      const result = await culturalService.adaptContentForCulture(request);

      expect(result.adaptedContent).not.toContain('You must');
      expect(result.adaptedContent).not.toContain('You should');
      expect(result.adaptedContent).toContain('might consider');
      expect(result.culturalAlignment).toBeGreaterThan(70);
      expect(result.adaptations.length).toBeGreaterThan(0);
    });

    test('should generate culturally appropriate AI tutor personality', async () => {
      const culturalContext = {
        region: CulturalRegion.WestAfrica,
        language: SupportedLanguage.English,
        communicationStyle: {
          directness: 'moderate' as any,
          formality: 'formal' as any,
          contextDependence: 'high_context' as any,
          emotionalExpression: 'expressive' as any,
          timeOrientation: 'polychronic' as any,
          spaceOrientation: 'close' as any
        },
        socialNorms: [],
        learningPreferences: [],
        religiousContext: {
          primaryFaith: 'christianity' as any,
          practiceLevel: 'regular' as any,
          theologicalApproach: 'conservative' as any,
          spiritualMaturity: 'growing' as any,
          culturalReligiousNorms: [],
          sensitivities: []
        },
        economicContext: {
          level: 'lower_middle' as any,
          stability: 'somewhat_stable' as any,
          priorities: [],
          constraints: [],
          opportunities: []
        },
        educationalBackground: {
          level: 'secondary' as any,
          quality: 'fair' as any,
          type: 'traditional' as any,
          gaps: [],
          strengths: [],
          preferences: []
        }
      };

      const personality = await culturalService.generateCulturalTutorPersonality(
        culturalContext,
        'Biblical Studies'
      );

      expect(personality.culturalRegion).toBe(CulturalRegion.WestAfrica);
      expect(personality.language).toBe(SupportedLanguage.English);
      expect(personality.greeting).toContain('Akwaaba');
      expect(personality.teachingStyle).toBe('respectful' as any);
      expect(personality.culturalReferences).toContain('Ubuntu philosophy');
    });

    test('should assess cultural sensitivity of content', async () => {
      const content = "You must obey the teacher without question. Individual achievement is most important.";
      const targetCulture = {
        region: CulturalRegion.WestAfrica,
        language: SupportedLanguage.English,
        communicationStyle: {
          directness: 'moderate' as any,
          formality: 'formal' as any,
          contextDependence: 'high_context' as any,
          emotionalExpression: 'expressive' as any,
          timeOrientation: 'polychronic' as any,
          spaceOrientation: 'close' as any
        },
        socialNorms: [],
        learningPreferences: [],
        religiousContext: {
          primaryFaith: 'christianity' as any,
          practiceLevel: 'regular' as any,
          theologicalApproach: 'conservative' as any,
          spiritualMaturity: 'growing' as any,
          culturalReligiousNorms: [],
          sensitivities: []
        },
        economicContext: {
          level: 'lower_middle' as any,
          stability: 'somewhat_stable' as any,
          priorities: [],
          constraints: [],
          opportunities: []
        },
        educationalBackground: {
          level: 'secondary' as any,
          quality: 'fair' as any,
          type: 'traditional' as any,
          gaps: [],
          strengths: [],
          preferences: []
        }
      };

      const assessment = await culturalService.assessCulturalSensitivity(content, targetCulture);

      expect(assessment.overallScore).toBeLessThan(70);
      expect(assessment.riskLevel).toBe('medium');
      expect(assessment.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('AIXRContentGenerator', () => {
    let xrGenerator: AIXRContentGenerator;

    beforeEach(() => {
      xrGenerator = AIXRContentGenerator.getInstance();
    });

    test('should generate biblical XR scene', async () => {
      const request: XRContentRequest = {
        topic: 'The Creation Account',
        sceneType: 'biblical' as any,
        category: 'immersive_experience' as any,
        difficulty: 'intermediate' as any,
        duration: 15,
        language: SupportedLanguage.English,
        culturalContext: CulturalRegion.WestAfrica,
        learningObjectives: [
          'Understand the order of creation',
          'Recognize God as Creator',
          'Appreciate the goodness of creation'
        ],
        spiritualObjectives: [
          'Worship God as Creator',
          'Understand human dignity as image bearers',
          'Develop stewardship mindset'
        ],
        targetAudience: 'adults' as any,
        includeAngelicTutor: true,
        interactivityLevel: 'high' as any
      };

      const result = await xrGenerator.generateXRContent(request);

      expect(result.scene).toBeDefined();
      expect(result.scene.type).toBe('biblical');
      expect(result.scene.title).toContain('Creation');
      expect(result.scene.content.learningObjectives).toHaveLength(3);
      expect(result.scene.content.spiritualObjectives).toHaveLength(3);
      expect(result.scene.angelicTutor).toBeDefined();
      expect(result.scene.angelicTutor?.name).toContain('Kwame');
      expect(result.qualityScore).toBeGreaterThan(80);
    });

    test('should generate scientific XR scene', async () => {
      const request: XRContentRequest = {
        topic: 'DNA Structure and Function',
        sceneType: 'scientific' as any,
        category: 'interactive_lesson' as any,
        difficulty: 'intermediate' as any,
        duration: 20,
        language: SupportedLanguage.English,
        culturalContext: CulturalRegion.NorthAmerica,
        learningObjectives: [
          'Understand DNA double helix structure',
          'Learn about base pairing',
          'Explore protein synthesis'
        ],
        spiritualObjectives: [
          'Recognize intelligent design in DNA',
          'Appreciate complexity of life',
          'Connect science to faith'
        ],
        targetAudience: 'adults' as any,
        includeAngelicTutor: true,
        interactivityLevel: 'immersive' as any
      };

      const result = await xrGenerator.generateXRContent(request);

      expect(result.scene.type).toBe('scientific');
      expect(result.scene.title).toContain('DNA');
      expect(result.scene.content.characters).toHaveLength(2); // Instructor + Research Assistant
      expect(result.scene.interactions.length).toBeGreaterThan(0);
      expect(result.scene.metadata.spiritualThemes).toContain('Information requires an information giver');
    });

    test('should generate classroom XR environment', async () => {
      const request: XRContentRequest = {
        topic: 'Biblical Hermeneutics',
        sceneType: 'classroom' as any,
        category: 'virtual_lecture' as any,
        difficulty: 'advanced' as any,
        duration: 30,
        language: SupportedLanguage.English,
        culturalContext: CulturalRegion.MiddleEast,
        learningObjectives: [
          'Learn principles of biblical interpretation',
          'Understand historical context',
          'Apply hermeneutical methods'
        ],
        spiritualObjectives: [
          'Rightly divide the word of truth',
          'Grow in biblical understanding',
          'Develop interpretive skills'
        ],
        targetAudience: 'adults' as any,
        includeAngelicTutor: false,
        interactivityLevel: 'moderate' as any
      };

      const result = await xrGenerator.generateClassroomScene(request);

      expect(result.type).toBe('classroom');
      expect(result.content.environment.skybox).toBe('classroom_sky');
      expect(result.content.characters).toHaveLength(1); // Just instructor
      expect(result.angelicTutor).toBeUndefined();
      expect(result.accessibility.subtitles).toBe(true);
    });

    test('should adapt XR content for different cultures', async () => {
      const westAfricanRequest: XRContentRequest = {
        topic: 'Wisdom Literature',
        sceneType: 'biblical' as any,
        category: 'immersive_experience' as any,
        difficulty: 'intermediate' as any,
        duration: 15,
        language: SupportedLanguage.English,
        culturalContext: CulturalRegion.WestAfrica,
        learningObjectives: ['Understand biblical wisdom'],
        spiritualObjectives: ['Apply wisdom to life'],
        targetAudience: 'adults' as any,
        includeAngelicTutor: true,
        interactivityLevel: 'high' as any
      };

      const result = await xrGenerator.generateXRContent(westAfricanRequest);

      expect(result.scene.angelicTutor?.name).toContain('Kwame');
      expect(result.scene.angelicTutor?.interactionStyle.greeting).toContain('Peace be with you');
      expect(result.generationMetadata.culturalAdaptations.length).toBeGreaterThan(0);
    });
  });

  describe('AdvancedAIIntegrationService', () => {
    let integrationService: AdvancedAIIntegrationService;

    beforeEach(() => {
      integrationService = AdvancedAIIntegrationService.getInstance();
    });

    test('should process advanced AI request with all features enabled', async () => {
      const request = {
        userId: 'test-user-123',
        sessionId: 'session-456',
        message: 'I\'m struggling to understand how science and faith can work together. Can you help me?',
        context: {
          courseId: 'course-789',
          topic: 'Science and Faith Integration',
          language: SupportedLanguage.English,
          culturalRegion: CulturalRegion.WestAfrica,
          spiritualContext: {
            maturityLevel: 'growing',
            seekingAreas: ['wisdom', 'calling'],
            prayerRequests: ['understanding'],
            currentStruggles: ['doubt', 'confusion']
          },
          learningGoals: [
            'Understand relationship between science and faith',
            'Develop integrated worldview'
          ],
          currentProgress: 45,
          emotionalState: 'confused'
        },
        features: {
          enablePropheticIntelligence: true,
          enableCulturalAdaptation: true,
          enableEmotionalIntelligence: true,
          enableXRGeneration: true,
          adaptationLevel: 'comprehensive' as any
        }
      };

      const response = await integrationService.processAdvancedRequest(request);

      expect(response.primaryResponse).toBeDefined();
      expect(response.propheticInsights).toBeDefined();
      expect(response.propheticInsights?.spiritualAlignment).toBeGreaterThan(50);
      expect(response.culturalAdaptations).toBeDefined();
      expect(response.culturalAdaptations?.culturalAlignment).toBeGreaterThan(60);
      expect(response.emotionalAnalysis).toBeDefined();
      expect(response.emotionalAnalysis?.detectedEmotion).toBe('confused');
      expect(response.xrContent).toBeDefined();
      expect(response.recommendations.length).toBeGreaterThan(0);
      expect(response.nextSteps.length).toBeGreaterThan(0);
      expect(response.confidence).toBeGreaterThan(60);
      expect(response.processingMetadata.featuresUsed).toContain('prophetic_intelligence');
      expect(response.processingMetadata.featuresUsed).toContain('cultural_adaptation');
      expect(response.processingMetadata.featuresUsed).toContain('emotional_intelligence');
    });

    test('should generate contextual XR content', async () => {
      const context = {
        courseId: 'course-123',
        topic: 'Biblical Creation Account',
        language: SupportedLanguage.English,
        culturalRegion: CulturalRegion.MiddleEast,
        spiritualContext: {
          maturityLevel: 'mature',
          seekingAreas: ['wisdom'],
          prayerRequests: [],
          currentStruggles: []
        },
        learningGoals: [
          'Understand Genesis 1',
          'Appreciate God as Creator'
        ],
        currentProgress: 75
      };

      const xrContent = await integrationService.generateContextualXRContent(
        'Biblical Creation Account',
        context,
        15
      );

      expect(xrContent.sceneId).toBeDefined();
      expect(xrContent.title).toContain('Creation');
      expect(xrContent.estimatedDuration).toBe(15);
      expect(xrContent.spiritualObjectives).toContain('Understand God\'s truth in this subject');
    });

    test('should assess spiritual alignment', async () => {
      const content = "Science reveals the incredible complexity and design in creation, pointing us to the wisdom and power of our Creator God.";
      const context = {
        courseId: 'course-123',
        topic: 'Science and Faith',
        language: SupportedLanguage.English,
        culturalRegion: CulturalRegion.NorthAmerica,
        spiritualContext: {
          maturityLevel: 'growing',
          seekingAreas: ['wisdom', 'calling'],
          prayerRequests: ['understanding'],
          currentStruggles: []
        },
        learningGoals: ['Integrate science and faith'],
        currentProgress: 60
      };

      const assessment = await integrationService.assessSpiritualAlignment(content, context);

      expect(assessment.alignmentScore).toBeGreaterThan(70);
      expect(assessment.spiritualThemes).toContain('God');
      expect(assessment.spiritualThemes).toContain('wisdom');
      expect(assessment.biblicalConnections.length).toBeGreaterThan(0);
      expect(assessment.recommendations.length).toBeGreaterThan(0);
    });

    test('should handle errors gracefully', async () => {
      const invalidRequest = {
        userId: '',
        sessionId: '',
        message: '',
        context: {
          topic: '',
          language: SupportedLanguage.English,
          culturalRegion: CulturalRegion.NorthAmerica,
          spiritualContext: {
            maturityLevel: 'growing',
            seekingAreas: [],
            prayerRequests: [],
            currentStruggles: []
          },
          learningGoals: [],
          currentProgress: 0
        },
        features: {
          enablePropheticIntelligence: false,
          enableCulturalAdaptation: false,
          enableEmotionalIntelligence: false,
          enableXRGeneration: false,
          adaptationLevel: 'minimal' as any
        }
      };

      const response = await integrationService.processAdvancedRequest(invalidRequest);

      expect(response.primaryResponse).toContain('technical difficulties');
      expect(response.confidence).toBeLessThan(50);
      expect(response.recommendations[0].type).toBe('technical' as any);
      expect(response.processingMetadata.featuresUsed).toContain('fallback');
    });
  });

  describe('Integration Tests', () => {
    test('should work together seamlessly', async () => {
      const integrationService = AdvancedAIIntegrationService.getInstance();

      const request = {
        userId: 'integration-test-user',
        sessionId: 'integration-session',
        message: 'I want to understand how God\'s wisdom applies to my studies in computer science.',
        context: {
          courseId: 'cs-101',
          topic: 'Computer Science and Divine Wisdom',
          language: SupportedLanguage.English,
          culturalRegion: CulturalRegion.WestAfrica,
          spiritualContext: {
            maturityLevel: 'growing',
            seekingAreas: ['wisdom', 'calling'],
            prayerRequests: ['guidance in studies'],
            currentStruggles: ['balancing faith and academics']
          },
          learningGoals: [
            'Excel in computer science',
            'Maintain strong faith',
            'Find God\'s purpose in technology'
          ],
          currentProgress: 55,
          emotionalState: 'curious'
        },
        features: {
          enablePropheticIntelligence: true,
          enableCulturalAdaptation: true,
          enableEmotionalIntelligence: true,
          enableXRGeneration: false, // Disable for this test
          adaptationLevel: 'comprehensive' as any
        }
      };

      const response = await integrationService.processAdvancedRequest(request);

      // Verify all components worked together
      expect(response.primaryResponse).toBeDefined();
      expect(response.primaryResponse.length).toBeGreaterThan(50);

      expect(response.propheticInsights).toBeDefined();
      expect(response.propheticInsights?.insight).toContain('wisdom');

      expect(response.culturalAdaptations).toBeDefined();
      expect(response.culturalAdaptations?.adaptedContent).not.toContain('You must');

      expect(response.emotionalAnalysis).toBeDefined();
      expect(response.emotionalAnalysis?.detectedEmotion).toBe('curious');

      expect(response.recommendations.length).toBeGreaterThan(0);
      expect(response.nextSteps.length).toBeGreaterThan(0);
      expect(response.confidence).toBeGreaterThan(70);

      // Verify processing metadata
      expect(response.processingMetadata.featuresUsed).toContain('prophetic_intelligence');
      expect(response.processingMetadata.featuresUsed).toContain('cultural_adaptation');
      expect(response.processingMetadata.featuresUsed).toContain('emotional_intelligence');
      expect(response.processingMetadata.spiritualAlignmentScore).toBeGreaterThan(60);
      expect(response.processingMetadata.qualityScore).toBeGreaterThan(70);
    });
  });
});