import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Admissions Automation function started");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { applicationId, action, institutionId } = await req.json();

    if (!applicationId || !action) {
      throw new Error('Application ID and action are required');
    }

    // Get application details
    const { data: application, error: appError } = await supabaseClient
      .from('student_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError) throw appError;

    switch (action) {
      case 'approve':
        // Update application status
        await supabaseClient
          .from('student_applications')
          .update({ status: 'approved', reviewed_at: new Date().toISOString() })
          .eq('id', applicationId);

        // Create institution membership
        await supabaseClient
          .from('institution_members')
          .insert({
            user_id: application.user_id,
            institution_id: institutionId || application.institution_id,
            role: 'student',
            status: 'active',
          });

        // Award welcome ScrollCoins
        await supabaseClient.rpc('earn_scrollcoin', {
          p_user_id: application.user_id,
          p_amount: 100,
          p_desc: 'Welcome to ScrollUniversity! 🎓',
        });

        // Send notification
        await supabaseClient.rpc('create_notification', {
          p_user_id: application.user_id,
          p_title: '🎉 Application Approved!',
          p_body: 'Welcome to ScrollUniversity! Your journey begins now.',
          p_type: 'admission',
          p_related_id: applicationId,
          p_related_type: 'application'
        });

        break;

      case 'reject':
        await supabaseClient
          .from('student_applications')
          .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
          .eq('id', applicationId);

        await supabaseClient.rpc('create_notification', {
          p_user_id: application.user_id,
          p_title: 'Application Status Update',
          p_body: 'Thank you for your application. Please contact admissions for more information.',
          p_type: 'admission',
          p_related_id: applicationId,
          p_related_type: 'application'
        });

        break;

      case 'waitlist':
        await supabaseClient
          .from('student_applications')
          .update({ status: 'waitlisted', reviewed_at: new Date().toISOString() })
          .eq('id', applicationId);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Application ${applicationId} ${action}ed successfully`);

    return new Response(
      JSON.stringify({ success: true, message: `Application ${action}ed` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admissions automation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
