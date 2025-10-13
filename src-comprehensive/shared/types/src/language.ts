import { z } from 'zod';

// Multi-language Support Types
export interface LanguageConfig {
  code: string; // ISO 639-1 language code
  name: string;
  native_name: string;
  direction: TextDirection;
  fallback: string;
  enabled: boolean;
  completion_percentage: number; // Translation completion
  cultural_context: CulturalContext;
}

export type TextDirection = 'ltr' | 'rtl';

export interface CulturalContext {
  region: string;
  cultural_notes: string[];
  spiritual_context: SpiritualContext;
  educational_adaptations: EducationalAdaptation[];
}

export interface SpiritualContext {
  primary_faith_tradition: string;
  biblical_translation_preference: string;
  prayer_customs: string[];
  worship_style: string;
  spiritual_terminology: Record<string, string>;
}

export interface EducationalAdaptation {
  aspect: 'learning_style' | 'assessment_method' | 'communication_style' | 'time_orientation';
  description: string;
  implementation_notes: string[];
}

// Supported Languages Configuration
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    native_name: 'English',
    direction: 'ltr',
    fallback: 'en',
    enabled: true,
    completion_percentage: 100,
    cultural_context: {
      region: 'Global',
      cultural_notes: ['Primary language for global communication'],
      spiritual_context: {
        primary_faith_tradition: 'Christianity',
        biblical_translation_preference: 'NIV',
        prayer_customs: ['Individual prayer', 'Corporate prayer'],
        worship_style: 'Contemporary/Traditional',
        spiritual_terminology: {
          'prayer': 'prayer',
          'worship': 'worship',
          'scripture': 'scripture',
          'ministry': 'ministry'
        }
      },
      educational_adaptations: [
        {
          aspect: 'learning_style',
          description: 'Direct, analytical approach',
          implementation_notes: ['Clear objectives', 'Structured content']
        }
      ]
    }
  },
  {
    code: 'de',
    name: 'German',
    native_name: 'Deutsch',
    direction: 'ltr',
    fallback: 'en',
    enabled: true,
    completion_percentage: 85,
    cultural_context: {
      region: 'Central Europe',
      cultural_notes: ['Formal communication style', 'Precision-oriented'],
      spiritual_context: {
        primary_faith_tradition: 'Christianity',
        biblical_translation_preference: 'Luther',
        prayer_customs: ['Liturgical prayer', 'Silent contemplation'],
        worship_style: 'Traditional/Lutheran',
        spiritual_terminology: {
          'prayer': 'Gebet',
          'worship': 'Gottesdienst',
          'scripture': 'Schrift',
          'ministry': 'Dienst'
        }
      },
      educational_adaptations: [
        {
          aspect: 'learning_style',
          description: 'Systematic, thorough approach',
          implementation_notes: ['Detailed explanations', 'Logical progression']
        }
      ]
    }
  },
  {
    code: 'fr',
    name: 'French',
    native_name: 'Français',
    direction: 'ltr',
    fallback: 'en',
    enabled: true,
    completion_percentage: 80,
    cultural_context: {
      region: 'Francophone',
      cultural_notes: ['Formal address important', 'Intellectual discourse valued'],
      spiritual_context: {
        primary_faith_tradition: 'Christianity',
        biblical_translation_preference: 'Louis Segond',
        prayer_customs: ['Contemplative prayer', 'Marian devotion'],
        worship_style: 'Traditional/Catholic',
        spiritual_terminology: {
          'prayer': 'prière',
          'worship': 'culte',
          'scripture': 'écriture',
          'ministry': 'ministère'
        }
      },
      educational_adaptations: [
        {
          aspect: 'communication_style',
          description: 'Eloquent, philosophical approach',
          implementation_notes: ['Rich vocabulary', 'Conceptual depth']
        }
      ]
    }
  },
  {
    code: 'tw',
    name: 'Twi',
    native_name: 'Twi',
    direction: 'ltr',
    fallback: 'en',
    enabled: true,
    completion_percentage: 70,
    cultural_context: {
      region: 'West Africa (Ghana)',
      cultural_notes: ['Community-oriented', 'Respect for elders', 'Oral tradition'],
      spiritual_context: {
        primary_faith_tradition: 'Christianity',
        biblical_translation_preference: 'Twi Bible',
        prayer_customs: ['Call and response', 'Community prayer'],
        worship_style: 'Pentecostal/Charismatic',
        spiritual_terminology: {
          'prayer': 'mpaebɔ',
          'worship': 'som',
          'scripture': 'Nyankopɔn asɛm',
          'ministry': 'som'
        }
      },
      educational_adaptations: [
        {
          aspect: 'learning_style',
          description: 'Storytelling and communal learning',
          implementation_notes: ['Narrative approach', 'Group discussions']
        }
      ]
    }
  },
  {
    code: 'yo',
    name: 'Yoruba',
    native_name: 'Yorùbá',
    direction: 'ltr',
    fallback: 'en',
    enabled: true,
    completion_percentage: 65,
    cultural_context: {
      region: 'West Africa (Nigeria)',
      cultural_notes: ['Rich cultural heritage', 'Proverb-based wisdom', 'Community values'],
      spiritual_context: {
        primary_faith_tradition: 'Christianity',
        biblical_translation_preference: 'Yoruba Bible',
        prayer_customs: ['Praise and worship', 'Prophetic prayer'],
        worship_style: 'Pentecostal/Traditional',
        spiritual_terminology: {
          'prayer': 'àdúrà',
          'worship': 'ìjọsìn',
          'scripture': 'ìwé mímọ́',
          'ministry': 'iṣẹ́ Ọlọ́run'
        }
      },
      educational_adaptations: [
        {
          aspect: 'communication_style',
          description: 'Proverb and metaphor rich',
          implementation_notes: ['Cultural analogies', 'Wisdom sayings']
        }
      ]
    }
  },
  {
    code: 'ha',
    name: 'Hausa',
    native_name: 'Hausa',
    direction: 'ltr',
    fallback: 'en',
    enabled: true,
    completion_percentage: 60,
    cultural_context: {
      region: 'West/Central Africa',
      cultural_notes: ['Islamic influence', 'Trade culture', 'Multilingual context'],
      spiritual_context: {
        primary_faith_tradition: 'Christianity/Islam',
        biblical_translation_preference: 'Hausa Bible',
        prayer_customs: ['Structured prayer times', 'Community worship'],
        worship_style: 'Traditional/Contemporary',
        spiritual_terminology: {
          'prayer': 'addu\'a',
          'worship': 'bauta',
          'scripture': 'littafi mai tsarki',
          'ministry': 'hidima'
        }
      },
      educational_adaptations: [
        {
          aspect: 'time_orientation',
          description: 'Flexible time concepts',
          implementation_notes: ['Relationship over schedule', 'Process-oriented']
        }
      ]
    }
  },
  {
    code: 'he',
    name: 'Hebrew',
    native_name: 'עברית',
    direction: 'rtl',
    fallback: 'en',
    enabled: true,
    completion_percentage: 75,
    cultural_context: {
      region: 'Middle East',
      cultural_notes: ['Ancient language revival', 'Biblical significance', 'Modern Israeli culture'],
      spiritual_context: {
        primary_faith_tradition: 'Judaism/Messianic',
        biblical_translation_preference: 'Hebrew Tanakh',
        prayer_customs: ['Liturgical Hebrew', 'Sabbath observance'],
        worship_style: 'Traditional/Messianic',
        spiritual_terminology: {
          'prayer': 'תפילה',
          'worship': 'עבודה',
          'scripture': 'כתובים',
          'ministry': 'שירות'
        }
      },
      educational_adaptations: [
        {
          aspect: 'learning_style',
          description: 'Text-based, analytical study',
          implementation_notes: ['Scripture integration', 'Historical context']
        }
      ]
    }
  },
  {
    code: 'ar',
    name: 'Arabic',
    native_name: 'العربية',
    direction: 'rtl',
    fallback: 'en',
    enabled: true,
    completion_percentage: 70,
    cultural_context: {
      region: 'Middle East/North Africa',
      cultural_notes: ['Classical vs. dialectal', 'Islamic cultural context', 'Hospitality culture'],
      spiritual_context: {
        primary_faith_tradition: 'Christianity/Islam',
        biblical_translation_preference: 'Arabic Bible',
        prayer_customs: ['Formal prayer structure', 'Community gathering'],
        worship_style: 'Traditional/Contemporary',
        spiritual_terminology: {
          'prayer': 'صلاة',
          'worship': 'عبادة',
          'scripture': 'كتاب مقدس',
          'ministry': 'خدمة'
        }
      },
      educational_adaptations: [
        {
          aspect: 'communication_style',
          description: 'Formal, respectful discourse',
          implementation_notes: ['Honor-based communication', 'Indirect approach']
        }
      ]
    }
  },
  {
    code: 'zh',
    name: 'Chinese (Mandarin)',
    native_name: '中文',
    direction: 'ltr',
    fallback: 'en',
    enabled: true,
    completion_percentage: 65,
    cultural_context: {
      region: 'East Asia',
      cultural_notes: ['Confucian values', 'Harmony emphasis', 'Respect for authority'],
      spiritual_context: {
        primary_faith_tradition: 'Christianity/Traditional',
        biblical_translation_preference: 'Chinese Union Version',
        prayer_customs: ['Silent meditation', 'Group prayer'],
        worship_style: 'Contemporary/Traditional',
        spiritual_terminology: {
          'prayer': '祷告',
          'worship': '敬拜',
          'scripture': '圣经',
          'ministry': '事工'
        }
      },
      educational_adaptations: [
        {
          aspect: 'learning_style',
          description: 'Holistic, relationship-based',
          implementation_notes: ['Context over content', 'Harmony in learning']
        }
      ]
    }
  }
];

