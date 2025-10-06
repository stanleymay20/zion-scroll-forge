import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listCourses, enrollInCourse, getUserEnrollments, Course } from '@/services/courses';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useCourses = (params?: {
  search?: string;
  faculty?: string;
  level?: string;
}) => {
  return useQuery<Course[]>({
    queryKey: ['courses', params],
    queryFn: async () => await listCourses(params),
  });
};

export const useEnrollInCourse = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => await enrollInCourse(user!.id, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Enrollment successful',
        description: 'You have been enrolled in the course!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Enrollment failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUserEnrollments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: async () => await getUserEnrollments(user!.id),
    enabled: !!user,
  });
};
