/**
 * Language and Localization Settings Component
 * "Go and make disciples of all nations" - Matthew 28:19
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Globe, Clock, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserSettings, updateUserSettings, getSupportedLanguages, getTimeZones } from "@/services/settingsService";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const languageSchema = z.object({
  language: z.string(),
  timeZone: z.string(),
  dateFormat: z.string(),
  timeFormat: z.enum(["12h", "24h"]),
});

type LanguageFormData = z.infer<typeof languageSchema>;

export function LanguageSettings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["user-settings"],
    queryFn: getUserSettings,
  });

  const languages = getSupportedLanguages();
  const timeZones = getTimeZones();

  const mutation = useMutation({
    mutationFn: updateUserSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      toast({ title: "✅ Language settings updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update language settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<LanguageFormData>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      language: settings?.language || 'en',
      timeZone: settings?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: settings?.dateFormat || 'MM/DD/YYYY',
      timeFormat: settings?.timeFormat || '12h',
    },
  });

  const onSubmit = async (data: LanguageFormData) => {
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
          <Globe className="h-5 w-5" />
          <CardTitle>Language & Localization</CardTitle>
        </div>
        <CardDescription>Customize your language and regional preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Language</Label>
              <p className="text-sm text-muted-foreground">Choose your preferred language</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Display Language</Label>
              <Select
                value={watch("language")}
                onValueChange={(value) => setValue("language", value)}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The language used throughout the platform
              </p>
            </div>
          </div>

          <Separator />

          {/* Time Zone */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Label className="text-base font-semibold">Time Zone</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeZone">Your Time Zone</Label>
              <Select
                value={watch("timeZone")}
                onValueChange={(value) => setValue("timeZone", value)}
              >
                <SelectTrigger id="timeZone">
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {timeZones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Used for displaying dates and times
              </p>
            </div>
          </div>

          <Separator />

          {/* Date Format */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Label className="text-base font-semibold">Date & Time Format</Label>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={watch("dateFormat")}
                  onValueChange={(value) => setValue("dateFormat", value)}
                >
                  <SelectTrigger id="dateFormat">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">
                      MM/DD/YYYY (12/31/2024)
                    </SelectItem>
                    <SelectItem value="DD/MM/YYYY">
                      DD/MM/YYYY (31/12/2024)
                    </SelectItem>
                    <SelectItem value="YYYY-MM-DD">
                      YYYY-MM-DD (2024-12-31)
                    </SelectItem>
                    <SelectItem value="DD MMM YYYY">
                      DD MMM YYYY (31 Dec 2024)
                    </SelectItem>
                    <SelectItem value="MMM DD, YYYY">
                      MMM DD, YYYY (Dec 31, 2024)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Time Format</Label>
                <RadioGroup
                  value={watch("timeFormat")}
                  onValueChange={(value) => setValue("timeFormat", value as "12h" | "24h")}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-3 border rounded-lg p-3">
                    <RadioGroupItem value="12h" id="12h" />
                    <Label htmlFor="12h" className="cursor-pointer flex-1">
                      <div className="font-medium">12-hour</div>
                      <div className="text-sm text-muted-foreground">2:30 PM</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-3">
                    <RadioGroupItem value="24h" id="24h" />
                    <Label htmlFor="24h" className="cursor-pointer flex-1">
                      <div className="font-medium">24-hour</div>
                      <div className="text-sm text-muted-foreground">14:30</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <Separator />

          {/* Preview */}
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <Label className="text-sm font-semibold">Preview</Label>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Date:</span>{' '}
                {new Date().toLocaleDateString(watch("language"), {
                  timeZone: watch("timeZone"),
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}
              </p>
              <p>
                <span className="text-muted-foreground">Time:</span>{' '}
                {new Date().toLocaleTimeString(watch("language"), {
                  timeZone: watch("timeZone"),
                  hour12: watch("timeFormat") === '12h',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p>
                <span className="text-muted-foreground">Time Zone:</span> {watch("timeZone")}
              </p>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting || mutation.isPending}>
            {(isSubmitting || mutation.isPending) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Language Settings"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
