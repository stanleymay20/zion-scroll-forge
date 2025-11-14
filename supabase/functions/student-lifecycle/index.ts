import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { application_id } = await req.json();
    
    if (!application_id) {
      throw new Error('application_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing student lifecycle for application:', application_id);

    // Get application details
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (appError) throw appError;

    // Ensure profile exists (should already exist from auth trigger)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', application.user_id)
      .maybeSingle();

    if (!profile) {
      console.log('Creating profile for user:', application.user_id);
      await supabase
        .from('profiles')
        .insert({
          id: application.user_id,
          email: application.email,
          role: 'student'
        });
    }

    // Award welcome ScrollCoins
    console.log('Awarding welcome ScrollCoins');
    await supabase.from('scrollcoin_transactions').insert({
      user_id: application.user_id,
      amount: 100,
      transaction_type: 'rewarded',
      source: 'admission_welcome',
      description: 'Welcome to ScrollUniversity! May Christ guide your studies.'
    });

    // Find an orientation course if available
    const { data: orientationCourse } = await supabase
      .from('courses')
      .select('id')
      .ilike('title', '%orientation%')
      .limit(1)
      .maybeSingle();

    if (orientationCourse) {
      console.log('Auto-enrolling in orientation course');
      await supabase
        .from('enrollments')
        .insert({
          user_id: application.user_id,
          course_id: orientationCourse.id,
          progress: 0
        });
    }

    // Log spiritual event
    await supabase.from('spiritual_events_log').insert({
      scope: 'admissions',
      action: 'student_lifecycle_complete',
      details: {
        application_id,
        user_id: application.user_id,
        scrollcoins_awarded: 100,
        orientation_enrolled: !!orientationCourse
      },
      severity: 'info',
      user_id: application.user_id
    });

    console.log('Student lifecycle completed successfully');

    return new Response(JSON.stringify({
      success: true,
      scrollcoins_awarded: 100,
      orientation_enrolled: !!orientationCourse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in student-lifecycle:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
