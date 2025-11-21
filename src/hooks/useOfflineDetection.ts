/**
 * ScrollUniversity Offline Detection Hook
 * React hook for monitoring network connectivity
 */

import { useState, useEffect } from 'react';
import { getNetworkMonitor, ConnectionStatus, getNetworkInfo, NetworkInfo } from '@/lib/offline-detector';
import { useToast } from './use-toast';

export interface UseOfflineDetectionOptions {
  showToast?: boolean;
  onStatusChange?: (status: ConnectionStatus) => void;
}

export function useOfflineDetection(options: UseOfflineDetectionOptions = {}) {
  const { showToast = true, onStatusChange } = options;
  const { toast } = useToast();
  const [status, setStatus] = useState<ConnectionStatus>('online');
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(getNetworkInfo());
  
  useEffect(() => {
    const monitor = getNetworkMonitor();
    
    // Set initial status
    setStatus(monitor.getStatus());
    
    // Subscribe to status changes
    const unsubscribe = monitor.subscribe((newStatus) => {
      setStatus(newStatus);
      setNetworkInfo(getNetworkInfo());
      
      // Show toast notifications
      if (showToast) {
        if (newStatus === 'offline') {
          toast({
            variant: 'destructive',
            title: '📡 You\'re Offline',
            description: 'No internet connection. Some features may be limited.',
            duration: 10000
          });
        } else if (newStatus === 'online') {
          toast({
            title: '✅ Back Online',
            description: 'Your connection has been restored.',
            duration: 3000
          });
        } else if (newStatus === 'slow') {
          toast({
            variant: 'default',
            title: '🐌 Slow Connection',
            description: 'Your internet connection is slow. Loading may take longer.',
            duration: 5000
          });
        }
      }
      
      // Call custom handler
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    });
    
    return unsubscribe;
  }, [showToast, onStatusChange, toast]);
  
  return {
    isOnline: status === 'online',
    isOffline: status === 'offline',
    isSlow: status === 'slow',
    status,
    networkInfo
  };
}
