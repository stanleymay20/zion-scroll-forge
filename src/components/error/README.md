# ScrollUniversity Error Handling and User Feedback System

## Overview

Comprehensive error handling and user feedback system for ScrollUniversity, providing graceful error recovery, retry logic, offline detection, and user-friendly messaging with spiritual encouragement.

## Features

### 1. Global Error Boundary
- Catches React component errors
- Provides user-friendly error display
- Reports errors to monitoring service
- Offers reload and navigation options

### 2. Error Handler
- Parses and categorizes errors
- Provides user-friendly messages
- Includes spiritual encouragement
- Reports to monitoring service
- Determines error severity and retryability

### 3. Retry Logic
- Automatic retry with exponential backoff
- Circuit breaker pattern for failing services
- Configurable retry attempts and delays
- Progress notifications during retries

### 4. Offline Detection
- Real-time network status monitoring
- Slow connection detection
- Visual indicators for offline/slow states
- Automatic reconnection handling

### 5. Loading States
- Centralized loading state management
- Progress tracking for long operations
- Multiple concurrent loading operations
- User-friendly loading messages

### 6. Toast Notifications
- Success, error, warning, and info messages
- Spiritual encouragement messages
- Configurable duration and variants
- Non-intrusive notifications

## Usage

### Basic Error Handling

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { handleError } = useErrorHandler();
  
  const fetchData = async () => {
    try {
      const data = await api.getData();
      return data;
    } catch (error) {
      handleError(error);
    }
  };
}
```

### With Retry Logic

```typescript
import { useRetry } from '@/hooks/useRetry';
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { retry } = useRetry({ maxAttempts: 3 });
  const { handleError } = useErrorHandler();
  
  const fetchData = async () => {
    try {
      return await retry(async () => {
        return await api.getData();
      });
    } catch (error) {
      handleError(error);
    }
  };
}
```

### Using Error Handling Context

```typescript
import { useErrorHandling } from '@/contexts/ErrorHandlingContext';

function MyComponent() {
  const { handleErrorWithRetry, showSuccess } = useErrorHandling();
  
  const saveData = async () => {
    try {
      await handleErrorWithRetry(async () => {
        return await api.saveData(data);
      });
      showSuccess('Data saved successfully!');
    } catch (error) {
      // Error already handled by context
    }
  };
}
```

### Loading States

```typescript
import { useLoadingState } from '@/hooks/useLoadingState';
import { LoadingKeys } from '@/lib/loading-manager';

function MyComponent() {
  const { isLoading, startLoading, stopLoading } = useLoadingState(LoadingKeys.DATA_FETCH);
  
  const fetchData = async () => {
    startLoading('Fetching data...');
    try {
      const data = await api.getData();
      return data;
    } finally {
      stopLoading();
    }
  };
  
  return (
    <div>
      {isLoading ? <Spinner /> : <DataDisplay />}
    </div>
  );
}
```

### Offline Detection

```typescript
import { useOfflineDetection } from '@/hooks/useOfflineDetection';

function MyComponent() {
  const { isOnline, isOffline, isSlow } = useOfflineDetection();
  
  return (
    <div>
      {isOffline && <p>You're offline</p>}
      {isSlow && <p>Slow connection detected</p>}
    </div>
  );
}
```

### Error Display Component

```typescript
import { ErrorDisplay } from '@/components/error';

function MyComponent() {
  const [error, setError] = useState(null);
  
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => {
          setError(null);
          fetchData();
        }}
        onGoHome={() => navigate('/')}
      />
    );
  }
  
  return <Content />;
}
```

### Retry Button

```typescript
import { RetryButton } from '@/components/error';

