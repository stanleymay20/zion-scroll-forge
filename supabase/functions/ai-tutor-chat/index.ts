import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { 
  validateChatHistory, 
  validateUUID, 
  validateLength,
  sanitizeString,
  MAX_LENGTHS,
  ValidationError,
  createValidationErrorResponse,
  extractAuthenticatedUser
} from '../_shared/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ✝️ Multi-tenant institution resolver
async function resolveInstitutionId(req: Request, supabase: any, bodyData?: any, userId?: string): Promise<string> {
  try {
    if (bodyData?.institution_id) {
      return bodyData.institution_id;
    }

    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_institution_id')
        .eq('id', userId)
        .single();
      if (profile?.current_institution_id) {
        return profile.current_institution_id;
      }
    }

    const { data } = await supabase.from('institutions').select('id').eq('slug', 'scrolluniversity').single();
    return data?.id;
  } catch {
    throw new Error('Failed to resolve institution');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract and validate authenticated user
    const { user, error: authError } = await extractAuthenticatedUser(req, supabase, corsHeaders);
    if (authError) return authError;

    const bodyData = await req.json();
    const { messages, tutorId, moduleId, moduleContent, userId, withVoice } = bodyData;
    const startTime = Date.now();

    // ===== INPUT VALIDATION =====
    // Validate messages array
    const validatedMessages = validateChatHistory(messages);
    if (validatedMessages.length === 0) {
      throw new ValidationError('messages array cannot be empty');
    }
    
    // Validate UUIDs
    validateUUID(tutorId, 'tutorId');
    validateUUID(moduleId, 'moduleId');
    validateUUID(userId, 'userId');
    
    // Validate module content length
    const validatedModuleContent = sanitizeString(moduleContent)?.substring(0, MAX_LENGTHS.content);
    
    // Use authenticated user's ID
    const effectiveUserId = user.id;
    
    // Resolve institution_id
    const institutionId = await resolveInstitutionId(req, supabase, bodyData, effectiveUserId);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build system prompt based on tutor and module context
    const systemPrompt = `You are an AI tutor at ScrollUniversity, a Christ-centered online learning institution. 

IDENTITY: You are a knowledgeable, patient, and encouraging tutor who helps students understand complex topics through biblical wisdom and academic excellence.

CONTEXT: ${validatedModuleContent ? `You are currently helping students with this module content:\n${validatedModuleContent.substring(0, 2000)}` : 'You are available to answer any course-related questions.'}

GUIDELINES:
- Always acknowledge Jesus Christ as Lord over all learning
- Provide clear, accurate, and helpful explanations
- Use biblical principles to illustrate concepts when appropriate
- Be encouraging and build student confidence
- Ask clarifying questions if needed
- Provide examples and practical applications
- Keep responses concise but thorough (2-4 paragraphs typically)
- End with a question or next step to continue learning

TONE: Professional yet warm, scholarly yet accessible, wise yet humble.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...validatedMessages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'RATE_LIMITED',
            message: 'Rate limit exceeded. Please try again in a moment.',
            userFriendlyMessage: 'Please wait a moment before trying again'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'CREDITS_REQUIRED',
            message: 'AI credits exhausted. Please contact support.',
            userFriendlyMessage: 'AI credits needed - please add credits in workspace settings'
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices[0].message.content;
    const responseTime = Date.now() - startTime;

    // Track interaction analytics
    if (effectiveUserId && moduleId) {
      await supabase.from('ai_conversations').insert({
        institution_id: institutionId,
        user_id: effectiveUserId,
        faculty: tutorId || 'general',
        subject: moduleId,
        messages: validatedMessages.concat([{ role: 'assistant', content: message }]),
        learning_insights: {
          responseTime,
          moduleId,
          tutorId
        }
      });
    }

    return new Response(
      JSON.stringify({ message, responseTime }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    // Handle validation errors separately
    if (error instanceof ValidationError) {
      return createValidationErrorResponse(error, corsHeaders);
    }
    
    console.error('AI Tutor error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
