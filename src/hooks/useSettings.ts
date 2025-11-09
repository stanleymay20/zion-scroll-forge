import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ ScrollUniversity Settings Hooks — Christ governs preferences");

// Fetchers
export async function getSettings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  const { data, error } = await (supabase as any)
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function updateSettings(updates: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("user_settings")
    .upsert({ user_id: user.id, ...updates })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Hooks
export const useSettings = () =>
  useQuery({ queryKey: ["settings"], queryFn: getSettings });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      toast({ title: "✅ Settings saved" });
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e: any) => toast({ title: "Save failed", description: e.message, variant: "destructive" })
  });
};
