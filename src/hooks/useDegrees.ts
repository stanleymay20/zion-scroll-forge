import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

console.info("✝️ ScrollUniversity Degree Hooks — Christ governs academic paths");

// Fetchers
export async function getDegreePrograms() {
  const { data, error } = await (supabase as any)
    .from("degree_programs")
    .select("*")
    .order("level", { ascending: true });
  
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
        course:courses (*)
      )
    `)
    .eq("id", degreeId)
    .single();
  
  if (error) throw error;
  return data;
}

// Hooks
export const useDegreePrograms = () =>
  useQuery({ queryKey: ["degrees"], queryFn: getDegreePrograms });

export const useDegreeProgram = (degreeId: string) =>
  useQuery({ 
    queryKey: ["degree", degreeId], 
    queryFn: () => getDegreeProgram(degreeId),
    enabled: !!degreeId 
  });
