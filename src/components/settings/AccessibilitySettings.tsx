/**
 * Accessibility Settings Component
 * "The Lord opens the eyes of the blind" - Psalm 146:8
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Accessibility, Eye, Keyboard, Type, Zap } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserSettings, updateUserSettings } from "@/services/settingsService";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const accessibilitySchema = z.object({
  screenReaderEnabled: z.boolean(),
  highContrastMode: z.boolean(),
  keyboardNavigationEnabled: z.boolean(),
  fontSize: z.enum(["small", "medium", "large"]),
  reducedMotion: z.boolean(),
  closedCaptionsEnabled: z.boolean(),
  autoPlayVideos: z.boolean(),
  videoQuality: z.enum(["auto", "high", "medium", "low"]),
});

type AccessibilityFormData = z.infer<typeof accessibilitySchema>;

export function AccessibilitySettings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["user-settings"],
    queryFn: getUserSettings,
  });

  const mutation = useMutation({
    mutationFn: updateUserSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      toast({ title: "✅ Accessibility settings updated successfully" });
      
      // Apply settings immediately
      const root = document.documentElement;
      const fontSize = watch("fontSize");
      if (fontSize === "small") {
        root.style.fontSize = "14px";
      } else if (fontSize === "large") {
        root.style.fontSize = "18px";
      } else {
        root.style.fontSize = "16px";
      }
      
      if (watch("highContrastMode")) {
        root.classList.add("high-contrast");
      } else {
        root.classList.remove("high-contrast");
      }
      
      if (watch("reducedMotion")) {
        root.style.setProperty("--animation-duration", "0.01ms");
      } else {
        root.style.removeProperty("--animation-duration");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update accessibility settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<AccessibilityFormData>({
    resolver: zodResolver(accessibilitySchema),
    defaultValues: {
      screenReaderEnabled: settings?.screenReaderEnabled ?? false,
      highContrastMode: settings?.highContrastMode ?? false,
      keyboardNavigationEnabled: settings?.keyboardNavigationEnabled ?? true,
      fontSize: settings?.fontSize || "medium",
      reducedMotion: false,
      closedCaptionsEnabled: settings?.closedCaptionsEnabled ?? false,
      autoPlayVideos: settings?.autoPlayVideos ?? true,
      videoQuality: settings?.videoQuality || "auto",
    },
  });

  const onSubmit = async (data: AccessibilityFormData) => {
    mutation.mutate(data);
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
        <div className="flex items-center gap-2">
          <Accessibility className="h-5 w-5" />
          <CardTitle>Accessibility Settings</CardTitle>
        </div>
        <CardDescription>Customize the platform to meet your accessibility needs</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Visual Accessibility */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <Label className="text-base font-semibold">Visual Accessibility</Label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="screenReaderEnabled">Screen Reader Support</Label>
                  <p className="text-sm text-muted-foreground">
                    Optimize interface for screen readers
                  </p>
                </div>
                <Switch
                  id="screenReaderEnabled"
                  checked={watch("screenReaderEnabled")}
                  onCheckedChange={(checked) => setValue("screenReaderEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="highContrastMode">High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch
                  id="highContrastMode"
                  checked={watch("highContrastMode")}
                  onCheckedChange={(checked) => setValue("highContrastMode", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Font Size
                </Label>
                <RadioGroup
                  value={watch("fontSize")}
                  onValueChange={(value) => setValue("fontSize", value as any)}
                  className="grid grid-cols-3 gap-2"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="small" id="small" />
                    <Label htmlFor="small" className="cursor-pointer flex-1">
                      <div className="font-medium text-sm">Small</div>
                      <div className="text-xs text-muted-foreground">14px</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="cursor-pointer flex-1">
                      <div className="font-medium">Medium</div>
                      <div className="text-xs text-muted-foreground">16px</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="large" id="large" />
                    <Label htmlFor="large" className="cursor-pointer flex-1">
                      <div className="font-medium text-lg">Large</div>
                      <div className="text-xs text-muted-foreground">18px</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <Separator />

          {/* Motion & Animation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <Label className="text-base font-semibold">Motion & Animation</Label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reducedMotion">Reduce Motion</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations and transitions
                  </p>
                </div>
                <Switch
                  id="reducedMotion"
                  checked={watch("reducedMotion")}
                  onCheckedChange={(checked) => setValue("reducedMotion", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Keyboard Navigation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              <Label className="text-base font-semibold">Keyboard Navigation</Label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="keyboardNavigationEnabled">Enhanced Keyboard Navigation</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable keyboard shortcuts and focus indicators
                  </p>
                </div>
                <Switch
                  id="keyboardNavigationEnabled"
                  checked={watch("keyboardNavigationEnabled")}
                  onCheckedChange={(checked) => setValue("keyboardNavigationEnabled", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Video & Media */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Video & Media Preferences</Label>
              <p className="text-sm text-muted-foreground">Control how videos and media are displayed</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="closedCaptionsEnabled">Closed Captions</Label>
                  <p className="text-sm text-muted-foreground">
                    Always show captions on videos
                  </p>
                </div>
                <Switch
                  id="closedCaptionsEnabled"
                  checked={watch("closedCaptionsEnabled")}
                  onCheckedChange={(checked) => setValue("closedCaptionsEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoPlayVideos">Auto-play Videos</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically start video playback
                  </p>
                </div>
                <Switch
                  id="autoPlayVideos"
                  checked={watch("autoPlayVideos")}
                  onCheckedChange={(checked) => setValue("autoPlayVideos", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoQuality">Default Video Quality</Label>
                <RadioGroup
                  value={watch("videoQuality")}
                  onValueChange={(value) => setValue("videoQuality", value as any)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="auto" id="auto" />
                    <Label htmlFor="auto" className="cursor-pointer flex-1">
                      <div className="font-medium">Auto</div>
                      <div className="text-sm text-muted-foreground">Adjust based on connection</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="cursor-pointer flex-1">
                      <div className="font-medium">High (1080p)</div>
                      <div className="text-sm text-muted-foreground">Best quality</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="medium" id="medium-quality" />
                    <Label htmlFor="medium-quality" className="cursor-pointer flex-1">
                      <div className="font-medium">Medium (720p)</div>
                      <div className="text-sm text-muted-foreground">Balanced</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="cursor-pointer flex-1">
                      <div className="font-medium">Low (480p)</div>
                      <div className="text-sm text-muted-foreground">Save bandwidth</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <Separator />

          {/* Accessibility Resources */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <Label className="text-sm font-semibold">Accessibility Resources</Label>
            <p className="text-sm text-muted-foreground">
              Need help with accessibility features? Visit our{" "}
              <a href="/help/accessibility" className="text-primary hover:underline">
                Accessibility Guide
              </a>{" "}
              or contact{" "}
              <a href="mailto:accessibility@scrolluniversity.org" className="text-primary hover:underline">
                accessibility@scrolluniversity.org
              </a>
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting || mutation.isPending}>
            {(isSubmitting || mutation.isPending) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Accessibility Settings"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
