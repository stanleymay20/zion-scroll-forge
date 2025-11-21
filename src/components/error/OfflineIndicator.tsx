/**
 * ScrollUniversity Offline Indicator
 * Visual indicator for offline status
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WifiOff, Wifi, WifiLow } from 'lucide-react';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { cn } from '@/lib/utils';

export interface OfflineIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className,
  showWhenOnline = false
}) => {
  const { status, isOnline, isOffline, isSlow } = useOfflineDetection({
    showToast: false // Don't show toast, we're showing the indicator
  });
  
  // Don't show anything if online and showWhenOnline is false
  if (isOnline && !showWhenOnline) {
    return null;
  }
  
  return (
    <div className={cn('fixed top-16 left-0 right-0 z-50 px-4', className)}>
      {isOffline && (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>You're Offline</AlertTitle>
          <AlertDescription>
            No internet connection detected. Some features may be limited until you reconnect.
            <br />
            <span className="text-xs italic mt-1 block">
              ✝️ "Even in disconnection, God remains connected to you."
            </span>
          </AlertDescription>
        </Alert>
      )}
      
      {isSlow && (
        <Alert className="max-w-2xl mx-auto border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <WifiLow className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900 dark:text-yellow-100">
            Slow Connection
          </AlertTitle>
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Your internet connection is slow. Loading may take longer than usual.
            <br />
            <span className="text-xs italic mt-1 block">
              ✝️ "Be still and know that I am God." - Psalm 46:10
            </span>
          </AlertDescription>
        </Alert>
      )}
      
      {isOnline && showWhenOnline && (
        <Alert className="max-w-2xl mx-auto border-green-500 bg-green-50 dark:bg-green-950">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900 dark:text-green-100">
            Connected
          </AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200">
            You're back online. All features are available.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
