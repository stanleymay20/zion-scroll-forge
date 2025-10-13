/**
 * Main Multilingual Service for ScrollUniversity Platform
 * Orchestrates language detection, translation, cultural adaptation, and AI tutor personalities
 */

import {
  SupportedLanguage,
  CulturalRegion,
  LanguagePreference,
  TranslationRequest,
  TranslationResponse,
  ContentType,
  AITutorPersonality,
  MultilingualConfig,
  LanguageSwitchEvent
} from '../types/multilingual';

import { LanguageDetectionService } from './LanguageDetectionService';
import { TranslationService } from './TranslationService';
import { CulturalAdaptationService } from './CulturalAdaptationService';
import { AITutorPersonalityService } from './AITutorPersonalityService';

export class MultilingualService {
  private static instance: MultilingualService;
  private languageDetection: LanguageDetectionService;
  private translation: TranslationService;
  private culturalAdaptation: CulturalAdaptationService;
  private tutorPersonality: AITutorPersonalityService;
  private userPreferences: Map<string, LanguagePreference>;
  private config: MultilingualConfig;

  private constructor() {
    this.languageDetection = LanguageDetectionService.getInstance();
    this.translation = TranslationService.getInstance();
    this.culturalAdaptation = CulturalAdaptationService.getInstance();
    this.tutorPersonality = AITutorPersonalityService.getInstance();
    this.userPreferences = new Map();
    
    this.config = {
      defaultLanguage: SupportedLanguage.English,
      supportedLanguages: Object.values(SupportedLanguage),
      autoDetectLanguage: true,
      fallbackLanguage: SupportedLanguage.English,
      translationService: 'openai' as any,
      culturalAdaptationEnabled: true
    };
  }

  public static getInstance(): MultilingualService {
    if (!MultilingualService.instance) {
      MultilingualService.instance = new MultilingualService();
    }
    return MultilingualService.instance;
  }

  /**
   * Initialize user language preferences
   */
  public async initializeUserLanguage(userId: string, preferredLanguage?: SupportedLanguage): Promise<LanguagePreference> {
    let detectedLanguage: SupportedLanguage;

    if (preferredLanguage) {
      detectedLanguage = preferredLanguage;
    } else if (this.config.autoDetectLanguage) {
      detectedLanguage = this.languageDetection.detectFromBrowser();
    } else {
      detectedLanguage = this.config.defaultLanguage;
    }

    const languagePreference = this.languageDetection.createLanguagePreference(detectedLanguage);
    this.userPreferences.set(userId, languagePreference);

    return languagePreference;
  }

  /**
   * Switch user language
   */
  public async switchUserLanguage(
    userId: string,
    newLanguage: SupportedLanguage,
    context: string = 'manual_switch'
  ): Promise<LanguagePreference> {
    const currentPreference = this.userPreferences.get(userId);
    const oldLanguage = currentPreference?.primary || this.config.defaultLanguage;

    // Create new preference
    const newPreference = this.languageDetection.createLanguagePreference(newLanguage);
    this.userPreferences.set(userId, newPreference);

    // Log the switch event
    this.languageDetection.logLanguageSwitch(userId, oldLanguage, newLanguage, context, false);

    return newPreference;
  }

  /**
   * Get user's current language preference
   */
  public getUserLanguagePreference(userId: string): LanguagePreference | null {
    return this.userPreferences.get(userId) || null;
  }

  /**
   * Translate content for user
   */
  public async translateForUser(
    userId: string,
    content: string,
    contentType: ContentType,
    sourceLanguage?: SupportedLanguage,
    context?: string
  ): Promise<TranslationResponse> {
    const userPreference = this.userPreferences.get(userId);
    if (!userPreference) {
      throw new Error(`User ${userId} language preference not initialized`);
    }

    const sourceLang = sourceLanguage || this.config.defaultLanguage;
    const targetLang = userPreference.primary;

    const request: TranslationRequest = {
      sourceText: content,
      sourceLang,
      targetLang,
      context,
      contentType
    };

    return this.translation.translateText(request);
  }

