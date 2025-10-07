import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  chatWithAI,
  getAIConversations,
  getLearningPattern,
  getSpiritualAssessments,
  createSpiritualAssessment,
  getInterventionAlerts,
  resolveInterventionAlert,
  getStudentAnalytics,
  getFacultyAnalytics
} from '@/services/scrollintel';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAIChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      message,
      faculty,
      history,
      conversationId
    }: {
      message: string;
      faculty: string;
      history: any[];
      conversationId?: string;
    }) => await chatWithAI(user!.id, message, faculty, history, conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['learning-pattern'] });
      queryClient.invalidateQueries({ queryKey: ['scroll_analytics'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to communicate with AI tutor',
        variant: 'destructive',
      });
    },
  });
};

export const useAIConversations = (faculty?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-conversations', user?.id, faculty],
    queryFn: async () => await getAIConversations(user!.id, faculty),
    enabled: !!user,
  });
};

export const useLearningPattern = (faculty: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['learning-pattern', user?.id, faculty],
    queryFn: async () => await getLearningPattern(user!.id, faculty),
    enabled: !!user && !!faculty,
  });
};

export const useSpiritualAssessments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['spiritual-assessments', user?.id],
    queryFn: async () => await getSpiritualAssessments(user!.id),
    enabled: !!user,
  });
};

export const useCreateSpiritualAssessment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assessmentType,
      insights
    }: {
      assessmentType: string;
      insights: any;
    }) => await createSpiritualAssessment(user!.id, assessmentType, insights),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spiritual-assessments'] });
      toast({
        title: '✝️ Assessment Recorded',
        description: 'Your spiritual assessment has been saved.',
      });
    },
  });
};

export const useInterventionAlerts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['intervention-alerts', user?.id],
    queryFn: async () => await getInterventionAlerts(user!.id),
    enabled: !!user,
  });
};

export const useResolveAlert = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => await resolveInterventionAlert(alertId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intervention-alerts'] });
      toast({
        title: 'Alert Resolved',
        description: 'The intervention alert has been marked as resolved.',
      });
    },
  });
};

export const useStudentAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-analytics', user?.id],
    queryFn: async () => await getStudentAnalytics(user!.id),
    enabled: !!user,
  });
};

export const useFacultyAnalytics = () => {
  return useQuery({
    queryKey: ['faculty-analytics'],
    queryFn: async () => await getFacultyAnalytics(),
  });
};
