import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface DegreeProgress {
  id: string;
  user_id: string;
  degree_level: string;
  faculty_id: string | null;
  competency_matrix_id: string | null;
  completion_percentage: number;
  skills_completed: number;
  skills_required: number;
  current_xp: number;
  target_xp: number;
  milestones_achieved: any[];
  scroll_alignment_score: number;
  prophetic_score: number;
  started_at: string;
  expected_completion_at: string | null;
  completed_at: string | null;
}

export interface StudentSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency_level: string;
  xp_earned: number;
  assessments_passed: number;
  last_assessed_at: string | null;
  evidence_portfolio: any[];
  validation_sources: any[];
  skill?: {
    name: string;
    description: string;
    category: string;
    difficulty_level: number;
    xp_value: number;
  };
}

export const useDegreeProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: degreeProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['degree-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('degree_progress')
        .select(`
          *,
          faculty:faculties(name, emblem_url)
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: studentSkills, isLoading: skillsLoading } = useQuery({
    queryKey: ['student-skills', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('student_skills')
        .select(`
          *,
          skill:skills_catalog(name, description, category, difficulty_level, xp_value)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: skillsCatalog } = useQuery({
    queryKey: ['skills-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills_catalog')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const addSkill = useMutation({
    mutationFn: async (skillId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('student_skills')
        .insert({
          user_id: user.id,
          skill_id: skillId,
          proficiency_level: 'novice',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-skills'] });
    },
  });

  const updateSkillProficiency = useMutation({
    mutationFn: async ({ skillId, proficiency, xpEarned }: { skillId: string; proficiency: string; xpEarned?: number }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('student_skills')
        .update({
          proficiency_level: proficiency,
          xp_earned: xpEarned,
          last_assessed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('skill_id', skillId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-skills'] });
    },
  });

  const startDegreeProgram = useMutation({
    mutationFn: async ({ degreeLevel, facultyId }: { degreeLevel: string; facultyId?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('degree_progress')
        .insert({
          user_id: user.id,
          degree_level: degreeLevel,
          faculty_id: facultyId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['degree-progress'] });
    },
  });

  // Calculate overall stats
  const totalXP = studentSkills?.reduce((sum, s) => sum + (s.xp_earned || 0), 0) || 0;
  const skillsCount = studentSkills?.length || 0;
  const masterSkillsCount = studentSkills?.filter(s => s.proficiency_level === 'master' || s.proficiency_level === 'prophet').length || 0;
  const avgScrollAlignment = degreeProgress?.length 
    ? degreeProgress.reduce((sum, d) => sum + Number(d.scroll_alignment_score || 0), 0) / degreeProgress.length 
    : 0;

  return {
    degreeProgress,
    studentSkills,
    skillsCatalog,
    progressLoading,
    skillsLoading,
    addSkill,
    updateSkillProficiency,
    startDegreeProgram,
    stats: {
      totalXP,
      skillsCount,
      masterSkillsCount,
      avgScrollAlignment,
    },
  };
};
