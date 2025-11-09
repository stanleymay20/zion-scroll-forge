import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

console.info("✝️ ScrollUniversity Assessment Hooks — Christ governs evaluation");

// Fetchers
export async function getMyAssessments() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  const { data, error } = await (supabase as any)
    .from("student_assessments")
    .select(`
      *,
      course:courses (title, faculty)
    `)
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data;
}

// Hooks
export const useMyAssessments = () =>
  useQuery({ queryKey: ["my-assessments"], queryFn: getMyAssessments });
