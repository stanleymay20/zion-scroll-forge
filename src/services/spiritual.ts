import { supabase } from '@/integrations/supabase/client';
import { underChrist } from '@/lib/lordship';

export const acknowledgeLordship = underChrist(async (userId: string, note?: string) => {
  const { error } = await supabase
    .from('prophetic_checkins')
    .insert({
      user_id: userId,
      note: note || null,
      acknowledged_lordship: true,
    });

  if (error) throw error;
  return { success: true };
});

export const submitPrayer = underChrist(async (userId: string, request: string) => {
  const { error } = await supabase
    .from('prayer_journal')
    .insert({
      user_id: userId,
      request,
    });

  if (error) throw error;
  return { success: true };
});

export const getPrayerJournal = underChrist(async (userId: string) => {
  const { data, error } = await supabase
    .from('prayer_journal')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
});

export const updatePrayerStatus = underChrist(
  async (prayerId: string, userId: string, status: 'open' | 'answered' | 'in_progress') => {
    const { error } = await supabase
      .from('prayer_journal')
      .update({ status })
      .eq('id', prayerId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }
);
