import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ ScrollUniversity ScrollCoin Hooks — Christ governs rewards");

// Mutations
export async function addScrollCoins(amount: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await (supabase as any).rpc("add_scrollcoins", { 
    uid: user.id, 
    amount 
  });

  if (error) throw error;
  return { success: true, amount };
}

// Hooks
export const useAddScrollCoins = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addScrollCoins,
    onSuccess: (data) => {
      toast({ title: `🪙 +${data.amount} ScrollCoins earned!`, description: "Keep building the Kingdom" });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: any) => toast({ title: "Reward failed", description: e.message, variant: "destructive" })
  });
};
