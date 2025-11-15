import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.info('✝️ Course Recommendations — Christ is Lord over guidance');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('authorization')!;
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) throw new Error('Unauthorized');

    const { userId, institutionId } = await req.json();

    // Get user's completed courses
    const { data: completedCourses } = await supabase
      .from('enrollments')
      .select('course_id, courses(faculty, tags)')
      .eq('user_id', userId)
      .eq('institution_id', institutionId)
      .gte('progress', 80);

    // Extract faculties and tags from completed courses
    const completedFaculties = new Set(
      completedCourses?.map((e: any) => e.courses?.faculty).filter(Boolean) || []
    );
    const completedTags = new Set(
      completedCourses?.flatMap((e: any) => e.courses?.tags || []) || []
    );

    // Find recommended courses based on similar faculties/tags
    const { data: allCourses } = await supabase
      .from('courses')
      .select('id, title, description, faculty, tags, level')
      .eq('institution_id', institutionId);

    // Score and rank recommendations
    const recommendations = allCourses
      ?.filter((course: any) => {
        // Exclude already enrolled courses
        return !completedCourses?.some((e: any) => e.course_id === course.id);
      })
      .map((course: any) => {
        let score = 0;
        
        // Same faculty bonus
        if (completedFaculties.has(course.faculty)) score += 3;
        
        // Tag overlap bonus
        const tagOverlap = course.tags?.filter((t: string) => completedTags.has(t)).length || 0;
        score += tagOverlap * 2;

        // Level progression bonus
        if (course.level === 'intermediate' || course.level === 'advanced') score += 1;

        return {
          course_id: course.id,
          relevance_score: score,
          reason: `Recommended based on your ${completedFaculties.has(course.faculty) ? 'faculty interests' : 'learning progress'}`,
          course
        };
      })
      .sort((a: any, b: any) => b.relevance_score - a.relevance_score)
      .slice(0, 5);

    // Store recommendations
    if (recommendations && recommendations.length > 0) {
      await supabase
        .from('course_recommendations')
        .delete()
        .eq('user_id', userId);

      await supabase
        .from('course_recommendations')
        .insert(
          recommendations.map((r: any) => ({
            user_id: userId,
            course_id: r.course_id,
            relevance_score: r.relevance_score,
            reason: r.reason
          }))
        );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations: recommendations?.map((r: any) => r.course) || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Recommendations error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
