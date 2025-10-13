/**
 * Language Detection Service for ScrollUniversity Platform
 * Detects user language preferences and provides automatic language switching
 */

import {
  SupportedLanguage,
  CulturalRegion,
  LanguageDetectionResult,
  LanguagePreference,
  LanguageSwitchEvent
} from '../types/multilingual';

export class LanguageDetectionService {
  private static instance: LanguageDetectionService;
  private languagePatterns: Map<SupportedLanguage, RegExp[]>;
  private culturalMappings: Map<SupportedLanguage, CulturalRegion>;

  private constructor() {
    this.initializeLanguagePatterns();
    this.initializeCulturalMappings();
  }

  public static getInstance(): LanguageDetectionService {
    if (!LanguageDetectionService.instance) {
      LanguageDetectionService.instance = new LanguageDetectionService();
    }
    return LanguageDetectionService.instance;
  }

  private initializeLanguagePatterns(): void {
    this.languagePatterns = new Map([
      [SupportedLanguage.English, [
        /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/gi,
        /\b(hello|hi|thank|please|welcome)\b/gi
      ]],
      [SupportedLanguage.Spanish, [
        /\b(el|la|los|las|y|o|pero|en|con|de|para|por)\b/gi,
        /\b(hola|gracias|por favor|bienvenido)\b/gi
      ]],
      [SupportedLanguage.Arabic, [
        /[\u0600-\u06FF]/g,
        /\b(في|من|إلى|على|مع|هذا|ذلك)\b/gi
      ]],
      [SupportedLanguage.Hebrew, [
        /[\u0590-\u05FF]/g,
        /\b(של|את|על|עם|זה|הוא|היא)\b/gi
      ]],
      [SupportedLanguage.Chinese, [
        /[\u4e00-\u9fff]/g,
        /\b(的|是|在|有|我|你|他)\b/gi
      ]],
      [SupportedLanguage.Twi, [
        /\b(na|ne|wo|me|yen|wɔn|sɛ)\b/gi,
        /\b(akwaaba|medaase|mepaakyɛw)\b/gi
      ]],
      [SupportedLanguage.Yoruba, [
        /\b(ati|ni|si|fun|pelu|naa|yi)\b/gi,
        /\b(kaabo|ese|jowo|bawo)\b/gi
      ]]
    ]);
  }

  private initializeCulturalMappings(): void {
    this.culturalMappings = new Map([
      [SupportedLanguage.English, CulturalRegion.NorthAmerica],
      [SupportedLanguage.Spanish, CulturalRegion.LatinAmerica],
      [SupportedLanguage.Arabic, CulturalRegion.MiddleEast],
      [SupportedLanguage.Hebrew, CulturalRegion.MiddleEast],
      [SupportedLanguage.Chinese, CulturalRegion.EastAsia],
      [SupportedLanguage.Twi, CulturalRegion.WestAfrica],
      [SupportedLanguage.Yoruba, CulturalRegion.WestAfrica]
    ]);
  }

  /**
   * Detect language from text input
   */
  public async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    const scores = new Map<SupportedLanguage, number>();
    
    // Initialize scores
    Object.values(SupportedLanguage).forEach(lang => {
      scores.set(lang, 0);
    });

