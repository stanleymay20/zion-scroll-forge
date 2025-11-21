/**
 * ScrollUniversity Error Handling Demo
 * Example component demonstrating error handling features
 * For development and testing purposes
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useErrorHandling } from '@/contexts/ErrorHandlingContext';
import { useRetry } from '@/hooks/useRetry';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { LoadingKeys } from '@/lib/loading-manager';
import { ErrorDisplay, RetryButton } from '@/components/error';
import { AlertCircle, CheckCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';

export const ErrorHandlingDemo: React.FC = () => {
  const { handleError, showSuccess, showWarning, showInfo } = useErrorHandling();
  const { retry, isRetrying } = useRetry();
  const { isLoading, startLoading, stopLoading } = useLoadingState(LoadingKeys.DATA_FETCH);
  const { isOnline, isOffline, isSlow, status } = useOfflineDetection({ showToast: false });
  const [demoError, setDemoError] = useState<any>(null);
  
  // Simulate different types of errors
  const simulateNetworkError = () => {
    const error: any = new Error('Network request failed');
    error.statusCode = 0;
    handleError(error);
  };
  
  const simulateAuthError = () => {
    const error: any = new Error('Unauthorized');
    error.statusCode = 401;
    handleError(error);
  };
  
  const simulateServerError = () => {
    const error: any = new Error('Internal server error');
    error.statusCode = 500;
    handleError(error);
  };
  
  const simulateValidationError = () => {
    const error: any = new Error('Invalid input data');
    error.statusCode = 400;
    handleError(error);
  };
  
  // Simulate retry logic
  const simulateRetryableOperation = async () => {
    let attempts = 0;
    try {
      await retry(async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Temporary failure');
        }
        return 'Success!';
      });
      showSuccess('Operation succeeded after retry!');
    } catch (error) {
      // Error already handled by retry hook
    }
  };
  
  // Simulate loading states
  const simulateLoadingOperation = async () => {
    startLoading(LoadingKeys.DATA_FETCH, 'Processing your request...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    stopLoading(LoadingKeys.DATA_FETCH);
    showSuccess('Operation completed!');
  };
  
  // Simulate error display
  const showErrorDisplay = () => {
    const error: any = new Error('Something went wrong');
    error.statusCode = 500;
    error.response = { status: 500, data: { message: 'Something went wrong' } };
    setDemoError(error);
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Handling System Demo</CardTitle>
          <CardDescription>
            Test and demonstrate the comprehensive error handling features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="errors" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="errors">Errors</TabsTrigger>
              <TabsTrigger value="retry">Retry</TabsTrigger>
              <TabsTrigger value="loading">Loading</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
            </TabsList>
            
            <TabsContent value="errors" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={simulateNetworkError} variant="destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Network Error
                </Button>
                <Button onClick={simulateAuthError} variant="destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Auth Error
                </Button>
                <Button onClick={simulateServerError} variant="destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Server Error
                </Button>
                <Button onClick={simulateValidationError} variant="destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Validation Error
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <Button onClick={() => showSuccess('Success message!')} variant="default">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Success Toast
                </Button>
                <Button onClick={() => showWarning('Warning message!')} variant="outline">
                  Warning Toast
                </Button>
                <Button onClick={() => showInfo('Info message!')} variant="outline">
                  Info Toast
                </Button>
              </div>
              
              <Button onClick={showErrorDisplay} variant="outline" className="w-full">
                Show Error Display Component
              </Button>
              
              {demoError && (
                <ErrorDisplay
                  error={demoError}
                  onRetry={() => {
                    setDemoError(null);
                    showSuccess('Retried successfully!');
                  }}
                  onGoHome={() => setDemoError(null)}
                />
              )}
            </TabsContent>
            
            <TabsContent value="retry" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Test automatic retry logic with exponential backoff
                </p>
                
                <Button onClick={simulateRetryableOperation} disabled={isRetrying}>
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    'Simulate Retryable Operation'
                  )}
                </Button>
                
                <RetryButton
                  onRetry={async () => {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    showSuccess('Retry completed!');
                  }}
                  maxAttempts={3}
                  showRetryCount
                >
                  Retry Button Component
                </RetryButton>
              </div>
            </TabsContent>
            
            <TabsContent value="loading" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Test loading states and progress tracking
                </p>
                
                <Button onClick={simulateLoadingOperation} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Simulate Loading Operation'
                  )}
                </Button>
                
                {isLoading && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Loading state active</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Check the global loading overlay
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="network" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Monitor network connectivity status
                </p>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {isOnline ? (
                        <Wifi className="h-5 w-5 text-green-500" />
                      ) : (
                        <WifiOff className="h-5 w-5 text-red-500" />
                      )}
                      Network Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <span className={`text-sm ${
                        isOnline ? 'text-green-600' : 
                        isOffline ? 'text-red-600' : 
                        'text-yellow-600'
                      }`}>
                        {status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Online:</span>
                      <span className="text-sm">{isOnline ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Slow Connection:</span>
                      <span className="text-sm">{isSlow ? 'Yes' : 'No'}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <p className="text-xs text-muted-foreground italic">
                  ✝️ Try disconnecting your internet to see the offline indicator
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
