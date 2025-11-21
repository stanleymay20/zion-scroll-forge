/**
 * System Configuration Component
 * Interface for managing system settings and configuration
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import adminService from '@/services/adminService';
import type { SystemConfiguration as SystemConfig, ConfigurationUpdate } from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';

export const SystemConfiguration: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const data = await adminService.getConfiguration();
      setConfig(data);
    } catch (err) {
      console.error('Failed to load configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: keyof SystemConfig, updates: Record<string, any>) => {
    if (!user) return;

    try {
      setSaving(true);
      const update: ConfigurationUpdate = {
        section,
        updates,
        updatedBy: user.id,
      };
      await adminService.updateConfiguration(update);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await loadConfiguration();
    } catch (err) {
      console.error('Failed to save configuration:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>Manage system settings and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          {saveSuccess && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Configuration saved successfully</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="limits">Limits</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Site Name</Label>
                  <Input
                    value={config.general.siteName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        general: { ...config.general, siteName: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Site URL</Label>
                  <Input
                    value={config.general.siteUrl}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        general: { ...config.general, siteUrl: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Support Email</Label>
                  <Input
                    type="email"
                    value={config.general.supportEmail}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        general: { ...config.general, supportEmail: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Maintenance Mode</Label>
                  <Switch
                    checked={config.general.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        general: { ...config.general, maintenanceMode: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Registration Enabled</Label>
                  <Switch
                    checked={config.general.registrationEnabled}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        general: { ...config.general, registrationEnabled: checked },
                      })
                    }
                  />
                </div>
                <Button onClick={() => handleSave('general', config.general)} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save General Settings
                </Button>
              </div>
            </TabsContent>

            {/* Feature Toggles */}
            <TabsContent value="features" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>AI Tutor</Label>
                  <Switch
                    checked={config.features.aiTutor}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        features: { ...config.features, aiTutor: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>ScrollCoin Economy</Label>
                  <Switch
                    checked={config.features.scrollCoin}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        features: { ...config.features, scrollCoin: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>ScrollBadge NFTs</Label>
                  <Switch
                    checked={config.features.scrollBadge}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        features: { ...config.features, scrollBadge: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Spiritual Formation</Label>
                  <Switch
                    checked={config.features.spiritualFormation}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        features: { ...config.features, spiritualFormation: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Community Feed</Label>
                  <Switch
                    checked={config.features.communityFeed}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        features: { ...config.features, communityFeed: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Study Groups</Label>
                  <Switch
                    checked={config.features.studyGroups}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        features: { ...config.features, studyGroups: checked },
                      })
                    }
                  />
                </div>
                <Button onClick={() => handleSave('features', config.features)} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Feature Settings
                </Button>
              </div>
            </TabsContent>

            {/* System Limits */}
            <TabsContent value="limits" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Max Enrollments Per Student</Label>
                  <Input
                    type="number"
                    value={config.limits.maxEnrollmentsPerStudent}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        limits: { ...config.limits, maxEnrollmentsPerStudent: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Max Courses Per Instructor</Label>
                  <Input
                    type="number"
                    value={config.limits.maxCoursesPerInstructor}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        limits: { ...config.limits, maxCoursesPerInstructor: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Max File Upload Size (MB)</Label>
                  <Input
                    type="number"
                    value={config.limits.maxFileUploadSize / 1024 / 1024}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        limits: { ...config.limits, maxFileUploadSize: parseInt(e.target.value) * 1024 * 1024 },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Max Video Length (minutes)</Label>
                  <Input
                    type="number"
                    value={config.limits.maxVideoLength / 60}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        limits: { ...config.limits, maxVideoLength: parseInt(e.target.value) * 60 },
                      })
                    }
                  />
                </div>
                <Button onClick={() => handleSave('limits', config.limits)} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Limit Settings
                </Button>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={config.security.sessionTimeout / 60}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        security: { ...config.security, sessionTimeout: parseInt(e.target.value) * 60 },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Password Min Length</Label>
                  <Input
                    type="number"
                    value={config.security.passwordMinLength}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        security: { ...config.security, passwordMinLength: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Max Login Attempts</Label>
                  <Input
                    type="number"
                    value={config.security.maxLoginAttempts}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        security: { ...config.security, maxLoginAttempts: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require Email Verification</Label>
                  <Switch
                    checked={config.security.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        security: { ...config.security, requireEmailVerification: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require 2FA</Label>
                  <Switch
                    checked={config.security.require2FA}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        security: { ...config.security, require2FA: checked },
                      })
                    }
                  />
                </div>
                <Button onClick={() => handleSave('security', config.security)} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </div>
            </TabsContent>

            {/* AI Settings */}
            <TabsContent value="ai" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>AI Provider</Label>
                  <Input value={config.ai.provider} disabled />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input
                    value={config.ai.model}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        ai: { ...config.ai, model: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    value={config.ai.maxTokens}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        ai: { ...config.ai, maxTokens: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Temperature</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={config.ai.temperature}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        ai: { ...config.ai, temperature: parseFloat(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable Caching</Label>
                  <Switch
                    checked={config.ai.enableCaching}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        ai: { ...config.ai, enableCaching: checked },
                      })
                    }
                  />
                </div>
                <Button onClick={() => handleSave('ai', config.ai)} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save AI Settings
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
