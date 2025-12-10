import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AcademicYear {
  id: string;
  institution_id: string | null;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  year_type: 'semester' | 'trimester' | 'quarter';
  created_at: string;
  updated_at: string;
}

export interface Semester {
  id: string;
  academic_year_id: string;
  name: string;
  start_date: string;
  end_date: string;
  registration_start: string | null;
  registration_end: string | null;
  add_drop_deadline: string | null;
  withdrawal_deadline: string | null;
  finals_start: string | null;
  finals_end: string | null;
  is_active: boolean;
  semester_order: number;
  created_at: string;
  updated_at: string;
}

export interface AcademicBreak {
  id: string;
  academic_year_id: string;
  semester_id: string | null;
  name: string;
  start_date: string;
  end_date: string;
  break_type: 'holiday' | 'recess' | 'reading_period' | 'exam_prep';
  created_at: string;
}

export interface ClassSession {
  id: string;
  course_id: string;
  semester_id: string;
  module_id: string | null;
  title: string;
  description: string | null;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  day_of_week: string | null;
  room_location: string | null;
  is_virtual: boolean;
  meeting_url: string | null;
  recording_url: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  attendance_count: number;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  course_id: string;
  semester_id: string;
  title: string;
  description: string | null;
  exam_type: 'quiz' | 'midterm' | 'final' | 'comprehensive' | 'oral' | 'practical';
  scheduled_date: string;
  duration_minutes: number;
  total_points: number;
  passing_score: number;
  is_published: boolean;
  window_start: string | null;
  window_end: string | null;
  proctored: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentAcademicStanding {
  id: string;
  user_id: string;
  semester_id: string | null;
  gpa: number;
  cumulative_gpa: number;
  credits_earned: number;
  credits_attempted: number;
  standing: 'good' | 'probation' | 'warning' | 'suspension' | 'dismissed';
  dean_list: boolean;
  honors: string | null;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface GraduationCandidate {
  id: string;
  user_id: string;
  degree_program_id: string | null;
  academic_year_id: string | null;
  expected_graduation_date: string | null;
  application_date: string;
  requirements_met: Record<string, boolean>;
  gpa_requirement_met: boolean;
  credits_requirement_met: boolean;
  spiritual_formation_met: boolean;
  capstone_completed: boolean;
  financial_clearance: boolean;
  status: 'pending' | 'approved' | 'denied' | 'graduated' | 'deferred';
  ceremony_participation: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcademicEvent {
  id: string;
  academic_year_id: string | null;
  semester_id: string | null;
  title: string;
  description: string | null;
  event_type: 'orientation' | 'registration' | 'ceremony' | 'deadline' | 'general' | 'convocation';
  event_date: string;
  end_date: string | null;
  location: string | null;
  is_virtual: boolean;
  meeting_url: string | null;
  is_mandatory: boolean;
  target_audience: 'all' | 'students' | 'faculty' | 'staff' | 'graduates';
  created_at: string;
}

// Fetch all academic years
export const useAcademicYears = () => {
  return useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as AcademicYear[];
    },
  });
};

// Fetch active academic year
export const useActiveAcademicYear = () => {
  return useQuery({
    queryKey: ['active-academic-year'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('academic_years')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as AcademicYear | null;
    },
  });
};

