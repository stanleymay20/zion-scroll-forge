import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { underChrist } from '@/lib/lordship';

export const useUserEnrollments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: async () => {
      console.info('✝️ Jesus Christ is Lord over this operation');
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            faculty,
            description
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useEnrollInCourse = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      console.info('✝️ Jesus Christ is Lord over this operation');
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user!.id,
          course_id: courseId,
          progress: 0
        });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: '✝️ Enrolled Successfully',
        description: 'You have been enrolled in the course. Christ leads your learning journey.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Enrollment Failed',
        description: error.message || 'Failed to enroll in course. Christ remains Lord.',
        variant: 'destructive',
      });
    },
  });
};

// Fetch single course
export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*, course_modules(id,title,order_index)')
        .eq('id', courseId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!courseId
  });
};

// Fetch modules by course
export const useModules = (courseId: string) => {
  return useQuery({
    queryKey: ['modules', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_modules')
        .select('id, course_id, title, order_index, content_md')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!courseId
  });
};

// Fetch single module with materials and quiz
export const useModule = (moduleId: string) => {
  return useQuery({
    queryKey: ['module', moduleId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('course_modules')
        .select('*, learning_materials(*), quizzes(id,title,questions)')
        .eq('id', moduleId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!moduleId
  });
};

// Fetch quiz by id
export const useQuiz = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!quizId
  });
};

// Complete module mutation
export const useCompleteModule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: { courseId: string; moduleId: string }) => {
      const { error } = await (supabase as any)
        .from('module_progress')
        .upsert({
          user_id: user!.id,
          course_id: args.courseId,
          module_id: args.moduleId,
          completed: true,
          completed_at: new Date().toISOString()
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
};

// Submit quiz mutation
export const useSubmitQuiz = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: { courseId: string; moduleId: string; score: number }) => {
      const { error } = await (supabase as any)
        .from('quiz_submissions')
        .insert({
          user_id: user!.id,
          course_id: args.courseId,
          module_id: args.moduleId,
          score: args.score
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
};
