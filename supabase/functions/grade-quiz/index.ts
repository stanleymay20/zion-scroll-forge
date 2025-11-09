import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.info('✝️ Jesus Christ is Lord - Auto-grading quiz submission');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { submissionId } = await req.json();

    // Load submission + answers
    const { data: sub, error: subError } = await supabase
      .from('submissions')
      .select('id, user_id, assignment_id, answers')
      .eq('id', submissionId)
      .single();

    if (subError || !sub) {
      throw new Error('Submission not found');
    }

    // Load questions
    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('assignment_id', sub.assignment_id)
      .order('order_index');

    let score = 0;
    const rubric: any[] = [];

    for (const q of questions ?? []) {
      const studentAnswer = sub.answers?.[q.id] ?? null;
      let earned = 0;

      if (q.kind === 'mcq' || q.kind === 'tf') {
        // Exact match for multiple choice and true/false
        if (String(studentAnswer).trim().toLowerCase() === String(q.answer).trim().toLowerCase()) {
          earned = q.points;
        }
      } else if (q.kind === 'short') {
        // Keyword match for short answer (comma-separated keywords)
        const keys = String(q.answer ?? '')
          .toLowerCase()
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        const ans = String(studentAnswer ?? '').toLowerCase();
        const hits = keys.filter(k => ans.includes(k)).length;
        if (hits > 0) {
          earned = Math.round((hits / Math.max(keys.length, 1)) * q.points);
        }
      }

      score += earned;
      rubric.push({ question_id: q.id, points: q.points, earned, kind: q.kind });
    }

    // Insert grade
    const { data: grade, error: gradeError } = await supabase
      .from('grades')
      .insert({
        submission_id: submissionId,
        grader_user_id: null, // auto-graded
        score,
        rubric,
        feedback: 'Automatic grading completed. Review if needed.'
      })
      .select()
      .single();

    if (gradeError) throw gradeError;

    // Mark submission as graded
    await supabase
      .from('submissions')
      .update({ status: 'graded' })
      .eq('id', submissionId);

    // Award ScrollCoins for completion
    await supabase.rpc('earn_scrollcoin', {
      p_user_id: sub.user_id,
      p_amount: Math.max(1, Math.floor(score / 10)),
      p_desc: 'Quiz completed'
    });

    return new Response(
      JSON.stringify({ score, rubric, grade }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('Grade quiz error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
