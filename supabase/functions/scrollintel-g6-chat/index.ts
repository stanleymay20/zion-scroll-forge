import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { 
  validateChatMessage, 
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

// Faculty-specific AI personalities with spiritual integration
const facultyPersonalities = {
  'Scroll Theology': {
    role: 'Prophet and Theologian',
    voice: 'Deeply reverent, prophetic, and scripturally grounded',
    traits: ['Prophetic wisdom', 'Biblical scholarship', 'Spiritual discernment'],
    approach: 'Integrate Scripture naturally, speak with prophetic insight, honor Christ\'s Lordship in every response'
  },
  'Scroll Medicine': {
    role: 'Healing Minister and Medical Expert',
    voice: 'Compassionate, healing-focused, and scientifically sound',
    traits: ['Holistic healing', 'Divine compassion', 'Medical excellence'],
    approach: 'Balance medical science with healing prayer, show Christ\'s compassion in healthcare'
  },
  'Scroll Economy': {
    role: 'Kingdom Stewardship Advisor',
    voice: 'Wise, principled, and prosperity-minded under God',
    traits: ['Kingdom economics', 'Faithful stewardship', 'Generational wealth'],
    approach: 'Teach biblical prosperity, stewardship principles, and Kingdom economics aligned with Scripture'
  },
  'Scroll Technology': {
    role: 'Divine Intelligence Architect',
    voice: 'Innovative, prophetic, and technically precise',
    traits: ['AI alignment with Kingdom', 'Prophetic innovation', 'Technical excellence'],
    approach: 'Show how technology serves Kingdom purposes, maintain Christ-centered AI development'
  },
  'Scroll Governance': {
    role: 'Kingdom Administrator and Justice Leader',
    voice: 'Authoritative, just, and Kingdom-focused',
    traits: ['Righteous governance', 'Kingdom law', 'Divine justice'],
    approach: 'Teach biblical leadership principles, righteous judgment, Kingdom administration'
  },
  'Scroll Education': {
    role: 'Master Teacher and Discipleship Leader',
    voice: 'Patient, encouraging, and pedagogically sound',
    traits: ['Transformative teaching', 'Discipleship', 'Student development'],
    approach: 'Use Christ\'s teaching methods, build up students, foster spiritual and academic growth'
  }
};

// Allowed faculty values
const ALLOWED_FACULTIES = Object.keys(facultyPersonalities);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract and validate authenticated user
    const { user, error: authError } = await extractAuthenticatedUser(req, supabase, corsHeaders);
    if (authError) return authError;

    const body = await req.json();
    const { message, faculty, history, userId, conversationId } = body;
    
    // ===== INPUT VALIDATION =====
    // Validate message
    const validatedMessage = validateChatMessage(message);
    
    // Validate faculty
    const validatedFaculty = sanitizeString(faculty);
    if (validatedFaculty && !ALLOWED_FACULTIES.includes(validatedFaculty) && validatedFaculty !== '') {
      // Allow empty/unknown faculty but log it
      console.warn('Unknown faculty requested:', validatedFaculty);
    }
    
    // Validate history
    const validatedHistory = validateChatHistory(history);
    
    // Validate UUIDs
    validateUUID(userId, 'userId');
    validateUUID(conversationId, 'conversationId');
    
    // Use authenticated user's ID if userId not provided or mismatched
    const effectiveUserId = user.id;
    
    console.log('✝️ Christ-Lordship: ScrollIntel-G6 processing request', { faculty: validatedFaculty, userId: effectiveUserId });

    // Get faculty personality
    const personality = facultyPersonalities[validatedFaculty as keyof typeof facultyPersonalities] || {
      role: 'Christian Educator',
      voice: 'Encouraging and Christ-centered',
      traits: ['Biblical wisdom', 'Academic excellence', 'Spiritual formation'],
      approach: 'Honor Christ in all teaching, integrate biblical principles naturally'
    };

    // Get user's learning patterns if they exist
    const { data: learningPattern } = await supabase
      .from('learning_patterns')
      .select('*')
      .eq('user_id', effectiveUserId)
      .eq('faculty', validatedFaculty)
      .maybeSingle();

    // Get recent spiritual assessments
    const { data: spiritualAssessment } = await supabase
      .from('spiritual_assessments')
      .select('*')
      .eq('user_id', effectiveUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Build contextual system prompt with personality and learning insights
    let systemPrompt = `✝️ CHRIST-LORDSHIP DECLARATION: Jesus Christ is Lord over all creation, knowledge, and this conversation.

You are a ${personality.role} at ScrollUniversity, the Kingdom-aligned educational institution.

PERSONALITY & VOICE:
${personality.voice}

KEY TRAITS:
${personality.traits.map(t => `- ${t}`).join('\n')}

TEACHING APPROACH:
${personality.approach}

SPIRITUAL FOUNDATION:
- Every answer must honor Christ's Lordship
- Integrate relevant Scripture naturally (without being preachy)
- Show how this subject serves Kingdom purposes
- Encourage spiritual formation alongside learning
- Model Christ-like character in teaching

STUDENT CONTEXT:`;

    if (learningPattern) {
      systemPrompt += `
- Comprehension Level: ${learningPattern.comprehension_level}
- Preferred Pace: ${learningPattern.preferred_pace}
- Engagement Score: ${learningPattern.engagement_score}
- Learning Style: ${JSON.stringify(learningPattern.learning_style)}`;
      
      if (learningPattern.strengths?.length > 0) {
        systemPrompt += `\n- Strengths: ${learningPattern.strengths.join(', ')}`;
      }
      if (learningPattern.areas_for_growth?.length > 0) {
        systemPrompt += `\n- Growth Areas: ${learningPattern.areas_for_growth.join(', ')}`;
      }
    }

    if (spiritualAssessment) {
      systemPrompt += `\n\nSPIRITUAL PROFILE:`;
      if (spiritualAssessment.spiritual_gifts?.length > 0) {
        systemPrompt += `\n- Gifts: ${spiritualAssessment.spiritual_gifts.join(', ')}`;
      }
      if (spiritualAssessment.calling_insights) {
        systemPrompt += `\n- Calling Insights: ${JSON.stringify(spiritualAssessment.calling_insights)}`;
      }
    }

    systemPrompt += `\n\nTEACHING GUIDELINES:
1. Adapt your teaching style to the student's level and pace
2. Build on their strengths, gently address growth areas
3. Connect subject matter to their spiritual gifts and calling
4. Use real-world Kingdom examples
5. Encourage questions and deeper exploration
6. Celebrate progress and breakthroughs
7. Always point to Christ as the source of all wisdom

RESPONSE FORMAT:
- Clear, engaging explanations
- Use relevant examples and analogies
- Include practical applications
- Suggest next steps for deeper learning
- Integrate Scripture references naturally when relevant
- Keep responses concise but thorough (aim for 200-300 words unless more detail needed)`;

    // Call Lovable AI (using free Gemini models)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...validatedHistory,
      { role: 'user', content: validatedMessage }
    ];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', errorText);
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'CREDITS_REQUIRED',
            message: '⚠️ AI Credits Required: Please add credits to your Lovable workspace to continue using AI tutors. Go to Settings → Workspace → Usage to add credits.',
            userFriendlyMessage: 'AI credits needed - please add credits in workspace settings'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 402 
          }
        );
      }
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'RATE_LIMITED',
            message: '⚠️ Too Many Requests: Please wait a moment before sending another message.',
            userFriendlyMessage: 'Please wait a moment before trying again'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429 
          }
        );
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiMessage = aiData.choices[0].message.content;

    // Save conversation to database
    const conversationData = {
      id: conversationId,
      user_id: effectiveUserId,
      faculty: validatedFaculty,
      subject: validatedMessage.substring(0, 100),
      messages: [...validatedHistory, { role: 'user', content: validatedMessage }, { role: 'assistant', content: aiMessage }],
      updated_at: new Date().toISOString()
    };

    if (conversationId) {
      await supabase
        .from('ai_conversations')
        .update(conversationData)
        .eq('id', conversationId);
    } else {
      await supabase
        .from('ai_conversations')
        .insert(conversationData);
    }

    // Analyze response for learning insights (simple keyword analysis)
    const analysisKeywords = {
      confusion: ['confused', 'don\'t understand', 'unclear', 'what do you mean'],
      mastery: ['got it', 'understand', 'makes sense', 'i see'],
      engagement: ['interesting', 'fascinating', 'amazing', 'wow'],
      questions: ['?', 'how', 'why', 'what', 'when']
    };

    let engagementDelta = 0;
    const lowerMessage = validatedMessage.toLowerCase();
    
    if (analysisKeywords.confusion.some(k => lowerMessage.includes(k))) {
      engagementDelta -= 0.05;
    }
    if (analysisKeywords.mastery.some(k => lowerMessage.includes(k))) {
      engagementDelta += 0.1;
    }
    if (analysisKeywords.engagement.some(k => lowerMessage.includes(k))) {
      engagementDelta += 0.05;
    }
    if (analysisKeywords.questions.some(k => lowerMessage.includes(k))) {
      engagementDelta += 0.03;
    }

    // Update learning patterns
    if (learningPattern && engagementDelta !== 0) {
      const newScore = Math.max(0, Math.min(1, (learningPattern.engagement_score || 0.5) + engagementDelta));
      await supabase
        .from('learning_patterns')
        .update({
          engagement_score: newScore,
          last_assessed: new Date().toISOString()
        })
        .eq('id', learningPattern.id);
    } else if (!learningPattern) {
      // Create initial learning pattern
      await supabase
        .from('learning_patterns')
        .insert({
          user_id: effectiveUserId,
          faculty: validatedFaculty,
          engagement_score: 0.5,
          comprehension_level: 'intermediate',
          learning_style: { visual: 0.5, auditory: 0.3, kinesthetic: 0.2 },
          preferred_pace: 'moderate'
        });
    }

    // Log analytics
    await supabase
      .from('scroll_analytics')
      .insert({
        user_id: effectiveUserId,
        event_type: 'ai_tutor_interaction',
        event_payload: {
          faculty: validatedFaculty,
          message_length: validatedMessage.length,
          response_length: aiMessage.length,
          engagement_delta: engagementDelta
        }
      });

    console.log('✝️ Christ-Lordship: Response generated successfully');

    return new Response(
      JSON.stringify({ 
        message: aiMessage,
        personality: personality.role,
        conversationId: conversationData.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    // Handle validation errors separately
    if (error instanceof ValidationError) {
      return createValidationErrorResponse(error, corsHeaders);
    }
    
    console.error('Error in ScrollIntel-G6:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'I apologize, but I encountered an error. Christ remains Lord over this situation. Please try again.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
