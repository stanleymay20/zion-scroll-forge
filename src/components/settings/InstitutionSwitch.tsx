import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building2, Loader2 } from "lucide-react";
import { useInstitution } from "@/contexts/InstitutionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function InstitutionSwitch() {
  const { activeInstitution, memberships, loading, setActiveInstitution } = useInstitution();
  const queryClient = useQueryClient();

  const handleInstitutionChange = async (institutionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update user's current institution
      await (supabase as any)
        .from('profiles')
        .update({ current_institution_id: institutionId })
        .eq('id', user.id);

      await setActiveInstitution(institutionId);
      queryClient.invalidateQueries();
      toast({ title: "✅ Institution switched successfully" });
    } catch (error: any) {
      toast({ title: "Failed to switch institution", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!memberships || memberships.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Institution</CardTitle>
          <CardDescription>You are not a member of any institutions</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Institution</CardTitle>
        <CardDescription>Select your active institution</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={activeInstitution?.id || ""}
          onValueChange={handleInstitutionChange}
          className="space-y-3"
        >
          {memberships.map((membership) => (
            <div
              key={membership.institution.id}
              className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors"
            >
              <RadioGroupItem value={membership.institution.id} id={membership.institution.id} />
              <Label htmlFor={membership.institution.id} className="flex items-center gap-3 cursor-pointer flex-1">
                {membership.institution.logo_url ? (
                  <img src={membership.institution.logo_url} alt={membership.institution.name} className="h-8 w-8 rounded" />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
                <div>
                  <div className="font-medium">{membership.institution.name}</div>
                  {membership.institution.description && (
                    <div className="text-sm text-muted-foreground">{membership.institution.description}</div>
                  )}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
