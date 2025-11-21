/**
 * Real-time Features Demo Page
 * Comprehensive demonstration of all real-time capabilities
 * "I will never leave you nor forsake you" - Hebrews 13:5
 */

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeFeaturesDemo } from '@/components/realtime';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, Zap, Bell, Users, BookOpen, CheckCircle } from 'lucide-react';

export const RealtimeDemo: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in to access real-time features demo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Real-time Features</h1>
              <p className="text-muted-foreground">
                Experience instant updates and live collaboration
              </p>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              <Zap className="h-5 w-5 mr-2" />
              Live
            </Badge>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Instant notification delivery across all devices with browser push support
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Course Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Live progress tracking with automatic sync across devices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Real-time collaboration with presence tracking and live cursors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Optimistic UI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Instant feedback with automatic rollback on failure
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              ScrollUniversity uses cutting-edge real-time technology to provide instant updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Supabase Real-time</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Database change subscriptions</li>
                  <li>• Presence tracking</li>
                  <li>• Broadcast messaging</li>
                  <li>• Automatic reconnection</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">WebSocket (Socket.io)</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real-time chat messaging</li>
                  <li>• Typing indicators</li>
                  <li>• Online status tracking</li>
                  <li>• Room-based communication</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Optimistic Updates</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Instant UI feedback</li>
                  <li>• Automatic rollback</li>
                  <li>• Pending state tracking</li>
                  <li>• Error recovery</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Benefits</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Zero refresh needed</li>
                  <li>• Multi-device sync</li>
                  <li>• Collaborative features</li>
                  <li>• Better user experience</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Component */}
        <RealtimeFeaturesDemo
          userId={user.id}
          courseId="demo-course-123"
          documentId="demo-document-456"
        />

        {/* Technical Details */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>
              Built with modern real-time technologies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Architecture</h4>
                <p className="text-sm text-muted-foreground">
                  The real-time system uses a hybrid approach combining Supabase Real-time for
                  database changes and Socket.io for custom real-time features. This provides
                  the best of both worlds: automatic database sync and flexible custom messaging.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Performance</h4>
                <p className="text-sm text-muted-foreground">
                  All real-time features are optimized for performance with debouncing, batching,
                  and efficient subscription management. Updates are delivered in milliseconds
                  with minimal bandwidth usage.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Reliability</h4>
                <p className="text-sm text-muted-foreground">
                  The system includes automatic reconnection, error recovery, and offline support.
                  Optimistic updates ensure the UI remains responsive even during network issues.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealtimeDemo;
