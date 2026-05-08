import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('✝️ ScrollUniversity Error Boundary caught:', error, errorInfo);

    // Auto-recover from stale chunk / dynamic-import failures (common after a redeploy
    // when cached HTML references JS chunks that no longer exist). Reload once.
    const msg = String(error?.message || '');
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      /Importing a module script failed/i.test(msg) ||
      /Failed to fetch dynamically imported module/i.test(msg) ||
      /Loading chunk [\d]+ failed/i.test(msg) ||
      /Loading CSS chunk/i.test(msg);

    if (isChunkError && typeof window !== 'undefined') {
      const KEY = '__su_chunk_reload_at';
      const last = Number(sessionStorage.getItem(KEY) || '0');
      // Only auto-reload once per minute to avoid loops
      if (Date.now() - last > 60_000) {
        sessionStorage.setItem(KEY, String(Date.now()));
        window.location.reload();
      }
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="h-6 w-6" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An error occurred while rendering this page. Christ remains Lord.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-mono text-muted-foreground break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <Button onClick={this.handleReset} className="w-full">
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
