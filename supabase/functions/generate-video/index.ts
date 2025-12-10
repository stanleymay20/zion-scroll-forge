import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const didApiKey = Deno.env.get('DID_API_KEY')!;
const lovableKey = Deno.env.get('LOVABLE_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Generate concise script for video avatar
async function generateVideoScript(moduleTitle: string, moduleContent: string): Promise<string> {
  console.log('Generating video script for:', moduleTitle);
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: `You are Professor Sarah, a warm and engaging educator at Scroll University. 
Write a spoken lecture script of exactly 150-200 words (about 60-90 seconds).

Your script should:
- Start with "Welcome to this lesson on [topic]..."
- Present 2-3 key insights in a conversational tone
- Include one relevant scripture reference naturally
- End with an encouraging call to apply the learning

IMPORTANT: Write ONLY the words to be spoken. No stage directions, no [brackets], no narrator cues.
Keep it warm, professional, and spiritually uplifting.`
        },
        {
          role: 'user',
          content: `Create the video lecture script for: "${moduleTitle}"

Key content to cover:
${moduleContent.substring(0, 2000)}`
        }
      ],
      max_tokens: 500
    })
  });

  const data = await response.json();
  const script = data.choices?.[0]?.message?.content || 
    `Welcome to this lesson on ${moduleTitle}. Today we will explore important concepts that will deepen your understanding and strengthen your faith. Let us begin this journey of discovery together, guided by biblical wisdom and academic excellence.`;
  
  console.log('Generated script:', script.substring(0, 100) + '...');
  return script;
}

// Create video with D-ID
async function createDIDVideo(script: string): Promise<{ talkId: string; status: string }> {
  console.log('Creating D-ID talk...');
  
  const response = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${didApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_url: 'https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg',
      script: {
        type: 'text',
        input: script.substring(0, 1500),
        provider: {
          type: 'microsoft',
          voice_id: 'en-US-JennyNeural'
        }
      },
      config: {
        fluent: true,
        pad_audio: 0.5,
        stitch: true
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('D-ID create error:', response.status, errorText);
    throw new Error(`D-ID API error: ${errorText}`);
  }

  const data = await response.json();
  console.log('D-ID talk created:', data.id, 'status:', data.status);
  return { talkId: data.id, status: data.status };
}

// Poll for video completion
async function waitForVideo(talkId: string, maxWaitSeconds: number = 120): Promise<string | null> {
  console.log('Waiting for video:', talkId);
  const startTime = Date.now();
  
  while ((Date.now() - startTime) < maxWaitSeconds * 1000) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const response = await fetch(`https://api.d-id.com/talks/${talkId}`, {
      headers: { 'Authorization': `Basic ${didApiKey}` }
    });

    const data = await response.json();
    console.log('D-ID status:', data.status);

    if (data.status === 'done') {
      console.log('Video ready:', data.result_url);
      return data.result_url;
    } else if (data.status === 'error') {
      console.error('D-ID error:', data.error);
      throw new Error(data.error?.message || 'Video generation failed');
    }
  }

  console.log('Video still processing after', maxWaitSeconds, 'seconds');
  return null;
}

// Upload video to Supabase Storage
async function uploadVideo(videoUrl: string, moduleId: string): Promise<string> {
  console.log('Downloading video from D-ID...');
  const videoResponse = await fetch(videoUrl);
  const videoBuffer = await videoResponse.arrayBuffer();
  
  const fileName = `video-lecture-${moduleId}-${Date.now()}.mp4`;
  const filePath = `videos/${fileName}`;
  
  console.log('Uploading to Supabase Storage:', filePath);
  const { error: uploadError } = await supabase.storage
    .from('materials')
    .upload(filePath, new Uint8Array(videoBuffer), {
      contentType: 'video/mp4',
      upsert: true
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw uploadError;
  }

  const { data: urlData } = supabase.storage.from('materials').getPublicUrl(filePath);
  console.log('Video uploaded:', urlData.publicUrl);
  return urlData.publicUrl;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { module_id, regenerate } = await req.json();

    if (!module_id) {
      return new Response(
        JSON.stringify({ error: 'module_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get module details
    const { data: module, error: moduleError } = await supabase
      .from('course_modules')
      .select('id, title, content_md, course:courses(title)')
      .eq('id', module_id)
      .single();

    if (moduleError || !module) {
      console.error('Module not found:', moduleError);
      return new Response(
        JSON.stringify({ error: 'Module not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating video for module:', module.title);

    // Check for existing video material
    const { data: existingMaterial } = await supabase
      .from('learning_materials')
      .select('id, url, meta')
      .eq('module_id', module_id)
      .eq('kind', 'video')
      .single();

    // If video exists and not regenerating, return existing
    if (existingMaterial?.url && existingMaterial.url.includes('supabase') && !regenerate) {
      console.log('Video already exists:', existingMaterial.url);
      return new Response(
        JSON.stringify({ 
          success: true, 
          video_url: existingMaterial.url,
          status: 'existing'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate video script
    const moduleContent = module.content_md || module.title;
    const script = await generateVideoScript(module.title, moduleContent);

    // Create D-ID video
    const { talkId, status } = await createDIDVideo(script);

    // Wait for video to complete
    const videoUrl = await waitForVideo(talkId, 180); // 3 min max wait

    if (!videoUrl) {
      // Save pending status
      const meta = { 
        did_talk_id: talkId, 
        status: 'processing',
        script: script.substring(0, 500),
        generated_at: new Date().toISOString()
      };

      if (existingMaterial) {
        await supabase
          .from('learning_materials')
          .update({ meta, title: `${module.title} - Video (Processing)` })
          .eq('id', existingMaterial.id);
      } else {
        await supabase
          .from('learning_materials')
          .insert({
            module_id: module_id,
            title: `${module.title} - Video Lecture (Processing)`,
            kind: 'video',
            url: '',
            meta
          });
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'processing',
          talk_id: talkId,
          message: 'Video is being generated. Check back in a few minutes.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload to Supabase Storage
    const storedUrl = await uploadVideo(videoUrl, module_id);

    // Update or create learning material
    const meta = {
      did_talk_id: talkId,
      status: 'complete',
      script: script.substring(0, 500),
      generated_at: new Date().toISOString(),
      duration_estimate: Math.ceil(script.split(' ').length / 2.5) // ~2.5 words per second
    };

    if (existingMaterial) {
      await supabase
        .from('learning_materials')
        .update({ 
          url: storedUrl, 
          meta,
          title: `${module.title} - Video Lecture`
        })
        .eq('id', existingMaterial.id);
    } else {
      await supabase
        .from('learning_materials')
        .insert({
          module_id: module_id,
          title: `${module.title} - Video Lecture`,
          kind: 'video',
          url: storedUrl,
          meta
        });
    }

    console.log('Video generation complete:', storedUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        video_url: storedUrl,
        status: 'complete',
        talk_id: talkId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating video:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