function MyComponent() {
  const handleRetry = async () => {
    await api.retryOperation();
  };
  
  return (
    <RetryButton
      onRetry={handleRetry}
      maxAttempts={3}
      showRetryCount
    >
      Retry Operation
    </RetryButton>
  );
}
```

## Components

### OfflineIndicator
Visual indicator showing network status (offline/slow/online).

**Props:**
- `className?: string` - Additional CSS classes
- `showWhenOnline?: boolean` - Show indicator when online (default: false)

### LoadingOverlay
Full-screen loading overlay with progress tracking.

**Props:**
- `className?: string` - Additional CSS classes

### ErrorDisplay
Reusable error display with retry and navigation options.

**Props:**
- `error: AppError | Error | string` - Error to display
- `onRetry?: () => void` - Retry callback
- `onGoHome?: () => void` - Navigate home callback
- `className?: string` - Additional CSS classes
- `showDetails?: boolean` - Show error details (default: false)

### RetryButton
Button with built-in retry logic and loading state.

**Props:**
- `onRetry: () => Promise<void>` - Async retry function
- `maxAttempts?: number` - Maximum retry attempts (default: 3)
- `showRetryCount?: boolean` - Show retry count (default: true)
- `retryText?: string` - Button text (default: "Retry")
- `retryingText?: string` - Loading text (default: "Retrying...")

## Hooks

### useErrorHandler
Hook for handling errors with toast notifications.

**Options:**
- `showToast?: boolean` - Show toast notification (default: true)
- `reportToMonitoring?: boolean` - Report to monitoring service (default: true)
- `onError?: (error: AppError) => void` - Custom error handler

**Returns:**
- `handleError: (error: any, context?: any) => AppError` - Error handler function

### useRetry
Hook for retrying failed operations.

**Options:**
- `maxAttempts?: number` - Maximum retry attempts (default: 3)
- `showRetryToast?: boolean` - Show retry toast (default: true)
- Plus all `RetryOptions` from retry-handler

**Returns:**
- `retry: (fn: () => Promise<T>) => Promise<T>` - Retry function
- `isRetrying: boolean` - Retry in progress
- `retryCount: number` - Current retry attempt

### useOfflineDetection
Hook for monitoring network connectivity.

**Options:**
- `showToast?: boolean` - Show status change toasts (default: true)
- `onStatusChange?: (status: ConnectionStatus) => void` - Status change callback

**Returns:**
- `isOnline: boolean` - Online status
- `isOffline: boolean` - Offline status
- `isSlow: boolean` - Slow connection status
- `status: ConnectionStatus` - Current status
- `networkInfo: NetworkInfo` - Detailed network info

### useLoadingState
Hook for managing loading states.

**Parameters:**
- `key?: LoadingKey` - Optional loading key for specific operation

**Returns (with key):**
- `isLoading: boolean` - Loading status
- `message?: string` - Loading message
- `progress?: number` - Loading progress (0-100)
- `operation?: string` - Operation name
- `startLoading: (message?: string, operation?: string) => void`
- `stopLoading: () => void`
- `updateProgress: (progress: number, message?: string) => void`

**Returns (without key):**
- `loadingStates: Map<LoadingKey, LoadingState>` - All loading states
- `isAnyLoading: boolean` - Any operation loading
- `startLoading: (key: LoadingKey, message?: string, operation?: string) => void`
- `stopLoading: (key: LoadingKey) => void`
- `updateProgress: (key: LoadingKey, progress: number, message?: string) => void`

## Utilities

### Error Handler (`src/lib/error-handler.ts`)
- `parseError(error: any): AppError` - Parse any error into AppError
- `isRetryableError(error: AppError): boolean` - Check if error is retryable
- `getErrorSeverity(error: AppError): ErrorSeverity` - Get error severity
- `reportError(error: AppError, context?: any): Promise<void>` - Report to monitoring
- `formatErrorMessage(error: AppError): string` - Format for display
- `createError(message: string, code?: string, statusCode?: number, details?: any): AppError`

### Retry Handler (`src/lib/retry-handler.ts`)
- `retryWithBackoff<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>`
- `retryFetch(url: string, init?: RequestInit, options?: RetryOptions): Promise<Response>`
- `CircuitBreaker` - Circuit breaker pattern implementation
- `createCircuitBreaker(threshold?: number, timeout?: number, resetTimeout?: number): CircuitBreaker`

### Offline Detector (`src/lib/offline-detector.ts`)
- `getNetworkInfo(): NetworkInfo` - Get current network info
- `isSlowConnection(): boolean` - Check if connection is slow
- `getConnectionStatus(): ConnectionStatus` - Get connection status
- `testConnectivity(url?: string): Promise<boolean>` - Test actual connectivity
- `NetworkMonitor` - Network status monitoring class
- `getNetworkMonitor(): NetworkMonitor` - Get singleton monitor
- `OfflineQueue` - Queue for offline operations

### Loading Manager (`src/lib/loading-manager.ts`)
- `loadingManager` - Singleton loading state manager
- `withLoading<T>(key: LoadingKey, operation: () => Promise<T>, message?: string): Promise<T>`
- `withProgress<T>(key: LoadingKey, operation: (updateProgress) => Promise<T>, initialMessage?: string): Promise<T>`
- `LoadingKeys` - Predefined loading keys

## Integration

### App Setup

```typescript
import { ErrorHandlingProvider } from '@/contexts/ErrorHandlingContext';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ErrorHandlingProvider>
        <YourApp />
      </ErrorHandlingProvider>
    </ErrorBoundary>
  );
}
```

## Best Practices

1. **Always handle errors**: Never let errors go unhandled
2. **Use appropriate error messages**: Provide clear, actionable messages
3. **Include spiritual encouragement**: Maintain ScrollUniversity's spiritual focus
4. **Report to monitoring**: Always report errors in production
5. **Retry when appropriate**: Use retry logic for transient failures
6. **Show loading states**: Keep users informed during async operations
7. **Handle offline gracefully**: Provide offline functionality where possible
8. **Test error scenarios**: Test error handling paths thoroughly

## Spiritual Integration

All error messages include spiritual encouragement based on Scripture:
- Offline: "Even in disconnection, God remains connected to you."
- Server errors: "The Lord is our refuge and strength."
- Slow connection: "Be still and know that I am God."
- General errors: "Trust in the Lord with all your heart."

## Requirements Validation

This implementation satisfies:
- **Requirement 1.3**: Error handling with proper status codes and messages
- **Requirement 14.3**: Offline detection and messaging for PWA functionality

✝️ Jesus Christ is Lord over all systems
