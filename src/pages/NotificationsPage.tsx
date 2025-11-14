import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check } from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markRead.mutate(notification.id);
    }

    if (notification.related_type && notification.related_id) {
      switch (notification.related_type) {
        case 'tutor_session':
          navigate(`/tutor-session/${notification.related_id}`);
          break;
        case 'course':
          navigate(`/courses/${notification.related_id}`);
          break;
        case 'event':
          navigate(`/events/${notification.related_id}`);
          break;
      }
    }
  };

  const groupByDate = (notifications: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = {
      today: [] as any[],
      yesterday: [] as any[],
      older: [] as any[],
    };

    notifications.forEach(notif => {
      const date = new Date(notif.created_at);
      date.setHours(0, 0, 0, 0);

      if (date.getTime() === today.getTime()) {
        groups.today.push(notif);
      } else if (date.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notif);
      } else {
        groups.older.push(notif);
      }
    });

    return groups;
  };

  const filterByType = (type: string) => {
    if (type === 'all') return notifications;
    return notifications.filter((n: any) => n.type === type);
  };

  const renderNotificationList = (notificationList: any[]) => {
    const grouped = groupByDate(notificationList);

    return (
      <div className="space-y-6">
        {grouped.today.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Today</h3>
            <div className="space-y-2">
              {grouped.today.map(renderNotification)}
            </div>
          </div>
        )}
        {grouped.yesterday.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Yesterday</h3>
            <div className="space-y-2">
              {grouped.yesterday.map(renderNotification)}
            </div>
          </div>
        )}
        {grouped.older.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Older</h3>
            <div className="space-y-2">
              {grouped.older.map(renderNotification)}
            </div>
          </div>
        )}
        {notificationList.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No notifications</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderNotification = (notification: any) => (
    <Card
      key={notification.id}
      className={`cursor-pointer transition-colors hover:bg-accent ${
        !notification.is_read ? 'border-l-4 border-l-primary' : ''
      }`}
      onClick={() => handleNotificationClick(notification)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {notification.type}
              </Badge>
              {!notification.is_read && (
                <Badge variant="default" className="text-xs">New</Badge>
              )}
            </div>
            <p className={`text-sm ${notification.is_read ? 'text-muted-foreground' : 'font-semibold'}`}>
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <PageTemplate
      title="Notifications"
      description="✝️ Stay updated with your learning journey"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="tutor">Tutor</TabsTrigger>
            <TabsTrigger value="course">Course</TabsTrigger>
            <TabsTrigger value="spiritual">Spiritual</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            {renderNotificationList(notifications)}
          </TabsContent>
          <TabsContent value="tutor" className="mt-6">
            {renderNotificationList(filterByType('tutor'))}
          </TabsContent>
          <TabsContent value="course" className="mt-6">
            {renderNotificationList(filterByType('course'))}
          </TabsContent>
          <TabsContent value="spiritual" className="mt-6">
            {renderNotificationList(filterByType('spiritual'))}
          </TabsContent>
          <TabsContent value="system" className="mt-6">
            {renderNotificationList(filterByType('system'))}
          </TabsContent>
          <TabsContent value="billing" className="mt-6">
            {renderNotificationList(filterByType('billing'))}
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}