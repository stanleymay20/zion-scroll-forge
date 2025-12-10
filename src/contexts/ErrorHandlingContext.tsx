/**
 * ScrollUniversity Error Handling Context
 * Global error handling state and utilities
 */

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { parseError, reportError, AppError, isRetryableError } from '@/lib/error-handler';
import { retryWithBackoff } from '@/lib/retry-handler';
import { OfflineIndicator } from '@/components/error/OfflineIndicator';
import { LoadingOverlay } from '@/components/error/LoadingOverlay';

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
  showOfflineIndicator?: boolean;
  showLoadingOverlay?: boolean;
}

export const ErrorHandlingProvider: React.FC<ErrorHandlingProviderProps> = ({
  children,
  showOfflineIndicator = true,
  showLoadingOverlay = true
}) => {
  const { toast } = useToast();
  
  const handleError = useCallback((error: any, context?: any): AppError => {
    const appError = parseError(error);
    
    // Report to monitoring
    reportError(appError, context);
    
    // Show toast
    toast({
      variant: 'destructive',
      title: '❌ Error',
      description: appError.userMessage,
      duration: 5000
    });
    
    // Show spiritual message if available
    if (appError.spiritualMessage) {
      setTimeout(() => {
        toast({
          title: '✝️ Encouragement',
          description: appError.spiritualMessage,
          duration: 7000
        });
      }, 500);
    }
    
    return appError;
  }, [toast]);
  
  const handleErrorWithRetry = useCallback(async <T,>(
    fn: () => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T> => {
    try {
      return await retryWithBackoff(fn, {
        maxAttempts,
        onRetry: (attempt, error) => {
          toast({
            title: `🔄 Retrying... (Attempt ${attempt}/${maxAttempts})`,
            description: error.userMessage,
            duration: 3000
          });
        }
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [toast, handleError]);
  
  const showError = useCallback((message: string, spiritualMessage?: string) => {
    toast({
      variant: 'destructive',
      title: '❌ Error',
      description: message,
      duration: 5000
    });
    
    if (spiritualMessage) {
      setTimeout(() => {
        toast({
          title: '✝️ Encouragement',
          description: spiritualMessage,
          duration: 7000
        });
      }, 500);
    }
  }, [toast]);
  
  const showSuccess = useCallback((message: string) => {
    toast({
      title: '✅ Success',
      description: message,
      duration: 3000
    });
  }, [toast]);
  
  const showWarning = useCallback((message: string) => {
    toast({
      variant: 'default',
      title: '⚠️ Warning',
      description: message,
      duration: 4000
    });
  }, [toast]);
  
  const showInfo = useCallback((message: string) => {
    toast({
      title: 'ℹ️ Info',
      description: message,
      duration: 3000
    });
  }, [toast]);
  
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
      {showOfflineIndicator && <OfflineIndicator />}
      {showLoadingOverlay && <LoadingOverlay />}
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