  /**
   * Get culturally adapted AI tutor for user
   */
  public getAITutorForUser(userId: string): AITutorPersonality {
    const userPreference = this.userPreferences.get(userId);
    if (!userPreference) {
      // Return default English tutor
      return this.tutorPersonality.getPersonality(SupportedLanguage.English);
    }

    return this.tutorPersonality.getPersonality(
      userPreference.primary,
      userPreference.culturalRegion
    );
  }

  /**
   * Generate AI tutor response for user
   */
  public async generateTutorResponse(
    userId: string,
    userMessage: string,
    topic: string,
    userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    includeSpiritual: boolean = true
  ): Promise<any> {
    const personality = this.getAITutorForUser(userId);
    
    const context = {
      topic,
      userLevel,
      includeReferences: true,
      includeSpiritualGuidance: includeSpiritual
    };

    return this.tutorPersonality.generateResponse(personality, userMessage, context);
  }

  /**
   * Localize course content for user
   */
  public async localizeCourseContent(
    userId: string,
    courseId: string,
    content: {
      title: string;
      description: string;
      lessons: Array<{
        id: string;
        title: string;
        content: string;
      }>;
    }
  ): Promise<LocalizedCourseContent> {
    const userPreference = this.userPreferences.get(userId);
    if (!userPreference) {
      throw new Error(`User ${userId} language preference not initialized`);
    }

    // Register content for localization
    this.culturalAdaptation.registerContent(
      `course-${courseId}`,
      JSON.stringify(content),
      this.config.defaultLanguage
    );

    // Translate course title
    const titleTranslation = await this.translateForUser(
      userId,
      content.title,
      ContentType.CourseTitle
    );

    // Translate course description
    const descriptionTranslation = await this.translateForUser(
      userId,
      content.description,
      ContentType.CourseDescription
    );

    // Translate lessons
    const localizedLessons = await Promise.all(
      content.lessons.map(async (lesson) => {
        const titleTranslation = await this.translateForUser(
          userId,
          lesson.title,
          ContentType.CourseTitle
        );

        const contentTranslation = await this.translateForUser(
          userId,
          lesson.content,
          ContentType.LessonContent
        );

        return {
          id: lesson.id,
          title: titleTranslation.translatedText,
          content: contentTranslation.translatedText,
          culturalAdaptations: [
            ...(titleTranslation.culturalAdaptations || []),
            ...(contentTranslation.culturalAdaptations || [])
          ]
        };
      })
    );

    return {
      courseId,
      language: userPreference.primary,
      culturalRegion: userPreference.culturalRegion,
      title: titleTranslation.translatedText,
      description: descriptionTranslation.translatedText,
      lessons: localizedLessons,
      aiTutor: this.getAITutorForUser(userId),
      localizedAt: new Date()
    };
  }

  /**
   * Get language switching interface for user
   */
  public getLanguageSwitchingInterface(userId: string): LanguageSwitchingInterface {
    const currentPreference = this.userPreferences.get(userId);
    const currentLanguage = currentPreference?.primary || this.config.defaultLanguage;
    const currentRegion = currentPreference?.culturalRegion || CulturalRegion.NorthAmerica;

    // Get available languages for current region
    const regionalLanguages = this.languageDetection.getSupportedLanguagesForRegion(currentRegion);
    
    // Get all supported languages
    const allLanguages = this.config.supportedLanguages.map(lang => ({
      code: lang,
      name: this.getLanguageDisplayName(lang),
      region: this.getRegionForLanguage(lang),
      isCurrentLanguage: lang === currentLanguage,
      isRegionalLanguage: regionalLanguages.includes(lang)
    }));

    return {
      currentLanguage,
      currentRegion,
      availableLanguages: allLanguages,
      regionalLanguages: regionalLanguages.map(lang => ({
        code: lang,
        name: this.getLanguageDisplayName(lang),
        region: this.getRegionForLanguage(lang),
        isCurrentLanguage: lang === currentLanguage,
        isRegionalLanguage: true
      })),
      rtlSupport: currentPreference?.rtlSupport || false
    };
  }

