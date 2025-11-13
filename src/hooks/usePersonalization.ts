import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  getLearningProfile,
  createLearningProfile,
  updateLearningProfile,
  getModuleProgress,
  updateModuleProgress,
  getUserModuleProgress,
  getCourseRecommendations,
  generateRecommendations,
  getStudyPlan,
  createStudyPlan,
  updateStudyPlan,
  generateStudyPlan,
  getLearningGoals,
  createLearningGoal,
  updateLearningGoal,
  getSkillsAssessment,
  type LearningProfile,
  type ModuleProgress,
  type StudyPlan,
  type LearningGoal
} from '@/services/personalization';

export const useLearningProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['learning-profile', user?.id],
    queryFn: async () => await getLearningProfile(user!.id),
    enabled: !!user,
  });
};

export const useCreateLearningProfile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<LearningProfile>) => await createLearningProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-profile'] });
      toast({
        title: '✝️ Profile Created',
        description: 'Your learning profile has been set up successfully.',
      });
    },
  });
};

export const useUpdateLearningProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<LearningProfile>) => 
      await updateLearningProfile(user!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-profile'] });
      toast({
        title: 'Profile Updated',
        description: 'Your learning preferences have been saved.',
      });
    },
  });
};

export const useModuleProgress = (moduleId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['module-progress', user?.id, moduleId],
    queryFn: async () => await getModuleProgress(user!.id, moduleId),
    enabled: !!user && !!moduleId,
  });
};

export const useUpdateModuleProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moduleId, progress }: { moduleId: string; progress: Partial<ModuleProgress> }) =>
      await updateModuleProgress(user!.id, moduleId, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-progress'] });
      queryClient.invalidateQueries({ queryKey: ['user-module-progress'] });
      queryClient.invalidateQueries({ queryKey: ['skills-assessment'] });
    },
  });
};

export const useUserModuleProgress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-module-progress', user?.id],
    queryFn: async () => await getUserModuleProgress(user!.id),
    enabled: !!user,
  });
};

export const useCourseRecommendations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['course-recommendations', user?.id],
    queryFn: async () => await getCourseRecommendations(user!.id),
    enabled: !!user,
  });
};

export const useGenerateRecommendations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => await generateRecommendations(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-recommendations'] });
      toast({
        title: '✨ Recommendations Generated',
        description: 'New course recommendations are ready for you.',
      });
    },
  });
};

export const useStudyPlan = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['study-plan', user?.id, courseId],
    queryFn: async () => await getStudyPlan(user!.id, courseId),
    enabled: !!user && !!courseId,
  });
};

export const useCreateStudyPlan = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: Partial<StudyPlan>) => await createStudyPlan(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plan'] });
      toast({
        title: '📚 Study Plan Created',
        description: 'Your personalized study plan is ready.',
      });
    },
  });
};

export const useUpdateStudyPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, updates }: { courseId: string; updates: Partial<StudyPlan> }) =>
      await updateStudyPlan(user!.id, courseId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plan'] });
      toast({
        title: 'Study Plan Updated',
        description: 'Your schedule has been adjusted.',
      });
    },
  });
};

export const useGenerateStudyPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, weeklyHours }: { courseId: string; weeklyHours: number }) =>
      await generateStudyPlan(user!.id, courseId, weeklyHours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plan'] });
      toast({
        title: '📅 Plan Generated',
        description: 'AI has created an optimal study schedule for you.',
      });
    },
  });
};

export const useLearningGoals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['learning-goals', user?.id],
    queryFn: async () => await getLearningGoals(user!.id),
    enabled: !!user,
  });
};

export const useCreateLearningGoal = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: Partial<LearningGoal>) => await createLearningGoal(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-goals'] });
      toast({
        title: '🎯 Goal Set',
        description: 'Your learning goal has been created.',
      });
    },
  });
};

export const useUpdateLearningGoal = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ goalId, updates }: { goalId: string; updates: Partial<LearningGoal> }) =>
      await updateLearningGoal(goalId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-goals'] });
      toast({
        title: 'Goal Updated',
        description: 'Your progress has been recorded.',
      });
    },
  });
};

export const useSkillsAssessment = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['skills-assessment', user?.id],
    queryFn: async () => await getSkillsAssessment(user!.id),
    enabled: !!user,
  });
};
