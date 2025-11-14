import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ ScrollUniversity Degrees — Christ forms scholars for His Kingdom");

// Types
export interface DegreeProgram {
  id: string;
  name: string;
  description?: string;
  degree_type: 'bachelor' | 'master' | 'doctorate' | 'certificate';
  faculty_id?: string;
  duration_months: number;
  total_credits: number;
  tuition_cents: number;
  is_active: boolean;
  requirements?: Record<string, any>;
  learning_outcomes?: string[];
  created_at: string;
  updated_at: string;
  courses?: any[];
  faculty?: any;
}

export interface DegreeEnrollment {
  id: string;
  user_id: string;
  degree_id: string;
  status: 'active' | 'completed' | 'withdrawn' | 'on_hold';
  enrolled_at: string;
  expected_completion?: string;
  actual_completion?: string;
  gpa?: number;
  degree?: DegreeProgram;
}

// Fetchers
export async function getDegreePrograms() {
  const { data, error } = await (supabase as any)
    .from("degree_programs")
    .select(`
      *,
      faculty:faculties(id, name, description),
      courses:degree_courses(
        id,
        is_required,
        credits,
        course:courses(id, title, description, level)
      )
    `)
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data as DegreeProgram[];
}

export async function getDegreeProgram(id: string) {
  const { data, error } = await (supabase as any)
    .from("degree_programs")
    .select(`
      *,
      faculty:faculties(id, name, description),
      courses:degree_courses(
        id,
        is_required,
        credits,
        sequence_order,
        course:courses(id, title, description, level, duration, price)
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as DegreeProgram;
}

export async function getUserDegreeEnrollments() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("degree_enrollments")
    .select(`
      *,
      degree:degree_programs(
        *,
        faculty:faculties(name)
      )
    `)
    .eq("user_id", user.id)
    .order("enrolled_at", { ascending: false });

  if (error) throw error;
  return data as DegreeEnrollment[];
}

export async function enrollInDegree(degreeId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get degree details to calculate expected completion
  const { data: degree } = await (supabase as any)
    .from("degree_programs")
    .select("duration_months")
    .eq("id", degreeId)
    .single();

  const expectedCompletion = new Date();
  expectedCompletion.setMonth(expectedCompletion.getMonth() + (degree?.duration_months || 12));

  const { data, error } = await (supabase as any)
    .from("degree_enrollments")
    .insert({
      user_id: user.id,
      degree_id: degreeId,
      status: "active",
      expected_completion: expectedCompletion.toISOString()
    })
    .select(`
      *,
      degree:degree_programs(
        *,
        faculty:faculties(name)
      )
    `)
    .single();

  if (error) throw error;
  return data as DegreeEnrollment;
}

export async function updateDegreeEnrollment(enrollmentId: string, updates: Partial<DegreeEnrollment>) {
  const { data, error } = await (supabase as any)
    .from("degree_enrollments")
    .update(updates)
    .eq("id", enrollmentId)
    .select()
    .single();

  if (error) throw error;
  return data as DegreeEnrollment;
}

export async function getDegreeProgress(degreeId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get all courses for this degree
  const { data: degreeCourses } = await (supabase as any)
    .from("degree_courses")
    .select("course_id, credits, is_required")
    .eq("degree_id", degreeId);

  // Get user's completed courses
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, progress")
    .eq("user_id", user.id)
    .in("course_id", degreeCourses?.map((dc: any) => dc.course_id) || []);

  const totalCredits = degreeCourses?.reduce((sum: number, dc: any) => sum + dc.credits, 0) || 0;
  const completedCredits = degreeCourses?.reduce((sum: number, dc: any) => {
    const enrollment = enrollments?.find(e => e.course_id === dc.course_id);
    return enrollment && enrollment.progress === 100 ? sum + dc.credits : sum;
  }, 0) || 0;

  const completedCourses = enrollments?.filter(e => e.progress === 100).length || 0;
  const totalCourses = degreeCourses?.length || 0;

  return {
    totalCredits,
    completedCredits,
    totalCourses,
    completedCourses,
    progressPercentage: totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0
  };
}

// Hooks
export const useDegreePrograms = () =>
  useQuery({ queryKey: ["degree-programs"], queryFn: getDegreePrograms });

export const useDegreeProgram = (id: string) =>
  useQuery({
    queryKey: ["degree-program", id],
    queryFn: () => getDegreeProgram(id),
    enabled: !!id
  });

export const useUserDegreeEnrollments = () =>
  useQuery({ queryKey: ["user-degree-enrollments"], queryFn: getUserDegreeEnrollments });

export const useEnrollInDegree = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enrollInDegree,
    onSuccess: () => {
      toast({ title: "✝️ Enrolled in degree program — May Christ guide your studies" });
      qc.invalidateQueries({ queryKey: ["user-degree-enrollments"] });
    },
    onError: (e: any) => toast({
      title: "Failed to enroll",
      description: e.message,
      variant: "destructive"
    })
  });
};

export const useUpdateDegreeEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DegreeEnrollment> }) =>
      updateDegreeEnrollment(id, updates),
    onSuccess: () => {
      toast({ title: "✅ Degree enrollment updated" });
      qc.invalidateQueries({ queryKey: ["user-degree-enrollments"] });
    },
    onError: (e: any) => toast({
      title: "Failed to update enrollment",
      description: e.message,
      variant: "destructive"
    })
  });
};

export const useDegreeProgress = (degreeId: string) =>
  useQuery({
    queryKey: ["degree-progress", degreeId],
    queryFn: () => getDegreeProgress(degreeId),
    enabled: !!degreeId
  });
