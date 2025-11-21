/**
 * ScrollUniversity Error Display
 * Reusable error display component
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { AppError } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

export interface ErrorDisplayProps {
  error: AppError | Error | string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  showDetails?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onGoHome,
  className,
  showDetails = false
}) => {
  // Parse error
  const appError: AppError = typeof error === 'string'
    ? {
        code: 'UNKNOWN',
        message: error,
        userMessage: error,
        timestamp: new Date().toISOString()
      }
    : 'userMessage' in error
    ? error
    : {
        code: 'UNKNOWN',
        message: error.message,
        userMessage: error.message,
        timestamp: new Date().toISOString()
      };
  
  return (
    <div className={cn('space-y-4', className)}>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {appError.userMessage}
        </AlertDescription>
      </Alert>
      
      {appError.spiritualMessage && (
        <Alert className="border-primary/50 bg-primary/5">
          <AlertTitle className="text-primary">✝️ Encouragement</AlertTitle>
          <AlertDescription className="text-primary/90">
            {appError.spiritualMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {showDetails && appError.details && (
        <Alert>
          <AlertTitle>Details</AlertTitle>
          <AlertDescription>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(appError.details, null, 2)}
            </pre>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex gap-2">
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        
        {onGoHome && (
          <Button onClick={onGoHome} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
};
