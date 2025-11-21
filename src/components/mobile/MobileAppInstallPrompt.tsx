/**
 * Mobile App Install Prompt
 * Prompts users to install the PWA on their mobile device
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Share, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import scrollLogo from '@/assets/scroll-university-logo-optimized.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const MobileAppInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if prompt was dismissed before
    const promptDismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = promptDismissed ? parseInt(promptDismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show prompt if not standalone and not recently dismissed
    if (!standalone && daysSinceDismissed > 7) {
      if (ios) {
        // Show iOS-specific prompt after a delay
        setTimeout(() => setShowPrompt(true), 3000);
      } else {
        // Listen for beforeinstallprompt event (Android/Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
          e.preventDefault();
          setDeferredPrompt(e as BeforeInstallPromptEvent);
          setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
      }
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Install error:', error);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 lg:hidden">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {/* App Icon */}
            <img 
              src={scrollLogo} 
              alt="ScrollUniversity" 
              className="h-12 w-12 rounded-lg flex-shrink-0"
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-sm">Install ScrollUniversity</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get quick access and offline features
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mt-1 -mr-1"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Install Instructions */}
              {isIOS ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Tap <Share className="inline h-3 w-3 mx-1" /> then "Add to Home Screen"
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={handleDismiss}
                  >
                    Got it
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleInstallClick}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </Button>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div className="flex flex-col items-center text-center">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <Download className="h-4 w-4 text-primary" />
                </div>
                <span>Offline Access</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <span>Faster Loading</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <span>Home Screen</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook to check if app is installed
export const useIsAppInstalled = () => {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setIsInstalled(standalone);
  }, []);

  return isInstalled;
};
