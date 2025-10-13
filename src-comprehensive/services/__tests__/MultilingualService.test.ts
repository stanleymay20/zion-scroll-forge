/**
 * Test suite for Multilingual Service
 * Tests language detection, translation, cultural adaptation, and AI tutor personalities
 */

import { MultilingualService } from '../MultilingualService';
import { LanguageDetectionService } from '../LanguageDetectionService';
import { TranslationService } from '../TranslationService';
import { CulturalAdaptationService } from '../CulturalAdaptationService';
import { AITutorPersonalityService } from '../AITutorPersonalityService';
import {
  SupportedLanguage,
  CulturalRegion,
  ContentType,
  TeachingStyle,
  SpiritualApproach
} from '../../types/multilingual';

describe('MultilingualService', () => {
  let multilingualService: MultilingualService;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    multilingualService = MultilingualService.getInstance();
  });

  describe('User Language Initialization', () => {
    it('should initialize user language preferences', async () => {
      const preference = await multilingualService.initializeUserLanguage(testUserId, SupportedLanguage.Spanish);
      
      expect(preference.primary).toBe(SupportedLanguage.Spanish);
      expect(preference.culturalRegion).toBe(CulturalRegion.LatinAmerica);
      expect(preference.rtlSupport).toBe(false);
    });

    it('should auto-detect language when no preference provided', async () => {
      const preference = await multilingualService.initializeUserLanguage(testUserId);
      
      expect(preference.primary).toBeDefined();
      expect(Object.values(SupportedLanguage)).toContain(preference.primary);
    });
  });

  describe('Language Switching', () => {
    it('should switch user language successfully', async () => {
      // Initialize with English
      await multilingualService.initializeUserLanguage(testUserId, SupportedLanguage.English);
      
      // Switch to Arabic
      const newPreference = await multilingualService.switchUserLanguage(
        testUserId,
        SupportedLanguage.Arabic,
        'test_switch'
      );
      
      expect(newPreference.primary).toBe(SupportedLanguage.Arabic);
      expect(newPreference.culturalRegion).toBe(CulturalRegion.MiddleEast);
      expect(newPreference.rtlSupport).toBe(true);
    });

    it('should update user preferences after language switch', async () => {
      await multilingualService.initializeUserLanguage(testUserId, SupportedLanguage.English);
      await multilingualService.switchUserLanguage(testUserId, SupportedLanguage.Chinese);
      
      const currentPreference = multilingualService.getUserLanguagePreference(testUserId);
      expect(currentPreference?.primary).toBe(SupportedLanguage.Chinese);
      expect(currentPreference?.culturalRegion).toBe(CulturalRegion.EastAsia);
    });
  });

  describe('Content Translation', () => {
    beforeEach(async () => {
      await multilingualService.initializeUserLanguage(testUserId, SupportedLanguage.Spanish);
    });

    it('should translate content for user', async () => {
      const translation = await multilingualService.translateForUser(
        testUserId,
        'Welcome to ScrollUniversity',
        ContentType.UIText,
        SupportedLanguage.English
      );
      
      expect(translation.translatedText).toBeDefined();
      expect(translation.confidence).toBeGreaterThan(0);
    });

    it('should include cultural adaptations in translation', async () => {
      const translation = await multilingualService.translateForUser(
        testUserId,
        'That was a home run!',
        ContentType.LessonContent,
        SupportedLanguage.English
      );
      
      expect(translation.culturalAdaptations).toBeDefined();
      expect(Array.isArray(translation.culturalAdaptations)).toBe(true);
    });
  });

  describe('AI Tutor Personalities', () => {
    it('should get appropriate AI tutor for user language', async () => {
      await multilingualService.initializeUserLanguage(testUserId, SupportedLanguage.Twi);
      
      const tutor = multilingualService.getAITutorForUser(testUserId);
      
      expect(tutor.language).toBe(SupportedLanguage.Twi);
      expect(tutor.culturalRegion).toBe(CulturalRegion.WestAfrica);
      expect(tutor.name).toContain('Nyansa');
    });

    it('should generate culturally appropriate tutor responses', async () => {
      await multilingualService.initializeUserLanguage(testUserId, SupportedLanguage.Arabic);
      
      const response = await multilingualService.generateTutorResponse(
        testUserId,
        'How do I solve this problem?',
        'Mathematics',
        'beginner',
        true
      );
      
      expect(response.text).toBeDefined();
      expect(response.culturalContext).toBe(CulturalRegion.MiddleEast);
      expect(response.spiritualAlignment).toBeGreaterThan(0);
    });
  });

  describe('Course Content Localization', () => {
    const mockCourseContent = {
      title: 'Introduction to ScrollAI',
      description: 'Learn the fundamentals of AI in the kingdom context',
      lessons: [
        {
          id: 'lesson-1',
          title: 'What is AI?',
          content: 'Artificial Intelligence is a powerful tool that can be used for kingdom purposes.'
        }
      ]
    };

    beforeEach(async () => {
      await multilingualService.initializeUserLanguage(testUserId, SupportedLanguage.Hebrew);
    });

    it('should localize course content for user', async () => {
      const localized = await multilingualService.localizeCourseContent(
        testUserId,
        'course-123',
        mockCourseContent
      );
      
      expect(localized.language).toBe(SupportedLanguage.Hebrew);
      expect(localized.culturalRegion).toBe(CulturalRegion.MiddleEast);
      expect(localized.title).toBeDefined();
      expect(localized.lessons).toHaveLength(1);
      expect(localized.aiTutor).toBeDefined();
    });

    it('should include AI tutor in localized content', async () => {
      const localized = await multilingualService.localizeCourseContent(
        testUserId,
        'course-123',
        mockCourseContent
      );
      
      expect(localized.aiTutor.language).toBe(SupportedLanguage.Hebrew);
      expect(localized.aiTutor.spiritualApproach).toBe(SpiritualApproach.Biblical);
    });
  });

  describe('Language Switching Interface', () => {
    beforeEach(async () => {
      await multilingualService.initializeUserLanguage(testUserId, SupportedLanguage.English);
    });

    it('should provide language switching interface', () => {
      const interface_ = multilingualService.getLanguageSwitchingInterface(testUserId);
      
      expect(interface_.currentLanguage).toBe(SupportedLanguage.English);
      expect(interface_.availableLanguages).toHaveLength(7); // All supported languages
      expect(interface_.regionalLanguages.length).toBeGreaterThan(0);
    });

    it('should indicate RTL support for appropriate languages', async () => {
      await multilingualService.switchUserLanguage(testUserId, SupportedLanguage.Arabic);
      
      const interface_ = multilingualService.getLanguageSwitchingInterface(testUserId);
      expect(interface_.rtlSupport).toBe(true);
    });
  });

  describe('Statistics and Health', () => {
    it('should provide multilingual statistics', () => {
      const stats = multilingualService.getMultilingualStats();
      
      expect(stats.supportedLanguages).toBe(7);
      expect(stats.languageDistribution).toBeDefined();
      expect(stats.regionDistribution).toBeDefined();
    });

    it('should perform health check', async () => {
      const health = await multilingualService.healthCheck();
      
      expect(health.status).toBe('healthy');
      expect(health.services.languageDetection).toBe(true);
      expect(health.services.translation).toBe(true);
      expect(health.services.culturalAdaptation).toBe(true);
      expect(health.services.tutorPersonality).toBe(true);
    });
  });
});

