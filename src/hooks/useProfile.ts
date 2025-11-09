import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ ScrollUniversity Profile Hooks — Christ governs identity");

// Fetchers
export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateProfile(updates: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Hooks
export const useProfile = () =>
  useQuery({ queryKey: ["profile"], queryFn: getProfile });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast({ title: "✅ Profile updated successfully" });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" })
  });
};
