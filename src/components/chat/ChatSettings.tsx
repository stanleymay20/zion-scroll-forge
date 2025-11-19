/**
 * Chat Settings Component
 * Notification preferences and chat configuration
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Lock, Palette } from 'lucide-react';
import type { ChatSettings as ChatSettingsType } from '@/types/chat';

interface ChatSettingsProps {
  settings: ChatSettingsType;
  onUpdate: (settings: Partial<ChatSettingsType>) => void;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({
  settings,
  onUpdate
}) => {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6">
        {/* Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications-enabled">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for new messages
                </p>
              </div>
              <Switch
                id="notifications-enabled"
                checked={settings.notifications.enabled}
                onCheckedChange={(checked) =>
                  onUpdate({
                    notifications: {
                      ...settings.notifications,
                      enabled: checked
                    }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications-sound">Sound</Label>
                <p className="text-sm text-muted-foreground">
                  Play sound for new messages
                </p>
              </div>
              <Switch
                id="notifications-sound"
                checked={settings.notifications.sound}
                onCheckedChange={(checked) =>
                  onUpdate({
                    notifications: {
                      ...settings.notifications,
                      sound: checked
                    }
                  })
                }
                disabled={!settings.notifications.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications-desktop">Desktop Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show desktop notifications
                </p>
              </div>
              <Switch
                id="notifications-desktop"
                checked={settings.notifications.desktop}
                onCheckedChange={(checked) =>
                  onUpdate({
                    notifications: {
                      ...settings.notifications,
                      desktop: checked
                    }
                  })
                }
                disabled={!settings.notifications.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications-mentions">Mentions Only</Label>
                <p className="text-sm text-muted-foreground">
                  Only notify when mentioned
                </p>
              </div>
              <Switch
                id="notifications-mentions"
                checked={settings.notifications.mentions}
                onCheckedChange={(checked) =>
                  onUpdate({
                    notifications: {
                      ...settings.notifications,
                      mentions: checked
                    }
                  })
                }
                disabled={!settings.notifications.enabled}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Privacy */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Privacy</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="privacy-online-status">Show Online Status</Label>
                <p className="text-sm text-muted-foreground">
                  Let others see when you're online
                </p>
              </div>
              <Switch
                id="privacy-online-status"
                checked={settings.privacy.showOnlineStatus}
                onCheckedChange={(checked) =>
                  onUpdate({
                    privacy: {
                      ...settings.privacy,
                      showOnlineStatus: checked
                    }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="privacy-read-receipts">Read Receipts</Label>
                <p className="text-sm text-muted-foreground">
                  Show when you've read messages
                </p>
              </div>
              <Switch
                id="privacy-read-receipts"
                checked={settings.privacy.showReadReceipts}
                onCheckedChange={(checked) =>
                  onUpdate({
                    privacy: {
                      ...settings.privacy,
                      showReadReceipts: checked
                    }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="privacy-direct-messages">Allow Direct Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Let anyone send you direct messages
                </p>
              </div>
              <Switch
                id="privacy-direct-messages"
                checked={settings.privacy.allowDirectMessages}
                onCheckedChange={(checked) =>
                  onUpdate({
                    privacy: {
                      ...settings.privacy,
                      allowDirectMessages: checked
                    }
                  })
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Appearance */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Appearance</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <RadioGroup
                value={settings.appearance.theme}
                onValueChange={(value) =>
                  onUpdate({
                    appearance: {
                      ...settings.appearance,
                      theme: value as 'light' | 'dark' | 'auto'
                    }
                  })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light" className="font-normal">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark" className="font-normal">Dark</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="auto" id="theme-auto" />
                  <Label htmlFor="theme-auto" className="font-normal">Auto</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Font Size</Label>
              <RadioGroup
                value={settings.appearance.fontSize}
                onValueChange={(value) =>
                  onUpdate({
                    appearance: {
                      ...settings.appearance,
                      fontSize: value as 'small' | 'medium' | 'large'
                    }
                  })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="font-small" />
                  <Label htmlFor="font-small" className="font-normal">Small</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="font-medium" />
                  <Label htmlFor="font-medium" className="font-normal">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="font-large" />
                  <Label htmlFor="font-large" className="font-normal">Large</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="appearance-compact">Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Reduce spacing between messages
                </p>
              </div>
              <Switch
                id="appearance-compact"
                checked={settings.appearance.compactMode}
                onCheckedChange={(checked) =>
                  onUpdate({
                    appearance: {
                      ...settings.appearance,
                      compactMode: checked
                    }
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default ChatSettings;
