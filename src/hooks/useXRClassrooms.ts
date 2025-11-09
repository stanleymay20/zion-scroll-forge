import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

console.info("✝️ ScrollUniversity XR Hooks — Christ governs immersive learning");

// Fetchers
export async function getXRClassrooms() {
  const { data, error } = await (supabase as any)
    .from("xr_classrooms")
    .select("*")
    .order("scheduled_time", { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function getXRClassroom(classroomId: string) {
  const { data, error } = await (supabase as any)
    .from("xr_classrooms")
    .select("*")
    .eq("id", classroomId)
    .single();
  
  if (error) throw error;
  return data;
}

// Hooks
export const useXRClassrooms = () =>
  useQuery({ queryKey: ["xr-classrooms"], queryFn: getXRClassrooms });

export const useXRClassroom = (classroomId: string) =>
  useQuery({ 
    queryKey: ["xr-classroom", classroomId], 
    queryFn: () => getXRClassroom(classroomId),
    enabled: !!classroomId 
  });
