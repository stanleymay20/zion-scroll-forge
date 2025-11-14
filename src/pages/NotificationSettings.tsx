import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/useNotifications';
import { Bell } from 'lucide-react';

export default function NotificationSettings() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  if (isLoading) {
    return <PageTemplate title="Notification Settings" description="Manage your notification preferences">
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading preferences...</p>
      </div>
    </PageTemplate>;
  }

  const currentPrefs = preferences || {
    channel_email: true,
    channel_inapp: true,
    channel_push: false,
    tutor_updates: true,
    course_updates: true,
    spiritual_updates: true,
    system_updates: true,
  };

  const handleToggle = (key: string, value: boolean) => {
    updatePreferences.mutate({
      ...currentPrefs,
      [key]: value,
    });
  };

  return (
    <PageTemplate
      title="Notification Settings"
      description="✝️ Manage how you receive updates from ScrollUniversity"
    >
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Channels
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications within the platform
                </p>
              </div>
              <Switch
                checked={currentPrefs.channel_inapp}
                onCheckedChange={(checked) => handleToggle('channel_inapp', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={currentPrefs.channel_email}
                onCheckedChange={(checked) => handleToggle('channel_email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser push notifications
                </p>
              </div>
              <Switch
                checked={currentPrefs.channel_push}
                onCheckedChange={(checked) => handleToggle('channel_push', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Categories</CardTitle>
            <CardDescription>
              Choose which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>AI Tutor Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Messages and responses from your AI tutors
                </p>
              </div>
              <Switch
                checked={currentPrefs.tutor_updates}
                onCheckedChange={(checked) => handleToggle('tutor_updates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Course Updates</Label>
                <p className="text-sm text-muted-foreground">
                  New modules, assignments, and course announcements
                </p>
              </div>
              <Switch
                checked={currentPrefs.course_updates}
                onCheckedChange={(checked) => handleToggle('course_updates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Spiritual Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Prayer reminders and spiritual formation milestones
                </p>
              </div>
              <Switch
                checked={currentPrefs.spiritual_updates}
                onCheckedChange={(checked) => handleToggle('spiritual_updates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Platform updates and important announcements
                </p>
              </div>
              <Switch
                checked={currentPrefs.system_updates}
                onCheckedChange={(checked) => handleToggle('system_updates', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}