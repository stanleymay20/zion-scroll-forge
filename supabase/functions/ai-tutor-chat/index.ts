import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, tutorId, moduleId, moduleContent, userId, withVoice } = await req.json();
    const startTime = Date.now();
    
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
    if (userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const userMessage = messages[messages.length - 1];
      await supabase.from('ai_tutor_interactions').insert({
        user_id: userId,
        tutor_id: tutorId,
        module_id: moduleId,
        question: userMessage.content,
        response: message,
        response_time: responseTime,
        interaction_type: withVoice ? 'voice' : 'chat'
      });

      // Track common questions
      if (moduleId && userMessage.content) {
        await supabase.rpc('track_common_question', {
          p_module_id: moduleId,
          p_question: userMessage.content
        });
      }
    }

    // Generate voice with ElevenLabs if requested
    let audioContent = null;
    if (withVoice) {
      const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
      if (ELEVENLABS_API_KEY) {
        try {
          const voiceResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/9BWtsMINqrJLrRacOk9x', {
            method: 'POST',
            headers: {
              'xi-api-key': ELEVENLABS_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: message,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.5,
                use_speaker_boost: true
              }
            }),
          });

          if (voiceResponse.ok) {
            const audioBuffer = await voiceResponse.arrayBuffer();
            audioContent = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
          }
        } catch (voiceError) {
          console.error('Voice synthesis error:', voiceError);
        }
      }
    }

    return new Response(
      JSON.stringify({ message, audioContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Tutor Chat Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process chat request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
