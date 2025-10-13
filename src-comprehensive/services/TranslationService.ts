/**
 * Translation Service for ScrollUniversity Platform
 * Handles translation between supported languages with cultural adaptation
 */

import {
  SupportedLanguage,
  CulturalRegion,
  TranslationRequest,
  TranslationResponse,
  ContentType,
  CulturalAdaptation,
  AdaptationType,
  TranslationService as TranslationServiceType,
  MultilingualConfig
} from '../types/multilingual';

export class TranslationService {
  private static instance: TranslationService;
  private config: MultilingualConfig;
  private translationCache: Map<string, TranslationResponse>;
  private culturalAdaptationRules: Map<CulturalRegion, CulturalAdaptation[]>;

  private constructor() {
    this.config = {
      defaultLanguage: SupportedLanguage.English,
      supportedLanguages: Object.values(SupportedLanguage),
      autoDetectLanguage: true,
      fallbackLanguage: SupportedLanguage.English,
      translationService: TranslationServiceType.OpenAI,
      culturalAdaptationEnabled: true
    };
    this.translationCache = new Map();
    this.initializeCulturalAdaptationRules();
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  private initializeCulturalAdaptationRules(): void {
    this.culturalAdaptationRules = new Map([
      [CulturalRegion.WestAfrica, [
        {
          type: AdaptationType.ReligiousReference,
          originalValue: 'God bless',
          adaptedValue: 'Onyankopɔn nhyira wo (Twi) / Olorun bukun e (Yoruba)',
          reason: 'Local language blessing more culturally appropriate',
          culturalContext: 'West African Christian traditions'
        },
        {
          type: AdaptationType.CulturalMetaphor,
          originalValue: 'hitting a home run',
          adaptedValue: 'scoring a goal',
          reason: 'Football/soccer is more culturally relevant than baseball',
          culturalContext: 'West African sports preferences'
        }
      ]],
      [CulturalRegion.MiddleEast, [
        {
          type: AdaptationType.DateFormat,
          originalValue: 'MM/DD/YYYY',
          adaptedValue: 'DD/MM/YYYY',
          reason: 'Standard date format in Middle East',
          culturalContext: 'Regional date conventions'
        },
        {
          type: AdaptationType.ReligiousReference,
          originalValue: 'Sunday service',
          adaptedValue: 'worship gathering',
          reason: 'More inclusive for different Christian traditions',
          culturalContext: 'Middle Eastern Christian diversity'
        }
      ]],
      [CulturalRegion.EastAsia, [
        {
          type: AdaptationType.SocialNorms,
          originalValue: 'Great job!',
          adaptedValue: 'Well done, keep improving',
          reason: 'Emphasis on continuous improvement over individual praise',
          culturalContext: 'East Asian educational values'
        },
        {
          type: AdaptationType.NumberFormat,
          originalValue: '1,234.56',
          adaptedValue: '1,234.56',
          reason: 'Standard number format maintained',
          culturalContext: 'International number format accepted'
        }
      ]],
      [CulturalRegion.LatinAmerica, [
        {
          type: AdaptationType.CulturalMetaphor,
          originalValue: 'piece of cake',
          adaptedValue: 'pan comido',
          reason: 'Direct cultural equivalent in Spanish',
          culturalContext: 'Spanish idiomatic expressions'
        },
        {
          type: AdaptationType.SocialNorms,
          originalValue: 'Hi there',
          adaptedValue: '¡Hola! ¿Cómo estás?',
          reason: 'More personal greeting expected in Latin culture',
          culturalContext: 'Latin American social customs'
        }
      ]]
    ]);
  }

  /**
   * Translate text with cultural adaptation
   */
  public async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    const cacheKey = this.generateCacheKey(request);
    
    // Check cache first
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    let translatedText: string;
    let confidence: number;

    // Handle same language case
    if (request.sourceLang === request.targetLang) {
      translatedText = request.sourceText;
      confidence = 100;
    } else {
      // Perform actual translation
      const translationResult = await this.performTranslation(request);
      translatedText = translationResult.text;
      confidence = translationResult.confidence;
    }

    // Apply cultural adaptations
    const culturalAdaptations = this.config.culturalAdaptationEnabled
      ? await this.applyCulturalAdaptations(translatedText, request.targetLang, request.contentType)
      : [];

    // Apply adaptations to text
    let adaptedText = translatedText;
    for (const adaptation of culturalAdaptations) {
      adaptedText = adaptedText.replace(
        new RegExp(adaptation.originalValue, 'gi'),
        adaptation.adaptedValue
      );
    }

    const response: TranslationResponse = {
      translatedText: adaptedText,
      confidence,
      culturalAdaptations,
      alternativeTranslations: await this.generateAlternatives(request, translatedText)
    };

    // Cache the result
    this.translationCache.set(cacheKey, response);
    
    return response;
  }

  private async performTranslation(request: TranslationRequest): Promise<{text: string, confidence: number}> {
    switch (this.config.translationService) {
      case TranslationServiceType.OpenAI:
        return this.translateWithOpenAI(request);
      case TranslationServiceType.Google:
        return this.translateWithGoogle(request);
      case TranslationServiceType.Azure:
        return this.translateWithAzure(request);
      default:
        return this.translateWithCustom(request);
    }
  }

