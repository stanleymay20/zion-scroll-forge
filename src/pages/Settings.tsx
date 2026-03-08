import { PageTemplate } from '@/components/layout/PageTemplate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { LanguageSettings } from '@/components/settings/LanguageSettings';
import { AccessibilitySettings } from '@/components/settings/AccessibilitySettings';
import { InstitutionSwitch } from '@/components/settings/InstitutionSwitch';
import { StorageManager } from '@/components/pwa';
import { User, Bell, Palette, Building2, Shield, Lock, Globe, Accessibility, HardDrive } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string>();
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email);
      setUserId(user?.id);
    });
  }, []);

  const tabs = [
    { value: "profile", label: "Profile", icon: User },
    { value: "notifications", label: "Notifications", icon: Bell },
    { value: "privacy", label: "Privacy", icon: Shield },
    { value: "security", label: "Security", icon: Lock },
    { value: "language", label: "Language", icon: Globe },
    { value: "theme", label: "Theme", icon: Palette },
    { value: "accessibility", label: "Accessibility", icon: Accessibility },
    { value: "institution", label: "Institution", icon: Building2 },
    { value: "storage", label: "Storage", icon: HardDrive },
  ];

  return (
    <PageTemplate
      title="Settings"
      description="Manage your account preferences and settings"
    >
      <Tabs defaultValue="profile" className="w-full">
        <ScrollArea className="w-full mb-6">
          <TabsList className="inline-flex w-max gap-1 p-1">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs sm:text-sm px-3 whitespace-nowrap"
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value="profile"><ProfileSettings userEmail={userEmail} userId={userId} /></TabsContent>
        <TabsContent value="notifications"><NotificationSettings /></TabsContent>
        <TabsContent value="privacy"><PrivacySettings /></TabsContent>
        <TabsContent value="security"><SecuritySettings /></TabsContent>
        <TabsContent value="language"><LanguageSettings /></TabsContent>
        <TabsContent value="theme"><ThemeSettings /></TabsContent>
        <TabsContent value="accessibility"><AccessibilitySettings /></TabsContent>
        <TabsContent value="institution"><InstitutionSwitch /></TabsContent>
        <TabsContent value="storage"><StorageManager /></TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
