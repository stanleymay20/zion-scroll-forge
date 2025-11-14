import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useInstitution } from "@/contexts/InstitutionContext";

console.info("✝️ ScrollUniversity Faculty Hooks — Christ governs all learning");

export async function getFaculties(institutionId?: string) {
  let query = supabase
    .from("faculties")
    .select("*")
    .order("name");
  
  if (institutionId) {
    query = query.eq("institution_id", institutionId);
  }
  
  const { data, error } = await query;
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

export async function getFacultyStats(institutionId?: string) {
  let query = supabase
    .from("faculties")
    .select("id, name, description");
  
  if (institutionId) {
    query = query.eq("institution_id", institutionId);
  }
  
  const { data: faculties } = await query;
  
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

export const useFaculties = () => {
  const { activeInstitution } = useInstitution();
  
  return useQuery({ 
    queryKey: ["faculties", activeInstitution?.id], 
    queryFn: () => getFaculties(activeInstitution?.id),
    staleTime: 5 * 60 * 1000,
    enabled: !!activeInstitution,
  });
};

export const useFaculty = (facultyId: string) =>
  useQuery({ 
    queryKey: ["faculty", facultyId], 
    queryFn: () => getFaculty(facultyId),
    enabled: !!facultyId,
    staleTime: 5 * 60 * 1000,
  });

export const useFacultyStats = () => {
  const { activeInstitution } = useInstitution();
  
  return useQuery({ 
    queryKey: ["faculty-stats", activeInstitution?.id], 
    queryFn: () => getFacultyStats(activeInstitution?.id),
    staleTime: 5 * 60 * 1000,
    enabled: !!activeInstitution,
  });
};
