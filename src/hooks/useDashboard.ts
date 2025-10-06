import { useQuery } from '@tanstack/react-query';
import { getDashboard, DashboardData } from '@/services/dashboard';
import { useAuth } from '@/contexts/AuthContext';

export const useDashboard = () => {
  const { user } = useAuth();

  return useQuery<DashboardData>({
    queryKey: ['dashboard', user?.id],
    queryFn: async () => await getDashboard(user!.id),
    enabled: !!user,
  });
};
