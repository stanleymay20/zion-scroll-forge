import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ ScrollUniversity Prayer Journal — Christ hears every prayer");

// Types
export interface PrayerEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  prayer_type: 'general' | 'intercession' | 'thanksgiving' | 'confession' | 'petition';
  status: 'pending' | 'answered' | 'in_progress';
  answered_at?: string;
  answer_notes?: string;
  scripture_references?: string[];
  tags?: string[];
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

// Fetchers
export async function getPrayerJournal() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("prayer_journal")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as PrayerEntry[];
}

export async function getPrayerEntry(id: string) {
  const { data, error } = await (supabase as any)
    .from("prayer_journal")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as PrayerEntry;
}

export async function createPrayerEntry(entry: Partial<PrayerEntry>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("prayer_journal")
    .insert({ user_id: user.id, ...entry })
    .select()
    .single();

  if (error) throw error;
  return data as PrayerEntry;
}

export async function updatePrayerEntry(id: string, updates: Partial<PrayerEntry>) {
  const { data, error } = await (supabase as any)
    .from("prayer_journal")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as PrayerEntry;
}

export async function deletePrayerEntry(id: string) {
  const { error } = await (supabase as any)
    .from("prayer_journal")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return { success: true };
}

export async function markPrayerAnswered(id: string, answerNotes: string) {
  const { data, error } = await (supabase as any)
    .from("prayer_journal")
    .update({
      status: "answered",
      answered_at: new Date().toISOString(),
      answer_notes: answerNotes
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as PrayerEntry;
}

export async function getPrayerStreak() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: metrics } = await supabase
    .from("spiritual_metrics")
    .select("prayer_streak")
    .eq("user_id", user.id)
    .maybeSingle();

  return metrics?.prayer_streak || 0;
}

// Hooks
export const usePrayerJournal = () =>
  useQuery({ queryKey: ["prayer-journal"], queryFn: getPrayerJournal });

export const usePrayerEntry = (id: string) =>
  useQuery({
    queryKey: ["prayer-entry", id],
    queryFn: () => getPrayerEntry(id),
    enabled: !!id
  });

export const useCreatePrayerEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPrayerEntry,
    onSuccess: () => {
      toast({ title: "✝️ Prayer recorded — God hears you" });
      qc.invalidateQueries({ queryKey: ["prayer-journal"] });
    },
    onError: (e: any) => toast({
      title: "Failed to save prayer",
      description: e.message,
      variant: "destructive"
    })
  });
};

export const useUpdatePrayerEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PrayerEntry> }) =>
      updatePrayerEntry(id, updates),
    onSuccess: () => {
      toast({ title: "✅ Prayer updated" });
      qc.invalidateQueries({ queryKey: ["prayer-journal"] });
      qc.invalidateQueries({ queryKey: ["prayer-entry"] });
    },
    onError: (e: any) => toast({
      title: "Failed to update prayer",
      description: e.message,
      variant: "destructive"
    })
  });
};

export const useDeletePrayerEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePrayerEntry,
    onSuccess: () => {
      toast({ title: "✅ Prayer entry deleted" });
      qc.invalidateQueries({ queryKey: ["prayer-journal"] });
    },
    onError: (e: any) => toast({
      title: "Failed to delete prayer",
      description: e.message,
      variant: "destructive"
    })
  });
};

export const useMarkPrayerAnswered = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, answerNotes }: { id: string; answerNotes: string }) =>
      markPrayerAnswered(id, answerNotes),
    onSuccess: () => {
      toast({ title: "🙏 Prayer marked as answered — Praise God!" });
      qc.invalidateQueries({ queryKey: ["prayer-journal"] });
      qc.invalidateQueries({ queryKey: ["prayer-entry"] });
    },
    onError: (e: any) => toast({
      title: "Failed to update prayer",
      description: e.message,
      variant: "destructive"
    })
  });
};

export const usePrayerStreak = () =>
  useQuery({ queryKey: ["prayer-streak"], queryFn: getPrayerStreak });
