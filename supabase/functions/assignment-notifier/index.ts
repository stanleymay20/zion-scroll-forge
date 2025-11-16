import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Assignment Notifier function started");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for assignments due in the next 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: assignments, error } = await supabaseClient
      .from('assignments')
      .select(`
        *,
        courses(
          title,
          enrollments(user_id)
        )
      `)
      .gte('due_at', new Date().toISOString())
      .lte('due_at', tomorrow.toISOString())
      .eq('published', true);

    if (error) throw error;

    // Send notifications for each assignment
    for (const assignment of assignments || []) {
      const enrollments = assignment.courses?.enrollments || [];
      
      for (const enrollment of enrollments) {
        await supabaseClient.rpc('create_notification', {
          p_user_id: enrollment.user_id,
          p_title: 'Assignment Due Soon',
          p_body: `${assignment.title} is due in 24 hours`,
          p_type: 'assignment',
          p_related_id: assignment.id,
          p_related_type: 'assignment'
        });
      }
    }

    console.log(`Sent notifications for ${assignments?.length || 0} assignments`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent: assignments?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Assignment notifier error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
