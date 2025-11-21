/**
 * ScrollUniversity Error Handler
 * Comprehensive error handling with user-friendly messages
 * "The Lord is close to the brokenhearted" - Psalm 34:18
 */

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  spiritualMessage?: string;
  statusCode?: number;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Error categories for better handling
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  PAYMENT = 'payment',
  BLOCKCHAIN = 'blockchain',
  AI_SERVICE = 'ai_service',
  UNKNOWN = 'unknown'
}

/**
 * Parse and categorize errors
 */
export function parseError(error: any): AppError {
  const timestamp = new Date().toISOString();
  
  // Handle network errors
  if (!navigator.onLine) {
    return {
      code: ErrorCategory.NETWORK,
      message: 'No internet connection',
      userMessage: 'You appear to be offline. Please check your internet connection.',
      spiritualMessage: 'Even in disconnection, God remains connected to you.',
      statusCode: 0,
      timestamp
    };
  }

  // Handle fetch/axios errors
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    return {
      code: data?.code || `HTTP_${status}`,
      message: data?.message || error.message,
      userMessage: getUserFriendlyMessage(status, data),
      spiritualMessage: getSpiritualMessage(status),
      statusCode: status,
      details: data?.details,
      requestId: data?.requestId,
      timestamp
    };
  }

  // Handle API errors
  if (error?.statusCode) {
    return {
      code: error.code || `HTTP_${error.statusCode}`,
      message: error.message,
      userMessage: getUserFriendlyMessage(error.statusCode, error),
      spiritualMessage: getSpiritualMessage(error.statusCode),
      statusCode: error.statusCode,
      details: error.details,
      timestamp
    };
  }

  // Handle validation errors
  if (error?.name === 'ValidationError') {
    return {
      code: ErrorCategory.VALIDATION,
      message: error.message,
      userMessage: 'Please check your input and try again.',
      spiritualMessage: 'Attention to detail honors the Lord.',
      statusCode: 400,
      details: error.details,
      timestamp
    };
  }

  // Handle generic errors
  return {
    code: ErrorCategory.UNKNOWN,
    message: error?.message || 'An unexpected error occurred',
    userMessage: 'Something went wrong. Please try again.',
    spiritualMessage: 'Trust in the Lord with all your heart.',
    statusCode: 500,
    timestamp
  };
}

/**
 * Get user-friendly error messages based on status code
 */
function getUserFriendlyMessage(statusCode: number, data?: any): string {
  const customMessage = data?.userMessage || data?.scrollMessage;
  if (customMessage) return customMessage;

  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Please sign in to continue.';
    case 403:
      return 'You don\'t have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 408:
      return 'Request timeout. Please try again.';
    case 409:
      return 'This action conflicts with existing data.';
    case 422:
      return 'The data provided could not be processed.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Our team has been notified.';
    case 502:
      return 'Service temporarily unavailable. Please try again shortly.';
    case 503:
      return 'Service is under maintenance. Please try again later.';
    case 504:
      return 'Request timeout. The server took too long to respond.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Get spiritual encouragement based on error type
 */
function getSpiritualMessage(statusCode: number): string {
  if (statusCode >= 500) {
    return 'The Lord is our refuge and strength, an ever-present help in trouble.';
  }
  if (statusCode === 401 || statusCode === 403) {
    return 'Seek first the kingdom of God and His righteousness.';
  }
  if (statusCode === 404) {
    return 'The Lord guides us on the right path.';
  }
  if (statusCode === 429) {
    return 'Be still and know that I am God.';
  }
  return 'Trust in the Lord with all your heart.';
}

/**
 * Determine error severity
 */
export function getErrorSeverity(error: AppError): ErrorSeverity {
  if (!error.statusCode) return 'error';
  
  if (error.statusCode >= 500) return 'critical';
  if (error.statusCode === 401 || error.statusCode === 403) return 'warning';
  if (error.statusCode === 404) return 'info';
  if (error.statusCode >= 400) return 'error';
  
  return 'info';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: AppError): boolean {
  if (!error.statusCode) return false;
  
  // Network errors are retryable
  if (error.code === ErrorCategory.NETWORK) return true;
  
  // Timeout errors are retryable
  if (error.statusCode === 408 || error.statusCode === 504) return true;
  
  // Server errors are retryable
  if (error.statusCode >= 500) return true;
  
  // Rate limit errors are retryable after delay
  if (error.statusCode === 429) return true;
  
  return false;
}

/**
 * Get retry delay in milliseconds
 */
export function getRetryDelay(attemptNumber: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, attemptNumber), 16000);
}

/**
 * Log error to monitoring service
 */
export async function reportError(error: AppError, context?: any): Promise<void> {
  try {
    // In production, send to monitoring service (e.g., Sentry, LogRocket)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with monitoring service
      console.error('Error reported:', { error, context });
    } else {
      console.error('Error:', error, 'Context:', context);
    }
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError);
  }
}

/**
 * Format error for display
 */
export function formatErrorMessage(error: AppError): string {
  return error.userMessage;
}

/**
 * Create error with context
 */
export function createError(
  message: string,
  code: string = ErrorCategory.UNKNOWN,
  statusCode: number = 500,
  details?: any
): AppError {
  return {
    code,
    message,
    userMessage: message,
    statusCode,
    details,
    timestamp: new Date().toISOString()
  };
}
