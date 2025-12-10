/**
 * ScrollUniversity Error Handling Context
 * Global error handling state and utilities
 * Uses sonner toast to avoid circular dependency with use-toast hook
 */

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { parseError, reportError, AppError } from '@/lib/error-handler';
import { retryWithBackoff } from '@/lib/retry-handler';

interface ErrorHandlingContextValue {
  handleError: (error: any, context?: any) => AppError;
  handleErrorWithRetry: <T>(fn: () => Promise<T>, maxAttempts?: number) => Promise<T>;
  showError: (message: string, spiritualMessage?: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ErrorHandlingContext = createContext<ErrorHandlingContextValue | undefined>(undefined);

export interface ErrorHandlingProviderProps {
  children: ReactNode;
}

export const ErrorHandlingProvider: React.FC<ErrorHandlingProviderProps> = ({
  children
}) => {
  const handleError = useCallback((error: any, context?: any): AppError => {
    const appError = parseError(error);
    
    // Report to monitoring
    reportError(appError, context);
    
    // Show toast
    toast.error(appError.userMessage, {
      duration: 5000,
      description: '❌ Error'
    });
    
    // Show spiritual message if available
    if (appError.spiritualMessage) {
      setTimeout(() => {
        toast.info(appError.spiritualMessage, {
          duration: 7000,
          description: '✝️ Encouragement'
        });
      }, 500);
    }
    
    return appError;
  }, []);
  
  const handleErrorWithRetry = useCallback(async <T,>(
    fn: () => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T> => {
    try {
      return await retryWithBackoff(fn, {
        maxAttempts,
        onRetry: (attempt, error) => {
          toast.loading(`Retrying... (Attempt ${attempt}/${maxAttempts})`, {
            description: error.userMessage,
            duration: 3000
          });
        }
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);
  
  const showError = useCallback((message: string, spiritualMessage?: string) => {
    toast.error(message, {
      duration: 5000
    });
    
    if (spiritualMessage) {
      setTimeout(() => {
        toast.info(spiritualMessage, {
          duration: 7000,
          description: '✝️ Encouragement'
        });
      }, 500);
    }
  }, []);
  
  const showSuccess = useCallback((message: string) => {
    toast.success(message, {
      duration: 3000
    });
  }, []);
  
  const showWarning = useCallback((message: string) => {
    toast.warning(message, {
      duration: 4000
    });
  }, []);
  
  const showInfo = useCallback((message: string) => {
    toast.info(message, {
      duration: 3000
    });
  }, []);
  
  const value: ErrorHandlingContextValue = {
    handleError,
    handleErrorWithRetry,
    showError,
    showSuccess,
    showWarning,
    showInfo
  };
  
  return (
    <ErrorHandlingContext.Provider value={value}>
      {children}
    </ErrorHandlingContext.Provider>
  );
};

export function useErrorHandling(): ErrorHandlingContextValue {
  const context = useContext(ErrorHandlingContext);
  
  if (!context) {
    throw new Error('useErrorHandling must be used within ErrorHandlingProvider');
  }
  
  return context;
}
