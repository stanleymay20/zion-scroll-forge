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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { question, courseId, moduleId, chatHistory, professorName } = await req.json();

    // Fetch module content for context
    const { data: module } = await supabaseClient
      .from('course_modules')
      .select('*, courses(*)')
      .eq('id', moduleId)
      .single();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    const systemPrompt = `You are ${professorName}, an expert professor teaching ${module?.courses?.title || 'this course'}.

Module Content Context:
${module?.content_md || module?.content || ''}

Your role:
- Answer student questions with academic rigor and clarity
- Provide detailed explanations with examples
- Encourage critical thinking
- Reference course material when relevant
- Be supportive and encouraging
- If unsure, admit limitations and suggest resources
- Keep responses conversational but authoritative

Maintain your professorial persona throughout the conversation.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: question }
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
      throw new Error('Failed to generate response');
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;

    // Generate audio response
    let audioUrl = null;
    if (ELEVENLABS_API_KEY && response.length < 2000) {
      const voiceId = 'ErXwobaYiN019PkySvjV';
      
      const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: response,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          }
        }),
      });

      if (ttsResponse.ok) {
        const audioData = await ttsResponse.arrayBuffer();
        const fileName = `qa/${courseId}/${moduleId}/${Date.now()}.mp3`;
        
        const { data: uploadData } = await supabaseClient.storage
          .from('ai-tutor-videos')
          .upload(fileName, audioData, {
            contentType: 'audio/mpeg',
            upsert: true
          });

        if (uploadData) {
          const { data: urlData } = supabaseClient.storage
            .from('ai-tutor-videos')
            .getPublicUrl(fileName);
          
          audioUrl = urlData.publicUrl;
        }
      }
    }

    // Log interaction
    await supabaseClient
      .from('ai_tutor_interactions')
      .insert({
        user_id: req.headers.get('x-user-id'),
        module_id: moduleId,
        question,
        response,
        interaction_type: 'qa',
      });

    return new Response(
      JSON.stringify({ response, audioUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI Professor Q&A error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
