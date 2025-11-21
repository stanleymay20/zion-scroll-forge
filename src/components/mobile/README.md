# Mobile Responsiveness Components

This directory contains mobile-optimized components and utilities for ScrollUniversity's responsive design system.

## Components

### MobileVideoPlayer
Touch-friendly video player with mobile-specific controls.

**Features:**
- Touch gestures (double-tap to play/pause, swipe to skip)
- Auto-hiding controls
- Fullscreen support
- Playback speed control
- Volume control
- Progress tracking

**Usage:**
```tsx
import { MobileVideoPlayer } from '@/components/mobile';

<MobileVideoPlayer
  src="/path/to/video.mp4"
  poster="/path/to/poster.jpg"
  title="Lecture Title"
  onProgress={(progress) => console.log(progress)}
  onComplete={() => console.log('Video completed')}
/>
```

### PullToRefresh
Implements pull-to-refresh functionality for mobile devices.

**Features:**
- Native-like pull-to-refresh experience
- Customizable threshold
- Loading indicator
- Smooth animations

**Usage:**
```tsx
import { PullToRefresh } from '@/components/mobile';

<PullToRefresh
  onRefresh={async () => {
    await fetchNewData();
  }}
  threshold={80}
>
  <YourContent />
</PullToRefresh>
```

### MobileAppInstallPrompt
Prompts users to install the PWA on their mobile device.

**Features:**
- Auto-detection of installation status
- Platform-specific instructions (iOS/Android)
- Dismissible with timeout
- Feature highlights

**Usage:**
```tsx
import { MobileAppInstallPrompt } from '@/components/mobile';

// Add to your app root
<MobileAppInstallPrompt />

// Check if app is installed
import { useIsAppInstalled } from '@/components/mobile';

const isInstalled = useIsAppInstalled();
```

### MobileOptimizedLayout
Provides mobile-specific layout patterns for complex pages.

**Features:**
- Sticky headers with back button
- Footer support
- Responsive content area
- Header actions

**Usage:**
```tsx
import { MobileOptimizedLayout } from '@/components/mobile';

<MobileOptimizedLayout
  title="Page Title"
  subtitle="Optional subtitle"
  showBackButton
  headerActions={<Button>Action</Button>}
  footer={<div>Footer content</div>}
>
  <YourContent />
</MobileOptimizedLayout>
```

### MobileCardGrid
Mobile-optimized card grid layout.

**Usage:**
```tsx
import { MobileCardGrid } from '@/components/mobile';

<MobileCardGrid columns={2} gap="md">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
</MobileCardGrid>
```

### MobileTabs
Mobile-optimized horizontal scrolling tabs.

**Usage:**
```tsx
import { MobileTabs } from '@/components/mobile';

<MobileTabs
  tabs={[
    { id: 'tab1', label: 'Tab 1', icon: <Icon /> },
    { id: 'tab2', label: 'Tab 2' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### MobileListItem
Touch-friendly list item component.

**Usage:**
```tsx
import { MobileListItem } from '@/components/mobile';

<MobileListItem
  title="Item Title"
  subtitle="Item subtitle"
  icon={<Icon />}
  badge="New"
  onClick={() => handleClick()}
  rightContent={<ChevronRight />}
/>
```

## Hooks

### useMobileDetection
Detects device type and provides mobile-specific information.

**Usage:**
```tsx
import { useMobileDetection } from '@/hooks/useMobileDetection';

const { isMobile, isTablet, isDesktop, isTouchDevice, orientation, screenSize } = useMobileDetection();
```

### useViewport
Provides current viewport dimensions.

**Usage:**
```tsx
import { useViewport } from '@/hooks/useMobileDetection';

const { width, height } = useViewport();
```

### useTouchGestures
Provides touch gesture handling.

**Usage:**
```tsx
import { useTouchGestures } from '@/hooks/useTouchGestures';

const touchGestures = useTouchGestures({
  onSwipeLeft: () => console.log('Swiped left'),
  onSwipeRight: () => console.log('Swiped right'),
  onSwipeUp: () => console.log('Swiped up'),
  onSwipeDown: () => console.log('Swiped down'),
  onPinch: (scale) => console.log('Pinched:', scale),
  onDoubleTap: () => console.log('Double tapped'),
  onLongPress: () => console.log('Long pressed'),
});

<div {...touchGestures}>Content</div>
```

### usePullToRefresh
Implements pull-to-refresh functionality.

**Usage:**
```tsx
import { usePullToRefresh } from '@/hooks/useTouchGestures';

