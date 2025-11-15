import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.info("✝️ Notification Worker — Christ governs alerts");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // This worker runs periodically to check for notification triggers
    
    // 1. Check for assignment due dates approaching
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { data: dueSoon } = await supabase
      .from('assignments')
      .select('*, submissions(user_id)')
      .lt('due_at', tomorrow.toISOString())
      .gt('due_at', new Date().toISOString());

    if (dueSoon) {
      for (const assignment of dueSoon) {
        // Get enrolled students who haven't submitted
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('user_id')
          .eq('course_id', assignment.course_id);

        const submitted = new Set(assignment.submissions?.map((s: any) => s.user_id) || []);
        const notSubmitted = enrollments?.filter((e: any) => !submitted.has(e.user_id)) || [];

        for (const enrollment of notSubmitted) {
          await supabase.rpc('create_notification', {
            p_user_id: enrollment.user_id,
            p_title: 'Assignment Due Soon',
            p_body: `${assignment.title} is due tomorrow!`,
            p_type: 'assignment',
            p_related_id: assignment.id,
            p_related_type: 'assignment',
          });
        }
      }
    }

    // 2. Check for new AI tutor messages
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const { data: recentSessions } = await supabase
      .from('ai_tutor_sessions')
      .select('*, ai_tutor_messages(*)')
      .eq('status', 'active')
      .gt('updated_at', fiveMinutesAgo.toISOString());

    // 3. Check for new community posts/comments in groups user follows

    // 4. Check for spiritual milestone achievements
    const { data: metrics } = await supabase
      .from('spiritual_metrics')
      .select('*')
      .gte('prayer_streak', 30)
      .gt('updated_at', fiveMinutesAgo.toISOString());

    if (metrics) {
      for (const metric of metrics) {
        await supabase.rpc('create_notification', {
          p_user_id: metric.user_id,
          p_title: '🔥 30-Day Prayer Streak!',
          p_body: 'You've maintained a 30-day prayer streak. Keep going!',
          p_type: 'achievement',
          p_related_id: metric.id,
          p_related_type: 'spiritual_metric',
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Notification worker error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
