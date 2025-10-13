/**
 * Cultural Adaptation Service for ScrollUniversity Platform
 * Handles content localization and cultural sensitivity for global audiences
 */

import {
  SupportedLanguage,
  CulturalRegion,
  CulturalAdaptation,
  AdaptationType,
  ContentType,
  LocalizedContent,
  LocalizedVersion,
  CulturalVersion,
  ReviewStatus
} from '../types/multilingual';

export class CulturalAdaptationService {
  private static instance: CulturalAdaptationService;
  private culturalRules: Map<CulturalRegion, CulturalRule[]>;
  private contentRegistry: Map<string, LocalizedContent>;
  private reviewQueue: Map<string, PendingReview>;

  private constructor() {
    this.culturalRules = new Map();
    this.contentRegistry = new Map();
    this.reviewQueue = new Map();
    this.initializeCulturalRules();
  }

  public static getInstance(): CulturalAdaptationService {
    if (!CulturalAdaptationService.instance) {
      CulturalAdaptationService.instance = new CulturalAdaptationService();
    }
    return CulturalAdaptationService.instance;
  }

  private initializeCulturalRules(): void {
    // West Africa Cultural Rules
    this.culturalRules.set(CulturalRegion.WestAfrica, [
      {
        type: AdaptationType.ReligiousReference,
        pattern: /\b(church|sunday service|worship)\b/gi,
        adaptation: (match: string) => {
          const adaptations: Record<string, string> = {
            'church': 'asɔredan (Twi) / ijo (Yoruba)',
            'sunday service': 'Kwasiada som (Twi) / isin Ojo Aiku (Yoruba)',
            'worship': 'som (Twi) / isin (Yoruba)'
          };
          return adaptations[match.toLowerCase()] || match;
        },
        culturalContext: 'Local language religious terms resonate better',
        priority: 1
      },
      {
        type: AdaptationType.CulturalMetaphor,
        pattern: /\b(home run|touchdown|slam dunk)\b/gi,
        adaptation: (match: string) => {
          const adaptations: Record<string, string> = {
            'home run': 'goal',
            'touchdown': 'goal',
            'slam dunk': 'perfect shot'
          };
          return adaptations[match.toLowerCase()] || 'great success';
        },
        culturalContext: 'Football/soccer metaphors more relevant than American sports',
        priority: 2
      },
      {
        type: AdaptationType.SocialNorms,
        pattern: /\b(hey|hi there)\b/gi,
        adaptation: (match: string) => 'Akwaaba! (Welcome in Twi)',
        culturalContext: 'Warm, welcoming greetings are culturally important',
        priority: 1
      }
    ]);

    // Middle East Cultural Rules
    this.culturalRules.set(CulturalRegion.MiddleEast, [
      {
        type: AdaptationType.ReligiousReference,
        pattern: /\b(blessed|blessing|grace)\b/gi,
        adaptation: (match: string) => {
          const adaptations: Record<string, string> = {
            'blessed': 'مبارك (Arabic) / ברוך (Hebrew)',
            'blessing': 'بركة (Arabic) / ברכה (Hebrew)',
            'grace': 'نعمة (Arabic) / חסד (Hebrew)'
          };
          return adaptations[match.toLowerCase()] || match;
        },
        culturalContext: 'Religious terms in local languages carry deeper meaning',
        priority: 1
      },
      {
        type: AdaptationType.DateFormat,
        pattern: /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g,
        adaptation: (match: string) => {
          const parts = match.split('/');
          return `${parts[1]}/${parts[0]}/${parts[2]}`; // DD/MM/YYYY
        },
        culturalContext: 'Standard date format in Middle East',
        priority: 3
      }
    ]);

    // East Asia Cultural Rules
    this.culturalRules.set(CulturalRegion.EastAsia, [
      {
        type: AdaptationType.SocialNorms,
        pattern: /\b(great job|awesome|amazing)\b/gi,
        adaptation: (match: string) => 'Well done, continue improving',
        culturalContext: 'Emphasis on continuous improvement over individual praise',
        priority: 1
      },
      {
        type: AdaptationType.CulturalMetaphor,
        pattern: /\b(think outside the box)\b/gi,
        adaptation: (match: string) => 'approach from different angles',
        culturalContext: 'More concrete language preferred over abstract metaphors',
        priority: 2
      }
    ]);

    // Latin America Cultural Rules
    this.culturalRules.set(CulturalRegion.LatinAmerica, [
      {
        type: AdaptationType.SocialNorms,
        pattern: /\b(hello|hi)\b/gi,
        adaptation: (match: string) => '¡Hola! ¿Cómo estás?',
        culturalContext: 'More personal, warm greetings expected',
        priority: 1
      },
      {
        type: AdaptationType.CulturalMetaphor,
        pattern: /\b(piece of cake|easy as pie)\b/gi,
        adaptation: (match: string) => 'pan comido',
        culturalContext: 'Direct Spanish cultural equivalent',
        priority: 2
      }
    ]);
  }

