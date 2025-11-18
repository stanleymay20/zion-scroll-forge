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
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const courseId = formData.get('courseId') as string;
    const moduleId = formData.get('moduleId') as string;
    const professorName = formData.get('professorName') as string;

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    // Transcribe audio with Whisper
    const transcriptionForm = new FormData();
    transcriptionForm.append('file', audioFile);
    transcriptionForm.append('model', 'whisper-1');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: transcriptionForm,
    });

    if (!transcriptionResponse.ok) {
      throw new Error('Failed to transcribe audio');
    }

    const transcriptionData = await transcriptionResponse.json();
    const transcription = transcriptionData.text;

    // Get context from module
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: module } = await supabaseClient
      .from('course_modules')
      .select('*, courses(*)')
      .eq('id', moduleId)
      .single();

    // Generate response
    const systemPrompt = `You are ${professorName}, answering a student's spoken question about ${module?.title}.

Module Context:
${module?.content_md?.substring(0, 1000) || ''}

Provide a clear, conversational response as if speaking directly to the student.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcription }
        ],
        max_tokens: 600,
      }),
    });

    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;

    // Generate audio response
    let audioUrl = null;
    if (ELEVENLABS_API_KEY) {
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
        }),
      });

      if (ttsResponse.ok) {
        const audioData = await ttsResponse.arrayBuffer();
        const fileName = `voice-qa/${courseId}/${Date.now()}.mp3`;
        
        const { data: uploadData } = await supabaseClient.storage
          .from('ai-tutor-videos')
          .upload(fileName, audioData, {
            contentType: 'audio/mpeg',
          });

        if (uploadData) {
          const { data: urlData } = supabaseClient.storage
            .from('ai-tutor-videos')
            .getPublicUrl(fileName);
          audioUrl = urlData.publicUrl;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        transcription,
        response,
        audioUrl 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Voice Q&A error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
