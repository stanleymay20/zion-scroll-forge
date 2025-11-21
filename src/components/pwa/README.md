# PWA Components

Progressive Web App components for ScrollUniversity that provide offline functionality, install prompts, and storage management.

## Components

### PWAInstallPrompt
Displays a prompt to install the app as a PWA when the browser supports it.

**Features:**
- Auto-dismisses after user action
- Remembers user preference
- Animated slide-in appearance
- Mobile-responsive design

**Usage:**
```tsx
import { PWAInstallPrompt } from '@/components/pwa';

function App() {
  return (
    <>
      <PWAInstallPrompt />
      {/* Rest of your app */}
    </>
  );
}
```

### OfflineIndicator
Shows a banner when the user goes offline or comes back online.

**Features:**
- Automatic detection of online/offline status
- Sync button when connection is restored
- Color-coded status (yellow for offline, green for online)
- Auto-dismisses after 5 seconds when back online

**Usage:**
```tsx
import { OfflineIndicator } from '@/components/pwa';

function App() {
  return (
    <>
      <OfflineIndicator />
      {/* Rest of your app */}
    </>
  );
}
```

### PWAUpdatePrompt
Notifies users when a new version of the app is available.

**Features:**
- Automatic detection of service worker updates
- One-click update and reload
- Non-intrusive notification

**Usage:**
```tsx
import { PWAUpdatePrompt } from '@/components/pwa';

function App() {
  return (
    <>
      <PWAUpdatePrompt />
      {/* Rest of your app */}
    </>
  );
}
```

### StorageManager
Provides storage management UI for cached content.

**Features:**
- Visual storage usage indicator
- List of cached content types
- Clear cache functionality
- Storage quota display

**Usage:**
```tsx
import { StorageManager } from '@/components/pwa';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <StorageManager />
    </div>
  );
}
```

## Hooks

### usePWA
Custom hook that provides PWA state and actions.

**Returns:**
```typescript
{
  // State
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  canInstall: boolean;
  notificationPermission: NotificationPermission;
  storageUsage: number;
  storageQuota: number;
  storagePercentage: number;
  
  // Actions
  installApp: () => Promise<void>;
  updateApp: () => void;
  requestNotifications: () => Promise<NotificationPermission>;
  syncOfflineData: () => Promise<void>;
  checkStorage: () => Promise<void>;
}
```

**Usage:**
```tsx
import { usePWA } from '@/hooks/usePWA';

function MyComponent() {
  const { isOnline, installApp, canInstall } = usePWA();
  
  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      {canInstall && (
        <button onClick={installApp}>Install App</button>
      )}
    </div>
  );
}
```

## Utilities

### pwa-utils.ts
Utility functions for PWA functionality.

**Key Functions:**
- `registerServiceWorker()` - Register the service worker
- `updateServiceWorker()` - Check for and apply updates
- `isPWA()` - Check if running as installed PWA
- `requestNotificationPermission()` - Request notification permissions
- `subscribeToPushNotifications()` - Subscribe to push notifications
- `getStorageEstimate()` - Get storage usage information
- `clearAllCaches()` - Clear all cached data
- `registerBackgroundSync()` - Register background sync
- `storeOfflineData()` - Store data for offline sync

## Service Worker

The service worker (`public/sw.js`) provides:

### Caching Strategies
- **Static Cache**: Core app files (HTML, manifest, icons)
- **Dynamic Cache**: API responses and dynamic content
- **Image Cache**: Images with size limits

### Offline Support
- Serves cached content when offline
- Shows offline page for navigation requests
- Queues failed requests for background sync

### Background Sync
- Automatically syncs data when connection is restored
- Stores failed requests in IndexedDB
- Retries failed operations

### Push Notifications
- Receives and displays push notifications
- Handles notification clicks
- Supports notification actions

## Setup

### 1. Add Manifest Link
Add to `index.html`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#8B5CF6">
```

### 2. Add PWA Components to App
```tsx
import { PWAInstallPrompt, OfflineIndicator, PWAUpdatePrompt } from '@/components/pwa';

function App() {
  return (
    <>
      <OfflineIndicator />
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
      {/* Rest of your app */}
    </>
  );
}
```

### 3. Configure Environment Variables
Add to `.env`:
```
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

## Icons

Place PWA icons in `public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Testing

### Test Offline Functionality
1. Open DevTools > Application > Service Workers
2. Check "Offline" checkbox
3. Verify app still works with cached content

### Test Install Prompt
1. Open in Chrome/Edge
2. Wait for install prompt to appear
3. Click "Install" to test installation

### Test Updates
1. Make changes to service worker
2. Reload page
3. Verify update prompt appears

### Test Storage
1. Use app and cache content
2. Open Settings > Storage Manager
3. Verify storage usage is displayed
4. Test clear cache functionality

## Browser Support

- Chrome/Edge: Full support
- Firefox: Partial support (no install prompt)
- Safari: Limited support (iOS 11.3+)
- Opera: Full support

## Best Practices

1. **Cache Wisely**: Don't cache everything, prioritize important content
2. **Update Regularly**: Keep service worker version updated
3. **Test Offline**: Always test offline functionality
4. **Monitor Storage**: Keep track of storage usage
5. **Handle Errors**: Gracefully handle offline errors
6. **User Control**: Let users manage cached content

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Verify service worker file is accessible
- Ensure HTTPS (required for PWA)

### Install Prompt Not Showing
- Check if already installed
- Verify manifest.json is valid
- Ensure all PWA criteria are met

### Offline Content Not Available
- Check if content was cached
- Verify service worker is active
- Check cache storage in DevTools

### Storage Full
- Clear old caches
- Reduce cache size limits
- Implement cache cleanup strategy
