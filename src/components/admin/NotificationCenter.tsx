/**
 * Notification Center
 * Centralized notification management for Academic Year Automation System
 * Requirements: 5.2 - Notification System
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Bell,
  Mail,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface Notification {
  id: string;
  recipientId: string;
  recipientType: 'student' | 'faculty' | 'admin' | 'all';
  notificationType: string;
  title: string;
  message: string;
  channels: ('email' | 'sms' | 'push' | 'in-app')[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledFor: Date;
  sentAt?: Date;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  error?: string;
}

interface NotificationStats {
  total: number;
  pending: number;
  sent: number;
  delivered: number;
  failed: number;
  deliveryRate: number;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state for creating notifications
  const [newNotification, setNewNotification] = useState({
    recipientType: 'all',
    notificationType: 'announcement',
    title: '',
    message: '',
    channels: ['email', 'in-app'],
    priority: 'normal',
  });

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [filter]);

  const loadNotifications = async () => {
    try {
      // TODO: Replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          recipientId: 'all',
          recipientType: 'all',
          notificationType: 'deadline_reminder',
          title: 'Registration Deadline Approaching',
          message: 'Course registration closes in 48 hours',
          channels: ['email', 'push', 'in-app'],
          priority: 'high',
          scheduledFor: new Date(Date.now() - 3600000),
          sentAt: new Date(Date.now() - 3600000),
          deliveryStatus: 'delivered',
        },
        {
          id: '2',
          recipientId: 'stu-123',
          recipientType: 'student',
          notificationType: 'admission_decision',
          title: 'Admission Decision Available',
          message: 'Your admission decision is now available',
          channels: ['email', 'sms'],
          priority: 'urgent',
          scheduledFor: new Date(Date.now() - 7200000),
          sentAt: new Date(Date.now() - 7200000),
          deliveryStatus: 'delivered',
        },
        {
          id: '3',
          recipientId: 'fac-456',
          recipientType: 'faculty',
          notificationType: 'grading_reminder',
          title: 'Grades Due Soon',
          message: 'Final grades are due in 3 days',
          channels: ['email', 'in-app'],
          priority: 'normal',
          scheduledFor: new Date(Date.now() + 3600000),
          deliveryStatus: 'pending',
        },
        {
          id: '4',
          recipientId: 'stu-789',
          recipientType: 'student',
          notificationType: 'payment_reminder',
          title: 'Payment Overdue',
          message: 'Your tuition payment is overdue',
          channels: ['email', 'sms', 'push'],
          priority: 'urgent',
          scheduledFor: new Date(Date.now() - 1800000),
          sentAt: new Date(Date.now() - 1800000),
          deliveryStatus: 'failed',
          error: 'Email delivery failed',
        },
      ];

      const mockStats: NotificationStats = {
        total: 1250,
        pending: 45,
        sent: 1150,
        delivered: 1100,
        failed: 55,
        deliveryRate: 95.7,
      };

      setNotifications(mockNotifications);
      setStats(mockStats);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    try {
      // TODO: Replace with actual API call
      console.log('Creating notification:', newNotification);
      setIsCreateDialogOpen(false);
      setNewNotification({
        recipientType: 'all',
        notificationType: 'announcement',
        title: '',
        message: '',
        channels: ['email', 'in-app'],
        priority: 'normal',
      });
      loadNotifications();
    } catch (err) {
      console.error('Failed to create notification:', err);
    }
  };

  const getStatusIcon = (status: Notification['deliveryStatus']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      low: 'outline',
      normal: 'secondary',
      high: 'default',
      urgent: 'destructive',
    };
    return (
      <Badge variant={variants[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-3 w-3" />;
      case 'sms':
        return <MessageSquare className="h-3 w-3" />;
      case 'push':
        return <Bell className="h-3 w-3" />;
      case 'in-app':
        return <Bell className="h-3 w-3" />;
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter !== 'all' && notif.deliveryStatus !== filter) return false;
    if (searchTerm && !notif.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notification Center
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage and monitor system notifications
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
              <DialogDescription>
                Send a notification to users through multiple channels
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="recipient-type">Recipient Type</Label>
                <Select
                  value={newNotification.recipientType}
                  onValueChange={(value) =>
                    setNewNotification({ ...newNotification, recipientType: value })
                  }
                >
                  <SelectTrigger id="recipient-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="admin">Administrators</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification-type">Notification Type</Label>
                <Select
                  value={newNotification.notificationType}
                  onValueChange={(value) =>
                    setNewNotification({ ...newNotification, notificationType: value })
                  }
                >
                  <SelectTrigger id="notification-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="deadline_reminder">Deadline Reminder</SelectItem>
                    <SelectItem value="system_alert">System Alert</SelectItem>
                    <SelectItem value="academic_update">Academic Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newNotification.title}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, title: e.target.value })
                  }
                  placeholder="Notification title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newNotification.message}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, message: e.target.value })
                  }
                  placeholder="Notification message"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newNotification.priority}
                  onValueChange={(value) =>
                    setNewNotification({ ...newNotification, priority: value })
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNotification}>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
              <p className="text-xs text-muted-foreground">Successfully delivered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failed}</div>
              <p className="text-xs text-muted-foreground">Delivery failed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deliveryRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Success rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadNotifications}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Notification List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No notifications found</div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(notification.deliveryStatus)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{notification.title}</h4>
                            {getPriorityBadge(notification.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(notification.scheduledFor).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              {notification.channels.map((channel) => (
                                <span key={channel} className="flex items-center gap-1">
                                  {getChannelIcon(channel)}
                                </span>
                              ))}
                            </span>
                            <Badge variant="outline">{notification.recipientType}</Badge>
                          </div>
                          {notification.error && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              {notification.error}
                            </div>
                          )}
                        </div>
                      </div>
                      {notification.deliveryStatus === 'failed' && (
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
