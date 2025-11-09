import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ ScrollUniversity Spiritual Hooks — Christ governs formation");

// Fetchers
export async function getSpiritualMetrics() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  const { data, error } = await (supabase as any)
    .from("spiritual_metrics")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function updateSpiritualMetrics(updates: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("spiritual_metrics")
    .upsert({ user_id: user.id, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Hooks
export const useSpiritualMetrics = () =>
  useQuery({ queryKey: ["spiritual-metrics"], queryFn: getSpiritualMetrics });

export const useUpdateSpiritualMetrics = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateSpiritualMetrics,
    onSuccess: () => {
      toast({ title: "✅ Spiritual metrics updated" });
      qc.invalidateQueries({ queryKey: ["spiritual-metrics"] });
    },
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" })
  });
};
