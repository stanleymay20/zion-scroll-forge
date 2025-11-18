import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("AI Professor Lecture function started");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { courseId, moduleId, professorName, specialty } = await req.json();

    // Fetch module content
    const { data: module, error: moduleError } = await supabaseClient
      .from('course_modules')
      .select('*, courses(*)')
      .eq('id', moduleId)
      .single();

    if (moduleError) throw moduleError;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    // Generate lecture script using Lovable AI
    const lecturePrompt = `You are ${professorName}, a distinguished professor specializing in ${specialty}.

Course: ${module.courses.title}
Module: ${module.title}

Module Content:
${module.content_md || module.content}

Your task: Deliver a comprehensive, engaging 10-minute lecture on this module content.

Guidelines:
- Start with a brief overview and learning objectives
- Use real-world examples and case studies
- Break down complex concepts into digestible parts
- Include thought-provoking questions
- End with key takeaways and next steps
- Maintain an enthusiastic, professorial tone
- Use analogies and storytelling where appropriate

Generate a natural, conversational lecture script that a student would find both informative and engaging.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert university professor delivering engaging lectures.' },
          { role: 'user', content: lecturePrompt }
        ],
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to generate lecture script');
    }

    const aiData = await aiResponse.json();
    const lectureScript = aiData.choices[0].message.content;

    // Generate audio with ElevenLabs
    let audioUrl = null;
    if (ELEVENLABS_API_KEY) {
      const voiceId = 'ErXwobaYiN019PkySvjV'; // Antoni - professional male voice
      
      const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: lectureScript,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          }
        }),
      });

      if (ttsResponse.ok) {
        const audioData = await ttsResponse.arrayBuffer();
        
        // Upload to Supabase Storage
        const fileName = `lectures/${courseId}/${moduleId}/${Date.now()}.mp3`;
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('ai-tutor-videos')
          .upload(fileName, audioData, {
            contentType: 'audio/mpeg',
            upsert: true
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabaseClient.storage
            .from('ai-tutor-videos')
            .getPublicUrl(fileName);
          
          audioUrl = urlData.publicUrl;
        }
      }
    }

    // Log lecture session
    const { error: logError } = await supabaseClient
      .from('ai_tutor_interactions')
      .insert({
        user_id: req.headers.get('x-user-id'),
        module_id: moduleId,
        question: 'Lecture Started',
        response: lectureScript.substring(0, 500),
        interaction_type: 'lecture',
      });

    if (logError) console.error('Failed to log interaction:', logError);

    return new Response(
      JSON.stringify({ 
        transcript: lectureScript,
        audioUrl,
        duration: Math.ceil(lectureScript.split(' ').length / 150) * 60, // Estimate duration
        professorName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI Professor Lecture error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
