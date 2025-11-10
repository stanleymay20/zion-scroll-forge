import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

console.info("✝️ ScrollUniversity Faculty Hooks — Christ governs all learning");

// Fetchers
export async function getFaculties() {
  const { data, error } = await supabase
    .from("faculties")
    .select(`
      *,
      courses:courses(count),
      ai_tutors:ai_tutors(*)
    `)
    .order("created_at");
  
  if (error) throw error;
  return data;
}

export async function getFaculty(facultyId: string) {
  const { data, error } = await supabase
    .from("faculties")
    .select(`
      *,
      courses:courses(*),
      ai_tutors:ai_tutors(*)
    `)
    .eq("id", facultyId)
    .single();
  
  if (error) throw error;
  return data;
}

// Hooks
export const useFaculties = () =>
  useQuery({ 
    queryKey: ["faculties"], 
    queryFn: getFaculties,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useFaculty = (facultyId: string) =>
  useQuery({ 
    queryKey: ["faculty", facultyId], 
    queryFn: () => getFaculty(facultyId),
    enabled: !!facultyId,
    staleTime: 5 * 60 * 1000,
  });
