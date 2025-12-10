import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface DivineAssessment {
  id: string;
  title: string;
  description: string | null;
  assessment_type: string;
  faculty_id: string | null;
  course_id: string | null;
  module_id: string | null;
  created_by: string | null;
  rubric: any;
  academic_weight: number;
  prophetic_weight: number;
  character_weight: number;
  max_score: number;
  passing_score: number;
  time_limit_minutes: number | null;
  skills_assessed: string[];
  xp_reward: number;
  scrollgold_reward: number;
  is_published: boolean;
  faculty?: {
    name: string;
  };
  course?: {
    title: string;
  };
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  user_id: string;
  academic_score: number | null;
  prophetic_score: number | null;
  character_score: number | null;
  total_score: number | null;
  scroll_alignment_score: number | null;
  passed: boolean;
  responses: any;
  evaluator_notes: any[];
  ai_evaluation: any;
  plagiarism_check: any;
  started_at: string;
  submitted_at: string | null;
  graded_at: string | null;
  xp_awarded: number;
  scrollgold_awarded: number;
  assessment?: DivineAssessment;
}

export const useDivineAssessments = (facultyId?: string, courseId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['divine-assessments', facultyId, courseId],
    queryFn: async () => {
      let query = supabase
        .from('divine_assessments')
        .select(`
          *,
          faculty:faculties(name),
          course:courses(title)
        `)
        .eq('is_published', true);
      
      if (facultyId) query = query.eq('faculty_id', facultyId);
      if (courseId) query = query.eq('course_id', courseId);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: myAttempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ['assessment-attempts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('divine_assessment_attempts')
        .select(`
          *,
          assessment:divine_assessments(title, max_score, passing_score, xp_reward, scrollgold_reward)
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const startAttempt = useMutation({
    mutationFn: async (assessmentId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('divine_assessment_attempts')
        .insert({
          assessment_id: assessmentId,
          user_id: user.id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-attempts'] });
    },
  });

  const submitAttempt = useMutation({
    mutationFn: async ({ attemptId, responses }: { attemptId: string; responses: any }) => {
      const { data, error } = await supabase
        .from('divine_assessment_attempts')
        .update({
          responses,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', attemptId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-attempts'] });
    },
  });

  const createAssessment = useMutation({
    mutationFn: async (assessment: Partial<DivineAssessment>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('divine_assessments')
        .insert({
          ...assessment,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divine-assessments'] });
    },
  });

  // Stats
  const attemptsPassed = myAttempts?.filter(a => a.passed).length || 0;
  const attemptsTotal = myAttempts?.length || 0;
  const avgScore = myAttempts?.length 
    ? myAttempts.reduce((sum, a) => sum + Number(a.total_score || 0), 0) / myAttempts.length 
    : 0;
  const totalXPFromAssessments = myAttempts?.reduce((sum, a) => sum + (a.xp_awarded || 0), 0) || 0;

  return {
    assessments,
    myAttempts,
    assessmentsLoading,
    attemptsLoading,
    startAttempt,
    submitAttempt,
    createAssessment,
    stats: {
      attemptsPassed,
      attemptsTotal,
      passRate: attemptsTotal > 0 ? (attemptsPassed / attemptsTotal) * 100 : 0,
      avgScore,
      totalXP: totalXPFromAssessments,
    },
  };
};
