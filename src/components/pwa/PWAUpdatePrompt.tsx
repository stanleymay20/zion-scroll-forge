import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

export function PWAUpdatePrompt() {
  const { isUpdateAvailable, updateApp } = usePWA();

  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
      <Card className="p-4 shadow-lg border-2 border-blue-500/20 bg-gradient-to-br from-white to-blue-500/5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-blue-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              Update Available
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              A new version of ScrollUniversity is available. Update now to get the latest features and improvements.
            </p>
            
            <Button
              size="sm"
              onClick={updateApp}
              className="w-full"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Update Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