  /**
   * Adapt content for specific cultural region
   */
  public async adaptContent(
    content: string,
    targetRegion: CulturalRegion,
    contentType: ContentType
  ): Promise<CulturalAdaptationResult> {
    const rules = this.culturalRules.get(targetRegion) || [];
    const adaptations: CulturalAdaptation[] = [];
    let adaptedContent = content;

    // Apply cultural rules in priority order
    const sortedRules = rules.sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (this.isRuleApplicableToContentType(rule, contentType)) {
        const matches = content.match(rule.pattern);
        if (matches) {
          for (const match of matches) {
            const adaptedValue = rule.adaptation(match);
            if (adaptedValue !== match) {
              adaptations.push({
                type: rule.type,
                originalValue: match,
                adaptedValue,
                reason: `Cultural adaptation for ${targetRegion}`,
                culturalContext: rule.culturalContext
              });

              adaptedContent = adaptedContent.replace(
                new RegExp(this.escapeRegExp(match), 'gi'),
                adaptedValue
              );
            }
          }
        }
      }
    }

    return {
      originalContent: content,
      adaptedContent,
      adaptations,
      targetRegion,
      contentType,
      adaptedAt: new Date()
    };
  }

  /**
   * Register content for localization
   */
  public registerContent(
    contentId: string,
    originalContent: string,
    originalLanguage: SupportedLanguage
  ): void {
    const localizedContent: LocalizedContent = {
      contentId,
      originalLanguage,
      translations: new Map(),
      culturalAdaptations: new Map()
    };

    // Add original version
    localizedContent.translations.set(originalLanguage, {
      language: originalLanguage,
      content: originalContent,
      translatedAt: new Date(),
      translatedBy: 'original',
      reviewStatus: ReviewStatus.Approved,
      culturallyAdapted: false
    });

    this.contentRegistry.set(contentId, localizedContent);
  }

  /**
   * Add translated version with cultural adaptation
   */
  public async addLocalizedVersion(
    contentId: string,
    language: SupportedLanguage,
    translatedContent: string,
    translatorId: string,
    culturalRegion?: CulturalRegion
  ): Promise<void> {
    const content = this.contentRegistry.get(contentId);
    if (!content) {
      throw new Error(`Content ${contentId} not found`);
    }

    // Apply cultural adaptation if region specified
    let finalContent = translatedContent;
    let culturallyAdapted = false;
    
    if (culturalRegion) {
      const adaptationResult = await this.adaptContent(
        translatedContent,
        culturalRegion,
        ContentType.LessonContent // Default content type
      );
      finalContent = adaptationResult.adaptedContent;
      culturallyAdapted = adaptationResult.adaptations.length > 0;

      // Store cultural version
      content.culturalAdaptations.set(culturalRegion, {
        region: culturalRegion,
        adaptations: adaptationResult.adaptations,
        reviewedBy: translatorId,
        approvedAt: new Date()
      });
    }

    const localizedVersion: LocalizedVersion = {
      language,
      content: finalContent,
      translatedAt: new Date(),
      translatedBy: translatorId,
      reviewStatus: ReviewStatus.Pending,
      culturallyAdapted
    };

    content.translations.set(language, localizedVersion);

    // Add to review queue
    this.reviewQueue.set(`${contentId}-${language}`, {
      contentId,
      language,
      content: finalContent,
      submittedBy: translatorId,
      submittedAt: new Date(),
      culturalRegion
    });
  }

  /**
   * Get localized content
   */
  public getLocalizedContent(
    contentId: string,
    language: SupportedLanguage,
    culturalRegion?: CulturalRegion
  ): LocalizedVersion | null {
    const content = this.contentRegistry.get(contentId);
    if (!content) {
      return null;
    }

    const translation = content.translations.get(language);
    if (!translation) {
      // Fallback to original language
      return content.translations.get(content.originalLanguage) || null;
    }

    return translation;
  }

  /**
   * Review and approve localized content
   */
  public reviewContent(
    contentId: string,
    language: SupportedLanguage,
    reviewerId: string,
    approved: boolean,
    feedback?: string
  ): void {
    const content = this.contentRegistry.get(contentId);
    if (!content) {
      throw new Error(`Content ${contentId} not found`);
    }

    const translation = content.translations.get(language);
    if (!translation) {
      throw new Error(`Translation for ${language} not found`);
    }

    translation.reviewStatus = approved ? ReviewStatus.Approved : ReviewStatus.NeedsRevision;

    // Remove from review queue if approved
    if (approved) {
      this.reviewQueue.delete(`${contentId}-${language}`);
    }

    // Log review activity
    console.log(`Content ${contentId} (${language}) ${approved ? 'approved' : 'rejected'} by ${reviewerId}`);
    if (feedback) {
      console.log(`Feedback: ${feedback}`);
    }
  }

  /**
   * Get cultural sensitivity score for content
   */
  public getCulturalSensitivityScore(
    content: string,
    targetRegion: CulturalRegion
  ): CulturalSensitivityScore {
    const rules = this.culturalRules.get(targetRegion) || [];
    let totalIssues = 0;
    let criticalIssues = 0;
    const issues: CulturalIssue[] = [];

    for (const rule of rules) {
      const matches = content.match(rule.pattern);
      if (matches) {
        for (const match of matches) {
          const severity = rule.priority <= 1 ? 'critical' : 'minor';
          if (severity === 'critical') criticalIssues++;
          totalIssues++;

          issues.push({
            text: match,
            type: rule.type,
            severity,
            suggestion: rule.adaptation(match),
            culturalContext: rule.culturalContext
          });
        }
      }
    }

    const score = Math.max(0, 100 - (criticalIssues * 20) - (totalIssues * 5));

    return {
      score,
      totalIssues,
      criticalIssues,
      issues,
      recommendation: score >= 80 ? 'approved' : score >= 60 ? 'needs_review' : 'needs_major_revision'
    };
  }

  /**
   * Get pending reviews
   */
  public getPendingReviews(): PendingReview[] {
    return Array.from(this.reviewQueue.values());
  }

  /**
   * Get cultural adaptation statistics
   */
  public getAdaptationStats(): CulturalAdaptationStats {
    const totalContent = this.contentRegistry.size;
    let totalTranslations = 0;
    let culturallyAdaptedCount = 0;
    const languageDistribution: Record<SupportedLanguage, number> = {} as any;

    for (const content of this.contentRegistry.values()) {
      totalTranslations += content.translations.size;
      
      for (const [language, translation] of content.translations) {
        languageDistribution[language] = (languageDistribution[language] || 0) + 1;
        if (translation.culturallyAdapted) {
          culturallyAdaptedCount++;
        }
      }
    }

    return {
      totalContent,
      totalTranslations,
      culturallyAdaptedCount,
      adaptationRate: totalTranslations > 0 ? (culturallyAdaptedCount / totalTranslations) * 100 : 0,
      languageDistribution,
      pendingReviews: this.reviewQueue.size
    };
  }

  private isRuleApplicableToContentType(rule: CulturalRule, contentType: ContentType): boolean {
    // Define which rule types apply to which content types
    const applicabilityMap: Record<AdaptationType, ContentType[]> = {
      [AdaptationType.ReligiousReference]: [
        ContentType.SpiritualContent,
        ContentType.CourseDescription,
        ContentType.LessonContent
      ],
      [AdaptationType.CulturalMetaphor]: [
        ContentType.LessonContent,
        ContentType.CourseDescription,
        ContentType.UIText
      ],
      [AdaptationType.SocialNorms]: [
        ContentType.UIText,
        ContentType.LessonContent
      ],
      [AdaptationType.DateFormat]: [
        ContentType.UIText,
        ContentType.TechnicalContent
      ],
      [AdaptationType.NumberFormat]: [
        ContentType.UIText,
        ContentType.TechnicalContent
      ],
      [AdaptationType.CurrencyFormat]: [
        ContentType.UIText
      ],
      [AdaptationType.ColorSymbolism]: [
        ContentType.UIText
      ]
    };

    return applicabilityMap[rule.type]?.includes(contentType) ?? true;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Supporting interfaces
interface CulturalRule {
  type: AdaptationType;
  pattern: RegExp;
  adaptation: (match: string) => string;
  culturalContext: string;
  priority: number; // 1 = highest priority
}

interface CulturalAdaptationResult {
  originalContent: string;
  adaptedContent: string;
  adaptations: CulturalAdaptation[];
  targetRegion: CulturalRegion;
  contentType: ContentType;
  adaptedAt: Date;
}

interface PendingReview {
  contentId: string;
  language: SupportedLanguage;
  content: string;
  submittedBy: string;
  submittedAt: Date;
  culturalRegion?: CulturalRegion;
}

interface CulturalSensitivityScore {
  score: number; // 0-100
  totalIssues: number;
  criticalIssues: number;
  issues: CulturalIssue[];
  recommendation: 'approved' | 'needs_review' | 'needs_major_revision';
}

interface CulturalIssue {
  text: string;
  type: AdaptationType;
  severity: 'critical' | 'minor';
  suggestion: string;
  culturalContext: string;
}

interface CulturalAdaptationStats {
  totalContent: number;
  totalTranslations: number;
  culturallyAdaptedCount: number;
  adaptationRate: number;
  languageDistribution: Record<SupportedLanguage, number>;
  pendingReviews: number;
}