/**
 * ScrollUniversity Loading State Hook
 * React hook for managing loading states
 */

import { useState, useEffect, useCallback } from 'react';
import { loadingManager, LoadingKey, LoadingState } from '@/lib/loading-manager';

export function useLoadingState(key?: LoadingKey) {
  const [loadingStates, setLoadingStates] = useState<Map<LoadingKey, LoadingState>>(
    loadingManager.getAllStates()
  );
  
  useEffect(() => {
    const unsubscribe = loadingManager.subscribe(setLoadingStates);
    return unsubscribe;
  }, []);
  
  const startLoading = useCallback((loadingKey: LoadingKey, message?: string, operation?: string) => {
    loadingManager.start(loadingKey, message, operation);
  }, []);
  
  const stopLoading = useCallback((loadingKey: LoadingKey) => {
    loadingManager.stop(loadingKey);
  }, []);
  
  const updateProgress = useCallback((loadingKey: LoadingKey, progress: number, message?: string) => {
    loadingManager.updateProgress(loadingKey, progress, message);
  }, []);
  
  // If a specific key is provided, return its state
  if (key) {
    const state = loadingStates.get(key);
    return {
      isLoading: !!state?.isLoading,
      message: state?.message,
      progress: state?.progress,
      operation: state?.operation,
      startLoading: (message?: string, operation?: string) => startLoading(key, message, operation),
      stopLoading: () => stopLoading(key),
      updateProgress: (progress: number, message?: string) => updateProgress(key, progress, message)
    };
  }
  
  // Otherwise return all states
  return {
    loadingStates,
    isAnyLoading: loadingManager.isAnyLoading(),
    startLoading,
    stopLoading,
    updateProgress
  };
}
