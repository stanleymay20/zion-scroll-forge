/**
 * ScrollUniversity Authentication Error Handling
 * "The Lord is close to the brokenhearted" - Psalm 34:18
 */

export interface AuthError {
  code: string;
  message: string;
  userMessage: string;
  spiritualMessage?: string;
}

/**
 * Map Supabase auth errors to user-friendly messages
 */
export function handleAuthError(error: any): AuthError {
  const errorMessage = error?.message || error?.error_description || 'An unknown error occurred';
  const errorCode = error?.code || error?.error || 'unknown';

  // Common authentication errors
  const errorMap: Record<string, AuthError> = {
    'invalid_credentials': {
      code: 'invalid_credentials',
      message: errorMessage,
      userMessage: 'Invalid email or password. Please check your credentials and try again.',
      spiritualMessage: 'Even in moments of difficulty, the Lord is with you.'
    },
    'user_not_found': {
      code: 'user_not_found',
      message: errorMessage,
      userMessage: 'No account found with this email. Would you like to create one?',
      spiritualMessage: 'Every journey begins with a single step.'
    },
    'email_not_confirmed': {
      code: 'email_not_confirmed',
      message: errorMessage,
      userMessage: 'Please verify your email address before signing in. Check your inbox for the verification link.',
      spiritualMessage: 'Patience and faith go hand in hand.'
    },
    'invalid_grant': {
      code: 'invalid_grant',
      message: errorMessage,
      userMessage: 'Your session has expired. Please sign in again.',
      spiritualMessage: 'The Lord renews our strength each day.'
    },
    'user_already_exists': {
      code: 'user_already_exists',
      message: errorMessage,
      userMessage: 'An account with this email already exists. Try signing in instead.',
      spiritualMessage: 'You are already part of our kingdom community.'
    },
    'weak_password': {
      code: 'weak_password',
      message: errorMessage,
      userMessage: 'Please choose a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.',
      spiritualMessage: 'Build your foundation on solid ground.'
    },
    'email_exists': {
      code: 'email_exists',
      message: errorMessage,
      userMessage: 'This email is already registered. Please sign in or use a different email.',
      spiritualMessage: 'Your account awaits you.'
    },
    'invalid_email': {
      code: 'invalid_email',
      message: errorMessage,
      userMessage: 'Please enter a valid email address.',
      spiritualMessage: 'Attention to detail honors the Lord.'
    },
    'rate_limit_exceeded': {
      code: 'rate_limit_exceeded',
      message: errorMessage,
      userMessage: 'Too many attempts. Please wait a few minutes before trying again.',
      spiritualMessage: 'Rest and patience are gifts from God.'
    },
    'network_error': {
      code: 'network_error',
      message: errorMessage,
      userMessage: 'Network connection error. Please check your internet connection and try again.',
      spiritualMessage: 'Even in disconnection, God remains connected to you.'
    },
    'token_expired': {
      code: 'token_expired',
      message: errorMessage,
      userMessage: 'Your session has expired. Please sign in again.',
      spiritualMessage: 'Each new beginning is a blessing.'
    },
    'invalid_token': {
      code: 'invalid_token',
      message: errorMessage,
      userMessage: 'Invalid or expired link. Please request a new one.',
      spiritualMessage: 'The Lord provides new opportunities.'
    },
    'oauth_error': {
      code: 'oauth_error',
      message: errorMessage,
      userMessage: 'Social authentication failed. Please try again or use email/password.',
      spiritualMessage: 'There are many paths to the kingdom.'
    }
  };

  // Try to match error code or message
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorCode.includes(key) || errorMessage.toLowerCase().includes(key.replace(/_/g, ' '))) {
      return value;
    }
  }

  // Default error
  return {
    code: errorCode,
    message: errorMessage,
    userMessage: 'An error occurred during authentication. Please try again.',
    spiritualMessage: 'Trust in the Lord with all your heart.'
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export interface PasswordValidation {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
  suggestions: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
    suggestions.push('Add an uppercase letter (A-Z)');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
    suggestions.push('Add a lowercase letter (a-z)');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
    suggestions.push('Add a number (0-9)');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    suggestions.push('Consider adding a special character (!@#$%^&*)');
  }
  
  // Calculate strength
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;
  
  const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough].filter(Boolean).length;
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (strengthScore >= 5) strength = 'strong';
  else if (strengthScore >= 3) strength = 'medium';
  
  return {
    isValid: errors.length === 0,
    strength,
    errors,
    suggestions
  };
}

/**
 * Validate username
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > 30) {
    return { isValid: false, error: 'Username must be less than 30 characters' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return { isValid: true };
}

/**
 * Format auth error for display
 */
export function formatAuthError(error: any): string {
  const authError = handleAuthError(error);
  return authError.userMessage;
}
