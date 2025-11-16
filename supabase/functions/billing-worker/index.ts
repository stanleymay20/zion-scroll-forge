import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Billing Worker function started");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userId, amount, description } = await req.json();

    if (!action || !userId) {
      throw new Error('Action and user ID are required');
    }

    switch (action) {
      case 'charge':
        // Process tuition payment
        await supabaseClient
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'payment',
            amount: amount || 0,
            description: description || 'Tuition payment',
          });
        break;

      case 'refund':
        // Process refund
        await supabaseClient
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'refund',
            amount: -(amount || 0),
            description: description || 'Refund',
          });
        break;

      case 'subscription':
        // Handle subscription billing
        console.log('Processing subscription billing');
        break;

      default:
        throw new Error(`Unknown billing action: ${action}`);
    }

    console.log(`Billing action completed: ${action}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Billing action completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Billing worker error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
