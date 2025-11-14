import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";

const notificationSchema = z.object({
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  marketing_emails: z.boolean(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export function NotificationSettings() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_notifications: settings?.email_notifications ?? true,
      push_notifications: settings?.push_notifications ?? true,
      sms_notifications: settings?.sms_notifications ?? false,
      marketing_emails: settings?.marketing_emails ?? false,
    },
  });

  const onSubmit = async (data: NotificationFormData) => {
    updateSettings.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose how you want to be notified</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email_notifications"
                checked={watch("email_notifications")}
                onCheckedChange={(checked) => setValue("email_notifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push_notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications in your browser
                </p>
              </div>
              <Switch
                id="push_notifications"
                checked={watch("push_notifications")}
                onCheckedChange={(checked) => setValue("push_notifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms_notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important updates via SMS
                </p>
              </div>
              <Switch
                id="sms_notifications"
                checked={watch("sms_notifications")}
                onCheckedChange={(checked) => setValue("sms_notifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing_emails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features and courses
                </p>
              </div>
              <Switch
                id="marketing_emails"
                checked={watch("marketing_emails")}
                onCheckedChange={(checked) => setValue("marketing_emails", checked)}
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
