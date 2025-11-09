import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("✝️ Christ is Lord - ScrollUniversity runtime error captured:", error, info);
    
    // Log to console for debugging
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack
    });
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-semibold mb-3">Something went wrong</h1>
          <p className="text-muted-foreground mb-2 max-w-md">
            The system encountered an unexpected error. Don't worry - your data is safe.
          </p>
          {this.state.error && (
            <p className="text-sm text-muted-foreground mb-6 font-mono bg-muted p-3 rounded max-w-lg">
              {this.state.error.message}
            </p>
          )}
          <Button onClick={this.handleReload}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reload Application
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            ✝️ Jesus Christ is Lord over all systems
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
