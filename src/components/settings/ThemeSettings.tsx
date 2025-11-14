import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";

const themeSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
});

type ThemeFormData = z.infer<typeof themeSchema>;

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const { handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<ThemeFormData>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      theme: (theme as "light" | "dark" | "system") || "system",
    },
  });

  const onSubmit = async (data: ThemeFormData) => {
    setTheme(data.theme);
    updateSettings.mutate({ theme: data.theme });
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
        <CardTitle>Theme Preferences</CardTitle>
        <CardDescription>Choose how the app looks to you</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <RadioGroup
            value={watch("theme")}
            onValueChange={(value) => setValue("theme", value as "light" | "dark" | "system")}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex items-center gap-3 cursor-pointer flex-1">
                <Sun className="h-5 w-5" />
                <div>
                  <div className="font-medium">Light</div>
                  <div className="text-sm text-muted-foreground">Bright and clear</div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex items-center gap-3 cursor-pointer flex-1">
                <Moon className="h-5 w-5" />
                <div>
                  <div className="font-medium">Dark</div>
                  <div className="text-sm text-muted-foreground">Easy on the eyes</div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system" className="flex items-center gap-3 cursor-pointer flex-1">
                <Monitor className="h-5 w-5" />
                <div>
                  <div className="font-medium">System</div>
                  <div className="text-sm text-muted-foreground">Use device settings</div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Theme"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
