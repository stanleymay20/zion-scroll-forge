import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
