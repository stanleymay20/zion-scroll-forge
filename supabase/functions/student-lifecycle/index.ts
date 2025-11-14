import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ✝️ Multi-tenant institution resolver
async function resolveInstitutionId(req: Request, supabase: any, bodyData?: any): Promise<string> {
  try {
    if (bodyData?.institution_id) {
      console.log('✝️ Using institution_id from request:', bodyData.institution_id);
      return bodyData.institution_id;
    }

    try {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('current_institution_id')
            .eq('id', user.id)
            .single();
          if (profile?.current_institution_id) {
            console.log('✝️ Using institution_id from profile:', profile.current_institution_id);
            return profile.current_institution_id;
          }
        }
      }
    } catch {}

    const { data } = await supabase.from('institutions').select('id').eq('slug', 'scrolluniversity').single();
    if (data) {
      console.log('✝️ Using default ScrollUniversity institution:', data.id);
      return data.id;
    }

    throw new Error('No institution could be resolved');
  } catch (error) {
    console.error('Institution resolution error:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bodyData = await req.json();
    const { application_id } = bodyData;
    
    if (!application_id) {
      throw new Error('application_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Resolve institution_id for multi-tenancy
    const institutionId = await resolveInstitutionId(req, supabase, bodyData);

    console.log(`Processing student lifecycle for application ${application_id} in institution ${institutionId}`);

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
      .select('id, current_institution_id')
      .eq('id', application.user_id)
      .maybeSingle();

    if (!profile) {
      console.log('Creating profile for user:', application.user_id);
      await supabase
        .from('profiles')
        .insert({
          id: application.user_id,
          email: application.email,
          role: 'student',
          current_institution_id: institutionId
        });
    } else if (!profile.current_institution_id) {
      // Update profile with institution if missing
      await supabase
        .from('profiles')
        .update({ current_institution_id: institutionId })
        .eq('id', application.user_id);
    }

    // Create institution membership if doesn't exist
    const { data: existingMembership } = await supabase
      .from('institution_members')
      .select('id')
      .eq('user_id', application.user_id)
      .eq('institution_id', institutionId)
      .maybeSingle();

    if (!existingMembership) {
      await supabase
        .from('institution_members')
        .insert({
          institution_id: institutionId,
          user_id: application.user_id,
          role: 'student',
          status: 'active'
        });
    }

    // Award welcome ScrollCoins
    console.log('Awarding welcome ScrollCoins');
    await supabase.from('transactions').insert({
      user_id: application.user_id,
      type: 'earned',
      amount: 100,
      description: 'Welcome to ScrollUniversity! May Christ guide your studies.'
    });

    // Find an orientation course for this institution
    const { data: orientationCourse } = await supabase
      .from('courses')
      .select('id')
      .eq('institution_id', institutionId)
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
          institution_id: institutionId,
          progress: 0
        });
    }

    console.log('✝️ Student lifecycle completed successfully');

    return new Response(JSON.stringify({
      success: true,
      institution_id: institutionId,
      scrollcoins_awarded: 100,
      orientation_enrolled: !!orientationCourse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in student-lifecycle:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
