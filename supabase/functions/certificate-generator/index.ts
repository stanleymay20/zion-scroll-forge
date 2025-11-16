import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Certificate Generator function started");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { courseId } = await req.json();

    if (!courseId) {
      throw new Error('Course ID is required');
    }

    // Get course details
    const { data: course, error: courseError } = await supabaseClient
      .from('courses')
      .select('title, institution_id')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Generate certificate URL (mock for now)
    const certificateUrl = `https://certificates.scrolluniversity.com/${user.id}/${courseId}.pdf`;

    // Store certificate record
    const { error: certError } = await supabaseClient
      .from('course_certificates')
      .insert({
        user_id: user.id,
        course_id: courseId,
        certificate_url: certificateUrl,
        completion_date: new Date().toISOString(),
        scroll_badge_earned: true,
      });

    if (certError) throw certError;

    console.log('Certificate generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        certificateUrl,
        message: 'Certificate generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating certificate:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
