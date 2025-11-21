/**
 * Real-time Features Demo Component
 * Demonstrates all real-time capabilities
 * "Behold, I am doing a new thing" - Isaiah 43:19
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useRealtimeCourseProgress } from '@/hooks/useRealtimeCourseProgress';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import { useOptimisticUpdates } from '@/hooks/useOptimisticUpdates';
import { Bell, BookOpen, Users, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';

interface RealtimeFeaturesDemoProps {
  userId: string;
  courseId?: string;
  documentId?: string;
}

export const RealtimeFeaturesDemo: React.FC<RealtimeFeaturesDemoProps> = ({
  userId,
  courseId = 'demo-course',
  documentId = 'demo-doc'
}) => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([]);

  // Notifications
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useRealtimeNotifications(userId);

  // Course Progress
  const {
    courseProgress,
    lectureProgress,
    updateLectureProgress,
    markLectureComplete
  } = useRealtimeCourseProgress(userId, courseId);

  // Collaboration
  const {
    document,
    onlineUsers,
    cursors,
    isConnected: collabConnected,
    updateContent,
    updateCursor
  } = useRealtimeCollaboration(documentId, userId, 'Demo User');

  // Optimistic Updates
  const {
    data: optimisticData,
    pendingUpdates,
    addOptimistic,
    updateOptimistic,
    rollback
  } = useOptimisticUpdates<{ id: string; title: string; completed: boolean }>([]);

  // Subscribe to real-time events for demo
  const { isConnected: notificationsConnected } = useSupabaseRealtime({
    table: 'notifications',
    filter: `userId=eq.${userId}`,
    onChange: (payload) => {
      setRealtimeEvents(prev => [
        {
          type: 'notification',
          event: payload.eventType,
          timestamp: new Date().toISOString(),
          data: payload.new || payload.old
        },
        ...prev.slice(0, 9)
      ]);
    }
  });

  const { isConnected: progressConnected } = useSupabaseRealtime({
    table: 'enrollments',
    filter: `userId=eq.${userId}`,
    onChange: (payload) => {
      setRealtimeEvents(prev => [
        {
          type: 'progress',
          event: payload.eventType,
          timestamp: new Date().toISOString(),
          data: payload.new || payload.old
        },
        ...prev.slice(0, 9)
      ]);
    }
  });

  // Demo actions
  const handleTestOptimisticAdd = async () => {
    try {
      await addOptimistic(
        {
          id: `task-${Date.now()}`,
          title: 'New Task',
          completed: false
        },
        async () => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 2000));
          return {
            id: `task-${Date.now()}`,
            title: 'New Task (Confirmed)',
            completed: false
          };
        }
      );
    } catch (error) {
      console.error('Optimistic add failed:', error);
    }
  };

  const handleTestLectureProgress = async () => {
    await updateLectureProgress('lecture-1', 50, 300);
  };

  const handleTestCollaboration = async () => {
    await updateContent('Updated content at ' + new Date().toLocaleTimeString(), true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-time Features Demo</h1>
          <p className="text-muted-foreground">
            Live demonstration of all real-time capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={notificationsConnected ? 'default' : 'secondary'}>
            {notificationsConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Badge variant={progressConnected ? 'default' : 'secondary'}>
            Progress: {progressConnected ? 'Live' : 'Offline'}
          </Badge>
          <Badge variant={collabConnected ? 'default' : 'secondary'}>
            Collab: {collabConnected ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Connection Status */}
      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          Real-time features are {notificationsConnected ? 'active' : 'inactive'}. 
          All updates will sync automatically across devices.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="progress">
            <BookOpen className="h-4 w-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="collaboration">
            <Users className="h-4 w-4 mr-2" />
            Collaboration
          </TabsTrigger>
          <TabsTrigger value="optimistic">
            <Zap className="h-4 w-4 mr-2" />
            Optimistic UI
          </TabsTrigger>
          <TabsTrigger value="events">
            Events ({realtimeEvents.length})
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Notifications</CardTitle>
              <CardDescription>
                Notifications update instantly across all devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {notifications.length} total notifications
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount} unread
                  </p>
                </div>
                <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
                  Mark All Read
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notifications.map(notification => (
                  <Card key={notification.id} className={!notification.read ? 'border-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Course Progress</CardTitle>
              <CardDescription>
                Progress updates sync in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Overall Progress</span>
                  <span className="font-semibold">
                    {courseProgress?.progressPercentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500"
                    style={{ width: `${courseProgress?.progressPercentage || 0}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Lectures</p>
                  <p className="text-2xl font-bold">
                    {courseProgress?.completedLectures?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Assignments</p>
                  <p className="text-2xl font-bold">
                    {courseProgress?.completedAssignments?.length || 0}
                  </p>
                </div>
              </div>

              <Button onClick={handleTestLectureProgress} className="w-full">
                Test Progress Update
              </Button>

              <div className="space-y-2">
                <h4 className="font-semibold">Lecture Progress</h4>
                {Object.entries(lectureProgress).map(([lectureId, progress]) => (
                  <div key={lectureId} className="flex items-center gap-2">
                    <span className="text-sm flex-1">{lectureId}</span>
                    <span className="text-sm">{progress.progress}%</span>
                    {progress.completed && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Collaboration</CardTitle>
              <CardDescription>
                See who's online and collaborate in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Online Users ({onlineUsers.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {onlineUsers.map((user: any, index) => (
                    <Badge key={index} variant="secondary">
                      {user.userName || user.userId}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Active Cursors ({cursors.length})</h4>
                <div className="space-y-1">
                  {cursors.map((cursor, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cursor.color }}
                      />
                      <span className="text-sm">{cursor.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        Position: {cursor.position}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Document Content</h4>
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm">{document?.content || 'No content'}</p>
                </div>
              </div>

              <Button onClick={handleTestCollaboration} className="w-full">
                Test Collaboration Update
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimistic Updates Tab */}
        <TabsContent value="optimistic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimistic UI Updates</CardTitle>
              <CardDescription>
                Instant UI updates with automatic rollback on failure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleTestOptimisticAdd} className="w-full">
                Add Item (Optimistic)
              </Button>

              <div>
                <h4 className="font-semibold mb-2">
                  Pending Updates ({pendingUpdates.length})
                </h4>
                <div className="space-y-2">
                  {pendingUpdates.map(update => (
                    <Card key={update.id}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {update.status === 'pending' && (
                            <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
                          )}
                          {update.status === 'confirmed' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {update.status === 'failed' && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">{update.data.title}</span>
                        </div>
                        {update.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => rollback(update.id)}
                          >
                            Rollback
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Data ({optimisticData.length})</h4>
                <div className="space-y-1">
                  {optimisticData.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Events Log</CardTitle>
              <CardDescription>
                Live stream of all real-time events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {realtimeEvents.map((event, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="mb-1">
                            {event.type}
                          </Badge>
                          <p className="text-sm font-semibold">{event.event}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {realtimeEvents.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No events yet. Interact with the features to see real-time updates.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealtimeFeaturesDemo;
