import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

console.info("✝️ ScrollUniversity Tutor Hooks — Christ governs all teaching");

// Fetchers
export async function getAITutors() {
  const { data, error } = await (supabase as any)
    .from("ai_tutors")
    .select("*")
    .order("name");
  
  if (error) throw error;
  return data;
}

export async function getAITutor(tutorId: string) {
  const { data, error } = await (supabase as any)
    .from("ai_tutors")
    .select("*")
    .eq("id", tutorId)
    .single();
  
  if (error) throw error;
  return data;
}

// Hooks
export const useAITutors = () =>
  useQuery({ queryKey: ["tutors"], queryFn: getAITutors });

export const useAITutor = (tutorId: string) =>
  useQuery({ 
    queryKey: ["tutor", tutorId], 
    queryFn: () => getAITutor(tutorId),
    enabled: !!tutorId 
  });
