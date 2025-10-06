import { supabase } from '@/integrations/supabase/client';
import { underChrist } from '@/lib/lordship';

export const getWallet = underChrist(async (userId: string) => {
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (walletError) throw walletError;

  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (txError) throw txError;

  return { wallet, transactions: transactions || [] };
});

export const earnScrollCoin = underChrist(
  async (userId: string, amount: number, description: string) => {
    const { error } = await supabase.rpc('earn_scrollcoin', {
      p_user_id: userId,
      p_amount: amount,
      p_desc: description,
    });

    if (error) throw error;
    return { success: true };
  }
);

export const spendScrollCoin = underChrist(
  async (userId: string, amount: number, description: string) => {
    const { error } = await supabase.rpc('spend_scrollcoin', {
      p_user_id: userId,
      p_amount: amount,
      p_desc: description,
    });

    if (error) throw error;
    return { success: true };
  }
);
