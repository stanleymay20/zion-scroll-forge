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
    const { userId, courseId, weeklyHours } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get course modules
    const { data: course } = await supabase
      .from('courses')
      .select('*, course_modules(*)')
      .eq('id', courseId)
      .single();

    // Get user's learning profile
    const { data: profile } = await supabase
      .from('student_learning_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const totalModules = course?.course_modules?.length || 0;
    const modulesPerWeek = Math.ceil((weeklyHours / 2) * (profile?.preferred_pace === 'fast' ? 1.5 : profile?.preferred_pace === 'slow' ? 0.7 : 1));

    // Generate AI study plan
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a Christ-centered study planner for ScrollUniversity. Create personalized, spiritually-enriching study schedules.`
          },
          {
            role: 'user',
            content: `Create a study plan for:
            - Course: ${course?.title}
            - Total Modules: ${totalModules}
            - Weekly Hours: ${weeklyHours}
            - Learning Pace: ${profile?.preferred_pace || 'moderate'}
            - Preferred Study Times: ${JSON.stringify(profile?.study_time_preference)}

            Generate:
            1. Target completion date (realistic based on pace)
            2. Weekly milestones (which modules to complete each week)
            3. Daily schedule recommendations with Scripture reading moments
            4. Prayer and reflection breaks

            Return as JSON: { targetDate, dailySchedule: {monday: [], tuesday: [], ...}, milestones: [{week: 1, modules: [], scripture: ""}] }`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_study_plan",
              description: "Generate structured study plan",
              parameters: {
                type: "object",
                properties: {
                  targetDate: { type: "string" },
                  dailySchedule: { type: "object" },
                  milestones: { type: "array" }
                }
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_study_plan" } }
      }),
    });

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0].message.tool_calls[0];
    const plan = JSON.parse(toolCall.function.arguments);

    // Insert study plan
    const { data: studyPlan, error: planError } = await supabase
      .from('study_plans')
      .upsert({
        user_id: userId,
        course_id: courseId,
        target_completion_date: plan.targetDate,
        weekly_hours: weeklyHours,
        daily_schedule: plan.dailySchedule,
        milestones: plan.milestones
      })
      .select()
      .single();

    if (planError) throw planError;

    return new Response(
      JSON.stringify({ success: true, plan: studyPlan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
