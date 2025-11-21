/**
 * Mobile Features Demo Page
 * Demonstrates all mobile responsiveness features
 */

import React, { useState } from 'react';
import {
  MobileOptimizedLayout,
  MobileCardGrid,
  MobileTabs,
  MobileListItem,
  MobileVideoPlayer,
  PullToRefresh,
} from '@/components/mobile';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  Tablet,
  Monitor,
  Hand,
  Video,
  RefreshCw,
  Download,
  Zap,
  ChevronRight,
  Home,
  BookOpen,
  Users,
  Settings,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  triggerHapticFeedback,
  copyToClipboard,
  shareContent,
  isInstalledPWA,
} from '@/lib/mobile-utils';

export const MobileFeaturesDemo: React.FC = () => {
  const { toast } = useToast();
  const detection = useMobileDetection();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshCount, setRefreshCount] = useState(0);

  // Touch gestures demo
  const touchGestures = useTouchGestures({
    onSwipeLeft: () => {
      toast({ title: 'Swiped Left!' });
      triggerHapticFeedback('light');
    },
    onSwipeRight: () => {
      toast({ title: 'Swiped Right!' });
      triggerHapticFeedback('light');
    },
    onDoubleTap: () => {
      toast({ title: 'Double Tapped!' });
      triggerHapticFeedback('medium');
    },
    onLongPress: () => {
      toast({ title: 'Long Pressed!' });
      triggerHapticFeedback('heavy');
    },
  });

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshCount(prev => prev + 1);
    toast({ title: 'Refreshed!', description: `Refresh count: ${refreshCount + 1}` });
  };

  const handleCopy = async () => {
    const success = await copyToClipboard('ScrollUniversity Mobile Features');
    if (success) {
      toast({ title: 'Copied to clipboard!' });
      triggerHapticFeedback('light');
    }
  };

  const handleShare = async () => {
    const success = await shareContent({
      title: 'ScrollUniversity',
      text: 'Check out these amazing mobile features!',
      url: window.location.href,
    });
    if (success) {
      toast({ title: 'Shared successfully!' });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Home className="h-4 w-4" /> },
    { id: 'gestures', label: 'Gestures', icon: <Hand className="h-4 w-4" /> },
    { id: 'video', label: 'Video', icon: <Video className="h-4 w-4" /> },
    { id: 'components', label: 'Components', icon: <BookOpen className="h-4 w-4" /> },
  ];

  return (
    <MobileOptimizedLayout
      title="Mobile Features Demo"
      subtitle="Explore all mobile capabilities"
      showBackButton
      headerActions={
        <Button size="sm" variant="outline" onClick={handleShare}>
          Share
        </Button>
      }
    >
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Tabs */}
          <MobileTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-4 space-y-4">
              {/* Device Detection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {detection.isMobile && <Smartphone className="h-5 w-5" />}
                    {detection.isTablet && <Tablet className="h-5 w-5" />}
                    {detection.isDesktop && <Monitor className="h-5 w-5" />}
                    <span>Device Detection</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Device Type:</span>
                    <Badge>
                      {detection.isMobile && 'Mobile'}
                      {detection.isTablet && 'Tablet'}
                      {detection.isDesktop && 'Desktop'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Touch Device:</span>
                    <Badge variant={detection.isTouchDevice ? 'default' : 'secondary'}>
                      {detection.isTouchDevice ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Orientation:</span>
                    <Badge>{detection.orientation}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Screen Size:</span>
                    <Badge>{detection.screenSize}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">PWA Installed:</span>
                    <Badge variant={isInstalledPWA() ? 'default' : 'secondary'}>
                      {isInstalledPWA() ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Features Grid */}
              <MobileCardGrid columns={2} gap="md">
                <Card className="touch-feedback cursor-pointer" onClick={handleCopy}>
                  <CardContent className="p-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">Copy Text</h3>
                    <p className="text-xs text-muted-foreground mt-1">Tap to copy</p>
                  </CardContent>
                </Card>

                <Card className="touch-feedback cursor-pointer" onClick={handleShare}>
                  <CardContent className="p-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">Share</h3>
                    <p className="text-xs text-muted-foreground mt-1">Tap to share</p>
                  </CardContent>
                </Card>

                <Card className="touch-feedback cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <RefreshCw className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">Pull to Refresh</h3>
                    <p className="text-xs text-muted-foreground mt-1">Pull down</p>
                  </CardContent>
                </Card>

                <Card className="touch-feedback cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Download className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">Install PWA</h3>
                    <p className="text-xs text-muted-foreground mt-1">Add to home</p>
                  </CardContent>
                </Card>
              </MobileCardGrid>
            </div>
          )}

          {/* Gestures Tab */}
          {activeTab === 'gestures' && (
            <div className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Touch Gestures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    {...touchGestures}
                    className="h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center border-2 border-dashed border-primary/20"
                  >
                    <div className="text-center p-6">
                      <Hand className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Try These Gestures:</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Swipe left or right</li>
                        <li>• Double tap</li>
                        <li>• Long press</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Haptic Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => triggerHapticFeedback('light')}
                  >
                    Light Feedback
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => triggerHapticFeedback('medium')}
                  >
                    Medium Feedback
                  </Button>
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => triggerHapticFeedback('heavy')}
                  >
                    Heavy Feedback
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Video Tab */}
          {activeTab === 'video' && (
            <div className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mobile Video Player</CardTitle>
                </CardHeader>
                <CardContent>
                  <MobileVideoPlayer
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                    poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
                    title="Sample Video"
                    onProgress={(progress) => console.log('Progress:', progress)}
                    onComplete={() => toast({ title: 'Video completed!' })}
                  />
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <p>• Double-tap to play/pause</p>
                    <p>• Swipe left to skip backward</p>
                    <p>• Swipe right to skip forward</p>
                    <p>• Tap to show/hide controls</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Components Tab */}
          {activeTab === 'components' && (
            <div className="space-y-4">
              <div className="p-4">
                <h3 className="font-semibold mb-2">Mobile List Items</h3>
              </div>
              
              <MobileListItem
                title="Dashboard"
                subtitle="View your overview"
                icon={<Home className="h-5 w-5 text-primary" />}
                badge="New"
                onClick={() => toast({ title: 'Dashboard clicked' })}
                rightContent={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
              />

              <MobileListItem
                title="Courses"
                subtitle="Browse available courses"
                icon={<BookOpen className="h-5 w-5 text-primary" />}
                badge={12}
                onClick={() => toast({ title: 'Courses clicked' })}
                rightContent={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
              />

              <MobileListItem
                title="Community"
                subtitle="Connect with students"
                icon={<Users className="h-5 w-5 text-primary" />}
                onClick={() => toast({ title: 'Community clicked' })}
                rightContent={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
              />

              <MobileListItem
                title="Settings"
                subtitle="Manage your preferences"
                icon={<Settings className="h-5 w-5 text-primary" />}
                onClick={() => toast({ title: 'Settings clicked' })}
                rightContent={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
              />
            </div>
          )}
        </div>
      </PullToRefresh>
    </MobileOptimizedLayout>
  );
};

export default MobileFeaturesDemo;