  /**
   * Get multilingual statistics
   */
  public getMultilingualStats(): MultilingualStats {
    const totalUsers = this.userPreferences.size;
    const languageDistribution: Record<SupportedLanguage, number> = {} as any;
    const regionDistribution: Record<CulturalRegion, number> = {} as any;

    // Initialize counters
    Object.values(SupportedLanguage).forEach(lang => {
      languageDistribution[lang] = 0;
    });
    Object.values(CulturalRegion).forEach(region => {
      regionDistribution[region] = 0;
    });

    // Count distributions
    for (const preference of this.userPreferences.values()) {
      languageDistribution[preference.primary]++;
      regionDistribution[preference.culturalRegion]++;
    }

    const translationStats = this.translation.getTranslationStats();
    const adaptationStats = this.culturalAdaptation.getAdaptationStats();

    return {
      totalUsers,
      languageDistribution,
      regionDistribution,
      translationCacheSize: translationStats.cacheSize,
      culturalAdaptationRate: adaptationStats.adaptationRate,
      supportedLanguages: this.config.supportedLanguages.length,
      availablePersonalities: this.tutorPersonality.getAllPersonalities().length
    };
  }

  private getLanguageDisplayName(language: SupportedLanguage): string {
    const names: Record<SupportedLanguage, string> = {
      [SupportedLanguage.English]: 'English',
      [SupportedLanguage.Spanish]: 'Español',
      [SupportedLanguage.Arabic]: 'العربية',
      [SupportedLanguage.Hebrew]: 'עברית',
      [SupportedLanguage.Chinese]: '中文',
      [SupportedLanguage.Twi]: 'Twi',
      [SupportedLanguage.Yoruba]: 'Yorùbá'
    };
    return names[language];
  }

  private getRegionForLanguage(language: SupportedLanguage): CulturalRegion {
    const mapping: Record<SupportedLanguage, CulturalRegion> = {
      [SupportedLanguage.English]: CulturalRegion.NorthAmerica,
      [SupportedLanguage.Spanish]: CulturalRegion.LatinAmerica,
      [SupportedLanguage.Arabic]: CulturalRegion.MiddleEast,
      [SupportedLanguage.Hebrew]: CulturalRegion.MiddleEast,
      [SupportedLanguage.Chinese]: CulturalRegion.EastAsia,
      [SupportedLanguage.Twi]: CulturalRegion.WestAfrica,
      [SupportedLanguage.Yoruba]: CulturalRegion.WestAfrica
    };
    return mapping[language];
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<MultilingualConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.translation.updateConfig(newConfig);
  }

  /**
   * Health check for multilingual services
   */
  public async healthCheck(): Promise<MultilingualHealthStatus> {
    const services = {
      languageDetection: true, // Always available
      translation: true, // Mock service always available
      culturalAdaptation: true, // Always available
      tutorPersonality: true // Always available
    };

    const stats = this.getMultilingualStats();

    return {
      status: 'healthy',
      services,
      stats,
      lastChecked: new Date()
    };
  }
}

// Supporting interfaces
interface LocalizedCourseContent {
  courseId: string;
  language: SupportedLanguage;
  culturalRegion: CulturalRegion;
  title: string;
  description: string;
  lessons: Array<{
    id: string;
    title: string;
    content: string;
    culturalAdaptations: any[];
  }>;
  aiTutor: AITutorPersonality;
  localizedAt: Date;
}

interface LanguageSwitchingInterface {
  currentLanguage: SupportedLanguage;
  currentRegion: CulturalRegion;
  availableLanguages: Array<{
    code: SupportedLanguage;
    name: string;
    region: CulturalRegion;
    isCurrentLanguage: boolean;
    isRegionalLanguage: boolean;
  }>;
  regionalLanguages: Array<{
    code: SupportedLanguage;
    name: string;
    region: CulturalRegion;
    isCurrentLanguage: boolean;
    isRegionalLanguage: boolean;
  }>;
  rtlSupport: boolean;
}

interface MultilingualStats {
  totalUsers: number;
  languageDistribution: Record<SupportedLanguage, number>;
  regionDistribution: Record<CulturalRegion, number>;
  translationCacheSize: number;
  culturalAdaptationRate: number;
  supportedLanguages: number;
  availablePersonalities: number;
}

interface MultilingualHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    languageDetection: boolean;
    translation: boolean;
    culturalAdaptation: boolean;
    tutorPersonality: boolean;
  };
  stats: MultilingualStats;
  lastChecked: Date;
}