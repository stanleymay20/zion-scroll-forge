/**
 * ScrollUniversity Error Handler Hook
 * React hook for comprehensive error handling
 */

import { useCallback } from 'react';
import { useToast } from './use-toast';
import { parseError, reportError, AppError, getErrorSeverity } from '@/lib/error-handler';

export interface UseErrorHandlerOptions {
  showToast?: boolean;
  reportToMonitoring?: boolean;
  onError?: (error: AppError) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { toast } = useToast();
  const {
    showToast = true,
    reportToMonitoring = true,
    onError
  } = options;
  
  const handleError = useCallback((error: any, context?: any) => {
    const appError = parseError(error);
    const severity = getErrorSeverity(appError);
    
    // Report to monitoring service
    if (reportToMonitoring) {
      reportError(appError, context);
    }
    
    // Show toast notification
    if (showToast) {
      toast({
        variant: severity === 'critical' || severity === 'error' ? 'destructive' : 'default',
        title: getToastTitle(severity),
        description: appError.userMessage,
        duration: severity === 'critical' ? 10000 : 5000
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
    }
    
    // Call custom error handler
    if (onError) {
      onError(appError);
    }
    
    return appError;
  }, [toast, showToast, reportToMonitoring, onError]);
  
  return { handleError };
}

function getToastTitle(severity: string): string {
  switch (severity) {
    case 'critical':
      return '🚨 Critical Error';
    case 'error':
      return '❌ Error';
    case 'warning':
      return '⚠️ Warning';
    case 'info':
      return 'ℹ️ Notice';
    default:
      return 'Error';
  }
}
