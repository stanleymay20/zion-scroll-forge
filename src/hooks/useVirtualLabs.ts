import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

console.info("✝️ ScrollUniversity Lab Hooks — Christ governs experimentation");

// Fetchers
export async function getVirtualLabs() {
  const { data, error } = await (supabase as any)
    .from("virtual_labs")
    .select("*")
    .order("title");
  
  if (error) throw error;
  return data;
}

export async function getVirtualLab(labId: string) {
  const { data, error } = await (supabase as any)
    .from("virtual_labs")
    .select("*")
    .eq("id", labId)
    .single();
  
  if (error) throw error;
  return data;
}

// Hooks
export const useVirtualLabs = () =>
  useQuery({ queryKey: ["virtual-labs"], queryFn: getVirtualLabs });

export const useVirtualLab = (labId: string) =>
  useQuery({ 
    queryKey: ["virtual-lab", labId], 
    queryFn: () => getVirtualLab(labId),
    enabled: !!labId 
  });
