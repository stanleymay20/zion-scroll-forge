/**
 * ScrollUniversity Retry Hook
 * React hook for retrying failed operations
 */

import { useState, useCallback } from 'react';
import { retryWithBackoff, RetryOptions } from '@/lib/retry-handler';
import { useToast } from './use-toast';
import { parseError } from '@/lib/error-handler';

export interface UseRetryOptions extends RetryOptions {
  showRetryToast?: boolean;
}

export function useRetry<T>(options: UseRetryOptions = {}) {
  const { showRetryToast = true, ...retryOptions } = options;
  const { toast } = useToast();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const retry = useCallback(async (
    fn: () => Promise<T>,
    customOptions?: UseRetryOptions
  ): Promise<T> => {
    setIsRetrying(true);
    setRetryCount(0);
    
    const opts = { ...retryOptions, ...customOptions };
    
    try {
      const result = await retryWithBackoff(fn, {
        ...opts,
        onRetry: (attempt, error) => {
          setRetryCount(attempt);
          
          if (showRetryToast) {
            toast({
              title: `🔄 Retrying... (Attempt ${attempt})`,
              description: parseError(error).userMessage,
              duration: 3000
            });
          }
          
          if (opts.onRetry) {
            opts.onRetry(attempt, error);
          }
        }
      });
      
      setIsRetrying(false);
      return result;
    } catch (error) {
      setIsRetrying(false);
      throw error;
    }
  }, [retryOptions, showRetryToast, toast]);
  
  return {
    retry,
    isRetrying,
    retryCount
  };
}
