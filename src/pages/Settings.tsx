import { PageTemplate } from '@/components/layout/PageTemplate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import { InstitutionSwitch } from '@/components/settings/InstitutionSwitch';
import { User, Bell, Palette, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

console.info('✝️ Settings — Christ is Lord over preferences');

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string>();
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email);
      setUserId(user?.id);
    });
  }, []);

  return (
    <PageTemplate
      title="Settings"
      description="Manage your account preferences and settings"
    >
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 md:mb-8 gap-1">
          <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <User className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Theme</span>
          </TabsTrigger>
          <TabsTrigger value="institution" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Institution</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings userEmail={userEmail} userId={userId} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="theme">
          <ThemeSettings />
        </TabsContent>

        <TabsContent value="institution">
          <InstitutionSwitch />
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
