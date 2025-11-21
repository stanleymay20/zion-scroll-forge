/**
 * ScrollUniversity Retry Handler
 * Automatic retry logic for failed requests
 * "Let us not become weary in doing good" - Galatians 6:9
 */

import { isRetryableError, getRetryDelay, parseError, AppError } from './error-handler';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: AppError) => void;
  shouldRetry?: (error: AppError) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 16000,
  backoffMultiplier: 2,
  onRetry: () => {},
  shouldRetry: isRetryableError
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: AppError | null = null;
  
  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = parseError(error);
      
      // Check if we should retry
      if (!opts.shouldRetry(lastError)) {
        throw lastError;
      }
      
      // Check if we've exhausted attempts
      if (attempt === opts.maxAttempts - 1) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelay
      );
      
      // Notify about retry
      opts.onRetry(attempt + 1, lastError);
      
      // Wait before retrying
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Retry a fetch request
 */
export async function retryFetch(
  url: string,
  init?: RequestInit,
  options?: RetryOptions
): Promise<Response> {
  return retryWithBackoff(
    async () => {
      const response = await fetch(url, init);
      
      // Throw error for non-OK responses
      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}`);
        error.response = response;
        error.statusCode = response.status;
        throw error;
      }
      
      return response;
    },
    options
  );
}

/**
 * Retry an async operation with circuit breaker pattern
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private resetTimeout: number = 30000 // 30 seconds
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'open';
    }
  }
  
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;
    return Date.now() - this.lastFailureTime >= this.resetTimeout;
  }
  
  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }
  
  reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'closed';
  }
}

/**
 * Create a circuit breaker for a specific service
 */
export function createCircuitBreaker(
  threshold: number = 5,
  timeout: number = 60000,
  resetTimeout: number = 30000
): CircuitBreaker {
  return new CircuitBreaker(threshold, timeout, resetTimeout);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with jitter to prevent thundering herd
 */
export function getRetryDelayWithJitter(attempt: number, baseDelay: number = 1000): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // Add up to 1 second of jitter
  return Math.min(exponentialDelay + jitter, 16000);
}
