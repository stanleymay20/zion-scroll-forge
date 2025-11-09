import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { underChrist } from '@/lib/lordship';
import { toast } from 'sonner';

export interface ModuleProgress {
  module_id: string;
  completed: boolean;
  completed_at?: string;
  quiz_score?: number;
}

export interface CourseProgressData {
  course_id: string;
  progress: number;
  completed_modules: string[];
  module_progress: Record<string, ModuleProgress>;
}

/**
 * Get course progress for current user
 */
export const useCourseProgress = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['course-progress', courseId, user?.id],
    queryFn: async () => {
      const { data: enrollment, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (!enrollment) return null;

      // Get modules to calculate progress
      const { data: modules } = await supabase
        .from('course_modules')
        .select('id')
        .eq('course_id', courseId)
        .order('order_index');

      const totalModules = modules?.length || 1;
      const completedModules = 0; // TODO: Track completed modules

      return {
        ...enrollment,
        total_modules: totalModules,
        completed_modules_count: completedModules
      };
    },
    enabled: !!user?.id && !!courseId
  });
};

/**
 * Complete a module and update progress
 */
export const useCompleteModule = (courseId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: underChrist(async ({ moduleId, quizScore }: { moduleId: string; quizScore?: number }) => {
      // Get current enrollment
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user?.id)
        .single();

      if (!enrollment) throw new Error('Not enrolled in course');

      // Get total modules
      const { data: modules } = await supabase
        .from('course_modules')
        .select('id')
        .eq('course_id', courseId)
        .order('order_index');

      const totalModules = modules?.length || 1;
      
      // Calculate new progress (simple: each module = equal weight)
      const currentProgress = enrollment.progress || 0;
      const progressIncrement = (100 / totalModules);
      const newProgress = Math.min(100, currentProgress + progressIncrement);

      // Update enrollment
      const { error } = await supabase
        .from('enrollments')
        .update({
          progress: newProgress,
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollment.id);

      if (error) throw error;

      // Award ScrollCoins for completion
      if (quizScore && quizScore >= 70) {
        await supabase.rpc('earn_scrollcoin', {
          p_user_id: user?.id,
          p_amount: 10,
          p_desc: `Completed module with ${quizScore}% score`
        });
      }

      return { newProgress, moduleId };
    }),
    onSuccess: ({ newProgress }) => {
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      
      toast.success('Module completed!', {
        description: `Course progress: ${Math.round(newProgress)}%`
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to complete module', {
        description: error.message
      });
    }
  });
};

/**
 * Reset course progress (for testing/retaking)
 */
export const useResetProgress = (courseId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: underChrist(async () => {
      const { error } = await supabase
        .from('enrollments')
        .update({
          progress: 0,
          updated_at: new Date().toISOString()
        })
        .eq('course_id', courseId)
        .eq('user_id', user?.id);

      if (error) throw error;
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Progress reset successfully');
    }
  });
};
