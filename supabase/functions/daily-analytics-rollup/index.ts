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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    console.log(`✝️ [analytics] Rolling up data for ${dateStr}`);

    // Get all active institutions to process separately
    const { data: institutions } = await supabase
      .from('institutions')
      .select('id, name')
      .eq('is_active', true);

    if (!institutions || institutions.length === 0) {
      throw new Error('No active institutions found');
    }

    for (const institution of institutions) {
      console.log(`Processing analytics for ${institution.name} (${institution.id})`);
      await processInstitutionAnalytics(supabase, institution.id, dateStr);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Analytics rolled up for ${institutions.length} institutions`,
        date: dateStr 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Analytics rollup error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processInstitutionAnalytics(supabase: any, institutionId: string, dateStr: string) {
  // 1. LEARNING ANALYTICS - Scoped to institution
  const { data: learningData } = await supabase
    .from('enrollments')
    .select('course_id, user_id, created_at')
    .eq('institution_id', institutionId)
    .gte('created_at', `${dateStr}T00:00:00`)
    .lt('created_at', `${dateStr}T23:59:59`);

  const { data: modulesData } = await supabase
    .from('module_progress')
    .select('course_id, user_id, completed')
    .eq('completed', true)
    .gte('completed_at', `${dateStr}T00:00:00`)
    .lt('completed_at', `${dateStr}T23:59:59`);

  // Aggregate by course
  const learningByCourse = new Map();
  learningData?.forEach((e: any) => {
    const key = `${e.course_id}-${e.user_id}`;
    if (!learningByCourse.has(key)) {
      learningByCourse.set(key, {
        course_id: e.course_id,
        user_id: e.user_id,
        enrollments_count: 0,
        completed_modules_count: 0,
      });
    }
    learningByCourse.get(key).enrollments_count++;
  });

  modulesData?.forEach((m: any) => {
    const key = `${m.course_id}-${m.user_id}`;
    if (learningByCourse.has(key)) {
      learningByCourse.get(key).completed_modules_count++;
    }
  });

  for (const stats of learningByCourse.values()) {
    await supabase
      .from('learning_analytics_daily')
      .upsert({
        date: dateStr,
        ...stats,
        quiz_attempts: 0,
        avg_score: null,
      }, { onConflict: 'date,course_id,user_id' });
  }

  console.log(`✝️ Analytics processed for institution ${institutionId}`);
}