const { isPulling, pullDistance, isRefreshing } = usePullToRefresh(async () => {
  await fetchNewData();
});
```

## Utilities

### Mobile Utils (`src/lib/mobile-utils.ts`)

**Device Detection:**
- `isMobileDevice()` - Check if device is mobile
- `isTabletDevice()` - Check if device is tablet
- `isTouchDevice()` - Check if device supports touch
- `getOrientation()` - Get device orientation

**UI Utilities:**
- `preventBodyScroll(prevent)` - Prevent/allow body scroll
- `smoothScrollTo(elementId, offset)` - Smooth scroll to element
- `triggerHapticFeedback(type)` - Trigger haptic feedback
- `isInViewport(element)` - Check if element is in viewport

**PWA Utilities:**
- `isInstalledPWA()` - Check if app is installed as PWA
- `getSafeAreaInsets()` - Get safe area insets for notched devices

**Sharing & Clipboard:**
- `copyToClipboard(text)` - Copy text to clipboard
- `shareContent(data)` - Share content using Web Share API

**Network:**
- `getNetworkInfo()` - Get network information
- `isLowPowerMode()` - Check if device is in low power mode

**Performance:**
- `debounce(func, wait)` - Debounce function
- `throttle(func, limit)` - Throttle function

**File Handling:**
- `formatFileSize(bytes)` - Format file size for display
- `downloadFile(url, filename)` - Download file

## CSS Classes

### Touch-Friendly Classes
- `.touch-target` - Minimum 44x44px tap target
- `.no-select` - Prevent text selection on touch
- `.touch-feedback` - Visual feedback on touch

### Safe Area Classes
- `.safe-top` - Padding for top safe area
- `.safe-bottom` - Padding for bottom safe area
- `.safe-left` - Padding for left safe area
- `.safe-right` - Padding for right safe area

### Mobile-Specific Classes
- `.mobile-container` - Mobile-optimized padding
- `.hide-scrollbar` - Hide scrollbar on mobile
- `.mobile-card` - Mobile-optimized card styles
- `.landscape-compact` - Compact spacing in landscape

## Best Practices

### Touch Targets
- Minimum 44x44px for all interactive elements
- Add padding around small icons
- Use `touch-target` class for consistency

### Performance
- Use `debounce` and `throttle` for scroll/resize events
- Lazy load images and components
- Optimize video playback for mobile networks

### Gestures
- Implement swipe gestures for navigation
- Use pull-to-refresh for content updates
- Support pinch-to-zoom where appropriate

### Layout
- Use `MobileOptimizedLayout` for consistent mobile UX
- Implement sticky headers for navigation
- Use bottom navigation for primary actions

### Accessibility
- Ensure touch targets are large enough
- Provide haptic feedback for important actions
- Support both touch and keyboard navigation

### PWA
- Show install prompt after user engagement
- Provide offline functionality
- Use service workers for caching

## Testing

### Device Testing
Test on multiple devices:
- iPhone (various models)
- Android phones (various manufacturers)
- Tablets (iPad, Android tablets)
- Different screen sizes and orientations

### Browser Testing
- Safari (iOS)
- Chrome (Android)
- Firefox (Android)
- Samsung Internet

### Network Testing
- Test on 3G/4G/5G networks
- Test offline functionality
- Test with slow connections

## Examples

### Complete Mobile Page
```tsx
import {
  MobileOptimizedLayout,
  MobileCardGrid,
  MobileTabs,
  PullToRefresh,
} from '@/components/mobile';
import { useMobileDetection } from '@/hooks/useMobileDetection';

export const MobilePage = () => {
  const { isMobile } = useMobileDetection();
  const [activeTab, setActiveTab] = useState('tab1');

  const handleRefresh = async () => {
    await fetchData();
  };

  return (
    <MobileOptimizedLayout
      title="My Page"
      showBackButton
      headerActions={<Button>Action</Button>}
    >
      <PullToRefresh onRefresh={handleRefresh}>
        <MobileTabs
          tabs={[
            { id: 'tab1', label: 'Tab 1' },
            { id: 'tab2', label: 'Tab 2' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="p-4">
          <MobileCardGrid columns={isMobile ? 1 : 2}>
            <Card>Content 1</Card>
            <Card>Content 2</Card>
          </MobileCardGrid>
        </div>
      </PullToRefresh>
    </MobileOptimizedLayout>
  );
};
```

### Mobile Video Player
```tsx
import { MobileVideoPlayer } from '@/components/mobile';
import { useTouchGestures } from '@/hooks/useTouchGestures';

export const VideoPage = () => {
  const handleProgress = (progress: number) => {
    // Save progress to backend
    saveProgress(progress);
  };

  const handleComplete = () => {
    // Mark video as completed
    markCompleted();
  };

  return (
    <div className="p-4">
      <MobileVideoPlayer
        src="/videos/lecture.mp4"
        poster="/images/poster.jpg"
        title="Introduction to AI"
        onProgress={handleProgress}
        onComplete={handleComplete}
      />
    </div>
  );
};
```

## Requirements Validation

This implementation satisfies Task 44 requirements:

✅ Optimize all pages for mobile viewport
✅ Implement touch-friendly controls and gestures
✅ Build mobile navigation with bottom tab bar
✅ Create mobile-optimized video player
✅ Implement pull-to-refresh functionality
✅ Build mobile-specific layouts for complex pages
✅ Create mobile app install prompt

**Requirements Coverage:**
- 14.1: Mobile responsiveness and PWA features
- 14.5: Touch-friendly navigation and controls
