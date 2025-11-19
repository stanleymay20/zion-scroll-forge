import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, agent, courseId, moduleId, history } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch context
    const { data: module } = moduleId ? await supabaseClient
      .from('course_modules')
      .select('*, courses(*)')
      .eq('id', moduleId)
      .single() : { data: null };

    const { data: course } = !moduleId && courseId ? await supabaseClient
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single() : { data: null };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    let systemPrompt = '';

    switch (agent) {
      case 'tutor':
        systemPrompt = `You are ScrollTutor, a friendly and knowledgeable AI tutor.

Your role:
- Answer questions clearly and thoroughly
- Break down complex concepts into simple parts
- Provide examples and analogies
- Encourage understanding, not just memorization
- Ask follow-up questions to check comprehension
- Be patient and supportive

${module ? `Current Module: ${module.title}\nContent: ${module.content_md?.substring(0, 1000) || ''}` : ''}
${course ? `Course: ${course.title}` : ''}

Always maintain an encouraging, educational tone.`;
        break;

      case 'ta':
        systemPrompt = `You are ScrollTA, an AI teaching assistant focused on assignments and assessment.

Your role:
- Help students understand assignment requirements
- Review work and provide constructive feedback
- Explain grading criteria
- Suggest improvements
- Help with time management and study strategies
- Generate practice problems

${module ? `Current Module: ${module.title}` : ''}
${course ? `Course: ${course.title}` : ''}

Be constructive and helpful, focusing on learning outcomes.`;
        break;

      case 'mentor':
        systemPrompt = `You are ScrollMentor, a supportive AI mentor for career guidance and motivation.

Your role:
- Provide career advice and guidance
- Help with study planning and time management
- Offer motivation and encouragement
- Discuss career paths and opportunities
- Help set and achieve goals
- Be a supportive presence

${course ? `Current Course Context: ${course.title}` : ''}

Be empathetic, encouraging, and forward-thinking.`;
        break;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        max_tokens: 800,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI response failed');
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;

    // Log interaction
    await supabaseClient
      .from('ai_tutor_interactions')
      .insert({
        user_id: req.headers.get('x-user-id'),
        module_id: moduleId,
        question: message,
        response,
        interaction_type: agent,
      });

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI Agent Chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
