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
    const { session_id, audio_base64 } = await req.json();

    if (!session_id || !audio_base64) {
      throw new Error('session_id and audio_base64 are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`✝️ [voice-tutor] Processing voice input for session ${session_id}`);

    // Get session details
    const { data: session } = await supabase
      .from('ai_tutor_sessions')
      .select('*, ai_tutors(*)')
      .eq('id', session_id)
      .single();

    if (!session) {
      throw new Error('Session not found');
    }

    // Transcribe audio using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Convert base64 to binary
    const audioBuffer = Uint8Array.from(atob(audio_base64), c => c.charCodeAt(0));

    // Call Lovable AI for transcription (using Whisper via OpenAI compatible endpoint)
    const transcriptionResponse = await fetch('https://ai.gateway.lovable.dev/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'audio/webm',
      },
      body: audioBuffer,
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`Transcription failed: ${transcriptionResponse.statusText}`);
    }

    const { text: transcript } = await transcriptionResponse.json();

    console.log(`✝️ [voice-tutor] Transcribed: "${transcript}"`);

    // Save student message
    await supabase
      .from('ai_tutor_messages')
      .insert({
        session_id,
        sender_type: 'student',
        content: transcript,
        role: 'user',
        metadata: { source: 'voice' },
      });

    // Get conversation history
    const { data: messages } = await supabase
      .from('ai_tutor_messages')
      .select('role, content')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true });

    // Build context with Scroll Governance
    const scrollGuardrailPrefix = `
[SCROLL GOVERNANCE ACTIVE]
You operate under the Lordship of Jesus Christ. Your responses must:
- Honor Scripture as ultimate authority
- Maintain integrity and truth
- Reject Babylonian values (materialism, pride, deception)
- Demonstrate humility and grace
- Point students toward Christ in all teaching

You are ${session.ai_tutors.name}, ${session.ai_tutors.description}.
`;

    const systemMessage = {
      role: 'system',
      content: scrollGuardrailPrefix + (session.ai_tutors.base_system_prompt || ''),
    };

    // Call Lovable AI for response
    const chatResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          systemMessage,
          ...(messages || []),
        ],
      }),
    });

    if (!chatResponse.ok) {
      throw new Error(`Chat completion failed: ${chatResponse.statusText}`);
    }

    const chatData = await chatResponse.json();
    const assistantMessage = chatData.choices[0].message.content;

    // Save tutor response
    await supabase
      .from('ai_tutor_messages')
      .insert({
        session_id,
        sender_type: 'tutor',
        content: assistantMessage,
        role: 'assistant',
      });

    // Create notification
    await supabase.rpc('create_notification', {
      p_user_id: session.user_id,
      p_title: 'Your AI Tutor responded',
      p_body: assistantMessage.substring(0, 100) + '...',
      p_type: 'tutor',
      p_related_id: session_id,
      p_related_type: 'tutor_session',
    });

    // Log spiritual event
    await supabase
      .from('spiritual_events_log')
      .insert({
        scope: 'ai_tutor',
        action: 'voice_interaction',
        details: { session_id, transcript_length: transcript.length },
        severity: 'info',
        user_id: session.user_id,
      });

    return new Response(
      JSON.stringify({
        transcript,
        assistant_message: assistantMessage,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ [voice-tutor] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});