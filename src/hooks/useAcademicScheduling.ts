import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScheduledAssignment {
  id: string;
  course_id: string;
  module_id: string | null;
  title: string;
  description: string | null;
  type: string;
  due_at: string;
  total_points: number;
  published: boolean;
  created_at: string;
}

export interface FacultySchedule {
  id: string;
  faculty_user_id: string;
  course_id: string;
  semester_id: string;
  role: 'instructor' | 'teaching_assistant' | 'guest_lecturer';
  office_hours: Array<{ day: string; start: string; end: string }>;
  teaching_load_hours: number;
  created_at: string;
}

export interface TuitionBillingCycle {
  id: string;
  semester_id: string;
  user_id: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'waived';
  payment_plan: boolean;
  scrollgold_applied: number;
  stripe_invoice_id: string | null;
  hold_placed: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch upcoming assignments for a student
export const useUpcomingAssignments = (limit: number = 10) => {
  return useQuery({
    queryKey: ['upcoming-assignments', limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get enrolled courses
      const { data: enrollments } = await (supabase as any)
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id);

      if (!enrollments?.length) return [];

      const courseIds = enrollments.map((e: any) => e.course_id);

      const { data, error } = await (supabase as any)
        .from('assignments')
        .select('*, courses(title)')
        .in('course_id', courseIds)
        .eq('published', true)
        .gte('due_at', new Date().toISOString())
        .order('due_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data as ScheduledAssignment[];
    },
  });
};

// Fetch faculty schedule
export const useFacultySchedule = (semesterId?: string) => {
  return useQuery({
    queryKey: ['faculty-schedule', semesterId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = (supabase as any)
        .from('faculty_schedule')
        .select('*, courses(title), semesters(name)')
        .eq('faculty_user_id', user.id);

      if (semesterId) {
        query = query.eq('semester_id', semesterId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FacultySchedule[];
    },
  });
};

// Fetch student billing
export const useStudentBilling = () => {
  return useQuery({
    queryKey: ['student-billing'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('tuition_billing_cycles')
        .select('*, semesters(name)')
        .eq('user_id', user.id)
        .order('due_date', { ascending: false });

      if (error) throw error;
      return data as TuitionBillingCycle[];
    },
  });
};

// Auto-schedule class sessions for a course
export const useAutoScheduleClassSessions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      courseId,
      semesterId,
      dayOfWeek,
      startTime,
      endTime,
    }: {
      courseId: string;
      semesterId: string;
      dayOfWeek: string;
      startTime: string;
      endTime: string;
    }) => {
      // Get semester dates
      const { data: semester, error: semError } = await (supabase as any)
        .from('semesters')
        .select('*')
        .eq('id', semesterId)
        .single();

      if (semError) throw semError;

      // Get course modules
      const { data: modules, error: modError } = await (supabase as any)
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (modError) throw modError;

      const startDate = new Date(semester.start_date);
      const endDate = new Date(semester.end_date);
      const sessions: any[] = [];

      // Map day names to numbers (0 = Sunday, 6 = Saturday)
      const dayMap: Record<string, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };

      const targetDay = dayMap[dayOfWeek.toLowerCase()];
      let currentDate = new Date(startDate);
      let moduleIndex = 0;

      // Find first occurrence of the target day
      while (currentDate.getDay() !== targetDay) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Generate sessions for each week
      while (currentDate <= endDate && moduleIndex < (modules?.length || 16)) {
        const module = modules?.[moduleIndex];
        
        sessions.push({
          course_id: courseId,
          semester_id: semesterId,
          module_id: module?.id || null,
          title: module?.title || `Week ${moduleIndex + 1} Lecture`,
          scheduled_date: currentDate.toISOString().split('T')[0],
          start_time: startTime,
          end_time: endTime,
          day_of_week: dayOfWeek,
          is_virtual: true,
          status: 'scheduled',
        });

        currentDate.setDate(currentDate.getDate() + 7);
        moduleIndex++;
      }

      const { data, error } = await (supabase as any)
        .from('class_sessions')
        .insert(sessions)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-sessions'] });
      toast({ title: 'Success', description: 'Class sessions scheduled successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// Auto-generate assignment deadlines
export const useAutoGenerateAssignments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      courseId,
      semesterId,
      assignmentPattern,
    }: {
      courseId: string;
      semesterId: string;
      assignmentPattern: 'weekly' | 'biweekly' | 'monthly';
    }) => {
      // Get semester dates
      const { data: semester } = await (supabase as any)
        .from('semesters')
        .select('*')
        .eq('id', semesterId)
        .single();

      // Get course modules
      const { data: modules } = await (supabase as any)
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      const startDate = new Date(semester.start_date);
      const endDate = new Date(semester.end_date);
      const assignments: any[] = [];

      let currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + 7); // First assignment due after first week

      const intervalDays = assignmentPattern === 'weekly' ? 7 : assignmentPattern === 'biweekly' ? 14 : 30;
      let assignmentNum = 1;

      while (currentDate <= endDate) {
        const module = modules?.[Math.min(assignmentNum - 1, modules?.length - 1)];

        assignments.push({
          course_id: courseId,
          module_id: module?.id || null,
          title: `Assignment ${assignmentNum}${module ? `: ${module.title}` : ''}`,
          description: `Complete the assigned tasks for ${module?.title || `week ${assignmentNum}`}`,
          type: 'assignment',
          due_at: currentDate.toISOString(),
          total_points: 100,
          published: true,
        });

        currentDate.setDate(currentDate.getDate() + intervalDays);
        assignmentNum++;
      }

      const { data, error } = await (supabase as any)
        .from('assignments')
        .insert(assignments)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-assignments'] });
      toast({ title: 'Success', description: 'Assignments generated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// Auto-schedule exams
export const useAutoScheduleExams = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      courseId,
      semesterId,
      includeMidterm = true,
      includeFinal = true,
    }: {
      courseId: string;
      semesterId: string;
      includeMidterm?: boolean;
      includeFinal?: boolean;
    }) => {
      const { data: semester } = await (supabase as any)
        .from('semesters')
        .select('*')
        .eq('id', semesterId)
        .single();

      const startDate = new Date(semester.start_date);
      const endDate = new Date(semester.end_date);
      const midPoint = new Date((startDate.getTime() + endDate.getTime()) / 2);

      const exams: any[] = [];

      if (includeMidterm) {
        exams.push({
          course_id: courseId,
          semester_id: semesterId,
          title: 'Midterm Examination',
          exam_type: 'midterm',
          scheduled_date: midPoint.toISOString(),
          duration_minutes: 120,
          total_points: 100,
          passing_score: 60,
          is_published: false,
          window_start: new Date(midPoint.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          window_end: new Date(midPoint.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      if (includeFinal) {
        const finalsStart = semester.finals_start ? new Date(semester.finals_start) : new Date(endDate);
        finalsStart.setDate(finalsStart.getDate() - 7);

        exams.push({
          course_id: courseId,
          semester_id: semesterId,
          title: 'Final Examination',
          exam_type: 'final',
          scheduled_date: finalsStart.toISOString(),
          duration_minutes: 180,
          total_points: 150,
          passing_score: 90,
          is_published: false,
          window_start: finalsStart.toISOString(),
          window_end: endDate.toISOString(),
        });
      }

      const { data, error } = await (supabase as any)
        .from('exams')
        .insert(exams)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: 'Success', description: 'Exams scheduled successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
