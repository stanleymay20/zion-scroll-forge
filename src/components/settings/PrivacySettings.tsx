/**
 * Privacy Settings Component
 * "Guard your heart above all else, for it determines the course of your life" - Proverbs 4:23
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Shield, Eye, EyeOff, Users, Globe } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPrivacySettings, updatePrivacySettings } from "@/services/settingsService";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const privacySchema = z.object({
  profileVisibility: z.enum(["public", "private", "friends_only"]),
  showEmail: z.boolean(),
  showPhoneNumber: z.boolean(),
  showLocation: z.boolean(),
  showDateOfBirth: z.boolean(),
  showCourseProgress: z.boolean(),
  showAchievements: z.boolean(),
  showScrollCoinBalance: z.boolean(),
  showSpiritualGrowth: z.boolean(),
  allowMessagesFrom: z.enum(["everyone", "connections", "nobody"]),
  allowFriendRequests: z.boolean(),
  allowStudyGroupInvites: z.boolean(),
  allowDataAnalytics: z.boolean(),
  allowPersonalization: z.boolean(),
  allowThirdPartySharing: z.boolean(),
  appearInSearch: z.boolean(),
  showInLeaderboards: z.boolean(),
});

type PrivacyFormData = z.infer<typeof privacySchema>;

export function PrivacySettings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["privacy-settings"],
    queryFn: getPrivacySettings,
  });

  const mutation = useMutation({
    mutationFn: updatePrivacySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy-settings"] });
      toast({ title: "✅ Privacy settings updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update privacy settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<PrivacyFormData>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      profileVisibility: settings?.profileVisibility || "public",
      showEmail: settings?.showEmail ?? false,
      showPhoneNumber: settings?.showPhoneNumber ?? false,
      showLocation: settings?.showLocation ?? true,
      showDateOfBirth: settings?.showDateOfBirth ?? false,
      showCourseProgress: settings?.showCourseProgress ?? true,
      showAchievements: settings?.showAchievements ?? true,
      showScrollCoinBalance: settings?.showScrollCoinBalance ?? false,
      showSpiritualGrowth: settings?.showSpiritualGrowth ?? true,
      allowMessagesFrom: settings?.allowMessagesFrom || "everyone",
      allowFriendRequests: settings?.allowFriendRequests ?? true,
      allowStudyGroupInvites: settings?.allowStudyGroupInvites ?? true,
      allowDataAnalytics: settings?.allowDataAnalytics ?? true,
      allowPersonalization: settings?.allowPersonalization ?? true,
      allowThirdPartySharing: settings?.allowThirdPartySharing ?? false,
      appearInSearch: settings?.appearInSearch ?? true,
      showInLeaderboards: settings?.showInLeaderboards ?? true,
    },
  });

  const onSubmit = async (data: PrivacyFormData) => {
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
          <Shield className="h-5 w-5" />
          <CardTitle>Privacy Settings</CardTitle>
        </div>
        <CardDescription>Control who can see your information and activity</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Visibility */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">Who can see your profile</p>
            </div>
            <RadioGroup
              value={watch("profileVisibility")}
              onValueChange={(value) => setValue("profileVisibility", value as any)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 border rounded-lg p-3">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Globe className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Public</div>
                    <div className="text-sm text-muted-foreground">Anyone can see your profile</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 border rounded-lg p-3">
                <RadioGroupItem value="friends_only" id="friends_only" />
                <Label htmlFor="friends_only" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Users className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Friends Only</div>
                    <div className="text-sm text-muted-foreground">Only your connections can see</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 border rounded-lg p-3">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer flex-1">
                  <EyeOff className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Private</div>
                    <div className="text-sm text-muted-foreground">Only you can see your profile</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Contact Information</Label>
              <p className="text-sm text-muted-foreground">Choose what contact details to display</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showEmail">Show Email Address</Label>
                  <p className="text-sm text-muted-foreground">Display your email on your profile</p>
                </div>
                <Switch
                  id="showEmail"
                  checked={watch("showEmail")}
                  onCheckedChange={(checked) => setValue("showEmail", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showPhoneNumber">Show Phone Number</Label>
                  <p className="text-sm text-muted-foreground">Display your phone number</p>
                </div>
                <Switch
                  id="showPhoneNumber"
                  checked={watch("showPhoneNumber")}
                  onCheckedChange={(checked) => setValue("showPhoneNumber", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showLocation">Show Location</Label>
                  <p className="text-sm text-muted-foreground">Display your city/country</p>
                </div>
                <Switch
                  id="showLocation"
                  checked={watch("showLocation")}
                  onCheckedChange={(checked) => setValue("showLocation", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showDateOfBirth">Show Date of Birth</Label>
                  <p className="text-sm text-muted-foreground">Display your birthday</p>
                </div>
                <Switch
                  id="showDateOfBirth"
                  checked={watch("showDateOfBirth")}
                  onCheckedChange={(checked) => setValue("showDateOfBirth", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Activity Visibility */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Activity Visibility</Label>
              <p className="text-sm text-muted-foreground">Control what activities are visible</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showCourseProgress">Show Course Progress</Label>
                  <p className="text-sm text-muted-foreground">Display your learning progress</p>
                </div>
                <Switch
                  id="showCourseProgress"
                  checked={watch("showCourseProgress")}
                  onCheckedChange={(checked) => setValue("showCourseProgress", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showAchievements">Show Achievements</Label>
                  <p className="text-sm text-muted-foreground">Display your badges and awards</p>
                </div>
                <Switch
                  id="showAchievements"
                  checked={watch("showAchievements")}
                  onCheckedChange={(checked) => setValue("showAchievements", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showScrollCoinBalance">Show ScrollCoin Balance</Label>
                  <p className="text-sm text-muted-foreground">Display your wallet balance</p>
                </div>
                <Switch
                  id="showScrollCoinBalance"
                  checked={watch("showScrollCoinBalance")}
                  onCheckedChange={(checked) => setValue("showScrollCoinBalance", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showSpiritualGrowth">Show Spiritual Growth</Label>
                  <p className="text-sm text-muted-foreground">Display your spiritual formation progress</p>
                </div>
                <Switch
                  id="showSpiritualGrowth"
                  checked={watch("showSpiritualGrowth")}
                  onCheckedChange={(checked) => setValue("showSpiritualGrowth", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Communication Preferences */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Communication</Label>
              <p className="text-sm text-muted-foreground">Control who can contact you</p>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Allow Messages From</Label>
                <RadioGroup
                  value={watch("allowMessagesFrom")}
                  onValueChange={(value) => setValue("allowMessagesFrom", value as any)}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="everyone" id="msg-everyone" />
                    <Label htmlFor="msg-everyone" className="cursor-pointer">Everyone</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="connections" id="msg-connections" />
                    <Label htmlFor="msg-connections" className="cursor-pointer">Connections only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nobody" id="msg-nobody" />
                    <Label htmlFor="msg-nobody" className="cursor-pointer">Nobody</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowFriendRequests">Allow Friend Requests</Label>
                  <p className="text-sm text-muted-foreground">Let others send you friend requests</p>
                </div>
                <Switch
                  id="allowFriendRequests"
                  checked={watch("allowFriendRequests")}
                  onCheckedChange={(checked) => setValue("allowFriendRequests", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowStudyGroupInvites">Allow Study Group Invites</Label>
                  <p className="text-sm text-muted-foreground">Let others invite you to study groups</p>
                </div>
                <Switch
                  id="allowStudyGroupInvites"
                  checked={watch("allowStudyGroupInvites")}
                  onCheckedChange={(checked) => setValue("allowStudyGroupInvites", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Data & Analytics */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Data & Analytics</Label>
              <p className="text-sm text-muted-foreground">Control how your data is used</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowDataAnalytics">Allow Data Analytics</Label>
                  <p className="text-sm text-muted-foreground">Help us improve the platform</p>
                </div>
                <Switch
                  id="allowDataAnalytics"
                  checked={watch("allowDataAnalytics")}
                  onCheckedChange={(checked) => setValue("allowDataAnalytics", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowPersonalization">Allow Personalization</Label>
                  <p className="text-sm text-muted-foreground">Get personalized recommendations</p>
                </div>
                <Switch
                  id="allowPersonalization"
                  checked={watch("allowPersonalization")}
                  onCheckedChange={(checked) => setValue("allowPersonalization", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowThirdPartySharing">Allow Third-Party Sharing</Label>
                  <p className="text-sm text-muted-foreground">Share data with trusted partners</p>
                </div>
                <Switch
                  id="allowThirdPartySharing"
                  checked={watch("allowThirdPartySharing")}
                  onCheckedChange={(checked) => setValue("allowThirdPartySharing", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Discovery */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Search & Discovery</Label>
              <p className="text-sm text-muted-foreground">Control your visibility in search and rankings</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="appearInSearch">Appear in Search Results</Label>
                  <p className="text-sm text-muted-foreground">Let others find you via search</p>
                </div>
                <Switch
                  id="appearInSearch"
                  checked={watch("appearInSearch")}
                  onCheckedChange={(checked) => setValue("appearInSearch", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showInLeaderboards">Show in Leaderboards</Label>
                  <p className="text-sm text-muted-foreground">Display your ranking publicly</p>
                </div>
                <Switch
                  id="showInLeaderboards"
                  checked={watch("showInLeaderboards")}
                  onCheckedChange={(checked) => setValue("showInLeaderboards", checked)}
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting || mutation.isPending}>
            {(isSubmitting || mutation.isPending) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Privacy Settings"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
