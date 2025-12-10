import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ ScrollUniversity ScrollGold Hooks — Christ governs rewards");

// Mutations
export async function addScrollGolds(amount: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await (supabase as any).rpc("add_ScrollGolds", { 
    uid: user.id, 
    amount 
  });

  if (error) throw error;
  return { success: true, amount };
}

// Hooks
export const useAddScrollGolds = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addScrollGolds,
    onSuccess: (data) => {
      toast({ title: `🪙 +${data.amount} ScrollGolds earned!`, description: "Keep building the Kingdom" });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: any) => toast({ title: "Reward failed", description: e.message, variant: "destructive" })
  });
};
