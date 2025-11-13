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
    const { userId } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's learning profile
    const { data: profile } = await supabase
      .from('student_learning_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Get user's completed courses
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id, courses(faculty)')
      .eq('user_id', userId);

    // Get user's module progress for mastery analysis
    const { data: progress } = await supabase
      .from('student_module_progress')
      .select('*, course_modules(courses(faculty))')
      .eq('user_id', userId);

    // Get all available courses
    const { data: allCourses } = await supabase
      .from('courses')
      .select('*');

    // Generate AI-powered recommendations
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
            content: `You are an AI educational advisor for ScrollUniversity, a Christ-centered learning platform. 
            Analyze student profiles and recommend courses that match their learning style, pace, and spiritual growth goals.`
          },
          {
            role: 'user',
            content: `Based on this student profile:
            - Learning Style: ${profile?.learning_style || 'unknown'}
            - Preferred Pace: ${profile?.preferred_pace || 'moderate'}
            - Goals: ${profile?.goals?.join(', ') || 'general spiritual growth'}
            - Completed Courses: ${enrollments?.length || 0}
            - Strong Faculties: ${progress?.slice(0, 3).map((p: any) => p.course_modules?.courses?.faculty).join(', ') || 'none yet'}

            Available courses: ${JSON.stringify(allCourses?.map(c => ({ id: c.id, title: c.title, faculty: c.faculty, description: c.description })))}

            Recommend 5-7 courses with:
            1. Course ID
            2. Relevance score (0-100)
            3. Brief reason (1-2 sentences focusing on spiritual and academic fit)

            Return as JSON array: [{ courseId, relevanceScore, reason }]`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_courses",
              description: "Return course recommendations",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        courseId: { type: "string" },
                        relevanceScore: { type: "number" },
                        reason: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "recommend_courses" } }
      }),
    });

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0].message.tool_calls[0];
    const recommendations = JSON.parse(toolCall.function.arguments).recommendations;

    // Delete old recommendations
    await supabase
      .from('course_recommendations')
      .delete()
      .eq('user_id', userId);

    // Insert new recommendations
    const { data: inserted, error: insertError } = await supabase
      .from('course_recommendations')
      .insert(
        recommendations.map((rec: any) => ({
          user_id: userId,
          course_id: rec.courseId,
          relevance_score: rec.relevanceScore,
          reason: rec.reason
        }))
      )
      .select();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, recommendations: inserted }),
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