// Translation and Localization Types
export interface TranslationKey {
  key: string;
  namespace: string;
  default_value: string;
  description?: string;
  context?: string;
  variables?: TranslationVariable[];
}

export interface TranslationVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'currency';
  description: string;
  example: string;
}

export interface Translation {
  language_code: string;
  key: string;
  value: string;
  translator_id?: string;
  reviewed: boolean;
  last_updated: string;
  quality_score?: number;
}

export interface LocalizationContext {
  language: string;
  region: string;
  currency: string;
  date_format: string;
  time_format: string;
  number_format: NumberFormat;
  cultural_adaptations: CulturalAdaptation[];
}

export interface NumberFormat {
  decimal_separator: string;
  thousands_separator: string;
  currency_symbol: string;
  currency_position: 'before' | 'after';
}

export interface CulturalAdaptation {
  type: 'color' | 'imagery' | 'content' | 'interaction';
  description: string;
  implementation: string;
}

// Language Detection and Switching
export interface LanguageDetectionResult {
  detected_language: string;
  confidence: number;
  alternative_languages: LanguageConfidence[];
  detection_method: DetectionMethod;
}

export interface LanguageConfidence {
  language: string;
  confidence: number;
}

export type DetectionMethod = 
  | 'browser_setting'
  | 'user_preference'
  | 'ip_geolocation'
  | 'text_analysis'
  | 'manual_selection';

