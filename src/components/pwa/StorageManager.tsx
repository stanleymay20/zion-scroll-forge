import React from 'react';
import { HardDrive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePWA } from '@/hooks/usePWA';
import { clearAllCaches } from '@/lib/pwa-utils';

export function StorageManager() {
  const { storageUsage, storageQuota, storagePercentage, checkStorage } = usePWA();

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleClearCache = async () => {
    if (confirm('Are you sure you want to clear all cached data? This will remove offline content.')) {
      await clearAllCaches();
      await checkStorage();
      window.location.reload();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="w-5 h-5" />
          Storage Management
        </CardTitle>
        <CardDescription>
          Manage your offline storage and cached content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Storage Used</span>
            <span className="font-medium">
              {formatBytes(storageUsage)} / {formatBytes(storageQuota)}
            </span>
          </div>
          <Progress value={storagePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {storagePercentage.toFixed(1)}% of available storage used
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Cached Content</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Course videos and materials</li>
            <li>• Lecture notes and slides</li>
            <li>• Prayer journal entries</li>
            <li>• Scripture memory verses</li>
            <li>• Community posts</li>
          </ul>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleClearCache}
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All Cached Data
        </Button>

        <p className="text-xs text-muted-foreground">
          Clearing cache will remove all offline content. You'll need to re-download content for offline access.
        </p>
      </CardContent>
    </Card>
  );
}
