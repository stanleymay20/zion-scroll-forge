import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ✝️ Multi-tenant institution resolver
async function resolveInstitutionId(req: Request, supabase: any, bodyData?: any): Promise<string> {
  try {
    if (bodyData?.institution_id) {
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
            return profile.current_institution_id;
          }
        }
      }
    } catch {}

    const { data } = await supabase.from('institutions').select('id').eq('slug', 'scrolluniversity').single();
    return data?.id;
  } catch {
    throw new Error('Failed to resolve institution');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bodyData = await req.json();
    const { messages, tutorId, moduleId, moduleContent, userId, withVoice } = bodyData;
    const startTime = Date.now();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Resolve institution_id
    const institutionId = await resolveInstitutionId(req, supabase, bodyData);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build system prompt based on tutor and module context
    const systemPrompt = `You are an AI tutor at ScrollUniversity, a Christ-centered online learning institution. 

IDENTITY: You are a knowledgeable, patient, and encouraging tutor who helps students understand complex topics through biblical wisdom and academic excellence.

CONTEXT: ${moduleContent ? `You are currently helping students with this module content:\n${moduleContent.substring(0, 2000)}` : 'You are available to answer any course-related questions.'}

GUIDELINES:
- Always acknowledge Jesus Christ as Lord over all learning
- Provide clear, accurate, and helpful explanations
- Use biblical principles to illustrate concepts when appropriate
- Be encouraging and build student confidence
- Ask clarifying questions if needed
- Provide examples and practical applications
- Keep responses concise but thorough (2-4 paragraphs typically)
- End with a question or next step to continue learning

TONE: Professional yet warm, scholarly yet accessible, wise yet humble.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices[0].message.content;
    const responseTime = Date.now() - startTime;

    // Track interaction analytics
    if (userId && moduleId) {
      await supabase.from('ai_conversations').insert({
        institution_id: institutionId,
        user_id: userId,
        faculty: tutorId || 'general',
        subject: moduleId,
        messages: messages.concat([{ role: 'assistant', content: message }]),
        learning_insights: {
          responseTime,
          moduleId,
          tutorId
        }
      });
    }

    return new Response(
      JSON.stringify({ message, responseTime }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('AI Tutor error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