export interface LanguageSwitchRequest {
  user_id: string;
  from_language: string;
  to_language: string;
  context: SwitchContext;
  preserve_session: boolean;
}

export interface SwitchContext {
  current_page: string;
  course_id?: string;
  lesson_id?: string;
  user_progress?: Record<string, any>;
}

// AI Tutor Language Adaptation
export interface AITutorLanguageConfig {
  language: string;
  personality_adaptations: PersonalityAdaptation[];
  communication_style: CommunicationStyle;
  cultural_sensitivity: CulturalSensitivity[];
  spiritual_context: SpiritualContext;
}

export interface PersonalityAdaptation {
  trait: string;
  cultural_expression: string;
  examples: string[];
}

export interface CommunicationStyle {
  formality_level: 'very_formal' | 'formal' | 'neutral' | 'informal' | 'very_informal';
  directness: 'very_direct' | 'direct' | 'moderate' | 'indirect' | 'very_indirect';
  emotional_expression: 'high' | 'moderate' | 'low';
  use_of_metaphors: boolean;
  storytelling_preference: boolean;
}

export interface CulturalSensitivity {
  topic: string;
  sensitivity_level: 'high' | 'medium' | 'low';
  guidelines: string[];
  alternative_approaches: string[];
}

// Content Localization Types
export interface LocalizedContent {
  content_id: string;
  language: string;
  title: string;
  description: string;
  content_body: string;
  media_urls: LocalizedMedia[];
  cultural_notes?: string[];
  spiritual_context?: string[];
  last_updated: string;
}

export interface LocalizedMedia {
  media_type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  alt_text?: string;
  caption?: string;
  cultural_adaptation_notes?: string[];
}

// Validation Schemas
export const LanguageConfigSchema = z.object({
  code: z.string().length(2),
  name: z.string().min(1),
  native_name: z.string().min(1),
  direction: z.enum(['ltr', 'rtl']),
  fallback: z.string().length(2),
  enabled: z.boolean(),
  completion_percentage: z.number().min(0).max(100)
});

export const TranslationSchema = z.object({
  language_code: z.string().length(2),
  key: z.string().min(1),
  value: z.string(),
  translator_id: z.string().uuid().optional(),
  reviewed: z.boolean(),
  last_updated: z.string().datetime(),
  quality_score: z.number().min(0).max(100).optional()
});

export const LanguageDetectionResultSchema = z.object({
  detected_language: z.string().length(2),
  confidence: z.number().min(0).max(1),
  detection_method: z.enum(['browser_setting', 'user_preference', 'ip_geolocation', 'text_analysis', 'manual_selection'])
});

export const LocalizationContextSchema = z.object({
  language: z.string().length(2),
  region: z.string().length(2),
  currency: z.string().length(3),
  date_format: z.string(),
  time_format: z.string()
});