  private async translateWithOpenAI(request: TranslationRequest): Promise<{text: string, confidence: number}> {
    // Mock implementation - in real app, this would call OpenAI API
    const prompt = this.buildTranslationPrompt(request);
    
    // Simulate API call
    const mockTranslations: Record<string, Record<string, string>> = {
      [SupportedLanguage.English]: {
        [SupportedLanguage.Spanish]: 'Translated to Spanish',
        [SupportedLanguage.Arabic]: 'مترجم إلى العربية',
        [SupportedLanguage.Hebrew]: 'מתורגם לעברית',
        [SupportedLanguage.Chinese]: '翻译成中文',
        [SupportedLanguage.Twi]: 'Translated to Twi',
        [SupportedLanguage.Yoruba]: 'Translated to Yoruba'
      }
    };

    const translation = mockTranslations[request.sourceLang]?.[request.targetLang] 
      || `[${request.targetLang}] ${request.sourceText}`;

    return {
      text: translation,
      confidence: 85
    };
  }

  private buildTranslationPrompt(request: TranslationRequest): string {
    const contextInfo = request.context ? `Context: ${request.context}\n` : '';
    const contentTypeInfo = `Content Type: ${request.contentType}\n`;
    
    return `Translate the following text from ${request.sourceLang} to ${request.targetLang}.
${contextInfo}${contentTypeInfo}
Ensure the translation is culturally appropriate and maintains spiritual alignment for ScrollUniversity platform.

Text to translate: "${request.sourceText}"

Translation:`;
  }

  private async translateWithGoogle(request: TranslationRequest): Promise<{text: string, confidence: number}> {
    // Mock Google Translate implementation
    return {
      text: `[Google] ${request.sourceText} -> ${request.targetLang}`,
      confidence: 90
    };
  }

  private async translateWithAzure(request: TranslationRequest): Promise<{text: string, confidence: number}> {
    // Mock Azure Translator implementation
    return {
      text: `[Azure] ${request.sourceText} -> ${request.targetLang}`,
      confidence: 88
    };
  }

  private async translateWithCustom(request: TranslationRequest): Promise<{text: string, confidence: number}> {
    // Mock custom translation service
    return {
      text: `[Custom] ${request.sourceText} -> ${request.targetLang}`,
      confidence: 75
    };
  }

  private async applyCulturalAdaptations(
    text: string,
    targetLang: SupportedLanguage,
    contentType: ContentType
  ): Promise<CulturalAdaptation[]> {
    const culturalRegion = this.getCulturalRegionForLanguage(targetLang);
    const rules = this.culturalAdaptationRules.get(culturalRegion) || [];
    
    const applicableAdaptations: CulturalAdaptation[] = [];
    
    for (const rule of rules) {
      if (text.toLowerCase().includes(rule.originalValue.toLowerCase())) {
        // Check if adaptation is appropriate for content type
        if (this.isAdaptationApplicable(rule, contentType)) {
          applicableAdaptations.push(rule);
        }
      }
    }
    
    return applicableAdaptations;
  }

  private isAdaptationApplicable(adaptation: CulturalAdaptation, contentType: ContentType): boolean {
    // Define which adaptations apply to which content types
    const applicabilityRules: Record<AdaptationType, ContentType[]> = {
      [AdaptationType.DateFormat]: [ContentType.UIText, ContentType.CourseDescription],
      [AdaptationType.NumberFormat]: [ContentType.UIText, ContentType.TechnicalContent],
      [AdaptationType.CurrencyFormat]: [ContentType.UIText],
      [AdaptationType.ColorSymbolism]: [ContentType.UIText],
      [AdaptationType.ReligiousReference]: [ContentType.SpiritualContent, ContentType.CourseDescription],
      [AdaptationType.CulturalMetaphor]: [ContentType.LessonContent, ContentType.CourseDescription],
      [AdaptationType.SocialNorms]: [ContentType.UIText, ContentType.LessonContent]
    };
    
    return applicabilityRules[adaptation.type]?.includes(contentType) || false;
  }

  private getCulturalRegionForLanguage(language: SupportedLanguage): CulturalRegion {
    const mapping: Record<SupportedLanguage, CulturalRegion> = {
      [SupportedLanguage.English]: CulturalRegion.NorthAmerica,
      [SupportedLanguage.Spanish]: CulturalRegion.LatinAmerica,
      [SupportedLanguage.Arabic]: CulturalRegion.MiddleEast,
      [SupportedLanguage.Hebrew]: CulturalRegion.MiddleEast,
      [SupportedLanguage.Chinese]: CulturalRegion.EastAsia,
      [SupportedLanguage.Twi]: CulturalRegion.WestAfrica,
      [SupportedLanguage.Yoruba]: CulturalRegion.WestAfrica
    };
    
    return mapping[language] || CulturalRegion.NorthAmerica;
  }

  private async generateAlternatives(
    request: TranslationRequest,
    primaryTranslation: string
  ): Promise<string[]> {
    // Mock alternative translations
    return [
      `Alt 1: ${primaryTranslation}`,
      `Alt 2: ${primaryTranslation}`,
      `Alt 3: ${primaryTranslation}`
    ].slice(0, 2); // Return max 2 alternatives
  }

  private generateCacheKey(request: TranslationRequest): string {
    return `${request.sourceLang}-${request.targetLang}-${request.contentType}-${btoa(request.sourceText)}`;
  }

  /**
   * Batch translate multiple texts
   */
  public async batchTranslate(requests: TranslationRequest[]): Promise<TranslationResponse[]> {
    const promises = requests.map(request => this.translateText(request));
    return Promise.all(promises);
  }

  /**
   * Get translation statistics
   */
  public getTranslationStats(): {
    cacheSize: number;
    supportedLanguages: number;
    culturalRegions: number;
  } {
    return {
      cacheSize: this.translationCache.size,
      supportedLanguages: this.config.supportedLanguages.length,
      culturalRegions: this.culturalAdaptationRules.size
    };
  }

  /**
   * Clear translation cache
   */
  public clearCache(): void {
    this.translationCache.clear();
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<MultilingualConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}