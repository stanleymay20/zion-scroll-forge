import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_ACTIONS = new Set(['charge', 'refund', 'subscription']);
const MAX_AMOUNT = 1_000_000; // cents/units sanity cap

console.log("Billing Worker function started");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---- AuthN: require valid Supabase JWT ----
    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace(/^Bearer\s+/i, '');
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const callerId = userData.user.id;

    // ---- AuthZ: caller must be admin or superadmin ----
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: roles, error: roleErr } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId);
    if (roleErr) {
      console.error('Role lookup failed:', roleErr);
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const isAdmin = (roles ?? []).some((r: any) => r.role === 'admin' || r.role === 'superadmin');
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- Input validation ----
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { action, userId, amount, description } = body as Record<string, unknown>;

    if (typeof action !== 'string' || !ALLOWED_ACTIONS.has(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (typeof userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(userId)) {
      return new Response(JSON.stringify({ error: 'Invalid userId' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const amt = Number(amount ?? 0);
    if (!Number.isFinite(amt) || amt < 0 || amt > MAX_AMOUNT) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const desc = typeof description === 'string' ? description.slice(0, 500) : '';

    switch (action) {
      case 'charge':
        await adminClient.from('transactions').insert({
          user_id: userId,
          type: 'payment',
          amount: amt,
          description: desc || 'Tuition payment',
        });
        break;
      case 'refund':
        await adminClient.from('transactions').insert({
          user_id: userId,
          type: 'refund',
          amount: -amt,
          description: desc || 'Refund',
        });
        break;
      case 'subscription':
        console.log('Processing subscription billing for', userId);
        break;
    }

    console.log(`Billing action ${action} by admin ${callerId} for user ${userId}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Billing worker error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