    // Score based on pattern matching
    for (const [language, patterns] of this.languagePatterns) {
      let score = 0;
      for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
          score += matches.length;
        }
      }
      scores.set(language, score);
    }

    // Convert to sorted array
    const sortedResults = Array.from(scores.entries())
      .map(([language, score]) => ({
        language,
        confidence: Math.min(score / text.length * 100, 100)
      }))
      .sort((a, b) => b.confidence - a.confidence);

    const topResult = sortedResults[0];
    const alternatives = sortedResults.slice(1, 4);

    return {
      detectedLanguage: topResult.language,
      confidence: topResult.confidence,
      alternativeLanguages: alternatives
    };
  }

  /**
   * Detect language from browser/system preferences
   */
  public detectFromBrowser(): SupportedLanguage {
    if (typeof navigator === 'undefined') {
      return SupportedLanguage.English;
    }

    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    const langCode = browserLang.split('-')[0].toLowerCase();

    const langMapping: Record<string, SupportedLanguage> = {
      'en': SupportedLanguage.English,
      'es': SupportedLanguage.Spanish,
      'ar': SupportedLanguage.Arabic,
      'he': SupportedLanguage.Hebrew,
      'zh': SupportedLanguage.Chinese,
      'tw': SupportedLanguage.Twi,
      'yo': SupportedLanguage.Yoruba
    };

    return langMapping[langCode] || SupportedLanguage.English;
  }

  /**
   * Create language preference based on detection
   */
  public createLanguagePreference(
    primaryLang: SupportedLanguage,
    secondaryLang?: SupportedLanguage
  ): LanguagePreference {
    const culturalRegion = this.culturalMappings.get(primaryLang) || CulturalRegion.NorthAmerica;
    const rtlLanguages = [SupportedLanguage.Arabic, SupportedLanguage.Hebrew];
    
    return {
      primary: primaryLang,
      secondary: secondaryLang,
      culturalRegion,
      rtlSupport: rtlLanguages.includes(primaryLang),
      dateFormat: this.getDateFormat(culturalRegion),
      numberFormat: this.getNumberFormat(culturalRegion)
    };
  }

  private getDateFormat(region: CulturalRegion): string {
    const formats: Record<CulturalRegion, string> = {
      [CulturalRegion.NorthAmerica]: 'MM/DD/YYYY',
      [CulturalRegion.Europe]: 'DD/MM/YYYY',
      [CulturalRegion.EastAsia]: 'YYYY/MM/DD',
      [CulturalRegion.MiddleEast]: 'DD/MM/YYYY',
      [CulturalRegion.WestAfrica]: 'DD/MM/YYYY',
      [CulturalRegion.LatinAmerica]: 'DD/MM/YYYY'
    };
    return formats[region];
  }

  private getNumberFormat(region: CulturalRegion): string {
    const formats: Record<CulturalRegion, string> = {
      [CulturalRegion.NorthAmerica]: '1,234.56',
      [CulturalRegion.Europe]: '1.234,56',
      [CulturalRegion.EastAsia]: '1,234.56',
      [CulturalRegion.MiddleEast]: '1,234.56',
      [CulturalRegion.WestAfrica]: '1,234.56',
      [CulturalRegion.LatinAmerica]: '1.234,56'
    };
    return formats[region];
  }

  /**
   * Log language switch event
   */
  public logLanguageSwitch(
    userId: string,
    fromLanguage: SupportedLanguage,
    toLanguage: SupportedLanguage,
    context: string,
    automatic: boolean = false
  ): LanguageSwitchEvent {
    const event: LanguageSwitchEvent = {
      userId,
      fromLanguage,
      toLanguage,
      timestamp: new Date(),
      context,
      automatic
    };

    // In a real implementation, this would be sent to analytics/logging service
    console.log('Language switch event:', event);
    
    return event;
  }

  /**
   * Get supported languages for a cultural region
   */
  public getSupportedLanguagesForRegion(region: CulturalRegion): SupportedLanguage[] {
    const regionLanguages: Record<CulturalRegion, SupportedLanguage[]> = {
      [CulturalRegion.NorthAmerica]: [SupportedLanguage.English, SupportedLanguage.Spanish],
      [CulturalRegion.Europe]: [SupportedLanguage.English, SupportedLanguage.Spanish],
      [CulturalRegion.EastAsia]: [SupportedLanguage.Chinese, SupportedLanguage.English],
      [CulturalRegion.MiddleEast]: [SupportedLanguage.Arabic, SupportedLanguage.Hebrew, SupportedLanguage.English],
      [CulturalRegion.WestAfrica]: [SupportedLanguage.Twi, SupportedLanguage.Yoruba, SupportedLanguage.English],
      [CulturalRegion.LatinAmerica]: [SupportedLanguage.Spanish, SupportedLanguage.English]
    };
    
    return regionLanguages[region] || [SupportedLanguage.English];
  }
}