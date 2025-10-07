import { supabase } from '@/integrations/supabase/client';
import { underChrist } from '@/lib/lordship';

export interface AIConversation {
  id: string;
  user_id: string;
  faculty: string;
  subject: string | null;
  messages: any[];
  context_summary: string | null;
  learning_insights: any;
  created_at: string;
  updated_at: string;
}

export interface LearningPattern {
  id: string;
  user_id: string;
  faculty: string;
  engagement_score: number;
  comprehension_level: string;
  learning_style: any;
  preferred_pace: string;
  strengths: any[];
  areas_for_growth: any[];
  last_assessed: string;
}

export interface SpiritualAssessment {
  id: string;
  user_id: string;
  assessment_type: string;
  calling_insights: any;
  spiritual_gifts: any[];
  growth_areas: any[];
  scripture_references: any[];
  confidence_score: number;
  created_at: string;
}

export interface InterventionAlert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: string;
  message: string;
  recommendations: any[];
  status: string;
  resolved_at: string | null;
  created_at: string;
}

export const chatWithAI = underChrist(
  async (
    userId: string,
    message: string,
    faculty: string,
    history: any[],
    conversationId?: string
  ) => {
    const { data, error } = await supabase.functions.invoke('scrollintel-g6-chat', {
      body: {
        message,
        faculty,
        history,
        userId,
        conversationId
      }
    });

    if (error) throw error;
    return data;
  }
);

export const getAIConversations = underChrist(async (userId: string, faculty?: string) => {
  let query = supabase
    .from('ai_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (faculty) {
    query = query.eq('faculty', faculty);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as AIConversation[];
});

export const getLearningPattern = underChrist(
  async (userId: string, faculty: string) => {
    const { data, error } = await supabase
      .from('learning_patterns')
      .select('*')
      .eq('user_id', userId)
      .eq('faculty', faculty)
      .maybeSingle();

    if (error) throw error;
    return data as LearningPattern | null;
  }
);

export const getSpiritualAssessments = underChrist(async (userId: string) => {
  const { data, error } = await supabase
    .from('spiritual_assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as SpiritualAssessment[];
});

export const createSpiritualAssessment = underChrist(
  async (
    userId: string,
    assessmentType: string,
    insights: {
      calling_insights?: any;
      spiritual_gifts?: any[];
      growth_areas?: any[];
      scripture_references?: any[];
      confidence_score?: number;
    }
  ) => {
    const { data, error } = await supabase
      .from('spiritual_assessments')
      .insert({
        user_id: userId,
        assessment_type: assessmentType,
        ...insights
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const getInterventionAlerts = underChrist(async (userId: string) => {
  const { data, error } = await supabase
    .from('intervention_alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as InterventionAlert[];
});

export const resolveInterventionAlert = underChrist(
  async (alertId: string, userId: string) => {
    const { error } = await supabase
      .from('intervention_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }
);

export const getStudentAnalytics = underChrist(async (userId: string) => {
  const { data, error } = await supabase
    .from('v_student_analytics')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
});

export const getFacultyAnalytics = underChrist(async () => {
  const { data, error } = await supabase
    .from('v_faculty_analytics')
    .select('*');

  if (error) throw error;
  return data;
});
