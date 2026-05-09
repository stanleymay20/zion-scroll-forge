import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getUserFriendlyError } from "@/lib/errors";

console.info("✝️ ScrollUniversity ScrollGold Economy — Christ governs all provision");

// Types
export interface ScrollGoldTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'earned' | 'spent' | 'rewarded' | 'purchased' | 'transferred';
  source: string;
  related_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Fetchers
export async function getScrollGoldTransactions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("scrollcoin_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return data as ScrollGoldTransaction[];
}

export async function getScrollGoldBalance() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("scrollcoin_transactions")
    .select("amount")
    .eq("user_id", user.id);

  if (error) throw error;

  const balance = (data || []).reduce((sum: number, tx: any) => sum + tx.amount, 0);
  return balance;
}

export async function awardScrollGold(params: {
  amount: number;
  source: string;
  related_id?: string;
  description?: string;
  metadata?: Record<string, any>;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("scrollcoin_transactions")
    .insert({
      user_id: user.id,
      amount: params.amount,
      transaction_type: "earned",
      source: params.source,
      related_id: params.related_id,
      description: params.description,
      metadata: params.metadata
    })
    .select()
    .single();

  if (error) throw error;
  return data as ScrollGoldTransaction;
}

export async function spendScrollGold(params: {
  amount: number;
  source: string;
  related_id?: string;
  description?: string;
  metadata?: Record<string, any>;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if user has enough balance
  const balance = await getScrollGoldBalance();
  if (balance < params.amount) {
    throw new Error("Insufficient ScrollGold balance");
  }

  const { data, error } = await (supabase as any)
    .from("scrollcoin_transactions")
    .insert({
      user_id: user.id,
      amount: -params.amount, // Negative for spending
      transaction_type: "spent",
      source: params.source,
      related_id: params.related_id,
      description: params.description,
      metadata: params.metadata
    })
    .select()
    .single();

  if (error) throw error;
  return data as ScrollGoldTransaction;
}

export async function getScrollGoldLeaderboard(limit: number = 10) {
  // Get top earners
  const { data, error } = await (supabase as any)
    .from("scrollcoin_transactions")
    .select("user_id, amount")
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Aggregate by user
  const userBalances = new Map<string, number>();
  data?.forEach((tx: any) => {
    const current = userBalances.get(tx.user_id) || 0;
    userBalances.set(tx.user_id, current + tx.amount);
  });

  // Convert to array and sort
  const leaderboard = Array.from(userBalances.entries())
    .map(([user_id, balance]) => ({ user_id, balance }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, limit);

  // Get user details
  const userIds = leaderboard.map(entry => entry.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", userIds);

  return leaderboard.map(entry => ({
    ...entry,
    profile: profiles?.find(p => p.id === entry.user_id)
  }));
}

// Hooks
export const useScrollGoldTransactions = () =>
  useQuery({ queryKey: ["scrollgold-transactions"], queryFn: getScrollGoldTransactions });

export const useScrollGoldBalance = () =>
  useQuery({ queryKey: ["scrollgold-balance"], queryFn: getScrollGoldBalance });

export const useAwardScrollGold = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: awardScrollGold,
    onSuccess: () => {
      toast({ title: "✝️ ScrollGold awarded — God rewards faithfulness!" });
      qc.invalidateQueries({ queryKey: ["scrollgold-transactions"] });
      qc.invalidateQueries({ queryKey: ["scrollgold-balance"] });
    },
    onError: (e: any) => toast({
      title: "Failed to award ScrollGold",
      description: getUserFriendlyError(e),
      variant: "destructive"
    })
  });
};

export const useSpendScrollGold = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: spendScrollGold,
    onSuccess: () => {
      toast({ title: "✅ ScrollGold spent" });
      qc.invalidateQueries({ queryKey: ["scrollgold-transactions"] });
      qc.invalidateQueries({ queryKey: ["scrollgold-balance"] });
    },
    onError: (e: any) => toast({
      title: "Failed to spend ScrollGold",
      description: getUserFriendlyError(e),
      variant: "destructive"
    })
  });
};

export const useScrollGoldLeaderboard = (limit: number = 10) =>
  useQuery({
    queryKey: ["scrollgold-leaderboard", limit],
    queryFn: () => getScrollGoldLeaderboard(limit)
  });

// Re-export for backwards compatibility
export const useScrollCoinTransactions = useScrollGoldTransactions;
export const useScrollCoinBalance = useScrollGoldBalance;
export const useAwardScrollCoins = useAwardScrollGold;
export const useSpendScrollCoins = useSpendScrollGold;
export const useScrollCoinLeaderboard = useScrollGoldLeaderboard;
