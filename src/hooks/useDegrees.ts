import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logError } from "@/lib/errors";

console.info("✝️ ScrollUniversity Degree Hooks — Christ governs academic paths");

// Fetchers
export async function getDegreePrograms() {
  const { data, error } = await (supabase as any)
    .from("degree_programs")
    .select("*")
    .eq("is_active", true)
    .eq("program_status", "active_public")
    .order("faculty", { ascending: true })
    .order("scroll_level", { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function getDegreeProgram(degreeId: string) {
  const { data, error } = await (supabase as any)
    .from("degree_programs")
    .select(`
      *,
      degree_courses (
        order_index,
        is_required,
        course:courses (*)
      )
    `)
    .eq("id", degreeId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserDegreeEnrollments() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  const { data, error } = await (supabase as any)
    .from("degree_enrollments")
    .select(`
      *,
      degree:degree_programs (*)
    `)
    .eq("user_id", user.id);
  
  if (error) throw error;
  return data;
}

export async function enrollInDegree(degreeId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Idempotent: skip insert if enrollment already exists.
  const { data: existing } = await (supabase as any)
    .from("degree_enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("degree_id", degreeId)
    .maybeSingle();

  if (existing) return { ...existing, alreadyEnrolled: true };

  const { data, error } = await (supabase as any)
    .from("degree_enrollments")
    .insert({
      user_id: user.id,
      degree_id: degreeId,
      status: "active"
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Hooks
export const useDegreePrograms = () =>
  useQuery({ queryKey: ["degrees"], queryFn: getDegreePrograms });

// Alias for convenience
export const useDegrees = useDegreePrograms;

export const useDegreeProgram = (degreeId: string) =>
  useQuery({ 
    queryKey: ["degree", degreeId], 
    queryFn: () => getDegreeProgram(degreeId),
    enabled: !!degreeId 
  });

export const useUserDegreeEnrollments = () =>
  useQuery({ queryKey: ["user-degree-enrollments"], queryFn: getUserDegreeEnrollments });

export const useEnrollInDegree = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enrollInDegree,
    onSuccess: (result: any) => {
      qc.invalidateQueries({ queryKey: ["user-degree-enrollments"] });
      toast({
        title: result?.alreadyEnrolled
          ? "You are already enrolled in this program."
          : "✅ Enrolled in degree program",
      });
    },
    onError: (e: unknown) => {
      const parsed = logError(e, { context: "enroll_degree", action: "enrollInDegree" });
      toast({
        title: parsed.severity === "info" ? "Already enrolled" : "Couldn't enroll",
        description: parsed.userMessage,
        variant: parsed.severity === "info" ? "default" : "destructive",
      });
    },
  });
};
