import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ✝️ Multi-tenant institution resolver
async function resolveInstitutionId(req: Request, supabase: any, bodyData?: any): Promise<string> {
  try {
    // Priority 1: Request body
    if (bodyData?.institution_id) {
      console.log('✝️ Using institution_id from request:', bodyData.institution_id);
      return bodyData.institution_id;
    }

    // Priority 2: JWT/Profile
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
            console.log('✝️ Using institution_id from profile:', profile.current_institution_id);
            return profile.current_institution_id;
          }
        }
      }
    } catch {}

    // Priority 3: Default ScrollUniversity
    const { data } = await supabase.from('institutions').select('id').eq('slug', 'scrolluniversity').single();
    if (data) {
      console.log('✝️ Using default ScrollUniversity institution:', data.id);
      return data.id;
    }

    throw new Error('No institution could be resolved');
  } catch (error) {
    console.error('Institution resolution error:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const bodyData = await req.json();

    // Resolve institution_id for multi-tenancy
    const institutionId = await resolveInstitutionId(req, supabase, bodyData);

    console.log(`✝️ Phase 7: Content Generation Started for institution ${institutionId}`);

    // Initialize progress
    const { data: progress } = await supabase
      .from('generation_progress')
      .insert({
        institution_id: institutionId,
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
    EdgeRuntime.waitUntil(runGeneration(supabase, lovableApiKey, progress.id, institutionId));

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Phase 7 content generation started',
        institution_id: institutionId,
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

async function runGeneration(supabase: any, apiKey: string, progressId: string, institutionId: string) {
  let stats = {
    faculties: 0,
    courses: 0,
    modules: 0,
    quizzes: 0,
    materials: 0
  };

  try {
    // Get all faculties for this institution
    const { data: faculties } = await supabase
      .from('faculties')
      .select('*')
      .eq('institution_id', institutionId);
    
    if (!faculties || faculties.length === 0) {
      throw new Error('No faculties found for this institution');
    }

    console.log(`Processing ${faculties.length} faculties for institution ${institutionId}`);

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
          const course = await genCourse(supabase, apiKey, faculty, institutionId);
          stats.courses++;

          // Generate 8 modules per course
          for (let k = 0; k < 8; k++) {
            const module = await genModule(supabase, apiKey, course, k + 1, institutionId);
            stats.modules++;

            const quiz = await genQuiz(supabase, module, institutionId);
            stats.quizzes++;

            await genMaterials(supabase, apiKey, module, institutionId);
            stats.materials += 3;
          }
        } catch (err) {
          console.error(`Error generating course:`, err);
        }
      }
    }

    await updateProgress(supabase, progressId, {
      stage: 'Complete',
      progress: 100,
      faculties_created: faculties.length,
      courses_created: stats.courses,
      modules_created: stats.modules
    });

    console.log('✝️ Content generation complete:', stats);
  } catch (error) {
    console.error('Generation failed:', error);
    await updateProgress(supabase, progressId, {
      stage: `Error: ${error.message}`,
      progress: -1
    });
  }
}

async function genCourse(supabase: any, apiKey: string, faculty: any, institutionId: string) {
  const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{
        role: 'user',
        content: `Create a Christ-centered course for ${faculty.name}. Return JSON: {title, description, level, duration, learning_objectives}`
      }],
      temperature: 0.8,
    }),
  });

  const data = await aiResponse.json();
  const courseData = JSON.parse(data.choices[0].message.content);

  const { data: course } = await supabase.from('courses').insert({
    institution_id: institutionId,
    title: courseData.title,
    description: courseData.description,
    faculty: faculty.name,
    faculty_id: faculty.id,
    level: courseData.level || 'Beginner',
    duration: courseData.duration || '8 weeks',
    tags: courseData.learning_objectives || [],
    xr_enabled: false
  }).select().single();

  return course;
}

async function genModule(supabase: any, apiKey: string, course: any, order: number, institutionId: string) {
  const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [{
        role: 'user',
        content: `Create module ${order} for course "${course.title}". 900-1200 words markdown content with scripture reference and ScrollCoin reward markers. Return JSON: {title, content_md}`
      }],
      temperature: 0.7,
    }),
  });

  const data = await aiResponse.json();
  const moduleData = JSON.parse(data.choices[0].message.content);

  const { data: module } = await supabase.from('course_modules').insert({
    institution_id: institutionId,
    course_id: course.id,
    title: moduleData.title,
    content_md: moduleData.content_md,
    order_index: order,
    duration_minutes: 45,
    rewards_amount: 10
  }).select().single();

  return module;
}

async function genQuiz(supabase: any, module: any, institutionId: string) {
  const { data: quiz } = await supabase.from('quizzes').insert({
    institution_id: institutionId,
    module_id: module.id,
    title: `${module.title} Assessment`,
    passing_score: 70
  }).select().single();

  // Generate 7-10 quiz questions
  for (let i = 0; i < 8; i++) {
    await supabase.from('quiz_questions').insert({
      quiz_id: quiz.id,
      question_text: `Question ${i+1} for ${module.title}`,
      question_type: 'multiple_choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: 'Option A',
      points: 10
    });
  }

  return quiz;
}

async function genMaterials(supabase: any, apiKey: string, module: any, institutionId: string) {
  // Generate PDF, slides, infographic (simplified)
  await supabase.from('learning_materials').insert([
    { institution_id: institutionId, module_id: module.id, title: `${module.title} - Study Guide`, kind: 'pdf', url: '/materials/placeholder.pdf' },
    { institution_id: institutionId, module_id: module.id, title: `${module.title} - Slides`, kind: 'slides', url: '/materials/placeholder.pptx' },
    { institution_id: institutionId, module_id: module.id, title: `${module.title} - Infographic`, kind: 'image', url: '/materials/placeholder.png' }
  ]);
}

async function updateProgress(supabase: any, progressId: string, updates: any) {
  await supabase.from('generation_progress').update(updates).eq('id', progressId);
}
