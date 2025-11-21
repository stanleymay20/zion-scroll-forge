import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

export function OfflineIndicator() {
  const { isOnline, syncOfflineData } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // Show "back online" message briefly
      setShowBanner(true);
      const timer = setTimeout(() => {
        setShowBanner(false);
        setWasOffline(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncOfflineData();
    } finally {
      setIsSyncing(false);
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-yellow-500 text-gray-900'
      }`}
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Back online! Your data is syncing...
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">
                  You're offline. Some features may be limited.
                </span>
              </>
            )}
          </div>

          {isOnline && wasOffline && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSync}
              disabled={isSyncing}
              className="text-white hover:bg-white/20"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Sync Now
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
