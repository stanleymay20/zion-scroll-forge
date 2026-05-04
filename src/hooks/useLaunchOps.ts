import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CohortStatus {
  cohort_cap: number;
  cohort_label: string;
  admitted: number;
  submitted: number;
  total_applications: number;
  seats_remaining: number;
  is_open: boolean;
}

export const useCohortStatus = () =>
  useQuery({
    queryKey: ['cohort-status'],
    queryFn: async (): Promise<CohortStatus> => {
      const { data, error } = await supabase.rpc('beta_cohort_status');
      if (error) throw error;
      return data as unknown as CohortStatus;
    },
    refetchInterval: 30000,
  });

export interface LaunchOpsMetrics {
  applications_received: number;
  applications_submitted: number;
  students_admitted: number;
  students_enrolled: number;
  active_learners: number;
  courses_started: number;
  modules_completed: number;
  assignments_submitted: number;
  certificates_generated: number;
  graduations: number;
  recent_audit_failures: Array<{
    action_type: string;
    entity_type: string;
    entity_id: string;
    reason: string;
    created_at: string;
  }>;
  cohort: CohortStatus;
  generated_at: string;
}

export const useLaunchOpsMetrics = () =>
  useQuery({
    queryKey: ['launch-ops-metrics'],
    queryFn: async (): Promise<LaunchOpsMetrics> => {
      const { data, error } = await supabase.rpc('launch_ops_metrics');
      if (error) throw error;
      return data as unknown as LaunchOpsMetrics;
    },
    refetchInterval: 15000,
  });