// Fetch semesters for an academic year
export const useSemesters = (academicYearId?: string) => {
  return useQuery({
    queryKey: ['semesters', academicYearId],
    queryFn: async () => {
      let query = (supabase as any)
        .from('semesters')
        .select('*')
        .order('semester_order', { ascending: true });

      if (academicYearId) {
        query = query.eq('academic_year_id', academicYearId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Semester[];
    },
    enabled: !!academicYearId || true,
  });
};

// Fetch active semester
export const useActiveSemester = () => {
  return useQuery({
    queryKey: ['active-semester'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('semesters')
        .select('*, academic_years(*)')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as Semester & { academic_years: AcademicYear } | null;
    },
  });
};

// Fetch academic breaks
export const useAcademicBreaks = (academicYearId?: string) => {
  return useQuery({
    queryKey: ['academic-breaks', academicYearId],
    queryFn: async () => {
      let query = (supabase as any)
        .from('academic_breaks')
        .select('*')
        .order('start_date', { ascending: true });

      if (academicYearId) {
        query = query.eq('academic_year_id', academicYearId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AcademicBreak[];
    },
  });
};

// Fetch class sessions
export const useClassSessions = (courseId?: string, semesterId?: string) => {
  return useQuery({
    queryKey: ['class-sessions', courseId, semesterId],
    queryFn: async () => {
      let query = (supabase as any)
        .from('class_sessions')
        .select('*, courses(title)')
        .order('scheduled_date', { ascending: true });

      if (courseId) query = query.eq('course_id', courseId);
      if (semesterId) query = query.eq('semester_id', semesterId);

      const { data, error } = await query;
      if (error) throw error;
      return data as ClassSession[];
    },
  });
};

// Fetch exams
export const useExams = (courseId?: string, semesterId?: string) => {
  return useQuery({
    queryKey: ['exams', courseId, semesterId],
    queryFn: async () => {
      let query = (supabase as any)
        .from('exams')
        .select('*, courses(title)')
        .order('scheduled_date', { ascending: true });

      if (courseId) query = query.eq('course_id', courseId);
      if (semesterId) query = query.eq('semester_id', semesterId);

      const { data, error } = await query;
      if (error) throw error;
      return data as Exam[];
    },
  });
};

// Fetch student academic standing
export const useStudentAcademicStanding = () => {
  return useQuery({
    queryKey: ['student-academic-standing'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('student_academic_standing')
        .select('*, semesters(name)')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as StudentAcademicStanding | null;
    },
  });
};

// Fetch graduation candidates
export const useGraduationCandidates = () => {
  return useQuery({
    queryKey: ['graduation-candidates'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('graduation_candidates')
        .select('*, degree_programs(title), academic_years(name)')
        .order('application_date', { ascending: false });

      if (error) throw error;
      return data as GraduationCandidate[];
    },
  });
};

// Fetch user's graduation status
export const useMyGraduationStatus = () => {
  return useQuery({
    queryKey: ['my-graduation-status'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('graduation_candidates')
        .select('*, degree_programs(title), academic_years(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as GraduationCandidate | null;
    },
  });
};

// Fetch academic events
export const useAcademicEvents = (academicYearId?: string, semesterId?: string) => {
  return useQuery({
    queryKey: ['academic-events', academicYearId, semesterId],
    queryFn: async () => {
      let query = (supabase as any)
        .from('academic_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (academicYearId) query = query.eq('academic_year_id', academicYearId);
      if (semesterId) query = query.eq('semester_id', semesterId);

      const { data, error } = await query;
      if (error) throw error;
      return data as AcademicEvent[];
    },
  });
};

// Create academic year mutation
export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (year: Partial<AcademicYear>) => {
      const { data, error } = await (supabase as any)
        .from('academic_years')
        .insert(year)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      toast({ title: 'Success', description: 'Academic year created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// Create semester mutation
export const useCreateSemester = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (semester: Partial<Semester>) => {
      const { data, error } = await (supabase as any)
        .from('semesters')
        .insert(semester)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      toast({ title: 'Success', description: 'Semester created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// Apply for graduation mutation
export const useApplyForGraduation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (application: Partial<GraduationCandidate>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('graduation_candidates')
        .insert({
          ...application,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graduation-candidates'] });
      queryClient.invalidateQueries({ queryKey: ['my-graduation-status'] });
      toast({ title: 'Success', description: 'Graduation application submitted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// Auto-generate semesters for an academic year
export const useAutoGenerateSemesters = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ academicYearId, yearType }: { academicYearId: string; yearType: 'semester' | 'trimester' | 'quarter' }) => {
      // Get academic year details
      const { data: year, error: yearError } = await (supabase as any)
        .from('academic_years')
        .select('*')
        .eq('id', academicYearId)
        .single();

      if (yearError) throw yearError;

      const startDate = new Date(year.start_date);
      const endDate = new Date(year.end_date);
      const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let periods: { name: string; order: number }[] = [];
      let daysPerPeriod: number;

      if (yearType === 'semester') {
        periods = [
          { name: 'Fall Semester', order: 1 },
          { name: 'Spring Semester', order: 2 },
        ];
        daysPerPeriod = Math.floor(totalDays / 2);
      } else if (yearType === 'trimester') {
        periods = [
          { name: 'Fall Trimester', order: 1 },
          { name: 'Winter Trimester', order: 2 },
          { name: 'Spring Trimester', order: 3 },
        ];
        daysPerPeriod = Math.floor(totalDays / 3);
      } else {
        periods = [
          { name: 'Fall Quarter', order: 1 },
          { name: 'Winter Quarter', order: 2 },
          { name: 'Spring Quarter', order: 3 },
          { name: 'Summer Quarter', order: 4 },
        ];
        daysPerPeriod = Math.floor(totalDays / 4);
      }

      const semesters = periods.map((period, index) => {
        const semesterStart = new Date(startDate);
        semesterStart.setDate(semesterStart.getDate() + (index * daysPerPeriod));
        
        const semesterEnd = new Date(semesterStart);
        semesterEnd.setDate(semesterEnd.getDate() + daysPerPeriod - 1);

        // Registration starts 2 weeks before semester
        const regStart = new Date(semesterStart);
        regStart.setDate(regStart.getDate() - 14);

        // Finals last 2 weeks
        const finalsStart = new Date(semesterEnd);
        finalsStart.setDate(finalsStart.getDate() - 14);

        return {
          academic_year_id: academicYearId,
          name: period.name,
          start_date: semesterStart.toISOString().split('T')[0],
          end_date: semesterEnd.toISOString().split('T')[0],
          registration_start: regStart.toISOString().split('T')[0],
          registration_end: semesterStart.toISOString().split('T')[0],
          finals_start: finalsStart.toISOString().split('T')[0],
          finals_end: semesterEnd.toISOString().split('T')[0],
          semester_order: period.order,
          is_active: index === 0,
        };
      });

      const { data, error } = await (supabase as any)
        .from('semesters')
        .insert(semesters)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
      toast({ title: 'Success', description: 'Semesters generated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
