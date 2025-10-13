/**
 * Multilingual Support Types for ScrollUniversity Platform
 * Supports core languages: Twi, Yoruba, Arabic, Hebrew, Chinese, Spanish, English
 */

export enum SupportedLanguage {
  English = 'en',
  Spanish = 'es',
  Arabic = 'ar',
  Hebrew = 'he',
  Chinese = 'zh',
  Twi = 'tw',
  Yoruba = 'yo'
}

export enum CulturalRegion {
  WestAfrica = 'west_africa',
  MiddleEast = 'middle_east',
  EastAsia = 'east_asia',
  LatinAmerica = 'latin_america',
  NorthAmerica = 'north_america',
  Europe = 'europe'
}

export interface LanguagePreference {
  primary: SupportedLanguage;
  secondary?: SupportedLanguage;
  culturalRegion: CulturalRegion;
  rtlSupport: boolean;
  dateFormat: string;
  numberFormat: string;
}

export interface TranslationRequest {
  sourceText: string;
  sourceLang: SupportedLanguage;
  targetLang: SupportedLanguage;
  context?: string;
  contentType: ContentType;
}

export interface TranslationResponse {
  translatedText: string;
  confidence: number;
  culturalAdaptations?: CulturalAdaptation[];
  alternativeTranslations?: string[];
}

export enum ContentType {
  CourseTitle = 'course_title',
  CourseDescription = 'course_description',
  LessonContent = 'lesson_content',
  AssessmentQuestion = 'assessment_question',
  UIText = 'ui_text',
  SpiritualContent = 'spiritual_content',
  TechnicalContent = 'technical_content'
}

export interface CulturalAdaptation {
  type: AdaptationType;
  originalValue: string;
  adaptedValue: string;
  reason: string;
  culturalContext: string;
}

export enum AdaptationType {
  DateFormat = 'date_format',
  NumberFormat = 'number_format',
  CurrencyFormat = 'currency_format',
  ColorSymbolism = 'color_symbolism',
  ReligiousReference = 'religious_reference',
  CulturalMetaphor = 'cultural_metaphor',
  SocialNorms = 'social_norms'
}

export interface AITutorPersonality {
  language: SupportedLanguage;
  culturalRegion: CulturalRegion;
  name: string;
  greeting: string;
  teachingStyle: TeachingStyle;
  culturalReferences: string[];
  spiritualApproach: SpiritualApproach;
  communicationPatterns: CommunicationPattern[];
}

export enum TeachingStyle {
  Formal = 'formal',
  Conversational = 'conversational',
  Storytelling = 'storytelling',
  Socratic = 'socratic',
  Encouraging = 'encouraging',
  Respectful = 'respectful'
}

export enum SpiritualApproach {
  Biblical = 'biblical',
  Prophetic = 'prophetic',
  Wisdom = 'wisdom',
  Pastoral = 'pastoral',
  Evangelical = 'evangelical'
}

export interface CommunicationPattern {
  pattern: string;
  usage: string;
  culturalSignificance: string;
}

export interface LanguageDetectionResult {
  detectedLanguage: SupportedLanguage;
  confidence: number;
  alternativeLanguages: Array<{
    language: SupportedLanguage;
    confidence: number;
  }>;
}

export interface LocalizedContent {
  contentId: string;
  originalLanguage: SupportedLanguage;
  translations: Map<SupportedLanguage, LocalizedVersion>;
  culturalAdaptations: Map<CulturalRegion, CulturalVersion>;
}

export interface LocalizedVersion {
  language: SupportedLanguage;
  content: string;
  translatedAt: Date;
  translatedBy: string; // AI or human translator ID
  reviewStatus: ReviewStatus;
  culturallyAdapted: boolean;
}

export interface CulturalVersion {
  region: CulturalRegion;
  adaptations: CulturalAdaptation[];
  reviewedBy: string;
  approvedAt: Date;
}

export enum ReviewStatus {
  Pending = 'pending',
  Approved = 'approved',
  NeedsRevision = 'needs_revision',
  Rejected = 'rejected'
}

export interface MultilingualConfig {
  defaultLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
  autoDetectLanguage: boolean;
  fallbackLanguage: SupportedLanguage;
  translationService: TranslationService;
  culturalAdaptationEnabled: boolean;
}

export enum TranslationService {
  OpenAI = 'openai',
  Google = 'google',
  Azure = 'azure',
  Custom = 'custom'
}

export interface LanguageSwitchEvent {
  userId: string;
  fromLanguage: SupportedLanguage;
  toLanguage: SupportedLanguage;
  timestamp: Date;
  context: string;
  automatic: boolean;
}