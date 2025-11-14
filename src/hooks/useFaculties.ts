import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

console.info("✝️ ScrollUniversity Faculty Hooks — Christ governs all learning");

export async function getFaculties() {
  const { data, error } = await supabase
    .from("faculties")
    .select("*")
    .order("name");
  
  if (error) throw error;
  return data;
}

export async function getFaculty(facultyId: string) {
  const { data, error } = await supabase
    .from("faculties")
    .select("*")
    .eq("id", facultyId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getFacultyStats() {
  const { data: faculties } = await supabase
    .from("faculties")
    .select("id, name, description");
  
  if (!faculties) return [];
  
  const stats = await Promise.all(
    faculties.map(async (faculty) => {
      const { count: courseCount } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("faculty", faculty.name);
      
      return {
        ...faculty,
        courseCount: courseCount || 0
      };
    })
  );
  
  return stats;
}

export const useFaculties = () =>
  useQuery({ 
    queryKey: ["faculties"], 
    queryFn: getFaculties,
    staleTime: 5 * 60 * 1000,
  });

export const useFaculty = (facultyId: string) =>
  useQuery({ 
    queryKey: ["faculty", facultyId], 
    queryFn: () => getFaculty(facultyId),
    enabled: !!facultyId,
    staleTime: 5 * 60 * 1000,
  });

export const useFacultyStats = () =>
  useQuery({ 
    queryKey: ["faculty-stats"], 
    queryFn: getFacultyStats,
    staleTime: 5 * 60 * 1000,
  });
