/**
 * Shared input validation utilities for edge functions
 * Prevents injection attacks, DoS via long inputs, and data corruption
 */

// Maximum allowed lengths for various input types
export const MAX_LENGTHS = {
  message: 4000,        // AI chat messages
  title: 200,           // Titles, subjects
  content: 50000,       // Long-form content
  uuid: 36,             // UUID format
  email: 255,           // Email addresses
  name: 100,            // Names
  url: 2048,            // URLs
  shortText: 500,       // Short text fields
};

/**
 * Validates that a string is within allowed length
 */
export function validateLength(value: string | undefined | null, maxLength: number, fieldName: string): void {
  if (value && value.length > maxLength) {
    throw new ValidationError(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }
}

/**
 * Validates UUID format
 */
export function validateUUID(value: string | undefined | null, fieldName: string): void {
  if (!value) return;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new ValidationError(`${fieldName} is not a valid UUID`);
  }
}

/**
 * Validates required field is present and non-empty
 */
export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    throw new ValidationError(`${fieldName} is required`);
  }
}

/**
 * Validates email format
 */
export function validateEmail(value: string | undefined | null, fieldName: string): void {
  if (!value) return;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new ValidationError(`${fieldName} is not a valid email address`);
  }
  validateLength(value, MAX_LENGTHS.email, fieldName);
}

/**
 * Sanitizes string input by trimming and removing control characters
 */
export function sanitizeString(value: string | undefined | null): string {
  if (!value) return '';
  // Remove control characters except newlines and tabs
  return value.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Validates and sanitizes AI chat message
 */
export function validateChatMessage(message: string | undefined | null): string {
  validateRequired(message, 'message');
  validateLength(message, MAX_LENGTHS.message, 'message');
  return sanitizeString(message);
}

/**
 * Validates array of chat history messages
 */
export function validateChatHistory(history: any[] | undefined | null): any[] {
  if (!history) return [];
  if (!Array.isArray(history)) {
    throw new ValidationError('history must be an array');
  }
  
  // Limit history length to prevent DoS
  if (history.length > 50) {
    throw new ValidationError('history cannot exceed 50 messages');
  }
  
  return history.map((msg, index) => {
    if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
      throw new ValidationError(`Invalid role in history message at index ${index}`);
    }
    return {
      role: msg.role,
      content: sanitizeString(msg.content)?.substring(0, MAX_LENGTHS.message) || ''
    };
  });
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Creates a standardized validation error response
 */
export function createValidationErrorResponse(error: ValidationError, corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ 
      error: 'VALIDATION_ERROR',
      message: error.message,
      userFriendlyMessage: error.message
    }),
    { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Extracts and validates user from JWT token
 */
export async function extractAuthenticatedUser(
  req: Request, 
  supabase: any,
  corsHeaders: Record<string, string>
): Promise<{ user: any; error?: Response }> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return {
      user: null,
      error: new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return {
      user: null,
      error: new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }
  
  return { user };
}
