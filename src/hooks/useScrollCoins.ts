/**
 * ScrollCoins Hooks - Backwards Compatibility
 * 
 * This file re-exports ScrollGold hooks for backwards compatibility.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getUserFriendlyError } from "@/lib/errors";

console.info("✝️ ScrollUniversity ScrollGold Hooks — Christ governs rewards");

// Mutations
export async function addScrollGold(amount: number) {
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
export const useAddScrollGold = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addScrollGold,
    onSuccess: (data) => {
      toast({ title: `🪙 +${data.amount} ScrollGold earned!`, description: "Keep building the Kingdom" });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: any) => toast({ title: "Reward failed", description: getUserFriendlyError(e), variant: "destructive" })
  });
};

// Backwards compatibility
export const addScrollCoins = addScrollGold;
export const useAddScrollCoins = useAddScrollGold;
