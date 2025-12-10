import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');
const lovableKey = Deno.env.get('LOVABLE_API_KEY');
const openaiKey = Deno.env.get('OPENAI_API_KEY');
const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

// Generate content using AI
async function generateContent(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = deepseekKey || lovableKey;
  const apiUrl = deepseekKey 
    ? 'https://api.deepseek.com/v1/chat/completions'
    : 'https://ai.gateway.lovable.dev/v1/chat/completions';
  const model = deepseekKey ? 'deepseek-chat' : 'google/gemini-2.5-flash';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 8000,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Generate PDF content as HTML (will be converted to PDF-like format)
async function generatePDFContent(moduleTitle: string, courseTitle: string, weekNumber: number): Promise<string> {
  const systemPrompt = `You are an expert educational content creator for Scroll University. 
Create comprehensive study guide content in clean HTML format that can be saved as a PDF.
Include proper headings, paragraphs, bullet points, and scripture references.
Make the content academically rigorous yet spiritually enriching.`;

  const prompt = `Create a comprehensive PDF study guide for:
Course: ${courseTitle}
Module: ${moduleTitle}
Week: ${weekNumber}

Include:
1. Learning Objectives (5-7 specific objectives)
2. Key Concepts Overview (2000+ words of detailed content)
3. Scripture Integration (5-10 relevant scripture references with explanations)
4. Practical Applications (real-world examples and case studies)
5. Discussion Questions (10 thought-provoking questions)
6. Further Reading Recommendations
7. Summary and Key Takeaways
8. Glossary of Key Terms

Format as clean HTML with proper semantic structure.`;

  return await generateContent(prompt, systemPrompt);
}

// Generate lecture notes
async function generateLectureNotes(moduleTitle: string, courseTitle: string, weekNumber: number): Promise<string> {
  const systemPrompt = `You are creating detailed lecture notes for university students.
Write in a clear, academic style with comprehensive explanations.
Include diagrams described in text, key points highlighted, and memory aids.`;

  const prompt = `Create detailed lecture notes for:
Course: ${courseTitle}
Module: ${moduleTitle}
Week: ${weekNumber}

Include:
1. Lecture Overview and Agenda
2. Core Content (3000+ words covering all key topics)
3. Important Definitions and Concepts
4. Examples and Illustrations
5. Common Misconceptions
6. Memory Aids and Mnemonics
7. Note-Taking Tips
8. Self-Assessment Checklist

Format as clean HTML.`;

  return await generateContent(prompt, systemPrompt);
}

// Generate scripture study content
async function generateScriptureStudy(moduleTitle: string, courseTitle: string, faculty: string): Promise<string> {
  const systemPrompt = `You are a biblical scholar creating in-depth scripture study materials.
Integrate theological depth with practical application.
Include original language insights where relevant.`;

  const prompt = `Create a comprehensive scripture study guide for:
Course: ${courseTitle}
Topic: ${moduleTitle}
Faculty: ${faculty}

Include:
1. Primary Scripture Passages (5-10 key verses with full text)
2. Context and Background (historical, cultural, literary)
3. Original Language Insights (Hebrew/Greek key terms)
4. Cross-References and Related Passages
5. Theological Themes
6. Personal Reflection Questions (10 questions)
7. Prayer Points
8. Application Exercises
9. Memorization Verses

Format as clean HTML.`;

  return await generateContent(prompt, systemPrompt);
}

// Generate discussion guide
async function generateDiscussionGuide(moduleTitle: string, courseTitle: string, weekNumber: number): Promise<string> {
  const systemPrompt = `You are creating engaging discussion materials for study groups.
Design questions that promote deep thinking and community learning.`;

  const prompt = `Create a comprehensive discussion guide for:
Course: ${courseTitle}
Module: ${moduleTitle}
Week: ${weekNumber}

Include:
1. Ice Breaker Questions (3-5)
2. Review Questions (10 factual recall questions)
3. Analysis Questions (10 deeper thinking questions)
4. Application Questions (10 practical application questions)
5. Debate Topics (5 discussion-worthy topics with multiple perspectives)
6. Group Activities (3-5 interactive exercises)
7. Case Studies (2-3 scenarios for group analysis)
8. Closing Reflection Prompts
9. Weekly Challenge/Assignment

Format as clean HTML.`;

  return await generateContent(prompt, systemPrompt);
}

// Generate video script
async function generateVideoScript(moduleTitle: string, courseTitle: string, duration: number = 15): Promise<string> {
  const systemPrompt = `You are writing professional educational video scripts.
Include clear narrator cues, visual suggestions, and timing notes.
Make content engaging and suitable for video presentation.`;

  const prompt = `Create a ${duration}-minute video lecture script for:
Course: ${courseTitle}
Topic: ${moduleTitle}

Include:
1. Hook/Introduction (capture attention in first 30 seconds)
2. Learning Objectives Statement
3. Main Content Sections (with [VISUAL CUE] markers)
4. Key Point Summaries
5. Examples and Illustrations
6. Scripture Integration Points
7. Interactive Pause Points (for reflection)
8. Conclusion and Call to Action
9. Preview of Next Lesson

Format with clear [NARRATOR], [VISUAL], [ON-SCREEN TEXT], and [TIMING] markers.`;

  return await generateContent(prompt, systemPrompt);
}

// Generate audio using ElevenLabs TTS
async function generateAudio(text: string, voiceId: string = 'JBFqnCBsd6RMkjVDRZzb'): Promise<Uint8Array | null> {
  if (!elevenLabsKey) {
    console.log('ElevenLabs API key not configured, skipping audio generation');
    return null;
  }

  try {
    // Truncate text to avoid API limits (ElevenLabs has character limits)
    const truncatedText = text.substring(0, 5000);
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: truncatedText,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      console.error('ElevenLabs error:', await response.text());
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Audio generation error:', error);
    return null;
  }
}

// Convert HTML to a simple text format for audio
function htmlToText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Upload file to Supabase Storage
async function uploadToStorage(
  bucket: string,
  path: string,
  content: Uint8Array | string,
  contentType: string
): Promise<string | null> {
  try {
    const fileContent = typeof content === 'string' 
      ? new TextEncoder().encode(content) 
      : content;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, fileContent, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

// Generate all materials for a module
async function generateModuleMaterials(
  moduleId: string,
  moduleTitle: string,
  courseTitle: string,
  faculty: string,
  weekNumber: number,
  institutionId: string
): Promise<{ success: boolean; materials: any[] }> {
  const materials: any[] = [];
  const basePath = `courses/${courseTitle.toLowerCase().replace(/\s+/g, '-')}`;
  const moduleSlug = moduleTitle.toLowerCase().replace(/\s+/g, '-').substring(0, 30);

  console.log(`Generating materials for: ${moduleTitle}`);

  // 1. Generate PDF Study Guide
  try {
    console.log('Generating PDF study guide...');
    const pdfContent = await generatePDFContent(moduleTitle, courseTitle, weekNumber);
    const pdfPath = `${basePath}/week-${weekNumber}/${moduleSlug}-study-guide.html`;
    const pdfUrl = await uploadToStorage('materials', pdfPath, pdfContent, 'text/html');
    
    if (pdfUrl) {
      const { data: material } = await supabase.from('learning_materials').insert({
        module_id: moduleId,
        institution_id: institutionId,
        title: `${moduleTitle} - Study Guide`,
        kind: 'pdf',
        url: pdfUrl,
        meta: { type: 'study_guide', week: weekNumber, generated: true }
      }).select().single();
      
      if (material) materials.push(material);
    }
  } catch (e) {
    console.error('PDF generation error:', e);
  }

  // 2. Generate Lecture Notes
  try {
    console.log('Generating lecture notes...');
    const notesContent = await generateLectureNotes(moduleTitle, courseTitle, weekNumber);
    const notesPath = `${basePath}/week-${weekNumber}/${moduleSlug}-lecture-notes.html`;
    const notesUrl = await uploadToStorage('materials', notesPath, notesContent, 'text/html');
    
    if (notesUrl) {
      const { data: material } = await supabase.from('learning_materials').insert({
        module_id: moduleId,
        institution_id: institutionId,
        title: `${moduleTitle} - Lecture Notes`,
        kind: 'notes',
        url: notesUrl,
        meta: { type: 'lecture_notes', week: weekNumber, generated: true }
      }).select().single();
      
      if (material) materials.push(material);
    }
  } catch (e) {
    console.error('Notes generation error:', e);
  }

  // 3. Generate Scripture Study Guide
  try {
    console.log('Generating scripture study...');
    const scriptureContent = await generateScriptureStudy(moduleTitle, courseTitle, faculty);
    const scripturePath = `${basePath}/week-${weekNumber}/${moduleSlug}-scripture-study.html`;
    const scriptureUrl = await uploadToStorage('materials', scripturePath, scriptureContent, 'text/html');
    
    if (scriptureUrl) {
      const { data: material } = await supabase.from('learning_materials').insert({
        module_id: moduleId,
        institution_id: institutionId,
        title: `${moduleTitle} - Scripture Study`,
        kind: 'pdf',
        url: scriptureUrl,
        meta: { type: 'scripture_study', week: weekNumber, generated: true }
      }).select().single();
      
      if (material) materials.push(material);
    }
  } catch (e) {
    console.error('Scripture study error:', e);
  }

  // 4. Generate Discussion Guide
  try {
    console.log('Generating discussion guide...');
    const discussionContent = await generateDiscussionGuide(moduleTitle, courseTitle, weekNumber);
    const discussionPath = `${basePath}/week-${weekNumber}/${moduleSlug}-discussion-guide.html`;
    const discussionUrl = await uploadToStorage('materials', discussionPath, discussionContent, 'text/html');
    
    if (discussionUrl) {
      const { data: material } = await supabase.from('learning_materials').insert({
        module_id: moduleId,
        institution_id: institutionId,
        title: `${moduleTitle} - Discussion Guide`,
        kind: 'pdf',
        url: discussionUrl,
        meta: { type: 'discussion_guide', week: weekNumber, generated: true }
      }).select().single();
      
      if (material) materials.push(material);
    }
  } catch (e) {
    console.error('Discussion guide error:', e);
  }

  // 5. Generate Video Script
  try {
    console.log('Generating video script...');
    const videoScript = await generateVideoScript(moduleTitle, courseTitle);
    const scriptPath = `${basePath}/week-${weekNumber}/${moduleSlug}-video-script.html`;
    const scriptUrl = await uploadToStorage('materials', scriptPath, videoScript, 'text/html');
    
    if (scriptUrl) {
      const { data: material } = await supabase.from('learning_materials').insert({
        module_id: moduleId,
        institution_id: institutionId,
        title: `${moduleTitle} - Video Script`,
        kind: 'video_script',
        url: scriptUrl,
        meta: { type: 'video_script', week: weekNumber, duration_minutes: 15, generated: true }
      }).select().single();
      
      if (material) materials.push(material);
    }
  } catch (e) {
    console.error('Video script error:', e);
  }

  // 6. Generate Audio Lecture (if ElevenLabs key is available)
  if (elevenLabsKey) {
    try {
      console.log('Generating audio lecture...');
      // Create a condensed lecture text for audio
      const audioScript = await generateContent(
        `Create a 5-minute spoken lecture script for: ${moduleTitle} from course ${courseTitle}. 
        Make it conversational but educational. Include scripture references naturally.
        Keep it under 3000 characters for audio generation.`,
        'You are creating a spoken lecture for audio format. Be engaging and clear.'
      );
      
      const audioData = await generateAudio(audioScript);
      
      if (audioData) {
        const audioPath = `${basePath}/week-${weekNumber}/${moduleSlug}-audio-lecture.mp3`;
        const audioUrl = await uploadToStorage('materials', audioPath, audioData, 'audio/mpeg');
        
        if (audioUrl) {
          const { data: material } = await supabase.from('learning_materials').insert({
            module_id: moduleId,
            institution_id: institutionId,
            title: `${moduleTitle} - Audio Lecture`,
            kind: 'audio',
            url: audioUrl,
            meta: { type: 'audio_lecture', week: weekNumber, generated: true }
          }).select().single();
          
          if (material) materials.push(material);
        }
      }
    } catch (e) {
      console.error('Audio generation error:', e);
    }
  }

  return { success: true, materials };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { module_id, course_id, batch_generate } = await req.json();

    // Single module generation
    if (module_id) {
      const { data: module, error: moduleError } = await supabase
        .from('course_modules')
        .select(`
          *,
          course:courses(
            id,
            title,
            faculty,
            institution_id
          )
        `)
        .eq('id', module_id)
        .single();

      if (moduleError || !module) {
        return new Response(
          JSON.stringify({ error: 'Module not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await generateModuleMaterials(
        module.id,
        module.title,
        module.course?.title || 'Unknown Course',
        module.course?.faculty || 'Theology',
        module.order_index || 1,
        module.institution_id
      );

      return new Response(
        JSON.stringify({ success: true, ...result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch generate for all modules in a course
    if (course_id) {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id, title, faculty, institution_id')
        .eq('id', course_id)
        .single();

      if (courseError || !course) {
        return new Response(
          JSON.stringify({ error: 'Course not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: modules } = await supabase
        .from('course_modules')
        .select('id, title, order_index')
        .eq('course_id', course_id)
        .order('order_index');

      if (!modules?.length) {
        return new Response(
          JSON.stringify({ error: 'No modules found for this course' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Start background generation
      EdgeRuntime.waitUntil((async () => {
        const allMaterials: any[] = [];
        
        for (const module of modules) {
          const result = await generateModuleMaterials(
            module.id,
            module.title,
            course.title,
            course.faculty || 'Theology',
            module.order_index || 1,
            course.institution_id
          );
          allMaterials.push(...result.materials);
          
          // Small delay between modules to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log(`Batch generation complete: ${allMaterials.length} materials created for course ${course.title}`);
      })());

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Started generating materials for ${modules.length} modules`,
          modules_count: modules.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'module_id or course_id required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-materials:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
