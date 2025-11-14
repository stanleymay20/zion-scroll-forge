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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('✝️ Phase 7: Comprehensive Content Generation Started');

    // Initialize progress
    const { data: progress } = await supabase
      .from('generation_progress')
      .insert({
        progress: 0,
        current_stage: 'Initializing comprehensive content generation',
        faculties_created: 0,
        courses_created: 0,
        modules_created: 0,
        tutors_created: 0
      })
      .select()
      .single();

    // Start generation in background
    EdgeRuntime.waitUntil(runGeneration(supabase, lovableApiKey, progress.id));

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Phase 7 content generation started',
        progressId: progress.id,
        estimatedTime: '2-4 hours'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function runGeneration(supabase: any, apiKey: string, progressId: string) {
  let stats = {
    faculties: 0,
    courses: 0,
    modules: 0,
    quizzes: 0,
    materials: 0
  };

  try {
    // Get all faculties
    const { data: faculties } = await supabase.from('faculties').select('*');
    
    if (!faculties) {
      throw new Error('No faculties found');
    }

    console.log(`Processing ${faculties.length} faculties`);

    for (let i = 0; i < faculties.length; i++) {
      const faculty = faculties[i];
      
      await updateProgress(supabase, progressId, {
        stage: `Generating ${faculty.name}`,
        progress: Math.floor((i / faculties.length) * 90),
        faculties_created: i,
        courses_created: stats.courses,
        modules_created: stats.modules
      });

      // Generate 6 courses per faculty
      for (let j = 0; j < 6; j++) {
        try {
          const course = await genCourse(supabase, apiKey, faculty);
          stats.courses++;

          // Generate 8 modules per course
          for (let k = 0; k < 8; k++) {
            const module = await genModule(supabase, apiKey, course, k + 1);
            stats.modules++;

            const quiz = await genQuiz(supabase, module);
            stats.quizzes++;

            const mats = await genMaterials(supabase, module);
            stats.materials += mats;

            await delay(1500); // Rate limit protection
          }
        } catch (e) {
          console.error(`Course ${j} error:`, e);
        }
      }

      stats.faculties++;
    }

    // Complete
    await updateProgress(supabase, progressId, {
      stage: 'Generation Complete',
      progress: 100,
      faculties_created: stats.faculties,
      courses_created: stats.courses,
      modules_created: stats.modules
    });

    console.log('✝️ Generation Complete:', stats);

  } catch (error) {
    console.error('Fatal error:', error);
    await updateProgress(supabase, progressId, {
      stage: `Error: ${error.message}`,
      progress: -1
    });
  }
}

async function genCourse(supabase: any, apiKey: string, faculty: any) {
  const prompt = `Generate a course for ${faculty.name}.
Title: Create a specific, Christ-centered course title
Description: 250 words on purpose, objectives, kingdom impact
Level: Beginner, Intermediate, or Advanced
Duration: 8-12 weeks
Include biblical integration.`;

  const response = await callAI(apiKey, prompt);
  const data = extractCourseData(response, faculty);

  const { data: course } = await supabase.from('courses').insert({
    title: data.title,
    description: data.description,
    faculty: faculty.name,
    faculty_id: faculty.id,
    level: data.level,
    duration: '10 weeks',
    price: 0,
    rating: 5.0,
    students: 0
  }).select().single();

  return course;
}

async function genModule(supabase: any, apiKey: string, course: any, idx: number) {
  const prompt = `Module ${idx}/8 for "${course.title}"

Generate:
- Title
- Content: 1000 words markdown
  - Introduction (150 words)
  - 3 teaching sections (250 words each)
  - Application (200 words)
  - Kingdom reflection (150 words)
- 1 Scripture with verse
- 1 Scroll Invocation (50 words)
- ScrollCoin markers: "✝️ Complete to earn 10 ScrollCoins"
- Christ-Lordship statement
- Duration: 50 minutes`;

  const response = await callAI(apiKey, prompt);
  const data = extractModuleData(response, idx);

  const { data: module } = await supabase.from('course_modules').insert({
    course_id: course.id,
    title: data.title,
    content_md: data.content,
    order_index: idx,
    duration_minutes: 50,
    rewards_amount: 10
  }).select().single();

  return module;
}

async function genQuiz(supabase: any, module: any) {
  const { data: quiz } = await supabase.from('quizzes').insert({
    module_id: module.id,
    title: `${module.title} Assessment`,
    passing_score: 70
  }).select().single();

  // Generate 8 questions
  for (let i = 0; i < 8; i++) {
    await supabase.from('quiz_questions').insert({
      quiz_id: quiz.id,
      question_text: `Question ${i + 1} for ${module.title}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: 'A',
      explanation: 'Correct answer explanation'
    });
  }

  return quiz;
}

async function genMaterials(supabase: any, module: any) {
  const materials = [
    { kind: 'pdf', title: 'Study Guide', url: `/materials/m${module.id}/guide.pdf` },
    { kind: 'slides', title: 'Slides', url: `/materials/m${module.id}/slides.pptx` },
    { kind: 'infographic', title: 'Visual', url: `/materials/m${module.id}/info.png` },
    { kind: 'video', title: 'Video Outline', url: `/materials/m${module.id}/video.md` }
  ];

  for (const mat of materials) {
    await supabase.from('learning_materials').insert({
      module_id: module.id,
      ...mat
    });
  }

  return materials.length;
}

async function callAI(apiKey: string, prompt: string) {
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'Generate ScrollUniversity content. All content honors Christ.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    })
  });

  if (!res.ok) throw new Error(`AI error: ${res.status}`);
  
  const data = await res.json();
  return data.choices[0].message.content;
}

function extractCourseData(text: string, faculty: any) {
  const lines = text.split('\n');
  let title = `${faculty.name} Course`;
  let description = `Comprehensive course in ${faculty.name}`;
  let level = 'Intermediate';

  for (const line of lines) {
    if (line.toLowerCase().includes('title:')) {
      title = line.split(':')[1]?.trim() || title;
    } else if (line.toLowerCase().includes('description:')) {
      description = line.split(':')[1]?.trim() || description;
    } else if (line.match(/(beginner|intermediate|advanced)/i)) {
      level = line.match(/(beginner|intermediate|advanced)/i)![0];
    }
  }

  return { title, description, level };
}

function extractModuleData(text: string, idx: number) {
  const lines = text.split('\n');
  let title = `Module ${idx}`;

  for (const line of lines) {
    if (line.startsWith('#') || line.toLowerCase().includes('title:')) {
      title = line.replace(/#/g, '').replace(/title:/i, '').trim() || title;
      break;
    }
  }

  return { title, content: text };
}

async function updateProgress(supabase: any, id: string, updates: any) {
  await supabase.from('generation_progress').update({
    ...updates,
    updated_at: new Date().toISOString()
  }).eq('id', id);
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
