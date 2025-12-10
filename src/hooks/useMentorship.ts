import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface MentorshipRelationship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  faculty_id: string | null;
  status: string;
  goals: any[];
  start_date: string;
  expected_end_date: string | null;
  total_sessions: number;
  total_hours: number;
  success_metrics: any;
  mentor?: {
    email: string;
    full_name?: string;
  };
  mentee?: {
    email: string;
    full_name?: string;
  };
}

export interface MentorshipSession {
  id: string;
  relationship_id: string;
  session_type: string;
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number | null;
  topics_discussed: any[];
  guidance_provided: string | null;
  mentee_response: string | null;
  action_items: any[];
  follow_up_required: boolean;
  spiritual_insights: string | null;
  prophetic_words: string | null;
  breakthrough_notes: string | null;
  mentor_rating: number | null;
  mentee_rating: number | null;
}

export const useMentorship = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: relationships, isLoading: relationshipsLoading } = useQuery({
    queryKey: ['mentorship-relationships', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('mentorship_relationships')
        .select(`
          *,
          mentor:profiles!mentorship_relationships_mentor_id_fkey(email, full_name),
          mentee:profiles!mentorship_relationships_mentee_id_fkey(email, full_name)
        `)
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['mentorship-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id || !relationships?.length) return [];
      const relationshipIds = relationships.map(r => r.id);
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .select('*')
        .in('relationship_id', relationshipIds)
        .order('scheduled_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!relationships?.length,
  });

  const createSession = useMutation({
    mutationFn: async (session: Partial<MentorshipSession>) => {
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .insert(session)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-sessions'] });
    },
  });

  const updateSession = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MentorshipSession> & { id: string }) => {
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-sessions'] });
    },
  });

  const requestMentor = useMutation({
    mutationFn: async ({ mentorId, facultyId, goals }: { mentorId: string; facultyId?: string; goals?: any[] }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('mentorship_relationships')
        .insert({
          mentor_id: mentorId,
          mentee_id: user.id,
          faculty_id: facultyId,
          goals: goals || [],
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-relationships'] });
    },
  });

  const acceptMentorship = useMutation({
    mutationFn: async (relationshipId: string) => {
      const { data, error } = await supabase
        .from('mentorship_relationships')
        .update({ status: 'active' })
        .eq('id', relationshipId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-relationships'] });
    },
  });

  // Stats
  const activeRelationships = relationships?.filter(r => r.status === 'active') || [];
  const totalSessionsCount = sessions?.length || 0;
  const totalMentorshipHours = relationships?.reduce((sum, r) => sum + Number(r.total_hours || 0), 0) || 0;
  const isMentor = relationships?.some(r => r.mentor_id === user?.id) || false;
  const isMentee = relationships?.some(r => r.mentee_id === user?.id) || false;

  return {
    relationships,
    sessions,
    relationshipsLoading,
    sessionsLoading,
    createSession,
    updateSession,
    requestMentor,
    acceptMentorship,
    stats: {
      activeRelationships: activeRelationships.length,
      totalSessions: totalSessionsCount,
      totalHours: totalMentorshipHours,
      isMentor,
      isMentee,
    },
  };
};
