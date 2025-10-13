import { z } from 'zod';

// Common Validation Schemas and Utilities
export const UUIDSchema = z.string().uuid();
export const EmailSchema = z.string().email();
export const URLSchema = z.string().url();
export const DateTimeSchema = z.string().datetime();
export const LanguageCodeSchema = z.string().length(2);
export const CurrencyCodeSchema = z.string().length(3);

// Custom Validation Functions
export const createEnumSchema = <T extends readonly [string, ...string[]]>(values: T) => 
  z.enum(values);

export const createOptionalSchema = <T extends z.ZodTypeAny>(schema: T) => 
  schema.optional();

export const createArraySchema = <T extends z.ZodTypeAny>(itemSchema: T, minItems = 0, maxItems?: number) => 
  z.array(itemSchema).min(minItems).max(maxItems ?? Number.MAX_SAFE_INTEGER);

// Validation Result Types
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

// Form Validation Schemas
export const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const PhoneNumberSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const ScrollCoinAmountSchema = z.number()
  .positive('Amount must be positive')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places');

export const PercentageSchema = z.number()
  .min(0, 'Percentage cannot be negative')
  .max(100, 'Percentage cannot exceed 100');

// Content Validation Schemas
export const RichTextSchema = z.string()
  .min(1, 'Content cannot be empty')
  .max(50000, 'Content is too long');

export const TagSchema = z.string()
  .min(1, 'Tag cannot be empty')
  .max(50, 'Tag is too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Tag can only contain letters, numbers, underscores, and hyphens');

export const SlugSchema = z.string()
  .min(1, 'Slug cannot be empty')
  .max(100, 'Slug is too long')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens');

// File Validation Schemas
export const FileTypeSchema = z.enum([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'audio/mp3',
  'audio/wav',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]);

export const FileSizeSchema = z.number()
  .positive('File size must be positive')
  .max(100 * 1024 * 1024, 'File size cannot exceed 100MB'); // 100MB limit

export const ImageDimensionsSchema = z.object({
  width: z.number().positive().max(4096, 'Image width cannot exceed 4096px'),
  height: z.number().positive().max(4096, 'Image height cannot exceed 4096px')
});

// Time and Date Validation
export const TimeZoneSchema = z.string()
  .regex(/^[A-Za-z_]+\/[A-Za-z_]+$/, 'Invalid timezone format');

export const DurationSchema = z.object({
  hours: z.number().nonnegative().max(23),
  minutes: z.number().nonnegative().max(59),
  seconds: z.number().nonnegative().max(59)
});

export const DateRangeSchema = z.object({
  start_date: DateTimeSchema,
  end_date: DateTimeSchema
}).refine(data => new Date(data.start_date) < new Date(data.end_date), {
  message: 'End date must be after start date',
  path: ['end_date']
});

// Spiritual Content Validation
export const SpiritualContentSchema = z.object({
  content: RichTextSchema,
  spiritual_themes: createArraySchema(z.string(), 0, 10),
  scripture_references: createArraySchema(z.object({
    book: z.string(),
    chapter: z.number().positive(),
    verse_start: z.number().positive(),
    verse_end: z.number().positive().optional(),
    translation: z.string().optional()
  }), 0, 20),
  prophetic_elements: createArraySchema(z.string(), 0, 5),
  cultural_sensitivity_notes: createArraySchema(z.string(), 0, 10)
});

// Academic Validation Schemas
export const GPASchema = z.number()
  .min(0.0, 'GPA cannot be negative')
  .max(4.0, 'GPA cannot exceed 4.0');

export const CreditHoursSchema = z.number()
  .positive('Credit hours must be positive')
  .max(30, 'Credit hours cannot exceed 30 per semester');

export const GradeSchema = z.enum(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'I', 'W', 'P', 'NP']);

// XR Content Validation
export const Vector3DSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite()
});

export const ColorHexSchema = z.string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format');

export const XRAssetSchema = z.object({
  asset_id: UUIDSchema,
  name: z.string().min(1).max(100),
  type: z.enum(['3d_model', 'texture', 'audio', 'animation', 'particle_system', 'shader', 'environment_map']),
  url: URLSchema,
  file_size_mb: z.number().positive().max(500), // 500MB limit for XR assets
  quality_levels: createArraySchema(z.object({
    level: z.enum(['low', 'medium', 'high', 'ultra']),
    url: URLSchema,
    file_size_mb: z.number().positive()
  }), 1, 4)
});

// AI Content Validation
export const AIPromptSchema = z.string()
  .min(10, 'AI prompt must be at least 10 characters')
  .max(4000, 'AI prompt cannot exceed 4000 characters');