describe('LanguageDetectionService', () => {
  let service: LanguageDetectionService;

  beforeEach(() => {
    service = LanguageDetectionService.getInstance();
  });

  it('should detect language from text patterns', async () => {
    const result = await service.detectLanguage('Hello, how are you today?');
    
    expect(result.detectedLanguage).toBe(SupportedLanguage.English);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.alternativeLanguages).toBeDefined();
  });

  it('should detect Arabic text', async () => {
    const result = await service.detectLanguage('مرحبا كيف حالك اليوم؟');
    
    expect(result.detectedLanguage).toBe(SupportedLanguage.Arabic);
  });

  it('should create appropriate language preferences', () => {
    const preference = service.createLanguagePreference(SupportedLanguage.Chinese);
    
    expect(preference.primary).toBe(SupportedLanguage.Chinese);
    expect(preference.culturalRegion).toBe(CulturalRegion.EastAsia);
    expect(preference.rtlSupport).toBe(false);
  });
});

describe('AITutorPersonalityService', () => {
  let service: AITutorPersonalityService;

  beforeEach(() => {
    service = AITutorPersonalityService.getInstance();
  });

  it('should get personality for language and region', () => {
    const personality = service.getPersonality(SupportedLanguage.Yoruba, CulturalRegion.WestAfrica);
    
    expect(personality.language).toBe(SupportedLanguage.Yoruba);
    expect(personality.culturalRegion).toBe(CulturalRegion.WestAfrica);
    expect(personality.teachingStyle).toBe(TeachingStyle.Storytelling);
    expect(personality.name).toContain('Ọgbọn');
  });

  it('should generate culturally appropriate responses', () => {
    const personality = service.getPersonality(SupportedLanguage.Spanish, CulturalRegion.LatinAmerica);
    
    const response = service.generateResponse(
      personality,
      'How do I learn better?',
      {
        topic: 'Study Skills',
        userLevel: 'beginner',
        includeReferences: true,
        includeSpiritualGuidance: true
      }
    );
    
    expect(response.text).toBeDefined();
    expect(response.culturalContext).toBe(CulturalRegion.LatinAmerica);
    expect(response.spiritualAlignment).toBeGreaterThan(0);
  });

  it('should provide all available personalities', () => {
    const personalities = service.getAllPersonalities();
    
    expect(personalities).toHaveLength(7); // One for each supported language
    expect(personalities.every(p => p.name && p.language && p.culturalRegion)).toBe(true);
  });
});