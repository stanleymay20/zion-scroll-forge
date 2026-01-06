import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useContext } from "react";
import React from "react";

console.info("✝️ ScrollUniversity Faculty Hooks — Christ governs all learning");

// Import the context directly for optional access
const InstitutionContext = React.createContext<{
  activeInstitution: { id: string } | null;
} | undefined>(undefined);

// Helper to safely get institution from context
function useOptionalInstitution() {
  try {
    // Dynamic import to avoid circular dependencies
    const { useInstitution } = require("@/contexts/InstitutionContext");
    return useInstitution();
  } catch {
    return { activeInstitution: null };
  }
}

export async function getFaculties(institutionId?: string) {
  let query: any = supabase
    .from("faculties" as any)
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
  let query: any = supabase
    .from("faculties" as any)
    .select("id, name, description");
  
  if (institutionId) {
    query = query.eq("institution_id", institutionId);
  }
  
  const { data: faculties }: any = await query;
  
  if (!faculties) return [];
  
  const stats = await Promise.all(
    faculties.map(async (faculty: any) => {
      const { count: courseCount } = await supabase
        .from("courses" as any)
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

// Hook that works with or without institution context
export const useFaculties = (requireInstitution = false) => {
  const { activeInstitution } = useOptionalInstitution();
  const institutionId = activeInstitution?.id;
  
  return useQuery({ 
    queryKey: ["faculties", institutionId], 
    queryFn: () => getFaculties(institutionId),
    staleTime: 5 * 60 * 1000,
    // Only require institution if explicitly requested
    enabled: requireInstitution ? !!institutionId : true,
  });
};

export const useFaculty = (facultyId: string) =>
  useQuery({ 
    queryKey: ["faculty", facultyId], 
    queryFn: () => getFaculty(facultyId),
    enabled: !!facultyId,
    staleTime: 5 * 60 * 1000,
  });

export const useFacultyStats = (requireInstitution = false) => {
  const { activeInstitution } = useOptionalInstitution();
  const institutionId = activeInstitution?.id;
  
  return useQuery({ 
    queryKey: ["faculty-stats", institutionId], 
    queryFn: () => getFacultyStats(institutionId),
    staleTime: 5 * 60 * 1000,
    // Only require institution if explicitly requested
    enabled: requireInstitution ? !!institutionId : true,
  });
};
