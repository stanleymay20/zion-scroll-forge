import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const [systemData, spiritualData, scrollcoinData] = await Promise.all([
        (supabase as any)
          .from('system_analytics_daily')
          .select('*')
          .order('date', { ascending: false })
          .limit(7),
        (supabase as any)
          .from('spiritual_analytics_daily')
          .select('*')
          .order('date', { ascending: false })
          .limit(7),
        (supabase as any)
          .from('scrollcoin_analytics_daily')
          .select('*')
          .order('date', { ascending: false })
          .limit(7),
      ]);

      if (systemData.error) throw systemData.error;
      if (spiritualData.error) throw spiritualData.error;
      if (scrollcoinData.error) throw scrollcoinData.error;

      return {
        system: systemData.data || [],
        spiritual: spiritualData.data || [],
        scrollcoin: scrollcoinData.data || [],
      };
    },
  });
};

export const useCourseAnalytics = (courseId: string) => {
  return useQuery({
    queryKey: ['course-analytics', courseId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('learning_analytics_daily')
        .select('*')
        .eq('course_id', courseId)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
    },
    enabled: !!courseId,
  });
};

export const useScrollCoinAnalytics = () => {
  return useQuery({
    queryKey: ['scrollcoin-analytics'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('scrollcoin_analytics_daily')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useSpiritualAnalytics = () => {
  return useQuery({
    queryKey: ['spiritual-analytics'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('spiritual_analytics_daily')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
    },
  });
};