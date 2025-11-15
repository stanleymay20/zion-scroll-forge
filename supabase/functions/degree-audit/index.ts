import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.info("✝️ Degree Audit — Christ governs completion");

const requestSchema = z.object({
  student_id: z.string().uuid(),
  degree_program_id: z.string().uuid().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const body = await req.json();
    const { student_id, degree_program_id } = requestSchema.parse(body);

    // Verify user can access this audit
    if (user.id !== student_id) {
      // Check if user is admin or faculty
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['admin', 'faculty'].includes(profile.role)) {
        throw new Error("Forbidden");
      }
    }

    // Get student's completed courses
    const { data: transcripts, error: transcriptError } = await supabase
      .from('transcripts')
      .select(`
        *,
        courses(
          id,
          title,
          faculty,
          level
        )
      `)
      .eq('student_id', student_id);

    if (transcriptError) throw transcriptError;

    // Calculate total credits and GPA
    const totalCredits = transcripts?.length * 3 || 0; // Assuming 3 credits per course
    
    const gradePoints: Record<string, number> = {
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D': 1.0,
      'F': 0.0,
    };

    const gpaSum = transcripts?.reduce((sum, t) => {
      return sum + (gradePoints[t.grade || 'C'] || 2.0);
    }, 0) || 0;

    const gpa = transcripts?.length ? (gpaSum / transcripts.length).toFixed(2) : "0.00";

    // Get degree requirements (mock for now)
    const requirements = {
      core_theology: { required: 36, completed: 0 },
      biblical_languages: { required: 12, completed: 0 },
      ministry_practicum: { required: 12, completed: 0 },
      general_education: { required: 30, completed: 0 },
      electives: { required: 30, completed: 0 },
    };

    // Categorize completed courses
    transcripts?.forEach((t) => {
      const faculty = t.courses?.faculty?.toLowerCase() || '';
      if (faculty.includes('theology') || faculty.includes('biblical')) {
        requirements.core_theology.completed += 3;
      } else if (faculty.includes('language')) {
        requirements.biblical_languages.completed += 3;
      } else if (faculty.includes('ministry') || faculty.includes('practical')) {
        requirements.ministry_practicum.completed += 3;
      } else {
        requirements.general_education.completed += 3;
      }
    });

    const totalRequired = Object.values(requirements).reduce((sum, r) => sum + r.required, 0);
    const totalCompleted = Object.values(requirements).reduce((sum, r) => sum + r.completed, 0);
    const percentComplete = (totalCompleted / totalRequired) * 100;

    // Check graduation eligibility
    const isEligible = totalCompleted >= totalRequired && parseFloat(gpa) >= 2.0;

    return new Response(
      JSON.stringify({
        student_id,
        degree_program: "Bachelor of Theology",
        total_credits_required: totalRequired,
        total_credits_earned: totalCompleted,
        percent_complete: percentComplete.toFixed(1),
        gpa,
        requirements,
        is_eligible_for_graduation: isEligible,
        completed_courses: transcripts?.length || 0,
        estimated_graduation: isEligible ? "Ready" : "In Progress",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Degree audit error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: error.message === "Unauthorized" || error.message === "Forbidden" ? 403 : 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
