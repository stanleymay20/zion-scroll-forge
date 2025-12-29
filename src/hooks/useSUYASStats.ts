/**
 * SUYAS Stats Hook
 * Fetches real-time statistics from the database for SUYAS Admin dashboard
 * No hardcoded values - all data comes from Supabase queries
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SUYASStats {
  activeYear: string | null;
  activeYearId: string | null;
  activeStudents: number;
  pendingDeadlines: number;
  qualityScore: number;
  totalCourses: number;
  totalFaculty: number;
  activeHolds: number;
  totalEnrollments: number;
}

export const useSUYASStats = () => {
  return useQuery({
    queryKey: ['suyas-stats'],
    queryFn: async (): Promise<SUYASStats> => {
      // Fetch active academic year
      const { data: activeYear } = await supabase
        .from('academic_years')
        .select('id, name')
        .eq('is_active', true)
        .single();

      // Fetch active students count (lifecycle_status = 'active' or 'enrolled')
      const { count: activeStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('lifecycle_status', ['active', 'enrolled']);

      // Fetch upcoming deadlines count
      const { count: pendingDeadlines } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .gte('due_at', new Date().toISOString())
        .eq('published', true);

      // Fetch latest quality scan score
      const { data: latestScan } = await supabase
        .from('suyas_quality_scans')
        .select('quality_score')
        .order('scanned_at', { ascending: false })
        .limit(1)
        .single();

      // Fetch total courses
      const { count: totalCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // Fetch total faculty (users with faculty role)
      const { count: totalFaculty } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'faculty');

      // Fetch active holds
      const { count: activeHolds } = await supabase
        .from('student_holds')
        .select('*', { count: 'exact', head: true })
        .is('resolved_at', null);

      // Fetch total enrollments
      const { count: totalEnrollments } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true });

      return {
        activeYear: activeYear?.name || null,
        activeYearId: activeYear?.id || null,
        activeStudents: activeStudents || 0,
        pendingDeadlines: pendingDeadlines || 0,
        qualityScore: latestScan?.quality_score ?? 100,
        totalCourses: totalCourses || 0,
        totalFaculty: totalFaculty || 0,
        activeHolds: activeHolds || 0,
        totalEnrollments: totalEnrollments || 0,
      };
    },
    staleTime: 30000, // Cache for 30 seconds
  });
};

// Hook for student lifecycle stats
export const useStudentLifecycleStats = () => {
  return useQuery({
    queryKey: ['student-lifecycle-stats'],
    queryFn: async () => {
      const statuses = ['applicant', 'admitted', 'enrolled', 'active', 'on_leave', 'withdrawn', 'graduated'];
      const counts: Record<string, number> = {};

      for (const status of statuses) {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('lifecycle_status', status);
        
        counts[status] = count || 0;
      }

      return counts;
    },
  });
};

// Hook for holds by type
export const useHoldsStats = () => {
  return useQuery({
    queryKey: ['holds-stats'],
    queryFn: async () => {
      const { data: holds } = await supabase
        .from('student_holds')
        .select('hold_type, resolved_at')
        .is('resolved_at', null);

      const byType: Record<string, number> = {
        financial: 0,
        academic: 0,
        disciplinary: 0,
        administrative: 0,
        prerequisite: 0,
        document: 0,
      };

      holds?.forEach(hold => {
        const type = hold.hold_type || 'administrative';
        byType[type] = (byType[type] || 0) + 1;
      });

      return {
        total: holds?.length || 0,
        byType,
      };
    },
  });
};