export const AIResponseSchema = z.object({
  content: z.string().min(1),
  confidence_score: z.number().min(0).max(1),
  tokens_used: z.number().positive(),
  processing_time_ms: z.number().positive(),
  model_version: z.string(),
  safety_flags: createArraySchema(z.string(), 0, 10)
});

// ScrollCoin Transaction Validation
export const ScrollCoinTransactionSchema = z.object({
  from_wallet: z.string().min(1),
  to_wallet: z.string().min(1),
  amount: ScrollCoinAmountSchema,
  transaction_type: z.enum([
    'tuition_payment',
    'course_enrollment',
    'reward_earned',
    'scholarship_disbursement',
    'workstudy_payment',
    'mission_reward',
    'peer_transfer',
    'refund',
    'fee_payment'
  ]),
  description: z.string().min(1).max(500),
  metadata: z.record(z.any()).optional()
}).refine(data => data.from_wallet !== data.to_wallet, {
  message: 'Cannot transfer to the same wallet',
  path: ['to_wallet']
});

// Multi-language Content Validation
export const MultilingualContentSchema = z.object({
  default_language: LanguageCodeSchema,
  translations: z.record(
    LanguageCodeSchema,
    z.object({
      title: z.string().min(1).max(200),
      description: z.string().max(1000),
      content: RichTextSchema,
      last_updated: DateTimeSchema,
      translator_id: UUIDSchema.optional(),
      reviewed: z.boolean().default(false)
    })
  )
}).refine(data => data.default_language in data.translations, {
  message: 'Default language must have a translation',
  path: ['translations']
});

// Accessibility Validation
export const AccessibilityOptionsSchema = z.object({
  high_contrast: z.boolean().default(false),
  large_text: z.boolean().default(false),
  screen_reader_compatible: z.boolean().default(false),
  keyboard_navigation: z.boolean().default(false),
  reduced_motion: z.boolean().default(false),
  audio_descriptions: z.boolean().default(false),
  closed_captions: z.boolean().default(false),
  sign_language_interpretation: z.boolean().default(false)
});

// Custom Validation Utilities
export class ValidationUtils {
  static validateScrollCoinWallet(address: string): boolean {
    // Implement ScrollCoin wallet address validation logic
    return /^SC[0-9A-Fa-f]{40}$/.test(address);
  }

  static validateBiblicalReference(reference: string): boolean {
    // Validate biblical reference format (e.g., "John 3:16", "Genesis 1:1-3")
    return /^[1-3]?\s?[A-Za-z]+\s+\d+:\d+(-\d+)?$/.test(reference);
  }

  static validateLanguageCode(code: string): boolean {
    const supportedLanguages = ['en', 'de', 'fr', 'tw', 'yo', 'ha', 'he', 'ar', 'zh'];
    return supportedLanguages.includes(code);
  }

  static validateSpiritualContent(content: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for inappropriate content
    const inappropriateWords = ['curse', 'damn', 'hell']; // Simplified list
    inappropriateWords.forEach(word => {
      if (content.toLowerCase().includes(word)) {
        issues.push(`Contains potentially inappropriate word: ${word}`);
      }
    });

    // Check for doctrinal concerns (simplified)
    const doctrinalConcerns = ['new age', 'karma', 'reincarnation'];
    doctrinalConcerns.forEach(concern => {
      if (content.toLowerCase().includes(concern)) {
        issues.push(`Contains potentially concerning doctrine: ${concern}`);
      }
    });

    return {
      valid: issues.length === 0,
      issues
    };
  }

  static validateXRContent(content: any): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check file sizes
    if (content.file_size_mb > 100) {
      issues.push('XR content file size exceeds 100MB limit');
    }

    // Check polygon count for 3D models
    if (content.type === '3d_model' && content.polygon_count > 50000) {
      issues.push('3D model polygon count exceeds recommended limit of 50,000');
    }

    // Check texture resolution
    if (content.type === 'texture' && content.resolution) {
      const [width, height] = content.resolution.split('x').map(Number);
      if (width > 2048 || height > 2048) {
        issues.push('Texture resolution exceeds recommended limit of 2048x2048');
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// Export validation helper functions
export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> => {
  try {
    const result = schema.parse(data);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          value: err.input
        }))
      };
    }
    return {
      success: false,
      errors: [{
        field: 'unknown',
        message: 'Validation failed',
        code: 'unknown_error'
      }]
    };
  }
};

export const validateAsync = async <T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): Promise<ValidationResult<T>> => {
  return validate(schema, data);
};