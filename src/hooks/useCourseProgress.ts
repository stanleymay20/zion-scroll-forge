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
      if (!user?.id) throw new Error('Not authenticated');

      // Record module completion in module_progress
      const { error: progressError } = await supabase
        .from('module_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          module_id: moduleId,
          completed: true,
          completed_at: new Date().toISOString()
        });

      if (progressError) {
        console.error('Progress error:', progressError);
        throw progressError;
      }

      // Also update learning_progress if quiz score provided
      if (quizScore !== undefined) {
        await supabase
          .from('learning_progress')
          .upsert({
            user_id: user.id,
            module_id: moduleId,
            completed: true,
            quiz_score: quizScore,
            updated_at: new Date().toISOString()
          });
      }

      // Award ScrollCoins (don't throw on error, just log)
      const { error: coinError } = await supabase.rpc('earn_scrollcoin', {
        p_user_id: user.id,
        p_amount: 50,
        p_desc: 'Module completion reward'
      });

      if (coinError) {
        console.error('ScrollCoin award error:', coinError);
      }

      // Update enrollment progress
      const { data: allModules } = await supabase
        .from('course_modules')
        .select('id')
        .eq('course_id', courseId);

      const { data: completedModules } = await supabase
        .from('module_progress')
        .select('module_id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('completed', true);

      const progress = allModules && completedModules 
        ? Math.round((completedModules.length / allModules.length) * 100)
        : 0;

      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .update({ 
          progress,
          updated_at: new Date().toISOString()
        })
        .eq('course_id', courseId)
        .eq('user_id', user.id);

      if (enrollmentError) {
        console.error('Enrollment update error:', enrollmentError);
      }

      return { progress, moduleId };
    }),
    onSuccess: (data: { progress: number; moduleId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      queryClient.invalidateQueries({ queryKey: ['user-enrollments'] });
      toast.success('Module completed! 🎉', {
        description: `You earned 50 ScrollCoins! Progress: ${data.progress}%`,
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
