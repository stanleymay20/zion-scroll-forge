import { useState, useEffect, useCallback } from 'react';
import {
  registerServiceWorker,
  updateServiceWorker,
  skipWaiting,
  isPWA,
  isOnline,
  setupConnectionListeners,
  requestNotificationPermission,
  subscribeToPushNotifications,
  getStorageEstimate,
  requestPersistentStorage,
  registerBackgroundSync
} from '@/lib/pwa-utils';

export interface PWAState {
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  canInstall: boolean;
  notificationPermission: NotificationPermission;
  storageUsage: number;
  storageQuota: number;
}

export interface PWAActions {
  installApp: () => Promise<void>;
  updateApp: () => void;
  requestNotifications: () => Promise<NotificationPermission>;
  syncOfflineData: () => Promise<void>;
  checkStorage: () => Promise<void>;
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstalled: isPWA(),
    isOnline: isOnline(),
    isUpdateAvailable: false,
    canInstall: false,
    notificationPermission: 'default',
    storageUsage: 0,
    storageQuota: 0
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Initialize PWA
  useEffect(() => {
    // Register service worker
    registerServiceWorker({
      onSuccess: (reg) => {
        console.log('Service Worker registered');
        setRegistration(reg);
      },
      onUpdate: (reg) => {
        console.log('Service Worker update available');
        setState(prev => ({ ...prev, isUpdateAvailable: true }));
        setRegistration(reg);
      },
      onOnline: () => {
        setState(prev => ({ ...prev, isOnline: true }));
      },
      onOffline: () => {
        setState(prev => ({ ...prev, isOnline: false }));
      }
    });

    // Setup connection listeners
    const cleanup = setupConnectionListeners({
      onOnline: () => setState(prev => ({ ...prev, isOnline: true })),
      onOffline: () => setState(prev => ({ ...prev, isOnline: false }))
    });

    // Check notification permission
    if ('Notification' in window) {
      setState(prev => ({
        ...prev,
        notificationPermission: Notification.permission
      }));
    }

    // Request persistent storage
    requestPersistentStorage();

    return cleanup;
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setState(prev => ({ ...prev, canInstall: true }));
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setState(prev => ({ ...prev, canInstall: false, isInstalled: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Check storage periodically
  useEffect(() => {
    const checkStorageUsage = async () => {
      const estimate = await getStorageEstimate();
      if (estimate) {
        setState(prev => ({
          ...prev,
          storageUsage: estimate.usage || 0,
          storageQuota: estimate.quota || 0
        }));
      }
    };

    checkStorageUsage();
    const interval = setInterval(checkStorageUsage, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Install app
  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('Install prompt not available');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('Install prompt outcome:', outcome);
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setState(prev => ({ ...prev, canInstall: false }));
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
    }
  }, [deferredPrompt]);

  // Update app
  const updateApp = useCallback(() => {
    if (registration && registration.waiting) {
      skipWaiting();
      window.location.reload();
    } else {
      updateServiceWorker();
    }
  }, [registration]);

  // Request notifications
  const requestNotifications = useCallback(async (): Promise<NotificationPermission> => {
    const permission = await requestNotificationPermission();
    setState(prev => ({ ...prev, notificationPermission: permission }));
    
    if (permission === 'granted') {
      await subscribeToPushNotifications();
    }
    
    return permission;
  }, []);

  // Sync offline data
  const syncOfflineData = useCallback(async () => {
    if (!state.isOnline) {
      console.warn('Cannot sync while offline');
      return;
    }

    try {
      await registerBackgroundSync('sync-offline-data');
      console.log('Offline data sync initiated');
    } catch (error) {
      console.error('Offline data sync failed:', error);
    }
  }, [state.isOnline]);

  // Check storage
  const checkStorage = useCallback(async () => {
    const estimate = await getStorageEstimate();
    if (estimate) {
      setState(prev => ({
        ...prev,
        storageUsage: estimate.usage || 0,
        storageQuota: estimate.quota || 0
      }));
    }
  }, []);

  const actions: PWAActions = {
    installApp,
    updateApp,
    requestNotifications,
    syncOfflineData,
    checkStorage
  };

  return {
    ...state,
    ...actions,
    storagePercentage: state.storageQuota > 0 
      ? (state.storageUsage / state.storageQuota) * 100 
      : 0
  };
}
