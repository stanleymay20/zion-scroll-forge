/**
 * ScrollUniversity Retry Button
 * Button with built-in retry logic
 */

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { RefreshCcw, Loader2 } from 'lucide-react';
import { useRetry } from '@/hooks/useRetry';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export interface RetryButtonProps extends Omit<ButtonProps, 'onClick'> {
  onRetry: () => Promise<void>;
  maxAttempts?: number;
  showRetryCount?: boolean;
  retryText?: string;
  retryingText?: string;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  maxAttempts = 3,
  showRetryCount = true,
  retryText = 'Retry',
  retryingText = 'Retrying...',
  children,
  ...buttonProps
}) => {
  const { retry, isRetrying, retryCount } = useRetry({ maxAttempts });
  const { handleError } = useErrorHandler();
  
  const handleClick = async () => {
    try {
      await retry(onRetry);
    } catch (error) {
      handleError(error);
    }
  };
  
  return (
    <Button
      onClick={handleClick}
      disabled={isRetrying}
      {...buttonProps}
    >
      {isRetrying ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {retryingText}
          {showRetryCount && retryCount > 0 && ` (${retryCount}/${maxAttempts})`}
        </>
      ) : (
        <>
          <RefreshCcw className="h-4 w-4 mr-2" />
          {children || retryText}
        </>
      )}
    </Button>
  );
};
