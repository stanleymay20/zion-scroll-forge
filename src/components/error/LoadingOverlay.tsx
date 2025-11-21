/**
 * ScrollUniversity Loading Overlay
 * Global loading indicator with progress
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLoadingState } from '@/hooks/useLoadingState';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export interface LoadingOverlayProps {
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ className }) => {
  const { loadingStates, isAnyLoading } = useLoadingState();
  
  if (!isAnyLoading) {
    return null;
  }
  
  // Get the first loading state (or combine multiple)
  const states = Array.from(loadingStates.values());
  const primaryState = states[0];
  const hasProgress = primaryState?.progress !== undefined;
  
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
        'flex items-center justify-center',
        className
      )}
    >
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          
          {primaryState?.message && (
            <p className="text-center text-sm font-medium">
              {primaryState.message}
            </p>
          )}
          
          {hasProgress && (
            <div className="w-full space-y-2">
              <Progress value={primaryState.progress} className="w-full" />
              <p className="text-xs text-center text-muted-foreground">
                {Math.round(primaryState.progress || 0)}% complete
              </p>
            </div>
          )}
          
          {states.length > 1 && (
            <p className="text-xs text-muted-foreground">
              {states.length} operations in progress
            </p>
          )}
          
          <p className="text-xs text-center text-muted-foreground italic">
            ✝️ "Wait for the Lord; be strong and take heart" - Psalm 27:14
          </p>
        </div>
      </div>
    </div>
  );
};
