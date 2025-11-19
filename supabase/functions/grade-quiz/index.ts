import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuizSubmission {
  attemptId: string;
  responses: Record<string, any>;
  timeSpent: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify JWT token
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { attemptId, responses, timeSpent }: QuizSubmission = await req.json()

    if (!attemptId || !responses) {
      return new Response('Missing required fields', { status: 400, headers: corsHeaders })
    }

    // Use the auto-grading function
    const { data: success, error: gradingError } = await supabaseClient.rpc('auto_grade_quiz', {
      attempt_uuid: attemptId
    })

    if (gradingError || !success) {
      throw new Error('Failed to grade quiz: ' + (gradingError?.message || 'Unknown error'))
    }

    // Get the updated attempt details
    const { data: attempt } = await supabaseClient
      .from('quiz_attempts')
      .select(`
        *,
        assessments (
          title,
          max_attempts,
          course_id
        )
      `)
      .eq('id', attemptId)
      .single()

    return new Response(
      JSON.stringify({
        success: true,
        attempt: attempt,
        message: attempt?.passed ? 'Congratulations! You passed the quiz.' : 'Quiz completed. Review your results and try again if possible.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Quiz grading error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})